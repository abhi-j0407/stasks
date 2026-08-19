"use server";

import { and, eq, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import {
  nextSortOrder,
  parseCreateTaskInput,
  SAVE_AGAIN,
} from "@/lib/tasks/create-task-input";
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
  });

  if (!parsed.ok) {
    return parsed;
  }

  const { title, notes, location, category } = parsed.value;

  try {
    const [row] = await withNeonRetry(() =>
      db
        .select({ maxSort: max(tasks.sortOrder) })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.location, location),
            eq(tasks.category, category),
          ),
        ),
    );

    await withNeonRetry(() =>
      db.insert(tasks).values({
        userId,
        title,
        notes,
        location,
        category,
        sortOrder: nextSortOrder(row?.maxSort ?? null),
        overdue: false,
        plannedDate: null,
        completedAt: null,
      }),
    );
  } catch {
    return { ok: false, message: SAVE_AGAIN };
  }

  revalidatePath(LIST_PATH[location]);
  return { ok: true };
}
