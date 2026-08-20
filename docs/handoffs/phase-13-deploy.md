# Phase 13 handoff: Deploy

**Objective:** Personal GitHub private repo, Vercel Hobby, Neon production, both crons, `development` merged to `main` with owner agreement.

**Branch:** `feat/13-deploy` from `development` at `afb70e3`. Owner agreed: **`main` = production**, **`development` = preview**. Merge the app to `main` (no force). Do not force-push `main`.

**GitHub:** personal private [https://github.com/abhi-j0407/stasks.git](https://github.com/abhi-j0407/stasks.git) (SSH `git@github.com:abhi-j0407/stasks.git`). Not a company org.

**Vercel:** Hobby project `stasks` on personal team `abhij0407's projects` (`prj_8JNruPS83pMuAXlDEbLS2H1PpB5p`), linked to `abhi-j0407/stasks`. **Production Branch stays `main`.** `development` is preview. Production URL: not confirmed in this file until the owner sends it (no secrets).

## Commits

- `f2a98bb` — Record orchestrator Phase 12/13 status so a cold session starts deploy from current development.
- `d23b521` — Start the Phase 13 deploy handoff so a cold session can track personal GitHub and Vercel.
- `cc4c15c` — Record the personal GitHub remote and Neon migrate so deploy can push without inventing origin.

## Files touched

- `docs/handoffs/MASTER.md`, `docs/plans/MASTER.md` — orchestrator Phase 12/13 checkbox catch-up
- `docs/handoffs/phase-13-deploy.md` — this file
- Deploy config confirmed, not rewritten: `vercel.json`, `lib/jobs/cron-auth.ts`, `app/api/cron/rollover/route.ts`, `app/api/cron/promote/route.ts`, `proxy.ts`, `.env.example`, `.gitignore`

## What works

- v1 slices 1–12 are on `development` / `feat/13-deploy`.
- `vercel.json` crons: rollover `30 22 * * *` → `/api/cron/rollover`; promote `30 10 * * *` → `/api/cron/promote`.
- Cron routes require `Authorization: Bearer $CRON_SECRET`. `proxy.ts` excludes `/api`.
- `.env.example` lists empty keys. `.env.local` is gitignored.
- Seeds refuse `VERCEL_ENV=production`. Seeds were not run against Neon.
- `npm run db:migrate` against personal Neon direct URL (no `-pooler`) succeeded (`0000_schema-clock`).
- Origin pushed: `development`, `feat/13-deploy`, `main`.

## What is not in this phase

- New product features, Clerk/Auth0, production seeds unless the owner asks
- Closing P2-1 unless the owner actually completes allowlist/`/denied`
- Deleting `placeholder-screen.tsx`
- Force-push of `main`
- A Phase 14

## How to verify

1. `git remote -v` is `git@github.com:abhi-j0407/stasks.git` only.
2. Vercel Production Branch is `main`. Preview deployments come from `development`.
3. Production URL loads. Allowlisted Google reaches `/today`.
4. Cron Jobs settings show both paths/schedules. Unauthorized cron GET is 401.
5. PWA: iPhone Safari Add to Home Screen and Mac. Data persists in Neon across devices.
6. `git status` does not include `.env.local`.

## Open questions

- Production URL (owner; no secrets in git).
- Vercel Production **and** Preview env **names**: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL` (production origin, no trailing slash), `AUTH_TRUST_HOST` (`true`), `AUTH_ALLOWLIST_EMAIL`, `CRON_SECRET`. Values never in git.
- Google OAuth: keep localhost; add production JS origin and `{AUTH_URL}/api/auth/callback/google`.
- P2-1 remains open.
