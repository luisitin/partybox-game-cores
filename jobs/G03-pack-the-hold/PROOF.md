# Exact value packing

Enumerate every allowed orientation and translation of every crate. Reject
cells outside the hold. Search each disjoint placement and also skip the crate.
Every feasible packing appears in this finite search tree.

Prune with a 0/1 knapsack upper bound on free area, ignoring geometry. Every
feasible continuation is admitted by this relaxation, so cannot exceed it.
Discard repeated (remaining crates, occupied cells) only with no better prefix
value. Both pruning rules preserve the maximum.

Independent verifier: coordinate grid, direct quarter-turn arithmetic,
exhaustive include/skip enumeration, no production geometry or solver calls.
Differential cases include holes, reflections, impossible pieces, rotations,
unequal values and empty boards.

Generated levels have a separate capacity certificate: four designated crates
partition the hold, each worth at least twice its cell count. Other crates are
worth at most their cell count. Omitting designated crates frees their area;
replacements add at most that area, less than the omitted value. The partition
value is therefore a global upper bound, not just a witness. Generation checks
this certificate and matches the exact solver on every generated level.
