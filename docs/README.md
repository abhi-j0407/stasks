# stasks docs

Source of truth for product, design, plans, and agent handoffs. All human and agent documentation lives under `docs/`. Do not put PRD, product, design, plans, or handoffs at the repo root.

## Files

| Path | Role |
|---|---|
| [PRD.md](PRD.md) | Frozen v1 behavior. Do not change look-and-feel rules here. |
| [PRODUCT.md](PRODUCT.md) | Who, why, personality, anti-references, principles. |
| [DESIGN.md](DESIGN.md) | Visual system, tokens, components, motion. |
| [plans/MASTER.md](plans/MASTER.md) | Functionality phases for the whole v1 build. Written by the master-plan session. |
| [handoffs/MASTER.md](handoffs/MASTER.md) | Orchestrator status: which phase is next, blockers, branch names. |
| `plans/phase-NN-slug.md` | Optional detailed plan for one functionality phase (written by the implementor session in plan mode, if saved). |
| `handoffs/phase-NN-slug.md` | Implementor handoff for that functionality phase. |

Token sidecar for the design panel stays at repo root: `.impeccable/design.json`. That is not a product doc.

## Agent roles

Abhishek is the owner. Agents do not mix roles in one session.

1. **Master-plan session** (once): reads PRD, PRODUCT, DESIGN, this file. Writes `plans/MASTER.md` and empty `handoffs/MASTER.md`. Prints an orchestrator prompt in chat. Does not write application code.
2. **Orchestrator session** (long-lived): reads the docs above. Never implements. Prints one implementor prompt per phase. After the owner pastes a phase handoff back, updates `handoffs/MASTER.md` and checkboxes in `plans/MASTER.md`, then prints the next implementor prompt.
3. **Implementor session** (one per master-plan phase): starts in **plan mode**, writes a plan for that phase only, waits for the owner to click Build, then implements. May split implementation into sub-steps with one commit each. Updates `handoffs/phase-NN-slug.md`. Ends by printing a copy-paste **orchestrator handoff prompt** in chat. Does not start the next master-plan phase.

## Git

- `main`: stable. Do not force-push. Do not merge to `main` except in a release/deploy phase the master plan names.
- `development`: integration branch, created from `main` if it does not exist.
- Feature branches: `feat/NN-slug` created from `development`. One master-plan phase per branch.
- Commits: one commit per implementation sub-step on that branch. Message says why. Stage specific paths. Never `git add -A`. Never `--no-verify`. Never amend unless the owner asks. Never push unless the phase prompt says to (deploy).
- When a phase is done and the owner agrees: merge `feat/NN-slug` into `development` (no force). Leave `main` alone until release.

The owner pre-authorizes commits inside implementor sessions that follow this contract. Orchestrator and master-plan sessions do not commit application code. They may write files under `docs/` only.

## Handoff files

Write for a cold session. Do not dump chat. Point at paths.

`handoffs/MASTER.md` must contain: current phase number and name, status of all phases, current git branch, last merge, blockers, next implementor prompt already issued or not.

`handoffs/phase-NN-slug.md` must contain: objective, branch name, commits (hash + message), files touched, what works, what is not in this phase, how to verify, open questions.

## Prompts

Every prompt an agent expects the owner to paste elsewhere MUST appear in chat inside a single fenced `text` block, copy-pasteable, with no surrounding commentary inside the fence. Title the block in the sentence above it (for example: Orchestrator prompt, Implementor prompt for phase 3, Orchestrator handoff from phase 3).
