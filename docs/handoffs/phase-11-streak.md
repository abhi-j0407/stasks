# Phase 11 handoff: Streak

**Objective:** Current and best streak per PRD §17; header pill + first-of-day tick; milestones 7 / 30 / 100 only.

**Branch:** `feat/11-streak` from `development` at `2e27210`. `main` remains `5a83247` (frozen specs only). Not pushed.

## Commits

- `13aed89` — Derive current and best streak from logical days so a morning without a completion does not break the run.
- `c0b15ea` — Show the live current streak in the header so every list screen reflects completions instead of a dummy zero.
- `4a35e01` — Gate streak celebration to the first complete of the day so regular days tick and only 7, 30, and 100 burst.
- `84f48eb` — Celebrate the first complete of the day with Keep going and a +1 tick so later completes stay a quiet Nice.
- `984eb6e` — Record the Phase 11 streak handoff so a cold session can verify the slice.

## Files touched

- `lib/streak.ts`, `lib/streak.test.ts` — `computeStreak` from unique `logicalDate`s; current ends at `T` if today has a completion else yesterday; best is max consecutive run; `celebrationKind` ticks day 47 and bursts only 7 / 30 / 100; `STREAK_TOAST` = `Keep going`
- `lib/tasks/queries.ts` — `loadStreak(userId, todayIso)` via `React.cache`; distinct `completion_events.logicalDate` for that user; no extra table
- `app/(app)/layout.tsx` — `loadStreak(session.user.id, todayIso)` after catch-up; passes `currentStreak` to the header
- `components/nav/app-header.tsx` — Server Component; renders `StreakPill` instead of inert `0`
- `components/nav/streak-pill.tsx` — Fox 13px/800 number; geometric flame (rounded path + circle + pill shadow, Fox/Bee, no Duo); client store for tick / milestone
- `components/nav/streak-store.ts` — `{ current, play }` module store; undo sets `play: "none"`
- `lib/actions/complete-task.ts` — `requireUserId()`; `firstOfDay` from today’s events before insert; returns `{ current, firstOfDay }`; undo returns current and does not celebrate; `revalidatePath("/", "layout")`
- `components/tasks/sortable-task-list.tsx` — first-of-day: `Keep going` + pill play; later completes: `Nice.` and `play: "none"`; keyboard row path still skips the well animation
- `components/tasks/completed-today-well.tsx` — undo updates the pill, no reverse fireworks
- `components/feedback/toast-store.ts`, `toaster.tsx` — optional `streakTick` renders `+1`
- `app/globals.css` — keep Canary pill wash; count tick `motion-celebrate`; milestone 600ms burst on wrappers not SVG; reduced-motion fade, no overshoot, hide burst
- `docs/handoffs/phase-11-streak.md` — this file

## What works

- A logical day is a streak day if ≥1 `completion_events` row maps to that `logicalDate`. Completing from Today, Tomorrow, or Registry all count (Phase 8 already writes the event).
- Current streak: consecutive days ending at `T` if today has a completion, else ending at yesterday (does not break at 09:00). Yesterday missing and today empty → 0. Yesterday missing and today has a completion → 1. Best = max consecutive in history (computed, not shown on Stats).
- Header pill on every list screen: geometric flame + Fox 13px/800 number. Canary wash stays on this existing pill (Stats card is Phase 12).
- First complete of the logical day: number ticks (`motion-celebrate` overshoot from `scale(0.96)`). Milestones **7 / 30 / 100** only: longer 600ms burst then rest. Day 47: tick, no fireworks (`celebrationKind(true, 47) === "tick"`). Second complete the same day: no tick, no burst.
- `prefers-reduced-motion`: celebrate becomes fade; no translate; no overshoot; burst hidden. Keyboard complete still has no extra row choreography.
- First-of-day toast: Sea Sponge / Tree Frog `Keep going` with a `+1` tick. Later completes stay `Nice.` Undo does not toast a streak message. Copy never says Failed.
- `npm test` (123), `npm run lint`, `npm run build` pass.
- `.env.local` was not committed. Orchestrator `docs/handoffs/MASTER.md` and `docs/plans/MASTER.md` were left unstaged.

## What is not in this phase

- Stats screen (Phase 12) — `/stats` stays the placeholder. Heatmap, 7/30 bars, completion rate, overdue count, best-streak display wait for Phase 12. Best is computed here for tests and later Stats.
- Deploy / push (Phase 13)
- Closing P2-1
- Extra streak table or `job_runs` for streak
- Changing rollover / promote / catch-up
- Duo the owl, hearts/lives, `#000000`, `Failed`

## How to verify

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

1. Sign in with the allowlisted Google account.
2. Header pill shows the live current streak (not a dummy `0`). Geometric flame, Fox number, Canary pill.
3. Complete from Today: first of the logical day updates the pill, ticks the number, toast `Keep going` with `+1`.
4. Complete a second task the same day: toast `Nice.`, no number tick, no burst.
5. Complete from Registry: counts for the streak (same first-of-day rules).
6. Undo the only completion of the day (before 04:00): pill recalculates (yesterday’s run remains if it exists); no reverse fireworks.
7. `npm test` covers PRD §17 cases and `celebrationKind(true, 47) === "tick"`. Do not wait for day 47 in the browser.
8. `/stats` is still the placeholder.
9. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 11 blocker).
- Merge `feat/11-streak` into `development` when the owner agrees. No force. Do not push. Leave `main` alone. Phase 13 only.
- `CRON_SECRET` still unset locally — not a Phase 11 blocker.
- No Clerk, Auth0, or RaftLabs.
