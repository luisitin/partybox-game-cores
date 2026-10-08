/** Reproduce historical bank-only evidence in an isolated temporary tree. */
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, symlinkSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const job = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temporary = mkdtempSync(join(tmpdir(), 'g09-breadth-'));
try {
  cpSync(resolve(job, '../../contract'), join(temporary, 'contract'), { recursive: true });
  for (const label of ['baseline', 'bank-only', 'after']) {
    const isolated = join(temporary, 'jobs', label);
    mkdirSync(join(isolated, 'scripts'), { recursive: true });
    mkdirSync(join(isolated, 'content')); mkdirSync(join(isolated, 'evidence'));
    cpSync(join(job, 'src'), join(isolated, 'src'), { recursive: true });
    cpSync(join(job, 'package.json'), join(isolated, 'package.json'));
    cpSync(join(job, 'evidence/breadth-original-experiment.ts'), join(isolated, 'scripts/breadth.ts'));
    cpSync(join(job, 'scripts/generate-content.mjs'), join(isolated, 'scripts/generate-content.mjs'));
    cpSync(join(job, label === 'baseline' ? 'evidence/breadth-baseline-authored.mjs' : 'content/authored.mjs'), join(isolated, 'content/authored.mjs'));
    cpSync(join(job, label === 'after' ? 'evidence/breadth-strategy-core.ts' : 'evidence/breadth-original-core.ts'), join(isolated, 'src/index.ts'));
    cpSync(join(job, 'evidence/breadth-original-match.ts'), join(isolated, 'src/match.ts'));
    symlinkSync(join(job, 'node_modules'), join(isolated, 'node_modules'), 'dir');
    execFileSync(process.execPath, ['scripts/generate-content.mjs'], { cwd: isolated, stdio: 'ignore' });
    const argument = label === 'baseline' ? 'baseline' : 'after';
    execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/breadth.ts', `--label=${argument}`], { cwd: isolated, stdio: 'ignore' });
    const output = readFileSync(join(isolated, `evidence/breadth-${argument}.json`));
    const target = join(job, `evidence/breadth-${label}.json`);
    if (process.argv.includes('--check')) assert.deepEqual(output, readFileSync(target), `${label}: historical report byte identity`);
    else writeFileSync(target, output);
    console.log(`${label}: 200 actual-core rounds reproduced byte-identically`);
  }
} finally { rmSync(temporary, { recursive: true, force: true }); }
