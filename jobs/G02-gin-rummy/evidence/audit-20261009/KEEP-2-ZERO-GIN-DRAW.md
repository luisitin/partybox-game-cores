# KEEP round14: finish an already-zero-deadwood hand

After full original8a349 acceptance/run37882520974/complete official artifact11594383615 reader CLOSED04:18:51.054335Z, reread the exact G02 job, binding RULES and current core/player.

Five ranked weaknesses:

1. Confirmed: all three skills pass an upcard that legally preserves zero deadwood and enables immediate Gin/Big Gin, because zero cannot strictly decrease. Complete52-card representative:0..9 plus upcard10. Prior actual bot pass/pass/stock11/Gin scores20; immediate legal pickup/BigGin scores31. Worst measured finishing defect; fix only this item now.
2. Separately confirmed and deferred: Sharp's public discard-danger heuristic selects a two-deadwood knock over a one-deadwood knock with identical three melds. Current public pickup41 is actually still in the defender hand. Normal scores2, Sharp scores1. Preserve exact state/results in knock-danger-unfixed.json; do not combine a second unmeasured strategy repair with this round.
3. Strategy limitation: pickup danger includes historical pickups even after a later public discard. This is public information, not hidden-card cheating, but can retain obsolete threats. No new independent player gain established for changing it; defer.
4. Strategy limitation: bots choose one exact minimum-deadwood layout without comparing how equally low alternative layouts affect a defender's possible layoffs. Human chosen-layout support remains intact. Hidden-defense expectation and a policy gain have not been established; defer.
5. Delivery limitation: strict hosted Chromium and CPU4 evidence does not establish physical-phone or real PartyBox SDK integration. Current original contract tests and offline player pass; preserve the documented hardware/SDK limitation and existing genuine local timing failure.

Items3-5 are bounded limitations, not three additional confirmed gameplay bugs. No invented no-gain KEEP round.

Narrow change: when both the existing ten-card deadwood and the legal discard-pickup candidate are zero, take that pickup immediately. Existing single-legal-action/forced-stock guard stays first; immediate-return filtering and enabled Big Gin handling stay intact. All nonzero-hand Easy probabilities and existing heuristics remain unchanged.

Before four new regressions:3 FAIL/1 PASS,90 boundaries PASS. After build and all eight new/prior tactical tests PASS:6912 cases across all skills/variants/profiles/2-3-4 rosters/actual legal opening-and-draw routes/BigGin31-50 and on-off/clock0-10/all4suits/two run endpoints;1000 hidden defender completions/3000 same choices/exact independent scoring;90 controls; representative gain11. Prior72/1000defenders/6904knock comparisons and30000 non-Gin byte-equivalent decisions still PASS. Tests use actual production reducers and preserve all52 cards after every event. No new hidden observation or native-clock/performance change.

Original full node/matrix, both2000 leagues, all26 compiled mutants, fresh current35-source browser packet and subsequent full original hosted acceptance are required after this material change. Their current results are PENDING until actual natural closure; both PRs draft, renewed KEEP streak0.
