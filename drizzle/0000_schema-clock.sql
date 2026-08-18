CREATE TYPE "public"."job_name" AS ENUM('rollover-04', 'promote-16');--> statement-breakpoint
CREATE TYPE "public"."task_category" AS ENUM('personal', 'work');--> statement-breakpoint
CREATE TYPE "public"."task_location" AS ENUM('today', 'tomorrow', 'registry');--> statement-breakpoint
CREATE TABLE "accounts" (
	"user_id" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "completion_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"task_id" uuid NOT NULL,
	"completed_at" timestamp with time zone NOT NULL,
	"logical_date" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_runs" (
	"job_name" "job_name" NOT NULL,
	"logical_date" date NOT NULL,
	"ran_at" timestamp with time zone NOT NULL,
	CONSTRAINT "job_runs_job_name_logical_date_pk" PRIMARY KEY("job_name","logical_date")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"category" "task_category" NOT NULL,
	"notes" text,
	"location" "task_location" NOT NULL,
	"sort_order" integer NOT NULL,
	"overdue" boolean DEFAULT false NOT NULL,
	"planned_date" date,
	"completed_at" timestamp with time zone,
	"overdue_at_complete" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "today_occupancy" (
	"user_id" uuid NOT NULL,
	"logical_date" date NOT NULL,
	"task_id" uuid NOT NULL,
	CONSTRAINT "today_occupancy_user_id_logical_date_task_id_pk" PRIMARY KEY("user_id","logical_date","task_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text,
	"email_verified" timestamp,
	"image" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verification_tokens_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completion_events" ADD CONSTRAINT "completion_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "today_occupancy" ADD CONSTRAINT "today_occupancy_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tasks_user_location_category_sort_idx" ON "tasks" USING btree ("user_id","location","category","sort_order");