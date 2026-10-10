# Original hosted evidence before resumed round14

The original PR3 head731b64b6e3429bf2abec0413e4db1d5a66cef2b1 passed
run37766566457 at2026-10-08T10:56:54Z. Its actual ZIP11545955223 was
downloaded using the native GitHub artifact tool and SHA256-verified:
188017 bytes / f24042a8630bbbfbda3ec776ba36580063012b9c08feb6e0f0fc5e8790ccdf82.
Seven files: two reducer audit JSONs, mutation JSON, solve-time JSON, clip,
screenshot and visual report. Zero raw frame sidecars were present.

hosted-731b64b.json and hosted-731b64b.webm are actual uploaded bytes.
visual-731b64b.mjs.txt is the exact tracked original runner. It warms60 frames,
then drops one measured interval; its mean gate17.5ms permits about57.14fps.
The report's aggregate180-frame TV/phone measurements were about60.002fps.
Absent raw intervals cannot be reconstructed, so this history does not prove
the new900-interval,unfiltered,current-source acceptance check.

The separate clip is real UI evidence, encoded10fps; it is not a frame test.
No old source, sample or capture is relabelled as new verifier evidence.

The resumed local file attempt used pinned Chromium141.0.7390.37, all28
source guards and900 unfiltered TV intervals. It failed>=59fps at57.6331967,
p95=16.8ms,p99=33.3ms,max216.6ms. Phone did not run. strict-14-* retains
the actual failed report/raw/log/grant/READY/CLOSED and binary identity;
the failure has no established cause and was not retried unchanged.

Actual9362 hosted CI37816512878 succeeded at2026-10-08T17:28:58Z.
ZIP11567721362 is193620 bytes,SHA256
9ddc51b167578a8d61561f3bd2eda4d10c326f77475b693acd0e915738210710.
Its9 files include both900 raw arrays. Hosted Chrome154.0.8037.97 opened
the real disk file:TV60.002400096/CPU4x phone60.002000067,p95<=16.8ms.
All28 source boundaries and73 actual-current corruption controls passed.
hosted-9362-* and hosted-9362.webm preserve those actual uploaded bytes.

`node scripts/verify-historical.mjs` independently compares their source maps
with all28 real Git objects at9362, then recomputes all1800 intervals and
checks actual clip bytes. It needs that reachable Git ancestor locally; a
shallow clone may fetch9362 first. Current CLI never accepts historical guards.
