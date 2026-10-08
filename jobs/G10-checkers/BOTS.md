# Bot research and endgame proof limits

Research design and corpus audit. Execution results are recorded in VERIFY.md
and evidence/checks; source availability alone is not a passed delivery check.

Easy: seeded legal choices with simple material/capture/promotion cues.
Medium: search several complete turns, score material/kings, advancement,
mobility and safe center. Strong: deterministic-budget iterative alpha-beta,
capture quiescence, move ordering, transpositions and exact endgame probes.
These choices are informed by D1/D6/D7; no engine-strength equivalence is
claimed. Search uses the reducer's actual draw policy and history.

A board-only transposition value cannot be reused as exact for different
quiet counters, ending allowances or repetition histories. Bare WDL WIN
alone does not choose progress-making moves: proven distance to win or
conversion, or separate history-aware search, is required to avoid cycling.

## Six-piece feasibility and scope

Full American raw state count is billions [D1/D2]. Cake's 21.9 MB 5/6 corpus
limits either side to 3 and omits meaningful capture entries [D4]. Source
is Unlicense, but hosted data licence is not separately verified.
International Scan 2–6 is 706 MiB zipped/about 2 GiB RAM [D5/D6]; engine GPLv3
does not establish a separate data grant. Neither is bundled by research.
Partial coverage must never be labeled a complete six-piece database.

Later live evidence establishes a separate Kingsrow International data
grant: the database author says his databases are available without
restrictions [D11]. His download page groups WLD 2–7 in a Mega-hosted
installer rather than a six-only browser package [D12]. The Boost-licensed
driver's compressed Tunstall format still requires material indexing and
recursive resolution of excluded captures. This is a possible licensed
corpus route. Actual setup-index inspection confirms every six-piece material
split but the full International payload/probe is not yet delivered.

The original Chinook author provides a practical American alternative:
free use requires acknowledgement and prohibits database sale [D13]. The
actual 27.7 MB archive was privately acquired and hashed [D14]. Its 48.1 MB
compressed database plus 0.9 MB text index includes every nonempty piece-type
tuple through six, including 4v2/5v1. Tuple presence and the author's complete
corpus claim must still be checked by independent rank/probe comparisons;
neither establishes correctness of a newly written decoder on its own.

The Chinook probe format [D15] stores 1,024-byte block checkpoints, five
high-to-low ternary outcomes per ordinary byte, and default-value runs of
10–1,600 positions. Rank ordering places black men, reversed white men,
black kings and white kings with earlier occupied squares removed. The
original independent JS reference enumerates legal man combinations in
colex order rather than copying the source's secondary-index tables.

Stored queries are invalid if either side has a capture threat. Current-side
captures must be resolved under compulsory capture; opponent-only threats
require searching all current legal quiet moves. Flipping side and negating
is not equivalent. The remaining temporary graph can contain cycles: exact
results need complete closure/fixed point against proven database boundaries,
or UNKNOWN on truncation. Bare WDL also lacks draw history and conversion
distances, so a winning label alone cannot prove draw-rule-safe play.

An original exact on-demand design can certify closed <=6-piece components:

1. Validate root and enumerate every reachable board+side successor under
   exact variant rules, including captures/promotions. Reuse only proven
   entries. Any budget-excluded successor makes the component unclosed;
   its root remains UNKNOWN, never a synthetic draw.
2. Record full successor outdegrees/reverse edges. Seed no-legal-move
   terminals as LOSS. WIN requires an opponent-LOSS child; LOSS requires
   every legal child be opponent-WIN. Propagate to fixed point.
3. Only an entirely closed graph allows remaining unknowns to become
   DRAW. Save proven WDL, distance, legal path, variant/key and proof
   provenance. Heuristic alpha-beta values are not database records.
4. This result is theoretical board-only WDL. Current game outcomes need
   a graph augmented with counters/repetition, or separate exact finite
   history-aware search. A winning theoretical value can become a draw
   under current limits; mark scope explicitly.
5. Generate sorted deterministic data twice and byte-compare; schema-check
   every file. Report solved roots/material classes and misses honestly.

Exhaustive material/rank slices [D1/D4] are a stronger alternative: solve
all-kings first; promotions feed those slices, captures feed smaller-piece
tables. Missing lopsided classes cannot be assumed won without proof.
Accepting a 6-piece root is distinct from complete <=6-piece coverage.

## Independently authored validation

The coordinate oracle imports no production helper and copies a matrix
at every jump. Compare full paths, capture order and promotion flags over
at least 10,000 seeded positions across both variants, plus hostile cases:
promotion-row visits, blockers, return to origin, global maximum routes
and equal-length choices. Freeze source before production comparison.

An independent endgame solver should use oracle moves and whole-graph
repeated fixed-point scanning, unlike a reverse-edge production queue.
Compare complete small material/king slices and fully closed tactical
six-piece components. Enumerate every legal edge and verify Bellman
conditions. A DRAW node must have no opponent-LOSS successor and at
least one DRAW continuation after terminal losses are excluded. Compare
small history-aware endings with exhaustive finite minimax, keeping all
draw counters and repetition. Truncation is UNKNOWN in both solvers.

## Required bot strength evidence

Run 2,000 games Strong-vs-Medium and 2,000 Medium-vs-Easy, with paired seed
and both seat orders. Retain seed/rules/moves/result for every game.
Report wins/losses/draws and score (win=1, draw=0.5), with paired uncertainty.
Show a clear gain; many draws and no losses alone do not establish it.
Keep tuning failures and use fresh confirmation seeds after tuning.
Explicitly disclose variant and coverage limits rather than extrapolating.
