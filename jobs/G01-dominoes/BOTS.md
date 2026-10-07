# Bots and measured strength

Contract names: easy / normal / sharp = easy / medium / strong.
Every policy receives only `Observation`: own tiles, played tiles, public hand
sizes/endpoints/pass constraints, legal moves and settings. Hidden-hand and
stock-order substitution tests compare decisions with identical RNG seeds.

- Easy: shed a playable double to avoid stranding it; randomize among doubles,
  otherwise among legal placements. It does not plan ahead or count suits.
- Medium: prioritize pip shedding, retain playable endpoint coverage, and shed
  doubles. Deterministic ties follow legal-move order.
- Strong: sample 64 deals conditioned on public missing-suit evidence. Use
  alpha-beta search, exact to exhaustion at <=9 remaining hand-plus-stock tiles and
  depth-three otherwise. Favor the medium move on equal sampled values.
  Count constrained hidden partitions exactly with memoized seat capacities.
  Sample branches in proportion to completion counts; use an ordinary shuffle
  for unconstrained deals. If public evidence admits no consistent deal, use medium;
  never quietly discard pass evidence or inspect the true hidden deal.

`npm run league`: 2,000 complete two-seat Block matches per comparison, seeds
1–2,000, target 100; swap the competing skills' seats on alternate seeds.
Win counts, ties, full-match turn counts and approximate 95% binomial confidence
intervals are recorded in `league-report.json`. A lower confidence bound above
50% is required, not just a favorable point estimate. The authoritative final
numbers are in VERIFY.md and that report.

`npm run baseline`: 200 complete four-seat partnership Block matches against
`dominoes==6.1.0`, with alternate teams and all-remaining-pips scoring. The
installed package's players/search files were byte-compared to the pinned live
GitHub checkout. Baseline uses its documented pip-greedy opener and actual
`probabilistic_alphabeta(sample_size=16)` at <=9 remaining tiles. Only the same
public observation reaches Python; arbitrary unseen partition labels are
resampled by the package, and public missing-suit constraints are retained.

Measured: 132 wins / 68 losses / 0 ties, 66% (approximate 95% interval
59.43–72.57%). This is a bounded, configured reference comparison. It does not
establish parity with unlimited sampling/full-game search, with every open-source
AI, or with optimal imperfect-information play. The shipped policy adds shallow
early-game lookahead; baseline uses pip-greedy early play.

Draw search models forced draws on the same turn and honors the stock reserve.
Unknown stock order is sampled from public unseen tiles, never the real stock.
Prior 32-sample two-seat Draw league (2,000 seeds, alternating seats): sharp/normal 1,666/2,000
(83.3%, 95% 81.67–84.93), versus 1,513/2,000 (75.65%) before stock modeling.
Historical 16-sample exact policy was 1,608/2,000 (80.4%).
Direct 32-versus-16 comparison: 1,045/2,000 on initial seeds and 1,063/2,000
on independent confirmation seeds, 53.15% (95% 50.96–55.34) in confirmation.
Normal/easy is unchanged at 1,155/2,000 (57.75%, 95% 55.6–59.9).
See archived comparison reports, budget-samples32-confirmation-report.json
and archived draw-league-goal32-report.json.

Limitations: FFA search pessimistically treats opponents as a coalition.
Impossible public evidence falls back to medium; every feasible conditional
deal is sampled without a rejection-budget failure. These are disclosed bot approximations; actual game rules and
public/private views are independent of search assumptions.

Terminal search rewards follow the selected blocked and partner scoring, verified
against 10,000 reducer-scored terminals. Public standings and target completion are forwarded to search; a completed
match takes priority over an ordinary +100 round preference. This remains a
bounded current-hand heuristic, not a solved future-hand match value.

64 versus 32 samples: 1,048/2,000 initial wins (52.4%, lower 95% 50.21%);
fresh seeds 2001–4000 confirm 1,082/2,000 (54.1%, 95% 51.92–56.28%).
Current 64-sample leagues (2,000 matches each comparison): Block sharp/normal
1,449 wins (72.45%, 95% 70.49–74.41%); normal/easy 1,619 (80.95%). Draw
sharp/normal 1,684 (84.2%, 95% 82.60–85.80%); normal/easy 1,155 (57.75%).
Current league-report.json and draw-league-report.json contain these completed
results; the corresponding *-goal32-report.json files preserve prior measurements.
