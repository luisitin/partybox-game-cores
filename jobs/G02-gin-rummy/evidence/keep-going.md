# Post-green quality rounds

The required initial hosted gate actually passed at c0dabcfd (run37717614222)
before these rounds began. The timer/discard milestone at b82c0cbc also
actually passed run37719011330. Neither pre-round repair is counted below.
RULES.md and JOBS.md were re-read before beginning round1.

Round1 five biggest weaknesses, in priority order:
1. An absent active seat blocks its discard or a later turn without a clock.
2. Branching layoffs take 1.5s locally /6.8s in a 4x browser microbenchmark.
3. A delayed host timer callback loses elapsed time; no visible countdown.
4. Custom knock melds need numeric IDs and the reveal recomputes a different layout.
5. The complete-match replay matrix compares final states, not every event.

Worst fixed: absent turns now drain to a present player or the hand reveal.
Empty rooms pause; temporary reconnect only clears an automatic room pause.
VIP pauses remain intentional; permanent departure cannot reconnect. Original
seat scores and results persist. A waiting present seat can advance a reveal.
Actual targeted command: node --test tests/departure.test.mjs
 tests/rules.test.mjs tests/all-phases.test.mjs (on one line),13PASS/exit0.
Departure test:1,000 initial cases,120 complete matches,17,184 events,
maximum75 automatic transitions; all4 live phase departures also pass.
Before witness and exact output: departure-before.json,round-1-targeted.log.
Full acceptance/browser capture are the next verification of this repair.

Round1 full npm test passed all24 node tests, complete matrices, leagues
and25/25 mutants, then FAILed the desktop58.381FPS browser gate. The first
capture failed phone32.928FPS. Both failures/raw frames are preserved. A
same-code1.1/1.2 comparison then measured60.002–60.004FPS on both profiles,
with1.2 phone click handler max2.1ms. No failure cause is asserted. Fresh
standalone browser/capture PASS: desktop59.672FPS/max33.3ms, phone4x60.002
FPS/max16.8ms; all privacy/leave/pause/offline checks passed. New captures
explicitly throttle phone4x; earlier capture contexts did not explicitly set
CPU rate. Required normal-play4x benchmarks always explicitly did so.
Current-head hosted acceptance remains required before completion.

Round2: JOBS/RULES re-read; five remaining weaknesses in priority order:
1. Branching layoff calculations stall the phone for several seconds.
2. A delayed host timer callback loses elapsed time; no visible countdown.
3. Chosen knock melds need numeric IDs; reveal recomputes another layout.
4. Complete-match replay tests compare only final states.
5. Sporadic frame outliers need honest repeated measurements and retention.
Worst fixed: per-call memoization deduplicates equivalent remaining-card/
target-attachment positions. A safe optimistic coverage bound sums cards
that cannot enter any own meld or reachable target extension; reaching that
unavoidable deadwood proves optimal and ends the search. No module cache.
First strict-improvement visit preserves canonical tie order.
Actual node --test tests/rules.test.mjs tests/differential.test.mjs
 tests/layoff-differential.test.mjs tests/branching-layoff.test.mjs
 tests/departure.test.mjs:14PASS/exit0;10,000 independent deadwood minima,
2,000 independent joint-layoff minima,branching cases and departures.
Actual node scripts/mutations.mjs:25/25 compiled assertion kills.
Actual node scripts/profile-layoffs.mjs before/after:all2,002 full solutions
retain hash7ab55e32b3c93ae6c57c8333ec911da148441a143d06d54a059cf491fc3fb44b.
Local cold hard cases1362.466→2.953ms and247.598→0.701ms. All-case wall
1760.340→231.767ms. Raw per-case samples/source hashes are retained.
Actual node scripts/profile-browser-layoffs.mjs:4x browser hard cases
6813→11.3ms and1278.1→10.2ms; identical full solutions. These are algorithm
microbenchmarks, not frame-rate measurements. The actual playable-page
browser/capture passes60.002/60.004FPS, both p99/max16.8ms and17 privacy/
control checks per profile. The videos explicitly use1x/4x CPU and <10MB.
Round1 hosted run37721051891 actually SUCCESS at b096b6a; round2 current
hosted acceptance remains required. Observable gain: no multi-second wait.

Round3: JOBS common requirements and G02 re-read. Five remaining weaknesses:
1. Host callback counting loses elapsed time and no countdown is visible.
2. Custom knock groups use IDs, reveal a different layout and leave private drafts.
3. Complete-match replay proof checks only final states.
4. The host's fixed7199 initial seed repeats the first shuffle after reopening.
5. Sporadic browser-frame outliers need continuing honest observation.
Worst repair begins: use host monotonic elapsed time, show/pause its countdown,
and consume a late callback at the actual elapsed time. Also seed the host RNG
from Web Crypto outside the pure core, with controlled test entropy for repeatable
UI checks. The pre-repair delayed20s/10s-clock witness advanced zero actions.

Round3 actual node scripts/clock-check.mjs PASS/exit0: delayed20s callback
now advances one expired10s move;9s shows1s, paused time stays10s, resume
after25s hold restores10s, and the second deadline also advances. Production
bootstrap obtains one Web Crypto seed outside the pure core. Test entropy is
controlled7199, rather than claiming to statistically certify randomness.
Actual node scripts/browser-check.mjs --capture --clock-capture PASS/exit0:
desktop60.003FPS/phone4x60.004FPS, p99/max16.8ms, offline/privacy/reduced
motion checks and visible-clock videos PASS. Game logic unchanged this round;
current-head hosted full checks remain required.
