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
