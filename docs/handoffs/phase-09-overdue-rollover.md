# Phase 9 handoff: Overdue and 04:00 rollover

**Objective:** Overdue UI + 04:00 job + catch-up matching PRD §13 and §15 (including §14.4 sweep).

**Branch:** `feat/09-overdue-rollover` (fast-forwarded into `development` at `1706805`; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `5780f47` — Add a labeled OVERDUE chip so a miss is a Missed nudge, not a Failed verdict.
- `bf7d0f9` — Add the 04:00 rollover planner so a miss gets one grace day, then exile, without waiting overnight.
- `bf0d747` — Gate the 04:00 cron behind CRON_SECRET so anonymous callers cannot roll the board.
- `bcca4a4` — Apply missed 04:00 cuts in order on load so a failed cron cannot freeze yesterday's board.
- `49843c5` — Record the Phase 9 overdue handoff so a cold session can verify the slice.
- `4d0643a` — Record the Phase 9 handoff commit hash so a cold session can verify the work.
- `1706805` — Note the Phase 9 hash-record commit so the handoff lists every commit on the branch.

## Files touched

- `lib/tasks/clear-overdue.ts`, `lib/tasks/clear-overdue.test.ts` — parse uuid; kind copy (`OVERDUE` / `Missed` / `Clear overdue`); never Failed
- `lib/actions/clear-overdue.ts` — `'use server'`; `requireUserId()`; set `overdue=false` for that session user; `withNeonRetry`; revalidate that list
- `lib/tasks/queries.ts` — `TaskRowData.overdue` selected for incomplete and completed-today rows
- `components/tasks/task-row.tsx` — Walking Fish wash + Cardinal pill `OVERDUE` (12px/800 uppercase); chip tap clears; keyboard has no extra choreography
- `components/tasks/task-row-moves.tsx` — overflow **Clear overdue** (ghost, not Feather)
- `components/tasks/sortable-task-list.tsx` — optimistic `overdue: false`
- `app/globals.css` — overdue wash and chip; reduced-motion skips chip scale
- `lib/jobs/rollover-plan.ts`, `lib/jobs/rollover.test.ts` — PRD §15 planner: grace vs exile, merge order per category, occupancy for new Today, plannedDate sweep fixtures
- `lib/jobs/rollover.ts` — `runRollover(T)` claims `job_runs` (`rollover-04`, new T), applies per user, `recordTodayOccupancy`; unique row is the lock
- `lib/jobs/cron-auth.ts`, `lib/jobs/cron-auth.test.ts` — missing/empty `CRON_SECRET` denied; Bearer must match (timing-safe)
- `app/api/cron/rollover/route.ts` — GET/POST; 401 without secret; then `catchUp`; not behind the session gate (`proxy.ts` already excludes `/api`)
- `vercel.json` — cron `30 22 * * *` → `/api/cron/rollover` (04:00 Asia/Kolkata). No promote cron.
- `lib/logical-clock.ts`, `lib/logical-clock.test.ts` — export `addLogicalDays`
- `lib/jobs/catch-up-plan.ts`, `lib/jobs/catch-up.test.ts` — missing dates walker; no latest → no mutations (do not loop from epoch)
- `lib/jobs/catch-up.ts` — if no `rollover-04` row, insert current T without mutating; else `runRollover` for each missing new-T in order. Does not call `runPromote`.
- `docs/handoffs/phase-09-overdue-rollover.md` — this file

## What works

- Incomplete rows with `overdue === true` show Walking Fish wash and a labeled Cardinal `OVERDUE` chip (not color-alone). Chip tap and overflow **Clear overdue** set `overdue=false` (another grace cycle if missed again). Completed-today rows do not show the chip. Copy never says Failed. One primary green action remains complete.
- `planRollover` tests: first miss → overdue and stay + occupancy for T; second miss still overdue → registry append, no occupancy for the exile; clear then miss → grace again; leftovers then Tomorrow per category, then plannedDate `=== T` or past append; never-committed registry stays not overdue.
- Catch-up on authenticated `(app)` layout and from `/api/cron/rollover`: bootstrap current T without mutating if no job row exists; otherwise apply missed cuts in order. `job_runs` unique `(jobName, logicalDate)` makes `runRollover` a no-op on a second claim. `runPromote` stays empty; no `promote-16` rows.
- Cron GET/POST require `Authorization: Bearer $CRON_SECRET`. Tests prove missing secret is rejected. `/api/cron/rollover` is dynamic (`ƒ`).
- Header streak pill still `0`. Occupancy is still write-only (no UI).
- `npm test` (71), `npm run lint`, `npm run build` pass.
- `.env.local` was not committed.

## What is not in this phase

- Planned-date field / upcoming chip / 16:00 promote / `/api/cron/promote` (Phase 10). Sweep of `plannedDate` today/past is in the rollover planner (fixtures).
- `lib/streak.ts` / header tick (Phase 11) — pill stays `0`
- Stats (Phase 12)
- Deploy / push (Phase 13)
- Filling `runPromote`
- Closing P2-1
- Live local hit of `/api/cron/rollover` — `.env.local` has no `CRON_SECRET` yet. Unit tests cover 401. Do not invent or commit a secret.
- No Clerk, Auth0, or RaftLabs

## How to verify

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

1. Sign in with the allowlisted Google account. First signed-in load bootstraps `rollover-04` for current logical T **without** marking today's tasks overdue (board already is T).
2. If Neon has been idle ~5 minutes, the first write can take a couple of seconds while the compute wakes.
3. To see the chip without waiting overnight: set `overdue = true` on an incomplete Today (or Registry) row in Neon, reload. Walking Fish wash + Cardinal `OVERDUE`. Tap the chip: flag clears, wash goes. Overflow **Clear overdue** does the same. Copy is Missed / OVERDUE, never Failed.
4. Complete remains the only Feather primary on the row. Keyboard chip/complete: no extra choreography.
5. `npm test` covers grace, exile, merge order, occupancy, sweep, catch-up date walking, and cron 401 without a secret. Do not wait overnight for 04:00.
6. After a day is bootstrapped, a later catch-up/cron for T+1 runs the real algorithm (grace leftovers stay overdue on Today; already-overdue incomplete Today append to Registry).
7. `/stats` is still the placeholder. Streak pill is still `0`.
8. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 9 blocker).
- Owner should put `CRON_SECRET` in gitignored `.env.local` (and Vercel env in Phase 13) before a live cron GET. Ask before inventing a value.
- Catch-up bootstrap: no `rollover-04` row → insert current T, no list mutations. Avoids treating first-day Today as yesterday. Do not loop from epoch.
- Do not push. Leave `main` alone. Phase 13 only.
- `feat/09-overdue-rollover` is fast-forwarded into `development` at `1706805`.
