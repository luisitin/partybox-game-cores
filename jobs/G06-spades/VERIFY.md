# Actual verification

2026-10-08:read current main README/RULES/JOBS/CLAIMS;G06 was lowest
unclaimed. git commit -m 'claim G06' and git push origin main succeeded.
Createdjob/G06-spades-core from main;oldresearch branch untouched.
Read each pinned SOURCES reference usinggh api repos/<repo>/contents/<path>
?ref=<sha> withAccept:application/vnd.github.raw+json. Files cached under
/tmp/G06-*. Inspected complete selected rule sections,scoring/exchange/
follow-suit implementations,fixtures/tests and bidding strategy reference.
Original-host403 does not block progress:the required GitHub fallback works.

G04 exact-head gate checked by GitHub REST:run37730054904 COMPLETED/SUCCESS
for152e5a0910887187d23e8ba8f47507537344394e,PR4head matches. PR description
updated with real final evidence;no new docs commit restarted that CI.

Core milestone, actually run 2026-10-08:
- `npm ci --cache /workspace/.npm-cache --no-audit --no-fund`: installed
  the pinned eight packages; Zod alone is a runtime dependency.
- `npm run check`: PASS strict ES2022 against the real shared contract.
- `node generate.ts`: PASS, 52 unique cards / 13 per suit, actual shared
  manifest validated, metadata/deck/JSON schemas regenerate byte-identically.
- `node fixtures.ts`: PASS, seven schema-valid/conserving phase states;
  done retains the score of its immediately preceding final-hand fixture.
- `FAST_TEST=1 node --test test.ts`: PASS 26/26, 331.44 ms. Checks suit
  obligations, trump, bags, nil/blind rules, contextual bids, exchanges,
  private-view/bot independence, wrong inputs/timers, frozen-state purity,
  pause/resume, departures, every phase exit and explicit idle VIP end.
- `node pilot.ts`: exploratory 100 matches per comparison, not the required
  league. Cutthroat sharp vs normal:74 outright wins,77 pairwise wins;
  normal vs easy:88 outright/95 pairwise. Partnership sharp team vs normal
  team:74/100; normal vs easy:100/100. Completed in14,196.71 ms. No ties.
- Two additional manual complete seeded matches: three players seed1,
  18 hands/1325 inputs/final scores547,379,-200; four players seed1,
  17 hands/1212 inputs/final side scores53,525. These catch early stalls
  and illegal bot inputs but are not substitutes for required simulations.

Required delivery still includes
strict types,contract/manifest/fixtures,purity/privacy/random-seed properties,
1,000 bot games at3 and4 players,two hardest-function implementations diffed
10,000 times,25 mutations with≥24 kills,2,000 matches per skill pair,
standalone offline page,TV/4×CPU phone60fps/reduced motion,captures/checksums,
and actual hosted CI before KEEP GOING/completion. No unrun result is PASS.

Expanded verification, actually run before the browser milestone:
- `node differential.ts --write`:PASS scoring10,000/trick10,000 cases,
  seed100717055, zero mismatches. Includes4,402 nil/4,469 blind cases,
  5,702 bag penalties,2,241 failed/2,279 made contracts and4,91817-card
  cases. Independent ledger uses per-bag increments/reset; winner uses
  suit/rank ordering rather than the production comparison loop.
- `node mutations.ts --write`:PASS25/25 assertion kills, baseline28/28;
  no timeout/import/syntax errors counted. Initially the eleven-bag mutation
  survived because examples had11/26 cumulative bags. Added the exact10
  boundary, then reran all25. The complete list with failed test names is
  `mutation-results.json`;10 scoring,5 card and10 reducer/privacy bugs.
- `node --test test.ts`:PASS31/31,177,636.08 ms while league ran concurrently:
  28 focused,1,003 full seed replays,1,000 full3p and1,000 full4p matches.
  A subsequent expansion to sampled settings is pending full rerun.
- `FAST_TEST=1 node --test test.ts`:PASS28/28,327.20 ms after presence and
  malformed-ID fixes.60 lowest-club leads across both Cutthroat decks also
  pass. New initial-offline and partial-end tests failed before fixes;
  malformed object actor separately reproduced TypeError before guard.
- `node league.ts --write`:PASS8,000 complete games in286,438.80 ms;
  all four95% win-rate lower bounds>50%; exact rates/protocol in BOTS and
  `bot-results.json`. Maximum final state5,634 bytes, maximum48 hands.
- `node build.ts` then `node build.ts --check`:PASS byte-identical offline
  page488,969 bytes. No external scripts/styles/resources; all dependencies
  are inline. Strict compiler also passes with DOM.Iterable enabled.
- Browser harness corrections: virtual time must be installed before UI
  timers, and a collapsed rules panel must be opened before reading its
  rendered text. These were harness failures, not scoring/rule changes.
  Browser completion/performance, the final full pipeline and hosted CI
  remain pending until their actual results are appended here.

