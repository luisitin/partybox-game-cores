# Evidence index

Current runtime page SHA256:
`33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a`.
Source hashes and compiled bundle hashes are distinct and explicitly labelled
in each report. Recordings are separate functional evidence, not FPS samples.

| Evidence | Public file | Meaning |
| --- | --- | --- |
| Current full browser acceptance | [report](evidence/browser/report.json) | Run20261008100423816;94/94, all600 consecutive intervals per profile; desktop60.002400FPS/phone4x59.803247FPS, p9916.8ms. Chrome emulation; no physical phone test. |
| Current raw samples | [desktop](evidence/browser/desktop-frames.json), [phone](evidence/browser/phone4x-frames.json) | No filtering/trimming;601 timestamps/600 derived intervals each. |
| Correct supported seat/help behavior | [host comparisons](evidence/browser/round-5-host.json), [clips](evidence/browser/round-5-captures.json) | Actual saved custom-ID recovery and actions; ten new browser cases and18 palifico conditions. |
| Current unchanged-game review recordings | [round6](evidence/browser/round-6-captures.json), [round7](evidence/browser/round-7-captures.json), [round8](evidence/browser/round-8-captures.json) | Two actual five-round games per milestone; runtime source guards/zero errors/network. |
| Latest full hosted acceptance before documentation reviews | [CI metadata](evidence/checks/ci-round-5.json) | Exactcc0e1aa GitHub37762109046SUCCESS,46 node/94 browser/integrity334. Hosted logs read; artifact not downloaded; no hosted FPS inferred. Each final branch head needs its own green run. |
| Pure-core/game matrix/mutations | [round2 verification](evidence/checks/round-2/verification.json) |7,000 complete2–8 games,1,698,452 restored events,1,003 properties,20,000 independent probability differentials,25/25 assertion mutation kills. Core source unchanged. |
| Strength and provenance | [BOTS](BOTS.md), [calibration](evidence/checks/strategy-calibration.md), [fresh holdout](evidence/checks/round-2/strategy-holdout.json) |64.70%/58.90% required default duels;66.8%/57.0% independent fresh default-duel holdout. Initial metrics remain historical; no multiplayer-strength claim. |
| Session recovery | [session log](VERIFY.md) | Eight focused codec/RNG tests and24 actual browser recovery cases; same-tab best effort. |

`evidence/browser/round-1-pacing.json` is the pacing probe from the **current**
source-matched full run; its filename names the introduced feature. The
original round1 gain791→2095.143ms is preserved in the archived
`evidence/browser/runs/aa9d7b31f323703fb4fb8fb4e735b7058aa9098ca78ccc9a373024b8ac66f825/20261008070041971/round-1-pacing.json`,
with the original [baseline](evidence/browser/round-1-before-pacing.json).
Do not treat later timing variation as a new runtime optimization.

Full reports/raw/runners from failed round5 runs20261008093609401 (89/94)
and20261008094526208 (92/94) remain under `evidence/browser/runs/` for this
page hash. `evidence/browser/diagnostics/round-5-20261008095803839/` is
**nongating** accepted-pause instrumentation and a light frame sample; it
does not establish either failed frame sample's cause or a runtime FPS gain.
Earlier failures and evidence-only cadence CI rejections remain in VERIFY.

Run commands, interpretation and limits: [VERIFY](VERIFY.md). File integrity:
`SHA256SUMS.txt` covers every delivered file except itself; fixtures/manifest
regenerate2x byte-identically. Ignored scratch and old git history are not
default-test dependencies. The full SDK is unavailable; the unchanged shared
contract and local adapter are verified, with that integration limit disclosed.
