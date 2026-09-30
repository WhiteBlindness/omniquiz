# Release readiness

A practical audit of what is verified, what needs a human, and what blocks a public release. It is a product-readiness record, not legal certification or a WCAG conformance claim.

Scope: the themed-pack architecture and the Movies pack (Cinema Boulevard), plus a privacy, accessibility, security, licensing and claims review of the whole application.

## Green: verified

| Area | Evidence |
| --- | --- |
| Typecheck, lint | `npx tsc --noEmit` and `npm run lint` exit 0 |
| Unit and contract tests | `npm test`: 30 files, 209 tests pass; coverage 96.0% statements, 87.8% branches, 100% functions (repository gate is 80%). Includes run-finalization tests for every mode and for a Survival run lost on its last life |
| End-to-end | Playwright, 28 tests on desktop and 28 on mobile Chromium (Pixel 5): 56 of 56 pass against `next start` and against the production vinext build served by `wrangler dev` (workerd). They cover the core loop, the Movies pack and its cinema world, logo and exit navigation, resuming, reduced motion, and a Survival run recorded once across a reload. In this sandbox the pinned Playwright could not find its own browser build, so the runs used a temporary config outside the repository that added `executablePath: "/opt/pw-browsers/chromium"` and `BASE_URL`; `npm run test:e2e` itself was not run here |
| Production builds | `npm run build` and `npm run build:vinext` succeed; `/packs/[pack]` is registered in both |
| Answer atlas stays server-side | `/api/questions` returns only `{ id, category, prompt }` (asserted in API tests and in e2e against the real response); `clientSecrecy.test.ts` scans client code, route pages and `packs/meta.ts` and was mutation-checked to fail on a leak |
| Pack isolation | A Movies run is never restored in a core route and stats are namespaced per pack (unit tests plus an e2e that checks the stored pack) |
| Mode compatibility enforced server-side | `pack=movies&mode=daily`, unknown and planned packs, category filters on packs, and repeated parameters all return 400 |
| No cookies, no third parties | A full session on desktop recorded requests to one origin only, no `Set-Cookie`, no cookies, and only `omniquiz-*` local-storage keys. Fonts are self-hosted |
| Storage documentation cannot drift | `src/lib/storage/registry.ts` feeds the Cookie Policy; a test fails if code uses an undocumented `omniquiz-` key |
| Security headers | CSP (same-origin, no `unsafe-eval`, `frame-ancestors 'none'`), `nosniff`, `X-Frame-Options`, referrer and permissions policies on every route, including `/` and 404s, on `next start` and on the workerd runtime. No CSP violations while loading every route and playing a round |
| Automated accessibility | axe-core (WCAG 2.0/2.1/2.2 A and AA plus best-practice rules) reports zero violations in 30 scans: landing, packs, Movies intro and how-to-play, Movies answering, feedback, summary and exit dialog, Movies on a 390px phone, core answering and feedback, a lost core Survival run, and the privacy, terms and cookies pages, each in dark and light themes |
| Target sizes | Footer links, the storage notice button and the focused skip link meet 44px; an e2e asserts all rendered controls at 320px |
| Unsupported claims removed | The invented "estimated score percentile" is now "share of daily max"; the tutorial rarity scale is generated from the scoring function; privacy statements that were not true (aggregate statistics, "no personal data", rights "inherently fulfilled") are gone; the packs page no longer advertises unlocks or a dead restore button |
| Secrets | Repository scan found none; `.env*` is ignored |
| Dependency advisories | The critical `next` advisory is fixed by upgrading to 16.3.7; the vulnerable `sharp`, `wrangler` and related dev tooling were updated in range |
| Refund policy | Not applicable, see below |

## Yellow: needs confirmation or human review

