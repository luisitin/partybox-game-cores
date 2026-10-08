# Sources and provenance

Live research: 2026-10-08 UTC. Rules and algorithm facts are paraphrased;
no federation document, source artwork or book extract is copied. Original
project code uses MIT; external data and dictionary permissions are
separately recorded below and in their accompanying manifests. Earlier
denied requests were not source evidence; the relevant live text is now
readable. Exa searches and full-page reads were followed by direct GitHub
and HTTP metadata checks. Mirrors count as one underlying author.

## Rules

| ID | URL | Actually read and taken | Independence / reuse |
| --- | --- | --- | --- |
| A1 | https://nccheckers.org/NCCA/WCDF%20Checker%20-%20Draughts%20-%20English%20Rules.htm | WCDF rules text: setup, all moves, compulsory captures, free route choice, crown-stop, no-move win, threefold and 40 moves each without man advancement/capture. | Federation primary text mirrored by NCCA; facts only, no copy. |
| A2 | https://www.flyordie.com/checkers/rules?portal=flyordie_com | Operating-platform rules confirm short kings, full compulsory jumps, any complete route, crown-stop, 40 pairs and same-side threefold; additional cap/material claims recorded separately. | Independent explanation by a shipped game; no source text/art copied. |
| A3 | https://trevorldavis.com/piecepackr/share/rules/american_checkers.pdf | Independent Biggar/Davis adaptation: moves, compulsory full jumps, crown-stop, 40/threefold, huffing/crown-continuation/ballot variants. | ©2019 Trevor L. Davis, CC BY-SA 4.0; facts paraphrased, no artwork/text copied. |
| A4 | https://www.nccheckers.org/NCCA/ACF%20Rules%20for%20National%20Tournaments.htm | Search extraction for ACF formats: go-as-you-please, two-/three-move restriction and 11-man ballots. | Primary tournament context; not independent corroboration of harmonized WCDF rules. |
| I1 | https://www.fmjd.org/downloads/FMJD_Annexes_2024_8-sig.pdf | Latest dated primary Annex1 text: setup/moves, longest capture, delayed removal, final-square promotion, 25/16/5 draws, long-diagonal five-move clause, final-move no-move precedence. | FMJD federation primary text; facts paraphrased, PDF not copied. |
| I2 | https://www.fmjd.org/docs/Annex_1.pdf | Older standalone Annex1 read fully through movement/capture/draw/format sections. Most rules corroborate 2024; it omits the newer long-diagonal clause and §6.4 precedence detail. | Same federation author, not an independent source. |
| I3 | https://lidraughts.org/variant/standard | Independently authored operating-game explanation corroborates setup, captures/blockers, maximum routes, delayed crowning, repetition and 25/16/5 draws. | Shipped International game; source diagrams not copied. Older draw summary lacks 2024 diagonal clause. |
| I4 | https://opensourcesports.io/rules/draughts-international-fmjd/scoring-draw-rules | Independent rule explanation confirms 2024 long-diagonal five-move clause, capture-preserved 16 count and final-move winning precedence. | Commentary explicitly cites FMJD sections; independent explanation, not independent rule authority. |
| I5 | https://boardgames.stackexchange.com/questions/61692/how-does-different-draw-rules-interact-with-each-other-in-international-draughts | Full independent question/answer and published replay: an old 16 allowance with 3 moves left is not extended by a new 5 allowance after capture. | Community interpretation checked against explicit primary no-reset clause; game facts may be regression evidence, no quoted prose bundled. |
| I6 | https://github.com/RoepStoep/lidraughts/blob/master/modules/draughts/src/main/variant/Standard.scala | Actual shipped counter implementation starts material count after move creating eligibility, distinguishes first promotion from later promotions, and never resets active 5. It omits 2024 diagonal rule and does not preserve every earlier 16 situation. | Older independent implementation, Git blob ee397751283bcfe1c7923ab03f8bfe729539033c. Algorithm facts only; no code copied. |
| C1 | http://www.darkfish.com/checkers/rules.html | Full comparison of rulebooks: historical 40/50-move, third/fourth repetition and huffing differences. | Independent comparison; current federation text takes precedence. |
| C2 | https://en.wikipedia.org/wiki/International_draughts | Full page's winning/draw section and references: includes unsupported immediate K-vs-K draw and abbreviated/older limits. | Secondary overview; unsupported shortcuts rejected in CONFLICTS.md. |

