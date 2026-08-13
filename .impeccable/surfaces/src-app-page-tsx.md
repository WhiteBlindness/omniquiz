---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/unlimited/classic/page.tsx","src/components/game/GameExperience.tsx"]
---

## Scope and mode

Primary daily game route and shared unlimited experience. Mode: Operate.

## Audience, job, and action

Curious players choose either a short seven-prompt Daily ritual or a replayable 15-round Arcade run, understand rarity-to-depth scoring at a glance, and either continue the descent or surface with a useful run log. Primary action: begin and complete a dive. Secondary actions: pass, replay, share, switch mode, and choose a pack.

## Proof and constraints

Use the local question/scoring APIs, saved local progress, existing ocean/tier assets, visible timer, literal depth movement, and saved theme/mute preferences. Preserve keyboard access, semantic status announcements, reduced motion, 320px support, and honest local-only behavior.

## Chosen direction

Cinematic 16-bit ROV mission broadcast. A desktop telemetry spine frames a wide ocean feed with one prompt stage and anchored answer deck; mobile collapses telemetry into an in-bounds top dock. The prompt and feedback replace one another in the same stage slot. The launch console carries a two-option Daily/Arcade mode selector: the selected Daily card reads `7 PROMPTS / 1 RUN`, while Arcade reads `15 ROUNDS / SUDDEN DEATH`; selection updates the briefing and rules before launch. Approved comp: `.impeccable/mocks/mission-broadcast-approved.png`.

## Memorable moment

Locking a rare answer flashes the awarded specimen into the mission feed and moves the depth rail before the Continue control receives focus.

## Comp inventory

Semantic HTML/CSS owns telemetry, prompt, timer, controls, lamps, ruler, mode selector, and summary states. Existing optimized ocean/tier rasters own illustrated depth. CSS `steps()` owns bounded scan/marker motion. No core text or controls are rasterized. The top-right global controls remain paired: Theme swaps the dark/light token set and Audio gates the synthesized 8-bit cues; labels are visible on desktop and icon-only on mobile.

## Run-state contract

Arcade telemetry always names the 15-round run while showing a seven-step sliding HUD window around the current round. Any wrong answer, pass, or timeout exits directly to the coral-rail `GAME OVER` summary with final score/depth, `PLAY AGAIN`, and `TODAY'S DIVE`. Daily continues through all seven prompts; each wrong answer, pass, or timeout removes 50 points, and the final Dive Log adds an estimated score percentile against the 700-point ceiling.

## Unresolved decisions

None; the implementation brief delegates composition choice and full autonomous execution.
