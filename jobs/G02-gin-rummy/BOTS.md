# Bots and current verified league

Easy preserves complete melds, sheds high loose cards with some variation,
accepts70% of immediately useful upcards, and knocks when legal.
Medium minimizes exact post-discard deadwood and takes useful upcards.
Strong also values partial melds and public opponent pickup signals.
All skills prefer legal Gin; an already-zero hand takes a legal pickup that
preserves zero and ends the hand. Enabled Big Gin takes priority.
Contract easy/normal/sharp mean easy/medium/strong.

Strong's ordinary finishing choices may lower positive own deadwood when
every exact live candidate layoff target is a subset of the currently chosen
targets. Permanently closed groups use own cards and public discards only.
Targets update after EACH promotion. Forbidden returns and incomparable
layouts retain their existing policy. No hidden hand, stock order or engine
RNG is consulted; these finishing promotions are confined to discard phase.

Current original node scripts/league.mjs result, accepted2e949 full hosted
run37907166446/verify113743302361:2000 complete matches per pairing,
paired seeds70000–70999 with seats swapped. Winners use GameResults.winnerIds
and the first-to-target hand score, rather than the final settlement leader.

| Pair | Wins | Losses | Win rate | 95% Wilson lower bound |
|---|---:|---:|---:|---:|
| sharp vs normal | 1166 | 834 | 58.30% | 56.1252% |
| normal vs easy | 1743 | 257 | 87.15% | 85.6118% |

Both original gates require >=55% wins and a Wilson lower bound above50%.
Full unchanged native and exact league records:
[evidence](evidence/audit-20261009/accepted-2e949/full-original-artifact-reader-CLOSED.json).
This finite internal comparison establishes neither external champion
strength nor that every future population has the same win rate.

The same finite pairings previously yielded Strong1152 and then1154 wins.
Those numbers and all earlier narratives are retained byte-identically in
[evidence](evidence/audit-20261009/bot-report-current/BOTS-before-KEEP20.txt).
Recent subset/closed/public-discard examples prove bounded tactical gains;
unchanged1166 results for those repairs are not a population improvement claim.

KEEP19's576 paired identical public views expose the hidden-stock tradeoff:
classic stock Gin25 vs visible pickup4; stock miss-10 vs that same pickup4.
No draw option universally dominates, and no expected-value optimum is claimed.
[Draw evidence](evidence/audit-20261009/KEEP-7-DRAW-BOUNDARY.md) retains the real
compiled phase-guard mutation killed by the public-information regression.

KEEP19–21 add controls and clarify reports/navigation without changing
production. No player-noticeable gain in three consecutive rounds. Final
exact-head full original hosted acceptance is required before PR12 Ready.
