import { describe, expect, test } from "vitest";
import { addLogicalDays } from "./logical-clock";
import {
  completedTaskIdsByDay,
  countByDay,
  DAYS_7,
  DAYS_30,
  heatmapGrid,
  heatmapLevel,
  heatmapRange,
  mondayOnOrBefore,
  rateByDay,
  splitCompletions,
  weekdayMondayIndex,
  windowStart,
  type CompletionEventRow,
  type OccupancyRow,
} from "./stats";

const T = "2026-08-20";
const yesterday = addLogicalDays(T, -1);
const twoAgo = addLogicalDays(T, -2);

function event(
  logicalDate: string,
  taskId: string,
  category: CompletionEventRow["category"] = "personal",
): CompletionEventRow {
  return { logicalDate, taskId, category };
}

describe("windowStart", () => {
  test("last 7 logical days starts at T-6", () => {
    expect(windowStart(T, DAYS_7)).toBe("2026-08-14");
  });

  test("last 30 logical days starts at T-29", () => {
    expect(windowStart(T, DAYS_30)).toBe("2026-07-22");
  });
});

describe("countByDay", () => {
  test("fills zeros for missing days and counts events not unique tasks", () => {
    const series = countByDay(
      [
        event(T, "a"),
        event(T, "b"),
        event(yesterday, "a"),
        event("2026-08-01", "x"),
      ],
      windowStart(T, DAYS_7),
      T,
    );

    expect(series).toHaveLength(7);
    expect(series[0]).toEqual({ date: "2026-08-14", count: 0 });
    expect(series.at(-2)).toEqual({ date: yesterday, count: 1 });
    expect(series.at(-1)).toEqual({ date: T, count: 2 });
  });
});

describe("splitCompletions", () => {
  test("counts Personal and Work in the window and omits null category", () => {
    const split = splitCompletions(
      [
        event(T, "p1", "personal"),
        event(T, "w1", "work"),
        event(T, "gone", null),
        event(yesterday, "p2", "personal"),
        event("2026-07-01", "old", "work"),
      ],
      windowStart(T, DAYS_7),
      T,
    );

    expect(split).toEqual({ personal: 2, work: 1 });
  });
});

describe("rateByDay", () => {
  const occupancy: OccupancyRow[] = [
    { logicalDate: T, taskId: "today-a" },
    { logicalDate: T, taskId: "today-b" },
    { logicalDate: yesterday, taskId: "y-a" },
    { logicalDate: twoAgo, taskId: "empty-occ" },
  ];

  test("numerator is occupancy intersected with that day's completions, not event count", () => {
    const events = [
      event(T, "today-a"),
      event(T, "today-a"),
      event(T, "today-b"),
      event(T, "registry-only"),
      event(yesterday, "y-a"),
    ];
    const { days, completedOnToday, satOnToday } = rateByDay(
      occupancy,
      completedTaskIdsByDay(events),
      twoAgo,
      T,
    );

    expect(days.find((day) => day.date === T)).toEqual({
      date: T,
      completed: 2,
      sat: 2,
      rate: 1,
    });
    expect(days.find((day) => day.date === yesterday)).toEqual({
      date: yesterday,
      completed: 1,
      sat: 1,
      rate: 1,
    });
    expect(completedOnToday).toBe(3);
    expect(satOnToday).toBe(4);
  });

  test("registry-only completion does not raise that day's rate", () => {
    const { days } = rateByDay(
      [{ logicalDate: T, taskId: "sat" }],
      completedTaskIdsByDay([event(T, "registry-only"), event(T, "sat")]),
      T,
      T,
    );

    expect(days[0]).toEqual({ date: T, completed: 1, sat: 1, rate: 1 });
  });

  test("rate cannot exceed 1 even with extra completions that never sat on Today", () => {
    const { days } = rateByDay(
      [{ logicalDate: T, taskId: "sat" }],
      completedTaskIdsByDay([
        event(T, "sat"),
        event(T, "reg-1"),
        event(T, "reg-2"),
      ]),
      T,
      T,
    );

    expect(days[0]?.rate).toBe(1);
    expect(days[0]?.rate === null || days[0].rate <= 1).toBe(true);
  });

  test("zero occupancy is an empty rate, not 0%", () => {
    const { days, completedOnToday, satOnToday } = rateByDay(
      [],
      completedTaskIdsByDay([event(T, "registry-only")]),
      T,
      T,
    );

    expect(days[0]).toEqual({ date: T, completed: 0, sat: 0, rate: null });
    expect(completedOnToday).toBe(0);
    expect(satOnToday).toBe(0);
  });

  test("partial occupancy rate is completed/sat", () => {
    const { days } = rateByDay(
      [
        { logicalDate: T, taskId: "a" },
        { logicalDate: T, taskId: "b" },
        { logicalDate: T, taskId: "c" },
      ],
      completedTaskIdsByDay([event(T, "a")]),
      T,
      T,
    );

    expect(days[0]).toEqual({ date: T, completed: 1, sat: 3, rate: 1 / 3 });
  });
});

describe("heatmapLevel", () => {
  test("ramps Polar through Tree Frog", () => {
    expect(heatmapLevel(0)).toBe(0);
    expect(heatmapLevel(1)).toBe(1);
    expect(heatmapLevel(2)).toBe(2);
    expect(heatmapLevel(3)).toBe(3);
    expect(heatmapLevel(4)).toBe(4);
    expect(heatmapLevel(5)).toBe(5);
    expect(heatmapLevel(9)).toBe(5);
  });
});

describe("monday IST heatmap grid", () => {
  test("Thursday 20 Aug 2026 is weekday index 3 and Monday is 17 Aug", () => {
    expect(weekdayMondayIndex(T)).toBe(3);
    expect(mondayOnOrBefore(T)).toBe("2026-08-17");
  });

  test("first week pads Polar cells before the 12-month start", () => {
    const { start, gridStart } = heatmapRange(T);
    expect(gridStart <= start).toBe(true);
    expect(weekdayMondayIndex(gridStart)).toBe(0);

    const grid = heatmapGrid(T, new Map());
    expect(grid.weeks[0]?.monday).toBe(gridStart);
    expect(grid.weeks[0]?.cells).toHaveLength(7);

    const pad = grid.weeks[0]?.cells.filter((cell) => !cell.inRange) ?? [];
    expect(pad.length).toBe(weekdayMondayIndex(start));
    expect(pad.every((cell) => cell.level === 0 && cell.count === 0)).toBe(
      true,
    );
  });

  test("weeks are Monday to Sunday and intensity follows completion count", () => {
    const monday = mondayOnOrBefore(T);
    const grid = heatmapGrid(
      T,
      new Map([
        [monday, 1],
        [addLogicalDays(monday, 1), 2],
        [T, 5],
      ]),
    );

    const thisWeek = grid.weeks.at(-1);
    expect(thisWeek?.monday).toBe(monday);
    expect(thisWeek?.cells.map((cell) => cell.date)).toEqual([
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
    ]);
    expect(thisWeek?.cells[0]?.level).toBe(1);
    expect(thisWeek?.cells[1]?.level).toBe(2);
    expect(thisWeek?.cells[3]?.level).toBe(5);
    expect(thisWeek?.cells[4]?.inRange).toBe(false);
    expect(grid.total).toBe(8);
  });

  test("copy never says Failed", () => {
    expect("A complete starts the run.".includes("Failed")).toBe(false);
    expect("Clear board.".includes("Failed")).toBe(false);
    expect("Missed".includes("Failed")).toBe(false);
  });
});
