import { splitByCategory, type TaskCategory } from "./split-by-category";

export type TaskLocation = "today" | "tomorrow" | "registry";

export const REORDER_AGAIN = "Couldn't reorder just now. Try again.";

const LOCATIONS: readonly TaskLocation[] = ["today", "tomorrow", "registry"];
const CATEGORIES: readonly TaskCategory[] = ["personal", "work"];
const TASK_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReorderTaskRef = {
  id: string;
  category: TaskCategory;
};

export type ReorderMove = {
  taskId: string;
  location: TaskLocation;
  toCategory: TaskCategory;
  toIndex: number;
};

export type ReorderPatch = {
  id: string;
  category: TaskCategory;
  sortOrder: number;
};

export type ParseReorderResult =
  | { ok: true; value: ReorderMove }
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

function parseTaskId(value: unknown): string | null {
  const id = asString(value);
  return id !== null && TASK_ID.test(id) ? id : null;
}

function parseIndex(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return null;
  }
  return value;
}

export function parseReorderInput(raw: {
  taskId?: unknown;
  location?: unknown;
  toCategory?: unknown;
  toIndex?: unknown;
}): ParseReorderResult {
  const taskId = parseTaskId(raw.taskId);
  const location = parseLocation(raw.location);
  const toCategory = parseCategory(raw.toCategory);
  const toIndex = parseIndex(raw.toIndex);

  if (!taskId || !location || !toCategory || toIndex === null) {
    return { ok: false, message: REORDER_AGAIN };
  }

  return {
    ok: true,
    value: { taskId, location, toCategory, toIndex },
  };
}

function reindex(items: ReorderTaskRef[]): ReorderPatch[] {
  return items.map((item, sortOrder) => ({
    id: item.id,
    category: item.category,
    sortOrder,
  }));
}

export function planReorder(
  items: ReorderTaskRef[],
  move: Pick<ReorderMove, "taskId" | "toCategory" | "toIndex">,
): ReorderPatch[] | null {
  const current = items.find((item) => item.id === move.taskId);
  if (!current) {
    return null;
  }

  const { personal, work } = splitByCategory(items);
  const source = current.category === "personal" ? personal : work;
  const fromIndex = source.findIndex((item) => item.id === move.taskId);
  source.splice(fromIndex, 1);

  const destination = move.toCategory === "personal" ? personal : work;
  const toIndex = Math.min(move.toIndex, destination.length);
  destination.splice(toIndex, 0, {
    id: current.id,
    category: move.toCategory,
  });

  return [...reindex(personal), ...reindex(work)];
}
