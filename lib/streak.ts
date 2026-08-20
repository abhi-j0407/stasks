import { addLogicalDays } from "./logical-clock";

export const STREAK_MILESTONES = [7, 30, 100] as const;
export const STREAK_TOAST = "Keep going";

export type Streak = {
  current: number;
  best: number;
};

export type CelebrationKind = "none" | "tick" | "milestone";

function uniqueSortedDates(dates: string[]): string[] {
  return [...new Set(dates)].sort();
}

function runEndingAt(days: Set<string>, end: string): number {
  let count = 0;
  let cursor = end;
  while (days.has(cursor)) {
    count += 1;
    cursor = addLogicalDays(cursor, -1);
  }
  return count;
}

function maxConsecutive(sorted: string[]): number {
  if (sorted.length === 0) {
    return 0;
  }

  let best = 1;
  let run = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index] === addLogicalDays(sorted[index - 1], 1)) {
      run += 1;
      if (run > best) {
        best = run;
      }
    } else {
      run = 1;
    }
  }
  return best;
}

export function computeStreak(dates: string[], todayIso: string): Streak {
  const sorted = uniqueSortedDates(dates);
  const days = new Set(sorted);
  const yesterdayIso = addLogicalDays(todayIso, -1);
  const end = days.has(todayIso)
    ? todayIso
    : days.has(yesterdayIso)
      ? yesterdayIso
      : null;

  return {
    current: end === null ? 0 : runEndingAt(days, end),
    best: maxConsecutive(sorted),
  };
}

export function celebrationKind(
  firstOfDay: boolean,
  current: number,
): CelebrationKind {
  if (!firstOfDay) {
    return "none";
  }
  if ((STREAK_MILESTONES as readonly number[]).includes(current)) {
    return "milestone";
  }
  return "tick";
}
