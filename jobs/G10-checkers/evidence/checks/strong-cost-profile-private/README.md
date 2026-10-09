# Actual International Strong search CPU profile

PASS: the four original International Strong/Medium pilot games, indices 0–3, produced **byte-identical complete records** to `evidence/checks/league-dedicated-pool-pilot/international-sharp-normal-0000.jsonl`. Their combined JSONL SHA-256 is `74b0a12c08475172d448ef88f56b0e775991bce2b5a822540f5c7326b1a58a7c`. Games ended in 150, 96, 113 and 98 plies, with the same moves, seeds, stronger-side assignments, winners, draw reason and final boards.

The pinned official Node 22.16.0 executable runs an independent wrapper Worker. It first imports the actual delivered `dist/core-international.mjs` and the exact unchanged `scripts/league-worker.mjs`; only then does it start inspector CPU sampling at a 1 ms interval. The existing league-worker receives the original `{variant:'international',higher:'sharp',lower:'normal',start:0,end:4}` task. A separate control MessagePort stops the profiler after its original result. No game body, RNG calls, budget, source, bundle, public script or test was edited. Recorded inputs remained unchanged before/after.

The full corpus import took 21.877 seconds. The original game body reported **11.568428 seconds** of instrumented wall time; the raw CPU profile spans 11.806211 seconds and 9,759 samples. The profiler includes small inspector/message-control overhead after the games. Whole-run resource measurement was 35.688 seconds and maximum child RSS 3,118,576 KiB. There were no SIGSTOP holds; `pause-receipt.json` applies no timing subtraction. Profiling and these four fixed games establish no uninstrumented speed improvement, CI fit or canonical league result.

| Function / source position | Sampled self ms | Sampled inclusive ms |
|---|---:|---:|
| `positionKey`, core-international 23407:18 | 2,151.829 | 2,443.676 |
| `legalMoves`, core-international 23332:19 | 2,019.412 | 2,834.888 |
| `visit`, core-international 23497:16 | 1,942.889 | 10,231.718 |
| `nextPosition`, core-international 23447:21 | 1,530.757 | 2,505.189 |
| Garbage collector | 1,153.444 | 1,153.444 |
| Capture `walk2`, core-international 23337:24 | 684.855 | 774.809 |
| `probeEndgame`, endgame-international 673:21 | 264.712 | 600.204 |

Inspector line/column positions are zero-based. `function-costs.json` groups self samples by exact function/source position. Its inclusive attribution counts a function once per sampled stack, avoiding recursive double-counting for `visit`. Inclusive rows overlap and must not be summed. The raw `report.json` additionally preserves node-specific call-tree self/cumulative rankings and source positions.

Move generation and board-key construction both consume substantial sampled time. A move-list memo is a candidate for a separate measured change; this profile alone does not establish repeated-position frequency or a speed gain. An added board-only memo key calculation could itself be costly. Existing search reports are unchanged by the observer, but the original league records do not record search-node/hit totals or final RNG cursor steps; this evidence does not invent those quantities. Prior exact report/cursor equivalence checks remain separate evidence.

The command was:

```sh
python3 .work/run-resource.py .work/strong-cost-profile-private/resources.json \
  .work/memory-json-private/node22/runtime/bin/node \
  .work/strong-cost-profile-private/profile.mjs
```

It ran under a 900-second process-group guard, PGID 165632. The exact private wrappers, raw CPU profile, all actual game records, original handler result, stdout/stderr, resource receipt, source/runtime/gold hashes and derived function totals are retained. Restore `profile.mjs` and `worker.mjs` to the named `.work/strong-cost-profile-private/` directory for their relative imports. Node acquisition and checksum provenance are retained in adjacent Node 22 compatibility evidence.

The Worker/game finished normally, and the outer resource wrapper closed at **2026-10-08T15:55:33.905572Z**, exit 0. All processes were closed before archiving. No browser work or further variants were launched.
