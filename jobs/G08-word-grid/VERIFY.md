# G08 verification log

## 2026-10-08 research checkpoint
- `git clone --depth 1 https://github.com/<repo>.git /workspace/g08-research/repos/<name>`: read the pinned repositories recorded in source-receipts.json. Catches unread/incorrect cube and rules assumptions; no borrowed implementations or assets are delivered.
- `gh api repos/<repo>/contents/<path> -f ref=<commit> --method GET`: pinned source contents read, decoded and SHA-256 recorded. Native Git and GitHub REST work.
- `curl -fsSL --max-time 60 <registry tarball> -o <temporary file>`: English2.0, Spanish2.0, wordlist-English1.2.1 package contents/licences read. Receipt hashes identify exact inputs.
- Canonical Hasbro/Winning Moves HTTPS candidates: exit56/HTTP000 at08Oct07:52UTC, CONNECT denied. Read fallback sources instead under root RULES; never cite candidate contents.
- Original source baseline: 116 files, 5 GLB models, SHA-256 recorded before any edits. No production source edits at this checkpoint.

All implementation, measurement, schema, bot, mutation, browser and CI checks remain pending; no results invented.

## 2026-10-08 measurements and contract port
- `npm install --no-audit --no-fund`: locked tools install successfully, only zod is a core runtime dependency; React/Three are supplied-client build/test tools.
- `npx tsc --noEmit --pretty false`: strict ES2022, noUncheckedIndexedAccess, actual root GameDefinition types, clean at08:29UTC after port (later changes require recheck).
- `npm run build:words`: English274711, Spanish636513, common105840; frequency source/licences read live, two-run reproducibility still pending.
- `npx tsx start/research/measure.ts`: PASS. Five candidates x10000 seeds, no cap; exactly10000 independent trie/frontier comparisons,2383756 production paths separately checked; no invalidQu paths. All summaries in cube-study.json. This catches missing/reused/diagonal paths, prefix pruning errors and Qu scoring/face misinterpretation.
- `npm test` initial full run:151 tests passed but2 worker RPC errors -> FAIL, not an accepted green result. Second run118 tests passed but1 RPC error; also incorrectly launched the33 Vitest film tests with node:test -> FAIL. Restored their Vitest runner and added inter-case IPC yield; clean full rerun pending. No assertion/sample count was weakened.
- Profile `npx tsx .tmp/profile.ts`: 3-round seed17 games at2/6/16 players finish. Unused human-view work removed; measured16-player simulation wall time3946ms ->176ms on this workspace, same725-event trace. This is a development profile, not a bot-strength or frame-rate claim.

## Milestone 2
- `npx vitest run`: PASS17 files/151 tests, no worker errors,146.06s;200 chaos simulations included. Earlier RPC/runner failures remain recorded above.
- `npx vitest run start/verification/contract.test.ts`: PASS9/9,462ms. Actual root event/phase shapes, privacy, prototype seats, late join, frozen state, timer/pause order and pure server checks. Initial prototype-seat failure fixed explicit true checks; no relaxed assertion.
- `npm run typecheck` and `npm run build:play`: PASS. Self-contained original-client HTML14,199,235bytes at first build; no runtime external request URLs.
- `node start/verification/rebuild.mjs`: PASS2 runs,7 pack files, byte-identical and match committed content. Catches missing frequency input, unstable order, source/pack drift.
- Native Chromium local HTTP smoke: setup→shake→hunt→masked handoff→16 original grid cells, zero page errors. Disk is blocked by managed policy, not claimed checked yet. Full keyboard/capture checks still in progress.
- `npx tsx start/verification/bot-study.ts`: PASS2000-grid calibration and2x2000 complete default three-round leagues; both better levels win2000/2000. Per-level found shares and board variants in bot-study.json; not a human skill estimate.
- `npx tsx start/verification/seeded.ts`: in progress,1003 adversarial seeded replays completed, roster checks ongoing. No premature completion claim.
- `npx tsx start/verification/data-check.ts`: initial schema FAIL because supplied manifest uses name, not title; schema corrected to actual contract. Subsequent check result recorded at next milestone.

