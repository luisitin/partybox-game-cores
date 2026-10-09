# Verification in progress

`cat README.md RULES.md JOBS.md CLAIMS.md` on current main: read; lowest
unclaimed G04 after fresh G01/G02/G03 lines. Claim0d43479 pushed to main.
`git switch -c job/G04-reality-check-core`: new branch from main; existing
research-only job/G04-reality-check branch preserved.
`gh api repos/<source>/readme` and contents/doc paths: four source texts read,
commit snapshots pinned in SOURCES.md. No game checks claimed yet.

Required remaining: full strict types/contract properties,1000 seeded games
per count,independent10,000-case hardest-function diff,25 mutations,2,000-game
bot comparisons,all fixtures,offline HTML/TV/phone/reduced-motion/capture,
checksums,actual current-head green CI,PR and KEEP GOING.

Initial `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/.npm-cache`
at repo root failed EUSAGE: the workshop root has no package lock. Re-run
from jobs/G04-reality-check uses its pinned lock; no root manifest invented.

Job-directory npm ci:PASS,eight pinned packages installed. `npm run check`:PASS.
`node generate.ts` then `node generate.ts --check`:160 rows,20/realm,valid
schema,byte-identical regeneration. `node differential.ts`:10,000 seeded
cases plus14 edges,ZERO mismatches; unit scale/reciprocal/zero/overflow pass.
Initial native schema import in tests failed ERR_MODULE_NOT_FOUND at shared
minigame-schema; resolved by bundling the actual schema in preflight.ts.

`FAST_TEST=1 node --test --test-name-pattern='fooled-vote credit is independent'
test.ts`:before correction FAIL(actual1000,expected1500). After additive
truth awards, `FAST_TEST=1 node --test test.ts`:22/22 PASS.
`node fixtures.ts`:all seven phases plus matching manifest generated.
`node checksums.ts` / `node checksums.ts --check`:PASS.
Full property/21,000 count-and-mode games and12,000 league matches underway;
no result presumed. Browser,mutations,full npm test and CI remain unfinished.

Completed preliminary checks: node --test test.ts PASS 45/45 in
214,713 ms: 21,000 bot games (1,000 per 2–8 count × three modes), 1,003
exact event replays and 1,000 timer-only games. This precedes the new
BCE/CE scoring regression; final full npm test is still required.

node mutations.ts: PASS 25/25 kills, baseline 22/22 focused tests.
The actual list is mutation-report.json: stale phase/nonce/early timers;
paused play; prototype spectator; century zero/nondecade/out-of-range
answers; replaced answer; self-vote; lost duplicate author/normalization;
missing correct-write/fooled credit; truth overwrite; lost final doubling;
missing results/left rank; lost pause offset/paused resume; short/repeated/
live-row demo; live-answer leak and another player's private answer.

node bluff-differential.ts: 10,000 cases, ZERO mismatches, 5,000 doubled
last rounds, 32,711 duplicate author occurrences and 7,381 correct writes.
Production accumulates voter credits; independent reference accumulates
author credits from raw text and selected text, without hidden flags.

node league.ts: all six 2,000-match comparisons PASS (12,000 games).
Strong/Medium Quick 89.50%, Mixed 99.05%, Bluff 99.60%; Medium/Easy
98.45%, 99.20%, 99.60%. All approximate 95% lower bounds exceed 50%.
Scope and exact counts/intervals: BOTS.md and league-report.json.

npm run check: PASS. FAST_TEST=1 node --test test.ts: PASS 23/23 after
century-boundary fix. node fixtures.ts: all seven phases regenerated.
node build.ts: standalone HTML 490,940 bytes. Initial overbroad URL check
rejected zod's inert documentation strings; resource-specific check passes.

node browser.ts: PASS 18 functional scenarios including all four Quick
controls, exact 3 s wheel/10 s demo/pause-shifted timer, escaped bluff
input/duplicates/self-vote, concealed correct-writer confirmation, retained
draft/focus, nine completed Quick/Mixed/Bluff games at 2/4/8 seats and
reduced-motion. No external requests or page errors. Initial nonfrozen
clock caused a timing-boundary failure; explicit pause fixed the harness.

300 requestAnimationFrame intervals per profile: TV1920×1080/1× and
phone390×844/4× both mean16.6660 ms, p95 16.70 ms, p99 16.80 ms,
60.002 fps. TV fits vertically; phone has no horizontal overflow.
media/milestone-1.webm: 290,245 bytes (<10 MB), with TV/phone screenshots.
Physical phone not available. Managed direct file:// navigation is blocked;
the exact delivered HTML bytes are exercised through setContent instead.
Current-head complete npm test and actual PR CI remain unverified.

Final source verification, /tmp/G04-final-npm-test.log: npm test EXIT0,
46/46 tests, zero failures/skips, node:test duration212,661.526 ms.
All 21,000 count/mode games,1,003 exact replays and1,000 idle games pass
with the BCE/CE fix. Both10,000-case differentials pass. All25 mutations
are killed with actual23-test baseline. All six2,000-game leagues retain
the documented conservative rates (ties count as no win).

Heavier node browser.ts PASS19 scenarios: all eight wheel landings verified
by an independent transformed-ray check; eight seats, an open human draft
and seven bot submissions remain smooth. TV mean16.6660ms,p9516.70ms,
60.0024fps; phone4× mean16.6659ms,p9516.80ms,60.0028fps. No requests,
errors or reduced-motion animation. TV input fits1920×1080; phone has no
horizontal overflow. media/milestone-2.webm286,613bytes; capture1 retained.
Standalone HTML491,536bytes. node checksums.ts / --check PASS18 files.

Independent idle timing command: node --input-type=module (init default
Mixed with2 connected seats for seeds1–1000; advance only exact timer
phaseId/startedAt/deadline until done; assert seen.length7 and startedAt
694000). All1,000 matched: min=max694,000ms,11min34s,confirming the
selected default pacing. This is a local derivation,not an external fact.

Added checksum entry guard node checksums.ts --check:PASS before and after
complete pipeline. bash /workspace/.onboarding/install.sh:EXIT0,shared
strict types/RNG checks and pinned G04 install,23 focused tests,generated
sample identity,standalone build identity and18 checksums all PASS.
Cloud install_script/start_skill saved at draftrevision6 (unpublished).
Current-head hosted PR CI and KEEP GOING remain pending.

