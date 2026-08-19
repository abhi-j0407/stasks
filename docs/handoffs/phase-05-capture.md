# Phase 5 handoff: Capture

**Objective:** Always-on add row per Personal/Work section on Today, Tomorrow, and Registry. Enter saves and focuses a new empty row. Notes persist. Keyboard path has zero motion.

**Branch:** `feat/05-capture` from `development` (`50c5625`). `main` remains `5a83247`, frozen specs only. Not pushed.

## Commits

- `da9329f` — Add a session-scoped create-task action so capture can persist without trusting the client for userId.
- `e6a7d54` — Record Today occupancy when capturing onto Today so completion rate later has a denominator.
- `78ed5d1` — Wire the add row so Enter saves and keeps the keyboard on an empty row.

## Files touched

- `lib/tasks/create-task-input.ts`, `lib/tasks/create-task-input.test.ts` — parse/trim title and notes; `nextSortOrder`; occupancy gate (today only)
- `lib/actions/create-task.ts` — `'use server'`; `requireUserId()` inside the action; insert with `sortOrder` max+1, `overdue=false`, `plannedDate` null, `completedAt` null; `revalidatePath` for that list
- `lib/occupancy.ts` — `recordTodayOccupancy` with Neon retry and `onConflictDoNothing`
- `components/tasks/add-row.tsx` — client form; Hare placeholders; notes second line when title is non-empty; Enter submits; no extra CTA
- `components/tasks/task-list.tsx` — `location` prop; mapped rows in a stable `.task-section__items` wrapper so add-row does not remount; completed-today well still has no add-row
- `app/(app)/today/page.tsx`, `tomorrow/page.tsx`, `registry/page.tsx` — pass `location`
- `app/globals.css` — dashed 2px Swan rest; focus 2px solid Macaw + Iguana wash; `motion-none` / `transition: none`; Fire Ant helper on save error
- `docs/handoffs/phase-05-capture.md` — this file

Catch-up in `app/(app)/layout.tsx` is unchanged (still returns `logicalDate` only). Stats still uses `placeholder-screen.tsx`. Complete control and drag handle stay visual-only.

## What works

- Signed-in `/today`, `/tomorrow`, `/registry` each have working Personal and Work add rows. Category = section. Location = screen.
- Title required (whitespace-only does not insert). Optional notes persist as the second line on the saved row.
- Enter commits, clears the add row, and focuses the empty title input. No planned-date field. No recurrence, tags, or priorities.
- Adding to Today inserts `today_occupancy` for `T = logicalDate(now)`. Tomorrow and Registry do not. Occupancy is not removed later.
- `userId` comes from the session only. Location and category from the form are re-validated on the server.
- Inserts and occupancy writes use `withNeonRetry` (Neon Hobby scale-to-zero).
- Save errors keep the typed text and show kind Fire Ant copy (`Couldn't save just now. Hit Enter again.`). Never `Failed`.
- Add-row Enter has zero motion (`animation: none`, `transition: none`). No `@starting-style` on new rows.
- `npm test` (17), `npm run lint`, `npm run build` pass. List routes stay dynamic (`ƒ`).
- Seed guard unchanged. Do not require re-seed; adding new rows is the QA. `.env.local` was not committed.

## What is not in this phase

- Planned-date field (Phase 10)
- Reorder (Phase 6), moves (Phase 7), complete / undo / delete (Phase 8)
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
2. Do **not** require `npm run db:seed` (already ran; adding rows is the test). If Neon has been idle ~5 minutes, the first write can take a couple of seconds while the compute wakes.
3. On `/today`, `/tomorrow`, and `/registry`: type a Personal title, Enter. The row appears in Personal, add-row is empty and focused. Repeat in Work.
4. Type a title until the Notes line appears, add notes, Enter. The saved row shows caption Wolf notes.
5. Enter on an empty title does not insert.
6. Focus the add-row: 2px Macaw border + Iguana wash, no enter animation.
7. Complete control and drag handle still do not persist. No Move/delete. No planned date. `/stats` is still the placeholder.
8. `git status` does not include `.env.local`.

## Open questions

- Occupancy is write-only in this phase; there is no UI to inspect it. Check Neon `today_occupancy` if the Today insert needs a proof.
- P2-1 remains open (not a Phase 5 blocker).
- Do not push. Leave `main` alone.
