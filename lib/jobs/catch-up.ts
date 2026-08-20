import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { jobRuns } from "@/lib/db/schema";
import {
  missingRolloverDates,
  shouldRunPromote,
} from "@/lib/jobs/catch-up-plan";
import { runPromote } from "@/lib/jobs/promote";
import { ROLLOVER_JOB, runRollover } from "@/lib/jobs/rollover";
import { logicalDate } from "@/lib/logical-clock";

export {
  missingRolloverDates,
  shouldRunPromote,
} from "@/lib/jobs/catch-up-plan";

export async function catchUp(now: Date = new Date()) {
  const t = logicalDate(now);

  const [latestRow] = await withNeonRetry(() =>
    db
      .select({ logicalDate: jobRuns.logicalDate })
      .from(jobRuns)
      .where(eq(jobRuns.jobName, ROLLOVER_JOB))
      .orderBy(desc(jobRuns.logicalDate))
      .limit(1),
  );

  if (!latestRow) {
    await withNeonRetry(() =>
      db
        .insert(jobRuns)
        .values({
          jobName: ROLLOVER_JOB,
          logicalDate: t,
          ranAt: now,
        })
        .onConflictDoNothing(),
    );
  } else {
    for (const next of missingRolloverDates(latestRow.logicalDate, t)) {
      await runRollover(next);
    }
  }

  if (shouldRunPromote(now)) {
    await runPromote(t);
  }

  return { logicalDate: t };
}
