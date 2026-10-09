#!/usr/bin/env python3
"""Split, verify and join one byte-identical offline page; standard library only."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import tempfile

MAX_PART_BYTES = 384 * 1024 * 1024
BUFFER_BYTES = 1024 * 1024
EXPECTED_STAGES = ["node", "league-american", "league-international", "browser"]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON key: " + key)
        result[key] = value
    return result


def read_json(path):
    return json.loads(Path(path).read_text(), object_pairs_hook=unique_object)


def file_digest(path):
    digest = hashlib.sha256()
    with Path(path).open("rb") as source:
        while block := source.read(BUFFER_BYTES):
            digest.update(block)
    return digest.hexdigest()


def validate_receipt(receipt):
    require(receipt["schemaVersion"] == 1, "Unknown receipt schema")
    require(re.fullmatch(r"[a-f0-9]{40}", receipt["sourceCommit"]) is not None,
            "Missing exact source commit")
    require(receipt["checkoutCommit"] == receipt["sourceCommit"], "Wrong checkout commit")
    require(receipt["page"] == "play.html", "Wrong page name")
    require(type(receipt["bytes"]) is int and receipt["bytes"] > 0, "Wrong total byte count")
    require(re.fullmatch(r"[a-f0-9]{64}", receipt["sha256"]) is not None, "Wrong whole SHA")
    require(receipt["acceptedStages"] == EXPECTED_STAGES, "Missing accepted CI stage")


def validate_manifest(manifest):
    require(manifest["schemaVersion"] == 1, "Unknown parts schema")
    validate_receipt(manifest["deliveryReceipt"])
    require(type(manifest["partBytes"]) is int and 0 < manifest["partBytes"] <= MAX_PART_BYTES,
            "Part exceeds the bounded upload size")
    require(manifest["helper"] == "standalone-parts.py", "Unexpected JOIN helper")
    require(re.fullmatch(r"[a-f0-9]{64}", manifest["helperSha256"]) is not None, "Wrong helper SHA")
    parts = manifest["parts"]
    require(type(parts) is list and 0 < len(parts) <= 100, "Wrong part list")
    offset = 0
    for index, part in enumerate(parts):
        require(set(part) == {"name", "offset", "bytes", "sha256"}, "Unexpected part fields")
        require(part["name"] == f"play.html.part-{index:02d}", "Wrong part name or order")
        require(type(part["offset"]) is int and part["offset"] == offset, "Noncontiguous offset")
        require(type(part["bytes"]) is int and 0 < part["bytes"] <= manifest["partBytes"],
                "Wrong part byte count")
        if index < len(parts) - 1:
            require(part["bytes"] == manifest["partBytes"], "Short nonfinal part")
        require(re.fullmatch(r"[a-f0-9]{64}", part["sha256"]) is not None, "Wrong part SHA")
        offset += part["bytes"]
    require(offset == manifest["deliveryReceipt"]["bytes"], "Parts do not cover the whole page")


def verify_parts(manifest_path, output=None):
    manifest_path = Path(manifest_path)
    manifest = read_json(manifest_path)
    validate_manifest(manifest)
    directory = manifest_path.parent
    require(file_digest(directory / manifest["helper"]) == manifest["helperSha256"],
            "JOIN helper changed")
    require(read_json(directory / "standalone-delivery.json") == manifest["deliveryReceipt"],
            "Delivery receipt differs from manifest")
    expected = [part["name"] for part in manifest["parts"]]
    require(sorted(p.name for p in directory.glob("play.html.part-*")) == expected,
            "Missing or extra page part")
    whole = hashlib.sha256()
    total = 0
    for part in manifest["parts"]:
        path = directory / part["name"]
        require(not path.is_symlink() and path.is_file(), "Page part is not a regular file")
        require(path.stat().st_size == part["bytes"], "Page part size differs")
        digest = hashlib.sha256()
        count = 0
        with path.open("rb") as source:
            while block := source.read(BUFFER_BYTES):
                digest.update(block)
                whole.update(block)
                count += len(block)
                if output is not None:
                    output.write(block)
        require(count == part["bytes"] and digest.hexdigest() == part["sha256"],
                "Page part bytes changed")
        total += count
    require(total == manifest["deliveryReceipt"]["bytes"], "Whole page size differs")
    require(whole.hexdigest() == manifest["deliveryReceipt"]["sha256"], "Whole page SHA differs")
    return {"status": "PASS", "sourceCommit": manifest["deliveryReceipt"]["sourceCommit"],
            "parts": len(manifest["parts"]), "bytes": total, "sha256": whole.hexdigest()}


def join_parts(manifest_path, output_path):
    output_path = Path(output_path)
    # Exclusive creation prevents replacing a page or a downloaded input.
    with output_path.open("xb") as output:
        try:
            result = verify_parts(manifest_path, output)
        except BaseException:
            output.close()
            output_path.unlink()
            raise
    return result


def split_page(page_path, receipt_path, directory, part_bytes=MAX_PART_BYTES):
    page_path, receipt_path, directory = Path(page_path), Path(receipt_path), Path(directory)
    receipt = read_json(receipt_path)
    validate_receipt(receipt)
    require(type(part_bytes) is int and 0 < part_bytes <= MAX_PART_BYTES, "Wrong part limit")
    require(page_path.stat().st_size == receipt["bytes"], "Accepted page size changed")
    directory.mkdir(parents=True, exist_ok=False)
    parts, whole, offset = [], hashlib.sha256(), 0
    with page_path.open("rb") as source:
        while offset < receipt["bytes"]:
            name = f"play.html.part-{len(parts):02d}"
            count, digest = 0, hashlib.sha256()
            with (directory / name).open("xb") as destination:
                while count < part_bytes:
                    block = source.read(min(BUFFER_BYTES, part_bytes - count))
                    if not block:
                        break
                    destination.write(block)
                    digest.update(block)
                    whole.update(block)
                    count += len(block)
            require(count > 0, "Accepted page was truncated during split")
            parts.append({"name": name, "offset": offset, "bytes": count,
                          "sha256": digest.hexdigest()})
            offset += count
        require(source.read(1) == b"", "Accepted page grew during split")
    require(whole.hexdigest() == receipt["sha256"], "Accepted page SHA changed")
    shutil.copyfile(receipt_path, directory / "standalone-delivery.json")
    shutil.copyfile(Path(__file__), directory / "standalone-parts.py")
    manifest = {"schemaVersion": 1, "partBytes": part_bytes, "deliveryReceipt": receipt,
                "helper": "standalone-parts.py", "helperSha256": file_digest(Path(__file__)),
                "parts": parts,
                "join": "python3 standalone-parts.py join standalone-parts.json play.html",
                "publication": "Four bounded GitHub Actions artifacts; seven-day retention; "
                               "download all four and extract into the same folder. No runtime network."}
    validate_manifest(manifest)
    (directory / "standalone-parts.json").write_text(json.dumps(manifest, indent=2) + "\n")
    return verify_parts(directory / "standalone-parts.json")


def controls():
    rejected = []
    with tempfile.TemporaryDirectory(prefix="g10-delivery-controls-") as temporary:
        root = Path(temporary)
        page = root / "original.html"
        original = bytes((index * 73 + 19) % 256 for index in range(4097))
        page.write_bytes(original)
        receipt = {"schemaVersion": 1, "sourceCommit": "a" * 40, "checkoutCommit": "a" * 40,
                   "page": "play.html", "bytes": len(original), "sha256": hashlib.sha256(original).hexdigest(),
                   "acceptedStages": EXPECTED_STAGES}
        receipt_path = root / "receipt.json"
        receipt_path.write_text(json.dumps(receipt))
        directory = root / "parts"
        result = split_page(page, receipt_path, directory, part_bytes=1024)
        require(result["parts"] == 5, "Boundary fixture must span five parts")
        manifest_path = directory / "standalone-parts.json"
        join_parts(manifest_path, root / "joined.html")
        require((root / "joined.html").read_bytes() == original, "JOIN changed a boundary byte")
        good = manifest_path.read_bytes()

        def reject(name, action):
            try:
                action()
            except (ValueError, FileNotFoundError, KeyError, FileExistsError):
                rejected.append(name)
            else:
                raise AssertionError("Corruption accepted: " + name)

        def change(name, mutate):
            manifest = json.loads(good)
            mutate(manifest)
            manifest_path.write_text(json.dumps(manifest))
            reject(name, lambda: verify_parts(manifest_path))
            manifest_path.write_bytes(good)

        change("wrong-part-order", lambda m: m["parts"].reverse())
        change("duplicate-part", lambda m: m["parts"].__setitem__(1, m["parts"][0].copy()))
        change("gap-offset", lambda m: m["parts"][1].__setitem__("offset", 1025))
        change("wrong-part-size", lambda m: m["parts"][0].__setitem__("bytes", 1023))
        change("wrong-part-sha", lambda m: m["parts"][0].__setitem__("sha256", "0" * 64))
        change("wrong-whole-sha", lambda m: m["deliveryReceipt"].__setitem__("sha256", "0" * 64))
        change("wrong-checkout", lambda m: m["deliveryReceipt"].__setitem__("checkoutCommit", "b" * 40))
        change("wrong-whole-size", lambda m: m["deliveryReceipt"].__setitem__("bytes", 4098))
        change("oversized-part-limit", lambda m: m.__setitem__("partBytes", MAX_PART_BYTES + 1))
        change("absolute-part-path", lambda m: m["parts"][0].__setitem__("name", "/play.html.part-00"))
        change("wrong-helper-sha", lambda m: m.__setitem__("helperSha256", "0" * 64))
        change("missing-accepted-stage", lambda m: m["deliveryReceipt"].__setitem__("acceptedStages", EXPECTED_STAGES[:-1]))
        coherent = json.loads(good)
        coherent["deliveryReceipt"]["sha256"] = "0" * 64
        manifest_path.write_text(json.dumps(coherent))
        standalone_receipt = directory / "standalone-delivery.json"
        receipt_bytes = standalone_receipt.read_bytes()
        standalone_receipt.write_text(json.dumps(coherent["deliveryReceipt"]))
        reject("coherent-sidecars-wrong-whole-sha", lambda: verify_parts(manifest_path))
        standalone_receipt.write_bytes(receipt_bytes)
        manifest_path.write_bytes(good)
        first = directory / "play.html.part-00"
        saved = first.read_bytes()
        first.write_bytes(saved[:-1])
        reject("truncated-part", lambda: verify_parts(manifest_path))
        first.write_bytes(bytes([saved[0] ^ 1]) + saved[1:])
        reject("changed-part-same-size", lambda: verify_parts(manifest_path))
        reject("JOIN-removes-incomplete-output", lambda: join_parts(manifest_path, root / "bad-joined.html"))
        require(not (root / "bad-joined.html").exists(), "Rejected JOIN left a usable partial page")
        first.write_bytes(saved)
        first.rename(directory / "missing")
        reject("missing-part", lambda: verify_parts(manifest_path))
        first.symlink_to(directory / "missing")
        reject("symlink-part", lambda: verify_parts(manifest_path))
        first.unlink()
        (directory / "missing").rename(first)
        extra = directory / "play.html.part-99"
        extra.write_bytes(b"stale")
        reject("extra-stale-part", lambda: verify_parts(manifest_path))
        extra.unlink()
        manifest_path.write_bytes(b'{"schemaVersion":1,"schemaVersion":1}')
        reject("duplicate-json-key", lambda: verify_parts(manifest_path))
        manifest_path.write_bytes(good)
        reject("JOIN-keeps-existing-output", lambda: join_parts(manifest_path, root / "joined.html"))
        require((root / "joined.html").read_bytes() == original, "Existing page was overwritten")
        verify_parts(manifest_path)
    return {"status": "PASS", "positives": 4, "rejected": len(rejected), "controls": rejected,
            "scope": "Real split/re-read/JOIN boundary fixture plus meaningful part/order/digest/source and incomplete-output corruptions; not game delivery acceptance"}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    split = commands.add_parser("split")
    split.add_argument("page")
    split.add_argument("receipt")
    split.add_argument("directory")
    for name in ["verify", "join"]:
        command = commands.add_parser(name)
        command.add_argument("manifest")
        if name == "join":
            command.add_argument("output")
    commands.add_parser("controls")
    args = parser.parse_args()
    if args.command == "controls":
        result = controls()
    elif args.command == "split":
        receipt = read_json(args.receipt)
        require(subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip() == receipt["sourceCommit"],
                "Splitter checkout differs from accepted receipt")
        result = split_page(args.page, args.receipt, args.directory)
        require(result["parts"] == 4, "Workflow upload inventory requires exactly four page parts")
    elif args.command == "verify":
        result = verify_parts(args.manifest)
    else:
        result = join_parts(args.manifest, args.output)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
