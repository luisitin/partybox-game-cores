# Verification log

Current gameplay checkpoint: round5 source33f5e801 has full94/94, both
strict600-frame gates and matching clips. Exactcc0e1aa GitHub37762109046
SUCCESS10:23:34 passed46 node/94 browser/integrity334. Core/session unchanged.
Round6/7 documentation reviews retain that local source-matched acceptance;
each final head still needs green CI. EVIDENCE.md indexes current evidence,
historical timing/failures and nongating diagnostics. Earlier logs below
remain historical records, not current blockers.

## Research milestone (2026-10-08)
Four Exa searches returned 24 results; ten unique source extractions were read.
Exact URLs, coverage, extraction hashes: evidence/research-sources.json.
No origin HTTP status is inferred from Exa success. Full texts remain ignored.
Historical 403 observations are preserved, not current blockers.

`node tests/probability-reference.mjs`: PASS; 21 hand cases, 714 exhaustive cases
(111,974 full rolls), 4,182 identity cases, 105,264 conditional comparisons
(133,644 hidden completions), 13 invalid calls. This runs only the independent
oracle, not a differential against the as-yet-unwritten primary implementation.
`node --check tests/probability-reference.mjs`: PASS. Method and independent
review scope are recorded in evidence/independent-reference.md.

Core, fixtures, matrix, mutations, leagues, browser and hosted CI are pending.
Actual commands/results will replace this pending section as they run.

Primary milestone: esbuild-bundled src/probability.ts compared against the
independently authored convolution reference using seed 1799. 10,000 direct
and 10,000 own-cup-conditioned random cases passed with exact integer strings
and floating ratios equal. The first inline runner failed before comparisons
because G02 does not re-export createRng; bundling the unchanged shared RNG
fixed the runner. The reproducible npm-test differential is being added.

Additional research: two focused Exa searches (12 more results) and two more
full page extractions, G/D. Their independent calza corroboration and conflicting
ones/palifico wording are documented, not silently imported. Total six searches,
36 results and twelve fetched extractions.

## Playable-core checks so far (before final matrix/browser/CI)

- `npm install --ignore-scripts --no-audit --no-fund`: PASS, six pinned packages;
  later `npm install --package-lock-only --ignore-scripts --no-audit --no-fund`
  PASS. `npx tsc --noEmit`: PASS after fixing initial missing brace and using
  the actual odds.atLeast field in the browser. Initial compiler failures were
  genuine authoring errors, not test-suite passes.
- `npm run build`: PASS; bundles exact shared contract and a single offline page.
- `node scripts/fixtures.mjs`: PASS, bid/reveal/done plus schema and exact manifest
  generated twice byte-identical. First generator failed on unlisted phaseClock;
  its explicit schema was corrected, rather than allowing arbitrary extra keys.
- `node --test tests/probability.test.mjs tests/rules.test.mjs tests/core.test.mjs`:
  initial 13/13 PASS; includes 4,182 probability boundaries, 10,000 direct and
  10,000 conditional random comparisons and 483,840 independent raise cases.
- `node --test tests/contract.test.mjs tests/properties.test.mjs`: initial 11/11
  PASS. Shared contract has nine numbered invariants even though JOBS calls them
  seven: all nine are covered. Targeted final mechanics/contract checks grew to
  26 tests and passed before the full matrix. Exact raw output in evidence/checks.
- `node --test tests/properties.test.mjs`: seeds 1/2/3 plus 1,000 random seeds
  passed. An earlier test only checked JSON roundtrip; the final test restores
  the second reducer from serialized JSON after **every** event. Initial results
  (78,297 events, then 79,640 after restore/interrupt updates) are intermediate,
  not the final frozen-source property count.
- `node scripts/league.mjs 100`: initial pilots FAIL skill order (94/200 Strong
  and 71/200 Medium wins); after safest-medium change, Strong153/200 passed but
  Medium39/200 failed. Pilots are retained in strategy-pilots.json.
- `node scripts/league.mjs`: PASS final required 4,000 games: Strong1295/2000
  =64.75%; Medium1175/2000=58.75%; both Wilson and paired-seed lower95 >50%.
  BOTS.md gives exact intervals, raw seeds/winners and independent fresh holdout.
  Easy was unchanged; Medium's support inference and Strong's conditional
  survival decisions improved. No external AI strength claim.
- `node scripts/mutations.mjs`: PASS, 25/25 real singly mutated TypeScript
  source bundles compile and produce ERR_ASSERTION failures after their exact
  selected suites passed baseline. Full mutation list/report and per-mutant raw
  TAP are under evidence/mutations; no syntax/import error counts as a kill.

## Browser evidence and failed measurement
`node scripts/capture.mjs` captures the actual offline page via Playwright;
recordings stay under 10MB each. These are visual proof, not FPS measurements.
`node scripts/browser-check.mjs --snapshot` uses 1920×1080 desktop and 390×844
Chrome at CPU4x. It measures all 600 consecutive real requestAnimationFrame
intervals, with no trimming/filtering. Gate: nominal60Hz, mean>=59FPS, p99<=17ms.
Physical hardware phones were not tested; CPU throttling is disclosed emulation.

First 26-check baseline PASS: Desktop59.0191FPS,p9916.8ms,max166.7ms;
Phone59.8032FPS,p9916.8ms,max50ms. The later harder live8-player bid/nonnull
exact-odds workload failed: 35/36 checks, Desktop60.0024FPS/p9916.8ms;
Phone55.9895FPS/p9950ms/max233.3ms (14 of600 intervals over17ms). Source hash
d06a1d25c766adf83574187c739fe4bd190a502b3260456f9353b979954a4b39; full failed
report/frames retained under evidence/browser/runs/. Controller view caching
was added in the browser host; final same-workload measurements are pending.
No failing run is published as the latest passing snapshot. Default npm tests
write fresh timestamp/frame data only under ignored .work/browser.

## Still pending at this checkpoint
Final7,000 complete games (1,000 each2–8) with restored every-event replay,
final1,003-seed property output, timestamp guard regressions, source-matched
current browser snapshot/captures, final integrity and hosted current-head CI.
No final delivery or KEEP GOING round is claimed before those complete.

