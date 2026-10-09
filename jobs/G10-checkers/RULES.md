# Checkers rules and digital policies

Live research checked 2026-10-08 UTC. Original paraphrase, not a copied
federation document. Source IDs refer to SOURCES.md. This initial research
checkpoint does not claim implementation or verification is finished.

## American checkers: WCDF / English rules

Two opponents use 32 dark squares of an 8×8 board, with 12 men each in
their nearest three rows. Red/dark moves first; turns alternate. A player
wins if the opponent has no legal move, from capture or blocking, or
resigns. [A1, A2, A3]

A man moves one square diagonally forward into an empty square. It
captures only forward, jumping an adjacent enemy man or king into the
empty square immediately beyond. A king moves one square diagonally
forward or backward and captures by the same short jump in either
direction. No piece can jump its own pieces. [A1, A2, A3]

Any available capture anywhere on the board makes captures compulsory.
The selected piece must finish all jumps possible along its chosen route.
If several complete routes exist, any may be chosen: taking the most
pieces is not compulsory. No enemy may be jumped twice. [A1, A2, A3]

A man reaching the far row becomes a king and ends its turn, even when
the move was a jump. It cannot continue as a king until its next turn.
[A1, A2, A3]

Official draw grounds are mutual agreement, the third occurrence of the
same position with the same side to move, and 40 moves by each player
without a capture or an uncrowned man advancing. Forty moves each means
80 half-moves. Any man move or capture resets the quiet counter. WCDF's
referee-claim wording lets a player demonstrate that their next move
would produce the third occurrence; digital play automatically ends on
the accepted move producing that occurrence. [A1, A2, A3]

## International draughts: FMJD 2024

Two opponents use 50 dark squares of a 10×10 board, with 20 men each in
their nearest four rows. White/light moves first. Men move one diagonal
square forward, but may capture forwards or backwards. Kings move any
unobstructed distance along a diagonal. [I1, I2, I3]

Captures are compulsory. A man jumps an adjacent enemy into the empty
square immediately beyond. A flying king reaches the first enemy on a
diagonal and may land on any empty square beyond it before the next
obstruction. Each jump crosses exactly one enemy. [I1, I2, I3]

Every complete capture route across every piece must be considered. Only
routes taking the greatest number of pieces are legal. A king has no
priority over a man; each captured king still counts as one. Equal
maximum routes may be chosen freely. [I1, I2, I3]

Taken enemies remain on their squares as blockers until the sequence
finishes and cannot be jumped again. The moving piece may revisit an
empty square. A man stays uncrowned throughout a capture sequence even
after visiting the far row, and promotes only if it ends there.
[I1, I2, I3]

Official draw grounds follow. A final allowed move that leaves the
opponent without pieces or without a legal move wins before a draw is
applied. [I1, I3, I4]

- Third occurrence of the same board and side to move.
- Twenty-five moves by each player with only king moves and no captures:
  50 half-moves. A capture or man move resets this ordinary quiet counter.
- One king against three pieces including at least one king: at most
  16 additional moves each. A capture does not cancel this allowance.
- In that ending, if the lone king is the sole piece occupying the long
  diagonal, at most five additional moves each. This 2024 clause is
  missing from the older standalone Annex and lidraughts summary. [I1, I4]
- One king against one king, two kings, or a king and a man: at most five
  additional moves each.
- Mutual agreement.

The long diagonal runs through official squares 5 and 46. With the
agreed internal orientation (top row dark columns 1,3,5,7,9), its squares
have row+column=9. "Sole occupation" means the lone king is the only
piece on that diagonal, not merely that it is somewhere on it.

The accepted move creating an ending is followed by the additional
allowance; it is not already its first counted move. Ordinary man moves
and promotions do not restart an active material allowance. Maintain
earlier allowances when a capture creates a shorter ending: after 13
moves each in a 16-move ending, a new five-move allowance cannot extend
the original remaining three. [I1, I5, I6]

The 2024 text does not specify a restart on leaving/re-entering the long
diagonal. The intended digital interpretation preserves the allowance
once activated; that ambiguity is an explicit assumption in CONFLICTS.md.
All counters are game history and must survive save/load intact.

## Selected settings and digital adaptation

Variant: `american` or `international`. Draw policy: `official` (default)
or `fortyMove`. Official follows the selected federation above.
`fortyMove` applies the American 40-moves-each progress rule on either
board; on International this is a labeled house rule replacing its
25/16/5 limits. Threefold repetition is enabled by default. Display
selected rules before play.

The standard game has exactly two playing seats. Invalid paths do
nothing; a submitted move is one complete legal turn, including every
required jump. A multi-jump counts once for draw counters. Physical
touch-move, manually pressed clocks, penalties for misplaced physical
pieces, and referee claims are replaced by validated digital actions.

## Other observed variants and formats

These are scope disclosures, not hidden defaults. Any implemented house
variant must have a setting and checks.

- Historical huffing removes a piece that declined a jump; current
  compulsory American captures replace it. [A3, C1]
- Continuing an American jump immediately as a new king is a house
  variant that conflicts with selected WCDF rules. [A3]
- Go-as-you-please, two-/three-move balloted openings, and 11-man ballots
  are competition/opening formats. Base play uses the ordinary setup.
  [A1, A3, A4]
- Historical 50-move/fourfold descriptions conflict with current WCDF
  40-each/threefold. [A1, C1]
- FlyOrDie's extra 150-moves-each cap and material draw claims are
  platform additions, not imported official rules. [A1, A2]
- FMJD lists simultaneous, correspondence, blindfold, accessible-board,
  and material-handicap formats; these do not change the selected moves.
  [I1, I2]
- Scan also supports breakthrough (first king wins), killer, giveaway,
  and Frisian. Their separate databases do not certify standard
  International movement. [D5, D6]
