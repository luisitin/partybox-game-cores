// The TV roll is choreography, not physics, so its promises are checked here:
// no cube ever passes through another cube, the felt, a wall or a divider;
// nothing snaps between frames, not even when a Skip plays the rest out fast;
// something is always in the air until the last landing, and no two hops
// march in step; every cube is thrown, turning, into its own cell and ends exactly
// at rest with faces[0] up; the camera opens in three-quarter view, keeps the
// tumbling tray centred and ends straight overhead, also after a Skip, never
// faster than its planned rise; the roll fills the phase exactly.
import { describe, expect, it } from 'vitest';
import { cameraPose, cellXZ, cubePose, DIVIDER_H, DIVIDER_W, IDENTITY, PITCH, planRoll, settled, skipCamera, skipClock, SPIN_FLOOR,
  trayInner, trayPose, type CamPose, type Quat, type V3 } from '../client/tv/roll';
import { SHAKE_MS } from '../server/types';

const TIMING = { fast: 150, base: 300, slow: 600 };
const STEP = 4; // ms, faster than any display refresh
const FRAME = 1000 / 60;

type Box = { c: V3; axes: V3[]; h: V3 };

function axesOf(q: Quat): V3[] {
  const [x, y, z, w] = q; // the cube's own x, y and z axes in the world
  return [[1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)], [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)],
    [2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)]];
}
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Penetration depth of two oriented boxes (0 when apart), by the separating axis test. */
function penetration(a: Box, b: Box): number {
  const d: V3 = [b.c[0] - a.c[0], b.c[1] - a.c[1], b.c[2] - a.c[2]];
  const axes: V3[] = [...a.axes, ...b.axes];
  for (const u of a.axes) for (const v of b.axes) axes.push(cross(u, v));
  let min = Infinity;
  for (const L of axes) {
    const n = Math.hypot(...L);
    if (n < 1e-6) continue;
    const l: V3 = [L[0] / n, L[1] / n, L[2] / n];
    const r = (x: Box) => x.axes.reduce((s, ax, i) => s + Math.abs(dot(ax, l)) * x.h[i]!, 0);
    const o = r(a) + r(b) - Math.abs(dot(d, l));
    if (o <= 0) return 0;
    min = Math.min(min, o);
  }
  return min;
}

const cubeBox = (p: V3, q: Quat, s: number): Box => ({ c: p, axes: axesOf(q), h: [s / 2, s / 2, s / 2] });
const AXIS: V3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

function trayParts(size: number): Box[] {
  const [inner, parts] = [trayInner(size), [] as Box[]];
  for (let k = 1; k < size; k++) {
    const b = -inner / 2 + (PITCH - 1) / 2 + k * PITCH; // boundary between cells k-1 and k
    parts.push({ c: [b, DIVIDER_H / 2, 0], axes: AXIS, h: [DIVIDER_W / 2, DIVIDER_H / 2, inner / 2] }, { c: [0, DIVIDER_H / 2, b], axes: AXIS, h: [inner / 2, DIVIDER_H / 2, DIVIDER_W / 2] });
  }
  for (const sgn of [-1, 1]) parts.push({ c: [sgn * (inner / 2 + 0.5), 0.5, 0], axes: AXIS, h: [0.5, 0.5, inner] }, { c: [0, 0.5, sgn * (inner / 2 + 0.5)], axes: AXIS, h: [inner, 0.5, 0.5] });
  return parts;
}

const angleBetween = (a: Quat, b: Quat) => 2 * Math.acos(Math.min(1, Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3])));

