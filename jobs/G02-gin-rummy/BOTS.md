# Bots and actual league

Easy preserves complete melds, sheds high loose cards with some loose-card
variation, accepts 70% of immediately useful upcards and knocks when legal.
Medium minimizes exact post-discard deadwood and takes useful upcards.
Strong additionally values partial melds and avoids dangerous cards related
to public opponent pickups. None reads hidden cards, stock order or engine RNG.
Contract easy/normal/sharp map to easy/medium/strong.

Actual `node scripts/league.mjs`: 2,000 complete matches per pairing, paired
deal seeds 70000–70999, seats swapped, first-to-target game winners (not the final settlement leader).

| Pair | Wins | Losses | Win rate | 95% Wilson lower bound |
|---|---:|---:|---:|---:|
| sharp vs normal | 1152 | 848 | 57.60% | 55.42% |
| normal vs easy | 1743 | 257 | 87.15% | 85.61% |

Both gates require >=55% wins and a Wilson lower bound above 50%. Actual
results: evidence/bot-league.json. Earlier random-easy results are retained
as history, not the delivered strategy. No external champion strength claimed.

Round5 corrects the league to count GameResults.winnerIds. One sharp/normal
match had a different final-settlement leader; actual new wins1152/2000.
Medium/easy remains1743/2000. Earlier final-point-counting results stay in
bot-league-settlement-baseline.json and previous verification history.