GitHub REST pull creation confirmed PR4 OPEN at6fdd934; current-head
hosted G04 CI pending. No KEEP GOING rounds count before its green run.

Hosted CI: run37723477241 SUCCESS for6fdd934; run37723786704 SUCCESS
for current PR4 checkpoint f7ef26c080046a2f04642572bb5df1aaaae09430,
observed03:47UTC; PR API head matched. KEEP GOING may begin.
Round1 baseline inline Playwright measurement (/tmp/G04-draft-before.json):
before='My unfinished harbour draft',after='',hiddenInputs0. After fix,
node browser.ts PASS20 scenarios including that restored value, six numeric/
range restores, bluff pause restore, hidden fields0 and next-owner blank.
npm run check and FAST_TEST=1 node --test test.ts PASS23/23; core unchanged.
TV60.0028fps/p9516.70ms;phone4×60.0024fps/p9516.70ms. build491,924bytes;
19 checksums PASS. Capture3 is under10MB. New-head hosted CI pending.

Round2 inline Playwright baseline (/tmp/G04-phone-before.json):phone wheel
invisible,private question absent,focus BODY and keyboard typing produced
empty fake. After:npm run check/node build.ts/node browser.ts PASS22
scenarios, including keyboard-only entry, nearby question, matching timer,
wheel visible and160-character unbroken votes wrapping. TV60.0032fps/
p9516.80ms,phone4×60.0028fps/p9516.80ms; no network/errors/reduced-motion
animation. HTML492,810bytes,20 checksums PASS,capture4<10MB. Core unchanged.

Round3 public-only baseline (/tmp/G04-date-before.json):0/8 correct on
short/case/spacing/object-ID/five-digit-year probes. FAST_TEST=1 node
--test test.ts after explicit year/era parsing:24/24 PASS, all8 clues correct,
and changing hidden truth preserves each input. npm run check PASS.
node league.ts:12,000 matches PASS, exact win counts unchanged. node
build.ts/--check PASS492,898bytes. node browser.ts PASS22 scenarios;
TV/phone60fps,p95≤16.8ms,no network/errors,reduced-motion honored.
Capture5<10MB; node checksums.ts/--check PASS21 data/media files.

Round4 baseline inline node public-bounds probe:9000 actions,2674 invalid
(2000 Sharp underflows,510 Easy and164 Medium out-of-range centuries).
Raw baseline is bounds-before.json at sourcehead77f6f79. node bounds-probe.ts
after fix:9000 actions,ZERO invalid; bounds-report.json. npm run check and
FAST_TEST=1 node --test test.ts PASS26/26,including real reducer acceptance
for all9000 and fractional/one-sided controller defaults. node league.ts
PASS12,000 matches,all default win counts unchanged. node build.ts/--check
PASS493,330bytes. node browser.ts PASS22 scenarios,TV60.0024fps/p9516.80ms,
phone4×60.0036fps/p9516.80ms,no network/errors and reduced-motion honored.
Capture6<10MB;24 data/media checksums PASS. Environment restarted/reconnected;
post-return status/source/artifact inspection and24 checksums all matched.
Hosted77f6f79 CI37725962141 SUCCESS;5e1d1d6 CI37725343643 SUCCESS.

Round5 baseline node public-view probe atdc0fb64:0/300 Medium fakes followed
the two-word hint,0 invalid. style-before.json records it. node style-probe.ts
after fix:300/300 two-word,0 invalid. Full npm test completed successfully:
50/50 tests (27 focused),21,000 bot games,1,003 exact replays,1,000 idle
rosters,10,000 numeric and10,000 bluff differentials,25/25 mutation kills
with a27-test baseline,9,000 bounds actions/0 invalid,12,000 league matches,
22 browser scenarios and27 checksums. test.ts duration214214.99ms.
Quick rates unchanged;Mixed Strong1971/2000(98.55%,lower98.03%),Medium
1988/2000(99.40%,lower99.06%);Bluff Strong1987/2000(99.35%,lower99.00%),
Medium1992/2000(99.60%,lower99.32%). Ties count as no win. Each lower bound
exceeds50%. Build493,410bytes,TV60.0024fps/p9516.80ms,phone4×60.0028fps/
p9516.70ms,no requests/errors and reduced motion honored,capture7<10MB.
Hosted Round4 dc0fb6427f06a662ff20c6b971a99ffa1f8f1918 run37727596105
SUCCESS observed04:36UTC. New-head hosted CI pending.

Round6 npm run check PASS;node phase-audit.ts PASS on7,000 frozen states:
195,000 ignored malformed/stale/spectator events,30,000 paused events,
60,000 private projection comparisons,90,000 bot noninterference comparisons,
36,000 accepted bot actions and49,000 detached-view checks;zero failures.
phase-report.json contains the per-phase counts. node --test
--test-name-pattern='property replay' test.ts PASS1 test/1,003 exact replay
streams,12,055.30ms. The1,000 additional seeds now are uniform unique
uint32 draws with sampler0x6040006,not sequential integers;their exact
values are in property-seeds.json. No game behavior changed or defect
was found;player gain0,no-gain streak1. node checksums.ts/--check PASS.

Round7 baseline node inline catalog/factory probe at65fe37c:all4 blank
truth cases accepted and invisibleTruthOption=true;catalog-before.json.
After schema refinement:all4 rejected before init/voting. npm run check and
FAST_TEST=1 node --test test.ts PASS28/28;node catalog-probe.ts PASS10,000
random valid rows (2,500 each number/choice/century/decade),30,000 bot
actions accepted by the actual reducer,7,500 valid controller defaults,
0 invalid. node generate.ts --check confirms160 sample bytes unchanged.
node mutations.ts PASS25/25 with28 focused baseline. node build.ts/--check
PASS493,491bytes;node browser.ts PASS22 scenarios,TV60.0028fps/p9516.80ms,
phone4×60.0020fps/p9516.70ms,0 requests/errors,reduced motion honored.
Capture8<10MB;node checksums.ts/--check PASS32 files. Valid injected-content
play improves by excluding invisible truth;no-gain streak resets0.

