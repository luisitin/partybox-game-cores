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

Completed 0.2.5 leagues: `node league.ts`: sharp/normal 1,449/2,000 (72.45%, 95% 70.49–74.41%), normal/easy 1,619/2,000 (80.95%). `LEAGUE_MODE=draw node league.ts`: sharp/normal 1,684/2,000 (84.2%, 95% 82.60–85.80%), normal/easy 1,155/2,000 (57.75%). All full matches complete; both strong lower bounds exceed 50%.

`gh api repos/luisitin/partybox-game-cores/check-runs/112946879876/annotations`: prior run37666474956 reports “The job has exceeded the maximum execution time of 30m0s”; job steps show cancellation during Install capture encoder (18:23:55–18:53:58), before tests. Current source had already passed run37666868394. Bound index refresh180s and install300s; failed refresh falls back to previous complete indexes with warning, install/encoder failures remain fatal. Keep job timeout30. New recipe requires actual CI validation; no underlying APT-host diagnosis inferred.

Round12 `node strategy-samples64-study.ts`: candidate803, shipped691, medium506 wins over2,000 three-seat Block matches; difference 5.60pp, multinomial95% 1.82–9.38pp. Positive initial signal; fresh-seed confirmation required before production change.

Round12 confirmation: `STRATEGY_SEED_START=2001 node strategy-samples64-study.ts`: 2,000 fresh matches, candidate750, shipped719, medium531; difference1.55pp, multinomial95% -2.21–5.31pp crosses zero. Reject initial5.6pp signal: no replicated strength gain. Production stays0.2.5 /64 coalition.

Round13: `BUDGET_STUDY=paired node budget-samples64-study.ts`: 2,000 full Block matches, candidate1,002 wins /998 losses,50.1%,95%47.91–52.29%,594,030 turns in692s. Reject: no established gain. `CORE_PATH=./mutant-samples64-paired-study.ts FAST_TEST=1 node --test test.ts`:25/25 pass; `npm run check` passes. Production unchanged. CI37669823683 succeeded for64-sample source ee5694f, including full npm test. Later documentation/installer heads still require actual CI.

## Public opener and inactive observation (0.2.6)

`node opener-probe.ts --production`: same10,000 first-round non-partner Block deals, one sampled world each; before2,315 violations, afterZERO (2 seats3,333 cases;3 seats3,334;4 seats3,333). True dealt hands independently satisfy the public rule; deduction uses only public played tile ordering. `node conditional-check.ts`:10,000 independent brute counts including suit and tile exclusions, zero mismatches,2,005 feasible /7,995 impossible; rare-case1,000/1,000 validity retained. Old suit-only report archived separately; changed feasible totals describe different generated cases.

`npm run check`, `node fixtures.ts`, `node build.ts`, `node match-goal-check.ts --production` pass. `node --test test.ts`:39/39 pass, including9,003 matches (126.16s). `FAST_TEST=1 node --test test.ts`:29/29 pass, covering new opener limits,15 multi-move prior-policy/RNG comparisons and inactive forced-tile privacy. `node mutations.ts`:25/25 killed after the final guard. `node browser.ts`: privacy, unattended progression, offline, reduced-motion and frame-time pass; phone4x CPU59.60fps, p9916.8ms. Tenth capture is distinct; previous nine preserved. `ffprobe -v error -select_streams v:0 -show_entries stream=width,height,codec_name -show_entries format=size,duration -of json media/milestone-10-opener.webm`:VP9,1920x1080,3s; under260KB when measured, well below10MB.

`node league.ts`: current Block sharp/normal1,438/2,000=71.9% (95%69.93–73.87%); normal/easy1,619/2,000=80.95%. Prior64 Block1,449 wins archived, no strength-increase claim. Draw policy/RNG and four-player partners are unchanged; prior actual Draw1,684/2,000 and bounded upstream132/200 remain labelled reused measurements and will be rerun by full CI. `node checksums.ts && node checksums.ts --check` passes. CI37670713628 and37671365271 succeeded, validating bounded encoder installer plus complete0.2.5 pipeline. New0.2.6 head requires its own actual CI.

Round15:0.2.7 Draw public-opener probe10,000:2,315 impossible sampled hands before,0 after;40/40 tests,25/25 mutants, browser59.605fps/p9916.8ms, Draw strong1,684/2,000 and medium1,155/2,000. Block parity rerun pending. Previous843cab0 GitHub run37676347377 SUCCESS.

CI diagnosis:run37673184073 cancelled during `npx playwright install --with-deps chromium` (19:21:50–19:46:27 UTC), verification step skipped. This is installation evidence, not a measured game regression. Later843cab0 run37676347377 passed the entire workflow. Currentecbbb34 run37681469962 pending.

Round15 Block parity complete:strong1,438/2,000 (71.9%),medium1,619/2,000 (80.95%); all win/loss/step totals identical to0.2.6. Draw totals likewise identical. No league-strength gain claimed.

Current-head CI confirmed: `gh run list --workflow G01.yml --json databaseId,headSha,status,conclusion` and `gh api repos/luisitin/partybox-game-cores/actions/runs/37681790311/jobs` show SUCCESS for bedf43ae6bcf968e5fc844dc804686d0b43c4279, including full npm test. Previous ecbbb34 run37681469962 failed in encoder installation with exit124 (`gh api .../check-runs/112998327209/annotations`), before verification; no game failure inferred. Block parity and Draw leagues are complete.

Round16 `IMPROVEMENT_STUDY=depth4 node improvement-study.ts` underway; no result or no-gain round claimed until all2,000 matches finish.

Round16 throughput: partial sequential study terminated before completion; no result counted. `IMPROVEMENT_STUDY=depth4 node parallel-improvement.ts` repeats the same complete2,000-seed comparison in four disjoint500-seed shards. Aggregation validates coverage and exact production source before publishing a result.

Round16 `IMPROVEMENT_STUDY=depth4 node parallel-improvement.ts`:2,000 complete Block matches,926 wins/1,074 losses/0 ties(46.3%,95%44.11–48.49%),592,277 turns. All four shards pass10 focused privacy/determinism/search-rule regressions. Source SHA and contiguous1–2,000 coverage validated; report is improvement-depth4-report.json. Reject; production unchanged; no-gain streak1. `npm run check` and `FAST_TEST=1 node --test test.ts`:30/30 pass.

Direct disk-navigation recheck: launch Playwright Chromium at /usr/bin/chromium, `await page.goto('file://'+resolve('play.html'),{timeout:15000})`. Result `net::ERR_BLOCKED_BY_ADMINISTRATOR`; source bytes still verified offline via setContent. This adds no direct-navigation claim.

Round17 `IMPROVEMENT_STUDY=draw-depth node parallel-improvement.ts` underway; do not count until all2,000 Draw matches finish.

Round17 initial `IMPROVEMENT_STUDY=draw-depth node parallel-improvement.ts`:1,050/2,000 wins(52.5%,95%50.31–54.69%),0 ties,556,571 turns. Every shard passes10 focused regressions and exact0.2.7/seed coverage checks. Initial positive signal only; production unchanged and no-gain streak remains1 pending independent confirmation. `IMPROVEMENT_STUDY=draw-depth IMPROVEMENT_SEED_START=2001 node parallel-improvement.ts` underway on fresh seeds2001–4000.

