// Final results: ranking with shared places, 3–5 awards, headline, outro detail.
// All text is in the room's content language, as the reader's lines are (lines.ts): the shell shows it
// as given, so numbers and names sit inside whole sentences that read right in each language.
import type { Award, RankRow, Results } from '@partybox/game-sdk';
import { es } from './lines';
import { letterCount, showWord } from './rules';
import type { State } from './types';

/** Award titles and descriptions, English then Spanish (the English is also a strings.ts key). */
const AWARDS: Record<string, { icon: string; en: [string, string]; es: [string, string] }> = {
  wordsmith: { icon: '📏', en: ['Wordsmith', 'Longest unique word of the game.'], es: ['Artesano de palabras', 'La palabra única más larga del juego.'] },
  'lone-wolf': { icon: '🐺', en: ['Lone Wolf', 'Most words nobody else found.'], es: ['Lobo solitario', 'Más palabras que nadie más encontró.'] },
  'great-minds': { icon: '🧠', en: ['Great Minds', 'Most words someone else found too.'], es: ['Mentes brillantes', 'Más palabras que alguien más también encontró.'] },
  'quick-draw': { icon: '⚡', en: ['Quick Draw', 'Fastest first word, averaged over the rounds.'], es: ['Rápido como rayo', 'La primera palabra más rápida, en promedio por ronda.'] },
  'dictionary-diver': { icon: '📖', en: ['Dictionary Diver', 'Most words the VIP let through.'], es: ['Buzo del diccionario', 'Más palabras que el VIP dejó pasar.'] },
  'big-round': { icon: '🎯', en: ['Big Round', 'Best single round.'], es: ['Gran ronda', 'La mejor ronda.'] },
  'steady-hand': { icon: '✍️', en: ['Steady Hand', 'Most words traced in all.'], es: ['Pulso firme', 'Más palabras trazadas en total.'] },
  'zen-garden': { icon: '🪷', en: ['Zen Garden', 'Fewest words traced. Very calm.'], es: ['Jardín zen', 'Menos palabras trazadas. Mucha calma.'] },
};

/** "1 word" / "3 words" in the room's language: [singular, plural] per language. */
function count(E: boolean, n: number, en: [string, string], sp: [string, string]): string {
  return `${n} ${(E ? sp : en)[n === 1 ? 0 : 1]}`;
}

type Pick = { ids: string[]; value: number };

/** Players with the highest (or lowest) value; none when the best is not `qualifies`. */
function best(state: State, val: (id: string) => number | null, dir: 1 | -1, qualifies: (v: number) => boolean): Pick | null {
  let top: number | null = null;
  for (const id of state.order) {
    const v = val(id);
    if (v === null) continue;
    if (top === null || v * dir > top * dir) top = v;
  }
  if (top === null || !qualifies(top)) return null;
  return { ids: state.order.filter((id) => val(id) === top), value: top };
}

const sum = (state: State, key: 'unique' | 'shared' | 'counted' | 'points') => (id: string) =>
  state.log.reduce((s, r) => s + (r[key][id] ?? 0), 0);

/** Longest scoring word of the game; ties → earliest round, then seat order. */
export function longestWord(state: State): { word: string; playerId: string } | null {
  let out: { word: string; playerId: string } | null = null;
  for (const r of state.log) {
    for (const id of state.order) {
      const w = r.best[id];
      if (w && (!out || letterCount(w) > letterCount(out.word))) out = { word: w, playerId: id };
    }
  }
  return out;
}

function awards(state: State): Award[] {
  const E = es(state);
  const list: Award[] = [];
  const entry = (id: string, playerIds: string[], value: string): Award => {
    const a = AWARDS[id] as (typeof AWARDS)[string];
    const [title, description] = E ? a.es : a.en;
    return { id, icon: a.icon, title, description, playerId: playerIds[0] ?? '', playerIds, value };
  };
  const add = (id: string, p: Pick | null, value: (v: number) => string) => {
    if (p) list.push(entry(id, p.ids, value(p.value)));
  };
  const words = (v: number) => count(E, v, ['word', 'words'], ['palabra', 'palabras']);
  const lw = longestWord(state);
  if (lw) list.push(entry('wordsmith', [lw.playerId], `${showWord(lw.word)}, ${count(E, letterCount(lw.word), ['letter', 'letters'], ['letra', 'letras'])}`));
  add('lone-wolf', best(state, sum(state, 'unique'), 1, (v) => v > 0), (v) => count(E, v, ['unique word', 'unique words'], ['palabra única', 'palabras únicas']));
  add('great-minds', best(state, sum(state, 'shared'), 1, (v) => v > 0), (v) => count(E, v, ['shared word', 'shared words'], ['palabra repetida', 'palabras repetidas']));
  const avgFirst = (id: string) => {
    const t = state.log.map((r) => Object.hasOwn(r.firstMs, id) ? r.firstMs[id] : undefined).filter((x): x is number => x !== undefined);
    return t.length ? Math.round(t.reduce((a, b) => a + b, 0) / t.length) : null;
  };
  add('quick-draw', best(state, avgFirst, -1, () => true), (v) => `${E ? 'primera palabra en' : 'first word in'} ${seconds(E, v)} s`);
  add('dictionary-diver', best(state, sum(state, 'counted'), 1, (v) => v > 0), (v) => count(E, v, ['ruled “That counts”', 'ruled “That counts”'], ['palabra aceptada por el VIP', 'palabras aceptadas por el VIP']));
  // Fallbacks so even an idle game has three awards.
  const bigRound = (id: string) => Math.max(0, ...state.log.map((r) => r.points[id] ?? 0));
  if (list.length < 3) add('big-round', best(state, bigRound, 1, () => true), (v) => `+${v} ${E ? 'en una ronda' : 'in one round'}`);
  const tried = (id: string) => state.log.reduce((s, r) => s + (r.unique[id] ?? 0) + (r.shared[id] ?? 0), 0);
  if (list.length < 3) add('steady-hand', best(state, tried, 1, () => true), words);
  if (list.length < 3) add('zen-garden', best(state, tried, -1, () => true), words);
  return list.slice(0, 5);
}

