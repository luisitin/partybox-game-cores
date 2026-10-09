# Actual variant bundles on Node 22.16

PASS, exit 0. The unchanged `tests/variant-bundles.test.mjs` ran against the actual delivered `dist` modules, using the official pinned Node 22.16.0 executable. Every recorded production module, JSON payload, test, build script and executable hash remained identical before and after the run.

The test compares **24 paired scenarios / 48 search invocations**: two rule variants, four quiet/capture/draw-history positions and three skills. Each pair must have identical complete search reports and random-number cursor state. The historical receipt's `choices: 48` counts invocations, not 48 distinct positions.

Four complete standard-starting-board games also matched every input, cursor and resulting state. American Normal/Easy and Strong/Easy games ended in 51 and 47 plies; International games ended in 59 and 85 plies. Their exact transcript hashes and winners are in `variant-bundles.json`.

The command was:

```sh
G10_EVIDENCE_DIR=evidence/checks/variant-node22 \
  .work/memory-json-private/node22/runtime/bin/node \
  --test --test-reporter=tap tests/variant-bundles.test.mjs
```

`runner.py` and `resource-wrapper.py` preserve the actual wrappers used under a 900-second process-group guard. `inputs-before.json` and `verification.json` record executable and module SHA-256 hashes, exact command, runtime version and unchanged-input proof. The official executable SHA-256 is `8142d37c6f2f372ef040419e7a111a6baf17df89f8078d02447d6c639ae20c1d`; its acquisition/checksum proof is retained in the adjacent International static-JSON Node 22 evidence.

The wrapper measured 53.991 seconds and maximum child RSS of 2,948,760 KiB. This is a mixed single-process equivalence test, whose ESM imports share identical JSON leaf modules. It does **not** measure aggregate memory of four independent Worker isolates. Parent mutation work was initially active in another process; timings are not a controlled performance comparison. No browser frame-rate claim or canonical league claim follows from this result.

All original TAP, stderr and resource receipts are retained. No assertion or game source was changed for this run.
