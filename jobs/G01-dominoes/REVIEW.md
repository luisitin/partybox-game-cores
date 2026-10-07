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
