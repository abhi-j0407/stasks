import { describe, expect, test } from "vitest";
import {
  CLEAR_AGAIN,
  CLEAR_LABEL,
  OVERDUE_CHIP,
  overdueChipAria,
  parseClearOverdueInput,
} from "./clear-overdue";

const TASK_ID = "11111111-1111-4111-8111-111111111111";

describe("parseClearOverdueInput", () => {
  test("accepts a uuid", () => {
    expect(parseClearOverdueInput({ taskId: TASK_ID })).toEqual({
      ok: true,
      value: { taskId: TASK_ID },
    });
  });

  test("rejects an invalid id", () => {
    expect(parseClearOverdueInput({ taskId: "not-a-uuid" })).toEqual({
      ok: false,
      message: CLEAR_AGAIN,
    });
    expect(parseClearOverdueInput({})).toEqual({
      ok: false,
      message: CLEAR_AGAIN,
    });
  });
});

describe("copy", () => {
  test("uses kind Missed / OVERDUE labels, never Failed", () => {
    expect(OVERDUE_CHIP).toBe("OVERDUE");
    expect(CLEAR_LABEL).toBe("Clear overdue");
    expect(overdueChipAria("Water the plants")).toBe(
      "Missed. Clear overdue for Water the plants",
    );
    expect(CLEAR_AGAIN.includes("Failed")).toBe(false);
    expect(CLEAR_LABEL.includes("Failed")).toBe(false);
    expect(OVERDUE_CHIP.includes("Failed")).toBe(false);
    expect(overdueChipAria("x").includes("Failed")).toBe(false);
  });
});