American mechanics are corroborated by A1 with A2/A3. International
mechanics are corroborated by I1 with I3; latest draw details additionally
have I4/I5. Exact digital counter assumptions are distinguished from
source facts in CONFLICTS.md. Tournament administration is background.

## Endgame databases and strategy

| ID | URL | Actually read and taken | Scope / licence |
| --- | --- | --- | --- |
| D1 | https://webdocs.cs.ualberta.ca/~jonathan/publications/ai_publications/databases.pdf | Lake/Schaeffer/Lu's retrograde paper: terminal losses, WDL fixed point, residual draw only after complete closure, forced-capture descent, material/king/rank slices; six-piece count 2,503,611,964. | Algorithm facts only; no paper copied. |
| D2 | http://webdocs.cs.ualberta.ca/%7Emmueller/ps/2023/2023_Jiuqi_COG.pdf | 2023 Deep Dive paper's size table/retrograde explanation and distinction between database truth and neural predictions. | Independent authors describing same Chinook family, not an independent computed corpus; facts only. |
| D3 | https://fierz.ch/download.php | First-hand source/corpus publication: 5/6-piece ZIP 21.9 MB, smaller corpora prerequisites, source-use permission. Linked https://fierz.ch/db6.zip HEAD returned 200 and 22,912,173 bytes at 08:41:21 UTC. | Source reuse permitted; hosted binary data redistribution grant not verified. Corpus not acquired/bundled at this checkpoint. |
| D4 | https://github.com/rhalbersma/cake | Actual LICENSE and dbmain/index/probe headers/bounds read: maxpieces=6 but maxpiece=3; capture-position values intentionally invalid; Windows-specific generator, theoretical WDL. | Repository source Unlicense. Separate data grant is not inferred from source licence. |
| D5 | https://hjetten.home.xs4all.nl/scan/scan.html | Direct Scan host: International standard 2–6 corpus 706 MiB ZIP; independent variant archives; Linux/Mac/Windows engine. | Engine GPLv3; separately hosted data licence not established; no code/data copied. |
| D6 | https://github.com/rhalbersma/scan/blob/master/readme.txt | Author's WDL-only bitbase explanation, size 6 around 2 GiB RAM, search/evaluation, normal/killer/breakthrough/Frisian/losing variants. | © 2015–2019 Fabien Letouzey GPLv3; algorithm facts only. |
| D7 | https://edgilbert.org/EnglishCheckers/mtc.htm | First-hand MTC explanation: WDL does not specify progress-making moves; conversion is man move/capture; conversions can lie beyond a search horizon. | Facts only; no dataset/code copied. |
| D8 | https://github.com/eygilbert/egdb_intl/blob/master/README.md | Actual driver docs: WLD/DTW/MTC distinctions, capture/side exclusions, UNKNOWN caveats, Linux portability. Actual LICENSE_1_0.txt read. | Driver Boost Software License 1.0; data permission is now independently established by author's D11 statement. No code/data imported at this checkpoint. |
| D9 | https://github.com/eygilbert/GuiCheckers | README lead: optional six-piece DTW corpus externally hosted, too large for repository. | No data licence or delivered coverage assumed. |
| D10 | https://github.com/loks0n/rapid-draughts/ | Search/package/README lead: MIT TypeScript bitboard engine, WCDF rules, npm rapid-draughts@1.0.6. | Useful future independent-engine lead; implementation not read/imported into coordinate oracle. |
| D11 | https://damforum.nl/bb3/viewtopic.php?t=8341 | Full thread: database author Ed Gilbert explicitly grants unrestricted availability of Kingsrow WLD through 8 pieces, DTW through 7, and conversion through 8, and links the access driver. | Primary informal author permission for Kingsrow data, beyond the separate Boost driver licence. Does not grant Cake/Scan data. |
| D12 | http://edgilbert.org/InternationalDraughts/endgame_database_downloads.htm | Author's full download page and actual public Mega folder metadata: WLD 2–7 grouped installer, WLD 8 in two parts, MTC 2–8. The small setup executable was privately acquired/decrypted and its file list read with innoextract. | International data grant D11; no full corpus or installer bundled. Installer index contains every 3v3/4v2/5v1 king/man split; individual six-piece compressed files range about 9 KiB–167 MiB. |
| D13 | https://webdocs.cs.ualberta.ca/~chinook/Software/ | Original Chinook author page explicitly permits free database use with acknowledgement of Chinook and prohibits database sale. | Data conditions are distinct from MIT original project code. No assumption of unrestricted commercial resale. |
| D14 | https://webdocs.cs.ualberta.ca/~chinook/DataBases/DB6.zip | Actual archive privately acquired: 27,701,728 bytes. It contains DB6 (48,132,029 bytes) and DB6.idx (900,418 bytes), including all nonempty American material/king/man tuples through six pieces. | Author conditions D13. Actual tuple audit: 4/12/25/44/70 tuples for 2/3/4/5/6 pieces; 3,935 rank slices. No binary bundled by the research worker. Position/probe correctness requires separate checks. |
| D15 | https://webdocs.cs.ualberta.ca/~chinook/databases/code.c | Full original access-code format read: slice identifiers, leading-man ranks, combinatorial ordering, block checkpoints, ternary/default runs, side normalization and both-side capture exclusions. Actual conversion table, rather than its misleading diagram, was inspected. | Format facts only. No source functions/tables copied; tests/reference-chinook.mjs is original JS, pure in-memory, with independent coordinate moves and slow combination enumeration. |
| D16 | https://github.com/dscharrer/innoextract/releases/tag/1.9 | Official 890,320-byte Linux utility privately acquired to list both Kingsrow setup indexes; Zlib licence read. | Research tool only, no utility/source incorporated into product. Setup indexes are not a claim of completed payload acquisition. |
| D17 | https://www.npmjs.com/package/scan3.1.js | npm 1.1.0 manifest, actual tarball file list, README and LICENSE read. JavaScript Scan build explicitly excludes bitbases/evaluation data. | Package metadata says MIT, but bundled LICENSE and upstream README say GPLv3. This package is not evidence of a permissively licensed full-six dataset; no code imported. |
| D18 | https://hjetten.home.xs4all.nl/enddb/ and https://hjetten.home.xs4all.nl/mobydam/mobydam.html | Author directory and full program page: six partitions cover 3v3/4v2/5v1. Their ZIP sizes total 854,776,170 bytes; lower-piece ZIPs are additional. Moby Dam source is GPLv3. | Separate binary-data grant remains unverified; freely downloadable engine source does not establish it. No data acquired/bundled. |
| D19 | https://edgilbert.org/EnglishCheckers/10pieceEnglishInstall.htm and https://edgilbert.org/EnglishCheckers/KingsRowEnglish.htm | Full author pages plus actual English public Mega setup index: material supports up to five per side; combined db6.cpr1 is about 29.5 MiB, smaller db2–5 included separately. | English-specific binary redistribution permission remains unresolved; D11 arose in an International thread. Small setup privately inspected; no database payload bundled. |

