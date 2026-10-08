#!/usr/bin/env python3
"""Pack a fixed Boost-licensed original International v2 dictionary reproducibly.

Only build/research-time I/O. The game/reference consumes the resulting arrays
in memory; this script does not import an engine or manufacture WLD outcomes.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re
import struct
import urllib.request

REVISION = "eacf10797e8f6c81d618caa7af1eba05df139ac7"
BASE = "https://raw.githubusercontent.com/eygilbert/egdb_intl/" + REVISION + "/"
SOURCE_URL = BASE + "egdb/tunstall_decompress_v2.txt"
SOURCE_SHA = "c000a78bbfdfc43f36779a0f1dc5ab529d597562003ed73f343ec83958a18401"
LICENSE_URL = BASE + "LICENSE_1_0.txt"
LICENSE_SHA = "c9bff75738922193e67fa726fa225535870d2aa1059f91452c411736284ad566"


def checked_fetch(url, expected):
    with urllib.request.urlopen(url, timeout=30) as response:
        data = response.read(300000)
    if hashlib.sha256(data).hexdigest() != expected:
        raise ValueError("Pinned dictionary/licence source checksum changed")
    return data


def pack(destination):
    source = checked_fetch(SOURCE_URL, SOURCE_SHA)
    licence = checked_fetch(LICENSE_URL, LICENSE_SHA)
    text = re.sub(r"/\*.*?\*/", "", source.decode("ascii"), flags=re.S)
    arrays = {name: [int(number) for number in re.findall(r"\d+", body)]
              for name, body in re.findall(
                  r"static unsigned (?:short|char) (\w+)\[\]\s*=\s*\{(.*?)\};", text, flags=re.S)}
    lengths = [arrays[f"runlength_t{i}_v2"] for i in range(50)]
    offsets = [arrays[f"runvalues_t{i}_v2"] for i in range(50)]
    value_runs = arrays["value_runs_v2"]
    if not all(len(row) == 256 for row in lengths + offsets) or len(value_runs) != 9877:
        raise ValueError("Pinned International dictionary shape changed")
    if any(not 1 <= value <= 65535 for row in lengths for value in row):
        raise ValueError("Invalid token length")
    if any(not 0 <= value < len(value_runs) for row in offsets for value in row):
        raise ValueError("Invalid run offset")
    packed = b"".join(struct.pack("<256H", *row) for row in lengths + offsets) + bytes(value_runs)
    if len(packed) != 61077:
        raise ValueError("Unexpected packed dictionary size")
    readable = (json.dumps({"lengths": lengths, "offsets": offsets, "valueRuns": value_runs},
                           separators=(",", ":")) + "\n").encode("ascii")
    manifest = {
        "schemaVersion": 1, "format": "Kingsrow International WLD Tunstall v2",
        "author": "Ed Gilbert; egdb_intl project contributors",
        "sourceUrl": SOURCE_URL, "sourceSha256": SOURCE_SHA,
        "sourceLicence": "Boost Software License 1.0", "licenceUrl": LICENSE_URL,
        "licenceSha256": LICENSE_SHA,
        "catalogues": 50, "tokensPerCatalogue": 256, "valueRunBytes": 9877,
        "packedLayout": "50x256 little-endian uint16 lengths; 50x256 uint16 offsets; 9877 value-run bytes",
        "tokenSemantics": "A token denotes its declared-length prefix of a potentially longer shared run descriptor.",
        "packedBytes": len(packed), "packedSha256": hashlib.sha256(packed).hexdigest(),
        "jsonBytes": len(readable), "jsonSha256": hashlib.sha256(readable).hexdigest(),
        "scope": "Decompression dictionaries only; no position outcomes or complete-six coverage implied.",
    }
    destination.mkdir(parents=True, exist_ok=True)
    (destination / "tunstall-v2.bin").write_bytes(packed)
    (destination / "tunstall-v2.json").write_bytes(readable)
    (destination / "LICENSE_1_0.txt").write_bytes(licence)
    (destination / "tunstall-v2-manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return manifest


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--out", required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(pack(args.out.resolve())))
