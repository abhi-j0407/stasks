# Orchestrator status — stasks v1

**Current phase:** 3 — Schema and logical clock  
**Status:** Phase 2 complete; Phase 3 not started (implementor prompt issued; waiting on implementor session)  
**Next phase:** 3  
**Implementor prompt issued:** yes

## Git

- **Current branch:** `development` at `4be9e49` (before this orchestrator docs commit)
- **`development`:** exists; includes Phase 1 scaffold + Phase 2 auth
- **`main`:** `5a83247` — frozen specs only (`docs/` + `.impeccable/`). Do not merge the app here until Phase 13.
- **Active feat branch:** none yet; Phase 3 uses `feat/03-schema-clock` from `development`
- **Last merge:** `feat/02-auth` (`44f1068`) fast-forwarded into `development`; `4be9e49` is a development-only merge note (1 commit ahead of the feat tip)
- **Remote:** none. Do not push until Phase 13.

## Blockers

- Phase 3 needs a **personal** Neon project and `DATABASE_URL` in `.env.local`. Implementor must stop if missing. Never invent it. Never commit values. Never RaftLabs.
- **P2-1** (not a Phase 3 blocker): local browser allowlist/denied check still open in `docs/PENDING.md`.

## Phases

- [x] Phase 1: Scaffold — complete (merged into `development`; see `docs/handoffs/phase-01-scaffold.md`)
- [x] Phase 2: Google allowlist auth — complete (merged into `development`; see `docs/handoffs/phase-02-auth.md`). JWT session; Drizzle adapter is Phase 3. Browser sign-in check is P2-1.
- [ ] Phase 3: Schema and logical clock — next
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
- Owner follow-ups that must not block phases live in `docs/PENDING.md`.
