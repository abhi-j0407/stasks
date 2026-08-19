import { describe, expect, test } from "vitest";
import {
  parseReorderInput,
  planReorder,
  REORDER_AGAIN,
  type ReorderPatch,
} from "./reorder-tasks";

const P1 = "11111111-1111-4111-8111-111111111111";
const P2 = "22222222-2222-4222-8222-222222222222";
const P3 = "33333333-3333-4333-8333-333333333333";
const W1 = "44444444-4444-4444-8444-444444444444";
const W2 = "55555555-5555-4555-8555-555555555555";

function keysOf(patch: ReorderPatch) {
  return Object.keys(patch).sort();
}

describe("parseReorderInput", () => {
  test("accepts a same-list move", () => {
    expect(
      parseReorderInput({
        taskId: P1,
        location: "today",
        toCategory: "work",
        toIndex: 0,
      }),
    ).toEqual({
      ok: true,
      value: {
        taskId: P1,
        location: "today",
        toCategory: "work",
        toIndex: 0,
      },
    });
  });

  test("rejects missing, invalid, or non-integer fields", () => {
    expect(
      parseReorderInput({
        taskId: "not-a-uuid",
        location: "today",
        toCategory: "personal",
        toIndex: 0,
      }),
    ).toEqual({ ok: false, message: REORDER_AGAIN });

    expect(
      parseReorderInput({
        taskId: P1,
        location: "inbox",
        toCategory: "personal",
        toIndex: 0,
      }),
    ).toEqual({ ok: false, message: REORDER_AGAIN });

    expect(
      parseReorderInput({
        taskId: P1,
        location: "today",
        toCategory: "urgent",
        toIndex: 0,
      }),
    ).toEqual({ ok: false, message: REORDER_AGAIN });

    expect(
      parseReorderInput({
        taskId: P1,
        location: "today",
        toCategory: "personal",
        toIndex: 1.5,
      }),
    ).toEqual({ ok: false, message: REORDER_AGAIN });

    expect(
      parseReorderInput({
        taskId: P1,
        location: "today",
        toCategory: "personal",
        toIndex: -1,
      }),
    ).toEqual({ ok: false, message: REORDER_AGAIN });
  });
});

describe("planReorder", () => {
  test("reindexes 0..n-1 within a category", () => {
    const patches = planReorder(
      [
        { id: P1, category: "personal" },
        { id: P2, category: "personal" },
        { id: P3, category: "personal" },
      ],
      { taskId: P1, toCategory: "personal", toIndex: 2 },
    );

    expect(patches).toEqual([
      { id: P2, category: "personal", sortOrder: 0 },
      { id: P3, category: "personal", sortOrder: 1 },
      { id: P1, category: "personal", sortOrder: 2 },
    ]);
    expect(patches?.every((patch) => keysOf(patch).join() === "category,id,sortOrder")).toBe(
      true,
    );
  });

  test("Personal to Work changes category and reindexes both subsets", () => {
    const patches = planReorder(
      [
        { id: P1, category: "personal" },
        { id: P2, category: "personal" },
        { id: W1, category: "work" },
        { id: W2, category: "work" },
      ],
      { taskId: P1, toCategory: "work", toIndex: 1 },
    );

    expect(patches).toEqual([
      { id: P2, category: "personal", sortOrder: 0 },
      { id: W1, category: "work", sortOrder: 0 },
      { id: P1, category: "work", sortOrder: 1 },
      { id: W2, category: "work", sortOrder: 2 },
    ]);
    expect(patches?.some((patch) => "location" in patch)).toBe(false);
  });

  test("empty destination gets sortOrder 0", () => {
    expect(
      planReorder([{ id: P1, category: "personal" }], {
        taskId: P1,
        toCategory: "work",
        toIndex: 0,
      }),
    ).toEqual([{ id: P1, category: "work", sortOrder: 0 }]);
  });

  test("clamps toIndex past the destination length", () => {
    expect(
      planReorder(
        [
          { id: P1, category: "personal" },
          { id: W1, category: "work" },
        ],
        { taskId: P1, toCategory: "work", toIndex: 99 },
      ),
    ).toEqual([
      { id: W1, category: "work", sortOrder: 0 },
      { id: P1, category: "work", sortOrder: 1 },
    ]);
  });

  test("unknown id returns null", () => {
    expect(
      planReorder([{ id: P1, category: "personal" }], {
        taskId: P2,
        toCategory: "personal",
        toIndex: 0,
      }),
    ).toBeNull();
  });
});
