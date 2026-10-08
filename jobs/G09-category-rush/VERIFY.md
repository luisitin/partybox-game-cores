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

## Completed round-2 local acceptance

- `npx tsx --test tests/core.test.ts tests/content.test.ts tests/source.test.ts`: 21/21 PASS; 645.858 s wall under shared CPU, no SIGSTOP suspension (the requested STOP arrived after natural closure). Independent 10,000-case oracle: 88.219 s; 7,000 restored games: 552.013 s. All nine invariants, properties, fuzz and privacy pass. Raw output: `evidence/core-tests-round-2.txt`. The child's `npx tsx --test tests/content.test.ts tests/breadth.test.ts` passed 6/6; four overlap the 21, and artifact binding adds one, giving 24 unique local tests.
- `npx tsx --test --test-name-pattern='bot strategies|views never|future' tests/core.test.ts`: 3/3 source-specific secrecy PASS; raw output in `evidence/bot-privacy-round-2.txt`.
- `node scripts/browser-check.mjs`: 28/28 PASS; corrected `node scripts/browser-empty-review.mjs after`: 8/8 PASS; `node scripts/browser-clock.mjs`: PASS; `node scripts/browser-receipts.mjs after`: 4/4 PASS on exact 0f4 source. Both two/eight-human five-round games access five receipts instead of one, preserve score 5, keyboard selection and private-writing/future-repeat secrecy. All runtime error/dialog/nonfile-request streams are zero.
- `node scripts/browser-performance.mjs`: PASS, 10:55:31.746–10:56:02.839 UTC, 31.093 s inside the explicit extended quiet grant through 10:56:15. Both desktop/phone 4× profiles retain all 600 consecutive actual intervals: 60.002400096 fps, p99/max 16.8 ms. Separate clips are 296,924/198,176 bytes, with independent clean streams. Exact HTML, canonical sources, licenses and unchanged sampler hashes match. All processes closed.
- `npx tsx --test tests/artifacts.test.ts`: 1/1 PASS before mutations and again after their restoration; binds every current proof, actual action/receipt gains and three causal bank/strategy layers. `npm run typecheck`: PASS after restoration.
- `npm run mutations`: 25/25 actual production bugs KILLED on the new source/data and finally restored; IDs and failure evidence in `evidence/mutations.json`. No other core/data readers ran concurrently with temporary mutations.
- `npm run generate` twice and `sha256sum -c .work/round-2-fixtures-first.sha256`: manifest and four actual fixtures byte-identical. `npx tsx --test tests/source.test.ts`: 2/2 PASS after fixture update. Seven content/archive/comparison/schema outputs regenerate twice identically; commands/hashes are in CONTENT-VERIFY.md. Two tracked `node scripts/regenerate-breadth.mjs --check` invocations exit 0 and reproduce both historical 200-round reports byte-identically in isolated trees.
- Thirty actually read two-source changed-row observations are in SPOTCHECKS-R2.md; source conflicts are in CONFLICTS.md. Unsampled additions are candidly marked from knowledge, unverified.
- `npx tsx scripts/checksums.ts && npx tsx scripts/checksums.ts --check`: all final data/media hashes PASS; `git diff --check`: PASS. CI replays the final eight-bot experiment and both historical layers, then rejects report drift.

Round-2 proof head `c623ee98a9bbf1a88c1c30fb7c76c5cd53fdbce5` passed every
exact-head CI step in run https://github.com/luisitin/partybox-game-cores/actions/runs/37767733344 .
Its commit time was 11:04:58 UTC; the origin reflog records actual push at
11:05:03. Main claim `cc20ab1` was refreshed at 11:06:44. The next checkpoint
target is 11:30:03 and the hard 30-minute limit is 11:35:03.

## KEEP GOING round 3, baseline and pending work

- Re-read binding root RULES.md and JOBS.md G09; REVIEW.md ranks five remaining
  player weaknesses. The pure core/data remain unchanged while the offline
  adapter adds bounded explicit resume support.
- `node scripts/browser-resume.mjs baseline`: 7/7 PASS, closed
  11:19:04.185 UTC. Each actual two/eight-human answer, review and score session
  loses its game after reload, exposes no Resume and resets names to Alex.
  Scored sessions lose their actual one-point total and twelve category receipts.
  Exact accepted round-2 HTML and runner are retained with the baseline report;
  error, nonfile-request and dialog streams are empty. This records the old
  defect, not new-source acceptance.
- The read-only lexical probe used `sameAnswer` directly on nine irregular pairs
  recorded in REVIEW.md; all returned false. Contract and independent live
  grammar reads are documented in SOURCES.md. This is future audit evidence;
  no matcher change or broader SDK integration is claimed for round 3.
- The round-3 source/proof checkpoint includes the versioned bounded local
  save codec, independent real-reducer save/RNG tests and actual reload baseline.
  Client integration and all new-source checks are pending; no completed round-3
  LOOP entry is recorded. Global quiet holds allowed light source/docs only.
  The accepted round-2 file and its complete proof remain separately archived.
- Partial checkpoint `1d6ec75` pushed at 11:29:48 UTC (actual origin reflog);
  main claim `b1e27a4` refreshed at 11:29:57. All 164 then-current data/media
  hashes and `git diff --check` passed after every writer froze. It intentionally
  does not claim complete new-page proof.
- `npm run typecheck && npx tsx --test tests/client-save.test.ts`: PASS after
  release, 3/3 independent tests, 2.415 s test-process duration. Eight actual
  two/eight-seat two-round protocols retain each phase, drafts and paused state;
  malformed/stale/oversized/cross-reference saves are rejected, including unknown
  owners in reviewed entries. Thirty-six seed/counter combinations continue
  exactly through the real contract RNG. Raw output is retained in
  `evidence/client-save-tests-round-3.txt`. Owned group 123848 was naturally
  closed when observed at 11:30:20; no global frame run overlapped it.
- The added real five-round/eight-seat maximum-length Unicode regression
  exposed a valid-game rejection at the first 200,000-byte save ceiling.
  `npx tsx --test --test-name-pattern="maximum-length Unicode" tests/client-save.test.ts`
  failed in 0.659 s with `Saved game failed bounded validation`; owned group
  124746 was naturally closed by 11:35:06. The exact old codec, test, command,
  source hashes and raw failure are retained in `evidence/save-limit-first/`.
  A larger still-bounded ceiling and a passing full protocol are pending.
- Final bounded codec `3554023cef9122b262eb96c48ada2483fc7e432e2bd29a6b8d040db5c2ce48ff`
  uses at most 500,000 UTF-8 bytes and 500,000 UTF-16 code units.
  `npx tsx --test tests/client-save.test.ts`: 4/4 PASS, 2.491 s process
  duration. The legal five-round/eight-seat history stores distinct 80-code-unit
  Unicode answers in every category, awards all eight players 60 points and
  measures a largest save of **246,896 UTF-8 bytes**. Every scored snapshot and
  final state roundtrips. The initial 200,000-byte ceiling failure remains
  preserved; the final passing raw output is `evidence/client-save-tests-round-3.txt`,
  with the earlier three-test output kept separately. Group 125219 was naturally
  closed when observed at 11:36:52. Pure core and authored data hashes remain
  unchanged from accepted round 2.
- Candidate `084962917ba355e1c012253359f9f885ecab2a2b930f5493b1bcb46daf45f4aa`
  (455,505 bytes) passed strict TypeScript and two byte-identical builds.
  `node scripts/browser-check.mjs`, `node scripts/browser-empty-review.mjs after`,
  `node scripts/browser-clock.mjs` and `node scripts/browser-receipts.mjs after`
  pass 28/28, 8/8, the independent clock probe and 4/4 respectively.
