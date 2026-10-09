from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path
import posixpath
import subprocess

HEAD = 'e7a5c6463af2f0033ff08d333fb378ad160c1e43'
base = Path('.work/hosted-e7-final')
started = datetime.now(timezone.utc).isoformat()
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == '0718272a91bfda8749c7e4df25ce22c5c578d7fd'
receipt = json.loads((base / 'extracted/.work/checks/stage-node.json').read_text())
assert receipt['sourceCommit'] == HEAD and receipt['workflowRunId'] == '37860295647'
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
assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip() == '0718272a91bfda8749c7e4df25ce22c5c578d7fd'
docs=[]
for name in ['README.md','VERIFY.md','NEXT.md','LOOP.md','ASSUMPTIONS.md','SHA256SUMS.txt']:
    path='jobs/G10-checkers/'+name
    accepted_bytes=subprocess.check_output(['git','cat-file','blob',HEAD+':'+path])
    current_bytes=subprocess.check_output(['git','cat-file','blob','0718272a91bfda8749c7e4df25ce22c5c578d7fd'+':'+path])
    assert Path(name).read_bytes()==current_bytes
    docs.append({'path':path,'acceptedGitSha256':sha256(accepted_bytes).hexdigest(),'currentGitSha256':sha256(current_bytes).hexdigest(),'workingBytesMatchCurrentGit':True,'equalToAccepted':accepted_bytes==current_bytes})
result = {'currentCheckoutPreserved':'0718272a91bfda8749c7e4df25ce22c5c578d7fd','sixCurrentDocumentationGitBridge':docs,'status': 'PASS', 'startedAt': started, 'closedAt': datetime.now(timezone.utc).isoformat(),
          'acceptedHead': HEAD, 'sourceGuardCount': len(guards),
          'gitTrackedOriginalBytes': original, 'generatedRuntimePathsRequireCurrentByteMatch': generated,
          'scope': 'Historical e7 exact349 Node-stage guards:206 immutable e7 original Git blobs plus143 loaded generated/runtime byte hashes. Explicit six docs current071 working==immutableGit bridge with accepted/current hashes, outside349 guard set. Full current-source acceptance and standalone part delivery remain separate.'}
(base / 'historical-git-guards.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'head': HEAD, 'originalGitFiles': len(original),
                  'generatedRuntimeFiles': len(generated), 'closedAt': result['closedAt']}))
