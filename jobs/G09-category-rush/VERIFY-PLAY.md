# Offline play verification

KEEP GOING round 1 is in progress. The delivered candidate is now `0a9940c56f3b46c4c10df4ab4a8c7d62b7efb90950abce530e652885e0be53f3` (439,850 bytes), built twice identically after adding empty-review advancement through actual core timer events. Full current functional and strict visual verification are pending the coordinated CPU release. The accepted round-0 proof described below is archived in `evidence/browser/round-0-accepted/`; it verifies the earlier `a209acd1…` HTML, rather than this candidate.

Round-1 targeted checks initially failed two test-fixture assertions: category casing, then a wrong-initial answer that was also deliberately duplicated and therefore displayed the existing duplicate verdict. These were fixture corrections; the runtime patch was unchanged. Both runs completed the two/eight-human blank cases with zero review actions. The saved second report and exact observations from the first tool output are retained in `evidence/browser/round-1-after/fixture-attempts.json` and `fixture-failure-second.json`; complete current verification remains pending.

`play.html` is generated from `client.ts`, `src/play.template.html`, and the real pure game exported by `src/index.ts`. It embeds the whole bundle and opens directly from disk. The shell calls the actual input schema, reducer, views, results, and three bot strategies. It does not implement a second game.

## Commands

```sh
npm ci
npm run typecheck
npm run build:play
node scripts/browser-check.mjs
node scripts/browser-clock.mjs
node scripts/browser-performance.mjs
```

The browser runners use the development-only Playwright dependency and an installed Chromium headless shell; `CHROMIUM_PATH` may select a browser. Install a browser with `npx playwright install chromium` where needed. A full Chrome subject to this cloud environment's system URL policy blocks `file://`; Chromium headless shell successfully opens the actual file. No HTTP server substitutes for the file test.

## Gameplay and accessibility

The browser suite checks desktop 1920×1080 and phone 390×844: names and answers are escaped, each category has a programmatic input label, focus starts on the first answer, previous answers disappear at handover, authors are absent from anonymous vote cards, all twelve review categories advance, duplicate and group-rejected answers score zero, voting controls update their selected state, authors appear after scoring, tied winners persist in final results, replay returns to settings, keyboard focus stays inside dialogs, Escape resumes, pausing preserves draft and time, timeout locks the current sheet and waits for the next person, and reduced motion disables entrance animations. Separate complete games exercise every seat count from 2 through 8 with easy, medium, and strong bots. Runtime checks reject errors, browser dialogs, and network requests. The report records the exact tested HTML SHA-256.

Final reproducible HTML SHA-256: `a209acd1d603518be5dd5d7bb9395423578bd10de75a7eb2122c506028526e08` (439,584 bytes). Two consecutive builds were byte-identical. All 28 functional checks passed on this exact file, with zero page errors, browser dialogs, or runtime network requests. Both complete MIT notices and valid HTML comment delimiters are checked. `evidence/browser/functional-report.json` records every check.

Regeneration found that the earlier 439,586-byte artifact (`0975fc…`) used malformed notice delimiters `<!- -` and `- ->`; the current builder emits valid `<!--` and `-->`. The saved commit contains a valid-wrapper builder alongside that malformed artifact, so it does not establish which process wrote the two extra spaces. Licensed builds overlapped builder edits; no generated-file edit was intentionally made by the UI worker. The earlier HTML and its complete proof are preserved in `evidence/browser/licensed-pre-regeneration/`. They do not verify the current output.

The additional `scripts/browser-clock.mjs` probe independently bundles and calls the real pure core. It verifies that a review category can keep the same phase `startedAt` while the shell resets the displayed timer from the current virtual time. The first category budget was 18,860 ms (displayed 19 s); after 8 s elapsed, the second category budget was 19,726 ms (displayed 20 s). It passed on the current reproducible HTML hash; see `evidence/browser/review-clock-report.json`. The accelerated timeout cases install their clock before navigation. A separate native countdown assertion checks real wall-time advancement.

The hot-seat shell is an offline engine adapter: each human gets the full configured writing time, and handovers freeze the shell clock. The virtual time supplied to the core increases monotonically according to the longest elapsed seat turn; each answer and ballot still passes the actual schema and reducer. Scores wait for a person to choose the next round, giving everyone time to read. Host controls can pause/resume, skip the current phase, or end with completed-round scores. Ending does not score the unfinished round.

## Strict frame measurements

The performance runner samples 601 consecutive real `requestAnimationFrame` timestamps and retains all 600 adjacent frame deltas. It does not filter frames, sleep between samples, synthesize timestamps, install a fake clock, or sample every other frame. It checks mean ≥59 fps and 99th percentile ≤17 ms and records every raw sample. Sampling contexts do not record video. After each measurement, a separate context records the same answer screen, viewport, and CPU throttle as a WebM below 10 MB. The report identifies these separate contexts and rechecks the HTML and canonical source fingerprints at completion. The current runner collects and checks request/error streams separately for each measured and recorded context. The runner is frozen at SHA-256 `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. The unchanged full confirmation on the current `a209acd1…` HTML passed both gates. Its complete raw arrays and separate clip streams are current proof; earlier attempts remain archived below.

Final current-output confirmation ran from 09:41:53.562 to 09:42:24.762 UTC within its coordinated quiet grant. The HTML hash remained `a209acd1d603518be5dd5d7bb9395423578bd10de75a7eb2122c506028526e08`; the sampler remained `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. All recorded source fingerprints, both full MIT notices, and zero-error/offline gates passed. All 600 deltas per profile were retained, including the desktop's 83.3 ms maximum; acceptance gates were unchanged.

