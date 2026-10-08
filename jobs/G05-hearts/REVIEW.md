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

Round8, after5509a20 GREEN push37741005827/PR37741010277. Re-read G05.
Five remaining documentation/cosmetic weaknesses: chronological VERIFY obscures
current checks; old README status wording; fixture navigation; source-license
index formatting; decorative layout differences with no functional gap.
Worst selected: verification summary. Add a current30-test/actual-disk summary
and preserve the unmodified hosted report. An eyebrow-tracking trial failed
local cadence55.105fps/p9533.3ms/max50ms and was reverted; all game/UI/test
source stays byte-identical to the proven5509a20. No player gain is claimed.

Round9, afterfeb83f2 GREEN push37742150805/PR37742157321. Re-read G05.
Five remaining documentation/cosmetic weaknesses: README obsolete baseline
status; fixture/rule navigation; provenance-license grouping; assumption index;
minor decorative layout differences. Fix README status and relative navigation
links, remaining under60 lines. Game/UI/test source stays unchanged. No
meaningful player gain; fresh unchanged-interface capture records milestone10.

Round10, afterba95921 GREEN push37742910131/PR37742916541. Re-read G05.
Five remaining doc/cosmetic weaknesses: link-count typo8vsactual7; delivered
licence navigation; historical checkpoint readability; fixture navigation;
minor visual decoration. Correct the typo and add a short delivered-material
licence index. No game/UI/test changes, no player gain. This measured review
makes three consecutive no-meaningful-gain rounds8–10 after the real round7 fix.

Resume review11, after exact original head678d077's push37744744041 and
PR37744750013 SUCCESS (REST metadata read; no new log/artifact inference).
Re-read root README/RULES/JOBS and original Hearts rules/docs. Five material
remaining weaknesses: the57.14fps/p95≤20 browser tolerance is weaker than
the60fps target; timings lack preserved raw intervals/current source binding;
captures have no report-bound actual SHA; boundary-test coverage is limited;
mid-phone CPU4x and absent private SDK remain approximations. Select the
verification gap:600 consecutive unfiltered intervals,≥59fps/p95≤18,26
source start/end hashes and independently checked real clip size/SHA.
No game/core/UI/bot change or player-visible gain. Exact head1fb4f21 now has
SUCCESS PR run37793907360 with the complete strengthened gate; all1,200 raw
intervals/current guards/actual clip were verified by the executed CLI. Local
failures are retained separately and remain unexplained. Review11 completes
as verification-only, beginning a new no-player-gain streak of1.

A synchronous programmatic Manage toggle at real deadline+30ms held the old
actor in the actual file. A native mouse click delayed by a capture listener
to that same boundary instead let RAF timeout advance p0→p1 and concealed the
new hand. Thus the programmatic ordering probe is not a reproduced native
player defect; no speculative gameplay fix was made. The core already rejects
inputs at/after deadline. New-table explicitly clears private DOM, and the
full original Zod MIT notice is bundled.

Round12, after exact e5f92a1 PR run37795105831 SUCCESS; the complete native
job log was read. Re-read root README/RULES/JOBS and Hearts README/RULES.
Five remaining weaknesses: source-binding unit cases use mocked hashes;
the top verification summary still describes the original30-test scope;
unexplained local cadence varies despite repeated hosted60.0024fps passes;
native deadline-boundary coverage is limited; physical phone/private SDK
coverage remains unavailable. The latter three do not establish a new player
defect. Select source-binding coverage: test a real harmless HTML-byte change
with guaranteed restoration, and reject the actual full-kind logged CI
summary that omits raw arrays. Synthetic timing fixtures remain explicitly
unit data, never a claimed browser measurement. No runtime/core/UI changes.

Round12 focused checks pass6/6 groups/34 negative controls. The actual HTML
comment changed the real source hash, rejected the stale unit report and was
restored byte-for-byte; bundle equality153921B remains intact. The actual
full-kind CI console summary is rejected specifically for absent raw intervals,
even against its own historical source snapshot. No measured browser PASS
is inferred from unit timing fixtures. Player-visible gain: none, streak2.

Round13, after exact9ea8ed0 PR run37796476539 SUCCESS; the full94,712-byte
native log verifies36tests/25mutants/1,200raw/current-source/actual-capture.
Re-read root README/RULES/JOBS and Hearts README/RULES. Five remaining
weaknesses: nongating capture commands use an ignored helper absent from a
fresh checkout; the top verification summary retains the old30-test scope;
unexplained local cadence variance; limited native boundary coverage; CPU4x
phone/private SDK coverage limits. No concrete new player defect is proved.
Select reproducible evidence: publish the proven functional capture helper
with its actual self-hash, explicit nonacceptance purpose and a fresh unused
milestone. Correct the stale verification header while preserving all history.
Default strict runner/checker and gameplay stay unchanged; this is no player
gain. The final exact-head workflow remains required before readiness.

Round13 actual public helper command works,27source guards match and the
136324B genuine clip passes independent byte/SHA checking. Current strict
marker is unchanged; its functional-only report rejects full acceptance.
README45lines remains under60; old verification history remains untouched
below a corrected current36-test scope. No player gain, resumed streak3.
