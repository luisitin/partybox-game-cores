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


Cadence correction verified from origin branch reflog: the prior successful
update was 2026-10-08T09:49:08Z and the latest was 2026-10-08T10:19:38Z,
a 30-minute30-second interval. This missed the 30-minute limit by30 seconds.
09:49:23/~10:19:45 were observation times, not successful push times.
For the next large-artifact milestone, begin staging/packing around10:40 UTC,
target successful branch push10:44:38, hard deadline10:49:38. The main claim
refresh time does not reset the branch push cadence.

## Checkpoint around10:42UTC

- `node scripts/matrix.mjs`: PASS7,000 complete games, seven settings at the
  sole valid player count2, deterministic event replay and public-view equality;
  raw matrix.stdout and exact totals/transcript in matrix.json.
- `node scripts/mutations.mjs`: first attempt FAILED assertion floor21/25;
  three other bugs produced unexpected exceptions and the undeclared-field bug
  survived. All25 TAP+baseline+stdout retained in mutation-attempt1. Explicit
  valid-zero/count, legal-input extra-field and paused-skip hold assertions were
  added. Final attempt PASS25/25 assertion kills, baseline9/9; every mutation's
  raw TAP is in mutations/, list and actual replacement in mutations.json.
- `npm run build` then `node --test --test-reporter=tap --test-concurrency=1
  tests/bots.test.mjs tests/core.test.mjs tests/draws.test.mjs tests/endgame.test.mjs
  tests/properties.test.mjs tests/chinook.test.mjs`: PASS27/27; raw
  build-optimization.stdout and optimization-core.tap. Independent exhaustive
  coordinate minimax matches all480 PVS choices/scores, and4,000 independent
  material/diagonal classifications match optimized ending windows.
- `node --cpu-prof --cpu-prof-dir=.work/profile scripts/league.mjs --games 4
  --variant international`: smoke/profile only, Strong4W0D0L13.47s. One-pass
  ending-window counts and cached ordering keys preserve the unchanged6000-node/
  5-plyStrong budget. New `node scripts/league.mjs --games 4 --variant
  international --workers 1`: Strong4W0D0L8.30s, same410plies and exact outcome
  transcriptSHA. Baseline was profiled/overlapped other work, so no controlled
  percentage speedup is claimed. Both raw outputs and CPU profile are retained.
- `G10_FRAME_NOT_BEFORE=1791455880000 node scripts/browser-check.mjs`: PASS24/24,
  raw browser-first.stdout. All strict intervals were measured in the granted
  quiet window after10:38UTC, without video: desktop600RAF60.0024FPS/p9916.8ms,
  phone4×600RAF59.9026FPS/p9916.8ms. All intervals, page hash and functional
  assertions are retained in evidence/browser; no external runtime requests.
- `node scripts/browser-check.mjs --capture`: PASS24/24 separate same-source
  functional clips; desktop and phone each~2.1MiB. Captured phone frame mean
 49.05FPS/p9983.3ms under overlapping fullleague is retained without an acceptance
  claim. The unrecorded gate remains unchanged. No gameplay/page edits or rebuild
  occurred between strict sampling and clips. CPU/browser writers are closed.
- `node scripts/league.mjs`:4,000-game required paired league launched with
  fourworkerthreads; still PENDING. Exact seeds/all inputs/final results are
  retained per shard. Balanced1,000 games per variant gives2,000 per required
  skill comparison and keeps separate pervariant advantage gates. Smoke is not
  the full strength check. International corpus and CI/PR/KEEP GOING are pending.

Observed successful branch push: origin reflog update-by-push10:45:22UTC,
headbf455bfd92333f8153715524afa7a8c1dc96a229, interval25m44s since10:19:38.
Main claim363f2b3 at10:44:17. Early target10:44:38 missed44 seconds, binding
hard10:49:38 met. Next stage/pack~11:05, targetpush11:10:22, hard11:15:22.
Fullleague PGID115703 resumed after checkpoint under parent CPUrelease.

## Source boundary and International reader around11:05UTC

- `node --test --test-reporter=tap tests/purity.test.mjs tests/data.test.mjs`:
  PASS3/3, raw purity-data.tap. The earlier regex scanner mistook the local
  draw-window callback identifier for a browser global; raw failure retained.
  AST controls permit local parameters/comments/strings/property names and reject
  actual unbound host/global operations, wall clock, unseeded random, I/O imports,
  dynamic runtime imports, locale collation and module-level mutable bindings.
  Production modules pass; host browser/worker adapters are explicit exclusions.
