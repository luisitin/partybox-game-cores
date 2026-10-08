# Bots

The exact contract names are `easy`, `normal` and `sharp`; the page labels them
Easy, Medium and Strong. Bots use the same original category examples and the
same public voting information available to people. The banks are illustrative,
so an unfamiliar human answer causes an abstention rather than an automatic veto.

Easy retrieves familiar examples from the first two available alternatives and
fills approximately 55% of prompts. Medium retrieves from the first four and
fills approximately 82%. Strong fills approximately 98%, prefers the later half
of a bank as a heuristic for less obvious choices, and diversifies its pick with
the seat, category and round letter. These authored orders are not measured word
frequencies. All skills avoid reusing an equivalent answer within their sheet.
Their strategy balances retrieving a plausible example against colliding with
another player's obvious choice. The fill rates model different retrieval speed
and vocabulary coverage under the same writing clock.

During review, bots accept a structurally eligible known example, reject a wrong
initial and abstain on creative alternatives. They do not know private later
answers or other players' ballots. A dedicated view-difference and bot-input
regression test ensures that a future self-repeat cannot influence a public
review flag or bot vote.

`npm run bots` plays 2,000 deterministic three-round duels for Strong versus
Medium and another 2,000 for Medium versus Easy, alternating seats. It records
wins, losses, ties and mean scores in `evidence/bot-matchups.jsonl` and fails if
the better skill wins fewer than 60% of all games or fewer games than its rival.
Measured with `npm run bots` on 2026-10-08; all 4,000 games passed the gate:

| Matchup | Games | Better wins | Rival wins | Ties | Better mean | Rival mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Strong vs Medium | 2,000 | 1,970 (98.50%) | 10 | 20 | 9.9970 | 4.8465 |
| Medium vs Easy | 2,000 | 1,981 (99.05%) | 12 | 7 | 14.9225 | 5.9485 |

Both adjacent skills win clearly with the same public information and no private
answer or ballot access. Raw deterministic counts are in the JSONL artifact.

Limit: some category/letter banks contain a single example. People may supply
any valid creative answer, but bots have finite authored vocabulary. Bank breadth
and collision frequency are explicit candidates for the KEEP GOING review.
