# Offline play verification

## Current round-2 acceptance

Final reproducible HTML is `0f4e64e9b2aeb3dc834dd0851bb303339c3930384300486fe45ab0ce4213b5f9` (445,057 bytes). Strict TypeScript and two byte-identical builds pass. Its source uses 4,155 original illustrative examples, public-roster-aware Strong choices, completed-round receipt access, distinct post-score wrong-initial/own-repeat reasons and deliberate keyboard focus. The pure core and actual private ballots still own scoring.

`node scripts/browser-check.mjs`:28/28 PASS; `node scripts/browser-empty-review.mjs after`:8/8 PASS; `node scripts/browser-clock.mjs`:PASS (19,726/20,591 ms budgets, displayed20/21 seconds); `node scripts/browser-receipts.mjs after`:4/4 PASS. At both two/eight humans, five actual scored rounds expose all five receipts instead of the baseline's one, while total score5 stays unchanged. History shows each round's own letter, keyboard selection retains focus, and private writing omits history. Wrong initials, own repeats and duplicates have distinct scored explanations; future-repeat adjudication remains secret during review. Runtime errors, dialogs and nonfile requests are zero. The first pacing probe expected the intentionally replaced Invalid label; original failed report/runner are archived under `round-2-fixture-empty-review-first`, then the fixture expectation was corrected and all eight checks passed without runtime edits.

Strict acceptance ran10:55:31.746–10:56:02.839 UTC,31.093 seconds. The actual start required an explicit global quiet extension through10:56:15; it finished inside that grant. Unchanged sampler `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a` retained all600 consecutive actual intervals per profile. Desktop1920×1080 and phone390×844 CPU4× both measured60.002400096 fps, p99/max16.8 ms. No samples were filtered and the ≥59/p99≤17 gates stayed unchanged. Separate same-workload clips are296,924/198,176 bytes; every sampling/clip context has its own checked zero-error/file-only request stream. Exact HTML, client, core, data, licenses and runner fingerprints matched before/after; browser/group118673 closed at completion. Current report/raw frames are the flat `evidence/browser/performance-report.json`, `desktop-frames.json`, `phone4x-frames.json`; clips are `media/delivery-final-{desktop,phone4x}.webm`.

`npx tsx --test tests/artifacts.test.ts`:1/1 PASS (30.206 ms body). It recomputes both frame gates and binds current HTML/source/license/clip/functional evidence, actual empty-review action measurements, five-round receipt comparisons and all three actual eight-bot causal layers.

## Historical accepted round-1 verification

The following notes describe the accepted0a994 round-1 source and preceding archived attempts. Its exact HTML/client/content/sampler, functional/clock/empty-review reports, raw frames and clips are retained under `evidence/browser/round-1-accepted/` and `media/round-1-accepted-*.webm`. They are historical and do not verify the changed current source.

KEEP GOING round 1 UI verification is complete. The accepted round-1 HTML was `0a9940c56f3b46c4c10df4ab4a8c7d62b7efb90950abce530e652885e0be53f3` (439,850 bytes), built twice identically after adding empty-review advancement through actual core timer events. All 28 functional checks, eight targeted actual-HTML checks, and the review-clock probe passed. New strict visual verification passed both profiles with all 600 samples retained. The accepted round-0 proof described below is archived in `evidence/browser/round-0-accepted/`; it verifies the earlier `a209acd1…` HTML, rather than this candidate.

Round-1 targeted checks first required fixture corrections for category/round text casing and an invalid answer that was also deliberately duplicated, which displays the existing duplicate verdict. The runtime behavior was unchanged. Failed fixture attempts are retained in `evidence/browser/round-1-after/fixture-attempts.json`, `fixture-failure-second.json`, and `fixture-failure-third.json`. The final targeted report passed all eight checks on the candidate; two/eight-human blank rounds now require zero review actions, compared with 48/192 in the actual round-0 baseline. The mixed case retained eight private ballots for four nonempty categories and skipped eight empty categories. Those reports are `evidence/browser/round-1-baseline/report.json` and `round-1-after/report.json`; elapsed automation values have different observation scopes and do not establish human time saved.

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

Final reproducible HTML SHA-256: `0a9940c56f3b46c4c10df4ab4a8c7d62b7efb90950abce530e652885e0be53f3` (439,850 bytes). Two consecutive builds were byte-identical. All 28 functional checks passed on this exact file, with zero page errors, browser dialogs, or runtime network requests. Both complete MIT notices and valid HTML comment delimiters are checked. `evidence/browser/functional-report.json` records every check.

