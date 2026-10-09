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

## Milestone16 Node22 compatible data and final core checks

The proved static JSON containers are now actual Node build output.
`G10_BUILD_NODE_ONLY=1 npm run build`: PASS/exit0; all61 original base64
values use native JSON wrappers, game/search module bytes unchanged. Actual
Node22.16 import10k and full48 reports/cursors/blocktotals/3 games PASS;
source/raw/version/official binary digest are retained under memory-json/node22/.
Import-only peak3,476,396KiB is not a whole-pipeline memory guarantee.

The original nine core callbacks were moved unchanged into core-cases.mjs.
A normalized exact body hash verifies no assertion/import/order was removed.
PinnedNode22 `--test --test-reporter=tap tests/core.test.mjs`: PASS9/9,
25.505s/maxRSS3,365,680KiB. `node scripts/mutations.mjs` uses every callback
on the baseline and each of25 actual sequential source mutant modules sharing
the actual immutable endgame module. PASS25/25 assertion kills,234 callbacks
executed,51.112s/maxRSS2,837,100KiB; no synthetic kill or skipped case.
All raw actual case/error JSON,stdout/resources/body proof are under
mutations-shared-harness/ and current-full-node/. An attempted `/usr/bin/time`
command exit127 is retained; the working resource wrapper uses Python's actual
child resource counters. No source/tool BLOCKED assertion follows.

PinnedNode22 shared-process `--test --experimental-test-isolation=none
--test-reporter=tap --test-concurrency=1 tests/*.test.mjs`: initial90/91PASS,
exit1 in181.355s/maxRSS4,514,896KiB. This whole-suite peak exceeds import-only
measurements. The sole failure was an old expectation that the now-installed
four-piece Kingsrow quiet DRAW was unknown. TEST ONLY correction adds an
independent original db4/dictionary reference plus explicit absent-corpus and
both-variant7piece UNKNOWN controls. Focused `--test-name-pattern='six-piece
full jumps and installed quiet draws' tests/endgame.test.mjs`: PASS1/1/exit0,
32.269s, with exact unchanged four production module hashes. Combined current
91-case proof retains the original failure/source/TAP and focused TAP; passed
unchanged cases were not rerun. All native10k/48/3, property/movement/draw tests
and actual full workerpack passed in the initial run. Public raw/summary are
under current-full-unit/. npm test adopts shared-process unit execution and
checks the exact rebuilt private page path, preserving the tracked baseline.

Unchanged variant-bundle proof on pinnedNode22: PASS24 paired positions/skills
(48 actual searches), four complete games51/47/59/85plies,53.991s/maximum child
RSS2,948,760KiB. Exact reports/cursors/intermediate states/game hashes and
pre/post source/import hashes are retained under variant-node22/.
Private2Intl+2American sequential-prewarm pool PASS16 actual terminal games,
whole-process maxRSS4,620,060KiB; this supports bounded pooling, not completed
4000-game strength or a CI memory guarantee. Source pool adoption is next.

Two full-source desktop strict failures remain retained; phone NOT RUN in
both. Early Human actual-file desktop/phone turns remain PASS. The private
unchanged template-fragment payload experiment is RUNNING and has no claimed
frame/startup gain. Full final7k/4k/frame/phone/clips/CI30min/publication/PR/
KEEP GOING remain pending. Previous successful7fcb56b14:59:33 follows812f247
14:35:25 by24m08s, cadence PASS; current early15:24:33/hard15:29:33.

Private template-fragment byte/control test CLOSED15:24:37.999/PASS/exit0:
all2647 predeclared original4KiB windows per profile at every encoded-part
boundary/first/middle/final across all41 datafiles agree with installed
original bytes. Actual desktop and phone4× early human turns/bot gates and
genuine6pieceStrong45corpus-hits/26originalblocks PASS; same move/report/
cursor in both profiles. Actual fullparse20.527s/129.726s under mixed activity,
not a controlled speed comparison. Private pagef91e333e/1,390,846,045B and
exact transformation/check scripts/raw/window hashes are retained under
template-fragment-private/. Production browser/source template remains unchanged.
Matched runtime cost/FPS investigation remains pending; no improvement claim.

## Milestone17 dedicated pool and measured private browser costs

PinnedNode22 actual dedicated2International+2American pool: sixteen terminal
games PASS/exit0, closed15:35:32.911711Z, wrapper91.019671s, maxRSS5,341,180KiB.
The complete-record comparison against the original archived sixteen games
PASS: all seeds/skills/every move/results/plies/final boards unchanged. No new
cursor observation was invented; exact variant-cursor proof remains separate.
Runner allocation/import readiness changed, original game bodies and all
gameplay/search budgets remain unchanged. Raw report/stdout/records/resources/
exact sources/comparison are under league-dedicated-pool-pilot/. This larger
measured peak replaces smaller pilot figures for planning. Final4000 strength
and CI30-minute fit remain pending; actual Strong cost profiling is next.

Private matched DocumentFragment diagnostic: A+B exit0, finalclose15:44:13.191Z,
no pause/interruption. All1306 payload tags/1,378,509,420 encoded bytes, workers
and metadata identical; only the92-byte asset lookup insertion differs in
executable host. Live document nodes4282→366, B fragment retains3920nodes.
LayoutDuration0 both; style0.180986→0.141852s, script0.211812→0.175014s,
TaskDuration1.098059→1.195389s, sampledGC35.298→52.334ms. Instrumented600-frame
means59.506→58.539FPS, p9916.8both are diagnostic, not acceptance. Owned RSS
sum peaks3,942,140/3,919,100KiB can double-count shared pages. Load26.876/19.855s
has uncontrolled order/cache. No clear frame/cost gain, no causal claim and no
production adoption. All raw traces/profiles/frames/resource/identity/source
receipts are under template-fragment-cost-private/. Production browser source
and both retained strict failures remain unchanged; phone strict NOTRUN.

Prior successful35fa869 at15:28:19 follows7fcb56b14:59:33 by28m46s: binding
30min PASS, early15:24:33 missed3m46s/hard15:29:33 met. Nexttarget15:53:19/
hard15:58:19. Full final4000/7000/frame/phone/clips/CI/publication/PR/KEEP GOING
remain pending. Complete licensed sources are available; no BLOCKED claim.

