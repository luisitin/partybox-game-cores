# Resume G01

Branch job/G01-dominoes; PR https://github.com/luisitin/partybox-game-cores/pull/1.
Read current main README.md, RULES.md, JOBS.md and CLAIMS.md before resuming.
Keep this isolated checkout; preserve shared contract and the other repositories.

Latest production is 0.2.2, 32 hidden samples. A6fe928 (16 samples, archived
captures) passed CI run 37652798819. Latest 32-sample head needs its own green CI.
Local affected checks pass: 30 tests / 9,003 full matches, 25/25 mutants, 20,000
independent solver cases, 10,000 exact conditional count cases, Block/Draw
2,000-match leagues, 200 upstream matches, browser/build/checksums. Idle 27,000
cases passed after the deal change; reducers are unchanged by sample increases.

KEEP GOING rounds 1–6 are recorded in LOOP.md and REVIEW.md. Round 6 independent
confirmation passed (53.15% versus 16 samples, lower 95% 50.96%). Accepted 32
samples reset the no-gain streak to zero. Historical study-baseline.ts is the
exact 16-sample source; archived study scripts use it, not changing production.

Round 7 configured terminal scoring is corrected, version 0.2.2. Its 31 tests,
9,003 complete matches, 25/25 mutants, 20,000 independent solver cases and
10,000 scoring alignment cases pass, along with browser/build/strength checks.
Strong/medium: Block 68.85%, Draw 83.25%; bounded upstream 68.0%.
The semantic scoring correction is a gain; no-gain streak remains zero.

Next substantive correction: round 8 match-goal-check.ts shows an unavoidable
match loss chosen over a surviving round loss because Observation omits public
standings and utility ignores target completion. The candidate chooses 0–2
instead of 0–1 in a conserved, oriented four-tile endgame: reducer phase changes
from done (p2 reaches 103) to round-end (p1 reaches 5). Before applying, preserve
the current 0.2.2 source as an immutable score-aware study baseline, point this
probe at it, add --production validation, then apply matchAwareSource to core.
Forward public scores/target only; extend independent reward reference and
random goal cases, add explicit choice/terminal tests, a seventh capture and
required checks/leagues. Keep historical comparators reproducible.

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
