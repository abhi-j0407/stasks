import { cache } from "react";
import { and, asc, count, eq, gte, isNull } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { withNeonRetry } from "@/lib/db/retry";
import { completionEvents, tasks, todayOccupancy } from "@/lib/db/schema";
import { computeStreak, type Streak } from "@/lib/streak";
import {
  assembleStatsSnapshot,
  DAYS_30,
  heatmapRange,
  windowStart,
  type CompletionEventRow,
  type OccupancyRow,
  type StatsSnapshot,
} from "@/lib/stats";
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
  overdue: boolean;
  plannedDate: string | null;
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
  overdue: tasks.overdue,
  plannedDate: tasks.plannedDate,
};

export async function listIncomplete(
  userId: string,
  location: TaskLocation,
): Promise<TaskRowData[]> {
  return withNeonRetry(() =>
    db
      .select(taskRowColumns)
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.location, location),
          isNull(tasks.completedAt),
        ),
      )
      .orderBy(asc(tasks.sortOrder)),
  );
}

export async function listCompletedToday(
  userId: string,
  logicalDate: string,
): Promise<TaskRowData[]> {
  const rows = await withNeonRetry(() =>
    db
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
      .orderBy(asc(completionEvents.completedAt)),
  );

  const { personal, work } = splitByCategory(rows);
  return [...personal, ...work];
}

export const loadStreak = cache(
  async (userId: string, todayIso: string): Promise<Streak> => {
    const rows = await withNeonRetry(() =>
      db
        .selectDistinct({ logicalDate: completionEvents.logicalDate })
        .from(completionEvents)
        .where(eq(completionEvents.userId, userId)),
    );

    return computeStreak(
      rows.map((row) => row.logicalDate),
      todayIso,
    );
  },
);

function asCategory(value: string | null): TaskCategory | null {
  return value === "personal" || value === "work" ? value : null;
}

export const loadStats = cache(
  async (userId: string, todayIso: string): Promise<StatsSnapshot> => {
    const { start: heatmapStart } = heatmapRange(todayIso);
    const occupancyStart = windowStart(todayIso, DAYS_30);

    const [streak, eventRows, occupancyRows, overdueRows] = await Promise.all([
      loadStreak(userId, todayIso),
      withNeonRetry(() =>
        db
          .select({
            logicalDate: completionEvents.logicalDate,
            taskId: completionEvents.taskId,
            category: tasks.category,
          })
          .from(completionEvents)
          .leftJoin(tasks, eq(tasks.id, completionEvents.taskId))
          .where(
            and(
              eq(completionEvents.userId, userId),
              gte(completionEvents.logicalDate, heatmapStart),
            ),
          ),
      ),
      withNeonRetry(() =>
        db
          .select({
            logicalDate: todayOccupancy.logicalDate,
            taskId: todayOccupancy.taskId,
          })
          .from(todayOccupancy)
          .where(
            and(
              eq(todayOccupancy.userId, userId),
              gte(todayOccupancy.logicalDate, occupancyStart),
            ),
          ),
      ),
      withNeonRetry(() =>
        db
          .select({ value: count() })
          .from(tasks)
          .where(
            and(
              eq(tasks.userId, userId),
              isNull(tasks.completedAt),
              eq(tasks.overdue, true),
            ),
          ),
      ),
    ]);

    const events: CompletionEventRow[] = eventRows.map((row) => ({
      logicalDate: row.logicalDate,
      taskId: row.taskId,
      category: asCategory(row.category),
    }));
    const occupancy: OccupancyRow[] = occupancyRows;

    return assembleStatsSnapshot({
      todayIso,
      streak,
      events,
      occupancy,
      overdueCount: Number(overdueRows[0]?.value ?? 0),
    });
  },
);