Round17 confirmation `IMPROVEMENT_STUDY=draw-depth IMPROVEMENT_SEED_START=2001 node parallel-improvement.ts`:1,041/2,000 wins(52.05%,95%49.86–54.24%),0 ties,559,548 turns. Every shard passes10 focused regressions. Reject because the predeclared independent lower bound crosses50%; do not pool the initial signal to override this condition. No established gain; no-gain streak2. Production remains0.2.7.

Round18 `IMPROVEMENT_STUDY=leaf-count node parallel-improvement.ts` underway. Candidate adds relative tile count to the shallow evaluator; no result counted until2,000 matches complete.

Round18 `IMPROVEMENT_STUDY=leaf-count node parallel-improvement.ts`:2,000 complete Block matches,1,017 wins/983 losses/0 ties(50.85%,95%48.66–53.04%),594,954 turns. All four shards pass10 focused regressions; source SHA and contiguous1–2,000 coverage validate. Reject; no-gain streak3 after rounds16–18. KEEP GOING stop criterion satisfied.

Final delivery checks: `git diff --exit-code bedf43a -- core.ts ui.ts shell.html play.html test.ts reference.ts package.json` confirms all game, UI, tests and full-pipeline entry points remain byte-identical to the40-test/full-CI green0.2.7 source. Only isolated measurement tooling/reports and documentation were added in these rounds. `npm run check`, `FAST_TEST=1 node --test test.ts`, `node build.ts --check`, `node checksums.ts` and `node checksums.ts --check` pass. Final-head CI must still run its full npm test; do not infer that result from the earlier green commit.

Direct-file probe can be reproduced with:
```sh
node --input-type=module - <<'JS'
import {chromium} from 'playwright';
import {resolve} from 'node:path';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage();
 await page.goto('file://'+resolve('play.html'),{timeout:15000});
 await page.click('#start');
 console.log(await page.locator('#status').innerText());
} finally {await browser.close();}
JS
```
The managed policy rejects the navigation with ERR_BLOCKED_BY_ADMINISTRATOR. No policy bypass was attempted; the existing exact-byte setContent tests exercise the standalone game, with zero network requests.

Stale-claim delivery recheck19,2026-10-08:
- Fresh main claims and all remote refs confirm G01 is the lowest eligible
  stale job;claim02:21:33UTC/branch01:57:07UTC both older than6h.
- GitHub REST:PR1 current head949c2e3de79c4665ea18145fe62bf5b908a77472
  matches SUCCESS run37715456734. Initial three-round stop remains met.
- `git diff --exit-code origin/job/G01-dominoes HEAD -- jobs/G01-dominoes
  .github/workflows/G01.yml contract`:EXIT0 after the local source merge;
  the working branch starts with the exact delivered implementation.
- `npm run check; node build.ts; node build.ts --check; node checksums.ts
  --check`:PASS after the notice/hash edits,HTML478,126bytes,63 hashed paths.
  Build asserts full installed/committed/embedded notice equality and parses
  the script. Full production recheck and current-head CI are pending.

R19 full `G01_CAPTURE_PATH=media/milestone-12-license.webm npm test`:EXIT0,40 tests/127643.79ms,25 kills,all production probes and leagues(71.9%/84.2% strong),132/200 upstream;64 hashes. Additional nine malformed-envelope probes found7 TypeErrors. R20 `npm run check; FAST_TEST=1 node --test test.ts; node fixtures.ts; node build.ts; node mutations.ts`:PASS30/30(547.94ms),25/25 kills,all9 probes now throw0. Full new-code recheck and three no-gain reviews remain required.

R20 exact-head hosted CI:run37755885752,headc19e580047dbc5f8ffd824871bff5128dc6466d0,verify SUCCESS2026-10-08T09:35:55Z. Every setup and full npm test step succeeded.
R21 `npm run check && node total-compatibility.ts --write`:PASS,1,003 complete seeded games,378,899 JSON transitions(player2,006/vip14,177/timer22,533/input340,183),0 state or result mismatches against exact949c2e3 frozen core. BaselineSHA256e9e882f2095d45671a282e8c90ef5da5b1b1d26a6cf33259245c73b637a7e3be. Catches legitimate-event behavior changes and input-state mutation;production rules/settings/state format stay unchanged.

R22 `npm run check && node total-envelopes.ts --write`:PASS,234,936 plain-JSON invalid event probes over3,012 states(3,010 play,1 round-end,1 done;1,003 play states paused),1,003 distinct seeds incl1,2,3;0 exceptions/mutations/identity failures. Deep-freeze plus JSON comparison catches event rejection that changes state;invalid actors,payloads,clocks,presence fields,VIP actions and stale timers are included.

R23 `G01_CAPTURE_PATH=media/milestone-13-total-events.webm node browser.ts`:PASS. TV1920×1080/1×CPU300frames:mean16.6656667ms,p9516.7ms,p9916.8ms,60.0036002fps. Phone390×844/4×CPU300frames:mean16.777ms,p9516.8ms,p9916.8ms,59.6054122fps.0 runtime requests/errors;functional/private-hand/full-bot/mixed-idle/reduced-motion assertions pass. `ffprobe -v error -show_entries format=duration,size -show_entries stream=codec_name,width,height -of json media/milestone-13-total-events.webm` and `ffmpeg -v error -i media/milestone-13-total-events.webm -f null -`:PASS,VP9/1920×1080/3seconds,under10MB. Managed exact-byte setContent and phone emulation limitations remain disclosed.

Final combined local gate2026-10-08:
- `bash /workspace/.onboarding/install.sh > /tmp/G01-total-install.log 2>&1 && G01_CAPTURE_PATH=media/milestone-13-total-events.webm npm test > /tmp/G01-total-npm-test.log 2>&1`:EXIT0. Installer verifies tools/contract/build/hash;full test verifies committed hashes first,strict compile,1,003-game frozen compatibility,234,936 invalid envelopes,40 tests/9,003 games(133855.890748ms),idle/mixed-idle,20,000 independent solver cases,10,000 conditional partitions,both10,000 opener probes,score/match-goal probes,25/25 genuine mutation kills,standalone build,all leagues,upstream and browser.
- Complete2,000-match outcomes unchanged:Block strong1438/2000(71.9%),medium1619/2000(80.95%);Draw strong1684/2000(84.2%),medium1155/2000(57.75%). Upstream132/200(66%). Mixed idle36,000 cases/0 failures/max1432103ms.
- Final browser report: `[{"name":"tv","viewport":{"width":1920,"height":1080},"throttle":1,"frames":300,"meanMs":16.66566666666667,"p95Ms":16.700000000000273,"p99Ms":16.800000000000182,"fps":60.00360021601295},{"name":"phone","viewport":{"width":390,"height":844},"throttle":4,"frames":300,"meanMs":16.832333333333334,"p95Ms":16.700000000000273,"p99Ms":16.800000000000182,"fps":59.409469869497194}]`;functional/privacy/full bot/mixed-idle/offline/reduced-motion pass,0 requests/errors. This is phone emulation with exact-byte setContent fallback,not physical-phone/disk-navigation evidence.
- Final capture `ffprobe ... media/milestone-13-total-events.webm` and `ffmpeg -v error -i media/milestone-13-total-events.webm -f null -`:PASS,VP9/1920×1080/3seconds/270302bytes. `node checksums.ts --check`:PASS,67 data/media/HTML/notice paths.
- Final source and review work is complete. Delivery gate uses SUCCESS for PR1's actual current head;current-head status is recorded on the PR after completion. R21–23's three consecutive no-player-gain rounds satisfy KEEP GOING.