Browser milestone,2026-10-08:
- `node browser.ts --write --capture`:PASS eight grouped scenarios,
  three complete UI matches(partnership and both Cutthroat decks), all
  displayed controls/drafts/privacy checks, reduced motion, no overflow,
  zero application exceptions and zero external requests. Partnership uses
  the standard52-card/dealer-lead rules; Cutthroat settings are disabled there.
-900 live rAF intervals at1920×1080:59.6709fps, mean16.7586ms,
  p95 16.8ms,max50ms.390×844/4×CPU:60.0024fps,mean16.6660ms,
  p95/max16.8ms. This is a browser/CPU approximation, not a physical phone.
- Managedfile:// navigation rejected by policy; exact HTML bytes exercised
  through setContent, all outside requests aborted and counted. No service.
- `npx playwright install ffmpeg` returned403 on the encoder host. Used
  the existing `/usr/bin/ffmpeg` through an external Playwright cache link;
  capture succeeded. No blocker or changed game rules/assets.
- Actual TV/phone PNGs and an eight-second WebM inmedia/. Capture<10MB.
  `node checksums.ts` and`--check` cover the complete delivered path set.
- Complete final`npm test` (including expanded settings) and hosted CI
  are still pending; this milestone is not a DONE assertion.

The25 planted bugs, each killed by actual assertions:
1. Exact contract treated as failure.
2. Contracts worth nine instead of ten.
3. Failed contract awards points.
4. Blind nil loses double bonus.
5. Nil success/failure signs reversed.
6. Bag penalty waits until eleven.
7. Bag carry uses nine.
8. Carried bags ignored by penalty.
9. Failed nil silently rescues normal contract.
10. Nil tricks stop counting as bags.
11. Follow latest card rather than original lead.
12. Unbroken spades always leadable.
13. All-spades exception removed.
14. Lower rank beats higher rank.
15. Hearts become trump.
16. Blind decision leaks own hand.
17. Four-player bids exceed thirteen.
18. Duplicate exchange accepted.
19. Wrong actor accepted.
20. Spectator input accepted.
21. Stale phase nonce ignored.
22. Early deadline accepted.
23. Pause stops freezing input/timer.
24. Exact500 fails to end match.
25. Shared leading tie ends match.

Contract coverage:unexpected events/all-phase fuzz(1);frozen states and
four-module clock/entropy/I/O scan(2);stale/early timers and shifted pause
deadline(3);seeded full-match byte replay and finite bounded JSON(4);
six-viewer hidden-hand/stock substitutions, detached views and public-only
bot comparisons(5);every phase skip, active completion and idle VIP end
under unlimitedDuration(6);all original seats/departures and finite results(7).
Also schema-valid bots(8),actual shared manifest/seven valid fixtures with
final-hand→done score equality and exact regeneration(9).

Final local delivery gate,2026-10-08:
- `npm test`:PASS(exit0). Strict types; exact schemas/deck/manifest/fixtures/
  HTML;19 hashes; both10,000-case independent differentials;31/31 core
  tests176,823.52ms, including sampled-setting1,003 seeded full replays and
  1,000 full matches at each roster;25 genuine mutation kills;8,000 league
  matches284,678.31ms, exact recorded counts reproduced;all8 browser groups,
  zero requests/errors. Fresh900-frame samples:TV60.0024fps/p95 16.8ms,
  4×phone60.0028fps/p95 16.7ms, both max16.8ms. Reduced motion passes.
- Subsequent explicit storage/bot envelope coverage:
  `FAST_TEST=1 node --test test.ts`:PASS28/28. All three skills for six
  viewers in each fixture return schema-valid input or null.
  `node --test --test-name-pattern='seeds 1/2/3' test.ts`:PASS,1,003 full
  sampled-setting match replays,93,236.49ms; every event's exact JSON now
  also asserts≤256KB. The last-state bound alone was insufficient evidence.
- Read-only regeneration/hash checks and required hosted CI are the final
  gates on the pushed delivery. Local success does not establish CI green.
- `bash /workspace/.onboarding/install.sh`:PASS(exit0), pinned shared/job
  installs, strict shared types, RNG/Zod smoke,28 focused checks333.52ms,
  exact deck/manifest/schemas/fixtures/488,969-byte HTML and19 hashes;
  external Playwright system-ffmpeg recorder fallback is available.
- `node mutations.ts`:PASS25/25 again after the every-event storage and
  all-fixture bot-envelope assertions; baseline28/28, no startup/timeouts.

KEEP GOING round1:
- GitHub REST/PR head match:badf4005bd3961764492a4f48f6047af3fa249cc,
  run37738084749 COMPLETED/SUCCESS,2026-10-08T06:46:28Z. Initial green gate.
