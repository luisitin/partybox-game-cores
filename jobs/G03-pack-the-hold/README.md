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

The cloud browser's managed URL policy currently blocks file:// navigation.
For partial local UI verification only: G03_VISUAL_MODE=http npm test.
That explicitly tests localhost HTTP and does not certify disk loading.
CI uses the default disk check; no HTTP fallback is permitted on CI.
VERIFY.md records exact results and pending delivery gates; NEXT.md resumes.
