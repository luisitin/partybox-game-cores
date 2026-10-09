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


## Exact838 full hosted acceptance — actual PASS

Exact8384404ff8e04c9da5405d6654007a06cf5141ba workflow37872579179 /
job113633825656 succeeded2026-10-09T02:24:25UTC. The genuine official
artifact11591617572 is98,673,066 bytes, SHAb467433ce2969457c4a58bd5d79b13bf9079554c1a0a1f2f8d02566d0c020df8.
Independent original full reader naturally CLOSED02:25:55.955693UTC, exit0,
1,252 assertions: every immutable Git/source byte, complete actual native npm
output,25mutants, actual file:// privacy/inlineWorker,16 nontrivial real Worker
replays/fivevariants,600 raw intervals/602 stamps and all36 VP9 frames decoded.
Current hosted TV59.21247409454 FPS/p9516.7ms and phone4x59.80384339367 FPS /
p9516.8ms pass the unchanged original gates. Full native127,953-byte output
SHA56d45d892197ce5d5d3357be4fded4e75bd6cbfa7a17dc0f5ee432e8e74c7cad.

media/worker-stage-8384404-proof.zip (1,473,534 bytes,
SHAabef6e6208f47a830bd4101a968c0e2aa18dec1f1cf257d8721209a1cbcd6aa4)
retains EVERY top-level official raw output, every actual mutable after-output,
full native log/acceptance and prepared diagnostic/cleanup provenance. All42
entries byte-verified. Immutable before/after data already proved byte-equal
retained exact838 Git; no recursively nested largeZIP. All unique original2d /
current838 whole official ZIP/raw remains retained privately in the original
workspace. The current capture is also media/milestone-16-hosted-worker-face-down.webm:
309,239 bytes, SHA3f362b41f4bf1096818f4590097b65c4bb12485827ac2f75b68b2d63bcfde4e6.

The distinct isolated logging diagnostic is first UNEXECUTED: exact private
2d versus original8c, all185 source/five executable guards, READYd34799 /
controllerb9597d / harness9dc1be. It saves complete/partial raw trace and numeric
kinds before assertions without changing predicates/order/clocks/gain criteria.
New current source bridge, independent review and fresh root quiet grant are
required before any launch. Original fixed pair FAILED with offending raw
ABSENT; no zero/NaN/cause inferred. No measured gain or renewed KEEP round.

Shared original workspace ENOSPC left0 available bytes for uid1000, with
root-reserved free blocks. The02:31:23.597412UTC source deadline was missed;
no timestamps backdated. This material checkpoint uses independent writable
/tmp tmpfs and a once-only in-memory read of the already accepted official ZIP,
without another download/full extraction. Only authorized exact recoverable
e4 duplicates were removed after full immutable Git/public equality, immediate
same-stat/nlink1/FDzero; all new185 resolved guards and unique proofs preserved.
Completed face-clone replay first requires restoring its deleted exact e4 blob
from public838 Git; the exact recipe is archived. Original canonical PR1 stays
unchanged/draft on8c; this is an audit evidence checkpoint. Full new headCI
remains pending; source838 green certifies exact838. Renewed KEEP rounds/gains0.
