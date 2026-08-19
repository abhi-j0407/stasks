"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { completionEvents, tasks } from "@/lib/db/schema";
import { logicalDate } from "@/lib/logical-clock";
import {
  canUndoCompletion,
  COMPLETE_AGAIN,
  parseCompleteInput,
  parseUndoInput,
  UNDO_AGAIN,
  UNDO_CLOSED,
} from "@/lib/tasks/complete-task";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type CompleteTaskResult =
  | { ok: true }
  | { ok: false; message: string };

function revalidateLists(location: keyof typeof LIST_PATH) {
  revalidatePath(LIST_PATH[location]);
  if (location !== "today") {
    revalidatePath("/today");
  }
}

export async function completeTask(raw: {
  taskId?: unknown;
}): Promise<CompleteTaskResult> {
  const userId = await requireUserId();
  const parsed = parseCompleteInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId } = parsed.value;
  const now = new Date();
  const day = logicalDate(now);

  try {
    const [task] = await withNeonRetry(() =>
      db
        .select({
          id: tasks.id,
          location: tasks.location,
          overdue: tasks.overdue,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, userId),
            isNull(tasks.completedAt),
          ),
        ),
    );

    if (!task) {
      return { ok: false, message: COMPLETE_AGAIN };
    }

    const [updated] = await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          completedAt: now,
          overdueAtComplete: task.overdue,
          updatedAt: now,
        })
        .where(
          and(
            eq(tasks.id, task.id),
            eq(tasks.userId, userId),
            isNull(tasks.completedAt),
          ),
        )
        .returning({
          id: tasks.id,
          location: tasks.location,
        }),
    );

    if (!updated) {
      return { ok: false, message: COMPLETE_AGAIN };
    }

    try {
      await withNeonRetry(() =>
        db.insert(completionEvents).values({
          userId,
          taskId: updated.id,
          completedAt: now,
          logicalDate: day,
        }),
      );
    } catch {
      await withNeonRetry(() =>
        db
          .update(tasks)
          .set({
            completedAt: null,
            overdueAtComplete: null,
            updatedAt: now,
          })
          .where(and(eq(tasks.id, updated.id), eq(tasks.userId, userId))),
      );
      return { ok: false, message: COMPLETE_AGAIN };
    }

    revalidateLists(updated.location);
    return { ok: true };
  } catch {
    return { ok: false, message: COMPLETE_AGAIN };
  }
}

export async function undoComplete(raw: {
  taskId?: unknown;
}): Promise<CompleteTaskResult> {
  const userId = await requireUserId();
  const parsed = parseUndoInput(raw);

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
          location: tasks.location,
          completedAt: tasks.completedAt,
          overdueAtComplete: tasks.overdueAtComplete,
        })
        .from(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId))),
    );

    if (!row?.completedAt) {
      return { ok: false, message: UNDO_AGAIN };
    }

    if (!canUndoCompletion(row.completedAt, now)) {
      return { ok: false, message: UNDO_CLOSED };
    }

    const day = logicalDate(row.completedAt);

    const [updated] = await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          completedAt: null,
          overdueAtComplete: null,
          overdue: row.overdueAtComplete ?? false,
          updatedAt: now,
        })
        .where(
          and(
            eq(tasks.id, row.id),
            eq(tasks.userId, userId),
          ),
        )
        .returning({ id: tasks.id }),
    );

    if (!updated) {
      return { ok: false, message: UNDO_AGAIN };
    }

    await withNeonRetry(() =>
      db
        .delete(completionEvents)
        .where(
          and(
            eq(completionEvents.userId, userId),
            eq(completionEvents.taskId, row.id),
            eq(completionEvents.logicalDate, day),
          ),
        ),
    );

    revalidateLists(row.location);
    return { ok: true };
  } catch {
    return { ok: false, message: UNDO_AGAIN };
  }
}
