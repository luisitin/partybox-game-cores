# Verification ledger

All commands below run from jobs/G03-pack-the-hold unless stated otherwise.
No CI or disk-opening outcome is claimed before it actually passes.

| Command | Actual outcome | Detects |
| --- | --- | --- |
| npm install --no-audit --no-fund | Installed pinned zod/TypeScript/esbuild; Ajv added as dev-only | Dependency availability |
| npm run build | Passed strict ES2022 compilation and inline bundling | Contract type drift, syntax, embedded JS corruption |
| node --test --test-concurrency=1 tests/*.test.mjs | 18/18 passed on the pre-mirror-bank checkpoint | All contract invariants and the counts below |
| node scripts/mutations.mjs | 25/25 syntactically valid individual planted bugs caught | Independent regression sensitivity |
| node scripts/check-data.mjs | 7 data files + 6 schemas validated; two regenerations byte-identical; 16 hashes checked | Data drift, invalid JSON, corrupted media/data |
| node scripts/benchmark.mjs | 2,000 generated levels proven; max observed generation+proof+solve 6.071 ms | Solver time and exact/certificate disagreement |
| node scripts/visual.mjs | Local file navigation blocked by managed Chrome policy | Required disk-open gate remains pending CI |
| node scripts/visual.mjs --http --record | Passed over allowed localhost HTTP: Chrome 151, 180 frames each; desktop 16.666 ms mean, phone CPU4x 16.666 ms; zero exceptions/runtime requests; reduced motion; 2-player game; 86,522-byte video | UI execution, basic play, layout, steady rendering; does not replace file gate |

The full logic suite runs 10,000 independent weighted-packing differential
cases; property seeds 1/2/3 plus 1,000 reproducible pseudorandom seeds (listed
in data/property-seeds.json); 1,000 games at every count 2–8; idle/settings/VIP/
departure games; replay equality after every event; JSON size/schema checks;
AST purity; every opponent's layout view diffs; every phase's real fixture.
Both 2,000-game bot leagues produced 2,000 stronger wins and zero ties.

## Planted mutations

Each compiled mutation is made in an isolated temporary copy, never production.
The same focused regression suite must fail; syntax failures do not count.

| ID | Bug | Result |
| --- | --- | --- |
| M01 | Incorrect reported optimum | Caught |
| M02 | Omit packed crate value | Caught |
| M03 | Omit the optional-crate skip branch | Caught |
| M04 | Accept solver overlaps | Caught |
| M05 | Unsafe area upper bound | Caught |
| M06 | Lose occupancy during search | Caught |
| M07 | Disable quarter turns | Caught |
| M08 | Disable reflection geometry | Caught |
| M09 | Fail to normalize rotated x coordinates | Caught |
| M10 | Accept cargo outside the hold | Caught |
| M11 | Accept duplicate crate IDs | Caught |
| M12 | Accept layout overlaps | Caught |
| M13 | Permit forbidden mirrored placements | Caught |
| M14 | Accept fractional rotation | Caught |
| M15 | Count crates instead of their values | Caught |
| M16 | Let an inactive player pack | Caught |
| M17 | Process inputs while paused | Caught |
| M18 | Accept stale timer instance | Caught |
| M19 | Accept premature timer | Caught |
| M20 | Lose paused duration on resume | Caught |
| M21 | Use raw value instead of normalized score | Caught |
| M22 | Leak opponent layouts and optimum witness | Caught |
| M23 | Remove departed players from results | Caught |
| M24 | Collapse strong bot to medium | Caught |
| M25 | Generate fewer than six crates | Caught |

M11 initially survived because the duplicate occupied the same cell and the
collision check still rejected it. Added a disjoint duplicate placement case;
the rerun caught it. The first purity scan matched `eval` inside evaluateLayout;
changed it to exact forbidden-call names. HTML bundling initially used string
replacement semantics that altered literal dollar sequences; callback insertion
and embedded-script syntax validation fixed it. Synthetic keyboard events exposed
a non-Element target; the handler now checks the target type.

The first un-warmed frame run included a startup scheduling stall (max149.9 ms,
mean18.054 ms). The current measurement reports a documented60-frame warm-up and
moves a selected ghost during measurement; raw outliers remain visible.

## Live-source access

research-access.json records eight successful commit-pinned GitHub file fetches.
Two independent authors; both MIT licenses read. ArXiv/Wikipedia/MathWorld
requests still returned403 with the normal proxy/TLS; none is cited as read.
The managed Chrome URLBlocklist contains `*` and its allowlist permits HTTP(S),
not file://. No policy, trust setting or proxy was altered. CI is the independent
execution environment used to satisfy the real disk check.

## Thirty manual original-shape spot checks

Sampling command: seeded createRng(0x303), then 30 generated levels and one
random optimum crate per level; alternating reflections. Each coordinate list
was inspected for distinct edge-connected squares and its cell-count/value
bound. The second implementation independently recomputed the four-premium
optimum on a coordinate grid (200 in every row); the capacity proof extends
that result to all low-value crates. These are original authored levels, not
rows claimed to exist in an external published dataset. SOURCES.md separately
corroborates rotation/translation/collision/search facts from two live authors.

| Row | Seed | Difficulty / mirrors | Crate / value | Placed coordinates inspected | Grid optimum |
| --- | ---: | --- | --- | --- | ---: |
| 1 | 32646 | 7 / false | crate-4 / 10 | [[3,0],[4,0],[5,0],[3,1]] | 200 |
| 2 | 87177 | 6 / true | crate-3 / 30 | [[0,1],[0,2],[0,3],[1,3],[0,4]] | 200 |
| 3 | 66404 | 3 / false | crate-2 / 40 | [[4,1],[5,1],[4,2],[5,2],[5,3]] | 200 |
| 4 | 21794 | 5 / true | crate-2 / 40 | [[4,1],[5,1],[4,2],[5,2],[5,3]] | 200 |
| 5 | 46413 | 10 / false | crate-3 / 30 | [[1,3],[2,3]] | 200 |
| 6 | 56733 | 10 / true | crate-3 / 30 | [[2,4],[3,4]] | 200 |
| 7 | 87869 | 9 / false | crate-1 / 120 | [[2,1],[2,2],[3,2]] | 200 |
| 8 | 94562 | 8 / true | crate-2 / 40 | [[2,1],[3,1]] | 200 |
| 9 | 23550 | 3 / false | crate-1 / 120 | [[3,2],[3,3],[4,3],[2,4],[3,4]] | 200 |
| 10 | 66552 | 3 / true | crate-3 / 30 | [[4,0],[4,1]] | 200 |
| 11 | 44874 | 6 / false | crate-3 / 30 | [[1,3],[2,3],[3,3],[4,3],[2,4]] | 200 |
| 12 | 86788 | 5 / true | crate-1 / 120 | [[3,2],[3,3],[4,3],[2,4],[3,4]] | 200 |
| 13 | 1314 | 1 / false | crate-3 / 30 | [[0,3],[1,3],[2,3],[0,4]] | 200 |
| 14 | 93227 | 10 / true | crate-3 / 30 | [[2,4],[3,4]] | 200 |
| 15 | 81901 | 10 / false | crate-2 / 40 | [[1,2],[1,3],[2,3]] | 200 |
| 16 | 27633 | 3 / true | crate-2 / 40 | [[0,0],[1,0]] | 200 |
| 17 | 24119 | 1 / false | crate-3 / 30 | [[0,3],[1,3],[2,3],[0,4]] | 200 |
| 18 | 2224 | 7 / true | crate-1 / 120 | [[3,2],[2,3],[3,3]] | 200 |
| 19 | 42282 | 8 / false | crate-4 / 10 | [[0,0],[1,0],[0,1],[1,1]] | 200 |
| 20 | 20734 | 2 / true | crate-1 / 120 | [[1,0],[2,0],[1,1]] | 200 |
| 21 | 41152 | 4 / false | crate-2 / 40 | [[4,0],[4,1]] | 200 |
| 22 | 11447 | 5 / true | crate-4 / 10 | [[1,2],[1,3],[0,4],[1,4],[0,5]] | 200 |
| 23 | 6625 | 1 / false | crate-2 / 40 | [[0,5],[1,5],[2,5],[3,5]] | 200 |
| 24 | 45569 | 8 / true | crate-3 / 30 | [[0,2],[1,2],[2,2],[3,2],[2,3]] | 200 |
| 25 | 7728 | 2 / false | crate-1 / 120 | [[1,0],[2,0],[1,1]] | 200 |
| 26 | 38844 | 2 / true | crate-1 / 120 | [[2,2],[2,3],[3,3]] | 200 |
| 27 | 90888 | 3 / false | crate-3 / 30 | [[2,0],[3,0],[1,1],[2,1],[3,1]] | 200 |
| 28 | 45780 | 5 / true | crate-4 / 10 | [[1,2],[1,3],[0,4],[1,4],[0,5]] | 200 |
| 29 | 67662 | 1 / false | crate-1 / 120 | [[3,2],[4,2],[3,3],[2,4],[3,4]] | 200 |
| 30 | 25771 | 5 / true | crate-4 / 10 | [[1,2],[1,3],[0,4],[1,4],[0,5]] | 200 |

## CI and expanded browser checkpoint

[Push CI 37718081335](https://github.com/luisitin/partybox-game-cores/actions/runs/37718081335),
commit bc69b0d: logic18/18, mutations25/25, eight JSON files/seven schemas and
17 hashes all passed. Its browser startup exceeded the original15-second limit;
that is a failed run, not a green delivery gate. The launcher now prefers the
runner's installed Google Chrome, skips first-run prompts and allows45 seconds.

`npm run build && node scripts/visual.mjs --http --record` passed after adding
real CDP mouse dragging, keyboard placement and played-out UI rosters2–8.
The rotation-on-reselection bug was fixed. The board retains its static SVG
while moving the preview rather than rebuilding every hold tile. Latest raw
sample: desktop59.343fps (16.851ms mean,16.8ms p95,33.4ms max); CPU4x phone
60.002fps (16.666ms mean,16.7ms p95,16.8ms max);180 frames each after60 warm-up
frames, moving the preview at10Hz. Zero external requests or exceptions.
Video milestone-02.webm is91,212bytes. This is still partial localhost testing,
not a claimed successful disk-open check. All timing outliers are retained.

## Full required CI gate passed

[Push run37718745692](https://github.com/luisitin/partybox-game-cores/actions/runs/37718745692)
completed successfully at2026-10-08T02:39:28Z on commit8c383f3. Its normal runner
ran exact command `npm test` with no HTTP fallback: strict build,18 tests,
10,000 solver differentials,1,003 property seeds,7,000 bot simulations,
4,000 league games,25/25 mutations, JSON Schemas, hash checks, two byte-identical
regenerations, actual file:// navigation, pointer drag, keyboard placement,
played-out page rosters2–8, reduced motion and zero external runtime requests.
`node scripts/benchmark.mjs` also passed on2,000 generated/certified levels.
The Actions log is the authoritative remote result; optional artifact download
was blocked at the Azure blob-storage host, so no inaccessible artifact is
claimed to have been read. No credentials, signed download URLs or policy
changes are stored in this repository.

The successful disk-mode run reported Chrome154: desktop16.666ms mean
(60.002fps), CPU4x phone16.666ms mean(60.004fps), p95≤16.8ms, zero
exceptions/external requests, all seven roster sizes complete. Generated-level
benchmark max4.621ms and max856 search nodes. Exact Actions-log command:
`gh run view 37718745692 --repo luisitin/partybox-game-cores --log`.

## KEEP GOING round1: varied calibrated holds

After both PR checks passed, re-read G03. Baseline command: generate seeds0–199
at difficulty4 and count serialized hold-cell sets:1 distinct hold. The revised
bank contains12 templates per difficulty in both separately calibrated editions.
`node --test tests/generator.test.mjs` passed: all240 template certificates agree
with independent exhaustive grid optima;200 seeds at EACH tier/edition expose
all12 distinct hold shapes. Normal-policy rates now range28.90% to0.45%; each
tier has2,000 measurements and Wilson intervals. Previous narrower-bank rates
above remain historical checkpoint results, not the current calibration.

`node scripts/visual.mjs --http --record --milestone 03` passed pointer/keyboard,
UI rosters2–8, reduced motion and zero exceptions/requests. Video98,228bytes.
Raw local desktop sample included a133.3ms scheduling outlier:17.314ms mean,
57.757fps,p95=16.8ms. Phone CPU4x:16.666ms mean,60.004fps,p95=16.8ms.
The full default disk-mode CI must validate this milestone before final delivery.

`G03_VISUAL_MODE=http npm test` passed all20 tests on the expanded pool,
25/25 mutations,8 JSON files/seven schemas,19 hashes and two byte-identical
regenerations. The explicitly partial HTTP browser run passed all interactions
and roster sizes; current disk-mode CI remains the delivery gate.
