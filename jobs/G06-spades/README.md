# Spades

Open `play.html` directly from disk: four-player partnerships or three-player
Cutthroat, humans or easy/medium/strong bots. Everything is inline and offline.
Pass the screen to the named player; others look away before opening a hand.
Blind nil offers its choice before revealing cards. Select two cards for each
sequential exchange; a partner may return cards just received.

Target500, nil/blind nil, ten bags→−100 and carried remainders. House rules
include blind eligibility/exchange, half nil bonuses, failed-nil contribution,
−500 mercy and both Cutthroat deck/first-lead presets. Leading ties continue.
Pause/resume, legal skip, explicit end and new table are available. A partial
hand stays unscored on host end. Long matches have no arbitrary round cutoff.

Development requires Node24+, Chromium and ffmpeg. From this directory:
```sh
npm ci
npm install --prefix ../../contract --ignore-scripts --no-package-lock zod@4.6.5
npx playwright install --with-deps chromium
npm test
```
Zod is the only runtime dependency. `npm test` runs strict contract types,
exact data/fixture/page regeneration, hashes, two10,000-case differentials,
focused invariants,1,003 complete seeded replays,1,000 bot games per roster,
25 genuine mutations,1,003 presence-churn cases,16,000 skill matches and
actual browser controls/frames.

Regenerate with `node generate.ts`, `node fixtures.ts`, `node build.ts`;
then `node checksums.ts`. Capture a new visual milestone with
`node browser.ts --write --capture --repeat=2`, then refresh hashes.
Browser checks use `/usr/bin/chromium` when present, otherwise Playwright's
browser. Managed file navigation blocking uses exact-byte `setContent` with
external requests aborted and records that limitation. Delivered HTML has
no service requirement. Phone measurements use390×844/4×CPU, not hardware.

`game` in core.ts implements the supplied shared contract. Cards, scoring
and bots are pure; own/public projections enforce privacy. Fixtures cover
blind,bid,exchange,play,trick,hand,done; generated schemas validate them.
SOURCES/RULES/CONFLICTS record live research and selected variants; CHANGES
explains every code change. BOTS and VERIFY report measured evidence.
NEXT is the current handoff; LOOP records post-green KEEP GOING rounds.

Earlier403-only research branch is preserved. G08 Shake Up is untouched.
KEEP GOING's three no-gain rounds passed;final exact-head CI is on PR7.
The bundled Zod MIT notice is retained in HTML and the hashed notice file.
