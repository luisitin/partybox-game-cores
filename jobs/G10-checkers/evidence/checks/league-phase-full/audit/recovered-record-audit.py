import hashlib, json, math
from datetime import datetime, timezone
from pathlib import Path

base = Path('.work/league-phase-full')
report = json.loads((base / 'league.json').read_text())
resources = json.loads((base / 'resources.json').read_text())
assert resources['exitCode'] == 0
assert report['totalGames'] == 4000
assert len(report['gameInputHashes']) == 127
for name, expected in report['gameInputHashes'].items():
    assert hashlib.file_digest(Path(name).open('rb'), 'sha256').hexdigest() == expected, name
assert hashlib.file_digest(Path('src/bots.ts').open('rb'), 'sha256').hexdigest() == report['botSourceSha256']
paths = sorted((base / 'league-games').glob('*.jsonl'))
assert len(paths) == 80
seen, games, rows, files = set(), [], [], {}
for path in paths:
    raw = path.read_bytes()
    files[path.name] = hashlib.sha256(raw).hexdigest()
    batch = [json.loads(line) for line in raw.splitlines()]
    assert len(batch) == 50
    for game in batch:
        variant, higher, lower, index = (game[key] for key in ('variant', 'higher', 'lower', 'index'))
        assert variant in ('american', 'international') and (higher, lower) in (('sharp', 'normal'), ('normal', 'easy'))
        key = (variant, higher, lower, index)
        assert key not in seen and isinstance(index, int) and 0 <= index < 1000
        seen.add(key)
        assert game['seed'] == (0xC10B0700 + (index >> 1) + (200000 if variant == 'international' else 0) + (100000 if higher == 'normal' else 0)) & 0xFFFFFFFF
        stronger = 'light' if index % 2 == 0 else 'dark'
        assert game['stronger'] == stronger
        assert game['skills'] == {side: higher if side == stronger else lower for side in ('light', 'dark')}
        assert game['winner'] in ('light', 'dark', None)
        assert game['endReason'] and len(game['moves']) == game['plies'] and 0 < game['plies'] <= 2400
        size = 32 if variant == 'american' else 50
        assert len(game['finalBoard']) == size and all(type(piece) == int and -2 <= piece <= 2 for piece in game['finalBoard'])
        for move in game['moves']:
            assert move['type'] == 'move' and isinstance(move['path'], list) and len(move['path']) >= 2
            assert all(type(square) == int and 0 <= square < size for square in move['path'])
        games.append(game)
for row in report['comparisons']:
    group = sorted((g for g in games if all(g[key] == row[key] for key in ('variant', 'higher', 'lower'))), key=lambda g: g['index'])
    assert len(group) == 1000 and [g['index'] for g in group] == list(range(1000))
    wins = sum(g['winner'] == g['stronger'] for g in group)
    draws = sum(g['winner'] is None for g in group)
    losses = 1000 - wins - draws
    assert (wins, draws, losses) == (row['wins'], row['draws'], row['losses'])
    share = (wins + draws / 2) / 1000
    assert row['scoreShare'] == share and share > .55
    decisive = wins + losses
    p, z = wins / decisive, 1.96
    denom = 1 + z*z / decisive
    center = (p + z*z / (2*decisive)) / denom
    margin = z*math.sqrt((p*(1-p)+z*z/(4*decisive))/decisive)/denom
    assert max(abs(a-b) for a,b in zip(row['decisiveWilson95'], [center-margin, center+margin])) < 1e-12
    assert center - margin > .5
    digest = hashlib.sha256()
    for g in group:
        digest.update(json.dumps([row['variant'], row['higher'], row['lower'], g['seed'], g['stronger'], g['winner'], g['endReason'], g['plies'], g['finalBoard']], separators=(',', ':')).encode())
    assert digest.hexdigest() == row['transcriptSha256']
    assert row['moves'] == sum(g['plies'] for g in group) and row['maximumPlies'] == max(g['plies'] for g in group)
    rows.append({key: row[key] for key in ('variant', 'higher', 'lower', 'games', 'wins', 'draws', 'losses', 'scoreShare', 'decisiveWilson95', 'transcriptSha256')})
holds = [json.loads(line) for line in (base / 'holds.jsonl').read_text().splitlines()]
assert len(holds) == 6
held = sum(r['elapsedHeldSeconds'] for r in holds if r['event'] == 'hold-end')
receipt = dict(status='PASS', checkedAt=datetime.now(timezone.utc).isoformat(), gameInputs=127, rawFiles=80, completeGames=len(games), rows=rows, rawFileSha256=files, actualCommand=resources['command'], elapsedIncludingHolds=resources['elapsedSeconds'], heldSeconds=held, elapsedExcludingRecordedHolds=resources['elapsedSeconds']-held, peakRssKiB=resources['maxRssKiB'], scope='Independent recovered Python structural, current-byte, paired-seed, all-record and strength-summary audit. No independent search replay, current browser acceptance, or CI-fit inference.')
(base / 'audit/recovered-record-receipt.json').write_text(json.dumps(receipt, indent=2)+'\n')
print(json.dumps({key: receipt[key] for key in ('status', 'checkedAt', 'gameInputs', 'rawFiles', 'completeGames', 'heldSeconds', 'elapsedExcludingRecordedHolds', 'peakRssKiB', 'scope')}))
