# Implementation and verification corrections

- Add a deterministic Draw/Block reducer, regional scoring toggles, four-seat
  partners, safe views, results, fixtures and a standalone hot-seat/bot page.
- Keep bot decisions behind a public-observation boundary; use sampled deals
  and bounded alpha-beta to provide stronger play without hidden-hand access.
- Add an independent exhaustive endgame implementation, 10,000 differential
  cases and an assertion-based mutation harness with a mandatory passing baseline.
- Correct test setup: oriented-chain tests must supply the preexisting board,
  and hidden-view comparisons must pass the same viewer ID. Discard the first
  mutation attempt against the failing baseline; it is not evidence of kills.
- Fix build substitution to use a callback: literal `$` replacement sequences
  in the bundled dependency previously corrupted embedded JavaScript. Parse
  the generated script before writing it, and functionally exercise it in Chromium.
- Fix order-sensitive input comparison: equivalent schema-valid play inputs
  are accepted regardless of object-key insertion order. Add regression coverage.
- Fix unattended match timing: retain 30 seconds for humans, accelerate after
  two missed/automatic turns, restore normal time after real input, and check
  18,000 full idle matches against the contract's simulated-time budget.
- Add a doubles-first easy strategy, retain stronger pip/coverage medium play,
  and rerun measured leagues after the policy change.
- Collapse configuration after starting a match so TV gameplay fits 1080px.
  Keep settings available through the accessible Configure match disclosure.
- Add functional browser privacy, full bot-match, offline, reduced-motion,
  throttled frame-time checks and a short original milestone video.
- Record rule knowledge fallbacks honestly; main's new web-fallback policy
  supersedes the initial research-only BLOCKED.md.

KEEP GOING round 1: add a selectable published Draw deal (7/7/6), preserving
Block-sized 7/5/5 as the labelled house default. Live rules recovery established
the difference, so players can now choose the convention rather than guessing.
Bump saveable-state version to 0.2.0 for the new settings field; regenerate the
manifest, fixtures and offline bundle. Add explicit byte-for-byte replay checks
and 1,000 full matches each at three/four seats for the new setting.

KEEP GOING round 2 candidate: model forced Draw actions on the same turn in sampled alpha-beta positions, including the configured stock reserve. Sample unseen stock order from public information only; include stock tiles when deciding the exact-search cutoff. Add regression cases for draw/play/pass/empty-hand and reserve reversal without mutating sampled positions. Extend league runner with an explicit Draw mode and separate report so the existing Block results remain intact. Correct the stale rules-source header after live sources recovered. Candidate acceptance depends on seeded Draw measurements and existing regression checks.

Round 2 measured acceptance: strong/medium Draw wins improve from 1,513 to 1,630 over the same 2,000 seeds (+5.85 percentage points); medium/easy remains 1,155. Independently extend the exhaustive reference with forced draws and validate 10,000 Draw cases in addition to the original 10,000 Block cases. Add the Draw league to npm test so the new behavior remains measured in CI.

Round 3 candidate: replace bounded rejection on constrained observations with memoized exact conditional assignment counts and weighted seeded sampling. Keep uniform shuffle for unconstrained hands; build the memo once per decision for all 16 samples. No true hands or stock order enter the sampler; impossible evidence returns null rather than being ignored. Add brute-force count and sample-conservation tests before acceptance.

Round 4 experiment: add a reproducible three-seat Block tournament with an isolated max-n candidate, shipped coalition search and medium; rotate policy seats across 2,000 seeds. The study generates and deletes its candidate module and leaves production behavior untouched. The candidate lets each opponent optimize its own result instead of treating all opponents as a coalition. Acceptance requires measured improvement and independent tactical/regression validation.

Rounds 5–6 experiments: add a reproducible isolated search-budget tournament, changing only depth three to four or 16 samples to 32 in a generated temporary module. Each candidate faces the shipped strong policy in 2,000 seeded complete two-seat Block matches with alternating seats; record binomial confidence intervals and turn totals. Production source is never edited and candidate files are removed in finally. Candidate acceptance requires a supported player-noticeable gain; increasing compute alone is not sufficient.

Delivery correction during budget reviews: preserve each original milestone capture under a distinct filename instead of overwriting the previous capture; recover exact original bytes from their verified commits. Latest browser runs update the conditional-sampling milestone capture. Expand data checksum discovery to include archived Draw comparison JSON, which do not end in -report.json, while continuing to exclude package/compiler configuration. Verify recovered video streams with ffprobe and regenerate/check the complete data/media checksum list.

