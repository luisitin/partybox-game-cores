# Bot strategies and measured strength

Exact raw odds use integer counts C(n,k)·m^k·(6−m)^(n−k) out of 6^n, conditioning
only on the bot's own cup. Ones/palifico switch m between one and two. The hardest
probability function has a independently authored polynomial-convolution oracle,
with complete small-roll enumeration and 20,000 randomized differential cases.

Easy uses a mental expected-count bidding policy with modest choice variation.
Medium adds exact cup-conditioned probabilities and a fixed bidder-support cue:
a player choosing a face is evidence that their own cup may support that bid.
Strong enumerates possible matching counts in the bidder's cup, weights them by
an explicit support likelihood, learns truth/bluff tendencies only after full
public reveals, evaluates same-face raises against that modeled signal, compares
challenge and raise survival, and mixes credible bids with occasional bluffs.
All skills obey the same legal moves. No skill reads an opponent's private dice
or the state's future random stream. The adaptive model is a heuristic; it does
not change the exact IID raw probability and is not an exact Bayesian posterior.

Contract skills easy/normal/sharp correspond to Easy/Medium/Strong. Eligible bots
can interrupt with calza out of turn, including interrupt-only settings. Reveals
are acknowledged through the actual continue input, not by skipping the core.

## Required paired leagues
Actual command: node scripts/league.mjs (also tests/league.test.mjs in npm test).
1,000 fixed seeds, both seats swapped at each seed: 2,000 full games per matchup.
95% Wilson bounds and a paired-seed cluster interval are both reported because
swapped-seat games at the same seed are correlated. Both lower bounds exceed 50%.

| Matchup | Wins | Win rate | Wilson lower 95% | Paired-seed lower 95% |
| --- | --- | --- | --- | --- |
| Strong vs Medium | 1295/2000 | 64.75% | 62.63% | 62.76% |
| Medium vs Easy | 1175/2000 | 58.75% | 56.58% | 56.80% |

Every seed, seat, winner and round count is in evidence/checks/league.json.
A separate untouched exploration holdout used salt 0x7b3196e2: Strong 64.1%,
Medium 59.0%, 2,000 games each; evidence/checks/strategy-holdout.json. Calibration
notes and earlier failing pilots are retained; Easy was not weakened for the
comparison. The required league's first 100 pairs were used in early diagnostic
pilots, so the separate holdout is the clean generalization check.

These results compare these implementations under the default 2-player rules;
they are not claims about humans, Nash play, CFR, or external champions. The
separate required 1,000-game matrix per count 2–8 checks multiplayer/variants,
completion, serialization and legality rather than a 50% multiplayer win target.