Round8 npm run check PASS;node league.ts and node league.ts --held-out
PASS24,000 matches total. Python comparison of baseline git-show JSON
to the new default report,excluding added seed bounds:all six reports
identical. Fresh seeds2,001–4,000:Quick Strong1786/2000(89.30%,lower87.95%),
Medium1949(97.45%,lower96.76%);Mixed Strong1973(98.65%,lower98.14%),
Medium1988(99.40%,lower99.06%);Bluff Strong1987(99.35%,lower99.00%),
Medium1991(99.55%,lower99.26%). Ties count as no win;all lower bounds>50%.
Cloud restart preserved source and the completed default report but killed
the just-started held-out process(empty log);after inspection it was re-run
successfully with the same declared seeds. node checksums.ts/--check PASS33.
No production change or defect found;player gain0,no-gain streak1.

Round9 npm run check PASS;node browser.ts --repeat=2 and --repeat=3 each
PASS22 functional scenarios,zero requests/errors and reduced motion.
Together with Round7 baseline:three independent processes,900 TV and900
phone frame intervals,all fps≥60.00,p95≤16.80ms. Actual measurements:
sample1 tv 60.0028fps/p9516.80ms;
sample1 phone 60.0020fps/p9516.70ms;
sample2 tv 60.0020fps/p9516.70ms;
sample2 phone 60.0036fps/p9516.70ms;
sample3 tv 60.0036fps/p9516.80ms;
sample3 phone 60.0032fps/p9516.80ms.
Separate browser-repeat-{2,3}.json,PNG and milestone9 captures retained
under10MB. node checksums.ts/--check PASS41 files. No production change
or player-visible defect found;player gain0,no-gain streak2.

Round10 npm run check PASS;node churn-probe.ts PASS1,000 random-seed
12-round games at2–8 seats (143 each2–7,142 at8),Quick334/Mixed333/Bluff333.
42,227 accepted inputs,21,906 timer advances,5,347 pause/resume pairs,
16,585 presence events,2,273 permanent-leave events,585 stale timer
rejections after presence-triggered phase changes,50 prototype-name
rosters,maximum153 steps;zero failures. Every result retains all initial
seats and matches an independent sorted-score rank/winner reference.
churn-report.json records counts. No production defect found;player gain0.
Rounds8/9/10 are three consecutive no-gain reviews. Final combined npm test
and actual final-head hosted CI still must pass before completion.

Final Round10 combined command npm test:EXIT0.51/51 node tests,
214,528.84ms;21,000 complete bot games,1,003 exact replays on the recorded
random seed cohort,1,000 timer-only cases,both10,000-case differentials,
9,000 bounds actions,300 style samples,7,000 phase states,10,000 catalog
rows/30,000 accepted actions,1,000 presence-churn games,25/25 mutations,
24,000 league matches,three complete browser runs/66 scenarios,42 hashes.
Actual final frame measurements:
run1 tv 60.0024fps/p9516.80ms;
run1 phone 60.0024fps/p9516.70ms;
run2 tv 60.0040fps/p9516.80ms;
run2 phone 60.0032fps/p9516.80ms;
run3 tv 60.0024fps/p9516.70ms;
run3 phone 60.0028fps/p9516.70ms.
Zero network/page errors and reduced motion honored;all captures<10MB.
Log:/tmp/G04-final-round10-npm-test.log. Current-head hosted CI remains
pending;its actual success is required before marking the job complete.

Final onboarding validation:bash /workspace/.onboarding/install.sh EXIT0.
Pinned shared/G04 installs,shared strict types/RNG/Zod loading,28 focused
regressions,160-row schema/regeneration,493,491-byte build identity and
42 checksums all PASS. Log:/tmp/G04-final-onboarding.log. No application
service is required;configuration draft saving remains separate from publish.

## Re-claim corrective milestone — proof pending

Fresh main/branches verified G04 lowest eligible, claim11:00:12UTC.
Normal new branch-from-main/original-history merge preserves PR4.
`npm ci --ignore-scripts --no-audit --no-fund` and pinned contractZod install: PASS.
Read original job rules/sources; actual pinnedZodLICENSE+liveupstream+OSI MIT
corroborate fullnotice retention. `node build.ts`2x/`cmp`,
`node build.ts --check`, `npm run check`: PASS;494642-byte page25e0b2.
Python eight runtime hashes/inline scripts comparison: all exactly unchanged;
fullMIT notice present0→1. Two managed `node browser.ts` actual-file attempts
failedERR_BLOCKED_BY_ADMINISTRATOR; pinned Playwright direct-file probePASS.
Actual-file22 functional scenarios passed; first coordinator barrier timedout.
Next full run via `G04_FRAME_BARRIER=.work/frame-window node browser.ts`
completed22 scenarios then phone framegateFAIL50.706750691FPS,p99166.6ms.
No source/cause/performance improvement claimed. Original passing report
retained for its original source; new snapshot remains pending.
Failure log is preserved; console elided some intervals, so full first failed
raw300 reconstruction is unavailable. Future raw retention must precede gates.
Unchanged core/gameplay checks remain accepted; new full CI still required.

Cadence audit: main claim11:00:12UTC, successful branch push11:31:26UTC,
elapsed31m14s: FAIL30-minute instruction by1m14s. This failure is retained,
not converted into a passing check. PR4 converted to draft via
`gh pr ready 4 --undo --repo luisitin/partybox-game-cores`; body now identifies
current cd20cb7, historical152e5a and pending phone proof separately.

Diagnostic command: `node .work/diagnostics/actual-file-frame-diagnostic.mjs`
START11:41:07.854/END11:41:20.703UTC, actual disk page25e0b2, source guards PASS.
Public nongating JSON and exact runner preserve all300 intervals/profile and
timer/LongTask observations; process-command monitoring stays private.
TV59.019079FPS, phone54.382275FPS, phone max200ms. Instrumented and concurrent
with other verification; NOT acceptance. Largest stalls after all seven bot
callbacks; phase write/no deadline transition; attribution unresolved.
No gameplay/performance change claimed from this evidence.

`npm run check` after raw-retention/frame-only runner update: PASS, strict ES2022.
No inline/runtime/gameplay file changed. Frame-only confirmation is pending.

`node browser.ts --frames-only`: EXIT1, start11:46:51.549UTC, actualfile25e0b2.
All owned heavy groups acknowledged STOP/closed before launch; no inference
about unobserved host work. Desktop300 consecutive intervals57.881535790FPS,
p9516.8ms,p9950ms,max83.3ms; mean gate>=59 FAIL. Phone not run. Complete
failedraw JSON/exact runner/log retained; all10 launch/end source hashes match.
This verifies pre-assert raw retention, not frame-rate acceptance.