Regeneration found that the earlier 439,586-byte artifact (`0975fc…`) used malformed notice delimiters `<!- -` and `- ->`; the current builder emits valid `<!--` and `-->`. Regeneration of the accepted round-0 file was byte-identical before the intentional round-1 adapter change. The saved commit contains a valid-wrapper builder alongside that malformed artifact, so it does not establish which process wrote the two extra spaces. Licensed builds overlapped builder edits; no generated-file edit was intentionally made by the UI worker. The earlier HTML and its complete proof are preserved in `evidence/browser/licensed-pre-regeneration/`. They do not verify the current output.

The additional `scripts/browser-clock.mjs` probe independently bundles and calls the real pure core. It verifies that a review category can keep the same phase `startedAt` while the shell resets the displayed timer from the current virtual time. The fixture supplies a distinct nonempty answer to every category, so no category is skipped. The first category budget was 19,726 ms (displayed 20 s); after 8 s elapsed, the second category budget was 20,591 ms (displayed 21 s). It passed on the current reproducible HTML hash; see `evidence/browser/review-clock-report.json`. The accelerated timeout cases install their clock before navigation. A separate native countdown assertion checks real wall-time advancement.

The hot-seat shell is an offline engine adapter: each human gets the full configured writing time, and handovers freeze the shell clock. The virtual time supplied to the core increases monotonically according to the longest elapsed seat turn; each answer and ballot still passes the actual schema and reducer. Scores wait for a person to choose the next round, giving everyone time to read. Host controls can pause/resume, skip the current phase, or end with completed-round scores. Ending does not score the unfinished round.

## Strict frame measurements

The performance runner samples 601 consecutive real `requestAnimationFrame` timestamps and retains all 600 adjacent frame deltas. It does not filter frames, sleep between samples, synthesize timestamps, install a fake clock, or sample every other frame. It checks mean ≥59 fps and 99th percentile ≤17 ms and records every raw sample. Sampling contexts do not record video. After each measurement, a separate context records the same answer screen, viewport, and CPU throttle as a WebM below 10 MB. The report identifies these separate contexts and rechecks the HTML and canonical source fingerprints at completion. The current runner collects and checks request/error streams separately for each measured and recorded context. The runner is frozen at SHA-256 `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. The current `0a9940c5…` HTML passed both gates with fresh measurements. The accepted round-0 `a209acd1…` proof is separately archived.

Final round-1 measurement ran from 10:16:48.265 to 10:17:19.487 UTC inside its coordinated quiet grant. HTML SHA-256 remained `0a9940c56f3b46c4c10df4ab4a8c7d62b7efb90950abce530e652885e0be53f3`; the unchanged sampler remained `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. The annotated client fingerprint was `a220085b5a5bb0f2b8bc264d3913e0c15a03aebb2d2347fc20c58ade464f6431`. Both license notices and every canonical source fingerprint passed. No frame was filtered, including the desktop's 50.1 ms maximum.

| Final round-1 profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 59.311184 | 16.8 ms | 50.1 ms | 320,822 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.003180 | 16.8 ms | 16.8 ms | 213,656 |

Accepted round-1 proof is `evidence/browser/round-1-accepted/performance-report.json`, with raw frames in that directory; recordings are `media/round-1-accepted-desktop.webm` and `media/round-1-accepted-phone4x.webm`. Both measured and separately recorded contexts raised zero page errors and made zero runtime network requests. Their viewport, throttle, workload, exact HTML, and individual error/request streams are recorded. The browser closed at completion; repository checks and exact-head CI are owned by the parent worker.

The accepted round-0 confirmation ran from 09:41:53.562 to 09:42:24.762 UTC within its coordinated quiet grant. The HTML hash remained `a209acd1d603518be5dd5d7bb9395423578bd10de75a7eb2122c506028526e08`; the sampler remained `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a`. All recorded source fingerprints, both full MIT notices, and zero-error/offline gates passed. All 600 deltas per profile were retained, including the desktop's 83.3 ms maximum; acceptance gates were unchanged.

| Accepted round-0 profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 59.507268 | 16.8 ms | 83.3 ms | 303,055 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.002784 | 16.8 ms | 16.8 ms | 233,152 |

