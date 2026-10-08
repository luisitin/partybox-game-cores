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

## KEEP GOING round2: no repeated hold in a voyage

Round1 is green in push/PR runs37720218769 and37720222756 at2502b81. The latter
reported actual disk opening,60.002fps in both layouts,2,000 generated-level
benchmarks with max2.271ms, maximum p95 across tiers0.982ms, max802 nodes.

Measured baseline:37 of200 three-round difficulty4 games repeated a hold.
The revised generator chooses uniformly from unvisited members of the same
calibrated pool, preserving each round's marginal distribution and exact proof.
History keys live in JSON state; they do not enter views.
`node --test tests/generator.test.mjs` passed:400 three-round games across both
editions and all tiers had zero repeated holds and deterministic final states.

`node scripts/visual.mjs --http --record --milestone 04` passed all roster and
interaction checks, no exceptions/requests; video98,616bytes. Cloud frame
samples retain outliers: desktop59.018fps,16.944ms mean,p95=16.7ms,max50.1ms;
CPU4x phone58.066fps,17.222ms mean,p95=16.8ms,max50ms. These explicitly partial
HTTP measurements do not replace the required normal-runner disk/frame gate.

`G03_VISUAL_MODE=http npm test` passed21/21 tests,25/25 mutations,8 JSON
files/seven schemas,20 hashes and two byte-identical regenerations. The final
partial browser sample measured59.670fps desktop and60.004fps CPU4x phone;
p95≤16.8ms, zero exceptions/requests, all roster sizes completed.

## KEEP GOING round3: keyboard focus and touch

Round2 is green atd1e073e in runs37721189901 and37721185632. Actual keyboard
baseline (a CDP click on a focused crate):activeTag=BODY,focusedCrate=null.
The page now restores selected-button focus after rebuilding the tray, updates
rotation and Escape feedback, and announces keyboard coordinates. Stable parent
pointer capture supports touch across DOM changes.

`npm run build && node scripts/visual.mjs --http --record --milestone 05` passed:
focusedCrate equals selectedCrate, Escape clears all aria-pressed selections,
real touch dragging on390×844, mouse dragging, keyboard placement, UI rosters
2–8, reduced motion, zero exceptions/requests. Video103,401bytes. Raw samples:
desktop60.000fps,16.667ms mean,p95=16.8ms; CPU4x phone58.379fps,17.129ms mean,
p95=16.8ms,max50.1ms. Normal-runner disk/frame checks remain the final gate.

## KEEP GOING round4: full human clock and secret-key omission

Round3 passed both PR checks at a5eecdf (runs37721993907 and37721997692).
Using the real pure reducer with a simulated200ms setup delay: pause at the
post-setup timestamp then resume gives44,800ms; pause at phase.startedAt then
resume gives the full45,000ms. The adapter now timestamps hand-off at entry.

A fresh contract review found that numeric secret keys must be omitted, not
included with empty placeholders. tvView/controllerView now omit optimum and
solution entirely during packing and reveal them only at inspection/results.
The focused secrecy test explicitly asserts key absence for TV, every player
and a spectator. Existing opponent-layout diff tests remain.

`npm run build && node scripts/visual.mjs --http --record --milestone 06`
passed all interaction/roster checks, including touch and focus, before the
key-omission tightening (the visible UI is unchanged). Video103,400bytes;
desktop59.670fps,phone60.002fps,p95≤16.8ms. Full current checks are running;
only their actual completion and strict CI can certify this milestone.

Current `G03_VISUAL_MODE=http npm test` passed21/21 tests including explicit
secret-key omission,25/25 mutations,8 JSON files/seven schemas,22 hashes and
two byte-identical regenerations. Browser checks passed: all roster sizes,
focus, touch/mouse/keyboard, zero exceptions/requests. Raw latest sample:
desktop60.004fps,CPU4x phone59.343fps,p95≤16.8ms.

## KEEP GOING round5: phone layout with maximum-length names

Round4 passed both CI checks at822ac1e (runs37722828512 and37722825705).
The strict disk browser report measured60.004fps desktop and60.002fps phone,
p95=16.7ms, no external requests/exceptions and all roster sizes. The2,000
generated-level benchmark had max2.663ms, maximum tier p95=1.300ms.

`node .tmp/long-name-baseline.mjs --http` before the fix:24 unbroken W's
expanded innerWidth/scrollWidth to609px despite a390px device/client width;
the turn heading and clock went off-screen. After CSS wrapping/shrink fixes:
innerWidth=scrollWidth=390px, no off-screen elements. The temporary diagnostic
uses the existing CDP harness and a390×844 emulated device.

`npm run build` passed. `node scripts/visual.mjs --http --record --milestone 07`
passed maximum-name hand-off, packing, inspection and results checks; real
touch/mouse/keyboard controls, all2–8-player rosters, reduced motion and zero
requests/exceptions. Report now includes longNamesFit; overflow compares the
emulated width rather than the possibly expanded layout viewport.
Video103,327bytes; local HTTP desktop60.002fps and CPU4x phone59.343fps,
p95≤16.8ms. Managed disk policy remains unchanged; CI supplies the disk gate.

`node scripts/generate.mjs --fixtures-only` updates the report schema and hashes;
`node scripts/check-data.mjs` validates every JSON/schema/hash and runs the full
generator twice to check byte identity. The current push runs all core checks
and the new layout regression in strict disk mode.

Round5 data checks completed:8 JSON files,7 schemas,23 hashes and two full
byte-identical regenerations passed. Core code was unchanged in this CSS fix;
CI runs the complete21-test suite and25 mutations on the pushed head.

## KEEP GOING round6: cargo-number typography (cosmetic)

Round5 is green atc57d714 in runs37723377564 and37723373268. Re-read the job
and reviewed number alignment, border weight, eyebrow spacing, footer spacing
and icon baseline. The only change requests tabular numerals for crate values.
`node .tmp/numeric-baseline.mjs --http` measured computed normal→tabular-nums,
width25.75→25.75px (0px change in the available system font). No gameplay or
meaningful player gain; first consecutive no-gain round.

`npm run build` passed. The first `node scripts/visual.mjs --http --record
--milestone 08` failed its frame gate: desktop49.316fps with a200ms sample;
phone57.145fps. No relaxation was applied. A repeat justified by that failure
passed: desktop60.002fps, phone59.670fps, p95≤16.8ms, video103,462bytes.
All interaction, maximum-name, roster, reduced-motion and runtime-isolation
checks passed. These are explicit partial HTTP samples; strict CI stays the
delivery gate, and the failed sample is retained here.

`node scripts/generate.mjs --fixtures-only` refreshes hashes;
`node scripts/check-data.mjs` runs schemas/hashes and two complete regenerations.

Round6 data gates passed:8 JSON files,7 schemas,24 hashes, two byte-identical
regenerations. `git diff --check` passed; the sealed independent reference
remains c944077d28097f377fdac1dba088cf4eec2aa44a970096e9181d562497e1cc74.