- `node scripts/browser-resume.mjs after`: final uninterrupted 17/17 PASS,
  11:47:48.365–11:48:51.250 UTC, 62.885 s. Six two/eight-human writing,
  review and score cases retain exact before/after values and four lifecycle
  snapshots each. Private handovers, repeated reload, saved pause, near-expiry
  real submission, host controls/replay/discard, denied/quota/corrupt/stale
  storage, exact future mixed-bot RNG/output, selected-round gains and ballot
  keyboard focus pass. All errors/nonfile requests/dialogs are zero; groups
  127924/127936 closed naturally.
- Earlier runs retain two fixture-only whitespace/casing failures, one real
  intermittent 0:18→0:20 review-time discrepancy and interrupted native-time
  runs. Diagnostic repeats preserved time but did not establish a cause;
  no lifecycle workaround or runtime patch is attributed to those diagnostics.
  Exact reports/runners/HTML and hold metadata remain under the round-3 browser
  archives. Strict source-matched frame and clip proof is still pending.
- `node scripts/browser-performance.mjs`: PASS on frozen 084962…,
  actual 11:53:50.399–11:54:22.786 UTC, 32.387 s after explicit global grant.
  Desktop 59.903005 fps and phone 4× 59.902957 fps; both p99 16.8 ms and
  max 33.4 ms. All 600 actual intervals per profile are retained. Separate
  346,184/262,539-byte clips have independent clean request/error streams.
  Source, codec, builder, licenses and sampler hashes match before/after.
  Sampler `1ac72aab…` adds only the codec to source fingerprints; thresholds,
  consecutive sampling, workload and unrecorded measurements are unchanged.
  Node 128643/Chromium 128655 closed; only zombies remained at readback.
- Final `npm run typecheck && npx tsx --test tests/artifacts.test.ts`: PASS,
  artifact body 147.705 ms. It independently binds the new HTML/source/license,
  600-frame/clip, 28/8/clock/4/17 UI evidence, six exact restoration comparisons,
  privacy flags and measured gains. Pure core/data are unchanged from the full
  accepted round-2 21-test/oracle/7,000-game/property/secrecy, 25-mutation and
  4,000-duel proof; no unchanged expensive local checks were repeated.


Round-4 source/proof-pending checkpoint: after exact round-3 CI 37773541708
green on 87eb68c, reread/ranked five issues in REVIEW.md.
`node scripts/regenerate-plural-baseline.mjs` replayed 18 actual pre-fix games
(nine sourced pairs at both two/eight seats), restoring every event and replaying
all events. Each roster awarded 18 improper duplicate points, matching 0/9 pairs.
`npm run typecheck && npx tsx scripts/plural-protocol.ts` passes on matcher
74827b3d1851caffc384b420ac468ec771783e6858d6c885d2bdb19d72806e4b:
all 18 actual games replay exactly, all nine pairs match at both rosters and
each roster now awards zero points to the duplicate groups. The players
unanimously accept these answers; the protocol isolates duplicate adjudication
and does not claim random prompts semantically fit each noun.
The first isolated old-oracle launch failed before comparisons because the
copied contract could not resolve Zod; its exact startup failure is retained in
evidence/plural-oracle-startup-first.txt. The isolated harness now links the
pinned dependency at its root; the retained old 10,000-case differential is
running. The bounded fix, independent reference and lexical tests are authored;
full changed-source core/oracle/rosters/properties, mutations, duels, historical
reproduction, current breadth, new-HTML gameplay/frames/clips remain pending.
The prior accepted HTML and old experiment/core/matcher/reference are retained
under round-3-accepted and breadth-original-*; old three-layer bank/strategy
reports retain their actual matching semantics, with a separate lexical layer.
This is not a completed LOOP round and its pending CI may be red until the new
source-matched acceptance artifacts are collected.

Old 10,000-case differential now passed (86.596807s actual test body) on the
retained pre-fix matcher/reference. `node scripts/regenerate-breadth.mjs --check`
ran twice and reproduced all three historical 200-game reports byte-identically.
`npx tsx scripts/breadth.ts --label=after --output=lexical` runs the same actual
200 eight-Strong rounds on the new matcher and awards 283 points, with the same
98.422695% duplicate-owner rate; no inflated variety gain is attributed to the
lexical correction. `npm run bots` completed 4,000 new-source two-player games:
Strong/Medium 1,970 wins / 11 losses / 19 ties, means 10.866 / 5.6745;
Medium/Easy 1,981 / 11 / 8, means 15.397 / 6.379. This is adjacent-skill
separation at two seats, not an eight-player claim. Matcher SHA74827b3d…06e4b
was frozen throughout; exact raw outcomes are evidence/bot-matchups.jsonl.
The old three-layer reports keep matcher122be109…d78a7 and old experiment
source hashes, explicitly bound to retained breadth-original source files.

The full changed-source batch closed with 34/35 passes: all 10,000 hardest-
function comparisons, 7,000 restored games/all nine invariants, 1,003 properties,
2,000 fuzz cases, secrecy, codec and seven lexical tests passed. Only the new
independent JSON Schema evaluation failed on unsupported anyOf/minimum. Its
complete output is retained in evidence/core-round4-first.txt. The evaluator
was extended for unions and numeric/integer bounds; a second affected-schema
attempt exposed exclusiveMinimum, also retained in lexical-schema-second.txt.
The final evaluator handles emitted inclusive/exclusive bounds and integer
types, with negative/fraction/overflow/zero-event/invalid-roster malformed data
checks. All eight affected content/breadth/protocol/audit tests now pass; the
pure game and passed expensive comparisons were unchanged and not repeated.
The 62-case before/after audit and schemas regenerate twice byte-identically,
fixing 33 scored equivalent-pair failures and all 37 failed stem equalities;
news/new stays separate, with ambiguities and intentional fuzzy cases retained.
`npm run mutations` adds three genuine planted lexical defects (alias omission,
news protection omission, possessive composition omission) to the original 25.
Mutants execute isolated copies of the actual source/tests/contract, so their
patches cannot race the browser's frozen real source. Completion is pending.

Two builds of the corrected matcher produce the same be311b9653a3ad4b295745f
00d37dc5c3a72426480a51979459b410850985613 HTML, 456,288 bytes. Fresh real-page
28 gameplay, eight empty-review, clock, four receipt and 17 recovery cases pass.
`node scripts/browser-plurals.mjs baseline` and `... after` each pass 3/3: actual
public setup seed159 selects M/underground animal; two/eight humans keep the
mouse/mice answers through private ballots. Old two anonymous groups/two total
points become one shared group/zero points, revealing authors only in the scored
receipt. The initial closed-seed-details fixture error is preserved under
round-4-plurals-fixture-first; normal UI disclosure corrected the fixture only.
The accepted old report remains byte-identical, with retained-media.md mapping
its old video paths to exact round-3 archived clips. Strict600/clips pending.

Mutant group138607 reached five genuine kills, then was SIGSTOP for the
coordinated G04/G10 strict window. Because its 120-second child timeout includes
held walltime, the unfinished attempt was terminated while held at12:37:12;
all members became zombies. Partial output is preserved in
evidence/mutations-round4-cpu-hold.txt and is not counted as a completed suite
or a timeout-killed bug. A fresh actual 28-mutant run remains pending release.

Fresh`npm run mutations` afterglobalrelease completed28/28 genuinekills,
includingnewM26/M27/M28, withfullsourcefingerprints andisolatedActualSource=true
in evidence/mutations.json. No sourcechanged whilecurrentUIproof ran.
The earlier heldpartialattempt remainsunaccepted; onlyfreshcomplete run counts.

