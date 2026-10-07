// Interactive grid: drag through cubes (lift to submit) or tap them one by one
// (then Submit). Back up by dragging onto the previous cube or tapping the last.
import { useRef, useState, type PointerEvent } from 'react';
import { buzz, L, useSound } from '@partybox/game-sdk/ui';
import { LetterGrid } from '../LetterGrid';
import { dragStep, hitCell, tapStep } from '../trace';

type Props = {
  letters: string[];
  size: number;
  path: number[];
  setPath: (p: number[]) => void;
  /** Called on lift after a drag across two or more cubes. */
  onDragEnd: (p: number[]) => void;
  /** A finger is on the grid (true from touch-down to lift): the hunt keeps its bar still meanwhile. */
  onHold?: (on: boolean) => void;
  disabled: boolean;
  broken: boolean;
};

export function TraceGrid(p: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; moved: boolean; path: number[] } | null>(null);
  const [, force] = useState(0);
  const play = useSound();

  const cellAt = (e: PointerEvent): number => {
    const el = ref.current;
    if (!el) return -1;
    const r = el.getBoundingClientRect();
    return hitCell(e.clientX - r.left, e.clientY - r.top, r.width, p.size);
  };
  const feel = (next: number[], prev: number[]) => {
    if (next.length !== prev.length) {
      buzz(8);
      play('tick');
    }
  };

  const down = (e: PointerEvent) => {
    if (p.disabled) return;
    const c = cellAt(e);
    if (c < 0) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const next = tapStep(p.path, c, p.size);
    drag.current = { id: e.pointerId, moved: false, path: next };
    p.onHold?.(true);
    feel(next, p.path);
    p.setPath(next);
  };
  const move = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const c = cellAt(e);
    const next = dragStep(d.path, c, p.size);
    if (next.length !== d.path.length || next.some((x, i) => x !== d.path[i])) {
      feel(next, d.path);
      d.moved = true;
      d.path = next;
      p.setPath(next);
      force((n) => n + 1);
    }
  };
  const up = (e: PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    p.onHold?.(false);
    if (d.moved && d.path.length >= 2) p.onDragEnd(d.path);
  };

  return (
    <div ref={ref} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: 'none' }}>
      <LetterGrid
        letters={p.letters}
        size={p.size}
        path={p.path}
        broken={p.broken}
        paused={p.disabled}
        label={L('Letter grid. Drag or tap touching letters to spell a word.')}
      />
    </div>
  );
}