## Current0.2.8 source recovery and proof-delivery repair

Actual main/all17matching-ref strict six-hour audit selected G01 alone.
Main claim98529de changed only G01 at22:58:53UTC; actual push closed
22:58:54.731017UTC EXIT0. Local merge d3015b8 from that main+canonical327
closed22:59:28.317558UTC, preserving job/workflow/contract bytes.
Native PR1 conversion to DRAFT succeeded23:18:04UTC; body corrected.

Canonical327 full run37812880528 succeeded,42 tests/all25 real mutants,
full leagues/upstream/native gates. Fresh native artifact read23:23:18UTC
confirms total_count0. This is actual full CI, without current raw/artifact
acceptance. Old restored57efe0b report is historical; LOOP24's55.73/51.58
local failures and lowered-threshold milestone14 remain preserved.

Commands in the fresh isolated worktree:
- `npm ci --ignore-scripts --no-audit --no-fund`: EXIT0.
- Initial strict compile/build failed: contract had no installed Zod. Logs
  and actual tool errors retained privately; no passing result inferred.
- `npm install --prefix ../../contract --ignore-scripts --no-package-lock
  --no-audit --no-fund`: EXIT0, existing original workflow dependency step.
- `npm run check && node build.ts --check && node checksums.ts --check &&
  python -m py_compile ci-evidence.py`: EXIT0. Exact standalone549936bytes.
- Final `npm run check` after explicit encoder/artifact-copy repair:
  naturally CLOSED23:22:54UTC EXIT0. No browser/player elapsed run occurred.

The retained native sampler is300 unfiltered deltas,301 actual rAF stamps,
zero warmup, originalsharp/normal bot settings, fresh native contexts and
58fps/p95<=18ms on BOTH profiles. Receipts persist before gate assertion,
so failures are retained. Source/Node/Chromium identities are checked
before/after. Functional bot/mixed-idle clocks remain simulated and are
explicitly separate from native performance proof. Actual36 screenshots
are hashed; actual encoder binary/version/args/status are bound; clip copy
is included in artifact regardless of custom output path; ffprobe and full
FFmpeg SHA256 framehash EOF decode verify36VP9 frames,1920x1080,12encoded
fps,3seconds,<10MB. Encodedfps is not the browser refresh measurement.

`ci-evidence.py start` saves actual Git-bound tracked before bytes. The
complete original `npm test` remains unchanged. Finish saves full log,
exit/current generated bytes and immutable source/Node checks. Workflow
uses actions/upload-artifact@v4 with always() to retain failures as well
as successes. Current-head full CI/artifact acceptance remains PENDING.
Static independent review found no current-path blocker and confirmed
original sampling/gates; its encoder/custom-output caveats were repaired.

No new player-visible gain or completed KEEP round is claimed. Current
source's renewed review is open; old0.2.7R21–23 cannot certify changedUI/core.
A short zero-work HOLD for B19's single native check began23:22:54UTC;
direct release reported natural closure23:24:33.285692UTC. No elapsed
process was paused or rerun for luck.

## Accepted current8c proof and public audit checkpoint

Full original hosted run37859386989/job113591225852 completed SUCCESS
23:46:25UTC; all workflow steps succeeded. Genuine artifact11586162947
was downloaded naturally/exit0 and independently accepted23:51:23UTC.
The exact10,067,417B archive is preserved with official SHA256 in
media/accepted-checkpoint-8c57376-proof.zip; artifact-acceptance-8c57376.json
records actual1,044 checks.138 declared source bytes match8c Git,119 immutable
inputs and runtime identities remain unchanged, full npm exited0,25 genuine
mutants pass. All600 original native intervals/602 timestamps are retained;
TV58.6349777187fps/p9516.8 and phone4x59.8038433937fps/p9516.7 pass original
58fps/p95<=18 gates. No warmup/filtering. Independent full FFmpeg decode
reproduced all36 currentVP9 frame rows. Capture268,630B/1920x1080/3s/12 encoded
fps; encoded fps is not native browser refresh. See ARTIFACT-AUDIT.md.

The first auxiliary reader's Wrong source parent failure is preserved.
Shallow git show metadata omitted real parents; corrected reader validates
actual raw merge commit46f8ead5 and all expected source bytes. Future CI
records parents from raw headers. Neither failed-reader output nor historical
local55.73/51.58fps failures is represented as a passing run.

This later checkpoint adds a public independent reader/archive/receipt and
metadata repair. Its own full CI is UNRUN; accepted proof is explicitly for
8c. Player/core/UI/page are unchanged, renewed KEEP rounds/gains remain0.
Conservative23:55:44 wall-clock checkpoint was exceeded during coordinator
HOLD23:51:23–23:57:29.128565; no owned local process was paused or active.

## Pending Strong-worker candidate checks

- First `node --test strong-bot-checks.ts && npm run check && node build.ts
  --check && git diff --check`: FAIL before assertions with
  ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX (constructor parameter property under
  Node24 strip-only mode). Esbuild compile had passed. Explicit class fields
  repair this without flags or environment detection; original failure/source
  remain in .work/queue-audit-20261008/worker-controls-preparation.json.
- `node --test strong-bot-checks.ts && npm run check && node build.ts &&
  node build.ts --check && git diff --check`: PASS/naturalexit0. Six controlled
  transport tests check own/public-only request, exact legal action, stale
  reply/cancel/rematch, unsupported/error/messageerror/illegal replies and
  simulated exact10s watchdog. Controlled ports/timers are not native proof.
- Independent actual esbuild CLI/API same bundle: PASS,459,592B identical
  worker output/SHA1cd6cc9d176f48b3c357759b7243e4c117cfccadc20b65a5fa38298372100fb0;
  actual CLI binary SHA bab29b2ca7a9e89b67cf720b77b2d743f9f31f5cf0d5bd74ee8c8de30ced7014.
- `npm run check && node checksums.ts && node checksums.ts --check && node
  build.ts --check && git diff --check`: PASS/naturalexit0; current standalone
 1,032,578B/SHA02776e5ef10941a7ae1cde783095f84fa47316bc114810a5caf4f4e3b31f15d0.
- Static exact-source review CLOSED00:05:52.878739: no observed policy/privacy/
  lifecycle counterexample. Actual runtime remains required. Later finite
  static review found prelaunch controller cleanup/PASS-label gaps; repaired
  lifecycle/receipt handling and refreshed READY before any native trial.
- `python -m py_compile ../../.work/queue-audit-20261008/worker-native-first-controller.py
  && npm run check && node build.ts --check && node checksums.ts --check &&
  git diff --check`: PASS/naturalexit0 observed00:22:40UTC.

Real Worker/offline startup,16 output/RNG replays, actual CSP/runtime/watchdog
fallback, pending end/rematch, original300-native-frame gates, current capture,
full candidate npm/CI and measurable player gain are UNRUN/UNMEASURED.
Native first-trial controller has never launched. Canonical8c accepted proof
remains distinct; this incomplete candidate checkpoint does not inherit it.


## First actual Worker proof, 2026-10-09 UTC

The preceding UNRUN notes describe preparation before this actual first run.
Root executed `python .work/queue-audit-20261008/worker-native-first-controller.py`
from the repository root after a fresh all-owner zero-process grant. Its exact
child was Node24.19 `worker-browser-check.ts` with actual Chromium ELF151.
START00:36:12.578852; child naturally CLOSED00:36:45.330516; whole controller
CLOSED00:36:46.056604, exit0. No owned live process remains. All28 source/five
binary identities, controller and READY match before/after. Raw receipts and
exact preparation failures are archived; WORKER-AUDIT.md gives hashes/commands.

