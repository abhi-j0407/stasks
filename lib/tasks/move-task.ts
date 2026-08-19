import type { TaskLocation } from "@/lib/tasks/create-task-input";

export type { TaskLocation };

export const MOVE_AGAIN = "Couldn't move just now. Try again.";

export const MOVE_LABEL: Record<TaskLocation, string> = {
  today: "Move to Today",
  tomorrow: "Move to Tomorrow",
  registry: "Move to Registry",
};

const LOCATIONS: readonly TaskLocation[] = ["today", "tomorrow", "registry"];
const DESTINATION_ORDER: readonly TaskLocation[] = [
  "tomorrow",
  "today",
  "registry",
];
const TASK_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MoveTaskFields = {
  taskId: string;
  fromLocation: TaskLocation;
  toLocation: TaskLocation;
};

export type ParseMoveResult =
  | { ok: true; value: MoveTaskFields }
  | { ok: false; message: string };

export type MoveButtonVariant = "secondary" | "ghost";

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function parseLocation(value: unknown): TaskLocation | null {
  const location = asString(value);
  return location !== null && LOCATIONS.includes(location as TaskLocation)
    ? (location as TaskLocation)
    : null;
}

function parseTaskId(value: unknown): string | null {
  const id = asString(value);
  return id !== null && TASK_ID.test(id) ? id : null;
}

export function parseMoveInput(raw: {
  taskId?: unknown;
  fromLocation?: unknown;
  toLocation?: unknown;
}): ParseMoveResult {
  const taskId = parseTaskId(raw.taskId);
  const fromLocation = parseLocation(raw.fromLocation);
  const toLocation = parseLocation(raw.toLocation);

  if (!taskId || !fromLocation || !toLocation || fromLocation === toLocation) {
    return { ok: false, message: MOVE_AGAIN };
  }

  return {
    ok: true,
    value: { taskId, fromLocation, toLocation },
  };
}

export function destinationsFor(location: TaskLocation): TaskLocation[] {
  return DESTINATION_ORDER.filter((destination) => destination !== location);
}

export function moveButtonVariant(toLocation: TaskLocation): MoveButtonVariant {
  return toLocation === "tomorrow" ? "secondary" : "ghost";
}
