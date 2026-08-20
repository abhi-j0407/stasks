import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { jobRuns, tasks, users } from "@/lib/db/schema";
import { planPromote } from "@/lib/jobs/promote-plan";

export { planPromote, shouldPromote } from "@/lib/jobs/promote-plan";
export type {
  PromotePatch,
  PromoteTask,
} from "@/lib/jobs/promote-plan";

export const PROMOTE_JOB = "promote-16" as const;

export async function runPromote(logicalDate: string): Promise<void> {
  const claimed = await withNeonRetry(() =>
    db
      .insert(jobRuns)
      .values({
        jobName: PROMOTE_JOB,
        logicalDate,
        ranAt: new Date(),
      })
      .onConflictDoNothing()
      .returning({ logicalDate: jobRuns.logicalDate }),
  );

  if (claimed.length === 0) {
    return;
  }

  try {
    const userRows = await withNeonRetry(() =>
      db.select({ id: users.id }).from(users),
    );

    for (const user of userRows) {
      await applyPromoteForUser(user.id, logicalDate);
    }
  } catch (error) {
    try {
      await withNeonRetry(() =>
        db
          .delete(jobRuns)
          .where(
            and(
              eq(jobRuns.jobName, PROMOTE_JOB),
              eq(jobRuns.logicalDate, logicalDate),
            ),
          ),
      );
    } catch {
      // Claim may linger; a later retry stays blocked until that row is gone.
    }
    throw error;
  }
}

async function applyPromoteForUser(
  userId: string,
  t: string,
): Promise<void> {
  const incomplete = await withNeonRetry(() =>
    db
      .select({
        id: tasks.id,
        category: tasks.category,
        location: tasks.location,
        sortOrder: tasks.sortOrder,
        overdue: tasks.overdue,
        plannedDate: tasks.plannedDate,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.completedAt))),
  );

  const patches = planPromote(incomplete, t);
  const now = new Date();

  for (const patch of patches) {
    await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          location: patch.location,
          sortOrder: patch.sortOrder,
          updatedAt: now,
        })
        .where(
          and(
            eq(tasks.id, patch.id),
            eq(tasks.userId, userId),
            eq(tasks.location, "registry"),
            isNull(tasks.completedAt),
          ),
        ),
    );
  }
}
