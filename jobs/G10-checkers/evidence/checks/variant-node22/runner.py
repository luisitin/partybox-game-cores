import hashlib, json, os, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
out = root / 'evidence/checks/variant-node22'
out.mkdir(parents=True, exist_ok=True)
node = root / '.work/memory-json-private/node22/runtime/bin/node'
command = [str(node), '--test', '--test-reporter=tap', 'tests/variant-bundles.test.mjs']
paths = sorted(set(root.glob('dist/*.mjs')) | set(root.glob('dist/intl-*.json')) | {
    root/'tests/variant-bundles.test.mjs', root/'tests/helpers.mjs', root/'tests/evidence.mjs',
    root/'scripts/build.mjs', root/'.work/run-resource.py', Path(__file__), node})

def now():
    return datetime.now(timezone.utc).isoformat()

def hashes():
    result = []
    for path in paths:
        digest = hashlib.sha256()
        with path.open('rb') as source:
            for block in iter(lambda: source.read(1024*1024), b''):
                digest.update(block)
        result.append({'path': str(path.relative_to(root)), 'bytes': path.stat().st_size,
                       'sha256': digest.hexdigest()})
    return result

record = {'startedAt': now(), 'pgid': os.getpgrp(), 'command': command,
          'runtimeVersion': subprocess.check_output([str(node), '--version'], text=True).strip(),
          'scope': 'Existing unchanged variant test; 24 paired scenarios / 48 search invocations and four complete games. Mixed single process; not a four-worker aggregate RSS measurement.',
          'knownConcurrentParentGroup': 157222}
record['inputsBefore'] = hashes()
(out/'inputs-before.json').write_text(json.dumps(record, indent=2)+'\n')
env = dict(os.environ, G10_EVIDENCE_DIR=str(out))
with (out/'stdout.tap').open('wb') as stdout, (out/'stderr.log').open('wb') as stderr:
    result = subprocess.run(['python3', '.work/run-resource.py', str(out/'resources.json'), *command],
                            stdout=stdout, stderr=stderr, env=env)
record.update({'closedAt': now(), 'exitCode': result.returncode, 'inputsAfter': hashes()})
record['allInputsUnchanged'] = record['inputsBefore'] == record['inputsAfter']
(out/'verification.json').write_text(json.dumps(record, indent=2)+'\n')
print(json.dumps({'exitCode': result.returncode, 'allInputsUnchanged': record['allInputsUnchanged'], 'closedAt': record['closedAt']}), flush=True)
sys.exit(result.returncode if record['allInputsUnchanged'] else 97)