## Milestone18 full browser pair and current7000 matrix

Actual pinnedNode22 matrix PASS7000 terminal games/seven configs×1000,
exit0 closed15:55:58.724118Z,119.987395652s/maxRSS2,823,640KiB/no holds.
All seeded replay/immutability/privacy/phase/pause/result/state-bound assertions
remain intact. Raw/script/input hashes/resources are under matrix-current-full/.
Four exact Strong pilot games CPU profile passed unchanged raw records:
positionKey2.152s self, legalMoves2.019s self/2.835s inclusive, nextPosition1.531s,
GC1.153s. This supports investigating pure local reuse, not a performance claim.
Allraw/script/positions/resources/hash guards under strong-cost-profile-private/.
Private stage1 legalMoves memo remains RUNNING/unadopted; exact48reports/cursors/
block totals/3games/pilot checks are pending. Actual confirmed pure-group hold
16:09:57.393002→16:13:53.397179 is236.004177s, retained in derived timing.

Guarded host private actual-file diagnostic PASS: all selected/cancelled DOM,
labels and game states identical. Two hundred cycles emitAmerican16400→2800
andInternational24400→4000 mutations. No runtime/FPS cause assumed. Only equal
hidden/disabled/aria-label writes were guarded in production; strictTypeScript/
ordinarybrowser build PASS and exactly reproduced private candidate5ed2173b
(1390845993B). All original payload/worker/licence/template suffix bytes match.
Raw/script/source snapshots/resources are under guarded-host-mutations/.

Current actual full-page strict runner PASS/exit0:30functionals,600unfiltered
frames eachdesktop1920×1080 andphone390×844 at4×CPU. Desktop59.8037837854FPS/
p9916.8ms closed16:05:12.459Z; phone59.5070082395FPS/p9916.8ms closed16:12:12.090Z.
No video during gating. Zero HTTP/page errors; actual full original Strong
worker/data checks included. Exact frozen source5ed2173b/input hashes and all
1200raw/ready/grant/closed receipts are under browser-full-six-guarded/.
Wholewrapper580.996829s includes coordinator waiting, not projected CI duration.
Previous failed attempts remain retained; no controlled causal gain claim.
Separate same-source clips, current4000strength, CI30-minute fit/currentheadgreen,
complete-page publication/PR/KEEP GOING remain pending. Trackedplay.html still
contains accepted earlier2–5baseline; full standalone is private pending actual
download publication. Complete licensed sources exist, no BLOCKED claim.

Successful396da2515:51:42 follows35fa86915:28:19 by23m23s, bindingcadence PASS,
early15:53:19/hard15:58:19 met; mainclaim897fc42 row15:51:30Z. Currenttarget
16:16:42/hard16:21:42. Source/runtime stays frozen through this checkpoint;
pending private memo will not be represented as current game validation.

## Milestone19 resumed acceptance scope and actual capture

Recovered session inspected all processes at16:38:32UTC; no live G10/child Node/browser processes remained. Binding rootREADME/RULES/JOBS/NEXT and current environment/network policy were re-read. The installed complete licensed sources remain available.

Correction: archived browser-full-six-guarded accepted600 consecutive American-board frames per desktop/phone profile. The old runner called newTable() with its default American variant before sampling. International functionals and original-six Strong lookup passed, but International RAF acceptance was not measured. Current browser-check now defaults to both variants600 each/profile; explicit --international-frames-only supports completing the missing local scope without repeating unchanged American acceptance. Independent final integrity verifies four raw arrays, positive finite intervals, dimensions/CPU/source/variant, recomputed means/p99 and unchanged59FPS/17ms gates. Current node --check scripts/browser-check.mjs and scripts/integrity.mjs PASS. New International attempt remains pending; no accepted2400frame claim.

Actual separate same-source recording node scripts/browser-check.mjs --capture closed16:25:35.070200Z/exit0, all30functionals/zero HTTP/page errors. Original desktop3647426B SHA76692afd00b77f73347d847fd2e22b819489b6586108318711d2a011227b9b71,39.84s; phone3199005B SHAc9a996f44ac3b7bed70a70523e1a531b48e8a8b18860976ecb82ba4af09d1a6e,159.72s. These full recordings and recorded raw frames/resources/actual runner are preserved under browser-full-six-guarded-capture/. Recorded phone50.994FPS/p9983.3ms is diagnostic, not acceptance.10-second re-encoded actual final gameplay excerpts and exactffmpeg commands/hashes/probes are recorded in excerpts.json/media/milestone-19; no extra recording was attempted. These clips contain American gameplay; International-specific capture remains pending.

Private four-International pool trial finished16:35:33.488821Z/exit0 onNode22.16.0 with eight exact complete game records byte-identical to archived public-pool gold and all inputs unchanged. ActualmaxRSS8421232KiB (>8GiB) disproves nominal7GiB memory fit of this allocation. Raw94.727s instrumented probe /99.959s wrapper timings are not projected4k strength performance. No public pool adoption; public2Intl+2American remains unchanged. Current4000games/current91combinedPASS/CI≤30minutes remain pending. Private legal-move memo exact proof passed but only2.3% uncontrolled diagnostic improvement; rejected, bot source unchanged.

Prepared read-only Actions standalone upload step and source/checkout/SHA receipt are recovered. The complete1.39GB HTML cannot be a normal Git blob. Actual upload/quota/download is not yet proved; the seven-day Actions artifact is not a durableRelease. No extra credentials, login, LFS or billing setup was invented. node --check scripts/standalone-receipt.mjs PASS.

Last public3143dec successfulpush16:17:05; current nexttarget16:42:05/hard16:47:05. Subsequent checkpoint time is read from actual remote reflog and not backdated.

## Current scope failure, diagnostic and capacity correction

Exact page5ed2173b International-only actual strict desktop600frames FAILED17.510456661036FPS/p99799.9ms/max1683.3ms. All600 positive unfiltered intervals independentlyrecomputed; all15desktopfunctionalsPASS, phoneNOTRUN. Rootactualgrant16:47:55.497; rawclosed16:48:30.901/runnerclosed16:48:31.045517exit1. Ready/grant/closed/raw/failure/error/runner/resources/checksums are under browser-full-six-international-failed/. Root reported allheavyZERO/nochild during coordinated sample; no failure cause inferred and no unchanged acceptance retry.

