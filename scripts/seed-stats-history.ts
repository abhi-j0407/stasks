import { randomUUID } from "node:crypto";
import { loadEnvConfig } from "@next/env";
import { and, count, eq, gte, isNull, lt } from "drizzle-orm";

loadEnvConfig(process.cwd());

type DaySpec = {
  personal: number;
  work: number;
  leftover: number;
  registry: number;
};

const LAST7: DaySpec[] = [
  { personal: 2, work: 2, leftover: 0, registry: 0 },
  { personal: 0, work: 1, leftover: 1, registry: 1 },
  { personal: 1, work: 0, leftover: 0, registry: 0 },
  { personal: 3, work: 0, leftover: 0, registry: 1 },
  { personal: 0, work: 0, leftover: 2, registry: 0 },
  { personal: 0, work: 2, leftover: 0, registry: 0 },
  { personal: 1, work: 0, leftover: 0, registry: 0 },
];

const WEEKDAY_SPEC: DaySpec[] = [
  { personal: 1, work: 0, leftover: 0, registry: 0 },
  { personal: 1, work: 0, leftover: 0, registry: 0 },
  { personal: 1, work: 1, leftover: 0, registry: 0 },
  { personal: 1, work: 0, leftover: 0, registry: 0 },
  { personal: 2, work: 2, leftover: 0, registry: 0 },
  { personal: 3, work: 2, leftover: 0, registry: 0 },
  { personal: 0, work: 0, leftover: 0, registry: 0 },
];

function specFor(offsetFromToday: number, weekday: number): DaySpec {
  if (offsetFromToday <= 6) {
    return LAST7[offsetFromToday];
  }
  if (offsetFromToday >= 40 && offsetFromToday <= 47) {
    return { personal: 1, work: 0, leftover: 0, registry: 0 };
  }
  return WEEKDAY_SPEC[weekday];
}

async function insertChunks<T>(
  rows: T[],
  write: (chunk: T[]) => Promise<unknown>,
): Promise<void> {
  for (let index = 0; index < rows.length; index += 200) {
    const chunk = rows.slice(index, index + 200);
    if (chunk.length > 0) {
      await write(chunk);
    }
  }
}

