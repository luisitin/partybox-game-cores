# Bots and measured strength

Contract names: easy / normal / sharp = easy / medium / strong.
Every policy receives only `Observation`: own tiles, played tiles, public hand
sizes/endpoints/pass constraints, legal moves and settings. Hidden-hand and
stock-order substitution tests compare decisions with identical RNG seeds.

- Easy: shed a playable double to avoid stranding it; randomize among doubles,
  otherwise among legal placements. It does not plan ahead or count suits.
- Medium: prioritize pip shedding, retain playable endpoint coverage, and shed
  doubles. Deterministic ties follow legal-move order.
- Strong: sample 16 deals conditioned on public missing-suit evidence. Use
  alpha-beta search, exact to exhaustion at <=9 remaining hand tiles and
  depth-three otherwise. Favor the medium move on equal sampled values.
  If bounded rejection sampling cannot find a consistent deal, use medium;
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

Measured: 142 wins / 58 losses / 0 ties, 71.0% (approximate 95% interval
64.7–77.3%). This is a bounded, configured reference comparison. It does not
establish parity with unlimited sampling/full-game search, with every open-source
AI, or with optimal imperfect-information play. The shipped policy adds shallow
early-game lookahead; baseline uses pip-greedy early play.

Limitations: Draw lookahead models subsequent play as Block, ignoring future
stock draws. FFA search pessimistically treats opponents as a coalition.
Rejection sampling has a bounded budget and can fall back to medium late in a
constrained hand. These are disclosed bot approximations; actual game rules and
public/private views are independent of search assumptions.