A bounded nativecost diagnostic on identical actualfullpage5ed PASS800matched200cycle A/B/A/B batches, complete state/draft/selected/cancelled DOM/accessibility equivalence, sourcebefore/afteridentical, zeroHTTP/errors. Forcedstyle/layout elapsedAmerican378.4/222.3ms vsInternational280.9/334.3ms; nativeTask505.677/248.842ms vs319.585/369.945ms. International initiallegal9 vsAmerican7, mutations4000vs2800. These synchronousinstrumentedbatches do not reproduce/explain17.510RAF failure or establishcausality/speed. Actual33.6795swrapper closed16:53:04.999exit0; allrawtraces/CPUprofiles/snapshots/script/resources under international-cost-private/. A separatelyprepared200RAFprefixGC diagnostic remains non-gating and not an acceptance retry; no productionhostcandidateadopted.

Live official GitHub runner source additionally read/pinned atgithub/docs ca64eb3491bce1212c3d3dddbbb8af2d494b6df3: PUBLICubuntu-latest advertised4CPU/16GB/14GBdisk. Actualrepository metadata confirmedprivatefalse/public. Historical nominal7GiB capacity was an overlyconservative assumption; actual4Intl8,421,232KiB trial excludes7GiB, not this advertised16GB runner. The advertised spec is not actualCI measurement/fit. Publicpool staysunchanged until exactprivatephasepilot/current4000 acceptance. Nativeworkflow observedresources/time/disk andactualartifact upload stillpending. Metadata/URL/pin/interpretation are in official-runner-scope.json.

Child current91 singleprocess pinnedNode22.16 retryinitial4.5GiB private resourcecap terminated16:59:06.504 with89completedPASS/noassertedfailures/twoincomplete/no finalTAPsummary. Actualsampledpeakwithmonitor4,753,492KiB(~4.533GiB), rawovershootretained. This artificialhostresourcecap was too tight; not a gameassertion failure or91PASS. Both127gameinput/213moduleguardsunchanged. Originalresourcewrapperwasterminatedanditsgetrusage outputunavailable; sampledactualreceipt explicit. Source/assertions/nativeVM10sunchanged6GiBprivatebudgetretry started17:04:27.143, currentpending; allpriorfailure/raw preserved.

Successful8586b59 push16:43:38 follows3143dec16:17:05 by26m33s: hard30minPASS, early16:42:05miss93s. Main7851b7b ownrow16:43:23 preservedothers. Currenttarget17:08:38/hard17:13:38. Rootquiet17:00:01throughRELEASE17:03:17 preserved; no liveownchild/CPU/writers duringactualG09desktop/phone gates.

Current91 SAME SOURCE/ASSERTIONS/pinnedNode22.16 single-process finalretryPASS91/0FAIL/0CANCEL/0SKIP/0TODO. Exact18testfile command in current91-resumed-6g/resource.json and invocation.json; wrapperclosed17:08:03.355877exit0,216.132850422s/maxRSS4595816KiB(4.382912GiB). NativeVM10stimeout controls andallcurrentassertions unchanged; noholds/signals/capfired. Both127gameinputs(16pureTS/111data) and213src/dist/tests/scriptmodulehashguards before/afterUNCHANGED. Finalclosure17:09:18.822UTC bothPGIDsabsent/browsernone/live0. AllrawTAP/stderr/results/native/sample/resources/guards/proofJSON retained. This qualifies actualfullcurrent91, not prior90+focused1 inference; initial4.5capincomplete remains under current91-cap-incomplete/.

Checkpoint recovery on 2026-10-08: the 17:41:04 UTC hard branch-push deadline was missed during context recovery (first recovered clock 17:42:09). The private 4,000-game phase trial remains running, public scheduling is unchanged, and concrete host-validator gaps remain pending. Non-gating 200-frame native diagnostics and the independently verified 16-game phase pilot are archived; neither is current acceptance proof.

Host evidence acceptance repair: independent inventory requires exactly 15 literal passing named checks for each of desktop/phone, explicit no-error/no-HTTP receipts, current start/end guards for all 127 game/data inputs plus host/build/license files, distinct strict/capture UUIDs and exact raw/report source/run identities. Native 601 timestamps bind every one of 600 unfiltered intervals. Captures preserve full originals and require actual nonempty under-10-MiB VP8 WebM files, exact bytes/SHA, full decode, matching dimensions and 8–12 seconds/200–300 frames. Capture-only final footage uses actual International hot-seat legal moves, with no waits added to acceptance frames. Two actual component runs passed 7 scoped positives and 71 rejected corruptions; current sources/second resource receipt are archived in browser-evidence-controls-current. Historical American-only reports are rejected as current acceptance. Current full four-variant browser proof and hosted CI remain pending; pure game/bot/data inputs are unchanged.

## Recovered complete strength and current host controls

At19:10UTC re-read rootREADME/RULES/JOBS and current cloud runtime/network policy; no live G10 Node/browser groups survived. Current source/bot/data/gameHTML bytes remain unchanged.

Actual pinnedNode22 command `.work/memory-json-private/node22/runtime/bin/node .work/league-phase-private/league.mjs` closed18:17:33.426973UTC exit0. Complete4,000 games/80 raw files PASS all four per-variant strength gates; exact outcomes and Wilson intervals are in BOTS.md and evidence/checks/league-phase-full. Resources: peak12,215,940KiB; wall2,827.687185809s includes actual pure-group holds123.651235438+251.960431448+361.677684562=737.289351448s. Excluding only those holds leaves2,090.397834361s >30minutes; no CI-fit inference. Public league adopts private proven four-worker sequential phases only after completion. Path-normalized private/public runners are exactly equal; original worker game body, policy, search budget and all127 inputs are unchanged.

Command `python3 .work/league-phase-full/audit/recovered-record-audit.py` PASS19:12:04.127UTC: streamed127 current-byte hashes, bot hash, all80 files/4,000 record identities, exactly0..999 indices per group, paired original seeds/skills/seats, complete legal-input structure/ply counts, final board shape/piece bounds, recomputed wins/draws/losses/score shares/Wilson95 intervals/move totals/max/transcript hashes. This is an independent record/summary consistency reader, not an independent bot-search replay. Script and receipt are archived in evidence/checks/league-phase-full/audit.

