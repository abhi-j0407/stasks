# Product

## Register

product

## Users

Abhishek Jain only. He uses stasks on iPhone in bed around 11pm (warm indoor light, one-handed, planning tomorrow) and on a Mac during the day (capture extras, park work in the registry, check the streak). The job is not “manage a database of todos.” It is: commit a honest list for tomorrow, keep a durable pile of later work, and stay motivated to complete at least one thing a day.

## Product Purpose

stasks is a personal task tracker with three live lists (Today, Tomorrow, Registry), Personal/Work as visual subsets, overdue as a kind reminder, planned dates that promote themselves, a streak, and a small stats surface including a GitHub-style heatmap. Success is nightly use without dread: planning feels like tapping arcade keys, misses stay visible without shame, and the streak makes showing up feel like a game. Behavior is defined in `docs/PRD.md`. This file is who/why/personality. Visual rules live in `docs/DESIGN.md`.

## Brand Personality

Duolingo-shaped, not Duolingo. Three words: **playful, tactile, kind**.

Voice is short, encouraging, slightly cheeky, never academic and never scolding. CTAs are energetic (`Done`, `Move`, `Keep going`). Completions are celebrated. Overdue is a nudge (`Missed`), not a verdict (`Failed`). Inspired by Duolingo’s public brand: inspiring, can-do, curious, quirky ([design.duolingo.com/writing](https://design.duolingo.com/writing)). Explicitly reject Duolingo’s guilt-trip notification culture. stasks has no sad mascot and no notifications in v1. Motivation comes from visible progress and a satisfying press, not from anxiety.

## Anti-references

- Linear / Notion / Todoist gray SaaS: flat hairlines, tiny type, “serious productivity.”
- Apple Reminders / stock iOS lists: system-chrome, no game feel.
- A Duolingo clone: Duo the owl, the Duolingo logotype, Feather Bold, unlicensed DIN Next Rounded, guilt copy, hearts/lives.
- Generic AI-slop UI: glassmorphism, gradient text, hero-metric cards, indigo-on-white dashboards, sidebar color stripes.
- Dark-mode purple crypto / neon streaks.
- Dense kanban or project-management chrome.

## Design Principles

1. **Fun is functional.** The 3D key-press, the streak flame, the complete celebration exist to make the nightly ritual something you want to open. Delight is retention, not decoration. (Duolingo’s own thesis, applied to chores and work instead of lessons.)
2. **One obvious next move.** Each screen has a primary action: add, complete, or plan. No competing green buttons.
3. **Celebrate completions. Be kind to misses.** Completing a task is a “correct answer.” Overdue is a reminder with a grace day, matching the PRD, not a heart lost.
4. **Green means go.** Saturated green is for primary action, completion, and streak heat. It does not decorate idle chrome.
5. **Tactile over flat.** Controls feel like physical keys (hard color lip, press travel). Cards use 2px outlines, not blurry drop shadows.
6. **Habit through consistency.** Same bottom nav, same task row, same complete motion, every day. Milestone celebrations (7 / 30 / 100 streak) are rare on purpose. Duolingo’s streak team found that gating big animation to landmarks keeps it powerful ([blog.duolingo.com, 2022](https://blog.duolingo.com/streak-milestone-design-animation/)).

## Accessibility & Inclusion

- Target WCAG 2.1 AA for body text (Eel on Snow/Polar). Feather Green as a fill with Snow labels is brand-faithful and known to fail AA for small text (~2.2:1). v1 keeps the Duolingo button look and restricts Snow-on-green to 15px/800 labels on large controls (≥50px). Body copy, overdue copy, and notes never sit on Feather Green.
- Do not use color alone: overdue and upcoming are labeled chips, not only hue.
- `prefers-reduced-motion: reduce` is mandatory: no bounce, no confetti, no key-travel; opacity/color only.
- Hit targets ≥44px, primary buttons ≥50px tall (Duolingo product practice).
- Single user, English UI, no i18n in v1.
