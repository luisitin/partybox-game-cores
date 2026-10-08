# Resume G05

PR5 https://github.com/luisitin/partybox-game-cores/pull/5, branch job/G05-hearts.
Read root README/RULES/JOBS first. G03 PR3 complete/green; preserve it.

G05 baseline25-test full checks and actual disk/60fps were green at9c68bca
(push37732593065 and PR37733349438). ROUND1 now fixes fresh default deals and
reload recovery:28 total tests,20 saved phase/roster resumes, clock/corruption
checks, and browser scored-hand2 recovery with no exposed private cards.
Milestone02 is136KB; phoneCPU4x59.670fps/p9516.8ms. See VERIFY/REVIEW/LOOP.

Push/refresh this round and wait for both updated G05 checks to go green.
Then KEEP GOING: re-read job, list five weaknesses, fix worst and measure.
Remaining known weaknesses: mobile ranked winner sits below last-trick table;
received cards lack a marker; timed Manage menu does not automatically hold time.
After three consecutive rounds with no meaningful player gain, claim the next
eligible job. Keep NEXT/claim current at each push and ≤30min of work.

Core/fixtures/25 mutants/10k independent comparisons/1003 property seeds/
1000 games at each3–6 count/2x2000 leagues/source receipts remain in the suite.
Local Chrome file:// is managed-blocked: use explicit --http only locally;
CI must run default actual-disk npm test. No DONE claim until the full loop ends.
