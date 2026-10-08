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
