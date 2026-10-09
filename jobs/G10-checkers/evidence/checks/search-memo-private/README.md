# Private stage-one legal-move memo experiment

**PASS for exact equivalence; not adopted.** The pure candidate changes only a local per-search `Map<string,Move[]>` in non-Easy searches. It reuses the visit's existing board key for the TT and move cache. Root/Easy branches, fixed budgets, node increments, probe calls, TT/history key, move ordering and RNG calls are unchanged. No public source, build, runtime module or league file was edited.

Seven small private core/bots/transaction modules were compiled against the original flags and the **actual existing shared endgame modules**. No corpus was copied and no full production build ran. All 48 retained SearchReports, cursor states, missing-block retries, block counts and byte totals matched. Three complete games (1, 84 and 1 turns) matched every retained decision, cursor, board and terminal result. Candidate source/module hashes remained unchanged. The adapted acceptance runner preserves every decision and game assertion, replacing the previous unrelated immutable-container hash expectation with actual candidate before/after guards.

The fixed pilot uses the byte-identical original league-worker game body. In one Worker/process it preloads both variants and implementations, then runs four original and four candidate games per variant. All raw records match the archived original pilot byte-for-byte.

| Four-game batch | Original seconds | Candidate seconds |
|---|---:|---:|
| International Strong/Medium | 13.895574 | 13.579360 |
| American Strong/Medium | 1.709848 | 1.543923 |

The International difference is modest. These sequential A→B timings have uncontrolled ordering, JIT and contention effects; they do not establish a robust performance gain or CI fit. No public adoption is proposed from this result.

The equivalence run's raw 406.360693 seconds includes a confirmed 236.004177-second whole-group hold (16:09:57.393002Z→16:13:53.397179Z). Its derived unpaused report time is 170.356516 seconds. Raw timestamps and every actual STOP/CONT receipt remain intact in `holds.json` and `pause-aware-timings.json`. The pilot had no holds. Maximum child RSS was 3,128,924 KiB for equivalence and 3,443,932 KiB for the pilot; these are single-process receipts, not a four-worker memory guarantee.

A **separate, untimed diagnostic** adds local request/hit/miss counts to returned reports. Its modules never enter pure equivalence, pilot timings or adoption. Sixteen fixed fixture/skill pairs derive from pilot game 0 at the start, one-third, two-thirds and last ply, in both variants. Original report fields and RNG state match the original bundles; input state remains unchanged. The diagnostic observed 8,783 non-root eligible move requests, 1,906 hits and 6,877 misses. American totals were 3,197 / 979 / 2,218; International totals were 5,586 / 927 / 4,659. Counts exclude the unchanged root generation, TT-score returns and the endgame probe's internal move generation. These fixtures establish observed reuse, not a canonical-league hit rate or speed claim.

The pure run used PGID 166424, official pinned Node 22.16.0, with a 1,800-second outer guard. It closed normally at 2026-10-08T16:15:56.601332Z, exit 0. The separately guarded diagnostic PGID 167339 completed at 16:20:00.333Z, `PASS_SEPARATE_COUNTS`. Exact wrappers, source snapshots, private compiled modules, gold-equivalence records, resource receipts, raw output and all candidate hashes are retained. Both groups are closed.

For reproduction, restore this directory to `.work/search-memo-private/`; restore `original-full-equivalence.mjs` to `.work/memory-json-private/full-equivalence.mjs` and `resource-wrapper.py` to `.work/run-resource.py`. Then run the pinned Node/Python commands recorded in `run-report.json` and the resource receipts. Absolute external endgame paths in compiled historical artifacts refer to the original checkout; rebuilding in another checkout creates its own exact preparation hashes. No stage-two key-reuse or probe/position cache is present.
