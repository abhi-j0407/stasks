import { describe, expect, test } from "vitest";
import {
  planRollover,
  shouldSweepToToday,
  type RolloverTask,
} from "./rollover-plan";

const T = "2026-08-19";
const L1 = "11111111-1111-4111-8111-111111111111";
const L2 = "22222222-2222-4222-8222-222222222222";
const TM1 = "33333333-3333-4333-8333-333333333333";
const EX1 = "44444444-4444-4444-8444-444444444444";
const EX2 = "55555555-5555-4555-8555-555555555555";
const REG = "66666666-6666-4666-8666-666666666666";
const PAST = "77777777-7777-4777-8777-777777777777";
const DUE = "88888888-8888-4888-8888-888888888888";
const FUTURE = "99999999-9999-4999-8999-999999999999";
const W_LEFT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const W_TOM = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function task(
  partial: Pick<RolloverTask, "id" | "category" | "location"> &
    Partial<Omit<RolloverTask, "id" | "category" | "location">>,
): RolloverTask {
  return {
    sortOrder: 0,
    overdue: false,
    plannedDate: null,
    ...partial,
  };
}

describe("shouldSweepToToday", () => {
  test("moves plannedDate on T or in the past, not future or unset", () => {
    expect(shouldSweepToToday(null, T)).toBe(false);
    expect(shouldSweepToToday("2026-08-19", T)).toBe(true);
    expect(shouldSweepToToday("2026-08-18", T)).toBe(true);
    expect(shouldSweepToToday("2026-08-20", T)).toBe(false);
  });
});

