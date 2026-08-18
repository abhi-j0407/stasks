# Phase 3 handoff: Schema and logical clock

**Objective:** Neon + Drizzle schema live; `logicalDate` matches PRD §12; header shows T and T+1; catch-up/job_runs scaffolding exists (jobs still no-ops).

**Branch:** `feat/03-schema-clock` from `development` (`5678080`). Not merged. `main` remains `5a83247`, frozen specs only. Not pushed.

## Commits

- `9297f8b` — Add Neon Drizzle schema so Auth.js and later lists have a database.
- `68a5120` — Add the Kolkata logical clock so 04:00 cuts Today from last night.
- `39d1c73` — Show logical Today and Tomorrow in the signed-in header.
- `88ec4f8` — Record the Phase 3 schema and clock handoff so a cold session can verify the slice.

## Files touched

- `package.json`, `package-lock.json` — `drizzle-orm`, `@neondatabase/serverless`, `@auth/drizzle-adapter`, `drizzle-kit`, `vitest`; scripts `test`, `db:generate`, `db:migrate`
- `drizzle.config.ts` — Postgres dialect, `./lib/db/schema.ts` → `./drizzle`; loads `.env.local`; migrate throws if `DATABASE_URL` is missing
- `lib/db/schema.ts` — Auth.js `users` / `accounts` / `sessions` / `verification_tokens`; `tasks`, `completion_events`, `today_occupancy`, `job_runs`
- `lib/db/index.ts` — Neon HTTP Drizzle client
- `lib/auth.ts` — Drizzle adapter + JWT session; jwt/session callbacks expose `user.id`
- `types/next-auth.d.ts` — session `user.id`
- `drizzle/0000_schema-clock.sql`, `drizzle/meta/*` — generated migration (not applied)
- `lib/logical-clock.ts`, `lib/logical-clock.test.ts` — PRD §12 clock + caption formatter
- `vitest.config.mts` — node env, `lib/**/*.test.ts`
- `lib/jobs/catch-up.ts`, `lib/jobs/rollover.ts`, `lib/jobs/promote.ts` — catch-up returns `logicalDate` only; job stubs no-op
- `components/nav/app-header.tsx` — Wolf caption Today / Tomorrow
- `app/(app)/layout.tsx` — `catchUp(now)` then header dates
- `app/globals.css` — header caption styles
- `README.md` — `DATABASE_URL`, migrate, test
- `docs/handoffs/phase-03-schema-clock.md` — this file

## What works

- Schema matches MASTER data model. Product `date` columns use string `YYYY-MM-DD`. `completion_events.taskId` and `today_occupancy.taskId` have no FK so history can outlive a task row.
- Auth.js v5 Google allowlist unchanged. Adapter persists `users` / `accounts` on sign-in. Session stays JWT (`proxy.ts` still cookie-only).
- `npm test` — Tuesday 03:59 IST → Monday (`2026-08-17`); 04:00 IST → Tuesday (`2026-08-18`); T+1 on both sides of the cut.
- Signed-in app shell shows Wolf caption `Today · …` and `Tomorrow · …` from `logicalDate(now)` / `logicalTomorrow(now)` in Asia/Kolkata. No streak pill (Phase 11).
- Catch-up is scaffolding: it exposes `logicalDate` and does not read or write `job_runs`, does not loop missing dates, and does not mutate lists. `runRollover` / `runPromote` return immediately.
- `npm run lint` and `npm run build` pass.
- `.env.local` is gitignored and was not committed.

## What is not in this phase

- **`drizzle-kit migrate` has not been run.** Owner chose stop-before-migrate; `DATABASE_URL` is missing/empty in `.env.local`. SQL is generated and committed.
- Task lists from DB (Phase 4), capture/reorder/moves/complete, real rollover/promote, cron, deploy, seed data, streak pill.
- P2-1 (local browser allowlist/denied) is still open. Not closed.
- No Clerk, Auth0, or RaftLabs.

## How to verify

```bash
npm install
npm test
```

1. Tests cover PRD §12: `2026-08-18T03:59:00+05:30` → `2026-08-17`; `2026-08-18T04:00:00+05:30` → `2026-08-18`. Do not wait overnight.
2. Put a **personal** Neon `DATABASE_URL` in `.env.local` (direct/unpooled if Neon shows both). Never RaftLabs. Never commit the file.
3. `npm run db:migrate` against that Neon project.
4. `npm run dev` → sign in with the allowlisted Google account (re-sign-in once so the adapter can write `users` / `accounts` and the JWT carries `user.id`).
5. `/today` header shows logical Today and Tomorrow as Wolf captions on Polar.
6. `npm run lint` and `npm run build`.
7. `git status` does not include `.env.local`.

## Open questions

- Personal Neon `DATABASE_URL` still missing. Migrate is blocked until the owner adds it and an implementor runs `npm run db:migrate`.
- Merge `feat/03-schema-clock` into `development` only when the owner agrees (and preferably after migrate succeeds).
- After migrate + first sign-in, confirm a `users` row exists for the allowlisted email.