The unchanged local confirmation also FAILED: actual13:04:26.962–13:04:56.157,
desktop59.213035fps/p9916.8/max133.3PASS; phone4x54.964615fps/p9950/max266.6FAIL.
Both600raw series, exactpage/runner/report and343975-byte partialdesktopclip
are retained under round-4-frame-confirmation. Independentmanualreadback
13:07:07.821 verifies all sourcefingerprints/HTML match. No phoneclip collected.
No further blind unchanged local samples or speculative runtimechanges are planned.

The workflow now checks committed regeneration/hashes, installs the pinned
Playwright browser/encoder, then executes the SAME unmodified 1ac72 strict
600-frame/separate-capture runner on the actual GitHub host BEFORE the unchanged
artifact pass requirement. Hosted evidence is separately labeled by exact PR
head/run/attempt and source/runner hashes. Full original suites follow genuine
capture; all600 raw intervals and partial/full clips are uploaded even when
host capture fails. The artifact binder retains its passed=true and >=59fps/
p99<=17 requirements, validates hosted metadata and exact PR head, and all
local failures remain archived as failures. Fresh hosted evidence hashes are
computed separately after capture; committed static hashes are validated first.
This is a pending distinct-environment check, not a conversion of local failure
into pass or a gate relaxation. PR8 is restored to draft while acceptance is unresolved.

Round 4 completed with distinct genuine HOSTED visual acceptance on exact
`8c70a857fe7e4d0e35c57203562621bad10f8b00`, run 37782409140, attempt 1.
The SAME frozen be311 HTML and unmodified 1ac72 runner executed on the actual
GitHub host at 13:12:09.527–13:12:40.185 UTC. Desktop measured 60.002376 fps;
phone 4× measured 60.002940 fps. Both p99/max were 16.8 ms. All 600 actual
intervals per profile and separate 326,051/218,982-byte clips are retained,
with independent clean request/error streams and matching source/license guards.
Artifact 11552283013 was retrieved through the native GitHub artifact connector
after the shell client could not follow the redirect. ZIP SHA256 is
17cba3f654e6e3484de05a5b5e7ebd18ceedd017e584e934b5c4a840d27da321.
Every uploaded file matches the original host manifest; every captured source
fingerprint matches the frozen local source; all interval summaries were
independently recomputed. The original artifact tree, manifest, runner and
retrieval receipt are in evidence/browser/round-4-hosted-37782409140.
Canonical current visual acceptance is explicitly HOSTED. Both coordinated
local phone failures, their raw intervals, exact runners/pages, manual source
guards and partial clips remain failures; no variance cause is established.

Exact-head CI 37782409140 completed SUCCESS on 8c70a85: every original step
passed, including all 37 tests, changed-source oracle/rosters/properties/privacy,
28 genuine isolated mutants, 4,000 duels, deterministic historical/current
breadth, duplicate protocols/audit, and 28 gameplay + eight pacing + clock +
four receipts + 17 recovery + three plural UI checks. Final local
`npm run typecheck && npx tsx --test tests/artifacts.test.ts` also PASS; the
artifact test body took 63.763627 ms. The runtime/sampler were unchanged while
retrieving and binding evidence. This completion commit changes evidence/docs
only and still requires its own exact-head green CI before the next formal round.

Final completion integrity: all 259 data/media files pass SHA256SUMS.txt
regeneration and --check; git diff --check passes. Source, client, codec,
builder, sampler, generated content, manifest, fixtures and play.html have no
change from the genuine exact-head green hosted run. All evidence writers and
local browser/test processes are closed before staging. LOOP.md records exactly
one completed round-4 line; its measured player gain leaves the no-gain streak zero.


Source-unchanged completion 47e1adf / run 37784359281 FAILED its seventh recovery
check, double reload on a restored handover: expected 0:50, observed 1:00.
All six single-reload two/eight-human writing/review/scores cases passed, and
every preceding original strict/core/mutation/duel/data/gameplay/pacing/receipt
step passed. Exact old runner and unmodified failed-step log are preserved
under evidence/browser/round-4-hosted-recovery-first. The old workflow did not
upload its failed recovery JSON; no full boundary trace is claimed. A private
bounded diagnostic is pending and the workflow now always retains future
recovery reports, including failures. Runtime be311 is unchanged from the
actual 8c full 17-case green run. No cause or new formal KEEP round is asserted;
current exact-head green remains required.

The private bounded diagnostic `node .work/double-reload-diagnostic.mjs` ran
13:41:50.818–13:42:26.544 UTC, 35.474 seconds. All 20 repetitions preserve
0:50 and the draft, and all 80 post-client lifecycle snapshots report successful
saving without zero elapsed. Complete unfiltered snapshots/script/log remain
ignored under .work/double-reload-diagnostic.*. Diagnostic runner SHA256
0d85a8a191832982b32cd3fa61e6d900dd6ea94ab9159c09ea96de920890a647
and report SHA256
41fbdaa0d2e640c710d6c50b010f7c73ba630b99c960bbf6830c05ce8100b332.
Added reads/listeners may affect scheduling; non-reproduction establishes no
cause and is not acceptance evidence. Runtime/old reference runner stayed frozen.

The actual acceptance runner now adds atomic observations of timer, saved
snapshot, handover, save status and browser clock at seven double-reload
boundaries; all original actions and equality/privacy assertions remain.
The old accepted local report/runner are archived under
round-4-recovery-before-observations. One fresh full 17-case run on unchanged
be311 passes, actual 2026-10-08T13:44:07.921Z–2026-10-08T13:45:09.498Z;
errors/requests/dialogs remain zero. Its runner SHA256 is
e5fec44ac4988073f6b972fc89237e8e755206518850e4b72ec858dae1401458. The independent artifact binder checks the complete
boundary sequence, unchanged game/RNG/draft, frozen handover elapsed and equal
before/after timer text. `npm run typecheck && npx tsx --test
tests/artifacts.test.ts` passes (artifact body 62.455466 ms). Owned Node 147634
and Chrome 147646 closed; only zombies remain. No runtime defect or variance
fix is claimed, no extra LOOP line is logged, and exact current-head CI must
still pass before formal round 5. The workflow always uploads complete future
recovery attempts, including failures.


Exact e364a1b / run 37787335656 FAILED recovery case 8, saved host pause:
expected 0:50, observed 1:00. All seven preceding cases passed, including
double handover. Native GitHub artifact 11555756175 supplies the complete
failed report and exact e5fec44 runner, now archived under
round-4-hosted-recovery-second. ZIP bytes 371,694 and SHA256
2cab92babb5be8bf908041a17ff00dcd8c56baca19d87b5322d1febcfeca9a69
are recorded in the retrieval receipt. HTML and runner hashes match the actual
source. Double-handover observations preserve 10,018 ms across both reloads,
offline advance and both resumes; Ready saves 10,020 ms and displays 0:50.
The failed host-pause case had no boundary observations, so its earliest
divergence and cause remain unknown. This failure stays red and formal round 5
is deferred. A transient shell 401 reading the failed log did not block the
supported native artifact retrieval; no login or credential change was made.

The shared observation helper now also captures timer/save/state/clock/modal
boundaries for the exact host-pause case. Every original public action and
equality/privacy assertion is unchanged. The workflow runs actual fresh
recovery before the existing artifact binder, then all original suites, and
always uploads its complete report/runner. This allows current metadata to
bind to genuine current host evidence; no cached pass, skipped suite or relaxed
assertion is used. Runtime be311 and strict sampler 1ac remain unchanged.
No new local recovery run is claimed during the coordinator's G05 hold.
This is an honest observability/proof-pending checkpoint, not a runtime fix or
a new KEEP round.

