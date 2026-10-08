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

## Delivery candidate
- `npm run test:unit`: PASS19files/167tests (151original +11contract +5published rules),201.26s while isolated mutants ran; no RPC errors. Full CI also passes167assertions,50.88s. Original visuals check:29model/CSS/film files match sealed116-file baseline.
- `node start/verification/mutations.mjs` isolated: PASS24/25. Total overwrite and unseen-beat ruling now caught. Remaining minimum-exclusive solver mutation passes this targeted subset; the mandatory10000 independent production/reference diffs test exact minimum inclusion separately. No invented25/25 claim. Failure assertion names sorted for reproducible report; initial CI's old unsorted report hash failed (one checksum), all other gates passed.
- `npm test` CI run37757348394, source5d2418792e56cecfd4ee749fe653e04c9b3d723c: game/research/data/browser gates PASS, final checksum FAIL1generated report. Both cube/league/roster/mutation/rebuild gates rerun in that CI. Entire pipeline~8minutes under30-minute timeout. Correct report hash is refreshed for the next candidate.
- Actual disk Chrome CI run37757348394: desktop599frames/10001.8ms=59.8892fps, mean16.7215/p9516.8/max33.4ms; phone601frames/10012.5ms=60.0250fps atCPU4, mean16.6597/p9516.8/max16.8ms. Original-client/native-keyboard/arrow-focus/drag/cancel/private-handoff/other-phone/privacy/pause/reduced-motion/Spanish5x5/rosters1,2,3,8,16/results allPASS; outgoing0/errors0;408291Bcapture. Exact report in media/browser-ci-37757348394.json. Core/client/host source has no changes since that measured head; later changes are report/credits/verification plumbing.
- Managed local Chromium frame checks remainFAIL(~53.8fps), including a data-as-JSON.parse experiment18.51fps; experiment reverted. Static control60.387fps, profiled active/paused comparison also poor. These are not replaced with invented local60fps. Actual CI disk result satisfies the visual gate; no HTTP fallback in CI.
- `G08_BROWSER_URL=http://127.0.0.1:8768/play.html G08_NATIVE_ONLY=1 npm run test:browser`: PASSall native/input/privacy/locale/phase gates,0 outgoing/errors; explicitnative-only andHTTPpartial flags, nullframe metrics. Captured verified milestone2video1150330B; final repeat700498B. Native-only is rejected in CI; normal npm test includes both frame gates.
- `npm run typecheck`, `npm run build:play`, `npx tsx start/verification/data-check.ts`: PASSstrict ES2022; standalone14204150bytes with exact dependencies’MITnotices;32JSONfiles(schema,actual root manifest,all fixtures,static reports/media). No build needed to open checked-in HTML.

|Mutant|Planted behavior|Regression outcome|
|---|---|---|
|1|diagonals excluded|caught by 27 failed assertions|
|2|same cube adjacent to itself|caught by 1 failed assertions|
|3|reuse allowed|caught by 2 failed assertions|
|4|last board cell rejected|caught by 1 failed assertions|
|5|5x5 three-letter minimum|caught by 1 failed assertions|
|6|Qu loses u|caught by 1 failed assertions|
|7|seven-letter score four|caught by 1 failed assertions|
|8|long-word score ten|caught by 5 failed assertions|
|9|Spanish enye lost|caught by 1 failed assertions|
|10|dictionary accepts all|caught by 28 failed assertions|
|11|solver truncates full results|caught by 3 failed assertions|
|12|solver minimum becomes exclusive|survived targeted subset;24/25required gate passes|
|13|shared words earn points|caught by 3 failed assertions|
|14|unknown words earn points|caught by 3 failed assertions|
|15|round totals overwritten|caught by 1 failed assertions|
|16|duplicate submissions accepted|caught by 1 failed assertions|
|17|blocked words accepted|caught by 1 failed assertions|
|18|done players can submit|caught by 1 failed assertions|
|19|any finished human closes hunt|caught by 3 failed assertions|
|20|pause duration counted as word speed|caught by 1 failed assertions|
|21|non-VIP can accept words|caught by 1 failed assertions|
|22|unrevealed words rulable|caught by 1 failed assertions|
|23|other phone receives first seat words|caught by 1 failed assertions|
|24|early results exposed|caught by 1 failed assertions|
|25|hunt never leaves|caught by 25 failed assertions|

