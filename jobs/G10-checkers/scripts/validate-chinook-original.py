#!/usr/bin/env python3
"""Validate original JS against the author's C driver without committing that source.

The fixed author source is downloaded into .work, hash-checked and adapted for
LP64. Only integer-width/allocation repairs and an original input adapter are
applied. The ranking and decompression algorithms are unchanged.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import urllib.request

SOURCE_URL = "https://webdocs.cs.ualberta.ca/~chinook/databases/code.c"
SOURCE_SHA = "50853f33909f5cb2b525d437cedcaad1dc52e24106c0215b6f327668a36a02ab"
ADAPTED_SHA = "824e69492993f824e6b788e95379e12ff1b13a9cd90edeb0365b762b32228279"
DATA_SHA = "baee42a2b49390edd96e5a751189366275619c941d79021f3ca45774c3e7071f"
INDEX_SHA = "10cb5cfc2a8c67e18c322563c17ceef0adeac87786a16c767c4616e9a574f4fd"
QUERY_SHA = "1f6505955a8c225bdcda313a871c597b66ad11e546a2bf19bb32c96d3284e2e2"
TRANSCRIPT_SHA = "02d4ad2ac2a186c78603faaf85774e2bcd8c44a5530206e3354205babca0d236"

WRAPPER = '''#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/types.h>
#define main chinook_legacy_main
#include "chinook-access-abi.c"
#undef main
int main(void) {
 unsigned id; int requested, index, piece;
 unsigned n;
 for (n = 1; n < 65536; n++) NextBit[n] = 31 - __builtin_clz(n);
 NextBit[0] = 0;
 DBInit();
 while (scanf("%u %d", &id, &requested) == 2) {
  Locbv[WHITE] = Locbv[BLACK] = Locbv[KINGS] = 0;
  for (index = 0; index < 32; index++) {
   int row = 7 - index / 4;
   int bit = row / 2 + ((row & 1) ? 4 : 0) + 8 * (index % 4);
   unsigned long mask = 1UL << bit;
   if (scanf("%d", &piece) != 1) return 2;
   if (piece > 0) Locbv[WHITE] |= mask;
   if (piece < 0) Locbv[BLACK] |= mask;
   if (piece == 2 || piece == -2) Locbv[KINGS] |= mask;
  }
  Turn = requested > 0 ? WHITE : BLACK;
  printf("ORIGINAL %u %ld\\n", id, DBLookup());
 }
 return 0;
}
'''


def digest(data):
    return hashlib.sha256(data).hexdigest()


def replace_exact(source, before, after, count):
    if source.count(before) != count:
        raise ValueError("Author source differs at an audited ABI patch site")
    return source.replace(before, after)


def validate(args):
    script_dir = Path(__file__).resolve().parent
    work = args.work_dir.resolve()
    evidence = args.evidence_dir.resolve()
    work.mkdir(parents=True, exist_ok=True)
    evidence.mkdir(parents=True, exist_ok=True)
    for path, expected in [(args.data, DATA_SHA), (args.index, INDEX_SHA)]:
        if digest(path.read_bytes()) != expected:
            raise ValueError("Corpus bytes differ from the audited author archive")

    source_path = work / "chinook-access.c"
    if source_path.exists():
        source_bytes = source_path.read_bytes()
    else:
        with urllib.request.urlopen(SOURCE_URL, timeout=30) as response:
            source_bytes = response.read(100000)
    if digest(source_bytes) != SOURCE_SHA:
        raise ValueError("Original author driver source checksum differs")
    source_path.write_bytes(source_bytes)
    adapted = source_bytes.decode("ascii")
    adapted = replace_exact(adapted, "return( (unsigned)", "return( (unsigned long)", 3)
    adapted = replace_exact(adapted, "long * dbindex, buffers;", "long * dbindex, buffers = 0;", 1)
    for arrays in ["bppos[MAX_PIECES], wppos[MAX_PIECES];",
                   "bkpos[MAX_PIECES], wkpos[MAX_PIECES];", "XXhits[MAX_PIECES];"]:
        adapted = replace_exact(adapted, "int\t\t" + arrays, "long\t\t" + arrays, 1)
    if digest(adapted.encode("ascii")) != ADAPTED_SHA:
        raise ValueError("ABI-adapted source checksum differs")
    (work / "chinook-access-abi.c").write_text(adapted, encoding="ascii")
    (work / "chinook-original-adapter.c").write_text(WRAPPER, encoding="ascii")
    for name, target in [("DB6", args.data.resolve()), ("DB6.idx", args.index.resolve())]:
        link = work / name
        if link.is_symlink():
            link.unlink()
        elif link.exists():
            raise ValueError("Refusing to overwrite a non-symlink work corpus file")
        link.symlink_to(target)

    compile_command = ["cc", "-std=gnu89", "-O2", "-w", "chinook-original-adapter.c", "-o", "chinook-original-driver"]
    compiled = subprocess.run(compile_command, cwd=work, text=True, capture_output=True)
    (evidence / "chinook-original-compile.txt").write_text(compiled.stdout + compiled.stderr, encoding="utf-8")
    if compiled.returncode:
        raise RuntimeError("Original-C audit compiler failed; see compile evidence")
    case_command = ["node", str(script_dir / "chinook-original-cases.mjs"),
                    "--data", str(args.data.resolve()), "--index", str(args.index.resolve()), "--out", str(evidence)]
    subprocess.run(case_command, check=True, text=True, capture_output=True)
    query_bytes = (evidence / "chinook-original-queries.txt").read_bytes()
    if digest(query_bytes) != QUERY_SHA:
        raise ValueError("Fixed-seed independent query transcript changed")
    executed = subprocess.run([str(work / "chinook-original-driver")], cwd=work,
                              input=query_bytes, capture_output=True)
    (evidence / "chinook-original-stdout.txt").write_bytes(executed.stdout)
    (evidence / "chinook-original-stderr.txt").write_bytes(executed.stderr)
    if executed.returncode:
        raise RuntimeError("Original-C audit failed; see stdout/stderr evidence")
    rows = [json.loads(line) for line in (evidence / "chinook-original-expected.jsonl").read_text().splitlines()]
    returned = re.findall(rb"^ORIGINAL (\d+) (-?\d+)$", executed.stdout, re.MULTILINE)
    values = {int(identifier): int(value) for identifier, value in returned}
    if len(returned) != 10000 or len(values) != 10000 or len(rows) != 10000:
        raise ValueError("Original-C audit returned missing or duplicate query IDs")
    symbols = {"draw": 0, "win": 1, "loss": 2}
    for row in rows:
        if values.get(row["id"]) != symbols[row["value"]]:
            raise ValueError("Original-C/independent-JS disagreement at query " + str(row["id"]))
        row["originalC"] = values[row["id"]]
    transcript = ("\n".join(json.dumps(row, separators=(",", ":")) for row in rows) + "\n").encode("ascii")
    if digest(transcript) != TRANSCRIPT_SHA:
        raise ValueError("Original-C/JS agreed transcript changed")
    (evidence / "chinook-original-reference.jsonl").write_bytes(transcript)
    report = json.loads((evidence / "chinook-original-cases.json").read_text())
    report.update({
        "status": "PASS", "sourceUrl": SOURCE_URL, "originalSourceSha256": SOURCE_SHA,
        "adaptedSourceSha256": ADAPTED_SHA, "wrapperSha256": digest(WRAPPER.encode("ascii")),
        "compiledBinarySha256": digest((work / "chinook-original-driver").read_bytes()),
        "compileCommand": compile_command, "caseCommand": case_command,
        "transcriptSha256": digest(transcript), "stdoutSha256": digest(executed.stdout),
        "stderrBytes": len(executed.stderr),
        "abiChanges": ["Widen three unsigned sentinel casts to match unsigned-long return type.",
                       "Use long for five square/hit arrays passed to long* rank functions.",
                       "Add system prototypes and rename the unused interactive demo main."],
        "allocationUndefinedBehaviorRepair": "Initialize DBInit local buffers to zero before adding the buffer count.",
        "algorithmChanges": "None: published ranking, side normalization and decompression are unchanged.",
    })
    (evidence / "chinook-original-reference-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data", required=True, type=Path)
    parser.add_argument("--index", required=True, type=Path)
    parser.add_argument("--work-dir", type=Path, default=Path(".work/chinook-original"))
    parser.add_argument("--evidence-dir", type=Path,
                        default=Path(os.environ["G10_EVIDENCE_DIR"]) if os.environ.get("G10_EVIDENCE_DIR")
                        else Path(__file__).resolve().parent.parent / "evidence/checks")
    arguments = parser.parse_args()
    print(json.dumps({"phase": "start", "pid": os.getpid(), "pgid": os.getpgrp()}), flush=True)
    print(json.dumps(validate(arguments)), flush=True)
