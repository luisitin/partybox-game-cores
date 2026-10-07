# Sources actually inspected

- https://github.com/abw333/dominoes — commit
  ea9f532c9b834117a5c07d214711515872f7537e. Read README.md,
  dominoes/players.py and dominoes/search.py. Partnership double-six
  reference implementation: greedy pip shedding, omniscient alpha-beta,
  and probabilistic alpha-beta over possible hidden hands. MIT licence.
  No code or assets copied. The omniscient player is only a diagnostic
  upper bound, not an admissible bot with private opponents' hands.
- https://github.com/angeris/DominAI — commit
  e2b72f114841eec095f3c0da6519615a1248774f. Read README.md. It documents
  PIMC and IMS teams, negamax oracle, adjustable depth and sampling, and
  experiments against greedy. Algorithms and reported results need further
  inspection before selecting a baseline. No code or assets copied.

This is initial AI research, not a completed strength comparison or rules
survey. Denied rules URLs are listed separately in BLOCKED.md and are not
claimed as read sources. No corroborated factual rules dataset is shipped.

## Research resumed under main's web fallback

Read abw333/dominoes `game.py` and the full alpha-beta/probabilistic policy
implementation. Read DominAI `domino.py`, `algorithms/negamax.py` and
`algorithms/p_negamax.py`. Independent live implementations corroborate the
28-tile, four-seat partnership model, hidden hands, matching ends, legal passes
and search of sampled hidden states. They do not independently establish every
Draw/individual convention; those details are **from knowledge, unverified**.
The exact points to re-check are listed in NEXT.md.

Read https://github.com/dskart/dominoes_game_solver at
05ec4720baf1c6748706c90c4540e9997c0838c4 (README.md). It is Domineering on a
rectangular grid, a different game. Rejected as a domino-chain strength baseline.
No code or media copied from any external implementation.

All HTML/CSS is original. esbuild bundles zod (MIT) and its own output helpers;
package versions/integrities are retained in package-lock.json. No logo/art/data
assets are included. Browser scripts have no runtime network calls.

Baseline validation also installs the upstream `dominoes==6.1.0` wheel from
https://pypi.org/project/dominoes/6.1.0/ through the package-manager preset.
Wheel SHA256 is pinned in baseline-requirements.txt; verification remains on.
Its players.py/search.py exactly match the inspected GitHub source files.
No Python dependency is needed in game logic or the offline HTML; it is only
used by development verification. Browser emulation is not physical-phone proof.

## Live rules re-verification after network access recovered

- https://www.pagat.com/domino/line/draw.html — read the full rules/variations:
  double-six; deal 7/7/6 for 2/3/4 seats in the page's main Draw convention;
  voluntary draw allowed; leave two stock tiles; rotating lead; net blocked
  scoring. It also documents must-play/no-voluntary-draw, draw-all, different
  hand sizes, highest-double opening and winner-leads regional alternatives.
- https://www.pagat.com/domino/line/block.html — read the full rules/variations:
  main Block convention deals 7/5/5; stock unused; matching ends; pass when
  unable; rotate lead; net scoring, tie zero; 100/61 targets, plus opener,
  larger-set and doubled-finishing-score variations. No wording copied.
- https://en.wikipedia.org/wiki/Dominoes — read the rules section as an
  independent secondary cross-check: 28 double-six tiles, private hands with
  visible counts, draw versus block categories, and four-seat opposite-seat
  partners. This section itself flags citation/verification gaps and differs
  from Pagat on blocked ties and stock scoring; those claims are not accepted
  as definitive. The independently inspected GitHub implementations remain
  the concrete partnership/search references.

Bicycle's previously attempted URL now returns 404 rather than proxy denial;
no content was read. Masters of Games remains proxy-denied (403). Source access
has recovered for Pagat/Wikipedia, not necessarily every requested hostname.
No history/materials/art facts or source-owned assets are included in this game.
