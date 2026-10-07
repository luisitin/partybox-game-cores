// The shake, as pure choreography: every cube's pose and the camera are
// functions of time since the shake began, so the TV can join mid-roll, pause
// and resume without a jump. Rendering only: the letters were decided by the
// server before the first frame, and every cube ends exactly in its own cell
// with faces[0] up. Collision-free by construction and by test (roll.test.ts).
export type V3 = [number, number, number];
export type Quat = [number, number, number, number]; // x, y, z, w
export type CubePose = { p: V3; q: Quat; s: number };
/** Camera pose; `rot` is an Euler in YXZ order (yaw, then pitch). */
export type CamPose = { pos: V3; rot: V3; fov: number };
/** Motion tokens in ms (--pb-motion-*). */
export type Timing = { fast: number; base: number; slow: number };

export const CUBE = 1;
export const GAP = 0.12;
export const PITCH = CUBE + GAP;
const REST_Y = CUBE / 2;
/** Tray build: wall and divider heights above the felt, divider thickness. */
export const [WALL_H, DIVIDER_H, DIVIDER_W] = [0.48, 0.2, 0.06];

/** Entrance: the cubes are thrown in, spinning, in two layers: one checkerboard group drops from DROP (cube-centre
 *  lift), the other a beat later from SEP higher, so edge neighbours never spin side by side. */
const [DROP, SEP] = [[1.3, 1.7], 1.5] as const;
/** Tumbling hops: apex (cube-centre lift) and quarter turns [min, max]; the last cubes to land settle with a small bounce. */
const LIFT = [1.5, 1.2] as const;
const TURNS = [[2, 3], [1, 2]] as const;
const BOUNCE = 0.15;
/** Every cube's lift varies by ±VARY; flight time follows √lift, and the highest possible hop takes exactly `slow`. */
const VARY = 0.2;
const TOP = LIFT[0] * (1 + VARY);
/** A cube only turns or leans while this high: it then clears resting neighbours, walls and dividers. */
export const SPIN_FLOOR = 0.62;
/** A cube only drifts sideways, over a resting neighbour, while this high: even tilted it clears that neighbour's top. */
const DRIFT_FLOOR = 1.4;
/** Per-cube maxima: sideways drift (cube sizes), lean on the second axis and yaw wobble (radians). */
const [DRIFT, TUMBLE, WOBBLE] = [0.24, 0.05, 0.035];
/** The first tumbles sweep across the tray over this much of `slow` (after the landings, which sweep too): one side is high while the other lands. */
const SWEEP = 0.3;
/** Per hop every turning cube of a group shares one axis family (x or z), so same-group diagonal neighbours lean apart, never together. */
const AXES: V3[][] = [[[1, 0, 0], [-1, 0, 0]], [[0, 0, 1], [0, 0, -1]]];
/** Camera: low three-quarter view while the cubes fly (arriving from `k0` of the way up), straight down (long lens) once they land; `pan` (per radian of yaw) keeps the yawed tray centred. */
const CAM = { k0: 0.35, back: 0.35, up: 0.6, el0: 0.8, yaw0: -0.14, fov0: 30, fov1: 12, look0: 0.8, look1: 0.5, envelope: 1.295, margin: 1.04, pan: -0.65 } as const;

export function cellXZ(i: number, size: number): [number, number] {
  const off = ((size - 1) * PITCH) / 2;
  return [(i % size) * PITCH - off, Math.floor(i / size) * PITCH - off];
}

/** Inner span of the tray (wall to wall). */
export const trayInner = (size: number): number => size * PITCH + GAP;

/** Deterministic 0..1 hash (rendering only; the server already chose every letter). */
export function hash01(seed: number, a: number, b = 0): number {
  let h = (seed ^ Math.imul(a + 1, 0x9e3779b1) ^ Math.imul(b + 7, 0x85ebca6b)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

// ---------- quaternions ----------
export const qMul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
];
export const qAxis = (ax: V3, angle: number): Quat => [ax[0] * Math.sin(angle / 2), ax[1] * Math.sin(angle / 2), ax[2] * Math.sin(angle / 2), Math.cos(angle / 2)];
const qInv = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]];
const qSnap = (q: Quat): Quat => q.map((v) => (Math.abs(v) < 1e-12 ? 0 : v)) as Quat;
export const IDENTITY: Quat = [0, 0, 0, 1];
const UP: V3 = [0, 1, 0];
/** The way a cube turning about `a` rolls along the felt. */
const sideOf = (a: V3): V3 => [a[1] * UP[2] - a[2] * UP[1], a[2] * UP[0] - a[0] * UP[2], a[0] * UP[1] - a[1] * UP[0]];

