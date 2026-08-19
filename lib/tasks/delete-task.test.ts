import { describe, expect, test } from "vitest";
import {
  DELETE_AGAIN,
  DELETE_CONFIRM,
  DELETE_CONFIRM_BODY,
  DELETE_CONFIRM_TITLE,
  DELETE_KEEP,
  DELETE_TOAST,
  parseDeleteInput,
  parseRestoreSnapshot,
  shouldDeleteCompletionEvent,
  type DeletedTaskSnapshot,
} from "./delete-task";

const TASK_ID = "11111111-1111-4111-8111-111111111111";

const snapshot: DeletedTaskSnapshot = {
  id: TASK_ID,
  title: "Call mom",
  notes: null,
  category: "personal",
  location: "today",
  sortOrder: 2,
  overdue: true,
  plannedDate: null,
  completedAt: "2026-08-18T10:00:00.000+05:30",
  overdueAtComplete: true,
  createdAt: "2026-08-17T20:00:00.000+05:30",
  restoreEvent: true,
  eventCompletedAt: "2026-08-18T10:00:00.000+05:30",
  eventLogicalDate: "2026-08-18",
};

describe("parseDeleteInput", () => {
  test("accepts a uuid", () => {
    expect(parseDeleteInput({ taskId: TASK_ID })).toEqual({
      ok: true,
      value: { taskId: TASK_ID },
    });
  });

  test("rejects an invalid id", () => {
    expect(parseDeleteInput({ taskId: "nope" })).toEqual({
      ok: false,
      message: DELETE_AGAIN,
    });
  });
});

describe("shouldDeleteCompletionEvent", () => {
  test("does not touch events for an incomplete delete", () => {
    expect(
      shouldDeleteCompletionEvent(null, new Date("2026-08-18T10:00:00+05:30")),
    ).toBe(false);
  });

  test("deletes today's event while the undo window is open", () => {
    const completedAt = new Date("2026-08-18T10:00:00+05:30");
    expect(
      shouldDeleteCompletionEvent(completedAt, new Date("2026-08-19T03:59:00+05:30")),
    ).toBe(true);
  });

  test("keeps the event after mocking T+1", () => {
    const completedAt = new Date("2026-08-18T10:00:00+05:30");
    expect(
      shouldDeleteCompletionEvent(completedAt, new Date("2026-08-19T04:00:00+05:30")),
    ).toBe(false);
  });
});

describe("parseRestoreSnapshot", () => {
  test("accepts a full snapshot", () => {
    expect(parseRestoreSnapshot(snapshot)).toEqual({
      ok: true,
      value: snapshot,
    });
  });

  test("rejects a restoreEvent without the event fields", () => {
    expect(
      parseRestoreSnapshot({
        ...snapshot,
        eventCompletedAt: null,
        eventLogicalDate: null,
      }),
    ).toEqual({ ok: false, message: DELETE_AGAIN });
  });

  test("rejects invalid fields", () => {
    expect(parseRestoreSnapshot(null)).toEqual({
      ok: false,
      message: DELETE_AGAIN,
    });
    expect(parseRestoreSnapshot({ ...snapshot, id: "nope" })).toEqual({
      ok: false,
      message: DELETE_AGAIN,
    });
    expect(parseRestoreSnapshot({ ...snapshot, location: "inbox" })).toEqual({
      ok: false,
      message: DELETE_AGAIN,
    });
  });
});

describe("copy", () => {
  test("stays kind and never says Failed", () => {
    expect(DELETE_CONFIRM_TITLE).toBe("Delete this?");
    expect(DELETE_CONFIRM_BODY).toBe("It won't count as done.");
    expect(DELETE_KEEP).toBe("Keep");
    expect(DELETE_CONFIRM).toBe("Delete");
    expect(DELETE_TOAST).toBe("Removed.");
    expect(DELETE_AGAIN.includes("Failed")).toBe(false);
    expect(DELETE_CONFIRM_BODY.includes("Failed")).toBe(false);
  });
});
