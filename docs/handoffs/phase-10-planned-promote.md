# Phase 10 handoff: Planned date, upcoming, 16:00 promote

**Objective:** Planned date on registry, derived upcoming, PRD §14.3 immediate rules, 16:00 promote, catch-up.

**Branch:** `feat/10-planned-promote` (from `development` at `ff83a5c`). `main` remains `5a83247`, frozen specs only. Not pushed. Not merged into `development` until the owner agrees.

## Commits

- `37f3768` — Apply planned-date rules on create and edit so registry items land without waiting for cron.
- `186e195` — Show a derived UPCOMING chip so registry dates one or two days out are labeled, not stored.
- `2ce6e65` — Promote registry items due tomorrow at 16:00 so afternoon planning fills Tomorrow without opening the app.
- `0c32871` — Catch up the 16:00 promote on load so a missed cron cannot leave tomorrow's list empty.
- `4d48f63` — Record the Phase 10 planned-promote handoff so a cold session can verify the slice.
- `1c1adc4` — Record the Phase 10 handoff commit hash so a cold session can verify the work.
- `fb66a8c` — Note the Phase 10 hash-record commit so the handoff lists every commit on the branch.

## Files touched

- `lib/logical-clock.ts`, `lib/logical-clock.test.ts` — `isPromoteDue`: Kolkata hour `>= 16` or `< 4` (logical T after midnight still counts)
- `lib/tasks/planned-date.ts`, `lib/tasks/planned-date.test.ts` — parse civil date; §14.3 destination table; registry-only create placement
- `lib/tasks/create-task-input.ts`, `lib/tasks/create-task-input.test.ts` — optional `plannedDate` on registry; Today/Tomorrow ignore it
- `lib/actions/create-task.ts` — insert at §14.3 destination, append `sortOrder`, occupancy if Today, revalidate both lists
- `lib/actions/update-planned-date.ts` — registry incomplete only; same §14.3 helper; kind `DATE_AGAIN` copy, never Failed
- `lib/tasks/queries.ts` — `TaskRowData.plannedDate`
- `components/tasks/add-row.tsx` — registry date input on the extra line with notes; caption Wolf; `motion-none`
- `components/tasks/task-row.tsx` — inline date on registry meta; derived `UPCOMING` chip (not a button)
- `components/tasks/task-list.tsx`, `sortable-task-list.tsx` — `todayIso` from the server clock; planned-date edit optimistic remove when it leaves Registry
- `app/(app)/today/page.tsx`, `tomorrow/page.tsx`, `registry/page.tsx` — pass `todayIso={logicalDate()}`
- `app/globals.css` — caption Wolf date fields; Iguana upcoming wash; Macaw/Snow `UPCOMING` pill; overdue wash still wins
- `lib/upcoming.ts`, `lib/upcoming.test.ts` — upcoming iff registry and `D` in `{T+1, T+2}`; Wed/Thu/Fri example
- `lib/jobs/promote-plan.ts`, `lib/jobs/promote.test.ts`, `lib/jobs/promote.ts` — `promote-16` claim; registry `D === T+1` appends Tomorrow; keep overdue; no occupancy
- `lib/jobs/catch-up-plan.ts`, `lib/jobs/catch-up.ts`, `lib/jobs/catch-up.test.ts` — rollover bootstrap no longer returns early; `shouldRunPromote` then `runPromote(T)`
- `app/api/cron/promote/route.ts` — GET/POST; `CRON_SECRET`; then `catchUp`; not behind the session gate
- `vercel.json` — keep `30 22 * * *` rollover; add `30 10 * * *` → `/api/cron/promote`
- `docs/handoffs/phase-10-planned-promote.md` — this file

## What works

- Registry add-row: optional planned date (caption Wolf) appears with notes when the title is non-empty. Enter commits, no enter animation. Today/Tomorrow add-rows stay title+notes.
- §14.3 on create/update, immediately: unset → Registry; `D === T` or past → Today + occupancy; `D === T+1` before 16:00 of that logical T → Registry (upcoming); after 16:00 (including 00:00–03:59 while T has not cut) → Tomorrow; `D === T+2` → Registry upcoming; 3+ days → Registry, no chip.
- Upcoming is derived (`lib/upcoming.ts`), not a column. Chip: Macaw fill, Snow `UPCOMING`, 12px/800 uppercase. Iguana wash. If overdue and upcoming: Walking Fish wash, both chips. Complete stays the only Feather primary. Keyboard date change has zero motion.
- `runPromote(T)` claims `job_runs (promote-16, T)`, moves registry `D === T+1` onto Tomorrow (append per category), keeps overdue/notes/category/plannedDate. Unique row is the lock. Failure deletes the claim.
- Catch-up on `(app)` layout and both cron routes: missed rollovers first; if `isPromoteDue`, promote current T. No `rollover-04` row still bootstraps T without mutating lists, then falls through to promote. Do not loop promote from epoch.
- Cron GET/POST require `Authorization: Bearer $CRON_SECRET`. Tests prove missing secret is rejected. `/api/cron/promote` is dynamic (`ƒ`).
- Header streak pill still `0`. Occupancy still write-only (no UI).
- `npm test` (111), `npm run lint`, `npm run build` pass.
- `.env.local` was not committed.

## What is not in this phase

- `lib/streak.ts` / header tick (Phase 11) — pill stays `0`
- Stats (Phase 12)
- Deploy / push (Phase 13)
- Closing P2-1
- Reimplementing the 04:00 sweep (already in rollover)
- Extra chips. Copy never says Failed.
- Live local hit of `/api/cron/promote` — `.env.local` has no `CRON_SECRET` yet. Unit tests cover 401. Do not invent or commit a secret.
- No Clerk, Auth0, or RaftLabs
- Title/notes inline edit (planned date only)

## How to verify

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

1. Sign in with the allowlisted Google account.
2. Registry: type a title, set planned date to today, Enter. Row lands on Today (not Registry). Occupancy written for T.
3. Registry: planned date tomorrow, before 16:00 IST. Stays on Registry with Iguana wash and `UPCOMING`. After 16:00 (or 01:00 next calendar while T has not cut), same date on create goes to Tomorrow; cron/catch-up moves existing `D === T+1` the same way.
4. Registry: date two days out → `UPCOMING`. Three or more days → no chip. Past date → Today.
5. Edit the date on a registry row (native date input, caption Wolf). §14.3 applies immediately. Keyboard path has no extra choreography.
6. `npm test` covers the §14.3 table, Wed/Thu/Fri example (D = Friday 2026-08-21), promote append order, catch-up `shouldRunPromote`, and cron 401 without a secret. Do not wait for 16:00.
7. `/stats` is still the placeholder. Streak pill is still `0`.
8. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 10 blocker).
- Owner should put `CRON_SECRET` in gitignored `.env.local` (and Vercel env in Phase 13) before a live cron GET. Ask before inventing a value.
- `isPromoteDue` treats Kolkata hour `< 4` as “16:00 of this logical T has passed” so Friday 01:00 still promotes Thursday’s `D === T+1` instead of waiting for the 04:00 sweep.
- Do not push. Leave `main` alone. Phase 13 only.
- Merge `feat/10-planned-promote` into `development` only when the owner agrees (no force).
