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
