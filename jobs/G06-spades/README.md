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
`node capture.ts --milestone=18`, then refresh hashes.
Browser checks use pinned Playwright Chromium (CHROMIUM_PATH is optional).
Every case opens the actual file. Both profiles retain900 unfiltered frame
intervals before asserting >=59FPS and p95<=18ms; 18 source hashes are retained
and CI uploads the actual reports/raw. Phone390×844/4×CPU approximates hardware.
`node capture.ts --milestone=18` records separately after speed measurements;
Use an unused number; existing clips/reports are refused before recording.
The encoded12FPS clip is not a speed acceptance measurement.
`node verification.ts --browser=browser-report.json --capture=capture-milestone-17-report.json`
independently checks all raw intervals, current source identity and actual clip.

`game` in core.ts implements the supplied shared contract. Cards, scoring
and bots are pure; own/public projections enforce privacy. Fixtures cover
blind,bid,exchange,play,trick,hand,done; generated schemas validate them.
SOURCES/RULES/CONFLICTS record live research and selected variants; CHANGES
explains every code change. BOTS and VERIFY report measured evidence.
NEXT is the current handoff; LOOP records post-green KEEP GOING rounds.

Earlier403-only research branch is preserved. G08 Shake Up is untouched.
Historical rounds remain; resumed rounds17–19 give streak3; final exact-head CI is required.
Optional G06_FRAME_BARRIER_DIR grants must echo the fresh READY profile,
sourceSha256 and attemptNonce exactly; old permission cannot release a new test.
The bundled Zod MIT notice is retained in HTML and the hashed notice file.
