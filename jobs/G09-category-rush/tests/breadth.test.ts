import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { z } from 'zod';
import { breadthReportSchema, breadthComparisonSchema } from '../content/breadth-schema';
import { categoryPackSchema } from '../content/schema';
import { validateJsonSchema } from '../scripts/json-schema-validator';
import { sameAnswer } from '../src/match';
const root = new URL('../', import.meta.url);
const read = (file: string) => JSON.parse(readFileSync(new URL(file, root), 'utf8'));

test('retained content experiment files obey independent emitted JSON schemas', () => {
  const reportSchema = read('evidence/breadth-report.schema.json');
  const comparisonSchema = read('evidence/breadth-comparison.schema.json');
  assert.deepEqual(reportSchema, z.toJSONSchema(breadthReportSchema));
  assert.deepEqual(comparisonSchema, z.toJSONSchema(breadthComparisonSchema));
  for (const name of ['baseline', 'bank-only', 'after', 'lexical']) {
    const report = breadthReportSchema.parse(read(`evidence/breadth-${name}.json`));
    assert.deepEqual(validateJsonSchema(reportSchema, report), []);
    assert.equal(report.outcomes.replayMatches, 200);
    assert.equal(report.rows.reduce((sum, row) => sum + row.awarded, 0), report.outcomes.awarded);
    assert.equal(report.rows.reduce((sum, row) => sum + row.submitted, 0), report.outcomes.submitted);
    assert.equal(report.rows.reduce((sum, row) => sum + row.duplicated, 0), report.outcomes.duplicated);
    report.rows.forEach((row, i) => {
      assert.equal(row.seed, i + 1); assert.equal(new Set(row.layout).size, 12);
      assert.equal(Object.values(row.scores).reduce((a, b) => a + b, 0), row.awarded);
      for (const count of [row.submitted, row.duplicated, row.awarded]) assert.ok(Number.isInteger(count) && count >= 0 && count <= 96);
      assert.ok(row.duplicated <= row.submitted);
    });
  }
  const oldPack = read('evidence/breadth-baseline-content.json');
  categoryPackSchema.parse(oldPack);
  assert.deepEqual(validateJsonSchema(read('content/categories.schema.json'), oldPack), []);
  const comparison = breadthComparisonSchema.parse(read('evidence/breadth-comparison.json'));
  assert.deepEqual(validateJsonSchema(comparisonSchema, comparison), []);
  assert.equal(comparison.additions, 388);
  assert.equal(comparison.changedCategories, 32);
  assert.equal(comparison.awardedGain, 24);
  assert.equal(comparison.improvedGames + comparison.worsenedGames + comparison.tiedGames, 200);
  const malformed = structuredClone(read('evidence/breadth-after.json')); malformed.rows.pop();
  assert.ok(validateJsonSchema(reportSchema, malformed).length);
});

test('expanded banks preserve support/layouts and add no core-equivalent answers', () => {
  const comparison = breadthComparisonSchema.parse(read('evidence/breadth-comparison.json'));
  for (const bank of comparison.changes) for (const added of bank.added) {
    assert.equal(added[0].toUpperCase(), bank.letter);
    for (const other of bank.after) if (added !== other) assert.equal(sameAnswer(added, other), false, `${bank.id}/${bank.letter}: ${added} vs ${other}`);
  }
  execFileSync(process.execPath, ['node_modules/tsx/dist/cli.mjs', 'scripts/breadth-compare.ts', '--check'], { cwd: root, encoding: 'utf8' });
  execFileSync(process.execPath, ['scripts/generate-content.mjs', '--baseline', '--check'], { cwd: root, encoding: 'utf8' });
});
