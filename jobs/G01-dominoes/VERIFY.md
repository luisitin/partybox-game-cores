# Checks actually run (2026-10-07 UTC)

- `git ls-remote origin HEAD`: pass, returned f1fc60ff51a01887402153543b05fdf35c230217.
  Checks scoped native Git read access, not API/push permissions.
- `git push origin main`: pass for `claim G01`. Checks actual push permission.
- In contract/: `npm --cache /workspace/.npm-cache install --ignore-scripts
  --no-package-lock --no-audit --no-fund`: pass, zod 4.6.5 installed.
  Default cache first failed because /home/agent/.npm was unwritable;
  switching cache location resolved the installation problem.
- From repository root: `/workspace/.onboarding-tools/node_modules/.bin/tsc
  --noEmit --strict --target ES2022 --module ES2022 --moduleResolution bundler
  --skipLibCheck contract/*.ts`: pass with TypeScript 5.9.3.
  Checks the existing shared contract; does not check a nonexistent game.
- Node ESM import of contract/node_modules/zod/index.js, accepting
  `{action:'pass'}` and rejecting `{action:'play'}` against a literal schema:
  pass. Checks actual dependency loading/validation, not game behavior.
- `curl -L --fail --max-time 30 -o /tmp/domino-rules.html
  https://www.pagat.com/domino/line/draw.html`: failed 403.
- Same command for https://www.pagat.com/domino/line/block.html and
  https://bicyclecards.com/how-to-play/dominoes: both failed 403.
- `curl -sS -I --max-time 15 https://en.wikipedia.org/wiki/Dominoes`:
  failed CONNECT 403. No article content inspected.
- `curl -sS -o /tmp/github-api-response.txt -w '%{http_code}\n'
  --max-time 15 https://api.github.com/repos/luisitin/partybox-game-cores`:
  failed CONNECT 403, exit 56, HTTP output 000.
- `gh api repos/luisitin/partybox-game-cores --jq .permissions`:
  failed Forbidden. gh auth status also reports an unusable configured token;
  that does not imply native Git is unauthenticated. No token requested.
- `git clone --depth 1 https://github.com/abw333/dominoes.git
  /tmp/partybox-domino-ai` and equivalent angeris/DominAI clone: pass.
  AI research available; no AI benchmark executed yet.

Game tests, mutation tests, simulations, leagues, UI checks, captures and CI:
UNRUN. Zero game tests executed. No game readiness or completion claim.

## Implemented workflow (research-only blocker superseded)

The web-blocked fallback added to main RULES.md supersedes the original stop.
Unverified conventions are explicit in RULES.md/SOURCES.md/NEXT.md.
All commands below run from jobs/G01-dominoes unless otherwise noted.

- `npm ci --ignore-scripts --cache /workspace/.npm-cache --no-audit --no-fund`:
  pass; installs the frozen development/runtime dependency lockfile.
- `python -m pip install --cache-dir /workspace/.pip-cache --target
  /workspace/.baseline-libs --upgrade --require-hashes -r baseline-requirements.txt`:
  pass; installs the independently researched test-only reference with hash checks.
- `npm run check`: pass before integration; strict TypeScript ES2022 checks the
  core, UI, bridges, tests and exact shared contract interface.
- `node fixtures.ts`, hash manifest/all fixture bytes, `node fixtures.ts`, compare
  with `cmp /tmp/G01-fixture-hashes-before /tmp/G01-fixture-hashes-after`: pass,
  byte-identical second regeneration. Every fixture is also played to completion
  in test.ts, and manifest equality is asserted and schema-validated in build.ts.
- `node build.ts` then `node build.ts --check`: pass; no external resource links
  or fetch calls, generated-script syntax is checked and manifest schema validates.
- `node checksums.ts` then `node checksums.ts --check`: pass at checkpoint;
  covers all shipped fixture/manifest/report JSON, PNG and WebM files.
