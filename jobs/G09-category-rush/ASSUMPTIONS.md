# Decisions and assumptions

- Recovery19:11:52Z follows the last18:07:35Z branch push:64m17s elapsed during
  interruption, a real violation of the30-minute milestone rule. Record the
  next actual successful push and derive new25/30-minute targets from it.
- Coordinated old frame tests started the60-second answer timer before waiting
  for their grant. The first round7 screenshots prove the page had already
  reached private handover. These local samples remain real but do not prove
  active-answer workload performance; prior coordinated local phase claims
  have the same unverified scope. Hosted runs do not wait for a local grant,
  but their old runner still lacks a per-callback active-phase witness.
  The test-only correction waits before starting the timer and checks visible
  form, modal absence, native wall time and advancing timer on every callback.
  It retains600 native deltas,59FPS/p99<=17ms and the original250ms settle.
  This is a justified changed-workload proof repair, not an unchanged luck retry.

- This workshop supplies exact contract types and schemas, but no game-sdk package. The core uses an explicitly documented local reducer adapter with the required player → speech → VIP → paused → phase order. Its English answer matcher implements the documented normalization, singular/plural, long-answer one-edit and transitive grouping behavior; it does not claim to bundle the absent SDK's complete language stemmer.
- Fresh category lists, three rounds by default, 2–8 seats, shared victory on a final tie, and canceling all repeated answers within one player's round are stated house choices. Official edition and variant differences are described in RULES.md and CONFLICTS.md.
- Every authored category is original. Its answer bank supplies examples for deterministic bots, never an exhaustive dictionary or an automatic veto on a human answer. Bots abstain on unfamiliar answers; the group decides their validity.
- No ballots means no challenge and an otherwise eligible answer stands. Null ballots abstain. An equal nonzero vote removes the answer author's vote; a remaining tie rejects. Duplicate answer groups already score zero.
- A departed player's locked answers remain in the round and can cancel duplicates. Departures never remove them from final results. Reconnection cannot undo a permanent leave/kick. Late spectators cannot enter the fixed roster.
- A VIP ending during writing or review keeps only scores already settled in earlier rounds. Skipping review settles the current category from ballots already cast.
- The hot-seat page gives each human a private writing turn with the same time allowance. Its local virtual clock freezes between handovers; the core still owns deadlines and only processes explicit timestamped events.
- Review and score deadlines use the absent SDK's documented 1.5 s + 333 ms per word × 1.3 UI reading formula, with discussion time during votes and at least 45 s for scores. The hot-seat page waits for explicit Next on scores, so receipts can be read at the group's pace.
- English content only. Proper names must be written with the chosen initial first. Extra proper-name alliteration points and automatic tie-break rounds are researched but not selected.

- The offline page immediately settles a currently public review category with no answer groups by sending the real timer event at its real deadline. It advances at most twelve such steps, never while paused or while the host menu is open. The shared core and nonempty ballot deadlines are unchanged.
- At four or more present seats Strong samples its full available bank, using a deterministic public-seat rotation when that bank can cover the table. This avoids unnecessary collisions caused by truncating the bank; it does not infer other players' answers or skill settings. Smaller tables retain the less-obvious authored-half heuristic. Completed scored history is public; the page reveals it only on scores/results.
- The offline client stores a versioned local snapshot only on this device.
  Resume/Discard is explicit, private turns return to handover, and time while
  the page is closed does not consume a turn. Recovery restores the actual
  contract RNG counters and remaining active time. Snapshots are bounded to
  500,000 UTF-8 bytes/code units and validated before use; incompatible core,
  data or save formats are rejected. This is recovery from accidental reload,
  not protection against a person editing their own local storage. Browsers
  that deny storage can still play while the page stays open and receive an
  accurate warning. No network or server persistence is involved.

- The bounded English matcher now includes 38 explicitly sourced common noun
  plural tokens and protects singular news. Ambiguous axes/bases are not merged
  into their scientific homographs, since transitive grouping would then join
  unrelated axe/axis and base/basis answers. This is not a complete English
  morphology or word-sense model; existing contract fuzzy matching is retained.
- The paired-answer measurement uses unanimous actual ballots, without editing
  state letters/prompts, to isolate duplicate adjudication. It does not claim
  every randomly selected prompt semantically fits each chosen noun pair.

- Private writing hints describe only wrong initials and directly equivalent
  answers within the active person's own draft, using the existing scorer's
  matcher. They do not judge category fit, predict another person's answer,
  disable submission or promise points. Every locked answer and original ballot
  still goes through the unchanged core. The current 0-to-3 warning comparison
  measures visible feedback on deliberately constructed own drafts, not human
  error rates or point gains in real play. The save format remains compatible;
  restored warnings are derived again from the person's saved draft.
- Optional local frame-window coordination is a host-only helper. One active
  runner owns each profile in a fresh attempt directory. READY and CLOSED are
  atomic receipts, and a grant must match profile, source hash and fresh nonce.
  Uncoordinated CI skips the helper's file I/O and retains all600 native frames,
  the original59FPS/p99<=17ms gates and separate recording contexts. Functional
  paused clocks never feed that sampler.
- Seventh-round clipboard tests grant permissions only to their isolated local
  Playwright context; production never requests clipboard access. Native paste
  preserves tabs/vertical tabs/DEL but converts newline/CRLF to spaces in the
  tested Chromium version. These are observed browser behaviors, not a promise
  about every browser. A real authored answer loses a point after controls join
  its initial article to its noun; no player improvement is claimed before a
  measured correction and all current-source checks.
