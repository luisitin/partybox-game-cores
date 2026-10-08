# Offline play verification

## Current round-4 hosted acceptance

The bounded noun matcher is bundled into byte-reproducible HTML `be311b9653a3ad4b295745f00d37dc5c3a72426480a51979459b410850985613` (456,288 bytes). Two builds are identical. Matcher source is `74827b3d1851caffc384b420ac468ec771783e6858d6c885d2bdb19d72806e4b`; client, codec, builder, template and acceptance sampler remain unchanged. Fresh 28 gameplay, eight pacing, clock, four receipt, 17 resume and three plural checks pass on this exact file, with zero runtime errors, dialogs or network calls. Both coordinated local phone measurements failed and remain archived; current strict visual acceptance comes from a distinct genuine GitHub-host run of the same unchanged runner before the artifact gate.

Exact-head run [37782409140](https://github.com/luisitin/partybox-game-cores/actions/runs/37782409140) passed all original suites on `8c70a857fe7e4d0e35c57203562621bad10f8b00`. Strict sampling ran 13:12:09.527–13:12:40.185 UTC with unrecorded contexts, all 600 actual adjacent intervals retained per profile, and independent subsequent clips. Source, licenses and unmodified sampler `1ac72aab8370ea041a065df798493252efcc63ec3a2dd262a8c986ef0e427729` match before/after. Every downloaded file matches the original uploaded manifest, source fingerprints match the frozen local files, and interval summaries independently recompute. The artifact tree, original manifest, runner and retrieval receipt are preserved in `evidence/browser/round-4-hosted-37782409140`; canonical `hosted-run.json` identifies the exact head/run/attempt.

| Current HOSTED profile | Viewport | CPU | Raw intervals | Mean fps | p99/max | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.002376 | 16.8/16.8 ms | 326,051 |
| Phone | 390×844 | 4× | 600 | 60.002940 | 16.8/16.8 ms | 218,982 |

Both measured and separately recorded contexts have clean independent request/error streams. This is hosted acceptance, with unchanged ≥59 fps and p99 ≤17 ms gates. It does not establish local browser acceptance or explain local variance. The first phone failure (58.4444 fps) and unchanged confirmation (54.9646 fps/p99 50 ms) retain all raw frames, exact source/runner, manual source guards and partial desktop clips under `round-4-frame-first` and `round-4-frame-confirmation`. No new phone clip was collected in either failed attempt. The nongating concurrent empty-page/app control establishes no cause. Historical accepted proofs below retain their own source hashes and do not verify the current HTML.

The new actual-file plural regression uses public seed 159, letter M and the selected category “An animal that makes a home underground.” Two/eight humans type mouse and mice on separate private sheets, keep every anonymous ballot group, then inspect revealed owners and points. It compares the exact archived accepted round-3 file with the new file. The first baseline fixture timed out trying to fill the closed seed disclosure; its original report and runner are retained under `round-4-plurals-fixture-first`, then the fixture was corrected to open the disclosure with a normal UI click. No runtime or scoring change followed that fixture failure. The corrected baseline and after each pass three checks. Both actual two/eight-human rosters improve from two anonymous unique groups and two points to one shared group and zero points. All voters keep the answer, both authors remain hidden throughout private review, and the scored duplicate receipt reveals both names. Reports are `evidence/browser/round-4-plurals-{baseline,after}/report.json`, with exact HTML/driver hashes, all group observations, totals, receipt text and screenshots. The driver compares archived `084962…` against current `be311b…` and never injects game state.

## Historical accepted round-3 verification

Accepted round-3 HTML, sources, reports and raw frames are preserved under `evidence/browser/round-3-accepted/`. Stable clips are `media/round-3-delivery-final-desktop.webm` and `media/round-3-delivery-final-phone4x.webm`; the original report stays byte-identical, while the separately derived `retained-media.md` maps original destinations to these archived paths and checks bytes/SHA-256. Its exact-head CI passed at 87eb68c (run 37773541708). The following descriptions refer to that accepted earlier source.

The saved-game adapter is verified on reproducible HTML `084962917ba355e1c012253359f9f885ecab2a2b930f5493b1bcb46daf45f4aa` (455,505 bytes), built twice identically after strict TypeScript passed. All 17 resume/UI checks passed in a fresh uninterrupted run from 11:47:48 to 11:48:51.250 UTC; fresh strict frame acceptance also passed both profiles. Earlier accepted proofs below do not verify this changed source.

The real old two/eight-human UI lost answer drafts, ballot choices and scores after reload in all six measured cases. The baseline is `evidence/browser/round-3-resume-baseline/report.json`, bound to the accepted round-2 HTML and its preserved runner. Resume now offers explicit Resume/Discard choices, keeps restored private turns behind handover, and restores active elapsed time without consuming time while offline. A validated versioned snapshot retains the actual reducer state and contract RNG counters. Storage errors produce an unsaved warning. The codec bounds JSON to 500,000 UTF-8 bytes and 500,000 code units, checks canonical categories and group/owner/score references, and rejects stale compatibility hashes. The earlier 200,000-byte bound rejected an actual legal maximum-history test; parent-owned raw tests retain that regression. The expanded actual five-round/eight-seat Unicode test measured a largest snapshot of 246,896 UTF-8 bytes; all four independent codec/RNG tests passed under the final bound.

The candidate full functional suite passed 28/28; empty-review pacing passed 8/8, the review clock probe passed, and completed-receipt checks passed 4/4. Expanded resume runs retained two fixture failures (arrow line break, then uppercased handover text) and one intermittent real timer mismatch: eight-human review showed 0:18 before reload and 0:20 after Ready. Its exact HTML/report/runner are archived under `round-3-timer-first`. Three separate diagnostic repeats preserved 0:18 with observed beforeunload/pagehide saves (2,249, 2,279 and 2,311 ms saved active elapsed time). Those console observations do not identify the earlier failure’s cause. A later full before/after snapshot run passed all six restore cases and eight additional checks before the casing fixture stopped it. The final corrected uninterrupted run passed 17/17 on unchanged HTML. Its six two/eight-person cases retain actual before/after fields and snapshots before reload, after reload, after Resume and after Ready. Restored drafts stay behind private handover; two reloads retain them and their remaining time. Saved host pause, near-expiry timeout, skip/end/replay, discard, quota/security errors, stale/corrupt saves, exact mixed-roster future bot answers/counters, historical gains and disabled-vote focus all pass. Runtime errors, dialogs and nonfile requests are zero. Two interrupted runs were discarded after root CPU holds; hold metadata is retained. Fresh strict frame acceptance passed on this unchanged source.

Selected historical gains now name the selected round while totals remain current. Ready falls back to the ballot lock button when every vote button is disabled. The old gain mismatch and BODY focus were observed in a read-only probe; no retained JSON baseline was produced for those two observations.

Strict acceptance ran 11:53:50.399–11:54:22.786 UTC inside the coordinated quiet window, with all Node/Chromium groups closed at completion. All 600 adjacent actual RAF deltas are retained for each profile. The ≥59 fps / p99≤17 ms gates are unchanged, including each 33.4 ms outlier. Measurement contexts did not record; separate same-workload clips have their own checked request/error streams. Both measured contexts and both clips raised zero errors and made zero runtime network requests. The 10-second active-timer workload naturally includes the adapter’s five-second save checkpoints.

| Current round-3 profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Separate clip bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 59.903005 | 16.8 ms | 33.4 ms | 346,184 |
| Mid-phone profile | 390×844 | 4× | 600 | 59.902957 | 16.8 ms | 33.4 ms | 262,539 |

Round-3 frame report/raw arrays and resume report are archived under `evidence/browser/round-3-accepted/`; clips use the stable round-3 paths above. The sampler is `1ac72aab8370ea041a065df798493252efcc63ec3a2dd262a8c986ef0e427729`; its only method-independent change from round 2 is adding `client-save.ts` to source fingerprints. Current fingerprints are client `9426215a59608ca221b44517671fb1c28a4856eda2ddd3b53969d34baf339ea3`, codec `3554023cef9122b262eb96c48ada2483fc7e432e2bd29a6b8d040db5c2ce48ff`, and resume driver `1a4c44e34ae7b24f94dc6475b74cc52f29e445d40f4368d9d704ee2d5b5170ff`. The exact HTML, core, data, builder, template, codec, runner and both license fingerprints matched throughout sampling. Parent-owned artifact checks and exact-head CI follow this evidence; this document does not claim their completion before they run.

## Historical accepted round-2 verification

The exact accepted round-2 HTML, source, report/raw frames, functional/clock reports and runner are archived in `evidence/browser/round-2-accepted/`. Its stable clips are `media/round-2-accepted-desktop.webm` and `media/round-2-accepted-phone4x.webm`. All descriptions in this and subsequent historical sections apply to the specified earlier source.

Final reproducible HTML is `0f4e64e9b2aeb3dc834dd0851bb303339c3930384300486fe45ab0ce4213b5f9` (445,057 bytes). Strict TypeScript and two byte-identical builds pass. Its source uses 4,155 original illustrative examples, public-roster-aware Strong choices, completed-round receipt access, distinct post-score wrong-initial/own-repeat reasons and deliberate keyboard focus. The pure core and actual private ballots still own scoring.

`node scripts/browser-check.mjs`:28/28 PASS; `node scripts/browser-empty-review.mjs after`:8/8 PASS; `node scripts/browser-clock.mjs`:PASS (19,726/20,591 ms budgets, displayed20/21 seconds); `node scripts/browser-receipts.mjs after`:4/4 PASS. At both two/eight humans, five actual scored rounds expose all five receipts instead of the baseline's one, while total score5 stays unchanged. History shows each round's own letter, keyboard selection retains focus, and private writing omits history. Wrong initials, own repeats and duplicates have distinct scored explanations; future-repeat adjudication remains secret during review. Runtime errors, dialogs and nonfile requests are zero. The first pacing probe expected the intentionally replaced Invalid label; original failed report/runner are archived under `round-2-fixture-empty-review-first`, then the fixture expectation was corrected and all eight checks passed without runtime edits.

Strict acceptance ran10:55:31.746–10:56:02.839 UTC,31.093 seconds. The actual start required an explicit global quiet extension through10:56:15; it finished inside that grant. Unchanged sampler `274a54ce91f1dc173e094b06af713e8cc945e75983985ca8623d4cd5a018720a` retained all600 consecutive actual intervals per profile. Desktop1920×1080 and phone390×844 CPU4× both measured60.002400096 fps, p99/max16.8 ms. No samples were filtered and the ≥59/p99≤17 gates stayed unchanged. Separate same-workload clips are296,924/198,176 bytes; every sampling/clip context has its own checked zero-error/file-only request stream. Exact HTML, client, core, data, licenses and runner fingerprints matched before/after; browser/group118673 closed at completion. Round-2 report/raw frames are archived under `evidence/browser/round-2-accepted/`; clips are the stable round-2 paths above.

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
node scripts/browser-resume.mjs after
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

Round4 strict first attempt12:39:55.643–12:40:22.683 UTC: frozenbe311 /
sampler1ac72, desktop59.8036169fps p9916.8/max50PASS; phone4x58.4443516fps
p9916.8/max133.3FAIL. All600intervals retained; onlythreephonegaps exceed25ms
atindices406/433/439 (83.3/99.9/133.3ms), sampleelapsed6.766/7.283/7.466s.
Desktopseparateclip301876B captured, phoneclipnotcollected. Actualfailedpage/
runner/raw/report/partialclip preserved under round-4-frame-first. Sampler exits
before its finalsourceguards onfailure; independentmanualreadback12:41:58.445
verified everyHTML/sourcefingerprint stillmatched. No errors/nonfilecalls.
This is failureevidence, notacceptance or a causaldiagnosis.
