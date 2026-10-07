// Every phone and TV string the game shows through L('…') has a Latin-American Spanish entry.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { strings } from '../client/strings';

const client = join(__dirname, '..', 'client');
const files = (d: string): string[] =>
  readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : []; });

describe('strings', () => {
  it('has a Spanish entry for every literal L() key in the client', () => {
    const missing: string[] = [];
    let seen = 0;
    for (const f of files(client)) {
      for (const m of readFileSync(f, 'utf8').matchAll(/\bL\('((?:[^'\\]|\\.)*)'/g)) {
        const key = (m[1] ?? '').replace(/\\(.)/g, '$1');
        seen++;
        if (!(key in strings)) missing.push(`${f.slice(client.length + 1)}: ${key}`);
      }
    }
    expect(seen).toBeGreaterThan(80);
    expect(missing).toEqual([]);
  });
});