Exact 709fa78036bbfa127f913ffb0308b70be01f12e8 / run 37790431928 FAILED
fresh recovery case 8, saved host pause: expected 0:50, observed 1:00.
The unchanged strict host runner passed before recovery. No later core suites
are claimed from this run because recovery deliberately precedes the artifact
binder. Native artifact 11555624087 supplies the complete failed report and
3034f765 runner, archived under round-4-hosted-recovery-third with retrieval
receipt. ZIP 431,501 bytes, SHA256 a59031771903f1eec527427b705089b6fe4a08279a65325864fc49388b696906.
Actual recovery ran 14:12:57.560–14:13:25.283 UTC. Atomic observations show
fake performance.now() 679 ms while saved elapsed/phaseElapsed/coreNow and
DOM timer represent 10,013 ms; public pause saves only 39 ms at fake clock
716 ms. Same timeOrigin/draft/game persist through all eight boundaries.
This is observed test-clock discontinuity for this exact attempt, not a
claim about older unobserved failures or local FPS variance. Production and
strict sampler remain frozen. An independent pinned scheduler and empty-page
control must support any harness correction; original actions and assertions
will remain required. No additional LOOP round or runtime fix is claimed.

Independent pinned-clock controls (diagnostic, not acceptance):
`node .work/clock-overlap-diagnostic.mjs` ran 14:25:43.616–14:25:43.622 UTC.
It evaluates the actual unchanged shipped ClockController in a VM; queued
embedder continuations force newer completion before older completion.
Callbacks observe 100 and 10,100 ms, then older completion rewinds 10,100 to
100 ms. Sequential nonoverlap ends at 10,100 ms. This demonstrates a possible
scheduler mechanism, not the schedule in every historical failure.
`node .work/clock-browser-control.mjs` ran 14:25:45.102–14:25:48.779 UTC,
3.362263 seconds excluding browser launch. Actual empty Chromium pages each
run 40 awaited 10,000 ms advances with native Node 25 ms scheduling gaps.
Both complete 161 unfiltered callback/before/after samples; default auto clock
has 21 backward steps (largest 9,991 ms), explicitly paused clock has zero.
No errors or requests; dependency and HTML hashes stay unchanged. Scripts and
full reports are archived under evidence/browser/round-4-clock-control.
Pinned generated source SHA256 e6dc352ceb479c45c1872b36796d55b6544fd545034129c9fec00e5fff1c05b3,
Playwright1.56.0/Chromium141.0.7390.37. No third-party full source is copied.
VM report SHA256 9bb116922ea4850c8f19d287abe5a3017bb2c43c41fba1ecb299b3d06ad666fd;
browser report SHA256 b8f281785aff975f2f159d8bd0fe1117d90a152595758041fabf1e469995b1e6.

Only after those controls supported the method, the recovery harness installs
a fixed epoch and explicitly pauses its clock before app timers exist. Original
17 public-action sequences, fastForward amounts, exact elapsed/draft/ballot/
privacy assertions remain unchanged. Binder requires matching clock metadata.
Production HTML and strict frame sampler remain untouched. Current recovery
runner e006063592f45019d4f322fd28183e64343a5c54dc478e9c3174d6f86577cae0
is authored but its full acceptance/typecheck are pending the coordinator's
short G05 CPU window. No fake-clock patch affects native-wall gameplay or RAF
measurement. No runtime correction or new LOOP round is claimed.

Fresh corrected acceptance: `node scripts/browser-resume.mjs after` ran
2026-10-08T14:32:43.602Z–2026-10-08T14:33:46.152Z, 62.550 seconds,
and passed all 17 original checks on unchanged be311 HTML. NodePGID152626
and ChromiumPGID152638 closed normally, EXIT0; active processes are absent.
Double-handover and host-pause observations preserve exactly10,000ms elapsed
and0:50 before/after, with nondecreasing fake clock through all reloads and
120,000ms advances. Private drafts, ballots, scored receipts, storage-failure
behavior, near-expiry submission and future bot RNG/output all remain checked.
Errors, requests and dialogs are empty. `npm run typecheck && npx tsx --test
tests/artifacts.test.ts && npx tsx scripts/checksums.ts && npx tsx
scripts/checksums.ts --check` passes; artifact body109.331439ms, 279 files.
The binder now independently checks all eight host-pause boundaries, exact
frozen elapsed/draft/RNG, same timeOrigin and monotonicity for both observed
recovery sequences. Every prior failed report/runner remains archived.
No runtime change, strict FPS rerun, relaxed original assertion or additional
formal KEEP round is claimed. Genuine exact-head hosted strict600, fresh17
and all original core/data/mutation/league/UI suites remain required.

Clock checkpoint be02436467f78709bcf39d7a8437d2a10afe3778 pushed at
actual origin reflog14:36:23 UTC, 25m01s after709. The25min target was missed
by1second; the30min rule was met. Main-only claim push first rejected because
another main claim advanced; normal pull --rebase origin main preserved every
other line, then unpublished G09 claim timestamp amended and pushed normally.
Claim753dc54: G09 2026-10-08T14:37:13Z codex-category, transport14:37:14.
Exact run37793856539 is in progress. PR8 remains draft. Formalround5 remains
deferred until full exact-head green. Next checkpoint target15:01:23/hard15:06:23.

FormalR5 begins only after exactbe024/run37793856539 fullSUCCESS; actual logs verify37/37tests, independent10koracle61.287730s,7krestored/all9invariants195.522898s,1003properties,28actualmutants,4kduels,28+8+clock+4+17+3actual-pagechecks. Genuine hoststrictartifact11558310806 (ZIP1,044,403bytes SHA d3df8341a4d1f52c349061a1d14a35eb2f7571a49396191fb72487a5bb861d5e) independently matches everyoriginalmanifest/currentfingerprint, raw600summaries and validVP8clips; archive round-4-hosted-37793856539 retainsuploadedmanifest andreceipt.
R5 registered plan `node --import tsx scripts/selection-experiment.ts plan` freezes800 heldoutseeds40eachallowedletter selectedonlybyfirstletter, fixtureSHA d2857a0b8965729acb2d065468922e903d44a9cafad5a863c15c049e5ef64e25, baselinecore320. Actual `... baseline` completed3000games plus3000independent restoredreplays, EXIT0, beforelivecore changes. Allsixcohorts arepresent; pilot totals748/750/283 andheldout3102/2978/1093. ParentPGID155985 wasalreadyabsent whencheckpoint SIGSTOPwasattempted; no pausedtime isclaimed. No candidateiswired yet. Unusedselector andindependent fixture/oracle source areauthored, testsPENDING. ChildpureCPU selectororacle PGID156056/156067 isSTOPPEDforcheckpoint writerfreeze; itselapsedwalltime includeshold and no partialresult isaccepted. Baselineclosedwithoutahold. NoLOOP5 gainclaim or staleproof reuse.

Checkpoint strictTS first failed TS7034/TS7005 on the experiment's untyped rows accumulator. Added its explicit ReturnType<typeof play>[] annotation; this is an erased type-only correction. The actual already-completed baseline's original b34a3905 experiment source is preserved verbatim as evidence/selection-baseline-experiment.ts, so its measured sourcehash staystruthful. Current baseline will be regenerated twice with the strict typed script before candidate wiring; schema/byteidentity and selectororacle remainPENDING. No row or result was manually rewritten.

FirstK3 actualcandidate3,000games+3,000replays completed EXIT0; eightheldoutmean1.36625→2.710/zero tables338→223of800, but preregistered10%bankcoverage guardFAILS four2156/2397 andeight2157/2397. Fullsource/report/inputs/reference preserved under selection-k3-first, no rounding/relaxation or playergainclaimed. Livecore restoredactualold320 before registering a separate K3/four-exploration revision withfresh balancedheldoutseeds, unchanged guards. Original800heldout isnowdevelopment information; it isnot reused asuntouched confirmation. CurrentHTMLbe311 stillunchanged.