Pinned Cake Git blobs read:

- builddb4/dbmain.c:652ef6d6a41514f58e524836c7564f5805a299c7.
- builddb4/dbmain.h:bbad3f76480d6d7fe0194f1be173cf3cdc33ecc5.
- builddb4/index.c:93f21316252bd86f55d8c5b10661b92233994d9c.
- dblookup/dblookup.c:68ca6efa59dc849b3637d9c95818473a67744859.

Cake's label is not proof of global <=6 coverage: its probe omits
lopsided material and meaningful capture entries. An acquired/generated
corpus needs actual material coverage, licence, checksums and independent
checks. A resource-truncated graph is UNKNOWN, never DRAW. Bare-board WDL
is theoretical; it does not itself solve a game with existing draw history.

Audited Chinook corpus SHA-256 values:

- Author ZIP: `35835dae65a962eafdf5cde290bce380117445acb21819dd0e266b3b0efab3b3`.
- DB6: `baee42a2b49390edd96e5a751189366275619c941d79021f3ca45774c3e7071f`.
- DB6.idx: `10cb5cfc2a8c67e18c322563c17ceef0adeac87786a16c767c4616e9a574f4fd`.
- Audited D15 access-code source: `50853f33909f5cb2b525d437cedcaad1dc52e24106c0215b6f327668a36a02ab` (72,380 bytes).

