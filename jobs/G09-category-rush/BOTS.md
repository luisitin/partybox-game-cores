# Bots

The exact contract names are `easy`, `normal` and `sharp`; the page labels them
Easy, Medium and Strong. Bots use the same original category examples and the
same public voting information available to people. The banks are illustrative,
so an unfamiliar human answer causes an abstention rather than an automatic veto.

Easy retrieves familiar examples from the first two available alternatives and
fills approximately 55% of prompts. Medium retrieves from the first four and
fills approximately 82%. Strong fills approximately 98%. At fewer than four
present seats it prefers the later authored half as a less-obvious-choice
heuristic. At larger tables it uses the full available bank; when the bank can
cover the table, a public seat/category/letter/round rotation separates choices.
Otherwise it samples the full bank with its seeded stream. These authored orders are not measured word
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
Measured with `npm run bots` on 2026-10-08, current core `320c99f2…`, matcher `74827b3d…` and content `5ae665bb…`, two-player games; all 4,000 games passed the gate:

| Matchup | Games | Better wins | Rival wins | Ties | Better mean | Rival mean |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Strong vs Medium | 2,000 | 1,970 (98.50%) | 11 | 19 | 10.8660 | 5.6745 |
| Medium vs Easy | 2,000 | 1,981 (99.05%) | 11 | 8 | 15.3970 | 6.3790 |

Both adjacent skills win clearly with the same public information and no private
answer or ballot access. Deterministic aggregate counts are in the JSONL artifact; the reproducible script executes each of the 4,000 actual games. That file contains two matchup summaries, not individual game transcripts.

Limit: some category/letter banks contain a single example. People may supply
any valid creative answer, but bots have finite authored vocabulary. Bank breadth
and collision frequency are explicit candidates for the KEEP GOING review.

## Round 2 authored-bank causal evidence

A separate eight-Strong-seat experiment uses seeds 1–200, one actual-core round per seed and an exact independent replay of every game. The bank-only layer retains the original bot implementation and all 200 layouts: 388 original alternatives in 32 categories raise unique awarded points from 61 to 85 (+39.34%); 21 rounds improve, 3 worsen and 176 tie. Duplicate-owner rate falls from 99.6588% to 99.5266%. This isolates vocabulary from the worker's subsequent public-seat strategy change.

Raw reports are `evidence/breadth-baseline.json` and `evidence/breadth-bank-only.json`; the paired delta and changed-bank inventory are `evidence/breadth-comparison.json`. Reproduction, exact hashes, remaining narrow-bank limits and the thirty live two-source changed-row inspections are recorded in CONTENT-VERIFY.md and SPOTCHECKS-R2.md. The deck now has 4,155 examples; 1,589 of 2,565 supported banks remain singleton. Authored ordering is illustrative, not measured rarity.

## Separate strategy causal layer

On the same 200 eight-Strong rounds and corrected bank, changing only public-roster choice raises awarded unique points from 85 to 283. Original → bank-only → final is 61 → 85 → 283, with duplicate-owner rates 99.6588% → 99.5266% → 98.4227%. Every layout and deterministic replay remains identical; final own repeats are zero. The combined report records final core hash `320c99f20ed38543d53cfe22a558b92f18f4d84735f45ed3617ca4e340d880d1`. The baseline and bank-only report use archived original core `966bb2da…`, isolating both effects.

The final mean is 1.415 points per eight-bot game (0.176875 per seat), so the 4.64× relative increase must not be mistaken for eliminating finite-bank collisions. Singleton banks remain unavoidable shared examples; humans can supply alternatives and receive honest group review. No private answer/ballot read, made-up vocabulary, response suppression or scoring change produced the gain. `npx tsx --test --test-name-pattern='bot strategies|views never|future' tests/core.test.ts` passes all three secrecy cases on this source.


## Round 4 lexical layer

The current matcher adds sourced plural equivalences while keeping the bot sampler and content unchanged. Its separately recorded `breadth-lexical.json` still awards 283 points over the same 200 eight-Strong layouts, with 200 exact replays and 98.4227% duplicated owners. Ninety-five tables score zero and 1,370 of 1,600 seats score zero. These actual baseline limits motivate a later measured crowded-table review; the lexical fix claims duplicate-scoring correctness, not bot breadth gain. The table above reflects the fresh current-matcher two-player league, while historical three-layer reports retain their original matcher.