// ---------- easing ----------
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smoother = (x: number) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
const bump = (x: number) => (x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x) ** 2);
/** A jolt: rises fast from 0, peaks at x = ¼, decays back to exactly 0 at x = 1. */
const jolt = (x: number) => (x <= 0 || x >= 1 ? 0 : 9.48 * x * (1 - x) ** 3);

/** One parabolic flight; `u0` > 0 starts it part-way (the entrance drop starts at its apex). */
type Hop = { at: number; ms: number; u0: number; lift: number; turns: number; axis: V3; side: V3;
  wobble: number; tumble: number; drift: number; spin: [number, number]; sway: [number, number] };
type CubePlan = { rest: V3; start: Quat; hops: Hop[]; done: number; popAt: number };
type Kick = { at: number; v: V3; tilt: V3 };
export type RollPlan = { size: number; cubes: CubePlan[]; enter: number; landed: number; camFrom: number; camTo: number;
  end: number; popMs: number; kicks: Kick[]; kickMs: number };

/** Edge neighbours (the other checkerboard group). */
function edges(i: number, size: number): number[] {
  const [r, c] = [Math.floor(i / size), i % size];
  return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([y, x]) => y! >= 0 && y! < size && x! >= 0 && x! < size).map(([y, x]) => y! * size + x!);
}

/**
 * The hops for a size×size tray. The cubes drop into their cells, then the
 * tray is a checkerboard of two groups that take turns, like popcorn: a cube
 * may only turn while every edge neighbour rests, and only launches once they
 * have stopped turning. Each cube waits only for its own neighbours, so the
 * hops ripple across the tray instead of marching in step. Hop times follow
 * flight physics (t ∝ √height); `rest` holds about half the cubes up to that
 * much (ms) longer before each later hop (holding all would stall the tray).
 */
