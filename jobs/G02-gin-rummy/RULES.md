# Chosen Gin rules

This is an original implementation and paraphrase, not a reproduced rulebook.
Sources P (Pagat), B (Bicycle), C (CardGames.io), W (Wikipedia), N (Neller),
R (Rubl) and O (Cool Old Games) are indexed with URLs in SOURCES.md.

## Standard game (P+B, independently also C+N)
Two active players use all 52 ordinary cards, with no jokers. Deal ten cards
alternately, starting with the non-dealer. Turn the next card up; 31 remain
in the face-down stock. Aces are low and worth one, faces ten, others their
number. A meld is a same-rank set of three/four or a same-suit consecutive
run of three or more; cards cannot belong to two melds. No high/wrapping ace.
The initial dealer is seeded-random. Subsequent dealer choice is a setting:
winner (P+B), alternating (W+N), or loser (P+R variants). A drawn hand keeps
the dealer. The non-dealer first accepts the upcard or passes. If passed,
the dealer accepts or passes. Two passes force the non-dealer to draw stock.
Later turns draw stock or the top discard, then discard one card. A card
just taken from the discard pile cannot be immediately returned to it.
After drawing, optionally knock by discarding and declaring a disjoint meld
layout with at most ten deadwood points. The core accepts a chosen layout;
otherwise it selects a deterministic exact-minimum layout. Knocking is
optional. Zero deadwood is Gin. The defender reveals and may form their own
melds and extend the knocker's runs/three-card sets with remaining cards.
Extension chains are legal. No laying onto deadwood, no laying onto the
defender by the knocker, and no layoffs against Gin or Big Gin. The default
defender action solves own melds and legal layoffs jointly and optimally.
If the defender has at most the knocker's deadwood, including a tie, they
undercut and earn the difference plus the undercut bonus. Otherwise the
knocker earns the positive difference. Gin earns its bonus plus the
defender's minimum deadwood. A stock of two after a non-knocking discard
ends a drawn hand, with no points and the same dealer. No 50th-card exception.
The first player to the target (100/150/250 setting) in hand points wins
the game (P+B). At match end add the game bonus and each player's box/line
bonus for every hand they won. Final settlement points can put the other
player ahead; they do not change who first reached the winning target (P).
Results rank that winner first, then other seats by final points, and explain
the distinction. The requested rotation uses the same first-to-target policy.

## Exposed scoring choices and Big Gin
The default Classic profile uses Gin 20, undercut 10 and boxes 20 (P+B).
North American uses 25/25/25 (C+N for Gin/undercut, C+W for boxes).
Rubl-style uses 25/20/25 (R, with these alternatives also enumerated by P).
Big Gin is enabled by default: after a draw, all eleven cards in legal melds
end the hand without a discard, no layoffs; bonus 31 (C+W). A 50-point
bonus is a documented W variant exposed as a house-rule setting.
Game bonus is 100. Shutout settings: Classic extra 100 game bonus (P+B),
double hand points (C+W), double hand points plus game bonus before boxes
(R and P variant), or none (house rule). A shutout means no opponent hand
win; drawn hands do not disqualify it in our chosen convention (see conflicts).

## Oklahoma (P+O; knock limit independently R)
The original upcard's value is the knock limit, faces ten. The ace-only-Gin
toggle changes an ace limit from one to zero. The spade-double toggle
doubles the whole hand award, including Gin/undercut/Big Gin bonuses;
box and game bonuses are not part of the hand award. Default target remains
the explicitly selected target; 150 is the commonly described Oklahoma
target (P), available in settings. Optional P extra boxes: undercut one extra,
Gin/Big Gin two extras, doubled when a spade doubles the hand; these boxes
only count after the game. Both extra-box and no-shutout alternatives are
explicit house choices, not falsely independently corroborated official facts.

## Three/four-player rotation
This job explicitly requests winner-stays rotation. It is a documented
house extension of P's three-player winner-stays/loser-deals game to four
players: two active seats, waiting queue, hand winner stays and the loser
joins the queue. The oldest waiting player enters; a draw retains both seats.
Each participant keeps hand points and boxes, target applies to any participant.
Inactive players can watch public cards but cannot see either private hand.
This is not four-player partnership Gin and never deals four simultaneous hands.

## Other observed variants (not selected editions)
P/R/W describe Gin-only, Hollywood simultaneous three-score ledgers,
partnership four-player Gin, alternative dealer conventions, initially
eleven-card non-dealer, returning the just-drawn discard in some tournament
rules, and a last discard/knock opportunity at two stock cards. W additionally
describes Mahjong Gin, Tedesco high/wrapping aces, multi-match totals and an
exactly-50-point difference reversal. These distinct editions are not the
Standard/Oklahoma job requested here. They are recorded rather than silently
mixed into it. No initial misdeal rule for knocking on the first valid turn
is adopted (P explicitly permits it; W contains a conflicting statement).

## Event/room behavior (explicit platform policy)
Optional turn clock is off by default; timers are event data. Timed-out turns
make a legal deterministic medium-bot move, without changing printed scoring.
VIP skip does the same, round-end skip deals the next hand, VIP end ends early
with current hand points and no unearned match/box bonus. Pause ignores inputs
and timers; resume shifts the deadline. Disconnections update presence while
permanent leavers' turns use a legal bot; original players always stay in results.
