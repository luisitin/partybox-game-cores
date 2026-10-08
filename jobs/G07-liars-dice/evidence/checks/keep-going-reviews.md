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
