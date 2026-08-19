import { logicalDate } from "../logical-clock";

export const COMPLETE_AGAIN = "Couldn't complete just now. Try again.";
export const UNDO_AGAIN = "Couldn't undo just now. Try again.";
export const UNDO_CLOSED = "Undo's closed for that day.";
export const COMPLETE_TOAST = "Nice.";

const TASK_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ParseTaskIdResult =
  | { ok: true; value: { taskId: string } }
  | { ok: false; message: string };

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

export function parseTaskId(value: unknown): string | null {
  const id = asString(value);
  return id !== null && TASK_ID.test(id) ? id : null;
}

export function parseCompleteInput(raw: {
  taskId?: unknown;
}): ParseTaskIdResult {
  const taskId = parseTaskId(raw.taskId);
  if (!taskId) {
    return { ok: false, message: COMPLETE_AGAIN };
  }
  return { ok: true, value: { taskId } };
}

export function parseUndoInput(raw: {
  taskId?: unknown;
}): ParseTaskIdResult {
  const taskId = parseTaskId(raw.taskId);
  if (!taskId) {
    return { ok: false, message: UNDO_AGAIN };
  }
  return { ok: true, value: { taskId } };
}

export function canUndoCompletion(
  completedAt: Date,
  now: Date = new Date(),
): boolean {
  return logicalDate(completedAt) === logicalDate(now);
}
