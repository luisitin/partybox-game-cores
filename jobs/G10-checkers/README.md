# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats.

Implementation checkpoint: pure core and licensed American2–6/International2–5
endgame readers are implemented. Independent movement10k+twins, original-driver
10k probes per corpus, 7k matrix,25/25 mutations and baseline4k league passed.
The latest integrated reader/build equivalence checks pass; updated offline
page/browser/full league checks, complete International six-piece packaging,
PR/current CI/KEEP GOING remain pending. This job is not completed.

Requires Node 22.16+; dependencies are pinned in package-lock.json.
From this directory:

```sh
npm ci --ignore-scripts
npm test
```

play.html is built to open directly from disk with no runtime network; its
prior offline/browser proof passed on desktop and phone4×; current proof is pending. The local window.__G10 hook supports
deterministic host checks; game controller/TV views follow the shared contract.
Chinook project, University of Alberta, provides the American endgame data;
free distribution requires acknowledgement and prohibits database sale. Separate
terms/provenance are attached in data/chinook and the page's license notice.
Read NEXT.md for the actual resume checkpoint, VERIFY.md for executed checks,
RULES.md for selected editions, and SOURCES.md/CONFLICTS.md for research.
The original research-only blocker is retained under evidence/legacy/;
current main RULES.md's source fallback supersedes that old stop.
