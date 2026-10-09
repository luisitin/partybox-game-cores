# KEEP 17: visible discard cards and closing-knock targets

The full original e228d52 run and whole 13-member official artifact were independently accepted at 2026-10-09T06:59:01.778032Z. README.md, RULES.md, JOBS.md and the original research sources were then reread.

Five ranked weaknesses:
1. Confirmed: Strong treats the club four visibly left in the public discard pile as a possible defender layoff card. Its current finishing choice loses 10 points to an undercut while another legal finishing discard wins 1: actual signed gain 11.
2. Untested lead: a lower-deadwood finishing layout with strictly fewer live targets might dominate. No general target-subset rule is adopted without a complete proof and actual counterexample.
3. The historical opponent-pickup heuristic can retain cards later discarded. This is a heuristic limitation; no globally lower-deadwood or hidden-hand expectation policy is adopted.
4. Current native frame and functional gates pass; this is Chromium at the specified desktop size and CPU-four profile, with no physical-device or SDK claim.
5. Internal paired bot leagues meet the binding gates but do not prove strength against an outside champion.

Fix only item 1: remove the currently visible public discard pile, as well as the eleven own cards, from the possible-first-layoff universe. A defender gets no draw between this finishing knock and its layoff decision. Thus cards in that pile cannot be in its hand, and a target with no possible first extension cannot accept a legal later extension either. Every remaining live target still must be exactly identical before lower positive deadwood may replace the already finishing heuristic choice.

Representative own cards: [2,15,28,41,42,16,29,0,1,13,14]; defender [4,5,6,17,18,19,30,31,32,27]; public pile [3,51], forbidden immediate-return card 1. Current bot discards 0, deadwood 2, ties defender 2 and loses 10 by undercut. Discard 14, deadwood 1, wins 1. All 52 cards are unique. Own/public information only; scoring, draw decisions, other skills, Gin precedence, RNG and forbidden returns stay bounded by the original conditions.

The first probe incorrectly expected the older card-2 choice and genuinely failed: e228 had already safely improved that choice to card 0. Its complete original script/log/CLOSED guards are preserved in first-hypothesis-probe-failure/. The corrected production probe naturally closed PASS at 07:05:50.325630Z, all eight read-only source guards unchanged. No game source was edited during either probe and no native browser sampler ran.