Revised R5 actual baseline3,000games+3,000restored independent replays reproduced twice byte-identically (e51c2d6e), old320livecore unchanged throughout. Revised actual candidate3,000+3,000 completed on a62e5fff/1fe2cfaf, no holds. Registered fresh800 heldout fixtureff2ba2d8 was frozen before outcomes; previous800 is development information. Independent12fixtures+10koracle (27.307s), targeted strengthened exploration fixture, five integrations (2.2925s) and strictTS pass. All owned groups closed. Comparison regeneration and --check pass, every original threshold retained; deliveryComplete:false. Heldout8 mean1.3175→2.42375/zeros355→244, coverage2,211/2,389;13 four-seat and17 eight-seat games worsen. Full required changed-source tests/mutations/duels/artifact schemas/newHTML/functionals/strict acceptance remain pending; no LOOP5 or completed gain claimed. Current oldbe311 page/1ac acceptance remains bound only to the old source.

Actual bfb push15:04:21 was27m58s afterbe02414:36:23:25min target missed2m58s,30min met. Main-only claim ba88439 refreshed15:05:12, transport15:05:14. This checkpoint targets15:29:21/hard15:34:21 and freezes writers before checksum/push.

Checkpoint632f16d pushed15:29:27 UTC,25m06s afterbfb (25min target missed6s;30min met). Its final checksum command was mistakenly launched from the repository root rather than the job directory, failed MODULE_NOT_FOUND, and a semicolon-chained commit still ran. The preceding312-file job-directory checksum check passed, but the newly frozen schema was not included. This is a command/cwd error, not a passing checksum claim. Correcting the checksum in the job directory with fail-fast commands in an immediate follow-up; no report/core/study source changed.

Immediate checksum correction e0d18e3 actualpush15:30:06; final313files checksum+check andgitdiff checkPASS. Latestmainclaim4399a5f transport15:30:17, after2e54ee2 transport15:29:56 for632f checkpoint. Nexttarget15:55:06/hard16:00:06. Exacte0CI37801291933 failed deterministicregeneration: schemas/typecheck/manifest+4fixtures passed, onlyplay.html differed (expected456,648B); all downstreambrowser/core skipped. Fullactualjob113393895363 log retainedprivate .work/e0-full-job.log SHA16f6c0d196b5519e2db08427172c5ec1f62bc27f03c61bbb3efc39b3509b0e92; publicreceiptselection-checkpoint-ci-failure.json. No fixture defect/toolblock or acceptance inferred.

Chosen revision corea62e5fff/helper1fe2cfaf remainstable. Second actual3,000games+3,000replays candidate regeneration EXIT0/cmp0, SHAec190fcbdae74f756f53ca673c44e61b135618215518b029009146c8a8f6b1f9. Independenthand-authored reportJSONSchema and6,000raw-row recomputation/schedule/hash/guard testPASS(3.544s), strictTS PASS. Both baseline andcandidate summaries/coverage/entropy/perletter metrics/paired improvements-losses validate independently with exact threshold-boundary negative cases; no separately retained replayhashes are invented.

Actual full36-suite first attemptclosedEXIT1:34PASS, two staleoldcore report-source bindings FAIL. All actualcore checks pass: independent10,000oracle88.124534s;7,000restoredgames/all9invariants323.270961s;1,003properties;2,000eventfuzz;private-view/secrecy;codec/maxlegal Unicode snapshot246,937UTF8bytes;750extra lexical cases and47sourcedfacts. Whole423.681419s reflects concurrentCPU work, nohold/performanceclaim. Originalfailure savedinselection-core-first.txt. Historical round4 plural/lexical reports preserved before regenerating currenta62 reports twice byteidentically. Two affectedartifact tests rerunPASS(918.270ms); passedcore checks were not repeated. All43 actualplanted bugs killed in isolatedtrees after unmutated targetedbaselinePASS; originals28 retained plus15 newselector/window/tie/cap/semantic/exploration/immutability/presence/privacy/RNG defects. Required4,000duels: Strong/Medium1,970wins11losses19ties means10.866/5.6745;Medium/Easy1,981/11/8 means15.397/6.379, two-player scope. Four historical200game layersreproduce2×byteidentically with actualarchivedcores/matchers, preserving original283-point lexical result.

Manifest+fouractualfixtures andnewHTML built2×byteidentically: abde34978aafaefeaf178a1ab51f20a0992ef714a33659ddc4ed4427ef22a97b,456,648B. Strictsampler9caabfd972f723c957df22d8adda5d50e5b59646d60c6cdb0a7240e1d73c2444 addsselect.ts sourcefingerprint only;600 samples,workload,unrecordedmeasurement,thresholds unchanged. Freshnewfile28gameplay+8emptyreview+clock+4receipts+17explicitpaused-clockrecovery+3actualmouse/micechecksallPASS;oldfixture159/M/wildlife01remainsvalidatbothextremehumanrosters. Lastbrowserclosure15:41:53.950; allwriters/groupsclosed, strictslotREADYawaitrootGO. No newFPSPASS, fullround5gain orLOOPlineyet.

Actual chosen-source localstrict first attempt15:45:40.427–15:46:08.929 onabde3497/9caabfd9: desktop600 PASS60.002532FPS,p99/max16.8ms, cleanindependent312,601Bclip;phone600 FAIL58.255040FPS,p9916.8ms,max166.6ms. Bothraw600 seriesretainedandrecomputed. ExactfailureAssertionError:phone4x:strictframeorofflineruntimecheckfailed. Allpageerrorstreams empty andrequests fileonly;phoneclipNOTRUN. Fullrawreport/runner/runtimeHTML/sourcecopies/partialdesktopclip preservedinround-5-frame-first. Manualreadback confirmsall16sourcefingerprints andHTMLunchanged; runner finalsourceguard wasnotreached onassertion. Node164462/Chrome164474 andallownedgroupsclosed;rootreleasedglobalCPUimmediately. Causeunresolved; no runtimeoptimization,gaterelaxation,unchangedlocalretry ornewFPSPASSclaimed. Stalecanonical8chosted-origin markerremoved afterconfirmingcompleteoriginalarchive; oldcanonicalphonevideo removedonlyafterbyteidentitywiththefullhistorical8cartifact. No oldclip isrepresented ascurrent. Currentworkflow will execute unchangedstrict newrunnerontheactualGitHubhostbeforeartifactbinding, preservingthislocalfailure; genuinehostacceptance andfullnewexactCI remainpending. NoLOOP5 line yet.

Final current-source strictTS, authoritativecontent regeneration/schema check,329-filechecksum+check andgitdiffcheckPASS. Artifactbinder was explicitly executed and FAILS at report.passed=false, as required by retainedlocalphonefailure; complete outputselection-artifact-pending.txt. This is honest pendingacceptance, not a tool/sourceblock or a claimed all-localPASS. Workflow retains original fullchecks and adds isolated actual revisionbaseline/candidate reproduction plusindependentcomparison; freshhost strict600/captures executeBEFOREartifactbinding. NoLOOP5/newformalroundbeforegenuineexacthostfullGREEN. All localwriters/heavygroupsclosed forsource/proof-pendingpush.

Round5 full exact-head CI37804388036/job113404718193 SUCCESS on fa319698ccf15ccb26afcdebaac10e1a11673d86. Actual full logs independently read:56/56 tests; matcher10,000 oracle65.884707s; selector10,000 oracle21.985802s;7,000 restored/all9 invariants214.984335s;1,003 properties;privacy/fuzz/codec and every schema/artifact check; all43 actual mutants;4,000duels; four historical200-game layers and both registered3,000game+3,000replay layers byte-identical on actualhost; all28+8+clock+4+17+3 actual-page checks. Fullsuite285.713278s. No missing/skipped required step remains. Exact source/head/run proof is retained in evidence/round-5-source-head.json.

