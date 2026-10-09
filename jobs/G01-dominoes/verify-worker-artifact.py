#!/usr/bin/env python3
"""Independently verify an official artifact against its digest, run and Git source."""
import argparse
import hashlib
import json
import math
from pathlib import Path, PurePosixPath
import posixpath
import re
import shutil
import stat
import subprocess
import tempfile
import zipfile

MUTABLE = {'SHA256SUMS.txt', 'baseline-report.json', 'browser-report.json',
    'conditional-report.json', 'differential-report.json', 'draw-league-report.json',
    'draw-opener-before-report.json', 'draw-opener-report.json', 'idle-report.json',
    'league-report.json', 'match-goal-report.json', 'mixed-idle-report.json',
    'mutation-report.json', 'opener-before-report.json', 'opener-report.json',
    'score-policy-report.json', 'media/phone.png', 'media/tv.png',
    'media/milestone-14-presentation.webm'}


def sha(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise ValueError(message)


def same_file(a, b):
    return a['bytes'] == b['bytes'] and a['sha256'] == b['sha256']


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('artifact', type=Path)
    parser.add_argument('--sha256', required=True)
    parser.add_argument('--source', required=True)
    parser.add_argument('--run', required=True)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--native-log', required=True, type=Path)
    args = parser.parse_args()
    require(re.fullmatch(r'[0-9a-f]{64}', args.sha256), 'Expected official SHA256 required')
    data = args.artifact.read_bytes()
    require(sha(data) == args.sha256, 'Official artifact digest mismatch')
    checks = 1
    with zipfile.ZipFile(args.artifact) as archive:
        names = archive.namelist()
        require(len(names) == len(set(names)), 'Duplicate ZIP paths')
        for item in archive.infolist():
            path = PurePosixPath(item.filename)
            require(not path.is_absolute() and '..' not in path.parts and '\\' not in item.filename,
                    'Unsafe ZIP path')
            require(not stat.S_ISLNK(item.external_attr >> 16), 'ZIP symlink')
        require(archive.testzip() is None, 'ZIP CRC failure')
        def raw(name):
            require(name in names, f'Missing {name}')
            return archive.read(name)
        def load(name):
            return json.loads(raw(name))
        start, end, browser = load('ci-start.json'), load('ci-finish.json'), load('browser-current.json')
        require(start['schema'] == end['schema'] == 'g01-ci-evidence/1', 'CI schema')
        require(start['github']['GITHUB_RUN_ID'] == args.run, 'Wrong run')
        require(start['github']['GITHUB_SHA'] == start['checkoutHead'], 'Wrong checkout')
        require(args.source == start['checkoutHead'] or args.source in start['checkoutParents'], 'Wrong source parent')
        require(end['status'] == 'PASS' and end['npmTestExitCode'] == 0, 'Full pipeline did not pass')
        require(not end['immutableDrift'] and end['nodeUnchanged'], 'Input/Node drift')
        require(start['node'] == end['nodeAfter'] and start['node']['version'].startswith('v24.'), 'Node identity')
        require(set(start['mutableOutputPaths']) == {'jobs/G01-dominoes/' + p for p in MUTABLE}, 'Changed mutable allowlist')
        expected = subprocess.check_output(['git', '-C', str(args.repo), 'ls-tree', '-r', '--name-only',
            args.source, '--', 'jobs/G01-dominoes', 'contract', '.github/workflows/G01.yml',
            'README.md', 'RULES.md', 'JOBS.md'], text=True).splitlines()
        require(set(expected) == set(start['filesBefore']) == set(end['filesAfter']), 'Incomplete source maps')
        require(end['immutableInputs'] == len(set(expected) - set(start['mutableOutputPaths'])), 'Immutable input count')
        for name in expected:
            committed = subprocess.check_output(['git', '-C', str(args.repo), 'show', f'{args.source}:{name}'])
            before, after = raw('before/' + name), raw('after/' + name)
            require(before == committed, f'Before/Git mismatch: {name}')
            for value, content in [(start['filesBefore'][name], before), (end['filesAfter'][name], after)]:
                require(value == {'bytes': len(content), 'sha256': sha(content)}, f'Byte map mismatch: {name}')
                checks += 1
            if name not in start['mutableOutputPaths']:
                require(before == after, f'Immutable drift: {name}')
                checks += 1
        log = raw('full-npm-test.log')
        require(end['fullLog'] == {'bytes': len(log), 'sha256': sha(log)}, 'Full log identity')
        native = args.native_log.read_bytes()
        native_text = native.decode('utf8')
        stripped = re.sub(r'^\d{4}-\d\d-\d\dT[0-9:.]+Z ', '', native_text, flags=re.MULTILINE)
        require(log.decode('utf8') in stripped, 'The entire actual npm log is missing from native hosted output')
        require('SHA256 digest of uploaded artifact zip is ' + args.sha256 in native_text, 'Native upload digest mismatch')
        for filename, schema in [('disk-current.json', 'g01-disk-browser-proof/1'), ('worker-current.json', 'g01-real-worker-proof/1')]:
            proof = load(filename)
            require(proof['schema'] == schema and proof['status'] == 'PASS' and proof['browserClosedAt'], 'Actual additional browser proof failed/unclosed')
            require(proof['sourcesBefore'] == proof['sourcesAfter'], 'Additional browser source drift')
            for name, info in proof['sourcesBefore'].items():
                rel = posixpath.normpath('jobs/G01-dominoes/' + name)
                require(rel in start['filesBefore'] and same_file(info, start['filesBefore'][rel]), 'Additional browser/Git source mismatch: ' + name)
                checks += 1
            require(proof['nodeBefore'] == proof['nodeAfter'] and same_file(proof['nodeBefore'], start['node']), 'Additional browser Node drift')
            require(proof['chromiumBefore'] == proof['chromiumAfter'], 'Additional Chromium drift')
            require(proof['externalRequests'] == proof['errors'] == [], 'Additional browser offline/error failure')
            if filename == 'disk-current.json':
                require(proof['navigationMode'] == 'Actual page.goto(file://); no setContent fallback', 'Actual file navigation not used')
                require(proof['actualURL'] == proof['fileURL'] and proof['fileURL'].startswith('file://') and proof['fileURL'].endswith('/jobs/G01-dominoes/play.html'), 'Wrong actual disk URL')
                require(proof['humanHandover'] == 'PASS' and proof['realInlineWorker']['status'] == 'PASS', 'Disk privacy/real-worker failure')
                actual = proof['realInlineWorker'];trace = actual['trace']
                require(trace['created'] >= 1 and trace['urls'] and all(url.startswith('blob:') for url in trace['urls']), 'No actual inline Blob Worker')
                request, reply = trace['requests'][0], trace['replies'][0]
                require(sorted(request) == ['id', 'observation', 'seed'] and request['seed'] == 23 and request['id'] == reply['id'], 'Disk worker public payload/identity')
                require(reply['input'] == actual['expected']['input'] and reply['rngState'] == actual['expected']['rngState'], 'Disk worker output/RNG disagreement')
                require(not any(k in request['observation'] for k in ['hands', 'stock', 'players', 'rng']), 'Hidden disk-worker state')
                checks += 8
            else:
                require(proof['compilerBefore'] == proof['compilerAfter'] and proof['compilation']['exit'] == 0, 'Actual worker compilation failed/drifted')
                require(proof['nontrivialRealWorkerReplays'] == len(proof['cases']) == 16, 'Incomplete real-worker replay cases')
                require([v['variant'] for v in proof['variants']] == ['actual UI', 'csp-denial', 'runtime-error', 'unresponsive', 'delayed pending end/rematch'], 'Incomplete actual/controlled worker variants')
                require(all(v['status'] == 'PASS' for v in proof['variants']), 'Worker variant failure')
                first = proof['variants'][0]
                require(first['request']['seed'] == 23 and first['request']['id'] == first['reply']['id'] and first['workerSourceSha256'] == proof['workerSourceSha256'], 'Actual UI worker identity')
                for case in proof['cases']:
                    request, reply, expected = case['request'], case['reply'], case['expected']
                    require(case['status'] == 'PASS' and sorted(request) == ['id', 'observation', 'seed'] and reply['id'] == request['id'], 'Worker case identity')
                    require(not any(k in request['observation'] for k in ['hands', 'stock', 'players', 'rng']), 'Hidden real-worker state')
                    require(len(request['observation']['legal']) > 1 and reply['input'] == expected['input'] and reply['rngState'] == expected['rngState'], 'Real-worker nontrivial output/RNG')
                    checks += 4
                checks += 6
        mutations = load('after/jobs/G01-dominoes/mutation-report.json')
        require(mutations['mutants'] == len(mutations['results']) == 25 and mutations['killed'] >= 24
                and mutations['killed'] == sum(bool(row['killed']) for row in mutations['results']), 'Actual mutation coverage')
        require(browser['schema'] == 'g01-browser-evidence/1' and browser['status'] == 'PASS'
                and browser.get('browserClosedAt'), 'Browser not naturally closed/pass')
        require(browser['sourcesBefore'] == browser['sourcesAfter'], 'Browser source drift')
        for name, info in browser['sourcesBefore'].items():
            rel = posixpath.normpath('jobs/G01-dominoes/' + name)
            require(rel in start['filesBefore'] and same_file(info, start['filesBefore'][rel]), 'Browser/Git source mismatch')
            checks += 1
        require(browser['nodeBefore'] == browser['nodeAfter'] and same_file(browser['nodeBefore'], start['node']), 'Browser Node drift')
        require(browser['chromiumBefore'] == browser['chromiumAfter'], 'Chromium drift')
        require(browser['chromiumVersion'] and re.fullmatch(r'[0-9a-f]{64}', browser['chromiumBefore']['sha256']), 'Chromium identity missing')
        require(browser['sampler'] == {'intervals': 300, 'warmup': 0, 'filtered': 0,
            'timestamp': 'native requestAnimationFrame callback', 'gate': {'minimumFps': 58, 'maximumP95Ms': 18}}, 'Original sampler changed')
        require(browser['externalRequests'] == browser['errors'] == [] and browser['functional'] == 'PASS', 'Functional/offline failure')
        report = load('after/jobs/G01-dominoes/browser-report.json')
        require(len(browser['profiles']) == len(report['performance']) == 2, 'Incomplete profiles')
        for index, (name, viewport, throttle) in enumerate([
                ('tv', {'width': 1920, 'height': 1080}, 1), ('phone', {'width': 390, 'height': 844}, 4)]):
            profile = browser['profiles'][index]
            require(profile['name'] == name and profile['viewport'] == viewport, 'Wrong viewport')
            require(profile['throttle'] == profile['actualCpuThrottleRate'] == throttle
                    and profile['clockInstalled'] is False, 'Wrong native clock/throttle')
            intervals, stamps = profile['intervals'], profile['timestamps']
            require(len(intervals) == 300 and len(stamps) == 301 and profile['frames'] == 300, 'Truncated raw measurements')
            for i, value in enumerate(intervals):
                require(math.isfinite(value) and value > 0 and math.isfinite(stamps[i])
                        and math.isclose(value, stamps[i+1] - stamps[i], rel_tol=0, abs_tol=1e-9), 'Timestamp/delta mismatch')
                checks += 1
            sorted_values = sorted(intervals)
            mean = sum(intervals) / 300
            for field, actual in [('meanMs', mean), ('fps', 1000 / mean),
                    ('p95Ms', sorted_values[285]), ('p99Ms', sorted_values[297])]:
                require(math.isclose(profile[field], actual, rel_tol=1e-12, abs_tol=1e-8), f'Wrong {field}')
                require(profile[field] == report['performance'][index][field], 'Raw/aggregate disagreement')
            require(profile['passed'] is True and profile['fps'] >= 58 and profile['p95Ms'] <= 18, 'Original frame gate failed')
        clip = raw('current-capture.webm')
        require(len(clip) < 10_000_000 and same_file(browser['capture']['file'], {'bytes': len(clip), 'sha256': sha(clip)}), 'Current clip identity')
        framehash = raw('capture-framehash.txt')
        require(sha(framehash) == browser['capture']['decode']['completeFramehashSha256'], 'Framehash identity')
        recorded = [line.strip() for line in framehash.decode().splitlines() if re.match(r'\s*\d+\s*,', line)]
        require(len(recorded) == browser['capture']['decode']['frames'] == 36, 'Incomplete recorded decode')
        require(len(browser['encoding']['sourceFrames']) == 36 and browser['encoding']['status'] == 0
                and browser['encoding']['closedAt'], 'Encoder/actual screenshot input proof')
        decoder_identity = []
        with tempfile.TemporaryDirectory(prefix='g01-artifact-decode-') as temporary:
            path = Path(temporary) / 'current.webm'
            path.write_bytes(clip)
            ffmpeg, ffprobe = shutil.which('ffmpeg'), shutil.which('ffprobe')
            require(ffmpeg and ffprobe, 'Independent decoder tools missing')
            for executable in [ffmpeg, ffprobe]:
                binary = Path(executable).resolve(strict=True)
                decoder_identity.append({'path': str(binary), 'bytes': binary.stat().st_size,
                    'sha256': sha(binary.read_bytes()),
                    'version': subprocess.check_output([str(binary), '-version'], text=True)})
            metadata = json.loads(subprocess.check_output([ffprobe, '-v', 'error', '-select_streams', 'v:0',
                '-count_frames', '-show_entries', 'stream=codec_name,width,height,nb_read_frames,r_frame_rate:format=size,duration', '-of', 'json', str(path)]))
            video = metadata['streams'][0]
            require((video['codec_name'], video['width'], video['height'], int(video['nb_read_frames']), video['r_frame_rate'])
                    == ('vp9', 1920, 1080, 36, '12/1'), 'Actual clip geometry/codec/count')
            require(float(metadata['format']['duration']) == 3 and int(metadata['format']['size']) == len(clip), 'Actual clip duration/bytes')
            decoded = subprocess.check_output([ffmpeg, '-v', 'error', '-xerror', '-i', str(path),
                '-map', '0:v:0', '-f', 'framehash', '-hash', 'sha256', '-'], text=True)
            rows = [line.strip() for line in decoded.splitlines() if re.match(r'\s*\d+\s*,', line)]
            require(len(rows) == 36 and rows == recorded, 'Independent whole-frame decode mismatch')
            for tool in decoder_identity:
                binary = Path(tool['path'])
                require(binary.stat().st_size == tool['bytes'] and sha(binary.read_bytes()) == tool['sha256'], 'Independent decoder changed during read')
            checks += 36
    print(json.dumps({'status': 'PASS', 'checks': checks, 'source': args.source, 'run': args.run,
        'artifactSha256': args.sha256, 'nativeLog': {'bytes': len(native), 'sha256': sha(native)}, 'actualDiskNavigation': 'PASS', 'realWorkerReplayCases': 16, 'realWorkerVariants': 5, 'rawIntervals': 600, 'timestampWitnesses': 602,
        'actualDecodedFrames': 36, 'mutationKills': mutations['killed'], 'independentDecoderTools': decoder_identity,
        'claim': 'Current official artifact/source proof; independent decoder headers may differ by tool version.'}))


if __name__ == '__main__':
    main()
