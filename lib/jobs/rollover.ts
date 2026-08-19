import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { jobRuns, tasks, users } from "@/lib/db/schema";
import { recordTodayOccupancy } from "@/lib/occupancy";
import { planRollover } from "@/lib/jobs/rollover-plan";

export { planRollover, shouldSweepToToday } from "@/lib/jobs/rollover-plan";
export type {
  RolloverPatch,
  RolloverPlan,
  RolloverTask,
} from "@/lib/jobs/rollover-plan";

export const ROLLOVER_JOB = "rollover-04" as const;

export async function runRollover(logicalDate: string): Promise<void> {
  const claimed = await withNeonRetry(() =>
    db
      .insert(jobRuns)
      .values({
        jobName: ROLLOVER_JOB,
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
      await applyRolloverForUser(user.id, logicalDate);
    }
  } catch (error) {
    try {
      await withNeonRetry(() =>
        db
          .delete(jobRuns)
          .where(
            and(
              eq(jobRuns.jobName, ROLLOVER_JOB),
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

async function applyRolloverForUser(
  userId: string,
  newT: string,
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

  const { patches, occupancyTaskIds } = planRollover(incomplete, newT);
  const now = new Date();

  for (const patch of patches) {
    await withNeonRetry(() =>
      db
        .update(tasks)
        .set({
          location: patch.location,
          sortOrder: patch.sortOrder,
          overdue: patch.overdue,
          updatedAt: now,
        })
        .where(
          and(
            eq(tasks.id, patch.id),
            eq(tasks.userId, userId),
            isNull(tasks.completedAt),
          ),
        ),
    );
  }

  for (const taskId of occupancyTaskIds) {
    await recordTodayOccupancy({
      userId,
      taskId,
      logicalDate: newT,
    });
  }
}
