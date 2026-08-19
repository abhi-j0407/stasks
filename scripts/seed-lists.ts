import { loadEnvConfig } from "@next/env";
import { eq } from "drizzle-orm";

loadEnvConfig(process.cwd());

async function main() {
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("db:seed is local visual QA only. Do not run in production.");
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
  const { completionEvents, tasks, users } = await import("../lib/db/schema");
  const { logicalDate } = await import("../lib/logical-clock");

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

  const existing = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(eq(tasks.userId, user.id))
    .limit(1);

  if (existing.length > 0) {
    console.log("Seed skipped: this user already has tasks. Nothing was deleted.");
    return;
  }

  const now = new Date();
  const todayIso = logicalDate(now);

  const incomplete = [
    {
      userId: user.id,
      title: "Water the plants",
      notes: "Kitchen window, not the fern.",
      category: "personal" as const,
      location: "today" as const,
      sortOrder: 0,
    },
    {
      userId: user.id,
      title: "Reply to the one email that matters",
      notes: null,
      category: "work" as const,
      location: "today" as const,
      sortOrder: 0,
    },
    {
      userId: user.id,
      title: "Call home",
      notes: null,
      category: "personal" as const,
      location: "tomorrow" as const,
      sortOrder: 0,
    },
    {
      userId: user.id,
      title: "Draft the Friday note",
      notes: "Keep it short.",
      category: "work" as const,
      location: "tomorrow" as const,
      sortOrder: 0,
    },
    {
      userId: user.id,
      title: "Book the dentist",
      notes: null,
      category: "personal" as const,
      location: "registry" as const,
      sortOrder: 0,
    },
    {
      userId: user.id,
      title: "Read that RFC",
      notes: "Parked on purpose.",
      category: "work" as const,
      location: "registry" as const,
      sortOrder: 0,
    },
  ];

  await db.insert(tasks).values(incomplete);

  const [completed] = await db
    .insert(tasks)
    .values({
      userId: user.id,
      title: "Make the bed",
      notes: null,
      category: "personal",
      location: "today",
      sortOrder: 1,
      completedAt: now,
    })
    .returning({ id: tasks.id });

  await db.insert(completionEvents).values({
    userId: user.id,
    taskId: completed.id,
    completedAt: now,
    logicalDate: todayIso,
  });

  console.log(`Seeded lists for ${email} (logical today ${todayIso}).`);
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
