import type { AdapterAccountType } from "@auth/core/adapters";
import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const taskCategoryEnum = pgEnum("task_category", ["personal", "work"]);

export const taskLocationEnum = pgEnum("task_location", [
  "today",
  "tomorrow",
  "registry",
]);

export const jobNameEnum = pgEnum("job_name", ["rollover-04", "promote-16"]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    category: taskCategoryEnum("category").notNull(),
    notes: text("notes"),
    location: taskLocationEnum("location").notNull(),
    sortOrder: integer("sort_order").notNull(),
    overdue: boolean("overdue").notNull().default(false),
    plannedDate: date("planned_date", { mode: "string" }),
    completedAt: timestamp("completed_at", {
      withTimezone: true,
      mode: "date",
    }),
    overdueAtComplete: boolean("overdue_at_complete"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (task) => [
    index("tasks_user_location_category_sort_idx").on(
      task.userId,
      task.location,
      task.category,
      task.sortOrder,
    ),
  ],
);

export const completionEvents = pgTable("completion_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  // No FK: events must outlive the task row after the undo window closes.
  taskId: uuid("task_id").notNull(),
  completedAt: timestamp("completed_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
  logicalDate: date("logical_date", { mode: "string" }).notNull(),
});

export const todayOccupancy = pgTable(
  "today_occupancy",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    logicalDate: date("logical_date", { mode: "string" }).notNull(),
    // No FK: occupancy stays if the task is later moved, exiled, or deleted.
    taskId: uuid("task_id").notNull(),
  },
  (row) => [
    primaryKey({
      columns: [row.userId, row.logicalDate, row.taskId],
    }),
  ],
);

export const jobRuns = pgTable(
  "job_runs",
  {
    jobName: jobNameEnum("job_name").notNull(),
    logicalDate: date("logical_date", { mode: "string" }).notNull(),
    ranAt: timestamp("ran_at", { withTimezone: true, mode: "date" }).notNull(),
  },
  (row) => [
    primaryKey({
      columns: [row.jobName, row.logicalDate],
    }),
  ],
);
