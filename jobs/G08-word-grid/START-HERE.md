# G08 Word Grid: START HERE (do not rebuild from scratch)

The owner already has a finished outside build of this game, called **Shake Up**, in `start/`. It is a complete PartyBox-style game: pure server reducer, phases, bots (easy/normal/sharp), word lists (en + es, MIT/CC licences in `start/games/shake-up/content/SOURCES.md`), letter-cube sets for 4x4 and 5x5, TV + phone React clients, 3D station models (tray, cubes), two films (opening, outro) and 17 test files with 200 seeded sims.

Your job is to **verify and improve Shake Up**, not to write a second game. Keep its names, files and assets. Work inside `start/` (move it to `shake-up/` in your branch if you like) and record every change in CHANGES.md.

Read first: `start/games/shake-up/README.md` (the spec), `start/HANDOFF` notes inside it, `ASSUMED-SDK.md` (SDK calls it guessed), `start/sdk-tasks/dice3d-letter-faces/README.md`, `start/cine/shake-up/README.md`.

Known open items (from the hand-off; fix or prove each, log in VERIFY.md):
1. The 25-cube English 5x5 set is "a reasonable mix but not playtested": research the real published 5x5 sets (2 sources), then measure with 10,000 seeded grids per set: mean and spread of findable words, share of grids with under 60 words, Q handling. Pick the best set and justify it.
2. The English list is permissive (accepts TONDINO, HOIDEN). Build an optional "common words" list (e.g. intersect with SCOWL 70) as a setting; measure how many words each list finds per grid.
3. Spanish cubes were written by hand: same measurement as item 1.
4. Bots: measure easy/normal/sharp against the full solver on 2,000 grids; sharp should feel strong but beatable (report found-share per level).
5. Duplicate-cancel scoring, Q-u, minimum length and adjacency rules: test them against the official rules (2 sources).
6. The 12 contract-invariant checks in RULES.md: run them on the reducer standalone against `contract/` types; anything that needs the real SDK, stub it in a test-only file.
7. play.html: a hot-seat page from the existing client pieces, no rewrite of the visuals.

Never change: the art, models, film look, or the game's name. Never commit the `standin/` or `harness/` folders of the original build (they are not here on purpose).
