---
name: OMNIQUIZ
description: A cinematic 16-bit ROV mission broadcast where uncommon answers drive a visible descent.
colors:
  ink: "#020711"
  abyss: "#050f1d"
  steel: "#0a1a2c"
  panel: "rgba(4, 15, 29, 0.94)"
  line: "rgba(112, 168, 192, 0.27)"
  line-hot: "rgba(91, 226, 239, 0.72)"
  paper: "#edf7f7"
  drift: "#84a5b5"
  muted: "#526e7e"
  cyan: "#5be2ef"
  coral: "#ff667f"
  gold: "#f3cd69"
  green: "#80e3b5"
typography:
  display:
    fontFamily: '"Pixelify Sans Variable", "Pixelify Sans", monospace'
    fontSize: "clamp(3.75rem, 7vw, 7.2rem)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.055em"
  headline:
    fontFamily: '"Pixelify Sans Variable", "Pixelify Sans", monospace'
    fontSize: "clamp(1.35rem, 2.7vw, 2.55rem)"
    fontWeight: 620
    lineHeight: 1.12
    letterSpacing: "-0.025em"
    fontVariation: '"wght" 620'
  title:
    fontFamily: '"Pixelify Sans Variable", "Pixelify Sans", monospace'
    fontSize: "clamp(0.86rem, 1.2vw, 1.12rem)"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.28em"
  body:
    fontFamily: '"Pixelify Sans Variable", "Pixelify Sans", monospace'
    fontSize: "16px"
    fontWeight: 500
    letterSpacing: "0.055em"
    fontVariation: '"wght" 500'
  label:
    fontFamily: '"Pixelify Sans Variable", "Pixelify Sans", monospace'
    fontSize: "0.53rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.16em"
rounded:
  square: "0"
  gauge: "50%"
spacing:
  xs: "0.35rem"
  sm: "0.55rem"
  md: "0.75rem"
  base: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "#6e2638"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.8rem 1rem"
    height: "62px"
  button-primary-hover:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
  button-submit:
    backgroundColor: "#672739"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.65rem"
    height: "56px"
  button-pass:
    backgroundColor: "#0a2132"
    textColor: "{colors.drift}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.65rem"
    height: "56px"
  input-answer:
    backgroundColor: "#061525"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0.85rem"
    height: "56px"
  card-prompt:
    backgroundColor: "rgba(2, 10, 21, 0.94)"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    rounded: "{rounded.square}"
    padding: "clamp(1.1rem, 2.4vw, 1.8rem)"
    width: "620px"
  telemetry-meter:
    backgroundColor: "rgba(4, 18, 32, 0.82)"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.55rem 0.65rem"
    height: "58px"
  timer-gauge:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.headline}"
    rounded: "{rounded.gauge}"
    size: "clamp(70px, 7vw, 92px)"
  navigation-link:
    backgroundColor: "transparent"
    textColor: "{colors.drift}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.55rem"
    height: "44px"
  card-summary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "clamp(1.3rem, 3vw, 2.1rem)"
    width: "520px"
---

# Design System: OMNIQUIZ

## Overview

**Creative North Star: "The Live ROV Mission Broadcast"**

OMNIQUIZ presents a trivia run as a live 16-bit dive operation. A cold, detailed ocean raster owns the world while coral and cyan telemetry, scanlines, a depth ruler, and instrument panels turn every answer into mission data rather than generic quiz chrome.

The experience tells one continuous operational story: launch control hands off to a dominant live prompt feed, feedback slams the score and depth into view, and the run resolves as a compact dive log. The density is cinematic but controlled; the current prompt remains the only dominant reading surface while telemetry stays peripheral and explicit.

**Key Characteristics:**

- Project-owned pixel-ocean and hull rasters, never stock-photo scenery or generic sci-fi framing.
- A desktop vertical telemetry spine beside one dominant live stage; a top instrument dock on mobile.
- One self-hosted variable bitmap family across display, prompts, controls, and metadata.
- Cold navy material with cyan navigation, coral action, gold rarity, and restrained green pack accents.
- Depth-driven environmental change, deliberate score and urgency motion, and a complete reduced-motion fallback.

## Colors

The palette is a near-black ocean instrument field punctuated by three high-clarity mission signals.

### Primary

- **Sonar Cyan** (`cyan`): Navigation, depth, focus-adjacent borders, live-feed plates, current round state, and active progress.

### Secondary

- **Alarm Coral** (`coral`): Primary actions, score, completed rounds, critical timer state, feedback emphasis, and chromatic brand separation.

### Tertiary

- **Recovery Gold** (`gold`): Rarity, question metadata, and scarce reward or pack-state cues.
- **Instrument Green** (`green`): A limited themed-pack accent, not a replacement for the three core mission signals.

### Neutral

