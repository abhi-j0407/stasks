"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { tasks } from "@/lib/db/schema";
import {
  CLEAR_AGAIN,
  parseClearOverdueInput,
} from "@/lib/tasks/clear-overdue";
import { requireUserId } from "@/lib/tasks/queries";

const LIST_PATH = {
  today: "/today",
  tomorrow: "/tomorrow",
  registry: "/registry",
} as const;

export type ClearOverdueResult =
  | { ok: true }
  | { ok: false; message: string };

export async function clearOverdue(raw: {
  taskId?: unknown;
}): Promise<ClearOverdueResult> {
  const userId = await requireUserId();
  const parsed = parseClearOverdueInput(raw);

  if (!parsed.ok) {
    return parsed;
  }

  const { taskId } = parsed.value;
  const now = new Date();

  try {
    const [updated] = await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          overdue: false,
          updatedAt: now,
        })
        .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
        .returning({
          id: tasks.id,
          location: tasks.location,
        }),
    );

    if (!updated) {
      return { ok: false, message: CLEAR_AGAIN };
    }

    revalidatePath(LIST_PATH[updated.location]);
    revalidatePath("/stats");
    return { ok: true };
  } catch {
    return { ok: false, message: CLEAR_AGAIN };
  }
}
