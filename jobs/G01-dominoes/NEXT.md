# Resume G01

Branch: job/G01-dominoes. Use this isolated checkout; do not create a worktree.
Read latest README.md, RULES.md, JOBS.md and CLAIMS.md on main before proceeding.
Do not rebuild/replace the owner's G08 Shake Up when the queue reaches it:
read its START-HERE.md and start/HANDOFF.md first, and preserve existing assets.

Baseline full integration passed and CI run 37647980032 is green for c28d4e4. KEEP GOING rounds 1–2 affected checks pass: 29 tests / 9,003 complete matches, 27,000 idle cases, 25/25 mutants, type/build/browser/checksums. Inspect newest PR CI before claiming latest head green.

Remaining delivery:
1. PR opened successfully: https://github.com/luisitin/partybox-game-cores/pull/1.
   GitHub API access recovered; no additional token was needed. First actual
   G01 verification run 37645288915 FAILED in npm test. Its log download is
   blocked at results-receiver.actions.githubusercontent.com (draft hostname
   addition saved). The workflow now emits the failure tail as a check annotation
   and diagnosed run 37646777685: missing system ffmpeg during video capture.
   CI now explicitly installs the encoder and tests prerequisites before
   long suites. Corrected run 37647980032 PASSED for c28d4e4. KEEP GOING round 1 is
   implemented; round 2 adds measured stock-aware Draw search (+5.85pp versus medium). Stock-aware commit 7af35a6 passed actual CI run 37650872168. Inspect newest CI next.
2. Confirm actual job workflow outcome, investigate failures before claiming
   green. Keep the reviewable PR title/body aligned with the final implementation.
3. After green PR CI, do KEEP GOING: reread requirements, list five biggest
   weaknesses each round, fix worst, measure/log/push, repeat to three rounds
   without player-noticeable gains. LOOP.md records rounds 1–4. Round 3 implements exact conditional sampling; all affected checks, Block/Draw leagues and upstream baseline pass locally. Round 4 max-n experiment was rejected for no established gain. No-gain streak is 1; try depth-four lookahead and increased sampling next, preserve/reproduce measurements and reject changes without supported gains.
4. Refresh G01's line on main for each push, preserving concurrent claims.
5. Then continue with the lowest eligible job from current main CLAIMS.md.

## Re-verify when web works

Pagat Draw/Block and Wikipedia were read after source access recovered; see
SOURCES.md/CONFLICTS.md. Pagat Draw uses 7/7/6, versus the current explicit
Block-sized 7/5/5 house convention. A selectable published Draw deal was added in KEEP GOING round 1. Bicycle URL returns 404; Masters of Games 403.
Continue marking unsupported conventions separately under main's fallback.
The strong policy beat the researched package's configured 16-sample endgame
policy, not every AI or unlimited full-game search. File:// is blocked by managed
Chromium; exact file bytes were functionally exercised through setContent.
Physical-phone measurements and direct file navigation are unverified here.

Environment: Node 24.19.0, npm 11.9.0, Python 3, Chromium and ffmpeg. npm cache
/workspace/.npm-cache. `npm ci --ignore-scripts` installs the job lockfile.
Baseline wheel hashes are in baseline-requirements.txt; installed under
/workspace/.baseline-libs. No long-running services or runtime network needed.
