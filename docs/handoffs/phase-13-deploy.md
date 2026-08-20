# Phase 13 handoff: Deploy

**Objective:** Personal GitHub private repo, Vercel Hobby, Neon production, both crons, `development` merged to `main` with owner agreement.

**Branch:** `feat/13-deploy` from `development` at `afb70e3`. `main` remains `5a83247` (frozen specs) until the owner agrees to merge. Production URL: not live yet.

**GitHub:** personal private `https://github.com/abhi-j0407/stasks.git` (SSH origin `git@github.com:abhi-j0407/stasks.git`). Not a company org. Pushed `development`, `feat/13-deploy`, and `main` (no force).

**Vercel:** Hobby project `stasks` on personal team `abhij0407's projects` (`prj_8JNruPS83pMuAXlDEbLS2H1PpB5p`). Linked to `abhi-j0407/stasks`. Production Branch is still `main` (specs-only) — switch to `development` until the owner agrees to merge the app to `main`. Env names not confirmed on Vercel yet.

## Commits

- `f2a98bb` — Record orchestrator Phase 12/13 status so a cold session starts deploy from current development.
- `d23b521` — Start the Phase 13 deploy handoff so a cold session can track personal GitHub and Vercel.
- `cc4c15c` — Record the personal GitHub remote and Neon migrate so deploy can push without inventing origin.

## Files touched

- `docs/handoffs/MASTER.md`, `docs/plans/MASTER.md` — orchestrator Phase 12/13 checkbox catch-up already on the working tree; committed on this branch only
- `docs/handoffs/phase-13-deploy.md` — this file
- Deploy config confirmed, not rewritten: `vercel.json`, `lib/jobs/cron-auth.ts`, `app/api/cron/rollover/route.ts`, `app/api/cron/promote/route.ts`, `proxy.ts`, `.env.example`, `.gitignore`

## What works

- Local v1 product slices 1–12 are on `development` / this feat branch.
- `vercel.json` already registers both Hobby-safe daily crons: rollover `30 22 * * *` → `/api/cron/rollover`; promote `30 10 * * *` → `/api/cron/promote`.
- Both cron routes require `Authorization: Bearer $CRON_SECRET`. `proxy.ts` excludes `/api`.
- `.env.example` lists empty keys only. `.env.local` is gitignored.
- Seeds refuse `VERCEL_ENV=production`.
- Personal Vercel Hobby team visible to this session is `abhij0407's projects` (no company team selected). No Vercel project named `stasks` yet.
- `npm run db:migrate` against the personal Neon direct URL (no `-pooler`) succeeded; schema `0000_schema-clock` is applied. Seeds were not run.
- Origin is `git@github.com:abhi-j0407/stasks.git`. Pushed `development`, `feat/13-deploy`, and `main`.

## What is not in this phase

- New product features, Clerk/Auth0, production seeds unless the owner asks
- Closing P2-1 unless the owner actually completes allowlist/`/denied`
- Deleting `placeholder-screen.tsx`
- Force-push of `main`
- A Phase 14

## How to verify

1. Personal GitHub private `stasks` exists; `git remote -v` is that origin only.
2. Vercel Hobby production URL loads. Allowlisted Google reaches `/today`.
3. Cron Jobs settings show both paths/schedules. Unauthorized cron GET is 401.
4. `npm run db:migrate` against the personal Neon direct URL is a no-op (or applies only pending SQL). Do not seed.
5. PWA: iPhone Safari Add to Home Screen and Mac. Data persists in Neon across devices.
6. After owner agreement: `development` is merged into `main` (no force). Vercel Production Branch is `main`.
7. `git status` does not include `.env.local`.

## Open questions

- Production URL — after Vercel Hobby import. Vercel Production Branch should be `development` until `main` holds the app.
- Env **names** on Vercel Production: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_URL`, `AUTH_TRUST_HOST`, `AUTH_ALLOWLIST_EMAIL`, `CRON_SECRET`. Values never in git or this file.
- Google OAuth production origin + `{AUTH_URL}/api/auth/callback/google`.
- P2-1 remains open.
- Merge to `main` waits on owner agreement.
- **Vercel:** Hobby project `stasks` on personal team `abhij0407's projects` (`prj_8JNruPS83pMuAXlDEbLS2H1PpB5p`), linked to `abhi-j0407/stasks`. Owner confirmed that team is the right place. Production Branch still `main` until switched to `development`. Env names and production URL not confirmed yet.
