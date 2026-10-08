# Player review

Round1, after PR5/head9c68bca had green push and PR checks. Re-read G05/RULES.
Five largest weaknesses: fixed default seed repeats every table; reload loses
match progress; mobile final winner follows the large last-trick table;
received cards have no visual marker; timed management menu does not hold time.
Worst selected: match lifecycle. Fresh default deals and score-preserving local
recovery remove the first two. Browser crypto/storage stay outside pure logic.
Local observation: two fresh17-card hands differ; a scored hand2 reload preserves
its entire public view and has zero revealed card DOM; malformed save is refused.
Remaining three will be assessed after this head's CI is green.

Round2, after3818b43's two CI runs37734856233/37734861508 were green. Re-read G05.
Five weaknesses: mobile ranked results below large old trick; received cards
unmarked; timed Manage menu runs the clock; generic handoff spoken label lacks
recipient; saved private passing memory can be incomplete. Fix result priority,
private received markers/spoken labels and the reproduced save-memory crash.
Also make exported saves independent so callers cannot mutate the live match.
Remaining timed-menu/announcement issues are next after updated CI is green.

Round3, after1843eb2 GREEN runs37736496412/37736500158. Re-read G05/RULES.
Five remaining weaknesses: timed Manage continues the clock; handoff button
accessible name lacks the recipient; pass selection changes lack live spoken
feedback; secondary-label contrast needs an audit; six-seat mobile score-card
spacing is crowded. Fix the timed management lifecycle and spoken guidance.
Pause through the pure reducer while Manage owns a running clock, conceal the
hand, then restore the same actor's selection and remaining time on close.
Explicit Pause remains paused; Skip/End release the temporary hold first.
