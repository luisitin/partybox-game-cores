# International WLD acquisition and format handoff

Checked live on 2026-10-08. Full International six-piece integration is
unfinished. Source access and a separately established data grant are
available; this is remaining engineering work, not a missing-source block.
No bounded search or small tactical sample is called complete coverage.

## Permission and actual sources

- Author Ed Gilbert's unrestricted-database statement:
  https://damforum.nl/bb3/viewtopic.php?t=8341 (2021-01-15, actually read).
- Author download page:
  http://edgilbert.org/InternationalDraughts/endgame_database_downloads.htm.
- Public WLD 2–7 folder:
  https://mega.nz/folder/vRhFgSjR#bqlaniDcxC65fZWpnovROA.
  Its key is intentionally public; no private token or signed download URL
  is recorded here.
- Access driver: https://github.com/eygilbert/egdb_intl. Its Boost Software
  License 1.0 was read separately. The driver licence is not the evidence
  for the database grant.
- Format files actually read: `egdb/egdb_wld_tunstall_v2.cpp`,
  `builddb/indexing.cpp`, `builddb/indexing.h`, `engine/board.h`,
  `egdb/egdb_common.h`, `egdb/egdb_intl.h`, and
  `egdb/tunstall_decompress_v2.txt` in that repository.

Actual installer group byte counts from the public file API:

| File | Bytes |
| --- | ---: |
| Kingsrow_Intl_7pc_WLD_Setup.exe | 313,345 |
| Kingsrow_Intl_7pc_WLD_Setup-1.bin | 2,099,686,144 |
| Kingsrow_Intl_7pc_WLD_Setup-2.bin | 1,598,927,404 |

The setup executable was acquired, decrypted, and read with official
innoextract 1.9. Its SHA-256 is
`7061f83d686cec8affff4d1fc69efbb7c2d6122615b3e723458db198c54f7b65`.
Its file list contains all six-piece 3v3, 4v2 and 5v1 king/man material
splits: 37 canonical partition pairs. Lower db2–5 each use one pair.

The following totals are estimates from human-rounded installer listings,
not exact byte counts. They describe already compressed `.cpr1` files
and text `.idx1` files, not raw positions or resident decoder memory.

| Pieces | Files | Approximate bytes |
| --- | ---: | ---: |
| 2 | 2 | 515 (exact acquired bytes) |
| 3 | 2 | 22,019 |
| 4 | 2 | 1,179,136 |
| 5 | 2 | 33,994,957 |
| 6 | 74 | 973,881,141 |
| Complete 2–6 | 82 | 1,009,077,769 |

## Selective acquisition actually demonstrated

The public folder API request is POST
`https://g.api.mega.co.nz/cs?n=vRhFgSjR` with an array containing
`{"a":"g","g":1,"n":"PUBLIC_NODE_HANDLE"}`. Folder metadata comes
from `{"a":"f","c":1,"r":1,"ca":1}`. File keys/attributes are
decrypted from the public folder key. The temporary returned download
URL stays in process memory and is not printed or committed.

For the first `.bin`, a `Range: bytes=0-1048575` request returned HTTP 206
and exactly 1,048,576 encrypted bytes. AES-128-CTR decryption used the
file key derived from public node metadata. Those bytes were placed at
offset zero in a private sparse file with the original basename/size.
Its unacquired zero-filled region is not data and cannot prove coverage.
With the actual small setup beside it, this command succeeded:

```sh
innoextract --include app/db2.cpr1 --include app/db2.idx1 \
  --output-dir PRIVATE_OUTPUT Kingsrow_Intl_7pc_WLD_Setup.exe
```

The two extracted files match both the installer's SHA-1 entries and the
original v2 driver's expected CRC-32. A later selective acquisition of the
first 24,775,197 encrypted bytes succeeded in three HTTP 206 ranges and
extracted every db2–5 file. Those eight actual files each match installer
SHA-1 and original-driver CRC-32, with a generated SHA-256 manifest. The
original single-range timeout is retained as acquisition history. It did
not prevent successful bounded-range acquisition.

| File | Bytes | CRC-32 | SHA-256 |
| --- | ---: | --- | --- |
| db2.cpr1 | 404 | 0319ba8c | 305a1e7eabb4bab13577774009592e1614ddf8a4efe334d6fe3cb8221000b4ed |
| db2.idx1 | 111 | 07a9f0f3 | 9622e861c67ea250396b384bb95fec00fd541964c3109bdc1b27ae7aae1f73f2 |

