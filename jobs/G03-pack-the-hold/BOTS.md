# Bot strategy and measured strength

Every skill enumerates legal orientations/translations and uses the exact
weighted solver on the public level. It never reads the core's private optimum
or witness. Then independent subset selection maximizes value without exceeding
the required target. Seeded shuffling breaks equally good subset ties.

Generated premium values 120/40/30/10 make exact targets attainable: 120, 160,
190 out of optimum 200. Easy takes 120; medium takes 120+40; strong takes
120+40+30. All use a valid packing discovered by search, not stored generator
anchors. This deliberate handicap implements the job's explicit percentages;
it is not a claim that three different search engines have those human rates.

Contract names map easy / normal / sharp to easy / medium / strong in the page.
Tests poison the stored solution/optimum and require identical bot inputs.

`node --test tests/contract.test.mjs` ran two leagues with 2,000 games each,
seeds 0–1999, both seat orders, all ten difficulties, both mirror settings and
1–3 rounds:

| League | Games | Stronger wins | Ties | Win rate |
| --- | ---: | ---: | ---: | ---: |
| Strong vs medium | 2,000 | 2,000 | 0 | 100% |
| Medium vs easy | 2,000 | 2,000 | 0 | 100% |

The full suite also runs 1,000 bot games at every player count 2–8 and verifies
each bot's round ratio, schema-valid moves, termination and complete results.
