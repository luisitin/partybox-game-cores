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
