from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import posixpath
import subprocess

HEAD = 'df123c797b226c479b50a998011c1ea6d0157391'
CURRENT = 'cd9c554133769c264e0157c298d0bdc682d87b27'
base = Path('.work/hosted-df-memory-parts-cd9')
started = datetime.now(timezone.utc).isoformat()
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == CURRENT
receipt = json.loads(Path('.work/hosted-df-browser/extracted/.work/checks/stage-browser.json').read_text())
assert receipt['sourceCommit'] == HEAD and receipt['workflowRunId'] == '37870240814'
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
        current_digest = sha256()
        current_process = subprocess.Popen(['git', 'cat-file', 'blob', CURRENT + ':' + path], stdout=subprocess.PIPE)
        while block := current_process.stdout.read(1024 * 1024):
            current_digest.update(block)
        assert current_process.wait() == 0 and current_digest.hexdigest() == expected, path
        working_digest = sha256()
        with Path(relative).open('rb') as source:
            while block := source.read(1024 * 1024):
                working_digest.update(block)
        assert working_digest.hexdigest() == expected, relative
        original.append(path)
    else:
        with Path(relative).open('rb') as source:
            while block := source.read(1024 * 1024):
                digest.update(block)
        assert digest.hexdigest() == expected, relative
        generated.append(relative)
assert len(original) == 206 and len(generated) == 143
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == CURRENT
docs=[]
for name in ['README.md','VERIFY.md','NEXT.md','LOOP.md','ASSUMPTIONS.md','SHA256SUMS.txt']:
    path='jobs/G10-checkers/'+name
    accepted_bytes=subprocess.check_output(['git','cat-file','blob',HEAD+':'+path])
    current_bytes=subprocess.check_output(['git','cat-file','blob',CURRENT+':'+path])
    assert Path(name).read_bytes()==current_bytes
    docs.append({'path':path,'acceptedGitSha256':sha256(accepted_bytes).hexdigest(),'currentGitSha256':sha256(current_bytes).hexdigest(),'workingBytesMatchCurrentGit':True,'equalToAccepted':accepted_bytes==current_bytes})
result = {'currentCheckoutPreserved':CURRENT,'all206CurrentImmutableGitOriginalBytesEqualAcceptedDf':True,'sixCurrentDocumentationGitBridge':docs,'status': 'PASS', 'startedAt': started, 'closedAt': datetime.now(timezone.utc).isoformat(),
          'acceptedHead': HEAD, 'sourceGuardCount': len(guards),
          'gitTrackedOriginalBytes': original, 'generatedRuntimePathsRequireCurrentByteMatch': generated,
          'scope': 'Explicit immutable accepteddf-to-currentcd9 original349 runtime/source bridge:206 accepteddf Git blobs equal currentcd9 immutableGit original bytes and actualworkingfiles, plus143 actual generated/runtime guards; six currentcd9 docs working==immutableGit with truthful accepteddf equality/difference outside349. Historicaldf genuine full native component proof preserved; currentcd9 exact nativeCI and four actual official part reception remain separate.'}
(base / 'source-bridge.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'head': HEAD, 'originalGitFiles': len(original),
                  'generatedRuntimeFiles': len(generated), 'closedAt': result['closedAt']}))