Actual hosted strict artifact11562995314 downloaded through nativeGitHub file reference with inherited-proxy curl:1,068,730B ZIP SHA7ea175bab727ca041e5235a95539d05face2e3d896b5d72121f73f1e94ca9a9c matches GitHub digest. All eight uploaded files match original host manifest; all16 source fingerprints, HTMLabde3497 and runner9ca match. Every600 interval independently recomputed: desktop60.002940144FPS, phone4×60.002772128FPS, bothp99/max16.8ms, no recording during sampling, zero errors/file-onlyrequests. Independent clean clips320,391/216,959B decodeVP8:1280×72097frames3.88s and390×720112frames4.48s. Complete original artifact/manifest, retrieval/decoder receipt and explicitly local verified runnercopy are archived in round-5-hosted-37804388036. Canonical acceptance files are copied byte-for-byte from this actual hosted artifact; no local failure is relabeled. Local58.255040 phone failure and rejected firstK3coverage trial remain intact.

One measured LOOP5 line records the completed source-specific gain; five gain rounds leave no-gain streak zero. Completion is still subject to its own exact-head green CI before the next formal review. All runtime writers and owned heavy groups remain closed. The pilot comparison's deliveryComplete:false describes its original pilot-only scope; full subsequent delivery proof is separately bound in round-5-source-head.json.

Sixth-round resume: native exact-run readback confirms539f6eb/run37807570831 SUCCESS16:30:19UTC; job113415744161 full actual log is retained in .work/completion-539-full-job.log. Binding root README/RULES/JOBS and job rules/assumptions/next/loop reread before any runtime edit. AUDIT-ROUND-6.md records ranked five weaknesses and private draft-feedback scope. `node scripts/browser-draft-hints.mjs baseline` measures real unchanged file at2/8humans before edits, preserving source, every failure, score and handover/privacy checks. Clock is explicitly paused only for functional actions; no frame or human error-rate claim is made. Production HTML/core/bot/data and original strict sampler remain unchanged; formalLOOP6 and playergain pending.

Actual before measurement completed16:41:04.717UTC on unchangedabde3497: at2/8humans three mechanically ineligible own rows have zero private warnings, remain submit-able, keep original zero scores and6/24 private ballots. Previous locked sheets never affect the next person's writing. Baseline report, exact original runner, screenshots and production file are retained. Checkpoint2b599410af2284e9eecd13a159ce6115a3d3b997 pushed16:42:11UTC,25m13s after539 (25min target missed13s;30min met). Maina211ea4 refresh16:41:54. Its exactCI37810872591 is running; no new completed round was claimed.

After private-only advice, `npm run typecheck`, `npx tsx --test tests/client-draft.test.ts`, two actual`npm run build:play`+cmp, and `node scripts/browser-draft-hints.mjs after` pass. New page68f43a976c73b98b0b3a55d56cb39a17cf7bfcaf6476e96540f77b9e1de6b91c shows3/3 warnings at both2/8humans; clearing or changing one row immediately clears related advice. Lock stays enabled, identical original bad sheets retain zero scores, another person's locked answer does not warn, hints disappear at handover and anonymous ballots. Closed16:44:02.460UTC with no page errors/dialogs/network. Four pure tests cover initial articles/accents/numeric initials/creative answers/known plural and semantic negatives, direct-vs-transitive fuzzy-chain labels and240 independently checked12-row drafts with immutability. Production reducer, matcher, bots and data are byte-unchanged; own-repeat advice uses the direct pair rule actually used by scoring.

Host-only optional coordination adds exact current helper/client fingerprints without changing600 native unfiltered deltas,59FPS/p99<=17ms, workload or separate capture. First focused test attempt had5PASS/1FAIL: the test observed the prior READY before async cleanup completed and failed the fresh-nonce assertion; early cleanup then produced a retained asynchronous ENOENT. Complete output is .work/round-6-focused-first-failure.log. The test now waits for a new nonce and attaches its expected timeout rejection immediately. This was a test race before full browser regressions began, not a production bug or frame result. All owned processes were closed during root's G10 strict quiet window; no wall-time browser acceptance was paused. Fresh corrected focused check/full current UI/strict frames/capture/all exact-head binding checks remain pending.

Baseline checkpoint2b59941 exactCI37810872591/job113427066033 SUCCESS16:52:27UTC. Complete123,397-character actual log read and privately saved:56/56 tests, independent10,000-case matcher37.789347s/selector13.145433s,7k restored/all9 invariants,1,003 properties/privacy/fuzz/codec,43/43 real mutations,4kduels, historical and registered regeneration, every original UI/recovery step and strict hosted600pair60.002736/60.002772 with separate318,753/172,774B clips. Those checks bind the unchanged baseline; they are not represented as current new-page proof.

Fresh corrected `npx tsx --test tests/client-draft.test.ts tests/frame-window.test.ts tests/draft-artifact.test.ts` passes7/7, including8 actual invalid/stale-grant cases plus exact valid grant, fresh sequential nonce, preserved other-profile files, timeout and actual failed-summary closure. `npm run typecheck` passes after all additions. The first failed test output is now public evidence/frame-window-test-first.txt. `node scripts/browser-check.mjs`, `node scripts/browser-empty-review.mjs after`, `node scripts/browser-clock.mjs`, `node scripts/browser-receipts.mjs after`, `node scripts/browser-resume.mjs after`, `node scripts/browser-plurals.mjs after` all pass on68f43a97:28+8+clock+4+17+3, last original closure16:54:47.969. Broadened `node scripts/browser-draft-hints.mjs after` closes16:56:27.618 PASS3, proving restored warnings and unchanged remaining time at both roster extremes; its preceding actual successful report/runner remain archived under round-6-draft-first. New independent artifact binding passes. Authoritative `node scripts/generate-content.mjs --check` and `npx tsx scripts/content-schema.ts --check` pass320/20/4,155.

Actual first changed-source native strict attempt `G09_FRAME_BARRIER_DIR=.work/round-6-frame-barrier node scripts/browser-performance.mjs` PASS/EXIT0. Desktop READY16:58:01.613, grant17:00:50.359, CLOSED17:01:00.400:600 consecutive raw intervals60.002952145FPS,p99/max16.8ms. Phone4× READY17:01:06.440, grant17:03:06.279, CLOSED17:03:16.406:600 consecutive raw intervals59.903184473FPS,p9916.8ms,max33.4ms; that long frame is retained. No recording, fake timestamps, filtering or skipped frame during measurement. Root coordinated heavy CPU quiet; no intermediate global release between these two profiles is claimed. Final root RELEASE17:03:17. Recordings run separately, show3 real nonblocking private hints and retain zero errors/file-only requests. Full report guards18 sources before/after both profiles and clips.

Independent actual1,200-interval recomputation, exact viewport/throttle/summary/positive-frame validation, all18 actualsource SHA comparisons and direct byte comparison of8 core/data/save files to2b59941 PASS. Actual clip bytes318,781 SHA117c4202f45732fec179001478de6eb913377fd23d492544c47556e512ab0a01 and270,463 SHAa31c42c8707035cffa56cb4577bfa030544b6ca49fc7d0aaac4605d142acfb25; both EBML/VP8 independently decoded. Desktop1280×720103frames4.12s, phone390×720119frames4.76s. All raw/current reports/source copies/READY-grant-CLOSED receipts and manual readback are archived in round-6-accepted. Phone is ChromeCPU4× approximation, not a claimed physical-device measurement. The previous round5 local58.255040 failure remains archived and causally unresolved. Stale canonical oldhost marker was removed only after byte comparison to its complete archived original; local current proof is explicitly local, not relabeled hosted evidence.

