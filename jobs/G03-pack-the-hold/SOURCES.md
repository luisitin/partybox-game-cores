# Sources

Research resumed 2026-10-08. These are live commit-pinned sources fetched with
normal HTTPS proxy and TLS trust. Independent authors; no source code copied.

1. [Fred Dijkstra's README](https://github.com/computerguided/polyomino/blob/528a379aace8879d69e8fbabf347a6eb96bdad2e/README.md)
   and [Python solver](https://github.com/computerguided/polyomino/blob/528a379aace8879d69e8fbabf347a6eb96bdad2e/solver.py), MIT.
   Read both: integer coordinates, clockwise quarter-turns, rejection of
   overlap/out-of-bounds placements, exhaustive recursive backtracking.
2. [semiexp/polymate2 shapes](https://github.com/semiexp/polymate2/blob/1be7cac017a3d70c1b983c51290ed69dd5a498fc/src/shape.rs),
   [naive solver](https://github.com/semiexp/polymate2/blob/1be7cac017a3d70c1b983c51290ed69dd5a498fc/src/solver/naive.rs),
   [placement compiler](https://github.com/semiexp/polymate2/blob/1be7cac017a3d70c1b983c51290ed69dd5a498fc/src/solver/fast.rs),
   [exact-cover model](https://github.com/semiexp/polymate2/blob/1be7cac017a3d70c1b983c51290ed69dd5a498fc/src/solver/knuth_algo.rs), MIT.
   Read shape/placement routines and naive search, plus exact-cover data model.
   Independently corroborates finite transformations, legal translations,
   disjoint occupancy and complete search. Bitsets inform representation only.

Both solve all-pieces/cover puzzles. Weighted optional packing and its skip
branch are original; see CONFLICTS.md and PROOF.md. RULES.md defines the original
game's selected rules. All artwork is original CSS/SVG.

ArXiv, Wikipedia and MathWorld candidates still returned 403 on 2026-10-08.
They remain unread, never evidence. research-access.json records URLs, pinned
commits, UTC, SHA-256, byte counts and HTTP outcomes for the actual requests.
