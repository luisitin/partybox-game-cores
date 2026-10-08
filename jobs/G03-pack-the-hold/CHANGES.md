# Changes during stale delivery recheck

R9:src/core.ts rejects non-object/null events,non-string actors and malformed connected/gone fields before accessing properties or copying presence. Eight exceptions and three invalid presence updates in12 baseline probes become zero;valid inputs/state format/rules/bots remain unchanged.

R9:tests/focused.test.mjs adds deep-frozen malformed-event coverage across pack/reveal/done and paused pack. It verifies identity and unchanged JSON after rejection while retaining the existing actual prototype-like player-ID test.

R9:G03.yml keeps the required pull_request paths/read-only/30-minute/actions-only checks and removes duplicate push triggers. Per-PR concurrency cancels obsolete runs. Both delivery branches can be pushed without duplicating the required hosted job.

R9:play.html is rebuilt from the guarded reducer;the full passing browser audit's real clip/screenshot/measurement report is retained as milestone11 and regenerated hashes cover all data/media. Original artwork and calibrated tiers are preserved.

R10:src/study-total-baseline.ts freezes exact2a9c5e1 reducer;tests/total-events.test.mjs compares every valid transition/result against it,with a pinned source SHA256 and1,003 seeded games. The audit records ephemeral evidence in.tmp/total-compatibility.json and runs with npm test. This detects accidental valid-game changes after R9 guards.

R10:scripts/check-hashes.mjs verifies complete data/media coverage and committed bytes before npm test builds or regenerates anything. scripts/generate.mjs adds the existing THIRD_PARTY_NOTICES.md to hashes. An owned corrupt-HTML probe proves early rejection and restores every modified byte. No production game behavior changes.

R11:tests/total-events.test.mjs adds seeded malformed JSON across pack/paused/reveal/done. It rejects invalid root/actor/input/clock/presence/VIP/stale-timer data and checks frozen-state identity plus unchanged JSON. Actual evidence is printed and written to.tmp/total-envelopes.json;the existing npm test glob runs it. No game code changes.

R12:retain fresh milestone12 browser evidence and hashes from the existing interaction audit;no runtime/UI change. G03.yml uploads.tmp/total-*.json alongside existing evidence so reviewers can inspect both new regression reports.