Budget study gains a validated positive-integer starting-seed option and separate confirmation report, permitting independent confirmation of the borderline 32-sample result without overwriting its original 2,000-seed report. Production remains unchanged pending confirmation.

Round 6 acceptance: independent seeds 2,001–4,000 give 1,063/2,000 wins against the 16-sample policy (53.15%, 95% 50.96–55.34), confirming the initial 52.25%. Increase shipped sampling from 16 to 32, version 0.2.1, preserve the exact prior source in study-baseline.ts, and point archived experiments at that baseline so they remain reproducible after production changes. Record a separate fifth milestone video; extend archive-hash regression to it. Rerun required strengths and regression checks for the accepted policy.

Round 7 probe: add an isolated score-policy checker against the immutable prior
source, comparing terminal search rewards with configured reducer scores across
10,000 seeded individual/partnership and blocked/out cases. The proposed model
subtracts the winner's remaining pips for individual net blocked scoring and
includes the partner's remaining pips for all-remaining partnership scoring.
This discovers 3,934 mismatches in the old model; corrected candidate has zero.
Production changes wait until the prior milestone's strength pipeline finishes.

Round 7 production correction: version 0.2.2 forwards both selected scoring policies into sampled search positions; terminal reward uses actual configured points while retaining its winner preference. Omitted standalone blocked policy defaults to the selected net rule. Independently extend reference scoring and random differential cases for both policies; add direct regression examples and the 10,000-case production alignment check to npm test. Preserve prior captures and record a distinct sixth score-policy milestone.

Round 8 isolated probe: add a public-score endgame checker demonstrating a forced full-match loss that the round-only policy chooses to minimize pip loss. Candidate forwards public standings and target, assigning match wins/losses greater weight than ordinary round outcomes. Validate tile conservation, oriented board adjacency, legal moves and both resulting phases with the actual reducer; production remains unchanged pending the prior milestone push.

Round 8 production correction: version 0.2.3 forwards copied public standings and target to sampled positions, valuing a full-match win/loss above an ordinary round outcome. Preserve exact prior score-aware source as study-score-baseline.ts; keep the tactical before/after study reproducible against it and add --production choice validation to npm test. Independently extend the exhaustive reference and random cases for target completion; add terminal reward and score-copy regressions, plus a distinct seventh capture.

Round 8 verification correction: decouple randomized target cases from the partner-seat parity, which otherwise excluded all partnership target cases. Draw targets independently from 100/150/250, record explicit goal/partner/target case counts, and add a shared-team score regression for either teammate. This broadens validation without altering production behavior.

Round 9 measurement preparation: add mixed-idle.ts to exercise zero human inputs
with active medium computer seats, 200ms computer moves, automatic phase deadlines,
all 2–4 seat/computer-count combinations, both modes and all three targets over
1,000 seeds each (36,000 cases). Report per-configuration failures and maxima;
optional --enforce enables the existing simulated-time budget as a check after
correction. Current core and wrapper are unchanged during baseline measurement.

Round 9 correction, version 0.2.4: rename submission handling and distinguish the actual sender's bot flag when resetting inactivity, including any participant's round-end Next. Computer inputs preserve acceleration; genuine human activity restores its 30-second window. Schedule the declared round-end timer in human-containing standalone matches, retain manual Next and fast all-computer rounds, and inform players of automatic advancement. Add sender/recovery regressions, zero-human-input browser progression/privacy and enforced 36,000-case mixed-roster timing to npm test. Record a separate eighth capture.

Round 10: add immutable study-goal-baseline.ts (exact 0.2.4 source) and strategy-goal-study.ts so max-n is evaluated against current goal-aware rules, without modifying production or historical 16-sample reports.

Round 11: add budget-goal-study.ts for isolated depth/sample experiments against exact current goal-aware 32-sample source; production stays unchanged during evaluation.

Round 11 production: version 0.2.5 increases strong samples 32→64 after fresh-seed confirmation (54.1%, lower 95% 51.92%). Preserve prior league/baseline/browser JSON reports and eighth capture; browser records separate ninth capture and archive regression covers it. Existing privacy/determinism, independent sampling and legal-move checks continue to apply; no reducer/rule changes.

Round 12: preserve exact 0.2.5 source in study-samples64-baseline.ts and add isolated strategy-samples64-study.ts; compare max-n to the newly accepted sampler without modifying production.

After measured 30-minute encoder-install timeout, bound APT refresh/install and connections; retain last complete indexes after refresh warning and fail on unsuccessful installation. No timeout increase or skipped game checks. Add STRATEGY_SEED_START and separate confirmation report to isolated max-n study for independent fresh-seed validation.