Actual pinnedNode22 `scripts/browser-evidence-controls.mjs` closed18:17:11.991497UTC exit0 in21.349s/maxRSS102,832KiB.14 scoped positives and127 meaningful rejected corruptions, including actual diagnostic active-board endpoints; current sourceGuards all rehashed unchanged after restart. Commands `node --check scripts/browser-check.mjs`, `node --check scripts/browser-evidence.mjs`, `node --check scripts/browser-evidence-controls.mjs`, `node --check scripts/league.mjs` PASS. Final captures/native frames and exact30-minute full CI remain pending. Host source finalization guards now run inside protected failure serialization; endpoint checks preserve full active no-timer human state before/after all600 unfiltered native intervals. No new frame acceptance attempt, source-speed claim, player gain or KEEP round is inferred. Historical17.510FPS International failure remains retained.

Push cadence after18:01:17 was interrupted by workspace restart, first recovered clock19:10:08; hard18:31:17 missed. The next actual branch push receipt resets cadence; main claim time alone does not.

Recovery `node scripts/hashes.mjs` then `node scripts/integrity.mjs --sources` PASS:1,281 checksums, authoritative schemas/manifest, pure core source, original corpus provenance and tracked offline baseline page. This source-only command explicitly excludes all execution delivery gates and checks the tracked older2–5 play.html, never acceptance of the private full-six HTML.

## Private key and complete-workflow partition checkpoint

Private `.work/key-loop-private/prepare.mjs`/`key-bench.mjs` PASS14,004 exact key/immutability cases. Component ABBA280,000calls perbatch: original457.968/404.403ms versus candidate148.035/129.751ms. Actual pinnedNode22 `.work/key-loop-private/full-equivalence.mjs` closed19:24:33.616491 exit0,129.524s/peak3,292,600KiB: all48 exact reports/cursors/block retries and3 complete games PASS. Actual `.work/key-loop-private/pilot.mjs` native ABBA closed19:29:52.226412 exit0,90.076s/peak3,231,688KiB, all32 complete original/candidate game records exactly match gold/source guards unchanged. AggregateInternational candidate28.02277s versusoriginal27.63663s; American candidate4.42733 versusoriginal3.92844s. No whole-game/FPS/CI improvement established; public key/bot/game/data unchanged. Root independently inspected fingerprint/diff and all proof scopes.

