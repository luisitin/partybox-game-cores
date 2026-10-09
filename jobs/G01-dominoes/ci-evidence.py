#!/usr/bin/env python3
"""Retain genuine before/after source bytes and full logs, including failed runs."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys

JOB = Path(__file__).resolve().parent
ROOT = JOB.parents[1]
OUT = JOB / '.tmp/g01-evidence'
MUTABLE = {
    'SHA256SUMS.txt', 'baseline-report.json', 'browser-report.json',
    'conditional-report.json', 'differential-report.json', 'draw-league-report.json',
    'draw-opener-before-report.json', 'draw-opener-report.json', 'idle-report.json',
    'league-report.json', 'match-goal-report.json', 'mixed-idle-report.json',
    'mutation-report.json', 'opener-before-report.json', 'opener-report.json',
    'score-policy-report.json', 'media/phone.png', 'media/tv.png',
    'media/milestone-14-presentation.webm',
}


def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def git(*args):
    return subprocess.check_output(['git', '-C', str(ROOT), *args])


def identity(path):
    path = Path(path).resolve(strict=True)
    digest = hashlib.sha256()
    size = 0
    with path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
            size += len(block)
    return {'bytes': size, 'sha256': digest.hexdigest()}


def paths():
    return [p.decode() for p in git('ls-files', '-z', '--',
        'jobs/G01-dominoes', 'contract', '.github/workflows/G01.yml',
        'README.md', 'RULES.md', 'JOBS.md').split(b'\0') if p]


def snapshot(label, names):
    result = {}
    for name in names:
        source = ROOT / name
        if source.is_symlink() or not source.is_file():
            raise ValueError(f'Not a regular tracked file: {name}')
        target = OUT / label / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
        result[name] = identity(source)
        assert identity(target) == result[name], name
    return result


def save(name, data):
    (OUT / name).write_text(json.dumps(data, indent=2) + '\n')


def node():
    executable = Path(shutil.which('node')).resolve(strict=True)
    return {'path': str(executable), **identity(executable),
            'version': subprocess.check_output([str(executable), '--version'], text=True).strip()}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    phase = sys.argv[1]
    if phase == 'start':
        names = paths()
        before = snapshot('before', names)
        for name in names:
            committed = git('show', f'HEAD:{name}')
            assert before[name] == {'bytes': len(committed),
                'sha256': hashlib.sha256(committed).hexdigest()}, f'Checkout differs from Git: {name}'
        start = {
            'schema': 'g01-ci-evidence/1', 'startedAt': now(), 'status': 'STARTED',
            'checkoutHead': git('rev-parse', 'HEAD').decode().strip(),
            'checkoutParents': git('show', '-s', '--format=%P', 'HEAD').decode().strip().split(),
            'github': {key: os.environ.get(key) for key in [
                'GITHUB_REPOSITORY', 'GITHUB_SHA', 'GITHUB_RUN_ID', 'GITHUB_RUN_ATTEMPT',
                'GITHUB_EVENT_NAME', 'GITHUB_REF', 'GITHUB_HEAD_REF']},
            'node': node(), 'filesBefore': before,
            'mutableOutputPaths': sorted('jobs/G01-dominoes/' + p for p in MUTABLE),
            'claim': 'Before snapshots preserve historical committed reports; only current receipt/log evidence describes this run.',
        }
        save('ci-start.json', start)
    elif phase == 'finish':
        start = json.loads((OUT / 'ci-start.json').read_text())
        exit_code, log = int(sys.argv[2]), Path(sys.argv[3])
        shutil.copyfile(log, OUT / 'full-npm-test.log')
        after = snapshot('after', list(start['filesBefore']))
        immutable = {p: value for p, value in start['filesBefore'].items()
                     if p not in start['mutableOutputPaths']}
        drift = [p for p, value in immutable.items() if after[p] != value]
        node_after = node()
        receipt = {'schema': 'g01-ci-evidence/1', 'finishedAt': now(),
            'npmTestExitCode': exit_code, 'filesAfter': after,
            'immutableInputs': len(immutable), 'immutableDrift': drift,
            'nodeAfter': node_after, 'nodeUnchanged': node_after == start['node'],
            'fullLog': identity(OUT / 'full-npm-test.log'),
            'status': 'PASS' if exit_code == 0 and not drift and node_after == start['node'] else 'FAIL'}
        save('ci-finish.json', receipt)
        if drift or node_after != start['node']:
            raise ValueError(f'Inputs or Node changed: {drift}')
    else:
        raise ValueError('Expected start or finish')


if __name__ == '__main__':
    main()