function choreograph(size: number, seed: number, timing: Timing, rest: number) {
  const { fast, slow } = timing;
  const n = size * size;
  const flight = (lift: number) => slow * Math.sqrt(lift / TOP);
  const band = (lift: number, floor: number): [number, number] => { const r = Math.sqrt(Math.max(0, 1 - floor / lift)); return [(1 - r) / 2, (1 + r) / 2]; };
  const vary = (i: number, salt: number) => 1 + VARY * (2 * hash01(seed, i, salt) - 1);
  const sign = (i: number, salt: number) => (hash01(seed, i, salt) < 0.5 ? -1 : 1);
  const hops: Hop[][] = Array.from({ length: n }, () => []);
  const hop = (i: number, at: number, lift: number, o: Partial<Hop> = {}): Hop => {
    const h: Hop = { at, ms: flight(lift), u0: 0, lift, turns: 0, axis: [1, 0, 0], side: [0, 0, 1], wobble: 0, tumble: 0, drift: 0, spin: band(lift, SPIN_FLOOR), sway: band(lift, DRIFT_FLOOR), ...o };
    hops[i]!.push(h);
    return h;
  };
  const median = (xs: number[]) => [...xs].sort((a, b) => a - b)[xs.length >> 1] ?? 0;
  // Each cube's latest flight: when it is back on the felt, and when it stopped turning.
  const last = Array.from({ length: n }, () => ({ land: 0, tilt: -Infinity }));
  const kicks: Kick[] = [];
  // The tray is struck from one side: group 0 lets go, lands and tumbles in a sweep away from it (late ones bounce until then).
  const [dir, reach] = [hash01(seed, 5) * Math.PI * 2, (size - 1) * PITCH * Math.SQRT2 + 1e-9];
  const sweep = (i: number) => { const [x, z] = cellXZ(i, size); return 0.5 + (x * Math.cos(dir) + z * Math.sin(dir)) / reach; };
  // Entrance: every cube falls into its own cell from its apex, already turning (the start pose absorbs it). Group 1 is
  // released first and lowest, so group 0 stays at least SEP above every edge neighbour while either one turns.
  for (let i = 0; i < n; i++) {
    const g = (Math.floor(i / size) + (i % size)) % 2;
    const axis = AXES[Math.floor(hash01(seed, 900 + g) * 2)]![hash01(seed, i, 5) < 0.5 ? 0 : 1]!;
    const lift = g ? DROP[0] + (DROP[1] - DROP[0]) * hash01(seed, i, 4) : DROP[1] + SEP + 0.3 * sweep(i) + 0.1 * hash01(seed, i, 4);
    const d = hop(i, 0, lift, { u0: 0.5, turns: g || hash01(seed, i, 6) < 0.5 ? 3 : 5, axis, side: sideOf(axis), wobble: WOBBLE * sign(i, 2), tumble: TUMBLE * sign(i, 7) });
    d.at = (fast / 3) * (g ? hash01(seed, i, 3) : 1 + 1.5 * sweep(i) + 0.5 * hash01(seed, i, 3)) - d.ms / 2; // group 1 lets go first
    last[i] = { land: d.at + d.ms, tilt: d.at + d.spin[1] * d.ms };
  }
  let landed = 0;
  for (let k = 0; k < LIFT.length; k++) {
    for (let g = 0; g < 2; g++) {
      const family = AXES[Math.floor(hash01(seed, 1000 + k * 2 + g) * 2)]!;
      let first = Infinity;
      for (let i = 0; i < n; i++) {
        if ((Math.floor(i / size) + (i % size)) % 2 !== g) continue;
        const m = vary(i, 10 + k), lift = LIFT[k]! * m, ms = flight(lift), spin = band(lift, SPIN_FLOOR);
        const [x, z] = cellXZ(i, size);
        let at = last[i]!.land;
        for (const j of edges(i, size)) at = Math.max(at, last[j]!.tilt, last[j]!.land - spin[0] * ms);
        const ready = at;
        at += k + g === 0 ? SWEEP * slow * sweep(i) : hash01(seed, i, 20 + k) * fast * 0.6 + rest * Math.max(0, 2 * hash01(seed, i, 25 + k) - 1);
        // Group 0 tumbles out of its drop: straight off the felt, or after a bounce (straight up: it turns only in its tumble).
        const wait = Math.min(at - last[i]!.land, slow * 0.7);
        if (k + g === 0) { if (wait > fast) hop(i, at - wait, TOP * (wait / slow) ** 2); else at = ready; }
        // A cube rolls (and drifts) toward its side; on the outermost row it always rolls inward, away from the wall.
        const out = sideOf(family[0]!)[0] * x + sideOf(family[0]!)[2] * z;
        const edge = Math.abs(out) > ((size - 2) * PITCH) / 2 + 1e-6;
        const axis = family[edge ? (out > 0 ? 1 : 0) : Math.floor(hash01(seed, i, 30 + k) * 2)]!;
        const [side, [lo, hi], sway] = [sideOf(axis), TURNS[k]!, band(lift, DRIFT_FLOOR)];
        hop(i, at, lift, {
          turns: m > 0.97 && hash01(seed, i, 40 + k) < 0.7 ? hi : lo, axis, side, // only a higher hop has time for the extra turn
          wobble: WOBBLE * sign(i, 50 + k), tumble: TUMBLE * sign(i, 60 + k) * (0.5 + hash01(seed, i, 70 + k) / 2),
          drift: DRIFT * (0.4 + 0.6 * hash01(seed, i, 80 + k)) * Math.min(1, (sway[1] - sway[0]) / 0.4), // a short high stretch, a short drift
        });
        let land = at + ms;
        landed = Math.max(landed, land);
        if (k === LIFT.length - 1 && g === 1) { const b = hop(i, land, BOUNCE * vary(i, 90)); land = b.at + b.ms; } // the last to land settle
        last[i] = { land, tilt: at + spin[1] * ms };
        first = Math.min(first, at);
      }
      // The tray jolts along the way this round rolls, a beat before the first cube leaves.
      const [s, roll] = [(k + g) % 2 ? -1 : 1, family[0]![0] ? [0, 0, 1] : [1, 0, 0]];
      kicks.push({ at: first - fast / 4, v: [roll[0]! * 0.06 * s, -0.025, roll[2]! * 0.06 * s], tilt: [roll[2]! * 0.03 * s, 0, -roll[0]! * 0.03 * s] });
    }
  }
  const done = Math.max(...last.map((l) => l.land));
  kicks.push({ at: median(hops.map(([d]) => d!.at + d!.ms)) - fast / 4, v: [0, -0.04, 0], tilt: [0, 0, 0] });
  kicks.push({ at: median(last.map((l) => l.land)) - fast / 2, v: [0, -0.02, 0], tilt: [0, 0, 0] });
  return { hops, kicks, landed, done };
}

