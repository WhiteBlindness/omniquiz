# OMNIQUIZ cinematic overhaul plan

## Evidence and objective

The current app is functional and visually coherent, but the live audit found five material gaps:

1. The mobile depth ruler extends outside the viewport and multiple controls are below the 44px target floor.
2. Feedback is layered over the prompt, creating a double-exposure collision and weak information hierarchy.
3. Browser-derived storage state is read during client initialization, which can produce server/client hydration drift.
4. Playwright is allowed to reuse port 3000, so it can silently test a different running application.
5. Four ocean PNG layers are loaded immediately (about 3.8 MB before framework code), even when deep layers are not visible.

The brief delegates the direction choice. The approved composition is `.impeccable/mocks/mission-broadcast-approved.png`.

## Direction contract

THESIS: Rarity is a live dive mission, not a quiz card floating over wallpaper. The interface refuses the centered-card arcade default and makes every answer visibly move the expedition.

OWN-WORLD: A cinematic 16-bit ROV broadcast: abyssal navy strata, cyan telemetry, coral action/score, rare gold rewards, hard one-pixel hulls, bitmap type, and in-world depth instrumentation.

STORY: Read the mission, begin descent, answer against a visible clock, understand rarity and depth immediately, then continue or surface with a legible log.

FIRST VIEWPORT: A fixed telemetry spine, wide ocean feed, prompt chamber in the feed, and an anchored answer deck. Mobile collapses telemetry into a top dock and keeps the action deck above the safe area.

FORM: Vertical-scrolling 16-bit dive cabinet, grounded direction 3 of 7, seed key `34a6553c`.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md

## Design tokens

- `--ink-1000: #02070d`; `--ink-950: #04101c`; `--hull-900: #071a2b`; `--hull-800: #0b263b`
- `--ocean-700: #07506d`; `--ocean-500: #0a7692`; `--foam-100: #edfaff`
- `--cyan-400: #46e5ff`; `--coral-400: #ff6b57`; `--gold-400: #ffd166`
- `--drift-300: #9abbd0`; `--muted-500: #57748a`; `--danger-300: #ff9a91`
- `--line-signal: 1px solid rgba(70, 229, 255, 0.44)`
- `--shadow-hull: 6px 7px 0 rgba(0, 5, 12, 0.72)`
- `--safe-gutter: clamp(0.75rem, 2vw, 1.75rem)`
- `--telemetry-width: clamp(14.5rem, 19vw, 18rem)`
- `--panel-max: 35rem`; `--answer-max: 46rem`; `--tap-min: 44px`

## Layout and responsive architecture

- Replace the monolithic stylesheet with imported base, ocean, game, routes, motion, and responsive sheets; keep each focused and under 800 lines.
- Desktop game states use a two-column mission grid: fixed telemetry spine plus fluid scene. Landing may use the same spine as ambient mission context without exposing future answers.
- The prompt and feedback occupy the same named stage slot; never render as visually competing translucent layers.
- The answer deck is anchored inside the scene grid, not to the browser edge, and uses timer / field / primary action / pass action.
- At `<= 760px`, telemetry becomes a two-row top dock, the depth ruler becomes an in-bounds compact rail, the prompt uses full available width, and the answer deck stacks without covering the prompt.
- At short heights, allow vertical scrolling rather than shrinking controls below the target floor. Respect `100dvh`, safe-area insets, 320px width, landscape mobile, and reduced motion.

## State and QoL changes

- Hydrate mute preference, stats, and saved progress after mount from stable defaults; do not render storage-derived values in the hydration boundary.
- Add an explicit `PASS` action during answering. It records a zero-score miss with distinct copy and moves to feedback without waiting out the clock.
- Add a five-second urgency state to the timer that is visible, announced once, and never communicated by motion/color alone.
- Make Enter submit answers and focus the input at the start of every answering phase; make the feedback continue action the next logical focus target.
- Keep error recovery, local restore, share fallback, and replay behavior. Preserve daily/unlimited/category semantics.
- Replace the hard-coded dive label with a stable server-supplied UTC day-of-year label.

## Component rewrites

- `GameExperience`: mission shell and state-slot composition; no duplicated title echo; stable landmark labels.
- `GameHud`: telemetry spine/top dock with depth, score, seven-step progress, category/difficulty, and compact rarity legend.
- `PromptCard`: prompt chamber with a single `h1`, concise mission metadata, and preview/answering variants.
- `DiveForm`: accessible timer, answer field, primary lock action, and pass action with urgency attributes.
- `FeedbackPanel`: replaces the prompt within the stage, uses the awarded tier asset, explains points-to-depth, and moves focus to Continue.
- `GameSummary`: final depth profile, accuracy, best score, replay/share/navigation controls.
- `OceanBackdrop`: conditional deep layers, optimized WebP sources, one submersible/krill marker, in-bounds depth axis, and bounded step motion.
- Packs: preserve playable/coming-soon truth while bringing cards into the same mission-log system.

## Comp fidelity inventory

| Visible ingredient | Implementation medium | Constraint |
| --- | --- | --- |
| Pixel ocean feed and strata | Existing assets converted to WebP + CSS layers | Deep layers mount only as depth requires |
| Telemetry spine / compact mobile dock | Semantic HTML + CSS grid | Becomes top dock, never overlays content |
| Prompt chamber | Semantic section and heading | Existing question copy, no rasterized text |
| Timer ring | CSS conic geometry + text | Accessible live value and non-color urgency label |
| Seven prompt indicators | Semantic progress text + decorative lamps | Current index and count remain readable |
| Answer deck | Semantic form controls | 44px minimum; Enter submit; visible Pass |
| Depth ruler | HTML/CSS meter | Fully in-bounds at 320px |
| Submersible / rarity catch | Existing tier raster and CSS pixel geometry | Decorative unless it conveys awarded tier |
| Broadcast motion | CSS `steps()` and transform/opacity | Disabled under reduced motion |

## Worker ownership

- Luna 1 — layout/responsiveness: `globals.css`, new `src/styles/base.css`, `game.css`, `routes.css`, `responsive.css`, root layout, landing/packs structure. It imports `motion.css` but does not edit it.
- Luna 2 — micro-interactions/environment: `src/styles/motion.css`, `OceanBackdrop.tsx`, `SoundControl.tsx`, asset optimization script/output. It does not edit Luna 1 or Luna 3 files.
- Luna 3 — QoL/state/tests: reducer, game hook, GameExperience, HUD, prompt, form, feedback, summary, unit/E2E tests, and Playwright config. It does not edit CSS or backdrop files.

## Verification gates

- RED then GREEN unit/component coverage for pass, hydration-safe state, urgency, focus, and stable daily label.
- Desktop and mobile E2E for landing, tutorial, answering, pass, feedback, restore, packs, unlimited, 320px overflow, and 44px interactive targets.
- Build, TypeScript, lint, test coverage >= 80%, production smoke test, reduced-motion browser pass, console error scan, asset transfer-size comparison, secret scan, and diff review.