## Milestone 3
- `npx tsx start/verification/seeded.ts`: PASS1003 adversarial full-game replays, seeds1/2/3+1000 seeded draws; every event JSON-safe/deterministic/immutable, no score decrease/private-word leak,<=256KB. PASS16000 complete bot games,1000 EACH1–16 seats; four default-five-round idle games finish. Full scope and counts in seeded-report.json; one-round roster games are explicitly90seconds, leagues use default3rounds.
- `npx vitest run start/verification/contract.test.ts`: PASS11 tests;16 identities at maximum accepted lengths, five crowded Spanish5x5 rounds,12000 attempted submissions, peak86534bytes. Unknown VIP-stamped id cannot rule. Root GameDefinition has nine invariants, despite job's older seven label.
- `node start/verification/mutations.mjs`: first run23/25 FAIL; survivors round-total overwrite and unseen-beat ruling. Added direct two-round accumulation and future-word privacy/ruling regressions. Second run24/25 PASS; two-round test was added after its mutant executed, so isolated integrated run will recheck it. Individual planted bugs/failed assertions in mutation-report.json; do not count compiler/runner failures.
- `node start/verification/rebuild-fixtures.mjs`: PASStwo actual rebuilds/6fixtures, byte-identical and match committed states. Initial fixture-schema dispatch confused six-fixture report with seven-dictionary report; dispatch corrected, not weakened.
- `npx vitest run start/verification/rules.test.ts start/games/shake-up/__tests__/strings.test.ts`: PASS6 tests (5 published-rules/1 translation coverage). Pins minimum3/4, Qu-two-letter score, diagonal/last-cell paths, cancellation of accepted shared unknowns/dropped submissions, accumulation and reveal gating.
- Native browser initial attempts: ambiguous setup label FAIL, fixed explicit form names. CPU4phone frame gates FAIL53.485/55.030/54.693fps; a static-page control60.387fps. No threshold relaxed. Recording is now separate from benchmarking; profile5seconds53.54fps with6slowframes/max149.9ms identified clock-driven full Hunt rerenders. Original Hunt clock now a small isolated child; offline host renders only state changes. Post-change check still pending.
-30 random cube rows compared with pinned independent source tables; each row below and in spot-checks.json. Qu shown asQ for comparing six face tokens; repeated letters/cubes retained. Manufacturer edition labels remain unverified.

|Check|Set/row|Faces|Second source|Result|
|---|---|---|---|---|
|1|en-big-5/11|CEIILT|RobAWilkinson|match|
|2|en-big-5/20|ENSSSU|RobAWilkinson|match|
|3|en-big-5/8|AFIRSY|RobAWilkinson|match|
|4|en-big-5/6|AEEGMU|RobAWilkinson|match|
|5|en-big-5/3|AAFIRS|RobAWilkinson|match|
|6|en-big-5/18|EIIITT|RobAWilkinson|match|
|7|en-big-5/12|CEILPT|RobAWilkinson|match|
|8|en-big-5/7|AEGMNN|RobAWilkinson|match|
|9|en-big-5/24|NOOTUW|RobAWilkinson|match|
|10|en-big-5/19|EMOTTT|RobAWilkinson|match|
|11|en-big-5/10|CCENST|RobAWilkinson|match|
|12|en-big-5/15|DHHLOR|RobAWilkinson|match|
|13|en-big-5/21|FIPRSY|RobAWilkinson|match|
|14|en-big-5/16|DHLNOR|RobAWilkinson|match|
|15|en-big-5/5|AEEEEM|RobAWilkinson|match|
|16|en-big-5/16|DHLNOR|Megulus|match|
|17|en-big-5/18|EIIITT|Megulus|match|
|18|en-big-5/11|CEIILT|Megulus|match|
|19|en-big-5/24|NOOTUW|Megulus|match|
|20|en-big-5/25|OOOTTU|Megulus|match|
|21|en-big-5/3|AAFIRS|Megulus|match|
|22|en-big-5/22|GORRVW|Megulus|match|
|23|en-big-5/15|DHHLOR|Megulus|match|
|24|en-big-5/2|AAEEEE|Megulus|match|
|25|en-big-5/13|CEIPST|Megulus|match|
|26|en-master-5/5|AEEEEM|pf-boggle|match|
|27|en-master-5/1|AAAFRS|pf-boggle|match|
|28|en-master-5/20|ENSSSU|pf-boggle|match|
|29|en-master-5/24|NOOTUW|pf-boggle|match|
|30|en-master-5/13|CEIPST|pf-boggle|match|
