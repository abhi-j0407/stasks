import type { TaskLocation } from "./create-task-input";
import { canUndoCompletion, parseTaskId } from "./complete-task";
import type { TaskCategory } from "./split-by-category";

export const DELETE_AGAIN = "Couldn't delete just now. Try again.";
export const DELETE_CONFIRM_TITLE = "Delete this?";
export const DELETE_CONFIRM_BODY = "It won't count as done.";
export const DELETE_KEEP = "Keep";
export const DELETE_CONFIRM = "Delete";
export const DELETE_TOAST = "Removed.";

const LOCATIONS: readonly TaskLocation[] = ["today", "tomorrow", "registry"];
const CATEGORIES: readonly TaskCategory[] = ["personal", "work"];

export type ParseDeleteResult =
  | { ok: true; value: { taskId: string } }
  | { ok: false; message: string };

export type DeletedTaskSnapshot = {
  id: string;
  title: string;
  notes: string | null;
  category: TaskCategory;
  location: TaskLocation;
  sortOrder: number;
  overdue: boolean;
  plannedDate: string | null;
  completedAt: string | null;
  overdueAtComplete: boolean | null;
  createdAt: string;
  restoreEvent: boolean;
  eventCompletedAt: string | null;
  eventLogicalDate: string | null;
};

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
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

function parseIsoDate(value: unknown): string | null {
  const iso = asString(value);
  if (!iso) {
    return null;
  }
  const parsed = Date.parse(iso);
  return Number.isNaN(parsed) ? null : iso;
}

function parseOptionalIsoDate(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  return parseIsoDate(value) ?? undefined;
}

function parseOptionalLogicalDate(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  const iso = asString(value);
  if (iso !== null && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return iso;
  }
  return undefined;
}

export function parseDeleteInput(raw: {
  taskId?: unknown;
}): ParseDeleteResult {
  const taskId = parseTaskId(raw.taskId);
  if (!taskId) {
    return { ok: false, message: DELETE_AGAIN };
  }
  return { ok: true, value: { taskId } };
}

export function shouldDeleteCompletionEvent(
  completedAt: Date | null,
  now: Date = new Date(),
): boolean {
  if (!completedAt) {
    return false;
  }
  return canUndoCompletion(completedAt, now);
}

export type ParseRestoreResult =
  | { ok: true; value: DeletedTaskSnapshot }
  | { ok: false; message: string };

export function parseRestoreSnapshot(raw: unknown): ParseRestoreResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, message: DELETE_AGAIN };
  }

  const row = raw as Record<string, unknown>;
  const id = parseTaskId(row.id);
  const title = asString(row.title)?.trim() ?? "";
  const category = parseCategory(row.category);
  const location = parseLocation(row.location);
  const sortOrder = asFiniteNumber(row.sortOrder);
  const overdue = asBoolean(row.overdue);
  const restoreEvent = asBoolean(row.restoreEvent);
  const createdAt = parseIsoDate(row.createdAt);
  const completedAt = parseOptionalIsoDate(row.completedAt);
  const eventCompletedAt = parseOptionalIsoDate(row.eventCompletedAt);
  const eventLogicalDate = parseOptionalLogicalDate(row.eventLogicalDate);

  const notesRaw = row.notes;
  const notes =
    notesRaw === null
      ? null
      : asString(notesRaw)?.trim() || null;

  const plannedDateRaw = row.plannedDate;
  const plannedDate =
    plannedDateRaw === null
      ? null
      : asString(plannedDateRaw) && /^\d{4}-\d{2}-\d{2}$/.test(plannedDateRaw as string)
        ? (plannedDateRaw as string)
        : undefined;

  const overdueAtCompleteRaw = row.overdueAtComplete;
  const overdueAtComplete =
    overdueAtCompleteRaw === null
      ? null
      : asBoolean(overdueAtCompleteRaw);

  if (
    !id ||
    !title ||
    !category ||
    !location ||
    sortOrder === null ||
    overdue === null ||
    restoreEvent === null ||
    !createdAt ||
    completedAt === undefined ||
    overdueAtComplete === undefined ||
    plannedDate === undefined ||
    eventCompletedAt === undefined ||
    eventLogicalDate === undefined
  ) {
    return { ok: false, message: DELETE_AGAIN };
  }

  if (restoreEvent && (!eventCompletedAt || !eventLogicalDate)) {
    return { ok: false, message: DELETE_AGAIN };
  }

  return {
    ok: true,
    value: {
      id,
      title,
      notes,
      category,
      location,
      sortOrder,
      overdue,
      plannedDate,
      completedAt,
      overdueAtComplete,
      createdAt,
      restoreEvent,
      eventCompletedAt,
      eventLogicalDate,
    },
  };
}
