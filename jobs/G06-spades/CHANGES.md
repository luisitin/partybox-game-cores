# Code changes and reasons

Initial core milestone (2026-10-08):
- `cards.ts`: canonical 52-card identifiers, original-lead follow-suit,
  unbroken-spade exception and detached trick winner. Centralize legality.
- `scoring.ts`: independent contract/nil awards, carried ten-bag penalties
  and documented failed-nil contribution toggle. Resolve source conflicts.
- `core.ts`: exact supplied GameDefinition, strict Zod inputs, seeded deal,
  locked bids, pre-look blind decision, sequential two-card exchange, all
  seven phases, side scoring/results and data-only review deadlines.
  Pause, presence, VIP skip/end and permanent departures retain all seats.
  Unlimited classic matches preserve the 500-point rules without a cap.
- `core.ts`: views expose public table information plus only the viewer's
  revealed hand; foreign hands/stock/exchange selections stay private.
  Retain four reports to bound saved-state size. Bot wrapper first checks
  public eligibility to avoid cloning views for every inactive seat.
- `bots.ts`: separate public/own-view policy; easy randomized play, medium
  honour/trump bidding and contract play, sharp nil assessment, cheapest
  winning card, public void/history inference and partner protection.
  Blind decisions receive no hand and no policy sees the undealt stock.
- `runner.ts`, `pilot.ts`, `test.ts`: full-match driver, small exploratory
  skill pilot, 26 focused assertions and pending full replay/completion
  suites. Frozen-state, detached-view and private-substitution checks.
- `data-schema.ts`, `generate.ts`, `fixtures.ts`, `preflight.ts`: validate
  actual shared manifest schema, canonical deck and complete phase states;
  regenerate metadata byte-identically. Last scored hand leads to done.
- `checksums.ts`: hash every delivered data/media file, validate both the
  path set and bytes; include the standalone page when it is built.
- Pinned package/lock/strict ES2022 TypeScript configuration: Zod is the
  sole runtime dependency; reproducible local and forthcoming CI checks.

No source code, card art, models, assets or AI weights were imported.

Presence/conservation regression fixes:
- `core.ts`: apply the existing disconnected-seat default logic during
  initialization too. A first actor already offline otherwise stalled a
  populated table until the host intervened. Empty tables still wait.
- `runner.ts`: count partial trick cards by whether they were collected,
  rather than by phase name. VIP end preserves uncollected cards in done;
  the old verification helper falsely counted51 instead of52 cards.
- `test.ts`: both new regression tests failed before the respective fix.
- `fixtures.ts`: add read-only exact-byte regeneration checks for CI.

Full verification and standalone page:
- `reference.ts`, `differential.ts`: independent imperative scoring ledger
  and ordered-key trick winner;10,000 seeded cases each, both editions and
  all scoring toggles. Persist reproducible case counts and assert drift.
- `mutations.ts`:25 isolated one-bug copies exercise the actual focused
  suite; reject timeouts/import/syntax errors as kills and record failures.
  `test.ts` now explicitly checks exactly the tenth bag after a threshold
  mutation exposed the gap in the initial boundary coverage.
- `league.ts`:2,000 complete matches for each of four skill/edition pairs,
  rotated seats, explicit third easy seat in Cutthroat, conservative ties
  and Wilson bounds. Replay committed measurements in the final pipeline.
- `shell.html`, `ui.ts`, `build.ts`: original CSS cards and shared table,
  all house-rule controls, three/four human/bot rosters, private hot-seat
  handover, pre-look blind choice, sequential exchange, legal plays,
  point ledger, pause/skip/end/restart and visible review countdowns.
  Escape names; remove hands from DOM on handover/pause. Preserve selected
  exchange cards and bid drafts across hide/pause, with keyboard focus.
  Bundle all code/Zod inline; validate exact rebuilt HTML and no externals.
- `tsconfig.json`: include DOM.Iterable for browser node-list iteration.
- `core.ts`: reject non-string actor identifiers before own-key lookup.
  A JSON object with a null toString reproduced a TypeError; the all-phase
  fuzz test now checks both input and presence payloads of that shape.
- `test.ts`:60 lowest-club initial leads across both Cutthroat decks;
  all1,003 replay seeds now sample all house-rule booleans/presets too.
- `browser.ts`: real-control tests, complete games for both editions/decks,
  privacy/drafts/keyboard/pause/house rules and900 live frames per viewport.
  Install virtual time before application timers; CPU-throttled performance
  uses real time. Managed file blocking is recorded, with exact-byte fallback.
- `package.json`, `.github/workflows/G06.yml`: wire every required local
  check into npm test and a read-only, actions-only,30-minute Ubuntu PR gate.
  Browser checks open the rules panel before asserting its rendered text;
  disabled Cutthroat-only/partnership-only settings are tested in context.
  Runtime setup links the installed system ffmpeg when its download403s;
  no downloaded source or encoder binary is committed.
