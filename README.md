# OMNIQUIZ

A cinematic 16-bit ocean trivia game built with Next.js. Choose a seven-question Daily Challenge or a 15-round Arcade dive with sudden death, a strict Easy → Medium → Hard progression, persistent themes, and synthesized 8-bit sound effects.

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

- Daily: seven prompts, 15 seconds each, and a 50-point penalty for every wrong answer, pass, or timeout.
- Arcade: 15 rounds; any wrong answer, pass, or timeout immediately ends the run.
- Arcade difficulty: rounds 1–3 Easy, 4–7 Medium, and 8–15 Hard.
- Rarer accepted answers score more points and drive the visible descent.

Progress, statistics, theme, and audio preference are stored locally. The game uses local question and submission API routes; no external gameplay service is required.

## Routes

- `/` — landing page and Daily Challenge
- `/unlimited/classic` — Arcade Mode with optional `category` query parameter
- `/packs` — themed category routes
