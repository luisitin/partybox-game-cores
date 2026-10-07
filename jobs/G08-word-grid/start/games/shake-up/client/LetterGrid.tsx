// The flat letter grid: the phone's whole game surface and the TV's 2D stage
// (reduced motion, no WebGL). A traced path is drawn with numbers AND a line,
// never colour alone. The line runs UNDER the cubes, so it shows as links in the
// gaps and never covers a letter. Pure render: no state, no I/O.
import type { CSSProperties, ReactNode } from 'react';
import s from './grid.module.css';

export type GridProps = {
  letters: string[];
  size: number;
  path?: number[];
  /** Dim every cube not on the path (reveal glow). */
  dimOff?: boolean;
  /** Cubes pop in one by one (reveal glow), spaced by --pb-motion-fast; each link appears with the cube it reaches. */
  glow?: boolean;
  /** Show step numbers on the path. */
  numbers?: boolean;
  /** The last step broke the path (shake + danger outline). */
  broken?: boolean;
  /** PhoneStage shake: 'down' = blank cubes rattling in the tray, 'up' = turned over in a diagonal wave. */
  deal?: 'down' | 'up';
  /** With deal 'up': the time the whole wave may take (ms); the steps between diagonals shorten to fit it. */
  turnMs?: number;
  paused?: boolean;
  className?: string;
  cellProps?: (i: number) => Record<string, unknown>;
  overlay?: ReactNode;
  label: string;
};

/** Cell centre in a 0..100 viewBox. */
export function cellCentre(i: number, size: number): [number, number] {
  const step = 100 / size;
  return [(i % size) * step + step / 2, Math.floor(i / size) * step + step / 2];
}

export function LetterGrid(p: GridProps) {
  const path = p.path ?? [];
  return (
    <div
      className={`${s.grid} ${p.paused ? s.paused : ''} ${p.broken ? s.broken : ''} ${p.turnMs !== undefined ? s.fit : ''} ${p.className ?? ''}`}
      style={{ '--n': p.size, ...(p.turnMs !== undefined ? { '--turn-span': `${Math.round(p.turnMs)}ms` } : {}) } as CSSProperties}
      role="grid"
      aria-label={p.label}
    >
      {/* First in paint order: the opaque cubes cover it except in the gaps between them. */}
      {path.length > 1 ? (
        <svg className={`${s.line} ${p.glow ? s.drawn : ''}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {path.slice(1).map((c, k) => {
            const [x1, y1] = cellCentre(path[k] as number, p.size);
            const [x2, y2] = cellCentre(c, p.size);
            return <line key={`${path[k]}-${c}`} x1={x1} y1={y1} x2={x2} y2={y2} style={{ '--k': k + 1 } as CSSProperties} />;
          })}
        </svg>
      ) : null}
      {p.letters.map((l, i) => {
        const k = path.indexOf(i);
        const on = k >= 0;
        const cls = `${s.cube} ${on ? s.on : ''} ${p.dimOff && !on ? s.off : ''} ${p.glow && on ? s.glow : ''} ${l.length > 1 ? s.wide : ''} ${p.deal ? s[p.deal] : ''}`;
        const style = p.deal ? { '--d': Math.floor(i / p.size) + (i % p.size) } : p.glow && on ? { '--k': k } : undefined;
        return (
          <div
            key={i}
            role="gridcell"
            className={cls}
            style={style as CSSProperties | undefined}
            aria-selected={on}
            {...(p.cellProps ? p.cellProps(i) : {})}
          >
            {/* Face down, the letter is not in the page at all. */}
            <span className={s.face}>{p.deal === 'down' ? '' : l}</span>
            {on && p.numbers !== false ? <i className={s.n} aria-hidden>{k + 1}</i> : null}
          </div>
        );
      })}
      {p.overlay}
    </div>
  );
}
