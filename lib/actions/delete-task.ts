"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { completionEvents, tasks } from "@/lib/db/schema";
import { logicalDate } from "@/lib/logical-clock";
import {
  DELETE_AGAIN,
  parseDeleteInput,
  parseRestoreSnapshot,
  shouldDeleteCompletionEvent,
  type DeletedTaskSnapshot,
} from "@/lib/tasks/delete-task";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type DeleteTaskResult =
  | { ok: true; snapshot: DeletedTaskSnapshot }
  | { ok: false; message: string };

export type RestoreDeletedTaskResult =
  | { ok: true }
  | { ok: false; message: string };

function revalidateLists(location: keyof typeof LIST_PATH) {
  revalidatePath(LIST_PATH[location]);
  if (location !== "today") {
    revalidatePath("/today");
  }
  revalidatePath("/stats");
}

function toSnapshot(
  row: {
    id: string;
    title: string;
    notes: string | null;
    category: DeletedTaskSnapshot["category"];
    location: DeletedTaskSnapshot["location"];
    sortOrder: number;
    overdue: boolean;
    plannedDate: string | null;
    completedAt: Date | null;
    overdueAtComplete: boolean | null;
    createdAt: Date;
  },
  restoreEvent: boolean,
): DeletedTaskSnapshot {
  const completedAt = row.completedAt?.toISOString() ?? null;
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    category: row.category,
    location: row.location,
    sortOrder: row.sortOrder,
    overdue: row.overdue,
    plannedDate: row.plannedDate,
    completedAt,
    overdueAtComplete: row.overdueAtComplete,
    createdAt: row.createdAt.toISOString(),
    restoreEvent,
    eventCompletedAt: restoreEvent ? completedAt : null,
    eventLogicalDate:
      restoreEvent && row.completedAt ? logicalDate(row.completedAt) : null,
  };
}

export async function deleteTask(raw: {
  taskId?: unknown;
}): Promise<DeleteTaskResult> {
  const userId = await requireUserId();
  const parsed = parseDeleteInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId } = parsed.value;
  const now = new Date();

  try {
    const [row] = await withNeonRetry(() =>
      db
        .select({
          id: tasks.id,
          title: tasks.title,
          notes: tasks.notes,
          category: tasks.category,
          location: tasks.location,
          sortOrder: tasks.sortOrder,
          overdue: tasks.overdue,
          plannedDate: tasks.plannedDate,
          completedAt: tasks.completedAt,
          overdueAtComplete: tasks.overdueAtComplete,
          createdAt: tasks.createdAt,
        })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))),
    );

    if (!row) {
      return { ok: false, message: DELETE_AGAIN };
    }

    const restoreEvent = shouldDeleteCompletionEvent(row.completedAt, now);
    const snapshot = toSnapshot(row, restoreEvent);

    if (restoreEvent && row.completedAt) {
      const eventDay = logicalDate(row.completedAt);
      await withNeonRetry(() =>
        db
          .delete(completionEvents)
          .where(
            and(
              eq(completionEvents.userId, userId),
              eq(completionEvents.taskId, row.id),
              eq(completionEvents.logicalDate, eventDay),
            ),
          ),
      );
    }

    const [removed] = await withNeonRetry(() =>
      db
        .delete(tasks)
        .where(and(eq(tasks.id, row.id), eq(tasks.userId, userId)))
        .returning({ id: tasks.id }),
    );

    if (!removed) {
      return { ok: false, message: DELETE_AGAIN };
    }

    revalidateLists(row.location);
    return { ok: true, snapshot };
  } catch {
    return { ok: false, message: DELETE_AGAIN };
  }
}

export async function restoreDeletedTask(raw: {
  snapshot?: unknown;
}): Promise<RestoreDeletedTaskResult> {
  const userId = await requireUserId();
  const parsed = parseRestoreSnapshot(raw.snapshot);

  if (!parsed.ok) {
    return parsed;
  }

  const snapshot = parsed.value;
  const now = new Date();

  try {
    const [created] = await withNeonRetry(() =>
      db
        .insert(tasks)
        .values({
          id: snapshot.id,
          userId,
          title: snapshot.title,
          notes: snapshot.notes,
          category: snapshot.category,
          location: snapshot.location,
          sortOrder: snapshot.sortOrder,
          overdue: snapshot.overdue,
          plannedDate: snapshot.plannedDate,
          completedAt: snapshot.completedAt
            ? new Date(snapshot.completedAt)
            : null,
          overdueAtComplete: snapshot.overdueAtComplete,
          createdAt: new Date(snapshot.createdAt),
          updatedAt: now,
        })
        .returning({ id: tasks.id }),
    );

    if (!created) {
      return { ok: false, message: DELETE_AGAIN };
    }

    const eventCompletedAt = snapshot.eventCompletedAt;
    const eventLogicalDate = snapshot.eventLogicalDate;

    if (snapshot.restoreEvent && eventCompletedAt && eventLogicalDate) {
      try {
        await withNeonRetry(() =>
          db.insert(completionEvents).values({
            userId,
            taskId: created.id,
            completedAt: new Date(eventCompletedAt),
            logicalDate: eventLogicalDate,
          }),
        );
      } catch {
        await withNeonRetry(() =>
          db
            .delete(tasks)
            .where(and(eq(tasks.id, created.id), eq(tasks.userId, userId))),
        );
        return { ok: false, message: DELETE_AGAIN };
      }
    }
  } catch {
    return { ok: false, message: DELETE_AGAIN };
  }

  revalidateLists(snapshot.location);
  return { ok: true };
}