`gh run view 37770616469 --repo luisitin/partybox-game-cores --log` read actual
final logs: FAIL setup exit124 at11:46:15UTC, OS ffmpeg installation exceeded
300s while still downloading packages; no core/browser suite executed. Exact
encoder-stage log retained in JSON. Pinned Playwright ffmpeg1011 actual
`-hide_banner -encoders` lists PNG and libvpx VP8; registry lookup succeeds.
Runner/workflow now use that existing pinned encoder; no OS apt setup.
Strict types and actual new codec capture remain pending, not claimed passed.

Encoder follow-up: first strict check FAILTS2769 because optional path escaped
closure narrowing; resolver now returns asserted string, `npm run check` PASS.
First `node capture.ts` FAIL254: pinned binary lacks image2/PNG input decoding;
exact error log retained. `-formats`/`-decoders` confirm image2pipe+MJPEG+VP8.
Change tool-only capture to JPEG pipe with existing pinned libvpx encoder.
`npm run check && node capture.ts`: EXIT0. Actual18-frame desktop conceal/reopen
capture157496 bytes,1.5s encoded at12fps, all11 source hashes identical, zero
HTTP/page errors. No frame filtering and no performance-gate weakening; no new
FPS pass claimed. Both build-page and eight runtime files remain unchanged.
`node checksums.ts && node checksums.ts --check`: new data/media integrity PASS.

KEEP11 pre-edit re-read/rank recorded in REVIEWS. Two baseline human/bot
JSONs+exactrunners retain25e0b2 actualfile event-order defect: visible0s,
lateanswer/vote1000 versus timer-first0, latefake menu2 instead1. Heldtimers
and wallclockjump limitations explicit. `node build.ts`2x+`cmp` and
`node build.ts --check` PASS:494865-byte e570 page. Seven non-UI runtime/data
hashes unchanged; ui.ts consumes due timer before dispatch/bot sample.
`node late-input.ts`: EXIT0,6/6 actualfile regressions, all sourceguards
match, zero network/errors; late credit0, truth-only menu, on-time/pause
controls1000. `npm run check` after test integration PASS. Guarded independent
phone deadlineclip209705bytes PASS, expiredcorrectclick→0/0/coveredprivateDOM.
Mainbrowser output names subsequently changed to milestone13 only; no runtime
change. Current full legacybrowser/FPS and exact-head CI remain PENDING.
Previous499 exact hosted logs actually read;51tests/25mutants/24kleagues,
66scenarios and6×300 near60FPS; no downloadedrawartifact configured.

Checkpoint 2026-10-08T12:59:20Z: exact25a6023 CI37777044855 SUCCESS, actual full logs
read,51 tests/21k games/25 mutants/24k leagues/6 late cases/66 browser
scenarios/6x300 host intervals near60FPS. Public ci-25a6023-success.json
retains logged aggregates; original workflow supplied no raw download artifact.
Local current fullbrowser22/22 passed, then TV300-frame gate FAIL55.903378092
FPS,p9516.8,p9983.2,max166.6; phone not run. All300 actual intervals, source
hashes, exact runner and log retained; no causal explanation claimed.
Evidence-only follow-up prints complete raw profile/final reports to CI logs
and adds always-upload artifacts; gates unchanged. Capture outputnames preserve
old media. Strict types PASS; actual milestone14 encoder clip156189bytes,
18JPEGframes, sourceguards match, no HTTP/errors; no FPS claim.
Cadence: checkpoint was not pushed by12:57:53 (previous push12:27:53).
This is a second observed30-minute cadence failure, not excused by compaction.
Actual push timestamp/overrun will be appended after normal publication.

Actual normal branch push7a7af73 succeeded12:59:30UTC (remote reflog),
31m37s since12:27:53: cadenceFAIL by97s. Next25min target13:24:30,
30min hard13:29:30. Own main claim259bffb refreshed before publication.

`node browser.ts --frames-only` current frozen e570/df8688fb runner,
actual start13:03:06.765UTC, closed by13:03:21UTC, EXIT1. All owned peer
heavy groups acknowledged closed before launch; no claim about unobserved
host workload. TV300 PASS59.605412FPS,p95/p9916.8,max33.4; phone300
FAIL54.056645FPS,p9516.8,p99116.6,max150. Zero errors/network; all16source
hashes match. Both full300intervals/exactrunner/log retained. This confirms
continued unexplained variance; neither scratch relocation nor game code
is established as its cause. No FPS improvement/player gain claim.

`gh run view 37780890383 --log` actual complete logs read. Exact7a7af73
CI SUCCESS13:06:22UTC: all51node/21k games/25mutants/24kleagues/6deadline
cases/66legacy scenarios/6x300 intervals/16sourceguards. Every raw/profile
and complete report parsed from realmachine JSONstdout; ninepublicJSONs
retain exact source/run provenance. Independently counted300intervals each;
all60.001992–60.003600FPS,p95/p99<=16.8. Artifact11551993174
634549bytes uploaded; actualdownload403. Its clip bytes/hashes are unread,
not inferred from uploadedmetadata. Local failedraw remains separate.
KEEP12 tooling-only: browser reports now include actual capture SHA256
and distinctmilestone15 filenames; no runtime/UI/data changes. Genuine
`node capture.ts --milestone=15` EXIT0:156846bytes,18frames, actual SHA in
source-bound report,11sourceguards match, zeroHTTP/errors. Encoding12FPS
is not a frameacceptance measurement. New independent browser-proof CLI
and focused corruption controls pending; fullcurrentCI remains required.

`npm run check && git diff --check`: PASS after tool integration.
`node browser-proof.ts --self-test --with-html-comment`: EXIT0,328.845ms,
completed13:19:50UTC. Actual current HTML harmless comment leaves old
JSON/media checksum gate PASS; new source guard rejects it; finally restores
play.html exactlye570. All23 corruption controls rejected, independently
recomputed actual1,800 historical host intervals/6profiles, all22x3actual
functional labels/source inventories validated HISTORY ONLY. Uploadedhost
clips remain unread; no historical fullcapture acceptance is claimed.
Real localmilestone15 clip156846bytes/SHA6609bc263b72bf2b7d994db2f5db43e67478b2d20509debef7e881355c5d8c8f
checked separately, never paired with host fullproof. Current CLI correctly
has no complete localcurrentproof; fresh3fullCIruns/actualcliphashes must pass.
Eight runtime/data files unchanged since deadlinefix; round12 player gain0,
no-gain streak1 pending exact newhead CI.

