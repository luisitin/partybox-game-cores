#!/usr/bin/env python3
"""Acquire the author's fixed DB6 corpus into a caller-selected private directory.

No repository commit, runtime network dependency, or engine source import.
The manifest records the author's free-use/acknowledgement/no-sale conditions.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import re
import urllib.request
import zipfile

ARCHIVE_URL = "https://webdocs.cs.ualberta.ca/~chinook/DataBases/DB6.zip"
TERMS_URL = "https://webdocs.cs.ualberta.ca/~chinook/Software/"
EXPECTED = {
    "DB6.zip": (27701728, "35835dae65a962eafdf5cde290bce380117445acb21819dd0e266b3b0efab3b3"),
    "DB6": (48132029, "baee42a2b49390edd96e5a751189366275619c941d79021f3ca45774c3e7071f"),
    "DB6.idx": (900418, "10cb5cfc2a8c67e18c322563c17ceef0adeac87786a16c767c4616e9a574f4fd"),
}


def checked(name, data):
    size, digest = EXPECTED[name]
    if len(data) != size or hashlib.sha256(data).hexdigest() != digest:
        raise ValueError(f"{name}: size/checksum differs from the audited author archive")
    return data


def acquire(destination):
    destination.mkdir(parents=True, exist_ok=True)
    archive_path = destination / "DB6.zip"
    if archive_path.exists():
        archive = checked("DB6.zip", archive_path.read_bytes())
    else:
        with urllib.request.urlopen(ARCHIVE_URL, timeout=60) as response:
            archive = checked("DB6.zip", response.read(EXPECTED["DB6.zip"][0] + 1))
        archive_path.write_bytes(archive)
    with zipfile.ZipFile(io.BytesIO(archive)) as zipped:
        if sorted(zipped.namelist()) != ["DB6", "DB6.idx"]:
            raise ValueError("Unexpected author archive members")
        for name in ["DB6", "DB6.idx"]:
            (destination / name).write_bytes(checked(name, zipped.read(name)))

    index = (destination / "DB6.idx").read_text(encoding="ascii")
    actual = {tuple(map(int, match.groups())) for match in re.finditer(
        r"^BASE([0-9])([0-9])([0-9])([0-9])\.", index, re.MULTILINE)}
    coverage = []
    for pieces in range(2, 7):
        expected = {(bk, wk, bp, wp)
                    for bk in range(6) for wk in range(6)
                    for bp in range(6) for wp in range(6)
                    if bk + wk + bp + wp == pieces and bk + bp > 0 and wk + wp > 0}
        found = {entry for entry in actual if sum(entry) == pieces}
        if found != expected:
            raise ValueError(f"Missing/surplus {pieces}-piece material tuples")
        coverage.append({"pieces": pieces, "pieceTypeTuples": len(found),
                         "materialSplits": sorted({tuple(sorted((t[0] + t[2], t[1] + t[3]))) for t in found})})
    manifest = {
        "schemaVersion": 1,
        "author": "Chinook project, University of Alberta",
        "archiveUrl": ARCHIVE_URL,
        "termsUrl": TERMS_URL,
        "terms": "Free use requires acknowledgement of the Chinook project; sale of these databases is prohibited.",
        "formatSourceUrl": "https://webdocs.cs.ualberta.ca/~chinook/databases/code.c",
        "files": {name: {"bytes": size, "sha256": digest} for name, (size, digest) in EXPECTED.items()},
        "baseSlices": len(re.findall(r"^BASE", index, re.MULTILINE)),
        "materialCoverage": coverage,
        "coverageCheckScope": "All nonempty 2–6 material/king/man tuples are present; probe/rank correctness requires separate independent checks.",
        "probeContract": "American theoretical WDL; direct stored queries require no capture for either side. Draw history is not stored.",
    }
    (destination / "chinook-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, type=Path, help="Private output directory, outside the checkout")
    args = parser.parse_args()
    print(json.dumps({"phase": "start", "pid": os.getpid(), "pgid": os.getpgrp()}), flush=True)
    manifest = acquire(args.out.resolve())
    print(json.dumps({"phase": "complete", "manifest": manifest}), flush=True)
