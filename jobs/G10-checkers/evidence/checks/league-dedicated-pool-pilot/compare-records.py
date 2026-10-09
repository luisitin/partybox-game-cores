import hashlib
import json
import pathlib

root = pathlib.Path.cwd()
pilot = root / '.work/league-pool-pilot/league-smoke-4-games'
baseline = root / 'evidence/checks/variant-pool-node22'
output = root / 'evidence/checks/league-dedicated-pool-pilot'
output.mkdir(parents=True, exist_ok=True)

def records(directory, pattern):
    result = {}
    for file in sorted(directory.glob(pattern)):
        for line in file.read_text().splitlines():
            if not line:
                continue
            record = json.loads(line)
            key = (record['variant'], record['higher'], record['lower'], record['index'])
            assert key not in result, ('duplicate game', key)
            result[key] = record
    return result

original = records(baseline, 'task-*.jsonl')
current = records(pilot, '*.jsonl')
assert len(original) == len(current) == 16
assert original.keys() == current.keys()
for key in sorted(original):
    assert original[key] == current[key], ('complete game record changed', key)

transcript = json.dumps([current[key] for key in sorted(current)], sort_keys=True, separators=(',', ':')).encode()
sources = ['scripts/league.mjs', 'scripts/league-worker.mjs', 'src/core.ts', 'src/bots.ts']
report = {
    'status': 'PASS',
    'command': 'python3 .work/compare-league-pool.py',
    'games': len(current),
    'comparison': 'Every field of all sixteen actual original and dedicated-pool terminal game records, including seeds, skills, every move, outcomes, plies and final boards.',
    'orderedRecordsSha256': hashlib.sha256(transcript).hexdigest(),
    'sourceSha256': {name: hashlib.sha256((root / name).read_bytes()).hexdigest() for name in sources},
    'baselineFiles': [str(file.relative_to(root)) for file in sorted(baseline.glob('task-*.jsonl'))],
    'pilotFiles': [str(file.relative_to(root)) for file in sorted(pilot.glob('*.jsonl'))],
    'scope': 'Sixteen-game pilot only. Actual final 4000-game strength and CI 30-minute fit remain pending.',
}
(output / 'complete-record-equivalence.json').write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps(report))
