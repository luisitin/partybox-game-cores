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

3. [SciPy Wilson interval](https://github.com/scipy/scipy/blob/ec1861fda2c65d4d4e92f15807f85bc595db7523/scipy/stats/_binomtest.py),
   `_binom_wilson_conf_int`, lines153–179: uncorrected two-sided center/radius,
   clamping the zero/all-success limits.
4. [Statsmodels proportions](https://github.com/statsmodels/statsmodels/blob/8278e2d218cc85bac2c7af02feb9a19a0e499b04/statsmodels/stats/proportion.py),
   `method == "wilson"`, lines296–313: independent corroboration of the same
   center/radius and clipping. Read both formula implementations live. Our
   algebraic implementation uses the standard two-sided95% normal quantile;
   no SciPy/Statsmodels code or runtime dependency is included.

Confidence intervals describe the named policy under the sampled levels.
Adjacent intervals overlap; neither human difficulty nor statistically distinct
human tiers is established by these measurements.

5. [zod4.6.5 package](https://www.npmjs.com/package/zod/v/4.6.5), installed
   from the live npm registry. Read its LICENSE; bundled MIT notice retained
   in play.html and THIRD_PARTY_NOTICES.md. Used for contract input validation.

6. https://raw.githubusercontent.com/actions/upload-artifact/v4/action.yml
   Read live2026-10-08 for CI delivery configuration:include-hidden-files
   defaults false; if-no-files-found accepts error. Used only to upload
   already enumerated public audit evidence. Observed run37765943337 and
   REST artifact_count0 independently confirm the prior skipped upload.
