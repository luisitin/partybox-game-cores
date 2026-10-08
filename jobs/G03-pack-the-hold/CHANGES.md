# Changes during stale delivery recheck

R9:src/core.ts rejects non-object/null events,non-string actors and malformed connected/gone fields before accessing properties or copying presence. Eight exceptions and three invalid presence updates in12 baseline probes become zero;valid inputs/state format/rules/bots remain unchanged.

R9:tests/focused.test.mjs adds deep-frozen malformed-event coverage across pack/reveal/done and paused pack. It verifies identity and unchanged JSON after rejection while retaining the existing actual prototype-like player-ID test.

R9:G03.yml keeps the required pull_request paths/read-only/30-minute/actions-only checks and removes duplicate push triggers. Per-PR concurrency cancels obsolete runs. Both delivery branches can be pushed without duplicating the required hosted job.

R9:play.html is rebuilt from the guarded reducer;the full passing browser audit's real clip/screenshot/measurement report is retained as milestone11 and regenerated hashes cover all data/media. Original artwork and calibrated tiers are preserved.
