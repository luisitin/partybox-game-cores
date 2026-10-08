import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { z } from 'zod';
import { CATEGORIES, LETTERS } from '../content/categories';
import { categoryPackSchema } from '../content/schema';

const root = new URL('../', import.meta.url);
const normalized = (text: string) => text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/^(?:a|an|the)\s+/, '').replace(/[^a-z0-9]/g, '');

test('original category content obeys the authoritative schema and JSON Schema has no drift', () => {
  const json = JSON.parse(readFileSync(new URL('content/categories.json', root), 'utf8'));
  const schema = JSON.parse(readFileSync(new URL('content/categories.schema.json', root), 'utf8'));
  assert.deepEqual(schema, z.toJSONSchema(categoryPackSchema));
  const parsed = categoryPackSchema.parse(json);
  assert.deepEqual(parsed.categories, CATEGORIES);
  assert.deepEqual(parsed.letters, LETTERS);
  assert.ok(CATEGORIES.length >= 300);
});

test('prompts and IDs are unique and every allowed letter has twelve playable categories', () => {
  assert.equal(new Set(CATEGORIES.map(c => c.id)).size, CATEGORIES.length);
  assert.equal(new Set(CATEGORIES.map(c => normalized(c.prompt))).size, CATEGORIES.length);
  assert.equal(new Set(LETTERS).size, 20);
  for (const letter of LETTERS) assert.ok(CATEGORIES.filter(c => c.answers[letter]?.length).length >= 12, letter);
  for (const category of CATEGORIES) {
    assert.ok(Object.keys(category.answers).length >= 2, category.id);
    for (const [letter, answers] of Object.entries(category.answers)) {
      assert.ok(LETTERS.includes(letter), `${category.id}/${letter}`);
      assert.equal(new Set(answers.map(normalized)).size, answers.length, `${category.id}/${letter} normalized duplicate`);
      for (const answer of answers) {
        assert.equal(answer, answer.toLowerCase());
        assert.equal(normalized(answer)[0]?.toUpperCase(), letter, `${category.id}/${answer}`);
      }
    }
  }
});

test('original source regenerates generated content byte for byte', () => {
  execFileSync(process.execPath, [new URL('scripts/generate-content.mjs', root).pathname, '--check'], { encoding: 'utf8' });
});
