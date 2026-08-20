import { describe, expect, test } from "vitest";
import { addLogicalDays } from "./logical-clock";
import {
  celebrationKind,
  computeStreak,
  STREAK_TOAST,
} from "./streak";

const T = "2026-08-19";
const yesterday = addLogicalDays(T, -1);
const twoAgo = addLogicalDays(T, -2);
const threeAgo = addLogicalDays(T, -3);

describe("computeStreak", () => {
  test("empty history is 0 current and 0 best", () => {
    expect(computeStreak([], T)).toEqual({ current: 0, best: 0 });
  });

  test("today only is 1 current and 1 best", () => {
    expect(computeStreak([T], T)).toEqual({ current: 1, best: 1 });
  });

  test("yesterday only keeps the run ending yesterday so 09:00 does not break it", () => {
    expect(computeStreak([twoAgo, yesterday], T)).toEqual({
      current: 2,
      best: 2,
    });
  });

  test("yesterday missing and today empty is 0", () => {
    expect(computeStreak([twoAgo, threeAgo], T)).toEqual({
      current: 0,
      best: 2,
    });
  });

  test("yesterday missing and today has a completion is 1", () => {
    expect(computeStreak([twoAgo, threeAgo, T], T)).toEqual({
      current: 1,
      best: 2,
    });
  });

  test("three consecutive days ending today is 3", () => {
    expect(computeStreak([twoAgo, yesterday, T], T)).toEqual({
      current: 3,
      best: 3,
    });
  });

  test("duplicate dates on the same logical day count once", () => {
    expect(computeStreak([T, T, yesterday, yesterday], T)).toEqual({
      current: 2,
      best: 2,
    });
  });

  test("best is the longest run even when current is a shorter ending run", () => {
    const older = [
      "2026-07-01",
      "2026-07-02",
      "2026-07-03",
      "2026-07-04",
      "2026-07-05",
    ];
    expect(computeStreak([...older, yesterday, T], T)).toEqual({
      current: 2,
      best: 5,
    });
  });
});

describe("celebrationKind", () => {
  test("day 47 ticks and does not fireworks", () => {
    expect(celebrationKind(true, 47)).toBe("tick");
  });

  test("milestones 7 / 30 / 100 burst only on the first complete of the day", () => {
    expect(celebrationKind(true, 7)).toBe("milestone");
    expect(celebrationKind(true, 30)).toBe("milestone");
    expect(celebrationKind(true, 100)).toBe("milestone");
    expect(celebrationKind(false, 7)).toBe("none");
  });

  test("first complete on a regular day ticks", () => {
    expect(celebrationKind(true, 1)).toBe("tick");
    expect(celebrationKind(false, 1)).toBe("none");
  });
});

describe("copy", () => {
  test("celebrates without shame strings", () => {
    expect(STREAK_TOAST).toBe("Keep going");
    expect(STREAK_TOAST.includes("Failed")).toBe(false);
  });
});
