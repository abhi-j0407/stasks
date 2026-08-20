import { describe, expect, test } from "vitest";
import {
  planPromote,
  shouldPromote,
  type PromoteTask,
} from "./promote-plan";
import { isUpcoming } from "../upcoming";
import { destinationFromPlannedDate } from "../tasks/planned-date";

const THU = "2026-08-20";
const FRI = "2026-08-21";
const WED = "2026-08-19";
const R1 = "11111111-1111-4111-8111-111111111111";
const R2 = "22222222-2222-4222-8222-222222222222";
const TM1 = "33333333-3333-4333-8333-333333333333";
const FAR = "44444444-4444-4444-8444-444444444444";
const W1 = "55555555-5555-4555-8555-555555555555";

function task(
  partial: Pick<PromoteTask, "id" | "category" | "location"> &
    Partial<Omit<PromoteTask, "id" | "category" | "location">>,
): PromoteTask {
  return {
    sortOrder: 0,
    overdue: false,
    plannedDate: null,
    ...partial,
  };
}

describe("shouldPromote", () => {
  test("is true only when D === T+1", () => {
    expect(shouldPromote(FRI, THU)).toBe(true);
    expect(shouldPromote(FRI, WED)).toBe(false);
    expect(shouldPromote(THU, THU)).toBe(false);
    expect(shouldPromote(null, THU)).toBe(false);
    expect(shouldPromote("2026-08-22", THU)).toBe(false);
  });
});

describe("planPromote", () => {
  test("moves only registry D === T+1 onto Tomorrow, appending after existing", () => {
    const patches = planPromote(
      [
        task({
          id: TM1,
          category: "personal",
          location: "tomorrow",
          sortOrder: 0,
        }),
        task({
          id: R1,
          category: "personal",
          location: "registry",
          sortOrder: 0,
          plannedDate: FRI,
          overdue: true,
        }),
        task({
          id: R2,
          category: "personal",
          location: "registry",
          sortOrder: 1,
          plannedDate: FRI,
        }),
        task({
          id: FAR,
          category: "personal",
          location: "registry",
          sortOrder: 2,
          plannedDate: "2026-08-22",
        }),
      ],
      THU,
    );

    expect(patches).toEqual([
      {
        id: R1,
        location: "tomorrow",
        sortOrder: 1,
        overdue: true,
      },
      {
        id: R2,
        location: "tomorrow",
        sortOrder: 2,
        overdue: false,
      },
    ]);
  });

  test("leaves D === T+2 and does not reindex leftover registry", () => {
    const patches = planPromote(
      [
        task({
          id: FAR,
          category: "personal",
          location: "registry",
          sortOrder: 3,
          plannedDate: "2026-08-22",
        }),
      ],
      THU,
    );
    expect(patches).toEqual([]);
  });

  test("appends Work independently of Personal", () => {
    const patches = planPromote(
      [
        task({
          id: R1,
          category: "personal",
          location: "registry",
          plannedDate: FRI,
        }),
        task({
          id: W1,
          category: "work",
          location: "registry",
          plannedDate: FRI,
        }),
      ],
      THU,
    );

    expect(patches).toEqual([
      { id: R1, location: "tomorrow", sortOrder: 0, overdue: false },
      { id: W1, location: "tomorrow", sortOrder: 0, overdue: false },
    ]);
  });

  test("ignores completed rows because they are not passed in", () => {
    expect(planPromote([], THU)).toEqual([]);
  });
});

describe("PRD §14.2 Wednesday/Thursday/Friday", () => {
  const d = FRI;

  test("Wednesday: upcoming in registry, promote does not move", () => {
    expect(
      isUpcoming({ location: "registry", plannedDate: d, t: WED }),
    ).toBe(true);
    expect(
      destinationFromPlannedDate({
        plannedDate: d,
        t: WED,
        promoteDue: false,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
    expect(
      planPromote(
        [
          task({
            id: R1,
            category: "personal",
            location: "registry",
            plannedDate: d,
          }),
        ],
        WED,
      ),
    ).toEqual([]);
  });

  test("Thursday before 16:00: still registry, upcoming", () => {
    expect(
      isUpcoming({ location: "registry", plannedDate: d, t: THU }),
    ).toBe(true);
    expect(
      destinationFromPlannedDate({
        plannedDate: d,
        t: THU,
        promoteDue: false,
      }),
    ).toEqual({ location: "registry", recordOccupancy: false });
  });

  test("Thursday 16:00: on Tomorrow (Friday's list)", () => {
    expect(
      destinationFromPlannedDate({
        plannedDate: d,
        t: THU,
        promoteDue: true,
      }),
    ).toEqual({ location: "tomorrow", recordOccupancy: false });
    expect(
      planPromote(
        [
          task({
            id: R1,
            category: "personal",
            location: "registry",
            plannedDate: d,
          }),
        ],
        THU,
      ),
    ).toEqual([
      { id: R1, location: "tomorrow", sortOrder: 0, overdue: false },
    ]);
    expect(
      isUpcoming({ location: "tomorrow", plannedDate: d, t: THU }),
    ).toBe(false);
  });
});
