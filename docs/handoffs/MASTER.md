# Orchestrator status — stasks v1

**Current phase:** 13 — Deploy  
**Status:** Phase 12 complete; Phase 13 not started (implementor prompt issued; waiting on implementor session)  
**Next phase:** 13  
**Implementor prompt issued:** yes

## Git

- **Current branch:** `development` at `afb70e3`
- **`development`:** exists; includes Phases 1–12
- **`main`:** `5a83247` — frozen specs only (`docs/` + `.impeccable/`). Merge the app here only in Phase 13, when the owner agrees. No force.
- **Active feat branch:** none yet; Phase 13 uses `feat/13-deploy` from `development` (or deploy from `development` if the owner prefers fewer hops — still record the merge to `main`)
- **Last merge:** `feat/12-stats` (`987309d`) fast-forwarded into `development`; `6989abd` and `afb70e3` are development-only merge notes (feat tip is two commits behind `development`)
- **Remote:** none. Phase 13 is the only phase that may `git push` (`-u` to personal origin). NEVER RaftLabs.

## Blockers

- Owner must create a **personal** GitHub private repo `stasks`, a **personal** Vercel Hobby project, production env vars, production Google OAuth redirect URIs, and a production Neon `DATABASE_URL`. Stop if any of those are missing. Never invent them. Never RaftLabs.
- `CRON_SECRET` is still unset locally. Set it in Vercel env (and optionally gitignored `.env.local`) before a live cron GET. Never commit the value.
- **P2-1** (not a Phase 13 product blocker): local browser allowlist/denied check still open in `docs/PENDING.md`. Production verify still requires allowlisted Google login. Do not close P2-1 unless the owner actually did that check (local or production).

## Phases

- [x] Phase 1: Scaffold — complete (merged into `development`; see `docs/handoffs/phase-01-scaffold.md`)
- [x] Phase 2: Google allowlist auth — complete (merged into `development`; see `docs/handoffs/phase-02-auth.md`). Browser sign-in check is P2-1.
- [x] Phase 3: Schema and logical clock — complete (merged into `development`; see `docs/handoffs/phase-03-schema-clock.md`).
- [x] Phase 4: Lists — complete (merged into `development`; see `docs/handoffs/phase-04-lists.md`).
- [x] Phase 5: Capture — complete (merged into `development`; see `docs/handoffs/phase-05-capture.md`).
- [x] Phase 6: Reorder — complete (merged into `development`; see `docs/handoffs/phase-06-reorder.md`).
- [x] Phase 7: Moves — complete (merged into `development`; see `docs/handoffs/phase-07-moves.md`).
- [x] Phase 8: Complete, undo, delete — complete (merged into `development`; see `docs/handoffs/phase-08-complete.md`).
- [x] Phase 9: Overdue and 04:00 rollover — complete (merged into `development`; see `docs/handoffs/phase-09-overdue-rollover.md`).
- [x] Phase 10: Planned date, upcoming, 16:00 promote — complete (merged into `development`; see `docs/handoffs/phase-10-planned-promote.md`).
- [x] Phase 11: Streak — complete (merged into `development`; see `docs/handoffs/phase-11-streak.md`).
- [x] Phase 12: Stats — complete (merged into `development`; see `docs/handoffs/phase-12-stats.md`). `/stats` is real; header pill unchanged.
- [ ] Phase 13: Deploy — next

## Notes for the orchestrator

- Source of truth: `docs/plans/MASTER.md`. After each implementor handoff is pasted, update this file and the Status checkboxes in `docs/plans/MASTER.md`.
- If a handoff reports failure, do not skip that phase. Re-issue an implementor prompt for the same phase.
- Write only `docs/plans/MASTER.md` and `docs/handoffs/*.md`. Never application code.
- Personal GitHub / Vercel / Neon only. Never RaftLabs.
- Owner follow-ups that must not block phases live in `docs/PENDING.md`.
- When Phase 13 succeeds, print close-out (v1 done, personal deploy only, no RaftLabs). Do not print another implementor prompt.
