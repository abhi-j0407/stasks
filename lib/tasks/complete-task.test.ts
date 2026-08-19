import { describe, expect, test } from "vitest";
import {
  canUndoCompletion,
  COMPLETE_AGAIN,
  COMPLETE_TOAST,
  parseCompleteInput,
  parseUndoInput,
  UNDO_AGAIN,
  UNDO_CLOSED,
} from "./complete-task";

const TASK_ID = "11111111-1111-4111-8111-111111111111";

describe("parseCompleteInput", () => {
  test("accepts a uuid", () => {
    expect(parseCompleteInput({ taskId: TASK_ID })).toEqual({
      ok: true,
      value: { taskId: TASK_ID },
    });
  });

  test("rejects an invalid id", () => {
    expect(parseCompleteInput({ taskId: "not-a-uuid" })).toEqual({
      ok: false,
      message: COMPLETE_AGAIN,
    });
    expect(parseCompleteInput({})).toEqual({
      ok: false,
      message: COMPLETE_AGAIN,
    });
  });
});

describe("parseUndoInput", () => {
  test("accepts a uuid", () => {
    expect(parseUndoInput({ taskId: TASK_ID })).toEqual({
      ok: true,
      value: { taskId: TASK_ID },
    });
  });

  test("rejects an invalid id with undo copy", () => {
    expect(parseUndoInput({ taskId: "nope" })).toEqual({
      ok: false,
      message: UNDO_AGAIN,
    });
  });
});

describe("canUndoCompletion", () => {
  test("allows undo before the next 04:00 IST", () => {
    const completedAt = new Date("2026-08-18T10:00:00+05:30");
    expect(canUndoCompletion(completedAt, new Date("2026-08-18T22:00:00+05:30"))).toBe(
      true,
    );
    expect(canUndoCompletion(completedAt, new Date("2026-08-19T03:59:59+05:30"))).toBe(
      true,
    );
  });

  test("closes undo at 04:00 IST the next calendar morning", () => {
    const completedAt = new Date("2026-08-18T10:00:00+05:30");
    expect(canUndoCompletion(completedAt, new Date("2026-08-19T04:00:00+05:30"))).toBe(
      false,
    );
    expect(canUndoCompletion(completedAt, new Date("2026-08-19T04:00:01+05:30"))).toBe(
      false,
    );
  });

  test("a completion just before 04:00 stays undoable until that cut ends", () => {
    const completedAt = new Date("2026-08-18T03:59:00+05:30");
    expect(canUndoCompletion(completedAt, new Date("2026-08-18T03:59:30+05:30"))).toBe(
      true,
    );
    expect(canUndoCompletion(completedAt, new Date("2026-08-18T04:00:00+05:30"))).toBe(
      false,
    );
  });
});

describe("copy", () => {
  test("celebrates without shame strings", () => {
    expect(COMPLETE_TOAST).toBe("Nice.");
    expect(UNDO_CLOSED).toBe("Undo's closed for that day.");
    expect(COMPLETE_AGAIN.includes("Failed")).toBe(false);
    expect(UNDO_AGAIN.includes("Failed")).toBe(false);
    expect(UNDO_CLOSED.includes("Failed")).toBe(false);
  });
});
