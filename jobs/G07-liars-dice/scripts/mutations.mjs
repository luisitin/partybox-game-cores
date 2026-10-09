import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
// npm test leaves timing-bearing raw logs in ignored transient storage. A
// validated run can be explicitly copied to evidence/mutations as a snapshot.
const evidence = resolve(root, '.work/mutations');
mkdirSync(evidence, { recursive: true });
const runtimeFiles = ['core.ts', 'rules.ts', 'probability.ts'];
const originalSources = Object.fromEntries(runtimeFiles.map((name) => [name, readFileSync(resolve(root, 'src', name), 'utf8')]));
const mutants = [
  ['R01', 'rules.ts', 'return !wild || next.face !== 1;', 'return true;', 'Allow an opening bid of wild ones', 'rules.test.mjs'],
  ['R02', 'rules.ts', 'Math.ceil(previous.quantity / 2)', 'Math.floor(previous.quantity / 2)', 'Round conversion to ones downward', 'rules.test.mjs'],
  ['R03', 'rules.ts', 'previous.quantity * 2 + 1', 'previous.quantity * 2', 'Permit an even conversion away from ones', 'rules.test.mjs'],
  ['R04', 'rules.ts', '(next.quantity === previous.quantity && next.face > previous.face)', '(next.quantity === previous.quantity && next.face >= previous.face)', 'Accept an unchanged bid', 'rules.test.mjs'],
  ['R05', 'rules.ts', 'next.face === previous.face && next.quantity > previous.quantity', 'next.face !== previous.face && next.quantity > previous.quantity', 'Reverse the palifico face lock', 'rules.test.mjs'],
  ['R06', 'rules.ts', 'bid.quantity >= 1', 'bid.quantity >= 0', 'Permit zero quantity', 'rules.test.mjs'],
  ['R07', 'rules.ts', '(wild && face !== 1 && die === 1)', '(wild && face !== 1 && die === 6)', 'Make sixes wild instead of ones', 'rules.test.mjs'],
  ['P01', 'probability.ts', 'BigInt(matches) ** BigInt(k)', 'BigInt(matches) ** BigInt(k + 1)', 'Add an extra hit-face factor to each probability mass', 'probability.test.mjs'],
  ['P02', 'probability.ts', 'BigInt(n - k) / BigInt(k + 1)', 'BigInt(n - k + 1) / BigInt(k + 1)', 'Corrupt binomial coefficients', 'probability.test.mjs'],
  ['P03', 'probability.ts', 'needed <= 0 ? row.total', 'needed <= 1 ? row.total', 'Treat one required match as certain', 'probability.test.mjs'],
  ['P04', 'probability.ts', 'needed < 0 || needed > n ? 0n', 'needed <= 0 || needed > n ? 0n', 'Remove exact zero-match mass', 'probability.test.mjs'],
  ['P05', 'probability.ts', 'total: 6n ** BigInt(n)', 'total: 5n ** BigInt(n)', 'Use a five-sided outcome denominator', 'probability.test.mjs'],
  ['P06', 'probability.ts', 'wild && face !== 1 ? 2 : 1', 'wild && face !== 1 ? 1 : 1', 'Ignore the second matching face in wild rounds', 'probability.test.mjs'],
  ['P07', 'probability.ts', 'probability(totalDice - ownDice.length, quantity - known, matchingFaces)', 'probability(Math.max(0, totalDice - ownDice.length - 1), quantity - known, matchingFaces)', 'Condition on one fewer hidden die', 'probability.test.mjs'],
  ['C01', 'core.ts', 's.settings.onesWild&&!s.palifico', 's.settings.onesWild', 'Keep ones wild during palifico', 'core.test.mjs'],
  ['C02', 'core.ts', "kind==='dudo'?matches<bid.quantity", "kind==='dudo'?matches<=bid.quantity", 'Make exact-count dudo succeed', 'core.test.mjs'],
  ['C03', 'core.ts', 'Math.max(0,before-1)', 'Math.max(0,before-2)', 'Lose two dice for a challenge', 'core.test.mjs'],
  ['C04', 'core.ts', 'diceCount[caller]++;gained=true;', 'diceCount[caller]+=2;gained=true;', 'Gain two dice for a correct calza', 'core.test.mjs'],
  ['C05', 'core.ts', 'bidLog:[...s.bidLog,bid].slice(-128),turn:nextAlive(s,id)', 'bidLog:[...s.bidLog,bid].slice(-128),turn:id', 'Keep the bidder on turn', 'core.test.mjs'],
  ['C06', 'core.ts', 'if(before===2&&diceCount[loser]===1', 'if(before===3&&diceCount[loser]===1', 'Suppress the two-to-one palifico trigger', 'core.test.mjs'],
  ['C07', 'core.ts', '[palificoStarter]:true', '[palificoStarter]:false', 'Forget that the starter has used palifico', 'core.test.mjs'],
  ['C08', 'core.ts', 'alive(s).length>2&&', 'alive(s).length>=2&&', 'Allow calza in a two-player duel', 'core.test.mjs'],
  ['C09', 'core.ts', 'e.startedAt===s.phase.startedAt&&', 'true&&', 'Accept stale timer instance stamps', 'contract.test.mjs'],
  ['C10', 'core.ts', "if(s.phase.paused||s.phase.id==='done')return s;", "if(s.phase.id==='done')return s;", 'Process input and timers during a hold', 'contract.test.mjs'],
  ['C11', 'core.ts', 'const ownDice=member?[...s.cups[id]]:[];', 'const ownDice=member?[...s.cups[s.order[0]]]:[];', 'Show the first seat cup to every controller', 'contract.test.mjs'],
];

