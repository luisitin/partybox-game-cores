# Matched instrumented desktop runtime-cost diagnostic

Both profiles completed, exit 0, in order A then B. A uses `.work/play-full-early.html` (SHA-256 `edc476ee9a9bb9b3acbd3ff0efd631814f079a1f6a29cd88a1c188f6b17ca101`); B uses `.work/play-full-template.html` (`f91e333e60e23b0ac56b0cc3c85f7ae93aa6f3c4bb4817dd5898b151fc087fbf`). Production source, build, bundles, tests and league were not edited.

Both use 1920×1080, reduced motion, CPU throttle 1×, the same Chromium launch flags and identical American human-game 600-interval selection/cancel RAF workload. There are no captures, bot searches or video recordings. A's browser closes before B starts. Every source HTML and recorded worker/pack/script input remained unchanged. There were no pauses, interruptions, page errors or external requests.

The streaming identity check proves all **1,306 inert payload tags** identical: 1,304 original database source parts plus two compressed corpus payloads, totaling 1,378,509,420 encoded content bytes. The entire executable host has only one 92-byte insertion: routing `g10-` lookups through the template's `DocumentFragment`. All other host bytes, including embedded worker programs and metadata, are identical. `payload-identity.json` retains every content/header hash and the exact host difference.

| Measurement | A: payload in document | B: payload in template fragment |
|---|---:|---:|
| Live document nodes | 4,282 | 366 |
| Original data tags in document | 1,306 | 0 |
| Fragment nodes / data tags | 0 / 0 | 3,920 / 1,306 |
| Layout seconds / count | 0 / 0 | 0 / 0 |
| Style seconds / recalculations | 0.180986 / 603 | 0.141852 / 603 |
| Script seconds | 0.211812 | 0.175014 |
| Task seconds | 1.098059 | 1.195389 |
| CPU-sampled GC self milliseconds | 35.298 | 52.334 |
| Instrumented mean FPS | 59.506099 | 58.538870 |
| Instrumented p99 milliseconds | 16.8 | 16.8 |
| Actual full-load milliseconds | 26,875.527 | 19,854.528 |
| Observed owned-process RSS-sum peak, KiB | 3,942,140 | 3,919,100 |

The fragment reduces the live document's data-node surface. These sequential, instrumented runs establish **no causal frame-rate, speed or memory improvement**. Their FPS values are diagnostic observations, not acceptance results. Task duration is higher and instrumented FPS lower in B. Both CPU profiles predominantly sample idle time (about 9.5 seconds), followed by `(program)` (about 0.841 / 0.984 seconds). There is no observed layout work in this workload. Existing failed strict browser receipts remain applicable until a changed production page passes the required uninstrumented checks.

RSS is sampled every 250 ms over the active Node/Chromium descendant process tree. It is a sum of RSS, may double-count shared pages, and is neither PSS nor exclusive physical memory. Sampled peaks can miss short transients. The outer `maxChildRssKiB` field is a child-resource receipt, not the process-tree aggregate; use each profile's `ownedTreePeakRssSumKiB` for the stated observations. Trace duration sums can include nested/concurrent events and are not exclusive CPU-time totals. GC event counts include matching trace events and are not counts of complete collections.

The exact command was `python3 .work/template-cost-private/run.py` under a 1,200-second process-group guard, PGID 164221. Each full load has a 300-second deadline and each 600-interval workload has a 120-second deadline. `run.py`, `identity.py` and `profile.mjs` are exact original scripts. Restore these to the named private `.work/template-cost-private/` location to reproduce relative imports and file names.

A context/browser closed at 15:43:31.378Z / 15:43:31.465Z; its complete report closed at 15:43:35.075Z. B context/browser closed at 15:44:09.901Z / 15:44:09.985Z; its report closed at 15:44:12.970Z. The outer runner closed at **2026-10-08T15:44:13.191137Z**. A later global quiet request found all owned processes already closed. All original 600 intervals, CDP metrics, traces, CPU profiles, GC events, RSS samples and raw stdout/stderr are retained.
