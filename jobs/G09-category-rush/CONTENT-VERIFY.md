# Content verification evidence

Run date: 2026-10-08 UTC. Commands below run from `jobs/G09-category-rush/`. The complete game checks, media and fixture checks belong to the worker's VERIFY.md; this log covers authored content only.

| Check | Exact command | Result | Detects |
|---|---|---|---|
| Two deterministic content regenerations | `node scripts/generate-content.mjs && sha256sum content/categories.json content/categories.ts > /tmp/g09-content-final-one.sha256 && node scripts/generate-content.mjs && sha256sum -c /tmp/g09-content-final-one.sha256` | PASS; both files report OK; both runs report 320 original categories, 20 letters, 3767 curated examples. | Order drift, accidental generated edits, unstable regeneration. |
| Two deterministic schema regenerations | `npx tsx scripts/content-schema.ts && sha256sum content/categories.schema.json > /tmp/g09-schema-final-one.sha256 && npx tsx scripts/content-schema.ts && sha256sum -c /tmp/g09-schema-final-one.sha256` | PASS; generated Draft 2020-12 schema is byte-identical; category pack parses each time. | Schema drift and malformed authored structure. |
| Content checks | `npx tsx --test tests/content.test.ts` | PASS, 4/4 tests. | Actual JSON Schema validation, schema/TypeScript/JSON consistency, malformed bank keys and arrays, missing letters, undersized pack, unexpected properties, unsupported schema keywords, repeated IDs/prompts, normalized duplicate bank entries, wrong initial letters and source drift. |
| Strict TypeScript | `npm run typecheck` | PASS, exit 0. | Type errors across core, scripts and content tests. |
| Thirty seeded hand membership checks | Python 3: `rng = random.Random(909); selected = rng.sample(pack['categories'], 30)` then `rng.choice([answer for bank in category['answers'].values() for answer in bank])` for each sampled category, followed by direct Exa fetches of the two sources recorded per row. | Thirty inspected rows passed, two after clarification: `trimmer` → `nail trimmer`; toy `dog` → `pull-along dog`. All 30 original selections, observations and exact source URLs are in SPOTCHECKS.md and SOURCES.md. | Semantic bank errors, context ambiguity, overbroad definitions and source disagreements; does not prove every bank answer. |

The first content-test run intentionally exposed a compact duplicate (`potholder` versus `pot holder`). The authoritative authored source was corrected and the final full suite above passed. Manual review also replaced the shuttlecock sport `badminton` with the ball sport `pickleball`, clarified a toy answer, and replaced a brand-like lip-care term with `lip salve`. The final accepted artifacts below include these repairs.

## Initial milestone accepted content hashes

Command: `sha256sum content/authored.mjs content/categories.json content/categories.ts content/categories.schema.json`

```text
6ed1e981cf4ffe2ea0c8d3019cf46a89a615cc0be9a03bce2f3182f7d067924b  content/authored.mjs
b24b0fa3dfb6de88d4639a8423861bd6de0e71e04b59fa0411879fa6303d1e52  content/categories.json
be63b334a080dabe5299802fd507a502043a15cd38bd0b119f7a53f18ef89cb5  content/categories.ts
eeac6bfb0d33f6d800e6dfc75e8db544cd67656d47b47687c90c9adea5bddb4c  content/categories.schema.json
```

Every allowed letter has at least twelve available prompts; observed coverage is 38–266 prompts per letter. Examples are manually curated semantic alternatives, not generated adjective padding. Some supported category/letter banks contain only one example; the bank is deliberately illustrative and the group can accept alternatives. Four-answer breadth is a possible later improvement if bot duel evidence or play reveals excessive collisions.

No runtime network, external datasets, source prose or source assets are introduced by the content pipeline. Generation and schema scripts run at development/verification time only. `npm test` includes these tests through its `tests/*.test.ts` pattern. CI should additionally run `node scripts/generate-content.mjs --check` and `npx tsx scripts/content-schema.ts --check` to reject generated-file drift.

## KEEP GOING round 2: frozen authored bank expansion

The retained baseline is commit `b1663d9`. The original authored source is archived in `evidence/breadth-baseline-authored.mjs`, and its regenerated baseline pack is `evidence/breadth-baseline-content.json`. Its SHA-256 exactly equals the original recorded pack hash. The worker retained the exact original core in `evidence/breadth-original-core.ts`. Current frozen data adds **388 manually selected examples across 32 prompts and 173 existing letter banks**. All 320 prompts, category metadata, supported letter keys, baseline examples and their ordering are unchanged. Runtime still has no I/O or network.

| Same-seed bank-only measure | Baseline | Expanded banks |
|---|---:|---:|
| Curated examples | 3,767 | 4,155 |
| Singleton banks / 2,565 | 1,694 | 1,589 |
| Banks with at least four examples | 60 | 130 |
| Banks with at least eight examples | 0 | 10 |
| Median bank width | 1 | 1 |
| Submitted answers in 200 rounds | 17,880 | 17,955 |
| Duplicate-owner rate | 99.6588366890% | 99.5265942634% |
| Actual awarded unique points | 61 | 85 |
| Mean points per game / per seat | 0.305 / 0.038125 | 0.425 / 0.053125 |
| Exact state/answer replay matches | 200 / 200 | 200 / 200 |
| Distinct answer sheets / final states | 200 / 200 | 200 / 200 |
| Own repeats | 0 | 0 |