Host-only one-workflow partition retains every original check and adds current-stage/run/source/test/bundle/page/command receipts. Workflow YAML structure and `node --check` syntax PASS for all new host scripts; all actions are actions/*, permissions read-only, eachjobUbuntu/timeout30, exact source PR+ownpush triggers. Full Node/mutation/matrix/regen, both2000-game variant leagues, actual browser/capture and final source-bound all4000-game combination remain required. Default npm test still executes the complete pipeline. Actual hosted per-job fit/green/upload/download remain pending.

PinnedNode22 `scripts/league-partition-controls.mjs` first component run closed19:41:06.996895 exit0,11.781s/peak273,860KiB:10 positives/68 rejected corruptions. Those controls independently replayed all4000 actual legacy move lists and tested explicitly derived partition/synthetic stage-schema fixtures. Root found coherent outcome/ending+recomputedsummary/transcript could pass the initial structural reader. Corrected reader additionally replays every turn through current pure core, requires true done/winner/endReason/results and rejects early terminal continuations. Coherent forged-terminal control added for all4 comparison groups. Current corrective invocation started19:44:10 under session96302; result pending at checkpoint, no corrected PASS claim. Original components/resources preserved.

Milestone target19:41 fromactual19:16 push missed during necessary correction; hard19:46 remains. Record actual next push/own main row without backdating.

Actual corrective pinnedNode22 `scripts/league-partition-controls.mjs` naturally CLOSED19:44:52.556511UTC exit0,42.045316761s/maxRSS2,604,192KiB,10 positives/72 meaningful negatives. Every4000 actual historical record reaches the exact true terminal/winner/endReason using current reducer plus independent coordinate legal-move replay. Four coherently recomputed forged winners/endings/summaries/transcripts are rejected. All guarded host/module/workflow sources before/after identical for actuala9 implementation. Actual resources/stdout/stderr/receipt are archived; report was unknowingly copied under pre-terminal-controls.json at prior checkpoint, then observed after push and now renamed correctly. No fabricated/relabelled metric.

Observed successful normal a9 push19:46:04.318355 follows2f19:16:00.586934 by30m03.731421s; hard30min missed3.731421s, explicitly retained. Ownmain32c23a0 row19:45:47 preserved all others. Genuine exact-head GitHub workflow37834410114 began19:46:06; all four assigned stages actually IN_PROGRESS19:47:58 with checkout/npm/resource setup successful. No current green/standalone receipt inferred.

Official live https://raw.githubusercontent.com/actions/upload-artifact/v4/README.md read19:47:58: v4.4+ excludes hidden files by default and include-hidden-files:true is required. All declared G10 outputs are .work or .work-stage logs, so every explicit upload path now includes those known public files. No credential/environment dump or broad workspace upload. This fixes actual delivery configuration, requires a fresh current-head workflow, and does not waive any execution check.

## Actual hosted strict evidence and native video-tool repair

At19:56:36.286 UTC the independent reader of actual a9 artifact11574787510 passed all four unfiltered600-interval/601-timestamp samples, exact30 functional inventory,158 before/after current byte guards, active workload/nonce/run identities, explicit noHTTP/noerror receipts and exactfull1,390,845,993B HTML5ed2173b. Each sample is approximately60FPS/p9916.8ms. Source/game bytes match unchanged current product, but this is the historicala9 execution scope only. Its capture failed spawn ffprobe ENOENT; no accepted recording/full CI/delivery or causal repair of retained local17.510456661FPS is inferred. All original ZIP bytes/raw arrays/full recording/metadata/readers are retained in hosted-ci-first-native.

Native68-node artifact11575795805 downloaded as1023B ZIP SHA54020682d179a605a089d8e0ef6c783b22c40a43297321571357d714328156ce. Actual stdout proves full page build and source integrity PASS, then browser-evidence-controls.mjs fails spawn ffprobe ENOENT on the genuine milestone19 desktop.webm. OriginalNode91/mutants/matrix were not reached by that run; no false Node acceptance. Workflow explicitly installs ffmpeg/ffprobe in node/browser/delivery and preserves all native probe/decode assertions. pipefail+tee exposes real stdout/stderr and propagates actual failure exit. Fresh current-head full CI and exact1.39GB standalone upload/download remain pending.

Firsta9 American/International native jobs actually completed SUCCESS at19:51:19/19:58:10, within their30-minute job windows; the overall workflow failed and delivery skipped. Independent raw-game terminal/source validation is separately recorded only after actual closure. Advertisedresources are not used as actualfit proof. Native runner observed Node22.16.0/fourCPUs/MemTotal16,373,452KiB/free87,436,416KiB on firstnode (browserMemTotal16,372,440). No memory/search/count/assertion reduction.

Actual independent league validation CLOSED 2026-10-08T20:07:18.478Z PASS on pinnedNode22.16: all4000 games/80 exactfiles/all127 current game inputs/all348 stage guards. All original hosted complete-game raw bytes equal accepted phase gold. Every move independently replayed by the coordinate oracle and every true terminal/winner/endReason by current pure core; all counts/seeds/seats/summaries/Wilson/transcript gates pass. Historical stage binding uses exact Git-original a9 workflow bytes; all other current bytes match, no guard is waived. Actual component league seconds: American 233.586916726, International 649.839127041. Overall a9 failed; full current CI and standalone remain pending.

Before the video-tool repair checkpoint, workflow YAML/complete matrix/read-only actions/Ubuntu30-minute structure and pipefail propagation checks PASS. node scripts/hashes.mjs and node scripts/integrity.mjs --sources PASS, updating all actual archival checksums; this explicitly excludes execution/delivery and uses the tracked older2–5 offline baseline. No fresh full CI result is claimed.

## Complete historical hosted acceptance and bounded-delivery repair

Exact 6de661bc96798b8c9ed146e7a6cafcfa37bca150 workflow 37837474779 completed SUCCESS 20:32:31 UTC. The actual delivery job 113526264277 full 103,123-character native log is preserved, including final validation, source receipt and official artifact finalization. Official complete evidence artifact 11577710435 is 10,484,190 bytes, SHA bac499e7f0d8ce2ce0db443aada0ecf3c011003d11c25f6fa6c76bcc92a48155; actual download, 239 unique safe members and all CRC checks PASS. Exact metadata, ZIP and independent readers are in evidence/checks/hosted-ci-complete-6de.

Executed pinned Node22.16 command `.work/memory-json-private/node22/runtime/bin/node .work/hosted-6de-final/validate-complete.mjs` CLOSED PASS 20:52:16.590. It checks all five exact accepted stage/source/runtime/run/attempt/command inventories, 91 TAP passes and zero failures/skips, 25 real mutant kills, 7,000 matrix games, 10,000 independent move cases and 1,003 property seeds; every 4,000 actual game's legal path/true terminal/winner/ending and summaries; all 80 raw files byte-equal to original accepted phase gold; all four 600-interval/601-timestamp native samples and actual full capture/original decode/dimensions/hashes. Separate immutable Git audit (`git ls-tree --full-tree -r --name-only 6de661bc96798b8c9ed146e7a6cafcfa37bca150`, then streaming `git cat-file blob <head>:<path>` SHA-256) verifies all 205 original tracked guard files; remaining 143 generated/runtime guards are exact byte matches, not claimed as Git blobs. The initial auxiliary ENOENT gold path, prefix-only head assertion and zero-row cwd-relative inventory are preserved alongside corrections; final receipt records the separate Git audit. Its real STOP/CONT hold applies only to recorded decode and pure replay, not native timing; no elapsed performance gain is claimed.

Actual standalone artifact 11576888627 uploaded as 968,040,269 bytes, SHA 1b04adca169c200569b894a60ce9ebb26d27408fa8b4474e7c80879a1652bf08. `github_download_workflow_artifact` returned `Artifact exceeds max size of 536870912 bytes: 968040269 bytes` before providing bytes. The original rejection is preserved. Current source-changing delivery repair publishes four <=384-MiB raw parts separately, retaining exact full 1,390,845,993-byte SHA5ed page, with identical source/part/whole receipt and a portable Python JOIN helper. Actual current part upload/download/combined digest and fresh full workflow remain pending.

Executed `python3 scripts/standalone-parts.py controls`: PASS, four real boundary split/re-read/JOIN positives and 21 meaningful rejected corruptions. Actual bytes span five bounded fixture parts and reassemble byte-identically; rejects wrong order/offset/count/digests, missing/stale/symlink parts, mismatched source/checkouts/stages/helper, coherent forged whole-SHA sidecars, duplicate keys and incomplete/existing output. Receipt in evidence/checks/standalone-parts-controls.json. `python3 -m py_compile scripts/standalone-parts.py` and `node --check scripts/check-stages.mjs` PASS. Current stage commands add these host controls without removing any original workload; no runtime gameplay/source/corpus policy change or new native frame attempt is inferred.

Actual 1c9 documentation-only workflow 37841446160 failed all four source-integrity stages and skipped delivery: ASSUMPTIONS.md hash mismatch from omitted regeneration. All four complete genuine native logs are retained in evidence/checks/checkpoint-1c-failed. Regenerate `node scripts/hashes.mjs` after every final source/evidence/doc edit, then run `node scripts/integrity.mjs --sources` and fresh exact-head complete CI; historical 6de cannot accept later heads. README stays under 60 lines. No PR/KEEP completion is claimed yet.

## Genuine8d command-inventory failure and execution correction

Actual exact8d workflow37843367603 American job113538068986 SUCCESS21:03:23, browser job113538068944 SUCCESS21:05:00, Node job113538069118 FAILURE21:06:42. The complete151,061-character native Node log shows source integrity PASS, actual91 tests/91 passes/zero failures, all original mutations/configuration workloads, then the exact final `No missing or substituted stage workload` assertion: expected Python standalone delivery controls were not executed. This chat omitted the actual invocation. No final Node stage receipt, complete acceptance or standalone delivery exists for that scope; International completion was pending at this checkpoint.

Official failed Node artifact11578867085 downloaded as105,670 bytes, SHA21f0562f7d2104064c1062116026812d1b5653036e9be93e5116227b86f5ae54. Independent ZIP safety/CRC and original reports confirm25 actual assertion-killed mutations,7,000 matrix games,1,003 property seeds and absence of stage-node.json. Original ZIP/metadata/full native log and independent receipt are in evidence/checks/parts-integration-8d-failed. This is a failed stage with proven original-workload components, not accepted Node/full CI.

Current execution repair adds exactly `await run('python3',['scripts/standalone-parts.py','controls']);` before existing Node controls in scripts/check.mjs, matching the required inventory. `node --check scripts/check.mjs` and actual `python3 scripts/standalone-parts.py controls` PASS4 positives/21 rejected corruptions. All original counts/commands/assertions and pure game/bot/corpus/HTML bytes remain unchanged. Fresh full exact-head execution and all actual bounded downloads still required before PR. Regenerate checksums after final edits and keep the current source-only check separate from full runtime acceptance.

2026-10-08 21:40 UTC — exact ae36b497cfd474f0eafc873bb2489b2529b4163e hosted run37845153145/attempt1: all four original stages and final SUCCESS; complete evidence artifact11579829579 actual10,735,586 bytes SHA46fa2a20b8c0712bdf34e741746d7b240e9d58b10f99305781f2d5cceffe6d3f,239 safe unique CRC-valid members. Exact commands: `time -p .work/memory-json-private/node22/runtime/bin/node --max-old-space-size=6144 .work/hosted-ae36-final/validate-complete.mjs` naturally CLOSED21:38:19.877/EXIT0/65.66s; verifies all349 guarded bytes,206 original immutable Git blobs,143 exact generated/runtime,allfive exact stage/head/run/attempt/commands/Node22.16 receipts,91/91 TAP,25 actual killed assertion mutations,7,000 matrix,1,003 actual property seeds,10,000 move oracle cases,4/21delivery controls,all4,000 current-core true-terminal/independent-coordinate records and80 gold-identical raw files,all2,400 native intervals/2,404 timestamps and real International clips/originals full decode/hash/dimensions. `time -p python3 .work/delivery-parts/verify-downloaded-zips.py .work/hosted-ae36-final/standalone` naturally CLOSED21:37:29.277522/EXIT0/13.66s; verifies all four actual official ZIP bytes/SHA/safe unique members/CRC,identical receipt/manifest,immutable exact Git helper,every part order/offset/size/SHA and streamed original complete1,390,845,993-byte5ed SHA without duplicate extraction. Detects corruption,stale/mixed source artifacts,missing/extra/reordered parts or changed helper/sidecars. Actual readers,raw outputs,official metadata,receipts and10-MB evidence ZIP archived in evidence/checks/hosted-ci-complete-ae36. Initial missing /usr/bin/time wrapper errors127 preserved; no source/check waiver. All acceptance remains exact ae36 historical after this new documentation checkpoint. Original PR#10 draft/readback exists; KEEP still zero.

2026-10-08 22:10 UTC: exact491 PR workflow37848566924 allfour/final SUCCESS22:06:26. Actual full ZIP11581379453 size10139344/SHA6223b771f3d1c46e9b9c9a2aa2a24ea5fc3c6d231c1a08a90760f51441ccab07/all239safeCRC PASS. Commands `time -p .work/memory-json-private/node22/runtime/bin/node --max-old-space-size=6144 .work/hosted-491-final/validate-complete.mjs` CLOSED PASS22:09:31.144/EXIT0/74.91s, all349guards/exact206Git+143runtime/allfivePRhead/run/attempt/commands/alloriginal91/25/7k/1003/10k workloads/all4ktrue-terminal gold games/all2400nativeintervals/2404timestamps/real full clip decode. `time -p python3 .work/hosted-491-final/standalone/verify-downloaded-zips.py .work/hosted-491-final/standalone` CLOSED PASS22:08:48.834569/EXIT0/12.99s, allfour actual official ZIP/part/whole byte/hash/source/helper/CRC checks. All proofs archived evidence/checks/hosted-pr-complete-491; future head remains pending. Formal rank-five started after these gates, no completed round/gain.

## Formal round1 complete-source diagnostic preparation (not player acceptance)

- `.work/memory-json-private/node22/runtime/bin/node .work/american-ready-private/strict-overlay.mjs`: PASS22:34:50; all original strict ES2022 TypeScript files with private American-only readiness overlay, no emit/browser. Catches source/type/control integration errors.
- `.work/memory-json-private/node22/runtime/bin/node .work/american-ready-private/build-bootstrap.mjs`: PASS; actual original12,219,820-byte bootstrap reproduced and both original bot workers identical, corrected American-only private body. First fixed2MiB prefix reader failed before bootstrap boundary; raw error/script retained. Catches any unplanned worker/compiler/source change; compiler-only proof does not establish whole-page bytes.
- `python3 .work/american-ready-private/verify-delta.py`: actual PASS22:42:00.193105/EXIT0. Hashes full canonical5ed before/after; validates completed American compressed data; decodes/compares all1,304 actual International parts across41 original files (1,006,478,762 bytes); hashes exact copied regions and complete1,390,846,291-byte candidateb4 stream. Catches missing/reordered/truncated/altered corpus or wrong marker/compiled bytes without allocating another full file. No browser/offline/frame proof.
- `python3 .work/american-ready-private/verify-http.py`: actual PASS22:46:03.912329/EXIT0, pinned Node22.16 before/after. Independently reads both actual complete HTTP emissions to EOF, validates whole sizes/SHA and server actual region/whole/final source identity/normal EXIT0. Catches wrong source/range/asset/transport bytes; does not measure a player. Original statically unbound server is retained.
- `.work/memory-json-private/node22/runtime/bin/node .work/american-ready-private/prepare-ready.mjs`: original9109 READY PASS22:57:50.690/EXIT0, all349 actual source/runtime guards/all127 accepted gameplay inputs, driver/server/assets/pinned Node/Chromium binary/full canonical verified. Sole originalfa divergence is official-mirror workflow. Catches stale or changed inputs. This exact archived READY was never granted or executed and must be refreshed after a checkpoint.
- Independent G08 STATIC source/emitter/driver review naturally CLOSED by22:56:44 EXIT0. Concrete original findings and fixes are archived; no browser/timing/source mutation occurred. New `observe-player.mjs` is syntax-checked only; real matched native/trusted visible outcomes remain pending root grant. No new gain/completed KEEP round is claimed.

2026-10-08 23:32 UTC — exact217 original PR37857480233/attempt1 all four+delivery SUCCESS23:27:53. Actual official complete artifact11586095276 SHA47591534ff3d453438d1cf492d75fec5493c0f965675ee5a9d9459a1fd659e8a/10,349,595 bytes/239 safe unique CRC members PASS. `python3 .work/hosted-217-final/audit-git-guards.py` naturally CLOSED23:29:55.912920 PASS206 original immutable Git+143 actual generated/runtime guards. `.work/memory-json-private/node22/runtime/bin/node --max-old-space-size=6144 .work/hosted-217-final/validate-complete.mjs` naturally CLOSED23:31:41.434 EXIT0; all349 guards/127 game inputs/current five exact source/run/attempt/runtime/stage inventories,91 tests/25 actual kills/7,000 matrix/1,003 seeds/10,000 independent oracle/all4,000 true-terminal games/80 original gold bytes/2,400 native intervals/2,404 timestamps/current clips+originals fully decoded. Catches corrupted/stale/mixed outputs, forged terminal/league reports, altered raw/native frames/captures and changed immutable source. Exact executed reader retained an old exact-fa human label; original preserved and interpretation reports actual217 binding with no additional test run. Finite command/tool polling shortcut preserved with actual ZIP PASS preceding Git-reader START. Actual current four bounded part download/whole acceptance still PENDING. All actual commands observed naturally CLOSED before archive.

Corrected `.work/memory-json-private/node22/runtime/bin/node .work/american-ready-private/prepare-ready.mjs` naturally CLOSED23:19:48.922 EXIT0; actual six current docs==immutable217 plus acceptedfa blob/hash bridge, all349 source/runtime guards/127 game inputs/whole accepted full source/real candidate/runtime/helper identities. Independent STATIC review naturally CLOSED23:20:20.573740 EXIT0. Old ungranted READY preserved; no browser/elapsed run. Catches silent current documentation drift/stale source; does not establish a player gain/offline/frame acceptance.

## Closed trusted-player diagnostic,2026-10-09

Actual delegated exclusive grant23:38:52.155080 bound immutable e7 head, READYbc4b78fa9e2c3803e214e3cd0c4de3c90f5b27aab66995d8b7f29654ba1adde0/noncee66940a7, six actual current-doc bridge, all349 source/runtime and127 gameplay guards, unchanged c88b96eb driver/fcadbe07 server and single authorized expected-HEAD literal update. Fresh process inspection and continuous peer/root holds were actual. Controller child START23:38:52.159006; browser/native START23:39:09.713Z is separately preserved. Original report PASS naturally CLOSED23:43:56.339Z, server EXIT0; controller naturally CLOSED23:43:56.477716 EXIT0 after304.321308s total. Tool exit0 observed before public copies/hashes; all owners directly released after natural closure. Evidence/checks/readiness-round1-native-e7 preserves original report/server logs/grant/controller/READY/exact helpers/source and interpretation.

Actual trusted American Strong Start/first legal move: desktop baseline17,380.100/22,831ms, candidate1,947.100/8,600.400ms; phone4x baseline113,067/122,655.800ms, candidate8,540/17,249.100ms. Candidate trusted clicks and first legal moves occurred while loading before DOMContentLoaded, with both readiness booleans true at clicks. All four International trusted starts occurred after complete load with legal first moves. Core replay/search reports/cursors agree across arms; original full bytes/349+127/six-doc/runtime guards unchanged, zero page errors/failed requests/external runtime HTTP. One pair per profile only:62.330%/85.937% reductions are diagnostic observations, not population/cold-cache/FPS/offline acceptance or causal repair.

Reject original americanBotStartEnabled timestamp and before-DOMContentLoaded flag: it latched transient rendered DOM during native dropdown changes while host canStart/botsPrepared were false, including baseline. Preserve raw original report PASS and rejected values separately; use actual trusted Start and legal first moves only. No unchanged timing rerun is authorized.

Current e7 original PR37860295647/attempt1 is genuinely fully SUCCESS: American23:40:53, Node23:41:55, browser23:42:12, International23:47:54, delivery23:51:37. Current complete/four bounded ZIP actual byte/CRC/raw-range/whole reception is PENDING; metadata does not prove acceptance. Previous217 complete239-member/all349/all4000/all80/raw2400/2404/full clips proof is historical; its four bounded ZIP receptions remain PENDING. Shared disk cannot safely retain all four968MB ZIPs. Next implement/review sequential receiver: stream each official raw range, compare read-only baseline bytes, join actual whole SHA, close finite children before documented recoverable duplicate-ZIP cleanup, final-hash baseline. Never delete unique evidence or mutate baseline without explicit coordinated concrete recovery approval.

Candidate remains PRIVATE/unadopted. Formal round1 IN_PROGRESS; zero completed KEEP rounds or adopted player gains. Before adoption guard original full output/gzip/data/disk delivery and actual current-source CI/artifact evidence. All three successive no-player-gain rounds remain after last gain. This evidence checkpoint counts as neither gain nor no-gain round and creates a new head requiring fresh exact CI/actual delivery. Preserve original local17.510FPS failure/phone NOTRUN and all failed source/readiness evidence without causal claims.

## Full source recovery and genuine generated output/gzip,2026-10-09

Actual current071 original PR37862823508 and sibling push37862809181 workflow metadata fully SUCCESS, updated00:23:01 and00:21:00 respectively. Actual current071 complete/fourpart independent receipt acceptance remains PENDING; no metadata or older-source proof is transferred. Actual historical e7 full official complete11586645608 ZIP10,584,359B SHA49913671e507281caf4324ea8f30bc6c766ee26139df4efb65eccc59cb35b7ad has239 safe unique CRC members, all206 immutable e7 Git originals+143 exact generated/runtime guards, explicit six current071 docs/Git bridge. Original full independent reader naturally CLOSEDPASS00:09:40.077028/exit0: all349/127/91tests/25realmutants/7000matrix/1003seeds/10koracle/all4000 true-terminal current-core replays/80 original gold byte matches/all2400 raw intervals+2404 timestamps/full genuine clips+originals decoded/60 functionals. Exact logs/readers/diffs/native metadata and closed receipts are archived in hosted-pr-complete-e7; this is historical e7 acceptance with a dated current071 runtime/doc bridge.

Actual four genuine official217 bounded ZIP recovery now PASS: IDs11585436866/11585491795/11585536822/11585481906 with exact official sizes/SHA. Corrected receiver8dcccbb7d0781147d0bb43b45b9c537c762fe3fcd0d29a94de48da506ef226af naturally CLOSED00:26:07.502617/exit0,62.374673s/zero owned group children. Every4-member ZIP safe/unique/CRC EOF, immutable217 helper and identical four manifest/receipt bytes, exact contiguous raw ranges/counts/SHA, every raw byte compared read-only baseline; actual joined1,390,845,993B whole5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801 and final full baseline SHA/stat unchanged. Each duplicate ZIP removed only after actual finite worker EXIT0, post-close ZIP SHA and actual remote HEAD200/exact-size recoverability; no unique baseline/source/history deleted. All proof and exact public recovery routes/expiry are archived in standalone-parts-recovery-217.

Original3b5e attempt FAILED HTTP403 naturally CLOSED00:20:58.246784/exit1/zero children BEFORE raw Popen: original signed link explicitly expired23:57:04. Original bytes/receipts/errors remain. Material post-close finally/pipe-close/exceptional-only failed-reader terminate/unconditional-reap correction independently reviewed CLOSED00:24:33.232278; success checks unchanged, no timing retry. Fresh native refs returned00:23:02 window, recovery completed before expiry. No failed ZIP was cleaned up and no baseline was mutated.

Actual genuine full production-builder private adapter2291c251b6e7801a267beeea71a4b9a8b9d2091fcbff6315906ab845fce0c388 naturally CLOSEDPASS00:29:50.607162/exit0,140.768720s, both child groups zero. Baseline child CLOSED00:28:49.613226, candidate00:29:50.487215. Genuine esbuild/original workers/all41 files/1304 original bounded encoded parts/licenses produce exact raw baseline1,390,845,993B/5ed and candidate1,390,846,291B/b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb. Bounded output/gzip sink allocates no physical HTML. Deterministic gzip level9/mtime0 baseline961536512B SHA658f2b6d6a35e41f29169e0a1d7d5c788cacf58dde5d9e7469b62fe4e6943a5f; candidate961536539B SHA043fa4307d2505dfc9d47e0939c9cddca8cc3cc39d1f87bd5b9b702c15010f22. Node22.16 binary8142 before/after exact. Sources, actual original builder/diff/output reports and child/controller closures are in readiness-round1-output-gzip. This proves actual full generated raw/gzip output, not disk/offline/FPS/current-CI acceptance or player startup distribution.

Exact81B marker is <script>document.dispatchEvent(new Event('g10-american-corpus-ready'));</script> followed by newline, SHA86864036a154e43ae691b232c26dd4433ea117aec5ed430f6cebb3ffe7ba976c. Append AFTER original complete Chinook closing-tag newline at baseline48,753,284; omit no original newline. Earlier shorthand without semicolon/newline/before-newline was an interpretation error, not actual source/test change.

Prototype source/results are now public experimental evidence; production src/browser.ts and scripts/build.mjs remain unadopted. Actual trusted first legal move pair reductions remain diagnostic62.330%/85.937%; rejected earliest-enabled transient-DOM timestamp remains rejected/raw preserved. Formal round1 IN_PROGRESS, zero completed rounds/adopted player gains; all three successive no-player-gain rounds remain after last gain. This proof checkpoint is neither a player gain nor a no-gain round.

Next: preserve actual full source and unique history; send concrete baseline-cache stat/SHA/verified-source recovery proposal and await coordinated approval before any reversible cache replacement. Adopt exact candidate source/81B production marker only with original full delivery/type/current exact CI/artifact checks. Actual new physical candidate file/offline proof remains separately required; never infer it from bounded sink. This checkpoint creates a new source head needing fresh exact full CI/delivery acceptance. Preserve original local17.510FPS failure/phone NOTRUN and every raw failure without causal claims.

## Exact current8b4 original full proof, 2026-10-09 01:05 UTC

Actual exact8b4 original full PR37865331876 SUCCESS00:51:40 is independently accepted. Official11588353316 actual10,482,612B SHA82fc791ae73f17e99cb8d71f3d99595769e9cb584f42a97c743e6c167c019779:239safeuniqueCRC/fullEOF members,35,485,354 actualuncompressedbytes. Actual206 immutable8b4Git+143generated/all349 sourceguards and six current8b4doc guards PASS01:04:23.436682. The unchanged full reader8bcb2376297f8503b539bfbb2f86716a9646cbddcb71c5fb510c9be8fa93255a naturallyCLOSEDPASS01:05:40.428234/exit0/76.461693s: all349guards/127gameplay/91tests/25realmutants/7000matrix/1003seeds/10koracle/4000 true-terminal current-core replays/all80originalgoldbytes/all2400raw intervals+2404native timestamps/fullgenuineclips+originals decoded/60functionals. Exact officialZIP/all5fullnativelogs/metadata/readers/diffs/closedreceipts are archived in evidence/checks/hosted-pr-complete-8b4. Physical baseline5ed remained present and unchanged during acceptance. Four current8b4bounded standalone ZIP/raw/range/fullbyte acceptance remains PENDING; historical217all4recovery remains genuine.
Actual source push8b4 CLOSED00:32:36.861954; hard01:02:36.861954 was missed during the workspace restart and resumption/current-proof recovery. The restart notice began around00:46 and root resumed filesystem00:58:34; subagents were re-created afterward. No missing timestamp or commit is invented/backdated. Reset cadence only from this next actual successful push.
Player/core/bot/RNG/corpus/builder source remains unchanged from8b4. Candidate is still UNADOPTED; physical b4 file/offline proof pending; renewed KEEP round1 IN_PROGRESS/zero completed rounds/player gains. The private one-pair first legal move diagnostic is unchanged; no luck timing rerun, FPS/cold-cache/general gain or 3zero-roundstop inferred. Root's concrete conditional one-derived-baseline-cache replacement authorization may proceed only with freshzeroowners/immediatefullSHA/samestat; preserve every other distinct history/raw error/source.

