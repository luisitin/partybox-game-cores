# Resume G05 — final checks pending

PR5 https://github.com/luisitin/partybox-game-cores/pull/5; job/G05-hearts.
Read root README/RULES/JOBS first. G03 PR3 complete/green; preserve it.

Baseline and rounds1–9 full CI green, latestba95921 push37742910131/
PR37742916541. Last product/check change5509a20 actual-disk report preserved:
desktop60.002/CPU4x phone60.000fps,p9516.8/max16.8ms; all outcome/recovery/
clock/privacy/input/roster gates true. Round10 fixes documentation link count
(7 valid links/36 lines) and delivered licence index only;30 JSON/58 hashes,
fresh milestone11 capture140221B (not benchmark). Game/UI/check code unchanged.
The capture transport interrupted once; rerun passed. All failures retained.

Rounds8–10 are three consecutive no-meaningful-gain rounds after the real
keyboard/winner fix in7. Publish/refresh, await BOTH updated exact-head CI
green. Then final audit/VERIFY/NEXT DONE and rewrite PR body to final scope.
Push final metadata/refresh claim; verify BOTH final-head checks green before
claiming the next lowest eligible job from current main. Do not merge.
Do not restart or rebuild G05; no further gameplay weakness observed.

REST checker /workspace/partybox-ci-head.py G05 --watch; report reader
/workspace/g05-read-ci-report.py <ID>. Full30 tests/25 mutants/10k independent/
1003 seeds/4000 roster games/4000 leagues/repro/source/schema/hash/disk browser
remain required. Local --http partial; managed Chrome file:// blocked.
At branch switch, add local excludes for G05 node_modules/.build/.tmp if needed
so installed caches do not become untracked work on main; preserve all files.