- `node /workspace/.onboarding/G06-phone-audit.mjs`:before valid40-character
  names expanded390px to830px; after wrapping,390px exactly. Keyboard focus
  remains a separate confirmed defect for the next round.
- `npm run check; node build.ts; node browser.ts --write --capture --repeat=2`:
  PASS10 groups,zero requests/errors,900frames each. TV59.0837fps,
  mean16.9251ms,p95 16.8/max50.1;4×phone60.0025fps,mean16.6660ms,
  p95/max16.8. Offline HTML489,042bytes. New eight-second capture<10MB.
  Both editions test maximum names before/after opening the private hand.

KEEP GOING round2:
- `npm run check; node build.ts; node browser.ts --write --capture --repeat=3`:
  PASS11 groups; native follow-suit handover now focuses legalcard15,
  page-level Enter plays it. The old handler left body focused,card null.
  Long-name390px bounds remain green. Zero exceptions/requests.
 900frames each:TV60.0029fps,mean16.6659ms,p95 16.7/max16.8;
 4×phone59.8030fps,mean16.7216ms,p95 16.8/max50.0. Reduced motion passes.
  Offline HTML489,057bytes;new eight-second capture<10MB;27 hashes.
- `node /workspace/.onboarding/G06-phone-audit.mjs`:seed1 confirms focused
  card15 is one of the legal diamonds15/16/25 after a diamond lead.
- Read-only bot review probe:all12 seat/skill policies return Next during
  each2-second trick and15-second hand review.24 premature advances are
  a confirmed remaining defect; recorded before a pacing fix.

KEEP GOING round3:
- `npm run check; node fixtures.ts; node fixtures.ts --check`:
  PASS, all7 fixtures regenerate exactly, final human Next matches the
  done fixture byte-for-byte. Holds8s/60s/90s; all24 review policies now
  return null, compared with24 premature Next inputs before the fix.
- `FAST_TEST=1 node --test test.ts`:PASS28/28,383.73ms,including real17-trick
  three-player progression into its90s review and pause/deadline regressions.
- Initial parallel broad run started before fixture regeneration and read
  an old2s deadline:30 pass/1 fail. Corrected dependency ordering and ran
  `node --test test.ts` again:PASS31/31,160,476.53ms;1,003 every-event JSON
  replays plus1,000 full3p/1,000 full4p timer-driven matches. No race retained.
- `node mutations.ts --write`:PASS25/25 genuine kills,baseline28/28.
- `node league.ts --write`:PASS8,000 matches,230,678.18ms. All recorded
  win/tie/hand/step counts unchanged; maximum final state5,637bytes.
- `node browser.ts --write --capture --repeat=4`:PASS11 groups and three
  complete UI games;assert7.9s trick still present then scheduled advance.
  Zero requests/errors,reduced motion.900frames each:TV/4×phone60.0024fps,
  mean16.6660ms,p95 16.7/max16.8. New8s capture<10MB;31 hashes.

KEEP GOING round4:
- `node --input-type=module` Playwright probe before the fix,all-Alex names:
  partnership4 identical `Pass to Alex` labels,Cutthroat3 identical labels;
  each roster had only1 distinct handover. No hidden cards were inspected.
- `npm run check; node build.ts`:PASS strict types,HTML489,201bytes.
- `node browser.ts --write --capture --repeat=5`:PASS13 groups,including
  every duplicate-name bid handover with its actual expected owner cards,
  concealed transitions and names resembling generated seat labels.
  Distinct handovers1→4(partnership),1→3(Cutthroat). Three complete UI
  variant games pass;zero errors/external requests;reduced motion honored.
 900frames each:TV59.7368fps,mean16.7401ms,p95 16.8/max50.0ms;
 4×phone59.8695fps,mean16.7030ms,p95 16.7/max50.1ms.8s capture<10MB.

KEEP GOING round5:
- `node league.ts --write --start=2001`:PASS8,000 fresh full matches,
 221,792.38ms,2,000 per comparison/seeds2001–4000. Outright wins3p
 strong1497/74.85%,medium1780/89.00%;4pstrong1521/76.05%,medium1997/
 99.85%. All eight outright/pair95% lower bounds above50%;zero pair ties.
 Largest final state5,643bytes. BOTS and the held-out JSON contain all
 counts/assumptions. Unchanged policy passes;no player-visible gain.

KEEP GOING round6:
- `npm run check; node churn.ts --write`:PASS1,003 cases/seeds1,2,3 plus
 1,000 unique random seeds;181,386 events,24,407.93ms,all seven phases.
 Includes9,468 pauses/9,370 resumes,12,243 drops/9,623 reconnects,
 5,424 permanent-left/3,242 kicked events and145 prototype-name rosters.
 Every event passes input immutability,restored deterministic replay,Zod,
 conservation and256KB bounds;all initial seats retain finite results.
 45,036 hidden-hand/RNG view substitutions and135,108 all-skill bot
 comparisons are identical. Maximum state5,650bytes. No core change needed.
