# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats.

Implementation checkpoint: licensed American2–6 and complete International2–6
source are installed. The actual full offline game passed30 desktop/phone4×
control checks, including a Strong six-piece lookup. Two Human seats can now
start while the database loads; actual phone4× controls appeared after2.398s
and the first legal move finished after9.128s. Computer seats wait for data.
Final-source frame,
simulation/strength, CI/PR and KEEP GOING checks remain pending.
This job is not completed. Prior7k matrix/25 mutations/4k league are baselines.

Requires Node 22.16+; dependencies are pinned in package-lock.json.
From this directory:

```sh
npm ci --ignore-scripts
npm test
```

The complete standalone file is currently built privately as .work/play-full.html
(1.390GB; phone4× disk load99.217s). Full artifact publication is pending;
tracked play.html remains the earlier International2–5 baseline. Build the full
file locally with G10_HTML_OUT=.work/play-full.html npm run build.
It opens directly from disk with no runtime network. The local window.__G10 hook supports
deterministic host checks; game controller/TV views follow the shared contract.
Chinook project, University of Alberta, provides the American endgame data;
free distribution requires acknowledgement and prohibits database sale. Separate
terms/provenance are attached in data/chinook and the page's license notice.
Ed Gilbert permits unrestricted International database distribution; original
source bytes and Boost dictionary/driver provenance are in data/international.
Read NEXT.md for the actual resume checkpoint, VERIFY.md for executed checks,
RULES.md for selected editions, and SOURCES.md/CONFLICTS.md for research.
The original research-only blocker is retained under evidence/legacy/;
current main RULES.md's source fallback supersedes that old stop.
