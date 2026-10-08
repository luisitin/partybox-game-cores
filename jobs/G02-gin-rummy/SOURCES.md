# Read sources and provenance

All sources below were actually read through Exa full-page fetch on 2026-10-08.
`evidence/research-sources.json` records extraction hashes and checked short
quotes. Origin HTTP status is **not observed** by that tool; this is not a
fabricated direct HTTP proof. Full copyrighted extractions stay ignored in
`.work/`; only short factual excerpts and our own paraphrase are delivered.

| ID | URL | What was taken / independence |
|---|---|---|
| P | https://www.pagat.com/rummy/ginrummy.html | McLeod/Eaton account: deal, legal melds, opening passes, draw/discard restriction, knock/layoff, classic bonuses, two-card stock boundary, Oklahoma variants, observed multiplayer variants. |
| B | https://bicyclecards.com/how-to-play/gin-rummy | Independent publisher rules corroborate deck, deal, low ace, opening flow, immediate-return restriction, knock target and classic game/line bonuses. Gin layoff ambiguity is logged. |
| C | https://cardgames.io/ginrummy/ | Independently authored explanation of this playable implementation: precise Big Gin 31, no Gin/Big Gin layoffs, North American bonuses and final scoring choices. No code or art copied. |
| W | https://en.wikipedia.org/wiki/Gin_rummy | Big Gin 31 corroboration with C; documented alternate bonuses/editions, Oklahoma spade doubling. Not counted as an independent pair for facts explicitly derived from P. |
| N | https://cs.gettysburg.edu/~tneller/games/ginrummy/eaai/gin-rummy-rules.pdf | Todd Neller's teaching/competition rules: North American 25/25, alternating dealer, disjoint melds, tie undercut, two-card draw boundary. |
| R | https://www.rubl.com/rules/gin_rummy_rules.html | Independently described online rules: 25/20/25 profile, Oklahoma ace-only-Gin, dealer alternatives and full-score shutout. Much wording resembles P; do not count R+P as independent corroboration. R's 25/20 preset is an explicitly named source variant. |
| O | https://www.coololdgames.com/card-games/rummy/gin/oklahoma/ | Independently written Oklahoma explanation corroborates upcard limit, ace-only-Gin and whole-hand spade doubling with P. Its disputed knock scoring is excluded. |
| D | https://therulebook.com/card-games/gin-rummy/ | Read and excluded as independent Big Gin evidence: explicitly credits Wikipedia. Actual contradictions in scoring prose are not adopted. |
| A | https://github.com/sangttruong/ginrummy | Research strategy account: hand potential and Bayesian public-observation inference. Conceptual research only, not copied implementation or learned-model strength claim. |

Basic rule facts use P+B (with N+C independently consistent). Big Gin uses C+W;
North American Gin/undercut use C+N, boxes C+W; Oklahoma limits/spade/ace use
P+O (ace independently also R). Conflicts and our choice are in CONFLICTS.md.
Single-source described optional variations and requested four-seat rotation
are explicitly house rules; their printed numeric choices are not relabeled
as corroborated universal official facts. No source is needed for the owner's
expressly requested rotation extension or our original UI/algorithm choices.

Code is original MIT under the workshop licence. Cards are original CSS/text
and suit characters; no publisher card images, logos, paid material or ripped
assets. Zod is the sole runtime dependency allowed by JOBS; compiler, bundler
and Playwright are development tools. The shared contract/RNG remain unchanged.

The actual earlier source-access failures are preserved in
`evidence/historical-blocker/`; they do not describe the current environment.

Target winner versus final points was re-checked against the already-read
P and B extractions. Both end the game when one player first reaches the hand
point target, before game/line bonuses. P separately defines final settlement
by the post-bonus point difference. Our result keeps that game winner while
preserving all final points; the three/four-seat ranking is an explicit house
extension, not an invented independently corroborated multiplayer rule.