- **Blackwater Ink** (`ink`): Page ground, selection contrast, and the darkest alert backing.
- **Abyss Navy** (`abyss`): Deep card and route surfaces.
- **Pressure Steel** (`steel`): Solid logbook and structural panels.
- **Broadcast Panel** (`panel`): Dense translucent launch and summary surfaces.
- **Quiet Hull Line** (`line`): Default one-pixel dividers and borders.
- **Live Hull Line** (`line-hot`): Emphasized cyan-tinted structure.
- **Phosphor Paper** (`paper`): Primary copy, values, and keyboard focus outlines.
- **Current Drift** (`drift`): Secondary labels and subdued controls.
- **Deep Muted Blue** (`muted`): Disabled or low-priority metadata.

### Named Rules

**The Three-Signal Rule.** Cyan navigates and reports depth, coral acts and scores, and gold marks rarity; keep those meanings stable.

**The Dark-Water Rule.** Large surfaces remain near-black navy so Phosphor Paper and the mission signals carry the hierarchy.

## Typography

**Display Font:** Pixelify Sans Variable (with Pixelify Sans and monospace fallbacks)
**Body Font:** Pixelify Sans Variable (with Pixelify Sans and monospace fallbacks)
**Label/Mono Font:** Pixelify Sans Variable (with Pixelify Sans and monospace fallbacks)

**Character:** The imported variable Pixelify Sans build supplies a chunky bitmap voice without a network font dependency. Weight, scale, tracking, and signal color create hierarchy inside a single broadcast alphabet.

### Hierarchy

- **Display** (700, `display`, 0.82): The chromatically split OMNIQUIZ wordmark; the tight line height and negative tracking are reserved for the brand.
- **Headline** (variable weight 620, `headline`, 1.12): Prompt questions, feedback outcomes, and dive-log titles.
- **Title** (500, `title`, 1.5): Short mode names and prominent operational labels with wide tracking.
- **Body** (variable weight 500, `body`): The 16px page baseline for answers and general copy; compact explanatory copy may step down contextually while retaining readable line height.
- **Label** (500, `label`, 1.5): Uppercase telemetry, timer labels, round state, button text, and compact metadata.

### Named Rules

**The One-Broadcast Voice Rule.** Keep display, prompts, controls, and telemetry in Pixelify Sans; hierarchy comes from the variable weight axis and spacing, not a second family.

**The Tracking Has Meaning Rule.** Wide uppercase tracking belongs to short operational labels; prompts and explanatory sentences stay tightly tracked.

## Layout

The launch viewport is an asymmetric two-column broadcast: a launch-control panel capped at 420px occupies the left track and the brand stage capped at 760px occupies the larger right track. At 900px the columns tighten; at 700px and below the composition becomes a bottom-weighted vertical launch sequence with full-width console controls and safe-area padding.

Active play uses a desktop vertical telemetry spine sized with `clamp(14.5rem, 20vw, 18.5rem)` beside a dominant live stage. The prompt or feedback hull caps at 620px; the bottom answer hull caps at 690px. Feed and timecode plates float over the stage without joining the reading order. The state sequence is launch control → live prompt feed → score/depth feedback → dive log.

At 900px the spine settles to 13.5rem and stage padding contracts. At 700px and below, the spine becomes a top instrument dock with four compact columns for depth, rounds, timer, and score; the prompt occupies the middle row and the answer hull the bottom row. A 370px breakpoint tightens type and controls further, while the paired 680px-height/700px-width query protects short phones. The shell supports a 320px minimum width, the mobile game targets a 568px minimum height, and safe-area insets are honored.

**The Telemetry Spine Rule.** On desktop, preserve a narrow vertical instrument spine and give the remaining viewport to one framed live stage; on mobile, move the same data into the top dock.

**The One Live Feed Rule.** Prompt or feedback is the sole dominant panel; score, depth, timing, navigation, and progress remain instrumentation around it.

## Elevation & Depth

Depth comes first from owned raster material and tonal layering, then from a small structural shadow vocabulary. The mission panorama darkens, desaturates, and shifts as `depthFactor` approaches the 7,000m trench; midwater and trench rasters enter at 1,400m and 4,200m. Scanlines, particles, fish silhouettes, and the right-edge depth ruler keep the descent visible without competing with the prompt.

### Shadow Vocabulary

- **Panel Lift** (`0 18px 34px rgba(0, 4, 12, 0.52)`): Ambient separation for launch control and the final dive log.
- **Control Lift** (`0 8px 18px rgba(0, 4, 12, 0.38)`): Compact standalone controls such as audio.
- **Spine Separation** (`12px 0 30px rgba(0, 2, 8, 0.3)`): Lateral depth between the desktop HUD and live stage.
- **Hull Material** (`box-shadow: none`): Prompt and answer elevation is drawn by `prompt-hull.webp` and `answer-hull.webp`, not recreated with generic CSS shadow stacks.

