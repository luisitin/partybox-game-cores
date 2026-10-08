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

Milestone10 successful origin-reflog push1abfdfa at12:52:27UTC.
12:26:30→12:52:27 =25m57s, binding30min PASS; early12:51:30 missed57s,
hard12:56:30 met. Mainclaimb8c59be at12:52:19. Next stage~13:12,
targetsuccessfulpush13:17:27/hard13:22:27. Source/proof game remains2–5.

## Milestone11 complete-source transport and disk startup

Private `.work/api-validate-full.mjs --transport blocks --out
.work/api-evidence/full-blocks`: PASS10,000, actual exit0/4.799803s.
All37six classes/148orientations/22second-subslice native+independent queries
match; one deterministic missing-block retry loads6826original4KiB blocks,
27,950,054 bytes. Unknown bytes are never accepted as a synthetic WLD.
Same adapter `--transport encoded --out .work/api-evidence/full-encoded`:
PASS10,000, exit0/23.937574s; all41datafiles/156slices,1,006,478,762bytes
through immutable encoded source, identical theoretical WLD transcript
eceea444e925cc58f1d8ee5be13205f9bd548a5d1d2e2201b2cd31f9013ac9f1.
Private source832f0dc95b0d8ac14e61af29914796df3128856c1617dbd8c8c24d20319b21ce
is archived with exact adapter/raw outputs in experimental-transport/.
These APIs are NOT integrated into the current game, still2–5.

Private full-payload browser baseline: desktop PASS80.772sDOMContentLoaded,
peak summed ownedRSS3,667,918,848B; phone4× FAIL unchanged300,000ms load
timeout (300.786s withclosure), peak3,440,832,512B. EXIT1/runnerclosed
13:01:27.945, all raw reports/errors retained under stream-prototype/baseline.
Private1MiB-tag representation: writer PASS1,381,347,661B SHA256
a2511da2c6b728d7b1011a4f411d3fb0f9344c752184c4c72cf955a9e6d567c5;
same current d5cb base and original corpus hashes,1293parts/74files.
Browser PASS desktop27.082sDOMContentLoaded/peak4,040,486,912B and phone4×
89.455s/peak3,325,009,920B. All part extents and214first/middle/final
original4KiB windows match; zero runtimeHTTP/page errors, EXIT0.
Actual closure13:11:49.900; every ownedgroup closed. Observed separate
runs/other root activity are not a controlled causal percentage claim.
This proves complete source payload parsing/byte access, not Strong game
integration or frame acceptance. Both private scripts/exact raw are archived.

Own scratch relocation PASS529files/720items, recursive inventory byte/hash
identity; actual closed12:51:40.295. The old /tmp path is a canonical symlink
to /workspace disk; source data deleted only after verifiedcopy. Raw inventory
proof is under private-scratch-relocation/. No causal FPSclaim, LFS config,
charges/upload/publication or source-unavailable BLOCKED assertion.

Next concrete implementation: licensed six-piece files as bounded ordinary
Git chunks and immutable encoded Node modules; shared pure probe dependency
for actual browser worker; bounded originalblock messages with same-request
RNG restart until zero-missing. Full actual game/final-source properties,
7k matrix/4k leagues/data/CI/PR/KEEP GOING remain pending.
Checkpoint earlytarget13:17:27/hard13:22:27; pending gates remain explicit.

## Milestone12 complete installed Node source (2026-10-08 around13:40UTC)

`G10_BUILD_NODE_ONLY=1 npm run build`: PASS/exit0, strict TypeScript and
complete Node/variant bundles. General/International default database now
contains all41 original two-to-six files; immutable six-piece encoded modules
are external static local ESM, with no runtime game I/O. Actual default bot/core
source equivalence, final-source properties/strength and browser delivery pending.
Standalone HTML deliberately remains the previously proven2–5 baseline.
`node --test tests/international-transport.test.mjs`: PASS6/6, exit0,
2898.134611ms; native/independent10k2–5 outcomes, missing-block retries,
canonical encoding/padding, immutable snapshots and final-short blocks pass.
Raw stdout and exact command/input hashes are under international-six-install/.

