"use server";

import { and, eq, isNull, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import { isPromoteDue, logicalDate } from "@/lib/logical-clock";
import { recordTodayOccupancy } from "@/lib/occupancy";
import {
  nextSortOrder,
  type TaskLocation,
} from "@/lib/tasks/create-task-input";
import {
  DATE_AGAIN,
  destinationFromPlannedDate,
  parseUpdatePlannedDateInput,
} from "@/lib/tasks/planned-date";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type UpdatePlannedDateResult =
  | { ok: true; location: TaskLocation }
  | { ok: false; message: string };

export async function updatePlannedDate(raw: {
  taskId?: unknown;
  plannedDate?: unknown;
}): Promise<UpdatePlannedDateResult> {
  const userId = await requireUserId();
  const parsed = parseUpdatePlannedDateInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId, plannedDate } = parsed.value;
  const now = new Date();
  const t = logicalDate(now);
  const dest = destinationFromPlannedDate({
    plannedDate,
    t,
    promoteDue: isPromoteDue(now),
  });

  try {
    const [task] = await withNeonRetry(() =>
      db
        .select({
          id: tasks.id,
          category: tasks.category,
          location: tasks.location,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.id, taskId),
            eq(tasks.userId, userId),
            eq(tasks.location, "registry"),
            isNull(tasks.completedAt),
          ),
        ),
    );

    if (!task) {
      return { ok: false, message: DATE_AGAIN };
    }

    let sortOrder: number | undefined;
    if (dest.location !== "registry") {
      const [row] = await withNeonRetry(() =>
        db
          .select({ maxSort: max(tasks.sortOrder) })
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, userId),
              eq(tasks.location, dest.location),
              eq(tasks.category, task.category),
            ),
          ),
      );
      sortOrder = nextSortOrder(row?.maxSort ?? null);
    }

    const [updated] = await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          plannedDate,
          ...(dest.location === "registry"
            ? {}
            : { location: dest.location, sortOrder }),
          updatedAt: now,
        })
        .where(
          and(
            eq(tasks.id, task.id),
            eq(tasks.userId, userId),
            eq(tasks.location, "registry"),
            isNull(tasks.completedAt),
          ),
        )
        .returning({ id: tasks.id }),
    );

    if (!updated) {
      return { ok: false, message: DATE_AGAIN };
    }

    if (dest.recordOccupancy) {
      await recordTodayOccupancy({
        userId,
        taskId: updated.id,
        logicalDate: t,
      });
    }

    revalidatePath(LIST_PATH.registry);
    if (dest.location !== "registry") {
      revalidatePath(LIST_PATH[dest.location]);
    }

    return { ok: true, location: dest.location };
  } catch {
    return { ok: false, message: DATE_AGAIN };
  }
}