Exact5c45099 CI37783931074 SUCCESS; fullactual logs read,51tests/25base
mutants/24kleagues/6deadlinecases/66legacy scenarios. Nativeartifact
11553084981 archiveSHA0328f642c8260aaa6088379443226e71ffa0f5791e0a6b87bc1579197f46599e
matches GitHub digest. Actual3clips read; allbytes/SHA match live reports.
`node browser-proof.ts`: PASS locally on these actualdownloaded current
reports/1800raw/16sourceguards/3clips. Oldcanonicallegacy reports preserved.
Older7a artifact also nowread and hashes match; older unread status is historical.

KEEP13 `node late-input.ts`: EXIT0,8/8 actualfile controls, sourceguards
match, zeroerrors/HTTP; added exactly-at-deadline quickcorrect and bluffwrite
closures with zero latecredit/truth-only menu. `python3 .work/deadline-equality-mutation.py`
EXIT0,13:46:13.655→13:46:24.778: actual ui.ts now<deadline→now<=deadline
compiled into realHTMLa92dec1. Old6 suite with only private guard/output path
adaptations stillPASS6/6; new8 suiteEXIT1,catches BOTH exactboundary cases,
other6pass. Exactrunners/raw/logs retained; finally restoresUI57b121/playe570.
This is an additional actualhost mutant, separate from25required core mutants.
`npm run check && node build.ts --check && node browser-proof.ts`: PASS.
`node capture.ts --milestone=16`: PASS157763bytes/actualSHA/11guards/zeroerrors
andnetwork, noFPSclaim. Player behavior unchanged; no-gain streak2. New
exactheadCI pending. Latest successful push5c13:23:08; thischeckpointnormal
push must finish before13:53:08. Early13:48:08target was missed;30minhard
status requires actualremote timestamp, not assumed.

Actual normal5b99dae push13:52:31UTC:29m23 since13:23:08, binding30min cadence PASS; early13:48:08 target missed by4m23. Exact CI37787851588 SUCCESS13:59:13; `gh run view 37787851588 --log` actual225231-byte full logs read,51tests/25mutants/24kleagues/8deadlinecases/current proof3fullruns66scenarios1800unfiltered intervals16guards3actualcapturehashes PASS. Local phone54.057FPS failure remains separate and unresolved. Round13 no-player-gain streak2 complete.

KEEP14 `npm run check && node host-deadline-mutation.ts && node build.ts --check && node capture.ts --milestone=17 && node checksums.ts && node checksums.ts --check`: EXIT0. Actual TypeScript tool reconstructs archived original6 controls using only its own private guard/report paths, compiles real ui.ts <→<= comparator, then old6 EXIT0/PASS versus current8 EXIT1 with exactly the two exact-deadline cases failing and all original6 passing. Both raw reports/full logs retained under host-deadline-automated-*; always-finally restoration validates all13 guarded sources including original UI57b121/pagee570, even on failure. This is an additional actual host mutant, separate from the25 required pure mutants. npmtest now runs it after normal8 deadline controls and before the3 independent full browser runs. Strict types and original offlinebuild PASS. Source-bound milestone17 actual157527-byte VP8 clip/11guards/zeroerrors or network PASS; encoded12FPS is not acceptance. All108data/media checksums PASS. Runtime unchanged, measured playergain0/no-gain streak3, exact newhead CI pending. No unchanged local broad core/leagues/browser rerun.

## Legal re-verification recovery checkpoint, 2026-10-08 20:43 UTC

All commands below ran from jobs/G04-reality-check with Node24.19.0.
`npm run check` passed strict TypeScript after recovery.
`node --test strict-proof.test.ts` passed4 tests: exact identity refusal,
actual asynchronous nonce grant/closure,22 proof corruptions, and loaded
source/dependency coverage. Synthetic fixtures only test refusal logic,
not frame acceptance. Actual output is retained in
results/reverify-2019/strict-refusal-tests.log.
`node --input-type=module -e 'import {decodeCurrentCapture} from
"./strict-decode.ts"; for (const path of
["media/milestone-15-browser.webm",
"media/milestone-15-browser-repeat-2.webm",
"media/milestone-15-browser-repeat-3.webm"])
console.log(JSON.stringify({path,...decodeCurrentCapture(path),
scope:"decoded historical committed functional clip; not new native FPS evidence"}));'`
actually decoded all three historical clips, decoder exit0/36 frames each.
Full progress remains in results/reverify-2019/historical-clip-decode.log.
These clips and b18952bf CI37791478413 do not count as a fresh strict frame
sample. New native runs/current clips/current full CI are pending.
The production page, UI, core and bot remain unchanged, and the existing
three actual player-no-gain KEEP rounds remain valid.

## Actual supported-decoder repair and delivery, 2026-10-08 21:10 UTC

`G04_STRICT_FRAME_BARRIER_DIR=/tmp/g04-recovery-2040-coordination node strict-browser.ts`
ran the actual source-frozen be30189 local TV/CPU4phone profiles and separate
clips. Both exact3-key root grants, continuous hold/release receipts, all1200
raw intervals/1202 native timestamps/active witnesses, 1034 source identities
and full passed report are public under results/reverify-2019/local-be30189.
`node strict-browser-proof.ts` independently rechecked that actual source
while unchanged and decoded both clips; its actual output is archived.
This scoped local success used the registry's pre-existing symlink to
/usr/bin/ffmpeg7.1.5, not a genuinely downloaded pinned encoder binary.
TV59.902538570FPS,p9516.7/p9916.8/max33.2ms; phone59.507267920,
p9516.7/p9916.8/max49.9. The process naturally terminated/report passed;
no separate shell exit code was captured. No physical phone is claimed.

Actual full CI37841680065 at exact be30189 FAILED: pinned FFmpeg does not
support image2pipe,exit234, after every original check and both strict
native profiles passed. The complete180534-character log and genuine
1105157-byte archive11578870215 (SHAaa8cd3bd5ab53b36ae5cf37528f90dd4e2b3bebeb104976de745b03b2c8f2233)
are public in results/reverify-2019/host-failed-be30189. All19 ZIP entries
passed CRC/path/symlink checks. Independent original-gate validation passed
both600-interval profiles/1202 active witnesses; actual system decode
passed three36-frame originals and its new24-frame TV recording. The new
phone recording never ran. No full/current acceptance is claimed for FAIL.
The first auxiliary inventory comparison actually failed on the generated
contract/package.json. Exact old npm install in its own isolated temporary
folder reproduced the hosted4af0a865 byte hash (same JSON semantics).
All other1033 file identities matched; 58 Git inputs/1099 actual identity
assertions passed after accounting for the reproduced install output.
The correction adds --no-save, rather than ignoring the shared-file check.

