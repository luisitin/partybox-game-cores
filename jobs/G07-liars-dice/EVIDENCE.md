# Current G07 evidence

The final32-source observer/workload checker uses exact current source and
complete reports. The native600-frame callback and all gameplay are unchanged.

- [Actual full hosted41f6226 report](evidence/browser/report.json),[desktop raw](evidence/browser/desktop-frames.json),[phone raw](evidence/browser/phone4x-frames.json):94/94 plusall1200 intervals,60.001800/60.002400FPS,p99/max16.8.
- [Permanent official hosted artifact ZIP](evidence/browser/hosted-41f6226/artifact.zip) and [1387-assertion independent actual-byte receipt](evidence/browser/hosted-41f6226/independent-current-hosted-validation.json); exact run37831510960/source41f6226.
- [Independent offline reader](evidence/checks/resume-audit-13-independent-hosted-reader.py):copy the public ZIP to a scratch directory as artifact.zip; pass `--base <scratch> --local-repository <repo> --head 41f6226274e0eb693adfe00c29bd0ae8ae981ff9 --run-id 37831510960 --job-id 113497745355 --artifact-id 11573104871 --zip-bytes 1249277 --zip-sha256 87a98e203ec7f2b5bac369258e52a9d51081f0184861963d23a0f324c834f739`. It safely extracts verified bytes and never generates positive frames.
- [Actual local93/94 failure and complete strict-frame results](evidence/checks/resume-audit-13-local-full-failure.json):phone calza pre-click bound failed; both600-frame profiles pass,but the full report correctly rejects. Allraw/grant/STOP-CONT evidence is in the identified run directory.
- [Four real trusted-click diagnostic](evidence/checks/resume-audit-11-clock-observer-diagnostic.json),[unsampled player-map guard error](evidence/checks/resume-audit-12-unsampled-guard-failure.json):scopes/old source identities/failures preserved.
- [Fresh five-round clip report](evidence/browser/resume-audit-13-captures.json),[actual complete VP8 decode](evidence/checks/resume-audit-13-real-clip-decode.json),[desktop clip](media/resume-audit-13-desktop.webm),[phone clip](media/resume-audit-13-phone4x.webm). Recordings are separate from native frame acceptance.

This41f6226 proof remains source-specific; the newer final evidence-only commit
requires its own complete green CI/actual artifact before PR6 is ready.

---

# Evidence index

Current runtime page SHA256:
`33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a`.
Source hashes and compiled bundle hashes are distinct and explicitly labelled
in each report. Recordings are separate functional evidence, not FPS samples.

| Evidence | Public file | Meaning |
| --- | --- | --- |
| Historical original-runner full acceptance | [report](evidence/browser/historical-runner-f8a8d602/report.json), [actual runner](evidence/browser/historical-runner-f8a8d602/browser-check.observed.txt) | Runner f8a8d602;run20261008100423816;94/94, all600 intervals per profile;desktop60.002400FPS/phone4x59.803247FPS,p9916.8ms. This is not acceptance for the repaired checker. |
| Historical original-runner raw samples | [desktop](evidence/browser/historical-runner-f8a8d602/desktop-frames.json), [phone](evidence/browser/historical-runner-f8a8d602/phone4x-frames.json) | No filtering/trimming;601 timestamps/600 derived intervals each. |
| Reproduced legacy checker counterexamples | [counterexamples](evidence/checks/resume-legacy-validator-counterexamples.json), [actual checker](evidence/browser/historical-runner-f8a8d602/integrity.observed.txt) | Twelve invalid report variants accepted by the exact original frame-validation block with genuine unchanged raw samples. This does not claim the whole integrity CLI accepts a stale hash manifest. |
| Current checker repair | [validator](scripts/browser-evidence.mjs), [negative controls](tests/browser-evidence.test.mjs), [coordination](tests/frame-coordination.test.mjs) |70 targeted tests pass. Current acceptance additionally requires full94 checks,both exact profiles,1200 genuine intervals and30 actual start/end source guards; pending exact new-head CI. |
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


Current repaired-source a490 hosted full proof: [actual report](evidence/browser/hosted-a490-37817956480/report.json),
[1306-check independent receipt](evidence/checks/resume-audit-9-hosted-independent.json).
Exact a490 run37817956480 SUCCESS; both full600 profiles60.002400FPS,p99/max16.8,
all30 source bytes matched. This is specific hosted evidence,not a universal
wall-time guarantee. Local [full failed report](evidence/browser/runs/33f5e801d975192c26fd6eaf297086a81d828f7a1074b8b4328e20baf6c7d37a/20261008173740283/report.json)
and both raw files retain91/94,all three failures and actual coordination.
Fresh [checkpoint clips](evidence/browser/resume-audit-proof-10-captures.json)
remain separate from timing. A new final head still needs its own CI green.
