import { describe, expect, test } from "vitest";
import { missingRolloverDates, shouldRunPromote } from "./catch-up-plan";

const T = "2026-08-19";

describe("missingRolloverDates", () => {
  test("bootstraps with no mutations when there is no latest run", () => {
    expect(missingRolloverDates(null, T)).toEqual([]);
  });

  test("returns each missed new-T in order", () => {
    expect(missingRolloverDates("2026-08-16", T)).toEqual([
      "2026-08-17",
      "2026-08-18",
      "2026-08-19",
    ]);
  });

  test("runs the next cut when latest is yesterday", () => {
    expect(missingRolloverDates("2026-08-18", T)).toEqual([T]);
  });

  test("is a no-op when already caught up", () => {
    expect(missingRolloverDates(T, T)).toEqual([]);
    expect(missingRolloverDates("2026-08-20", T)).toEqual([]);
  });
});

describe("shouldRunPromote", () => {
  test("15:59 is before the window", () => {
    expect(shouldRunPromote(new Date("2026-08-18T15:59:00+05:30"))).toBe(
      false,
    );
  });

  test("16:00 is due", () => {
    expect(shouldRunPromote(new Date("2026-08-18T16:00:00+05:30"))).toBe(
      true,
    );
  });

  test("01:00 next calendar is still logical T after 16:00", () => {
    expect(shouldRunPromote(new Date("2026-08-19T01:00:00+05:30"))).toBe(
      true,
    );
  });

  test("04:00 is a new T before that day's 16:00", () => {
    expect(shouldRunPromote(new Date("2026-08-19T04:00:00+05:30"))).toBe(
      false,
    );
  });
});
