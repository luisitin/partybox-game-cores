# Verification — version1.2.1

Original final delivery passed exact-head hosted CI37730486159 at
723bfa77ce91482f4084bbc195c117fa8d71480b; PR#2 was ready. The following original
table and records describe historical checks. They do not accept the resumed
host repair, whose source at 8136bf2 passed exact-head hosted CI 37770743158.
The latest metadata/evidence head still requires its own green check.

## Resumed host repair, 2026-10-08

`npm ci --ignore-scripts --no-audit --no-fund`: PASS. `npm run build`: PASS.
`node --check .work/reclaim-before.mjs && node .work/reclaim-before.mjs`: PASS
as a negative-control diagnostic, not an acceptance test or FPS measurement.
Actual file navigation/real clicks with controlled entropy 7 showed human click
30.8 ms overdue and Easy-bot click 30.1 ms overdue applied Pass instead of the
unchanged core timer's Take-discard. Actual New match retained11 hand cards,
10 meld selectors and deadwood/actions inside the hidden table; no visual
exposure is claimed. Exact original page/harness/measurements: before-* and
before.json in evidence/resume-20261008.

`npm run build` after the host patch: PASS; script syntax checks PASS.
`node scripts/real-host-check.mjs`: first attempt failed while observing the
queued details-toggle render before its 10 selectors existed; its exact harness
and failure are retained. The corrected harness waits for the actual fixture
without weakening assertions: PASS. Both actual-file real clicks 30.6 ms overdue
apply only the timer's Take-discard 6♥ and leave 0 private cards in DOM. New match
clears11→0 cards,10→0 selectors, deadwood and actions. after.json/after-* bind
the unchanged core/cards and generated HTML796f66c6 to these measurements.

`node scripts/browser-check.mjs --snapshot`: FAIL strict desktop mean58.730056
FPS (p99 16.8 ms/max 100 ms), phone4x PASS 60.001800 FPS (p99/max 16.8 ms).
All 34 original interaction checks, clock/meld/results/name suites and five new
host regressions PASS, including five subsequent unchanged-RNG Easy-bot moves.
Both profiles retain 600 consecutive intervals; no samples are dropped. Exact
runner/helper/report/raw frames/log are in attempts/2026-10-08T11-27-10-248Z.
Desktop intervals above 17 ms are55=100, 523=83.3, 544=50, 545=50 ms; their cause is
unestablished. A failed run never replaces an accepted snapshot.

`node scripts/capture.mjs resume-host`: PASS. Separate source-guarded functional
clips show private cleanup and real 10-second timeout coverage: desktop 596,569
bytes; phone4x 593,936 bytes. Independent start/end HTML/core/cards/host/template
guards match. Captures/report/log remain in media and resume evidence. Frame
acceptance and current-head hosted CI remain pending; recording is not FPS proof.
No unchanged local core matrices/leagues/mutations were repeated for host-only
edits; hosted npm test continues to run the entire required suite.

Exact head 8136bf2136da4c5223aa1a2c43881dc71e0ad7fe passed hosted run 37770743158
at 11:36:08 UTC: 32/32 node tests, leagues 57.60%/87.15%, 25/25 compiled
assertion-killed mutants, all browser suites/five host regressions, 209-file
integrity. The actually read hosted log reports desktop 60.002196 FPS and
phone4x 60.002400 FPS, both p99/max 16.8 ms, with matching 796f66c6 guards.
Log/metadata are hosted-8136bf2.*. Artifact 11548086113 exists/unexpired but its
Azure download returned 403; raw contents were not read or reconstructed.

