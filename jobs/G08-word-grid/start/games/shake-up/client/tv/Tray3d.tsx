// The 3D tray: one persistent stage from shake to reveal (keepMounted). The
// shake is pure choreography (roll.ts) on the server clock: the cubes are
// thrown in, spinning, under a three-quarter camera that settles in as they
// land; they tumble in two groups that ripple across the tray, land square with
// the server's letters up, and the camera rises to a flat overhead view for the
// hunt. Physics never decides a letter. Falls back to the flat grid without
// WebGL or with motion off.
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Dice3d, Line3d, Motion3d, Pulse3d, Solid3d, Table3d, useMotionTokens } from '@partybox/game-sdk/ui/table3d';
import { cameraPose, CUBE, cellXZ, cubePose, DIVIDER_H, DIVIDER_W, PITCH, planRoll, settled, skipCamera, skipClock, trayInner, trayPose, WALL_H, type V3 } from './roll';

type Props = {
  letters: string[];
  cubes: string[][];
  size: number;
  round: number;
  throwSeed: number;
  /** Shake start on the server clock and the phase length; absent once the cubes have landed. */
  roll?: { at: number; ms: number };
  paused: boolean;
  glow: number[];
  fallback: ReactNode;
};

const WALL_T = 0.3;
/**
 * The traced word: arrows just above the lifted top faces (Pulse3d lifts 0.18), each stopping LINE_TRIM short of
 * both cube centres, so it bridges the gap and the face rims but never covers a letter; a dot marks the first cube.
 */
const [LINE_Y, LINE_R, LINE_TRIM] = [CUBE + 0.18 + 0.03, 0.08, 0.38];

export function Tray3d(p: Props) {
  const motion = useMotionTokens();
  // The roll this tray last showed. It outlives `roll`: when the server ends the shake early (Skip),
  // the rest of the roll plays out fast from the first frame after, instead of cutting to the end.
  const live = useRef<{ at: number; ms: number; from?: number } | null>(null);
  if (p.roll && p.roll.at !== live.current?.at) live.current = { ...p.roll };
  const roll = live.current;
  const plan = useMemo(() => planRoll(p.size, p.throwSeed, motion, roll?.ms ?? 0), [p.size, p.throwSeed, motion, roll?.ms]);
  // Side-face letters fade out as the camera passes halfway up: from overhead they would only show as dashes at
  // the cube edges, and fading them there means nothing changes at the hand-off to the hunt.
  const [bare, setBare] = useState<number | null>(null);
  const clock = (t: number): number => {
    if (!roll) return settled(plan);
    if (!p.roll) roll.from ??= t;
    const tt = roll.from === undefined ? t : Math.min(settled(plan), skipClock(plan, roll.from, t - roll.from, motion.slow));
    if (tt >= (plan.camFrom + plan.camTo) / 2 && bare !== roll.at) setBare(roll.at);
    return tt;
  };
  const at = roll ? roll.at : 0;
  // After a Skip the camera keeps its own clock: it rises over at least `slow`, as the warped landings end.
  const rig = { at, pose: (t: number, aspect: number) => {
    const tt = clock(t);
    return roll?.from === undefined ? cameraPose(plan, tt, aspect) : skipCamera(plan, roll.from, t - roll.from, motion.slow, aspect);
  } };
  const blank = !roll || bare === roll.at;
  const inner = trayInner(p.size);
  const outer = inner + WALL_T * 2;
  const h = WALL_H + WALL_T / 2 + 0.02; // the tray's base sits just under the felt
  const lit = new Set(p.glow);
  const dividers = Array.from({ length: p.size - 1 }, (_, k) => -inner / 2 + (PITCH - 1) / 2 + (k + 1) * PITCH);
  // The previous word's line shrinks away while the next one draws.
  const lines = useRef<{ key: string; pts: V3[] }[]>([]);
  const key = p.glow.join(',');
  if (lines.current[lines.current.length - 1]?.key !== key) {
    const pts: V3[] = p.glow.map((i) => { const [x, z] = cellXZ(i, p.size); return [x, LINE_Y, z]; });
    lines.current = [...lines.current.slice(-1), { key, pts }];
  }
  return (
    <Table3d rig={rig} paused={p.paused} fallback={p.fallback} label="Shake Up tray">
      <Motion3d at={at} pose={(t) => trayPose(plan, clock(t))}>
        <Solid3d shape="tray" size={[outer, h, outer]} wall={WALL_T} material="wood" position={[0, h / 2 - WALL_T / 2 - 0.02, 0]} />
        <Solid3d shape="box" size={[inner, 0.02, inner]} material="felt" position={[0, -0.01, 0]} />
        {dividers.map((d, k) => (
          <group key={k}>
            <Solid3d shape="box" size={[DIVIDER_W, DIVIDER_H, inner]} material="wood" position={[d, DIVIDER_H / 2, 0]} />
            <Solid3d shape="box" size={[inner, DIVIDER_H, DIVIDER_W]} material="wood" position={[0, DIVIDER_H / 2, d]} />
          </group>
        ))}
        {p.letters.map((_, i) => {
          const faces = p.cubes[i] ?? [p.letters[i] ?? '', '', '', '', '', ''];
          const k = p.glow.indexOf(i);
          return (
            <Motion3d key={`${p.round}-${i}`} at={at} pose={(t) => cubePose(plan, i, clock(t))}>
              <Pulse3d active={k >= 0} order={Math.max(0, k)}>
                {/* Each cube of the word turns gold as the line reaches it. */}
                <Dice3d faces={faces} bare={blank} up={0} highlight={k >= 0} dim={p.glow.length > 0 && !lit.has(i)} delay={Math.max(0, k) * motion.fast} />
              </Pulse3d>
            </Motion3d>
          );
        })}
        {lines.current.map((l) => (l.pts.length > 1 ? <Line3d key={l.key} points={l.pts} radius={LINE_R} trim={LINE_TRIM} playKey={l.key} stepMs={motion.fast} leaving={l.key !== key} /> : null))}
      </Motion3d>
    </Table3d>
  );
}
