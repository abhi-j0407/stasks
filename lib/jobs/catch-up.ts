import { logicalDate } from "../logical-clock";

/**
 * Phase 3 scaffolding only.
 * Phases 9–10 will read `job_runs`, walk missing dates in order, and call
 * `runRollover` / `runPromote`. Do not insert `job_runs` here: that would
 * make later catch-up skip real list mutations. Do not loop from epoch.
 */
export async function catchUp(now: Date = new Date()) {
  return { logicalDate: logicalDate(now) };
}
