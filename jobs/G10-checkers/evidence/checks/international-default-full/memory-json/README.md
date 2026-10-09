# Private static-JSON Node representation proof

The experiment changes only the container of each of 61 existing base64 strings. It streams each original quoted literal into a JSON primitive and creates a tiny native JSON module re-export. Four game/search modules are copied byte-for-byte, with hashes checked against the original actual-default proof. The default delivered game, build scripts and browser page were not modified by this experiment.

All 10,000 actual six-piece queries match the retained unchanged original C++/independent-reference receipt in both representations, covering all 37 canonical classes, all 148 colour/turn orientations and 22 second-subslice cases. Both default resolvers agree. All 48 serialized move reports, random cursors and requested block retry/count/byte totals match the original public default receipt. Three complete games match every intermediate board, decision, cursor and ending, including the 84-ply house draw. Independent legal transitions also pass.

| Same import + 10k workload | Import seconds | Import maximum RSS (KiB) | Maximum RSS with probes (KiB) |
|---|---:|---:|---:|
| Original JS strings | 25.1168 | 3171504 | 3246584 |
| Static JSON strings | 26.1439 | 1948724 | 1969664 |

The new JSON 48-case/three-game run reached 2860060 KiB maximum RSS. These were separate sequential process runs; cache and shared CPU conditions were not controlled. The JSON sample used less observed memory but was not faster. No browser performance improvement follows from this Node-only proof. Runtime actually tested: `v24.19.0`. Node22 compatibility remains separately unverified.

Reproduce from the job directory after its normal Node build. Copy the three archived `.mjs` scripts into `.work/memory-json-private/`, then run these commands sequentially:

```sh
node .work/memory-json-private/prepare.mjs
node .work/memory-json-private/import-probe.mjs json probe
node .work/memory-json-private/import-probe.mjs baseline probe
node .work/memory-json-private/full-equivalence.mjs
```

The exact guarded commands, process groups, source/input hashes, byte-preserving 61-file manifest, raw outputs, per-case reports and all complete game traces are retained here. No shadow payload or copied runtime modules are committed. Negative zero is compared through the game contract's JSON representation for cross-run reports; every report field and cursor is retained.
