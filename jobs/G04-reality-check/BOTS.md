# Bot strategies and measured strength

The policy receives only its own controller projection and a seeded RNG.
It has no State parameter. Tests change live truth/authorship/other inputs
while holding that projection fixed; all skills choose the same action.

Easy estimates uniformly, chooses randomly, writes an implausible phrase
and votes among legal choices. Medium uses arithmetic range centers,
extracts public activity/year clues with 30% deliberate error, writes
longer generic fakes and prefers two-word vote choices. Strong uses
geometric centers for logarithmic ranges, exact public activity/date
clues, two-word fakes matching the realm's plant/harbour or material/
machine/defect pattern, and candidate-text plausibility. All avoid self-votes.

node league.ts: 2,000 matches per pair per mode, seeds 1–2,000, alternating
seats; 12,000 total. Ties conservatively count as no win. Approximate 95% intervals
are declared before checking the lower bound.

| Mode | Strong vs Medium | Medium vs Easy |
| --- | --- | --- |
| Quick | 1,790 wins / 210 losses / 0 ties; 89.50% [88.16, 90.84] | 1,969 / 31 / 0; 98.45% [97.91, 98.99] |
| Mixed | 1,981 / 14 / 5; 99.05% [98.62, 99.48] | 1,984 / 16 / 0; 99.20% [98.81, 99.59] |
| Bluff | 1,992 / 0 / 8; 99.60% [99.32, 99.88] | 1,992 / 0 / 8; 99.60% [99.32, 99.88] |

All six lower bounds exceed 50%. league-report.json records raw results.
These high rates describe the deliberately clued fictional corpus, not
real-world trivia expertise or universal bluff intelligence. Future real
packs need their own benchmark; the local factory provides no retrieval.
