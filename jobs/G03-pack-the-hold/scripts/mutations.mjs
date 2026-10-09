import { cpSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';

const mutations = [
  ['M01', 'solver.js', 'return { value, placements, nodes, pruned };', 'return { value: value + 1, placements, nodes, pruned };', 'Incorrect reported optimum'],
  ['M02', 'solver.js', 'score + crate.value);', 'score);', 'Omit packed crate value'],
  ['M03', 'solver.js', 'search(i + 1, occupied, used, score);', 'void 0;', 'Omit the optional-crate skip branch'],
  ['M04', 'solver.js', 'if ((occupied & candidate.mask) !== 0n)', 'if (false)', 'Accept solver overlaps'],
  ['M05', 'solver.js', 'Math.max(skip, include)', 'Math.min(skip, include)', 'Unsafe area upper bound'],
  ['M06', 'solver.js', 'occupied | candidate.mask', 'occupied & candidate.mask', 'Lose occupancy during search'],
  ['M07', 'geometry.js', 'k < rotation % 4', 'k < 0', 'Disable quarter turns'],
  ['M08', 'geometry.js', 'rotation >= 4 ? -x0 : x0', 'rotation >= 4 ? x0 : x0', 'Disable reflection geometry'],
  ['M09', 'geometry.js', 'Math.min(...cells.map(c => c[0]))', '0', 'Fail to normalize rotated x coordinates'],
  ['M10', 'geometry.js', '!inside.has(key) || occupied.has(key)', 'false || occupied.has(key)', 'Accept cargo outside the hold'],
  ['M11', 'geometry.js', 'used.has(p.crateId)', 'false', 'Accept duplicate crate IDs'],
  ['M12', 'geometry.js', '!inside.has(key) || occupied.has(key)', '!inside.has(key) || false', 'Accept layout overlaps'],
  ['M13', 'geometry.js', 'p.rotation >= (level.allowFlip ? 8 : 4)', 'p.rotation >= 8', 'Permit forbidden mirrored placements'],
  ['M14', 'geometry.js', '!Number.isInteger(p.rotation)', 'false', 'Accept fractional rotation'],
  ['M15', 'geometry.js', 'value += crate.value;', 'value += 1;', 'Count crates instead of their values'],
  ['M16', 'core.js', 'event.playerId !== active(s)', 'false', 'Let an inactive player pack'],
  ['M17', 'core.js', 'if (s.phase.paused || s.phase.id', 'if (false || s.phase.id', 'Process inputs while paused'],
  ['M18', 'core.js', 'event.startedAt === s.phase.startedAt', 'true', 'Accept stale timer instance'],
  ['M19', 'core.js', 'event.now >= s.phase.deadline ? advance', 'true ? advance', 'Accept premature timer'],
  ['M20', 'core.js', 'phase.deadline + Math.max(0, event.now - paused.at)', 'phase.deadline', 'Lose paused duration on resume'],
  ['M21', 'core.js', 'ratio: value / s.optimum', 'ratio: value', 'Use raw value instead of normalized score'],
  ['M22', 'core.js', "const reveal = s.phase.id !== 'pack';", 'const reveal = true;', 'Leak opponent layouts and optimum witness'],
  ['M23', 'core.js', 's.order.map(id => [id, s.scores[id] ?? 0])', "s.order.filter(id => !s.left.includes(id)).map(id => [id, s.scores[id] ?? 0])", 'Remove departed players from results'],
  ['M24', 'core.js', "skill === 'sharp' ? 0.95 : 0.8", "skill === 'sharp' ? 0.8 : 0.8", 'Collapse strong bot to medium'],
  ['M25', 'generator.js', 'const crateCount = draw(6, 12);', 'const crateCount = 5;', 'Generate fewer than six crates'],
];
const dir = resolve('.tmp/mutant-build'); mkdirSync('.tmp', { recursive: true });
const outcomes = [];
try {
  for (const [id, file, from, to, description] of mutations) {
    rmSync(dir, { recursive: true, force: true }); cpSync('.build', dir, { recursive: true });
    const path = `${dir}/jobs/G03-pack-the-hold/src/${file}`; const source = readFileSync(path, 'utf8');
    assert.equal(source.split(from).length - 1, 1, `${id} requires a unique mutation anchor`);
    writeFileSync(path, source.replace(from, to));
    const valid = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    assert.equal(valid.status, 0, `${id} is syntactically invalid, not a useful mutation`);
    const result = spawnSync(process.execPath, ['--test', 'tests/focused.test.mjs'], { env: { ...process.env, G03_BUILD_DIR: dir }, encoding: 'utf8', timeout: 60_000 });
    if (result.error) throw result.error;
    const killed = result.status !== 0;
    const failedTests = result.stdout.split('\n').filter(line => /not ok|^✖/.test(line)).map(line => line.trim());
    assert.ok(!killed || failedTests.length, `${id} failed to run rather than a test catching it: ${result.stderr}`);
    outcomes.push({ id, file, description, killed, failedTests }); console.log(`${id}: ${killed ? 'caught' : 'SURVIVED'} — ${description}`);
  }
  writeFileSync('.tmp/mutation-results.json', JSON.stringify(outcomes, null, 2) + '\n');
  assert.ok(outcomes.filter(x => x.killed).length >= 24, 'at least 24 of 25 planted bugs must be caught');
  console.log(JSON.stringify({ planted: 25, caught: outcomes.filter(x => x.killed).length }));
} finally { rmSync(dir, { recursive: true, force: true }); }
