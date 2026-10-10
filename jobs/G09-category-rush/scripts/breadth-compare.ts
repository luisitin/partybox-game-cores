/** Regenerate measured content deltas from retained actual-core reports and packs. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { z } from 'zod';
import { breadthReportSchema, breadthComparisonSchema } from '../content/breadth-schema';
import { categoryPackSchema } from '../content/schema';
const root = new URL('../', import.meta.url);
const read = (name: string) => readFileSync(new URL(name, root), 'utf8');
const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const baselineRaw = read('evidence/breadth-baseline.json'), afterRaw = read('evidence/breadth-bank-only.json');
const baseline = breadthReportSchema.parse(JSON.parse(baselineRaw)), after = breadthReportSchema.parse(JSON.parse(afterRaw));
const oldRaw = read('evidence/breadth-baseline-content.json'), newRaw = read('content/categories.json');
const oldPack = categoryPackSchema.parse(JSON.parse(oldRaw)), newPack = categoryPackSchema.parse(JSON.parse(newRaw));
assert.equal(digest(oldRaw), baseline.sourceHashes.data);
assert.equal(digest(newRaw), after.sourceHashes.data);
for (const name of ['core', 'scoring', 'matcher', 'experiment'] as const) assert.equal(baseline.sourceHashes[name], after.sourceHashes[name], name);
let improvedGames = 0, worsenedGames = 0, tiedGames = 0;
baseline.rows.forEach((before, i) => {
  const next = after.rows[i];
  assert.equal(before.seed, next.seed); assert.equal(before.letter, next.letter); assert.deepEqual(before.layout, next.layout);
  if (next.awarded > before.awarded) improvedGames++;
  else if (next.awarded < before.awarded) worsenedGames++;
  else tiedGames++;
});
const changes: { id: string; letter: string; before: string[]; after: string[]; added: string[] }[] = [];
oldPack.categories.forEach((before, index) => {
  const next = newPack.categories[index];
  assert.deepEqual({ ...before, answers: {} }, { ...next, answers: {} });
  assert.deepEqual(Object.keys(before.answers), Object.keys(next.answers));
  for (const letter of Object.keys(before.answers)) {
    const oldBank = before.answers[letter as keyof typeof before.answers]!;
    const newBank = next.answers[letter as keyof typeof next.answers]!;
    assert.deepEqual(newBank.slice(0, oldBank.length), oldBank, `${before.id}/${letter}: baseline examples and order`);
    const added = newBank.slice(oldBank.length);
    if (added.length) changes.push({ id: before.id, letter, before: oldBank, after: newBank, added });
  }
});
const comparison = breadthComparisonSchema.parse({ protocol: baseline.protocol, baselineCommit: 'b1663d9', baselineReportHash: digest(baselineRaw), afterReportHash: digest(afterRaw), baselineDataHash: digest(oldRaw), afterDataHash: digest(newRaw), matchingLayouts: 200, matchingMechanics: true, unchangedCategoryMetadata: true, unchangedBankKeys: true, additions: changes.reduce((sum, bank) => sum + bank.added.length, 0), changedCategories: new Set(changes.map(bank => bank.id)).size, changedBanks: changes.length, improvedGames, worsenedGames, tiedGames, baselineAwarded: baseline.outcomes.awarded, afterAwarded: after.outcomes.awarded, awardedGain: after.outcomes.awarded - baseline.outcomes.awarded, changes });
const outputs = [
  ['evidence/breadth-comparison.json', JSON.stringify(comparison, null, 2) + '\n'],
  ['evidence/breadth-report.schema.json', JSON.stringify(z.toJSONSchema(breadthReportSchema), null, 2) + '\n'],
  ['evidence/breadth-comparison.schema.json', JSON.stringify(z.toJSONSchema(breadthComparisonSchema), null, 2) + '\n'],
] as const;
for (const [name, text] of outputs) {
  if (process.argv.includes('--check')) assert.equal(read(name), text, name);
  else writeFileSync(new URL(name, root), text);
}
console.log(JSON.stringify({ additions: comparison.additions, changedCategories: comparison.changedCategories, changedBanks: comparison.changedBanks, baselineAwarded: comparison.baselineAwarded, afterAwarded: comparison.afterAwarded, awardedGain: comparison.awardedGain, improvedGames, worsenedGames, tiedGames }, null, 2));
