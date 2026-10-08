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
