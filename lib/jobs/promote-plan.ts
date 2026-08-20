import { addLogicalDays } from "../logical-clock";
import type { TaskCategory } from "../tasks/split-by-category";

export type TaskLocation = "today" | "tomorrow" | "registry";

const CATEGORIES: readonly TaskCategory[] = ["personal", "work"];

export type PromoteTask = {
  id: string;
  category: TaskCategory;
  location: TaskLocation;
  sortOrder: number;
  overdue: boolean;
  plannedDate: string | null;
};

export type PromotePatch = {
  id: string;
  location: "tomorrow";
  sortOrder: number;
  overdue: boolean;
};

export function shouldPromote(
  plannedDate: string | null,
  t: string,
): boolean {
  return plannedDate === addLogicalDays(t, 1);
}

function bySortOrder(a: PromoteTask, b: PromoteTask): number {
  return a.sortOrder - b.sortOrder;
}

export function planPromote(
  incomplete: PromoteTask[],
  t: string,
): PromotePatch[] {
  const t1 = addLogicalDays(t, 1);
  const patches: PromotePatch[] = [];

  for (const category of CATEGORIES) {
    const inCategory = incomplete.filter((task) => task.category === category);
    const tomorrowItems = inCategory
      .filter((task) => task.location === "tomorrow")
      .slice()
      .sort(bySortOrder);
    const maxSort =
      tomorrowItems.length === 0
        ? -1
        : Math.max(...tomorrowItems.map((task) => task.sortOrder));

    const promoted = inCategory
      .filter(
        (task) =>
          task.location === "registry" && task.plannedDate === t1,
      )
      .slice()
      .sort(bySortOrder);

    promoted.forEach((task, index) => {
      patches.push({
        id: task.id,
        location: "tomorrow",
        sortOrder: maxSort + 1 + index,
        overdue: task.overdue,
      });
    });
  }

  return patches;
}