`npm run check` and `node --test strict-proof.test.ts` passed on the repair.
`node --input-type=module -e 'import {readFileSync} from "node:fs";
import {selfTestCurrentCaptures} from "./strict-browser-proof.ts";
const report=JSON.parse(readFileSync("results/reverify-2019/local-be30189/report.json",
"utf8"));console.log(JSON.stringify({...selfTestCurrentCaptures(report,
report.sourceStart),scope:"current repaired decoder controls using genuine be30189 local captures; no fresh native FPS claim"},null,2));'`
passed18 meaningful counterfeits with both genuine positive clips: real
phone video coherently re-hashed as TV and coherently re-hashed invalid
media reject, along with stale source, bad decode/hash/size, fabricated
encoding FPS and missing/wrong gameplay witnesses. Exact clip bytes restored.
Logs final-repair-* are public. These controls do not rerun FPS for luck.

Actual decoder command: `/usr/bin/ffmpeg -v info -nostats -progress pipe:2
-i <actual-current-clip> -f image2pipe -c:v mjpeg -`, with decoded stdout
discarded after real decoding and actual stderr/exit/frame count retained.
It now asserts VP8 and actual1920x1080TV/390x844phone dimensions. Local
actual decoder /usr/bin/ffmpeg, realpath same, version7.1.5-0+deb13u1,
SHAe8a8d46f5225f3062cec7c07fb145d58ae73c603cb740dcd5bad34bfb54e455a.
CI explicitly runs `sudo apt-get update` and
`sudo apt-get install --no-install-recommends -y ffmpeg`; actual hosted
identity is recorded independently. The unchanged pinned encoder still
produces the footage; local symlink and genuine hosted encoder identities
are reported separately. Node/V8 identity also stays explicit.

`node checksums.ts` now recursively binds every public archived output,
including raw reports and ZIP source/artifact bytes; `node checksums.ts
--check` verifies it. Production data/UI/core/bot/page and the entire
strict-browser.ts sampler are byte-identical to be30189. No frame gate,
filter, native clock, warmup or bot workload changed. Current exact-head
full hosted checks/artifacts remain required before PR4 Ready.

An earlier accidental `npm run check` from the repository root failed
ENOENT because that folder has no package.json. Its real output is public
as actual-wrong-working-directory-command.log; the corrected job-directory
strict check passed. The G09 quiet hold was active21:08:57 and released
21:10:08.170786Z, causing the conservative21:09:18 buffered publication
target miss. Hard21:14:18 remains until actual push; no backdated cadence.

## Accepted exact runtime-source head and final handoff, 2026-10-08

Exact7e077efa11354e5f19f981b26975b7dcff1eae18 full CI37845083064
succeeded21:19:52Z. Actual full230849-character log read: every51 core
test,25 real mutants,1003 seeds,21000 bot roster games,1000 idle games,
20000 independent scoring comparisons,24000 skill matches,eight compiled
deadline controls,66 functional controls,1800 original frames,1200 strict
frames,1202 strict native/active witnesses,all18 real capture controls,
and147 final generated data/media/archive checksums passed.

Genuine artifact11579627268 is1428663bytes,
SHA2bc3f3d7e5d5b40f3ac3f2487b8a46394a5429ccfa7f77d68cc31f1b7fc81fa1.
Actual bytes were downloaded,all20 safe entries/CRCs checked.
`python verify-hosted-artifact.py --head 7e077efa11354e5f19f981b26975b7dcff1eae18
--run-id 37845083064 --evidence-dir .work/reverify-2019/host-7e077ef`
passed10862 independent assertions with its actual reader checksum
recorded in the public receipt. It derives all1034 current source identities
from exact Git bytes and independently archived public module bytes, checks
all native timestamps/differences/current phase/private draft/live timers,
recalculates all3000 unfiltered original+strict intervals, and fully decodes
allfive actual clips. ZIP/log/metadata/receipt/reader output are public in
results/reverify-2019/host-success-7e077ef.
The reader performs no browser launch or new FPS sample. It requires a
genuine actual.zip and artifact-metadata.json in its evidence directory.

Actual strict TV60.002400096FPS, phone60.002796130,allp99/max16.8ms.
The three originals span60.001992–60.003600FPS. Allfive decoded clips:
currentTV183578bytes/24frames1920x1080,phone151646/24frames390x844;
three originalTVclips214161/214161/211667bytes,36frames1920x1080.
All are real VP8;12encodedFPS functional footage stays separate from FPS.
Actual hosted Node24.21.0/V8 13.6.233.17-node.53,pinned capture encoder
SHA460d44f3416005662f528d4b92e7b94ace924e8a0288106d3803b73c56eaadc8,
actual decoder/usr/bin/ffmpeg6.1.1-3ubuntu5,
SHAed16af623947494a72e284b6eb8ff225f2da22b38b5d5069c2fd4b4ba3384e41.
These differ honestly from local Node24.19/systemFFmpeg7.1.5; no identity
equivalence is invented. Shared package bytes now equal exact Git bytes.

This last handoff records already accepted evidence and adds the independent
manual post-run reader; it leaves all1034 loaded runtime inputs and every
game/sampler byte unchanged. The manual reader is independently bound by
its own source checksum and does not run inside the sampled browser.
This documentation/evidence commit still requires its own exact-head full
CI and genuine artifact validation before original PR4 Ready. Subsequent
current proof belongs in the PR body without another publication cycle.

## Independent metadata audit — 2026-10-09

Original noCards declaration violates shared optional literal-true metadata rule
for160 English prompts. New focused regression genuinely failed once before fix:
actual true, expected undefined. Its original stdout/CLOSED classifier failure is
preserved; distinct reader naturally EXIT0 at03:35:34.679651Z, no test rerun.
Fixed controller naturally CLOSED03:37:37.935573Z, direct children reaped/owned
process groups empty. Local env FAST_TEST=1; Node24.19.0. Actual commands:

