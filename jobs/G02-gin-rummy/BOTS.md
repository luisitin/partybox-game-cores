# Bots and actual league

Easy preserves complete melds, sheds high loose cards with some loose-card
variation, accepts 70% of immediately useful upcards and knocks when legal.
Medium minimizes exact post-discard deadwood and takes useful upcards.
Strong additionally values partial melds and avoids dangerous cards related
to public opponent pickups. None reads hidden cards, stock order or engine RNG.
Contract easy/normal/sharp map to easy/medium/strong.

Actual `node scripts/league.mjs`: 2,000 complete matches per pairing, paired
deal seeds 70000–70999, seats swapped, final scores including match/box bonuses.

| Pair | Wins | Losses | Win rate | 95% Wilson lower bound |
|---|---:|---:|---:|---:|
| sharp vs normal | 1151 | 849 | 57.55% | 55.37% |
| normal vs easy | 1743 | 257 | 87.15% | 85.61% |

Both gates require >=55% wins and a Wilson lower bound above 50%. Actual
results: evidence/bot-league.json. Earlier random-easy results are retained
as history, not the delivered strategy. No external champion strength claimed.
