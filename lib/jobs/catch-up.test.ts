import { describe, expect, test } from "vitest";
import { missingRolloverDates } from "./catch-up-plan";

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
