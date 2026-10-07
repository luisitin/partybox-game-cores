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