## Serialized-identity regression
- `npx tsx .tmp/identity-pressure.ts`: original128-code-unit bound FAIL;16seats/five idle Spanish5×5 rounds measured ASCII76430, CJK195470 and escaped-control374030bytes (>262144). Temporary diagnostic is not a delivered gate.
- `npx vitest run start/verification/contract.test.ts`: PASS12/12; new encoded-id stress covers16maximal ASCII/Unicode/control/lone-surrogate ids with long Unicode names/avatars across five rounds. Peaks82238/81246/79758/79758bytes. Initial/late-join over-budget identities are rejected. Existing12000-submission stress peak86534 remains passing. Full total becomes168assertions (151original+12contract+5published rules); exact-head full CI pending.
- `npm run typecheck`, `npm run build:play`, `npx tsx start/verification/data-check.ts`: PASS;14204355-byte page and32JSONschemas. Isolated mutation rerun PASS24/25,26failed assertions for the never-exit-hunt mutant; report/hash updated.
- Prior candidateaa065338fa2bfc7ffe530190b900e0ae6e9e7f95: entire pushCI37759859764 SUCCESS, including realfile browser and final hashes. Serialized-id fix requires a new complete CI run before PR.

## KEEP GOING round1
- Baseline exact head878f01a: push37762679661 and PR37763533665 SUCCESS. Full168assertions and all mandatory gates passed. Disk FPS60.027966desktop/60.029166CPU4phone,p95<=16.8ms,0network/errors, final hashes PASS. Receipt media/browser-ci-37762679661.json.
- `npx tsx .tmp/qa-player.ts`, `.tmp/qa-width.ts`, `.tmp/qa-tied-winners.ts`: diagnostic before values1889pxhandoff/962pxprivate label on390pxphone, clipped scores,964px16-avatar crown. Native16-turn game independently selects16distinct three-letter words; every score1,17reveal beats; proposed wrapping keeps crown369.22px.
- `npm run typecheck`: firstFAIL unknown CDP bounds type; explicit result type added, subsequentPASS. `npm run build:play`: PASS14204592bytes. `G08_BROWSER_URL=http://127.0.0.1:8768/play.html G08_NATIVE_ONLY=1 npm run test:browser`: PASSallnative gates plus full16-seat positive tie/long-name score/avatar bounds;0network/errors,1390903-byte milestone03clip. HTTP/native-only/nullFPS remain explicit; exact updated-source disk/FPS check awaits CI.
- `npx tsx start/verification/data-check.ts`:33filesPASS before partial-report addition; recheck below includes34JSONfiles. The new fit assertions would fail on the measured baseline, not a CSS source-text mirror.

## KEEP GOING round2
- `npm run typecheck`, `npm run build:play`: PASS;14204895bytes. `G08_BROWSER_URL=http://127.0.0.1:8768/play.html G08_NATIVE_ONLY=1 npm run test:browser`: PASSallprior native gates + actual confirmation dismissal preserves hunt/grid/submitted word; confirmation retains2-player/1-round choices, chooses different uint32seed and board, focuses setup heading.0network/errors,285845-byte clip04. Explicit HTTP/native-only evidence; full disk/FPS CI is running on milestone heads.
- `npx tsx start/verification/data-check.ts`, `sha256sum -c SHA256SUMS.txt`: rechecked after adding round2media;PASS35JSONfiles and all80file hashes. Owner protected originals unchanged.

## KEEP GOING round3
- `npm run typecheck`, `npm run build:play`: PASS,14205234bytes. `G08_BROWSER_URL=http://127.0.0.1:8768/play.html G08_NATIVE_ONLY=1 npm run test:browser`: PASSallnative/private/16-seat/restart gates plus explicit activeElement ready→grid checks and aria-describedby player/clock association. Before handoff focusBODY (round1diagnostic), now ready button then gridcell;0requests/errors,1009300-byte clip05. Report explicitly partial HTTP/native-only; full disk/FPS CI remains mandatory.
- `npx tsx start/verification/data-check.ts`, `sha256sum -c SHA256SUMS.txt`: PASS36JSONfiles and82file hashes after round3evidence addition.
