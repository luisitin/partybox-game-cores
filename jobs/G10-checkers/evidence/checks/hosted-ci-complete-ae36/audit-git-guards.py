from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import posixpath
import subprocess

HEAD = 'ae36b497cfd474f0eafc873bb2489b2529b4163e'
base = Path('.work/hosted-ae36-final')
started = datetime.now(timezone.utc).isoformat()
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == HEAD
receipt = json.loads((base / 'node-extracted/.work/checks/stage-node.json').read_text())
assert receipt['sourceCommit'] == HEAD and receipt['workflowRunId'] == '37845153145'
guards = receipt['sourceGuardsAfter']
assert receipt['sourceGuardsBefore'] == guards and len(guards) == 349
tracked = set(subprocess.check_output(['git', 'ls-tree', '--full-tree', '-r', '--name-only', HEAD], text=True).splitlines())
original, generated = [], []
for relative, expected in guards.items():
    path = posixpath.normpath('jobs/G10-checkers/' + relative)
    digest = sha256()
    if path in tracked:
        process = subprocess.Popen(['git', 'cat-file', 'blob', HEAD + ':' + path], stdout=subprocess.PIPE)
        while block := process.stdout.read(1024 * 1024):
            digest.update(block)
        assert process.wait() == 0 and digest.hexdigest() == expected, path
        original.append(path)
    else:
        with Path(relative).open('rb') as source:
            while block := source.read(1024 * 1024):
                digest.update(block)
        assert digest.hexdigest() == expected, relative
        generated.append(relative)
assert len(original) == 206 and len(generated) == 143
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == HEAD
result = {'status': 'PASS', 'startedAt': started, 'closedAt': datetime.now(timezone.utc).isoformat(),
          'acceptedHead': HEAD, 'sourceGuardCount': len(guards),
          'gitTrackedOriginalBytes': original, 'generatedRuntimePathsRequireCurrentByteMatch': generated,
          'scope': 'Every349 actual current Node stage guard:206 immutable original Git blobs and143 exact loaded generated/runtime byte hashes. Full final stage/browser/league/download acceptance remains separate.'}
(base / 'historical-git-guards.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'head': HEAD, 'originalGitFiles': len(original),
                  'generatedRuntimeFiles': len(generated), 'closedAt': result['closedAt']}))
