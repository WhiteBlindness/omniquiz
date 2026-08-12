---
name: OMNIQUIZ
description: A playful retro pixel-ocean trivia console where rarer answers descend deeper.
colors:
  ink: "#050a14"
  abyss: "#07111f"
  panel: "rgba(11, 21, 38, 0.88)"
  panel-soft: "rgba(16, 29, 51, 0.82)"
  ocean: "#0c3151"
  border: "#12233d"
  border-bright: "#1b3b62"
  paper: "#e8f1ff"
  drift: "#7d93b8"
  muted: "#526b8d"
  cyan: "#4de3ff"
  coral: "#ff5d8f"
  gold: "#ffd66d"
typography:
  display:
    fontFamily: '"VT323", "Lucida Console", "Courier New", monospace'
    fontSize: "clamp(4rem, 8.7vw, 7.2rem)"
    fontWeight: 700
    lineHeight: 0.9
    letterSpacing: "0.11em"
  headline:
    fontFamily: '"VT323", "Lucida Console", "Courier New", monospace'
    fontSize: "clamp(1.55rem, 3.1vw, 2.3rem)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "0.04em"
  title:
    fontFamily: '"VT323", "Lucida Console", "Courier New", monospace'
    fontSize: "clamp(1rem, 2vw, 1.4rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.48em"
  body:
    fontFamily: '"VT323", "Lucida Console", "Courier New", monospace'
    fontSize: "16px"
    fontWeight: 400
    letterSpacing: "0.07em"
  label:
    fontFamily: '"VT323", "Lucida Console", "Courier New", monospace'
    fontSize: "0.68rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.2em"
rounded:
  square: "0"
  orbit: "50%"
spacing:
  tight: "0.4rem"
  control-gap: "0.55rem"
  base: "1rem"
  panel-x: "1.55rem"
components:
  button-primary:
    backgroundColor: "rgba(13, 29, 52, 0.84)"
    textColor: "{colors.paper}"
    typography: "{typography.title}"
    rounded: "{rounded.square}"
    padding: "0.6rem 1rem"
    height: "78px"
  button-primary-hover:
    backgroundColor: "rgba(52, 109, 132, 0.45)"
    textColor: "#ffffff"
  button-submit:
    backgroundColor: "rgba(129, 38, 70, 0.78)"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    height: "58px"
  input-answer:
    backgroundColor: "rgba(7, 19, 36, 0.90)"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0 0.85rem"
    height: "58px"
  card-prompt:
    backgroundColor: "rgba(10, 23, 42, 0.91)"
    textColor: "{colors.paper}"
    rounded: "{rounded.square}"
    padding: "1.45rem 1.55rem 1.15rem"
    width: "480px"
  control-icon:
    backgroundColor: "rgba(16, 31, 53, 0.72)"
    textColor: "{colors.drift}"
    rounded: "{rounded.square}"
    size: "38px"
---

# Design System: OMNIQUIZ

## Overview

**Creative North Star: "The Abyssal Arcade Console"**

OMNIQUIZ feels like a compact expedition terminal dropped into a living, pixel-art ocean. Layered sky, water, trench, fish, particles, scanlines, a depth ruler, and the krill marker make progress spatial: the interface does not merely report a score; it visibly descends with it.

The console layer is playful but disciplined. Monospaced pixel type, square controls, thin signal borders, hard offset shadows, and terse uppercase telemetry keep every state legible over the illustrated scene. Cyan is the navigational signal, coral is action and rarity energy, and gold is a scarce reward color. The built system rejects generic rounded SaaS cards, soft pastel minimalism, and decoration that competes with the prompt.

**Key Characteristics:**

- Layered pixel-ocean atmosphere that changes with depth.
- Square, instrument-like panels with thin borders and hard offset shadows.
- One monospaced pixel voice across display, copy, labels, and controls.
- Cyan, coral, and gold signal roles against near-black blue surfaces.
- Short arcade motion with a complete reduced-motion fallback.

## Colors

The palette is a night-ocean field punctuated by cold cyan navigation, warm coral action, and rare gold rewards.

### Primary

- **Dive Signal Cyan** (`cyan`): Borders, focus-adjacent glows, mode titles, depth values, links on interaction, and the answer-progress rail.

### Secondary

- **Krill Coral** (`coral`): Score values, answer actions, rarity kickers, completed round lamps, chromatic title separation, and urgent feedback.

### Tertiary

