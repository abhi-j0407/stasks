# Phase 8 handoff: Complete, undo, delete

**Objective:** Complete from Today / Tomorrow / Registry; appear in completed-today grouped Personal/Work; undo until 04:00 restoring overdue; delete with a kind Snow confirm and a 5s restore. Occupancy unchanged. No streak tick.

**Branch:** `feat/08-complete` (from `development` at `011241f`; `main` remains `5a83247`, frozen specs only). Not merged. Not pushed.

## Commits

- `c7bed5b` — Add complete and delete rules so undo can close at 04:00 without waiting overnight.
- `c65cd67` — Add session-scoped complete, undo, and delete actions so list writes never trust the client for userId.
- `73fadb9` — Wire complete and undo so a pointer press can ease the row away while keyboard stays instant.
- `89f7b87` — Add kind delete confirm and a 5s restore so mistakes never write Failed or streak events.
- `efc8059` — Record the Phase 8 complete handoff so a cold session can verify the slice.

## Files touched

- `lib/tasks/complete-task.ts`, `lib/tasks/complete-task.test.ts` — parse ids; `canUndoCompletion(completedAt, now)` using `logicalDate`; `Nice.` / undo-closed copy; mocked 04:00 IST cases
- `lib/tasks/delete-task.ts`, `lib/tasks/delete-task.test.ts` — parse delete/restore snapshot; `shouldDeleteCompletionEvent` (incomplete: no; undoable completed: yes; after T+1: keep event)
- `lib/actions/complete-task.ts` — `'use server'`; `requireUserId()`; `completeTask` sets `completedAt`, snapshots `overdueAtComplete`, inserts `completion_events` with the same `now`; `undoComplete` if window open: clear complete, restore overdue, delete today’s event; `withNeonRetry`; revalidate source list and `/today`; no occupancy
- `lib/actions/delete-task.ts` — `deleteTask` returns a serializable snapshot; undoable completed deletes today’s event then the row; after-window keeps the event; `restoreDeletedTask` stamps `userId` from the session
- `components/feedback/toast-store.ts`, `components/feedback/toaster.tsx` — module toast; complete = Sea Sponge / Tree Frog; delete = Walking Fish / Fire Ant; pause timer while the tab is hidden
- `components/feedback/confirm-sheet.tsx` — small Snow sheet, 16px radius, Keep (ghost, default) / Delete (Cardinal)
- `components/tasks/task-row.tsx` — complete control enabled; pointer lip press 150ms; keyboard (`click.detail === 0`) has no extra choreography
- `components/tasks/task-row-moves.tsx` — overflow is Actions; incomplete = Move pairs + Delete; completed-today = Delete only
- `components/tasks/sortable-task-list.tsx` — complete from all three lists; 200ms Sea Sponge ease (`opacity` + `translateY(8px)`) then optimistic remove; reduced-motion color/opacity only
- `components/tasks/completed-today-well.tsx` — client island; tap complete = undo; overflow Delete
- `components/tasks/task-list.tsx` — re-exports the well
- `app/(app)/layout.tsx` — `<Toaster />`; catch-up still returns `logicalDate` only
- `app/globals.css` — complete press, completing row, toasts, confirm sheet

## What works

- Signed-in `/today`, `/tomorrow`, `/registry`: left complete control persists. Completing from any list leaves the incomplete list and appears in **Completed today** on `/today`, Personal then Work.
- On complete: `completedAt` set; `overdueAtComplete` snapshot; `location` kept; `completion_events` row with `logicalDate(now)`. Toast `Nice.` Sea Sponge / Tree Frog. No occupancy insert or delete. Header streak pill still `0`.
- Undo (tap complete again on a completed-today row) while `logicalDate(completedAt) === T`: clears `completedAt`, restores `overdue` from the snapshot, deletes today’s event, returns to the previous location.
- After mocking T+1 (`logicalDate` 04:00 IST cut in unit tests), `canUndoCompletion` is false and `shouldDeleteCompletionEvent` is false. The well only loads events for current `T`, so yesterday’s completion is not offered for undo in the UI.
- Delete: overflow → Snow confirm (`Delete this?` / `It won't count as done.` / Keep default / Delete Cardinal). Toast `Removed.` Walking Fish / Fire Ant with **Undo** 5s. Restore re-inserts the same task id (and today’s event if that delete was an undoable completed row). Incomplete delete writes no event. Copy never says Failed.
- One primary green action: complete (Feather). Move stays Macaw/ghost. Delete stays Cardinal.
- Pointer complete: 150ms lip press, then 200ms row ease. Keyboard complete: no extra choreography. `prefers-reduced-motion`: color/opacity only.
- Capture, within-list reorder, and Move still work. Drag overlay complete control stays unwired.
- `userId` from session only. Writes use `withNeonRetry`. Persist errors: `Couldn't complete/undo/delete just now. Try again.`
- `npm test` (51), `npm run lint`, `npm run build` pass. List routes stay dynamic (`ƒ`).
- `.env.local` was not committed.

## What is not in this phase

- Overdue chip / clear overdue / 04:00 rollover / `job_runs` (Phase 9)
- Planned-date field / upcoming / 16:00 promote (Phase 10)
- `lib/streak.ts`, header tick, milestone celebration (Phase 11) — pill stays `0`
- Stats (Phase 12)
- Occupancy insert/delete on complete (unchanged)
- Drag-across-lists
- Cron / deploy / push (Phase 13)
- P2-1 still open. Not closed.
- No Clerk, Auth0, or RaftLabs

## How to verify

```bash
npm install
npm test
npm run lint
npm run build
npm run dev
```

1. Sign in with the allowlisted Google account.
2. If Neon has been idle ~5 minutes, the first write can take a couple of seconds while the compute wakes.
3. On `/today`, complete a row with the mouse/trackpad. Lip press, Sea Sponge ease, toast `Nice.`, row leaves the incomplete list and appears in Completed today (Personal/Work). Reload. It stays.
4. Complete one row from `/tomorrow` and one from `/registry`. Both appear in today’s well. Location on the row is still tomorrow/registry (undo will send them back).
5. In the well, tap the complete control again. The row returns to its previous list. If it was overdue in the DB, `overdue` is restored (no chip yet).
6. Open overflow on an incomplete row: Move pairs plus **Delete** (Cardinal, not Feather). Confirm Keep does nothing. Confirm Delete removes the row, toast `Removed.` with Undo 5s. Tap Undo: the row comes back. Incomplete delete creates no `completion_events` row.
7. Complete a row, then delete it from the well before 04:00. Today’s `completion_events` row is removed (mistake). Toast Undo restores the completed row and the event.
8. Keyboard: focus the complete control, press Enter/Space. The row should leave immediately with no translate choreography.
9. `npm test` covers undo closed at Tuesday 04:00 IST for a Monday-logical / Tuesday-daytime completion. Do not wait overnight.
10. Occupancy: completing a Today row must not insert or delete `today_occupancy`. Completing from Registry must not insert occupancy.
11. Add-row Enter, Move, and within-list drag still work. `/stats` is still the placeholder. Streak pill is still `0`.
12. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 8 blocker).
- Merge `feat/08-complete` into `development` when the owner agrees. No force. Leave `main` alone. Do not push.
- Catch-up still does not run rollover/promote.
- Occupancy is still write-only; no UI to inspect it.
