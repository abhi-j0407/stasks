import { describe, expect, test } from "vitest";
import { isUpcoming, UPCOMING_CHIP } from "./upcoming";

describe("isUpcoming", () => {
  const t = "2026-08-19";

  test("is true only for registry D in {T+1, T+2}", () => {
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: "2026-08-20",
        t,
      }),
    ).toBe(true);
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: "2026-08-21",
        t,
      }),
    ).toBe(true);
  });

  test("is false when D is 3+ days, past, today, or unset", () => {
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: "2026-08-22",
        t,
      }),
    ).toBe(false);
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: "2026-08-18",
        t,
      }),
    ).toBe(false);
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: t,
        t,
      }),
    ).toBe(false);
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: null,
        t,
      }),
    ).toBe(false);
  });

  test("is false off the registry even when D is tomorrow", () => {
    expect(
      isUpcoming({
        location: "tomorrow",
        plannedDate: "2026-08-20",
        t,
      }),
    ).toBe(false);
    expect(
      isUpcoming({
        location: "today",
        plannedDate: "2026-08-20",
        t,
      }),
    ).toBe(false);
  });
});

describe("PRD §14.2 Wednesday/Thursday/Friday", () => {
  const d = "2026-08-21";

  test("Wednesday: D = Friday is upcoming in the registry", () => {
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: d,
        t: "2026-08-19",
      }),
    ).toBe(true);
  });

  test("Thursday before 16:00: still registry, upcoming", () => {
    expect(
      isUpcoming({
        location: "registry",
        plannedDate: d,
        t: "2026-08-20",
      }),
    ).toBe(true);
  });

  test("Thursday 16:00: on Tomorrow, so not upcoming", () => {
    expect(
      isUpcoming({
        location: "tomorrow",
        plannedDate: d,
        t: "2026-08-20",
      }),
    ).toBe(false);
  });

  test("chip copy is UPCOMING", () => {
    expect(UPCOMING_CHIP).toBe("UPCOMING");
  });
});
