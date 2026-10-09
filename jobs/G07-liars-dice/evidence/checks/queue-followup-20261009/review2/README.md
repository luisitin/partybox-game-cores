# G07 post-green review 2

Five ranked weaknesses, worst first:
1. Empty-room reconnect versus intentional VIP hold.
2. Stale timer identity after automatic initial turns.
3. Finite completion when the only connected player loses dice.
4. Hidden-cup and RNG independence after public automatic actions.
5. Initial context immutability across all rule settings.

Worst reviewed: Empty-room reconnect versus intentional VIP hold.
Actual natural closure 2026-10-09T10:39:45.470424+00:00, EXIT0, 272,183 assertions.
Measured domain: 10,080 reconnect contexts, 10,080 intentional VIP-held joins, 10,080 permanent departures, 6,720 actual deadline controls, 10,080 stale stamps and 40,320 exact natural saves. All 667 tracked/source/compiled inputs unchanged.
No additional player defect or runtime change; measured player-visible gain0,
new follow-up no-gain streak2. The original KEEP6–8 remain unchanged.
Both required current five-round recordings pass and fully VP8 decode
2026-10-09T10:41:07.137923+00:00; no FPS or strategy inference.

Reproduce from the pinned built job folder:
`node evidence/checks/queue-followup-20261009/postgreen-review.mjs --job=. --out=.work/review2 --round=2 --head=<actual SHA>`.
The actual executed command and all receipts are retained in VERIFY and here.

After this review is logged/pushed and own main row refreshed, reread/rank five and run only review3: rotated connected-seat complete games, private cup/RNG independence and original finite results. Publish that final third review separately before its whole exact-head original CI.