1. **Legal wording.** The privacy, cookie and terms pages now describe only what the code does, but they have not been reviewed by a lawyer. They deliberately state that operator identity, contact details and governing law are not yet published.
2. **Storage notice classification.** OMNIQUIZ writes only functional local storage (theme, sound, statistics, current run) and sets no cookies. The existing notice is informational and no consent choice is offered. Whether persistent preference and statistics storage falls under the "strictly necessary / service explicitly requested" exemption is an interpretation that needs human review.
3. **Small text.** 82 font-size declarations across six stylesheets are below 0.6rem (about 9.6px); the smallest are 0.42rem (about 6.7px). They are mostly HUD telemetry labels and summary micro-labels in the 16-bit design. axe does not measure this. The tutorial scale, storage notice and footer were raised; the rest needs a design-led pass.
4. **Accessibility beyond automation.** No manual screen-reader pass was done; core Speed phases were not axe-scanned; reduced motion is tested for the Movies world, and high-contrast blocks exist in the stylesheets but were not re-tested. Automated checks find only part of real accessibility problems.
5. **CSP strength.** The policy allows `'unsafe-inline'` for scripts and styles because the framework and React emit inline code. Nonce-based CSP is a follow-up. The app does not set HSTS; confirm the hosting edge applies it.
6. **Open scoring endpoint.** `/api/submit` is unauthenticated and un-rate-limited, and every response includes the top three answers for that prompt. A script can therefore read most of the atlas. That is acceptable while there is no leaderboard or prize; add attempt authority and rate limiting before adding either.
7. **Client-side scores.** Scores, statistics and progress are computed and stored in the browser and can be edited. Shared score text is not verifiable.
8. **Movies content.** The 36 prompts are editorial, not reviewed by anyone else. Answer order is the popularity claim (see `docs/content-sources.md`). Survival draws 30 of 36 prompts, so Movies survival runs vary less than core ones; Daily is not offered for Movies. Several prompts overlap in their answer sets (the two Genres prompts about "never gets old" and "biggest screen", and the theme-tune and famous-music prompts share about nine answers), and with 36 prompts those overlaps appear in most Survival runs. Widening the atlas is the fix, not the code.
9. **Unused and unrecorded assets.** `public/` still ships source PNGs and `bg-top.*`, which no rendered component uses. Their origin is not recorded.
10. **Remaining dev-tooling advisories.** Five moderate or high advisories remain in dev-dependency chains (`vitest`, `@vitest/coverage-v8`, `@vitest/mocker`, `js-yaml`, `undici`). They are not imported by application source, and `npm audit fix` could not resolve them (it errored; some need major-version upgrades). Re-run `npm audit` before release.
11. **English only.** There is no localisation layer, so no translated legal text exists to mislead.

## Red: blocks public promotion until answered

**Presentation still close to the inspiration.** The copied wording, names, screenshots and look-alike images are gone (see "Resolved" below), but parts of the presentation remain close to Krillion. Changing them would be a redesign, so it is left to the owner:

- the pink and cyan chromatic pixel wordmark;
- the landing launch cluster: a how-to-play toggle above a full-width start button with marks on both sides, a run counter on the left and two small navigation buttons on the right;
- the depth ruler along the right edge;
- the core numbers: 7 prompts, 15 seconds, 10 metres per point, a 700-point maximum;
- a packs page with a saved-runs panel and a centred back link.

Decide whether these are acceptable as genre conventions or should be redesigned before public promotion. The owner items below also decide what the legal pages can say and which domain shared scores point to.

## Resolved: third-party inspiration material

OMNIQUIZ was inspired by Krillion, a third-party game. The repository used to carry six screenshots of it, and the core interface mirrored its wording and tier names. This was resolved:

- The screenshots (`reference/krillion-*.png`) and two outdated OMNIQUIZ screenshots showing the mirrored copy were removed from the working tree, together with two unused assets that closely resembled the reference: a sky-and-boat backdrop (`public/ocean/bg-sky.*`) and the rarity icons (`public/ocean/tier-*.png`, including a pixel shrimp). All remain recoverable from Git history.
- Landing, how-to-play, button, placeholder, log and pack-page wording was rewritten around OMNIQUIZ's own ROV expedition (for example "DAILY EXPEDITION", "LAUNCH THE ROV", "SEND", "RECOVER THE ROV").
- Rarity tiers have neutral ids (`common`, `familiar`, `notable`, `rare`, `obscure`, `unique`). Each world names them itself: ocean Surface to The Abyss, cinema Extra to One of a Kind.
- The Movies pack is titled Cinema Boulevard, and its card badge and rules no longer echo the reference.
- `src/lib/packs/environment.test.ts` fails if the mirrored wording returns to either lexicon or the pack metadata.

