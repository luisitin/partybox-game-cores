# Current G02 proof

Open [play.html](../../play.html) directly from disk. Current production sources
are unchanged since the genuine Pass-attribution repair. The guarded local
full run is `2026-10-08T12-15-12-540Z`; its complete 600 intervals per profile
include the desktop 50 ms maximum. Integrity recomputes every interval.

| Profile | FPS | p99 ms | Maximum ms | Raw samples |
| --- | ---: | ---: | ---: | --- |
| Desktop 1920×1080, CPU 1× | 59.703869 | 16.8 | 50 | [600 intervals](desktop-frames.json) |
| Phone 390×844, Chrome CPU 4× | 60.003000 | 16.8 | 16.8 | [600 intervals](phone4x-frames.json) |

[Accepted report](browser.json), [exact runner](attempts/2026-10-08T12-15-12-540Z/browser-check.mjs),
[complete run log](attempts/2026-10-08T12-15-12-540Z/passed.log),
[current-proof index](current-proof.json), [verification](../../VERIFY.md).
No startup samples or outliers are removed; recordings are separate from FPS proof.

| Delivered source | SHA256 |
| --- | --- |
| [play.html](../../play.html) | `a5a56d6a6926ff7ef83b61028296cc068e163f92ea62cd45aa463d5fb6e0be2f` |
| [src/core.ts](../../src/core.ts) | `59bd505525bdc2eb3540ce78e4daba00a99d5b557318214af189a5a7fdeb43cf` |
| [src/cards.ts](../../src/cards.ts) | `e309e103393bc1aaaf10b34e3994de815dd693d1828a61566723b8fba573fdb9` |
| [src/browser.ts](../../src/browser.ts) | `56fb3b450aa29e9dda800a69b187d66d5446e056bf2b89b349a9bef1479131e4` |
| [src/play.template.html](../../src/play.template.html) | `1b5188f105cfd9766f3f19c0a6f3cfa1b522cbd676ec5fde0dbfa1566a09f8c7` |

Latest completed source head `fa7e3e9` passed [exact CI 37779189588](https://github.com/luisitin/partybox-game-cores/actions/runs/37779189588).
Its [actually read log](round-12/hosted-round-11.log) and [metadata](round-12/hosted-round-11.json)
report 43 tests, the full core matrix/properties/solvers, unchanged 57.6%/87.15%
bot leagues, 26 compiled assertion-killed mutants, full browser gates and proof integrity.
The final branch head must independently be green at [PR #2 checks](https://github.com/luisitin/partybox-game-cores/pull/2/checks).

Fresh final-review [desktop recording](../../media/round-12-final-review-desktop.webm)
and [phone recording](../../media/round-12-final-review-phone4x.webm) show actual Pass
history, private cleanup, timeout and pause/end. [Capture metadata](round-12-final-review-captures.json)
checks independent start/end source hashes and recording bytes/hashes. These are
functional recordings, not timing measurements or physical-device evidence.

Historical evidence stays separate: [failed 58.730 FPS run](attempts/2026-10-08T11-27-10-248Z/report.json),
[all its raw desktop intervals](attempts/2026-10-08T11-27-10-248Z/desktop-frames.json),
[real host before](before.json), [real host after](after.json),
[wrong Pass labels before](round-9/ui-before.json), [correct labels after](round-9/ui-after.json),
[26-mutation assertions](round-10/M26-assertions.log),
[old/new stale-proof negative control](round-11/negative-control.json).
Hidden New match retention was inside a hidden table; no visual or core-view leak
is claimed. The earlier frame failure has no established cause.

Limits: no physical handset or unavailable application SDK was tested, and no
outside elite bot strength is claimed. Historical Azure artifact downloads
returned 403; artifact contents were not read or reconstructed. Actual hosted
logs and current local raw samples support the stated results.
