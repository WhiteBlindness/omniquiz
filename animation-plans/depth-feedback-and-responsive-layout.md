# Depth feedback and responsive layout

## Motion contract

- **Component / trigger:** `GameExperience` passes a descent event to `OceanBackdrop` only when the current feedback result is recognized and has positive `depthMetres`. `OceanBackdrop` keeps the HUD, prompt/form, controls, scanlines, and depth ruler outside the moving `.ocean-world`.
- **Timing / easing:** The world travels upward and settles over 420–720ms using `cubic-bezier(0.16, 1, 0.3, 1)`. The streak cue uses the same bounded event window and transform/opacity only.
- **Magnitude mapping:** Clamp earned depth to 100–1000m, mapping it to a 28–104px upward camera shift and a 420–720ms duration. Values outside that range use the nearest bound.
- **Properties:** React writes `--descent-shift` and `--descent-duration`; CSS animates the world wrapper with `transform`, the cue with `transform`/`opacity`, and retains cumulative depth through the existing `--depth-factor` layer state. Feedback exposes `+{depthMetres}m DESCENT` and cumulative depth in the existing status.
- **Reduced motion:** Remove camera travel, streaks, raster transition travel, and looping decorative motion. Preserve a short non-spatial color/opacity confirmation on the positive depth delta.

## Responsive contract

- At `<=700px`, reserve a 44px HUD chrome row for the brand and the 44px global controls, then place telemetry below it. Feed/timecode plates begin below the measured HUD row.
- Landing states use page scrolling when expanded tutorial content exceeds the viewport, reserve the same mobile top chrome, and keep the CTA and launch links in normal flow. Desktop asymmetric two-column layout remains unchanged.

## Verification criteria

- Positive recognized feedback exposes bounded descent data and a moving world; pass, timeout, uncharted, and zero-depth feedback expose no active descent event.
- At 320x568, 390x667, 390x844, and 430x932, controls do not overlap brand/score, no horizontal scroll appears, and the answer form remains reachable. Expanded landing tutorial content can scroll to the CTA and launch links.
- At 1440x900, the asymmetric launch and telemetry spine remain intact. Reduced-motion inspection shows no spatial camera travel while the depth delta still visibly confirms the earned depth.
