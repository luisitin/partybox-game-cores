# G02 — Gin Rummy

Pure deterministic TypeScript core following the workshop contract.
Standard and Oklahoma Gin; optional 3–4 seat winner-stays rotation.
Exact deadwood, chosen knock layouts, joint optimal defender melds/layoffs,
Gin, Big Gin, undercut, match/box bonuses and three bot skills are included.

Open **play.html** directly from disk: no server, build or network needed.
Two humans or bots play; three/four seats rotate through two active hands.
Cover private hands between turns. The bot move button lets players set pace.
Scoring and optional clock settings are shown before dealing.

Development/checks, Node22.16+ from this folder:

    npm ci --ignore-scripts --no-audit --no-fund
    npx playwright install --with-deps chromium
    npm test

`npm run build` strictly type-checks and regenerates the self-contained page.
`npm run fixtures` regenerates every phase fixture and the manifest.
`npm run league` runs2000 games per adjacent bot-skill pairing.
`src/core.ts` exports `game`; `src/cards.ts` contains exact scoring solvers.
Zod is the only allowed runtime dependency and is inlined in the offline page.

RULES/SOURCES/CONFLICTS record read sources and deliberate variants.
VERIFY records commands/coverage, BOTS measured win rates, LOOP improvement
rounds, NEXT resume steps. SHA256SUMS covers every delivered data/media file.
No external art, trackers, hidden-card strategy access or runtime requests.

Prior accepted3bf3456/run37886788920 passed the full original63 tests,
6000 every-event replays, two2000-game leagues,26 compiled mutants,
521 file hashes, native1200 browser intervals and two fully decoded clips.
The full genuine artifact11596602554 is retained in accepted-3bf3456/.
Initial-presence, guaranteed Gin and already-zero-deadwood finishing pickup
repairs are accepted at that historical source head.

The next bounded Strong-knock repair chooses lower positive deadwood only
when the exposed melds are identical. Current leagues pass58.30%/87.15%,
all26 compiled mutations are caught; fresh browser/full CI are pending.
Both original PR2 and supplemental PR12 remain Draft; renewed KEEP streak0.

[Current evidence](evidence/resume-20261008/INDEX.md) and
[retained timing failure](evidence/reverify-1900/REVIEW.md) document scope.
Original native FPS/clock/corpus/guard gates stay unchanged; hosted CPU4
Chromium evidence is not a physical-phone or PartyBox SDK claim.
