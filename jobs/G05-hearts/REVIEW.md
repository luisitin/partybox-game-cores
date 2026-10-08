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

Round4, after457a122 GREEN push37737233240 and PR37737238135. Re-read G05.
Five audit findings: control boundaries only1.619:1; mobile Manage only28px;
checkbox and Fast labels below44px; pass-memory summary only36px; felt-footer
text4.429:1 against the brightest felt color. Worst: small/hard-to-distinguish
controls. Raise control borders above3:1, these label/summary targets to44px,
and footer text above4.5:1 against the conservative brightest surface. Muted
text already7.064:1 and bot marker4.760:1; those remain adequate.

Round5, after99f6025 GREEN push37737893201/PR37737896702. Re-read G05.
The remaining five candidates are cosmetic: score-row numerals differ from
score-strip tabular numerals; decorative label tracking varies; passive panel
borders are slightly uneven; card/table spacing differs by viewport; the empty
felt heart has a thin stroke. Worst selected: score typography. Standardize
only numeral spacing. No rules, action, timing, privacy or recovery change.
Also audit native Tab from the third selected card to the ready Pass button.

Round6, aftera5e0e4e GREEN REST-verified push37738469095/PR37738473119.
Re-read G05. Five remaining cosmetic candidates: passive panel stroke tone;
decorative brand tracking; thin empty-felt heart; tablet-only spacing; minor
panel-radius differences. Adjust the passive separator color by2 RGB levels
per channel (#2a4650→#2c4852). Controls use their independently verified border
color; no action/legibility/rules/recovery/timing improvement is claimed.
GraphQL status reads intermittently returned401; public REST and Git work.
Use /workspace/partybox-ci-head.py G05 to verify both exact-head workflow events.

Round7, afterc5da083 GREEN push37739020916/PR37739025567. Re-read G05.
A scrolled six-seat mobile probe shows the winner remains visible (top224.125,
bottom277.875 in844px), but focus is the page body. Five revised weaknesses:
final-result keyboard target lost; scored-hand Continue target lost; generic
winner live message; decorative brand tracking; passive corner-radius variation.
Fix public outcome focus and name every tied winner in the live message.
The tiny brand tracking adjustment remains cosmetic; the focus change is a
real player gain, so reset the cosmetic streak. The full regression now checks
scrolled winner visibility, scored Continue focus and final New table focus.

Further round7 diagnosis: second full local gate failed54.825fps/p9533.4ms/
max66.7ms. Low observed system load and no active background worker establish
no obvious competing process, not a proven cause. Isolated selection passed
the existing tolerance at57.145fps/p9516.8ms/max100ms. Selection wrote17
aria-pressed attributes and inspected17 badges for one changed card; update
only changed controls. This is a measured work reduction; frame-time gains
will be judged by the next complete run rather than attributed in advance.
