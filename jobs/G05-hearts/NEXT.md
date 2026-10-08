# Resume G05

PR5 https://github.com/luisitin/partybox-game-cores/pull/5; job/G05-hearts.
Read root README/RULES/JOBS first. G03 PR3 complete/green; preserve it.

Baseline and rounds1–6 full CI GREEN, latestc5da083 push37739020916/
PR37739025567. Round7 discovered/fixed lost scored-hand/final keyboard focus
and generic live winner names. New table now focused; Continue focus retained;
all tied winners named. Mobile winner remains visible when playing scrolled.
Selection updates only changed controls. Local full milestone08 passes29 JSON/
54 hashes and every browser gate; desktop60.004/CPU4x phone58.068fps,p9516.8ms/
max50ms,136272B clip. Two earlier local cadence failures are recorded in VERIFY;
no samples removed or unproven cause claimed. Need fresh actual-disk CI.

Publish/refresh, await BOTH exact-head updated checks green, then re-read G05
and list five weaknesses. Rounds5–6 were cosmetic, but round7 has real gain;
current streak0, so require THREE further consecutive cosmetic rounds.
Remaining candidates only decorative tracking/radii/empty-felt stroke/spacing.
Fix any newly discovered real issue and reset streak. Do not merge. Keep NEXT
and main claim fresh each push and at least every30min.

REST checker: `python /workspace/partybox-ci-head.py G05 --watch` (exit0 both
green,1 failed,2 pending without watch). GraphQL sometimes401; REST/Git work.
Full30 tests/25 mutants/10k independent cases/1003 property seeds/1000 games
each3–6/4000 leagues/repro/source/schema/hash/browser remains. Local --http is
explicit partial; default CI must open actual disk. No DONE until loop ends.
