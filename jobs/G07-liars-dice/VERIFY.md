# Verification log

Current checkpoint: all local checks below passed against the final core/page.
Hosted exact-head CI and the post-green KEEP GOING loop remain pending.
Intermediate failures below are retained as history, not current blockers.

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
tests/contract.test.mjs tests/timestamp-boundaries.test.mjs`: PASS32/32 focused
tests, including all nine contract invariants; evidence/checks/targeted-final.tap.
`node --test tests/bot-games.test.mjs tests/properties.test.mjs`: PASS2/2.
7,000 complete games, exactly1,000 at EACH player count2–8,1,698,274 events;
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
all600 consecutive intervals retained, zero above17ms. Same live8-player8×3bid,
own cup open, nonnull exact odds, legal draft selector edits every30frames.
Performance uses fresh contexts after functional checks, source-hash guarded at
start/end; no reused proof in this final full run. Browser host caches controller
views/groups and reuses unchanged option DOM. Latestreport and rawframes are
evidence/browser/report.json and its frame files. Earlier successful and failed
source snapshots remain archived; cause of prior stalls is unestablished.

`node scripts/capture.mjs delivery-final`: PASS. Five real rounds each, pause,
reveal and winner, zero pageerrors/network requests. Desktopvideo1280×720
1,024,954bytes; phone390×844CPU4x910,384bytes. Capture is separate from FPS proof.
All previous milestone recordings remain; each is below10MB. Temporary capture
outputs moved into ignored.work rather than public evidence.

`npm run build`: final PASS strictTypeScript/bundle; runtime core unchanged
db7373ae850fa2ae88ecea1cd873516034ce534daa9c7748729893c1c3ab5df3.
Both original MIT and actual pinned Zod MIT notices are embedded in play.html.
`node scripts/hashes.mjs` twice + `cmp`: required identical checksum manifests.
`sha256sum --check SHA256SUMS.txt`: required PASS for every delivered file.
`node scripts/integrity.mjs`: validates hashes/coverage,2×fixture regeneration,
source-matched600frame evidence/raw statistics, licenses,no runtime I/O/network
and every media file below10MB. Its final run is recorded in the next entry.

### All25 actual planted source bugs
Each is compiled individually; exact selected baseline first passes. Mutated
suite must fail with ERR_ASSERTION; syntax/import failures do not count. Actual
command `node scripts/mutations.mjs`, PASS25/25; report and29 rawTAP files in
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
