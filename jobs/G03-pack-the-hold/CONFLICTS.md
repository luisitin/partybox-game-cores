# Research decisions

- Both inspected solvers place every supplied piece; polymate also supports
  whole-board coverage. This game allows unused crates and empty cells. Include
  a skip branch per crate and maximize weighted value.
- Dijkstra permits rotations; polymate exposes reflections. Quarter-turns are
  default. allowFlip is an explicit house-rule setting.
- Greedy packing measures difficulty, never proves an optimum.
- This original game has no external official rules. Values, timing and
  scoring are repository-defined mechanics, not claims about either source.
