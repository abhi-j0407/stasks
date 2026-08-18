import { cache } from "react";
import { and, asc, eq, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { completionEvents, tasks } from "@/lib/db/schema";
import {
  splitByCategory,
  type TaskCategory,
} from "@/lib/tasks/split-by-category";

export type { TaskCategory };
export type TaskLocation = "today" | "tomorrow" | "registry";

export type TaskRowData = {
  id: string;
  title: string;
  notes: string | null;
  category: TaskCategory;
  location: TaskLocation;
};

export const requireUserId = cache(async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    redirect("/signin");
  }
  return userId;
});

const taskRowColumns = {
  id: tasks.id,
  title: tasks.title,
  notes: tasks.notes,
  category: tasks.category,
  location: tasks.location,
};

export async function listIncomplete(
  userId: string,
  location: TaskLocation,
): Promise<TaskRowData[]> {
  return db
    .select(taskRowColumns)
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        eq(tasks.location, location),
        isNull(tasks.completedAt),
      ),
    )
    .orderBy(asc(tasks.sortOrder));
}

export async function listCompletedToday(
  userId: string,
  logicalDate: string,
): Promise<TaskRowData[]> {
  const rows = await db
    .select(taskRowColumns)
    .from(completionEvents)
    .innerJoin(tasks, eq(tasks.id, completionEvents.taskId))
    .where(
      and(
        eq(completionEvents.userId, userId),
        eq(tasks.userId, userId),
        eq(completionEvents.logicalDate, logicalDate),
      ),
    )
    .orderBy(asc(completionEvents.completedAt));

  const { personal, work } = splitByCategory(rows);
  return [...personal, ...work];
}