- `BASELINE_GAMES=200 node baseline.ts`: pass; actual upstream package policy
  comparison, 142/200 strong-team wins. players.py/search.py SHA256 comparison
  with the live pinned checkout: both identical. See BOTS.md for bounded scope.
- `node browser.ts`: passed before final integration with 1920x1080 and 390x844
  viewports, 4x phone CPU throttle, 300 measured frames per mode, about 60fps,
  p95 16.7ms/p99 16.8ms; human handover privacy, full browser bot match, zero
  external requests, zero page errors and reduced-motion play all passed.
  Managed file:// navigation failed ERR_BLOCKED_BY_ADMINISTRATOR; exact HTML
  was exercised through setContent. File navigation and physical phone hardware
  remain unverified. The final integration reruns after TV-layout/timer changes.
- `node idle.ts`: pass after correction; 18,000 complete timer-only matches
  (2/3/4 seats × Draw/Block × 100/150/250 × seeds 1–1,000). Maximum simulated
  duration 2,007,103ms; budget 3,600,000ms. Prior 30s-per-idle-turn version
  failed the budget; the adaptive timeout fixes it without reducing human time.

## Mutation list (one at a time, passing baseline mandatory)

1. Negative tile accepted.
2. Tile 28 accepted.
3. Extra pass fields accepted.
4. Seven-tile deal becomes six.
5. Five-tile deal becomes six.
6. Opening highest-double rule disabled.
7. Forced opener accepts any tile.
8. Left-end orientation reversed.
9. Right-end orientation reversed.
10. Played tile retained / wrong tiles removed.
11. Pass streak not reset after play.
12. Turn does not advance.
13. Draw ignores reserved stock.
14. Draw uses last instead of first tile.
15. Drawing advances turn.
16. Drawing preserves invalidated pass inference.
17. Block settles one pass early.
18. All-remaining partnership omits teammate pips.
19. Blocked tie awards first seat.
20. Adjacent seats become partners.
21. Target requires overshoot.
22. Prototype property counts as player membership.
23. Inputs run while paused.
24. Stale timer instance guard omitted.
25. TV leaks private hands.

Each was killed by an assertion against a passing baseline in the second
isolated run. The initial mutation run against a failing test was discarded;
only the passing-baseline report counts. Final integration repeats all 25.

## Final integration result

`npm test > /tmp/G01-npm-test.log 2>&1`: PASS, underlying exit status 0.
25 node:test tests passed; zero failed, skipped, cancelled or todo. Includes
6,000 complete bot matches (1,000 for each 2/3/4-seat Draw/Block configuration),
1,003 property-seed matches (pinned 1/2/3 + 1,000 independently generated seeds),
idle liveness, view secrecy, timer/paused/unknown-event fuzz cases, fixtures,
manifest equality, pure-code scan, JSON size, replay and tile-chain conservation.

The same command then executed and passed:
- 18,000 full idle matches; longest 2,007,103ms vs 3,600,000ms budget.
- 10,000 independent exhaustive-vs-alpha-beta cases, seed 53759; zero mismatches.
- 25 assertion kills out of 25 mutants, isolated from a passing baseline.
- Generated HTML syntax/manifest schema/offline checks.
- Strong/medium: 1,296/2,000 wins, 64.8%; 95% interval 62.7–66.9%.
- Medium/easy: 1,619/2,000 wins, 80.95%; 95% interval 79.2–82.7%.
  These are final results AFTER the doubles-first easy policy change.
- Upstream configured baseline: 142/200 wins, 71%; 95% interval 64.7–77.3%.
- Browser handover concealment, full partnership bot match, TV viewport fit,
  zero external requests, zero page errors and reduced-motion play.
- TV 1920x1080: 300 frames, mean 16.666ms, p95 16.7ms, p99 16.8ms,
  60.001fps. Phone 390x844 at 4x CPU throttle: mean 16.722ms, p95 16.7ms,
  p99 16.8ms, 59.803fps. Browser emulation, not physical-phone measurements.
