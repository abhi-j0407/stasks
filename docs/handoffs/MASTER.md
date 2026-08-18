# Orchestrator status — stasks v1

**Current phase:** 1 — Scaffold  
**Status:** Phase 1 not started (implementor prompt issued; waiting on implementor session)  
**Next phase:** 1  
**Implementor prompt issued:** yes

## Git

- **Current branch:** `main` (no commits when the master plan was written)
- **`development`:** does not exist yet (Phase 1 creates it from `main`)
- **Active feat branch:** none
- **Last merge:** none
- **Remote:** none (personal GitHub in Phase 13)

## Blockers

- None for Phase 1 (local scaffold).
- Later: personal Neon URL (Phase 3), Google OAuth client + allowlist email (Phase 2), Vercel Hobby + GitHub remote (Phase 13). Values stay in env, not in git.

## Phases

- [ ] Phase 1: Scaffold — next
- [ ] Phase 2: Google allowlist auth
- [ ] Phase 3: Schema and logical clock
- [ ] Phase 4: Lists
- [ ] Phase 5: Capture
- [ ] Phase 6: Reorder
- [ ] Phase 7: Moves
- [ ] Phase 8: Complete, undo, delete
- [ ] Phase 9: Overdue and 04:00 rollover
- [ ] Phase 10: Planned date, upcoming, 16:00 promote
- [ ] Phase 11: Streak
- [ ] Phase 12: Stats
- [ ] Phase 13: Deploy

## Notes for the orchestrator

- Source of truth: `docs/plans/MASTER.md`. After each implementor handoff is pasted, update this file and the Status checkboxes in `docs/plans/MASTER.md`.
- If a handoff reports failure, do not skip that phase. Re-issue an implementor prompt for the same phase.
- Write only `docs/plans/MASTER.md` and `docs/handoffs/*.md`. Never application code.
- Personal GitHub / Vercel / Neon only. Never RaftLabs.
