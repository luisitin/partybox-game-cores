# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats.

Implementation checkpoint: corroborated rules, independent movement oracle,
move generation, draw allowances, reducer and views are being authored.
Bots, generated endgames, offline page and the full verification remain pending.
No game, test, performance, bot-strength or CI completion is asserted.

Requires Node 22.16+; dependencies are pinned in package-lock.json.
From this directory, once implementation is complete:

```sh
npm ci --ignore-scripts
npm test
```

The intended play.html opens directly from disk with no runtime network.
Read NEXT.md for the actual resume checkpoint, VERIFY.md for executed checks,
RULES.md for selected editions, and SOURCES.md/CONFLICTS.md for research.
The original research-only blocker is retained under evidence/legacy/;
current main RULES.md's source fallback supersedes that old stop.
