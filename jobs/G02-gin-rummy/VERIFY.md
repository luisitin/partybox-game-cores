# Verification — 1.1.0 full local acceptance passed, current CI pending

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
