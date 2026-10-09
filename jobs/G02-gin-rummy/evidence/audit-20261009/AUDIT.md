# Independent G02 audit — 2026-10-09

The original README/RULES/JOBS, full public contract and G02 rules, source lineage, conflicts, algorithms, bots, verification, NEXT and LOOP were read before this repair. The canonical d5fbb39746f8f7900bee57506e8133e8675f48ed branch and its accepted CI evidence remain intact. This supplemental branch starts from the lawful main claim and incorporates that exact canonical baseline.

| Rank | Weakness | Actual evidence and player effect | Disposition |
| --- | --- | --- | --- |
| 1 | An already-disconnected opening actor blocks the connected player when the optional clock is off. | Seed1/duel starts on p1 with both legal-input lists empty when p1 is disconnected. Repeating the same known drop event unblocks it. Initialization should not depend on that duplicate event. | Repair only this availability policy first. |
| 2 | An entirely disconnected initial room does not use the established empty-room pause. | Initial upcard has deadline10000 and roomEmpty=false for a disconnected two-seat roster with a10-second clock. Later presence events pause it; initial presence should have the same policy. | Same bounded initialization repair; no independent new scoring behavior. |
| 3 | Strong-bot discard danger can override guaranteed Gin. | A valid52-card fixture with hand[1,2,3,4,14,15,16,27,28,29,39] and public opponent pickup40 gives Medium Gin22 points by discarding39, but Strong normal knock1 point by discarding4. | Unfixed, recorded as the next substantive post-green improvement. |
| 4 | Departure coverage starts with every seat connected and sends a later event. | The original1000 departure cases and120 complete matches cover post-init departures, not already-disconnected init rosters. That gap allowed ranks1–2 through. This is a verification weakness, not another gameplay defect. | Add exhaustive initial-presence masks and seeded regressions. |
| 5 | Hosted smoothness is a finite observation and does not establish portable physical-device performance. | The preserved first local desktop run failed40.725456FPS; phone timing did not run. Exact d5fbb hosted CI later passed on its stated host. No failure cause or physical-handset result is established. | Preserve both observations and require fresh original browser proof for changed bytes; no speculative timing fix. |

The code change calls the existing absence policy after dealing. Connected initial states retain the same complete JSON bytes, cards, dealer, turn, clock and PRNG state. It does not change card rules, optimal solvers, scores, bot strategy, source clocks or any browser gate. The state shape is unchanged.

The earlier KEEP rounds10–12 and three-no-player-gain stop remain historical. A confirmed player-affecting repair renews the current streak at zero; this pre-green checkpoint is not invented as a completed post-green KEEP round. Current full acceptance and the next Gin-bot improvement are still required.
