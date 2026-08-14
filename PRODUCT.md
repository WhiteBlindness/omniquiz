# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Curious players who want either a short daily ritual or a replayable challenge that rewards uncommon but recognizable answers.

## Product Purpose

OMNIQUIZ is a local-first crowd-rarity game. Players answer deliberately broad prompts, discover how common their answer is inside a curated answer atlas, and descend through an illustrated ocean as rarer answers earn more points.

## Positioning

Answers are treated as discoveries with depth and rarity, so a run feels like a small expedition rather than conventional single-answer trivia.

## Operating Context

The experience is played in a browser on desktop or mobile. Daily Challenge uses seven prompts from the same deterministic UTC set for everyone. Unlimited Mode uses 15 prompts per dive and supports repeat runs. Both modes use the same core loop: read one vague prompt, enter one honest answer, then reveal its crowd share, rarity tier, points, and depth.

## Capabilities and Constraints

Question selection and answer evaluation are provided by the local `/api/questions` and `/api/submit` routes. The browser receives prompt metadata but never the answer atlas before submission. Client progress, run stats, theme, and mute preference may be stored safely in local storage. No database, AI API, account, or external submission service is required.

## Gameplay Capability: Crowd Rarity Dive

### Capability

For every broad prompt, the server compares a player's free-text answer with a curated crowd atlas. A recognized answer reveals its canonical label and crowd share. That share—and nothing authored directly on the question—maps deterministically to one of six rarity tiers and its points. Every point adds ten metres of depth.

### Constraints and invariants

- Prompts must invite many reasonable answers; conventional single-answer trivia is out of scope.
- Each prompt owns multiple canonical answer families, aliases, a positive crowd share, and a short reveal insight.
- Normalization may absorb case, punctuation, accents, and declared aliases, but must not map unrelated text to a reward.
- An answer absent from the atlas is `UNCHARTED`, scores zero, and still completes the round. Arbitrary or nonsensical text must never receive a maximum-rarity reward.
- Rarity bands are derived from crowd share: `>=30%` Plankton / 10 points, `>=18%` Too Clever / 15, `>=10%` Schooler / 30, `>=5%` Rare Catch / 60, `>=2%` Deep Cut / 85, and `<2%` One in a Krillion / 100.
- Passing and timing out score zero. There are no wrong-answer penalties and no sudden-death state; a complete dive always lets the player see every prompt.
- Feedback must show the submitted/canonical answer, crowd share when recognized, awarded points, cumulative score/depth, and a small comparison with common answers from that prompt.
- The summary must preserve a per-round dive log so the final score is explainable.

### Implementation contract

- `scripts/atlas/` is the maintainable versioned source of prompt atlases; `src/data/questions.json` is its deterministic compiled artifact.
- `src/lib/questions/validator.ts` rejects malformed atlases, duplicate expanded answer keys across families, invalid shares, and catalogs too small to supply a full run.
- `src/lib/game/scoring.ts` owns the single crowd-share-to-rarity mapping and evaluates aliases without mutating catalog data.
- `/api/questions` exposes only public prompt fields; `/api/submit` returns the matched result and post-answer comparison data.
- The reducer records immutable round results and accumulates only positive score/depth.

### Durable answer-atlas contract

- The production atlas contains at least 120 broad prompts, balanced across General, Science, Geography, and History with at least 30 prompts per category.
- Existing stable prompt IDs are preserved; new prompts use sequential IDs. Category source data lives in maintainable versioned modules and is deterministically compiled into `src/data/questions.json`.
- Every prompt contains at least 16 genuinely reasonable answer families. Every family has at least two curated aliases and at least four distinct accepted normalized surface keys after label, aliases, article variants, and safe singular/plural variants are combined.
- Answer matching is bounded and exact-token based: case, accents, punctuation, spacing, leading `a`/`an`/`the`, and conservative singular/plural variants may converge, but substring, edit-distance, fuzzy, semantic, and head-word matching are out of scope.
- Expanded keys must not collide across different families within a prompt. Equivalent forms within one family may be deduplicated.
- `history-014` keeps canonical label `A rocket`, explicitly recognizes `launch vehicle`, recognizes `rocket`, `a rocket`, `the rocket`, and `rockets`, and does not recognize bare `rock`.
- All shares are positive and total exactly 100 per prompt; the database preserves all six rarity bands and does not claim live polling.
- `/api/questions` remains limited to `id`, `category`, and `prompt`; labels, aliases, shares, and insights remain server-only and `/api/submit` remains the evaluation boundary.
- Daily and unlimited selection, state, scoring, UI, storage, and the existing answer-length/API validation remain unchanged.

### Non-goals

- Live crowdsourcing, user accounts, leaderboards, generative answer judging, and claims that the curated shares are live scientific polling.

### Open question

- A future database-backed version may replace curated shares with minimum-sample live distributions without changing the scoring contract.

## Brand Commitments

The product name is OMNIQUIZ. The interface should feel like a retro pixel ocean expedition while remaining original to OMNIQUIZ and legible, keyboard reachable, responsive, and reduced-motion friendly.

## Evidence on Hand

The local question catalog, scoring rules, ocean background/tier assets under `public/ocean/`, and reference screenshots under `reference/` are available.

## Product Principles

- Make one prompt feel like an event.
- Reward original-but-recognizable thinking without pretending every arbitrary string is rare.
- Keep the full loop playable with local, reliable state.
- Make depth and rarity understandable at a glance.

## Accessibility & Inclusion

Controls must be semantic and keyboard reachable, timer and feedback updates must be announced, mobile layouts must avoid horizontal overflow, and reduced motion must preserve the full experience.