`scripts/acquire-chinook.py` validates those fixed bytes and regenerates
material/provenance metadata into a caller-selected private directory. The
data terms, capture exclusions and theoretical scope must accompany any
later distribution. American complete-material acquisition is now real;
International full-six acquisition/probing remains unresolved.

Original-driver validation is reproducible with
`scripts/validate-chinook-original.py`. It fetches the fixed D15 source
into ignored `.work`, applies disclosed LP64/allocation repairs only,
compiles it, and checks 10,000 fixed-seed original reference queries.
The tracked script was executed successfully; raw proof and source,
adapter, binary, query and output hashes are retained in
`evidence/checks/chinook-original-*`. No author C source is committed.
See BOTS.md for the exact coverage and proof limitations.

## Original independent oracle

tests/reference-moves.mjs was authored from rule sources before reading
future production move code. It clones full coordinate matrices per jump
and imports no production helper, adjacency, bitboard, apply or search.
Input/output indexing was agreed in advance. BOTS.md records independent
endgame validation design and the scoped original-driver result. Other
execution results belong in their retained reports and VERIFY.md.

No source art, book passage, paid content, secret, signed download link,
tracking asset or runtime network dependency is bundled here. GitHub
provided source/license fallback; an npm package lead was reachable.
Knowledge fallback was unnecessary for the critical rules. Unread URLs
remain leads, never proof. Observed historical research blockers remain
historical evidence and are not grounds to stop this implementation.

## Actual International v2 implementation milestone

The pinned Boost dictionary source and complete licence are tracked with
source/hash provenance in data/international/dictionary-manifest.json. The
61,077-byte table pack was regenerated twice byte-identically. Only actual
404-byte db2.cpr1 and111-byte db2.idx1 are installed; original installer SHA-1,
author-driver CRC and source SHA-256 were verified. The renamed bin/idx bytes
are unchanged. Position-data permission is the separate author grant D11.
No three-to-six payload completion is implied by a constructor accepting
six-piece ranks. Production reader is original MIT, independent reader imports
only the separately authored coordinate oracle. Actual two-piece WLD is compared
against a fully closed independent retrograde, and10k2–6ranks are compared
separately. These are different scopes; neither proves absent payloads.

Subsequent source acquisition also completed every actual db2–5 file,
using three bounded HTTP 206 ranges of the public installer. Each extracted
file matches installer SHA-1 and original-driver CRC-32; exact SHA-256 and
byte counts are generated by `scripts/acquire-international-small.py`.
This reference worker's payloads remain in a private acquisition folder;
production integration is a separate parent-owned milestone. A previous
single-range timeout was overcome, not treated as a source blocker.

The original Boost source archive is pinned to commit
eacf10797e8f6c81d618caa7af1eba05df139ac7, with tar SHA-256
`9b52088cc0864e8fa68249d97145bfc2800313cbf34fac5b6eb214d0ea23f66c`.
`scripts/validate-international-original.py` fetches/verifies the unchanged
source privately and supplies an original input adapter. Its 10,000-query
original-C++ comparison passed for actual db2–5, all 45 canonical material
tuples and 180 side/colour orientations. No original source was modified.
No downloaded C++ source function is committed. The independent JS reader
also passed eleven synthetic/actual-db2 tests using tracked bytes, zero
skips. Full six-piece validation, excluded capture resolution and
draw-history conversion remain separate gates. The exact driver/source,
query and transcript proof is in `evidence/checks/international-original/`.

