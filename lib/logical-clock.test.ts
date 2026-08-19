import { describe, expect, test } from "vitest";
import {
  addLogicalDays,
  formatCaptionDate,
  logicalDate,
  logicalTomorrow,
} from "./logical-clock";

describe("logicalDate", () => {
  test("Tuesday 03:59 IST is Monday", () => {
    expect(logicalDate(new Date("2026-08-18T03:59:00+05:30"))).toBe(
      "2026-08-17",
    );
  });

  test("Tuesday 03:59:59 IST is still Monday", () => {
    expect(logicalDate(new Date("2026-08-18T03:59:59+05:30"))).toBe(
      "2026-08-17",
    );
  });

  test("Tuesday 04:00 IST is Tuesday", () => {
    expect(logicalDate(new Date("2026-08-18T04:00:00+05:30"))).toBe(
      "2026-08-18",
    );
  });

  test("Tuesday 04:00:01 IST is Tuesday", () => {
    expect(logicalDate(new Date("2026-08-18T04:00:01+05:30"))).toBe(
      "2026-08-18",
    );
  });
});

describe("logicalTomorrow", () => {
  test("before the cut, tomorrow is the Kolkata calendar date", () => {
    expect(logicalTomorrow(new Date("2026-08-18T03:59:00+05:30"))).toBe(
      "2026-08-18",
    );
  });

  test("at the cut, tomorrow is the next Kolkata calendar date", () => {
    expect(logicalTomorrow(new Date("2026-08-18T04:00:00+05:30"))).toBe(
      "2026-08-19",
    );
  });
});

describe("addLogicalDays", () => {
  test("walks civil dates without looping from epoch", () => {
    expect(addLogicalDays("2026-08-19", 1)).toBe("2026-08-20");
    expect(addLogicalDays("2026-08-19", -1)).toBe("2026-08-18");
    expect(addLogicalDays("2026-08-31", 1)).toBe("2026-09-01");
  });
});

describe("formatCaptionDate", () => {
  test("formats a civil date without re-zoning now", () => {
    expect(formatCaptionDate("2026-08-18")).toBe("Tue 18 Aug");
    expect(formatCaptionDate("2026-08-19")).toBe("Wed 19 Aug");
  });
});