- Original short video media/milestone-1.webm, under 10MB, plus TV/phone PNGs.
- Regenerated and checked checksums for all shipped JSON reports/fixtures,
  manifest and media. Additional `sha256sum -c SHA256SUMS.txt`: all 13 files OK.

`git diff --check`: pass. The shared contract and both unrelated repositories
remain unchanged. CI and PR delivery are NOT claimed passed until the actual
GitHub operations succeed. KEEP GOING has not started because green CI is not
established. The managed file-navigation and bounded-baseline limitations above
remain explicit; local functional checks do not remove those limits.

## GitHub delivery and first CI result

PR creation succeeded: https://github.com/luisitin/partybox-game-cores/pull/1.
`gh run view 37645288915 --json status,conclusion,jobs`: actual first CI FAILED
in npm test after all dependency/browser installation steps passed. This is not
reported as green. Check annotations initially exposed only exit status 1.
The log-download redirect to results-receiver.actions.githubusercontent.com
was denied. That exact hostname was added to the saved environment network
draft, preserving all prior entries; draft persistence is confirmed, application
is not. The verified local npm test result remains local evidence only.

Add explicit failure-tail annotations to the workflow while preserving npm's
underlying exit status. This permits diagnosis through the working GitHub API
without weakening assertions or depending only on an inaccessible log download.
No KEEP GOING rounds execute before actual green CI.

Second CI diagnostic run 37646777685 exposed the failure through its annotation:
all game/league/baseline checks had passed, then the ffmpeg spawn returned null
status while creating the video. Ubuntu runner lacked the system capture encoder.
Explicitly install ffmpeg through signed Ubuntu packages; add an early Node,
Python reference-import and ffmpeg preflight, preserving every game assertion.
Capture assertions now include process-start errors/signals. This is a CI setup
correction, not a change to game behavior or a weakened performance check.

Affected local checks after the encoder correction: `npm run check`,
`node preflight.ts`, `node browser.ts`, `node checksums.ts` and
`node checksums.ts --check` all passed. No game assertions were changed.
The original capture assertion did not expose spawn.error/signal, so the null
status alone cannot prove the exact startup cause; the new diagnostics distinguish
missing executable from encoder crashes. Explicitly installing the required
encoder removes dependence on runner-image defaults.

## KEEP GOING round 1

Published Draw deal option: three-seat hands 5→7 (+40%); four-seat hands 5→6 (+20%); Block and partnership defaults unchanged. Strict type check, 28 unit/property tests (9,003 complete bot/property matches including 2,000 additional traditional-deal matches), 25/25 mutation assertions, reproducible build and browser checks passed. Idle suite: 27,000 cases, maximum 2,007,103ms against 3,600,000ms budget. Browser TV/phone checks remained offline and private; measured phone frame rate approximately 60.00fps, p95 16.7ms. Latest change requires its own CI result; earlier green run belongs to c28d4e4.

## KEEP GOING round 2

Same 2,000 two-seat Draw seeds, alternating seats: strong/medium before stock modeling 1,513 wins / 487 losses (75.65%, 95% 73.77–77.53%); after 1,630 / 370 (81.5%, 95% 79.80–83.20%), +5.85 percentage points. Medium/easy unchanged 1,155 / 845 (57.75%, 95% 55.59–59.91%). These compare each policy to medium, not a direct old-versus-new tournament. Reports preserve counts and turn totals. Independent exhaustive differential check now covers 10,000 Block plus 10,000 Draw endgames with sampled 0–2 stock tiles and reserve choices, seed 53759, all pass. Draw regression checks same-turn drawing, reserve-dependent winner reversal and immutability. Full regression results pending below.

Round 2 affected regressions passed: strict TypeScript, all 29 tests / 9,003 complete matches, 25/25 mutants, offline/privacy/reduced-motion browser checks and reproducible build/checksums. Block search behavior is unchanged; its existing league and upstream baseline are also rerun by required CI.

## KEEP GOING round 3

