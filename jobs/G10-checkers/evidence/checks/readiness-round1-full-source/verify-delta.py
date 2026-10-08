"""Source-only complete-data delta proof; never creates a full page or runs a browser."""
from pathlib import Path
from hashlib import sha256
from datetime import datetime, timezone
import base64
import json
import subprocess

ROOT = Path.cwd()
PRIVATE = ROOT / '.work/american-ready-private'
BASE = ROOT / '.work/play-full-guarded.html'
HEAD = 'fa0b337e1178177ff5b871acae697897c687ee11'
ARCHIVE = '9109bd50a9b851b68c97ae932f024f2911f6b54d'
EXPECTED_BYTES = 1390845993
EXPECTED_SHA = '5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801'
started = datetime.now(timezone.utc).isoformat()

def hash_file(path):
    h = sha256()
    with path.open('rb') as f:
        while chunk := f.read(1048576):
            h.update(chunk)
    return h.hexdigest()

def original_blob(path):
    return subprocess.check_output(['git', 'cat-file', 'blob', HEAD + ':' + path])

assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == ARCHIVE
proof_path = 'jobs/G10-checkers/evidence/checks/hosted-pr-complete-fa/independent-complete-evidence.json'
proof_bytes = subprocess.check_output(['git', 'cat-file', 'blob', ARCHIVE + ':' + proof_path])
proof = json.loads(proof_bytes)
assert proof['status'] == 'PASS' and proof['head'] == HEAD
assert proof['htmlBytes'] == EXPECTED_BYTES and proof['sourceSha256'] == EXPECTED_SHA
stat_before = BASE.stat()
assert stat_before.st_size == EXPECTED_BYTES and hash_file(BASE) == EXPECTED_SHA
control = json.loads((PRIVATE / 'bootstrap-controls.json').read_text())
source = json.loads((PRIVATE / 'candidate-source.json').read_text())
original_source = original_blob('jobs/G10-checkers/src/browser.ts')
assert sha256(original_source).hexdigest() == source['sourceOriginalSha256']
assert original_source == (ROOT / 'src/browser.ts').read_bytes()
assert hash_file(PRIVATE / 'candidate-browser.ts') == source['sourceCandidateSha256']
before = (PRIVATE / 'original-bootstrap.js').read_bytes()
after = (PRIVATE / 'candidate-bootstrap.js').read_bytes()
bootstrap = control['bootstrap']
assert len(before) == bootstrap['originalBytes'] and sha256(before).hexdigest() == bootstrap['originalSha256']
assert len(after) == bootstrap['candidateBytes'] and sha256(after).hexdigest() == bootstrap['candidateSha256']
with BASE.open('rb') as f:
    f.seek(bootstrap['start'])
    assert f.read(bootstrap['end'] - bootstrap['start']) == before
    american = control['american']
    f.seek(american['payloadStart'])
    encoded = f.read(american['payloadEncodedBytes'])
    compressed = base64.b64decode(encoded, validate=True)
    assert sha256(compressed).hexdigest() == american['compressedSha256']
    assert f.read(10) == b'</script>\n'
    assert f.tell() == american['markerInsertionOffset']
    american_proof = {'encodedSha256': sha256(encoded).hexdigest(), 'compressedBytes': len(compressed),
                      'compressedSha256': sha256(compressed).hexdigest(), 'actualCompletedOffset': f.tell()}
del encoded, compressed
for variant, row in control['workers'].items():
    worker = PRIVATE / ('dist/worker-' + variant + '.mjs')
    assert worker.stat().st_size == row['bytes'] and hash_file(worker) == row['sha256']

parts = json.loads((PRIVATE / 'international-parts.json').read_text())
lower = json.loads(original_blob('jobs/G10-checkers/data/international/manifest.json'))
six = json.loads(original_blob('jobs/G10-checkers/data/international/six/manifest.json'))
files = []
for name in ['db2', 'db3', 'db4', 'db5']:
    size = lower['files'][name + '.bin']['bytes']
    files.append((name, size, [(ROOT / ('data/international/' + name + '.bin'), size)]))
for row in six['files']:
    files.append((row['name'], row['bytes'], [(ROOT / ('data/international/six/' + c['file']), c['bytes']) for c in row['chunks']]))