/**
 * Plans the roll to fill `windowMs` exactly: time to spare goes into the rests
 * between hops, so the tray never idles at the end; when the tokens run long
 * the whole roll is scaled down to fit. The closing ripple ends with the window.
 */
export function planRoll(size: number, seed: number, timing: Timing, windowMs: number): RollPlan {
  const { fast, slow } = timing;
  const [steps, popMs] = [(size - 1) * 2, fast * 2];
  const fits = (rest: number) => choreograph(size, seed, timing, rest).done + fast + (steps * fast) / 3 + popMs <= windowMs;
  let [lo, hi] = [0, fast * 4];
  if (windowMs > 0 && fits(0)) for (let b = 0; b < 8; b++) [lo, hi] = fits((lo + hi) / 2) ? [(lo + hi) / 2, hi] : [lo, (lo + hi) / 2];
  const { hops, kicks, landed, done } = choreograph(size, seed, timing, lo);
  // The camera rises over the last landings; as it eases in a diagonal ripple says "the grid is live". The
  // ripple ends with the window, slowing (up to one fast step per diagonal) to fill any time left over.
  const [camTo, camFrom, lead] = [done + fast, done + fast - slow, done + fast / 2];
  const popStep = Math.min(fast, Math.max(fast / 3, (windowMs - lead - popMs) / steps));
  let end = lead + steps * popStep + popMs;
  const pop = Math.max(end, windowMs) - steps * popStep - popMs;
  end = Math.max(end, windowMs);
  const k = end > windowMs && windowMs > 0 ? windowMs / end : 1;
  const cubes: CubePlan[] = hops.map((hs, i) => {
    let turned: Quat = IDENTITY;
    for (const h of hs) turned = qMul(qAxis(h.axis, (h.turns * Math.PI) / 2), turned);
    for (const h of hs) { h.at *= k; h.ms *= k; }
    const [x, z] = cellXZ(i, size);
    const tail = hs[hs.length - 1]!;
    return { rest: [x, REST_Y, z], start: qSnap(qInv(turned)), hops: hs, done: tail.at + tail.ms, popAt: (pop + (Math.floor(i / size) + (i % size)) * popStep) * k };
  });
  for (const kick of kicks) kick.at *= k;
  return { size, cubes, enter: (fast * 2 + slow) * k, landed: landed * k, camFrom: camFrom * k, camTo: camTo * k, end: end * k, popMs: popMs * k, kicks, kickMs: fast * k };
}

/** Pose of cube i at t ms after the shake began (tray-local, rest centre y = ½). */
export function cubePose(plan: RollPlan, i: number, t: number): CubePose {
  const c = plan.cubes[i];
  if (!c) return { p: [0, REST_Y, 0], q: IDENTITY, s: 1 };
  // The closing ripple: each cube swells and lifts a little off the felt (clear of the dividers), so the wave reads from overhead.
  const b = bump((t - c.popAt) / plan.popMs);
  const s = 1 + 0.1 * b;
  if (t >= c.done) return { p: b ? [c.rest[0], REST_Y * s + 0.25 * b, c.rest[2]] : c.rest, q: IDENTITY, s };
  let q = c.start;
  for (const h of c.hops) {
    const u = Math.max(h.u0, (t - h.at) / h.ms);
    if (u >= 1) { q = qMul(qAxis(h.axis, (h.turns * Math.PI) / 2), q); continue; }
    if (u <= h.u0 && h.u0 === 0) return { p: c.rest, q, s: 1 };
    let turn = q;
    if (h.turns || h.tumble) {
      const k = (u - h.spin[0]) / (h.spin[1] - h.spin[0]);
      turn = qMul(qAxis(h.side, h.tumble * bump(k)), qMul(qAxis(h.axis, (smoother(k) * h.turns * Math.PI) / 2), q));
    }
    const yaw = qAxis(UP, h.wobble * bump((u - h.u0) / (1 - h.u0)));
    const d = h.drift ? h.drift * bump((u - h.sway[0]) / (h.sway[1] - h.sway[0])) : 0;
    return { p: [c.rest[0] + h.side[0] * d, REST_Y + 4 * h.lift * u * (1 - u), c.rest[2] + h.side[2] * d], q: qMul(yaw, turn), s: 1 };
  }
  return { p: c.rest, q: IDENTITY, s };
}

