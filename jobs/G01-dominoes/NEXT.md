# Resume G01

Branch job/G01-dominoes; PR https://github.com/luisitin/partybox-game-cores/pull/1.
Read current main README.md, RULES.md, JOBS.md and CLAIMS.md first.

Delivery is ready; KEEP GOING stop criterion is SATISFIED. Rounds16–18
are three consecutive rejected, substantive improvement attempts:
- Depth-four:926/2,000 wins(46.3%,upper95%48.49%).
- Draw decision-depth:1,050 initial,1,041 fresh/2,000; fresh lower95%49.86%.
- Tile-count leaf:1,017/2,000(50.85%,lower95%48.66%).
No candidates shipped. Exact0.2.7 frozen baseline and all reports retained.

FINAL-HEAD CI STILL MUST PASS before calling G01 complete/claiming next.
Use `git rev-parse HEAD`, `gh pr view 1 --json headRefOid` and
`gh run list --workflow G01.yml --json databaseId,headSha,status,conclusion`.
Observe SUCCESS for the actual final branch/PR head, not only an older run.
If success: G01 is complete, do not restart the improvement experiments;
claim the lowest eligible main job. G02/G03 currently have other workers.
If failure: inspect actual failed step/annotations, fix within scope, push,
refresh claim and verify new CI. Do not infer a game failure from installation.

Production0.2.7:40 tests/9,003 games,25 mutants,solver20,000 cases,
conditional counts10,000 and both opener probes10,000 pass. Block
strong1,438/2,000(71.9%);Draw1,684/2,000(84.2%);bounded upstream132/200.
Current game/UI/test/pipeline bytes equal bedf43a, whose full GitHub
run37681790311 passed. New tooling/types,30 focused production tests,
build freshness and all checksums pass locally. SHA covers new study reports.
PR body records the actual latest observed CI without another branch push.

Refresh ONLY own main G01 line each job push; preserve concurrent claims.
Native Git works; remote500 fallback /workspace/.onboarding/publish-commit.py
verifies single-parent objects and advances force:false.

G08 is owner's Shake Up. Read START-HERE.md and start/HANDOFF.md first;
preserve name/art/models/films/word lists and seven ordered verification items.
Research403 never stops work. Future G04 read-only source caches are in /tmp:
G04-balderdash-source1/2.md,G04-log-metric-source.md,
G04-sklearn-metrics-source.rst. No future job is claimed by this chat yet.

Re-verify when web works: exact regional opening tie break/tied-round lead
are selected house conventions, not universally official rules. Bicycle's
old URL404 and Masters403 are optional corroboration gaps, not blockers.

Cloud setup is tested and saved as an unpublished draft. Node24/Chromium/
ffmpeg/Python baseline ready; npm cache /workspace/.npm-cache.
No services/runtime network. Managed policy still blocks file navigation;
exact standalone bytes pass setContent/offline/privacy/reduced-motion.
Phone performance is Chromium390x844 at4xCPU, not physical hardware.
