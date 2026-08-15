# 002 — Make earned depth feel like a real descent

- **Status**: DONE
- **Commit**: 8197631
- **Severity**: HIGH
- **Category**: Purpose, physicality, and missed opportunity
- **Estimated scope**: 5 files, medium

## Problem

Correct answers are an occasional, high-value event, but the current motion is too small and visually self-cancelling to explain that the camera moved deeper.

```css
/* src/styles/motion.css:49 — current */
@keyframes camera-descent {
  0%, 100% { transform: translate3d(0, 0, 0); }
  42%, 72% { transform: translate3d(0, calc(-1 * var(--descent-shift)), 0); }
}
```

```ts
// src/components/game/OceanBackdrop.tsx:10 — current
const DESCENT_MIN_SHIFT = 28;
const DESCENT_MAX_SHIFT = 104;
const DESCENT_MIN_DURATION = 420;
const DESCENT_MAX_DURATION = 720;
```

The world moves only 28–104px, then returns to its starting position. At the same moment, the feedback panel enters over the center of the scene, so the highest-contrast motion masks the environmental motion. The six short streaks are also too sparse to communicate velocity on a phone.

## Target

- Map 100–1000 earned metres to **120–320px** of environmental travel and **850–1350ms** duration.
- Use one-way spatial continuity: the newly-darkened world starts below the viewport and moves upward into its settled position. It must not dive and bounce back to where it started.
- Use `cubic-bezier(0.77, 0, 0.175, 1)` for the on-screen movement, matching the audit playbook’s strong movement curve.
- Add a full-viewport velocity field and pressure flash using only `transform` and `opacity`.
- Delay positive feedback-panel entry by **180ms** so the environment communicates descent first; keep the panel’s own entry responsive.
- Keep HUD, depth ruler, prompt controls, and global controls spatially fixed.
- Under `prefers-reduced-motion: reduce`, remove camera travel and velocity lines but preserve a **200ms opacity/color pressure confirmation** and the earned-depth delta.

## Repo conventions to follow

- Motion definitions live in `src/styles/motion.css`; selectors and visual layers live in `src/styles/ocean.css`.
- Dynamic values are exposed as CSS custom properties by `OceanBackdrop.tsx`.
- Positive descent events already use a unique `descentEventKey`, so remounting can replay one event exactly once.
- Existing reduced-motion rules preserve non-spatial feedback while disabling travel.

## Steps

1. Update `getDescentMotion` in `src/components/game/OceanBackdrop.tsx` to return the new exact shift/duration range plus a normalized intensity.
2. Add full-screen velocity and pressure layers inside `.ocean-backdrop`, active only for positive earned depth.
3. Replace `camera-descent` with a one-way settle animation and add `descent-velocity` and `descent-pressure` keyframes in `src/styles/motion.css`.
4. Give the moving world sufficient overscan in `src/styles/ocean.css`; keep the ruler and scanlines outside it.
5. Delay `.feedback-panel.has-depth-delta` by 180ms and preserve immediate accessibility announcement semantics.
6. Update component and browser tests to prove magnitude scaling, fixed chrome, actual mid-animation displacement, and reduced-motion behavior.

## Boundaries

- Do NOT add an animation dependency.
- Do NOT move the HUD, ruler, prompt controls, or global controls.
- Do NOT trigger descent for pass, timeout, unrecognized, or zero-depth results.
- Do NOT change score or depth calculations.

## Verification

- **Mechanical**: `npm.cmd test`, `npm.cmd run lint`, `npm.cmd exec tsc -- --noEmit`, and `npm.cmd run build` all pass.
- **Feel check**: at 390×844, submit a recognized 100m, 600m, and 1000m result. Confirm larger depth produces visibly farther and longer travel; the world moves upward and settles once; the HUD never moves; velocity lines cross most of the scene; feedback appears after motion begins.
- In browser animation inspection, sample `.ocean-world` during the event and confirm a non-identity transform before it settles to identity.
- With reduced motion enabled, confirm `.ocean-world` has no spatial animation while pressure/depth confirmation remains visible.
- **Done when**: a first-time mobile user can identify the screen as descending without reading the numeric depth delta.
