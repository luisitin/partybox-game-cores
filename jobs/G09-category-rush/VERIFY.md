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

## Current full local results

- `npm test`: **20/20 PASS**, strict types plus content/JSON Schema checks, a separately implemented scorer across **10,000 cases**, **7,000 games** restored after every event (1,000 at each roster 2–8), **1,003 property seeds**, all nine contract invariants, **2,000 event-fuzz cases**, and future-private-answer view/bot regression. Raw output: `evidence/core-tests.txt`. Wall duration 695.996 s includes an observed ~6m44 SIGSTOP for another worker's isolated frame run; approximately 4m52 active wall time, not a standalone CPU benchmark.
- `npm run mutations`: **25/25 planted production bugs killed**, each restored in a finally block. Full IDs and failure evidence: `evidence/mutations.json`.
- `npm run bots`: **4,000 three-round duels PASS**; Strong beats Medium 1,970/2,000 (98.5%); Medium beats Easy 1,981/2,000 (99.05%). Counts and mean scores: BOTS.md and `evidence/bot-matchups.jsonl`.
- Corrected content/schema each regenerated twice byte-identically. Four data tests pass, including independent evaluation of the actual Draft 2020-12 JSON Schema. CONTENT-VERIFY.md contains exact commands/hashes; the thirty random-row observations are below, with two actually read independent sources each in SOURCES.md.
- The initially measured licensed HTML was `0975fc8982ba5363d49151aecd9288ac06a0490353929ae2a34849c9d3d78113`, 439,586 bytes. The earlier claim that this exact file matched two builder runs was incorrect: the final regeneration check found escaped comment delimiters (`<!- -` and `- ->`) in that artifact. The unchanged checked-in builder emits valid `<!--`/`-->` delimiters. Two actual `npm run build:play` runs at 09:16 UTC produced the same correct SHA-256 `a209acd1d603518be5dd5d7bb9395423578bd10de75a7eb2122c506028526e08`, 439,584 bytes. Both complete MIT notices are inline and in the source package. Gameplay and strict-frame evidence must be refreshed for the reproducible file; the old evidence remains historical.
- `node scripts/browser-check.mjs`: **28/28 PASS** on that current HTML, desktop+phone full games and every bot roster 2–8; zero runtime network/errors. `node scripts/browser-clock.mjs`: independent review-step clock probe PASS, correctly handles a later deadline with unchanged phase startedAt.
- `node scripts/browser-performance.mjs`: first current licensed cold run **FAILED**: desktop 600 consecutive real RAF deltas, 57.419 fps, p99 33.4 ms, max 166.6 ms. Source/HTML fingerprints matched before/after and both notices were checked; zero errors/network. Runner stopped before phone. Failed raw samples/report/video are preserved; earlier milestone proof belongs to its own distinct hash. An unchanged confirmation is pending after the current CPU-isolation hold, with no gate relaxation.

The historical failure below is retained. Final local acceptance is recorded after the separate diagnostic; exact-head CI and KEEP GOING remain pending.

The fresh reproducible-file run used `node scripts/browser-performance.mjs`
on `a209acd1…` at 09:27:53.904–09:28:20.711 UTC, with unrecorded sampling
and separately recorded clips. Desktop passed: 600 actual consecutive deltas,
59.803843 fps, p99 16.8 ms, max 33.4 ms; its 316,990-byte clip had no errors or
nonfile requests. Phone 4× failed the unchanged mean gate: 600 actual deltas,
57.880765 fps, p99 16.8 ms, max 183.2 ms. Its six long intervals cluster
4.1–5.85 s after sample start. No phone clip was attempted after the failure.
`evidence/browser/failed-reproducible-first/` preserves the exact HTML, sampler,
report and unfiltered raw samples. Source stayed frozen and matched throughout.
This failure requires diagnosis, not changed thresholds or reuse of older proof.

## Push cadence deviation

Milestone `384b4ed` was committed at 2026-10-08 08:26:23 UTC and immediately
pushed; `8be851b` was committed at 09:05:39 UTC and immediately pushed.
The approximately 39m16s interval exceeded the required 30-minute push cadence
by approximately 9m16s. Exact remote transport timestamps were not retained,
so the precise timestamps above are commit records rather than claimed
push-second measurements. CPU-isolation holds and a required license rebuild
occupied the interval; a proof-pending source checkpoint should still have
been pushed. Subsequent checkpoints target 25 minutes, independently of test,
browser or license work. The next target is 09:25 UTC, before 09:30:39 UTC.

