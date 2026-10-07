// Reader lines: the current line plus what is coming, at most 10 pending.
// Secrets stay server-side; a view only carries a key once its line plays.
import type { SpeechRequest } from '@partybox/game-sdk';
import { drainSpeech, reader, toSpeakable } from '@partybox/game-sdk/speech';
import { beatLine, goLine, lastCallLine, shakeLine, tallyLine, type Line } from './lines';
import type { State } from './types';

export function speech(state: State): SpeechRequest[] {
  const voice = reader('shake-up', state.cfg.reader);
  if (!voice) return [];
  const lines: Line[] = [];
  switch (state.phase.id) {
    case 'shake':
      lines.push(shakeLine(state), goLine(state), lastCallLine(state));
      break;
    case 'hunt':
      lines.push(goLine(state), lastCallLine(state));
      break;
    case 'reveal': {
      const step = state.phase.step ?? 0;
      state.beats.forEach((b, i) => { if (i >= step) lines.push(beatLine(state, b, i)); });
      break;
    }
    case 'tally':
      lines.push(tallyLine(state));
      break;
    default:
      break;
  }
  return drainSpeech(lines.map((l) => ({ key: l.key, voice, parts: [toSpeakable(l.text)] })), 10);
}

/** Fixed lines for `pnpm speech:warm` (both languages, every hunt length). */
export function speechCatalog(): SpeechRequest[] {
  const out: SpeechRequest[] = [];
  const fixed = [
    'Round one. Shake it up!', 'Round two. Shake it up!', 'Round three. Shake it up!', 'Round four. Shake it up!', 'Final round. Shake it up!',
    'Ninety seconds. Go!', 'Two minutes. Go!', 'Three minutes. Go!', 'Four minutes. Go!', 'Thirty seconds!',
    'No words this round.', 'A tie at the top!', 'Still nothing on the board.',
    'Ronda uno. ¡A sacudir!', 'Ronda dos. ¡A sacudir!', 'Ronda tres. ¡A sacudir!', 'Ronda cuatro. ¡A sacudir!', '¡Última ronda! ¡A sacudir!',
    'Noventa segundos. ¡Ya!', 'Dos minutos. ¡Ya!', 'Tres minutos. ¡Ya!', 'Cuatro minutos. ¡Ya!', '¡Treinta segundos!',
    'No hubo palabras esta ronda.', '¡Empate en la cima!', 'Todavía nada en el marcador.',
  ];
  fixed.forEach((t, i) => out.push({ key: `su:catalog:${i}`, voice: 'host-hype', parts: [toSpeakable(t)] }));
  return out;
}
