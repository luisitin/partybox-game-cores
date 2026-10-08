"""Independent ZIP receiver: no extraction and no import of the production JOIN helper."""
from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path, PurePosixPath
import stat
import subprocess
import sys
from zipfile import ZipFile

HEAD = 'fa0b337e1178177ff5b871acae697897c687ee11'
RUN = 37852024033
HTML_BYTES = 1390845993
HTML_SHA = '5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801'
PART_BYTES = 384 * 1024 * 1024
STAGES = ['node', 'league-american', 'league-international', 'browser']
directory = Path(sys.argv[1])
metadata = json.loads((directory / 'artifacts-native.json').read_text())
artifacts = metadata['artifacts']
started = datetime.now(timezone.utc).isoformat()
current = subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()
assert current == HEAD
helper = subprocess.check_output(['git', 'cat-file', 'blob', HEAD + ':jobs/G10-checkers/scripts/standalone-parts.py'])
helper_sha = sha256(helper).hexdigest()
manifest_bytes = receipt_bytes = None
manifest = None
whole = sha256()
total = 0
results = []
for index in range(4):
    artifact_name = f'G10-standalone-part-{index:02d}-{HEAD}'
    matches = [row for row in artifacts if row['name'] == artifact_name]
    assert len(matches) == 1
    artifact = matches[0]
    assert artifact['expired'] is False
    assert artifact['workflow_run']['head_sha'] == HEAD
    assert artifact['workflow_run']['id'] == RUN
    path = directory / f'part-{index:02d}.zip'
    assert path.stat().st_size == artifact['size_in_bytes'] < 536870912
    zipped = sha256()
    with path.open('rb') as source:
        while block := source.read(1024 * 1024):
            zipped.update(block)
    assert 'sha256:' + zipped.hexdigest() == artifact['digest']
    with ZipFile(path) as archive:
        infos = archive.infolist()
        assert len(infos) == 4
        names, basenames = set(), {}
        for info in infos:
            member = PurePosixPath(info.filename)
            assert not member.is_absolute() and '..' not in member.parts
            assert '\\' not in info.filename and not stat.S_ISLNK(info.external_attr >> 16)
            assert info.filename not in names and member.name not in basenames
            names.add(info.filename)
            basenames[member.name] = info
        assert set(basenames) == {f'play.html.part-{index:02d}', 'standalone-parts.json',
                                  'standalone-delivery.json', 'standalone-parts.py'}
        actual_manifest = archive.read(basenames['standalone-parts.json'])
        actual_receipt = archive.read(basenames['standalone-delivery.json'])
        actual_helper = archive.read(basenames['standalone-parts.py'])
        assert actual_helper == helper
        if index == 0:
            manifest_bytes, receipt_bytes = actual_manifest, actual_receipt
            manifest = json.loads(actual_manifest)
            receipt = json.loads(actual_receipt)
            assert manifest['schemaVersion'] == receipt['schemaVersion'] == 1
            assert manifest['deliveryReceipt'] == receipt
            assert manifest['helper'] == 'standalone-parts.py'
            assert manifest['helperSha256'] == helper_sha
            assert manifest['partBytes'] == PART_BYTES and len(manifest['parts']) == 4
            assert receipt['sourceCommit'] == receipt['checkoutCommit'] == HEAD
            assert receipt['bytes'] == HTML_BYTES and receipt['sha256'] == HTML_SHA
            assert receipt['page'] == 'play.html' and receipt['acceptedStages'] == STAGES
        else:
            assert actual_manifest == manifest_bytes and actual_receipt == receipt_bytes
        row = manifest['parts'][index]
        expected_size = min(PART_BYTES, HTML_BYTES - total)
        assert row['name'] == f'play.html.part-{index:02d}' and row['offset'] == total
        assert row['bytes'] == expected_size > 0
        info = basenames[row['name']]
        assert info.file_size == expected_size
        count, digest = 0, sha256()
        with archive.open(info) as source:
            while block := source.read(1024 * 1024):
                digest.update(block)
                whole.update(block)
                count += len(block)
        # Reading each member through EOF independently checks its recorded ZIP CRC.
        assert count == expected_size and digest.hexdigest() == row['sha256']
        total += count
        results.append({'artifactId': artifact['id'], 'name': artifact_name,
                        'zipBytes': path.stat().st_size, 'zipSha256': zipped.hexdigest(),
                        'memberBytes': count, 'memberSha256': digest.hexdigest(),
                        'offset': row['offset'], 'members': 4, 'CRC': 'PASS'})
assert total == HTML_BYTES and whole.hexdigest() == HTML_SHA
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == HEAD
result = {'status': 'PASS', 'startedAt': started, 'closedAt': datetime.now(timezone.utc).isoformat(),
          'head': HEAD, 'workflowRunId': RUN,
          'parts': results, 'totalBytes': total, 'wholeSha256': whole.hexdigest(),
          'helperOriginalGitSha256': helper_sha,
          'scope': 'All four actual official downloaded artifact ZIPs, official complete ZIP bytes/digests, '
                   'every unique safe member/CRC, identical receipts/manifests, original Git helper bytes, '
                   'exact source head/part order/offset/size/SHA and streamed original complete HTML SHA. '
                   'No 1.39-GB duplicate extraction, no current CI/KEEP inference beyond the validated delivery bytes.'}
(directory / 'independent-downloaded-parts.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'head': HEAD, 'parts': 4, 'bytes': total,
                  'sha256': whole.hexdigest(), 'closedAt': result['closedAt']}))