`python3 scripts/chunk-international.py` run twice from original source:
PASS37 classes/61 chunks/971,393,762 original data bytes; complete99 raw/index/
manifest outputs plus both generated TS descriptors byte-identical. Manifest
SHA2566532df5af4306b1b6b16723155b756faacef549bcc8292ccbf0e7663a707a28c.
No original data byte changed. Every chunk <=25,165,824B, under ordinaryGit's
single-blob limit; licensing/provenance follows the original author's unrestricted
International data statement. The source-public regeneration script separately
ran twice fresh, all82 files byte-identical; exact input/output proof retained.
The streamed checksum generator avoids simultaneously loading the whole corpus.

Observed prior successful origin update0fba17313:19:04 follows1abfdfa12:52:27
by26m37s; binding30min PASS. Early13:17:27 missed97s, hard13:22:27 met.
Current target13:44:04/hard13:49:04; proof-pending scopes remain explicit.
Full browser integration/pagebot use/FPS, final-source7k/4k gates, exactheadCI,
PR/KEEP GOING remain unfinished. No full-six game ready or sourceBLOCKED claim.

## Milestone13 actual full-six offline host (proof still in progress)

Complete browser-only strict build PASS/exit0. The private full single page
is1,390,845,425B SHA2562f5ca1335b8fca10b2eaa348da3553ca7ef5d682b78c91a2c114f6c2e2a96a6b;
41 original source files appear in1304 inert <=1MiB encoded tags. The real
International worker carries all index metadata plus the native dictionary,
requests original4KiB blocks from bounded DOM reads, and restarts each incomplete
pure search from the original request/random cursor. No partial result/cursor
is accepted. Batches contain <=16 blocks; pause/setup/state changes cancel stale
reads and worker replies. The host cache is bounded at32768 original blocks.

Actual full-game `browser-check.mjs --functional-only`: PASS30/30/exit0,
all15 controls in each desktop1920x1080 and phone390x844/CDP4x profile. Both
American/International Strong corpus use, genuine6piece block reads, worker
startup/reuse/cancellation, forced captures/promotions, draw/timer/results,
hostile IDs and viewport checks pass. Actual disk loads24.460753s/99.217193s;
zero HTTP requests/page errors. Processes149416/149443 closed13:58:52–13:59:03,
only defunct children remained. Frame gates are not measured in this run.
Full payload uses an explicit300s loading allowance informed by prior measured
89.455s phone parsing;600 raw frame/59FPS/p99<=17ms gates remain unchanged.
Exact current build inputs/raw output and workers are in
international-full-browser-build/ and browser-full-six-functional/.

Public default10k/all37/148 native/reference verification,48 exact block/full
transactions and three complete-game controls are independently authored but
UNRUN at the global G05 quiet hold. Full host strict600 source-matched frames,
clips, final-source matrix/leagues, CI/PR and KEEP GOING remain pending.
No LFS configuration/upload/charges or complete full-page publication occurred.
The public tracked page remains earlier2–5 baseline until delivery engineering
and real full-source acceptance are complete; current source rebuilds full page.

Successful prior source milestonec4a065113:44:43 follows0fba17313:19:04 by
25m39s: binding30min PASS, early13:44:04 missed39s/hard13:49:04 met.
Mainclaim333af6a refreshed13:42:07. Next target14:09:43/hard14:14:43.

## Milestone14 full default proof and retained strict failure

Actual public default10,000 native/reference probes PASS all37 canonical
classes/148orientations,22 second-subslice and3817 opponent-only threats;
41 files/156 slices/1,006,478,762 bytes W2880/L3106/D4014. Forty-eight
predeclared full/block transactions match EVERY SearchReport field/random
cursor; three complete core games match every decision/transcript (1/84/1plies).
Initial group150628 exit1 retained: three gates PASS, one draw assertion treated
JavaScript -0 as unequal to0. Corrected TEST ONLY numeric-zero comparison,
focused Strong/history exit0 PASS1/1; no production change or passed-gate rerun.
Combined proof verifies identical production/reference/corpus hashes; original
source/raw failure and focused raw TAP are retained. Thirty explicit reviewed
native/reference/default entries span30 material classes; agent review is
labelled accurately rather than a hand-solved proof. Initial maxRSS4,613,536KiB
(~4.40GiB), focused3,247,600KiB; four worker CI resource fit is pending.

Actual frozen full2f5ca133 desktop strict600: FAIL56.517642829973816FPS,
p9933.3ms, capturing=false. All600 original intervals written before assertion;
closed14:17:04.647 after actual root grant14:16:53. Phone NOT RUN. Coordinator/
Chromium closed, no acceptance or cause inferred. Readback delayed by transient
exec transport failure; read access recovered14:18. All raw/failure/grant files
preserved under browser-full-six-round1/. No unchanged acceptance retry.

