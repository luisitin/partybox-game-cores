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

npm test covers contract invariants,21,000 bot games,1,000 presence-churn
games,1,003 exact random-seed replays,1,000 idle games,two independent
10,000-case scoring comparisons,25 mutations,24,000 skill matches,
7,000 adversarial phase states,10,000 varied valid catalog rows,and three
independent browser runs with privacy/timers/controls/frame times/reduced
motion/captures/checksums. VERIFY records outcomes;BOTS scopes its benchmark.
The additional strict proof binds every checker and loaded schema dependency,
retains 600 native frames and active timers per profile, and decodes both clips.
NEXT records PR/CI/KEEP GOING progress;completion requires actual hosted CI.
node host-deadline-mutation.ts also proves the real compiled deadline bug
is caught by current actual-file controls and restores the original page.

CI installs full system FFmpeg for independent decoded-frame checks;
Playwright's capture encoder is separate. Current artifacts retain both identities.