The actual two-piece index has four canonical BASE records: K-vs-K
black to move, K-vs-man both sides to move, and man-vs-man black to move.
Other orientations are recovered by board rotation/colour reversal.

Exact subsequently acquired lower-piece sizes:

| File pair | Data bytes | Index bytes |
| --- | ---: | ---: |
| db2 | 404 | 111 |
| db3 | 21,628 | 413 |
| db4 | 1,176,396 | 4,729 |
| db5 | 33,886,572 | 126,504 |

The executable acquisition is `scripts/acquire-international-small.py`.
The actual lower payloads and manifest are privately available under
`/tmp/g10-rules-oracle-corpus/international-small/`. Separately coordinated
root acquisition has produced five checksum-verified six-piece pairs:
0303, 0312, 0501, 0510 and 2211. Five of 37 canonical six-piece partitions
is partial coverage. The large 2211 pair is 176,862,535 bytes; its tested
xz representation still exceeds GitHub's single-blob limit after base64.
The full db2–6 Inno payload lies before byte 744,300,648 of the first
installer bin, but unacquired sparse space remains scaffolding, not data.

## Portable format facts

`BASE bm,bk,wm,wk,subslice,side` names men/kings by colour and side to
move. Material is canonicalized to black dominance by piece count, then
king count; identical material with white to move is rotated/recoloured.
Men exclude their respective king rows. Numbered playable squares map
directly to the agreed 0–49 board indices; the C bitboard has ghost bits
after each pair of rows, which the coordinate reference does not need.

Man configurations are grouped by descending number of black men on
their back rank. Within a group, black back-rank men, other black men,
reversed white men, black kings and white kings use combination ranks
with earlier occupied squares removed. Rank subslices contain at most
2^31 positions. Files db2–5 combine material; db6-NNNN files separate
canonical material, with digits in bm,bk,wm,wk order.

Text index checkpoints occur at 4,096-byte block boundaries. Each
checkpoint provides the initial position ordinal, dictionary catalogue
and outcome permutation. The first checkpoint also gives a block/byte
start. Uniform `+`, `-`, `=` and `.` mean WIN, LOSS, DRAW and UNKNOWN.
There are 50 byte-token Tunstall catalogues, each with 256 token lengths
and run offsets. The shared runs encode virtual value plus little-endian
16-bit count; the block's four-value permutation maps to UNKNOWN/WIN/
LOSS/DRAW. Sparse/missing entries are UNKNOWN, not assumed draws.
Tokens use their declared-length prefix of a shared descriptor; a token
may end inside that descriptor's last run. Requiring its whole descriptor
to equal the token length rejects the actual dictionary incorrectly.

The dictionary source text is 230,004 bytes, SHA-256
`c000a78bbfdfc43f36779a0f1dc5ab529d597562003ed73f343ec83958a18401`.
Its exact compact table payload is 61,077 bytes: two 50×256 unsigned
16-bit tables plus 9,877 run bytes. The first 25,600 bytes hold lengths,
the next 25,600 hold run offsets, and the remainder holds run bytes. Table
integers are little endian. `scripts/pack-international-dictionary.py`
regenerated binary and JSON twice byte-identically from pinned commit
eacf10797e8f6c81d618caa7af1eba05df139ac7. The binary SHA-256 is
`92fa921a410c270c3126811dc2d8af22e1691aedaaf0d020ee01adbe572d26a9`.
Its separate Boost licence and provenance accompany the tracked binary.

For v2 at <=6, current-side captures are excluded. Additional
non-side-to-move capture exclusions apply from seven pieces, outside
this reader's scope. Stored WLD omits repetition and 25/16/5 history;
it is theoretical board-only truth, not a draw-history conversion proof.
Capture positions need a correctly closed move graph or other exact
resolution. A budget cutoff remains UNKNOWN.

## Exact next implementation steps

1. Preserve the original setup and public metadata checksums. Use its
   indexed data locations with aligned AES-CTR range reads to acquire
   only db2–6 chunks, or acquire the first complete `.bin` and extract
   exactly the 82 needed files. Verify every file against the installer
   SHA-1 and the driver's CRC, then generate SHA-256 manifests twice.