/** The tray's own jolts: a thump as the cubes land, a shove before each round of hops; still once they settle. */
export function trayPose(plan: RollPlan, t: number): CubePose {
  const p: V3 = [0, 0, 0];
  let q = IDENTITY;
  for (const k of plan.kicks) {
    const a = jolt((t - k.at) / plan.kickMs);
    if (!a) continue;
    p[0] += k.v[0] * a; p[1] += k.v[1] * a; p[2] += k.v[2] * a;
    if (k.tilt[0]) q = qMul(qAxis([1, 0, 0], k.tilt[0] * a), q);
    if (k.tilt[2]) q = qMul(qAxis([0, 0, 1], k.tilt[2] * a), q);
  }
  return { p, q, s: 1 };
}

/**
 * Camera at t (ms). It arrives in three-quarter view, pushing in from higher and further out as the cubes fall in
 * (the board is never seen flat before it rolls), drifts in while they tumble, then rises to straight overhead as
 * they land, the field of view narrowing so the tray keeps its size on screen. The hunt starts on a flat, readable
 * grid. `lift` (0..1) blends the whole path toward overhead (the rise after a Skip).
 */
export function cameraPose(plan: RollPlan, t: number, aspect = 1, lift = 0): CamPose {
  const rise = plan.camTo > plan.camFrom ? smoother((t - plan.camFrom) / (plan.camTo - plan.camFrom)) : t >= plan.camTo ? 1 : 0;
  const e = plan.enter > 0 ? 1 - smoother(t / plan.enter) : 0;
  const k = Math.max(rise, CAM.k0 * e) + (1 - Math.max(rise, CAM.k0 * e)) * lift;
  const drift = smoother((t - plan.enter) / Math.max(1, plan.camFrom - plan.enter));
  const el = CAM.el0 + 0.06 * drift + (Math.PI / 2 - CAM.el0 - 0.06 * drift) * k;
  const yaw = CAM.yaw0 * (1 - drift * 0.5) * (1 - k);
  const fov = CAM.fov0 + (CAM.fov1 - CAM.fov0) * k;
  const half = trayInner(plan.size) / 2 + 0.3;
  const radius = (half + (CAM.envelope - 1) * half * (1 - k)) * CAM.margin * (1 + CAM.back * e);
  const lookY = CAM.look0 + (CAM.look1 - CAM.look0) * k + CAM.up * e;
  const tan = Math.tan(((fov / 2) * Math.PI) / 180) * Math.min(1, aspect);
  const d = radius / tan;
  const side = CAM.pan * yaw * radius;
  const pos: V3 = [d * Math.sin(yaw) * Math.cos(el) + side * Math.cos(yaw), lookY + d * Math.sin(el), d * Math.cos(yaw) * Math.cos(el) - side * Math.sin(yaw)];
  return { pos, rot: [-el, yaw, 0], fov };
}

/** How long (ms after a Skip at plan time `from`) the rest of the landings take on the warped clock. */
const skipSpan = (plan: RollPlan, from: number, slow: number): number => { const rest = Math.max(0, plan.camTo - from); return Math.min(rest, Math.max(slow, rest / 1.8)); };

/**
 * Plan time after the server ends the shake early (VIP Skip) at plan time `from`, `dt` ms later. The landings play
 * out on a warped clock: it leaves at 1× (no jump), peaks at 2.5× and eases back to 1× where the camera would be
 * overhead, by `slow` or by 1/1.8 of the time left, whichever is longer. Faster would strobe (a cube would jump most
 * of its size per frame). The closing ripple then plays at 1×. Same path, so still collision-free.
 */
export function skipClock(plan: RollPlan, from: number, dt: number, slow: number): number {
  const span = skipSpan(plan, from, slow);
  const extra = Math.max(0, plan.camTo - from) - span;
  return from + dt + (extra > 0 ? extra * smoother(dt / span) : 0);
}

/** The camera after a Skip: its own path at 1×, blended up to overhead over `slow`, ending as the warped landings
 *  do (or `slow` after the Skip, if they end sooner). It never whips up faster than the planned rise. */
export function skipCamera(plan: RollPlan, from: number, dt: number, slow: number, aspect = 1): CamPose {
  const span = skipSpan(plan, from, slow);
  return cameraPose(plan, from + dt, aspect, slow > 0 ? smoother((dt - Math.max(0, span - slow)) / slow) : 1);
}

/** The settled pose, for phases after the shake (and for joining late). */
export const settled = (plan: RollPlan): number => plan.end + 1;
