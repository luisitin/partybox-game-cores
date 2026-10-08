# Executed checks (2026-10-07T15:05:58Z)

From /workspace/partybox-game-cores, for each URL below:
`curl --silent --show-error --fail --location --max-time 20 --output
/tmp/G10-source-<index> <URL>`

- `https://www.wcdf.net/rules.htm`: curl exit 22; `curl: (22) The requested URL returned error: 403`.
- `https://www.fmjd.org/docs/Annex%201%20official%20FMJD%20rules%20of%20international%20draughts.doc`: curl exit 22; `curl: (22) The requested URL returned error: 403`.

These checks catch inability to obtain source contents; they do not verify
source rules, licences or factual claims. All candidates were denied.
The claim push succeeded. No npm test suite exists for this job yet.
Game tests, simulations, mutation testing, bot leagues, HTML validation,
performance/captures, job-specific checks and CI are UNRUN (zero game tests).

## Resume checkpoint (2026-10-08)

- Read live main README.md, RULES.md, JOBS.md and CLAIMS.md: PASS. G01 was
  refreshed by its original owner before our claim attempt, so the stale-claim
  assertion refused it without a commit. Fresh lowest eligible G10 was claimed.
- `git push origin main`: PASS, exact commit0be4588, message `claim G10`,
  claim2026-10-08T08:40:21Z codex-audit.
- Created job/G10-checkers-complete-20261008 FROM claimed main, then normal-merged
  origin/job/G10-checkers: PASS. Original research history remains reachable.
- `npm install --ignore-scripts --no-audit --no-fund`: PASS, six pinned packages
  installed in10 seconds. This verifies dependency installation only.
- Independent reference-moves.mjs was authored from rule sources and coordinate
  matrix copies without reading production movement code. No differential run
  has executed yet. Original2-source rules research is recorded in SOURCES.md.
- Types/build, gameplay/property/replay, mutations, bot leagues, tablebase,
  offline page, frame proof/captures, PR and CI: NOT RUN at this checkpoint.

- `node scripts/hashes.mjs` twice plus `cmp`: PASS, byte-identical checksum
  manifest. `sha256sum -c SHA256SUMS.txt`: PASS, all21 delivered files.
  `git diff --check`: PASS. These are source/docs integrity checks only.

## Source milestone 2026-10-08, approximately09:25UTC

- `npm run build`: PASS (strict TypeScript and all node bundles, then original
  standalone play.html including the inline bot worker). Exact raw stdout is
  evidence/checks/build.stdout. The earlier successful node-only build explicitly
  reported the browser as pending and was not standalone delivery.
- `node --test tests/reference-moves.test.mjs tests/moves.test.mjs`: PASS24/24.
  Includes10,000 independent original move comparisons plus10,000 color-rotated
  twins and every resulting board. Unmodified raw stdout is moves.stdout; it is
  Node's default reporter output, not invented TAP. Source/input hashes and
  deterministic transcript are moves-reference.json.
- `node scripts/endgames.mjs`: PASS.29,286 rows generated, complete legal one-vs-one
  man/king domains for both variants plus4,000 partial tactical3–6 entries.
  Regeneration followed by `cmp data/endgames.json /tmp/g10-endgames-baseline.json`:
  PASS, byte-identical. This does not certify broader full-six-piece coverage.
- `node --test --test-reporter=tap tests/endgame-reference.test.mjs`: PASS3/3;
  unmodified TAP retained in endgame-reference.tap. Independent coordinate oracle
  plus synchronous fixed-point WDL and regenerated-edge certificates fully close
  both one-vs-one domains and two6-piece forced-capture roots. These reference
  self-checks do not yet compare production probes to all independent entries.
- Full contract/properties/matrix, mutations, leagues, production table comparison,
  fixture/schema checks, disk browser/frames/clips, PR and exact-head CI: UNRUN.
- Every executed command/result/input hash is also recorded in milestone2.json.

- Milestone checksum regeneration twice and comparison: PASS47 files; all47
  SHA256 checks pass. `git diff --check`: PASS after trimming one extra EOF line.

## Source-only checkpoint around09:50UTC

Schema/fixture generation, all9 contract cases, official draw replay, production
endgame differential,1/2/3+1,000 random seed properties,7,000-game settings matrix
and paired2,000-game-per-comparison/per-variant league scripts are authored but
UNRUN. Strict source builds after these edits are pending the shared CPU release.
The original weighted-combination Chinook reader and separately authored reference
reader are UNRUN and disconnected from the game. Corpus index/permission facts
are live-read research; corpus correctness and broad probe coverage are not yet
accepted. Source/checksum checks do not substitute for these obligations.

## American corpus integration around10:15UTC

- `npm run build`: PASS strict TS/node and full-corpus offline67MiB HTML;
  raw build-full-corpus.stdout. Human host omits unused large data; Strong worker
  and shared immutable node endgame module include it. Browser proof UNRUN.
- `python3 scripts/acquire-chinook.py --out /tmp/g10-chinook-acquisition`: PASS
  original archive/member hashes/all2–6 material tuples; raw acquisition.stdout.
  Separate acknowledgement/no-sale terms and provenance are attached.
- Private input `G10_CHINOOK_BYTES=/tmp/g10-rules-oracle-corpus/chinook-DB6
  G10_CHINOOK_INDEX=/tmp/g10-rules-oracle-corpus/chinook-DB6.idx node --test
  --test-reporter=tap tests/chinook.test.mjs`: initial metadata check FAILED on a
  legitimate slice end at a block boundary, raw chinook-production.tap retained.
  Corrected boundary check preserving positive extent; PASS4/4, raw
  chinook-production-fixed.tap. Includes10k independent ranks/decodes, complete
  capture-free2-piece WDL, hostile metadata, immutable input snapshot and30spots.
- `node --test --test-reporter=tap tests/core.test.mjs tests/draws.test.mjs
  tests/endgame.test.mjs tests/properties.test.mjs tests/data.test.mjs
  tests/chinook-reference.test.mjs`: PASS27/27, core-property.tap (before corpus/PVS).
- `node --test --test-reporter=tap --test-concurrency=1 tests/core.test.mjs
  tests/draws.test.mjs tests/endgame.test.mjs tests/properties.test.mjs
  tests/chinook.test.mjs`: current full-corpus/PVS PASS25/25, full-corpus-core.tap.
  Covers all9 contract cases, official replay,1/2/3+1,000 recorded random seeds.
- `node scripts/league.mjs --games 8 --variant american`: smoke only. Before
  PVS/history-aware cache, Strong8W0D0L14.26s; after, Strong7W1D0L5.08s over identical
  paired seeds. Medium8W0D0L0.17s. Both raw stdout files retained; this does not
  replace2,000-game strength leagues. Original C corroboration is in BOTS/SOURCES.
- Full International corpus/unresolved threats, matrix/leagues/mutations/browser,
  PR/CI/KEEP GOING still pending. Unknown-distance WDL is strategic guidance,
  not proof against accumulated repetition/move-count draw history.
