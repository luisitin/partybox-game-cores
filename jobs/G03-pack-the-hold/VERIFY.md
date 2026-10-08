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