Round13: add isolated budget-samples64-study.ts for antithetic hidden-hand draws and depth-four candidates against frozen0.2.5 source. Pairing reflects the discrete32-bit grid (maximum1−2^-32), keeping floats in[0,1) and a fresh base stream per pair; candidate guards mismatched draw counts. Production unchanged pending measurements.

Round14: add opener-probe.ts before changing production:2,315/10,000 first-round Block sampled worlds violate the public forced-opener ordering. Version0.2.6 forwards public round to Observation, derives excluded tile IDs from highest played rank (Block introduces no new tiles), and extends conditional bins with tile-level exclusions; stock remains unrestricted. Apply only first-round highest-double Block. Extend independent brute counts with tile bans, archive prior suit-only results, add regressions and separate tenth capture; add production opener probe to npm test. Historical match-goal fixture adds public round2 without changing its baseline algorithms.

Round14 privacy follow-up: inactive Observation no longer receives another player's privately held forced opening tile. Retain it for the active owner, whose own hand already contains it. Add an inactive/active-owner regression; active bot policy and game transitions are unchanged. Regenerate standalone bytes and rerun focused/browser checks.

Round15 measurement: freeze exact0.2.6 as study-opener-baseline.ts and add draw-opener-probe.ts for10,000 untouched-stock Draw deals. Public total hand count plus played count determines stock size; compare the still-unmodeled initial Draw opener constraint before altering eligibility.

Round15 production0.2.7: extend public opener eligibility to untouched-stock Draw, deriving initial stock from the selected deal/partner rules and current stock from public hand and played counts. Stop immediately after any draw. Adapt prior-policy comparisons to Draw after stock use; add real draw/deal regressions and an eleventh distinct capture. Add10,000-case Draw probe to npm test. No extra private state/history or original art changes.

Round 16 measurement: freeze exact current 0.2.7 in study-current-baseline.ts and add improvement-study.ts. Guard byte equality against production to prevent comparing stale policies. Isolate depth-four, tile-count leaf and ten-tile exact-search candidates; each must pass focused privacy/determinism/search-rule regressions and 2,000 schema-checked complete matches before any acceptance. Only the depth-four round has started. No production or visual change.

Study throughput: add parallel-improvement.ts and bounded, separate shard output to improvement-study.ts. Four processes evaluate disjoint500-seed ranges; aggregate validates source hashes, contiguous ranges, regression success and exact2,000-match totals before recording results. No game behavior changes. The partial sequential run is discarded, not counted as evidence.

Round17 isolated candidate: improvement-study.ts supports draw-depth, preserving search depth on mandatory stock draws and selecting Draw for its comparison. Stock decreases on each recursive draw; production stays untouched unless2,000-match strength and fresh-seed confirmation pass. The round16 global depth-four candidate lost and is not shipped.

Round17 confirmation fails the predeclared strength bound; the forced-draw depth candidate is not shipped. Round18 uses the already isolated leaf-count candidate, adding a five-point relative tile-count term to the shallow pip evaluation while preserving terminal rules. No production change.

Final review: reject the tile-count candidate after its2,000-match interval crosses50%, completing three no-gain rounds. Correct stale documentation that still described Draw lookahead as blocked play or the selectable7/7/6 deal as future work; restore precise remaining research limitations in NEXT.md. Production, existing tests, HTML and archived media remain byte-identical to the green0.2.7 delivery.

Stale-claim delivery review19:
- build.ts embeds the complete pinned Zod MIT notice and asserts installed/
  committed/embedded equality;the standalone file retains its licence.
- checksums.ts hashes play.html and THIRD-PARTY-LICENSES.txt.
- package.json validates committed hashes before any generator can replace
  them;the existing final generator/check records fresh test outputs.
- browser.ts accepts G01_CAPTURE_PATH so a new milestone clip can be saved
  separately from the previous draw-opener recording.

Round20:core.ts rejects null/nonobject events,nonfinite clocks,nonstrings actor IDs,malformed presence and schema-invalid inputs before dispatch. test.ts extends all-phase identity regressions;state format/strategy stay0.2.7.

R21:study-total-baseline.ts freezes exact949c2e3 core;total-compatibility.ts/report compare every state and final result with new guards over1,003 seeded mixed-setting games. Wire assertion mode into npm test so valid gameplay regressions fail CI. G01.yml adds per-PR cancellation of obsolete runs;all required checks remain. No production strategy/state changes.

R22:total-envelopes.ts/report exercise invalid actors/payloads/clocks/presence/timer/VIP envelopes against3,012 deep-frozen states from1,003 seeds and three phase fixtures. Assertion mode runs in npm test;the report records actual234,936 probes. This regression coverage targets the R20 contract failure without changing production behavior.