- `node churn.ts`:PASS read-only recomputation,24,210.28ms;all recorded
 counts reproduce exactly. `node checksums.ts --check`:PASS39 paths.
- `node /workspace/.onboarding/G06-qa-captures.mjs`:two independent8s
 captures of the unchanged UI for QA rounds5/6,335,495/352,191bytes,
 zero requests/errors. Both media files are hashed;no copied media.

KEEP GOING round7:
- `stat -c '%W %Y %w %y' /tmp/G06-round4-browser.log`:prior audit start/
 finish07:35:08.58/07:41:57.45UTC,408.87s. `npm run check` passes.
- `node browser.ts --write --capture --repeat=6`:PASS13 groups,55.2595s,
 86.5% shorter;product timers/policy/layout unchanged. Exact final UI/core
 scores agree in all3 full variants;7.9s reader hold assertion still passes.
 Zero errors/requests;all controls/privacy/name/keyboard/reduced-motion
 regressions pass.900frames each:TV59.4739fps,mean16.8141ms,p95 16.8/
 max83.3ms;4×phone60.0028fps,mean16.6659ms,p95 16.7/max16.8ms.
 Separate8s capture<10MB. Third consecutive no-player-gain round.

Final full behavioral snapshot, before the dependency-notice-only follow-up:
- `bash /workspace/.onboarding/install.sh`:PASS shared strict/RNG/Zod,
 pinned npm ci,28 focused tests(346.90ms),all regeneration and43 hashes.
- `npm test`:EXIT0,31/31 core tests(162,501.19ms),20,000 independent
 cases/zero mismatches,25/25 genuine kills,1,003 churn cases/exact report
 (23,315.94ms),both8,000-game league reports/exact counts(226,887.39/
 219,010.66ms),13 read-only browser groups(49,793.64ms). Generated
 data/fixtures/page and43 hashes are unchanged. No failing check remains.

Additional delivery review8:
- `npm run check; node generate.ts --check; node fixtures.ts --check;
 node build.ts; node build.ts --check`:PASS. Full committed/installed Zod
 MIT notices match and the complete notice is embedded,HTML490,317bytes.
- `node browser.ts --write --capture --repeat=7`:PASS13 groups/54,913.91ms,
 exact UI/core score parity in all3 variants,zero errors/requests/reduced
 motion.900frames each:TV59.9357fps,mean16.6846ms,p95 16.7/max33.3ms;
 4×phone59.8692fps,mean16.7031ms,p95 16.7/max50.1ms.8s capture<10MB.
 Notice-only change;four consecutive rounds have no player-visible gain.
- Python iteration of every `media/*.webm` executes
 `ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of json <clip>`
 and `ffmpeg -v error -i <clip> -f null -`:PASS9/9 full bitstream decodes,
 every clip8s/960×540/VP9 and<10MB,largest465,700bytes. Full metadata
 saved in `/tmp/G06-final-media-audit.json`;all delivered clips are hashed.
- `node checksums.ts --check; node build.ts --check; npm run check`:
 PASS48 hashes including dependency notice,byte-identical artifact,strict
 contract types. Core/strategy source is unchanged from the full-suite pass.

Strict reclaim14:33:57UTC main8527676; freshclaims andALL17matchinggamebranches read, bothG06committertimes08:18:18UTC/previousday15:05:29UTC beyond6h. Branchcreatedfromclaimedmain thennormalmerged0037add preservingPR7. RootREADME/RULES/JOBS/selectedRULES/SOURCES read; livepinnedPagatmirror/HughesREADME reread. Originalexact0037CI37748960265SUCCESS08:34:15, actual57410-character fulllogs read:31tests/25genuine assertionkills/1003presence/16kskills/13browsergroups. Originalhost900/profile60.002264/60.002128FPS,p95<=16.8; no raw arrays available then.

`npm run check && node build.ts --check`:PASS before actualdisk suite. `G06_FRAME_BARRIER_DIR=.work/frame-current-9 node browser.ts --write --capture --repeat=9`:EXIT1, actualstarted14:45:02, TVready14:45:25.491, granted14:48:59, TVclosed14:49:14.993 and suitefinished14:49:15.095. All11functional groups and3completeUI games PASS withexactindependentcore scores[226,503]/[547,397,86]/[368,305,518]; zeroHTTP/pageerrors, all17guardsmatch. TV900unfilteredmean58.381168051FPS,p9516.7,p9916.8,max216.6ms FAIL >=59gate; old55gate wouldacceptthese exactframes. Phone NOTRUN after assertion. Actualfull900/raw/exactrunner/log public; sourcewas original325fc75/490317-bytepage. NewRAFfirstcallbackonlyinitializestimestamp, no validintervalfiltered. Video/sourcehashing/screenshots occuraftersampling; per-profilegrantscoordinate peers only, no causeclaimaboutremaininghostvariance. No unchanged acceptance retry.