This same-source hosted pass justified one unchanged local confirmation:
`node scripts/browser-check.mjs --snapshot`: PASS, start 11:43:45.886 UTC,
desktop 60.002400 FPS/p99=max 16.8 ms; phone4x 59.902957 FPS/p99 16.8/max 33.3 ms.
All 600 intervals per profile remain, including the phone stall. Every existing
suite, 34 interactions and five host regressions PASS; source guards match.
Complete report/raw arrays: browser.json/*-frames.json in resume evidence;
exact runner/helper/log/report/raw also remain under the attempt's directory.
The previous failure is preserved; its cause remains unestablished.

`node scripts/hashes.mjs` twice plus byte comparison: PASS,208 delivered files
at the first verification snapshot. `node scripts/integrity.mjs`: PASS,208
hashes, two byte-identical fixture/manifest regenerations, pure core scan,
exact pinned Zod notice and all videos under10MB. Evidence/doc additions are
rehash-checked before the milestone push. This integrity result accepts the
file inventory/licensing/regeneration, not the failed desktop frame rate.

| Check | Latest actual evidence | Limit |
|---|---|---|
| Strict build / exact contract / fixtures | round5 full sequence, round7 build/tests, hosted round7 SUCCESS | Final hosted head remains required |
| Independent exact solver proofs | 10,000 deadwood +2,000 joint-layoff cases, round7-tests.log | Same-author independently designed references, no false blind-author claim |
| Mutation resistance | 25/25 compiled real source mutants, round7-mutations.log | Assertion kills, not parse/compile failures |
| Full bot matrix / every-event replay | 6,000 games+replays,1,736,888 SHA256/byte/roundtrip checks, round6-replay-tests.log | Both editions,2/3/4 players |
| Properties / secrecy / phases | 1,003 seeds;7,925 perturbations;408 phase cases; full/round6 logs | No physical SDK shipped; ordered local adapter disclosed |
| Bot leagues | sharp1152/2000=57.60%, normal1743/2000=87.15%, bot-league.json | Correct first-to-target winner; paired seats/deals |
| Malformed inputs / mixed replay | round8-boundary-tests.log:8PASS,6,000 rejected inputs,282 metadata checks,48,000 mixed events | No production behavior change |
| Offline UI / clock / meld / result / name | hosted round7 full suite; round8-name-check PASS | Final longer browser gate pending hosted acceptance |
| Browser frame timing | round7 local60.003/59.670FPS; raw reports/maxima retained | Round8 local strict gate FAILED; all failures/control data retained |
| Captures / license / hashes | round7/8 capture logs; exact pinned MIT notice; integrity hashes/regeneration | 1x/4x simulations, clips<10MB, not a physical-phone claim |

Exact commands and results by round follow below. Current hosted gate:
https://github.com/luisitin/partybox-game-cores/pull/2/checks .
CI retains frame samples/reports as G02-browser-evidence artifacts even on
failure. No local failed measurement is silently relabeled as accepted.

# Historical verification records

Nine actually read Exa extractions, exact extraction hashes and all short quote
matches are recorded in evidence/research-sources.json. Origin HTTP unobserved.

| Executed command | Actual result | What it catches |
|---|---|---|
| `npm run build` | Strict TS/ES2022 compile, offline page generated | Type/contract drift |
| `node --test tests/rules.test.mjs tests/differential.test.mjs` | 8 tests PASS; 10,000 hands (5,000 each of 10/11 cards), checksum584788 | Wrong exact minimum, overlap, ace/run/set errors, scoring and turn rules |
| `node --test tests/contract.test.mjs` | Historical random-easy baseline PASS: 6,000 matches +6,000 exact replays, 1,003 property seeds, hidden-state and idle tests | All contract invariants, conservation, state mutation, hidden cards/order, malformed events, schema-valid bots, phase exits |
| `node --test tests/ends.test.mjs` | Three reducer edge suites PASS | Actual Big Gin/Gin, disabled claims, layoffs, custom layouts, boxes, match scoring and rotation |
| `node scripts/league.mjs` | Current strong1151/2000 (57.55%), medium1743/2000 (87.15%); confidence bounds>50% | Real skill separation |
| `node scripts/mutations.mjs` | First23/25; after two meaningful edge goldens25/25 compiled assertion kills | Real isolated source bugs, no parse/compile-failure kills |
| `node scripts/browser-check.mjs --capture` | Desktop60.002FPS/p9916.8ms; 4x phone59.341FPS/p9916.8ms/max33.3ms, privacy/offline/reduced motion PASS | Actual play interactions, DOM privacy cover, pause/end, no network, frame responsiveness |

All25 mutation source edits/compile/assertion outcomes are in mutations.json.
Browser uses60Hz target with explicit rounding gates mean>=59FPS,p99<=17ms;
all actual samples/maxima are retained. Simulated4x phone, not physical hardware.
Performance is normal play without recording; screen capture uses a separate
context to avoid encoder overhead. Both milestone videos are under10MB.
Earlier failed source access,23/25 mutation run and browser failures are preserved.

Actual complete `npm test` finished exit0 on Node24.19.0/TypeScript5.9.3.
The unchanged code passed15 tests,6,000 matches+6,000 byte-identical replays,
1,003 property seeds/420,546 events,7,925 hidden-state perturbation stages,
both2,000-match leagues,25 compiled mutation assertions and the full browser
interaction/60Hz profile. Actual full-run browser means60.004FPS desktop and
60.002FPS phone4x; both p99<=16.8ms. All63 then-delivered hashes and TWO
fixture regeneration runs passed byte-identically. Full actual output and
records: evidence/full-local-accepted.log and acceptance-summary.json.

Additional actual command: `node --test tests/all-phases.test.mjs
 tests/layoff-differential.test.mjs` (on one line):3 PASS tests,408 all-phase
cases plus2,000 independent joint-layoff exact comparisons, checksum102460,
1,534 actual laid cards and a competing run/set chain. These files were added
while the longer suite was running and were separately executed, not counted
as though the earlier glob had included them. Hosted npm test includes all18.

Final exact-head PR CI is still pending. No READY claim until the actual
hosted result is green. Post-green KEEP GOING remains required.

Version 1.1.0 pre-green repairs: the original same-timestamp draw timer was
incorrectly accepted on a subsequent draw phase. A logical phase stamp fixes
that exact counterexample without changing event-time deadlines. Command
`node --test tests/rules.test.mjs tests/ends.test.mjs
tests/timer-instance.test.mjs tests/batch-discard.test.mjs` passes 12 tests,
including 10,500 exact-layout/independent-minimum discard comparisons.
The current full acceptance is pending; earlier full logs are baseline evidence.

`node scripts/profile-bots.mjs` before/after batching: 1,000 identical fixed
discard states per skill, both decision hashes unchanged. Medium wall time
386.956→94.894ms; strong 253.104→71.336ms. Raw samples/source hashes are in
evidence/bot-profile-before.json and bot-profile-after.json. These are local
microbenchmarks with shared-machine noise, not physical-phone measurements.

Actual version 1.1.0 `npm test`: exit0, all20 tests and both full leagues
passed, 25/25 compiled mutants caught, all75 then-delivered hashes and both
regenerations passed. Raw output: evidence/full-local-1.1.0-accepted.log;
source-bound summary: acceptance-1.1.0.json. Desktop mean60.004FPS; phone4x
mean59.343FPS/p9916.8ms/max49.9ms (one outlier). The same-code capture run
measured60.003/60.002FPS with max16.8ms; both raw runs are retained. No
claim of constant zero-jank frame timing or physical-phone testing.

Hosted baseline 1.0.0 CI 37717614222 actually finished SUCCESS at head
c0dabcfd6b86fb096938bfb0ef7f0b714e998429, including all18 then-hosted tests,
all required matrices/leagues,25 mutants and browser checks. Exact npm-test
step output: evidence/ci-baseline-1.0.0-accepted.log. This does not verify
1.1.0; its current-head hosted run remains required.

Round1 version1.2.0 targeted command: `node --test tests/departure.test.mjs
tests/rules.test.mjs tests/all-phases.test.mjs`:13PASS/exit0. This catches
absent/disconnected turn blocks, permanent rejoin, empty versus intentional
pause, preserved all-seat results and malformed VIP/player control events.
1,000 initial cases +120 complete matches/17,184 events; max75 automated
transitions. Full current acceptance pending. Hosted1.1.0 run37719011330
at b82c0cbc actually passed; current1.2.0 has not been hosted yet.

Round1 complete npm test exit1: all24 node tests/matrices/leagues and25/25
mutants PASS; browser failed desktop mean58.381FPS/max83.4ms. Initial
capture failed phone32.928FPS/p99250ms/max450ms. Raw failures retained.
node .work/browser-diagnose.mjs compared unchanged1.1/1.2 offline pages:
both profiles60.002–60.004FPS, current phone handler max2.1ms.
node scripts/browser-check.mjs --capture fresh PASS: desktop59.672FPS
(p9916.8/max33.3ms), phone4x60.002FPS(p99/max16.8ms),17 interaction/privacy
checks per profile. Captures81KB/128KB explicitly use1x/4x CPU. Source and
raw evidence: round-1-summary.json and related files. No cause of the
earlier slow frames is established. Current hosted CI pending. Evidence/hash
preparation initially used the wrong working directory and failed to locate
job files; it was corrected and integrity re-run before this branch push.

Round2 exact command/results and before/after measurements are recorded in
keep-going.md, round-2-tests.log, round-2-mutations.log, round-2-browser.log,
layoff-profile-before/after.json and layoff-browser-before/after.json.
14 targeted tests PASS; independent10,000/2,000 proofs PASS;25/25 compiled
mutants caught;2,002 full canonical solutions unchanged. Phone4x algorithm
cases6813→11.3ms and1278.1→10.2ms. Actual playable-page60.002/60.004FPS,
p99/max16.8ms,17 offline/privacy/control checks per profile PASS. Round1
hosted CI37721051891 at b096b6a actually SUCCESS. Round2 hosted CI pending.

Round3: npm run build PASS. node scripts/clock-check.mjs PASS: delayed
20s callback advances expired10s move, paused countdown frozen, resume
preserves remaining time, and host entropy API called once. node scripts/
browser-check.mjs --capture --clock-capture PASS: desktop60.003/phone60.004
FPS, p99/max16.8ms, privacy/offline/reduced-motion checks and visible-clock
captures. Exact reports: clock-before/after.json and round-3 logs. This
round changes the host, with controlled test entropy and independent synthetic
clock checks; game logic remains unchanged. Hosted current acceptance pending.

Round4 exact commands: npm run build; node scripts/meld-check.mjs --capture;
node scripts/browser-check.mjs (three executions, FAIL/FAIL/PASS).
Results, failure causes not established, raw frames and fixture-injection limits
are recorded in keep-going.md and evidence/round-4-* plus custom-meld-*.json.
The production renderer now shows declared/resolved layouts; privacy covers
remove named-card controls and deadwood text. The accepted strict browser run
measured60.004FPS desktop and phone4x; captures143KB/232KB. The two prior
hosted heads passed actual CI; current-head CI remains required.

Round5 before: node --test tests/results-boundary.test.mjs FAIL3/PASS1,
with actual wrong-target-winner, empty-ID and invalid-identity witnesses retained.
After: npm run build; node --test tests/results-boundary.test.mjs
 tests/ends.test.mjs tests/rules.test.mjs PASS14. node scripts/results-check.mjs
 --capture PASS desktop/phone4x. Full exact local sequence (on one line):
npm run build && node --test tests/*.test.mjs && node scripts/league.mjs &&
node scripts/mutations.mjs && node scripts/browser-check.mjs: exit0,29 tests,
6,000 complete matches+6,000 final-state replays, both leagues,25 mutants,
and all browser regressions PASS. This is the full check sequence before
refreshing hashes for newly generated league evidence, not a falsely named
local npm test execution. Current-head hosted npm test remains required.
Raw source-bound results: round-5-full-checks.log / round-5-summary.json.

Round6 actual node --test tests/contract.test.mjs: PASS4/exit0,302,249ms.
All6,000 games now replay from serialized state after EVERY event:1,736,888
SHA256/byte/size/strict-roundtrip checks. Property/secrecy/idle tests also pass.
Exact command/output/rows/source hashes: round-6-replay-tests.log/summary.json.
No production/visual behavior changed. Hosted round5 run37728310327 actually
SUCCESS at b784006; exact npm-test step is ci-round-5-accepted.log.

Round7 exact commands/results: npm run build PASS;
node --test tests/card-domain.test.mjs tests/differential.test.mjs
 tests/layoff-differential.test.mjs tests/rules.test.mjs
 tests/branching-layoff.test.mjs PASS11; node scripts/mutations.mjs PASS25/25;
node scripts/browser-check.mjs PASS (60.003/59.670FPS,p9916.8ms,phone max33.3);
node scripts/capture.mjs round-7 PASS,55,705/100,521-byte1x/4x clips.
Raw logs, independent proof totals, source hashes and complete frames are in
round-7-* and keep-going.md. Licensing checks now require the pinned package's
exact notice in both HTML and delivered text. No player-visible behavior gain.

Round8 exact commands: node --test tests/boundary-fuzz.test.mjs
 tests/results-boundary.test.mjs tests/all-phases.test.mjs PASS8;
node scripts/name-check.mjs PASS; node scripts/browser-check.mjs repeated
five times FAIL (all logs/frames retained; first2 use180 frames, last3 use600);
node scripts/capture.mjs round-8 PASS. An explicit idle/interactive600-frame
phone control also records all samples and handler times. No cause of the
local timing failures is established; hosted exact-head full suite must pass.

`node scripts/capture.mjs resume-verified`: PASS; fresh verified-milestone
recordings retain source guards and demonstrate the repaired host. Their exact
bytes/hashes are in resume-verified-captures.json, with the actual run log.
No new frame measurement or physical-hardware claim is inferred from video.
