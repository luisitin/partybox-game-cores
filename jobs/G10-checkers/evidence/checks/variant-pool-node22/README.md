# Dedicated Worker pool resource trial

PASS, exit 0, using the pinned official Node 22.16.0 executable. Four independent Worker isolates were assigned two International and two American bundles. The two International imports were prewarmed sequentially; each isolate then received only its assigned variant.

The private bootstrap imports the actual delivered variant core and the existing, unchanged `scripts/league-worker.mjs`. All four workers then run two paired games for Normal/Easy and two for Strong/Normal: **16 complete games total**. Every task, seed, move list, terminal board, winner and transcript hash is retained. This is a resource trial, not the required 4,000-game league or a statistically meaningful strength result.

The original resource wrapper measured whole-process maximum RSS of **4,620,060 KiB (about 4.406 GiB)** and 69.773 seconds. The 25 ms RSS sampler observed a 4,723,470,336-byte peak during the second International import and a 4,661,952,512-byte peak during concurrent Strong/Normal games. Whole-process RSS includes all four Worker heaps; it excludes other unrelated processes. Timings are not a controlled comparison. Longer runs and the actual CI environment must still be checked.

The original command was:

```sh
python3 .work/run-resource.py .work/variant-pool-private/resources.json \
  .work/memory-json-private/node22/runtime/bin/node .work/variant-pool-memory.mjs
```

It ran under a 900-second process-group guard, PGID 158061, without pauses. The resource wrapper closed at 2026-10-08T15:21:58.440538Z. No production source, delivered bundle, budget or league source was changed. The recorded harness, variant bundle and league-worker hashes remained unchanged.

`pool-worker.mjs`, `pool-memory.mjs` and `resource-wrapper.py` are exact snapshots of the private scripts used. Restore the two `.mjs` snapshots to their named `.work/variant-pool-*.mjs` paths to reproduce the relative module imports. The executable acquisition/hash and exact payload hashes are preserved in the adjacent Node 22 compatibility and `variant-node22` evidence.

The raw `report.json` field named `samples` contains the historical warmup count (four); the actual RSS observations are the entire `rss-samples.json` array. The raw report has been preserved unchanged. `artifact-manifest.json` hashes every archived file.
