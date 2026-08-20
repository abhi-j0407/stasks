# Phase 13 handoff: Deploy

**Objective:** Personal GitHub private repo, Vercel Hobby, Neon production, both crons, `development` merged to `main` with owner agreement.

**Branch:** `feat/13-deploy` merged into `development`, then `development` into `main` (FF, owner agreed, no force). **`main` = production. `development` = preview.**

**Production URL:** [https://stasks-vert.vercel.app](https://stasks-vert.vercel.app) (no trailing slash). No secrets in this file.

**GitHub:** personal private [https://github.com/abhi-j0407/stasks.git](https://github.com/abhi-j0407/stasks.git) (SSH `git@github.com:abhi-j0407/stasks.git`). Not a company org.

**Vercel:** Hobby project `stasks` on personal team `abhij0407's projects` (`prj_8JNruPS83pMuAXlDEbLS2H1PpB5p`), linked to `abhi-j0407/stasks`. Production Branch is `main`. Preview is `development`.

## Commits

- `f2a98bb` — Record orchestrator Phase 12/13 status so a cold session starts deploy from current development.
- `d23b521` — Start the Phase 13 deploy handoff so a cold session can track personal GitHub and Vercel.
- `cc4c15c` — Record the personal GitHub remote and Neon migrate so deploy can push without inventing origin.
- `7616a89` — Record Vercel Hobby project id so the handoff tracks personal deploy without secrets.
- `109859d` — Keep main as production and development as preview so Vercel matches owner intent.
- `854e5cf` — Record the main production merge hash so a cold session can verify Phase 13.
- `3db85bc` — List the Phase 13 merge-hash commit so the handoff matches git log.
- Merge: `feat/13-deploy` → `development` (FF) → `main` (FF). Pushed origin `feat/13-deploy`, `development`, `main`. No force.

## Files touched

- `docs/handoffs/MASTER.md`, `docs/plans/MASTER.md` — orchestrator Phase 12/13 checkbox catch-up
- `docs/handoffs/phase-13-deploy.md` — this file
- Deploy config confirmed, not rewritten: `vercel.json`, `lib/jobs/cron-auth.ts`, `app/api/cron/rollover/route.ts`, `app/api/cron/promote/route.ts`, `proxy.ts`, `.env.example`, `.gitignore`

## What works

- Owner signed in on production with the allowlisted Google account after Vercel Production env + `AUTH_URL=https://stasks-vert.vercel.app` (no trailing slash) + redeploy.
- Logged-out `/signin` is Polar, Headline, one primary “Sign in with Google” lip button, Wolf one-liner. Not the black Internal Server Error page.
- `vercel.json` crons: rollover `30 22 * * *` → `/api/cron/rollover`; promote `30 10 * * *` → `/api/cron/promote`. Unauthorized GET of both production cron paths returns **401** `{"ok":false}`.
- `/manifest.webmanifest` and `/icons/apple-touch-icon.png` return **200**.
- `npm run db:migrate` against personal Neon direct URL succeeded (`0000_schema-clock`). Seeds were not run.
- Personal accounts only. No Clerk, Auth0, or company org remotes.

## What is not in this phase

- New product features, Clerk/Auth0, production seeds unless the owner asks
- Closing P2-1 unless the owner actually completes a second Google test user → `/denied`
- Deleting `placeholder-screen.tsx`
- Force-push of `main`
- A Phase 14

## How to verify

1. [https://stasks-vert.vercel.app](https://stasks-vert.vercel.app) — allowlisted Google reaches `/today`.
2. Vercel Production Branch is `main`. Preview comes from `development`.
3. Vercel → Project → Settings → Cron Jobs: both paths/schedules.
4. Unauthorized `GET /api/cron/rollover` and `/api/cron/promote` are 401.
5. PWA: iPhone Safari Share → Add to Home Screen; Mac (Safari/Chrome install). Same Neon data on both.
6. `git remote -v` is `git@github.com:abhi-j0407/stasks.git`. `git status` does not include `.env.local`.

## Open questions

- P2-1 remains open (second GCP test user → `/denied` not recorded as done).
- Owner should still Add to Home Screen on iPhone Safari and Mac if not already done. Manifest and Apple icon are live.
- Hobby crons may fire anywhere in the UTC hour; catch-up on signed-in load still reconciles.
