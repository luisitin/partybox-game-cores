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
