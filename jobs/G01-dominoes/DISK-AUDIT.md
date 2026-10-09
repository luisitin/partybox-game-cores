# Actual managed disk check: failed before file load

The first actual `disk-browser-check.ts` run on source
`d4ddb2cebae292f5ef1c4fa7050a21eba3163a26` called `page.goto(file://)`.
Chromium returned `net::ERR_BLOCKED_BY_ADMINISTRATOR` before loading HTML.
There was no setContent fallback. This does not establish disk opening,
human handover or inline Worker success. The earlier passing real Worker
proof used actual disk bytes through setContent and has a separate scope.

START 2026-10-09T00:44:21.072548Z; browser closed 00:44:24.151Z; child
naturally closed 00:44:25.488498Z; whole controller naturally closed
00:44:26.616533Z, exit 1. All 29 source and five binary identities,
controller and READY were unchanged. Remaining owned live children are
empty. Page errors and external HTTP requests are empty; navigation still
failed. No frame-rate, responsiveness or physical-phone result is inferred.

`disk-navigation-managed-d4ddb2c.json` is the exact raw failure, 6,542 bytes,
SHA256 `aca09a361dc3c3a51b06bfb2fdbe0f481883c90af73a534693ec2df5a6ee24ca`.
`disk-navigation-managed-d4ddb2c-controller.json` retains actual lifecycle
and guard results. The 13,108-byte archive
`media/disk-navigation-managed-d4ddb2c-proof.zip` has SHA256
`1c2c02a2e79d5833637947ee90aac94d7473d64c8f05ca65288ec482d89cc383`;
it retains raw proof/controller/READY/log and exact validator/controller code.
`INDEX.json` binds every other entry by bytes and SHA256.

With the documented dependencies, run
`CHROMIUM_PATH=/path/to/chrome node disk-browser-check.ts` from this folder.
The command requires actual single-file opening, private human handover and
real inline Blob Worker public-observation/Input/RNG replay, with no network.
It runs in every full `npm test`, including the existing hosted workflow.
There is no conditional bypass when a browser policy blocks navigation.

An authorized draft validation PR targets `job/G01-dominoes` from the audit
branch to obtain actual full hosted checks. Original delivery PR1 remains
unchanged and draft on accepted8c. Hosted disk checking is still pending;
the mandatory visual requirement is complete only after a genuine success.
No core/player change is made to work around the managed restriction.