`node capture.ts --milestone=9`:PASS95054bytes, actualfile4/3seatconceal/draft/restart/reduced-motion checks,10currentsourceguards/zeroHTTP/errors. Encoded12FPS isnot acceptance. Independent `.work/audit-blind-gap.ts` baselineEXIT0/23.017ms gamework naturallyreaches seed1 hand2 scores50–53. Gap0leadingplayersdenyblindnil; trailingplayersofferpre-lookchoice. Actualprobe/raw archivedbeforewordingchange. RelabelAny score→Tied or behind; no minimum deficit, preservingeligibility/reducer/botpolicy.

`node generate.ts` twice plusactualSHAfilecmp:PASSfour regenerateddatabytes identical; `node fixtures.ts --check`:PASSall7unchangedvalidphases; `node build.ts` twice+SHAcmp and`--check`:PASS490342bytes/current81acc8a73244a8df72f34cfda1d6dbedc4ac2cfd9e075c1ee2ce88ec09161e41; strict`npm run check`:PASS. `node capture.ts --milestone=10`:PASS95068bytes/genuineactualSHA/10guards/zeroHTTP-errors andcurrentwording. `node checksums.ts && node checksums.ts --check && git diff --check`:PASS56data/media/artifacthashes. Originalreducer/eligibility/botstrategy unchanged; no localunchangedfullcore/leagues rerun. Hostedcompletechecks/newactualrawsourceguarded>=59/p95<=18 requiredbeforePR7ready.

Corrective KEEP10, actually run after c609 exactCI37797062112 SUCCESS15:14:30Z:
- Native full93,785-character actual log inspected:31/31 core tests,25/25 real assertion kills,1003presence,16,000skill games,13functional groups/exact3 UI-core results PASS.
- Native artifact11558968769 fresh FileService reference immediately curl-downloaded. Actual8,220-byte ZIP SHA1dcdd3090f6c9e176fc943fa9c2dc837131e161c3180369cedea6164fc8a4efe matches GitHub digest. Safely extracted all3 actual report/raw files; no missing-byte claim.
- `node .work/verification-draft.ts` imported by actual-byte script before runtime/runner edits: independently accepted all1,800raw intervals/17currentguards, TV60.00240009600384/phone60.00266411828685FPS,p95<=16.7ms. Archived byte-identical report/raw and actual runner snapshot with explicit c609 historical provenance; no transfer of its source proof to later runner commits.
- `node --test verification-test.ts`:PASS8/8 in469.356ms initially, all55 negatives catch stale/absent guards, malformed profiles/raw/stats/sidecars, false exactseed44 scores, application/network failures, source/currentclip corruption and incomplete reports. Re-run actual log/controls preserved. Positive frame fixture is the genuine CI archive; no successful frame dataset was invented. Hosted npmtest additionally checks its actual newly completed current report and then all55 controls.
- Initial strictTSC FAIL TS2769 from optional undefined assert.throws predicate; corrected only test call overload, `npm run check`PASS after correction. No runtime failure is counted as a positive.
- `node capture.ts --milestone=11`:PASS actualfile/source-bound functional-only clip95268B SHAf79b71281da98daec522f5812466c1953fa693260106149aa42cd5b3058a16b0,10matching sourceguards/zeroHTTP-errors. Actual completion2026-10-08T15:18:48.938Z. `node verification.ts --capture=capture-milestone-11-report.json`:PASSactualbytes/all10currentguards. Encoded12FPS remains not a speed claim.
- `node build.ts --check`:PASS exact490,342-byte page81acc8a73244a8df72f34cfda1d6dbedc4ac2cfd9e075c1ee2ce88ec09161e41. Reducer/UI/scoring/botpolicy/frame thresholds unchanged. Optionalcombinedcapture now rechecks errors/HTTP after recording and logs after final timestamp/sourceclose.
- New exact-head fullhosted npmtest is PENDING; no unchanged localfullbrowser retry. Previous58.381FPS localFAIL/phoneNOTRUN and cause unresolved remain preserved.

