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

17. Test preserving decision depth across forced Draw steps:initial1,050/2,000 wins(52.5%,lower95%50.31%);fresh1,041/2,000(52.05%,95%49.86–54.24%) fails predeclared independent bound. Reject unconfirmed gain; all focused regressions pass, production unchanged; no-gain streak2.

18. Test relative tile-count leaf evaluation:1,017/2,000 wins(50.85%,95%48.66–53.04%),594,954 turns;10 focused regressions pass in every shard. Reject unsupported gain; production unchanged; no-gain streak3. Required KEEP GOING stop criterion reached.

19. Stale-claim recheck:full40-test pipeline,25 kills,all probes,Block71.9%/Draw84.2%,upstream132/200 and fresh capture pass;retain/hash MIT notice and HTML with early hash validation,no player gain,prior streak4.
20. Re-read G01/five weaknesses in REVIEW;malformed events7/9 throws→0/9,30 focused regressions/25 mutations pass;reliability gain,no-gain streak0.
21. Frozen pre-guard compatibility:1,003 seeded games/378,899 every-event state comparisons/0 state or result mismatches;no player-visible gain,no-gain streak1.
22. Seeded JSON envelopes:234,936 probes/3,012 deep-frozen states/1,003 seeds/1,003 paused states/3 phases;0 throws,mutations or identity failures;no player-visible gain,no-gain streak2.
23. Fresh browser:privacy/full bot+mixed-idle/offline/reduced-motion PASS;300 frames each,TV60.0036fps/phone59.6054fps,p9516.7/16.8ms;new VP9 capture decodes under10MB;no player-visible gain,no-gain streak3.
24. 2026-10-08 polish pass: npm test (Node 24.21) exit 1 after about 53 min at browser.ts TV gate (55.73 fps; standalone re-run 51.58; gate 58, not weakened); earlier steps green: 42/42 node tests, 25/25 mutations, Block 1438/2000 and 1619/2000, Draw 1684/2000 and 1155/2000, upstream 132/200; browser functional, privacy, bot match and mixed-idle PASS; restored the 57efe0b browser report that 3001349 had replaced with a lowered-threshold run; core, rules and manifest unchanged; no defect found.

Evidence checkpoint, not a KEEP round: first complete-input original8c/Worker2d logging diagnostic retained all4 raw profiles and passed1,823 guards, but controller native acceptance FAILED and both fixed player-gain gates FAILED; renewed current-face-down KEEP rounds remain0.

Provisional current privacy improvement P1, 2026-10-09: source reviewed04:20:53,
same-hash UI/player adopted04:25:40. Remove only obsolete veil finish hide
callback; actual animation/game clocks/core/Worker/original sampler unchanged.
First modified-source originalfourphone cases PASS04:16:57.960318, all16 human
turns/guard/raw steps. Default real native-WAAPI regression PASS04:23:57.716040,
genuine finish preserves reopened privateprompt and same hand/seat. Old original
phone firstFAIL/causeUNKNOWN retained. This meaningful privacy fix awaits full
current CI/whole artifact before completing renewed KEEP; completed rounds0,
no-gain streak0. Original response native acceptance and both gain gates FAIL.

R25, 2026-10-09: complete exact380 full CI/genuine1,303-check official proof validates the bounded obsolete-reveal-callback fix. FIRST old949 real-WAAPI new-regression negative FAIL353.5ms hides prompt; changed-source four-case16 human turns and same real-WAAPI/default full pipeline PASS. Older phone failure cause UNKNOWN, no response/FPS claim. Renewed completed rounds1/material privacy improvement1/no-player-gain streak0.
R26: complete4/4 actual four-human phone rounds/100 actions/94 turns/6 draws/10 passes/484 raw snapshots and every next private deal PASS05:11:43.127037; exact public pip/conservation checks and allfreshinputs; no current player change/gain, streak1.
R27: full5000-seed untimed fixture scan selects seed146/genuine13-tile hand; FIRST actual normal-motion phone4xCPU complete round27 actions/8 draws/4 passes/105 snapshots PASS05:15:39.935361, allfreshinputs and next-private-deal; no player change/gain, streak2.
R28: exported-readonly-tuple JavaScript caller mutation FAIL05:18:13.093046 retained; actual shipped consumers on9027 fully frozen states/27081 hidden pairs/36108 Easy-Medium calls/72 Strong calls/9027 reducer transitions PASS05:20:45.364738/allfreshinputs. No game-function mutation or current-player benefit of tuple-copy hygiene proved; candidate unadopted, no player change/gain, streak3. Binding renewed KEEP stopping condition reached; final exact-delivery full CI/genuine archive still required.

Provisional isolated absence repair,2026-10-09:468 fixed-human whole pairs old427/new0 simulated-budget failures with exact physical RNG/scoring;360 connected games101238 whole-state comparisons byte-identical;360 empty and360 pause cases pass. New7 regressions pass/old6 fail in smoke runs. Original full current CI/video pending; no qualified gain or formal KEEP credit. Original R25–28 stop protected. First43 invalid archive/late publication and correction retained truthfully.

## Evidence checkpoint, not a KEEP round
2026-10-09: exact-tree source-history repair makes Draft20 mergeable; preserve genuine original9f whole failure. Corrected explicit-absence old-engine oracle retains1003 seeds/372510 original physical transitions/827 independently bounded moves; extra1003 connected games377896 WHOLESTATE transitions byte-exact eadb; two full reports identical/all3327 guards natural13:59:36.736578. Actual new-page TV/phone4x/reduced24 private handovers/all3326 guards and333 fully decoded functional capture frames pass. No production/native gate edit, qualified new gain or formal post-green credit; complete current original pipeline pending.

## R29 investigation checkpoint, no completed round
After actual whole32a green, reread/rank5; FIRST240 legal full-inactive-cycle controls yield480 true failures: direct active departure and paused-drop-resume give next human1000ms instead30000. Source32a whole1342 proof/genuine55 tests retained; negative natural14:33:56.571522/all6568 inputs. No code change, measured repair gain or completed formal round/noGain credit yet. Worst defect is NEXT; this material evidence/handoff push keeps all old scopes/failures truthful.
