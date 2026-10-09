# G02 — Gin Rummy

Pure deterministic TypeScript core following the workshop contract.
Standard and Oklahoma Gin; optional 3–4 seat winner-stays rotation.
Exact deadwood, chosen knock layouts, joint optimal defender melds/layoffs,
Gin, Big Gin, undercut, match/box bonuses and three bot skills are included.

Open **play.html** directly from disk: no server, build or network needed.
Two humans or bots play; three/four seats rotate through two active hands.
Cover private hands between turns. Bot move lets players set the pace.

Development/checks, Node22.16+ from this folder:

    npm ci --ignore-scripts --no-audit --no-fund
    npx playwright install --with-deps chromium
    npm test

npm run build strictly type-checks and regenerates the self-contained page.
npm run fixtures regenerates every phase fixture and manifest.
npm run league runs2000 games per adjacent bot-skill pairing.
src/core.ts exports game; src/cards.ts contains exact scoring solvers.
Zod is the sole allowed runtime dependency, inlined with its MIT notice.

RULES/SOURCES/CONFLICTS document researched rules and deliberate variants.
VERIFY/BOTS/LOOP/NEXT record checks, measured strategy and resume steps.
SHA256SUMS covers every delivered file; no trackers or runtime network.

Accepted2e949/run37907166446: all77 tests,6k exact every-event replays,
Strong1166/2000 andMedium1743/2000,26 actual mutations,1161 hashes/two gens,
current35 sources/1200 intervals/two full decoded recordings pass.
Whole official packet: evidence/audit-20261009/accepted-2e949/.

Finishing subset repair reproduces loss10→win4. Draw-boundary controls
preserve public-information strategy when hidden stock outcomes differ:
576 paired views/1152 choices and one actual compiled mutant pass.
Evidence: evidence/audit-20261009/KEEP-7-DRAW-BOUNDARY.md.
Bot report/index clarify current evidence; KEEP19–21 no-player-gain streak3.
Final exact-head full77-test hosted acceptance is required before PR12 Ready.
CPU4 Chromium evidence does not establish physical-phone/SDK integration.
Final review: evidence/audit-20261009/FINAL-REVIEW.md.
Prior genuine failures remain in the historical evidence.
