// Content build tool (not game code): prunes the public word lists into the
// packs Shake Up ships. Run from the repo root:
//   pnpm tsx games/shake-up/content/build-words.ts --es-freq <path to es_50k.txt>
// Inputs (dev dependencies, see content/SOURCES.md):
//   an-array-of-english-words, an-array-of-spanish-words, wordlist-english,
//   naughty-words, and hermitdave/FrequencyWords es_50k.txt (downloaded once).
// Outputs (sorted by code unit, deduplicated, lowercase):
//   words.<lang>.json      the dictionary that judges every word
//   blocked.<lang>.json    words refused while `spicy` is off
//   bot-words.<lang>.json  { easy, normal, sharp } bot vocabularies (⊂ words)
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { foldWord } from '../server/rules';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const MIN = 3;
const MAX = 17; // 16 cubes, one of which may be "Qu"

type Lang = 'en' | 'es';
const ALPHA: Record<Lang, RegExp> = { en: /^[a-z]+$/, es: /^[a-zñ]+$/ };

function sortUnique(words: Iterable<string>): string[] {
  return [...new Set(words)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
}

/** A word a grid can spell: right alphabet, right length, every q followed by u. */
function spellable(lang: Lang, w: string): boolean {
  if (w.length < MIN || w.length > MAX || !ALPHA[lang].test(w)) return false;
  for (let i = 0; i < w.length; i++) if (w[i] === 'q' && w[i + 1] !== 'u') return false;
  return true;
}

function clean(lang: Lang, raw: Iterable<string>): string[] {
  const out: string[] = [];
  for (const r of raw) {
    const w = foldWord(r);
    if (spellable(lang, w)) out.push(w);
  }
  return sortUnique(out);
}

function write(name: string, data: unknown): void {
  const file = join(here, name);
  writeFileSync(file, JSON.stringify(data));
  console.log(`${name}: ${(readFileSync(file).length / 1024).toFixed(0)} KB`);
}

function blockedFor(lang: Lang): string[] {
  const raw: string[] = require(`naughty-words/${lang}.json`);
  // Single words only; phrases cannot be traced on a grid anyway.
  return clean(lang, raw.filter((p) => !/\s/.test(p)));
}

function intersect(words: string[], dict: Set<string>, blocked: Set<string>, maxLen = 8): string[] {
  return sortUnique(words.filter((w) => dict.has(w) && !blocked.has(w) && w.length <= maxLen));
}

function main(): void {
  const args = process.argv.slice(2);
  const esFreqPath = args[args.indexOf('--es-freq') + 1];

  // English
  const en = clean('en', require('an-array-of-english-words') as string[]);
  const enBlocked = blockedFor('en');
  const enSet = new Set(en);
  const enBlockSet = new Set(enBlocked);
  const tier = (n: number) => clean('en', require(`wordlist-english/english-words-${n}.json`) as string[]);
  write('words.en.json', en);
  write('blocked.en.json', enBlocked.filter((w) => enSet.has(w)));
  write('bot-words.en.json', {
    easy: intersect(tier(10), enSet, enBlockSet, 5),
    normal: intersect([...tier(10), ...tier(20), ...tier(35)], enSet, enBlockSet, 7),
    sharp: intersect([...tier(10), ...tier(20), ...tier(35), ...tier(40), ...tier(50)], enSet, enBlockSet, 9),
  });

  // Spanish
  const es = clean('es', require('an-array-of-spanish-words') as string[]);
  const esBlocked = blockedFor('es');
  const esSet = new Set(es);
  const esBlockSet = new Set(esBlocked);
  write('words.es.json', es);
  write('blocked.es.json', esBlocked.filter((w) => esSet.has(w)));
  if (!esFreqPath || esFreqPath.startsWith('--')) {
    console.warn('No --es-freq file: Spanish bots fall back to short dictionary words.');
    return;
  }
  const ranked = readFileSync(esFreqPath, 'utf8')
    .split('\n')
    .map((l) => foldWord(l.split(' ')[0] ?? ''))
    .filter((w) => spellable('es', w) && esSet.has(w));
  const top = (n: number) => [...new Set(ranked)].slice(0, n);
  write('bot-words.es.json', {
    easy: intersect(top(2500), esSet, esBlockSet, 5),
    normal: intersect(top(10000), esSet, esBlockSet, 7),
    sharp: intersect(top(30000), esSet, esBlockSet, 9),
  });
}

main();