- npm run check: strict PASS.
- node fixtures.ts twice: identical manifest/7fixtures; fixtures unchanged.
- node build.ts twice, then node build.ts --check: identical/fresh PASS.
- node --test --test-reporter=tap test.ts:29/29 PASS,0fail.
- node generate.ts --check: original160 samples PASS.
- node --test --test-reporter=tap strict-proof.test.ts:4/4 PASS,0fail.

Pre-doc actual229-file source comparison:225 identical and exactlycore manifest,
test, manifest JSON and bundled page changed; all reducers/views/bots/UI identical.
Logs, original receipts and scope proof in results/audit-20261009.
Original canonical c81 full run37846802513/SUCCESS and official artifact11580178889
were fetched/read fresh. Genuine1444862-byte SHA56f9427d827bd42cb74b5656842e75dc1fb30402281fd1a15e80607756944a3c ZIP retained.
Original frozen verify-hosted-artifact.py with --head c81b0b7e69b19782613debbc1296c6d56f556927 --run-id37846802513 naturally CLOSED03:42:43.599512Z EXIT0:
10862 assertions/all1034 identities/all3000 raw/66functionals/allfive fullydecoded
clips PASS. Historical only. Corrected current full workflow, complete log,
genuine ZIP and unchanged original reader are pending. No local timing or full
npmtest trial was launched. All old failure bytes and predeclared gates preserved.

## Unicode normalization state-bound follow-up (2026-10-09)

Original Ready source738de72b is preserved. Complete commands/helpers/raw
outputs and all resource/source receipts are in
results/followup-unicode-20261009/proof.zip; its archive.json records actual
member count/full-read CRC/physical comparisons/bytes/SHA.

1. Actual old Node24 helper replay,8 players/12 Bluff rounds/seed91:
   U+FDFA.repeat(160) passes the original socket schema, normalizes to2880,
   stores96 oversized writes and reaches676419B; natural closure10:37:51.
   This catches post-transformation bounds and real saved-state growth.
2. Actual old-core negative command:
   FAST_TEST=1 CORE_PATH=/workspace/game-cores-G04-audit-20261009/jobs/G04-reality-check/core.ts node --test --test-reporter=tap --test-name-pattern='Unicode normalization' test.ts
   Actual EXIT1,2 failures/0 passes. Independent full-output reader accepts
   exactly the two expected refusal assertions; no rerun or false PASS.
3. Fixed bounded controller runs node node_modules/typescript/bin/tsc --noEmit,
   node generate.ts --check, node fixtures.ts twice, node build.ts twice,
   node build.ts --check, node checksums.ts and node checksums.ts --check.
   All PASS;seven fixture bytes unchanged;two identical current pages.
4. FAST_TEST=1 CORE_PATH=./core.ts node --test --test-reporter=tap test.ts:
  31 focused PASS including raw9→162-unit expansion,2880-unit expansion,
   Latin ligature161-unit rejection, three exact160-unit accepted boundaries
   and valid retry after refusal. No full local21k matrix claim.
5. node --test --test-reporter=tap strict-proof.test.ts:
   all4 original strict controls PASS, unchanged gates and actual dependency/
   encoder/decoder identities. Synthetic refusal fixtures stay controls.
6. Fixed pure helper:42 independent old/fixed benign games,all2–8 counts,
   all3 modes,seeds1/91;3395 event states, bot actions,TV/controllers/results
   exactly equal. Same declared worst-case96 refused writes completes at
  8995B peak; original262144B bound remains immutable.
7. Actual bounded pipeline NATCLOSED10:45:18.033477Z, all phases EXIT0,
   final owned groups empty/no signals, sampled peak425947136B under512MiB.
  2987 before/final inputs stable apart from declared generated play.html;
   pure before/final equal. Separately all1106 original physical source/Zod/
   runtime/helper SHA/stat guards unchanged10:46:33.874573Z.
   These are sampled process bounds, not instantaneous memory or speed gains.

No local browser, frame-clock or new performance attempt occurred. The full
original new-head npmtest workflow/genuine artifact/unchanged1034-source
reader/all original native raw and five decoded clips are pending and
mandatory before Ready. Previous Ready full acceptance is historical only.

Final staging command first ran checksums.ts from the repository root and
reported0 files, EXIT0; that is not job verification. Its1-byte new root
output and actual command/cwd are preserved in proof.zip. The original
67-member archive is retained privately; the70-member archive preserves
all original members byte-for-byte plus this diagnostic. Correct job-cwd
checksum write/check is required before publication; no test/native rerun.

## Catalog bound consistency (2026-10-09)
Complete probe/negative/fixed source/runtime/resource/raw receipts are in
results/followup-catalog-normalization-20261009/proof.zip; archive.json gives
full member CRC/exact byte comparisons and digest. Actual saved f79 catalog
regression command FAST_TEST=1 CORE_PATH=<saved-f79>/core.ts node --test
--test-reporter=tap --test-name-pattern='catalog truth normalization' test.ts:
EXIT1,one expected missing-exception failure/zero pass, complete TAP read.
New Node24 pipeline types/data/two fixtures/two builds/freshness/checksums PASS;
FAST_TEST=1 test.ts32 PASS; unchanged strict-proof.test.ts four PASS.
10000 seeded old/new normalization comparisons equal;2 overflow catalogs rejected,
3 exact160 display boundaries accepted/credited, including320 lowercase key.
42 oldReady/new games3395 states/actions/views/results exact. Same worst-case
96 refusals8995B. Actual closure11:10:33.286930Z, all3830 guards unchanged within
recorded declared-output scopes, peak436432896B<512MiB/no signals/empty groups.
First f79 workflow run37920764830/job113787854390 is metadata success; whole
decoded54-test log independently read. Official11611612904 expected1448737B/
SHA58c9f87a4b536df5df8d5de7b77353a4eaa1e0aed429db3d1b89787348145770.
Actual two configured403 downloads received0B; no whole/native/clip acceptance.
First broad failed controller flag is not a source mutation finding. New source
full original CI and unchanged complete-reader acceptance remain mandatory.

## KEEP1 accepted Unicode saved states
See results/keep1-unicode-state-20261009/proof.zip/archive.json for complete actual
commands/raw games/source guards/resource closures/whole official archives/errata.
1. Current e32 genuine original run37923500292 complete55-test log/all25 kills,
   official artifact11613082801 full1432496B/SHAb4d0a9cc873ca8958032d8005783fa8e5cbe7b4917aa74aeb4bd3379ab10a1c7:
   unchanged reader exacthead/run accepts1034 guards/3000 native/66 controls/5 clips,
   actual reception CLOSED11:33:23.361223Z/all277 inputs unchanged/natural closure.
