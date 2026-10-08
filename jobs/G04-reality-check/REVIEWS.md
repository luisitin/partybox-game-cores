# G04 KEEP GOING reviews

Baseline: PR4 head f7ef26c080046a2f04642572bb5df1aaaae09430,
hosted run37723786704 SUCCESS observed2026-10-08T03:47Z.
Re-read main README.md/RULES.md/JOBS.md after that result.

Round1 five biggest weaknesses, in order:
1. An unfinished private draft is deleted by hide/reopen or pause.
2. Phone controllers lack nearby question context/keyboard focus; the wheel is hidden.
3. Public-date parsing only recognizes three/four-digit years.
4. Medium's generic bluff wording does not obey the two-word clue.
5. Unexpected-event/privacy checks cover selected phase cases rather than a full phase matrix.

Fix1: cache drafts only for their phase and owner, remove fields while
concealed, restore only to that owner, and discard on submission/phase
change/new game. Actual baseline hide/reopen lost its draft (after="");
the identical case now retains it. Browser regressions additionally pass
six number/range concealment restores, bluff hide/pause restores, no
hidden DOM fields and no next-owner inheritance. Gain is observable;
no-gain streak0. Core and bot policies are unchanged.

Round2 five weaknesses: phone context/focus/wheel/long-answer layout (worst);
short public years; Medium fake style; all-phase fuzz coverage; custom zero
catalog coverage. Fix phone play: show question/hint/timer beside inputs,
focus the field, show the wheel during its phase, and wrap legal long fakes.
Before:wheelVisible=false,nearbyQuestion=false,focus=BODY,keyboardDraft=''.
After:wheel/question visible,keyboard typing reaches its field,timer matches,
shared board returns on concealment and160-character votes do not overflow.
Remove developer factory wording from the player help. Observable gain;
no-gain streak0. Core/bots unchanged.

Round3 five weaknesses: short-year/era parsing (worst); Medium fake style;
phase-event/privacy matrix; custom zero/date catalogs; independent seed
strength robustness. Baseline public-only probe missed8/8 supported dates,
including1CE,9BCE,lowercase23bce,101CE/2001CE with another numeric ID,
10000CE and7/23-year decades. Explicit era/year parsing fixes all8 and
preserves hidden-truth independence.24 focused tests and all12,000 default
league matches pass with identical old win counts. Observable valid-content
bot gain; no-gain streak0. Default corpus and core are unchanged.

Round4 five weaknesses: valid-range bot/controller safety (new worst);
Medium fake style; phase-event/privacy matrix; actual random replay seeds;
held-out skill robustness. A public-bounds probe found2674 invalid/9000
inputs:2000 Sharp underflows and674 Easy/Medium zero-century corrections
outside[-1,0]. Fix bounded log fallback for underflow,choose a legal signed
century,and share safe controller defaults for fractional/one-sided ranges.
After:0 invalid/9000.26 focused tests and12,000 unchanged-rate leagues pass.
22 browser scenarios/capture6 pass at60fps. Player-visible valid-content
input/score gain; no-gain streak0. Workspace restart preserved all changes.

Round5 five weaknesses: Medium fake style (worst); phase-event/privacy
matrix; sequential replay seed coverage; custom catalog extremes; held-out
skill robustness. Two-word hints and long generic fakes made Medium
answers visually distinguishable. Fix the public noun pattern:0/300→300/300
two-word,0 invalid. Full50-test pipeline,all25 mutations,12,000 measured
leagues and22 browser scenarios pass. Mixed/Bluff rates change as recorded
in BOTS;all lower bounds remain above50%. Player-visible bluff plausibility
gain;no-gain streak0.

Round6 five weaknesses: all-phase adversarial/privacy coverage (worst);
sequential replay seeds; custom-catalog boundaries; held-out skill results;
phone/performance variance. Fill the first two verification gaps with
7,000 frozen phase states and1,003 exact replays using actual random draws.
No invariant failure or production change;measured player gain0,streak1.

Round7 five weaknesses: custom-catalog boundary validation (worst);held-out
skill seeds;independent frame sampling;presence churn;factory-scale limits.
Stress found4/4 invisible truths accepted and a blank correct vote option.
Reject those values before init. After:4/4 rejected,10,000 valid rows,
30,000 real reducer submissions and7,500 defaults all pass.28 focused tests,
25 mutation kills and22 browser scenarios pass. Player gain for valid
content selection;no-gain streak resets0. Default dataset/policies unchanged.

Round8 five weaknesses: held-out skill strength (worst);frame-sample
variance;presence churn;factory scale;clarity of benchmark limits. Add
12,000 fresh matches without tuning policy. All six confidence lower
bounds>50%;original12,000-match reports reproduce exactly. No player
behavior change;player gain0,no-gain streak1. Corpus scope remains explicit.

Round9 five weaknesses: single-run frame variance (worst);presence churn;
factory scale;phone approximation limits;future content integration. Fill
the measurable variance gap with two independent full browser runs and
retain each raw report/capture. All66 total scenarios,900 TV+900 phone
intervals pass,60fps/p95≤16.8ms,zero errors/requests. No production change;
player gain0,no-gain streak2. Unavailable physical hardware remains labeled.

Round10 five weaknesses: presence-churn coverage (worst);factory-scale
limits;phone approximation;future pack integration;editorial spacing.
Fill the actionable churn gap with1,000 frozen-state12-round games,
16,585 presence events,5,347 pauses and50 prototype-name rosters. All
games finish,all seats survive into finite independently checked results,
0 failures. Core/bots/UI unchanged;player gain0,no-gain streak3. Remaining
limits are documented scope/hardware concerns or cosmetic wording,not
measured defects;final combined checks/current-head CI remain the gate.

Corrective continuation before new acceptance: re-read repository README.md,
RULES.md and JOBS.md on2026-10-08. Ranked weaknesses: (1) failing phone
frame sample and lost raw intervals; (2) absent bundled Zod MIT notice;
(3) stale ready PR/handoff; (4) physical-phone approximation; (5) source-bound
new milestone capture. Notice is restored without script/runtime changes;
PR is draft. Worst actionable verification gap: retain per-profile raw300
intervals BEFORE assertions and add a frame-only confirmation mode that
keeps prior functional/capture evidence separate. No gameplay gain or new
completed KEEP round is claimed while acceptance remains pending.

Round11 PRE-EDIT review after exact499ae3e CI37773774295 observedgreen
2026-10-08 12:08:17UTC. Re-read original root README/RULES/JOBS, selected
G04 RULES and pure timer contract. Five ranked weaknesses: (1) expired
human/bot input may beat a delayed deadline callback; (2) hosted raw reports
are not retained as downloadable artifacts; (3) unexplained local frame
variance; (4) physical-phone approximation; (5) same-tab recovery limits.
Worst measured issue: actualfile UI dispatch at deadline+110ms accepts
correct answer/vote for1000 versus timer-first0; expired fake enters vote
menu. On-time−1ms and pause controls work. The baseline uses controlled
wall-clock jumps with held timers, so it proves event-order handling, not
frequency in ordinary play. Fix only host overdue-input handling and check
expired bot sampling; keep pure reducer/scoring/catalog/botpolicy unchanged.
Measure actual-button before/after, on-time/pause/bot regressions, strict
build/typecheck, affected fullbrowser gates and fresh source-bound capture.
No completed round/player gain is logged until those checks pass.
