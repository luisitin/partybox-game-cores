# Deal-only face-down tiles: actual native trial

The draft candidate now omits the permanently hidden blank front of each
face-down tile used only by the initial deal animation. Its visible back SVG,
container CSS, geometry, rotation, opacity, 45 ms stagger and 420 ms flight are
unchanged. Draw and play animations still use the original two-sided tiles.
Removing the new helper and replacing its one call restores the exact previous
UI bytes. The core, seeded RNG, strong policy, Worker and original browser
sampler remain unchanged. This is a bounded rendering-cost hypothesis, with
no claim about the cause of any historical frame failure.

Independent static review closed 2026-10-09T01:44:24.106993Z, exit 0. The
once-only native trial of the modified private source started at
01:51:14.656006Z and naturally closed at 01:52:39.701547Z, exit 0. All 177
source and five executable identities, READY and controller stayed unchanged;
no owned process remained. The exact original `node browser.ts` ran with a
new `G01_CAPTURE_PATH`, with no added settling, warmup or filtered frames.

| Actual profile | Native intervals / stamps | FPS | p95 ms | p99 ms |
| --- | --- | --- | --- | --- |
| TV, 1920×1080, CPU 1× | 300 / 301 | 58.06751316196965 | 16.8 | 33.4 |
| Phone, 390×844, CPU 4× | 300 / 301 | 58.44344077575486 | 16.8 | 33.4 |

Both meet the unchanged original minimum 58 FPS and maximum p95 18 ms.
This is one finite source-bound pass, not a 60 FPS or distribution claim.
The original full functional/privacy/offline/reduced-motion checks also pass,
with zero external requests/errors. Functional contexts use their original
controlled clock; native refresh contexts do not. Navigation used exact file
bytes via `setContent`; this trial makes no direct-file or physical-phone claim.

The new 250,955-byte VP9 capture contains all 36 decoded 1920×1080 frames at
12 FPS over three seconds, SHA256
`80ba27597baabf29eac2804d6e3a17df1fc27b591af0c91091e278ada6a7fd81`.
The complete raw trace, controller, READY, root grant, independent review,
original sources and full decode output are retained in
`media/face-down-native-first-proof.zip`; all 30 entries were byte-verified.
The raw public records are `face-down-native-first.json` and
`face-down-native-first-controller.json`.

The exact reviewed UI SHA256 is
`9879f1515bb9625379a032087050263514488f897f5980b77039044325fe84a7`;
the 1,032,861-byte standalone player is
`05c4687c604e2fe1e9b8f9483ac0266e254b43faa1851c46f0a843bcec67f71b`.
These bytes are adopted only to the audit draft. Original canonical PR1 stays
unchanged on 8c57376. Complete current hosted checks and artifact acceptance
remain required. Measured Worker responsiveness gain and renewed KEEP rounds
remain zero. The earlier local TV failure and failed pair with missing offending
raw values remain separate historical failures; this trial clears neither.
