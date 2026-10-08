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