/** Where a world point lands on a square canvas: x and y run −1..1 edge to edge. */
function project(c: CamPose, p: V3): [number, number] {
  const [pitch, yaw] = c.rot;
  let [x, y, z] = [p[0] - c.pos[0], p[1] - c.pos[1], p[2] - c.pos[2]];
  [x, z] = [Math.cos(yaw) * x - Math.sin(yaw) * z, Math.sin(yaw) * x + Math.cos(yaw) * z];
  [y, z] = [Math.cos(pitch) * y + Math.sin(pitch) * z, -Math.sin(pitch) * y + Math.cos(pitch) * z];
  const t = Math.tan((c.fov / 2) * (Math.PI / 180)) * -z;
  return [x / t, y / t];
}
/** The tray's outer corners, base to rim. */
const trayCorners = (size: number, o = trayInner(size) / 2 + 0.3): V3[] => [-1, 1].flatMap((sx) => [-1, 1].flatMap((sz) => [-0.17, 0.5].map((y): V3 => [sx * o, y, sz * o])));

describe.each([4, 5])('roll on a %i-wide tray', (size) => {
  const seeds = Array.from({ length: 24 }, (_, i) => i * 7919 + 13);
  const plans = seeds.map((seed) => planRoll(size, seed, TIMING, SHAKE_MS));
  const [parts, n] = [trayParts(size), size * size];

  it('fills the shake phase: overhead and readable a slow beat early, the ripple ending with the phase', () => {
    for (const plan of plans) {
      expect(plan.end).toBeCloseTo(SHAKE_MS, 6);
      expect(plan.camTo).toBeLessThanOrEqual(SHAKE_MS - TIMING.slow);
      for (const c of plan.cubes) {
        expect(c.done).toBeLessThanOrEqual(plan.camTo);
        expect(c.popAt).toBeGreaterThanOrEqual(Math.max(c.done, plan.camTo - TIMING.fast / 2) - 1e-9); // as the camera eases in
      }
      expect(Math.max(...plan.cubes.map((c) => c.popAt)) + plan.popMs).toBeCloseTo(SHAKE_MS, 6);
    }
  });

  it('never passes a cube through a cube, the felt, a wall or a divider', () => {
    let worst = 0;
    for (const plan of plans) {
      for (let t = 0; t <= plan.end + STEP; t += STEP) {
        const boxes = plan.cubes.map((_, i) => { const c = cubePose(plan, i, t); return cubeBox(c.p, c.q, c.s); });
        for (let i = 0; i < boxes.length; i++) {
          const a = boxes[i]!;
          worst = Math.max(worst, a.axes.reduce((s, ax) => s + Math.abs(ax[1]) * a.h[0], 0) - a.c[1]); // below the felt
          for (const part of parts) worst = Math.max(worst, penetration(a, part));
          for (const b of boxes.slice(i + 1)) if (Math.hypot(a.c[0] - b.c[0], a.c[2] - b.c[2]) < 2.2) worst = Math.max(worst, penetration(a, b));
        }
      }
    }
    // Cubes have rounded edges (radius 0.14 of a 1.0 cube), so a hair of box overlap is invisible.
    expect(worst).toBeLessThan(0.02);
  });

  it('never snaps: cubes, tray and camera move smoothly frame to frame', () => {
    for (const plan of plans.slice(0, 8)) {
      for (let i = 0; i < n; i++) {
        let prev = cubePose(plan, i, -STEP);
        for (let t = 0; t <= plan.end + STEP * 2; t += STEP) {
          const cur = cubePose(plan, i, t);
          expect(Math.hypot(cur.p[0] - prev.p[0], cur.p[1] - prev.p[1], cur.p[2] - prev.p[2])).toBeLessThan(0.09);
          expect(angleBetween(cur.q, prev.q)).toBeLessThan(0.16);
          expect(Math.abs(cur.s - prev.s)).toBeLessThan(0.01);
          prev = cur;
        }
      }
      // The camera swings down, drifts and rises: on screen no tray corner moves more than 1.5 % of the canvas per step.
      const corners = trayCorners(size);
      let [cam, tray] = [cameraPose(plan, -STEP), trayPose(plan, -STEP)];
      for (let t = 0; t <= plan.end + STEP; t += STEP) {
        const c = cameraPose(plan, t);
        for (const k of corners) {
          const [a, b] = [project(cam, k), project(c, k)];
          expect(Math.hypot(a[0] - b[0], a[1] - b[1]) / 2).toBeLessThan(0.0075);
        }
        expect(Math.abs(c.fov - cam.fov)).toBeLessThan(0.25); // degrees; the dolly keeps the tray's size, as checked above
        const tr = trayPose(plan, t);
        expect(Math.hypot(tr.p[0] - tray.p[0], tr.p[1] - tray.p[1], tr.p[2] - tray.p[2])).toBeLessThan(0.03);
        expect(angleBetween(tr.q, tray.q)).toBeLessThan(0.02);
        [cam, tray] = [c, tr];
      }
    }
  });

  it('keeps something in the air from the first drop to the last landing: the shake never stops mid-way', () => {
    for (const plan of plans) {
      for (let t = 0; t < plan.landed - FRAME; t += STEP) {
        const heights = plan.cubes.map((_, i) => cubePose(plan, i, t).p[1] - 0.5);
        expect(heights.some((h) => h > 0.02), `t=${t}`).toBe(true);
        // Not just a cube skimming the felt: between the drop and the last landings one is clearly up (was: all 16 square in their cells).
        if (t > TIMING.slow / 2 && t < plan.landed - TIMING.slow / 2) expect(heights.some((h) => h > 0.25), `t=${t}`).toBe(true);
      }
    }
  });

  it('never stands still: from the drop to the last ripple something moves on screen every frame', () => {
    for (const plan of plans.slice(0, 8)) {
      for (let t = (TIMING.fast * 2) / 3; t < plan.end - plan.popMs / 4; t += STEP) { // from just after the drops leave their apex
        const [ca, cb] = [cameraPose(plan, t), cameraPose(plan, t + FRAME)];
        let most = 0;
        for (let i = 0; i < n; i++) {
          const [a, b] = [cubePose(plan, i, t), cubePose(plan, i, t + FRAME)];
          for (const dx of [-0.5, 0.5]) {
            const [pa, pb] = [project(ca, [a.p[0] + dx * a.s, a.p[1] + a.s / 2, a.p[2]]), project(cb, [b.p[0] + dx * b.s, b.p[1] + b.s / 2, b.p[2]])];
            most = Math.max(most, Math.hypot(pa[0] - pb[0], pa[1] - pb[1]) / 2);
          }
        }
        expect(most, `t=${t}`).toBeGreaterThan(0.001); // of the canvas per frame: no held beat, not even as the camera arrives
      }
    }
  });

  it('never marches in step: launches spread out and apexes, spins and turns differ within every round', () => {
    for (const plan of plans) {
      for (let k = 0; k < 2; k++) {
        for (let g = 0; g < 2; g++) {
          const hops = plan.cubes.filter((_, i) => (Math.floor(i / size) + (i % size)) % 2 === g).map((c) => c.hops.filter((h) => h.turns > 0 && !h.u0)[k]!);
          const [spread, lifts] = [(xs: number[]) => Math.max(...xs) - Math.min(...xs), hops.map((h) => h.lift)];
          expect(spread(hops.map((h) => h.at))).toBeGreaterThan(TIMING.fast / 4); // was ±12.5 ms
          expect(spread(hops.map((h) => h.at + h.ms))).toBeGreaterThan(TIMING.fast / 3);
          expect(Math.max(...lifts) / Math.min(...lifts)).toBeGreaterThan(1.15);
          expect(new Set(hops.map((h) => h.tumble)).size).toBeGreaterThan(1);
        }
        expect(new Set(plan.cubes.map((c) => c.hops.filter((h) => h.turns > 0 && !h.u0)[k]!.turns)).size).toBe(2);
      }
      expect(plan.cubes.some((c) => c.hops.some((h) => h.drift > 0))).toBe(true);
    }
  });

  it('only turns or leans cubes while they are high enough to clear everything', () => {
    for (const plan of plans.slice(0, 4)) {
      for (let i = 0; i < n; i++) {
        for (let t = 0; t <= plan.end; t += STEP) {
          const c = cubePose(plan, i, t);
          const tilt = Math.acos(Math.min(1, Math.abs(axesOf(c.q)[1]![1]))); // how far the cube's own up axis leans
          const tilted = Math.min(tilt, Math.abs(Math.PI / 2 - tilt)) > 0.05;
          if (tilted) expect(c.p[1] - 0.5).toBeGreaterThanOrEqual(SPIN_FLOOR - 1e-9);
        }
      }
    }
  });

  it('throws every cube into its own cell, high and already turning, and ends exactly at rest, faces[0] up', () => {
    for (const plan of plans) {
      for (let i = 0; i < n; i++) {
        const a = cubePose(plan, i, 0);
        const [x, z] = cellXZ(i, size);
        expect(Math.hypot(a.p[0] - x, a.p[2] - z)).toBeLessThan(1e-9);
        expect(a.p[1]).toBeGreaterThan(1.7); // from at least 1.3 above its rest, clear of walls and neighbours
        expect(Math.min(...axesOf(a.q).map((ax) => Math.max(...ax.map(Math.abs))))).toBeLessThan(0.95); // never a flat, readable board
        const [b, c] = [cubePose(plan, i, TIMING.fast), cubePose(plan, i, TIMING.fast * 1.5)]; // the last let go within a fast beat
        expect(b.p[1] - c.p[1] + angleBetween(b.q, c.q)).toBeGreaterThan(0.1);
        const end = cubePose(plan, i, settled(plan));
        expect([end.q, end.s, end.p]).toEqual([IDENTITY, 1, [x, 0.5, z]]);
      }
      expect(trayPose(plan, settled(plan))).toEqual({ p: [0, 0, 0], q: IDENTITY, s: 1 });
    }
  });

  it('opens in three-quarter view, settling in from higher and further out, and ends straight down, framing the whole tray', () => {
    const plan = plans[5]!;
    const [a, b] = [cameraPose(plan, 0), cameraPose(plan, plan.enter)];
    expect(-a.rot[0]).toBeLessThan(1.2); // never the flat overhead board before the roll
    expect(-a.rot[0]).toBeGreaterThan(-b.rot[0] + 0.1);
    expect(Math.hypot(...a.pos)).toBeGreaterThan(Math.hypot(...b.pos));
    const c = cameraPose(plan, settled(plan));
    expect(Math.hypot(c.rot[0] + Math.PI / 2, c.rot[1], c.pos[0])).toBeLessThan(1e-9);
    expect(Math.tan((c.fov / 2) * (Math.PI / 180)) * (c.pos[1] - 1)).toBeGreaterThan(trayInner(size) / 2 + 0.3);
  });

  it('keeps every thrown cube inside the canvas while the camera settles in', () => {
    for (const plan of plans.slice(0, 8)) {
      for (let t = 0; t <= plan.enter; t += 10) {
        const c = cameraPose(plan, t);
        for (const q of plan.cubes.map((_, i) => cubePose(plan, i, t))) {
          const ax = axesOf(q.q);
          for (const sx of [-0.5, 0.5]) for (const sy of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) {
            const [x, y] = project(c, [0, 1, 2].map((d) => q.p[d]! + (ax[0]![d]! * sx + ax[1]![d]! * sy + ax[2]![d]! * sz) * q.s) as V3);
            expect(Math.max(Math.abs(x), Math.abs(y)), `t=${t}`).toBeLessThan(0.99); // never cut by the canvas edge
          }
        }
      }
    }
  });

  it('keeps the tumbling tray centred, with every cube in frame and a clear margin on all sides', () => {
    for (const plan of plans.slice(0, 6)) {
      for (let t = plan.enter; t <= plan.camFrom; t += 20) {
        const c = cameraPose(plan, t);
        const tray = trayCorners(size).map((p) => project(c, p)), xs = tray.map((p) => p[0]);
        expect(Math.abs(Math.max(...xs) + Math.min(...xs)) / 2).toBeLessThan(0.02);
        const cubes = plan.cubes.flatMap((_, i) => { const q = cubePose(plan, i, t); return [-0.6, 0.6].flatMap((dx) => [-0.6, 0.6].map((dz) => project(c, [q.p[0] + dx, q.p[1] + 0.6, q.p[2] + dz]))); });
        for (const [x, y] of [...tray, ...cubes]) expect(Math.max(Math.abs(x), Math.abs(y))).toBeLessThan(0.91); // 4.5 % clear at each side
      }
    }
  });

  it('plays the landings out fast after a Skip, from where it was, at most 2.5× and without a jump; the ripple at 1×', () => {
    for (const plan of plans.slice(0, 6)) {
      for (const from of [0, 400, 1200, 2000, 2800, 3600]) {
        const rest = Math.max(0, plan.camTo - from), span = Math.min(rest, Math.max(TIMING.slow, rest / 1.8));
        expect(skipClock(plan, from, 0, TIMING.slow)).toBe(from);
        expect(skipClock(plan, from, FRAME, TIMING.slow) - from).toBeLessThan(FRAME * 1.05); // leaves at 1×
        let prev = from;
        for (let dt = FRAME; dt <= span + 1000; dt += FRAME) {
          const t = skipClock(plan, from, dt, TIMING.slow);
          expect(t - prev).toBeGreaterThan(0);
          expect(t - prev).toBeLessThanOrEqual((dt - FRAME >= span ? FRAME : FRAME * 2.5) + 1e-9);
          prev = t;
        }
        expect(skipClock(plan, from, span, TIMING.slow)).toBeGreaterThanOrEqual(Math.max(from, plan.camTo) - 1e-9);
      }
    }
  });

  it('after a Skip rises to overhead as the last cube lands, never faster than the planned rise', () => {
    const corners = trayCorners(size);
    for (const plan of plans.slice(0, 4)) {
      for (const from of [0, 300, 1200, 2400, 3000, 3500]) {
        const top = Math.max(TIMING.slow, (plan.camTo - from) / 1.8); // overhead as the warped landings end, or `slow` on
        expect(skipCamera(plan, from, 0, TIMING.slow)).toEqual(cameraPose(plan, from)); // no jump
        let cam = cameraPose(plan, from);
        for (let dt = STEP; dt <= top + STEP; dt += STEP) {
          const c = skipCamera(plan, from, dt, TIMING.slow);
          for (const k of corners) {
            const [a, b] = [project(cam, k), project(c, k)];
            expect(Math.hypot(a[0] - b[0], a[1] - b[1]) / 2, `from ${from} dt ${dt}`).toBeLessThan(0.0075);
          }
          const t = skipClock(plan, from, dt, TIMING.slow); // and every cube top stays in frame as it rises
          const tops = plan.cubes.flatMap((_, i) => { const q = cubePose(plan, i, t); return [-0.6, 0.6].map((d) => project(c, [q.p[0] + d, q.p[1] + 0.6, q.p[2] + d])); });
          for (const [x, y] of tops) expect(Math.max(Math.abs(x), Math.abs(y))).toBeLessThan(0.99);
          cam = c;
        }
        expect(cam.rot[0]).toBeCloseTo(-Math.PI / 2, 9);
        const t = skipClock(plan, from, top - TIMING.fast / 2, TIMING.slow); // overhead only once every cube is down
        for (const c of plan.cubes) expect(c.done).toBeLessThanOrEqual(t + 1e-9);
      }
    }
  });

  it('scales the whole roll down when long motion tokens would overrun the phase', () => {
    const plan = planRoll(size, 1, { fast: 400, base: 800, slow: 1600 }, SHAKE_MS);
    expect(plan.end).toBeLessThanOrEqual(SHAKE_MS + 1e-9);
    expect(Math.max(...plan.cubes.map((c) => c.done))).toBeLessThanOrEqual(plan.camTo);
  });
});
