import { addLogicalDays } from "./logical-clock";
import type { TaskCategory } from "./tasks/split-by-category";

export const DAYS_7 = 7;
export const DAYS_30 = 30;
export const HEATMAP_LOOKBACK_DAYS = 364;

export type CompletionEventRow = {
  logicalDate: string;
  taskId: string;
  category: TaskCategory | null;
};

export type OccupancyRow = {
  logicalDate: string;
  taskId: string;
};

export type DayCount = {
  date: string;
  count: number;
};

export type CategorySplit = {
  personal: number;
  work: number;
};

export type DayRate = {
  date: string;
  completed: number;
  sat: number;
  rate: number | null;
};

export type RateWindow = {
  days: DayRate[];
  completedOnToday: number;
  satOnToday: number;
};

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type HeatmapCell = {
  date: string;
  count: number;
  level: HeatmapLevel;
  inRange: boolean;
};

export type HeatmapWeek = {
  monday: string;
  cells: HeatmapCell[];
};

export type HeatmapGrid = {
  start: string;
  gridStart: string;
  weeks: HeatmapWeek[];
  total: number;
};

export function windowStart(todayIso: string, days: number): string {
  return addLogicalDays(todayIso, -(days - 1));
}

export function eachLogicalDay(start: string, end: string): string[] {
  const days: string[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addLogicalDays(cursor, 1);
  }
  return days;
}

/** Monday = 0 … Sunday = 6, using the IST civil date as UTC (same as addLogicalDays). */
export function weekdayMondayIndex(iso: string): number {
  const [year, month, day] = iso.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  return (utc.getUTCDay() + 6) % 7;
}

export function mondayOnOrBefore(iso: string): string {
  return addLogicalDays(iso, -weekdayMondayIndex(iso));
}

export function heatmapRange(todayIso: string): { start: string; gridStart: string } {
  const start = addLogicalDays(todayIso, -HEATMAP_LOOKBACK_DAYS);
  return { start, gridStart: mondayOnOrBefore(start) };
}

export function countByDay(
  events: readonly { logicalDate: string }[],
  start: string,
  end: string,
): DayCount[] {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.logicalDate < start || event.logicalDate > end) {
      continue;
    }
    counts.set(event.logicalDate, (counts.get(event.logicalDate) ?? 0) + 1);
  }

  return eachLogicalDay(start, end).map((date) => ({
    date,
    count: counts.get(date) ?? 0,
  }));
}

export function splitCompletions(
  events: readonly CompletionEventRow[],
  start: string,
  end: string,
): CategorySplit {
  let personal = 0;
  let work = 0;
  for (const event of events) {
    if (event.logicalDate < start || event.logicalDate > end) {
      continue;
    }
    if (event.category === "personal") {
      personal += 1;
    } else if (event.category === "work") {
      work += 1;
    }
  }
  return { personal, work };
}

export function completedTaskIdsByDay(
  events: readonly { logicalDate: string; taskId: string }[],
): Map<string, Set<string>> {
  const byDay = new Map<string, Set<string>>();
  for (const event of events) {
    let ids = byDay.get(event.logicalDate);
    if (!ids) {
      ids = new Set();
      byDay.set(event.logicalDate, ids);
    }
    ids.add(event.taskId);
  }
  return byDay;
}

export function rateByDay(
  occupancy: readonly OccupancyRow[],
  completedByDay: Map<string, Set<string>>,
  start: string,
  end: string,
): RateWindow {
  const satByDay = new Map<string, Set<string>>();
  for (const row of occupancy) {
    if (row.logicalDate < start || row.logicalDate > end) {
      continue;
    }
    let ids = satByDay.get(row.logicalDate);
    if (!ids) {
      ids = new Set();
      satByDay.set(row.logicalDate, ids);
    }
    ids.add(row.taskId);
  }

  const days: DayRate[] = [];
  let completedOnToday = 0;
  let satOnToday = 0;

  for (const date of eachLogicalDay(start, end)) {
    const satSet = satByDay.get(date);
    const sat = satSet?.size ?? 0;
    if (!satSet || sat === 0) {
      days.push({ date, completed: 0, sat: 0, rate: null });
      continue;
    }

    const completedSet = completedByDay.get(date);
    let completed = 0;
    for (const taskId of satSet) {
      if (completedSet?.has(taskId)) {
        completed += 1;
      }
    }

    completedOnToday += completed;
    satOnToday += sat;
    days.push({ date, completed, sat, rate: completed / sat });
  }

  return { days, completedOnToday, satOnToday };
}

export function heatmapLevel(count: number): HeatmapLevel {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count === 2) {
    return 2;
  }
  if (count === 3) {
    return 3;
  }
  if (count === 4) {
    return 4;
  }
  return 5;
}

export function heatmapGrid(
  todayIso: string,
  countsByDay: Map<string, number>,
): HeatmapGrid {
  const { start, gridStart } = heatmapRange(todayIso);
  const lastMonday = mondayOnOrBefore(todayIso);
  const weeks: HeatmapWeek[] = [];
  let total = 0;
  let monday = gridStart;

  while (monday <= lastMonday) {
    const cells: HeatmapCell[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const date = addLogicalDays(monday, offset);
      const inRange = date >= start && date <= todayIso;
      const count = inRange ? (countsByDay.get(date) ?? 0) : 0;
      if (inRange) {
        total += count;
      }
      cells.push({
        date,
        count,
        level: inRange ? heatmapLevel(count) : 0,
        inRange,
      });
    }
    weeks.push({ monday, cells });
    monday = addLogicalDays(monday, 7);
  }

  return { start, gridStart, weeks, total };
}
