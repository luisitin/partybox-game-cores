# KEEP GOING reviews

The first review begins only after current-head CI passed: run 37737745593,
head 6dd4c32, PR #6. Each round re-reads root README/RULES/JOBS and the job spec.
LOOP.md records exactly one line per completed round; review details live here.

## Round 1 — bot pace

Five biggest remaining weaknesses, ranked:

1. Bot bids replace 12-word public text every 741–801 ms; an eligible human's open five-die cup is cleared on the next bid. Fixed 400 ms calza interrupts can end the opportunity even earlier. Worst: ordinary playability.
2. Refreshing an active standalone page loses the session. The deterministic core is saveable, but the browser host does not yet provide recovery.
3. The page omits final rankings and finishing order, although the core provides complete results. An early host end says only “Thanks for playing.”
4. On-page palifico help omits the two-survivor exclusion and obscures the prior-experience condition for face exemptions. Full RULES.md is correct.
5. Bot-strength certification is for default duels; mixed 3–8-player/variant advantage is a measurement limit, not an established loss or a claimed guarantee.

Read-only before proof: seven bid replacements at 741, 796, 801, 799, 800, 800, 800 ms; first replacement removed all five private dice. Root additionally checked 7,000 schema-valid raises at eight seats without a 256 KiB breach; the existing 128-bid history bound prevented growth. No size correction is warranted by that probe.

Round 1 completed locally: configurable Fast/Normal/Slow/Manual host pacing, plus dispatch of overdue timers before stale human/manual actions or a bot sample that crosses expiry. Core strategy/rules are unchanged. The same seven-bid trajectory increases from mean 791 ms to 2095.142857 ms (2.648727×); human calza succeeds at 1141 ms desktop and 1256 ms phone. Manual waits beyond 2.2 seconds until an explicit step. Default full browser 52/52 passes; clips show Normal and Manual behavior. Public raw proof: evidence/browser/round-1-pacing.json, report.json and round-1-captures.json.

The first expanded run failed two assertions (50/52): a test wrongly required timed dudo, although the normal core timer can make a legal raise. Its runner and complete measurements are archived under evidence/browser/runs/aa9d7b31…/20261008065708225. The corrected regression compares against the exact real core timer result and proves stale manual/human actions are consumed. This corrects the test oracle without relaxing the host requirement.

Current-head CI must pass before the next round begins. Newly discovered concrete remaining weakness: Medium challenges even when its own cup proves the bid true; six hidden-die counterfactuals all lose a die, while one legal raise has positive 1/6 probability. Rank this alongside recovery, standings, help and multiplayer evidence in the next review.

## Round 2 — Medium certainty guard

Started after exact head 6387696 passed run 37741554805. Re-read root
README.md, RULES.md and JOBS.md before choosing the next improvement.

Five biggest remaining weaknesses, ranked:

1. Medium's independent low-raise threshold can override a bid proved true by its own cup. A naturally rolled, 27-event game from seed 1309716532 reaches two own ones against an opposing two-ones bid: Medium challenges and loses a die for every possible opposing die, although three ones is a legal raise with positive 1/6 raw probability.
2. Refreshing an active standalone page loses the session; no browser recovery yet.
3. Final rankings and finishing order are omitted from the page despite complete core results.
4. The concise palifico help omits the duel exclusion and prior-experience condition for face exemptions.
5. Strong's mixed-table advantage is inconclusive at six to eight players in the separate 24,000-game diagnostic; optional-variant strength is unmeasured. This is an evidence limit rather than a demonstrated regression.

Selected correction: an exact-integer certainty guard for Medium, with no
threshold retuning and no Easy/Strong policy change. Regression and required
new-source checks were pending at the cadence checkpoint.

Completed local round 2 proof: the new 3-test regression passes; the old frozen
core fails exactly the original defect and passes both unchanged controls.
All six compatible opposing dice change a certain-loss challenge to three
ones, the sole positive raw1/6 raise. Immediate opposing dudo still loses a die
in five worlds and preserves both dice in one; no general survival claim.
All 35 uncertain own cups and the near-certain exact-numerator control remain
unchanged, with opposing-cup/game-RNG read traps passing.

