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


Current KEEP16 saved-only proof naturally CLOSED06:48:39.211708Z EXIT0/PASS, all1652 actual frozen inputs unchanged. Strict current35 projection,14 original proof tests/175 corruption controls and original integrity736 hashes/32 links/two deterministic fixture generations all pass. The genuine first93 original60-member ZIP/full raw35/source copies/native failure and functional clips remain immutable; only labelled5 source dictionaries/two byte-identical media paths are derived and request disabled in this SAME proof checkpoint. Final receipt files are added to the regenerated delivery manifest; subsequent exact-head full original hosted npm test and its whole official artifact remain REQUIRED. BothPRs Draft, KEEP16 player gain/streak0; no local sampler.


KEEP17 material public-discard closure repair after genuine e228 whole full original acceptance. Before3 tests1 PASS/2 FAIL; after3 PASS1152 settings/1000 same-public-view independent defenses/168 controls/all10 guards unchanged. Actual representative -10→+1 (+11), boundary maximum52. Only Strong already-finishing positive knocks additionally exclude currently public discard cards from possible layoff starters; no hidden information or global layout policy. Current original complete matrix/leagues/26 mutants/new first35 capture/full hosted acceptance PENDING. Read KEEP-5-VISIBLE-DISCARDS.md and public-discard-knock-current/; accepted-e228d52/ retains the entire genuine previous full packet and first private expectation error. Matching finite reason added to the sole workflow; original full verify and every other byte unchanged. BothPRs Draft, KEEP17 player gain/streak0.
