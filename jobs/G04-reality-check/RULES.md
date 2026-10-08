# Reality Check selected rulebook

This is the original game specified in JOBS.md, with no publisher's official
Reality Check rulebook to reproduce. SOURCES.md records two independent
bluff analogues and two logarithmic-error sources; CONFLICTS.md records
all observed alternatives and the choices made here.

Play 2–8 seats. Settings: Quick only, Mixed (default, equal quick/bluff
counts), Bluff only; 4/8/12 rounds, default eight. The seeded wheel spins
for 3 seconds. A realm's first appearance teaches a 10-second unscored
demo, with a different row from its scored question. Scored rows do not
repeat in that realm until the available rows run out.

Quick answers have 50 seconds:

- Number estimate: 1,000 × min(guess, truth) / max(guess, truth), rounded.
  Half and twice the truth both score 500. Changing units preserves the
  score. Equal zeros score 1,000; one zero scores zero. Negative,
  nonfinite and out-of-range answers are rejected.
- Left/right: exact choice earns 1,000; otherwise zero.
- Century slider: integers, BCE negative, CE positive, no century zero.
  Exact earns 1,000; each century away loses 250, down to zero. The first
  century BCE and first century CE are adjacent.
- Decade dial: multiples of ten label starting years. Exact earns 1,000;
  each decade away loses 250, down to zero.

Bluff writing has 40 seconds. Submit one believable fake of 1–160
characters. Whitespace/case/Unicode-compatible duplicates form one
anonymous choice with all authors retained. Truth and distinct fakes
appear in seeded random order, without authors or truth markers.

Voting has 30 seconds. Each player gets one locked vote, excluding their
own fake. Truth earns 1,000. Each fooled vote earns 500 for its authors,
split equally and rounded down per author. Those points add to truth
credit independently of player order. Writing truth earns 1,000 once
without voting; confirmation is private. Missing submissions/votes earn
zero. Submitted fakes can still fool voters after their author leaves.

Every round reveals truth, answers, votes, authors and awards. Reveals
last 15 seconds or until Next; bots do not rush the offline page's reveal.
The final round doubles all awards. Highest total wins; top ties share
the win. Results retain every original seat.

Input phases close early once every connected eligible seat has submitted.
Deadlines advance idle play. The host may pause/resume, skip or end.
Pause freezes play and shifts deadlines by its duration. Spectators,
wrong-phase inputs, stale/early timers and repeated submissions are ignored.
Departures cannot trap all-submitted phases; paused drops are rechecked on
resume. End returns earned scores even during an unfinished round.

All examples are fictional. Default Mixed idle timing is at most 694 seconds
(11 min 34 s); prompt submissions finish sooner. Everyone looks away while
a named owner reveals a controller, then it is concealed before handover.
Local devtools are outside this physical privacy convention.