export function rankingOf(state: State): RankRow[] {
  const rows = state.order.map((id, i) => ({ id, i, score: state.scores[id] ?? 0 }));
  rows.sort((a, b) => b.score - a.score || a.i - b.i);
  let place = 0;
  return rows.map((r, k) => {
    if (k === 0 || r.score !== (rows[k - 1] as { score: number }).score) place = k + 1;
    return { playerId: r.id, score: r.score, rank: place, place };
  });
}

/** The longest word nobody found, over the game (earliest round on ties). */
export function bestMissed(state: State): string | undefined {
  return state.log.map((r) => r.missed).filter((w): w is string => !!w).sort((a, b) => letterCount(b) - letterCount(a))[0];
}

/** Seconds with one decimal, in the room's notation ("0.5" / "0,5"). */
export function seconds(E: boolean, ms: number): string {
  const v = (ms / 1000).toFixed(1);
  return E ? v.replace('.', ',') : v;
}

export function results(state: State): Results {
  const ranking = rankingOf(state);
  const winnerIds = ranking.filter((r) => r.place === 1).map((r) => r.playerId);
  const name = (id: string) => state.players[id]?.name ?? '';
  const lw = longestWord(state);
  const runner = state.order
    .filter((id) => id !== lw?.playerId)
    .map((id) => ({ id, w: state.log.map((r) => r.best[id] ?? '').reduce((a, b) => (letterCount(b) > letterCount(a) ? b : a), '') }))
    .filter((x) => x.w)
    .sort((a, b) => letterCount(b.w) - letterCount(a.w))[0];
  const missed = bestMissed(state);
  const E = es(state);
  const placeLines: Record<string, string> = {};
  for (const id of state.order) {
    const u = state.log.reduce((s, r) => s + (r.unique[id] ?? 0), 0);
    Object.defineProperty(placeLines, id, { value: count(E, u, ['unique word', 'unique words'], ['palabra única', 'palabras únicas']), enumerable: true });
  }
  const topScore = ranking[0]?.score ?? 0;
  const winner = name(winnerIds[0] as string);
  const headline = E
    ? topScore === 0 ? 'Nadie anotó. Ganan los cubos.' : winnerIds.length > 1 ? '¡Empate en la cima!' : `${winner} dominó las letras`
    : topScore === 0 ? 'Nobody scored. The cubes win.' : winnerIds.length > 1 ? 'A tie at the top!' : `${winner} out-spelled the room`;
  const note = missed ? `${E ? 'La mejor palabra que nadie encontró' : 'Best word nobody found'}: ${showWord(missed)}` : '';
  return {
    scores: { ...state.scores },
    ranking,
    winnerIds,
    awards: awards(state),
    headline,
    ...(note ? { headlineNote: note } : {}),
    placeLines,
    tags: Object.fromEntries(state.order.map(id => [id, [state.cfg.lang, `${state.cfg.size}x${state.cfg.size}`]])),
    detail: {
      grid: state.grid.slice(),
      size: state.cfg.size,
      longest: lw ? { word: showWord(lw.word), playerId: lw.playerId, letters: letterCount(lw.word) } : null,
      runnerUp: runner ? { word: showWord(runner.w), playerId: runner.id } : null,
      perPlayer: state.order.map((id) => ({
        id,
        name: name(id),
        unique: state.log.reduce((s, r) => s + (r.unique[id] ?? 0), 0),
        shared: state.log.reduce((s, r) => s + (r.shared[id] ?? 0), 0),
        best: showWord(state.log.map((r) => r.best[id] ?? '').reduce((a, b) => (letterCount(b) > letterCount(a) ? b : a), '')),
      })),
      missed: missed ? { word: showWord(missed), letters: letterCount(missed) } : null,
    },
  };
}
