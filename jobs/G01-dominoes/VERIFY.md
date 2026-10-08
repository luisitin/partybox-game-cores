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
