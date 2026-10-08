# Verification log

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
