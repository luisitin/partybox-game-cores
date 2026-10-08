# Verification record

Final implementation/review scope:30 tests,25/25 mutation kills,10,000
independent comparisons,1003 property seeds,1000 full games at each3–6 count
and2x2000 leagues. Ten KEEP GOING rounds finish with three consecutive
no-meaningful-player-gain rounds8–10. Head6cf9fee passed push37743746775/
PR37743752330. The exact actual-disk report is preserved in
media/visual-measurements-ci-37743752330.json: desktop60.004fps,CPU4x phone
60.002fps,p9516.8ms,max16.8ms,all outcome/recovery/clock/native-input/privacy/
roster gates true,0 requests/exceptions. Core/UI/check source is unchanged
since5509a20. Historical failures/early smaller suites below remain visible.
This final metadata/evidence commit must also receive green full CI.


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

Strict build/bundle equality and all23 tests pass: nine contract invariants,
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

Actual disk gate PASSED at head100dfb1: G05 Actions run37731301909/job113160777783
https://github.com/luisitin/partybox-game-cores/actions/runs/37731301909
Default npm test on Ubuntu/Chrome154: fileOpened:true, desktop60.004fps,
phone CPU4x60.002fps, p9516.7/16.8ms, max16.8ms, zero requests/exceptions,
all3–6 UI games/input/privacy/reduced-motion gates true. CI video138561B.
The unmodified public CI report is preserved in media/; it is separate from
local milestone01. `gh run view 37731301909 --log` retrieved the exact report.

A later audit demonstrated−0 survived in paused.at and trick.card, violating
JSON round trips; optional player flags explicitly set to undefined could
also disappear on serialization. Normalize zero ids/timestamps and copy only
known, defined optional booleans. The numeric focused test passed. The additional legitimate prototype-seat
test FAILED: ownPass read an inherited property from the empty passes object.
The prior checkpoint prematurely stated all focused checks passed; that was
incorrect. Add an Object.hasOwn guard, then rerun focused/differential and
mutations before relying on the updated full CI. Normal seeded data are unchanged.
Full suite now contains25 tests. Run default CI on the updated head before PR.

After the own-property fix: `npm run build`, `node scripts/html.mjs`,
`node --test tests/focused.test.mjs tests/differential.test.mjs` PASS15 checks;
`node scripts/mutations.mjs` PASS25/25; `node scripts/generate.mjs --fixtures-only`
and `node scripts/check-data.mjs` PASS21 JSON/25 hashes. Prototype-shaped real
seats now play a full match and retain finite original-player scores. The new
head still needs full CI; the incorrect prior audit-pass note is corrected above.

KEEP GOING1, after PR5/head9c68bca had two GREEN runs37732593065/37733349438:
`node --test tests/save.test.mjs` PASS three meaningful recovery/corruption/clock
checks, covering all5 phases at counts3–6, unmutated live state, identical final
scores, malformed/missing/duplicate-card/impossible-turn rejection and18s saved
remaining time. `node scripts/visual.mjs --http --record --milestone 02` PASS:
two fresh default hands differ; after a scored hand, reload/Resume restores the
complete public view exactly with0 private-card DOM; corrupt stored JSON is
rejected. Optional entered seed stays reproducible. Desktop60.000fps and phone
CPU4x59.670fps, p9516.8ms/max33.4ms; all previous browser gates pass, clip135356B.
This is localhost partial browser evidence; updated full default CI remains
required. No runtime network calls, new dependency or pure-core randomness/I/O.

KEEP GOING2, after head3818b43 had GREEN runs37734856233/37734861508:
`npm run build`, `node scripts/html.mjs`, `node --test tests/save.test.mjs`
PASS five checks (30 tests in the complete suite). Reproduced a malformed
save with missing received memory that previously parsed then crashed the
controller; parsing now rejects incomplete pass/sent/received maps and orphan
memory. Mutating exported hands, scores or paused clocks leaves the live state
unchanged. These checks protect recovery from incomplete or aliased snapshots.
`node scripts/visual.mjs --http --record --milestone 03` PASS: mobile score/result
panel precedes the felt; three newly received cards have private visual badges
and spoken labels. Prior recovery/privacy/input/roster gates remain true.
Desktop60.002fps; phone CPU4x59.020fps,p9516.8ms/max33.4ms. Clip135356B. This local
HTTP run remains partial; full updated default-disk CI is required.
`node scripts/generate.mjs --fixtures-only`, `node scripts/check-data.mjs`
PASS24 JSON files validated and34 checksums; browser bundle151948B. Independent
reference seal and core/bot fixture/league results are unchanged.