Five separately acquired actual six-piece classes also passed a private
10,000-query comparison, using the original specific v2 constructor. The
generic opener identified maxpieces5 because its six-piece discovery file
db6-3030.idx1 was absent. That initial -2 unavailable-slice attempt is
preserved separately; it is not a decoder correctness result. The original
source algorithms remain unchanged. Retained discovery/success evidence
is under `evidence/checks/international-original-six-discovery/` and
`international-original-six-direct/`. The tracked `--direct-v2` reproduction
option passed all 10,000 queries, reproducing the first successful input
and combined comparison byte for byte. Its retained raw/hash report is
under `evidence/checks/international-original-six/`.
This reference worker has not copied the six-piece database into the repo.
The absent 32 canonical six-piece classes and draw-history proof remain
outside this successful five-class comparison.

## Large-artifact platform research

Live GitHub platform pages were read on 2026-10-08:

- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
  gives per-file LFS limits: Free/Pro 2 GB, Team 4 GB, Enterprise Cloud 5 GB.
- https://docs.github.com/en/billing/concepts/product-billing/git-lfs
  lists included Free/Pro 10 GiB storage and 10 GiB monthly download
  bandwidth; this account's remaining quota is unverified.
- https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
  gives up to 1,000 release assets, each under 2 GiB, with no documented
  release-total/bandwidth limit.

These are primary platform facts, not independent rule corroboration or
proof of an uploaded artifact. No LFS configuration, purchase, release or
upload was performed by this research worker. The full-page size estimate
and remaining browser/representation checks are in
INTERNATIONAL-ENDGAME-HANDOFF.md. Complete-six remains pending.

## Complete International source milestone

The later bounded-range acquisition reused earlier proven caches and
downloaded only the remaining 35 exact HTTP 206 ranges. The full original
744,300,648-byte Inno prefix yielded all 82 db2–6 files, with all 37 six-piece
classes. Each original installer SHA-1 and pinned-driver CRC matches;
exact total 1,010,554,015 bytes. Two separate decrypt/extract runs gave
byte-identical files and manifest. Full-source/native proof is retained
under `evidence/checks/international-complete/` and
`international-original-complete/`. No full payload or original external
C++ source is copied by this research worker.

Unchanged original generic-driver WDL agrees with the independent reader
on 10,000 complete-six queries, all 37 classes/148 side-colour orientations,
including 22 actual second-subslice cases. Offline full-page integration,
excluded capture resolution and current draw history are separate checks.
The tracked public complete-source acquisition mode subsequently ran
twice in distinct empty output folders with only encrypted caches reused.
All 82 regenerated files and both manifests are byte-identical; proof is
under `evidence/checks/international-public-regeneration/`. This is an
executed public reproduction route, in addition to the earlier private
acquisition/regeneration pair.

Milestone7 production update: unchanged actual db3–5 bin/idx bytes are now
installed with per-file SHA/size metadata and separate D11 data permission.
Production probes equal all10k original-C++/independent db2–5 records, including
all45 canonical materials/all180 orientations. The original audited Chinook
ZIP is retained to embed its exact raw-deflate stream; International payloads
are deflated at build time and byte-round-tripped. Native local decompression
adds no network request or runtime package. At that db2–5 milestone,
actual quiet-six probing was still pending; the later complete-source
proof above supersedes that scope, without asserting full-game delivery.

Private single-file payload experiments are retained under
`evidence/checks/international-stream-prototype/`. The first per-file-tag
page passed desktop source reads but failed the CDP 4× phone's unchanged
300-second navigation deadline. With the same source/base game, a
1,293-tag representation capped at 1 MiB passed source-byte checks on
both profiles: DOMContentLoaded 27.082/89.455 seconds, peak summed RSS
4,040,486,912/3,325,009,920 bytes. These are payload/parser/source-access
measurements; no full-bot or frame acceptance is implied. The baseline
failure is preserved, and no causal percentage gain is claimed.