NONgating CDP CPU/layout/GC diagnostic152111 on the SAME full2f page closed
14:25:11.231/exit0: load14.240s,600 instrumented intervals59.605FPS/p9916.8ms.
These profiled values are NOT acceptance. Layout0s/style0.145444s/script0.213273s/
task1.395895s; sampledidle9.507s/program1.163s/renderfunctionself43.53ms/GC23.11ms.
No dominant cause established for the independent strict failure. Actual trace,
CPUprofile, source diagnostic script/raw outputs/provenance are retained.
Private static-JSON representation authoring is UNRUN at public writer freeze;
source/budgets/defensive APIs are unchanged. Full new host/frame/source gates,
current matrix/league/CI, artifact publication and PR/KEEP GOING remain pending.

Prior successful branch9d66f7d14:10:17 followsc4a065113:44:43 by25m34s,
binding30min PASS, early14:09:43 missed34s/hard14:14:43 met. Mainclaim0e402bc
row14:09:47; prior333af6a claim row was13:42:07 (earlier prose13:42:05 was a
2-second observation error, corrected below). Next target14:35:17/hard14:40:17.

## Milestone15 early Human play and compact Node proof

`G10_BUILD_BROWSER_ONLY=1 G10_HTML_OUT=.work/play-full-early.html npm run
build`: strict TypeScript/browser-only complete source build PASS/exit0.
`node .work/check-early-human.mjs`: actual file navigation PASS/exit0,
closed14:47:39.333. Exact new page SHA256
edc476ee9a9bb9b3acbd3ff0efd631814f079a1f6a29cd88a1c188f6b17ca101,
1,390,845,907B. Desktop commit16.519ms/usablecontrols776.247ms/firstlegal
American1901.707ms/International2549.828ms, fullparse22574.090ms.
Phone390x844/CDP4× commit18.882ms/controls2397.731ms/firstAmerican9127.998ms/
International12116.363ms, fullparse103649.574ms. Both legal turns happened
while document.readyState was loading. Strong/Medium selections disabled Start
and direct start calls rejected premature bot games; no worker/RNG consumption.
After all original bytes parsed the same controls enabled bots and cleared
the loading notice. Zero HTTP requests/page errors. Exact executed script,
build/test raw stdout and report are under early-human-start/. This proves
usable early human turns and bot gating, not frame-rate acceptance.

Private static-JSON representation experiment: unchanged61 base64 literals
as JSON primitives with tiny native module wrappers; all four compiled game/
search modules remain byte-identical. Both original and JSON import+10k runs
match the actual native/reference/default transcript on every case/all37six
classes/148 orientations. All48 serialized move reports/cursors/missing-block
retry/count/byte totals and3 complete1/84/1-ply games exactly match, including
every intermediate board and independent legal transitions. Actual runtime
Node24.19.0 only. Original10k import25.1168s/maxRSS3,246,584KiB, JSON26.1439s/
1,969,664KiB; JSON48/3 maxRSS2,860,060KiB. Separate sequential runs have
uncontrolled cache/shared CPU conditions: less observed memory, no speed or
browser FPS claim. Scripts/raw/manifests/reports are in
international-default-full/memory-json/. Node22.16 compatibility and actual
build integration remain pending. No search budget/defensive API change.

Prior observed successful origin update812f24714:35:25 follows9d66f7d14:10:17
by25m08s: binding30min PASS, early14:35:17 missed8s/hard14:40:17 met.
Mainclaim17a8b9a row14:35:07. Next early15:00:25/hard15:05:25. Current full
source frame/phone/clips, matrix/strength/mutations/CI30min/publication/PR/
KEEP GOING remain pending. Retained earlier full-page strictFAIL is unchanged.

New early-human exactedc476ee strict desktop attempt PGID155263: FAIL/exit1,
closed14:57:35.176 after directrootgrant14:57:24. All15 desktop control
checks PASS, all600unfiltered samples retained before assertion. Mean
57.23632133004988FPS/p9933.4ms, capturing=false; phone NOT RUN. No cause
established or unchanged retry. Raw/failure/ready/grant/closed/execution
are under browser-full-six-early-human/. Early-human standalone actual-file
desktop+phone move proof remains separate and passed.