Still open, for the owner: the screenshots remain in earlier Git history. Removing them from history would mean rewriting the published branch history, which this project does not do without an explicit decision. The game concept itself (type an answer, uncommon answers score more, an ocean-depth metaphor, a movies pack) remains inspired by the reference, and the Terms page's statement that prompts, atlases and code are original work should be read with that in mind.

## Not applicable

- **Refund policy:** OMNIQUIZ has no purchases, subscriptions or paid virtual goods. Not applicable while there are no paid transactions.
- **Cookie consent for tracking:** there is no analytics, advertising, pixel, session replay or third-party embed.
- **Accounts, authentication, deletion flow:** no accounts exist; nothing is held server-side about a person.
- **Server-authoritative scoring, database writes, scheduled endpoints:** none exist.
- **Sports and Music content:** planned, not shipped.

## Legal classification (NOT a legal opinion)

Sources: search-result summaries only. The primary texts could not be opened from this environment because the network proxy blocks those domains, so none of these were checked against the original wording. A reviewer can start from:

- CNPD informative note on cookies, 25 June 2021: <https://www.cnpd.pt/media/x2zdus50/nota-informativa-cnpd_cookies_20210625.pdf>
- Decreto-Lei 7/2004, consolidated text (Diário da República): <https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/2004-73199154>
- Decreto-Lei 82/2022, 6 December (Diário da República): <https://files.dre.pt/1s/2022/12/23400/0010900132.pdf>

| Question | Classification |
| --- | --- |
| Lei 41/2004 art. 5 (ePrivacy): prior consent for storing information on a user's device, with an exemption for storage needed to provide a service the user explicitly requested | LIKELY NOT REQUIRED for the current functional storage; NEEDS HUMAN/LEGAL REVIEW |
| GDPR: request metadata such as IP address is handled by the hosting infrastructure; the application stores no answers or identifiers | CONDITIONAL; NEEDS HUMAN/LEGAL REVIEW (role of the operator versus the host) |
| Decreto-Lei 7/2004 art. 10 ("Disponibilização permanente de informações"): permanent availability of provider identification | CONDITIONAL on whether a free game is an information-society service under the decree; NEEDS HUMAN/LEGAL REVIEW |
| Decreto-Lei 82/2022 (transposes Directive (EU) 2019/882): accessibility requirements for certain products and services, effective 28 June 2025 | CONDITIONAL; scope for a free, non-commercial game and any microenterprise exemption NOT verified |
| Copyright, trade marks and database rights for film, character and person names used as answers | NEEDS HUMAN/LEGAL REVIEW |
| Consumer refund and distance-selling rules | NOT APPLICABLE |
| Minors | No age-specific feature exists; not assessed |

## Owner input required

1. Decide whether the remaining presentation similarities are acceptable (Red item above), and whether the removed third-party screenshots and look-alike images must also be purged from Git history.
2. Operator identity and contact address to publish in the Privacy Policy and Terms, and the governing law to name.
3. **Which host serves the site?** The repository's deployment configuration targets Cloudflare Workers, but the live demo linked from `main` is on `omniquiz-nine.vercel.app`. The Privacy Policy now says only "a hosting provider". Name the host there once confirmed, and state whether any platform analytics or request logging is enabled.
4. Origin and licence of the pixel art in `public/ocean/` and `public/ui/`.
5. **Do you control `omniquiz.com`?** The domain is hardcoded in `layout.tsx` (`metadataBase` and JSON-LD), `sitemap.ts`, `robots.ts` and in the share text produced by `GameExperience.tsx`. If it is not yours, every shared score advertises someone else's site. The code was left alone because the fix depends on your answer. The actual deployment target, any other custom domain and any bindings are not recorded in the repository, and the sandbox cannot reach the domain (its egress proxy returns 403).
6. The README names only the repository owner. Add the "what I designed and built" statement and any links you want; it was deliberately not written for you.

## External verification

- Whether the storage classification and provider-identification duties apply, by a Portuguese or EU lawyer.
- Licences for the visual assets listed above.
- Live behaviour of the deployed site (headers, HSTS, edge caching), which could not be probed from this environment.
