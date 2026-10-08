# Changes and reasons

Research/bootstrap: create an isolated G04 folder with the exact shared
TypeScript configuration,zod-only runtime and pinned development tools.
Record independently inspected source mechanics,fairness criteria and design
choices before implementation. No game or asset changes in other jobs.

Core milestone0.1.0: add samples.ts/generate.ts for160 original fictional rows
with strict row/catalog validation and byte-identical JSON regeneration. Add
scoring.ts with ratio-based numeric closeness,zero handling,date proximity
and deterministic fake normalization. differential.ts independently evaluates
logarithmic scoring over10,000 cases and14 edges,including finite extremes.
Divide before multiplying to avoid overflow at Number.MAX_VALUE.

Add core.ts with the exact shared GameDefinition,all seven data-timed phases,
first-appearance10-second distinct demos,balanced modes,4/8/12-round settings,
last-round doubling,duplicate/self-vote rules,private projections,retained
result seats and all VIP/presence events. Add bots.ts with public-clue arithmetic,
log-range estimation and template plausibility/generation; no State reaches
its policy. Add test.ts for contract/privacy/scoring regressions,full replay
and1,000 games per2–8 count in every mode. Add fixtures.ts,checksums.ts and
league.ts for all fixtures,data integrity and2,000-game comparisons per mode.

Verification runtime: add preflight.ts to bundle the actual shared contract
schema with esbuild because native Node cannot resolve its extensionless
imports. Preserve shared files. A new order-invariance regression reproduced
1,000 versus1,500 points when later truth credit overwrote earlier fooled
credit. Change truth credit to addition; the regression now passes.

Offline interface milestone: add shell.html/ui.ts/build.ts and play.html,
inline the core/zod, escape every displayed name/fake/answer, render through
public/own views and conceal controllers before each handover. Correct
writers get the same public handover order. Retain unfinished drafts/focus
during other inputs; give reveals 15 seconds instead of bot-triggered Next.
Provide every setting, eight seats, four Quick controls, anonymous votes,
results and host pause/skip/end/restart.

Scoring boundary: contiguous BCE/CE century indices make opposite first
centuries worth 750 rather than 500; reject century zero. New regression
passes with all 23 focused tests.

Add mutations.ts (25/25 genuine assertion kills), bluff-differential.ts
(independent author-centric reference; 10,000 cases), browser.ts (18 real
scenarios, exact timer boundaries, private handover, escaping, nine complete
UI matches, TV/4× CPU phone frames, reduced motion/capture) and G04.yml.
Freeze the browser clock explicitly: install alone kept real time running,
which the initial timing test correctly rejected. Build resource checks
inspect resource tags/CSS; zod's documentation URLs are inert strings.
Wire all checks into npm test.

Wheel verification: point every selected wedge under the pointer, preserve
its animation element during pause and same-phase inputs, and place the
private controller beside the TV question at wide widths. New browser
geometry checks cover all eight wedges; heavier frame sampling covers eight
seats, an open human controller and seven bot submissions. Record capture2.
Mutation reporting derives its baseline pass count instead of hardcoding22.
Bot documentation now states the harness's actual conservative tie handling
(no win), preserving the measured rates and intervals.

Data integrity: run the committed checksums before any benchmark/capture
regeneration in npm test, so modified input data cannot be silently
re-blessed by the final checksum writer. The entry guard passed locally.

KEEP GOING1: add an owner/phase draft cache in ui.ts, restore escaped
fake/value text only inside its owner's revealed controller, and clear
on submission/new phase/restart. Capture before pause/hide to prevent
losing unfinished input without leaving secret fields in concealed DOM.
Add browser regressions for all numeric/range types, bluff hide/pause
and owner isolation, plus milestone3 capture. G04 workflow concurrency
cancels only superseded runs of this PR; final-head green remains required.

KEEP GOING2: show controller question/hint/countdown, focus its input or
legal choice on reveal, and return the shared board on phone concealment.
Show a compact phone wheel during wheel phases; scroll new phases into
view. Wrap legal unbroken fake text and use two vote columns on wide
controllers. Remove implementation-only factory wording from player help.
Add keyboard/context/timer/wheel/maximum-length layout regressions and
milestone4 capture. All rendering still uses own/public projections.
