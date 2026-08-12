---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/unlimited/classic/page.tsx","src/components/game/GameExperience.tsx"]
---

## Scope and mode

Primary daily game route and shared unlimited experience. Mode: Operate.

## Audience, job, and action

Curious players complete a short seven-prompt ritual, understand rarity-to-depth scoring at a glance, and either continue the descent or surface with a useful run log. Primary action: begin and complete a dive. Secondary actions: pass, replay, share, switch mode, and choose a pack.

## Proof and constraints

Use the local question/scoring APIs, saved local progress, existing ocean/tier assets, visible timer, and literal depth movement. Preserve keyboard access, semantic status announcements, reduced motion, 320px support, and honest local-only behavior.

## Chosen direction

Cinematic 16-bit ROV mission broadcast. A desktop telemetry spine frames a wide ocean feed with one prompt stage and anchored answer deck; mobile collapses telemetry into an in-bounds top dock. The prompt and feedback replace one another in the same stage slot. Approved comp: `.impeccable/mocks/mission-broadcast-approved.png`.

## Memorable moment

Locking a rare answer flashes the awarded specimen into the mission feed and moves the depth rail before the Continue control receives focus.

## Comp inventory

Semantic HTML/CSS owns telemetry, prompt, timer, controls, lamps, and ruler. Existing optimized ocean/tier rasters own illustrated depth. CSS `steps()` owns bounded scan/marker motion. No core text or controls are rasterized.

## Unresolved decisions

None; the implementation brief delegates composition choice and full autonomous execution.