KEEP GOING3, after1843eb2 GREEN push37736496412 and PR37736500158. The public
push log at /workspace/g05-ci-round2.log records actual disk opening, desktop
60.002fps/CPU4x phone60.004fps,p9516.7/16.8ms,zero outgoing requests/exceptions
and all previous browser gates. `gh run view 37736496412 --log` read it.
`npm run build`, `node scripts/html.mjs` and `node scripts/visual.mjs --http
--record --milestone 04` PASS. Native mouse opens/closes Manage on a10s human
turn:1.2s held does not consume time (remaining-time difference <300ms), actor
unchanged,0 private DOM while held,17 cards and3 selected cards restored with
Pass enabled. Manual Pause stays held; Skip advances one pass and conceals;
End completes even at handoff. Showing a hand closes an old handoff menu.
Recipient-specific button/live announcement and1-of-3 live selection feedback
pass. All prior browser/roster/reload/corruption/input/privacy gates pass.
Local desktop60.002fps,CPU4x phone59.672fps,p9516.8ms/max33.3ms,video135356B.
A second browser run followed the added menu-close-on-reveal/input guard.
`node scripts/generate.mjs --fixtures-only` and `node scripts/check-data.mjs`
PASS25 JSON/38 checksums. The bundle is153632B. No pure-core/bot changes;
updated full30-test default disk CI remains required.

KEEP GOING4, after457a122 GREEN push37737233240/PR37737238135. Source-color
relative-luminance audit via Python measured old input boundary1.619:1,muted
text7.064:1,bot marker4.760:1 and footer4.429:1 at brightest felt. The browser
then measures actual computed input/button colors and rendered rectangles.
`npm run build`, `node scripts/html.mjs`, `node scripts/visual.mjs --http
--record --milestone 05` PASS. Minimum audited target height44px (house-rule
labels/settings summary,Manage,pass-memory and Fast label); native touch near
the enlarged label's far lower edge toggles J♦ twice and native mobile touch
opens Manage. Minimum input/button border contrast3.490512:1; footer contrast
5.066486:1 at brightest felt. Previous recovery/menu/privacy/input/roster gates
remain true. Desktop60.002fps,CPU4x phone59.018fps,p9516.8ms/max33.4ms;
video135598B. Local HTTP remains partial. `node scripts/generate.mjs
--fixtures-only`, `node scripts/check-data.mjs` PASS26 JSON/42 hashes,
standalone153660B. Updated full30-test default disk CI remains required.

KEEP GOING5, after99f6025 GREEN push37737893201/PR37737896702. `npm run build`,
`node scripts/html.mjs`, `node scripts/visual.mjs --http --record --milestone 06`
PASS. Native Tab from the third selected card reaches enabled Pass; all prior
input/recovery/privacy/menu/contrast/roster gates stay true. Change is score
numeral spacing only, with no meaningful player gain. Desktop60.002fps,
CPU4x phone60.000fps,p9516.8/16.7ms,max16.8ms; video136614B. Frame variance is
not attributed to the cosmetic CSS. `node scripts/generate.mjs --fixtures-only`
and `node scripts/check-data.mjs` PASS27 JSON/46 hashes,standalone153713B.
Local HTTP remains partial; updated default disk CI must be green. Cosmetic
streak1; two more consecutive no-meaningful-gain rounds are required.

KEEP GOING6, aftera5e0e4e GREEN push37738469095/PR37738473119; exact SHA verified
through REST by `python /workspace/partybox-ci-head.py G05`. GraphQL-only
`gh pr checks` temporarily returned401. `git push --dry-run origin
job/G05-hearts`, public REST GETs and gh REST PR/run reads work; no credentials
were changed or printed. `gh run view 37738473119 --log` then recovered full
actual-disk evidence: desktop60.004fps/CPU4x phone60.002fps,p9516.7ms,min targets
44px,zero outgoing requests/errors; raw report/log are outside the checkout.
`npm run build`, `node scripts/html.mjs`, `node scripts/visual.mjs --http
--record --milestone 07` PASS. Only passive separator RGB increases by2/channel;
all previous native-input/privacy/menu/recovery/contrast/roster gates hold.
Local desktop60.002fps,phone CPU4x59.672fps,p9516.7/16.8ms,max33.3ms;
video136348B. No measured player gain; cosmetic streak2. `node scripts/
generate.mjs --fixtures-only`, `node scripts/check-data.mjs` PASS28 JSON/50
hashes,standalone153713B. Updated default actual-disk CI still required.

Round7 extra audit: the first new full browser probe failed the performance gate
before reaching the scroll assertion: phone mean39.998ms/p9516.8/max3466.5ms
(25.001fps). No sample was discarded and no pass claimed. An isolated actual
six-human/24-char-name mobile probe (`node .tmp/scroll-probe.mjs --http`) then
measured before scroll347,after256,winner top224.125/bottom277.875 in844px:
winner visible, but activeElement.id empty (page body). Fix outcome focus and
live winner names, then rerun the full gate; do not blame the stall on a cause
that has not been established.

