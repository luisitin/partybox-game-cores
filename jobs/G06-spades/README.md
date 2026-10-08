# Spades

G06 is claimed by codex-domino on job/G06-spades-core.
Research and pure core are implemented;full verification is in progress.
Four-player partnerships and three-player cutthroat,target500,nil and
blind nil,10 accumulated bags→−100. No code or art is copied from sources.

The earlier job/G06-spades branch contains an obsolete research-only403
blocker. It is preserved. Live GitHub mirrors and independent implementations
now supply the required rules;there is no current source blocker.

SOURCES records what was actually read;CONFLICTS records the differences.
RULES defines the selected presets and optional house rules.
ASSUMPTIONS and NEXT record implementation choices and the handoff.
VERIFY lists actual checks;unrun checks are not claimed as passing.
Run `npm ci`, `npm run check`, `node generate.ts`, `node fixtures.ts`,
then `FAST_TEST=1 node --test test.ts` for26 focused checks.
`npm test` also runs full seeded replay and1000-match/player-count suites.
The complete pipeline, browser page and hosted CI are still pending.
LOOP starts after the PR is green.
