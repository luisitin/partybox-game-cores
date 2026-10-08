# Offline play verification

`play.html` is generated from `client.ts`, `src/play.template.html`, and the real pure game exported by `src/index.ts`. It embeds the whole bundle and opens directly from disk. The shell calls the actual input schema, reducer, views, results, and three bot strategies. It does not implement a second game.

## Commands

```sh
npm ci
npm run typecheck
npm run build:play
node scripts/browser-check.mjs
python scripts/browser-performance.py
```

The functional runner uses the development-only Playwright dependency. The performance runner uses Python Playwright and an installed Chromium headless shell; `CHROMIUM_PATH` may select a browser. Install a browser with `npx playwright install chromium` where needed. A full Chrome subject to this cloud environment's system URL policy blocks `file://`; Chromium headless shell successfully opens the actual file. No HTTP server substitutes for the file test.

## Gameplay and accessibility

The browser suite checks desktop 1920×1080 and phone 390×844: names and answers are escaped, each category has a programmatic input label, focus starts on the first answer, previous answers disappear at handover, authors are absent from anonymous vote cards, all twelve review categories advance, duplicate answers score zero, authors appear after scoring, tied winners persist in final results, replay returns to settings, keyboard focus stays inside dialogs, Escape resumes, pausing preserves draft and time, timeout locks the current sheet and waits for the next person, and reduced motion disables entrance animations. Separate complete games exercise every seat count from 2 through 8 with easy, medium, and strong bots. Runtime checks reject errors, browser dialogs, and network requests. The report records the exact tested HTML SHA-256.

The hot-seat shell is an offline engine adapter: each human gets the full configured writing time, and handovers freeze the shell clock. The virtual time supplied to the core increases monotonically according to the longest elapsed seat turn; each answer and ballot still passes the actual schema and reducer. Scores wait for a person to choose the next round, giving everyone time to read. Host controls can pause/resume, skip the current phase, or end with completed-round scores. Ending does not score the unfinished round.

## Strict frame measurements

The performance runner samples 601 consecutive real `requestAnimationFrame` timestamps and retains all 600 adjacent frame deltas. It does not filter frames, sleep between samples, synthesize timestamps, install a fake clock, or sample every other frame. It checks mean ≥59 fps and 99th percentile ≤17 ms, records every raw sample, and records a WebM below 10 MB for each profile. The HTML hash is checked again at completion.

Baseline HTML SHA-256: `3ce64d2667bc19f930cd6ea8902106e444b4fe61c34e5616dd6b60864d0e8307`.

| Profile | Viewport | CPU | Frames | Mean fps | p99 | Maximum | Video bytes |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |
| Desktop | 1920×1080 | 1× | 600 | 60.0028 | 16.8 ms | 16.8 ms | 737,872 |
| Mid-phone profile | 390×844 | 4× | 600 | 60.0027 | 16.8 ms | 16.8 ms | 389,346 |

Both profiles passed, made zero runtime network requests, and raised zero page errors. Evidence is in `evidence/browser/performance-report.json`, `desktop-frames.json`, and `phone4x-frames.json`; recordings are `media/milestone-desktop.webm` and `media/milestone-phone4x.webm`. The report includes the HTML hash so a later rebuilt file cannot accidentally claim this measurement.

All illustration is original CSS or inline SVG, using system fonts. `prefers-reduced-motion` removes animation. Browser screenshots cover setup, answering, anonymous review, round scoring, and final results.