async function main() {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "db:seed:stats is local visual QA only. Do not run in production.",
    );
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a personal Neon connection string to .env.local before seeding.",
    );
  }

  const email = process.env.AUTH_ALLOWLIST_EMAIL?.trim().toLowerCase();
  if (!email) {
    throw new Error(
      "AUTH_ALLOWLIST_EMAIL is not set. Seed needs the allowlisted account that already signed in.",
    );
  }

  const { db } = await import("../lib/db");
  const { withNeonRetry } = await import("../lib/db/retry");
  const { completionEvents, tasks, todayOccupancy, users } = await import(
    "../lib/db/schema"
  );
  const { logicalDate } = await import("../lib/logical-clock");
  const { computeStreak } = await import("../lib/streak");
  const {
    assembleStatsSnapshot,
    DAYS_30,
    eachLogicalDay,
    heatmapRange,
    weekdayMondayIndex,
    windowStart,
  } = await import("../lib/stats");

  const [user] = await withNeonRetry(() =>
    db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .limit(1),
  );

  if (!user) {
    throw new Error(
      `No users row for ${email}. Sign in once so Auth.js can write the account, then seed.`,
    );
  }

  const todayIso = logicalDate();
  const prior = await db
    .select({ id: completionEvents.id })
    .from(completionEvents)
    .where(
      and(
        eq(completionEvents.userId, user.id),
        lt(completionEvents.logicalDate, todayIso),
      ),
    )
    .limit(1);

  if (prior.length > 0) {
    console.log(
      "Seed skipped: this user already has stats history. Nothing was deleted.",
    );
    return;
  }

  const now = new Date();
  const personalIds = [randomUUID(), randomUUID(), randomUUID()];
  const workIds = [randomUUID(), randomUUID()];
  const leftoverIds = [randomUUID(), randomUUID()];
  const registryId = randomUUID();
  const overdueIds = [randomUUID(), randomUUID()];

  await db.insert(tasks).values([
    ...personalIds.map((id, sortOrder) => ({
      id,
      userId: user.id,
      title: `Seed · personal heat ${sortOrder + 1}`,
      notes: null,
      category: "personal" as const,
      location: "registry" as const,
      sortOrder,
      completedAt: now,
    })),
    ...workIds.map((id, sortOrder) => ({
      id,
      userId: user.id,
      title: `Seed · work heat ${sortOrder + 1}`,
      notes: null,
      category: "work" as const,
      location: "registry" as const,
      sortOrder: sortOrder + personalIds.length,
      completedAt: now,
    })),
    {
      id: leftoverIds[0],
      userId: user.id,
      title: "Seed · leftover personal",
      notes: null,
      category: "personal" as const,
      location: "registry" as const,
      sortOrder: 6,
      completedAt: now,
    },
    {
      id: leftoverIds[1],
      userId: user.id,
      title: "Seed · leftover work",
      notes: null,
      category: "work" as const,
      location: "registry" as const,
      sortOrder: 7,
      completedAt: now,
    },
    {
      id: registryId,
      userId: user.id,
      title: "Seed · registry only",
      notes: "Counts for streak, not Today rate.",
      category: "work" as const,
      location: "registry" as const,
      sortOrder: 8,
      completedAt: now,
    },
    {
      id: overdueIds[0],
      userId: user.id,
      title: "Seed · return the library book",
      notes: null,
      category: "personal" as const,
      location: "registry" as const,
      sortOrder: 9,
      overdue: true,
    },
    {
      id: overdueIds[1],
      userId: user.id,
      title: "Seed · send the invoice",
      notes: null,
      category: "work" as const,
      location: "registry" as const,
      sortOrder: 10,
      overdue: true,
    },
  ]);

  const { start: heatmapStart } = heatmapRange(todayIso);
  const occupancyRows: {
    userId: string;
    logicalDate: string;
    taskId: string;
  }[] = [];
  const eventRows: {
    userId: string;
    taskId: string;
    completedAt: Date;
    logicalDate: string;
  }[] = [];

  const dates = eachLogicalDay(heatmapStart, todayIso);
  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index];
    const offset = dates.length - 1 - index;
    const spec = specFor(offset, weekdayMondayIndex(date));

    for (let slot = 0; slot < spec.personal; slot += 1) {
      const taskId = personalIds[slot];
      occupancyRows.push({ userId: user.id, logicalDate: date, taskId });
      eventRows.push({
        userId: user.id,
        taskId,
        completedAt: now,
        logicalDate: date,
      });
    }
    for (let slot = 0; slot < spec.work; slot += 1) {
      const taskId = workIds[slot];
      occupancyRows.push({ userId: user.id, logicalDate: date, taskId });
      eventRows.push({
        userId: user.id,
        taskId,
        completedAt: now,
        logicalDate: date,
      });
    }
    for (let slot = 0; slot < spec.leftover; slot += 1) {
      occupancyRows.push({
        userId: user.id,
        logicalDate: date,
        taskId: leftoverIds[slot],
      });
    }
    for (let slot = 0; slot < spec.registry; slot += 1) {
      eventRows.push({
        userId: user.id,
        taskId: registryId,
        completedAt: now,
        logicalDate: date,
      });
    }
  }

  await insertChunks(occupancyRows, (chunk) =>
    withNeonRetry(() =>
      db.insert(todayOccupancy).values(chunk).onConflictDoNothing(),
    ),
  );
  await insertChunks(eventRows, (chunk) =>
    withNeonRetry(() => db.insert(completionEvents).values(chunk)),
  );

  const occupancyStart = windowStart(todayIso, DAYS_30);
  const [streakDates, eventQuery, occupancyQuery, overdueQuery] =
    await Promise.all([
      db
        .selectDistinct({ logicalDate: completionEvents.logicalDate })
        .from(completionEvents)
        .where(eq(completionEvents.userId, user.id)),
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
            eq(completionEvents.userId, user.id),
            gte(completionEvents.logicalDate, heatmapStart),
          ),
        ),
      db
        .select({
          logicalDate: todayOccupancy.logicalDate,
          taskId: todayOccupancy.taskId,
        })
        .from(todayOccupancy)
        .where(
          and(
            eq(todayOccupancy.userId, user.id),
            gte(todayOccupancy.logicalDate, occupancyStart),
          ),
        ),
      db
        .select({ value: count() })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, user.id),
            isNull(tasks.completedAt),
            eq(tasks.overdue, true),
          ),
        ),
    ]);

  const snapshot = assembleStatsSnapshot({
    todayIso,
    streak: computeStreak(
      streakDates.map((row) => row.logicalDate),
      todayIso,
    ),
    events: eventQuery.map((row) => ({
      logicalDate: row.logicalDate,
      taskId: row.taskId,
      category:
        row.category === "personal" || row.category === "work"
          ? row.category
          : null,
    })),
    occupancy: occupancyQuery,
    overdueCount: Number(overdueQuery[0]?.value ?? 0),
  });

  const sunday = dates.find((date) => weekdayMondayIndex(date) === 6);
  const saturday = dates.find((date) => weekdayMondayIndex(date) === 5);

  console.log(`Seeded stats history for ${email} (logical today ${todayIso}).`);
  console.log(
    `streak current ${snapshot.streak.current} best ${snapshot.streak.best}`,
  );
  console.log(
    `last 7 counts ${snapshot.last7.counts.map((day) => day.count).join(",")}`,
  );
  console.log(
    `last 7 personal ${snapshot.last7.split.personal} work ${snapshot.last7.split.work}`,
  );
  console.log(
    `last 7 rate ${snapshot.last7.completedOnToday} / ${snapshot.last7.satOnToday} on Today`,
  );
  console.log(
    `last 7 rates ${snapshot.last7.rates
      .map((day) => (day.rate === null ? "blank" : String(day.rate)))
      .join(",")}`,
  );
  console.log(
    `last 30 total ${snapshot.last30.total} personal ${snapshot.last30.split.personal} work ${snapshot.last30.split.work}`,
  );
  console.log(
    `last 30 rate ${snapshot.last30.completedOnToday} / ${snapshot.last30.satOnToday} on Today`,
  );
  console.log(`overdue ${snapshot.overdueCount}`);
  console.log(`heatmap total ${snapshot.heatmap.total}`);
  console.log(
    `heatmap samples T=${todayIso}:${snapshot.last7.counts.at(-1)?.count}` +
      (sunday ? ` sunday ${sunday}:0` : "") +
      (saturday ? ` saturday ${saturday}:5-ish` : ""),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  const cause =
    error && typeof error === "object" && "cause" in error ? error.cause : undefined;
  if (cause instanceof Error) {
    console.error(cause.message);
  }
  process.exit(1);
});
