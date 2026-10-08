# Changes and reasons

Research/bootstrap: create an isolated G04 folder with the exact shared
TypeScript configuration,zod-only runtime and pinned development tools.
Record independently inspected source mechanics,fairness criteria and design
choices before implementation. No game or asset changes in other jobs.

Core milestone0.1.0: add samples.ts/generate.ts for160 original fictional rows
with strict row/catalog validation and byte-identical JSON regeneration. Add
scoring.ts with ratio-based numeric closeness,zero handling,date proximity
and deterministic fake normalization. differential.ts independently evaluates
logarithmic scoring over10,000 cases and14 edges,including finite extremes.
Divide before multiplying to avoid overflow at Number.MAX_VALUE.

Add core.ts with the exact shared GameDefinition,all seven data-timed phases,
first-appearance10-second distinct demos,balanced modes,4/8/12-round settings,
last-round doubling,duplicate/self-vote rules,private projections,retained
result seats and all VIP/presence events. Add bots.ts with public-clue arithmetic,
log-range estimation and template plausibility/generation; no State reaches
its policy. Add test.ts for contract/privacy/scoring regressions,full replay
and1,000 games per2–8 count in every mode. Add fixtures.ts,checksums.ts and
league.ts for all fixtures,data integrity and2,000-game comparisons per mode.

Verification runtime: add preflight.ts to bundle the actual shared contract
schema with esbuild because native Node cannot resolve its extensionless
imports. Preserve shared files. A new order-invariance regression reproduced
1,000 versus1,500 points when later truth credit overwrote earlier fooled
credit. Change truth credit to addition; the regression now passes.
