import { describe, expect, test } from "vitest";
import {
  addLogicalDays,
  formatCaptionDate,
  isPromoteDue,
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

describe("isPromoteDue", () => {
  test("Tuesday 15:59 IST is before the 16:00 promote", () => {
    expect(isPromoteDue(new Date("2026-08-18T15:59:00+05:30"))).toBe(false);
  });

  test("Tuesday 16:00 IST has passed the promote window", () => {
    expect(isPromoteDue(new Date("2026-08-18T16:00:00+05:30"))).toBe(true);
  });

  test("Wednesday 01:00 IST is still Tuesday logical T after 16:00", () => {
    expect(isPromoteDue(new Date("2026-08-19T01:00:00+05:30"))).toBe(true);
  });

  test("Wednesday 04:00 IST is a new T before that day's 16:00", () => {
    expect(isPromoteDue(new Date("2026-08-19T04:00:00+05:30"))).toBe(false);
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
