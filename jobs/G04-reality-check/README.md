# Reality Check

A pure quiz and bluff core for 2–8 players, with one offline hot-seat page.
Quick, Mixed (default) and Bluff modes; 4/8/12 rounds; last round double.
Eight realms have 20 original fictional workshop rows each. Public clues
teach the controls; real content is the content-packs repository's job.

Open play.html from disk. No installation or network is needed to play.
Choose people or Easy/Medium/Strong bots, then reveal and hide each
controller before passing the screen. The host can pause, move on or end.
A replay seed reproduces the question order.

Development requires Node 24+, Chromium and ffmpeg:
```sh
cd jobs/G04-reality-check
npm ci --ignore-scripts --no-audit --no-fund
npm install --prefix ../../contract --ignore-scripts --no-package-lock zod@4.6.5
npm test
```

npm run build regenerates play.html; npm run fixtures regenerates all
seven phase fixtures. node generate.ts --check validates the byte-identical
160-row dataset. TypeScript is strict/ES2022; zod is the only runtime
dependency and is bundled into the delivered page.

core.ts exports the exact shared GameDefinition. createGame(rows) is a
local validated factory, not an established cross-repository engine ABI.
Rendering uses public/own-controller projections. Local devtools can
inspect data; hot-seat privacy requires other people to look away.

npm test covers contract invariants, 21,000 bot games, 1,003 exact replays,
1,000 idle games, independent 10,000-case numeric and bluff comparisons,
25 mutations, 12,000 skill comparisons, build identity, functional browser
privacy/timers/controls, frame times, reduced motion, captures and checksums.
VERIFY.md records actual outcomes and limits; BOTS.md scopes its benchmark.
NEXT.md records PR/CI/KEEP GOING progress. Completion is not implied here.
