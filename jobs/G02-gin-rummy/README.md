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

Prior accepted e90/full run37891506020 passes67 tests,6k full replays,
Strong1166/2000 and Medium1743/2000,26 mutants,646 hashes/two regenerations,
original35 native1200 intervals and two fully decoded recordings.
Its whole official11597719471 and log are retained in accepted-e90ca4e/.

Next Strong finishing repair compares equal live layoff targets, ignoring
only groups blocked by its own11 cards. Representative loss14→win1;
1152 settings/1000 oracle defenders/120 controls pass. Current full checks
and fresh source-bound evidence remain pending; both PRs Draft/streak0.

[Evidence](evidence/resume-20261008/INDEX.md) retains original failures.
Original frame/clock/gate limits stay intact; CPU4 Chromium evidence
does not establish physical-phone or PartyBox SDK integration.
