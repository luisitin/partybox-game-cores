# Sources and provenance

Rules/strategy references below were actually read from live GitHub endpoints on
2026-10-08. They are mechanics/strategy references;none of their code,models,
weights,images,logos,sounds or third-party datasets are copied.
Code and original CSS/SVG use this repository's MIT licence.

1. [Pagat mirror](https://github.com/mondary/PKcards/blob/b5147daa70a1a1a41b18549b80e51dbc035098ba/assets/rules/rules_pagat/spades.md).
   Read basic rules,scoring,blind nil/exchange,all listed variants and the
   three-player section. The original pagat.com URL was not read directly.
   Standard rank/trump/follow-suit,13 cards,contract±10,overtrick+1,
   ordinary nil±100,blind nil±200,100-point eligibility gap,2-card sequential
   partner exchange,failed-nil exclusion,10 bags−100/carry,target500.
   Three-player variant deals17 with one undealt card;clubs first lead.
   Negative−500 termination and other alternatives are documented there.
2. [Hughes README](https://github.com/hughes-research/spades/blob/f17221a3ea0d1eb7fb5dd3366fbd48bc0b6b8725/README.md).
   Independent implementation explicitly corroborates target500,13 cards,
   contract±10,overtrick+1,nil±100,blind nil±200,and10 bags−100. It cites
   Bicycle;that citation does not mean Bicycle was read directly here.
3. [Elixir scoring](https://github.com/mreishus/spades/blob/095d840ba0084ed3bac57354286eb422b183d108/backend/lib/spades_game/game_score_round_team.ex)
   and [tests](https://github.com/mreishus/spades/blob/095d840ba0084ed3bac57354286eb422b183d108/backend/test/spades_game/game_score_round_team_test.exs).
   Independent nil±100,contract±10,+1 bags,10-bag−100 with carried remainder.
   Failed-nil tricks contribute to partner's contract here:recorded conflict.
   [Game](https://github.com/mreishus/spades/blob/095d840ba0084ed3bac57354286eb422b183d108/backend/lib/spades_game/game.ex)
   corroborates original-lead follow-suit and all-spades leading exception.
   [Bidding AI](https://github.com/mreishus/spades/blob/095d840ba0084ed3bac57354286eb422b183d108/backend/lib/spades_game/ai/game_ai_bid.ex)
   supplies strategy research:honours,trump length,partner-contract safety
   and cautious nil conditions. Algorithms here will be independently written.
4. [Python manager](https://github.com/Metamess/Spades/blob/c15b7afad5f72e3cb8e04ad6e4da1ef61e4ba9f2/game_manager.py)
   and [score](https://github.com/Metamess/Spades/blob/c15b7afad5f72e3cb8e04ad6e4da1ef61e4ba9f2/score.py).
   Corroborates2-card sequential exchange,follow-suit,unbroken-spade exception,
   100-point blind gap,target500 and−500 termination. Uses nil50/blind100
   and separate nil partner scoring;these are alternatives,not our standard.
5. [Three-player overview](https://github.com/happybigmtn/myosu/blob/6540709a5ce619032a80fc4e4f59aa8ef342ffe3/research/game-rules/14-spades.md).
   Explicitly removes2C,deals17 and scores individually with accumulated
   bags. Provenance is unspecified;we treat it as a documented alternative,
   not an official authority or independent verification of Pagat.
6. [Gleam house rules](https://github.com/rawhat/spades/blob/2fbf4ac73d02f37ee18707e515334af6d48333eb/src/spades/game/hand.gleam).
   Nil50/blind100 independently corroborate that selectable bonus variant.
   Its5/10-bag penalties disagree with JOBS and are excluded.
7. [Blind lifecycle](https://github.com/lukiffer/SpadesBot/blob/ba21f5b4f70679068cfaf2d2683bbe2905c27d32/README.md).
   Before-look endpoint omits hand;after-look bidding refuses a late blind
   declaration. Used for privacy/lifecycle design,not copied implementation.
8. [Two-stage AI research](https://github.com/loddyluo/Spades-AI/blob/dad89d5190b0fcd1bc29dd99e11d01d7c092edca/README.md).
   Public inference plus sampled late play as strategy research. Its immediate
   −9 overtrick penalty and nil50 are excluded from the standard preset.
   Its published strength claims do not apply to our independently written bots.
9. [Older Python README](https://github.com/ReillyBova/spades/blob/6c30541f1130b52346891d6f75132c060b468ffd/README.md).
   Observed7-bag penalty,unusual nil condition and erroneous winning-suit
   wording. Rejected in favour of corroborated original-lead/10-bag rules.
10. [Product variant](https://github.com/Antonelli-Tech-Solutions/spades/blob/aa8d0b4d265f624cb00882a22736d6240738f9d8/docs/spades_prd.md)
    changes team-declared targets and nil contributions;not chosen wholesale.
11. [Cutthroat LITE](https://github.com/leroy9472/MeepleLM/blob/3fd760258b4d35cc28737c5e6d6bc467d3642cc1/data/rulebooks/part_2/3/592.md)
    is a30-card/125-point variant;excluded from this job's500-point preset.

Facts with independent corroboration are identified above. The three-player
club-removal and dealer-left default are explicit selected house choices;
Pagat's one-card stock/lowest-club alternatives are also selectable.
No remembered facts are represented as live quotations. Direct-original
source availability and the overview's provenance remain re-verification
points in NEXT. The binding403 fallback has removed the old research blocker.

Runtime dependency:[Zod4.6.5](https://www.npmjs.com/package/zod/v/4.6.5),
the sole allowed dependency,from the pinned installed npm package. Its
full MIT notice (`node_modules/zod/LICENSE`,copyright2025 Colin McDonnell)
is delivered as THIRD-PARTY-LICENSES.txt and retained in the standalone
script comment. Build checks compare installed/committed/embedded notices.
This licensed runtime bundle is separate from the rules/strategy references.