`npx tsx --test tests/artifacts.test.ts tests/draft-artifact.test.ts` passes2/2 current-source proof binders. Final checksum generation/check initially passes387 files and is rerun after documentation freezes; `git diff --check` passes, README37lines. One measured LOOP6 entry resets no-gain streak0 and explicitly requires fresh full exact-head CI after this push before any next formal round or done claim. All runtime writers/browser/check groups are closed.

Exact79e9c90/run37814161304/job113438358747 SUCCESS17:21:43UTC: native full125,257-character log independently read (private SHA in evidence/round-6-source-head.json),63tests/both10k independent oracles/7k restored/all9 invariants/1003properties/privacy/fuzz/codec/43actualmutants/4kduels/all regenerated studies/all original and new UI steps pass. Actual artifact11565694396 ZIP1,136,733B SHA391757c424ce317429f50a3e8c0d5251be874a5c23936cf4f33471e215239f5e independently matches GitHub metadata; all8original uploaded files,18sourceguards/currentHTML68f43a97 and1,200raw intervals verified. Desktop60.002784129/phone4x60.002580111FPS,p99/max16.8ms. Separate357,866/239,171B VP8 clips decode successfully with3actual warnings. All original bytes, retrieval/decoder receipt and explicitly local verified runner copy are archived separately from the actual local proof.

`node scripts/browser-paste.mjs baseline > .work/round-7-paste-baseline.log 2>&1` PASS14 native clipboard cases on unchanged68f43a97, closed 2026-10-08T17:36:10.757Z:2/8humans, real authored stapler/S/teacher’s desk. Normal/article-space/newline/CRLF each score1; tab/vertical-tab/DEL each yield no own warning, store Thestapler and score0. Original inputs/DOM/review/eligibility/points and private handover/no-other-sheet-advice are retained. Native clipboard API is confined to this isolated test context; no production clipboard request. Functional fake clock is expressly not performance proof. This is a measured pre-edit defect, not a completed fix/gain or a no-gain round.

Cadence:79 push17:07:41 (prior25min target missed30s,30min met); target17:32:41 passed during root coordination/reset. This agent failed to acknowledge the pending quiet request before root interrupted it around17:27; root observed zero other heavy processes before G03 grant and released17:28:46. Own resume clock17:32:48; hard17:37:41 remains binding. No runtime source edit occurred during quiet. This milestone archives actual baseline and exact79 proof, with new checkpoint CI still required.

Round7 current adapter on HTML91a0c95d (457,688B): `npm run typecheck`, `npx tsx --test tests/client-draft.test.ts` PASS6,2 `npm run build:play` plus `cmp` byte-identical. `node scripts/browser-paste.mjs after` PASS14, closed17:48:53.584:6actual authored paste cases improve0→1,8ordinary/article/newline/CRLF controls unchanged1. Native caret/80-char/private-handover and separate adversarial backward-selection/own-repeat/wrong-initial controls pass at2/8humans. Original `browser-check`, `browser-empty-review after`, `browser-clock`, `browser-receipts after`, `browser-resume after`, `browser-plurals after`, `browser-draft-hints after` PASS28+8+clock+4+17+3+3 on exact91a0; last closure18:01:23.364. Seven original68f43 functional reports were archived before regeneration. Direct git byte comparisons preserve8core/data/save files; proof in evidence/round-7-source-invariance.json. Final strictTS and4paste/draft/nonce artifact checks pass.

`G09_FRAME_BARRIER_DIR=.work/round-7-frame-barrier G09_FRAME_WAIT_MS=600000 node scripts/browser-performance.mjs` is the FIRST changed-source attempt and remains WAITING: actual desktop READY18:02:54.057/noncef2724c30-2d92-4347-88c5-e12622c6a65d, read/sent18:03:59. No grant/CLOSED at18:06:32; no native sample or current capture has run. The optional600-second wait does not alter gates/frames/source guards. Full strict pair/currentclips/exact-head CI/old-control save compatibility remain pending; no completed LOOP7/gain streak claimed. Target18:02:20 missed during coordination/checks plus delayed READY polling; hard18:07:20 requires pending checkpoint, not fictitious acceptance.
# Interrupted round7 workload verification recovery

At19:11:52Z the last successful branch push18:07:35Z was64m17s old; this is a
cadence failure during interruption, not a passing milestone interval. Runtime
status is connected/current and network policy enforced. Process inspection
found no non-zombie owned Node/Chromium/timeout groups.

Native exact-head API readback confirms3f6d467/run37821893898/job113464750151
SUCCESS18:23:12Z and every required workflow step completed successfully. The
complete132,351-character actual log is privately retained. Actual artifact
11568969406 is listed at1,153,457B/digest7a2d5b73a30c399558e6f34fa1b59e776e9d41f6052748ddb5b8466777040ff6;
independent downloaded-byte verification is pending, not claimed.

`G09_FRAME_BARRIER_DIR=.work/round-7-frame-barrier G09_FRAME_WAIT_MS=600000
node scripts/browser-performance.mjs` first changed-product attempt actually
sampled both600-native profiles. Desktop59.70429656FPS/p9916.8ms passed its
old speed gate; phone4x58.44430608FPS/p9933.3ms failed. Actual closure18:10:49.006Z
EXIT1; phone recording NOTRUN. Both post-sample screenshots show handover after
the timer expired while waiting for grants. Retained raw/source/receipts/clip
are in evidence/browser/round-7-frame-first. Active-answer phase is NOTproved;
no failed sample is filtered, corrected, replaced or called NOTRUN.

Test-only runner moves READY waiting before starting the real answer timer.
After its fresh exact grant, the original250ms settle occurs once, followed by
all600 adjacent nativeRAF deltas. Every601 callbacks also records visible
answer form, no modal, nativeDate.now and an advancing positive60-second timer.
Independent artifact assertions recompute this witness from raw rows. Pure
workload checks reject absent form/modal/expired or invalid timer at five
positions, nonnative/frozen/backward wall time, missing callbacks and stopped
or inconsistent countdowns. These checks catch the actual handover gap without
relaxing speed gates or changing the game. Fresh local acceptance is pending.

`npx tsx --test tests/client-draft.test.ts tests/frame-window.test.ts` after
recovery:9PASS/0FAIL,3833.280843ms. `npm run typecheck`:PASS. Current HTML SHA
91a0c95d5680c1e691a9206ee13252d2d312439e3086e4aed24c4ba4ac10e236 remains457,688B.
No completed LOOP7 or no-gain round is claimed at this checkpoint.

## Completed round7 source-specific acceptance

Exact17c0d30/run37830364323/job113493816334 fullSUCCESS19:29:06Z. Actual
133,519-character native job log read; private exactcopy SHA
5d45d0540b37ae68c14f14b50e03cdfa1ca7433b2a0a9342cb4fbc4f2b7b94a8.
All67tests/10kmatcher+10kselector/7krestored-all9/1003seeds/43actualmutation
kills/4kduels/allregeneration and all original/new actualUI suites pass.
Source/head receipt is evidence/round-7-source-head.json.

Fresh nativeGitHub artifact11572918105 downloaded through inherited proxy:
1,301,965B ZIP SHA33c83ffe5cb74da63ae3377226d5fd0dc13a4a83b0e214dc6bb4c8f7a3f931e3
matches official metadata;8safe paths/CRC/manifest verified. Independent Python
reader recomputes all1200positive unfiltered raw native intervals and checks
all18actual current source hashes against17c and disk. Every1202callbacks has
visible answer form,no modal,nativeDate.now and positive advancing60→50timer;
wall elapsed9999ms each agrees with rawRAF totals. Desktop60.00258011/phone4x
60.00316817FPS,p99/max16.8ms. Actual335186/259749B VP8clips decode; authored
article-tab paste preserves its real noun and3private warnings are visible.
Original ZIP/files/reader/original runner/retrieval receipt remain in
round-7-hosted-37830364323. Canonical reports/videos are BYTE-identical copies
of these actual hosted bytes; prior local failure is not relabeled.

