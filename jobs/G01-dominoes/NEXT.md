# Resume G01

Branch job/G01-dominoes; PR https://github.com/luisitin/partybox-game-cores/pull/1.
Read current main README.md, RULES.md, JOBS.md and CLAIMS.md before resuming.
Keep this isolated checkout; preserve shared contract and the other repositories.

Latest production is 0.2.1, 32 hidden samples. A6fe928 (16 samples, archived
captures) passed CI run 37652798819. Latest 32-sample head needs its own green CI.
Local affected checks pass: 30 tests / 9,003 full matches, 25/25 mutants, 20,000
independent solver cases, 10,000 exact conditional count cases, Block/Draw
2,000-match leagues, 200 upstream matches, browser/build/checksums. Idle 27,000
cases passed after the deal change; reducers are unchanged by sample increases.

KEEP GOING rounds 1–6 are recorded in LOOP.md and REVIEW.md. Round 6 independent
confirmation passed (53.15% versus 16 samples, lower 95% 50.96%). Accepted 32
samples reset the no-gain streak to zero. Historical study-baseline.ts is the
exact 16-sample source; archived study scripts use it, not changing production.

Next substantive correction: round 7 terminal utility ignores configured net
blocked scoring and all-remaining partnership scoring. score-policy-check.ts
finds 3,934 mismatches in 10,000 terminal cases; isolated corrected model has
zero. Production is deliberately unchanged until the previous milestone is
committed. Apply its scoreAwareSource transformation to core.ts; prefer the
chosen difference default for omitted standalone Position.blocked; forward
both settings into sampled positions. Extend the independent reference for
both variants and differential cases; add direct blocked/partner regression
examples, npm-test production score-policy validation and a sixth capture.
Run affected checks/leagues/baseline, record results, push and refresh claim.
Do not claim the round 7 correction is already implemented.

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