- **Treasure Gold** (`gold`): Rare-tier feedback and premium-looking pack state/action cues; it is intentionally uncommon.

### Neutral

- **Midnight Ink** (`ink`): Page and shell ground.
- **Abyss Blue** (`abyss`): Deepest environmental layer and dark structural support.
- **Pressure Panel** (`panel`): Dense translucent console surface.
- **Soft Sonar Panel** (`panel-soft`): Lighter translucent control surface.
- **Open Ocean Blue** (`ocean`): Mid-depth environmental color.
- **Hull Border** (`border`): Quiet structural stroke.
- **Lit Hull Border** (`border-bright`): Emphasized structural stroke.
- **Foam Paper** (`paper`): Primary text and keyboard focus outline.
- **Current Drift** (`drift`): Secondary telemetry and control text.
- **Deep Muted Blue** (`muted`): Low-priority metadata and disabled-adjacent information.

### Named Rules

**The Three-Signal Rule.** Cyan navigates, coral acts or scores, and gold rewards rarity; do not interchange them casually.

**The Dark-Water Rule.** Large surfaces stay in the ink-to-ocean range so the pixel scenery and signal colors remain legible.

## Typography

**Display Font:** VT323 (with Lucida Console, Courier New, and monospace fallbacks)  
**Body Font:** VT323 (with Lucida Console, Courier New, and monospace fallbacks)  
**Label/Mono Font:** VT323 (with Lucida Console, Courier New, and monospace fallbacks)

**Character:** A single pixel-mono stack makes the product read as one expedition instrument. Hierarchy comes from scale, weight, tracking, color, and uppercase telemetry—not from mixing typefaces.

### Hierarchy

- **Display** (700, responsive `display` token, 0.9): OMNIQUIZ brand marks only; use chromatic cyan/coral separation sparingly.
- **Headline** (700, responsive `headline` token, 1.08): Prompt questions, feedback outcomes, and summary titles.
- **Title** (400, responsive `title` token, 1): Mode names and prominent console labels, normally uppercase with wide tracking.
- **Body** (400, `body` token): Descriptions, quips, answer text, and explanatory copy.
- **Label** (400, `label` token, uppercase): HUD telemetry, kickers, progress metadata, and compact control text.

### Named Rules

**The One-Console Voice Rule.** Keep every interface role in the pixel-mono stack; express hierarchy without introducing a second font family.

**The Tracking Has Meaning Rule.** Wide uppercase tracking belongs to short labels and mode names, never to long prompts or paragraphs.

## Layout

The game is a full-viewport scene (`100svh`) with an environmental backdrop and a z-layered console UI. The landing brand is centered within a 760px stage, while the main launch console is anchored above the safe-area bottom and capped at 612px. During play, the three-column HUD caps at 700px, the prompt/feedback panel at 480px, and the answer rail at 610px. The themed-packs route uses a narrow 468px reading column.

Spacing is tight and rhythmic rather than airy: controls cluster at the bottom, prompt content stays centered around the upper fifth of the viewport, and labels sit close to the values they explain. At 700px and below, gutters contract, HUD side meters narrow, the answer rail becomes 48px / flexible / 76px, and type/tracking reduce to prevent overflow. All surfaces retain a 320px minimum viewport contract and respect safe-area insets.

**The One-Prompt Stage Rule.** Keep the current prompt as the single dominant panel; supporting telemetry belongs in the HUD or bottom answer rail.

**The Fixed-Instrument Rule.** Preserve the centered caps and anchored HUD/action zones rather than stretching console surfaces edge to edge.

## Elevation & Depth

Depth is a hybrid of environmental layering and deliberately mechanical shadows. The ocean uses opacity, parallax-like vertical shifts, gradients, scanlines, silhouettes, and pixel assets. Console surfaces use dark translucent fills with thin borders and hard down-right shadow blocks; small cyan/coral glows mark signal energy, not generic softness.

### Shadow Vocabulary

- **Control Block** (`3px 3px 0 rgba(3, 11, 24, 0.78)`): Compact icon controls.
- **HUD Block** (`5px 5px 0 rgba(3, 9, 19, 0.62)`): Small telemetry meters.
- **Prompt Block** (`7px 8px 0 rgba(3, 11, 24, 0.72), 0 0 22px rgba(5, 17, 31, 0.28)`): Prompt and feedback panels.
- **Launch Lift** (`0 0 18px rgba(77, 227, 255, 0.13), 0 11px 0 rgba(3, 12, 26, 0.62)`): The primary descent action.
- **Coral Lamp Glow** (`0 0 9px rgba(255, 93, 143, 0.64)`): Completed round lamps only.

