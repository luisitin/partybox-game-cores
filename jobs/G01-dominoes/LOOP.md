# KEEP GOING

Green baseline: PR #1, CI run 37647980032 succeeded for c28d4e4.

1. Added selectable published Draw hand sizes (7/7/6); initial hands grow 40% at three seats and 20% at four seats; 2,000 additional seeded matches pass, 27,000 idle cases pass, 25/25 mutants killed; player-noticeable gain, no no-gain streak. Five-weakness review is in REVIEW.md.
2. Model forced stock draws and reserve in strong lookahead; Draw win rate versus medium rises 75.65%→81.5% over the same 2,000 seeds (+5.85pp), 20,000 independent endgames pass; player-noticeable gain, no no-gain streak. Five-weakness review is in REVIEW.md.
3. Replace constrained rejection with exact conditional counts; rare feasible samples improve 89/1,000→1,000/1,000, 10,000 brute-force counts agree; player-noticeable reliability gain, no no-gain streak.
4. Test and reject selfish max-n opponent model: 766 versus 702 wins in 2,000 three-seat matches, +3.2pp with 95% interval crossing zero; no established player-noticeable gain, no-gain streak 1.
5. Test and reject depth-four early search: 907/2,000 wins versus shipped sharp (45.35%, 95% 43.17–47.53); no gain, no-gain streak 2.
6. Increase strong sampling 16→32 after independent confirmation: 52.25% wins on initial 2,000 seeds, 53.15% on fresh 2,000 (95% 50.96–55.34) versus 16 samples; demonstrated strength gain, no-gain streak reset to 0.
7. Align search rewards with selected blocked/partner scoring: 10,000 terminals improve from 3,934 mismatches to zero; independent solver/regression/strength checks pass; substantive rule-model gain, no-gain streak remains 0.
8. Forward public standings/target and prioritize match completion; conserved tactical fixture changes forced match loss to continuing round, 20,000 independent cases and regressions pass; player-noticeable decision gain, no-gain streak 0.
9. Preserve inactivity across computer inputs and schedule mixed-roster round-end timers; budget failures fall 25,248/36,000→0, browser advances past its permanent Round 1 stall, all 35 tests pass; player-noticeable liveness gain, no-gain streak 0.
10. Re-test selfish max-n against current goal-aware strong: 763 versus 692 wins in 2,000 three-seat games (+3.55pp, 95% -0.18–7.28pp crosses zero); reject, no-gain streak 1.
11. Increase strong samples 32→64 after 1,048/2,000 initial wins and 1,082/2,000 fresh confirmation (54.1%, lower 95% 51.92%); 35 tests, 25 mutants and browser pass, Block/Draw leagues 72.45%/84.2%; demonstrated strength gain, no-gain streak reset to 0.
12. Test max-n under64 samples: initial803 vs691 wins, but fresh750 vs719 (+1.55pp,95% -2.21–5.31pp crosses zero); reject unreplicated advantage, no-gain streak1.
13. Test same-budget antithetic sampling:1,002/2,000 wins versus independent64 (50.1%,95%47.91–52.29%); focused25 tests pass but no strength gain, reject; no-gain streak2.
14. Enforce public first-round Block opener constraints:impossible worlds2,315/10,000→0,10,000 independent counts agree; hide inactive forced tile,39 tests/25 mutants/browser pass; model/privacy gain, no-gain streak reset0 (Block71.9%, no win-rate gain claimed).

15. Extend public opener inference to untouched-stock Draw;2,315/10,000 impossible worlds→0,40 tests/25 mutants/browser pass, Draw win totals unchanged; model gain, no-gain streak reset0. Block parity passes with identical2,000-game totals; bedf43a full CI37681790311 passed.

16. Test depth-four early search against current0.2.7:926/2,000 wins(46.3%,95%44.11–48.49%) versus shipped sharp,592,277 turns;10 focused regressions pass per shard. Reject weaker candidate; no-gain streak1.
