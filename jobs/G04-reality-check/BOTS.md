# Bot strategies and measured strength

The policy receives only its own controller projection and a seeded RNG.
It has no State parameter. Tests change live truth/authorship/other inputs
while holding that projection fixed; all skills choose the same action.

Easy estimates uniformly, chooses randomly, writes an implausible phrase
and votes among legal choices. Medium uses arithmetic range centers,
extracts public activity/year clues with 30% deliberate error, writes
two-word fakes matching the public noun pattern and prefers two-word vote choices. Strong uses
geometric centers for logarithmic ranges, exact public activity/date
clues, two-word fakes matching the realm's plant/harbour or material/
machine/defect pattern, and candidate-text plausibility. All avoid self-votes.

node league.ts: 2,000 matches per pair per mode, seeds 1–2,000, alternating
seats; 12,000 total. Ties conservatively count as no win. Approximate 95% intervals
are declared before checking the lower bound.

| Mode | Strong vs Medium | Medium vs Easy |
| --- | --- | --- |
| Quick | 1,790 wins / 210 losses / 0 ties; 89.50% [88.16, 90.84] | 1,969 wins / 31 losses / 0 ties; 98.45% [97.91, 98.99] |
| Mixed | 1,971 wins / 21 losses / 8 ties; 98.55% [98.03, 99.07] | 1,988 wins / 12 losses / 0 ties; 99.40% [99.06, 99.74] |
| Bluff | 1,987 wins / 0 losses / 13 ties; 99.35% [99.00, 99.70] | 1,992 wins / 0 losses / 8 ties; 99.60% [99.32, 99.88] |

All six lower bounds exceed 50%. league-report.json records raw results.
These high rates describe the deliberately clued fictional corpus, not
real-world trivia expertise or universal bluff intelligence. Future real
packs need their own benchmark; the local factory provides no retrieval.
