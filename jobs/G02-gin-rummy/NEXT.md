# Resume G02

Branch job/G02-gin-rummy; nickname codex-gin; PR#2 draft.
Main only holds CLAIMS updates; shared contract and other jobs untouched.
Actual hosted success through round4: run37727436693/head369971a.
Earlier successes and failed measurements are preserved in VERIFY/evidence.

Round5 version1.2.1 fixes target-winner versus final settlement, arbitrary
valid string IDs including empty, malformed metadata coercion, and early-end
wording. Full local check sequence PASS:29 tests,6,000 games+6,000 final
replays, independent proofs, both leagues57.60%/87.15%,25 mutants, browser
60.002FPS both profiles and clock/meld/result checks. Result clips/screenshot
and counterexamples are delivered. Refresh hashes/integrity before push;
current-head hosted npm test remains required.

Next round6: re-read G02/list five weaknesses, then strengthen replay tests
to compare state bytes/hashes after EVERY event, not just final states.
Remaining: bundled license notice, invalid-card utility boundaries and
malformed event/view fuzz in all phases. Log/push each round and refresh main
claim. Require three consecutive no-player-noticeable-gain rounds and actual
exact-head green CI before PR ready/next lowest eligible claim. No completion
or stop claimed; all earlier failures remain recorded.