| Final profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 59.507268 | 16.8 ms | 83.3 ms | 303,055 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.002784 | 16.8 ms | 16.8 ms | 233,152 |

Final proof: `evidence/browser/performance-report.json`, `desktop-frames.json`, and `phone4x-frames.json`. Recordings: `media/delivery-final-desktop.webm` and `media/delivery-final-phone4x.webm`. Both measured contexts and both separate recorded contexts raised zero page errors and made zero runtime network requests. Clip metadata binds the matching HTML, viewport, CPU throttle, workload, and separately collected streams.

The first strict run of the earlier licensed HTML failed the desktop gate: 600 retained frames, 57.419 fps, p99 33.4 ms, maximum 166.6 ms. It began at 09:01:44.532 UTC, after the reserved quiet window ended at 09:01:15. The first 200 frames were clean; later gaps were preserved, without filtering or changing acceptance gates. This failure is archived in `evidence/browser/failed-final-first/` and `media/failed-final-first-desktop.webm`. The exact recorded runner is archived alongside the failure, with `recordingDuringMeasurement: true`. A subsequent full confirmation kept the HTML unchanged, sampled without recording, and created the clips in separate contexts. Its historical passing results are below; no frames or acceptance gates were changed. The data does not establish a cause for the earlier failure.

The archived confirmation ran from 09:14:05.027 to 09:14:35.205 UTC inside the reserved 09:13–09:14:45 window. HTML SHA-256 stayed `0975fc8982ba5363d49151aecd9288ac06a0490353929ae2a34849c9d3d78113`; sampler SHA-256 was `2fbc13d492aa755db086d5440885dbc48e57298076c4eb6bd1f9c98a4d520dda`. Both complete MIT notices and all source fingerprints passed.

| Archived profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.002976 | 16.8 ms | 16.8 ms | 282,578 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.002964 | 16.8 ms | 16.8 ms | 218,031 |

Historical proof: `evidence/browser/licensed-pre-regeneration/performance-report.json`, `desktop-frames.json`, and `phone4x-frames.json` in that directory. Recordings: `media/licensed-pre-regeneration-desktop.webm` and `media/licensed-pre-regeneration-phone4x.webm`. Both measured contexts made zero network requests and raised zero page errors. That historical runner did not collect individual clip request/error streams. Archive metadata retains each original recording destination and adds its stable `archivedVideo` path. The flat performance report now records the passing current-output confirmation; historical archive links remain stable.

The first current-output attempt ran from 09:27:53.904 to 09:28:20.711 UTC within its coordinated quiet grant. It retained all 600 frames in each profile, with unchanged source and sampler. Desktop passed at 59.803843 fps, p99 16.8 ms, maximum 33.4 ms. CPU4× phone failed at 57.880765 fps, p99 16.8 ms, maximum 183.2 ms. Six phone outliers occurred between approximately 4.1 and 5.85 seconds into the sample. These observations do not identify a cause. The failed run, exact HTML and sampler, both raw arrays, and screenshots are preserved in `evidence/browser/failed-reproducible-first/`; its completed desktop clip is `media/failed-reproducible-first-desktop.webm` (316,990 bytes). Sampling contexts and the completed clip had no page errors or network requests. The phone failed before its clip was created.

A separate instrumented diagnostic ran from 09:33:56.138 to 09:34:14.164 UTC on the unchanged current HTML. Its 600 CPU4× RAF deltas, LongTask entries, before/after Performance metrics, and 4,393,419-byte CDP trace are retained in `evidence/browser/diagnostic-phone/`. Trace categories included timeline details, V8 and CPU profiling, so this run is explicitly excluded from acceptance proof. Its broad callback/rendering inflation included a 1,050 ms RAF gap, a 721.908 ms TimerFire event, a 89.671 ms FunctionCall, and a 44.731 ms layout. Four recorded GC safe-point events totaled 0.67 ms. The diagnostic does not establish the cause of the earlier uninstrumented failure.

Baseline HTML SHA-256: `3ce64d2667bc19f930cd6ea8902106e444b4fe61c34e5616dd6b60864d0e8307`.

| Profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Video bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.0028 | 16.8 ms | 16.8 ms | 737,872 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.0027 | 16.8 ms | 16.8 ms | 389,346 |

Both profiles passed, made zero runtime network requests, and raised zero page errors. This initial proof is archived in `evidence/browser/milestone-initial/`; recordings are `media/milestone-desktop.webm` and `media/milestone-phone4x.webm`. The report includes the HTML hash so a later rebuilt file cannot accidentally claim this measurement.

All illustration is original CSS or inline SVG, using system fonts. `prefers-reduced-motion` removes animation. Browser screenshots cover setup, answering, anonymous review, round scoring, and final results.
