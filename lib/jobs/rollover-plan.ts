import type { TaskCategory } from "../tasks/split-by-category";

export type TaskLocation = "today" | "tomorrow" | "registry";

const CATEGORIES: readonly TaskCategory[] = ["personal", "work"];

export type RolloverTask = {
  id: string;
  category: TaskCategory;
  location: TaskLocation;
  sortOrder: number;
  overdue: boolean;
  plannedDate: string | null;
};

export type RolloverPatch = {
  id: string;
  location: TaskLocation;
  sortOrder: number;
  overdue: boolean;
};

export type RolloverPlan = {
  patches: RolloverPatch[];
  occupancyTaskIds: string[];
};

export function shouldSweepToToday(
  plannedDate: string | null,
  newT: string,
): boolean {
  return plannedDate != null && plannedDate <= newT;
}

function bySortOrder(a: RolloverTask, b: RolloverTask): number {
  return a.sortOrder - b.sortOrder;
}

export function planRollover(
  incomplete: RolloverTask[],
  newT: string,
): RolloverPlan {
  const patches: RolloverPatch[] = [];
  const occupancyTaskIds: string[] = [];

  for (const category of CATEGORIES) {
    const inCategory = incomplete
      .filter((task) => task.category === category)
      .slice()
      .sort(bySortOrder);

    const leftovers: RolloverTask[] = [];
    const exiles: RolloverTask[] = [];
    for (const task of inCategory) {
      if (task.location !== "today") {
        continue;
      }
      if (task.overdue) {
        exiles.push(task);
      } else {
        leftovers.push(task);
      }
    }

    const fromTomorrow = inCategory.filter(
      (task) => task.location === "tomorrow",
    );

    const stayingRegistry: RolloverTask[] = [];
    const swept: RolloverTask[] = [];
    for (const task of inCategory) {
      if (task.location !== "registry") {
        continue;
      }
      if (shouldSweepToToday(task.plannedDate, newT)) {
        swept.push(task);
      } else {
        stayingRegistry.push(task);
      }
    }

    const newToday = [...leftovers, ...fromTomorrow, ...swept];
    newToday.forEach((task, sortOrder) => {
      patches.push({
        id: task.id,
        location: "today",
        sortOrder,
        overdue: task.location === "today" ? true : task.overdue,
      });
      occupancyTaskIds.push(task.id);
    });

    const newRegistry = [...stayingRegistry, ...exiles];
    newRegistry.forEach((task, sortOrder) => {
      patches.push({
        id: task.id,
        location: "registry",
        sortOrder,
        overdue: task.overdue,
      });
    });
  }

  return { patches, occupancyTaskIds };
}
