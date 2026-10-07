// What the reader says, in the content language. Each line is also shown as
// text on the TV (and on PhoneStage phones). Keys are stable per round + beat.
import { judgePlayer, leaders } from './scoring';
import { showWord } from './rules';
import type { Beat, State } from './types';

export type Line = { key: string; text: string };

const ROUND_EN = ['one', 'two', 'three', 'four', 'five'];
const ROUND_ES = ['uno', 'dos', 'tres', 'cuatro', 'cinco'];

/** The room plays in Spanish (reader lines and results text follow the content language). */
export function es(state: State): boolean {
  return state.cfg.lang === 'es';
}

function name(state: State, id: string): string {
  return state.players[id]?.name ?? '';
}

function list(state: State, ids: string[]): string {
  const names = ids.map((id) => name(state, id));
  if (names.length <= 1) return names.join('');
  const and = es(state) ? ' y ' : ' and ';
  return `${names.slice(0, -1).join(', ')}${and}${names[names.length - 1]}`;
}

export function shakeLine(state: State): Line {
  const n = state.round;
  const last = n === state.cfg.rounds && n > 1;
  const text = es(state)
    ? last ? '¡Última ronda! ¡A sacudir!' : `Ronda ${ROUND_ES[n - 1] ?? n}. ¡A sacudir!`
    : last ? 'Final round. Shake it up!' : `Round ${ROUND_EN[n - 1] ?? n}. Shake it up!`;
  return { key: `su:r${n}:shake`, text };
}

export function goLine(state: State): Line {
  const s = Math.round(state.cfg.huntMs / 1000);
  const en: Record<number, string> = { 90: 'Ninety seconds. Go!', 120: 'Two minutes. Go!', 180: 'Three minutes. Go!', 240: 'Four minutes. Go!' };
  const sp: Record<number, string> = { 90: 'Noventa segundos. ¡Ya!', 120: 'Dos minutos. ¡Ya!', 180: 'Tres minutos. ¡Ya!', 240: 'Cuatro minutos. ¡Ya!' };
  return { key: `su:r${state.round}:go`, text: (es(state) ? sp[s] : en[s]) ?? (es(state) ? '¡Ya!' : 'Go!') };
}

export function lastCallLine(state: State): Line {
  return { key: `su:r${state.round}:30`, text: es(state) ? '¡Treinta segundos!' : 'Thirty seconds!' };
}

export function beatLine(state: State, beat: Beat, index: number): Line {
  const key = `su:r${state.round}:b${index}`;
  const E = es(state);
  if (beat.kind === 'missed') {
    const w = showWord(state.missed?.w ?? '');
    return { key, text: E ? `¡Nadie encontró ${w}!` : `Nobody found ${w}!` };
  }
  if (beat.kind === 'empty') {
    if (beat.ids.length === state.order.length) return { key, text: E ? 'No hubo palabras esta ronda.' : 'No words this round.' };
    return { key, text: E ? `${list(state, beat.ids)}: sin palabras.` : `${list(state, beat.ids)}: no words this round.` };
  }
  const judged = judgePlayer(state, beat.id);
  const top = judged.find((j) => j.pts > 0);
  const who = name(state, beat.id);
  if (!top) {
    return { key, text: E ? `${who}: todas sus palabras las encontró alguien más.` : `${who}: every word was shared.` };
  }
  const total = judged.reduce((s, j) => s + j.pts, 0);
  const w = showWord(top.w);
  if (top.len >= 6) {
    return { key, text: E ? `${who}: ¡${w}! ${top.len} letras, ${top.pts} puntos.` : `${who}: ${w}! ${top.len} letters, ${top.pts} points.` };
  }
  return { key, text: E ? `${who} suma ${total}. Mejor palabra: ${w}.` : `${who} scores ${total}. Best word: ${w}.` };
}

export function tallyLine(state: State): Line {
  const key = `su:r${state.round}:tally`;
  const E = es(state);
  const now = leaders(state.order, state.scores);
  const before = state.leadersBefore;
  if (now.length === 0) return { key, text: E ? 'Todavía nada en el marcador.' : 'Still nothing on the board.' };
  if (now.length > 1) return { key, text: E ? '¡Empate en la cima!' : 'A tie at the top!' };
  const who = name(state, now[0] as string);
  const same = before.length === 1 && before[0] === now[0];
  return { key, text: same ? (E ? `${who} sigue arriba.` : `${who} stays on top.`) : E ? `¡${who} toma la delantera!` : `${who} takes the lead!` };
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}
