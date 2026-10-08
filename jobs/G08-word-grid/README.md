# Shake Up (G08)

Verification and improvements to the owner’s original game in `start/`. The name, models, film source and CSS are preserved; [START-HERE.md](START-HERE.md) and the [owner spec](start/games/shake-up/README.md) bind the work.

Open `play.html` from disk for offline hot-seat play:1–16people/bots,4×4/5×5, English/Spanish, full/common English word lists. Each person gets the same private clock on the same board; pass the device between turns and everyone else looks away. The page uses the original phone/TV components and their flat fallback. All code/content/licences inline; zero runtime network.

From this folder: `npm ci`, then `npm test` (all unit/research/differential/property/roster/league/mutation/rebuild/schema/browser/checksum gates). `npm run build:play` rebuilds the checked-in standalone page. `npm run test:unit` is the shorter regression suite. Chrome/Chromium and ffmpeg are required for browser/capture checks; CI installs the encoder if needed.

Managed local Chromium rejects file URLs; `G08_BROWSER_URL=http://127.0.0.1:8768/play.html npm run test:browser` explicitly records partial HTTP evidence. Actual disk verification is mandatory in CI. Actual disk CI measured59.89desktop/60.02CPU4phonefps with0network/errors; initial integrated run failed one report checksum, corrected for the delivery candidate. No completed PR claim yet. See [VERIFY.md](VERIFY.md), [NEXT.md](NEXT.md), [BOTS.md](BOTS.md), [CHANGES.md](CHANGES.md), and pinned [SOURCES.md](SOURCES.md)/[CONFLICTS.md](CONFLICTS.md).

Production SDK audio/3D/UI integration is unverified; explicitly test-only bindings implement the available actual root types for standalone checks. Manufacturer primary edition labels remain a recorded re-verification point; live independent GitHub/npm facts are used under root RULES.
