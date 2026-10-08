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

Round 1 change and measurements are pending. Subsequent rounds must rank remaining weaknesses anew rather than reusing fixed findings.
