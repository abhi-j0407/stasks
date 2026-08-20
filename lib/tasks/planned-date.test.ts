import { describe, expect, test } from "vitest";
import {
  DATE_AGAIN,
  destinationFromPlannedDate,
  parsePlannedDate,
  parseUpdatePlannedDateInput,
  resolveCreatePlacement,
} from "./planned-date";

const T = "2026-08-19";
const TASK_ID = "11111111-1111-4111-8111-111111111111";

describe("parsePlannedDate", () => {
  test("treats missing and blank as unset", () => {
    expect(parsePlannedDate(undefined)).toEqual({ ok: true, value: null });
    expect(parsePlannedDate(null)).toEqual({ ok: true, value: null });
    expect(parsePlannedDate("")).toEqual({ ok: true, value: null });
    expect(parsePlannedDate("   ")).toEqual({ ok: true, value: null });
  });

  test("accepts a civil date", () => {
    expect(parsePlannedDate("2026-08-21")).toEqual({
      ok: true,
      value: "2026-08-21",
    });
  });

  test("rejects a malformed date", () => {
    expect(parsePlannedDate("Friday")).toEqual({ ok: false });
    expect(parsePlannedDate("2026/08/21")).toEqual({ ok: false });
  });
});

describe("destinationFromPlannedDate §14.3", () => {
  test("unset stays registry", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: null,
        t: T,
        promoteDue: false,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
    expect(
      destinationFromPlannedDate({
        plannedDate: null,
        t: T,
        promoteDue: true,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
  });

  test("D === T goes to Today immediately", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: T,
        t: T,
        promoteDue: false,
      }),
    ).toEqual({ location: "today", recordOccupancy: true });
  });

  test("D === T+1 before 16:00 stays registry", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: "2026-08-20",
        t: T,
        promoteDue: false,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
  });

  test("D === T+1 after 16:00 goes to Tomorrow immediately", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: "2026-08-20",
        t: T,
        promoteDue: true,
      }),
    ).toEqual({ location: "tomorrow", recordOccupancy: false });
  });

  test("D === T+2 stays registry", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: "2026-08-21",
        t: T,
        promoteDue: true,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
  });

  test("D 3+ days stays registry", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: "2026-08-22",
        t: T,
        promoteDue: false,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
  });

  test("D in the past goes to Today", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: "2026-08-18",
        t: T,
        promoteDue: false,
      }),
    ).toEqual({ location: "today", recordOccupancy: true });
  });
});

describe("resolveCreatePlacement", () => {
  test("Today and Tomorrow ignore planned date", () => {
    expect(
      resolveCreatePlacement({
        requestedLocation: "today",
        plannedDate: T,
        t: T,
        promoteDue: false,
      }),
    ).toEqual({
      location: "today",
      plannedDate: null,
      recordOccupancy: true,
    });

    expect(
      resolveCreatePlacement({
        requestedLocation: "tomorrow",
        plannedDate: "2026-08-21",
        t: T,
        promoteDue: true,
      }),
    ).toEqual({
      location: "tomorrow",
      plannedDate: null,
      recordOccupancy: false,
    });
  });

  test("registry keeps D when §14.3 relocates", () => {
    expect(
      resolveCreatePlacement({
        requestedLocation: "registry",
        plannedDate: T,
        t: T,
        promoteDue: false,
      }),
    ).toEqual({
      location: "today",
      plannedDate: T,
      recordOccupancy: true,
    });
  });
});

describe("parseUpdatePlannedDateInput", () => {
  test("accepts a uuid and civil date", () => {
    expect(
      parseUpdatePlannedDateInput({
        taskId: TASK_ID,
        plannedDate: "2026-08-21",
      }),
    ).toEqual({
      ok: true,
      value: { taskId: TASK_ID, plannedDate: "2026-08-21" },
    });
  });

  test("accepts clearing the date", () => {
    expect(
      parseUpdatePlannedDateInput({
        taskId: TASK_ID,
        plannedDate: "",
      }),
    ).toEqual({
      ok: true,
      value: { taskId: TASK_ID, plannedDate: null },
    });
  });

  test("rejects a bad id or date", () => {
    expect(
      parseUpdatePlannedDateInput({
        taskId: "nope",
        plannedDate: "2026-08-21",
      }),
    ).toEqual({ ok: false, message: DATE_AGAIN });

    expect(
      parseUpdatePlannedDateInput({
        taskId: TASK_ID,
        plannedDate: "soon",
      }),
    ).toEqual({ ok: false, message: DATE_AGAIN });
  });
});
