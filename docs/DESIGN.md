---
name: stasks
description: A Duolingo-language personal task tracker. Tactile keys, kind streaks, nightly ritual.
colors:
  feather: "#58CC02"
  mask: "#89E219"
  tree-frog: "#58A700"
  macaw: "#1CB0F6"
  whale: "#1899D6"
  cardinal: "#FF4B4B"
  fire-ant: "#EA2B2B"
  bee: "#FFC800"
  fox: "#FF9600"
  beetle: "#CE82FF"
  eel: "#4B4B4B"
  wolf: "#777777"
  hare: "#AFAFAF"
  swan: "#E5E5E5"
  polar: "#F7F7F7"
  snow: "#FFFFFF"
  sea-sponge: "#D7FFB8"
  turtle: "#A5ED6E"
  walking-fish: "#FFDFE0"
  iguana: "#DDF4FF"
  canary: "#FFF5D3"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Nunito, ui-rounded, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "0.05em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "9999px"
spacing:
  4: "4px"
  8: "8px"
  12: "12px"
  16: "16px"
  20: "20px"
  24: "24px"
  32: "32px"
  40: "40px"
  48: "48px"
components:
  button-primary:
    backgroundColor: "{colors.feather}"
    textColor: "{colors.snow}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "50px"
  button-primary-active:
    backgroundColor: "{colors.feather}"
    textColor: "{colors.snow}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "46px"
  button-secondary:
    backgroundColor: "{colors.macaw}"
    textColor: "{colors.snow}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "50px"
  button-destructive:
    backgroundColor: "{colors.cardinal}"
    textColor: "{colors.snow}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "50px"
  button-ghost:
    backgroundColor: "{colors.snow}"
    textColor: "{colors.macaw}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "50px"
  button-disabled:
    backgroundColor: "{colors.swan}"
    textColor: "{colors.hare}"
    rounded: "{rounded.md}"
    padding: "14px 20px"
    height: "50px"
  task-row:
    backgroundColor: "{colors.snow}"
    textColor: "{colors.eel}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  task-row-overdue:
    backgroundColor: "{colors.walking-fish}"
    textColor: "{colors.eel}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  input-add:
    backgroundColor: "{colors.snow}"
    textColor: "{colors.eel}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chip-overdue:
    backgroundColor: "{colors.cardinal}"
    textColor: "{colors.snow}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  chip-upcoming:
    backgroundColor: "{colors.iguana}"
    textColor: "{colors.whale}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  nav-bar:
    backgroundColor: "{colors.snow}"
    textColor: "{colors.hare}"
    padding: "8px 12px"
    height: "64px"
---

# Design System: stasks

## 1. Overview

**Creative North Star: "The Tactile Ritual"**

stasks should feel like a grown-up arcade for getting through the day. You open it in bed to plan tomorrow, tap chunky keys, watch a streak tick, and close it. It is a product UI (lists, stats, auth), wearing Duolingo’s public visual language: vivid animal-named color, rounded type, hard 3D “lips” instead of blurry shadows, white-dominant surfaces, one obvious action.

