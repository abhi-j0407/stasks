import { parseTaskId } from "./complete-task";

export const CLEAR_AGAIN = "Couldn't clear just now. Try again.";
export const CLEAR_LABEL = "Clear overdue";
export const OVERDUE_CHIP = "OVERDUE";

export type ParseClearOverdueResult =
  | { ok: true; value: { taskId: string } }
  | { ok: false; message: string };

export function parseClearOverdueInput(raw: {
  taskId?: unknown;
}): ParseClearOverdueResult {
  const taskId = parseTaskId(raw.taskId);
  if (!taskId) {
    return { ok: false, message: CLEAR_AGAIN };
  }
  return { ok: true, value: { taskId } };
}

export function overdueChipAria(title: string): string {
  return `Missed. Clear overdue for ${title}`;
}