All16 nontrivial own/public-only observations reproduce exact original Input
and RNG state (2/3/4 Draw/Block, including four-seat partners). Real UI Blob
is exact compiled code, initial seed23 tile22/RNGstep2112. Actual CSP denial,
runtime error and unresponsive ten-second watchdog retain same fallback move;
pending end terminates delayed work, no old reply, rematch seed24/new ID works.
Requests/errors=[]; actual browser closure00:36:43.608. Diagnostic fault/delay
fixtures are explicit, not production environment branches or FPS acceptance.
Actual messageerror decoding was not induced; controlled-port handling is
covered by the six Node tests. No native frame or player-gain result yet.

`disk-browser-check.ts` is added before the existing Worker/browser commands
in every npm test. It requires actual file:// navigation, human hand concealment,
real inline Blob worker output/RNG and zero requests/errors; no setContent
fallback or weakened assertion. Hosted full CI must genuinely pass it.
This new disk command is UNRUN here; original browser.ts bytes/gates unchanged.


`npm run check --prefix jobs/G01-dominoes`: PASS, strict-compiles the new
actual disk-navigation validator. From this job folder, `node checksums.ts
&& node checksums.ts --check && node build.ts --check`, exact Git comparison
of original core/sampler and accepted Worker/UI/page to source2ae, all ZIP
entry digests/raw-copy equality/CRC, README<60 and `git diff --check`: PASS.
These check preparation and archived bytes, not unrun disk/FPS acceptance.


## Actual managed disk navigation failure