Corrective KEEP11 after40eb223 exactCI37800519599GREEN15:36:35Z:
- Actual full97,619-character native job113391158441 log inspected:31core/25realmutants/1003presence/16k skill matches/all13browser groups PASS. Hosted independent current CLI checks all1,800raw/17guards, TV+phone60.002400096FPS/p95<=16.8 andactual95,268B currentclip; all55negativecontrols/8groupsPASS. Receipt explicitlyhistorical after newrunner edits; no separately read newartifactbytes claimed.
- `node --test .work/frame-coordination-draft-test.ts`:independentprivate9/9 PASS579.678ms; strictlimited2-filecompilerEXIT0. Promote exacthelperbody andadjustonlytestimport.
- `npm run check`:PASS strictcurrentproject afterintegration. `node --test verification-test.ts frame-coordination-test.ts > .work/verification-round11.log`:actual18/18 PASS,56negatives in historical/framevalidationgroups plus9 realtemporary-filecoordination groups. CurrentCLI refuses reallegacy17guardreport; archived17allowedonlyby explicitlyhistoricalexport and archivedactualrunner bytes. Hostedcurrentmode requires18 and adds2 missing-helper negatives (58 total) pending.
- Noncecontrols cover realoldmarker removal, postREADYsame-sourceoldgrant rejection, wrongprofile/hash, invalidJSON/nonobject/missingnonce/extrafields, twofreshsequential grants, timeout and otherprofilemarkerpreservation. No browser, fakeframe or gamepolicy is involved in those controls. Existingrecordedframefailureis not blamed onstalegrants; originalattemptuseddedicateddirectory.
- `node capture.ts --milestone=12`:actualcurrentofflinefunctional-only95304B SHA3adc9589b87577e96e52757e06c815cf244877aef8f98f5e3f2b1d359e344beb,10equalguards/zeroerrors-HTTP, finished2026-10-08T15:42:29.758Z. `node verification.ts --capture=capture-milestone-12-report.json`:PASSactualbytes/all10currentguards. No newlocalfullframeattempt.
- Currentruntimepage490,342B/SHA81acc8a73244a8df72f34cfda1d6dbedc4ac2cfd9e075c1ee2ce88ec09161e41 andallgame/UI/scoring/botpolicy unchanged. New18guard/nonce runner exactfullCI is pending.

Corrective KEEP12 after416afd1 exactCI37803971795GREEN16:04:51Z:
- Actualfull99,343-charjob113403259966log inspected:31core/25realmutants/16kskills/13browser/18focusedgroups and58CURRENT-sourcecorruptioncontrolsPASS. HostedCLI independentlyverified1,800raw intervals/18guards,TV60.0024/phone60.0028FPS/p95<=16.7,actual95,304Bclip/10guards. Receiptclearlyhistoricalafterfurtheredits; no separatelydownloadednewZIPclaim.
- Private real CLI preflight controls3groups/12rejections PASS8,519ms preservedexisting actualcapture12 bytes/reportsha; neverlauncheda newbrowser. Promoteonly explicitargument/range/collision guards; sourcehistory remains.
- `npm run check`:PASSaftercurrentcapturetoolchange. `node capture.ts --milestone=13`:PASSactualcurrentfileclip95085B SHA1df6c6c07b08a336fa171b5b83772e8de30c424b4b308e1957d27ffb5c73bd7b,10matchingcurrentguards,zeroHTTP/errors,actualfinish2026-10-08T16:09:57.652Z. `node verification.ts --capture=capture-milestone-13-report.json`:PASS actualcurrentbytes and10guards.
- `node --test verification-test.ts frame-coordination-test.ts capture-preflight-test.ts > .work/verification-round12.log`:PASS21/21,56historicalframe negatives+12real CLIpreflight controls; all existing13media/metadata bytespreserved. Hostedcurrent18guarddata exercises58frame controls instead ofhistorical56. RequirednewexacthostedfullCIpending.
- No repeatedlocalfullframe/core/leagues; runtimepage490342B/SHA81acc8a73244a8df72f34cfda1d6dbedc4ac2cfd9e075c1ee2ce88ec09161e41,game/UI/botpolicy/scoring/frame59-18unchanged. Oldvalidcaptures remainhistorical aftercapture.ts changes and cannotprovecurrenttoolsource.

2026-10-09 pre-edit immutable review 2026-10-09T05:07:07.154379+00:00: compare every path from
`git ls-tree -r --name-only 48430c9861534edfef8c59528de4279ebd6cec78 -- jobs/G06-spades/`
with `git show <canonical>:<path>` using full bytes before editing. PASS all119
retained job files. This detects accidental source, media, workflow, fixture or
baseline-evidence alteration; it does not substitute for full current npm/CI gates.
No new local native frames/full timing trial has run in this continuation.

2026-10-09 actual before/after recovery checks: `node --test failed-nil-test.ts`
PASS5groups; actual original module diagnostic3FAIL2PASS retained. Full legal
seed377 event prefix and continuations, independent ledger and card-winner
reference, default/Easy RNG controls,400 genuine first hands and hidden-view
controls delivered. `npm run check && node build.ts` PASS; newpage490391B.
Original seed44 three complete core outcomes unchanged226/503,547/397/86,
368/305/518. `python /tmp/G06-run-capture14-20261009.py` actual original
`node capture.ts --milestone=14` PASS05:30:34.417327/all3892guards/88884B/0HTTP.
This does not run native frames. Parentexact0ed full genuine99998native and
104105BofficialZIP/all1800raw/18guards/18decodedVP8 PASS05:28:24.442692.
See public archive:42members/936433B/SHAb63c8cf8e12a7c97748e29e7dc47bbd1a34958260cdad1294cda2ea0081fce4c.
Full changed-head original npm/CI and renewedthree-round stop are pending.

