# KEEP GOING

Initial PR CI gate: run37717614222, headc0dabcfd, actual SUCCESS.
Version1.1.0 also passed hosted run37719011330 at headb82c0cbc.
Timer/batch repairs before these rounds are separately recorded, not counted.
Five weaknesses per round and detailed evidence: evidence/keep-going.md.

1. Fix absent-seat turn deadlock and preserve intentional/empty-room pauses: 1,000 departure/drop cases +120 complete matches +all4 live phases PASS;17,184 events, max75 automatic transitions; observable gain: a remaining player can continue. All24 core tests/matrices/leagues/mutants pass; first full browser gate failed and is retained; fresh standalone browser/capture passes. Current-head CI pending.
2. Deduplicate equivalent layoff orders and stop at a proven unavoidable-deadwood lower bound: all2,002 complete layouts identical,14 targeted tests and25/25 mutants PASS; phone4x hard cases6813→11.3ms and1278.1→10.2ms, desktop/phone60.002/60.004FPS; observable gain: removes multi-second layoff wait.
