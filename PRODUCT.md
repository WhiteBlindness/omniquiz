# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious players who want either a short daily trivia ritual or a replayable arcade challenge that rewards uncommon knowledge.

## Product Purpose

OMNIQUIZ is a local-first trivia experience: players choose a seven-prompt Daily Challenge or a 15-round sudden-death Arcade run, receive immediate rarity-based feedback, and descend through an illustrated ocean as their score grows.

## Positioning

Answers are treated as discoveries with depth and rarity, so a quiz run feels like a small expedition rather than a conventional list of questions.

## Operating Context

The experience is played in a browser on desktop or mobile. Daily Challenge uses seven prompts and applies a 50-point penalty for wrong answers, passes, or timeouts before estimating a final percentile. Arcade Mode uses 15 rounds, ends immediately on any miss, and ramps from Easy in rounds 1–3 to Medium in rounds 4–7 and Hard from round 8 onward.

## Capabilities and Constraints

Question selection and answer evaluation are provided by the existing local `/api/questions` and `/api/submit` routes. Client progress, run stats, theme, and mute preference may be stored safely in local storage. Synthesized 8-bit cues acknowledge controls, correct answers, misses, and game over without external media. No external submission service is part of the product.

## Brand Commitments

The product name is OMNIQUIZ. The interface should feel like a retro pixel ocean expedition while remaining original to OMNIQUIZ and legible, keyboard reachable, responsive, and reduced-motion friendly.

## Evidence on Hand

The local question catalog, scoring rules, ocean background/tier assets under `public/ocean/`, and reference screenshots under `reference/` are available.

## Product Principles

- Make one prompt feel like an event.
- Reward curiosity while making each mode's miss rule unmistakable.
- Keep the full loop playable with local, reliable state.
- Make depth and rarity understandable at a glance.

## Accessibility & Inclusion

Controls must be semantic and keyboard reachable, timer and feedback updates must be announced, mobile layouts must avoid horizontal overflow, and reduced motion must preserve the full experience.
