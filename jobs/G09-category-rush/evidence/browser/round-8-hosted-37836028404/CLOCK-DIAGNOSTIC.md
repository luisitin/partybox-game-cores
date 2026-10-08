# Preserve the extra reader failure without changing original acceptance

The actual d131fda desktop callbacks contain600 native RAF deltas summing
9999.51ms and601 native Date.now readings spanning9984ms. Their difference is
-15.51ms. The phone readings span10000ms, difference+0.49ms. All original
600/59FPS/p99<=17/source/nonce/form/no-modal/native-Date/advancing-timer/offline/
real-capture gates pass. The original ZIP and uploaded bytes are unchanged.

The first independent reader added an arbitrary `abs(wall-RAF)<10` diagnostic
which is not a job, runner or binder acceptance condition. That assertion
failed; first-independent-validator.py and first-extra-clock-check-failure.log
preserve its actual failure, and extra-clock-diagnostic.json preserves actual
raw observations. The revised independent reader validates every original
gate and records the extra discrepancy without treating it as acceptance.
No raw data were rewritten and no local frame retry was run.

Read live on2026-10-08 at20:10UTC:
https://raw.githubusercontent.com/mdn/content/main/files/en-us/web/api/window/requestanimationframe/index.md
MDN explains the RAF timestamp refers to the previous frame's rendering and
is similar to performance.now at callback start, "but it is never the same
value." Multiple callbacks in the same frame receive the same timestamp even
though time passes while callbacks execute. This disproves a universal10ms
equality guarantee between these different observations.

It does NOT prove the specific15.51ms cause. This artifact records no actual
callback performance.now values or absolute RAF timestamps, so actual start/
end dispatch offsets cannot be reconstructed. The cause remains unresolved.
Do not label this a product clock or FPS failure or a measured optimization.
Useful future execution-clock fields require a substantive proof improvement
and genuinely current acceptance, rather than retroactive values.