Accepted round-0 proof: `evidence/browser/round-0-accepted/performance-report.json`, `desktop-frames.json`, and `phone4x-frames.json` in that directory. Recordings: `media/round-0-accepted-desktop.webm` and `media/round-0-accepted-phone4x.webm`. Both measured contexts and both separate recorded contexts raised zero page errors and made zero runtime network requests. Clip metadata binds the matching HTML, viewport, CPU throttle, workload, and separately collected streams.

The first strict run of the earlier licensed HTML failed the desktop gate: 600 retained frames, 57.419 fps, p99 33.4 ms, maximum 166.6 ms. It began at 09:01:44.532 UTC, after the reserved quiet window ended at 09:01:15. The first 200 frames were clean; later gaps were preserved, without filtering or changing acceptance gates. This failure is archived in `evidence/browser/failed-final-first/` and `media/failed-final-first-desktop.webm`. The exact recorded runner is archived alongside the failure, with `recordingDuringMeasurement: true`. A subsequent full confirmation kept the HTML unchanged, sampled without recording, and created the clips in separate contexts. Its historical passing results are below; no frames or acceptance gates were changed. The data does not establish a cause for the earlier failure.

The archived confirmation ran from 09:14:05.027 to 09:14:35.205 UTC inside the reserved 09:13–09:14:45 window. HTML SHA-256 stayed `0975fc8982ba5363d49151aecd9288ac06a0490353929ae2a34849c9d3d78113`; sampler SHA-256 was `2fbc13d492aa755db086d5440885dbc48e57298076c4eb6bd1f9c98a4d520dda`. Both complete MIT notices and all source fingerprints passed.

| Archived profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.002976 | 16.8 ms | 16.8 ms | 282,578 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.002964 | 16.8 ms | 16.8 ms | 218,031 |

Historical proof: `evidence/browser/licensed-pre-regeneration/performance-report.json`, `desktop-frames.json`, and `phone4x-frames.json` in that directory. Recordings: `media/licensed-pre-regeneration-desktop.webm` and `media/licensed-pre-regeneration-phone4x.webm`. Both measured contexts made zero network requests and raised zero page errors. That historical runner did not collect individual clip request/error streams. Archive metadata retains each original recording destination and adds its stable `archivedVideo` path. The flat performance report now records the current round-2 output; archive links remain stable.

The first reproducible round-0 attempt ran from 09:27:53.904 to 09:28:20.711 UTC within its coordinated quiet grant. It retained all 600 frames in each profile, with unchanged source and sampler. Desktop passed at 59.803843 fps, p99 16.8 ms, maximum 33.4 ms. CPU4× phone failed at 57.880765 fps, p99 16.8 ms, maximum 183.2 ms. Six phone outliers occurred between approximately 4.1 and 5.85 seconds into the sample. These observations do not identify a cause. The failed run, exact HTML and sampler, both raw arrays, and screenshots are preserved in `evidence/browser/failed-reproducible-first/`; its completed desktop clip is `media/failed-reproducible-first-desktop.webm` (316,990 bytes). Sampling contexts and the completed clip had no page errors or network requests. The phone failed before its clip was created.

A separate instrumented diagnostic ran from 09:33:56.138 to 09:34:14.164 UTC on the unchanged round-0 HTML. Its 600 CPU4× RAF deltas, LongTask entries, before/after Performance metrics, and 4,393,419-byte CDP trace are retained in `evidence/browser/diagnostic-phone/`. Trace categories included timeline details, V8 and CPU profiling, so this run is explicitly excluded from acceptance proof. Its broad callback/rendering inflation included a 1,050 ms RAF gap, a 721.908 ms TimerFire event, a 89.671 ms FunctionCall, and a 44.731 ms layout. Four recorded GC safe-point events totaled 0.67 ms. The diagnostic does not establish the cause of the earlier uninstrumented failure.

Baseline HTML SHA-256: `3ce64d2667bc19f930cd6ea8902106e444b4fe61c34e5616dd6b60864d0e8307`.

| Profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Video bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.0028 | 16.8 ms | 16.8 ms | 737,872 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.0027 | 16.8 ms | 16.8 ms | 389,346 |

Both profiles passed, made zero runtime network requests, and raised zero page errors. This initial proof is archived in `evidence/browser/milestone-initial/`; recordings are `media/milestone-desktop.webm` and `media/milestone-phone4x.webm`. The report includes the HTML hash so a later rebuilt file cannot accidentally claim this measurement.

All illustration is original CSS or inline SVG, using system fonts. `prefers-reduced-motion` removes animation. Browser screenshots cover setup, answering, anonymous review, round scoring, and final results.
