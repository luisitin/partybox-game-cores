# Hearts

American Standard Hearts for3–6 seats, a pure strict TypeScript core and an
original CSS/SVG hot-seat page. Equal adjusted decks, rotating passes, both
moon scores, optional J♦, three bot levels and private controller views.

Open play.html directly in Chrome; everything is inline and offline. Pick
human/bot seats, names, finish score and house rules. Reveal only your own
hand, select three cards to pass, or click a legal card. Human tables wait
for Continue at public tricks/scores; the handoff holds optional turn clocks.
Manage holds optional clocks and preserves your selection when closed.
All-bot tables have an optional Fast mode. Keyboard Tab/Space/Enter works;
scored outcomes retain keyboard focus and announce every winner.
Defaults use fresh deals; enter a seed to reproduce one. The table saves locally
and Resume restores progress after reload with every private hand concealed.
Received cards are marked in your hand; mobile results appear above the table.

For source checks use Node24, Chrome/Chromium and ffmpeg: `npm ci`, `npm test`.
`npm run generate` rebuilds the page, fixtures, schemas and reproducible leagues.
The one G05 workflow runs the complete suite and actual disk browser gate.
Managed system Chrome may block file://. Set `G05_CHROME` to an unrestricted
Chrome/Chromium executable for the actual-disk check. HTTP mode is historical
partial evidence and cannot satisfy the current delivery gate.
For fresh nongating clips: `node scripts/capture.mjs --record --milestone NN`
with an unused two-digit milestone. This checks functionals, not frame rate.

Checks include1003 replay seeds,1000 full bot games per valid roster,
10,000 independent comparisons,25 mutations,2000 games per strength league,
all JSON schemas/hashes, two identical regenerations and600 consecutive
frames per desktop/CPU4x phone profile (≥59fps,p95≤18ms), plus reduced motion.
The current proof binds raw timings, every functional gate and the actual clip
to30 source hashes. Clips must fully decode; four real damaged/substitute-media
controls run in the suite. See VERIFY.md/BOTS.md for evidence and scope.

Core entry: [src/core.ts](src/core.ts); shared contract types are unchanged.
Cards0–12 are clubs,13–25 diamonds,26–38 spades,39–51 hearts; each suit is2–A.
[Fixtures](fixtures/) contain real pass/play/trick/hand/done states.
[Rule choices](RULES.md), [source receipts](SOURCES.md) and [bot results](BOTS.md)
explain the chosen settings and measured checks.
Code/UI MIT; zod's MIT notice is inside the standalone bundle. No source art.
[NEXT.md](NEXT.md) records current delivery/resumption status;
[LOOP.md](LOOP.md) records every measured review round.

Historical exact3c28358 full CI passed. Its 60-frame warmup precedes all600
retained intervals per profile. Local58.634/57.695fps failures remain unexplained.
The verification update needs its own exact-head full CI; PR5 is draft.
