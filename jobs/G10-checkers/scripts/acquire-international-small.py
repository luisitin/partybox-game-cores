#!/usr/bin/env python3
"""Acquire the fixed licensed Kingsrow International 2–5 files into private output.

The first six-piece Inno chunk begins at 24775197, so this prefix excludes
every six-piece payload. Sparse zeros never count as acquired database data.
Temporary signed URLs and derived public file keys are not included in reports.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import urllib.error
import urllib.request
import zlib

FOLDER = "vRhFgSjR"
PUBLIC_KEY = "bqlaniDcxC65fZWpnovROA"
PUBLIC_URL = "https://mega.nz/folder/" + FOLDER + "#" + PUBLIC_KEY
API_URL = "https://g.api.mega.co.nz/cs?n=" + FOLDER
PREFIX_BYTES = 24775197
SETUP_SHA = "7061f83d686cec8affff4d1fc69efbb7c2d6122615b3e723458db198c54f7b65"
EXPECTED = {
    "db2.cpr1": ("283183260efd325b86a5a3f821f32a7f894d26fd", 0x0319ba8c),
    "db2.idx1": ("a2635ce151c966fee790c3c2cb74451972c3a778", 0x07a9f0f3),
    "db3.cpr1": ("e2edda6ddc6f4a415332e4f1434e92e080e004a7", 0x098b476b),
    "db3.idx1": ("655b54d1517fc6b57b2460c9adfe0ebba4b348da", 0x8e96b77d),
    "db4.cpr1": ("9d9dc5b961f8f8757ef8de23ddf712f0a4438095", 0x08b0249a),
    "db4.idx1": ("5592b41fa30d1f31a7cea98cb3d9d95036e12e42", 0xc3a84295),
    "db5.cpr1": ("f47bb68394114a36deeba84c6251ad12579ee739", 0x3cda0517),
    "db5.idx1": ("f110db1afb65207250330f48eb997af08d408342", 0xc5912d8f),
}


def api(command):
    request = urllib.request.Request(API_URL, data=json.dumps([command]).encode(),
                                     headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            result = json.load(response)[0]
    except (urllib.error.URLError, TimeoutError):
        raise RuntimeError("Public folder API retrieval failed") from None
    if not isinstance(result, dict):
        raise RuntimeError("Public folder API returned an error code")
    return result


def download(info, path, prefix=None):
    if path.exists():
        size = prefix if prefix is not None else info["bytes"]
        if path.stat().st_size == size:
            return
        raise ValueError("Existing encrypted acquisition has unexpected size")
    detail = api({"a": "g", "g": 1, "n": info["handle"]})
    expected = prefix if prefix is not None else info["bytes"]
    partial = path.with_name(path.name + ".partial")
    with partial.open("wb") as output:
        for start in range(0, expected, 8 * 1024 * 1024):
            end = min(expected, start + 8 * 1024 * 1024) - 1
            request = urllib.request.Request(detail["g"], headers={"Range": f"bytes={start}-{end}"})
            try:
                with urllib.request.urlopen(request, timeout=60) as response:
                    if response.status != 206 or response.headers.get("Content-Range") != f"bytes {start}-{end}/{info['bytes']}":
                        raise RuntimeError("Range response differs from exact public prefix")
                    data = response.read(end - start + 2)
            except (urllib.error.URLError, TimeoutError):
                raise RuntimeError("Public encrypted file/range retrieval failed") from None
            if len(data) != end - start + 1:
                raise ValueError("Encrypted acquisition byte count differs")
            output.write(data)
            print(json.dumps({"phase": "range", "file": info["name"], "firstByte": start,
                              "lastByte": end, "bytes": len(data),
                              "encryptedSha256": hashlib.sha256(data).hexdigest()}), flush=True)
    partial.replace(path)


def acquire(args):
    destination = args.out.resolve()
    destination.mkdir(parents=True, exist_ok=True, mode=0o700)
    installer = destination / "installer"
    installer.mkdir(exist_ok=True, mode=0o700)
    helper = Path(__file__).resolve().with_name("international-mega-crypto.mjs")
    metadata = json.loads(args.metadata.read_text())[0] if args.metadata else api({"a": "f", "c": 1, "r": 1, "ca": 1})
    process = subprocess.run(["node", str(helper), "metadata"], input=json.dumps({"folderKey": PUBLIC_KEY, "nodes": metadata["f"]}), text=True, capture_output=True, check=True)
    files = json.loads(process.stdout)
    setup = next(row for row in files if row["name"] == "Kingsrow_Intl_7pc_WLD_Setup.exe")
    first = next(row for row in files if row["name"] == "Kingsrow_Intl_7pc_WLD_Setup-1.bin")
    if setup["bytes"] != 313345 or first["bytes"] != 2099686144:
        raise ValueError("Fixed public installer metadata changed")
    for info, prefix in [(setup, None), (first, PREFIX_BYTES)]:
        key_file = installer / (info["name"] + ".public-key.json")
        key_file.write_text(json.dumps(info))
        key_file.chmod(0o600)
        encrypted = installer / (info["name"] + ".encrypted")
        download(info, encrypted, prefix)
        subprocess.run(["node", str(helper), "decrypt", str(key_file), str(encrypted), str(installer / info["name"])], check=True, capture_output=True)
    executable = installer / setup["name"]
    if hashlib.sha256(executable.read_bytes()).hexdigest() != SETUP_SHA:
        raise ValueError("Original setup checksum differs")
    extraction = [str(args.extractor.resolve()), "--output-dir", str(destination)]
    for name in EXPECTED:
        extraction.extend(["--include", "app/" + name])
    extraction.append(str(executable))
    extracted = subprocess.run(extraction, text=True, capture_output=True)
    (destination / "extract.stdout").write_text(extracted.stdout)
    (destination / "extract.stderr").write_text(extracted.stderr)
    if extracted.returncode:
        raise RuntimeError("Private exact-file extraction failed; see sanitized logs")
    manifest_files = {}
    for name, (sha1, crc) in EXPECTED.items():
        data = (destination / "app" / name).read_bytes()
        if hashlib.sha1(data).hexdigest() != sha1 or zlib.crc32(data) != crc:
            raise ValueError("Acquired file fails original installer/driver checksum: " + name)
        manifest_files[name] = {"bytes": len(data), "sha1": sha1, "crc32": f"{crc:08x}",
                                "sha256": hashlib.sha256(data).hexdigest()}
    manifest = {
        "schemaVersion": 1, "author": "Ed Gilbert", "publicFolderUrl": PUBLIC_URL,
        "dataPermissionUrl": "https://damforum.nl/bb3/viewtopic.php?t=8341",
        "dataPermission": "Database author states these International databases are available without restrictions.",
        "driverSourceUrl": "https://github.com/eygilbert/egdb_intl",
        "setupSha256": SETUP_SHA, "acquiredFirstBinPrefixBytes": PREFIX_BYTES,
        "sparseInstallerScope": "Only prefix acquired; remaining zeros are not database bytes.",
        "piecesAcquired": [2, 3, 4, 5], "sixPieceAcquired": False, "files": manifest_files,
        "probeScope": "Theoretical International WLD v2, draw history absent; reader correctness separately verified.",
    }
    (destination / "international-small-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, type=Path)
    parser.add_argument("--extractor", required=True, type=Path)
    parser.add_argument("--metadata", type=Path, help="Optional already acquired public folder JSON response")
    args = parser.parse_args()
    print(json.dumps({"phase": "start", "pid": os.getpid(), "pgid": os.getpgrp()}), flush=True)
    print(json.dumps(acquire(args)), flush=True)
