# Assumptions

- Owner's 2–8 players extends publisher 2–6; start with five dice each.
- Fair independent dice, public remaining counts, private rolls. Raw exact odds
  condition only on the viewing player's cup; learned bid information is heuristic.
- First starter seeded random. Strict palifico is default; edition exemptions and
  calza caller rules are explicit options. Current first palifico starter has no
  prior exemption. Calza is optional and disallowed in palifico/two-player endgame.
- Permanent departure retains the original seat/dice and uses deterministic bot
  takeover while a room remains occupied. Original players all remain in results.
  Empty room pauses; reconnect resumes only an automatic hold, never a VIP hold.
- Shared SDK is absent in this standalone workshop. The local reducer adapter
  must implement the specified player→speech→VIP→paused→phase event order.
  Exact contract types/schemas are imported unchanged; no pretend SDK execution.
- Valid input bids are positive safe integers capped at 1,000,000 for bounded
  platform state; UI/bots recommend up to remaining dice plus one. An impossible
  bluff is still a legal raise and can be challenged. No artificial dice-total cap.
- The old checkout-only note belonged to the historical blocked attempt. Current
  worktree isolates this job from the already accepted G02 branch, preserving the
  old branch history without force push. No game code is committed to main.
- No claims of Nash optimality, CFR implementation, or external AI champion parity.
- All implementation choices are logged here; the user's instruction is to proceed
  without clarification. Actual failed checks remain visible in verification logs.

- Host times are finite nonnegative milliseconds at most 10^15, excluding
  negative zero; fractional times within this domain are supported. Malicious
  out-of-domain reducer events are ignored unchanged. Init rejects those times.
  This bound preserves distinct phase stamps, finite pause shifts and exact JSON
  saves; normal Unix epoch and local-browser clocks fit comfortably.
- Browser reveals require an explicit Next round acknowledgement, also when a
  connected human has been eliminated. There is no unrequested reading timer.
- Bot pace belongs to the offline host, independently of core rules or strategy:
  Fast waits 750 ms (interrupts 400 ms), Normal 2,000 ms (1,650 ms), Slow 4,000 ms
  (3,650 ms), and Manual waits for an explicit step. Changing pace or resuming
  restarts that presentation wait. The visible core turn clock still expires
  normally; overdue timers precede human inputs and manual steps in the host.
# KEEP GOING round 2

Medium's certainty safeguard applies when the exact raw numerator equals its
outcome denominator. It uses only the bot's own cup and public dice counts;
the bluff model does not override a bid already proved true by those dice.
This fixes an avoidable immediate die loss. It does not claim an optimal
equilibrium, a guaranteed full-game win, or a new calibrated probability model.


## KEEP GOING round 3

- Recovery uses this tab's sessionStorage under one fixed versioned key. It is
  a convenience checkpoint for a trusted local hot-seat host, not a shared or
  encrypted save. No network or new game-core dependency is introduced.
- Returning players explicitly choose Resume or Discard. Private dice, odds and
  legal selections remain absent until the normal cup-opening handoff. Viewer
  choice and an open cup are never saved.
- Time while away or waiting at the recovery gate does not consume a live turn
  clock. Ordinary core pause/resume events preserve the actual remaining time;
  existing VIP/automatic holds and reveal acknowledgements are retained.
- Bot random cursor, skill mapping, pace and current timer/interrupt markers are
  restored; presentation delays restart when the player explicitly resumes.
- State validation uses the existing generated fixture schema, validates every
  original own map entry (including prototype-named seats), and retains the
  original JSON state rather than a parser-stripped copy.
- Corrupt, incompatible, oversized or unavailable checkpoints fail safely to
  the lobby. Storage failures are shown in plain language without interrupting
  the playable game. New Game/Discard clear only this game's key.

- KEEP GOING began only after the initial PR and each prior delivery had green
  hosted checks. Once an improvement's required local/source-matched checks
  pass, its milestone can be pushed and the next measured review can proceed
  while GitHub reruns. The PR stays draft until the exact final head is green
  and the three consecutive no-player-gain rounds are complete. Any new
  implementation failure blocks acceptance; evidence-only cadence failures
  remain recorded and must be corrected in the delivered snapshot.

## KEEP GOING round 4

Final standings come directly from game.results, including competition ranks
and all original seats. The existing composite score remains internal; the
page shows actual remaining dice and elimination order. Early host endings
retain the core's tie/winner semantics and explicit headline explanation.

## KEEP GOING round5

The valid contract can contain empty and prototype-named player IDs; the host
uses explicit null/undefined checks and verifies active-human membership.
Ordinary generated p0–p7 IDs follow the same handoff. Test-oracle state transport
uses JSON text because Playwright drops own '__proto__' properties from object
returns. Parsing that text preserves the exact original JSON and independent
core comparison; this does not change game state or relax privacy assertions.

## Reclaimed verification audit — 2026-10-08

Fresh main instructions and all matching Git refs/committer dates made G07 the
lowest eligible job at17:12:07UTC. Main claim b6da434 preserves every other row;
the claimed-main branch normally merges original ad83cdc history. PR6 remains
the delivery PR and is draft while the exact new checker head is unverified.
Only this repository explicitly authorizes main CLAIMS writes; the original
partybox-gpt-drops README's main-write prohibition remains respected.

