# First real Worker proof, source 2ae0438

The first actual Chromium trial passed on
`2ae0438c7e1b066913782e2cafe71ab6e65b794d`. The original Strong policy,
64-world search, public observation and seed/RNG remain unchanged. This is
functional evidence; frame rate and a player-visible gain remain unmeasured.
Original PR1 remains draft on accepted source `8c57376`.

Root started the frozen controller at 2026-10-09T00:36:12.578852Z after
all owners acknowledged zero local processes. The browser closed naturally
at 00:36:43.608Z, child at 00:36:45.330516Z and whole controller at
00:36:46.056604Z, exit 0. No owned live child remained. All 28 source and
five binary identities, the controller and frozen READY were unchanged.

- Real UI: seed 23 produces tile 22 and RNG step 2112, matching the original
  synchronous policy. The real inline Blob contains the exact compiled code.
- Sixteen nontrivial public observations match exact Input and RNG state:
  two each for 2/3/4-seat Draw/Block, including four-seat partnerships.
  Opponent hands, stock identities and private RNG are never transmitted.
- Actual CSP denial, runtime-error and unresponsive Worker fixtures exercise
  the genuine UI fallback. Each retains the original seed/policy action;
  the unresponsive case waits for the actual ten-second watchdog.
- A diagnostic delayed real Worker is terminated when the match ends.
  No old reply appears. Rematch uses seed 24 and a newer request ID.
- External HTTP requests and page errors are both empty. No fake clock runs.

The raw receipt is `worker-functional-2ae0438.json`, 61,948 bytes, SHA256
`f6a148bc6e18e01410e5f65ace6038b41d756bfa976958cbf78d8f3e32134986`.
The actual controller receipt is `worker-functional-controller-2ae0438.json`.
The 28,080-byte archive `media/worker-functional-2ae0438-proof.zip` has SHA256
`9cb2d0ee923e1b1ab655aa86d94b78fc7e35f820ede93458300a14e88437679b`.
It retains the raw receipts, exact controller/harness, prelaunch READY,
root grant, compiler proof and earlier withheld/failed preparation evidence.
`INDEX.json` binds every entry by bytes and SHA256. The old READY's UNRUN
status records its preparation time; it is not the result of this trial.

With the documented dependencies, reproduce the functional check from this
job folder using `CHROMIUM_PATH=/path/to/chrome node worker-browser-check.ts`.
This trial used Node 24.19.0, Chromium 151.0.7922.173 and esbuild 0.25.12;
actual binaries and complete before/after source identities are in the proof.

Navigation here was actual disk bytes through `page.setContent`. It does not
prove file navigation, physical-phone performance or the native refresh gate.
`disk-browser-check.ts` adds an actual `page.goto(file://)` check to every
`npm test`, including hosted CI: human handover privacy, real inline Worker
Input/RNG replay and zero external requests. It has no setContent fallback.
The first actual managed check on d4ddb2c failed ERR_BLOCKED_BY_ADMINISTRATOR
before file load; DISK-AUDIT.md retains it with full closure/guard receipts.
Hosted CI must genuinely open the
file before completion. Original `browser.ts` and its exact 300 unfiltered
intervals/301 timestamps, zero warmup and 58 fps/p95 ≤18 ms gates are unchanged.

Remaining: once-only original native profiles and a new genuine capture;
paired player responsiveness; full current npm/CI/artifact acceptance; renewed
KEEP rounds. No old full green or no-gain streak certifies changed UI bytes.
