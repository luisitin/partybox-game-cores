# G08 recovery after the environment interruption

Observed at 2026-10-08T19:13:52Z: the existing Shake Up game, owner artwork, client, core, dictionaries and compiled play.html are unchanged. HTML is 14,208,697 bytes, SHA256 863a1910a63a16ed3dc1735a2c1e73e2c1b5317df6f50b01673e0fb3296073f9. Existing player KEEP GOING rounds 6–8 remain the three-round stopping condition; this repair improves evidence only.

The last normal branch push was confirmed at 17:53:50Z. Work resumed after the environment interruption around 19:08Z, and the interruption exceeded the 30-minute publication interval. This gap is recorded rather than described as a timely checkpoint.

The 18:18 paused-coordination attempt has only the following actual READY file. At recovery, no grant, CLOSED marker, raw frame file or final report exists for this attempt, and no active Node/Chrome/timeout process was observed. Exact process termination time and exit result are unknown. No sample or FPS result is claimed.

```json
{"profile":"en-4x4-TV","sourceSha256":"863a1910a63a16ed3dc1735a2c1e73e2c1b5317df6f50b01673e0fb3296073f9","attemptNonce":"0846bfdb-2e31-40e9-9a55-776f2a34bacc","readyAt":"2026-10-08T18:18:25.960Z","grantTimeoutMs":600000,"frames":600,"meanFpsMinimum":59,"p95MsMaximum":20,"capturing":false}
```

The earlier actual 120-second grant-timeout attempt remains verbatim in this folder: no grant, profiles empty, runner exit 1, no sampled frames. Its report finished 17:51:45.614Z; process exit was observed by 17:51:59Z.

Published head 1d2c47063e738c59f531e64a41f15b71afa6fbde has actual full push run 37820082838 SUCCESS at 18:01:57Z and PR run 37820089198 SUCCESS at 18:02:12Z. Its genuine hosted artifact 11568629085 was downloaded before the interruption. The actual log covers 175 assertions, all research/data/mutation/roster/native gates, and four profiles with 600 unfiltered intervals each. Independent inspection verified all 2,400 raw intervals, 180 source guards, actual clip bytes and hashes. English TV/phone FPS: 60.002784/60.002196; Spanish TV/phone FPS: 60.003000/60.003000; p95 at most 16.8ms. This is evidence for that published harness, not for the newer private verifier.

The newer verifier uses the game's real Pause/Resume controls while coordinating, requires a 600-second minimum grant window, asserts a live advancing hunt clock and correct private/public state at both sample endpoints, guards current contract/workflow/checker inputs, independently verifies captures and rejects corruption of real captured baselines. A harmless ffprobe-version difference (an added empty stream_groups array) is normalized only when comparing requested codec/size/duration fields; original reports and clips are not rewritten, and every clip is now fully decoded with ffmpeg.

Current-source local samples, actual real-baseline corruption controls, a new native recording and full exact-head CI/artifact acceptance remain pending. A fresh attempt will use a new directory/nonce because the prior process was lost; it is not an unchanged failure retry seeking favorable FPS.

## Actual preflight bug caught by GitHub

Current checkpoint4047cd7 PR CI37830589124 FAILED19:20:26Z before sampling: the new endpoint check expected0 TV grid cells, but the original public TV correctly exposes16 (Spanish25). The actual119,443-character log shows all preceding checks passing; profiles remained empty. Genuine failed artifact11574250651 is122,323bytes/SHA4974e97c412f8d112364774012a4119494ce52660d8e8e962bf63af14704b488; its original failed report is saved verbatim here. This is a verifier assumption error, not an FPS/game failure.

The fresh local waiter was cancelled19:22:46.011305Z before any grant, CLOSED or raw sample. Its actual READY is saved here; wrapper exit143 was observed19:22:46.139190Z. Remaining Node grandchildren were force-stopped in owned PGID183348 at19:23:30.625568Z; inspection then found no live owned process in183347/183348/183386. No local FPS result exists. The corrected verifier now expects the original public board, retains private/public ownership and active-clock assertions, and adds eight real-baseline runtime/source corruption controls (23 frame-negative checks including the missing-report case). A fresh namespace/source-guard set is required.