describe("planRollover", () => {
  test("first miss flags overdue and stays on Today with occupancy", () => {
    const plan = planRollover(
      [
        task({
          id: L1,
          category: "personal",
          location: "today",
          sortOrder: 0,
          overdue: false,
        }),
      ],
      T,
    );

    expect(plan.patches).toEqual([
      { id: L1, location: "today", sortOrder: 0, overdue: true },
    ]);
    expect(plan.occupancyTaskIds).toEqual([L1]);
  });

  test("second miss still overdue goes to Registry after existing items", () => {
    const plan = planRollover(
      [
        task({
          id: EX1,
          category: "personal",
          location: "today",
          sortOrder: 0,
          overdue: true,
        }),
        task({
          id: REG,
          category: "personal",
          location: "registry",
          sortOrder: 0,
          overdue: false,
        }),
      ],
      T,
    );

    expect(plan.patches).toEqual([
      { id: REG, location: "registry", sortOrder: 0, overdue: false },
      { id: EX1, location: "registry", sortOrder: 1, overdue: true },
    ]);
    expect(plan.occupancyTaskIds).toEqual([]);
  });

  test("clear overdue grants another grace cycle on the next miss", () => {
    const plan = planRollover(
      [
        task({
          id: L1,
          category: "personal",
          location: "today",
          sortOrder: 0,
          overdue: false,
        }),
      ],
      T,
    );

    expect(plan.patches[0]).toMatchObject({
      id: L1,
      location: "today",
      overdue: true,
    });
  });

  test("grace leftovers keep order, then former Tomorrow, per category", () => {
    const plan = planRollover(
      [
        task({
          id: L1,
          category: "personal",
          location: "today",
          sortOrder: 0,
          overdue: false,
        }),
        task({
          id: L2,
          category: "personal",
          location: "today",
          sortOrder: 1,
          overdue: false,
        }),
        task({
          id: TM1,
          category: "personal",
          location: "tomorrow",
          sortOrder: 0,
          overdue: false,
        }),
        task({
          id: W_LEFT,
          category: "work",
          location: "today",
          sortOrder: 0,
          overdue: false,
        }),
        task({
          id: W_TOM,
          category: "work",
          location: "tomorrow",
          sortOrder: 0,
          overdue: false,
        }),
      ],
      T,
    );

    expect(
      plan.patches.filter((patch) => patch.location === "today"),
    ).toEqual([
      { id: L1, location: "today", sortOrder: 0, overdue: true },
      { id: L2, location: "today", sortOrder: 1, overdue: true },
      { id: TM1, location: "today", sortOrder: 2, overdue: false },
      { id: W_LEFT, location: "today", sortOrder: 0, overdue: true },
      { id: W_TOM, location: "today", sortOrder: 1, overdue: false },
    ]);
    expect(plan.patches.some((patch) => patch.location === "tomorrow")).toBe(
      false,
    );
    expect(plan.occupancyTaskIds).toEqual([L1, L2, TM1, W_LEFT, W_TOM]);
  });

  test("exiles keep relative order when appended to registry", () => {
    const plan = planRollover(
      [
        task({
          id: EX1,
          category: "personal",
          location: "today",
          sortOrder: 0,
          overdue: true,
        }),
        task({
          id: EX2,
          category: "personal",
          location: "today",
          sortOrder: 1,
          overdue: true,
        }),
      ],
      T,
    );

    expect(plan.patches).toEqual([
      { id: EX1, location: "registry", sortOrder: 0, overdue: true },
      { id: EX2, location: "registry", sortOrder: 1, overdue: true },
    ]);
  });

  test("plannedDate today or past sweeps onto Today after leftovers and Tomorrow", () => {
    const rows: RolloverTask[] = [
      task({
        id: L1,
        category: "personal",
        location: "today",
        sortOrder: 0,
        overdue: false,
      }),
      task({
        id: TM1,
        category: "personal",
        location: "tomorrow",
        sortOrder: 0,
        overdue: false,
      }),
      task({
        id: PAST,
        category: "personal",
        location: "registry",
        sortOrder: 0,
        plannedDate: "2026-08-18",
      }),
      task({
        id: DUE,
        category: "personal",
        location: "registry",
        sortOrder: 1,
        plannedDate: T,
      }),
      task({
        id: FUTURE,
        category: "personal",
        location: "registry",
        sortOrder: 2,
        plannedDate: "2026-08-21",
      }),
      task({
        id: REG,
        category: "personal",
        location: "registry",
        sortOrder: 3,
        plannedDate: null,
      }),
    ];

    const plan = planRollover(rows, T);

    expect(
      plan.patches.filter((patch) => patch.location === "today"),
    ).toEqual([
      { id: L1, location: "today", sortOrder: 0, overdue: true },
      { id: TM1, location: "today", sortOrder: 1, overdue: false },
      { id: PAST, location: "today", sortOrder: 2, overdue: false },
      { id: DUE, location: "today", sortOrder: 3, overdue: false },
    ]);
    expect(
      plan.patches.filter((patch) => patch.location === "registry"),
    ).toEqual([
      { id: FUTURE, location: "registry", sortOrder: 0, overdue: false },
      { id: REG, location: "registry", sortOrder: 1, overdue: false },
    ]);
    expect(plan.occupancyTaskIds).toEqual([L1, TM1, PAST, DUE]);
    expect(plan.occupancyTaskIds).not.toContain(FUTURE);
    expect(plan.occupancyTaskIds).not.toContain(REG);
  });

  test("does not apply overdue to never-committed registry items", () => {
    const plan = planRollover(
      [
        task({
          id: REG,
          category: "work",
          location: "registry",
          sortOrder: 0,
          overdue: false,
          plannedDate: null,
        }),
      ],
      T,
    );

    expect(plan.patches).toEqual([
      { id: REG, location: "registry", sortOrder: 0, overdue: false },
    ]);
    expect(plan.occupancyTaskIds).toEqual([]);
  });

  test("ignores completed rows because they are not passed in", () => {
    const plan = planRollover([], T);
    expect(plan.patches).toEqual([]);
    expect(plan.occupancyTaskIds).toEqual([]);
  });
});
