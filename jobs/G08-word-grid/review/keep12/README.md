# KEEP12: complete reproduction guidance and stop at three no-gain rounds

Accepted baseline `8c9a9627c0bf2e66905f7e5c1341e293aeb4b27a`: full push 37850141206 SUCCESS at 22:02:29 UTC and full PR 37850147852 SUCCESS at 22:04:14 UTC. Both complete logs were read (159340 / 160165 UTF-16 code units, 104 JSON records each); all 16 stages and mandatory assertions/studies/rebuilds/negative controls passed.

| Event | Genuine artifact | ZIP bytes | SHA256 |
|---|---:|---:|---|
| Push | 11581758657 | 1695015 | 5d6dc5e1a12115ff77f76e255ba279f3b5f8d173e0f8a63da764315f9863744f |
| PR | 11581149069 | 1866565 | c729b0ccba75a14ff476570723e7e5d1e92c65e9a93f25aa057cbd8eee6e6252 |

Both actual archives match server size/digest, contain 57 safe entries and pass every CRC. Independent immutable-Git reading accepts all 183 sources per artifact, 4800 total unfiltered intervals, eight exact profiles at 60.002–60.003 FPS/p99-max16.8ms, advancing hunt clocks, all 22 native gates/five rosters and ten real fully decoded hashed VP8 clips. Actual Pause holds of 2000.831087/2001.478074 ms preserve 90→90→90 seconds. Original independent/archive receipts are copied unchanged as text here.

Actual independent commands from the job folder:

- `python .tmp/ci/review-recovered-head-artifact.py 8c9a9627c0bf2e66905f7e5c1341e293aeb4b27a .tmp/ci/8c9-push-artifact .tmp/ci/8c9-push-independent.json`: PASS, observed EXIT 0.
- Same command for `.tmp/ci/8c9-pr-artifact` and `.tmp/ci/8c9-pr-independent.json`: PASS, observed EXIT 0.

Formal review re-read root KEEP, G08 and START-HERE after genuine current full acceptance. Five ranked weaknesses: incomplete tool/artifact reproduction commands; current-head provenance details are dispersed; historical evidence is verbose; the required inline page is large; production SDK integration remains outside the available bindings. Fix the worst with [the reproduction guide](../REPRODUCE.md), explicit Node/locked-browser/FFmpeg/ffprobe prerequisites, two exact public artifact-check recipes and source/provenance scopes.

Both public recipes were actually run on the genuine push artifact: frame reader PASS four profiles/2400 intervals/183 guards; capture reader PASS 22 gates/five rosters/five fully decoded clips/nativeOnly false. Published paired artifact recipes increased from zero to two. No new browser or frame samples. All original 183 runtime/proof inputs and page SHA2563763b7f89abc81838abfd48c0f7a10f6ae734e9db0b08b41a6f98334322a866e remain unchanged.

No player-visible gain: rounds 10/11/12 are three consecutive no-gain reviews after round9's real clock gain. KEEP stops here. Exact final document HEAD still needs both full hosted successes and a genuine current source-bound artifact before PR9 is ready; no completion is inferred from this accepted baseline. Local 57.6947 FPS failure/Spanish NOT RUN, authentic sibling failures and unknown interrupted recording exit remain preserved. Current manual reads are reconciled, while complete physical cube-face authentication and actual production SDK runtime retain their explicit re-verification scope.