The game, bot, session, page and existing tests are unchanged. KEEP rounds6–8
remain valid three no-player-gain reviews; checker coverage is a verification
gain, not a player-visible game improvement or a timing performance gain.
The original browser runner's genuine94-check positive is archived by its
actual f8a8d602 SHA. It is historical only, never current-checker fallback.
New positive evidence must come from a fresh native browser run. No synthetic
positive frame samples, warm-up exclusion, outlier trimming or relaxed gates.

Shared-host frame coordination uses an attempt-specific directory and one
runner per profile: fresh UUID nonce, exact profile/source/nonce grant, default
600-second wait, then CLOSED immediately after all600 native intervals. A
missing grant is an unsampled failure. CI omits this local coordination only;
its original >=59 mean FPS and <=17ms p99 gates remain identical.

Live publisher PDF URL returned404 at17:20UTC; its older bounded extraction
remains historical. Tally24 returned200 with actual30,027 bytes/SHA d6565872;
GitHub kamdolla/liars-dice's live README corroborates dice/wild-one/binomial
basics. Quoted Wikipedia text in Tally is not an independent source, and this
limited refresh does not replace the original12-source Perudo research.

## Recovered trusted-click observation repair

A real click-capture observer records the host epoch before the existing onclick;
a later bubble observer records resulting state within the same task. Native
event timestamps are diagnostic only because recovered host epochs may rebase.
No Date/performance/RAF override, tolerance change or product edit is involved.
Real delayed-observation countercontrols establish an observation vulnerability
without proving the cause of the historical phone failures. The650ms save-fixture
consumption strengthens the existing250ms reset detection.

The original native frame fixture explicitly has turnSeconds0 and hot-seat
humans. Core deadline is null; no timer can expire during a grant wait. Real
boundary workload snapshots now verify that fact and the complete active fixture
before/after all600 unfiltered native intervals. Release markers precede hashing,
screenshots and artifact writes.

The environment reset interrupted a functional-only run and exceeded the30-minute
branch-push rule. Recovery preserves the elapsed gap and partial output; no pass
is inferred from a launcher exiting or missing final report. No BLOCKED condition.

## Actual unsampled checker failure and correction12

Full run20261008191711475 completed all94 checks:92 PASS, two strict setup
failures on undefined !==8 because the new observer used array.length for the
contract player map. Both failures preceded READY; zero frame intervals were
collected. Both owned Node/browser groups closed before correction. All four
actual clock observations passed unchanged200/250ms gates (errors0/17/0/60ms).
The complete failed report, exact32 source maps and original log are preserved.
This is a checker error, not a gameplay or FPS failure. Corrected count uses
Object.keys(state.players).length; no production/timer/native callback changed.
Native samples now also save an explicitly incomplete sidecar immediately after
CLOSED, before endpoint verification; it can never substitute for complete raw
acceptance. Workload corruption controls alter BOTH report/raw boundaries, so
finished/timed/closed-cup/missing-odds/changed-bid/dice fixtures cannot merely
fail because two copied reports differ. Current full/CI acceptance remains
PENDING; no unchanged strict timing retry occurred.

## Final actual-current proof13 and retained local failure

Exact41f6226 run37831510960 SUCCESS19:33:31UTC; actual job113497745355 full
137918-character log inspected:116/116 units,25 actual compiled assertion kills,
full94/94 browser,32 guards/1200 intervals,88/88 current controls and404 hashes/
2x identical regeneration PASS. Genuine official artifact11573104871 ZIP
1249277B/SHA87a98e203ec7f2b5bac369258e52a9d51081f0184861963d23a0f324c834f739
was downloaded,CRC/safe-path checked and independently validated with1387 Python
assertions:all32 actual source bytes match,all94 checks/1200 intervals/click
observations/active workload boundaries verified. Desktop60.001800/phone60.002400,
p99/max16.8. ZIP+reader+receipt persist publicly; no14-day artifact dependency.
`G07_CURRENT_BROWSER_REPORT=<actual extracted hosted report> node --test
tests/browser-evidence.test.mjs`:88/88 PASS. Current-only CLI PASS against that
actual report. Actual retained local93/94 is rejected as complete acceptance
despite passing both strict profiles; this meaningful negative control PASS.

Local20261008192314580 EXIT1 at19:31:11.671UTC:93/94,one phone calza pre-click
RPC time-bound assertion failed before real-dispatch assertion. Actual elapsed
value is absent; no product cause inferred or criteria relaxed. Both600-native
profiles PASS60.002400/59.310808,p9916.8; actual phone max66.7 remains. All32
source guards unchanged. Full report/all1200 intervals/native sidecars/grants/
STOP-CONT markers remain byte-preserved. Waiting-only desktop hold19:25:39.795546
to19:27:22.180445 preceded any measured frame/timing task; no native elapsed
acceptance window was stopped. Root's continuous G07phone/G02desktop/G08enTV
quiet hold ended only19:33:36.516122. No invented intermediate release.

`node scripts/capture.mjs resume-audit-13`:actual EXIT0 closed19:35:32.748;two
five-round games,same33f5 page,zero errors/network. Actual935764B SHA2b37fd77
and956240B SHA75416945 recordings are under10MB. `ffprobe -count_frames ...`
and `ffmpeg -v error -threads 1 -i <actual clip> -f null -`:both actual VP8
decodes PASS,1280x720/390x844,264/310 encoded frames,10.56/12.4s. Encoded25FPS
is a recording property,not game refresh proof. Final checkpoint's new-head CI
still must pass before ready;prior source-specific green remains explicit.