2. Declared untimed original sample24 games:5256 events/2304 writes/288 rounds,
   all legal replays/independent6500-per-seat awards/private projections exact,
   max227496 under262144,3834 guards/256MiB60s/no signals; not a no-gain round.
3. Distinct maximal admitted catalog3 games/seeds1/2/3:657 events/288writes/36rounds,
   33 actual violations/max288469>262144; savedwhole games/replays exact.
   Observer CLOSED11:38:09.388481Z means measurements closed; stateContractPass=false.
4. Direct original U+0001/U+0007 catalog admission fields id/prompt/hint/fact/truth
   all accepted. Original write A+159 controls storesA, wholly blank refused.
   C0 v1 other workload retained; exact v2 valid3-byte fake/corrected raw-C0 catalogs
   full2 games438 events max182960 CLOSED11:44:01.243332Z. No cap changed.
5. FAST_TEST=1 CORE_PATH=/tmp/G04-e32-preserved-baseline-20261009/jobs/G04-reality-check/core.ts node --test --test-reporter=tap --test-name-pattern='malformed UTF16 and binary catalog' test.ts:
   actual EXIT1/oneexpected missing-exception failure/zero pass; complete TAP read.
6. Fixed node tsc --noEmit,generate.ts --check,fixtures.ts twice,build.ts twice,
   build.ts --check,checksums.ts/write+--check allPASS. FAST_TEST=1 test.ts34PASS,
   unchanged strict-proof.test.ts4PASS. Allseven original fixture bytes unchanged.
7. Fixed pure scripts42 old/new benign games3395 states/actions/views/results exact,
   10000 matching cases equal,42 malformed/control raw catalog admissions nowreject.
   Nine maximal valid3-byte/quote/emoji8-seat12-round games1971 events/864writes/
   108rounds, all complete replays, independent6500 scores exact,max151384<262144.
8. Actual fixed pipeline CLOSED11:47:48.214088Z,3834 guarded inputs stable except
   declared generatedplay.html, allchildren naturally empty/no signals, measured
   peak428769280B<declared512MiB/perphase60s. No local browser/frame clock.
Changed-head original whole CI remains mandatory before qualified gain/Ready.

## KEEP2 complex Unicode independent credit
Actualcomplete commands/helpers/raw/legalgames/guard/closure/wholeofficial0ad in
results/keep2-unicode-credit-20261009/proof.zip,fullmemberCRC/physicalcomparisons.
Corrected Node24 extra1003seed corpus under256MiB180s:1003fullgames/4012rounds/
48106events/20040writes/17033self-voterefusals/14037duplicateauthors/3007truthwriters,
zeroindependentaward mismatches/alllegal replay hashes equal;peak20251B;all3837
inputguards unchanged,naturalclosure12:03:03.525068Z/no signals/peak155627520B.
First childactualEXIT1 extra revealinputType assertion retained; all3837 failed
inputs independently unchanged12:02:45.669976; onlythreecompletedgames were saved,
failedmidgame rawunavailable disclosed. Corrected version addsper-eventflushing
and phase-aware assert only,keepinggame/corpus/budget/sampler unchanged.
Python saved-only reader whole1003gzip lines/48106 eventrows throughEOF,
20040award/10890ownershipassertions/alltotals+winnersPASS12:06:06.167093Z,
allfiveinputguardsunchanged,4499206B SHA14ef2989ccf9c1444c649a35b4c6f68212ddce3c0fada57ccb591b599a6ff936.
Local tsc/data/twofixtures/twobuilds/freshness/checksums/Fasttest35/strict4PASS,
pipeline3836guards/noactualoutputchanges/naturalCLOSED12:04:58.937904Z,
peak444301312B<512MiB60sphasebound.42benign3395states+10000matchingcases equal.
Exact0ad full57test/25mutant/originalwholeofficial reader all1034/3000/5clips
accepted11:59:05.436258; qualifiesKEEP1, historical for newtest source. No local
nativeclock. Currentnewfull remainsrequired beforequalifiedKEEP2 firstno-gain.

## KEEP3 independent text validation and admitted storage maxima
Complete exact commands/helpers/specs/raw/failures/guards/closure/whole current c30
in results/keep3-utf16-boundaries-20261009/proof.zip, all full CRC/physical comparisons.
Node24 finite256MiB180s producer:1120690 saved rows (65536 singles/1048576 paired/
5120 edges/1003 new seeds/455 catalog cases), zero independent decoder/schema/
factory discrepancies;2517 actual malformed refusals+retries;210 expected catalog
refusals.3840 guards unchanged/natural12:20:39.087683Z/peak145997824B/no signals.
Python strict UTF16 whole gzip EOF1120690 rows PASS12:22:19.475306Z,all6 input
guards unchanged; wrapper3843 guards/natural12:22:20.402726Z/peak14024704B.
Gzip10324975B SHA f450abe5087a1fc747a83304b3988f08151b419e993323fb04e79b6381135949.
Extra permanent test actual35pass/1fail raw161UTF16-unit/160-codepoint assumption;
original failed test/Zod4.6.5 checks.ts/source/log retained. Independent3839 guards
all equal12:24:20.215253Z; generic failed-wrapper booleans do not show mutations.
Correct only raw length oracle to pinned codepoints; storage limit still160 units.
Initial independent-wrapper existing-directory allocation failed before any child,
original helper/tool output preserved; corrected output path only.
Distinct Node finite256MiB180s maximum actual admitted 4byte catalogs/3byte fakes:
9 games108 rounds1560 legal events432 writes/max158015<262144/all independent
scores/replay exact;24 raw length/14 catalog-boundary controls;all3840 guards,
natural12:28:13.801737Z/peak87220224B/no signals.
Corrected Node36 focused/four strict/types/data/2 fixtures/2 builds/freshness/
checksums/42 benign3395states+10000 matching cases PASS12:29:02.179987Z;
3839 unchanged inputs/no output changes/peak431558656B<512MiB60s phasebound.
Original current c30 complete58test/25mutants/genuine full1433337B official accepted
12:16:38.815738Z, unchanged reader all1034/3000 intervals/66controls/five VP8 clips.
Current new test source requires original full again. No local browser/frameclock.
