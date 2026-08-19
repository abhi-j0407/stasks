"use server";

import { and, eq, isNull, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import { logicalDate } from "@/lib/logical-clock";
import { recordTodayOccupancy } from "@/lib/occupancy";
import {
  nextSortOrder,
  shouldRecordTodayOccupancy,
} from "@/lib/tasks/create-task-input";
import { MOVE_AGAIN, parseMoveInput } from "@/lib/tasks/move-task";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type MoveTaskResult =
  | { ok: true }
  | { ok: false; message: string };

export async function moveTask(raw: {
  taskId?: unknown;
  fromLocation?: unknown;
  toLocation?: unknown;
}): Promise<MoveTaskResult> {
  const userId = await requireUserId();
  const parsed = parseMoveInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId, fromLocation, toLocation } = parsed.value;

  try {
    const [task] = await withNeonRetry(() =>
      db
        .select({
          id: tasks.id,
          category: tasks.category,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, userId),
            eq(tasks.location, fromLocation),
            isNull(tasks.completedAt),
          ),
        ),
    );

    if (!task) {
      return { ok: false, message: MOVE_AGAIN };
    }

    const [row] = await withNeonRetry(() =>
      db
        .select({ maxSort: max(tasks.sortOrder) })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.location, toLocation),
            eq(tasks.category, task.category),
          ),
        ),
    );

    const [updated] = await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          location: toLocation,
          sortOrder: nextSortOrder(row?.maxSort ?? null),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tasks.id, task.id),
            eq(tasks.userId, userId),
            eq(tasks.location, fromLocation),
            isNull(tasks.completedAt),
          ),
        )
        .returning({ id: tasks.id }),
    );

    if (!updated) {
      return { ok: false, message: MOVE_AGAIN };
    }

    if (shouldRecordTodayOccupancy(toLocation)) {
      await recordTodayOccupancy({
        userId,
        taskId: updated.id,
        logicalDate: logicalDate(),
      });
    }
  } catch {
    return { ok: false, message: MOVE_AGAIN };
  }

  revalidatePath(LIST_PATH[fromLocation]);
  revalidatePath(LIST_PATH[toLocation]);
  return { ok: true };
}