- `node_modules/.bin/tsc --noEmit` plus standalone esbuild of src/international.ts:
  PASS, exact stdout retained. This adds a separately callable pure constructor;
  it does not connect missing Intl outcomes into current game/Strong worker.
- `node --test --test-reporter=tap tests/international.test.mjs
  tests/purity.test.mjs`: PASS6/6, raw international-production.tap. Actual licensed
  two-piece bytes/dictionary are hash checked; every applicable complete small
  WLD matches independent fixed-point and separate wire decoder.10k2–6piece ranks
  agree across both orientations. Corrupt metadata/dictionaries and input alias
  mutations are rejected; missing material slices stay UNKNOWN.
- Current-side captures are excluded in original Intlv2<=6; opponent-only threats
  remain valid. Additional opponent exclusions begin at7pieces. This materially
  differs from the American Chinook contract. Scope and original format sources
  are explicit in INTERNATIONAL-ENDGAME-HANDOFF.md.
- G10 CI workflow/check wrapper are authored, UNRUN. Full strength league remains
  RUNNING. Full International6/default-worker integration, corpus/data regeneration,
  manual30spots, exact-head CI/PR/KEEP GOING still pending. No BLOCKED is justified.

The actual eight International2–5 files have since been acquired privately,
with every installer SHA1 and original-driver CRC matching. They are not yet
installed/probed here beyond db2, and this does not change claimed scope.
New source integrity is still pending the frozen snapshot execution below.

- `node scripts/integrity.mjs --sources`: PASS on frozen milestone6 input;
  raw integrity-milestone6.stdout. Verifies all listed checksums, schemas/
  manifest, AST source boundary and provenance/offline attributes. Explicitly
  excludes unfinished fullleague/Intl6 and final delivery execution gates.

Milestone6 successful origin-reflog push11:11:30UTC,
head8a395249999f1c159775519802b901f842c0c0b8. Previous10:45:22→11:11:30
interval26m8s, binding30-minute cadence PASS. Earlytarget11:10:22 missed68s;
hard11:15:22 met. Mainclaimc96633f at11:10:48. Next stage~11:30,
targetsuccessfulpush11:36:30, hard11:41:30. Fullleague resumed afterpush;
actualcheckpointhold start/resume are in league-pauses.json.

## Milestone7 integrated data and baseline league around11:33UTC

- `node scripts/league.mjs`: baseline PASS4,000/4,000, actual exit0. Required
  2,000 games per comparison balanced1,000 per variant; every seed/move/result
  retained. American Strong/Medium883W82D35L (score.924), Medium/Easy999W0D1L;
  International Strong/Medium928W61D11L (score.9585), Medium/Easy1000W0D0L.
  Each variant's decisive Wilson95 lower bound>.5. Wall2235.349s includes
  all actual holds in league-pauses.json. Full raw/report/shards archived under
  league-baseline-pre-international before new corpus behavior changes.
- `npm run build`: integrated strict build PASS exit0, raw
  international-integration-build.stdout. Adds actual db3–5, separate variant
  bundles and native offline deflate bootstrap. Every packed payload round-trips
  exact bytes; corpus-pack.json records raw/compressed sizes/hashes. American
  uses the original audited ZIP deflate stream. HTML80,328,131 bytes.
- `node --test --test-reporter=tap --test-concurrency=1 tests/international.test.mjs
  tests/variant-bundles.test.mjs`: PASS6/6, exit0, raw international-integrated.tap.
  Production equals all10,000 retained original C++/independent actual2–5 queries
  (all45 material tuples/180 orientations); W2441/L2228/D5331. Variant-specific
  node bundles preserve48 exact choices/reports/cursors, quiet/capture/draw-history
  cases and4 complete full-state game transcripts; budgets are unchanged.
- Original unchanged Boost C++ reproduction and independent tracked sample
  selftest: PASS10k and11/11 zero skips; exact commands/hashes/raw original
  outputs in international-original/. This is supplied2–5 theoretical WLD,
  not complete six or draw-history conversion proof.
- Newly integrated page startup/worker reuse/cancel/FPS/captures, final-source
  full leagues/matrix/mutations/npm test/CI, complete Intl6 packaging, required
  manual30 row log and KEEP GOING remain PENDING. No BLOCKED asserted.

