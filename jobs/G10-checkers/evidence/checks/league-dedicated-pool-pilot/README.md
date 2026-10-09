# Dedicated corpus pool pilot

Actual command: `G10_EVIDENCE_DIR=.work/league-pool-pilot python3
.work/run-resource.py .work/league-pool-pilot-resource.json
.work/memory-json-private/node22/runtime/bin/node scripts/league.mjs --games 4`.
Pinned Node22.16.0; exit0, closed2026-10-08T15:35:32.911711Z. Two International
and two American workers were prewarmed sequentially and retained their assigned
corpus. All sixteen paired terminal games passed. The complete-record comparison
against the original sixteen-game pool also passed: every recorded field,
seed, skill, move, result, ply and final board agrees. The comparison is not a
new RNG-cursor proof; unchanged worker bodies and the separately retained
variant-bundle proof cover cursors.

Wrapper elapsed91.019671s and maxRSS5,341,180KiB are actual measurements,
larger than the earlier private pool's4,620,060KiB. The report's81.181s excludes
initial input hashing. Sequential imports and this small sample do not prove
the final4000-game league or CI30-minute fit. International Strong games took
17.078s for four, American Strong3.627s for four. Measure actual search costs
before adopting any performance change. No gameplay budgets or gates changed.

Raw stdout/stderr, resource receipt, all sixteen game records, original runner
sources and exact comparison script/result are retained. No raw TAP was emitted
by this runner and none has been invented. Final4000/7000 and CI remain pending.
