// Test-only reader binding; no voice service or network call is provided by the offline shell.
import type { SpeechRequest } from '../../../../contract/contract';
import { hashString } from '../../../../contract/rng';
export const reader = (_game: string, setting: string): string | null => setting === 'none' ? null : setting;
export const toSpeakable = (text: string) => ({ text });
export function drainSpeech(list: SpeechRequest[], cap: number): SpeechRequest[] {
  const byKey = new Map<string, SpeechRequest>();
  for (const request of list) {
    const material = JSON.stringify([request.voice, request.parts]);
    const key = `shake-up-${hashString(material).toString(16).padStart(8,'0')}${hashString('reader:'+material).toString(16).padStart(8,'0')}`;
    byKey.set(key, { ...request, key });
  }
  return [...byKey.values()].slice(0,cap);
}