Root authorized one genuine functional run, without FPS/speed acceptance.
`python .work/queue-audit-20261008/disk-native-first-controller.py` from the
repository root launched actual Node24/Chromium151 `disk-browser-check.ts`.
START00:44:21.072548; page.goto(file://) FAILED with literal
net::ERR_BLOCKED_BY_ADMINISTRATOR before the HTML loaded. No setContent
substitution, actual disk UI success or Worker success is inferred.
Browser CLOSED00:44:24.151, child naturally CLOSED00:44:25.488498, whole
controller naturally CLOSED00:44:26.616533/exit1. All29 source/five binaries,
READY and controller remained unchanged; owned live children, errors and
HTTP requests are empty. DISK-AUDIT.md and raw receipts/archive preserve it.
The mandatory disk command remains in every npm test. Hosted full CI must
actually pass it; this environment failure is never changed to a passing test.

## Worker candidate: exact hosted acceptance and separate local failure

Original validation PR11 targets `job/G01-dominoes`; original delivery PR1
remains unchanged, draft and unmerged at8c57376. The Worker candidate is
not adopted. Renewed KEEP rounds and measured player gains remain0.

Exacte4d5882 hosted run37866605295/job113614696299 succeeded01:11:23UTC.
Official artifact11589840091 is30,520,437B, SHA256
`1ce6dd56e54ed3e4c60ea763ecc9504744bb31a5425dcfb684d633ada2bc32f8`.
Independent full reader naturally closed01:15:09.936976UTC/exit0 with1,204
assertions: every before/after source entry equals immutablee4 Git, all25
mutants, the complete npm log inside actual native hosted output, all600
native intervals/602 timestamps and all36 current VP9 frames decoded.
Actual hosted file:// navigation proves hidden human handover and inline
Blob Worker output/RNG with zero requests/errors. All16 nontrivial real
Worker replays and all5 actual/controlled variants passed. TV60.0024fps/
p9516.7ms; phone4x59.80344fps/p9516.8ms meet unchanged original gates.
Full official bytes, portable reader and raw proof are delivered separately.

The first once-only local original browser.ts trial on the same player bytes
naturally closed01:14:16.581822UTC/exit1. TV57.8815357901fps/p9516.8ms/
p9933.3ms fails the original58fps gate. All300 unfiltered intervals and301
native timestamps remain. Phone and capture15 were NOT RUN. Browser/child
closure, all159 source/binary guards and controller/READY checks are genuine;
no owned child remains. Cause is UNKNOWN. The hosted success and this local
failure have distinct scopes; neither result is edited or replaced by a
same-source luck rerun. No extra warmup, filtered frame, changed gate or
fake clock is introduced. Raw failure, local mutable images and log are
archived before historical tracked outputs were restored byte-exactly.

`worker-hosted-e4d5882.json` records hosted acceptance. The official ZIP is
`media/accepted-worker-checkpoint-e4d5882-proof.zip`. Extract the native log
from `media/worker-native-first-e4d5882-proof.zip` and run:
`python verify-worker-artifact.py media/accepted-worker-checkpoint-e4d5882-proof.zip --sha256 1ce6dd56e54ed3e4c60ea763ecc9504744bb31a5425dcfb684d633ada2bc32f8 --source e4d5882f9f5de2bb32dc5a520701b99d1ac52aac --run 37866605295 --native-log /path/to/hosted/native-full.log`

Current documentation checkpoint keeps exact core/UI/Worker/player and the
original sampler unchanged. Fresh current full workflow remains required
before delivery. A predeclared paired native responsiveness comparison is
prepared privately, UNEXECUTED; its longest-gap metric includes every raw
interval through the first legal seed23 strong-bot move. No gain is inferred
from these checks. Diagnose the weakest substantive issue, retain failures,
measure any change and perform renewed KEEP after complete validation.

## Current2d hosted proof and invalid first pair

Exact2d full run37869016355/job113622494282 succeeded01:39:42UTC. Official
artifact11590012046/93,181,134B/SHA948cb9cd242cfa92cee74540a24b79b690978eedb1158b582b7fb2dfcf3ad4e2
was independently accepted1,225 assertions; reader naturally CLOSED
01:41:22.849247UTC/exit0. All current Git/source bytes, full npm/native
output,25mutants,600 intervals/602timestamps,36full VP9 frames, actualfile://
privacy and16realWorker replays/fivevariants pass. The large ZIP stays
private; bounded current fullraw outputs/native/decoder and receipts are
in media/worker-stage-2d30473-proof.zip. No nested large ZIP is added.

First fixed pair FAILED naturally01:35:43.504692UTC/exit1 before a valid
first baseline profile. All170 guards/READY/controller stayed unchanged and
no child remains. The helper asserted positive finite intervals BEFORE
saving the raw trace, so offending raw values are ABSENT. Neither zero,
NaN nor cause can be inferred; acceptedscenarios0/playergain UNMEASURED.
Every failed byte is retained. A DISTINCT logging-only diagnostic now saves
all provisional trace/stamps/intervals and invalid-number kinds before any
assertion, plus a partial-failure trace. Predicates/order/criteria/clocks are
unchanged. It is UNEXECUTED/NOT READY and clears no original failure.

The private face-down deal prototype removes only a permanently hidden
blank front face, retaining exact visibleback SVG/CSS/transform/geometry and
45ms/420ms cue timing. All otherUI/core/RNG/Worker/source bytes are unchanged.
Strict virtual and actual clone builds pass, with byte-exact baseline and
worker control. Independent static audit naturally CLOSED01:44:24.106993
UTC/exit0/all177 source+fivebinary guards; it is UNEXECUTED/unadopted, with
no runtime/FPS/gain claim. The original once-only localTV57.8815357901FAIL
remains; phone/capture15 NOTRUN. Renewed KEEP rounds/gains0.

Next: obtain a fresh exclusive rootgrant for the frozen materially changed
prototype's ORIGINAL browser.ts300/301/noextra settling/original58fps and
p95<=18 gates/newcapture. Preserve every actualPASS/FAIL before any adoption.
The logging-only diagnostic needs a separate source-bound review and grant.
Current documentation checkpoint changes no player/policy/sampler; fresh
full currentCI remains required. Read actual push/CLAIMS timestamps.


## Actual modified face-down source checkpoint (2026-10-09 01:58 UTC)

The modified deal-only face-down candidate's first original native trial
naturally CLOSED01:52:39.701547UTC, exit0/PASS, all177 source/five executable
identities and READY/controller unchanged, owned children empty. All600 native
intervals/602 stamps pass the original58 FPS/p95<=18 gates: TV58.06751316197,
phone4x58.44344077575 FPS, both p9516.8/p9933.4ms. Full original functional/
privacy/offline/reduced-motion, zeroHTTP/errors and all36VP9 frames pass.
FACE-DOWN-AUDIT.md gives scope, exact source identities and public raw/archive.
This is a genuinely modified source's once-only finite pass, not a60FPS,
distribution, historical-cause, measured-gain or full-current-CI claim.

Only the exact two reviewed UI changes and their reproducible standalone player
are now adopted to the audit DRAFT branch; core/RNG/Worker/sampler unchanged.
The full original current npm workflow and genuine complete current artifact
must pass before delivery. Exact previous2d success and all historical failures
remain source-specific. Original PR1 stays unchanged/draft on8c. First pair
still FAILED with offending raw ABSENT, acceptedscenarios0. Repaired logging-only
diagnostic is UNEXECUTED; no native launch without fresh review/quiet grant.
Renewed KEEP rounds and measured gains remain0.

Finite actual draft-adoption checks: `npm run check` and `node build.ts --check` both naturally closed exit0 at 2026-10-09T02:00:33.569821+00:00. Exact UI/player unchanged; owned groups empty. These catch strict TypeScript and any stale/non-reproducible standalone build, without a new native trial. face-down-checks.json records actual commands/times.


## Exact838 full hosted acceptance — actual PASS

Exact8384404ff8e04c9da5405d6654007a06cf5141ba workflow37872579179 /
job113633825656 succeeded2026-10-09T02:24:25UTC. The genuine official
artifact11591617572 is98,673,066 bytes, SHAb467433ce2969457c4a58bd5d79b13bf9079554c1a0a1f2f8d02566d0c020df8.
Independent original full reader naturally CLOSED02:25:55.955693UTC, exit0,
1,252 assertions: every immutable Git/source byte, complete actual native npm
output,25mutants, actual file:// privacy/inlineWorker,16 nontrivial real Worker
replays/fivevariants,600 raw intervals/602 stamps and all36 VP9 frames decoded.
Current hosted TV59.21247409454 FPS/p9516.7ms and phone4x59.80384339367 FPS /
p9516.8ms pass the unchanged original gates. Full native127,953-byte output
SHA56d45d892197ce5d5d3357be4fded4e75bd6cbfa7a17dc0f5ee432e8e74c7cad.

media/worker-stage-8384404-proof.zip (1,473,534 bytes,
SHAabef6e6208f47a830bd4101a968c0e2aa18dec1f1cf257d8721209a1cbcd6aa4)
retains EVERY top-level official raw output, every actual mutable after-output,
full native log/acceptance and prepared diagnostic/cleanup provenance. All42
entries byte-verified. Immutable before/after data already proved byte-equal
retained exact838 Git; no recursively nested largeZIP. All unique original2d /
current838 whole official ZIP/raw remains retained privately in the original
workspace. The current capture is also media/milestone-16-hosted-worker-face-down.webm:
309,239 bytes, SHA3f362b41f4bf1096818f4590097b65c4bb12485827ac2f75b68b2d63bcfde4e6.

The distinct isolated logging diagnostic is first UNEXECUTED: exact private
2d versus original8c, all185 source/five executable guards, READYd34799 /
controllerb9597d / harness9dc1be. It saves complete/partial raw trace and numeric
kinds before assertions without changing predicates/order/clocks/gain criteria.
New current source bridge, independent review and fresh root quiet grant are
required before any launch. Original fixed pair FAILED with offending raw
ABSENT; no zero/NaN/cause inferred. No measured gain or renewed KEEP round.

Shared original workspace ENOSPC left0 available bytes for uid1000, with
root-reserved free blocks. The02:31:23.597412UTC source deadline was missed;
no timestamps backdated. This material checkpoint uses independent writable
/tmp tmpfs and a once-only in-memory read of the already accepted official ZIP,
without another download/full extraction. Only authorized exact recoverable
e4 duplicates were removed after full immutable Git/public equality, immediate
same-stat/nlink1/FDzero; all new185 resolved guards and unique proofs preserved.
Completed face-clone replay first requires restoring its deleted exact e4 blob
from public838 Git; the exact recipe is archived. Original canonical PR1 stays
unchanged/draft on8c; this is an audit evidence checkpoint. Full new headCI
remains pending; source838 green certifies exact838. Renewed KEEP rounds/gains0.


## Latest retained responsiveness diagnostic — not accepted

The distinct original8c-versus-Worker2d logging diagnostic ran once with the
fresh actual root grant after independent complete-input static review. Child
started03:12:53.989796UTC, naturally closed03:13:07.843250UTC/exit0; controller
closed03:13:10.239188UTC/exit1/FAIL/no owned process. All1,818 source/five runtime
and complete installed-package/alias/symlink/stat guards passed. All four full
native raw profiles are retained before assertions; raw-retention acceptance
PASS. The controller's native acceptance failed with a silent AssertionError.
Preserve that exact failure; inspect saved predicates offline before making
any interpretation. No retry or retrospective weakening of any predicate.

The declared gain gate separately FAILED both viewports. TV longest gap
100→66.6ms gives33.4ms/33.4% reduction, below the required50ms; phone baseline
33.4→candidate50ms is worse16.6ms/49.7%. First-move latency regressed0.9577%/
3.1397%. Trusted-start→first native callback latency is reported separately in
paired-diagnostic-retained-first.json; it is outside longest consecutive gap.
This old2d/original8c diagnostic does not certify the current face-down838
player, original300 FPS gates, full pipeline or a player-visible improvement.
Renewed KEEP remains0. The original earlier failed pair's offending raw is
still ABSENT; this distinct retained trace cannot explain that past failure.

media/paired-diagnostic-retained-first-proof.zip preserves complete actual raw,
unmodified controller receipt, grant, all installed-input maps, independent
review and the root prelaunch helper failure. That helper failed before any
native launch because of a wrong absence assertion; correction preceded the
one actual grant/trial. No claim of a second native attempt.

Exactd01 full workflow37875754087/job113643842516 SUCCEEDED02:55:26UTC.
Official11592298166/102,143,626B/cac53273… independent complete-artifact
acceptance remains PENDING. Exact838 prior1,252-check proof stays accepted.
The current evidence checkpoint's own new-headCI remains required.

Cadence03:11:16.486356UTC was exceeded during the local-writer HOLD from
02:59:55.407220 through root release after actual trial closure. Last source
push was02:41:16.486356UTC. Read the new actual push receipt for the next
30-minute deadline; no backdated timestamps or metadata-as-push substitutes.

Actual root-controlled command: `python /tmp/g01-current-838-proof-20261009/private/root-gated-complete-inputs-pair-first-controller.py`, which launches unchanged `node paired-worker-response-diagnostic-isolated.ts` in exact2d clone. Controller EXIT1/FAIL, child EXIT0, all1,823 identity guards and raw retention PASS; four complete profiles, native acceptance AssertionError and declared gain FAIL. Archiving helper verified every member byte and complete CRC without modifying the actual failed receipt/proof.
The first publication helper failed its final whitespace check on extra EOF blank lines in two documents. Those blank lines were removed; no browser or native trial reran.

## Exact d01 whole hosted artifact independently accepted

Exactd01 run37875754087/job113643842516 succeeded02:55:26UTC. Genuine official
11592298166/102,143,626B/cac5327331cfdee3569051dd271179ba3e37628881eb880aa96c51631600019b
passed the unchanged independent reader1,261 assertions. Outer natural CLOSED
03:26:58.193318UTC/exit0/no owned processes; reader03:26:57.689638UTC. Every
immutable source/Git byte, entire native npm log,25 mutants, actual file://
handover/inlineWorker,16 nontrivial realWorker/five variants,600 native intervals/
602 stamps and36 independently decoded VP9 frames pass. Hosted TV60.0024000960
FPS/p9516.7ms, phone4x59.8034380598FPS/p9516.7ms; original gates unchanged.
Native log128,121B/SHA10dbcd40cc8fb7eecf5dfa1f8ee39fcb9db26d55a5c22f90fcfbfc3346cc4d2f.
Public worker-hosted-d01e51a.json and media/worker-stage-d01e51a-proof.zip retain
every actual top-level raw/mutable after-output, native log/reader/controller,
failures and the complete source-bound clip17. All archive members byte/CRC
verified. Whole102MB was bounded in RAM; no physical full ZIP/extraction.

First RAM transport actually failed HTTP40303:23:44 before artifact bytes;
closed group[] and FAIL receipts are preserved. Its outer final-print NoneType
error occurred after writing the FAIL receipt/reaping its child. A distinct
fresh official reference+cURL stdin transport passed; no cause is attributed
to reference age, client or host. Exact original reader/criteria did not change.
No browser/native-FPS trial was repeated. Signed URLs stay private.

## Saved diagnostic native rejection identified, still FAIL

Offline AST execution of the unchanged saved predicates reproduced the exact
first rejection at controller line267: startedAt<=firstTileAt<=last rAF stamp.
First TV baseline actual saved values782.4000000059605<=2254.699999988079<=2186.9
fail that predicate. All original controller/READY/proof/FAIL receipt SHA stayed
unchanged; no browser launched. paired-diagnostic-offline-predicate-review.json
retains exact inputs/reproduction. This identifies a saved failed comparison;
it does not accept the original native pair or weaken/rewrite its predicate.
The declared TV/phone gain gates remain FAIL and original earlier-pair offending
raw remains ABSENT. No cause claim or new unchanged retry. Renewed KEEP remains0.

Current d331 workflow37878647281 remains in progress at latest03:33:53UTC read.
Exact ten player/core/Worker/sampler/build bytes stay identical to accepted d01/
838. This publication changes actual evidence/docs/mutable outputs only; its
own newest-head complete CI and substantive current-player review are pending.
Last source push03:18:07.611800UTC, current hard03:48:07.611800UTC. Read the actual
new publication receipt for fresh cadence; prior late pushes remain recorded.

Actual complete RAM reader command: `python /tmp/g01-current-838-proof-20261009/private/control-d01-official-ram-fresh-once.py`. First transport/controller failure preserved; successful second transport uses fresh official signed reference with curl config stdin/max-filesize into RAM and passes exact unmodified Git reader via a BytesIO argument. All reader checks/predicates/code remain unchanged. Complete CRC/source/log/36-frame decode PASS,1,261 assertions, group[]; no native browser rerun.

## Latest exact ddd whole artifact and four-human phone checkpoint

Exact ddd364cd72247387b86b9b39bfd0f0a5f9895ffe workflow37880122191/
job113657699053 succeeded03:52:26UTC. Official11594815894/106,473,265B/
030ff370216fc90989cad8690480b8471b18654e73a1a92abcd47d5a80a3cdf0 passed
the unchanged full reader1,279 assertions. Outer naturally CLOSED04:00:58.661492
UTC/exit0/group[]. Whole SHA/CRC, exact immutable source/Git, full native npm,
25 mutants, actual file:// private handover/inline Worker,16 real Worker replays/
five variants,600 native intervals/602 stamps and36 decoded VP9 frames passed.
Hosted TV60.0024000960 FPS/phone4x59.8026512509FPS, p9516.7/16.8ms; finite
original gate observations, no generic60FPS/physical-phone/player-gain claim.
worker-hosted-ddd364c.json and media/worker-stage-ddd364c-proof.zip retain exact
bounded raw/controller/source evidence; clip18 is actual hosted capture. Whole
106MB stayed in RAM; no physical full ZIP/extraction or browser/FPS rerun.

FIRST actual four-human390x844/4xCPU functional check naturally CLOSED
04:03:00.755822UTC/exit1/FAIL/group[]. All1,618 installed dependency aliases,
1,746-entry inventory,1,630 source/helper aliases andfive runtime guards passed
before module import/after browser closure. Three reduced-motion cases completed:
Draw partners, Block partners and Draw individual, including allfour private
handovers/hide-reveal/legal actions/control fit. Normal-motion Block individual
failed the expected Player2 predicate with actual Player3 active. Saved earlier
hide/reveal step already has board22 and Player2. Preserve all raw/partial DOM
before assertions, first program/READY/inputs/controller and three screenshots
in media/four-human-phone-first-proof.zip; four-human-phone-first.json is the
granular summary. No cause attribution, retroactive acceptance or unchanged
retry. Source-bound diagnostic timestamps/turn-event observation are required
before distinguishing UI behavior from helper delay/turn assumption.

Current ten product/core/Worker/sampler/build bytes remain exact accepted ddd/
d01/838. The next evidence publication needs its own full CI. PR11 stays draft;
PR1 stays unchanged8c/open/draft/unmerged. Responsiveness native acceptance and
both fixed gain gates remain FAIL; renewed KEEP0/player gain unestablished.
Finish the failed normal-motion phone diagnosis, then ranked current-player
review/measurement; proof delivery is not a completed improvement round.

Last actual source push03:37:17.716577UTC, hard04:07:17.716577UTC. Shared quiet
HOLD03:49:17→direct root release03:59:00 preserved; no local native launch
during HOLD. Read actual next push receipt for fresh30-minute cadence. Earlier
ENOSPC/review-window misses and all historical failures remain retained.

## Current private-hand prompt fix adopted in audit

The audit now removes one obsolete reveal-animation finish callback. renderDock
already hides the veil when a hand is revealed; a later old animation callback
must not hide a newly reopened prompt. Same260/280/380ms animations, core/RNG/
Worker policy, UI/game clocks and original300 native sampler/gates remain.
UI45d160bb4ab1d7a8a900369b9e7880f51babfabd28069ce3af599272a2e0aeb5;
player1,032,817B/6740130f01cea0cbf752d4d0a1a66001b9acb4300a5363ac853037b7deded145.
Root actually read full original/candidate UI excerpts/diff04:20:53UTC before
the actual same-hash adoption04:25:40.002423UTC. Canonical PR1 unchanged8c/draft.

FIRST changed-source four-human390x844/4xCPU validation naturally CLOSED
04:16:57.960318UTC/exit0/PASS/group[]. Allfour original cases pass: Draw/Block
partners, Draw individual with reduced motion; Block individual normal motion.
All16 first human turns/private hide-reveal/legal moves/control fit passed with
all1,630 source/helper aliases/whole1,618 installed inputs/1,746inventory and
five runtime guards. Complete raw/native snapshot timestamps saved before
assertions. Exact original seat/visibility/control predicates were preserved.

New legitimate privacy-veil-check.ts runs the actual Reveal/Hide DOM handlers
in one synchronous task, then waits350ms for genuine native WAAPI completion.
The prompt remains visible/private, samePlayer1/empty board/no exposed hand;
a subsequent trusted pointer reveals the samefive tiles. FIRST actual run
naturally CLOSED04:23:57.716040UTC/exit0/PASS/group[], all1,631aliases/whole
installed inputs/runtimes unchanged. No state injection, clock installation,
FPS sample or historical failure-cause claim. This separate functional check
is added to default npm test before byte-unchanged original browser.ts.

phone-veil-callback-fix-first.json and media/phone-veil-callback-fix-first-proof.zip
retain exact full four-case raw/four screenshots, real-WAAPI raw, original
programs/READY/controllers/complete inputs, exact adopted sources, source
review/mocks and both before-native preparation errors. Every member byte/CRC
checked. Original old-source phone FAIL remains intact/causeUNKNOWN; controlled
mock reproduction is not a retrospective browser-cause attribution.

This is a measured bounded privacy usability improvement, pending complete
new-current full original CI and genuine official artifact acceptance. Earlier
ddd1,279-check whole proof remains historical, not green for this modified UI.
PR11 draft, PR1 unchanged8c. Responsiveness native acceptance and both fixed
gain gates remain FAIL; no FPS/physical-phone/player-response gain claim.
Renewed completed KEEP rounds0; provisional material privacy improvements1,
three-consecutive no-gain stopping streak0. After actual full current green,
re-read original instructions/rankfive/fix-measure worst and complete KEEP.

Last actual source push04:05:12.921243UTC, hard04:35:12.921243UTC; this concrete
fix checkpoint is due before that hard time. Read actual new push receipt for
fresh cadence. Own mainCLAIMS refresh follows under exclusive own-row lease.
Authoritative /tmp checkout remains; original workspace/history/unique ZIPs and
all failures remain preserved. No local original FPS or old-pair retry occurred.

## Current full privacy fix accepted; KEEP continues

Exact380bc2b full original workflow37884128914/job113670211296 SUCCEEDED
04:52:25UTC. Genuine official11596133560/114,796,318B/SHA549e98a4d5dff825
7666ae558b20d184f71aed7ddac933ed05b7b037fed23968 passed the BYTE-UNCHANGED
full reader1,303 checks. Outer naturally CLOSED05:02:44.578453UTC/exit0/group[].
Whole SHA/safe unique paths/CRC/all immutable Git bytes/full native npm/25 actual
mutants/real file:// private handover/16 real Worker replays/five actual variants/
600 original intervals/602 stamps/36 fully decoded VP9 frames PASS. Whole ZIP
was held in bounded RAM; complete bounded raw/mutable outputs/native/reader are
in media/privacy-veil-hosted-380bc2b-proof.zip. The fresh after-restart source,
installed aliases/Python stdlib/external startup modules/runtimes stayed exact.

FIRST new default real-WAAPI regression on exact old949 source genuinely FAILED
04:36:13.599198UTC/exit1. All complete input guards PASS/group[]: after actual
Reveal/Hide and353.5 native ms, the old finish callback hides the new prompt,
with samePlayer1/empty board/no hand exposed. New exact380 full original npm
invokes that regression before byte-unchanged original browser.ts, with its
actual native PASS sentence. Full hosted raw regression JSON was outside the
original upload path; no hosted raw DOM claim. Earlier first changed-source
four-case/real-WAAPI full raw is public. This controlled negative identifies
this callback defect; the older four-phone failure cause remains UNKNOWN.

privacy-veil-hosted-380bc2b.json records exact current proof and both complete
archives. Old949 FAIL/default regression/raw/controllers/complete inputs and the
reader's before-child-only helper namespace error are preserved byte-for-byte.
No original sampler/gate/clock changed; no native unchanged retry occurred.

Renewed completed KEEP1: bounded private-prompt reliability improvement now
qualified by complete current CI. Consecutive no-player-gain rounds0. PR11
stays draft until renewed substantive review reaches the binding three-round
no-player-gain condition. Original PR1 unchanged canonical8c/draft/unmerged.
Next: re-read G01/rankfive, examine the worst remaining testable weakness with
actual evidence, preserve every rejected attempt and log each measured round.
Old responsiveness native acceptance and both player-gain gates remain FAIL.

Last source push04:29:34.626379UTC; hard04:59:34.626379UTC was exceeded during
the execution-environment restart/resumption. Work actually resumed04:59:15UTC;
this preparation occurs after the deadline, with no backdated timestamp.
Read the next actual source-push receipt for exact interval and fresh cadence.
Main CLAIMS refresh requires the root-serialized exclusive ownG01row lease.

## Renewed KEEP stopping condition reached; current delivery check

Exact corrected380 player has complete original current green and genuine
1,303-check whole-artifact acceptance as recorded below. The source remains
byte-identical throughout three new substantive rounds following privacy R25:

- R26 complete four-human phone rounds: actual4/4 Draw/Block/partner/individual
  PASS;100 legal actions/94 human turns/6 draws/10 passes/484 raw snapshots.
  Public round pips independently match observed authorized hands; all28 tiles
  conserve, every next-round handover stays private. Natural close05:11:43.127037
  UTC/exit0/group[]/allfreshinputguardsPASS. No player-visible gain found.
- R27 worst hand fixture: entire untimed5,000-seed scan selected smallest-tie
  seed146, genuine13-tile hand. First actual phone/normalmotion/4xCPU case PASS:
  27 actions/19 turns/8 draws/4 passes/105 snapshots, exact pips/conservation and
  next private deal. Natural close05:15:39.935361UTC/exit0/group[]/allguardsPASS.
  No current player change or player-visible gain found.
- R28 data-boundary/actual consumer audit:9,027 fully frozen states,27,081 hidden
  substitution pairs,36,108 deterministic Easy/Medium calls,72 Strong calls,
  9,027 pure reducer transitions allPASS. Natural close05:20:45.364738UTC/exit0/
  group[]/allfreshguardsPASS. An earlier deliberate JavaScript write to the
  exported readonly observation ends tuple genuinely failed and is retained:
  caller changed ends4→5 while board stayed4. Actual shipped consumers read
  that tuple; Worker messages copy it. No game-function input mutation or
  shipped-player defect demonstrated; tuple-copy proposal was not adopted.

renewed-keep-R26-R28.json and the complete verified media archive retain every
actual raw snapshot, screenshot, full5,000 scan rows, full frozen-state rows,
unmodified controller/helper/input/alias/runtime receipts and both preparation
errors. Every member has full CRC and byte verification. Private test clone
copies exact Git source and resolves existing pinnedZod4.6.5; no product edit.

Renewed completed KEEP4 including qualified privacy improvementR25; consecutive
substantive no-player-gain rounds3 (R26–R28). The binding stopping condition
is reached for the current player. This is a bounded review, with no stronger
AI/FPS/physical-phone claim. All historical failures and unknown causes stay.

This final evidence/docs checkpoint needs its own original full CI and actual
immutable whole uploaded artifact acceptance. PR11 remains draft until those
pass. On resume, first read PR11/head/workflow and the private native receipt;
accept only this exact delivery source. After its current proof passes, mark
PR11 Ready, preserve originalPR1 unchanged8c/draft, and read fresh main claims/
all branch last-commit times before taking the next lowest eligible queue job.
Evidence-only finalization does not reset the three completed review rounds.
Do not make a completion-only source commit that restarts unchanged checks.

Actual prior source push48cb closed05:05:31.077751UTC; next early05:30:31.077751/
hard05:35:31.077751UTC. Its prior interval was35m56.451372s: hard04:59:34.626379
missed5m56.451372s during actual environment restart/resumption/readback, no
backdates. Read the next actual source push receipt for current cadence.
Own G01 main row refreshed05:06:15UTC under exclusive lease; only own-row
refresh follows this new push under the root-serialized main lease.

## Isolated absent-turn candidate/checkpoint correction
Current npm run check and node build.ts pass; node build.ts --check also passes after adding the new7-test default suite. Fixed all-human controller: python /tmp/G01-private-fixed-absence-controller-20261009.py, CLOSED13:09:27.529285/pass/all1047 guards/468 full pairs,427 original60-minute simulated-budget failures. Stable controller: python /dev/shm/G01-private-remaining-issue-20261009/stable-build-controller-v2.py, CLOSED13:22:00.314634/pass/all1230 guards/527041 assertions/468 pairs/360 connected games101238 whole-state comparisons/360 empty/360 pause cases. These guard receipts certify that stable product invocation, not later docs/package/whole workflow. Separate smoke: node --test absence-presence.test.ts pass7/fail0; ABSENCE_CORE_PATH=<exact copied eadb> node --test absence-presence.test.ts pass1/fail6. All first raw programs/outputs/failures/complete guards are archived byte-for-byte. First candidate controller FAIL because play.html changed during concurrent build; empty helper after ENOSPC UNEXECUTED. First published43 ZIP had duplicate member names and failed its unique-name assertion before dependent commands wrongly continued; exact failed ZIP retained. Corrected package independently verifies all unique names/full CRC/all input member bytes before writing. Full original broad tests/current visual capture/exact-current hosted qualification still pending. No FPS or new formal KEEP claim.

## Current absence compatibility/visual milestone
Commands: python /dev/shm/G01-compatibility-oracle-first-controller-20261009.py invokes unchanged strict compiler and node total-compatibility.ts --write twice. Both943B reports SHAcb9f3d4ea129bf7e0c9310f8080807ab85669f410ace2ff7140d8aacfeb0442b byte-identical; all3327 frozen aliases unchanged; natural close13:59:36.736578. All original1003 seeds/events/physical fields/results preserved; independent old-engine827 legal absence actions pass tighter stock+N-1 and28-tile/RNG checks. New separate1003 fullyconnected games377896 whole-state transitions exactly match byte-frozen protected eadb with no normalized field. Original949 baseline is unchanged. Current functional helper/controller: actual3 cases TV/phone4x/reduced motion24 legal actions/24 private handovers, full human clocks/offline/error/privacy pass13:48:56.856901/all3326 aliases/no signals/owned groups or detached children. Complete333-frame VP8 decoder ffprobe/count_frames + ffmpeg -xerror framehash pass13:56:43.574302/all214 library guards; export25fps is not performance. Full first original9f run37939034123 actually FAIL remains; entire official128399627B/77dd5ac989493bc3a74598a7310b305d6e03f19795e3470ae056631c2de99ad7 CRC/397unique/source197/native105111B verified. No browser test ran there. All raw inputs/outputs/helpers/first failure archived; new whole current original pipeline still pending.

## Genuine whole32a qualification and first post-green rejection
python /dev/shm/G01-current32a-official-whole-first-acceptance-20261009.py 11622437616 138424314 d2bc3dc9a64d6928aaa59093324fced93b067e753ae3ad74103238576bd6e375: unchanged full6a33 reader PASS1342, controller natural14:27:04.352304/all6569 fresh actual aliases/no child. Original hosted whole pipeline55 default tests/25 real mutant kills/600 intervals602 stamps/36 completeVP9 decode/realfile16Worker5variants pass. Whole native130021B/03ee4c7d25d569afcfaa8d125e7bd6ad30fd92acaef32dddbb79d75c11f6fb3f. Local complete48+7 counts independently read/no skip; after-only importer observation is explicit. python /dev/shm/G01-postgreen-idle-departure-first-controller-20261009.py: actual first old-current policy FAIL1,480 retained assertions in240 legal full-idle contexts, direct andpaused departure human1000ms not30000. Natural14:33:56.571522/all6568 guards/group+detached[]. No source fix/no noGain credit yet; all raw program/state/events/first failures archived. New checkpoint wholeCI mandatory before finalReady.

## R29 narrow explicit-idle handoff repair
python /dev/shm/G01-idle-handoff-private-first-controller-20261009.py: actual480 old1000ms failures→480 new30000ms windows in240 legal contexts;240 entire unattended matches/88055 strict physical/RNG/scoring transitions/max1244311ms<3600000 unchanged budget. All48 original +9 added default regressions PASS/no skip; pre-fix actual7PASS2FAIL retained. Both complete unchanged original1003seed lanes (372510 transitions/827 old absence actions;377896 exact connected whole states) run twice byte-identical944B native. Controller natural15:01:46.232632/all10015 inputs/no child. python /dev/shm/G01-idle-handoff-private-mutants-first-controller-20261009.py:3 real separately injected timer bugs strictly compile then nativeAssertionError1, all13268 fresh guards/no signals/child, natural15:03:57.623477; no original25 mutation change. Actual changed page24 trusted private handovers/3 profiles/all10015 frozen aliases and complete665VP8 decode/all1201 fresh inputs PASS; functional only, no clock installation/FPS/file/absence UI-event/hardware claim. Adopted exact guarded core/page/tests then npm run check; node build.ts --check; node checksums.ts; node checksums.ts --check; git diff --check PASS, full native saved. New current whole original official qualification remains mandatory/pending.

## Genuine full1008 original qualification and R30 first negatives
Original full37949931679/job113885765277 SUCCESS and first official11625469527/174562700B/a2f7094b1ae1464d4f2271423ffa9338b220a95dddc259faf764f578cbfb8ffb: unchanged6a33 reader1360PASS/natural15:32:31.862717/all6575 fresh guards/source208/no children. All57 default tests/25 real mutants/full600interval602stamp/36VP9/16Worker5variant/actualfile privacy original gates pass. Exact full native130880B/a6f1611e82d715f2651bb4c058cfb4369eea5abfad989f9e260b2d27a880bcc4 retained. python /dev/shm/G01-postgreen30-empty-return-minimum-window-controller-20261009.py: intentional native AssertionError1;1440 real legal cases/1200 below30s failures,780 connected whole-state comparisons/1440 physical metadata/240 paused controls, all6578 before/after guards natural15:40:33.609564. First0-case metadata helper and next six harmless above30s exact-equality false-positive failures retained. Current worst defect uncorrected; no R30 completed/gain/streak credit. New evidence source needs genuine newest whole CI.