Exact constrained sampling counts match independent brute-force enumeration in 10,000 cases (3,541 feasible, 6,459 impossible), seed 49374. Rare fixture: one feasible hand among 1,540 partitions, exact sampler returns 1,000/1,000 valid seeded samples versus old 128-attempt rejection 89/1,000. Deterministic replay, conservation, seat counts and evidence constraints pass. Worst-size unconstrained count sanity check: 118,129,586,889,600 partitions for 27 tiles across 7/7/7/6 capacities; exact safe integer, memo construction 4.7ms in this environment (single observation, not a latency guarantee). Actual unconstrained decisions retain the faster shuffle path.

New Draw league: strong/medium 1,608 wins / 392 losses (80.4%, 95% 78.66–82.14); medium/easy unchanged 1,155/845. Versus the preceding stock-aware rejection policy this is -1.1pp with overlapping intervals; no win-rate improvement is claimed. The measured gain is reliable feasible-deal sampling rather than a strength increase. Full regression, Block league and upstream baseline results pending below.

Round 3 remaining checks passed: 29 tests / 9,003 complete matches, 25/25 mutants, strict typing, browser functional/privacy/offline/reduced-motion checks, build and checksums. Block strong/medium 1,332/2,000 (66.6%, 95% 64.53–68.67), medium/easy unchanged 1,619/2,000 (80.95%). Upstream configured baseline: 139/200 wins (69.5%, 95% 63.12–75.88), same bounded scope as before. These rates continue to clear chance; shifts against earlier policies are not claimed as significant improvements.

## KEEP GOING round 4

Three-seat Block experiment: 2,000 independent seeds with rotating policy seats, candidate selfish max-n 766 wins, shipped coalition policy 702, medium 532. Candidate-minus-shipped difference 3.2pp; approximate multinomial 95% interval -0.55 to +6.95pp, includes zero. No demonstrated strength gain, so the candidate is not deployed. The reproducible study leaves production untouched; strategy-study-report.json preserves counts and scope. This is the first consecutive round without an established player-noticeable gain.

Milestone delivery correction: `node browser.ts`, `node checksums.ts`, `node checksums.ts --check`, `npm run check` and `FAST_TEST=1 node --test test.ts` validate distinct archived capture filenames and archived Draw comparison hashes. `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of json media/<capture>.webm` passes for all four captures: VP9, 1920×1080, 3 seconds, each under 265KB and the 10MB limit. Original bytes recovered with `git show <milestone-commit>:jobs/G01-dominoes/media/milestone-1.webm`; production game behavior unchanged. Add explicit archive-hash regression coverage for both comparison JSON files and all four milestone videos.

## KEEP GOING round 5

`BUDGET_STUDY=depth4 node budget-study.ts`: 2,000 complete two-seat Block matches, candidate against shipped sharp, alternating seats. Depth-four candidate wins 907/2,000 (45.35%, 95% 43.17–47.53), loses 1,093. Reject; deeper search is not automatically better under the chosen imperfect-information heuristic. No-gain streak 2. Production remains depth three.

## KEEP GOING round 6 measurement underway

`BUDGET_STUDY=samples32 node budget-study.ts`: candidate wins 1,045/2,000 (52.25%, 95% 50.06–54.44), loses 955. This barely clears chance. Before acceptance, run independent confirmation seeds 2,001–4,000: `BUDGET_STUDY=samples32 BUDGET_SEED_START=2001 node budget-study.ts`. Require its independent lower 95% bound above 50% to establish a reproducible gain. Do not count round 6 as a no-gain round or deploy the candidate until confirmation completes.

Round 6 confirmation: seeds 2,001–4,000 give 1,063 wins / 937 losses (53.15%, 95% 50.96–55.34). Independent lower bound exceeds 50%, meeting the previously recorded acceptance criterion. Deploy 32 samples; no-gain streak resets to zero. Archived studies import study-baseline.ts, the exact pre-change 16-sample source, so production updates do not silently change the historical comparator. New required leagues/regressions pending below.

