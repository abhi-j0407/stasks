# Phase 12 handoff: Stats

**Objective:** Stats screen: streak, 7/30 bars, split, completion rate, overdue count, heatmap.

**Branch:** `feat/12-stats` fast-forwarded into `development` at `987309d`. `main` remains `5a83247`, frozen specs only. Not pushed.

## Commits

- `5506bd3` — Derive stats series from occupancy and completions so the Today rate cannot exceed 1.
- `5dfa9eb` — Show current streak and 7/30 completion bars on Stats so the tab is no longer a placeholder.
- `63de696` — Split 7/30 completions into Personal and Work so the counts match the list sections.
- `865a384` — Show per-day Today completion rate beside the counts so occupancy, not extra completions, is the denominator.
- `4715d24` — Show the current overdue count from incomplete rows so misses stay visible without shame.
- `59905bf` — Render a Monday-start year heatmap so completion heat matches DESIGN.md, not a metric grid.
- `96738a5` — Add a guarded stats-history seed so bars, split, rate, overdue, and heatmap can be checked against known numbers.
- `fd1ce9b` — Record the Phase 12 stats handoff so a cold session can verify the slice.
- `ef73e44` — Record the Phase 12 handoff commit hash so a cold session can verify the work.
- `3812ed9` — Note the last Phase 12 hash-record commit so the handoff lists every commit on the branch.
- `987309d` — List the final Phase 12 hash-record commit so the handoff matches git log.

## Files touched

- `lib/stats.ts`, `lib/stats.test.ts` — 7/30 counts, Personal/Work split, occupancy∩completions rate (exists, never >1), Monday IST heatmap grid, Sea Sponge→Tree Frog buckets, `assembleStatsSnapshot`
- `lib/tasks/queries.ts` — `loadStats` via `React.cache`; reuses `loadStreak`; completions since heatmap start (left join category); occupancy last 30 days; overdue count on incomplete rows; `Promise.all`; scoped to `userId`
- `app/(app)/stats/page.tsx` — Server Component; `requireUserId()` + `loadStats`; no placeholder
- `components/stats/stats-screen.tsx` — Canary streak card (Display 800 current + Beetle best), 7/30 Feather/Swan 12px pills, split, rate series + `n / d on Today`, overdue Walking Fish card
- `components/stats/heatmap.tsx` — ~12 months, 13px cells, 2px gap, 2px radius, Polar empty, Monday IST, horizontal scroll
- `app/globals.css` — stats cards 16px / 2px Swan / 20px padding; bar/heatmap/split/overdue chrome
- `lib/actions/complete-task.ts`, `lib/actions/clear-overdue.ts`, `lib/actions/delete-task.ts` — `revalidatePath("/stats")` so the screen stays live
- `scripts/seed-stats-history.ts`, `package.json` — `npm run db:seed:stats`; refuses `VERCEL_ENV=production`; never deletes; skips if `completion_events.logicalDate < T` already exist
- `docs/handoffs/phase-12-stats.md` — this file

`app/(app)/placeholder-screen.tsx` is unused and was not deleted.

## What works

- `/stats` is a real screen. Header streak pill is still the list-header control (Fox 13px/800). Stats card is Canary with a geometric Fox flame (not Duo) and Display 800 current + best (Beetle callout only).
- Last 7 = `T-6`..`T`, last 30 = `T-29`..`T`. Bar height 12px, Feather fill, Swan track, pill. Totals and split use Display 800. Personal/Work use the list section underline grammar (Feather / Macaw).
- Completion rate for D: occupancy rows for D whose `taskId` has a `completion_events` row on D, divided by occupancy count for D. Extra Tomorrow/Registry completions count for streak, bars, and heatmap, not the rate (cannot exceed 1). Zero occupancy is a blank track, not `0%`, never “No data.”
- Overdue: count of incomplete `tasks` with `overdue === true`, any location. Walking Fish card, Cardinal `OVERDUE` pill, copy `Missed. Still on the board.` or `Clear board.`
- Heatmap: ~12 months, Monday IST weeks, intensity 0 Polar / 1 Sea Sponge / 2 Turtle / 3 Mask / 4 Feather / 5+ Tree Frog. Best streak uses full history via `loadStreak`, not the 12-month window.
- Copy never says Failed. No extra metrics, AI, or weekly email.
- `npm test` (138), `npm run lint`, `npm run build` pass.
- `.env.local` was not committed. Orchestrator `docs/handoffs/MASTER.md` and `docs/plans/MASTER.md` were left unstaged.

## What is not in this phase

- Deploy / push / merge to `main` (Phase 13)
- Closing P2-1
- Occupancy writer changes (still insert-only on enter-Today)
- A second header streak surface
- Deleting `placeholder-screen.tsx`
- Duo, extra chips, SaaS metric-card templates

## How to verify

```bash
npm install
npm test
npm run lint
npm run build
npm run db:seed:stats
npm run dev
```

1. Sign in with the allowlisted Google account.
2. `/stats` is not the placeholder. Header pill still shows live current streak.
3. Streak card: Canary, geometric flame, Display 800 current, Beetle `Best N`. If current is 0, Wolf line `A complete starts the run.`
4. Last 7 / last 30: counts as 12px Feather/Swan pills, Personal/Work split, rate pills, compact `completed / sat on Today`.
5. Complete from Registry: streak, bars, and heatmap move; that day’s Today rate does not, unless the task sat on Today (occupancy row).
6. Overdue number matches incomplete `overdue=true` rows on Today / Tomorrow / Registry.
7. Heatmap week starts Monday; empty Polar; hotter days climb Sea Sponge → Tree Frog; scroll horizontally if needed.
8. `npm run db:seed:stats` refuses production, never deletes, and skips if history before today already exists. On a fresh account it prints expected current/best, 7/30 series, split, rate, overdue, heatmap total — those must match the screen. Helper rows titled `Seed · …` are QA only (today’s seed events can appear in Completed today).
9. `git status` does not include `.env.local`.

## Open questions

- Merge `feat/12-stats` was fast-forwarded into `development` at `987309d`. Do not push. Leave `main` alone. Phase 13 only.
- Local `npm run db:seed:stats` skipped on this machine because the allowlisted user already has `completion_events` before today. That skip is correct.
- P2-1 remains open (not a Phase 12 blocker).
- `CRON_SECRET` still unset locally — not a Phase 12 blocker.
- No Clerk, Auth0, or RaftLabs.
