# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats.

Implementation checkpoint: licensed American2–6 and complete International2–6
source are installed. The actual full offline game passed30 desktop/phone4×
control checks and600 American-board strict frames per profile, including a
Strong six-piece lookup. International-board frame checks remain pending.
The complete-source7000-game matrix,25 real mutants and current91 combined
unit checks and all4,000 final-source strength games pass. International strict
desktop failed17.510FPS; phone not run. CI fit, public download/PR and KEEP GOING
are pending; the league alone exceeded30minutes after recorded holds.
An independent host verifier now requires every named check, current source
guards, all four raw frame files, and actual decoded, hash-bound clips.
Fourteen scoped positives and127 corruption controls pass; fresh full CI is pending.
Two Human seats can now
start while the database loads; actual phone4× controls appeared after2.398s
and the first legal move finished after9.128s. Computer seats wait for data.
This job is not completed. The earlier4000strength table remains historical.

Requires Node 22.16+; dependencies are pinned in package-lock.json.
From this directory:

```sh
npm ci --ignore-scripts
npm test
```

The current complete standalone file is .work/play-full-guarded.html
(1.390GB; full data load can exceed two minutes on the throttled phone).
SHA256:5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801.
Full artifact publication is pending;
tracked play.html remains the earlier International2–5 baseline. Build the full
file locally with G10_HTML_OUT=.work/play-full.html npm run build.
After all workflow checks pass, the prepared read-only Actions step uploads
the generated play.html and exact commit/digest receipt as a seven-day ZIP
artifact. Actual upload/quota/download remain unproved; this temporary download
is separate from a persistent Release, whose upload tool is currently unavailable.
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
