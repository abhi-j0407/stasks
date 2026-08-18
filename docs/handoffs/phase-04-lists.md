# Phase 4 handoff: Lists

**Objective:** Today / Tomorrow / Registry read from Neon, Personal then Work, completed-today well, empty-state SVGs. Read-only rows. No capture / reorder / moves / complete.

**Branch:** `feat/04-lists` (not merged into `development` yet; `main` remains `5a83247`, frozen specs only). Not pushed.

## Commits

- `27e9c5c` — Add list queries scoped to the signed-in user so screens can read Neon.
- `289aebf` — Add read-only task row, list, and dashed add-row so lists match DESIGN.md without capture.
- `16c17c7` — Add original empty-state SVGs so empty lists stay kind, not No data.
- `3b74a5d` — Load Today, Tomorrow, and Registry from the database so seeded tasks land in the right subset.
- `27db2e2` — Add a guarded dev seed so visual QA has Personal and Work rows without capture.
- `6fd4a06` — Record the Phase 4 lists handoff so a cold session can verify the slice.

## Files touched

- `lib/tasks/queries.ts` — `requireUserId()`, `listIncomplete`, `listCompletedToday`; scoped to session uuid
- `lib/tasks/split-by-category.ts`, `lib/tasks/queries.test.ts` — Personal then Work split
- `components/tasks/task-row.tsx` — Snow / 2px Swan / 12px / lip 2px / 17px Eel; complete + drag visual only
- `components/tasks/add-row.tsx` — dashed Swan chrome, disabled input, no submit
- `components/tasks/task-list.tsx` — Personal then Work sections; completed-today well
- `components/empty-states/today.svg`, `tomorrow.svg`, `registry.svg` — original geometry, pill contact shadow, no owl
- `components/empty-states/empty-state.tsx` — Headline + Wolf line + primary CTA (no save); SVG via `next/image`
- `types/svg.d.ts` — SVG module type
- `app/(app)/today/page.tsx`, `tomorrow/page.tsx`, `registry/page.tsx` — server-load lists
- `components/nav/app-header.tsx` — inert streak pill `0`
- `app/globals.css` — row, sections, add-row, well, empty state, streak pill
- `scripts/seed-lists.ts`, `package.json`, `package-lock.json`, `README.md` — `npm run db:seed` (tsx)
- `docs/handoffs/phase-04-lists.md` — this file

Catch-up in `app/(app)/layout.tsx` is unchanged (still returns `logicalDate` only). Stats still uses `placeholder-screen.tsx`.

## What works

- Signed-in `/today`, `/tomorrow`, `/registry` query Neon for that `userId`. Incomplete: `location` + `completedAt is null`, order `sortOrder`. Personal then Work.
- Today also loads `completion_events.logicalDate === T` into a Sea Sponge completed-today well (hidden when empty). If incomplete is empty but the well has rows, the big empty SVG is skipped.
- True empty list: original SVG + kind Headline + Wolf line + primary CTA. Never “No data.” Never `Failed`.
- Empty sections still show dashed add-row chrome. Add, complete, and drag do not persist.
- Header streak pill shows `0` (no streak logic).
- Nav unchanged: mobile 64px + safe-area; ≥1024px 72px left rail; content max 600px.
- `npm test` (8), `npm run lint`, `npm run build` pass. List routes are dynamic (`ƒ`).
- `npm run db:seed` is guarded: refuses `VERCEL_ENV=production`, needs `DATABASE_URL` + `AUTH_ALLOWLIST_EMAIL`, skips if the user already has tasks, never deletes. First run on this machine waited because no `users` row yet (sign in once, then seed).
- `.env.local` was not committed.

## What is not in this phase

- Capture (Phase 5) — add-row is visual only
- Reorder (Phase 6), moves (Phase 7), complete / undo / delete (Phase 8)
- Rollover / promote / `job_runs` (Phases 9–10)
- Streak logic (Phase 11), Stats (Phase 12), cron / deploy (Phase 13)
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

1. Sign in with the allowlisted Google account. If lists 404-auth or look empty of *your* rows, sign out and in once so `users` / `accounts` exist and `session.user.id` is the DB uuid.
2. `npm run db:seed` (after that sign-in). Then `/today` shows Personal “Water the plants” and Work “Reply to the one email that matters”, plus completed-today “Make the bed”. `/tomorrow` and `/registry` each have Personal then Work.
3. Add-row is visible in every section, including empty ones. Typing / Enter does not save. Complete control and drag handle do not save.
4. With no incomplete tasks on a location, that screen shows SVG + copy + CTA. Copy is never “No data.”
5. Width ≥1024px: 72px left rail. Phone: 64px bottom nav + safe-area.
6. Header shows Wolf Today / Tomorrow captions and a Fox `0` pill.
7. `/stats` is still the placeholder.
8. `git status` does not include `.env.local`.

## Open questions

- Owner must sign in once (if not already) so seed can insert against the Auth.js `users` row.
- Merge `feat/04-lists` into `development` when the owner agrees. Do not push. Leave `main` alone.
- P2-1 remains open (not a Phase 4 blocker).
