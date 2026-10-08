# Shake Up (G08)

Verified and improved from the owner’s existing game in `start/`, with its original name, models, films and CSS preserved. [START-HERE.md](START-HERE.md) and the [owner spec](start/games/shake-up/README.md) bind the work.

Open `play.html` from disk for offline play with 1–16 people/bots, 4×4/5×5 boards, English/Spanish, and full/common English dictionaries. Each human gets an equal private clock on the same board; pass the device between turns while others look away. Bots play during the first turn. Bots-only sessions show public counts. The original phone/TV components use their authored flat fallback.

All code, dictionaries and legal notices are inline; no build or network is needed to open the 14.2 MB page. Keyboard: arrows move, Enter/Space trace, Escape clears. A cancelled New game preserves progress; a confirmed restart keeps setup choices and chooses a fresh seed. Enter an old seed to replay deliberately. Long names and 16 tied winners fit the phone; full results include awards.

From this folder, `npm ci` then `npm test` runs every mandatory gate. `npm run build:play` regenerates the page. `npm run test:unit` runs the shorter regression suite. Chrome/Chromium and ffmpeg are required; CI installs the encoder when needed.

Current verification uses the locked Playwright disk browser for four profiles: English4×4 and Spanish5×5 at TV1920×1080 and phone390×844/CPU4. Each retains600 unfiltered native frame intervals; acceptance requires at least59FPS and p95≤20ms. Native keyboard/touch/privacy/phase recordings run separately after timing. Shared local measurements require an exact root nonce grant while the real game is paused, then resume the live hunt before sampling. Current exact-head full push/PR CI and independently checked raw/capture artifacts are the delivery gate; historical denied-file/HTTP/FPS attempts and the interrupted/corrected verifier preflights remain in [the recovery record](review/repair09/RECOVERY.md). Explicit HTTP/native-only diagnostics are rejected by full CI.

[PR #9](https://github.com/luisitin/partybox-game-cores/pull/9), [rules](RULES.md), [research](SOURCES.md), [conflicts](CONFLICTS.md), [bots](BOTS.md), [verification](VERIFY.md), [changes](CHANGES.md), [KEEP GOING](LOOP.md) and [resume status](NEXT.md) contain the evidence. Five functional rounds fixed layout, restart, focus, Spanish host text and bot observation; rounds 6–8 changed documentation only.

Explicit test/offline bindings exercise the available root contract. Production SDK audio/3D/UI integration and manufacturer primary edition labels remain re-verification items; pinned live fallback sources are permitted by root RULES.
