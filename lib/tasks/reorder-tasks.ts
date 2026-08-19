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

export function isSectionId(value: string): value is TaskCategory {
  return value === "personal" || value === "work";
}

export function resolveDropTarget(
  items: ReorderTaskRef[],
  activeId: string,
  overId: string,
): Pick<ReorderMove, "taskId" | "toCategory" | "toIndex"> | null {
  if (activeId === overId) {
    return null;
  }

  const active = items.find((item) => item.id === activeId);
  if (!active) {
    return null;
  }

  const toCategory = isSectionId(overId)
    ? overId
    : (items.find((item) => item.id === overId)?.category ?? null);
  if (!toCategory) {
    return null;
  }

  if (isSectionId(overId)) {
    const dest = items.filter(
      (item) => item.category === toCategory && item.id !== activeId,
    );
    return { taskId: activeId, toCategory, toIndex: dest.length };
  }

  if (active.category === toCategory) {
    const dest = items.filter((item) => item.category === toCategory);
    const toIndex = dest.findIndex((item) => item.id === overId);
    if (toIndex < 0) {
      return null;
    }
    return { taskId: activeId, toCategory, toIndex };
  }

  const dest = items.filter((item) => item.category === toCategory);
  const toIndex = dest.findIndex((item) => item.id === overId);
  return {
    taskId: activeId,
    toCategory,
    toIndex: toIndex < 0 ? dest.length : toIndex,
  };
}

export function applyReorderPatches<T extends { id: string; category: TaskCategory }>(
  items: T[],
  patches: ReorderPatch[],
): T[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  const next: T[] = [];

  for (const patch of patches) {
    const item = byId.get(patch.id);
    if (item) {
      next.push({ ...item, category: patch.category });
    }
  }

  return next;
}

export function sameTaskOrder<T extends { id: string; category: TaskCategory }>(
  left: T[],
  right: T[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.id === right[index]?.id && item.category === right[index]?.category,
    )
  );
}