- `node scripts/integrity.mjs --sources`: milestone7 PASS exit0, raw
  integrity-milestone7.stdout; authoritative metadata/dictionary schema, source
  checksums/pure AST and original offline attributes pass. Final execution
  gates are explicitly excluded until current game/browser proof is complete.

Milestone7 successful origin-reflog push de92e41 at11:37:15UTC.
11:11:30→11:37:15 =25m45s, binding cadence PASS; early11:36:30 missed45s,
hard11:41:30 met. Mainclaim1e94cfb at11:36:34. Next stage~11:55,
targetsuccessfulpush12:02:15, hard12:07:15. Artifact writers were frozen.

## Milestone8 native worker and scoped six-piece comparison

- `node --test --test-reporter=tap tests/worker-pack.test.mjs`: PASS2/2, exit0,
  raw worker-pack.tap; native byte identity, queued first actual input, both
  full-node Strong reports/cursors, input immutability and bootstrap failure
  status. Initial signed-zero harness failure retained in worker-pack-initial.tap.
- `node scripts/validate-international-production.mjs --data
  /tmp/g10-root-international-packaging/output/app --expected
  evidence/checks/international-original-six/international-original-reference.jsonl
  --out evidence/checks/international-production-six`: PASS10k, exit0, raw
  international-production-six.stdout/report; original/independent/production
  W2672/L2800/D4528, five real classes/20 orientations, not all37. No data installed.
- Tracked explicit `--direct-v2 --pieces 6` original reproduction PASS10k,
  identical input/transcript hashes to its first private success; original
  generic-discovery -2 control and exact commands/source hashes retained.
- `npm run build`: guarded host PASS, then inline-data host PASS, both exit0;
  guarded-host-build.stdout/inline-data-host-build.stdout. Actual build hold
 11:46:06.598953→11:47:56.140066 (~109.54s) retained in runtime-holds.json.
- `G10_BROWSER_DIR=evidence/browser-round7 G10_MEDIA_DIR=media/round7
  node scripts/browser-check.mjs --functional-only`: both earlier attempts
  failed and raw stdout retained: uppercase CSS status mismatch (harness fixed),
  then default30sec page.goto timeout. Neither is accepted browser/FPS proof.
  Inline-data current page and28-case Blob/hash/corpus/reuse/cancel checks
  are authored but PENDING. No frame gates were relaxed.

Milestone8 successful origin-reflog push2705a5f at12:05:07UTC.
11:37:15→12:05:07 =27m52s, binding30min PASS; early12:02:15 missed2m52,
hard12:07:15 met. Mainclaim327f13612:04:08. Next stage~12:23,
targetsuccessfulpush12:30:07/hard12:35:07. Source diff-check flagged original
stdout/TAP whitespace; raw evidence is retained byte-exactly, not edited.
Complete82-file acquisition subsequently verified privately, exact1,010,554,015
bytes/all37six classes; publication/memory/probe/full-page proof still pending.

## Milestone9 complete-source proof and current startup

- `G10_BROWSER_DIR=evidence/browser-round8 G10_MEDIA_DIR=media/round8
  node scripts/browser-check.mjs --functional-only`: PASS28/28, actual exit0,
  raw browser-round8-functional.stdout. Desktop disk load1741.396542ms,
  phone4×12293.732259ms. Actual Blob hashes match native-tested worker bytes;
  both corpus hits, queued startup, completed-worker reuse and cancellation
  pass. Current strict600 frames and same-source clips remain PENDING.
- Complete private International2–6 acquisition/extraction: PASS82 files,
  exact1,010,554,015 bytes/all37six classes; all installer SHA1/driver CRC match.
  Regeneration PASS82 byte-identical files and deterministic manifest. Raw
  range/extraction/regeneration/pause/size metadata is retained in
  international-complete/. The public --max-pieces6 adapter is authored UNRUN.
- Original unchanged generic Boost driver and independent reference: PASS10k
  spanning37classes/148 orientations, including22 actual >2^31 second-subslice
  queries. W2880/L3106/D4014; exact queries/raw original outputs/commands/hashes
  in international-original-complete/. Acquired source is complete; sampled
  WLD agreement does not prove every position or current game installation.