Additional cached-view measurement: Desktop60.0018FPS/p9916.8ms;
Phone58.7297FPS/p9916.8ms/max100ms, six intervals over17ms. It also overlapped
a footer source update and is recorded passed:false/interruptedBySourceUpdate.
The phone mean still missed the gate; neither source change nor caching is
asserted to have caused any improvement. Final frozen-source rerun is pending.

Final property-only source run: `node --test tests/properties.test.mjs` PASS;
1,003 seeds,80,158 events,max3,716 bytes, restored twin after every event.
Exact deterministic summary: evidence/checks/properties.json.
`CORE_DIR=.work/review/fixed node --test tests/timestamp-boundaries.test.mjs`
PASS6/6:360 invalid-time events,129 hostile metadata cases,33 immutable-view
trees,two complete hostile-ID games; exact build/probe and initial failure are
recorded in evidence/checks/adversarial-review.md. The default aggregate suite
includes these six tests against the normal delivered bundle.

Frozen a30311f3…170422 page: all functional/source-hash checks passed, but phone
performance FAIL26.6677FPS,p99450.1ms,max1849.9ms; Desktop59.3108FPS,p9916.8ms.
All600 intervals are retained. Cause is unestablished; renderer/reload history
is a hypothesis being investigated, not a proved explanation. An isolated fresh
context will be measured with the same8-player live-bid workload and unchanged
gates. At this playable checkpoint performance remains pending, not passed.

## Final delivery checks (2026-10-08)

`node --test tests/core.test.mjs tests/probability.test.mjs tests/rules.test.mjs
tests/contract.test.mjs tests/timestamp-boundaries.test.mjs`: PASS 32/32 focused
tests, including all nine contract invariants; evidence/checks/targeted-final.tap.
`node --test tests/bot-games.test.mjs tests/properties.test.mjs`: PASS2/2.
7,000 complete games, exactly 1,000 at EACH player count2–8,1,698,274 events;
every event compares live vs JSON-restored twin SHA256 and exact bytes, checks
previous-state immutability, JSON roundtrip and256KiB cap. Maxstate3,859 bytes;
12,277,985 bot samples schema-checked across seats, interrupts and done.
The1,003-seed property run adds80,158 events/max3,716 bytes. Matrix walltime
19m29 included roughly10min deliberate process pauses while measuring browser
frames; active CPUabout9min. Hosted CI runs without those manual pauses.

`node scripts/fixtures.mjs`: final PASS, exact manifest and bid/reveal/done/schema
regenerated twice byte-identically. Validators reject prototype-named unexpected
properties rather than inheriting schema.properties entries.

`node scripts/browser-check.mjs --snapshot`: final exact default full run PASS
37/37. Single HTML sourcef0559458c404cd5ec6e7b1a06141216b8fe8fe61a54a24b1cc3c7f87b7ecabb8.
Desktop1920×1080CPU1x60.0018FPS; phone390×844CPU4x60.0024FPS. Bothp99/max16.8ms,
all600 consecutive intervals retained, zero above 17ms. Same live8-player8×3bid,
own cup open, nonnull exact odds, legal draft selector edits every30frames.
Performance uses fresh contexts after functional checks, source-hash guarded at
start/end; no reused proof in this final full run. Browser host caches controller
views/groups and reuses unchanged option DOM. Latestreport and rawframes are
evidence/browser/report.json and its frame files. Earlier successful and failed
source snapshots remain archived; cause of prior stalls is unestablished.

`node scripts/capture.mjs delivery-final`: PASS. Five real rounds each, pause,
reveal and winner, zero pageerrors/network requests. Desktopvideo1280×720
1,024,954bytes; phone390×844CPU4x910,384bytes. Capture is separate from FPS proof.
All previous milestone recordings remain; each is below 10MB. Temporary capture
outputs moved into ignored.work rather than public evidence.

`npm run build`: final PASS strictTypeScript/bundle; runtime core unchanged
db7373ae850fa2ae88ecea1cd873516034ce534daa9c7748729893c1c3ab5df3.
Both original MIT and actual pinned Zod MIT notices are embedded in play.html.
`node scripts/hashes.mjs` twice + `cmp`: required identical checksum manifests.
`sha256sum --check SHA256SUMS.txt`: required PASS for every delivered file.
`node scripts/integrity.mjs`: validates hashes/coverage,2×fixture regeneration,
source-matched600frame evidence/raw statistics, licenses,no runtime I/O/network
and every media file below 10MB. Its final run is recorded in the next entry.

### All25 actual planted source bugs
Each is compiled individually; exact selected baseline first passes. Mutated
suite must fail with ERR_ASSERTION; syntax/import failures do not count. Actual
command `node scripts/mutations.mjs`, PASS 25/25; report and29 rawTAP files in
evidence/mutations.

| ID | Planted bug | Assertion kill |
| --- | --- | --- |
| R01 | Allow an opening bid of wild ones | Yes |
| R02 | Round conversion to ones downward | Yes |
| R03 | Permit an even conversion away from ones | Yes |
| R04 | Accept an unchanged bid | Yes |
| R05 | Reverse the palifico face lock | Yes |
| R06 | Permit zero quantity | Yes |
| R07 | Make sixes wild instead of ones | Yes |
| P01 | Add an extra hit-face factor to each probability mass | Yes |
| P02 | Corrupt binomial coefficients | Yes |
| P03 | Treat one required match as certain | Yes |
| P04 | Remove exact zero-match mass | Yes |
| P05 | Use a five-sided outcome denominator | Yes |
| P06 | Ignore the second matching face in wild rounds | Yes |
| P07 | Condition on one fewer hidden die | Yes |
| C01 | Keep ones wild during palifico | Yes |
| C02 | Make exact-count dudo succeed | Yes |
| C03 | Lose two dice for a challenge | Yes |
| C04 | Gain two dice for a correct calza | Yes |
| C05 | Keep the bidder on turn | Yes |
| C06 | Suppress the two-to-one palifico trigger | Yes |
| C07 | Forget that the starter has used palifico | Yes |
| C08 | Allow calza in a two-player duel | Yes |
| C09 | Accept stale timer instance stamps | Yes |
| C10 | Process input and timers during a hold | Yes |
| C11 | Show the first seat cup to every controller | Yes |

