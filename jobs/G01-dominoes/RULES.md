# Dominoes rules and selected variants

Source status: partnership mechanics were read in the two GitHub implementations
in SOURCES.md. Draw and individual Block details below are **from knowledge,
unverified**, under main RULES.md's web-blocked fallback. This is not a claim
that inaccessible official sources were read. Re-verification is in NEXT.md.

## Selected game

1. Use all 28 distinct unordered tiles [0|0] through [6|6]. Blanks count zero.
2. Play clockwise with 2–4 seats. Partners requires exactly four, with opposite
   seats 1/3 versus 2/4; partners cannot see one another's private hands.
3. Shuffle deterministically from the engine seed before each round. Deal
   seven tiles to each of two players, five each to three/four individuals,
   and seven each to four partners. Keep undealt tiles face down as stock.
4. First round: the highest dealt double opens. If nobody has a double, the
   largest pip total opens (stable deal-order tie break). Its owner must play
   that tile. The alternative opener setting starts seat 1 with a free tile.
5. Later rounds: the previous round's winning seat opens freely. After a tie,
   the opener rotates by round number. This exact convention is unverified.
6. Place one of your tiles on either end with touching values equal. Doubles
   are ordinary tiles, not spinners: this is always one chain, never branches.
   You must play if able. A turn ends after playing or passing, not drawing.
7. Draw: when unable to play, draw one tile at a time until you can play or
   stock reaches the reserve. The setting reserves zero (default) or two.
   A drawn playable tile must be played, but you may choose another legal tile.
8. Block: no drawing; unused stock stays face down. If unable to play, pass.
9. Emptying any hand ends the round immediately. The winner earns opponents'
   remaining pips. In partners, both partners receive the same team score.
10. A complete cycle of passes ends a blocked round. Compare individuals'
    remaining pips, or the combined hands of each partnership. Lowest wins;
    equal lowest totals is a tie and scores zero, including multiway ties.
11. Default individual blocked scoring: sum opponents' pips minus the winning
    hand's pips, floored at zero. Opponents-only is a selectable house rule.
12. Partnership scoring can count opponents only (default) or all remaining
    hands. All-remaining matches abw333's documented Puerto Rican variation.
    A blocked partnership tie awards nothing in either scoring variant.
13. Add round points to the match total; first side at or above 100, 150 or
    250 ends the match. Equal top totals on a host-ended game are joint winners.
14. A host may pause/resume/end. Skip and a live turn timeout play the first
    legal action, so an idle or disconnected seat cannot trap the game. Inputs
    while paused and stale/early timers are ignored. The next-round phase also
    has a timer. End reports every original seat, including disconnected ones.
15. The local hot-seat page conceals each human hand until that seat reveals
    it. Bots never receive others' hand contents or the stock order.

## Variants surveyed / deferred

- Highest double versus selected/rotating opener: setting; future-round opener
  disagreements need official-source re-verification.
- Draw-to-play versus one-draw-and-pass: draw-to-play selected; one-draw variant
  from knowledge, unverified, not implemented because its legality differs.
- Last-two-stock reserve: setting; zero is default, both unverified.
- Partnership all-remaining versus opponents-only pips: setting; abw333 uses
  all-remaining. DominAI uses an imperfect-information partnership model.
- Individual blocked net versus gross opponents: setting, unverified.
- Lowest *individual* hand deciding a blocked partnership: from knowledge,
  unverified, not selected; this game compares combined team hands.
- All Fives/Muggins, spinners, Mexican Train and double-nine sets: different
  games, not selected. No automatic multiples-of-five scoring is implied.

No official-rule quotation, logo, external art or assets are shipped.
