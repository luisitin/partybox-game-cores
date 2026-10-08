# Verification record

Core checkpoint; full contract, mutation, visual and CI gates remain pending.

`curl --silent --show-error --location --max-time 30` against the canonical
Pagat and Bicycle URLs returned CONNECT403/HTTP000. No TLS bypass or alternate
proxy was used. The repository's prescribed GitHub fallback was followed.

`python3 /workspace/g05-research/fetch-more.py` retrieved21 pinned source files
with HTTP200, exit0; receipt URL/time/bytes/hash fields are in research-access.json.
Snapshots remain external; copyrighted text/images are not delivered. Reading
confirmed the standard26-point mechanics, rotation, strict suit following,
first-trick exceptions, moon alternatives and separate J♦ scoring.

GitHub code/repository searches and an npm registry search are research aids,
not independent rule sources. At that earlier checkpoint exact6-player cuts had only one source family.
The later BGA read below resolves the missing corroboration. All further tests,
mutation kills, fixtures, visual results and CI gates remain pending.

Registry fallback: `curl` to the npm search endpoint returned HTTP200.
`python3 /workspace/g05-research/fetch-toranpu.py` retrieved six pinned files
with HTTP200/exit0, making27 source receipts. Toranpu's3/4-player core and
public-view-only strategy were read; it does not settle the6-player table.

Independent reference functions were written before production, import no
production module and are sealed in REFERENCE-SEAL.md. Its algorithms identify
all penalty card identities, filter legality directly and sort trick ranks.
No differential result or mutation result is claimed before those tests run.

`npm install --ignore-scripts --no-audit --no-fund` installed the locked
job-local dependencies. `npm run build` passed strict ES2022 TypeScript against
the unchanged public contract. `npm test` passed the three independent-reference
checks (moon add/subtract, separate J♦ taker, all-penalty first-trick exception,
heart-leading restriction and led-suit winner). It is still a partial suite.
`node scripts/check-research.mjs` passed27 receipt schemas, the sealed reference
SHA256 and both data hashes; it reports fullJobChecks:false explicitly.

An initial package-file command used the wrong relative directory and failed
to create its files. It was corrected in the job directory; no unrelated
manifest/lockfile changed. No installation/build failure is hidden.

The first milestone push found the older remote research scaffold75bf358
(2026-10-07T15:05:23Z). The checkout fetched only main, so its local-ref check
missed that branch. An explicit branch fetch and merge preserved the old
history; seven job-doc add/add conflicts use the new live-source checkpoint.
An initial cleanup command failed because the old BLOCKED.md was staged, and
the shell continued to commit it. The following cleanup removes that obsolete
marker while preserving its exact text in RESEARCH-HISTORY.md. No force-push
or unrelated-file replacement was used. The next-claim helper now explicitly
fetches every job branch before selecting.

Core milestone (2026-10-08): `python /workspace/g05-research/fetch-six.py`
read the pinned BGA implementation and Rummy rule screen, HTTP200/exit0.
The unrelated Briscola result was rejected.29 fact/strategy/license receipts
are now schema/hash checked; BGA and Arnold independently agree on six cuts.

`npm test` passed strict build and13 tests. The differential suite compared
10,000 valid random card partitions, including500 moons, against the sealed
independent scoring implementation; it also compared legal moves and winners.
Focused tests cover deck conservation, passing atomicity, six-seat rotation,
first-trick exceptions, moon/J♦ order, turn ownership, suit following, capture,
clock expiry, stale timers, pause shifts, score-once, leaver results and view
alias/secrecy behavior. These catch mechanical and administrative rule errors.

`node scripts/pilot.mjs 200` ran complete100-point development matches with
seeds0–199, four rotating seats: sharp beat a designated normal rival146/200
(1tie), first-place share42.92%, mean penalties58.66 versus78.645; normal beat
an easy rival155/200 (1tie), first-place share53.25%, penalties53.275 versus78.92.
These are pilot results, not the required held-out2,000-game leagues.
The standalone page, phase fixtures, all roster/property runs,25 mutations,
visual recordings, full JSON-schema coverage and GitHub CI are still pending.
A documentation update used the repository root instead of the job cwd;
`set -e` stopped on the missing file before any edit. It was rerun job-locally.

Full local milestone: `G05_VISUAL_MODE=http npm test` PASSED. This explicit
local mode uses HTTP because managed Chrome blocks disk; it is refused in CI.
G05 CI must run default npm test and prove actual disk opening before delivery.

