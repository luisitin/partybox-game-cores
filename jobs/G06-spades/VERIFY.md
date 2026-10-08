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
