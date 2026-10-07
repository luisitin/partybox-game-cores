# Resume G01

Branch job/G01-dominoes; PR https://github.com/luisitin/partybox-game-cores/pull/1.
Read current main README.md, RULES.md, JOBS.md and CLAIMS.md before resuming.
Keep this isolated checkout; preserve shared contract and the other repositories.

Latest production is 0.2.3, 32 hidden samples. A6fe928 (16 samples, archived
captures) passed CI run 37652798819. Latest 32-sample head needs its own green CI.
Local affected checks pass: 30 tests / 9,003 full matches, 25/25 mutants, 20,000
independent solver cases, 10,000 exact conditional count cases, Block/Draw
2,000-match leagues, 200 upstream matches, browser/build/checksums. Idle 27,000
cases passed after the deal change; reducers are unchanged by sample increases.

KEEP GOING rounds 1–6 are recorded in LOOP.md and REVIEW.md. Round 6 independent
confirmation passed (53.15% versus 16 samples, lower 95% 50.96%). Accepted 32
samples reset the no-gain streak to zero. Historical study-baseline.ts is the
exact 16-sample source; archived study scripts use it, not changing production.

Round 7 configured scoring passed CI 37656004333 for 8ec9b5e.
Round 8 match-goal correction is implemented, version 0.2.3, with copied public
standings and target. The tactical fixture now preserves the match; 20,000
independent cases include 15,000 standings and 1,689 partner target cases.
Full 32 tests plus expanded 23 FAST cases cover all current 33 tests; 9,003 full
matches and 25/25 mutations pass. Block/Draw strong rates 69.15%/83.3%; bounded
upstream 67.5%. Current head needs its actual CI; no-gain streak stays zero.
Historical score-aware source is study-score-baseline.ts; the older 16-sample
source is study-baseline.ts. Preserve these historical comparators.

Next correction (round 9): mixed-idle.ts measures 25,248 budget failures among
36,000 zero-human-input mixed rosters; maximum 21,210,103ms. Computer inputs
currently reset the human inactivity counter. Change the submission helper to
reset idle only for a non-bot sender, using e.playerId (including any participant's
round-end Next). Standalone schedule() also returns at human-containing round-end
without any timer; schedule its declared 5s timer while retaining immediate
manual Next and fast all-computer advancement. Add direct computer-retention,
human-recovery/round-end sender tests, enforce mixed-idle budget in npm test,
and browser zero-human-input progression; record a distinct eighth capture.
Run affected checks and preserve prior measurements; do not claim this pending
correction is already applied.

Git HTTPS writes intermittently return remote Internal Server Error. Reads and
Git Data API are verified; /workspace/.onboarding/publish-commit.py publishes
exact single-parent committed objects, checks all hashes and current parent,
and updates refs force:false. Never force or overwrite concurrent claims. Read
current runtime policy/status first; use normal platform auth, never request
credentials merely because a variable is absent. If native pushes work, use them.

After actual latest green CI, continue KEEP GOING to three consecutive rounds
without player-noticeable gains; then claim the lowest eligible main job.
Refresh G01 on main on every push, preserving concurrent claims.

Re-verify when web works: Pagat/Wikipedia have been read; Bicycle endpoint 404,
Masters of Games 403. Use main's GitHub/package/knowledge fallback, never stop
solely on 403. Physical-phone and managed file-navigation verification are
unavailable; exact offline file bytes were exercised with setContent. Upstream
comparison is bounded and configured, not universal unlimited-search parity.

When reaching G08, preserve the owner's Shake Up and all assets/name/word lists;
read START-HERE.md and start/HANDOFF.md first and follow its seven ordered items.

Node 24, Python, Chromium and ffmpeg are installed. npm cache
/workspace/.npm-cache; Python baseline /workspace/.baseline-libs. npm test runs
the required pipeline; BASELINE_PYTHONPATH selects an alternate pip target.
No application services or runtime network are required. Environment setup
instructions/configuration are saved as a draft; publication is not claimed.