The second round7 full browser attempt failed phone54.825fps,p9533.4/max66.7ms.
Observed runtime load0.07–0.22,4 CPU quota,no active competing worker; this
snapshot does not establish the cause. Isolated `node .tmp/performance-probe.mjs
--http` passed the existing cadence tolerance at desktop60.002/phone57.145fps,
p9516.8ms/max100ms. No failed sample was hidden or removed from the gate.
After updating only changed selection controls: `npm run build`, `node scripts/
html.mjs`, `node scripts/visual.mjs --http --record --milestone 08` PASS every
gate. Every scored hand has Continue focused; final New table focus replaces
body focus, and the live announcement names every winner (including ties).
Scrolled six-seat24-char-name winner top224.125/bottom277.875 fits844px after
scroll256. Prior privacy/reload/clock/native-input/contrast/roster gates true.
Desktop60.004fps; CPU4x phone58.068fps,p9516.8ms,max50ms;136272B video.
These are raw local HTTP observations, not a claim of exact60fps or proof that
the work reduction caused the timing change. Updated actual-disk CI is needed.
`node scripts/generate.mjs --fixtures-only`, `node scripts/check-data.mjs`
PASS29 JSON/54 hashes,standalone153921B.30-test full suite unchanged.
Round7 has a real keyboard/accessibility gain; cosmetic streak resets to0.

`G05_PROBE_HTML=.tmp/before-selection.html node .tmp/selection-work-probe.mjs
--http` and `node .tmp/selection-work-probe.mjs --http`: native MutationObserver
counts17→1 aria-pressed writes; both produce exactly1 selected card. Baseline
page is `git show c5da083:jobs/G05-hearts/play.html`; no production DOM prototype
is changed by the probe. These are direct browser mutation observations.

Round8's typography-only local trial failed the unchanged cadence gate at
55.105fps/p9533.3ms/max50ms. Revert the trial rather than change the criterion.
Game/UI/browser-check source is byte-identical to5509a20 after regeneration.
The subsequent documentation milestone records a fresh capture of that same UI;
its capture is not a frame benchmark. Fresh default CI remains required.

KEEP GOING8: `node scripts/html.mjs` and `git diff HEAD -- src ui play.html
scripts` confirm exact unchanged game/UI/browser-gate source. `node .tmp/
documentation-capture.mjs --http --milestone 09` records36 real PNG frames
(native page render) into a3.6s140221B VP9 clip. This is capture-only evidence,
not a frame benchmark or a replacement for default actual-disk CI. `node
scripts/generate.mjs --fixtures-only` and `node scripts/check-data.mjs` PASS
30 JSON/56 hashes, including the unmodified public CI browser report. Current
verification summary distinguishes30 tests from early incomplete checkpoints.
No player gain; cosmetic streak1. Await fresh updated-head full CI.

KEEP GOING9, afterfeb83f2 GREEN push37742150805/PR37742157321. README relative
links verified with Python Path.exists (all7),36 lines<60. `node .tmp/
documentation-capture.mjs --http --milestone 10` records a fresh3.6s140221B clip
of unchanged UI; no frame benchmark claim. `node scripts/generate.mjs
--fixtures-only`, `node scripts/check-data.mjs` PASS30 JSON/57 checksums.
No game/UI/test changes, no player gain, cosmetic streak2. Need updated-head
full CI before round10. Exact source actual-disk results remain preserved.

The round9 link enumeration printed7; the notes initially typed8. Correct the
notes to7 (every link resolves). Round10 adds a delivered-material licence
index without changing any claim about borrowed code/art. Source/HTML/browser
checks remain byte-identical to5509a20; fresh unchanged-interface capture is
not a new frame benchmark. Mandatory updated-head CI still runs the full suite.

KEEP GOING10, afterba95921 GREEN push37742910131/PR37742916541. README exact
7 links/36 lines verified with Python; documentation count typo corrected.
`node .tmp/documentation-capture.mjs --http --milestone 11` initially lost its
execution transport before creating media; status/files survived and no Node
worker remained. Rerun PASS fresh3.6s140221B clip, explicitly not a benchmark.
`node scripts/generate.mjs --fixtures-only`, `node scripts/check-data.mjs`
PASS30 JSON/58 hashes. `git diff HEAD -- src ui play.html scripts` empty:
product/check code unchanged from the actual-disk verified source. Three
consecutive no-meaningful-gain rounds8–10 now complete locally. Updated-head
full CI must be green before DONE/final PR delivery.

Final seal: R10 head6cf9fee GREEN push37743746775/PR37743752330. `python
/workspace/g05-read-ci-report.py 37743752330` retrieved the exact public browser
report and full log; the report is unmodified. `git diff --exit-code 5509a20
-- jobs/G05-hearts/src jobs/G05-hearts/ui jobs/G05-hearts/scripts
jobs/G05-hearts/play.html` PASS byte-identical source after the last real fix.
Shared contract files remain unchanged and independent reference seal is
bba8c397fd1992273e0e14229d6955ad29062d36010d9327905e94866228f757.
The research-check command attempted from repository root failed MODULE_NOT_FOUND
before running; rerun in the actual job directory passes. This is a command
path mistake, not a game-test result. Final JSON/hash checks follow below.

Final metadata commands: `node scripts/generate.mjs --fixtures-only`, `node scripts/check-data.mjs` PASS31 schema-validated JSON files and59 checksums. README remains36 lines/7 valid relative links. Default full final-head CI is the remaining closeout gate.