### Original failed-nil golden recovery, prepared 2026-10-09T06:04:30.287444+00:00
First full changed-head5f5 original CI correctly rejected stale churn data after
all36 core/tactical groups,20,000 independent differentials and25 real mutants
passed. Actual original1003-seed generator includes failedNilCounts=true, so the
adopted strategy changes six counts while total181386 events, all seven phases,
145 prototype-ID cases,45036 privacy and135108 bot-privacy comparisons stay equal.
The original churn generator and every assertion are byte-unchanged. Its exact
--write command genuinely regenerated twice, closed05:58:36.829927 and05:59:08.791894
EXIT0/groupempty, byte-identical, all3414 immutable inputs unchanged. Old golden
764fcdd7… and new43f1a188… are both preserved; only generated data is replaced.
Fresh unused functional capture15 closed06:01:36.454117,88875B, all3897 frozen
inputs unchanged, zero network/errors. It is never a native FPS result.
The entire50960-character failed native log and90497B real official3-member ZIP
are preserved. Its uploaded browser-report is inherited historical data: no
current raw frames or leagues were invoked, so it proves neither current.
Public proof archive media/failed-nil-churn-recovery-20261009.zip: 30
safe unique fullyCRC/byte-verified members, 1002136B SHA256 9c399c7170fb51c1fec4b2ba7f622e464131fc330870fc4befd85c58c2a74222.
Package/workflow only select capture15; original core/scoring/churn/mutation/
league/native-frame assertions and literal gates are unchanged.
Current full CI/genuine original reader remain required; PR16DRAFT, KEEP14
tacticalgain still provisional/streak0. This is delivery correction, not a
formal after-green no-player-gain round. Preserve actual failed source and prior
35m05 source interval/miss; do not retry unchanged timing samples.

## Current changed-policy acceptance, 2026-10-09

Exact092 full original CI37891792425/job113694132749 SUCCESS. Actual whole official11598961283:98094bytes/SHA25679f7f837c67d033f2c5afbc60d951b35edc0cf6fdd0538d8cf9eede966399499. Full original reader naturally closed06:36:23.607811Z, EXIT0/all272outerguards unchanged. All36core groups,21focused groups,25genuine mutation kills,1003full-match byte replays,16000leagues,1800native intervals/current18sourceguards,10clipguards and18actualVP8frames accepted. TV60.0028001307/CPU4x60.0029281429FPS; p95 16.7/16.8ms. Physical-phone approximation and historical58.381FAIL retained. No unchanged native timing trial.

See failed-nil-current-full-acceptance-20261009.json and media/failed-nil-current-full-acceptance-20261009.zip for the full native/whole official/raw/complete original reader and before/after guards. Initial text wrapper added one terminal LF: retained initial101310-character result; fresh exact101309 text matches entire connector raw and saved-evidence reader passed unchanged gates. This is a source qualification milestone, not an invented no-gain round. KEEP14+120 is qualified; renewed no-gain streak0. Previous source06:06:05.327440Z→hard06:36:05.327440Z was exceeded; actual source publication and lateness must be recorded without backdating.

2026-10-09 KEEP15: after f92 full genuine acceptance, rankfive in private/public audit; preserve the last trump under final-two-trick contract pressure with a contributing already-failed partner nil. Legitimate seed674/bid9 normal+sharp first action41→29/team-190→-10(+180), original independentledger agrees. Real olddefault3FAIL3PASS/candidate6PASS/all3423physicalguards;400genuinehands/67100unaffectedchoices/5268live-nil observations. Broadernilproposal rejected for100-point bag cliff; newpredicate requiresfourthcard/last2/missing>=2. Defaultfalse/Easy/live-nil/cutthroat unchanged. Fresh actualunusedfunctionalcapture16 PASS; current originalchurn-twice and whole newfullCI acceptance still REQUIRED/PENDING. All original scorers/reducer/churngenerator/league/sampler/strictgates unchanged. See failed-partner-nil-audit-summary.json, both fulllegal replayJSONs and media/failed-partner-nil-audit-20261009.zip. No overallleague/hardware/timinggain claim.