Strict build/bundle equality and all22 tests pass: nine contract invariants,
1003 property seeds (204,184 event-by-event replays, max state3898B),1000 full
100-point bot games at EACH count3–6 (630414/774184/897675/997785 events),
10,000 independent scoring/legal/winner comparisons, finite scores for leavers,
JSON round trips, unmutated state/events, unknown input/stale timer/pause/ghost
ordering, controller/TV secrets and alias safety, AST purity, real phase
fixtures and exact manifest contract. Unlimited mode's longest active match
140.43 simulated minutes, max1923 events; idle rooms persist until VIP end.

Two held-out2000-game leagues PASSED and are detailed in BOTS.md: strong beat
medium1422/2000 (71.10%,16ties, Wilson95%69.07–73.04%, first-place48.05%);
medium beat easy1559/2000 (77.95%,10ties,76.08–79.71%, first-place57.325%).
Default100-point/four-seat matches, rotating stronger seat/designated rival;
no claim about expert-human or unmeasured variant win rates.

`node scripts/mutations.mjs`: initially23/25 caught. An opening-turn test masked
the out-of-turn mutation, and a sole safe card masked ignored suit-following.
Added valid post-opening and mixed-safe-suit cases; final25/25 caught. Every
individual mutant parses (`node --check`) and fails a named focused test:
- M01: Hearts worth zero — caught.
- M02: Queen worth one — caught.
- M03: Wrong six-seat cut — caught.
- M04: Wrong across recipient — caught.
- M05: Unforced opening — caught.
- M06: Ignore suit following — caught.
- M07: Allow first-trick penalty when safe card exists — caught.
- M08: Lead unbroken hearts — caught.
- M09: Block all-heart exception — caught.
- M10: Off-suit card wins — caught.
- M11: Lowest led card wins — caught.
- M12: Wrong moon qualification — caught.
- M13: Reverse add-moon recipients — caught.
- M14: Wrong subtract-moon sign — caught.
- M15: Jack adds penalties — caught.
- M16: Accept duplicate pass cards — caught.
- M17: Reverse pass direction — caught.
- M18: Allow out-of-turn play — caught.
- M19: Allow unowned or illegal play — caught.
- M20: Accept input during pause — caught.
- M21: Accept stale timer instance — caught.
- M22: Accept early timer — caught.
- M23: Lose pause duration — caught.
- M24: Double-count completed hand on end — caught.
- M25: Collapse strong Jack strategy to medium — caught.

`node scripts/generate.mjs` twice: byte-identical real fixtures/manifest/seeds/
2000-game league results/schemas, all24 hashed files unchanged. Receipt UTCs
are actual observations, deliberately preserved. All20 JSON files including
metadata and schema documents validate; done is the final scored-hand fixture
played out. Exact commands are in package.json and scripts/check-repro.mjs.

`node scripts/visual.mjs --http --record --milestone 01` PASSED: real17-card
pass selection at10Hz,1920×1080 mean16.6661ms/p9516.7/max16.8 (~60.002fps);
390×844 CPU4 mean16.6656ms/p9516.8/max16.8 (~60.004fps). No horizontal overflow;
reduced motion, native touch/mouse/Space, preserved focus, atomic passing,
zero concealed-card DOM, complete hot-seat game and3–6 UI bot games,24-char
six-seat names fit. Zero outgoing requests/exceptions. Original video136066B.
The full-suite repeat measured phone59.018fps, p9516.8ms/max50ms; all other
browser gates passed. Raw milestone observations/captures are in media/;
repeat observations are in /workspace/g05-full-check.log and .tmp/visual/.

Failures fixed: String.replace dollar-token expansion corrupted bundled JS;
callback insertion and single-start-id/bundle drift checks now catch it.
Initial full redraw phone performance55.386fps/p9533.3ms improved with retained
card nodes. Named imports/separate input schema reduced500467→122792B. Strict
browser DOM.Iterable/type errors were fixed. A missed scored-phase deadline
anchor was caught by the human-reading wait test and corrected. The workflow
directory was absent on this main-derived branch; set-e stopped the write,
then mkdir created only the required G05 workflow. Doc writes with wrong cwd
stopped before edits and were corrected with absolute job paths.

CI actual disk status remains pending at this checkpoint. No source BLOCKED
marker, PR or DONE claim. Full local log: /workspace/g05-full-check.log.
