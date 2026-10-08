#!/usr/bin/env python3
"""Run the pinned Boost author's C++ driver against independent JS queries.

Original source is fetched into ignored/private work storage and is not changed.
The adapter only translates board squares into the driver's published bitboard
and calls egdb_open/egdb_lookup. Corpus permissions are separate from Boost.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import tarfile
import urllib.request

REVISION = "eacf10797e8f6c81d618caa7af1eba05df139ac7"
SOURCE_URL = "https://codeload.github.com/eygilbert/egdb_intl/tar.gz/" + REVISION
SOURCE_SHA = "9b52088cc0864e8fa68249d97145bfc2800313cbf34fac5b6eb214d0ea23f66c"
ROOT_NAME = "egdb_intl-" + REVISION
WRAPPER = r'''#include <cstdio>
#include "egdb/egdb_intl.h"
using namespace egdb_interface;
static void report(char const *message) { std::fputs(message, stderr); }
int main(int argc, char **argv) {
  if (argc != 2) return 2;
  EGDB_DRIVER *driver = egdb_open("maxpieces=6", 64, argv[1], report);
  if (!driver) return 3;
  unsigned id; int side;
  while (std::scanf("%u %d", &id, &side) == 2) {
    EGDB_POSITION position = {};
    for (int square = 0; square < 50; ++square) {
      int piece;
      if (std::scanf("%d", &piece) != 1) { egdb_close(driver); return 4; }
      EGDB_BITBOARD bit = EGDB_BITBOARD(1) << (square + square / 10);
      if (piece < 0) position.black |= bit;
      if (piece > 0) position.white |= bit;
      if (piece == 2 || piece == -2) position.king |= bit;
    }
    int value = egdb_lookup(driver, &position, side < 0 ? EGDB_BLACK : EGDB_WHITE, 0);
    std::printf("ORIGINAL %u %d\n", id, value);
  }
  return egdb_close(driver);
}
'''


def digest(data):
    return hashlib.sha256(data).hexdigest()


def checked_source(work, cached):
    archive = work / "egdb-original-source.tar.gz"
    if cached:
        source_bytes = cached.read_bytes()
    elif archive.exists():
        source_bytes = archive.read_bytes()
    else:
        with urllib.request.urlopen(SOURCE_URL, timeout=40) as response:
            source_bytes = response.read(1024 * 1024)
    if digest(source_bytes) != SOURCE_SHA:
        raise ValueError("Original Boost source archive checksum differs")
    archive.write_bytes(source_bytes)
    with tarfile.open(archive, "r:gz") as tar:
        for member in tar.getmembers():
            destination = (work / member.name).resolve()
            if not destination.is_relative_to(work) or member.issym() or member.islnk():
                raise ValueError("Unsafe original source archive member")
            if member.isdir():
                destination.mkdir(parents=True, exist_ok=True)
            elif member.isfile():
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(tar.extractfile(member).read())
            else:
                raise ValueError("Unexpected source archive member")
    return work / ROOT_NAME


def validate(args):
    work, evidence = args.work_dir.resolve(), args.evidence_dir.resolve()
    work.mkdir(parents=True, exist_ok=True)
    evidence.mkdir(parents=True, exist_ok=True)
    source = checked_source(work, args.source_archive)
    wrapper = work / "international-original-adapter.cpp"
    wrapper.write_text(WRAPPER, encoding="ascii")
    database = work / "database"
    database.mkdir(exist_ok=True)
    for directory in args.database:
        for path in sorted(directory.resolve().iterdir()):
            if not re.fullmatch(r"db(?:[2-5]|6-\d{4})\.(?:cpr1|idx1)", path.name):
                continue
            link = database / path.name
            if link.is_symlink():
                if digest(link.read_bytes()) != digest(path.read_bytes()):
                    raise ValueError("Different bytes for duplicate corpus file")
                link.unlink()
            elif link.exists():
                raise ValueError("Refusing to overwrite a non-symlink work corpus file")
            link.symlink_to(path)

    cpp_files = sorted(path for folder in ["builddb", "egdb", "engine", "Huffman", "Re-pair"]
                       for path in (source / folder).rglob("*.cpp"))
    executable = work / "international-original-driver"
    compile_command = ["g++", "-std=c++17", "-O2", "-pthread", "-I", str(source), str(wrapper)]
    compile_command += [str(path) for path in cpp_files] + ["-o", str(executable)]
    compiled = subprocess.run(compile_command, capture_output=True)
    (evidence / "international-original-compile.stdout").write_bytes(compiled.stdout)
    (evidence / "international-original-compile.stderr").write_bytes(compiled.stderr)
    if compiled.returncode:
        raise RuntimeError("Original Boost C++ compile failed; see raw compile evidence")
    case_command = ["node", str(Path(__file__).resolve().parent / "international-original-cases.mjs"),
                    "--dictionary", str(args.dictionary.resolve()), "--out", str(evidence),
                    "--pieces", args.pieces, "--cases", str(args.cases)]
    for directory in args.database:
        case_command += ["--database", str(directory.resolve())]
    generated = subprocess.run(case_command, capture_output=True)
    (evidence / "international-original-generation.stdout").write_bytes(generated.stdout)
    (evidence / "international-original-generation.stderr").write_bytes(generated.stderr)
    if generated.returncode:
        raise RuntimeError("Independent reference generation failed; see raw evidence")
    query_bytes = (evidence / "international-original-queries.txt").read_bytes()
    query_command = [str(executable), str(database) + os.sep]
    executed = subprocess.run(query_command, input=query_bytes, capture_output=True)
    (evidence / "international-original-stdout.txt").write_bytes(executed.stdout)
    (evidence / "international-original-stderr.txt").write_bytes(executed.stderr)
    if executed.returncode:
        raise RuntimeError("Original Boost driver failed; see raw stdout/stderr")
    rows = [json.loads(line) for line in (evidence / "international-original-expected.jsonl").read_text().splitlines()]
    returned = re.findall(rb"^ORIGINAL (\d+) (-?\d+)$", executed.stdout, re.MULTILINE)
    values = {int(identifier): int(value) for identifier, value in returned}
    if len(returned) != args.cases or len(values) != args.cases or len(rows) != args.cases:
        raise ValueError("Original driver returned missing or duplicate query IDs")
    symbols = {"win": 1, "loss": 2, "draw": 3}
    disagreements = []
    for row in rows:
        row["originalCpp"] = values.get(row["id"])
        if row["originalCpp"] != symbols[row["value"]]:
            disagreements.append(row)
    transcript = ("\n".join(json.dumps(row, separators=(",", ":")) for row in rows) + "\n").encode("ascii")
    (evidence / "international-original-reference.jsonl").write_bytes(transcript)
    report = json.loads((evidence / "international-original-cases.json").read_text())
    report.update({
        "status": "FAIL" if disagreements else "PASS", "disagreements": len(disagreements),
        "sourceUrl": SOURCE_URL, "sourceRevision": REVISION, "sourceArchiveSha256": SOURCE_SHA,
        "wrapperSha256": digest(WRAPPER.encode("ascii")), "compiledBinarySha256": digest(executable.read_bytes()),
        "compileCommand": compile_command, "caseCommand": case_command, "queryCommand": query_command,
        "transcriptSha256": digest(transcript), "stdoutSha256": digest(executed.stdout),
        "stderrSha256": digest(executed.stderr), "stderrBytes": len(executed.stderr),
        "compatibilityNotes": "Compile the exact original sources directly with the source folders from example/CMakeLists.txt; root CMake names absent example directories. Original source bytes unchanged.",
        "sourceLicense": "Boost Software License 1.0; separate original-author data grant recorded in SOURCES.md.",
        "algorithmChanges": "None: original ranking, canonical orientation and decoding are unchanged."
    })
    (evidence / "international-original-reference-report.json").write_text(json.dumps(report, indent=2) + "\n")
    if disagreements:
        (evidence / "international-original-disagreements.json").write_text(json.dumps(disagreements, indent=2) + "\n")
        raise ValueError("Original C++/independent JS disagreement at query " + str(disagreements[0]["id"]))
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--database", required=True, type=Path, action="append")
    parser.add_argument("--dictionary", required=True, type=Path)
    parser.add_argument("--pieces", default="2,3,4,5")
    parser.add_argument("--cases", default=10000, type=int)
    parser.add_argument("--source-archive", type=Path)
    parser.add_argument("--work-dir", type=Path, default=Path(".work/international-original"))
    parser.add_argument("--evidence-dir", type=Path,
                        default=Path(os.environ["G10_EVIDENCE_DIR"]) if os.environ.get("G10_EVIDENCE_DIR")
                        else Path(__file__).resolve().parent.parent / "evidence/checks")
    args = parser.parse_args()
    print(json.dumps({"phase": "start", "pid": os.getpid(), "pgid": os.getpgrp()}), flush=True)
    print(json.dumps(validate(args)), flush=True)
