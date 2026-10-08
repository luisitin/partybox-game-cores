# Pack the Hold rules

This is an original game defined by JOBS.md, not a published commercial ruleset.
SOURCES.md links two independently authored live sources for the underlying
rotation, placement, collision and exhaustive-search mechanics. CONFLICTS.md
records cover-vs-packing and reflection differences.

## Selected rules

2–8 players play 1–3 rounds. At the beginning of a round everyone receives the
same seeded hold shape and the same 6–12 uniquely identified valued crates.
The hold consists of edge-connected unit squares. Each crate is an
edge-connected polyomino of 2–5 squares; crates cannot be cut or reused.
Values are printed on crates. Four valuable crates are worth 120, 40, 30 and
10; remaining crates are worth 1. All art and levels are original.

The hot-seat edition gives each player 20–60 seconds (default 45) to pack
cargo. The clock pauses during hand-off; others look away during a human turn.
Players may drag, rotate in quarter turns, reposition, unpack or clear cargo.
Every occupied square must lie inside the hold and may not overlap another
crate. Empty cells and unused crates are allowed. Illegal edits do nothing.
Lock Cargo finishes a turn early. Timeout locks the current legal layout.
Disconnected/departed seats are skipped; their accepted cargo still counts.

After all turns, inspection reveals every layout and the exact optimum with
a valid witness. Round score is packed value / optimum (0–1). The generator
proves optimum 200 for each level by exact search and a separate area/value
certificate; the denominator is displayed at inspection. Sum round ratios;
the highest total wins, with shared ranks/winners for ties. Ending early scores
the current accepted cargo. Results retain every initial player, including
departures. Inspection offers Next and a conservative two-minute idle deadline.

## Settings and variants

- rounds: 1–3, default 3.
- turnSeconds: 20–60, default 45. The same limit applies to every seat.
- difficulty: 1–10, default 4. Measured full-solution rates for a named greedy
  policy are in data/calibration.json; these are not human playtest rates.
- allowFlip: false by default; true also permits mirror images. Both the
  rotations-only and mirrored geometric cases are checked.
- Easy / medium / strong bots independently solve the visible puzzle and
  choose legal subsets worth exactly 60% / 80% / 95% of its optimum.

The source examples also support whole-board exact cover and required use of
every piece. Those are research variants, not this game's selected rules.
Simultaneous remote controllers can use this pure core's per-seat interface;
this delivered page intentionally uses hot-seat turns, not simultaneous play.
