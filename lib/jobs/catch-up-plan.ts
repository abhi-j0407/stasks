import { addLogicalDays } from "../logical-clock";

export function missingRolloverDates(
  latest: string | null,
  t: string,
): string[] {
  if (latest == null || latest >= t) {
    return [];
  }

  const dates: string[] = [];
  let cursor = addLogicalDays(latest, 1);
  while (cursor <= t) {
    dates.push(cursor);
    cursor = addLogicalDays(cursor, 1);
  }
  return dates;
}
