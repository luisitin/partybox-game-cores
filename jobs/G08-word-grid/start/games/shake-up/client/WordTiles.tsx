// A word shown as the cubes it came from: one tile per letter. Tiles shrink to
// fit long words in their container (never overflow, never wrap), up to the
// size the caller sets with --wt-max. Pure render.
import type { CSSProperties } from 'react';
import s from './words.module.css';

/** Splits a shown word into cube faces: "Qu" is one cube. */
export function faces(word: string): string[] {
  return word.match(/QU|Qu|./gu) ?? [];
}

export function WordTiles({ word, tone = 'gold', label, className }: { word: string; tone?: 'gold' | 'cube'; label?: string; className?: string }) {
  const f = faces(word);
  return (
    <span className={`${s.tiles} ${className ?? ''}`} style={{ '--n': f.length } as CSSProperties} role="img" aria-label={label ?? word}>
      {f.map((l, i) => (
        <span key={i} className={`${s.tile} ${s[tone]} ${l.length > 1 ? s.wide : ''}`} style={{ '--i': i } as CSSProperties} aria-hidden>
          {l.length > 1 ? `${l[0]}${l.slice(1).toLowerCase()}` : l}
        </span>
      ))}
    </span>
  );
}
