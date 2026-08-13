# OMNIQUIZ

A cinematic 16-bit ocean rarity game built with Next.js. Choose a seven-prompt Daily Dive or a 15-prompt Unlimited Dive, then discover how recognizable answers distribute across a curated crowd atlas.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm test
npm run test:coverage
npm run lint
npm run build
npm run test:e2e
```

## Game rules

- Daily: seven broad prompts, 15 seconds each, from one deterministic UTC set.
- Unlimited: 15 broad prompts; every run reaches the surface and can be replayed.
- Recognized answer shares map to Plankton (10), Too Clever (15), Schooler (30), Rare Catch (60), Deep Cut (85), or One in a Krillion (100).
- Pass, timeout, and unlisted text score zero with no penalty; every point drives the dive 10 metres.
- The server keeps answer atlases private. The browser receives only prompt metadata, and feedback reveals the matched label, share, insight, and common-answer comparisons.

Progress, statistics, theme, and audio preference are stored locally. The game uses local question and submission API routes; no external gameplay service is required.

## Routes

- `/` — landing page and Daily Challenge
- `/unlimited/classic` — Arcade Mode with optional `category` query parameter
- `/packs` — themed category routes
