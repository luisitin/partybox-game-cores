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