assert len(files) == len(parts) == 41
assert [name for name, _, _ in files] == list(parts)
raw_part_bytes = 3 * 262144
actual_parts = []
with BASE.open('rb') as f:
    f.seek(american['markerInsertionOffset'])
    first_id = parts[files[0][0]]['parts'][0]['id']
    first_header = ('<script type="application/octet-stream" id="' + first_id + '">').encode()
    cursor = f.tell()
    bounded_prefix = f.read(16 * 1024 * 1024)
    position = bounded_prefix.find(first_header)
    assert position >= 0
    f.seek(cursor + position)
    for name, expected_size, extents in files:
        offset = index = 0
        assert parts[name]['byteLength'] == expected_size
        for path, extent_size in extents:
            assert path.stat().st_size == extent_size
            with path.open('rb') as original:
                for extent_offset in range(0, extent_size, raw_part_bytes):
                    count = min(raw_part_bytes, extent_size - extent_offset)
                    row = parts[name]['parts'][index]
                    expected = {'id': 'g10-intl-' + name + '-' + str(index), 'offset': offset,
                                'bytes': count, 'encodedLength': 4 * ((count + 2) // 3)}
                    assert row == expected
                    header = ('<script type="application/octet-stream" id="' + row['id'] + '">').encode()
                    header_offset = f.tell()
                    assert f.read(len(header)) == header
                    encoded = f.read(row['encodedLength'])
                    decoded = base64.b64decode(encoded, validate=True)
                    assert len(decoded) == count
                    original.seek(extent_offset)
                    assert decoded == original.read(count)
                    assert f.read(10) == b'</script>\n'
                    actual_parts.append({'id': row['id'], 'headerOffset': header_offset, 'bytes': count,
                                         'sourcePath': str(path.relative_to(ROOT)), 'sourceOffset': extent_offset,
                                         'decodedSha256': sha256(decoded).hexdigest(), 'encodedSha256': sha256(encoded).hexdigest()})
                    offset += count
                    index += 1
        assert offset == expected_size and index == len(parts[name]['parts'])
assert len(actual_parts) == 1304 and sum(r['bytes'] for r in actual_parts) == 1006478762
marker = b"<script>document.dispatchEvent(new Event('g10-american-corpus-ready'));</script>\n"
(PRIVATE / 'american-ready-marker.html').write_bytes(marker)
operations = [
    {'kind': 'copy', 'start': 0, 'end': bootstrap['start']},
    {'kind': 'insert', 'path': 'candidate-bootstrap.js'},
    {'kind': 'copy', 'start': bootstrap['end'], 'end': american['markerInsertionOffset']},
    {'kind': 'insert', 'path': 'american-ready-marker.html'},
    {'kind': 'copy', 'start': american['markerInsertionOffset'], 'end': EXPECTED_BYTES},
]
whole = sha256()
count = 0
with BASE.open('rb') as f:
    for row in operations:
        digest, size = sha256(), 0
        if row['kind'] == 'copy':
            f.seek(row['start'])
            remaining = row['end'] - row['start']
            while remaining:
                chunk = f.read(min(1048576, remaining))
                assert chunk
                whole.update(chunk); digest.update(chunk); size += len(chunk); remaining -= len(chunk)
        else:
            chunk = (PRIVATE / row['path']).read_bytes()
            whole.update(chunk); digest.update(chunk); size = len(chunk)
        row['bytes'], row['sha256'], row['outputOffset'] = size, digest.hexdigest(), count
        count += size
expected_result_bytes = EXPECTED_BYTES - len(before) + len(after) + len(marker)
assert count == expected_result_bytes
assert hash_file(BASE) == EXPECTED_SHA and BASE.stat() == stat_before
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == ARCHIVE
receipt = {'status': 'PASS', 'startedAt': started, 'closedAt': datetime.now(timezone.utc).isoformat(),
           'acceptedBaselineHead': HEAD, 'acceptedProofArchiveHead': ARCHIVE, 'acceptedProofArchiveSha256': sha256(proof_bytes).hexdigest(),
           'basePath': str(BASE), 'baseBytes': EXPECTED_BYTES, 'baseSha256': EXPECTED_SHA,
           'candidateSourceSha256': source['sourceCandidateSha256'], 'bootstrap': bootstrap,
           'americanActualBytes': american_proof, 'americanSignalInsertionOffset': american['markerInsertionOffset'],
           'international': {'files': 41, 'actualDecodedParts': 1304, 'originalBytesCompared': 1006478762, 'parts': actual_parts},
           'operations': operations, 'resultBytes': count, 'resultSha256': whole.hexdigest(),
           'scope': 'Private source-only streamed binary delta. Actual full canonical SHA checked before/after; exact original American compressed bytes, all 1304 actual International base64 parts decoded and compared with every complete original source extent, exact original workers/bootstrap, all unchanged copied regions and complete streamed candidate digest. No full output allocated, no browser/native timing/player gain and no equivalence to final offline acceptance claimed.'}
(PRIVATE / 'delta-controls.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({k: receipt[k] for k in ['status', 'closedAt', 'baseBytes', 'baseSha256', 'resultBytes', 'resultSha256', 'scope']}))
