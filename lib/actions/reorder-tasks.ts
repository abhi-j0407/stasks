"use server";

import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import {
  parseReorderInput,
  planReorder,
  REORDER_AGAIN,
  type ReorderPatch,
} from "@/lib/tasks/reorder-tasks";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type ReorderTasksResult =
  | { ok: true }
  | { ok: false; message: string };

function applyPatchesSql(
  userId: string,
  location: "today" | "tomorrow" | "registry",
  patches: ReorderPatch[],
) {
  const rows = sql.join(
    patches.map(
      (patch) =>
        sql`(${patch.id}::uuid, ${patch.category}::task_category, ${patch.sortOrder}::integer)`,
    ),
    sql`, `,
  );

  return db.execute(sql`
    UPDATE tasks AS t
    SET
      category = v.category,
      sort_order = v.sort_order,
      updated_at = now()
    FROM (VALUES ${rows}) AS v(id, category, sort_order)
    WHERE t.id = v.id
      AND t.user_id = ${userId}::uuid
      AND t.location = ${location}::task_location
      AND t.completed_at IS NULL
  `);
}

export async function reorderTasks(raw: {
  taskId?: unknown;
  location?: unknown;
  toCategory?: unknown;
  toIndex?: unknown;
}): Promise<ReorderTasksResult> {
  const userId = await requireUserId();
  const parsed = parseReorderInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId, location, toCategory, toIndex } = parsed.value;

  try {
    const items = await withNeonRetry(() =>
      db
        .select({
          id: tasks.id,
          category: tasks.category,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            eq(tasks.location, location),
            isNull(tasks.completedAt),
          ),
        )
        .orderBy(asc(tasks.category), asc(tasks.sortOrder)),
    );

    const patches = planReorder(items, { taskId, toCategory, toIndex });
    if (!patches) {
      return { ok: false, message: REORDER_AGAIN };
    }

    await withNeonRetry(() => applyPatchesSql(userId, location, patches));
  } catch {
    return { ok: false, message: REORDER_AGAIN };
  }

  revalidatePath(LIST_PATH[location]);
  return { ok: true };
}