This is **inspired by** [Duolingo Brand Guidelines](https://design.duolingo.com/), not a clone. Official sources used: Identity / Color / Typography / Illustration / Writing on design.duolingo.com; the 2022 streak-milestone engineering writeup; third-party reconstructions of the in-app 3D button (oh-my-design, Refero, Medium CSS recreations). What we take: shape language, palette, lip buttons, kind-but-playful voice, streak-as-visible-progress. What we refuse: Duo the owl, the Duolingo logotype, Feather Bold, DIN Next Rounded (both proprietary), guilt copy, hearts/lives, lesson chrome.

**Legal / license (normative).** Feather Bold is bespoke (“no one else can use it,” [typography guidelines](https://design.duolingo.com/identity/typography)). DIN Next Rounded is a commercial Monotype family. Duolingo’s own substitute when those fonts are unavailable is **Nunito** (SIL Open Font License 1.1). We ship Nunito only. Colors as hex are not copyrightable; we use the published palette because this is a personal app asked to build on that system. Characters, wordmark, and custom type are off-limits.

**Scene.** Light UI always in v1. Nighttime in bed on an iPhone is still a lit phone in a dim room; Duolingo itself is a snow-white product at 1am. Dark mode is out of v1.

**Color strategy:** Full palette. Feather Green is the go color. Macaw, Cardinal, Bee/Fox, Beetle each have one job. Neutrals do hierarchy.

**Motion energy:** Dual. High-frequency actions (add-row Enter, drag, nav) follow Emil Kowalski: ≤160ms, strong ease-out, no bounce, keyboard actions have zero motion. Signature press (lip collapse) is 150ms and always on. Completions and streak ticks may overshoot. Milestone days (7, 30, 100) get the only “big” celebration. Duolingo’s own research: gating fireworks to landmarks keeps them powerful.

**Key Characteristics:**
- Feather Green for go / complete / streak heat; never as body text
- 3D key buttons: solid `0 4px 0` lip in a darker sibling color; press = `translateY(4px)` + lip to 0
- 2px Swan outlines on rows and cards; no soft drop shadows on lists
- Nunito 400 / 800 only (400 = DIN role, 800 = Feather Bold role), self-hosted via `next/font`
- Personal = green family, Work = Macaw family, as section color not as tags
- Overdue = Cardinal chip + Walking Fish wash; Upcoming = Macaw chip + Iguana wash
- Heatmap uses the green ramp (Sea Sponge → Tree Frog), GitHub grammar, Duolingo pigment

## 2. Colors

Animal names are Duolingo’s public taxonomy ([identity/color](https://design.duolingo.com/identity/color) and [illustration color](https://design.duolingo.com/illustration)). Hex values below match those pages. Frontmatter is normative.

### Primary
- **Feather Green** (`#58CC02`): Complete, primary CTA, active nav, heatmap peak, Personal section accent. The go color.
- **Tree Frog** (`#58A700`): Lip under Feather Green buttons; pressed/darker green; heatmap max cell; “correct” ink on Sea Sponge.
- **Mask Green** (`#89E219`): Lighter success glints, heatmap mid-high.

### Secondary
- **Macaw** (`#1CB0F6`) / **Whale** (`#1899D6`): Work section accent, upcoming, Move to Tomorrow, secondary CTA, input focus. Whale is the Macaw lip.
- **Cardinal** (`#FF4B4B`) / **Fire Ant** (`#EA2B2B`): Overdue chip, delete, error. Fire Ant is the Cardinal lip. Copy stays kind.

### Tertiary
- **Bee** (`#FFC800`) / **Fox** (`#FF9600`): Streak flame, XP-like counts, heatmap “hot” if we need a second encoding. Not for errors.
- **Beetle** (`#CE82FF`): Rare accent only (e.g. best-streak callout). Do not sprinkle.

### Neutral
- **Snow** (`#FFFFFF`): Card, row, and button-ghost fill.
- **Polar** (`#F7F7F7`): Page canvas, completed-today well, skeletons.
- **Swan** (`#E5E5E5`): 2px borders, ghost lips, progress tracks, disabled fill.
- **Hare** (`#AFAFAF`): Placeholders, inactive nav, disabled labels.
- **Wolf** (`#777777`): Secondary text, dates, notes preview, stats captions.
- **Eel** (`#4B4B4B`): Primary ink. Never `#000000`.

### Feedback washes (illustration palette, used as UI surfaces)
- **Sea Sponge** (`#D7FFB8`): Completed-today strip, correct-style toast.
- **Turtle** (`#A5ED6E`): Heatmap step; success border.
- **Walking Fish** (`#FFDFE0`): Overdue row wash.
- **Iguana** (`#DDF4FF`): Upcoming / selected / Work-tinted selection.
- **Canary** (`#FFF5D3`): Streak header wash.

**The Green-Means-Go Rule.** If a control is not the primary action, not a completion, and not streak heat, it is not Feather Green.

**The Ink Rule.** Body, titles, and notes are Eel or Wolf on Snow/Polar. Feather Green is a fill, never a paragraph color (contrast and hierarchy).

**The Lip Rule.** A filled control’s shadow is a solid offset of its darker sibling (Tree Frog, Whale, Fire Ant), 4px, zero blur. Ghost controls use Swan `0 2px 0`.

## 3. Typography

**Display Font:** Nunito ExtraBold 800 (Feather Bold stand-in)
**Body Font:** Nunito Regular 400 (DIN Next Rounded stand-in)
**Label Font:** Nunito ExtraBold 800, 15px, uppercase, +0.05em tracking (button/nav)

**Character:** Rounded terminals, friendly, not childish. One family, two weights. Duolingo’s public substitute when brand fonts are missing is Nunito ([typography](https://design.duolingo.com/identity/typography)). Do not use Nunito Sans (sharp terminals). Do not add a second family.

**How we load it (implementation, frozen).**
- Source: Google Fonts specimen [Nunito](https://fonts.google.com/specimen/Nunito), OFL 1.1 (Vernon Adams / Jacques Le Bailly / Google).
- Ship via `next/font/google` (`Nunito({ subsets: ['latin'], weight: ['400','800'], display: 'swap', variable: '--font-nunito' })`). Next downloads `.woff2` at **build time** and serves from our origin. The browser never talks to fonts.googleapis.com. That is self-hosting, not a runtime CDN.
- Do not use a `<link href="https://fonts.googleapis.com/...">` tag.
- Do not buy DIN Next Rounded. Do not pirate Feather Bold.
- Fallback stack: `ui-rounded, system-ui, sans-serif`.
- Variable font is allowed later if we need 600; v1 is 400 + 800 only (Duolingo product lives at 400 and 700; 800 reads closer to Feather Bold).

**Scale** (16px root, fixed rem, ratio ~1.2). Product UI, not clamp.

- **Display** (800, 32px / 2rem, lh 1.25, tracking -0.02em): streak number, empty-state headline, stats hero count
- **Headline** (800, 24px / 1.5rem, lh 1.33): screen titles (Today, Tomorrow, Registry, Stats)
- **Title** (800, 20px / 1.25rem, lh 1.4): Personal / Work section headers
- **Subtitle** (800, 17px / 1.0625rem, lh 1.4): completed-today header, modal titles
- **Body large** (400, 17px, lh 1.5): task title on phone
- **Body** (400, 15px / 0.9375rem, lh 1.5): notes, stats body, sign-in copy. Max ~70ch
- **Caption** (400, 13px / 0.8125rem, lh 1.4): planned date, metadata, heatmap weekday labels
- **Label** (800, 15px, uppercase, tracking 0.05em): buttons, chips (`OVERDUE`, `UPCOMING`, `DONE`)
- **Nav label** (800, 11px, uppercase): bottom nav only. Never for reading text

Duolingo Feather Bold: lowercase headlines, never all-caps, never below 30px, tracking -20. We cannot use that face. **stasks headlines stay sentence case in Nunito 800.** Uppercase is reserved for buttons and chips, where DIN/Feather buttons shout.

**The Two-Weight Rule.** No 300, no 500. Emphasis is 800. Reading is 400.

**The Numbers Rule.** Streak, best streak, heatmap totals, completion counts: Display 800, never caption.

## 4. Elevation

Physical, not atmospheric. Depth is a hard offset or a 2px outline. Blurred `box-shadow` on list chrome is forbidden (kills the toy-key feel). Documented by official illustration rules (pill contact shadows, never ovals) and by every serious reconstruction of the in-app button (solid lip, press travel). Medium recreations confirm `box-shadow: 0 4px 0 <darker>` + `translateY(4px)` on `:active` avoids the layout shift of toggling `border-bottom`.

### Shadow Vocabulary
- **Flat:** page Polar, text. No border, no lip.
- **Outline:** `border: 2px solid #E5E5E5` on task rows, cards, add row, heatmap cells at rest.
- **Lip 4:** `box-shadow: 0 4px 0 <sibling>` on primary/secondary/destructive buttons and complete control.
- **Lip 2:** `box-shadow: 0 2px 0 #E5E5E5` on ghost buttons, task rows, answer-tile-like add rows.
- **Modal:** Polar scrim `rgba(75, 75, 75, 0.4)` (Eel, not black) + Snow panel, 16px radius, optional `0 8px 0 rgba(75, 75, 75, 0.08)` only on dialogs.

Press: `transform: translateY(4px); box-shadow: 0 0 0 transparent` over 150ms `cubic-bezier(0.23, 1, 0.32, 1)`. Release is the same curve. Do not animate `top` or `margin`.

**The Hard-Lip Rule.** If it is pressable, it has a lip in a darker shade of itself. If it is a container, it has a 2px Swan outline. Not both mixed with blur.

## 5. Components

Tactile and obvious. Same vocabulary on Today, Tomorrow, Registry, Stats, and Sign-in.

### Buttons
- **Shape:** 12px radius, min-height 50px, padding 14px 20px, full-width on phone primary, hug-content on dense rows.
- **Primary:** Feather fill, Snow label, Tree Frog lip 4px, uppercase Nunito 800 15px. Complete, Sign in with Google, empty-state CTA.
- **Secondary:** Macaw fill, Snow, Whale lip. Move to Tomorrow.
- **Destructive:** Cardinal fill, Snow, Fire Ant lip. Delete. Never the default on a row.
- **Ghost:** Snow fill, 2px Swan border, Swan lip 2px, Macaw or Eel label. Move to Registry / Move to Today.
- **Disabled:** Swan fill, Hare text, no lip.
- **Hover** (pointer: fine only): 2% darker fill. **Active:** key travel. **Focus-visible:** 3px Macaw ring, 2px offset, never rely on hover.

### Task row (signature)
The unit of the product. Answer-tile grammar: Snow, 2px Swan, 12px radius, 2px Swan lip, 12px 16px padding, 17px/400 Eel title. Left: complete control (24px circle, Swan outline, Feather fill + white check when done). Right: overflow for Move / notes / clear overdue / delete. Drag handle on the left of the title for reorder (within list; dragging across Personal/Work changes category per PRD).

- **Overdue:** Walking Fish wash, Cardinal `OVERDUE` chip (pill, 12px/800 uppercase). Chip is tappable to clear the flag.
- **Upcoming:** Iguana wash, Macaw `UPCOMING` chip. Registry only.
- **Notes:** Caption Wolf, one line, ellipsis; expand inline, no modal as first thought.
- **Planned date:** Caption Wolf, registry add-row and row meta.
- **Dragging:** scale 1.02, lip 4px Swan, 200ms ease-in-out. Drop snaps. Keyboard reorder has no animation.

### Add row
Always-on last row in each category section. Ghost-tile: dashed 2px Swan, Hare placeholder (`Add a personal task`). Focus: 2px Macaw border, Iguana wash. Enter commits and focuses a new empty row. **No enter animation** (typed hundreds of times). Optional notes and planned date as a second line that appears only when the title is non-empty.

### Category sections
Personal and Work are subsets of one list, not tags. Section title: 20px/800. Personal title + 8px Feather bar under the word (full underline, not a left stripe). Work uses Macaw bar. Empty section still shows the add row.

### Chips
Pill, 2px 8px, 12px/800 uppercase. `OVERDUE` Cardinal/Snow. `UPCOMING` Iguana/Whale. Do not invent more chips.

### Cards / Stats surfaces
16px radius, 2px Swan, 20px padding, Snow on Polar. Streak card: Canary wash, Fox flame mark (geometric, not Duo), Display 800 number in Eel. Heatmap: 12–13px cells, 2px gap, 2px radius; empty = Polar; intensity Sea Sponge → Turtle → Mask → Feather → Tree Frog. Week starts Monday (IST). Bars for 7/30: Feather fill, Swan track, 12px height, pill.

### Inputs
12px radius, 2px Swan, 12px 16px, 15px/400. Focus Macaw 2px. Error: Walking Fish fill, Cardinal 2px, Fire Ant helper 13px.

### Navigation
Mobile-first bottom bar: Snow, 2px Swan top border, 64px including safe-area. Four tabs: Today, Tomorrow, Registry, Stats. Active: Feather icon+label. Inactive: Hare. Labels 11px/800 uppercase. At ≥1024px: hide the bottom bar; 72px left rail with the same four items (Snow, 2px Swan right border); content column max 600px centered in the remaining space (Duolingo learning-column width). Streak pill (Fox number, 13px/800) sits in the top header on every list screen.

### Complete control
Circular 24–28px, 2px Swan, lip 2px. On complete: Feather fill, check, 150ms lip press, then the row eases to Completed today (Sea Sponge, 200ms ease-out, opacity + translateY 8px). Undo until 04:00: tap again. Keyboard complete: no extra choreography.

### Toasts / feedback
Complete: Sea Sponge bar, Tree Frog copy (`Nice.`), optional +1 streak tick. Delete: Walking Fish, Fire Ant, Undo 5s. No shame strings.

### Dialogs
Use inline first (notes, date). Confirm delete may be a small 16px Snow sheet. No modal for add.

### Sign-in
Polar canvas, Headline, one primary Google button, Wolf one-liner. Denied allowlist: Eel title, Wolf explanation, no retry spam.

### Empty states
Illustration (see below) + Headline + Wolf line + primary CTA. Examples: Tomorrow empty at night (`Plan tomorrow.`). Registry empty (`Park it for later.`). Never “No data.”

### Illustrations
Original geometry only. Construction from Duolingo’s public illustration rules: **rounded rectangle, circle, rounded triangle**; all corners round; ~15 shapes; pill contact shadow (never oval); pastels not gray; few colors; flat perspective ([illustration](https://design.duolingo.com/illustration)). No owl. No eyebrows-as-logo. SVG in-repo. Optional later: Lottie/Rive for milestone only. v1: static SVG + CSS motion.

### Motion tokens (sidecar is canonical for curves)
- `motion-none` 0ms: add-row Enter, keyboard complete, keyboard nav
- `motion-press` 150ms, `cubic-bezier(0.23, 1, 0.32, 1)`: lip
- `motion-state` 200–250ms, same ease-out: row complete, tabs, toasts
- `motion-celebrate` 400–600ms, `cubic-bezier(0.34, 1.56, 0.64, 1)`: streak increment, first complete of the day
- Milestone only (7/30/100): longer, particle burst, then rest. Regular day 47: number ticks, no fireworks
- `prefers-reduced-motion`: press becomes color flash; celebrate becomes fade; no translate, no overshoot

Do not animate layout properties. Drag may use transforms. List insert uses opacity + translateY(8px) from `scale` not 0 (`scale(0.96)` if needed).

### Breakpoints
- Phone (primary): <768px, 16px horizontal padding, full-width CTAs, bottom nav
- Tablet: 768–1023px, content 600px centered
- Desktop: ≥1024px, 24px padding, 72px left rail, content 600px centered in the remaining space

## 6. Do's and Don'ts

### Do:
- **Do** use Nunito 400/800 self-hosted with `next/font`. Cite OFL in the repo.
- **Do** give every pressable filled control a 4px solid lip in Tree Frog / Whale / Fire Ant and 150ms key travel.
- **Do** outline rows with 2px Swan, not blur.
- **Do** set ink to Eel, secondary to Wolf, canvas to Polar, cards to Snow.
- **Do** use Feather Green only for go: complete, primary CTA, active tab, heatmap heat, Personal accent.
- **Do** mark Work with Macaw and overdue with a labeled Cardinal chip (not color alone).
- **Do** shout on buttons (uppercase 800) and speak in sentence case on headlines.
- **Do** keep add-row and keyboard paths instant.
- **Do** celebrate the first complete of the day and streak milestones 7/30/100. Tick the number on other days.
- **Do** honor `prefers-reduced-motion`.
- **Do** keep one primary green action per screen.

### Don't:
- **Don't** use Duo, the Duolingo wordmark, Feather Bold, or DIN Next Rounded.
- **Don't** load Google Fonts from the CDN at runtime.
- **Don't** use Linear / Notion / Todoist gray SaaS chrome, tiny Inter, or hairline cards.
- **Don't** look like Apple Reminders or stock iOS lists.
- **Don't** use glassmorphism, gradient text, hero-metric templates, identical icon-card grids, or sidebar color stripes (Impeccable bans + PRODUCT anti-references).
- **Don't** ship dark-mode purple / neon “productivity gamification.”
- **Don't** shame. No `Failed`, no sad mascot, no guilt copy. Overdue is `Missed` or `OVERDUE` as a reminder.
- **Don't** put body text on Feather Green. Don't use `#000000`.
- **Don't** use blurred drop shadows where a lip or 2px outline belongs.
- **Don't** mix radii at random. 8 chips, 12 controls, 16 panels, pill for bars/badges.
- **Don't** animate Enter-to-add or other 100+/day actions.
- **Don't** fire the milestone celebration every complete. That is how delight becomes wallpaper.