Required new-source checks pass:38/38 node tests,7,000 complete games,
1,698,452 every-event restored comparisons,12,279,033 bot samples,1,003 property
seeds,20,000 probability differentials,25/25 compiled assertion mutation kills,
required Strong 64.70%/Medium 58.90% league and fresh 66.8%/57.0% holdout. The
page passes 52/52, both 600-frame gates and source-matched round 2 clips. Details:
evidence/checks/round-2/verification.json and VERIFY.md. This is a player-visible
decision correction; consecutive no-gain count remains zero.

Interim cadence run 37744597968 correctly rejected the stale initial matrix
report after all 38 node and 52 browser checks passed. The finished local matrix
report hash 455532eb…dc093 exactly matches the hosted regenerated hash. Publish
this report with refreshed hashes; exact new-head green is required before round 3.


Round 2 hosted acceptance: exact head 2ba462691ea3bbecf8607f0737b3287cc8909af7
passed run 37746548680 at 08:03:56 UTC. All 38 node tests, 52 browser checks,
25 compiled mutation kills and 256-file integrity passed. Public metadata is
evidence/checks/ci-round-2.json.

## Round 3 — recover a browser session

Started after that exact-head green run. Re-read root README.md, RULES.md and
JOBS.md before selecting the next improvement.

Five biggest remaining weaknesses, ranked:

1. Reloading the offline page loses an active game. The core can already round-trip, but the browser does not preserve the host's random cursor, pace, timer marker or interrupt marker.
2. The page omits final rankings and finishing order despite complete core results.
3. The concise palifico help omits the duel exclusion and prior-experience condition for face exemptions.
4. Strong's mixed-table advantage remains inconclusive at six to eight seats in the separate diagnostic; optional-variant advantage is unmeasured.
5. The host retains historical timer-instance markers instead of just the current instance. This is a bounded-state hygiene concern with no demonstrated ordinary-play failure.

Selected correction: a versioned, validated same-tab session checkpoint, an
explicit Resume/Discard gate with private cups absent from the DOM, and exact
host-clock/random-cursor recovery. Only the active timer marker is retained.
A returning active game freezes time away; intentional and automatic holds,
reveal acknowledgements and finished games preserve their existing state.
Focused module tests pass 8/8; full browser/reload proof and milestone recordings
are still running at the cadence checkpoint. No completed round or new gain
is claimed before those measurements pass.

Round 3 completed locally: the versioned same-tab checkpoint restores the
original JSON state, shared RNG cursor and host markers, with an explicit
covered-cup gate and preserved remaining timer. Eight focused tests and all
24 new desktop/phone recovery scenarios pass. The whole final default full
run 20261008083956897 passes 76/76; both unchanged600-frame gates pass at
59.902359/59.803247FPS. Both source-matched clips demonstrate two real reloads,
covered resume and Discard/New Game key cleanup, plus pacing and five actual
rounds. Public report and capture metadata are in evidence/browser.

The first 74/76 local run failed only frame gates and remains archived. Cold
paired diagnostic profiling found zero in-sample saves and no codec hotspot;
the previous page also stalled under tracing. No unproved implementation
optimization or frame-gate relaxation was made. Hosted cadence independently
passed 46 node/25 mutations/76 browser checks, then correctly rejected the old
retained page snapshot. The fresh unchanged full confirmation and matching
clips fix the evidence mismatch. This is a player-visible recovery gain;
consecutive no-gain count stays zero.

## Round 4 — final standings

Started after the completed local round3 proof was pushed at30eec5b. The PR
was already green before KEEP GOING; final exact-head hosted acceptance stays
mandatory. Root README.md, RULES.md and JOBS.md were re-read.

Five biggest remaining weaknesses, ranked:

1. Finished games omit rankings and elimination order even though the core returns complete results. Host-ended games show only thanks, without explaining tied places or remaining dice.
2. Palifico help still omits its two-survivor exclusion and prior-experience condition for the optional face exemption.
3. Strong's mixed-table and optional-variant advantage remains an evidence limit; default duels are certified.
4. Browser-created IDs are safe p0–p7, but manually injecting an otherwise valid save with an empty-string seat exposes existing viewer truthiness checks. This is a developer interoperability limit, not ordinary browser play.
5. Verification/handoff prose retains historical pending checkpoints beside later passing results, making current acceptance harder to locate.