Round 6 accepted-policy regressions: `npm run check`, `node fixtures.ts`, `node build.ts`, `node browser.ts`, `node --test test.ts` (30 tests / 9,003 complete matches), `node mutations.ts` (25/25 killed), `node differential.ts` (20,000 cases), `node league.ts`, `LEAGUE_MODE=draw node league.ts`, `node baseline.ts`, `node checksums.ts` and `node checksums.ts --check` all pass. Current 32-sample strong/medium Block: 1,373/2,000 (68.65%, 95% 66.62–70.68); Draw: 1,660/2,000 (83.0%, 95% 81.35–84.65). Medium/easy unchanged. Bounded upstream comparison: 138/200 (69.0%, 95% 62.59–75.41), no claimed significant shift from 16-sample 139/200. Phone approximately 59.80fps, p95 16.8ms, p99 16.8ms at 4x throttle; all functional/privacy/offline checks pass. New fifth capture is original, distinct and below the size limit. Archived prior source SHA256 a19d2b4c77f3f1dc5e1cd3c358e740c27c3b67124d835318887df2df0c645d73 exactly matches core.ts in a6fe928.

## KEEP GOING round 7

`node score-policy-check.ts --production`: all 10,000 configured terminal rewards match the reducer, versus 3,934 historical mismatches. `node differential.ts`: 20,000 independent solver cases pass, now varying both selected scoring policies. `npm run check`, `node fixtures.ts`, `node build.ts`, `node browser.ts`, `FAST_TEST=1 node --test test.ts`, full `node --test test.ts` (31 tests / 9,003 complete matches), `node mutations.ts` (25/25), Block/Draw leagues, upstream baseline and complete checksums pass. Strong/medium Block: 1,377/2,000 (68.85%, 95% 66.82–70.88); Draw: 1,665/2,000 (83.25%, 95% 81.61–84.89); upstream: 136/200 (68.0%, 95% 61.53–74.47). These retain clear wins; no significant rate improvement over the prior policy is asserted. Measured semantic gain: terminal scoring mismatches 3,934→0. Phone approximately 59.80fps, p95/p99 16.8ms at 4x; all privacy/offline/reduced-motion checks pass, distinct sixth capture included.

Round 8 isolated probe, `node match-goal-check.ts`: with public scores [0,0,99], target 100 and a unique conditional four-tile endgame, current search chooses 0–1, leading to p2 scoring 4 and ending the match at 103. Candidate uses public standings and chooses 0–2: p1 scores 5, match continues. The fixture conserves all 28 tiles, has a valid 24-tile oriented board, legal future inputs and both outcomes verified through the actual reducer. Candidate remains isolated until round 7 is pushed.

## KEEP GOING round 8

`node match-goal-check.ts --production`: corrected choice matches the isolated candidate; actual reducer outcome changes from a forced done loss (leader 103) to round-end (other opponent 5). `node score-policy-check.ts --production`: 10,000 payout-component alignments remain correct. Expanded `node differential.ts`: 20,000 cases pass; 15,000 include standings, 1,689 partnership targets, with target counts 100:4,954 / 150:5,019 / 250:5,027. Strict types, fixtures/build, browser and checksums pass. Full `node --test test.ts` ran 32 passing tests / 9,003 matches before the added shared-team regression; expanded FAST_TEST ran all 23 non-heavy cases including that extra test, passing. Current total is 33 tests; final CI will run them together. All 25 mutations are killed. Strong/medium Block 1,383/2,000 (69.15%, 95% 67.13–71.17); Draw 1,666/2,000 (83.3%, 95% 81.67–84.93); bounded upstream 135/200 (67.5%, 95% 61.01–73.99). No significant aggregate rate gain is claimed; the gain is the verified match-survival decision. Distinct seventh capture is included.

Round 9 baseline, `IDLE_REPORT=mixed-idle-before-report.json node mixed-idle.ts`: 36,000 mixed inactive-human/active-medium-computer matches, 200ms computer moves and 5s round deadlines, zero human inputs. 25,248 exceed the 3,600,000ms budget; maximum 21,210,103ms. Every simulated match does terminate, but computer inputs repeatedly restore the full inactivity timeout. Standalone wrapper additionally lacks an automatic round-end exit whenever a human seat exists. These are measured/inspected progression issues; correction remains pending.

