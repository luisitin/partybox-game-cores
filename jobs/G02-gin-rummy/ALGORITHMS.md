# Exactness and independent reference

For a hand with n<=11 cards, enumerate all same-rank triples/quads and every
consecutive same-suit run of length at least three. Thus every legal meld is
present, including subruns and three-card subsets of a four-card set.

The production recurrence takes the first remaining card. Every legal
partition puts it either in deadwood (its value plus the optimum for the
remaining cards) or in exactly one candidate meld containing that card
(the optimum with that whole meld removed). These cases are exhaustive and
disjoint; recursively taking the minimum therefore returns the global minimum.
It cannot reuse a card because each step removes its mask from remaining cards.
A stored choice reconstructs an actual valid layout, not only a numeric score.

The test reference independently enumerates every hand subset, tests validity
by sorted card ranks/suits, and enumerates every disjoint candidate packing.
It maximizes saved card value and subtracts from total value. It imports no
production function and shares no candidate enumeration or recurrence. It is
an independent algorithm by the same author, not a claim of blind authorship.
Actual differential testing covers 10,000 shuffled hands, half ten-card and
half eleven-card, plus reversal/permutation checks and named overlap traps.

For defender layoffs, enumerate every disjoint own-meld partition. For each
remaining deadwood set, recursively try every currently legal single-card
extension of each declared knocker meld. Continuing this until no legal
extension remains covers every legal extension sequence, including chains
and competing target runs. A separate reference instead enumerates complete
attachment subsets per target and solves a weighted disjoint packing with
at most one attachment per target. Its 2,000 actual comparisons cover 1,000
two-target and 1,000 three-target boards, checksum102460 and 1,534 actual
laid cards, plus a run-vs-set competing-attachment chain.
Taking the minimum across both decisions is a
joint optimum; first freezing the defender's best standalone melds would not
in general suffice. Gin/Big Gin completely disable the extension branch.

Bots optimize only their actual controller observation, never unknown cards.
The exact recurrence is not an exact whole-game strategy solver: strong play
uses explicit partial-meld/danger heuristics and measured league separation.

Strong terminal choice2026-10-09: eligible zero-deadwood discards form the first ranking group, with the previous heuristic/tie order retained within each group. This is justified by positive Gin bonuses and no defender layoffs, rather than inferred hidden cards. The existing Big Gin branch and immediate-return restriction stay earlier/unchanged.


KEEP14 finishing pickup: existing forced-stock/single-action guard remains first. Compute current and legal candidate deadwood once; when both are zero, take the discard to finish immediately. Otherwise use the original strictly-decreasing-help rule and existing Easy probability/normal/Sharp heuristics. No opponent hand, stock order or new RNG call is used.
