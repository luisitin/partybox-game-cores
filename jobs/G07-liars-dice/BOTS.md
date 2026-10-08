# Bot strategies and measured strength

Exact raw odds use integer counts C(n,k)·m^k·(6−m)^(n−k) out of 6^n, conditioning
only on the bot's own cup. Ones/palifico switch m between one and two. The hardest
probability function has a independently authored polynomial-convolution oracle,
with complete small-roll enumeration and 20,000 randomized differential cases.

Easy uses a mental expected-count bidding policy with modest choice variation.
Medium adds exact cup-conditioned probabilities and a fixed bidder-support cue:
a player choosing a face is evidence that their own cup may support that bid.
It also respects exact own-cup certainty: a proved-true bid cannot trigger its
low-raise-probability dudo threshold. This uses integer outcome counts.
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

The following measurements use round 2's corrected core, source SHA256
5d10032d64f7a91361e22423bc1203181bde488d16d895f2753d03911ededb18.
Actual command: node scripts/league.mjs (also tests/league.test.mjs in npm test).
1,000 fixed seeds, both seats swapped at each seed: 2,000 full games per matchup.
95% Wilson bounds and a paired-seed cluster interval are both reported because
swapped-seat games at the same seed are correlated. Both lower bounds exceed 50%.

| Matchup | Wins | Win rate | Wilson lower 95% | Paired-seed lower 95% |
| --- | --- | --- | --- | --- |
| Strong vs Medium | 1294/2000 | 64.70% | 62.58% | 62.71% |
| Medium vs Easy | 1178/2000 | 58.90% | 56.73% | 56.96% |

Every seed, seat, winner and round count is in evidence/checks/league.json.
A separate predeclared fresh holdout used salt 0x8c42f5d1: Strong 66.8%,
Medium 57.0%, 2,000 games each; evidence/checks/round-2/strategy-holdout.json.
Its 1,000 distinct paired seeds have zero overlap with the 18,000-seed superset
of recorded calibration/league/old-holdout/mixed-table exploration. Reproduce:
`node tests/strategy-holdout.mjs`. Both Wilson and paired-seed lower95 bounds
exceed 50%. Calibration notes and earlier failing pilots are retained; Easy was
not weakened. The required league's first100 pairs were used in early diagnostic
pilots, so this separate holdout supplies the clean generalization check.

Initial-core measurements (Strong 64.75%, Medium 58.75%; old holdout64.1%/59.0%)
remain under evidence/checks/initial-core/. Different fresh seed sets do not
measure an improvement over the old bot. Round 2's concrete gain is the replayed
decision correction in round-2-medium-report.json, not a claimed win-rate gain.

These results compare these implementations under the default 2-player rules;
they are not claims about humans, Nash play, CFR, or external champions. The
separate required 1,000-game matrix per count 2–8 checks multiplayer/variants,
completion, serialization and legality rather than a 50% multiplayer win target.
