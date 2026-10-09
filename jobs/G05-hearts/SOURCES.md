# Sources and provenance

Facts are paraphrased; no source art or implementation is included. Every
retrieval is pinned and recorded in research-access.json. Canonical sites that
returned403 are explicitly unread. Mirrors retain their original source family.

Licence index for delivered files:

| Delivered material | Licence/provenance |
|---|---|
| Original core, UI, fixtures and captures | MIT; written/rendered for this job |
| Bundled zod | MIT notice embedded in play.html |
| Rule/AI research | Facts paraphrased; no source implementation or art copied |
| Hosted browser reports | Exact output of this job's public CI |

Independent rules sources read:

- Pagat's American Hearts/variants, via the pinned PKcards transcription:
  https://github.com/mondary/PKcards/blob/b5147daa70a1a1a41b18549b80e51dbc035098ba/assets/rules/rules_pagat/hearts.md
  Dealer/play order, follow suit, points, moon alternatives, Omnibus/J♦,
  3/5-player cuts and passing alternatives. Canonical Pagat was unavailable.
- Nathan Long's rulebook:
  https://github.com/nathanlong/rules/blob/27d4ebb7557eae7c04fb3fa608182d80e0f71593/content/games/hearts.md
  Independently written standard rules; forced opening, first-trick exception,
  heart-leading restriction,26 points,100-point finish,3-player2♦ removal.
- Cached Cards rulebook:
  https://github.com/itsamenathan/cached-cards/blob/5d179358773dac23ba5eedf7ea0b993207633fb2/rules/hearts.md
  3–6 roster, standard mechanics,3-player2♣ alternative,5-player cuts and J♦.
- OpenSourceSports rulebook:
  https://github.com/DigiLogicLabs/OpenSourceSports/blob/63e762d95e6f2a5609f920c8447ac354d9ced0e4/Custom/Casual/card-games/hearts/hearts-rules.html
  Standard mechanics, both moon scores, J♦, equal-deck3/5/6-player principle.
  Its footer identifies automated authorship; it alone is not authoritative.
- Wikipedia's Hearts article, read through a pinned captured HTML file:
  https://github.com/ocentra/ocentra-games/blob/b23f523ae3e5405a84be0bd271f0c012846a1d8b/packages/card-games/src/SourceHtml/wiki-hearts.html
  Arnold2011 deck table, historical/basic-vs-Black-Lady distinction and variants.
  The six-player cuts agree with the independent BGA implementation below;
  this Wikipedia mirror remains one source family.

Independent implementations inspected for mechanics/strategy:

- OpenSpiel (Apache2.0), pinned48401890ee9857e611678302371378175a8e4c6b:
  https://github.com/google-deepmind/open_spiel/tree/48401890ee9857e611678302371378175a8e4c6b/open_spiel/games/hearts
  Legal moves, first-trick/all-hearts exceptions, sealed passing, J♦ independent
  of the moon and hidden observation boundaries. Its fixed roster is4; it is
  not evidence of6-player deck cuts. Options/variants are listed in RULES.md.
- HTML5 Hearts (BSD2-Clause), pinned501fffd98964ff1a543020be09e7efe4cc7c8f6a:
  https://github.com/yyjhao/html5-hearts/tree/501fffd98964ff1a543020be09e7efe4cc7c8f6a/js
  rules.js, SimpleBrain.js and PomDPBrain.js: basic duck/discard strategy and
  information-set sampling with public void observations. Source uses timed
  search; our pure bot must use a fixed deterministic budget. No source code is ported; our bounded analytical strategy uses public facts.
- Python Hearts (MIT), pinned41fe7fbc3e36479cd27335990238fccaf1677b12:
  https://github.com/danielcorin/Hearts/tree/41fe7fbc3e36479cd27335990238fccaf1677b12
  README, Hearts.py, Player.py and Trick.py: standard scoring/play; random legal
  computer strategy. Its incomplete implementation is not sole rule authority.
- Nathan Sturtevant's Hearts header, pinned6ba11548af49d3953f989f50b318ee4f4c1b91f7:
  https://github.com/nathansttt/hearts/blob/6ba11548af49d3953f989f50b318ee4f4c1b91f7/Hearts.h
  Retrieved as a candidate strategy/API source; no code or gameplay claim taken.

The public contract and G05 prompt define the deliverable. Original CSS/SVG, fixtures, generated seeds and code are MIT.
The bundled zod4.6.5 MIT copyright/licence notice is embedded in play.html.
Third-party source licences are research provenance only; no implementation
or art from them is copied.

- Toranpu (MIT), discovered through the live npm registry and then read at
  https://github.com/johnmorrisdotca/toranpu/tree/d54b1205915a2617076fa5a03b236487bbbe1140/src/games/hearts
  hearts-rules/types/core/computer/tests:3/4-player implementation, sealed
  passing, public-view-only bot, high-card disposal and short-suit passing.
  It does not support5/6 and is not6-player corroboration. No code is ported.

- BGA Hearts implementation, read as factual code (no code, art or assets copied):
  https://github.com/wardcanyon/localarena/blob/cb7e785dbcbac37c3f93e9d1893bbfe8169cfe14/src/hearts/hearts.game.php
  The explicit six-seat cut is2♦,2♣,2♠,3♣, independently corroborating the
  Arnold/Wikipedia table. Also3/5 cuts, whole-seat passing rotation, suit legality,
  both moon choices and separate Jack bonus. This source uses a reversed score
  sign/initial reserve; our conventional increasing-penalty score is equivalent.
  Additional variants seen: always-right passing; rotating without hold;
  no shooting the moon; Spot/Black Maria; automatic remaining-trick capture.
- Rummy rule screen:
  https://github.com/robertfarnum/rummy-main/blob/1c1e98c315bf7b5916518ef296cae133fb52476c/lib/screens/hearts_rules_screen.dart
  Independently written3–6 roster, even deal principle,26-point moon and100-point
  lowest-total finish. Its blanket2♣ opener/four-beat pass is only coherent at
  four seats, so it does not override the explicit multi-seat implementations.

A search candidate in shmup/card-game-rules/briscola.md was about Briscola,
not Hearts; it supplies no Hearts fact and is not counted as corroboration.

## 2026-10-09 pinned original-source reread
Pagat transcription mondary/PKcards assets/rules/rules_pagat/hearts.md at
b5147daa70a1a1a41b18549b80e51dbc035098ba, actual blob
e2178fc36b97290d6864d9a8304988a6ba60fa96; Nathan Long nathanlong/rules
content/games/hearts.md at27d4ebb7557eae7c04fb3fa608182d80e0f71593,
blob b36e3cf6331c70bebac6f1eb4e6578cb89330eee; BGA factual implementation
wardcanyon/localarena src/hearts/hearts.game.php at
cb7e785dbcbac37c3f93e9d1893bbfe8169cfe14, blob
65d6bfa4fed736d32270dcb152ef1e089e612bb2. Passing, first-trick exceptions,
moon/J-diamond and roster deck cuts remain as documented; no mechanics changed.
Relevant targeted sections and the full short Nathan rules were read; full longer
sources were fetched but not claimed fully read. No source implementation/art copied.


## 2026-10-09 follow-up reread
Full pinned Nathan Long and Cached Cards texts above were freshly fetched/read.
Opening/follow-suit/26-point/lowest-score facts stay selected. Cached Cards omits
the all-penalty first-trick exception; retain Nathan/OpenSpiel/Pagat decision.
No rule/code/art copied. Public InitContext and ordinary core player-drop
handling define networking behavior; card rules do not define connections.
Read-text byte/SHA receipts are retained privately for audit reproducibility.
