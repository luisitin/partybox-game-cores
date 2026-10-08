# KEEP GOING

Initial PR CI gate: run37717614222, headc0dabcfd, actual SUCCESS.
Version1.1.0 also passed hosted run37719011330 at headb82c0cbc.
Timer/batch repairs before these rounds are separately recorded, not counted.
Five weaknesses per round and detailed evidence: evidence/keep-going.md.

1. Fix absent-seat turn deadlock and preserve intentional/empty-room pauses: 1,000 departure/drop cases +120 complete matches +all4 live phases PASS;17,184 events, max75 automatic transitions; observable gain: a remaining player can continue. All24 core tests/matrices/leagues/mutants pass; first full browser gate failed and is retained; fresh standalone browser/capture passes. Current-head CI pending.
2. Deduplicate equivalent layoff orders and stop at a proven unavoidable-deadwood lower bound: all2,002 complete layouts identical,14 targeted tests and25/25 mutants PASS; phone4x hard cases6813→11.3ms and1278.1→10.2ms, desktop/phone60.002/60.004FPS; observable gain: removes multi-second layoff wait.
3. Use monotonic host elapsed time, visible paused countdown and fresh host entropy: delayed20s callback now advances expired10s move (0→1 actions); pause/resume preserves10s, Web Crypto bootstrap called once; desktop/phone60.003/60.004FPS and capture PASS; observable gain: correct visible timed play and fresh opening shuffle.
4. Replace numeric custom-meld entry with10 named-card controls, erase covered drafts and show actual declared/resolved layouts: desktop/phone4x regressions PASS (private draft retained→cleared; displayed sets→declared runs; defender0/undercut11), both60.004FPS on third strict run; earlier frame failures preserved; observable gain: usable private meld choices and truthful reveals.
