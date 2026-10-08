# KEEP GOING reviews

## Round 1

Five largest weaknesses, ranked: published Draw deal not selectable; Draw bot lookahead ignores future stock; bounded hidden-deal rejection can fall back; no physical-phone/file-navigation proof in managed environment; limited upstream baseline scope. Fixed the first with a labelled 7/7/6 Draw option, retaining 7/5/5 as the explicit house default and seven-per-partner override. Other regional rules remain independently configurable; this option does not claim a complete Pagat rules edition.

## Round 2

Five largest weaknesses, ranked: Draw lookahead ignores future stock; bounded hidden-deal rejection can fall back; coalition assumption in individual games; no physical-phone/file-navigation proof in managed environment; limited upstream baseline scope. Candidate fixes the first using sampled stock order, preserving the public-information boundary. Measure against the unchanged policy over 2,000 seeded Draw matches per comparison.

## Round 3

Five largest weaknesses, ranked: bounded hidden-deal rejection fallback; coalition assumption in individual games; no physical-phone/file-navigation proof in managed environment; limited upstream baseline scope; depth-three early-game horizon. Candidate fixes the first with exact conditional partition counts. The rare feasible distribution has one admissible opponent hand among 1,540; old sampling finds it in 89/1,000 seeded trials, exact sampling in 1,000/1,000. Ten thousand independently enumerated small counts agree, including 6,459 impossible cases that remain explicitly impossible rather than discarding evidence. Full-game regressions and leagues determine acceptance; statistical win-rate gains are not presumed.

## Round 4

Five largest weaknesses, ranked: coalition assumption in individual games; depth-three early-game horizon; only 16 hidden samples; physical-phone/file-navigation evidence unavailable here; bounded upstream reference scope. Tested the first with selfish max-n against the shipped policy and medium over 2,000 three-seat Block matches. Candidate wins 766 versus 702, but the difference confidence interval crosses zero; reject the production change. This records an unsuccessful substantive improvement attempt, not a cosmetic patch.

## Round 5

Five largest weaknesses, ranked: depth-three early-game horizon; 16 hidden samples; coalition model (tested alternative did not establish a gain); physical-phone/file-navigation evidence unavailable here; bounded upstream reference scope. Isolate depth-four lookahead, preserving exact small-endgame search and every other production choice. Measure 2,000 complete matches directly against shipped sharp, rotating seats.

## Round 6 candidate

Five largest weaknesses: only 16 hidden samples; depth-three horizon (round 5 measurement underway); coalition model (round 4 alternative rejected); physical-phone/file-navigation evidence unavailable here; bounded upstream reference scope. Isolate 32 conditional samples versus shipped sharp over 2,000 complete matches. This concurrent study is evidence against the current shipped baseline only; if round 5 changes production, remeasure against that new baseline before acceptance or a no-gain claim.

## Round 7 candidate

New semantic probe promotes configured search-reward mismatch to the highest
priority. Five weaknesses: terminal rewards ignore selected blocked/team scoring;
coalition assumption in individual play; finite 32 hidden samples; physical phone
and managed file navigation unavailable; bounded upstream reference scope.
`node score-policy-check.ts` compares rewards to the reducer's configured terminal
scores in 10,000 seeded cases: 3,934 old mismatches, zero corrected-model
mismatches. Candidate remains isolated until the 32-sample milestone completes.
Keep the +100 winner preference, but use the actual configured round points;
this remains a round heuristic, not a solved full-match value function.

## Round 8

Five weaknesses: missing public match standings in search (highest); mixed
computer/idle-human timing remains unmeasured; coalition opponent model;
finite 32-sample budget; physical-phone/file navigation evidence unavailable.
The public-score tactical probe demonstrates a real forced match loss changed
to a continuing match, verified through the reducer. Fix and validate standings,
target completion and shared-team scoring rather than infer a win-rate gain.

## Round 9 candidate

Inspect mixed unattended play: every computer input currently calls the same
`human` helper and resets global idle acceleration. Also, the standalone wrapper
schedules no round-end timer when any human seat exists. Five weaknesses ranked:
mixed unattended progression; coalition model; finite 32-sample budget; depth-three
horizon; unavailable physical-phone/file navigation evidence. Measure mixed
human/computer rosters against the contract simulated-time bound before changing
code. Repair both the role-aware activity reset and missing wrapper exit if the
probe confirms the failure; preserve a genuine human's 30-second recovery window.