The corrected local setup received root's extra-key grant19:26:10.665461Z,
which the strict3-key validator correctly rejected. No timer/sample/video ran;
natural EXIT1/final report19:26:24.653Z, group183018 absent19:27:09Z. All original
READY/rejected-grant/report/source and receipt are archived in
round-7-workload-coordination-timeout. This is a PRE-SAMPLE coordination failure,
not a failed/completed frame sample. Root acknowledged its grant mistake.
Original round7phone58.444306FAIL/expired-workloadscope/raw1200 remain intact.

`npx tsx --test tests/artifacts.test.ts tests/paste-artifact.test.ts
 tests/draft-artifact.test.ts tests/frame-window.test.ts`:6PASS/0FAIL,978.676188ms.
`npm run typecheck`:PASS. These controls independently bind actual hosted raw,
current source,private-warning/paste gain and strict grant/workload negatives.
No runtime/HTML/core/data/bot source changed. One measured LOOP7 line completes
the product gain against actual current fullgreen; no-gain streak0. New
completion head requires its own fullgreen before another formal review.

Actual17c branch push19:13:38Z followed interruption gap66m03s from18:07:35Z;
30minute cadence was missed. Subsequent root quiet holds19:30 onward and
RELEASE19:33:36.516122 preceded this completion checkpoint. All own groups
remain closed; no hidden local retry, source edit during grant or new frame
optimization claim occurred.

## Formal round8: bot-source attribution, no player-visible gain

Root/game rules reread after actual exactec22469/run37833413069/job113504276655
fullSUCCESS19:50:07UTC. Complete133489-character actual job log retained exact.
All67tests/43actualmutants/4000duels/10k+10koracles/7k-all9/1003properties/
regeneration/all original-new UI gates pass. Actual current artifact11574701286
ZIP1274699B/digest38edc47223b1c85f8e75fc9ddccd732542c9592461af668936bc46ef805348dc
independently checks8files/18actualcurrentguards/1200raw/1202visibleactive-answer+
nativeDate/timer callbacks. Desktop60.002556/phone4x60.003000FPS,p99max16.8ms;
wall10000ms each/timer60→50. Actual341185/221751B VP8clips decode. Complete
original bytes/validator/receipt remain in round-7-completion-hosted-37833413069;
canonical accepted files are copied from these actual uploaded bytes.

AUDIT-ROUND-8.md ranks five real weaknesses before the edit. An independent
Python reader of native log/current JSONL/BOTS table found one falsely labeled
current core320c99f2 versus actuala62e5fff. Both actual2000-game hosted summaries
match the current JSONL exactly; all counts/means/three-round alternating-seed
schedule/60percent win guard retain their original scope. Corrected the current
attribution and added exact current source/run evidence; historical320layer
remains historical. Wrong labels1→0; all7runtime/script/summary byte hashes
remain identical. Receipt is evidence/round-8-bot-source.json. This is a real
source-evidence correction, not a bot-strength/player/typing/recovery gain.
LOOP8 records the first actual consecutive no-player-gain review after R7.
New checkpoint's complete exact-head CI remains required before formal9.

## Exact d131 full acceptance and formal round9 legacy recovery

Native current run37836028404/job113513167776 SUCCESS20:14:33UTC at exact
d131fda3f4de526889babe4b26bdf2d911bf5cce. Actual complete log is133554characters/
136362UTF8bytes/SHAbc2a393a8e343d4ea0aa6ed37abdda91d03f39387f6f14038ee556c1d0b2eca1:
67tests/pass67/fail0,both10k oracles,7k restored/all9invariants,1003propertyseeds,
43actual mutation kills,4000duels,all regeneration and every original/new UI suite.
Current artifact11576210249 ZIP1322004B/SHAa951ab11bd0f98e1f72e65b899654ecf7da03dab3bfb0070769d557586de1e80
independently validates8files/18exactd131sources/1200nativeintervals/1202active
form+nativeDate+timer callbacks; both60.002940FPS/p99max16.8ms,timer60→50.
Actual347647/261135B VP8clips decode. Original ZIP/files and six byte-identical
canonical raw/report/media copies are preserved in round-8-hosted-37836028404.

The first private reader's extra abs(DateElapsed-sumRAF)<10 assertion failed
for actual desktop Date9984ms versus RAF9999.51ms (-15.51ms). This extra rule
is not original acceptance. Original reader/error/raw observations and revised
independent validation are all retained. MDN's live RAF timestamp semantics do
not guarantee cross-clock equality; actual callback execution offsets were not
recorded, so this specific cause remains unresolved. Original speed/600/phase/
timer/nativeDate/source/nonce/capture gates stay unchanged; no local rerun.
See archived CLOCK-DIAGNOSTIC.md.

Formal9 reread README/RULES/JOBS and game rules, then AUDIT-ROUND-9.md ranked
five weaknesses before any probe. Command:
`timeout 300s node scripts/browser-legacy-save.mjs > .work/round-9-legacy-first.log 2>&1`
Actual EXIT0, natural browser closure2026-10-08T20:21:39.189Z. All12cases pass:
2/8humans × normal/tab/vertical-tab/DEL/own-repeat/wrong-initial. The actual old
68f43a page native clipboard preserves control characters in authentic local
autosave payloads. Each raw payload is persisted before transfer and injected
unchanged into actual current91a page. Saves share real compatibility
dcaf02963be23af2cc2d09668eba094c35723988255b92c340abc6154e5d3aea.
Resume never displays the old draft before Ready. Saved7300ms remains through
120000ms private-handover wait; timer53seconds resumes and drops to48 after
5000ms writing. Real Ready/save/submit normalize words, eight valid cases score1,
four own-repeat/wrong-initial cases score0. Other sheets have blank advice,
core and bot RNG states stay unchanged; offline runtime has zero errors, external
requests or dialogs. Paused manual clocks prove functional behavior only, not FPS.
Authentic original/restored snapshots, report, exact runner and full actual log
remain in round-9-legacy-save. Current runtime was already correct: no new gain.
Source-specific artifact test verifies actual payload hashes/current decoder/
18source-cohort provenance through unchanged existing binder, time/privacy/
negative scoring. Formal9 no-gain streak is2; formal10 waits for new fullgreen.

Focused current-artifact/actual-paste/legacy-save checks:
`npx tsx --test tests/legacy-save-artifact.test.ts tests/paste-artifact.test.ts tests/artifacts.test.ts`
PASS3/3,zero failures; catches stale runtime/runner/payload hashes, incompatible
authentic saves, shifted time, leaked private sheets and weakened negative scores.
`npm run typecheck` PASS; `node --check scripts/browser-legacy-save.mjs` PASS.
No product source or acceptance gate changed. Full new-head CI remains required.

R9 proof-integration checkpoint: root added the already measured legacy runner
after the existing native-paste command in the final CI clipboard step. Both
original commands remain; the final always-upload recovery artifact now retains
the actual legacy report/original-restored saves and exact source runner even
on failure. The workflow still uses only actions/*, read-only permissions and
original30minute timeout. This is integration of formal9, not an additional
KEEP review or player-visible gain. Full new source-head CI is required.
Successful prior source pushf527665 was confirmed20:23:57Z,24m47s afterd131,
25/30minute cadencePASS; ownmainb2a4bb2 row20:23:46Z.
