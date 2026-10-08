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

## Final accepted content hashes

Command: `sha256sum content/authored.mjs content/categories.json content/categories.ts content/categories.schema.json`

```text
6ed1e981cf4ffe2ea0c8d3019cf46a89a615cc0be9a03bce2f3182f7d067924b  content/authored.mjs
b24b0fa3dfb6de88d4639a8423861bd6de0e71e04b59fa0411879fa6303d1e52  content/categories.json
be63b334a080dabe5299802fd507a502043a15cd38bd0b119f7a53f18ef89cb5  content/categories.ts
eeac6bfb0d33f6d800e6dfc75e8db544cd67656d47b47687c90c9adea5bddb4c  content/categories.schema.json
```

Every allowed letter has at least twelve available prompts; observed coverage is 38–266 prompts per letter. Examples are manually curated semantic alternatives, not generated adjective padding. Some supported category/letter banks contain only one example; the bank is deliberately illustrative and the group can accept alternatives. Four-answer breadth is a possible later improvement if bot duel evidence or play reveals excessive collisions.

No runtime network, external datasets, source prose or source assets are introduced by the content pipeline. Generation and schema scripts run at development/verification time only. `npm test` includes these tests through its `tests/*.test.ts` pattern. CI should additionally run `node scripts/generate-content.mjs --check` and `npx tsx scripts/content-schema.ts --check` to reject generated-file drift.