Selected correction: display the actual core results in an accessible finishing
list on the done screen, including all original seats, exact competition ranks,
tied winners and remaining dice. Preserve early-host-end semantics and the
core's elimination order. Source build, actual-UI results regressions, whole
browser/raw-frame proof and milestone recordings are required; core strategy
and gameplay source remain unchanged.

Round4 completed locally: exact results now appear before the final reveal,
with all original seats, competition ranks, remaining dice, elimination order,
tied winners and the core's end reason. The same actual eight-seat End-game
fixture increases visible finishing places0→8 and named tied winners0→2.
Ten independent displayed-row vs actual imported-core comparisons and the
whole84-check browser run pass. Both unfiltered600-frame gates and source-
matched desktop/phone recordings pass; New Game/Discard cleanup and safe
long/markup-like names also pass. Core/session source remains unchanged.
This is a player-visible result-screen improvement; no-gain streak stays0.

Round4 hosted acceptance: exact445cf47 passed37755395776 at09:25:32 UTC;
46 node tests,25 compiled assertion-killed mutants,84 browser checks (both
strict frame gates) and293-file integrity passed. The hosted artifact is
source-bound; metadata is in evidence/checks/ci-round-4.json. It has not been
downloaded, so no hosted FPS values are asserted.

## Round 5 — accurate palifico help and supported seat IDs

Root README.md, RULES.md and JOBS.md were re-read after round4 completed local
proof was pushed at445cf47. Round4 exact-head CI subsequently passed;
metadata is retained in evidence/checks/ci-round-4.json.

Five biggest remaining weaknesses, ranked:

1. On-page palifico help omits the two-survivor exclusion and suggests a one-die exception without the required prior palifico experience. Full RULES.md/core are correct.
2. A valid same-tab save with an empty-string seat ID passes the core/session contract but browser truthiness checks prevent that seat from opening its cup or acting. Browser-generated IDs are unaffected, but valid recovery should work.
3. Default-duel strategy strength is certified; larger-table and optional-variant superiority remains an explicit evidence limit. There is no justified strength retuning target from the existing inconclusive diagnostic.
4. Current verification status is obscured by preserved historical pending checkpoints. NEXT now has a current summary; VERIFY's top summary still needs later cleanup.
5. The pacing evidence filename names round1 even when it contains the latest source-matched rerun. Its original archive is retained, but the distinction requires explanation.

Selected fixes: correct the concise palifico explanation against existing
source-backed rules; replace viewer/winner ID truthiness with explicit null
checks where valid empty IDs must be accepted. Preserve ordinary handoff,
covered-cup privacy and unknown-seat behavior. Add actual UI/core comparisons
for rule conditions and a genuine valid empty-ID saved-game recovery/move/
acknowledgement, including prototype-named seats. Core/session/strategy source
remain unchanged; require strict build, full browser and source-matched clips.

Round5 completed locally10:08:17: full94/94 on unchanged33f5 HTML,
desktop60.002400FPS/phone4x59.803247FPS, all600 raw intervals each and both
unchanged gates pass. The genuine seed1 saved roster improves empty-seat
private-dice availability0→5; ordinary empty/prototype bids and constructor
cup work, while unknown-seat private dice remain0. All ten new profile cases
and18 exemption conditions pass. Matching functional clips demonstrate
Resume, private opening, bid, challenge and acknowledgement plus pacing and
natural finish. Core/session source unchanged; player-visible gain, streak0.

Both failed expanded runs remain with exact runners/raw frames. JSON text
transport preserves original own prototype keys. Actual pause instrumentation
proves pre-pause arm-time state can legitimately change before a delayed
click; accepted paused state/RNG holds and cup clears. The final oracle keeps
the actual pause/privacy/RNG/resume assertions. Diagnostic FPS remains
nongating and original frame-failure cause unestablished. Cadence hosted
all94 browser checks passed before the old-snapshot integrity rejection;
the complete new snapshot is now published.