That target was met: checkpoint `5e0707c` was committed at 09:23:39 UTC,
with successful push completion observed by 09:23:47 UTC, and main claim
`33f306d` refreshed at 09:23:58 UTC. The next 25-minute target is 09:48:39 UTC.

## Separate phone diagnostic

`node scripts/browser-profile.mjs` ran on unchanged `a209acd1…` at
09:33:55–09:34:14 UTC. It retained 600 actual phone 4× RAF deltas, a
4,393,419-byte CDP/V8 trace, LongTasks and before/after Performance metrics.
This instrumented diagnostic is separate from acceptance evidence. Its worst
1,050 ms interval overlaps a 721.9 ms TimerFire event, whose tick FunctionCall
was 89.7 ms; layout/style work and minimal diagnostic RAF callbacks also show
large durations. Four recorded GC safepoints total only 0.67 ms (max 0.644 ms).
No evidence establishes the cause of the earlier uninstrumented 183.2 ms gap,
so no runtime optimization or threshold change follows from this diagnostic.
The raw trace and aligned report are in `evidence/browser/diagnostic-phone/`.
An unchanged, uninstrumented confirmation followed after the shared CPU hold.

## Final local acceptance

- `node scripts/browser-performance.mjs`: **PASS**, 09:41:53.562–09:42:24.762 UTC on reproducible HTML `a209acd1d603518be5dd5d7bb9395423578bd10de75a7eb2122c506028526e08` and unchanged sampler `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. All source fingerprints matched. Desktop retained 600 consecutive actual intervals: 59.507268 fps, p99 16.8 ms, max 83.3 ms; phone 390×844 at 4× retained 600: 60.002784 fps, p99/max 16.8 ms. No filtering or threshold changes. Separate clips are 303,055 and 233,152 bytes; both sampling and recording contexts had zero page errors/nonfile requests.
- `node scripts/browser-check.mjs && node scripts/browser-clock.mjs`: **28/28 gameplay checks and independent review-clock probe PASS** on the same final HTML, including both complete licenses and valid comment delimiters.
- `npm run build:play && sha256sum play.html` twice: **byte-identical**, 439,584 bytes and the exact final SHA above. `npm run generate` twice and `git diff --exit-code -- content/categories.json content/categories.ts content/categories.schema.json manifest.json fixtures`: **PASS**, generated content, manifest and actual phase states unchanged.
- `node scripts/generate-content.mjs --check && npx tsx scripts/content-schema.ts --check`: **PASS**, authoritative data and emitted Draft 2020-12 schema match.
- `npm run typecheck`: **PASS** after the added artifact test. `npx tsx --test tests/artifacts.test.ts`: **1/1 PASS**, 13.637 ms test body; recomputes raw frame totals/fps/p99, validates both thresholds, binds exact HTML/source/sampler/licensing hashes, all 28 functional results and both separate clip hashes/metadata/sizes/error/request streams. Alongside the prior unchanged 20/20 core/data suite, every local test has passed.
- `npx tsx scripts/checksums.ts && npx tsx scripts/checksums.ts --check`: **71 data/media files PASS**, including historical HTML, raw failed attempts, original samplers, diagnostic trace and all clips. `git diff --check`: **PASS**.

## Thirty independently sourced content checks

Selection: Python 3 `random.Random(909).sample(pack['categories'], 30)`, followed by `rng.choice([answer for bank in category['answers'].values() for answer in bank])`, on the initial 320-category generated pack. Read date: 2026-10-08 UTC. Sources: the matching two-source row in SOURCES.md. These are hand semantic checks, not automatic dictionary membership.

| # | Random row | Selected answer | Observation and result |
|---|---|---|---|
| 1 | hygiene-06 | trimmer | Collins and Dictionary.com define nail clippers as fingernail trimmers. Narrowed ambiguous `trimmer` to `nail trimmer`; pass after repair. |
| 2 | science-04 | orbiter | NASA's concrete Mars orbiter has Mars orbit insertion; the independent spacecraft overview defines planetary orbiting probes. Pass. |
| 3 | hygiene-10 | sunblock | Cambridge identifies the sunscreen sense; CDC explains sun protection for skin. Pass. |
| 4 | streets-02 | footbridge | Both dictionaries define a pedestrian bridge; Cambridge explicitly gives a crossing over roads. Pass. |
| 5 | kitchen-tools-05 | canister | Cambridge says food container with a cover; independent Dictionary.com explanation describes a fitted lid. Pass. |
| 6 | practical-actions-10 | wiping | Both dictionaries explicitly use wiping a table and removing dirt/crumbs. Pass. |
| 7 | parks-09 | collar | RSPCA walking guidance and independent Blue Cross public-place guidance mention collars. Pass. |
| 8 | landscape-03 | dune | National Geographic and Wikipedia both place sand dunes in deserts as well as other environments. Pass. |
| 9 | science-09 | air | Bill Willis explicitly lists transparent air; OpenStax describes visible light passing from water into air. Pass. |
| 10 | games-toys-04 | dog | Two independently described wooden pull-toy dogs establish the toy context. Made bank answer `pull-along dog` to avoid implying a real animal. Pass after repair. |
| 11 | music-10 | recorder | Britannica identifies the wind instrument; Yamaha explains blowing air to produce its sound. Pass. |
| 12 | art-08 | rib | Mudtools identifies shaping/finishing uses; independent Clay Art Center description explicitly says wet clay. Pass. |
| 13 | practical-actions-08 | pausing playback | Microsoft and MDN independently describe pausing media. Stopping audible media can quiet a room; no claim that all sources of noise stop. Pass. |
| 14 | school-08 | book | Writing Mindset teacher says teaching books are on her desk; Jodi Durgin independently discusses plan-book/manual storage in desk organization. Pass. |
| 15 | events-05 | gloves | Two costume suppliers independently identify theatrical/costume gloves. A performer may wear them. Pass. |
| 16 | breakfast-03 | milk | Two separate breakfast restaurant menus explicitly list milk as a drink. Pass. |
| 17 | practical-actions-03 | sifting | King Arthur and KitchenAid identify sifting in cake preparation; King Arthur stresses it is optional in many recipes. Prompt requires an action, not a universal step. Pass. |
| 18 | landscape-10 | ravine | Free State tourism describes a real echoing ravine; the Institute of Acoustics explains reflection from canyon walls. Pass. |
| 19 | travel-packing-10 | compass | REI day-hike checklist and National Park Service navigation essentials explicitly include a compass. Pass. |
| 20 | house-maintenance-01 | drill | Black+Decker driver-drill description includes household screw-driving; independent HiKOKI specification lists driver bits and screw capabilities. Pass with an appropriate driver bit. |
| 21 | house-maintenance-06 | peg | Two independently authored joinery guides describe pins/pegs holding wooden joints together. Pass. |
| 22 | jobs-01 | tailor | Whiteley and Zwilling independently describe sharp tailor's shears for fabric cutting. Pass. |
| 23 | produce-04 | cherry | Wikipedia calls it stone fruit; Cambridge describes one hard central seed and cherry stones. Pass. |
| 24 | breakfast-05 | congee | Good Food recipe calls it breakfast porridge and serves it in bowls; Wikipedia independently describes the breakfast use. Pass. |
| 25 | kitchen-tools-02 | apple corer | WMF describes a sharp serrated edge; independent Lee Valley describes its cutting blade. Pass. |
| 26 | digital-07 | biometrics | Apple describes facial recognition unlocking devices; Microsoft describes facial/fingerprint sign-in. Pass. |
| 27 | community-10 | herb | RHS reports shared community herb planting; Missouri Extension explicitly describes growing herbs with neighbors. Pass. |
| 28 | weather-08 | cafe | NWS allows shelter in a business; Met Office recommends indoors/enclosed shelter during thunderstorms. A substantial indoor cafe is a plausible business example. Prompt is not emergency advice. Pass with that contextual interpretation. |
| 29 | home-rooms-08 | swing | Home Depot YLLN and Target Arden descriptions concern different swing-cushion products. Household swings can have cushions. Pass. |
| 30 | produce-06 | cabbage | RHS explicitly identifies green varieties and cooking; Wikipedia independently describes common green cabbage and cooked consumption. Pass. |

Additional manual deck review corrected a shuttlecock sport in a ball-and-net prompt (`badminton` → `pickleball`) and removed a brand-like lip-care answer. Compact duplicate detection found `potholder`/`pot holder`; one was replaced. The seeded check sample is not a claim to have externally verified every answer.

## KEEP GOING round 1 acceptance

Initial PR head `b389ce4b1d312936588880c412b2bc885649db24` passed exact-head CI https://github.com/luisitin/partybox-game-cores/actions/runs/37758960937 at 09:53:09 UTC. Every job step passed, including 21 tests, full core/oracle/roster/property checks, mutations, duels, offline gameplay and regeneration. The next head contains 22 tests because a real-core paused-empty regression was added.

- `node scripts/browser-empty-review.mjs baseline`: PASS on archived round-0 HTML, actual review clicks 48/192 at two/eight humans. `node scripts/browser-empty-review.mjs after`: eight checks PASS on current `0a9940c5…`, zero clicks at both rosters; mixed nonempty categories retain eight private ballots, and pause/skip/end/two-round behavior remains correct. Fixture-only failures and the original available reports/output are disclosed in VERIFY-PLAY.md. After elapsed numbers measure score readback, not human time saved.
- `npx tsx --test --test-name-pattern='pause ignores an empty-review' tests/core.test.ts`: PASS for paused deadlines at both roster extremes, explicit resume deadline shift, stale timer rejection and VIP completion.
- `npm run typecheck`: PASS after the erased State annotation and artifact assertions. `npm run build:play` twice: byte-identical current SHA `0a9940c56f3b46c4c10df4ab4a8c7d62b7efb90950abce530e652885e0be53f3`, 439,850 bytes. Core/content unchanged.
- `node scripts/browser-check.mjs` and `node scripts/browser-clock.mjs`: 28/28 and independent stepped deadline PASS on the current source.
- `node scripts/browser-performance.mjs`: PASS at 10:16:48.265–10:17:19.487 UTC, sampler `274a54ce…` unchanged, exact source hashes match. All 600 raw consecutive deltas retained per profile; desktop 59.311184 fps/p99 16.8 ms/max 50.1 ms, phone 4× 60.003180 fps/p99/max 16.8 ms. Separate 320,822/213,656-byte clips, all measurement/clip error and network streams checked independently. Processes closed at completion.
- `npx tsx --test tests/artifacts.test.ts`: 1/1 PASS, 21.074 ms body; binds current frame/source/license/clip/28-check evidence and both actual 48/192→0 action reports, retained mixed ballots and zero runtime errors/network/dialogs. Workflow also runs the new eight-check pacing probe and independent clock.
- One checksum invocation was mistakenly run from repository root, where its relative script was absent; it failed with MODULE_NOT_FOUND and transient npx cache installation. Re-running from the job folder used pinned tsx 4.20.6 and passed. No repository dependency changed.
- `npx tsx scripts/checksums.ts && npx tsx scripts/checksums.ts --check`: all 102 data/media files PASS; `git diff --check`: PASS.

## KEEP GOING round 2 source/proof checkpoint

Round 1 exact-head CI run 37763189188 was GREEN on `b1663d9a513174780d1a7f171dbb19f4b432fc88` at 10:28:49 UTC. Re-read binding job/rules and ranked five player weaknesses before new work.

- `npx tsx scripts/breadth.ts --label=baseline`, then the unchanged-core bank-only `--label=after`: 200 actual eight-Strong-bot rounds, each replayed exactly. Preserved reports show 61 → 85 unique points after 388 corrected additions; same support keys/layouts, different authored-data hashes, identical old core. Bank-only report is `evidence/breadth-bank-only.json`. Independent manual review removed misspelled/incorrect examples including a tine instrument in the strings prompt and a dictionary in the besides-books prompt; new 30-row two-source log remains in progress.
- The same `npx tsx scripts/breadth.ts --label=after` on the separately changed public-roster strategy: 283 unique points, duplicate-owner rate 98.4227% versus 99.6588% original and 99.5266% bank-only; 200/200 exact replays and unchanged layouts. Sources/hashes retain each causal layer, with original real core archived. No private answers/ballots are used. Mean awarded points remain only 1.415 per eight-bot game; finite narrow banks still limit variety, and the relative gain does not conceal that absolute limit.
- `npm run bots`: all 4,000 final-source duels PASS. Strong/Medium: 1,970 wins, 11 losses, 19 ties, means 10.8685/5.6735. Medium/Easy: 1,981 wins, 11 losses, 8 ties, means 15.4000/6.3795.
- `node scripts/browser-receipts.mjs baseline`: three checks PASS on unchanged round-1 file. Both two/eight-human five-round real games award five points but expose only the latest one receipt, no selector. Exact original runner/hash retained with baseline report; zero errors/nonfile requests/dialogs.
- `npm run typecheck`: PASS after client and Strong selection edits. `npm run build:play` twice with `sha256sum -c .work/round-2-build-first.sha256`: byte-identical `0f4e64e9b2aeb3dc834dd0851bb303339c3930384300486fe45ab0ce4213b5f9`, 445,057 bytes. Sampler SHA `274a54ce…` unchanged. New full core/semantic checks, actual-page regressions, mutations and fresh strict frames remain pending. Old flat frame report cannot verify this changed file.
- New-source main gameplay regression PASS 28/28. The first empty-review fixture failed because it still expected the deliberately replaced label `Invalid · 0`; the actual new page correctly displayed `Wrong initial · 0`. Original failed report and exact runner are preserved in `round-2-fixture-empty-review-first`. Update the expected player-facing label and rerun; source remains unchanged.
