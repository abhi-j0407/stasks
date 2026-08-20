"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import { isPromoteDue, logicalDate } from "@/lib/logical-clock";
import { recordTodayOccupancy } from "@/lib/occupancy";
import {
  nextSortOrder,
  parseCreateTaskInput,
  SAVE_AGAIN,
} from "@/lib/tasks/create-task-input";
import { resolveCreatePlacement } from "@/lib/tasks/planned-date";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type CreateTaskResult =
  | { ok: true }
  | { ok: false; message: string };

export async function createTask(
  formData: FormData,
): Promise<CreateTaskResult> {
  const userId = await requireUserId();

  const parsed = parseCreateTaskInput({
    title: formData.get("title"),
    notes: formData.get("notes"),
    location: formData.get("location"),
    category: formData.get("category"),
    plannedDate: formData.get("plannedDate"),
  });

  if (!parsed.ok) {
    return parsed;
  }

  const { title, notes, location, category, plannedDate } = parsed.value;
  const now = new Date();
  const t = logicalDate(now);
  const placement = resolveCreatePlacement({
    requestedLocation: location,
    plannedDate,
    t,
    promoteDue: isPromoteDue(now),
  });

  try {
    const [row] = await withNeonRetry(() =>
      db
        .select({ maxSort: max(tasks.sortOrder) })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.location, placement.location),
            eq(tasks.category, category),
          ),
        ),
    );

    const [created] = await withNeonRetry(() =>
      db
        .insert(tasks)
        .values({
          userId,
          title,
          notes,
          location: placement.location,
          category,
          sortOrder: nextSortOrder(row?.maxSort ?? null),
          overdue: false,
          plannedDate: placement.plannedDate,
          completedAt: null,
        })
        .returning({ id: tasks.id }),
    );

    if (!created) {
      return { ok: false, message: SAVE_AGAIN };
    }

    if (placement.recordOccupancy) {
      await recordTodayOccupancy({
        userId,
        taskId: created.id,
        logicalDate: t,
      });
    }
  } catch {
    return { ok: false, message: SAVE_AGAIN };
  }

  revalidatePath(LIST_PATH[location]);
  if (placement.location !== location) {
    revalidatePath(LIST_PATH[placement.location]);
  }
  return { ok: true };
}
