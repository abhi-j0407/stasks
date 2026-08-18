# Phase 1 handoff: Scaffold

**Objective:** Running Next.js App Router app on a `development` git line: DESIGN.md tokens as CSS variables, Nunito via `next/font`, PWA shell, lip-button + nav chrome, placeholder screens.

**Branch:** `feat/01-scaffold` (from `development`)

## Commits

- `5a83247` — Start the repo with frozen product and design specs so implementation has a source of truth. (`main` only; docs + `.impeccable/`)
- Scaffold commit pending on this branch.

## Files touched (so far)

- Next.js App Router scaffold at repo root (`app/`, `package.json`, ESLint, Tailwind, TypeScript)
- `.env.example` (empty keys from MASTER.md)
- `.gitignore` (`.env*` with `!.env.example`)
- Root `README.md` (install / dev, personal-accounts note, pointer to `docs/`)

## What works

- `npm install` / `npm run dev` should start the default empty App Router app (tokens, chrome, and PWA not in yet).

## What is not in this phase

Auth.js, Neon/Drizzle, task lists, capture/reorder/moves/complete, cron, deploy, RaftLabs. Tokens, Nunito, lip-button, nav, placeholders, and PWA land in later sub-steps of this phase.

## How to verify

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Open questions

None for this sub-step. Personal GitHub remote, Vercel, Neon, and Google OAuth wait for later phases.
