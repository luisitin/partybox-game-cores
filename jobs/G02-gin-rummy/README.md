# G02 — Gin Rummy

Pure deterministic TypeScript core following the exact workshop contract.
Standard and Oklahoma Gin; optional 3–4 seat winner-stays rotation.
Exact deadwood, chosen knock layouts,
joint optimal defender melds/layoffs, Gin, Big Gin, undercut, match/box bonuses,
explicit scoring presets and three honest bot skills are included.

Open **play.html** directly from disk to play: no server, build or network
needed. Two humans or bots; three/four players rotate through two active seats.
Cover private hands between turns. A bot move button keeps the table's pace
under the players' control. Every scoring and clock setting is shown before deal.

Development/checking: Node 22.16+, then in this folder:

    npm ci --ignore-scripts --no-audit --no-fund
    npx playwright install --with-deps chromium
    npm test

`npm run build` strictly type-checks and regenerates the self-contained page.
`npm run fixtures` deterministically regenerates all phase states and manifest.
`npm run league` runs the required 2,000-game comparison for each adjacent skill.
`src/core.ts` exports `game`; `src/cards.ts` exports the exact scoring algorithms.
The only runtime dependency is allowed Zod; it is inlined in the offline page.

RULES/SOURCES/CONFLICTS record read sources and deliberate scoring choices.
VERIFY records actual commands and coverage, BOTS the measured win rates,
LOOP post-green improvement rounds, NEXT remaining/resume steps.
SHA256SUMS covers delivered data/media. No external card art or trackers.

Current status: implemented, undergoing the full binding acceptance suite;
not yet a verified ready delivery. Historical blockers are retained separately.
