# Selected Hearts rules

American Standard Hearts (Black Lady):3–6 seats, clockwise deal/play, no
partnerships or trump. Ace is high and2 low. Lowest cumulative penalty wins.
Sources/decisions are in SOURCES.md/CONFLICTS.md; research is not yet complete.

## Deck and passing

| Seats | Cards removed | Cards per player | Passing cycle |
| --- | --- | ---: | --- |
|3|2♦ by default;2♣ option|17|left,right,hold|
|4|none|13|left,right,across,hold|
|5|2♣,2♦|10|left,right,second-left,second-right,hold|
|6|2♣,3♣,2♦,2♠|8|left,right,opposite,hold|

Shuffle with the supplied seed; deal equally, one card at a time. On passing
hands everyone selects3 distinct owned cards before anyone receives incoming
cards. Reveal no opponent hand or private pass. A no-pass setting holds every
hand. The holder of the lowest club remaining in the deck must lead that card.

## Tricks

Follow the led suit whenever possible. The highest card in that suit takes
the trick; off-suit cards never win. The winner leads the next trick. Hearts
cannot be led until an actual heart has appeared, unless only hearts remain.
The Q♠-breaks variant is explicit. On the first trick, avoid hearts/Q♠ when
a non-penalty card can be played; an all-penalty hand still has a legal move.

## Score and end

Each heart scores+1; Q♠ scores+13. Taking all13 hearts andQ♠ shoots the moon.
Choose before play: the shooter gets0 and opponents+26, or shooter−26 and
opponents0. In the J♦ variant its actual taker gets−10 independently, even
when someone else shoots the moon. It is not required for a moon.
After each hand add scores; at100 or more (default) stop, lowest wins; equal
lowest scores share first place. No score is hidden after a completed hand.

## Other variants read, not selected

The Pagat transcription describes kitty capture or add/discard, alternate
passing cycles (scatter/mix/partner), optional passes, unrestricted heart
leads, dealer-left opening, forced safe Q♠ discard, hearts allowed with only
Q♠ remaining, Ten of Diamonds bonus, sun/all-tricks bonus, automatic moon
choice, exact100 reset and tied-score extra hands. It also describes partnership
Hearts (pooled or individual moon qualification), two-player/dummy variants,
Turbo Hearts (doubled/quadrupled exposed cards), Booster Nines (extra trick
round), Cancellation (two decks and matching cards cancel), Spot Hearts (pip
penalties), Black Maria (extra spade penalties), and the four-queen Florida
variant (higher penalties, dealer-chosen passes and instant-win moon).
These are separate research editions; G05 selects Standard Hearts and the
requested Omnibus scoring. Names of other linked games were not researched.
OpenSpiel also exposes no-first-trick restriction, any-club opening,−5 for
no tricks, unrestricted hearts, and leading hearts instead of loneQ♠; defaults
are compared in CONFLICTS.md. Older Wikipedia chip scoring, Auction, stock
Draw Hearts, Heartsette/widow and queen-heavy French variants are historical
relatives, not the selected game.
