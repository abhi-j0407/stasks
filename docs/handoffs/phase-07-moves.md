# Phase 7 handoff: Moves

**Objective:** Explicit Move to Today / Tomorrow / Registry from the row overflow. Not drag-across-lists. Destination append. Occupancy insert when the destination is Today. Overdue, notes, category, and planned date stay as-is.

**Branch:** `feat/07-moves` (fast-forwarded into `development` at `741be65`; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `bb91b67` — Add a session-scoped move action so location can change without trusting the client for userId.
- `dfb702d` — Wire row overflow Move actions so the six user-move pairs are reachable without drag-across-lists.
- `fea2443` — Record the Phase 7 moves handoff so a cold session can verify the slice.
- `741be65` — Record the Phase 7 handoff commit hash so a cold session can verify the work.

## Files touched

- `lib/tasks/move-task.ts`, `lib/tasks/move-task.test.ts` — parse `taskId` / `fromLocation` / `toLocation`; reject no-op and invalid fields; `destinationsFor` omits the current list (Tomorrow first when it is a destination); `moveButtonVariant` is secondary only for Tomorrow
- `lib/actions/move-task.ts` — `'use server'`; `requireUserId()` inside the action; load incomplete row for that user + from-location; `UPDATE` only `location`, `sort_order`, `updated_at`; append `sortOrder` in the destination (`location`, `category`) via `nextSortOrder`; `recordTodayOccupancy` when destination is Today; `revalidatePath` source and destination; no occupancy delete; no source reindex
- `components/tasks/task-row-moves.tsx` — client overflow: 44px ⋯ trigger; inline panel with LipButtons only (Move this phase)
- `components/tasks/task-row.tsx` — incomplete sortable rows render overflow; completed-today and the drag overlay do not
- `components/tasks/sortable-task-list.tsx` — optimistic remove on move; Fire Ant error copy; overflow is not the dnd-kit handle
- `app/globals.css` — overflow hit target; panel wrap under the row; open uses opacity + `translateY(8px)` from `scale(0.96)` at `--motion-state`; `prefers-reduced-motion` drops transform

Catch-up in `app/(app)/layout.tsx` is unchanged (still returns `logicalDate` only). Stats still uses `placeholder-screen.tsx`. Complete control stays visual-only. Reorder still cannot change `location`.

## What works

- Signed-in `/today`, `/tomorrow`, `/registry`: overflow on the right of an incomplete row. Open it to Move. The current location is omitted.
- All six user-move pairs:
  - Today → Tomorrow (secondary) / Registry (ghost)
  - Tomorrow → Today (ghost) / Registry (ghost)
  - Registry → Tomorrow (secondary) / Today (ghost)
- On move: `location` updates; `sortOrder` appends in the destination category; `overdue`, `notes`, `category`, and `plannedDate` are not written. The task is not completed.
- Registry → Today or Tomorrow keeps overdue if it was on (no chip UI yet; check the row in Neon or later Phase 9).
- Destination Today inserts `today_occupancy` for `T = logicalDate(now)` (`onConflictDoNothing`). Leaving Today does not remove occupancy.
- `userId` comes from the session only. Server rejects a task that is not incomplete on `fromLocation`.
- Writes use `withNeonRetry`. Persist errors: `Couldn't move just now. Try again.` Never `Failed`.
- Move buttons use existing LipButton press (Macaw/Whale secondary, Snow/Swan ghost). Not Feather.
- Drag handle still reorders within a list only. No drag-across-lists.
- Add-row Enter still saves. Complete still does not persist.
- `npm test` (34), `npm run lint`, `npm run build` pass. List routes stay dynamic (`ƒ`).
- `.env.local` was not committed.

## What is not in this phase

- Drag-across-lists (reorder stays within a list)
- Complete / undo / delete (Phase 8)
- Overdue chip / clear overdue (Phase 9)
- Planned-date field (Phase 10)
- Rollover / promote / `job_runs` (Phases 9–10)
- Streak (Phase 11), Stats (Phase 12), cron / deploy (Phase 13)
- Notes expand, clear overdue, and delete in the overflow (later phases)
- P2-1 (browser allowlist/denied) still open. Not closed.
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
2. If Neon has been idle ~5 minutes, the first write can take a couple of seconds while the compute wakes. Do **not** require `npm run db:seed`; existing rows or add-row are enough.
3. On `/today`, open overflow on a row. You should see **Move to Tomorrow** (Macaw) and **Move to Registry** (ghost), not Move to Today. Move to Tomorrow. The row leaves Today. Open `/tomorrow`: it is last in that category. Reload. It stays.
4. On `/tomorrow`, overflow shows Move to Today and Move to Registry (both ghost). Move to Today. Occupancy should gain a row for that task and today’s logical date (Neon `today_occupancy`; UI will not show it).
5. On `/registry`, overflow shows Move to Tomorrow then Move to Today. Move both directions on two rows. Category stays Personal or Work. Notes stay.
6. If a registry row is overdue in the DB, moving it to Today or Tomorrow must leave `overdue` true (Phase 9 chip is not wired).
7. Drag handle still rearranges within the same list and can still change Personal ↔ Work. You cannot drag a Today row onto Tomorrow.
8. Complete still does not persist. Add-row Enter still works. `/stats` is still the placeholder.
9. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 7 blocker).
- Occupancy is still write-only; there is no UI to inspect it.
- Do not push. Leave `main` alone. Phase 13 only.
- `feat/07-moves` is fast-forwarded into `development` at `741be65`.
