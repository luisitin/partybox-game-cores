# Hearts

American Standard Hearts for3–6 seats, a pure strict TypeScript core and an
original CSS/SVG hot-seat page. Equal adjusted decks, rotating passes, both
moon scores, optional J♦, three bot levels and private controller views.

Open play.html directly in Chrome; everything is inline and offline. Pick
human/bot seats, names, finish score and house rules. Reveal only your own
hand, select three cards to pass, or click a legal card. Human tables wait
for Continue at public tricks/scores; the handoff holds optional turn clocks.
All-bot tables have an optional Fast mode. Keyboard Tab/Space/Enter works.
Defaults use fresh deals; enter a seed to reproduce one. The table saves locally
and Resume restores progress after reload with every private hand concealed.

For source checks use Node24, Chrome/Chromium and ffmpeg: `npm ci`, `npm test`.
`npm run generate` rebuilds the page, fixtures, schemas and reproducible leagues.
The one G05 workflow runs the complete suite and actual disk browser gate.
Managed cloud Chrome blocks file://; `G05_VISUAL_MODE=http npm test` is an
explicit partial local browser mode, refused in CI. No silent fallback.

Checks include1003 replay seeds,1000 full bot games per valid roster,
10,000 independent comparisons,25 mutations,2000 games per strength league,
all JSON schemas/hashes, two identical regenerations and60fps/reduced-motion
browser interaction checks. See VERIFY.md/BOTS.md for measured results.

Core entry: src/core.ts; shared types in contract/ are unchanged.
Cards0–12 are clubs,13–25 diamonds,26–38 spades,39–51 hearts; each suit is2–A.
Fixtures contain real pass/play/trick/hand/done states; no runtime fixture load.
Code/UI MIT; zod's MIT notice is inside the standalone bundle. No source art.
Resume/progress is in NEXT.md; PR5 is green at its baseline; KEEP GOING progress is in LOOP.md.
