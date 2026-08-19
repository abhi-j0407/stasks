import { describe, expect, test } from "vitest";
import {
  nextSortOrder,
  parseCreateTaskInput,
  SAVE_AGAIN,
  shouldRecordTodayOccupancy,
  TITLE_NEEDED,
} from "./create-task-input";

describe("parseCreateTaskInput", () => {
  test("trims title and empty notes to null", () => {
    const parsed = parseCreateTaskInput({
      title: "  Water the plants  ",
      notes: "   ",
      location: "today",
      category: "personal",
    });

    expect(parsed).toEqual({
      ok: true,
      value: {
        title: "Water the plants",
        notes: null,
        location: "today",
        category: "personal",
      },
    });
  });

  test("keeps trimmed notes", () => {
    const parsed = parseCreateTaskInput({
      title: "Call home",
      notes: "  After dinner  ",
      location: "tomorrow",
      category: "personal",
    });

    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.notes).toBe("After dinner");
    }
  });

  test("rejects empty and whitespace titles without inserting", () => {
    expect(
      parseCreateTaskInput({
        title: "",
        location: "today",
        category: "work",
      }),
    ).toEqual({ ok: false, message: TITLE_NEEDED });

    expect(
      parseCreateTaskInput({
        title: "   ",
        location: "registry",
        category: "personal",
      }),
    ).toEqual({ ok: false, message: TITLE_NEEDED });
  });

  test("rejects invalid location or category", () => {
    expect(
      parseCreateTaskInput({
        title: "Park it",
        location: "inbox",
        category: "personal",
      }),
    ).toEqual({ ok: false, message: SAVE_AGAIN });

    expect(
      parseCreateTaskInput({
        title: "Park it",
        location: "today",
        category: "urgent",
      }),
    ).toEqual({ ok: false, message: SAVE_AGAIN });
  });
});

describe("nextSortOrder", () => {
  test("starts at 0 when the section is empty", () => {
    expect(nextSortOrder(null)).toBe(0);
    expect(nextSortOrder(undefined)).toBe(0);
  });

  test("appends after the current max", () => {
    expect(nextSortOrder(0)).toBe(1);
    expect(nextSortOrder(4)).toBe(5);
  });
});

describe("shouldRecordTodayOccupancy", () => {
  test("records occupancy only when capturing onto Today", () => {
    expect(shouldRecordTodayOccupancy("today")).toBe(true);
    expect(shouldRecordTodayOccupancy("tomorrow")).toBe(false);
    expect(shouldRecordTodayOccupancy("registry")).toBe(false);
  });
});
