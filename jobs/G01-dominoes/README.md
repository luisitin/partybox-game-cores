# G01 Dominoes

Pure double-six Draw/Block core, 2–4 seats, optional four-seat partners,
100/150/250 targets, hidden-information views and three seeded bot policies.

Requires Node 24+. From this directory:

```sh
npm ci --ignore-scripts --cache /workspace/.npm-cache
npm test
```

Open `play.html` directly from disk: no server, external assets or network.
Choose each seat as Human, Easy, Medium or Strong. Pass the screen before
revealing the next human hand. The public board never displays private hands.

`npm run build` regenerates the standalone page from `ui.ts` and `shell.html`.
`npm run fixtures` regenerates the manifest and all phase fixtures.
`npm run league` measures both 2,000-match skill comparisons.

`core.ts` exports `game`, conforming to `contract/contract.ts`. Normal means
medium; sharp means strong. Bots consume only sanitized observations.
`reference.ts` independently verifies the adversarial endgame evaluator.

Read RULES.md, SOURCES.md and CONFLICTS.md for selected rule conventions and
explicitly unverified knowledge fallbacks. Read VERIFY.md for measured results,
NEXT.md for outstanding work and LOOP.md for post-green improvement rounds.
No green CI or finished-job claim until every required delivery check passes.
