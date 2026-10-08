# Bot research and endgame proof limits

Research design and corpus audit. Execution results are recorded in VERIFY.md
and evidence/checks; source availability alone is not a passed delivery check.

Easy: seeded uniform legal choices. Medium: two complete search plies with
an800-node budget, scoring material/kings, advancement and center.
Strong: five-ply iterative alpha-beta with a6,000-node budget,
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

### Original Chinook driver comparison

`scripts/validate-chinook-original.py` was executed against the audited
author DB6 bytes. All 10,000 independently generated quiet 3–6-piece
queries agree between the original C driver and the independent JS
reference. The seed is 1329832729, with 14,613 candidate positions and
2,500 accepted queries at each piece count. Both seat orientations and
all possible material splits are represented, including 5v1 and 4v2.
The outcome counts are 4,243 wins, 4,038 losses and 1,719 draws.

The author source is downloaded into ignored `.work` and checked against
its fixed SHA-256. For this LP64 machine, the private compilation widens
three return casts and five arrays passed to `long*` functions, initializes
an otherwise uninitialized buffer counter, and adds an original input
adapter with system prototypes. Ranking, side normalization and byte
decoding remain the author's code. That source is not redistributed.

Raw queries, expected records, C stdout/stderr, compile output, source and
binary hashes, exact commands and the combined comparison are retained
under `evidence/checks/chinook-original-*`. The combined JSONL SHA-256 is
`02d4ad2ac2a186c78603faaf85774e2bcd8c44a5530206e3354205babca0d236`;
the query SHA-256 is
`1f6505955a8c225bdcda313a871c597b66ad11e546a2bf19bb32c96d3284e2e2`.
`chinook-original-reference-report.json` records PASS. The tracked
reproduction regenerates these same fixed inputs and comparison bytes.

This comparison covers direct stored American theoretical WDL queries.
It does not validate International data, every American rank, positions
with capture threats, current draw history, or conversion-making play.
Those checks remain separate. The parent production reader also needs
its own comparison against these independently established results.

### Independent International v2 reference

The actual lower db2–5 corpus is acquired with original installer SHA-1,
author-driver CRC-32 and generated SHA-256 checks. Eleven independent
reference tests passed against synthetic cases and the actual small db2
payload, including complete two-piece rank bijections, prefix token
decoding and current-capture exclusion. Dictionary binary and JSON
regeneration passed twice with byte-identical results. Retained reports
keep acquisition, ranking and WDL execution scopes separate.

`scripts/validate-international-original.py` is an original reproduction
adapter for the pinned Boost C++ source. It writes that source into
ignored/private work storage, without changing ranking or decoding, and
compiles an original board-to-bitboard input wrapper. Its reference query
generator cycles every supplied material tuple, piece count and colour
orientation. The 10,000-query external-driver comparison passed with zero
differences for actual db2–5: all 45 canonical material tuples and 180
side/colour orientations are represented. Seed 443499273 produced 14,170
candidates, with 2,441 WIN, 2,228 LOSS and 5,331 DRAW results. Source ranking,
canonicalization and decompression were unchanged; no ABI patch was needed.
The actual-sample selftest defaults to tracked db2/table bytes and passed
11/11 with zero skips.

Raw evidence is under `evidence/checks/international-original/`, including
queries, independent expected records, C++ stdout/stderr, compile output,
exact commands and the combined comparison. Query SHA-256:
`fd80282f6806ee2d63767f67e63615ab9e5b9a62fc0b3e36308c258c082d7969`.
Combined comparison SHA-256:
`4aa8260f24306d6f28d2c81fd40b92285994f9c4b5ae1773135f4de6a463a49a`.
`international-original-reference-report.json` records PASS. The original
source remains private/ignored and separately Boost licensed.

International v2 <=6 permits opponent-only capture threats in stored
queries; only the current side's captures are excluded. The source's
extra opponent-capture restriction starts at seven pieces. WDL omits
25/16/5 and repetition histories. Direct proof is limited to acquired
material, and five acquired six-piece partitions are not complete six.

A further private 10,000-query comparison passed for the five actual
six-piece classes 0303, 0312, 0501, 0510 and 2211, including mixed 4v2.
All 20 side/colour orientations are represented. The first generic-opener
attempt returned 10,000 unavailable-slice responses (-2): the original
opener discovers six pieces using the specific db6-3030.idx1 file, absent
from this partial acquisition. This is retained as a failure and discovery
constraint, not called a decoder comparison.

The successful adapter calls the author's unchanged specific v2 constructor
directly with six pieces. No original ranking or decoding source changed.
`--direct-v2 --pieces 6` makes that constructor selection reproducible in
`scripts/validate-international-original.py`. The tracked option was
executed and passed all 10,000 queries. Its input and combined comparison
bytes match the first successful private adapter exactly. Outcomes were
2,672 WIN, 2,800 LOSS and 4,528 DRAW from 27,297 candidates.
Initial discovery evidence is under
`evidence/checks/international-original-six-discovery/`; the successful
private-adapter raw proof is under
`evidence/checks/international-original-six-direct/`. Combined comparison
SHA-256: `e814bb1b8db4b1cd14805e906ce142368339de019fe1bff80f3b9470fc291e2f`.
The six-piece database files are not copied by this research worker. Five
of 37 canonical classes do not satisfy complete-six coverage.
The tracked reproduction's exact commands/source/query/output hashes and
raw evidence are under `evidence/checks/international-original-six/`.

The subsequent complete-six acquisition covers all 37 classes, not only
those five. All 82 db2–6 source files match installer SHA-1/driver CRC and
regenerated twice byte-identically. The original generic driver now finds
the actual discovery slice and agrees with the independent reference on
10,000 six-piece queries over all 37 classes/148 orientations, with 22
second-subslice db6-1212 queries. Seed 443499273, 22,286 candidates, outcomes
2,880 WIN / 3,106 LOSS / 4,014 DRAW. Raw proof is under
`evidence/checks/international-original-complete/`. It proves direct
theoretical WDL sampling of the complete acquired corpus, while runtime
page packaging, excluded-capture resolution and history-aware play remain
separate gates. Complete source acquisition is not a delivered full page.

## Required bot strength evidence

Run 2,000 games Strong-vs-Medium and 2,000 Medium-vs-Easy, with paired seed
and both seat orders. Retain seed/rules/moves/result for every game.
Report wins/losses/draws and score (win=1, draw=0.5), with paired uncertainty.
Show a clear gain; many draws and no losses alone do not establish it.
Keep tuning failures and use fresh confirmation seeds after tuning.
Explicitly disclose variant and coverage limits rather than extrapolating.

### Executed baseline full league and current scope

The4,000-game baseline passed with American883/82/35 Strong/Medium and
999/0/1 Medium/Easy; International928/61/11 Strong/Medium and1000/0/0
Medium/Easy (W/D/L,1,000 each). Every exact game input/seed/result and
pervariant Wilson interval is archived in league-baseline-pre-international.
These results predate actual International2–5 integration and are retained
as baseline evidence. Final-source strength leagues are still pending.
The current Strong bot consults actual2–5 outcomes; missing quiet6 returns
UNKNOWN. Full-six coverage and history-safe conversion are not implied.
