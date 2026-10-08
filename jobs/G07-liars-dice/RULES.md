# Liar's Dice / Perudo rules

Sources use the IDs in SOURCES.md. These are paraphrased complete rules for the
selected edition, with the observed alternatives listed below.

## Setup and objective
Two to eight players each start with five independent fair six-sided dice in a
private cup. Seven/eight players are the owner's extension to the publisher's
2–6-player set (Z/P). Counts of remaining dice are public, rolled values private
(Z/T; B offers visible counts). The core picks the first starter uniformly from
its supplied seeded RNG. Play clockwise, skipping eliminated players. Be the
last player with dice. Leaving seats are controlled automatically, a digital
room policy separate from the printed game (ASSUMPTIONS.md).

## A round and a bid
Everyone rolls their remaining dice and looks only in their own cup. The starter
claims a positive quantity of a face among **all** dice, such as four threes.
The claim means **at least** that many (Z/B/T). Default wild ones count as every
face 2–6, but a bid on ones counts only actual ones once. Wild rounds cannot
open on ones. With wild ones disabled, opening on any face is legal (T).
On your turn either raise or say dudo to challenge the immediately previous bid.
An ordinary face raise keeps quantity and increases face, or increases quantity
and may use any face. With wild ones enabled, switching to ones requires at
least the previous quantity divided by two, rounded up. Leaving ones requires
at least twice the ones quantity plus one. A ones-to-ones raise increases its
quantity. These thresholds apply even if the face decreases (Z/B).

## Dudo and the next round
All cups are revealed and matching faces (plus eligible wild ones) are counted.
If there are at least the bid quantity, the challenger loses one die; otherwise
the bidder loses one. Equality makes the bid true, not a successful challenge.
Zero dice eliminates that player. The loser starts the next round; if eliminated,
the next surviving player clockwise starts. Everyone rerolls privately. When
one survivor remains they win (Z/B/T). Reveals remain until acknowledged; no
hidden short reading timer advances the screen.

## Palifico
The first time a player falls from two dice to one, they start the next round as
palifico, once per player per game. With only two survivors there is no palifico
(Z/P). In this round ones are ordinary and the opening bid may name ones.
Default **strict** palifico locks the face for the whole round: only quantity
can increase (B/T). Settings can instead allow an already experienced player
with one die to change face (P), or any already experienced player to do so (Z),
including one who regained a die. The current first-time starter has no prior
experience for their own round. Normal wild rules return the following round.
A setting can disable palifico; disabling wild ones does not disable face lock.

## Optional calza
Calza means the bid is **exactly** correct. Disabled by default. When enabled,
any surviving player except the bidder may call it, even out of turn. A correct
caller recovers one die, at most five; an incorrect caller loses one. The caller
starts the next round, or the next survivor if eliminated (Z/B). This selected
profile disallows calza during palifico and in a two-player endgame (P/T/G).
The interrupt-only option additionally excludes the player whose turn is next
(P). A caller already at five dice can still call and receive no extra die.
The profile and its edition differences are explicit in CONFLICTS.md.

## Optional digital settings
Ones wild, palifico enablement, palifico exemptions, calza enablement and caller
policy, and a visible 0–120-second turn clock are lobby settings. Zero disables
the clock. A live expired turn automatically makes a legal opening bid or dudo;
clock time comes from host events. VIP pause freezes inputs and shifts a visible
deadline on resume; skip advances play, end produces finite results for everyone.
Private cups stay covered during hot-seat handoff. There are no network calls.

## Every observed alternative
Printed editions choose first starter by highest initial die with rerolled ties
(P) or randomly (Z; chosen). Some hide lost dice/counts in a bag (P/B; visible
counts chosen). Wild ones may be disabled (T; setting). Strict, one-die experienced,
and any-experienced palifico are all supported as described. Calza caller rules,
duel/palifico exclusions and rewards differ; U's spot-on removes other players'
dice, not the chosen recover-one rule. W records calzo with one/two die gains or
losses, obliga/palofijo at one or two dice with open or closed visibility,
palociego blind bidding, special-hand passing, burning dice and push/reroll.
Those folk alternatives were observed and are not selected: they change the
information model or elimination rules and are not asserted official Perudo.
No previously unseen variant is silently attributed to these sources.

D also offers 1–7 starting dice, double-only exits from ones, calza during
palifico and bidder-start after an eliminated calza caller. These were observed
and rejected in favor of five dice and the selected corroborated Perudo profile.
Its conflicting trigger wording is not used. CONFLICTS.md records these picks.
