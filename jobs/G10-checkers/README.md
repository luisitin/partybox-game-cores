# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats.

Implementation checkpoint: strict builds, original inline-worker offline page,
movement differential10,000 boards plus twins and independent endgame reference
certificates pass. Three bot levels and partial exact endgames are authored.
Full-six-piece coverage, comprehensive core tests, leagues, browser proof and CI
remain pending. This checkpoint is not a completed job.

Requires Node 22.16+; dependencies are pinned in package-lock.json.
From this directory:

```sh
npm ci --ignore-scripts
npm test
```

play.html is built to open directly from disk with no runtime network; its
offline/browser verification has not run yet. The local window.__G10 hook supports
deterministic host checks; game controller/TV views follow the shared contract.
Read NEXT.md for the actual resume checkpoint, VERIFY.md for executed checks,
RULES.md for selected editions, and SOURCES.md/CONFLICTS.md for research.
The original research-only blocker is retained under evidence/legacy/;
current main RULES.md's source fallback supersedes that old stop.
