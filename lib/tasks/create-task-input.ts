import { parsePlannedDate } from "./planned-date";
import type { TaskCategory } from "./split-by-category";

export type TaskLocation = "today" | "tomorrow" | "registry";

export const SAVE_AGAIN = "Couldn't save just now. Hit Enter again.";
export const TITLE_NEEDED = "A title is needed.";

const LOCATIONS: readonly TaskLocation[] = ["today", "tomorrow", "registry"];
const CATEGORIES: readonly TaskCategory[] = ["personal", "work"];

export type CreateTaskFields = {
  title: string;
  notes: string | null;
  location: TaskLocation;
  category: TaskCategory;
  plannedDate: string | null;
};

export type ParseCreateTaskResult =
  | { ok: true; value: CreateTaskFields }
  | { ok: false; message: string };

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseLocation(value: unknown): TaskLocation | null {
  const location = asString(value);
  return location !== null && LOCATIONS.includes(location as TaskLocation)
    ? (location as TaskLocation)
    : null;
}

function parseCategory(value: unknown): TaskCategory | null {
  const category = asString(value);
  return category !== null && CATEGORIES.includes(category as TaskCategory)
    ? (category as TaskCategory)
    : null;
}

export function parseCreateTaskInput(raw: {
  title?: unknown;
  notes?: unknown;
  location?: unknown;
  category?: unknown;
  plannedDate?: unknown;
}): ParseCreateTaskResult {
  const location = parseLocation(raw.location);
  const category = parseCategory(raw.category);
  if (!location || !category) {
    return { ok: false, message: SAVE_AGAIN };
  }

  const title = asString(raw.title)?.trim() ?? "";
  if (!title) {
    return { ok: false, message: TITLE_NEEDED };
  }

  const notesRaw = asString(raw.notes);
  const notes = notesRaw === null ? null : notesRaw.trim() || null;

  let plannedDate: string | null = null;
  if (location === "registry") {
    const parsedDate = parsePlannedDate(raw.plannedDate);
    if (!parsedDate.ok) {
      return { ok: false, message: SAVE_AGAIN };
    }
    plannedDate = parsedDate.value;
  }

  return { ok: true, value: { title, notes, location, category, plannedDate } };
}

export function nextSortOrder(maxSort: number | null | undefined): number {
  if (maxSort == null) {
    return 0;
  }
  return maxSort + 1;
}

export function shouldRecordTodayOccupancy(location: TaskLocation): boolean {
  return location === "today";
}