- `node scripts/validate-international-production.mjs --data
  /tmp/g10-rules-oracle-corpus/international-complete/output/app --expected
  /tmp/g10-rules-oracle-corpus/international-original-complete/international-original-reference.jsonl
  --out evidence/checks/international-production-complete`: PASS10k, exit0,
  raw international-production-complete.stdout. Input SHA256b47f0d22bbf35757eba24a34d7e0b02bbddbc6651985d43dd38c828c51908167,
  production source SHA256ad46f335d7d54fef149e38d0a2f08354bf73a3a3bd25082b9f12472381a1abbe,
  transcript SHA256eceea444e925cc58f1d8ee5be13205f9bd548a5d1d2e2201b2cd31f9013ac9f1.
  The report's fullSixPieceCoverage:false refers to unfinished game delivery;
  constructor sample inputs contain all41datafiles/156slices. Private payload
  is not installed into node game/browser; current game still2–5.
- No LFS config/upload/charges/publication. Local streamed full-six packaging
  and memory/runtime engineering remain pending, with source availability
  proved. Final current-source gameplay/matrix/leagues/CI/PR/KEEP GOING remain
  pending; no source/tool BLOCKED claim.

- Frozen milestone9 source integrity PASS, exit0, raw integrity-milestone9.stdout;
  checksums, authoritative schemas, pure AST and current offline provenance.
  Two checksum regenerations and comparison PASS before adding that raw proof;
  final checksum manifest regenerated after it. Public acquire adapter Python
  syntax PASS with ast.parse; acquisition itself explicitly UNRUN.
  Source-only git diff --check PASS, excluding retained evidence/media.

Milestone9 successful origin-reflog push642be2f at12:26:30UTC.
12:05:07→12:26:30 =21m23s, binding30min PASS; early12:30:07 and
hard12:35:07 met. Mainclaimba88113 at12:26:20. Next stage~12:46,
targetsuccessfulpush12:51:30/hard12:56:30. Current game2–5, fullsix
source/probe PASS, strict current page/complete game delivery pending.

## Milestone10 current frozen-page proof and private transport

Current642be2f game/build inputs and HTML remained unchanged through proof.
`G10_BROWSER_DIR=evidence/browser-round8 G10_MEDIA_DIR=media/round8
node scripts/browser-check.mjs`: PASS28/28, exit0; both unrecorded600 samples
retained without filtering. Desktop59.115047735FPS/p9916.8ms, phone4×
60.002592112FPS/p9916.8ms; disk loads1429.934/8956.791ms. Exact HTML
d5cb8ff59e81e7f3717dbdc3047827aac5216e6b06382429c0a4bb90864a419e,
runner6e4c520170d3e212c08185e4963bbc56a44cf38887d221b1ba66902953defed8.
PGID139168 closed/exit0 observed12:38:31–34; all browsers closed.
Same command `--capture`: PASS28/28, exit0; same-source desktop/phone
clips under10MiB, recorded frame values retained without acceptance claims.
PGID139502 closure observed12:45:07, artifacts completed12:42–43.

PRIVATE immutable encoded/block transport strict build PASS and focused
tests PASS6/6, actual exit0: all10,000 native/independent2–5 WLD outcomes
match; canonical padding, split quartets, final-short4KiB blocks, absent
bytes and input-alias mutation controls pass. Initial uniform-slice harness
assumption was false for the original kings slice; raw5/6 failure retained,
control fixed to an explicitly uniform index. Production runtime unchanged.
Exact private source/test snapshots, commands and raw TAP are archived under
experimental-transport/; these factories are not integrated/delivered APIs.

Private streamed single-page source-payload prototype PASS writer/hash:
1,380,811,379 bytes, SHA256460a2edd8f81e5146887fd4d15cd7e7490d98d15689e9f7e3db6a1fb791bd168,
all74six-piece files verified. Browser parsing/memory and actual full-six
bot use remain UNRUN. /tmp is RAM-backed; own research relocation to
/workspace disk is in progress with recursive before/after SHA inventories,
no source loss/publication/LFS config/upload. Current game remains2–5.

Next: private complete-payload startup/RSS, integrate full-six bounded immutable
reads with exact node/browser bot choices/RNG/transcripts, final game/matrix/
league/data/CI gates and KEEP GOING. No source unavailable/BLOCKED or ready claim.
Checkpointstage~12:51, earlytarget12:51:30/hard12:56:30.
