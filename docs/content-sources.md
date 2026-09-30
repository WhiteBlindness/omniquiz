# Content sources and rights

This file records where OMNIQUIZ's content comes from and what is and is not verified. It is a working record, not legal advice.

## Prompts and answer atlases

| Content | Origin | Third-party data used | Media |
| --- | --- | --- | --- |
| Core atlas (`scripts/atlas/{general,science,geography,history}.mjs`, 120 prompts) | Authored for this project | None recorded | None |
| Movies atlas (`scripts/atlas/movies/*.mjs`, 36 prompts) | Authored for this project | None. No film database, API or scraped list was used | None |

Prompts are open-ended questions written for this game. Answers in the Movies atlas are names of films, franchises, studios, people and fictional characters, plus generic film-craft terms. These are facts used to identify works and people; no synopsis text, quotation, poster, still, logo, album art, audio or trailer is used or stored.

## How answer shares are produced

Shares are **not measured**. In each prompt the answers are written in rough order of how commonly people are expected to name them, and the generator assigns one of four fixed share profiles by position (`SHARE_PROFILES` in `scripts/generate-questions.mjs`). The order of answers in the source is therefore the popularity claim, and it reflects the author's judgement, not survey data.

Consequences:

- Do not describe shares as poll results, statistics or "what X% of players said". The interface and Terms call them curated estimates.
- If real data is ever collected, it can replace the profiles without changing the scoring contract.
- Insight text is templated unless a family supplies its own `insight`. The Movies atlas supplies none, so it makes no factual claims beyond the answer label.

## Names and trademarks

Film titles, franchise names, studio names, personal names and character names appear only as answers or accepted aliases. They belong to their respective owners. The Terms page states that they are used to identify works and people and imply no affiliation or endorsement. Whether this is sufficient for the owner's risk tolerance in each jurisdiction needs human or legal review.

Answer aliases that include a person's name are neutral descriptors (for example a role or well-known film credit) and make no claim about the person.

## Visual and audio assets

| Asset | Where | Status |
| --- | --- | --- |
| Ocean, submersible, sky and UI-frame pixel art | `public/ocean/`, `public/ui/` | **Origin and licence not recorded in the repository.** Owner to confirm. |
| Cinema world pixel art (skylines, lamps, marquees, drive-in, premiere cinema, cars, moon) | `public/cinema/*.svg` | Original. Generated from rectangles by `scripts/generate-cinema-art.mjs`, which is the source of truth; rerun it to rebuild the files. All signage is generic ("NOW SHOWING", "PREMIERE", "TICKETS", "DRIVE-IN"); no film title, poster, still, studio logo or real venue is depicted. |
| World card art (Sports, Music) | CSS gradients in `src/styles/worlds.css` | Drawn in CSS; no external image. |
| Icons | Inline SVG in components | Authored in the repository. |
| Sound effects | Synthesized in the browser (`src/state/AppStateProvider.tsx`, `src/lib/audio/sfx.ts`) | No audio files. |
| Pixelify Sans | `@fontsource-variable/pixelify-sans` (self-hosted) | Distributed under the SIL Open Font License by its package. |

## Inspiration

OMNIQUIZ was inspired by a third-party browser game, Krillion. Its screenshots were removed from the repository, along with an unused sky-and-boat backdrop and unused rarity icons (including a pixel shrimp) that closely resembled it. The interface wording, rarity-tier names and pack names that mirrored it were replaced with OMNIQUIZ's own. `src/lib/packs/environment.test.ts` fails if that wording returns to either world's interface or the pack metadata. The screenshots remain in older Git history; see `docs/release-readiness.md`.

## Adding content

1. Prefer original prompts and generic answers. Do not copy questions, answer lists or descriptions from other quizzes, databases or websites.
2. If a source is used, record its name, licence or terms, attribution requirement and any API restriction here before merging.
3. Do not add posters, stills, logos, album art, team badges or audio unless a written right to use them is recorded here.
4. Keep the architecture able to swap or remove media: packs reference no image URLs.
