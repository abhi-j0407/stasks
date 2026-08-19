# Phase 6 handoff: Reorder

**Objective:** Drag-reorder within a list. Crossing Personal/Work on the same list changes `category` and `sortOrder`. Order persists after reload. Cannot drag to another location list.

**Branch:** `feat/06-reorder` (fast-forwarded into `development` at `68d1cfd`; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `49e066d` — Add a session-scoped reorder action so list order persists without trusting the client for userId.
- `7e4609a` — Wire the existing drag handle so Personal and Work can rearrange on the same list.
- `e1b10e6` — Match DESIGN.md dragging so pointer reorder feels tactile and keyboard reorder stays still.
- `0f28476` — Fix the reorder drop-target test type so production typecheck can pass.
- `fb7f6ff` — Record the Phase 6 reorder handoff so a cold session can verify the slice.

## Files touched

- `lib/tasks/reorder-tasks.ts`, `lib/tasks/reorder-tasks.test.ts` — parse input; `planReorder` reindexes 0..n-1 per category; `resolveDropTarget` maps a drop to `toCategory`/`toIndex`; patches never include `location`
- `lib/actions/reorder-tasks.ts` — `'use server'`; `requireUserId()` inside the action; loads incomplete rows for that user + location; one `UPDATE … FROM (VALUES …)` via `withNeonRetry`; `revalidatePath` only on success; no occupancy write
- `components/tasks/sortable-task-list.tsx` — client island: `@dnd-kit` pointer + keyboard, Personal and Work as two sortable containers, add-row stays a sibling so it does not remount
- `components/tasks/task-row.tsx` — incomplete handle is a 44px button (`Reorder {title}`); completed well still uses the visual-only handle
- `components/tasks/task-list.tsx` — incomplete lists render `SortableTaskList`; `CompletedTodayWell` unchanged
- `app/globals.css` — empty-section drop target while dragging; handle hit target; `--shadow-lip-4-swan`; pointer overlay scale 1.02 + 4px Swan lip at 200ms ease-in-out; keyboard and `prefers-reduced-motion` skip scale
- `package.json`, `package-lock.json` — `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

Catch-up in `app/(app)/layout.tsx` is unchanged (still returns `logicalDate` only). Stats still uses `placeholder-screen.tsx`. Complete control stays visual-only.

## What works

- Signed-in `/today`, `/tomorrow`, `/registry`: drag handle left of the title rearranges incomplete rows. Order is stored as `sortOrder` 0..n-1 per (`location`, `category`) and survives reload.
- Dragging Personal → Work on the same list sets `category` to `work` (and the reverse). That is still reorder-within-a-list.
- Dropping into an empty subset is allowed (empty items container is a drop target while dragging).
- Keyboard: Space/Enter to pick up, arrows to move (including into the other subset), Space/Enter to drop, Escape to cancel. Zero motion.
- Pointer dragging: overlay scale 1.02, 4px Swan lip, 200ms ease-in-out into that state; drop snaps (`duration: 0`). `prefers-reduced-motion`: no scale; lip may still thicken.
- Server rejects a task that is not incomplete on the requested location, so a client cannot change `location` via this action. No droppables on nav or other routes.
- `userId` comes from the session only. Writes use `withNeonRetry`. No `today_occupancy` insert on reorder.
- Persist errors show kind Fire Ant copy (`Couldn't reorder just now. Try again.`). Never `Failed`.
- Add-row Enter still saves. Complete control still does not persist.
- `npm test` (28), `npm run lint`, `npm run build` pass. List routes stay dynamic (`ƒ`).
- `.env.local` was not committed.

## What is not in this phase

- Move to Today / Tomorrow / Registry (Phase 7). No drag across those lists.
- Complete / undo / delete (Phase 8)
- Planned-date field (Phase 10)
- Rollover / promote / `job_runs` (Phases 9–10)
- Streak (Phase 11), Stats (Phase 12), cron / deploy (Phase 13)
- Overdue / upcoming chips
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
3. On `/today`, `/tomorrow`, and `/registry`: drag within Personal. Reload. Order holds.
4. Drag a Personal row onto Work on the same list. Reload. The row sits under Work. Reverse.
5. Drag into an empty subset. It becomes that category.
6. Keyboard reorder (focus the handle, Space, arrows, Space) is instant. Pointer drag shows 1.02 scale + 4px lip, then snaps. Reduced-motion: no scale.
7. You cannot drop a Today row onto Tomorrow (separate routes). Complete still does not persist. Add-row Enter still works. `/stats` is still the placeholder.
8. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (not a Phase 6 blocker).
- Do not push. Leave `main` alone. Phase 13 only.
