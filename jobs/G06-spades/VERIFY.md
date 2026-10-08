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
