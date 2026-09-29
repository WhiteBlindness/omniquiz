<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# OMNIQUIZ repository rules

This repository is both an engineering project and a public portfolio surface. These rules apply to every contributor, human or automated.

## Verification commands

Use the scripts in `package.json`; do not invent others.

- `npx tsc --noEmit` — typecheck
- `npm run lint` — ESLint
- `npm test` — Vitest (unit and contract tests)
- `npm run test:e2e` — Playwright (set `BASE_URL` to test an already-running server)
- `npm run build` — production build
- `node scripts/generate-questions.mjs` — regenerates every compiled atlas in `src/data/`; the output must be committed and deterministic

Inspect the live repository state before implementing. Preserve completed work.

## Architecture invariants

- Game modes (`daily`, `unlimited`, `speed`, `survival`) and content packs (`core`, `movies`, ...) are separate axes. A new pack must not require changes to the reducer, scoring, or the game loop.
- Answer atlases stay server-side. The browser receives only `{ id, category, prompt }` per question. Client modules (`src/components`, `src/hooks`, `src/state`) must never import atlas data or the server catalog; `src/lib/questions/clientSecrecy.test.ts` enforces this.
- Pack metadata (`src/lib/packs/meta.ts`) is client-safe and contains no answers.
- Do not add a pack's topics to the core `Category` enum.
- Content must be original or have a recorded, compatible source. Record the source, licence, and any uncertainty in `docs/content-sources.md`. Do not add posters, stills, logos, album art, audio, or badges without a documented right to use them.

## Public writing

README files, repository descriptions, PR descriptions, release notes, and commit messages describe the current product and engineering outcome. Do not include prompt history, internal workflow narration, drafting history, or avoidable implementation churn.

Commit messages are concise and outcome-focused, for example:

- `Handle empty upstream data safely`
- `Refine project documentation`
- `Improve keyboard navigation and dialog focus`

Real bugs, security issues, regressions, and limitations stay truthful: describe the actual technical behaviour. Do not rewrite Git history to sanitize old wording.

PR and repository descriptions cover what changed for the user, important technical decisions, architecture or data-flow changes, verification completed, and material remaining limitations.

## README and portfolio presentation

A reader should quickly learn what the project is, why it was built, whether it is live, what is technically interesting, and what the owner designed and built. Then cover architecture, stack, screenshots, setup, tests, current status, and real limitations. Never claim users, production scale, accuracy, performance, security, adoption, or compliance without evidence; soften or remove claims that lack it.

## Security and privacy

Never commit secrets, credentials, private prompts or instructions, personal data, private configuration, or private infrastructure details. Do not state hosting regions, retention periods, subprocessors, or operator details that are not established in the repository; leave them as explicit owner-input items in `docs/release-readiness.md`.

## Before any push

1. Review the staged diff.
2. Run the relevant checks above.
3. Confirm the docs match the implemented behaviour.
4. Scan for secrets and private or internal content.
5. Review commit and PR wording.
6. Exclude unrelated files.
7. Confirm that the push or deploy is explicitly authorised.