function suite(file, directory) {
  return spawnSync(process.execPath, ['--test', '--test-reporter=tap', `tests/${file}`], {
    cwd: root, env: { ...process.env, CORE_DIR: directory }, encoding: 'utf8', timeout: 60000, maxBuffer: 8 * 1024 * 1024,
  });
}
const report = { compiler: 'esbuild 0.25.10, actual individually mutated TypeScript source bundles, ES2022 ESM', sourceSha256: Object.fromEntries(runtimeFiles.map((name) => [name, createHash('sha256').update(originalSources[name]).digest('hex')])), minimumAssertionKills: 24, total: mutants.length, results: [] };
async function compileSources(work, mutant = null) {
  mkdirSync(resolve(work, 'src')); mkdirSync(resolve(work, 'dist'));
  for (const name of runtimeFiles) {
    let source = originalSources[name];
    if (mutant && name === mutant.file) {
      assert.equal(source.split(mutant.before).length - 1, 1, `${mutant.id} anchor must occur exactly once`);
      source = source.replace(mutant.before, mutant.after);
    }
    source = source.replaceAll('../../../contract/', `${resolve(root, '../../contract')}/`);
    writeFileSync(resolve(work, 'src', name), source);
  }
  for (const name of ['core', 'rules', 'probability']) await build({ entryPoints: [resolve(work, 'src', `${name}.ts`)], outfile: resolve(work, 'dist', `${name}.mjs`), bundle: true, platform: 'node', format: 'esm', target: 'es2022', alias: { zod: resolve(root, 'node_modules/zod') }, logLevel: 'silent' });
  copyFileSync(resolve(root, 'dist/contract.mjs'), resolve(work, 'dist/contract.mjs'));
}
// A passing baseline is mandatory; missing files or pre-existing failures cannot
// count as mutation kills. Test each exact selected suite before touching code.
const baselineWork = mkdtempSync(resolve(evidence, '.baseline-'));
await compileSources(baselineWork);
for (const file of new Set(mutants.map((item) => item[5]))) {
  const baseline = suite(file, resolve(baselineWork, 'dist'));
  writeFileSync(resolve(evidence, `baseline-${file}.tap`), `${baseline.stdout || ''}${baseline.stderr || ''}`);
  assert.equal(baseline.status, 0, `baseline ${file} fails; refusing to attribute kills to mutants`);
}
rmSync(baselineWork, { recursive: true, force: true });
for (const [id, file, before, after, description, testFile] of mutants) {
  const work = mkdtempSync(resolve(evidence, '.work-'));
  let result;
  try {
    await compileSources(work, { id, file, before, after });
    const child = suite(testFile, resolve(work, 'dist'));
    const raw = `${child.stdout || ''}${child.stderr || ''}`;
    writeFileSync(resolve(evidence, `${id}.tap`), raw);
    const assertionKill = child.status !== 0 && /ERR_ASSERTION/.test(raw);
    result = { id, file: `src/${file}`, description, before, after, compiled: true, suite: `tests/${testFile}`, exitCode: child.status, assertionKill, failedTests: [...raw.matchAll(/^not ok \d+ - (.+)$/gm)].map((match) => match[1]), rawSha256: createHash('sha256').update(raw).digest('hex') };
  } catch (error) {
    result = { id, file: `src/${file}`, description, compiled: false, assertionKill: false, error: String(error) };
  } finally { rmSync(work, { recursive: true, force: true }); }
  report.results.push(result);
  console.log(JSON.stringify(result));
}
report.compiled = report.results.filter((item) => item.compiled).length;
report.assertionKills = report.results.filter((item) => item.assertionKill).length;
report.survivors = report.results.filter((item) => item.compiled && !item.assertionKill).map((item) => item.id);
report.result = report.compiled === 25 && report.assertionKills >= 24 ? 'PASS' : 'FAIL';
writeFileSync(resolve(evidence, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
assert.equal(report.compiled, 25, 'all 25 actual source mutants must compile');
assert.ok(report.assertionKills >= 24, `${report.assertionKills}/25 assertion kills, required 24`);
console.log(JSON.stringify({ result: report.result, compiled: report.compiled, assertionKills: report.assertionKills, survivors: report.survivors }));