The gain is **24 unique points (+39.3442622951%)**. Of 200 paired rounds, 21 improve, 3 worsen and 176 tie. This is a bounded gain, not a claim that the large-table collision problem is solved. The median remains one and most submitted answers still collide. The worker separately measures a public-seat Strong strategy change; its final combined report is `evidence/breadth-after.json`. The causal authored-bank comparison deliberately uses `evidence/breadth-bank-only.json`, whose core/scoring/matcher/experiment hashes equal baseline.

Protocol `eight-sharp-one-round-200-v1` uses eight connected Strong bot seats, game seeds `65536 + seed` for seeds 1 through 200, one 30-second round, and independent per-seat streams seeded `(seed * 8191) ^ (seat * 104729 + 0x76ad)`. It drives the actual reducer, actual bot API and actual timer events; it never substitutes a scoring or bot implementation. Each game is independently replayed and the full answer-sheet/state hashes must match. Rows retain seed, letter, twelve category IDs, submitted/duplicate/awarded counts, all eight scores and both hashes. All 200 letters and category layouts match before/after, verified by the comparison script.

| Check | Exact command | Result / detects |
|---|---|---|
| Original eight-seat baseline | `npx tsx scripts/breadth.ts --label=baseline` before authored changes and with original core | 200 games and 200 exact replays; retains raw actual-core receipts and source/data hashes. |
| Frozen bank-only after | `npx tsx scripts/breadth.ts --label=after` after semantic cleanup and before any strategy edit; retained as `breadth-bank-only.json` | 200 same-layout games and 200 exact replays; 85 points. |
| Paired comparison / schemas | `npx tsx scripts/breadth-compare.ts` | PASS; 388 additions, 32 categories, 173 banks, 21/3/176 paired results; fails on changed layouts, mechanics hashes, baseline-order loss or pack/report mismatch. Emits report and comparison JSON Schemas. |
| Regenerate all current and archived content twice | `node scripts/generate-content.mjs`; `node scripts/generate-content.mjs --baseline`; `npx tsx scripts/content-schema.ts`; `npx tsx scripts/breadth-compare.ts`; hash all seven emitted JSON/TS/schema files; repeat all four commands; `sha256sum -c /tmp/g09-r2-regen.sha256` | PASS; all seven files byte-identical. |
| Schema and substantive expanded-bank checks | `npx tsx --test tests/content.test.ts tests/breadth.test.ts` | PASS, 6/6. Independently validates all three measurement reports, baseline pack and comparison against emitted JSON Schemas; rejects malformed row counts; verifies score/count totals, seed coverage, bounds, retained support and no added core-equivalent answers. |
| Strict TypeScript | `npm run typecheck` | PASS. New schemas, comparison and tests compile with the full job. |
| Thirty seeded changed-row hand inspections | Python 3 `random.Random(2032)` sampling followed by direct live fetches of exact source pairs | Complete; table and precise observations in `SPOTCHECKS-R2.md`. Two independent sources per row; extraction/inference limits explicit. No selected row substituted after sampling. |

Manual review before freezing discarded aliases, branded names, ambiguous category fits and the concrete errors listed in the spot-check log. Unsampled additions are original everyday curation **from knowledge, unverified**, not represented as thousands of independent source checks. This is illustrative bot vocabulary; valid human answers remain subject to group voting, and unfamiliar answers still get bot abstentions.

### Frozen bank-only hashes

```text
34608c2cc9d9415286fa781572842535946912727af68ee75b44545735e4380d  content/authored.mjs
5ae665bbbafc1a1bf8d7f4a692761c9ede63ab74a7e6d3f8c62a3300e7148dea  content/categories.json
e78c84f1aae2f43f1c21922c1d2bcfff84560c96158dfed0e0fc8546a86c0851  content/categories.ts
eeac6bfb0d33f6d800e6dfc75e8db544cd67656d47b47687c90c9adea5bddb4c  content/categories.schema.json
11ba146589fff4930f7f7b7bb612fed845de328138e5b4f0d242639aa7611d38  evidence/breadth-baseline.json
a50243e5dcd51f12126bdb7f055357f565b644c7c3e49865b93bbb05320956b2  evidence/breadth-bank-only.json
b24b0fa3dfb6de88d4639a8423861bd6de0e71e04b59fa0411879fa6303d1e52  evidence/breadth-baseline-content.json
6771bd78e02f8ce26a9729f879adf21ac393e7ea78719ac0455a2b48dbf9deed  evidence/breadth-comparison.json
56023abb6c3573ba847723ea1821a3f0af5f5e7b12d41ac6ed3af7f5a834ecce  evidence/breadth-report.schema.json
9f99fe08a93c229904db662f9f25fa1ef2e82ff89e558640e728b744fc347abb  evidence/breadth-comparison.schema.json
```

`node scripts/regenerate-breadth.mjs --check` reproduces the historical baseline and bank-only reports in an isolated temporary tree. It uses the exact archived original core, original experiment script, archived original authored source for baseline and current frozen source for bank-only. Its checks compare the complete generated report bytes, including every row and original source hash. It never edits the current worktree or combined strategy report. Both content packs regenerate from original authored modules.

Historical raw-report repeat result: **PASS twice, exit 0 both times**, with `node scripts/regenerate-breadth.mjs --check`. Each invocation printed `baseline: 200 actual-core rounds reproduced byte-identically` and `bank-only: 200 actual-core rounds reproduced byte-identically`. The tracked runs used PGIDs 118516 and 118896; both completed, and no owned heavy process remains. Thus the complete original baseline and bank-only report bytes, not only aggregate counts, reproduced on both runs. Archived/report current SHA-256 values above remain unchanged.
