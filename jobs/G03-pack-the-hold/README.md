# Pack the Hold — G03

Original timed polyomino race for 2–8 people, with exact optimum scoring.
Open play.html directly: no installation, build or runtime connection needed.
Choose human/bot seats, seed, difficulty, timer, rounds and optional mirrors.
Drag cargo; R rotates; arrow keys + Enter also place selected crates.

For development and all required checks:

    cd jobs/G03-pack-the-hold
    npm ci
    npm test

Node 24, Chrome/Chromium and ffmpeg are required by the verification tools.
The only runtime dependency is zod, bundled inline in the delivered page.
The core is src/core.ts and implements the unchanged public game contract.
Every phase has a real JSON fixture. RULES.md specifies the original rules;
PROOF.md explains exact search and the generator's independent certificate.

Calibration uses 2,000 greedy attempts per tier, not human playtest rates.
The rotations-only and mirrored editions are calibrated separately.
Each tier has twelve original holds; three-round voyages do not repeat a hold.
SHA256SUMS.txt also covers the delivered HTML and generated template source.

The current browser check opens the actual disk file by default.
G03_CHROME selects an existing Chrome or headless-shell executable.
For a separate local clip only, the runner supports --capture-only --http.
CI rejects HTTP mode and requires the real file:// check.

Rendering checks retain all900 native RAF intervals per TV/CPU4x phone profile,
require >=59fps and p95<=18ms, then independently recompute every statistic.
The28 source hashes bind each sample and separate capture to exact files.
Date.now is frozen by the host to keep setup waits out of human turns;
native RAF timestamps and outliers remain unchanged. CPU4x is emulation.

Current separate capture and its checks:

    node scripts/verify-visual.mjs --capture-report media/capture-17-report.json

Record a new unused milestone with the browser tool's --capture-only --record
--milestone 17 flags. Current17 is pending; failed14–16 are retained. Its encoded10fps video is separate from rendering proof.
Historical9362 evidence uses node scripts/verify-historical.mjs; current checks
require current sources. VERIFY.md records failures and successful hosted gates.
NEXT.md names the remaining exact-head delivery check and resume point.