### Named Rules

**The Raster Owns the World Rule.** The mission panorama and both hull-frame assets are first-class material; preserve their pixel rendering and do not replace them with stock imagery, blur glass, or generic gradient frames.

**The Glow Means Signal Rule.** Cyan and coral glow belongs to active progress, the critical timer, or environmental light; resting containers do not all glow.

## Shapes

The control language is square and engineered: buttons, inputs, route cards, links, meters, and summary panels use zero-radius corners, one-pixel hull lines, heavy lower borders, or raster-cut frame edges. Full circles are reserved for the countdown dial and isolated decorative celestial forms in themed artwork. The prompt and answer silhouettes come from sliced project-owned WebP hulls rather than a radius scale.

**The Circle Is a Gauge Rule.** Use the full-circle token for measured instrumentation, not for general actions, cards, chips, or navigation.

## Components

### Buttons

- **Shape:** Square, minimum 44px touch targets; primary game actions add a four- or five-pixel lower border for tactile pressure.
- **Primary:** Begin Descent is a full-width 62px-minimum coral-dark control with opposing descent marks and 0.8rem by 1rem padding.
- **Hover / Focus:** Hover fills coral and lifts the launch action by 2px; keyboard focus retains the global two-pixel Phosphor Paper outline at a four-pixel offset.
- **Submit / Pass / Continue:** DIVE and Continue use the coral action family; PASS stays navy with a live-line border and secondary text until hover.

### Cards / Containers

- **Corner Style:** Square (`rounded.square`) with straight border geometry.
- **Prompt / Feedback:** A 620px-max blackwater panel is wrapped by the sliced `public/ui/prompt-hull.webp` raster; feedback inherits the same hull and swaps to the score-slam entrance.
- **Answer Hull:** The 690px-max form uses `public/ui/answer-hull.webp` around a flexible answer field plus DIVE and PASS controls.
- **Launch / Dive Log:** Dense Broadcast Panel surfaces use a three-pixel cyan top rail, quiet side borders, and Panel Lift.

### Inputs / Fields

- **Style:** The answer field is a square 56px slot with a dark navy fill, one-pixel cyan border, and four-pixel lower edge.
- **Focus:** Focus turns the border Phosphor Paper and adds a restrained two-pixel cyan halo while the global visible outline remains intact.
- **Error / Disabled:** Urgency and errors sit immediately above the answer hull in pale coral over Blackwater Ink; disabled controls remain legible and stop inviting action.

### Navigation

Launch navigation is a two-column rail of 44px-minimum square links with quiet hull borders. Hover promotes the border to Sonar Cyan and the text to Phosphor Paper. At mobile widths, labels reduce tracking or wrap inside their controls rather than overflowing.

### Telemetry Spine and Dock

The desktop spine stacks brand, mode, depth, circular timer, score, seven round steps, and current question metadata. On mobile, the same information is recomposed into the top dock; labels and ornamental connector lines disappear before any core value does.

### Mission Backdrop

`public/ocean/rov-mission-panorama.webp` is the base scene. Conditional midwater and trench rasters, depth-linked filtering and translation, scanlines, fish, particles, and the 0–7,000m ruler communicate descent while remaining pointer-inert and mostly outside the accessibility tree.

### Motion

Panel arrivals use a 420ms `cubic-bezier(0.16, 1, 0.3, 1)` entrance; feedback changes that entrance to a deliberate score slam. Ocean filters and layers transition over 700ms, the depth marker over 800ms with the same expressive curve, the answer rail depletes linearly each second, and critical timer urgency pulses in 760ms stepped beats. Reduced motion collapses all animation and transition durations to 0.001ms for one iteration without hiding state.

## Do's and Don'ts

### Do:

- **Do** keep the owned panorama and hull rasters pixel-sharp and structurally central.
- **Do** preserve the desktop spine/live-stage split and the mobile top-dock transformation at 700px.
- **Do** keep prompts high-contrast and singular while telemetry stays peripheral.
- **Do** use cyan for navigation/depth, coral for action/score/urgency, and gold for rarity.
- **Do** make controls keyboard reachable, at least 44px tall, safe-area aware, and operable with reduced motion.
- **Do** let score and depth visibly alter the environment as well as the numbers.

### Don't:

- **Don't** replace the ROV world with stock ocean photography, smooth vector gradients, or generic sci-fi glass panels.
- **Don't** introduce pills, softened SaaS cards, blur-heavy glassmorphism, or rounded navigation.
- **Don't** use coral, cyan, gold, and green as interchangeable decoration.
- **Don't** add a proportional display or body family; the shipped system uses one Pixelify Sans variable voice.
- **Don't** stretch the prompt beyond 620px or the answer hull beyond 690px on desktop.
- **Don't** rely on motion alone to communicate timer urgency, progress, feedback, score, or depth.