2. Preserve the completed dictionary regeneration proof. The original
   in-memory `tests/reference-international.mjs` imports only the
   independent coordinate oracle. Eleven reference tests passed against
   synthetic cases and actual db2 bytes, including rank bijections,
   prefix decoding and source capture-admissibility distinctions. The
   retained TAP is `evidence/checks/international-reference-prefix-regression.tap`.
   Its actual-sample test now defaults to tracked bin/idx/table bytes;
   that default wiring passed 11/11 with zero skips, retained separately
   as `evidence/checks/international-reference-tracked-default.tap`.
3. Validate the portable reader against the original compiled driver
   and independently solved complete small material, followed by
   10,000 original fixed-seed queries across every supplied 2–5 material,
   then every six-piece split after complete acquisition. The independently
   authored reproduction is `scripts/validate-international-original.py`;
   it does not modify or redistribute the original source. Its new C++
   execution passed with zero differences over actual db2–5: all 45
   canonical material tuples and 180 side/colour orientations. It used
   seed 443499273 and 14,170 candidates. Exact commands, raw compile,
   input, output and transcript hashes are in
   `evidence/checks/international-original/international-original-reference-report.json`.
   Source bytes remained unchanged, with no ABI patch. This result does
   not verify unsupplied six-piece partitions or draw-history conversion.
   Preserve source, input, output and transcript hashes.
   Five real six-piece classes also passed a private 10,000-query native
   comparison, retained under `evidence/checks/international-original-six-direct/`.
   The original generic opener requires db6-3030.idx1 for six-piece
   discovery; the prior unavailable-slice run is preserved under
   `international-original-six-discovery/`. The successful original adapter
   calls `egdb_open_wld_tun_v2(6,...)` directly without changing source
   algorithms. The tracked reproduction exposes explicit `--direct-v2`;
   its tracked rerun passed 10,000/10,000 with identical input/combined
   bytes, retained under `evidence/checks/international-original-six/`.
   This remains five of 37.
4. Coordinate complete corpus packaging before claiming delivery.
   A roughly 1 GB compressed payload cannot fit one ordinary GitHub
   blob (100 MB limit), and base64/worker/browser copies materially
   increase memory. Check the actual offline artifact and phone browser;
   do not treat a small working reference as full-six delivery.

Private current research assets are under
`/tmp/g10-rules-oracle-corpus`: actual sample in
`international-selective/output/app/`, setup/file-list/public metadata,
and parsed tables in `egdb-intl-format/tunstall-v2-tables-private.json`.
Private sparse installer files are scaffolding, not acquired corpus.

## Concrete large-artifact delivery alternatives

Live GitHub platform documentation was read on 2026-10-08, separately
from database permissions:

- https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage
  permits Git LFS files up to 2 GB on Free/Pro, 4 GB on Team and 5 GB on
  Enterprise Cloud. The ordinary Git blob limit is not the LFS limit.
  `git-lfs/3.6.1` is installed locally; no LFS configuration was changed.
- https://docs.github.com/en/billing/concepts/product-billing/git-lfs
  lists 10 GiB storage and 10 GiB monthly download bandwidth included
  for Free/Pro. This repository owner's current plan/remaining quota
  has not been inspected, and no purchase/upload was performed.
- https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases
  allows up to 1,000 release assets, each under 2 GiB, with no documented
  total-release or bandwidth limit.

Using the explicitly approximate installer totals, uncompressed binary
base64 for complete International db2–6 is about 1.35 GB. Adding the
actual American corpus/index and code gives roughly 1.41 GB before any
further compression. That estimate fits the documented 2 GB/2 GiB
channels; it is not a measured complete page or a browser PASS. A large
LFS-backed play.html would have to be obtained as the actual object rather
than its pointer. A release download can deliver the actual single file.
Both routes preserve the possibility of disk-open, inline, zero-network
gameplay; multi-file runtime fetches do not satisfy that requirement.

Full-core and page engineering still needs a complete acquired 37-class
payload, exact regenerated hashes/schema/spot checks, partitioned inline
transport rather than one giant aggregate string, and actual browser
startup/memory/frame measurements. Worker-only decoding can isolate
gameplay from the UI but has not been demonstrated for this full corpus.
These are concrete alternatives to an ordinary-blob size constraint,
not source availability blockers and not claimed complete delivery.
