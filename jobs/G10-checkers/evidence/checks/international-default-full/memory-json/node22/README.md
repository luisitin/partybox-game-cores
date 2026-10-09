# Node 22.16 compatibility

The official Linux x64 Node 22.16.0 archive was checked against its exact official SHA256 before extraction. Only its private executable and licence were extracted; the executable is not committed. Both native JSON data import and the unchanged compiled game code execute successfully.

All 10,000 original/reference WLD queries match, including all 37 materials, 148 colour/turn orientations and 22 second-subslice positions. All 48 exact serialized reports, PRNG cursors and original block request totals match the retained default proof. All three complete game transcripts match each intermediate board and ending, with lengths 1/84/1. The 10k run and behavior run both exited 0 without timeout or pause.

Peak RSS was 3,476,396 KiB for the 10k import/query run and 3,037,692 KiB for the 48-case/three-game run. The 10k run finished at 1,893,908,480 bytes RSS, so its lower steady value must not be used as its startup peak. These runtime-specific samples do not establish concurrent league memory or browser performance.

The archived runner revisions differ from the Node 24 scripts only by allowing a separate evidence output directory. Their test assertions, budgets and data inputs are unchanged. Exact guarded commands, runtime/source/input hashes, raw results, timing and memory values are recorded in compatibility-manifest.json. Set G10_JSON_OUTPUT_DIR=.work/memory-json-private/node22 when reproducing these commands after the preceding static-JSON preparation. Original Node 24 evidence remains intact.
