# Selected Spades rules

Four players form opposite-seat partnerships;three-player Cutthroat has
one side per player. Spades always trump. Within a suit A>K>Q>J>10>…>2.
No jokers. First dealer is seeded;deal and bidder order rotate clockwise.
Four players get13 cards each. Cutthroat gets17:defaultremove2C;optional
shuffle52 and leave one unseen stock card,as in the Pagat variant.

Bid in order from dealer's left. A normal bid promises1–13(or17) tricks.
Zero is a separate Nil declaration. Both partners' normal bids combine;
Nil is scored separately. Public bids are locked once declared.

Blind Nil must be declared before seeing one's hand. Defaulteligibility:
side at least100 behind the highest other side;optionalgap0. Choosing
Look permanently prevents a late blind bid. A locked blind bidder can
then see their cards. Bonuses defaultNil100/BlindNil200;optional50/100.

Defaultpartnership Blind Nil permits a two-card sequential exchange:
blind bidder sends2 distinct held cards;partner receives them,then returns
2 held cards(which may include received cards). With two blind partners,
first in bid order sends first. Each affected pair exchanges once;everyone
finishes with13 cards. No exchange in Cutthroat;settingcan disable it.

Dealer's left leads the first trick by default. Cutthroat can instead force
its lowest in-play club(2C or3C) as first lead. Must follow the ORIGINAL
lead suit if held,even if a spade is already winning. If void,play any card.
Cannot lead a spade until broken by a played spade,except with only spades
left. Highest spade wins;otherwise highest card of lead suit. Winner leads.

After13(or17) tricks,each side scores its normal contract:made→10×bid,
failed→−10×bid. Overtricks add1 point and1 bag each. Every10 cumulative
bags subtract100;carry the remainder;more than one penalty is possible.
Nil/BlindNil wins its bonus for zero tricks,otherwise loses that bonus.
Defaultfailed-nil tricks do not rescue partner's bid,but do count as bags;
optionalcontribution setting matches the Elixir variant. Both-nil sides
score each Nil separately and any won tricks as bags.

Target500. If any side reaches it,highest score wins;an equal lead continues.
Defaultmercyalso ends after a side falls to−500,provided the lead is unique;
it can be disabled. Scores on partners' result seats match their side's score.
Host may pause,resume,skip a decision with a legal default,or end explicitly.
A host end leaves a partial hand unscored. Disconnected seats retain hands
and results;hostskip can act for them. No arbitrary match-length cap.

This long classic card match uses the contract's unlimitedDuration mode:
interactive decisions can wait;active bots must finish under extended
simulation,while idle play remains available until VIP end. Catalog estimate
is60 minutes,not a promise that a500-point game ends on a clock. Trick/review
readability deadlines are data only;there are no game-logic timers or I/O.
Completed tricks hold8s;score ledgers hold60s for partners/90s for three
individuals. Bots wait for those engine timers. Human Next/VIP skip remains
an explicit readiness control;pauses shift the displayed deadline.