## Limits and hosted delivery gate
The full SDK is absent; the ordered local adapter is tested against the unchanged
exact shared types/schemas, not claimed as SDK package integration. Publisher
2–6 extends to owner's2–8; edition/house choices are explicit. Phone is CPU4x
emulation, not physical hardware. Strong wins are against these bots under the
default duel settings, not an external champion. Full matrix samples settings
combinations and all counts; it is not an exhaustive proof of all event histories.

CI is .github/workflows/G07.yml: pathsfilteredPR,Ubuntu,30min,read-onlypermissions,
actions/* only, pinnedNode22.16.0, npmci, Playwright install, full npm test and
rawbrowserartifact upload. Local component checks have passed; current pushed
head hosted CI must succeed before delivery and KEEP GOING begins.

## Initial hosted delivery accepted — 2026-10-08
`gh run view 37737745593 --repo luisitin/partybox-game-cores --json status,conclusion,headSha,jobs` and `gh run view 37737745593 --repo luisitin/partybox-game-cores --log`: PASS, exact head 6dd4c32b980695de88465b284b0763e287787915. Run completed successfully: full npm test, 35/35 node tests, 37/37 browser checks, 25/25 compiled mutation kills and 155-file integrity. This is the initial delivery acceptance, not a claim that later heads are green. Public metadata: evidence/checks/ci-delivery.json. GitHub reports the uploaded G07-browser-evidence artifact (11532289074); download from this environment failed, so no hosted FPS values are invented. KEEP GOING now begins after this green run.

Final delivery checksum command: `node scripts/hashes.mjs` twice, `cmp SHA256SUMS.txt .work/hashes-before.txt`, `sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: PASS, 155 files before the initial delivery commit. Regenerate hashes for each subsequent checkpoint.

## Round 1 cadence milestone — verification pending
`npm run build` passed strict TypeScript/bundling for aa9d7b31…66f825; core remains unchanged. Host changes add adjustable pacing and prioritize an overdue timer before user/manual actions or a bot action whose sampling crosses the deadline. Baseline bot bid windows were 741–801 ms. The expanded full browser run and source-matched recordings have not completed at this milestone, so no new pass, performance gain or completed LOOP round is claimed. The previous passing snapshot belongs to f0559458; the unchanged integrity guard requires new matching evidence before acceptance.

## KEEP GOING round 1 — completed local proof
`npm run build`: PASS, HTML aa9d7b31f323703fb4fb8fb4e735b7058aa9098ca78ccc9a373024b8ac66f825; core source remains db7373ae850fa2ae88ecea1cd873516034ce534daa9c7748729893c1c3ab5df3.
`node scripts/browser-check.mjs --snapshot`: corrected default full run 20261008070041971 PASS 52/52, including actual Fast/Normal/Slow delays, Manual holds/eligible interrupts, pause/resume, human calza after reading, both blocked-main-thread late Manual/HUMAN click races compared with the actual deterministic core timer, and the eight-seat before/after trajectory. The initial expanded run 20261008065708225 failed 50/52 because its test oracle wrongly insisted on dudo; it and its original runner/raw frames are preserved. The core timer can legally raise. No product/source or performance gate was relaxed for the correction.
The matching seven-bid mean window grows 791→2095.142857 ms (2.648727×); human calza succeeds at 1141/1256 ms. All 600 intervals retained: desktop 59.902359 FPS, p99 16.8 ms, max 33.4, one interval >17 ms; phone 4× CPU 59.704047 FPS, p99 16.8 ms, max 33.37, three intervals >17 ms. Both unchanged nominal-60-Hz gates pass; these are emulated browser measurements, not physical phone claims.
`node scripts/capture.mjs round-1`: PASS, same HTML, actual Normal actions at 2008/2078 ms and Manual holds 2296/2348 ms before step, then five real hot-seat rounds with pause/reveal/winner. Desktop 1,430,555 bytes, phone 1,230,312; zero network/page errors, both below 10 MB. Exact metadata in evidence/browser/round-1-captures.json.
`node scripts/hashes.mjs` twice + `cmp`, `sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: required for this checkpoint; output is recorded below after execution. Exact current-head hosted CI remains the acceptance gate before round 2.

Round 1 final hash/integrity output: PASS, 174 delivered files, two byte-identical manifest generations, all checksums valid, fixtures regenerated twice byte-identically, source-matched passing raw-frame proof, media below 10 MB and pure core scan.

Round 1 hosted acceptance: `gh run view 37741554805 --repo luisitin/partybox-game-cores --json status,conclusion,headSha,jobs` and `gh run view 37741554805 --repo luisitin/partybox-game-cores --log`: PASS, exact head 6387696d0891f25e01df76f50aa4c7aefdb3ee35. Full npm test passed: 35/35 node tests, 52/52 browser checks, 25/25 compiled assertion mutation kills and 174-file integrity. Artifact 11533424414 is reported uploaded, unexpired and tied to that head. No hosted frame values are inferred from artifact metadata. Public summary: evidence/checks/ci-round-1.json. Round 2 begins after this green result.

## Round 2 cadence milestone — full core verification pending

`npm run build`: PASS, frozen core source 5d10032d64f7a91361e22423bc1203181bde488d16d895f2753d03911ededb18 and HTML e17275c67a008d7c3202dc6cc34647cf9d6d6d8aa27b48ad17ec88d736ba50c3. The sole core change guards Medium's dudo with exact numerator/denominator certainty; no threshold, Easy or Strong policy changed.
`node scripts/fixtures.mjs`: PASS, two byte-identical generations. Historical initial-core fixtures/checks are preserved under evidence/checks/initial-core with hashes and provenance.
`node scripts/browser-check.mjs --snapshot`: PASS 52/52, exact default full run 20261008073119716. Desktop1920×1080CPU1x and phone390×844CPU4x each retained all600 intervals: 59.803247 FPS, p99 16.8ms, max50ms, one interval above 17ms. Unchanged mean/p99 gates pass; equal totals are measured, not substituted. The archived reports/raw frames identify the frozen HTML. Clips, focused regression, complete matrix, properties, leagues and mutations are recorded after execution below; no completed round 2 or full-core acceptance is claimed at this cadence checkpoint.

`node scripts/capture.mjs round-2 --pace-demo`: PASS, same HTML. Desktop1,338,915bytes/phone1,213,399bytes, Normal actions2036/2071ms, Manual holds2337/2338ms then actual step; five real rounds, pause/resume/winner, zero network/page errors. Metadata: evidence/browser/round-2-captures.json. This is separate from frame measurement.
`node scripts/hashes.mjs` twice + `cmp`, `sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: cadence PASS,238 files. Committed7b00866, fresh main claim724d106 merged into58cca15; run 37744597968 is pending. Regenerate hashes after remaining evidence writes.
`node --test tests/medium-certainty.test.mjs`: PASS 3/3. The SHA-verified initial-core negative control fails exactly the original defect with ERR_ASSERTION and passes both unchanged controls. `G07_MEDIUM_BASELINE_CORE=.work/mixed-table-holdout/frozen-dist/core.mjs node scripts/medium-certainty.mjs`: PASS, actual-init27-event replay; old dudo loses a die6/6, new legal raise is accepted6/6. If that raise is immediately challenged, five worlds still lose a die and one preserves both dice. All 35 uncertain cups, supported near-certainty and opposing-cup/game-RNG read traps pass. Evidence: round-2-medium-focused.json/report.json/transcript.json and round-2-medium.md. This establishes the concrete decision correction, not a general survival guarantee.

The original completed round1 pacing report remains in evidence/browser/runs/aa9d7b31f323703fb4fb8fb4e735b7058aa9098ca78ccc9a373024b8ac66f825/20261008070041971/round-1-pacing.json. The top-level pacing filename is the latest rerun of that feature probe, now matched to e17275c6; historical round1 timings refer to the archived original.

Cadence hosted run 37744597968 FAILED at58cca15: 38/38 node tests and 52/52 browser checks passed, then integrity correctly rejected `evidence/checks/bot-games.json` because the new-core matrix regenerated it with SHA256455532eb…dc093 while the interim manifest still described the initial-core report8b3603f7…b655f. The local new-core matrix was explicitly pending when this cadence checkpoint shipped. Exact assertion/hashes: evidence/checks/ci-round-2-cadence.json. Preserve the failure and publish completed new-core evidence with regenerated hashes; no gate is relaxed. A later exact head must be green before round 3.

## Round 2 — completed local verification

`node tests/probability-reference.mjs`: PASS, 21 hand/714 exhaustive/111,974 rolls,4,182 identities,105,264 conditioned comparisons/133,644 completions and13 invalid cases.
`node --test --test-reporter=tap tests/*.test.mjs`: PASS 38/38,zero failures/skips,489.197s with no pauses. Includes 20,000 random probability differentials/4,182 boundary cases and 483,840 independent raise cases; all nine contract invariants. Full7,000 games,exactly 1,000 each2–8,1,698,452 every-event restored-twin SHA/exact-byte/previous-state-immutability/JSON/256KiB comparisons,12,279,033 schema-checked bot samples,max3,859bytes. Matrix hash 39f8b3e0a3eb0e9a4ec18be8f04d7414e80555b0186b4ea78d45047c50875d1c; events by count45,906/96,581/155,976/224,054/302,594/389,440/483,901. The local bot-games.json hash 455532eb…dc093 matches the hosted regeneration exactly.
Properties: seeds 1/2/3 plus 1,000 seeded random cases,80,156 events,max3,716bytes,restored twin after every event; hash 40cf781f32634aa21f7213262eb5e579afedcf611c3516a386c02db474fcb5d9.
Required 4,000-game league (included once in all-node tests): Strong 1294/2000=64.70%,Medium 1178/2000=58.90%; all Wilson/paired lower95>50%.
`node scripts/mutations.mjs`: PASS 25/25 individually compiled assertion kills; four unmutated baselines pass. Same planted list above; new report/rawTAP in evidence/mutations,old source proof preserved in initial-core/mutations.
`node tests/strategy-holdout.mjs`: PASS 4,000 fresh default-duel games,predeclared salt 0x8c42f5d1 with zero overlap against 18,000 prior seeds. Strong 1336/2000=66.8%,Medium 1140/2000=57.0%,all lower95bounds>50%. All per-seed outcomes retained. Different fresh seed sets are not a before/after win-rate estimate.
All input source,bundle,test,fixture hashes were unchanged at completion. Final source 5d10032d…edb18,bundle 947f4f6f…5c076,HTML e17275c6…ba50c3; all writers stopped. Exact commands/status/input hashes/summaries: evidence/checks/round-2/verification.json and companion files. Fresh final hashes/integrity and exact new-head CI remain the delivery gate; no further test repetition is needed without a new change or failure.

Final round 2 checksum/integrity command: `node scripts/hashes.mjs` twice,
`cmp SHA256SUMS.txt .work/round-2-final-hashes.txt`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: PASS,
256 delivered files, byte-identical manifests/fixtures, matching passing raw
browser frames, media below 10 MB, original/Zod licenses and pure core scan.


Round 2 hosted acceptance: `gh run view 37746548680 --json status,conclusion,headSha,jobs`
and `gh run view 37746548680 --log`: PASS at exact head 2ba462691ea3bbecf8607f0737b3287cc8909af7,
completed 08:03:56 UTC. Full npm test: 38/38 node, 52/52 browser, 25/25 compiled
mutation assertion kills and 256-file integrity. Artifact 11535814866 is uploaded,
unexpired and tied to this head; its bytes were not downloaded. Public metadata:
evidence/checks/ci-round-2.json. No hosted frame values are inferred.

## Round 3 cadence milestone — browser proof pending

`npm run build` and `node --test tests/session.test.mjs`: module build PASS and
8/8 focused tests PASS. Tests cover original prototype-named seats, 1,101
same-tick bids whose logical stamp exceeds host time, pause/resume twins,
intentional/automatic/terminal holds, natural palifico and elimination
transitions, all 2–8 seats, 36 corruption cases/size limits and shared RNG
parity over four seeds with 1,000 mixed calls each. Initial TypeScript mismatch
in the JSON-schema converter's inferred parameter type was corrected before
the successful build. These are focused host-persistence checks; the game
core/probability implementation and accepted matrix/leagues remain unchanged.

The browser adds an explicit Resume/Discard gate and covered-cup recovery,
with exact random cursor, saved host time and current timer/interrupt markers.
The default full browser run now includes real reload scenarios; its expanded
result, both raw 600-frame measurements and source-matched round-3 clips are
pending at this milestone. Previous browser evidence is retained for its
previous HTML. The unchanged integrity gate requires passing evidence matched
to the new page before acceptance. No completed LOOP round or new frame pass
is asserted at the cadence push.

Final host `npm run build`: PASS, strict TypeScript and self-contained bundling;
frozen HTML 48be0c5b183f23176431d8383265c56b8fa927beb672c3692a66f95169065378.
Focused recorded command/input provenance: evidence/checks/round-3/session-verification.json;
no raw focused-test TAP was retained. Cadence hash generation twice and `cmp`,
followed by `sha256sum --check SHA256SUMS.txt`: PASS, 260 delivered files. Full
integrity is not claimed while new source-matched browser proof is pending.


First full recovery browser run: `node scripts/browser-check.mjs`, run
20261008082353284 at frozen HTML48be0c5b…065378: FAIL, 74/76 checks. All 24
new recovery cases and all prior functional/offline/source checks passed.
Unchanged 600-frame gates failed: desktop50.492725 FPS, p99 116.7 ms,
max383.4 ms,23 intervals above17; phone4x58.922890 FPS,p99 16.8 ms,
max150 ms,four above17. Both complete raw600 files, full runner/report and
pacing probe are preserved in evidence/browser/runs/48be0c5b…/20261008082353284.
The previous passing top-level snapshot is not replaced by this failure.
During the sample only bid selections change; no save call is made. A causal
claim about session validation is therefore unproved. Desktop outliers begin
after frame300 and phone has four sparse outliers. Profiling/isolated comparison
are required before changing implementation; gates and raw-frame retention
remain unchanged. No completed round-3 LOOP line is recorded.


Cadence hosted run37749780610 FAILED at exact ea57ee08…b7e72, completed
08:35:59 UTC. Full npm test passed 46/46 node tests (including eight session
checks),25/25 compiled mutation kills and76/76 default full browser checks
including both unchanged frame gates. Integrity then correctly rejected the
retained prior snapshot e17275c6 instead of delivered48be0c5b. This source-
matched evidence was explicitly pending when the checkpoint was pushed.
Commands: `gh run view 37749780610 --json status,conclusion,headSha,jobs` and
`gh run view 37749780610 --log`. Public summary: evidence/checks/ci-round-3-cadence.json.
No hosted frame values are inferred; artifact11537921864 is uploaded but has
not been downloaded. The local isolated comparison found no codec/long-task
hotspot and the previous page also stalled under profiling. A fresh unchanged,
untraced full browser run is warranted by those unresolved local frame failures;
its new result is still pending. All failures/raw frames remain preserved.


## Round 3 — completed local verification

`node scripts/browser-check.mjs --snapshot`: PASS full76/76, run
20261008083956897, unchanged frozenHTML48be0c5b…065378. All24newrecovery
cases pass on desktop and4xphone; resumed Normal bots wait2012/2037ms.
All600rawintervals retained: desktop59.9023591546FPS,p99 16.8ms,max33.4,
phone4x59.8032473163FPS,p99 16.8ms,max50; oneinterval above17ms each.
Both unchanged nominal60Hz gates pass. This is a complete new untraced full
run, not a composition of prior probes. First failed full run is retained.

`node scripts/capture.mjs round-3 --pace-demo`: PASS, start/endHTML48be0c5b,
zero network/page errors. Desktop1,734,468bytes and phone1,676,748bytes;
per-video hashes in evidence/browser/round-3-captures.json. Each records two
actual reloads, null-state pending gate, covered explicit Resume, preserved
cups/RNG, Discard/New Game clearing only this key, Normal and Manual behavior,
five real rounds and a winner. Normal2084/2044ms; Manual2291/2419ms until step.
Recordings are not frame-rate measurements. All source/evidence writers
stopped08:44:40 UTC. No core/probability change; accepted round2matrix/leagues
and hosted46node/25mutationpass remain valid for identical input hashes.

Final round3 hashes/integrity run after the following docs/LOOP checkpoint;
exact final-head hosted CI remains required before the PR is called complete.

Final round3 `node scripts/hashes.mjs` twice + `cmp`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: PASS,
277 delivered files, byte-identical generated fixtures/manifest, passing
source-matched raw600 frames and recordings under10MB, pure-source and
original/Zod license checks. Docs below change only this recorded summary;
manifest is regenerated once more for the commit.


Round3 hosted acceptance: exact30eec5b80a732996b692bce8ae78b1e2444dbc2b
passed run37752206859, completed08:54:56 UTC. `gh run view 37752206859
--json status,conclusion,headSha,jobs` and `gh run view 37752206859 --log`:
full npm test PASS,46/46node,76/76browser,25/25compiled mutation kills,
277-file integrity and byte-identical regeneration. Uploaded unexpired
artifact11539195267 matches that head; bytes were not downloaded. Public
metadata evidence/checks/ci-round-3.json; no hosted FPS values inferred.
Round4 final-standings source is a later pending head, so this acceptance
does not assert later source passes before its own checks.


## KEEP GOING round 4 — final standings

`npm run build`: PASS strict TypeScript/bundling, frozen HTML
09f9f709848a02c1ee25a4a575ce967d6f20dc02e09ec7e0f1cb8300232b97a1.
Core5d10032d and session0538ddf remain unchanged. The actual core results
feed the finishing list, with competition ranks, tied winners, remaining dice
and elimination order; New Game/Discard remove old result rows.

One-off old-page browser probe: actual accepted48be page with eight seats and
remaining counts[5,5,4,3,3,1,0,0], followed by the real End game button. Old
finishing rows0, named tied winners0; original core ranks[1,1,3,4,4,6,7,8]
and winnersp0/p1. Public baseline/source metadata and screenshot are
evidence/browser/round-4-before-standings.json/.png. Default checks consume
this stable artifact; they do not depend on ignored files or old git history.

`node scripts/browser-check.mjs --snapshot`: PASS full84/84, run
20261008090449926 at09f9HTML. Ten actual displayed-standings vs imported
`game.results` comparisons pass for natural and early endings, unequal and
tied eight-seat tables, long/markup-like names, semantics, mobile layout,
recovery and cleanup. Same fixture shows places0→8 and identified tied
winners0→2. All600 raw intervals retained: desktop59.703869FPS,p99 16.8ms,
max50ms; phone4x59.506690FPS,p99 16.8ms,max83.4ms; two above17ms each.
Both unchanged mean/p99 gates pass. Source guard matches HTML and core.
Full public report/raw/archive and comparisons: evidence/browser/report.json
and round-4-standings.json. Matching clips are recorded below after completion.


`node scripts/capture.mjs round-4 --pace-demo`: PASS, start/end source09f9,
zero network/page errors. Desktop1,713,641bytes and phone1,545,684bytes;
per-video SHA256 in evidence/browser/round-4-captures.json. Both show five
real rounds, natural finishing standings, and an eight-seat prepared live
fixture followed by the actual End-game button, all eight places and tied
ranks[1,1,3,4,4,6,7,8]. Normal-action clip values2034/1817ms measure the
remaining window after a state read, not the whole scheduler delay. Use the
armed-clock full-run pacing probe for scheduling claims. Recordings do not
measure FPS. All writers/processes stopped09:10:06 UTC. Final hashes/integrity
are run for this completed proof checkpoint; final-head GitHub acceptance
remains required before the PR is marked ready.

Final round4 `node scripts/hashes.mjs` twice + `cmp`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs`: PASS,
293 delivered files, byte-identical fixture/manifest regeneration, source-
matched passing raw600-frame snapshot and recordings below10MB, purity and
original/Zod license checks. Manifest regenerated for the final docs commit.

Round4 hosted acceptance: `gh run view 37755395776 --repo
luisitin/partybox-game-cores --json status,conclusion,headSha,jobs` and
`gh run view 37755395776 --repo luisitin/partybox-game-cores --log`: PASS at
exact445cf47, completed09:25:32 UTC. Full npm test passed46/46 node,
25/25 compiled assertion kills,84/84 browser checks and293-file integrity.
Artifact11539579811 is unexpired and matches that head; it was not downloaded.
Metadata: evidence/checks/ci-round-4.json. No hosted FPS values are inferred.

## Round5 cadence checkpoint — source complete, browser proof pending

`npm run build`: PASS strict TypeScript/bundling at HTML
33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a.
Core5d10032d and session0538ddf are unchanged. The on-page palifico help now
states the actual trigger/duel/prior-experience/current-count/starter rules.
Explicit null/undefined checks support a valid empty seat through selection,
private cup, input, reveal acknowledgement, winner and loss messages.

The actual old09f9 page, genuine seeded core-init roster
['','__proto__','constructor'] and correctly encoded saved metadata reproduce
the previous hidden cup/null-controller problem. Public source-bound baseline:
evidence/browser/round-5-before-host.json and round-5-before-empty-seat.png.
The optional programmatic hidden-button probe is explicitly identified; it
does not pretend a person can click a hidden button.

`node scripts/browser-check.mjs --snapshot`: first full run FAIL89/94,
run20261008093609401. Four new comparisons failed because Playwright's
object serializer drops own '__proto__' entries during state transport; the
actual browser cup DOM worked. The independent oracle now receives JSON text
and parses it in Node, preserving original own entries. This correction keeps
the genuine roster and every assertion. The corrected runner5839e1cc is
syntax-checked but its full verification is pending at this checkpoint.

The same first run independently failed desktop mean58.538870FPS; p99 16.8ms,
max166.6ms, five of600 intervals above17ms. Phone4x passed60.002400FPS,
p99/max16.8ms, all600 retained. No causal performance defect is established;
no runtime optimization or gate relaxation is claimed. Exact failing runner,
report, log and both raw frame files remain under
evidence/browser/runs/33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a/20261008093609401/.

All first-run processes closed09:39:53; corrected test writer stopped09:40:23.
Prior source-bound passing snapshot is retained for its09f9 HTML. This cadence
commit does not claim new-source browser acceptance, recordings, integrity or
a completed fifth KEEP GOING round. Required unchanged-core results already
pass; GitHub will rerun the aggregate suite after the checkpoint push.

Cadence file checks: `git diff --check`, `node scripts/hashes.mjs` twice plus
`cmp`, and `sha256sum --check SHA256SUMS.txt`: PASS304 delivered files.
`node scripts/integrity.mjs`: FAIL as expected because the preserved09f9
browser snapshot does not match the new33f5 page. Exact stderr is retained
under ignored .work/round-5-cadence-integrity.log. The guard remains required;
new passing source-matched proof must replace the top snapshot before acceptance.

## KEEP GOING round5 — completed local proof

`node scripts/browser-check.mjs --snapshot`: PASS94/94, exact default full run
20261008100423816, completed10:08:17 UTC. Frozen HTML33f5e801…f6c7d37a,
runnerf8a8d602…5bcba77, unchanged core/session bundles. All ten new profile
cases pass: actual core/session saved roster['','__proto__','constructor'],
covered Resume, ordinary bids/handoff, unknown-seat privacy, empty-seat
loss/acknowledgement/winner, accurate palifico help and18 exemption conditions.
The actual before/after probe measures private-dice availability0→5; no
initial turn/cup was edited. Public proof: evidence/browser/round-5-host.json.

All600 consecutive frame intervals retained, no filtering: desktop60.002400FPS,
p99/max16.8ms, zero above17ms; phone4x59.803247FPS,p9916.8ms,max50ms,
one above17ms. Same eight-seat live bid/cup/legal-selector workload; no
recording overhead. HTML/core/session start-end guards and offline/error checks
pass. Public report/raw/complete archive: evidence/browser/report.json.

The second full run20261008094526208 failed92/94: existing pause comparison
and phone48.716325FPS/p99133.4ms/max350ms. Its exact runner/log/raw are
retained alongside the first89/94 failure. Actual-pause instrumentation proves
a deliberately2571ms delayed click follows a legitimate pre-pause bot move;
once accepted, paused state/RNG holds and cup5→0. The oracle now compares
against accepted paused state, asserts pause/private removal/RNG hold and
retains1900–2300ms resume bounds. Final actual resumes2026/2074ms pass.
The diagnostic phone600 sample is explicitly nongating; no original frame-
failure cause or runtime FPS improvement is claimed. Exact diagnostic harness,
summary and measurement are under evidence/browser/diagnostics/.

`node scripts/capture.mjs round-5 --pace-demo`: functional PASS, independently
recorded before final FPS acceptance. Desktop1,877,270bytes and phone1,741,894;
matching33f5 start/end source, zero network/page errors. Both show correct
help, genuine saved custom-ID Resume/open/bid/dudo/Next, Normal/Manual pacing
and five actual rounds/winner. Recording is not a performance measurement.
Source guards/hashes: evidence/browser/round-5-captures.json. All delivery
writers and processes stopped10:08:17 UTC for final hashes/claim/push.

Hosted cadence37758787707 at26222ec passed46 node/25 mutations/full94 browser
checks including both strict gates, then correctly failed the retained09f9
snapshot comparison. Metadata: evidence/checks/ci-round-5-cadence.json.
Artifact was not downloaded; no hosted FPS values are inferred. The current
published local source-matched snapshot resolves that recorded evidence gap.

Final round5 `node scripts/hashes.mjs` twice plus `cmp`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs` and
`git diff --check`: PASS334 delivered files,2× byte-identical fixtures/manifest,
source-matched full94 raw frames, original/Zod notices, pure core and all
recordings below10MB. Manifest regenerated once more for this final log entry.

## KEEP GOING round6 — current summary and scope

Read root README/RULES/JOBS byte-for-byte; hashes remained
e4b24b68/4149f36b/20d45e05. Independent source-only audit and narrow cross-check
found no new concrete gameplay defect. Rewrote README current results and
explicit default-duel/Chrome-emulation scope;41 lines, under60 requirement.
Python hashlib SHA256 comparison of the ten paths in
`evidence/checks/round-6-review.json`: all unchanged,0 implementation changes
and0 player-visible gain. This detects accidental runtime/runner drift.
`node scripts/capture.mjs round-6`: PASS, two actual five-round games, matching
33f5 HTML/core/session start-end guards, zero page errors/requests; desktop
906,218B and phone883,460B. These fresh milestone recordings are functional
evidence, not FPS measurements. Current full94/94/strict600 proof is retained
without repeating unchanged passed local checks. No-gain streak1.

`gh run view 37762109046 --repo luisitin/partybox-game-cores --json
status,conclusion,headSha,updatedAt,jobs` and `gh run view 37762109046 --repo
luisitin/partybox-game-cores --log`: PASS exactcc0e1aa, completed10:23:34 UTC,
46 node tests/94 browser checks/integrity334/2x byte-identical. Published
metadata: evidence/checks/ci-round-5.json. Hosted log read; artifact not
downloaded and no hosted frame statistics inferred. Every new branch head
still requires its own final green CI before PR readiness.

Round6 `node scripts/hashes.mjs` twice plus `cmp`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs` and
`git diff --check`: PASS; final checksum count is printed by the exact
commands and includes this log. No fixture/manifest byte drift.

## KEEP GOING round7 — provenance and evidence index

Re-read root README/RULES/JOBS; exact hashes unchanged. Python hashlib
before/after the ten implementation paths: PASS all identical; report
`evidence/checks/round-7-review.json`,0 implementation changes/player gain,
no-gain streak2. Python regex relative-link existence audit on EVIDENCE.md
and README.md: PASS; catches missing public evidence pointers. Historical
calibration now explicitly distinguishes initial-core/private scratch, early
league100-pair reuse and current public fresh holdout; old outcomes preserved.
`node scripts/capture.mjs round-7`: PASS two actual five-round games on
unchanged33f5 HTML/core/session; zero requests/errors, desktop961,911B/
phone958,039B, both under10MB. Functional recording, no FPS claim.
Passed unchanged core/full94/strict600 tests are retained, not rerun locally.
`node scripts/hashes.mjs`2x/`cmp`, `sha256sum --check SHA256SUMS.txt`,
`node scripts/integrity.mjs`, `git diff --check`: PASS; catches stale files,
fixture/manifest drift and source-mismatch evidence.

## KEEP GOING round8 — trusted API and final handoff

Re-read root README/RULES/JOBS byte-for-byte; hashes remain
e4b24b68/4149f36b/20d45e05. Source inspection `rg -n`/`sed` on browser/session
confirms raw trusted setState clones valid core state while retaining host
skills/RNG/pace; complete encodeSession validates matching recovery metadata.
Documented exact boundary and public validated checkpoint path. No runtime
behavior changed and no new gameplay defect was established by independent
source audits. Stable NEXT instructions require exact current branch-head
CI and fresh ownership, avoiding stale completed-claim assumptions.

Python hashlib before/after ten implementation/runner/manifest paths: PASS
all identical; `evidence/checks/round-8-review.json`,0 changes/player gain.
Python regex relative-link audit on EVIDENCE.md/README.md: PASS.
`node scripts/capture.mjs round-8`: PASS two actual five-round games, unchanged
33f5 HTML/core/session guards, zero network/errors; desktop1,153,462B and
phone1,537,017B, under10MB. Captures are not FPS measurements.
All artifact writers/groups stopped10:41:54 UTC. No repeat of unchanged passed
core/full94/strict600 local tests; full hosted npm test still runs each head.

`node scripts/hashes.mjs` twice plus `cmp`,
`sha256sum --check SHA256SUMS.txt`, `node scripts/integrity.mjs` and
`git diff --check`: PASS354 delivered files,2x byte-identical fixtures/manifest,
source-matched full94 raw proof, original/Zod notices and all clips under10MB.
Rounds6–8 now establish three consecutive0-player-gain stopping rounds.
Exact-final-head CI green is still required before calling PR6 ready.


## Reclaimed checker audit — milestone9

Original f8a8d602 browser runner retained genuine600 consecutive intervals
and correct>=59FPS/<=17ms gates. Its integrity frame-validation block omitted
complete report/profile/source binding. Twelve counterexamples accepted by
that exact block are public; raw positive arrays are genuine and unaltered.
This receipt does not claim the entire SHA-manifest integrity CLI accepted a
stale delivery manifest. Exact original checker/runner bytes are archived.

`node --check scripts/browser-check.mjs` and
`node --test tests/browser-evidence.test.mjs tests/frame-coordination.test.mjs`:
PASS70/70 at17:33UTC. Fifty-six corrupted historical reports/raw sets reject;
one genuine historical positive is explicitly bound to the actual f8a8d602
runner,with historical/current separation and wrong-runner rejection. Eleven
nonce-coordination checks test actual filesystem grants,not browser frames.
Current-run positive/source-guard controls will run only on genuine fresh data.

`readSourceGuards`: PASS30 actual paths,including current checker/runner,
package/workflow,new tests,shared contract and actual compiled modules. Fresh
current-only CLI requires both profiles/all94 checks/all1200 raw intervals;
source/run/viewport/CPU/offline/recording/fullness/metrics/gates are bound.
Current full browser and exact-head hosted acceptance are still PENDING.

`node scripts/capture.mjs resume-audit-9`: PASS two actual five-round games,
HTML33f5e801 start/end equal,zero errors/network. Desktop1,251,873B and
phone4x1,165,745B,both<10MB. Capture is functional evidence,not frame acceptance.
Existing game/core/session/HTML bytes and three prior no-player-gain rounds
remain unchanged; this verification gain does not assert a performance gain.


## Current source-bound hosted proof and local failure preservation

Exact a490f6f run37817956480 SUCCESS17:47:35UTC; job113451323074 full130,728
character log inspected:116/116 nodes,25/25 compiled assertion kills,94/94
browser,current30 guards/1200 native intervals,68/68 actual-current controls,
370 hashes/2x regeneration PASS. Actual artifact11569180344 ZIP1,220,572B and
SHA2425066a63324fac47b31591767033b4942290f510b2dee88df43801ef9d8190 match
native metadata. Independent Python1306 assertions validate both full raw
profiles,all30 actual source bytes,all94 checks/offline data/metrics/gates.
Both hosted profiles60.002400FPS,p99/max16.8,0 drops. The actual native timed
callback1493 bytes/SHA4d12a4f66f7d97066534f3693fea41583a7e1779640d29cfc1259433368879ba
is byte-identical to the original f8 runner. Proof/reader are public under
resume-audit-9-hosted-independent.json/resume-audit-9-independent-reader.py;
the manual reader expects downloaded artifact.zip and extracted source next
to its script and runs from repository root. It is not a default-test scratch
dependency. This specific hosted success does not erase local failures.

Local20261008173740283 completed91/94 EXIT1:phone pause-clock<200ms,
saved-resume clock<250ms,and strict phone600 FPS58.825836307 failed. Raw p99
16.8,max83.4,5 dropped intervals,total10199.6ms are all retained; desktop600
PASS60.002400FPS,p99/max16.8. Source maps/runner and genuine pre-sample idle
STOP/grant/CLOSED receipts are public. STOP preceded any phone grant/sample;
no elapsed acceptance window was paused or manufactured. No cause claimed.
The current-head PR remains draft pending actual clock-boundary review.

Fresh resume-audit-proof-10 clips PASS two actual five-round games,unchanged
page hash and zero errors/network. No unchanged strict frame retry occurred.

## Recovered clock-observer checkpoint11

`node scripts/clock-observation-diagnostic.mjs` actual final run18:18:35.602UTC:
PASS four trusted ordinary clicks (desktop plus4x phone), original200/250ms gates,
32 then-current source guards unchanged, zero errors/network. Event errors
0/15/1/84ms; deliberately delayed425ms real RPC errors451/478/527/635ms fail old
formulas;12 copied wrong-deadline controls reject. Public diagnostic explicitly
identifies its earlier source scope. This is neither FPS acceptance nor a proven
historical cause. `--functional-only` interrupted run20261008181959035: INCOMPLETE,
no final report, no phone/FPS acceptance; partial original log retained.

Recovered `node --check` on browser-check, browser-evidence and both clock modules:
PASS. `node --test tests/browser-evidence.test.mjs tests/frame-coordination.test.mjs`:
70/70 PASS at recovery. Current-source positive and extra current-only controls
require the upcoming genuine fresh full report; no synthetic positive is used.
SHA256 on actual page/core/session/browser and compiled core/session matches all
prior gameplay bytes. The actual600-interval callback is unchanged. New outside-
sample workload guards verify active phase/no deadline/8 seats/40dice/5private
dice/existing8x3 bid/exact odds and identical real state throughout grant+sample.

Exact prior32ea5f0 hosted run37821793551 SUCCESS18:14:34UTC, actual job113464397503
full130717-character log read. Its current checks pass116 tests,25 actual mutants,
full94 browser,1200 intervals/30 guarded sources,68 current corruption controls,
392 hashes and2x byte-identical regeneration. Actual artifact11568859865 metadata
1220656B/SHAf101111a6b19294146b3f0d9a2bdd7c4d013e713fc4c4127f066d14becb5fa02
is observed but not yet independently downloaded for that exact run.
That green head and prior a490 independently verified artifact remain historical
for the newly repaired observer/checker. PR6 remains draft pending exact fresh CI.

Prior push completion observed18:07:04UTC (hosted creation18:07:01), recovery
19:11:49UTC: cadence exceeded30minutes during interruption. No backdate or waiver.

## Actual unsampled checker failure and correction12

Full run20261008191711475 completed all94 checks:92 PASS, two strict setup
failures on undefined !==8 because the new observer used array.length for the
contract player map. Both failures preceded READY; zero frame intervals were
collected. Both owned Node/browser groups closed before correction. All four
actual clock observations passed unchanged200/250ms gates (errors0/17/0/60ms).
The complete failed report, exact32 source maps and original log are preserved.
This is a checker error, not a gameplay or FPS failure. Corrected count uses
Object.keys(state.players).length; no production/timer/native callback changed.
Native samples now also save an explicitly incomplete sidecar immediately after
CLOSED, before endpoint verification; it can never substitute for complete raw
acceptance. Workload corruption controls alter BOTH report/raw boundaries, so
finished/timed/closed-cup/missing-odds/changed-bid/dice fixtures cannot merely
fail because two copied reports differ. Current full/CI acceptance remains
PENDING; no unchanged strict timing retry occurred.