## Round 10

Ranked weaknesses: coalition opponents in three-seat free-for-all; finite 32-sample budget; depth-three horizon; bounded upstream search; unavailable physical-phone evidence. Re-test isolated max-n with current goal-aware scoring against shipped strong and medium over 2,000 rotating-seat matches. Accept only an established candidate-versus-shipped win difference; preserve current production and baseline otherwise.

## Round 11

Five remaining weaknesses: finite 32-sample hidden-hand budget (highest testable); depth-three horizon; coalition model with rejected max-n candidate; bounded upstream reference; no physical-phone hardware evidence. Test 64 versus 32 samples in 2,000 alternating-seat Block matches against immutable current-goal baseline. Require a positive lower 95% bound and independent fresh-seed confirmation before accepting a marginal strength gain.

## Round 12

Five weaknesses: coalition opponent model in multi-player free-for-all; depth-three horizon; remaining finite sampling variance; bounded upstream comparison; no physical-phone hardware evidence. The 32-sample max-n probe narrowly crossed zero; re-evaluate this most plausible opponent-model candidate under the newly confirmed 64-sample policy over 2,000 rotating-seat matches. Require a positive lower bound for its candidate-versus-shipped win difference; do not accept a favorable point estimate alone.

## Round13

Five weaknesses: finite hidden-hand sampling variance (highest); depth-three horizon; coalition model with unreplicated max-n improvement; bounded upstream reference; unavailable physical-phone evidence. Test antithetic pairs at the same64 worlds: mirror each32-bit draw within a pair, preserve uniform marginal grid and exact conditional constraints. This is a variance-reduction hypothesis, not a promised improvement. Compare against immutable64 source over2,000 alternating-seat Block matches; require a positive lower win bound and fresh confirmation before acceptance.

## Round14

Five weaknesses: unmodeled public Block opener constraint (highest, measured2,315/10,000 impossible worlds); depth-three horizon; finite variance with rejected antithetic pairing; coalition model with rejected max-n; physical-phone evidence unavailable. Correct the public deduction, prove tile/suit conditional counts against10,000 independent brute cases, measure the same10,000 dealt states after correction, and preserve disabled-mode/later-round behavior.

## Round15

Five weaknesses: unmodeled Draw opener information while stock remains untouched(highest newly testable); coalition model; depth-three horizon; finite sampling variance; physical-phone evidence unavailable. Before anyone draws, public stock size equals its initial value, so the Block opener deduction remains valid. Measure before changing eligibility; disable immediately when stock shrinks to avoid inferring an original opener from newly introduced higher tiles.

## Round 16

Five weaknesses, ranked: the depth-three early-game horizon; finite 64-world sampling variance; coalition opponents in free-for-all; limited upstream reference scope; unavailable physical-phone evidence. Test depth four against exact current 0.2.7, retaining the new opener constraints, public standings, selected scoring and 64 samples. The older 16-sample rejection is not evidence for this changed baseline. Require a positive lower 95% win bound over 2,000 alternating-seat complete matches, then fresh-seed confirmation before acceptance. Production stays unchanged while measured.

## Round 17

Five weaknesses, ranked: forced Draw steps consume the shallow decision horizon; finite64-world variance; the leaf evaluator only measures remaining pips; coalition opponents in free-for-all; unavailable physical-phone evidence. Test retaining depth across forced draws, so the next play/pass decision remains visible. Stock strictly decreases on each draw, bounding recursion; fully searched small endgames retain their terminal values. General depth-four lost round16, so this isolates the mandatory-draw accounting rather than adopting a globally deeper search. Compare2,000 alternating-seat Draw matches against exact current0.2.7, with fresh-seed confirmation required for acceptance.

## Round 18

Five weaknesses, ranked: shallow evaluation ignores remaining tile count; finite64-world variance; coalition opponents in free-for-all; incomplete Draw action-history inference; unavailable physical-phone evidence. Test adding five points per relative remaining tile to the leaf pip heuristic. This can distinguish blocking an opponent from merely shedding high pips and reduce the risk of stranding low-pip tiles. Keep terminal rewards, all64 worlds, depth-three and exact endgame thresholds unchanged. Compare2,000 alternating-seat Block matches to exact0.2.7; fresh-seed confirmation is required if the initial lower95% bound exceeds50%.