### Named Rules

**The Down-Right Pressure Rule.** Structural elevation is a crisp dark block displaced down and right; ambient glows are secondary signal accents.

**The Glow Means Signal Rule.** Cyan and coral glow only around active progress, focus, rarity, or status—not around every container.

## Shapes

The dominant form language is square and instrument-like: buttons, links, cards, inputs, meters, and pack containers use zero-radius corners and thin one- or two-pixel borders. Circular geometry is reserved for the countdown timer and its concentric orbit rings. Pixelated artwork, stepped shadows, dashed separators, scanlines, lamps, and triangular indicators reinforce the low-resolution console silhouette.

**The Circle Is a Gauge Rule.** Use full circles for timers or measured instrumentation, not as a general card or button treatment.

## Components

### Buttons

- **Shape:** Square console controls (`rounded.square`) with visible one- or two-pixel borders and, where prominent, a heavier bottom edge or hard shadow.
- **Primary:** The full-width Begin Descent control uses a translucent navy surface, cyan double-line emphasis, Foam Paper text, large uppercase tracking, and a 78px desktop height.
- **Hover / Focus:** Hover brightens the surface and lifts the launch control by 2px; keyboard focus uses a 2px Foam Paper outline offset by 4px. Active styling must remain subordinate to focus visibility.
- **Submit / Continue:** DIVE begins as a coral-dark action and fills coral on hover; Continue uses an ocean-blue surface and fills cyan on hover. Disabled controls become blue-gray and stop decorative animation.

### Cards / Containers

- **Corner Style:** Square (`rounded.square`).
- **Background:** Near-opaque navy panels over the ocean, with enough density to protect prompt legibility.
- **Shadow Strategy:** Hard down-right blocks, with only restrained signal glows as described in Elevation & Depth.
- **Border:** One-pixel dark hull borders at rest; cyan-tinted borders identify active or emphasized surfaces.
- **Internal Padding:** Prompt and feedback panels use roughly 1.45rem vertical by 1.55rem horizontal padding on desktop and contract at the compact breakpoint.

### Inputs / Fields

- **Style:** The answer field is a square, dark-navy 58px console slot with a 2px cyan border and a 4px bottom edge.
- **Focus:** The border shifts to Foam Paper and gains a restrained cyan halo; the global visible outline remains available to keyboard users.
- **Error / Disabled:** Error copy appears in pale coral above the answer rail. Disabled fields preserve legibility and pair with a disabled blue-gray submit control.

### Navigation

Launch-rail links are compact uppercase labels in thin cyan-tinted boxes; hover brightens both border and text. Secondary summary navigation is an understated underlined text link. Mobile navigation wraps and reduces padding/tracking rather than overflowing.

### HUD Meters

Depth and score sit in separate square dark meters with hard shadows, while the centered mode title, seven rectangular round lamps, and prompt count form a compact telemetry spine. Cyan reports depth and coral reports score/completed progress.

### Ocean Backdrop

The signature scene stacks sky, surface glow, top water, mid water, and trench assets. Score-derived depth changes opacity and vertical position, while pixel fish, particles, scanlines, the krill marker, and a right-side depth ruler keep the descent visible without entering the reading order.

## Do's and Don'ts

### Do:

- **Do** preserve square corners, thin signal borders, and down-right shadow blocks on console surfaces.
- **Do** keep prompts and answers high-contrast in Foam Paper over dense navy panels.
- **Do** use cyan for navigation/depth, coral for action/score, and gold only for rare rewards.
- **Do** make responsive layouts safe at 320px, wrap compact navigation, and honor safe-area insets.
- **Do** keep all functionality intact when reduced motion collapses animations and transitions.
- **Do** render ocean and tier artwork with pixel-preserving treatment.

### Don't:

- **Don't** introduce pill buttons, rounded SaaS cards, glassmorphism blur, or soft floating white surfaces.
- **Don't** use cyan, coral, and gold as interchangeable decoration or let glow surround every panel.
- **Don't** mix in a proportional display or body font; OMNIQUIZ speaks through one pixel-mono console voice.
- **Don't** stretch prompt cards or action rails across wide desktop viewports beyond their implemented caps.
- **Don't** place decorative ocean elements in the accessibility tree or allow them to obscure the prompt, timer, or answer rail.
- **Don't** rely on motion alone to communicate depth, progress, feedback, or state.
