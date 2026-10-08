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

KEEP GOING3: parse explicit case-insensitive BCE/CE year markers before
fallback numbers, supporting1–5 digits and optional marker spacing. This
prevents short-year/default2000 errors and unrelated object IDs being used
as years. Add eight supported-clue regressions and hidden-answer substitution
checks. Default samples/fixtures/policies outside date parsing are unchanged.
Regenerate bundled HTML and capture5; all six2,000-game leagues retain
identical measured counts, and22 browser scenarios pass.

KEEP GOING4: add pure estimates.ts,using the original sqrt result on normal
products and logarithms on subnormal/overflow products,then clamp to bounds.
Select a nonzero century within the actual range. Share those rules with
controller defaults,retaining fractional values instead of rounding below
minimum. Add9000 contextual-action and fractional/one-sided default
regressions; include the helper in the purity scan. bounds-probe.ts and
before/after JSON record2674→0 invalid inputs and run in npm test. Default
sample outcomes stay unchanged; regenerate HTML and milestone6 capture.

KEEP GOING5: replace Medium's long generic fakes with two-word plant/harbour,
material/machine and material/defect phrases from public hints. The earlier
phrases were trivially distinguishable by length. Add300 style/schema
regressions and style-probe.ts with before/after JSON,wire it into npm test,
and regenerate affected fixtures/HTML plus milestone7 capture. No hidden
answer is used. Re-measure all six leagues and update BOTS with actual rates.

KEEP GOING6: add phase-audit.ts to check frozen states in every phase
against malformed/stale/spectator events,paused play,hidden truth/other
submissions/votes/authors and detached views. Wire the audit into npm test.
Replace sequential replay seeds with1,000 unique uint32 PRNG draws plus
1/2/3;verification-seeds.ts and property-seeds.json make them reproducible.
Only verification changes;production core,bots and HTML are unchanged.

KEEP GOING7: require a nonempty normalized bluff truth in rowSchema. Four
whitespace/format-only truths previously validated and produced an invisible
correct vote option. Reuse pure normalization; preserve all160 sample bytes.
Add blank-truth factory regressions,catalog-probe.ts (10,000 valid varied
rows/30,000 actual reducer submissions/7,500 defaults),before/after JSON
and npm test wiring. Rebuild bundled HTML and record milestone8 capture.

KEEP GOING8: parameterize league.ts with a held-out seed cohort2,001–4,000
and separate report;record both seed bounds in every report and run both
cohorts in npm test. Re-run the original cohort and compare every prior
report field to the committed result:identical. This is a verification
change only;no core,bot,content or UI behavior changes.

KEEP GOING9: let browser.ts retain separate reports/screenshots/captures
for two fresh browser process repeats;add both to npm test. Each uses the
same exact standalone bytes,22 functional scenarios and600 total TV/phone
frame intervals. Production core,UI and HTML are unchanged. This addresses
frame-sample variance without relabeling the4×CPU approximation as a device.

KEEP GOING10: add churn-probe.ts and npm test wiring for1,000 seeded
games with disconnect/reconnect/permanent leave/pause/resume events,
retained-seat results,independent score ranking,JSON round trips and
50 prototype-named rosters. Freeze input states and check stale timers
after drop-triggered transitions. No production change was needed.
Update README/NEXT with the final validation scope and honest CI gate.
