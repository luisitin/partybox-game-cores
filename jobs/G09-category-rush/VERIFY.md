# Verification

## Initial milestone, 2026-10-08

| Exact command | Actual result | What it catches |
| --- | --- | --- |
| `npm install --ignore-scripts` | 11 pinned packages installed | Reproducible development/runtime dependency setup |
| `npm run generate` | Manifest plus answer/review/scores/done fixtures generated from actual core | Missing phase artifacts or fake fixtures |
| `npm run typecheck` | PASS, strict ES2022 exact contract types | Wrong game, event, player, RNG or envelope types |
| `npx tsx --test --test-name-pattern='normalization:\|score cancellation\|settings clamp\|pause ignores\|unknown prototype\|views never\|reducer is total\|manifest exact\|bot strategies' tests/core.test.ts` | 9/9 PASS | Articles, accents, numbers, plurals, fuzzy grouping, votes, duplicate/repeated cancellation, early/stale timers, pause/resume/drop, hostile ids, secret privacy, totality, manifest schema, fixture coverage and bot hidden-information independence |
| `npm run build:play` | Initial actual-core inline page, 407,979 bytes | External assets or unbundled shell/core |
| `python scripts/browser-performance.py` | Both strict 600-frame profiles PASS; desktop 60.0028 fps, phone 4× 60.0027 fps, both p99/max 16.8 ms; videos below 1 MB | Real consecutive RAF frame drops, runtime requests, errors, provenance drift |

The initial browser proof is bound to HTML SHA-256
`3ce64d2667bc19f930cd6ea8902106e444b4fe61c34e5616dd6b60864d0e8307`,
archived under `evidence/browser/milestone-initial/`.
Source changes after that measurement require a final bundle and new proof.

Content schema/drift tests exposed a compact duplicate and semantic membership
issues; the authoritative authored source is corrected, and regeneration awaits
the CPU isolation window. These are pending checks, not delivery claims.

## Mandatory delivery checks in progress

`npm test` includes a different normalization/Levenshtein/graph/per-seat scoring
implementation across 10,000 generated cases; 7,000 games (1,000 for every roster
2–8) with state restored after every event; seeded property checks for 1, 2, 3
plus 1,000 generated seeds; all nine contract invariants; real schema validation
and content drift; and pure-source scans. A second deterministic replay and full
view/size checks run on seeds 1–3 at each roster, while dedicated privacy/fuzz
tests cover every phase and all player/spectator roles.

`npm run mutations` temporarily changes one actual production source at a time,
runs the targeted behavior suite and restores the source in a finally block.
The planned 25 mutants and their real killed/survived results are recorded by the
script in `evidence/mutations.json` once run.

`npm run bots` runs 2,000 seeded three-round duels per adjacent skill pairing,
alternating seats. It records wins/ties/mean scores and fails unclear separation.
`node scripts/browser-check.mjs` exercises the real offline file on desktop and
phone, complete hot-seat and 2–8-seat bot games, privacy, accessibility, timers,
host controls and zero runtime network requests.

Final results, 30 content hand spotchecks, byte-identical regeneration, checksum
verification and exact-head CI status will be appended before delivery.
