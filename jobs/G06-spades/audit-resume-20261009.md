# Spades queue audit resumed

Prepared 2026-10-09T05:07:07.154379+00:00. This is a material research and implementation-review
checkpoint, before any proposed gameplay change or acceptance of a new full run.

The current main claim is [ee75cf8](https://github.com/luisitin/partybox-game-cores/commit/ee75cf8a1a7f5a9bd860115f5d660f1bac96abed).
Fresh main and all matching branch committer times were checked at 04:32 UTC:
G06 was the lowest eligible job; the previous claim and both G06 branches were
older than six hours. The normal claim push closed at 04:33:26.721938 UTC.
Its first 30-minute source deadline was 05:03:26.721938 UTC and was missed
during managed-environment restart, recovery and root coordination. No on-time
publication is claimed. Record the actual next push closure in the next checkpoint.

An ordinary local two-parent merge integrates that claimed-main ancestor and
the retained original [48430c9](https://github.com/luisitin/partybox-game-cores/commit/48430c9861534edfef8c59528de4279ebd6cec78).
The source branch retains canonical CLAIMS.md to keep the supplemental comparison
limited to this job. Main ownership is refreshed separately, only in the G06 row.
Original PR7, source history, clips, failures and previous KEEP rounds stay intact.

Research was actually reread through live pinned GitHub files on 2026-10-09:
Pagat mirror, Hughes README gameplay/scoring, and Elixir team scorer listed in
SOURCES.md. Pagat and Hughes agree on 13 cards, target500, contract +/-10 per
bid trick, extra tricks +1, ordinary nil +/-100, blind nil +/-200 and 10 bags
costing100. Pagat excludes failed nil tricks from the partner contract; Elixir
adds both partners' won tricks. Keep the documented default exclusion and the
existing selectable failedNilCounts alternative. No third-party code is copied.

Five ranked weaknesses after rereading README, RULES, JOBS and the full bot policy:

1. The normal/sharp bot always ducks after a nil fails. With failedNilCounts=true,
   a legally won trick may now help a partner contract. This is a source-review
   lead, not a measured score gain or an adopted change. Prove it using a complete
   legitimate seeded hand and counterfactual continuations before changing policy.
2. Partner-nil protection may similarly continue after that nil has already failed;
   evaluate only after the first lead is measured, using public/own projection.
3. The same bot policy is used for partnership and cutthroat; existing independent
   leagues measure skill ordering but are not an outside-expert strength claim.
4. Current exact canonical full hosted proof needs genuine native-log and whole
   official artifact verification; old results must not qualify a new source head.
5. Phone validation is a 390x844,4xCPU approximation; no physical-device claim.

Every retained job file was compared byte-for-byte with immutable canonical Git
before writing this checkpoint. Reducer, scoring, bots, browser sampler, gates,
workloads, seeds, fixtures, HTML, dependencies, workflow and media are unchanged.
No new native frame experiment, local full rerun, strategy gain or post-green
no-gain round has been performed for this continuation. Renew KEEP only after
actual current full acceptance. The original corrective10-12 history is retained.
