# Capture-only minimum-hold repair, 2026-10-08 recovery

Prior immutable head 22f695671d766ff362e7bb3d236e8e34236768ec: full PR run37838445873 SUCCESS20:26:49; push37838439275 FAILURE20:26:27. The failed push measured an actual1999.752709ms Pause hold and correctly failed the unchanged heldMs>=2000 requirement. The green PR measured2000.546477ms. Neither failure nor result is discarded. Actual downloaded artifacts and full logs remain in the private .tmp/ci namespace; the immutable PR independent receipt is copied unchanged here as text.

Repair only the recording harness: wait until the actual native monotonic deadline reaches two seconds; preserve the numeric>=2000 gate. Add an actual-baseline corruption with heldMs1999 that the existing independent validator rejects. Page/game/owner assets/native-frame sampler/thresholds remain unchanged. This is proof correctness, with no new player-visible gain.

The previous capture session was interrupted by workspace restart approximately20:31–20:40. Its original full report, clips and log survived; no live owned process remains. Session exit status and exact termination time were not observed. A complete persisted report is independently verified at recovery, rather than claiming an observed exit0. Actual Pause90→90→90 after2170.605254ms.183distinct start/end sources match current bytes; all22native gates, five roster sizes, zero network/errors and five real390×844VP8 clips fully decoded/hash-checked. This is nativeOnly true and null FPS, explicitly partial. The original files are copied unchanged to native-only; the milestone clip is an unchanged copy.

Recovery commands from job folder:
- node start/verification/verify-capture.mjs .tmp/visual/native-hold-repair12/browser-report.json --allow-partial: PASS183guards/22gates/5rosters/5decodedclips.
- node start/verification/verify-capture-negatives.mjs --allow-partial: PASS19actual captured-baseline corruptions including real1999ms rejection.

Exact new-head full push and PR checks and downloaded current artifact remain pending. Prior local TV60060.0024PASS/phone60057.6947FAIL/Spanish NOTRUN are retained in repair11; no unchanged FPS rerun. Resume clock player gain remains current and resets the earlier stop streak to0. Three subsequent formal no-player-gain reviews require fresh full acceptance.