2026-10-09T07:26:32.561418+00:00: delivery qualification update: ORIGINAL unchanged churn.ts --write ran twice under3426 full frozen inputs, both natural EXIT0 and groups empty; overallclosed07:15:16.046646Z. Both1003-seed/181386-event outputs are exactly the old golden SHA43f1a188f8cc4c2e91d98e896e97ec4b569282eeeecca778e89329d3b0ab7537; no golden or assertion edits. Durable archive media/partner-nil-parent-and-churn-20261009.zip contains all24 actual parent-f92/full-native/whole-official/original-reader and new churn-twice/controller/freeze/raw members, 804376B SHAd3cd27bd5e60e0682adf9ed9a527144e1149c79da0bcdd7392169ec0ba90c417. Original earlier42-member player-probe archive remains immutable. Prior hard07:10:55.187634Z was missed; actual publication timing is retained, never backdated. Current changed-source full42/21 groups,25 mutants,16k leagues/native/whole official still pending; KEEP15+180 provisional/noGain0. This delivery is not a new KEEP round.

2026-10-09T07:55:58.428415+00:00: exact3cb genuine ORIGINAL FULL acceptance closed07:47:19.366624Z:42core/21focused/25real mutants/1003byte-replays/16k leagues/1800native intervals/18source guards/58negative frame controls/12capture controls/full18VP8frames; all276Git/3434physical runtime/Python inputs unchanged. Whole official11602332026/98166B SHAc063f6e1d9eb2a5d6d07154326f141c543319f424e2316791da4c7675f10503f; full102264-character native string saved exactly. TV60.002800130672775FPS andCPU4phone60.00252810651755FPS/p9516.7ms, approximate notphysicalphone. KEEP15+180 nowQUALIFIED at3cb;noGain0. Current full public archivemedia/partner-nil-current-full-20261009.zip/29members/811885B SHA8700cfd7666f9e9aadf5cfe8c85cb26bc40a9383ea3d5583fa2985f8bf820208; allactualfilesCRC/member-bytes readback. Following after-green reread/rank5, an unadopted opponent-nil own-score-only probe naturally closed07:50:50.095661Z:13000complete hands/897308legal schema+conservation+immutability+replay events/22changed choices; noown-score gain/all3430frozen inputs unchanged. Opponent score margin andcarried-bag effects were not evaluated, so research remainsINCOMPLETE and noformal no-gain round is counted. Full new proof-only-head workflow/whole artifact remainspending; no runtime/gate/native-sampler or policy adoption.

Actual5dd whole acceptance 2026-10-09T08:28:07.780175+00:00: run37901931935/job113726262828/official11603441218,98170B SHAdaf17aa2d4259e58e3aa3790944ea5db3268526a95b03df747d8e8a61ed8eb8e. Entire102308-character native original equals saved readback. Original reader, full18-frame VP8 decode,278 currentGit files/3436 physical guards all PASS;42core21focused25realmutants1003fullbyte replays16k leagues1800raw58negative12capture controls. TV60.00240009600384FPS and CPU460.00266411828685FPS with p9916.8ms; functional clip18frames/88884B. This confirms current proof-only head, without changing gameplay or counting an extra KEEP round. All actual whole originals/controllers/maps are in media/opponent-nil-current-head-20261009.zip (24 members,528949B SHA65a635f22217982dac359a09e257499a538d53826498e9d07fa41f1e6ad8ccfe). KEEP16 is still INCOMPLETE/noadoption/noformalnogain/streak0. Shared native quiet and three actual pre-download receiver failures are explicitly recorded. Actual milestone publication missed08:26:29.471114; exact source receipt records actual closure/lateness, never backdated.

KEEP16 narrow failed-opponent-nil proposal adopted for current full verification. Genuine seed577, own numeric6/opponent9, p2+p3nil; at fourth card/final2 both contracts need2. Old duck18 scores own-160; legal trump41 scores-40: own+120, opponent0, margin+120 across all200 independent bag0..9/nil50+100 boundaries. Broad one-sided guard was rejected because it can deny opponent bag penalty. Original legal prefix/full two terminal traces are in failed-opponent-nil-replay.json. Six new focused groups PASS08:47:00.784193 after actual old policy3FAIL/3PASS;400 real hands67100 unaffected comparisons20184 live-opponent-nil observations, hidden-hand and one-trick-deficit controls. Actual private import-copy TS2307 failure is retained separately; corrected production diff is one predicate, using public information. Original churn generator/assertions unchanged, regenerated twice and BYTEIDENTICAL old43f1a188 golden,1003seeds181386events;3436 guards PASS08:56:11.868634. Functional original capture17 PASS08:51:23.313448 with3920 guards; this is not a native timing measurement. Whole raw archive media/failed-opponent-nil-audit-20261009.zip: 55 members/2510614B/SHAb0c3ab9ccdf7994ef806a11f279a17ba6c55cc1b35636943c04b42241ef9e67c. Prior5dd whole original accepted08:28:07.780175; current changed-source original full and whole genuine packet PENDING, so gain PROVISIONAL/noGainStreak0/DraftPR16. Original ReadyPR7 unchanged. Actual milestone deadline09:01:13.479797 missed; exact source receipt records real closure/lateness without backdating.
