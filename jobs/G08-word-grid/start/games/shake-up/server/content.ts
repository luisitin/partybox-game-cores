// Typed access to the packs. Content stays on the server; phones never import it.
import cubesEn from '../content/cubes.en.json';
import cubesEs from '../content/cubes.es.json';
import wordsEn from '../content/words.en.json';
import wordsEs from '../content/words.es.json';
import blockedEn from '../content/blocked.en.json';
import blockedEs from '../content/blocked.es.json';
import botEn from '../content/bot-words.en.json';
import botEs from '../content/bot-words.es.json';
import type { BotWords, CubePack } from '../content/schema';
import type { WordList } from './dict';
import { foldWord } from './rules';

export type Lang = 'en' | 'es';
export const LANGS: readonly Lang[] = ['en', 'es'];

export type Pack = { cubes: CubePack; words: WordList; blocked: WordList; bots: BotWords };

const PACKS: Readonly<Record<Lang, Pack>> = {
  en: { cubes: cubesEn as CubePack, words: wordsEn, blocked: blockedEn, bots: botEn },
  es: { cubes: cubesEs as CubePack, words: wordsEs, blocked: blockedEs, bots: botEs },
};

export function packFor(lang: Lang): Pack {
  return PACKS[lang];
}

export function asLang(raw: unknown): Lang {
  return raw === 'es' ? 'es' : 'en';
}

/** Cube faces for a grid size, already folded to the stored form ("qu", "ñ"). */
export function cubeFaces(lang: Lang, size: 4 | 5): string[][] {
  const set = PACKS[lang].cubes.sets[size === 5 ? '5x5' : '4x4'];
  return set.map((c) => c.faces.map((f) => foldWord(f)));
}
