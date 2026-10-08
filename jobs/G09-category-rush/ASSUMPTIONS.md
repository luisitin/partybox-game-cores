# Decisions and assumptions

- This workshop supplies exact contract types and schemas, but no game-sdk package. The core uses an explicitly documented local reducer adapter with the required player → speech → VIP → paused → phase order. Its English answer matcher implements the documented normalization, singular/plural, long-answer one-edit and transitive grouping behavior; it does not claim to bundle the absent SDK's complete language stemmer.
- Fresh category lists, three rounds by default, 2–8 seats, shared victory on a final tie, and canceling all repeated answers within one player's round are stated house choices. Official edition and variant differences are described in RULES.md and CONFLICTS.md.
- Every authored category is original. Its answer bank supplies examples for deterministic bots, never an exhaustive dictionary or an automatic veto on a human answer. Bots abstain on unfamiliar answers; the group decides their validity.
- No ballots means no challenge and an otherwise eligible answer stands. Null ballots abstain. An equal nonzero vote removes the answer author's vote; a remaining tie rejects. Duplicate answer groups already score zero.
- A departed player's locked answers remain in the round and can cancel duplicates. Departures never remove them from final results. Reconnection cannot undo a permanent leave/kick. Late spectators cannot enter the fixed roster.
- A VIP ending during writing or review keeps only scores already settled in earlier rounds. Skipping review settles the current category from ballots already cast.
- The hot-seat page gives each human a private writing turn with the same time allowance. Its local virtual clock freezes between handovers; the core still owns deadlines and only processes explicit timestamped events.
- English content only. Proper names must be written with the chosen initial first. Extra proper-name alliteration points and automatic tie-break rounds are researched but not selected.
