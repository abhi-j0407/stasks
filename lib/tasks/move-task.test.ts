import { describe, expect, test } from "vitest";
import {
  destinationsFor,
  MOVE_AGAIN,
  MOVE_LABEL,
  moveButtonVariant,
  parseMoveInput,
} from "./move-task";

const TASK_ID = "11111111-1111-4111-8111-111111111111";

describe("parseMoveInput", () => {
  test("accepts each user-move pair", () => {
    const pairs = [
      ["today", "tomorrow"],
      ["today", "registry"],
      ["tomorrow", "today"],
      ["tomorrow", "registry"],
      ["registry", "today"],
      ["registry", "tomorrow"],
    ] as const;

    for (const [fromLocation, toLocation] of pairs) {
      expect(
        parseMoveInput({
          taskId: TASK_ID,
          fromLocation,
          toLocation,
        }),
      ).toEqual({
        ok: true,
        value: { taskId: TASK_ID, fromLocation, toLocation },
      });
    }
  });

  test("rejects a no-op location and invalid fields", () => {
    expect(
      parseMoveInput({
        taskId: TASK_ID,
        fromLocation: "today",
        toLocation: "today",
      }),
    ).toEqual({ ok: false, message: MOVE_AGAIN });

    expect(
      parseMoveInput({
        taskId: "not-a-uuid",
        fromLocation: "today",
        toLocation: "tomorrow",
      }),
    ).toEqual({ ok: false, message: MOVE_AGAIN });

    expect(
      parseMoveInput({
        taskId: TASK_ID,
        fromLocation: "inbox",
        toLocation: "tomorrow",
      }),
    ).toEqual({ ok: false, message: MOVE_AGAIN });

    expect(
      parseMoveInput({
        taskId: TASK_ID,
        fromLocation: "today",
        toLocation: "later",
      }),
    ).toEqual({ ok: false, message: MOVE_AGAIN });
  });
});

describe("destinationsFor", () => {
  test("omits the current list and keeps tomorrow first when it is a destination", () => {
    expect(destinationsFor("today")).toEqual(["tomorrow", "registry"]);
    expect(destinationsFor("tomorrow")).toEqual(["today", "registry"]);
    expect(destinationsFor("registry")).toEqual(["tomorrow", "today"]);
  });

  test("covers all six user-move pairs across the three screens", () => {
    const pairs = [
      ...destinationsFor("today").map((to) => ["today", to]),
      ...destinationsFor("tomorrow").map((to) => ["tomorrow", to]),
      ...destinationsFor("registry").map((to) => ["registry", to]),
    ];

    expect(pairs).toEqual([
      ["today", "tomorrow"],
      ["today", "registry"],
      ["tomorrow", "today"],
      ["tomorrow", "registry"],
      ["registry", "tomorrow"],
      ["registry", "today"],
    ]);
  });
});

describe("moveButtonVariant", () => {
  test("uses secondary only for Move to Tomorrow", () => {
    expect(moveButtonVariant("tomorrow")).toBe("secondary");
    expect(moveButtonVariant("today")).toBe("ghost");
    expect(moveButtonVariant("registry")).toBe("ghost");
  });
});

describe("MOVE_LABEL", () => {
  test("names each destination", () => {
    expect(MOVE_LABEL.today).toBe("Move to Today");
    expect(MOVE_LABEL.tomorrow).toBe("Move to Tomorrow");
    expect(MOVE_LABEL.registry).toBe("Move to Registry");
  });
});
