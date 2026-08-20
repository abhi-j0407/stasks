import { addLogicalDays } from "../logical-clock";
import { parseTaskId } from "./complete-task";

export const DATE_AGAIN = "Couldn't save the date just now. Try again.";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

type TaskLocation = "today" | "tomorrow" | "registry";

export type PlannedDateDestination = {
  location: TaskLocation;
  recordOccupancy: boolean;
};

export type ParsePlannedDateResult =
  | { ok: true; value: string | null }
  | { ok: false };

export type UpdatePlannedDateFields = {
  taskId: string;
  plannedDate: string | null;
};

export type ParseUpdatePlannedDateResult =
  | { ok: true; value: UpdatePlannedDateFields }
  | { ok: false; message: string };

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parsePlannedDate(value: unknown): ParsePlannedDateResult {
  if (value == null) {
    return { ok: true, value: null };
  }

  const raw = asString(value);
  if (raw === null) {
    return { ok: false };
  }

  const trimmed = raw.trim();
  if (trimmed === "") {
    return { ok: true, value: null };
  }

  if (!ISO_DATE.test(trimmed)) {
    return { ok: false };
  }

  return { ok: true, value: trimmed };
}

export function destinationFromPlannedDate(input: {
  plannedDate: string | null;
  t: string;
  promoteDue: boolean;
}): PlannedDateDestination {
  const { plannedDate, t, promoteDue } = input;
  if (plannedDate == null) {
    return { location: "registry", recordOccupancy: false };
  }

  if (plannedDate <= t) {
    return { location: "today", recordOccupancy: true };
  }

  if (plannedDate === addLogicalDays(t, 1)) {
    return promoteDue
      ? { location: "tomorrow", recordOccupancy: false }
      : { location: "registry", recordOccupancy: false };
  }

  return { location: "registry", recordOccupancy: false };
}

export function resolveCreatePlacement(input: {
  requestedLocation: TaskLocation;
  plannedDate: string | null;
  t: string;
  promoteDue: boolean;
}): PlannedDateDestination & { plannedDate: string | null } {
  if (input.requestedLocation !== "registry") {
    return {
      location: input.requestedLocation,
      plannedDate: null,
      recordOccupancy: input.requestedLocation === "today",
    };
  }

  const dest = destinationFromPlannedDate({
    plannedDate: input.plannedDate,
    t: input.t,
    promoteDue: input.promoteDue,
  });

  return {
    location: dest.location,
    plannedDate: input.plannedDate,
    recordOccupancy: dest.recordOccupancy,
  };
}

export function parseUpdatePlannedDateInput(raw: {
  taskId?: unknown;
  plannedDate?: unknown;
}): ParseUpdatePlannedDateResult {
  const taskId = parseTaskId(raw.taskId);
  const planned = parsePlannedDate(raw.plannedDate);
  if (!taskId || !planned.ok) {
    return { ok: false, message: DATE_AGAIN };
  }

  return {
    ok: true,
    value: { taskId, plannedDate: planned.value },
  };
}
