# Resume G01

Branch: job/G01-dominoes. Use this isolated checkout; do not create a worktree.
Read latest README.md, RULES.md, JOBS.md and CLAIMS.md on main before proceeding.
Do not rebuild/replace the owner's G08 Shake Up when the queue reaches it:
read its START-HERE.md and start/HANDOFF.md first, and preserve existing assets.

Local integration is PASS: `npm test` exit 0, 25 tests; 7,003 full bot/property
matches; 18,000 full idle matches; 10,000 independent search cases; 25/25
mutants killed; 2,000 matches per skill comparison; 200 upstream-baseline matches;
functional/offline/privacy/browser frame-time checks and all checksums pass.
See VERIFY.md and JSON reports for exact scope/results. No green CI claim.

Remaining delivery:
1. PR opened successfully: https://github.com/luisitin/partybox-game-cores/pull/1.
   GitHub API access recovered; no additional token was needed. First actual
   G01 verification run 37645288915 FAILED in npm test. Its log download is
   blocked at results-receiver.actions.githubusercontent.com (draft hostname
   addition saved). The workflow now emits the failure tail as a check annotation
   so the next run can be diagnosed through the working API. No green claim.
2. Confirm actual job workflow outcome, investigate failures before claiming
   green. Keep the reviewable PR title/body aligned with the final implementation.
3. After green PR CI, do KEEP GOING: reread requirements, list five biggest
   weaknesses each round, fix worst, measure/log/push, repeat to three rounds
   without player-noticeable gains. LOOP.md has no executed rounds yet.
4. Refresh G01's line on main for each push, preserving concurrent claims.
5. Then continue with the lowest eligible job from current main CLAIMS.md.

## Re-verify when web works

Pagat Draw/Block and Wikipedia were read after source access recovered; see
SOURCES.md/CONFLICTS.md. Pagat Draw uses 7/7/6, versus the current explicit
Block-sized 7/5/5 house convention. Add a selectable deal convention as a
player-noticeable improvement. Bicycle URL returns 404; Masters of Games 403.
Continue marking unsupported conventions separately under main's fallback.
The strong policy beat the researched package's configured 16-sample endgame
policy, not every AI or unlimited full-game search. File:// is blocked by managed
Chromium; exact file bytes were functionally exercised through setContent.
Physical-phone measurements and direct file navigation are unverified here.

Environment: Node 24.19.0, npm 11.9.0, Python 3, Chromium and ffmpeg. npm cache
/workspace/.npm-cache. `npm ci --ignore-scripts` installs the job lockfile.
Baseline wheel hashes are in baseline-requirements.txt; installed under
/workspace/.baseline-libs. No long-running services or runtime network needed.
