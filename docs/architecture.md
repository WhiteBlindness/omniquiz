# Architecture

OMNIQUIZ is a Next.js app deployed to Cloudflare Workers through vinext. There is no database, account system or external API. The browser holds only presentation state and local statistics; the server holds the answer atlases and evaluates answers.

## Two axes: game mode and content pack

```
Quiz engine (reducer, game loop, scoring)
    -> Game mode      daily | unlimited | speed | survival
    -> Content pack   core | movies | (sports, music planned)
    -> Prompt and answer atlas
```

- A **game mode** decides pacing and rules: prompt count, seconds per prompt, streak multipliers, lives. It lives in `src/components/game/gameReducer.ts` and `src/hooks/useGameLoop.ts`.
- A **content pack** decides what prompts and answers exist. It never touches the reducer, the scoring function or the loop.
- The two combine through the API: `GET /api/questions?pack=movies&mode=speed&run=3`.

The core pack keeps its original routes (`/`, `/unlimited/classic`, `/speed-run`, `/survival`). Other packs live under `/packs/<slug>` with an optional `?mode=`.

## Pack contract

Client-safe metadata lives in `src/lib/packs/meta.ts` and contains no answers:

| Field | Meaning |
| --- | --- |
| `status` | `live` or `planned`. Planned packs are shown as "coming soon", have no atlas and no route. |
| `modes` | The game modes the pack supports. `/api/questions` returns 400 for others. |
| `defaultMode` | Mode used by `/packs/<slug>` without `?mode=`. |
| `topics` | The pack's own topic labels, shown as `TOPIC / ATLAS`. Distinct from the core `Category` enum. |
| `atlasLabel`, `intro`, `title`, `shortName` | Presentation. |

Server-only data lives in `src/data/`, is validated at load in `src/lib/questions/catalog.ts` and is reachable only through `questionsForPack(pack)` and `findQuestionById(id)`. Question ids are globally unique and carry a pack prefix (`general-001`, `movies-001`), so `POST /api/submit` needs only `{ questionId, answer }`.

The catalog fails at load if:

- an atlas fails the validator (category, id prefix, minimum prompts, 16+ answer families per prompt, alias and key rules, shares totalling 100),
- a pack holds fewer prompts than its largest supported mode needs,
- an id appears in two packs, or
- a `planned` pack ships an atlas.

## Trust boundaries

- The browser receives `{ id, category, prompt }` per question and nothing else before submission.
- `src/lib/questions/clientSecrecy.test.ts` fails if `src/components`, `src/hooks`, `src/state`, `src/lib/packs/meta.ts` or a route page references atlas data or the catalog.
- Feedback after submission reveals the matched label, its share, the atlas insight and the three most common answers for that prompt. This is by design and is why an attacker who scripts `/api/submit` can learn atlas contents; there is no leaderboard or prize for that to undermine.
- Scores, statistics and progress are computed in the browser and stored locally. They are not authoritative.

## Storage

Everything is `localStorage`; no cookies are set. Keys and purposes are declared in `src/lib/storage/registry.ts`, rendered on the Cookie Policy page, and guarded by a test that fails if the code uses an undeclared `omniquiz-` key.

- Progress uses a single slot (`omniquiz-progress-v3`) that records the mode and pack. It is restored only when both match the current route.
- Statistics use `omniquiz-stats-v2` for the core pack and `omniquiz-stats-v2:<pack>` for others.

## Security headers

`src/proxy.ts` applies the headers from `src/lib/security/headers.ts` to every route in production: a same-origin CSP (no third-party origins, no `unsafe-eval`), `nosniff`, `frame-ancestors 'none'`, a strict referrer policy and a restrictive permissions policy. It is skipped in development because hot reload needs eval and websockets. The CSP still allows inline scripts and styles because the framework and React emit them; moving to nonces is a hardening follow-up. The headers were verified on both `next start` and the vinext build served by `wrangler dev`.

## Adding a pack

1. Add the pack id to `PACK_IDS` and an entry to `PACKS` in `src/lib/packs/meta.ts` (`status: "planned"` until content exists).
2. Author the atlas in `scripts/atlas/<pack>/` using `family(label, aliases, insight?)` and `question(prompt, families)`. List answers from most to least commonly named: the generator assigns share profiles by that order.
3. Register the pack in `scripts/generate-questions.mjs` (spec, topics, id prefix) and run `node scripts/generate-questions.mjs`.
4. Import the JSON in `src/lib/questions/catalog.ts` and add it to `PACK_QUESTION_BANKS` with a spec built from the pack's metadata.
5. Flip the pack to `status: "live"`, then add tests following `src/lib/questions/catalog.test.ts` and `e2e/movies-pack.spec.ts`.
6. Record the content's origin in `docs/content-sources.md`.

No change to the reducer, scoring, game loop or `/api/submit` is needed.