Publication fallback: native HTTPS pushes returned remote Internal Server Error for the source milestone and claim. `/workspace/.onboarding/publish-commit.py` publishes exactly the committed changed blobs/tree/commit through Git Data API, validates SHA equality and parent head, and updates force:false. Main 55e5ebe and source 8ec9b5e were published exactly; subsequent fetch verified refs. CI run 37656004333 passed for 8ec9b5e. Preserve the trailing commit-message newline for exact Git-object identity.

Cloud setup recheck: `bash /workspace/.onboarding/install.sh` passed through dependency installs, strict contract/RNG checks, job types, ffmpeg/Python preflight, reproducible build and checksum validation before the match-goal update. Setup draft persists; publishing/fresh-task restoration is not claimed. After the runtime attachment restarted, all current working changes and completed reports were still present; old process handles were unavailable, so inspect completed logs and verify checksums rather than reuse those handles.

## Mixed unattended progression (0.2.4)

`node mixed-idle.ts --enforce`: 36,000 cases, zero failures against 3,600,000ms budget; maximum 1,432,103ms (23.87 minutes), zero human inputs and 200ms computer moves. Before: 25,248 failures, maximum 21,210,103ms. `node idle.ts`: 27,000 pass, maximum 2,007,103ms. Browser before stalled at Round 1 round-end; after completes within one simulated hour with private hands hidden. Full tests 35/35 including 9,003 matches; FAST 25/25; mutations 25/25 killed. Types, fixtures, offline bundle, Chromium privacy/reduced-motion and checksums pass. Phone 4x CPU: 59.80fps, p99 16.8ms; TV 60.00fps. New capture media/milestone-8-unattended.webm. Current-head green CI still required.

## Round 10 current-goal max-n

`node strategy-goal-study.ts`: 2,000 complete rotating-seat three-player Block matches; candidate 763, shipped 692, medium 545 wins. Difference 3.55pp, multinomial 95% interval -0.18–7.28pp includes zero. Reject candidate: no established strength gain. Strict types pass; production source remains unchanged. Immutable study-goal-baseline.ts is exact 0.2.4 source.

Round 11 initial probe: `BUDGET_STUDY=samples64 node budget-goal-study.ts`: seeds 1–2000, 1,048 wins /952 losses, 52.4%, 95% 50.21–54.59%, 600,471 moves; 525 seconds. Confirmation pending; no production strength claim yet. CI 37664215151 is green for 9a9151a.

CI run 37666868394 succeeded for 57f2584 (0.2.4); every dependency and npm test step passed. Round 11 isolated candidate: `CORE_PATH=./mutant-goal-samples64-study.ts FAST_TEST=1 node --test test.ts`: 25/25 pass. Fresh-seed strength confirmation remains pending.

`BUDGET_STUDY=samples64 BUDGET_SEED_START=2001 node budget-goal-study.ts`: independent seeds 2001–4000, 1,082 wins /918 losses, 54.1%, 95% 51.92–56.28%; 593,443 moves in 525s. Acceptance criterion met. Production integration starts at 0.2.5; affected validation pending. Previous reports archived as *-goal32-report.json and browser-unattended32-report.json.

0.2.5 affected checks: `npm run check`, `node fixtures.ts`, `node build.ts`, `node browser.ts`, `node --test test.ts` and `node mutations.ts` pass. Tests 35/35 with 9,003 full matches (138.87s); 25/25 mutants killed; phone 4x CPU 59.61fps, p99 16.8ms; ninth original capture. `node baseline.ts`: 132/200 wins, 66%, 95% 59.43–72.57%. Block/Draw leagues still running at this milestone; no final results asserted. Timed liveness reducers/policies are unchanged from green 0.2.4; current-head CI will repeat the complete pipeline.
