// Film cameras as pure functions of t. A camera is an orbit (target, heading,
// elevation, distance, fov) eased between framings, so every move is a curve
// with no corners, and rotation is Euler YXZ, so looking straight down keeps
// its heading (no flip at the top). Framings fit their subject to the screen's
// aspect: a sideways phone and a TV both see every letter.
// Tray-local units (felt at y = 0); camera.test.js checks continuity.
import { clamp01, smoother } from './choreo.js';

const lerp = (a, b, k) => a + (b - a) * k;
const deg = Math.PI / 180;

export const mixOrbit = (a, b, k) => ({
  target: a.target.map((v, i) => lerp(v, b.target[i], k)),
  yaw: lerp(a.yaw, b.yaw, k), el: lerp(a.el, b.el, k), dist: lerp(a.dist, b.dist, k), fov: lerp(a.fov, b.fov, k),
});

/** Position and Euler YXZ rotation [x, y] for an orbit. */
export function orbitPose(o) {
  const c = Math.cos(o.el);
  return {
    pos: [o.target[0] + o.dist * Math.sin(o.yaw) * c, o.target[1] + o.dist * Math.sin(o.el), o.target[2] + o.dist * Math.cos(o.yaw) * c],
    rot: [-o.el, o.yaw],
    fov: o.fov,
  };
}

/** The orbit that sees `look` from `pos`, so a film can start or end on a pose the room gives. */
export function orbitFrom(pos, look, fov) {
  const d = [pos[0] - look[0], pos[1] - look[1], pos[2] - look[2]];
  const dist = Math.hypot(...d);
  return { target: [...look], yaw: Math.atan2(d[0], d[2]), el: Math.asin(d[1] / dist), dist, fov };
}

/**
 * Frames a set of points: aims at the middle of their box and backs off until
 * every point is inside the picture with `margin` to spare (a binary search,
 * since points only shrink on screen as the camera backs away).
 */
export function framing(points, { yaw, el, fov }, aspect, margin = 1.08) {
  const lo = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i])));
  const hi = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const target = lo.map((v, i) => (v + hi[i]) / 2);
  const back = [Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)];
  const right = [Math.cos(yaw), 0, -Math.sin(yaw)];
  const up = [back[1] * right[2] - back[2] * right[1], back[2] * right[0] - back[0] * right[2], back[0] * right[1] - back[1] * right[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const tan = Math.tan((fov * deg) / 2);
  const fits = (dist) => points.every((p) => {
    const d = [0, 1, 2].map((i) => p[i] - target[i] - dist * back[i]);
    const z = -dot(d, back);
    return z > 0 && Math.abs(dot(d, right)) * margin <= z * tan * aspect && Math.abs(dot(d, up)) * margin <= z * tan;
  });
  let [a, b] = [0.5, 500];
  for (let k = 0; k < 40; k++) { const m = (a + b) / 2; if (fits(m)) b = m; else a = m; }
  return { target, yaw, el, dist: b, fov };
}

/** The eight corners of a box around a centre c with half-sizes h. */
const corners = (c, h) => [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [c[0] + x * h[0], c[1] + y * h[1], c[2] + z * h[2]])));
const TRAY = corners([0, 0.5, 0], [2.6, 0.5, 2.6]);
const RIM = [-1, 1].flatMap((x) => [-1, 1].map((z) => [x * 2.6, 0.5, z * 2.6]));

const NEAR = { el: 0.24, fov: 34 };
/** A narrow screen (a phone held upright) widens the lens instead of backing far off into the room's haze. */
const lens = (fov, aspect) => Math.min(62, fov * Math.max(1, (1.3 / aspect) ** 0.6));

/** Eases through a list of orbits: k is held until from[k], then eased to k+1 by to[k]. */
function stepper(orbits, from, to) {
  return (t) => orbits.slice(1).reduce((o, next, k) => mixOrbit(o, next, smoother((t - from[k]) / (to[k] - from[k]))), orbits[0]);
}

/** What a show puts on screen: the cube at its slot (with its bob) and at the top of its rise. */
const showPoints = (s) => {
  const h = 0.5 * s.scale + 0.06;
  return [...corners(s.slot, [h, h, h]), ...corners([s.cell[0], s.lift, s.cell[2]], [0.5, 0.5, 0.5])];
};
const slotPoints = (s) => { const h = 0.5 * s.scale + 0.06; return corners(s.slot, [h, h, h]); };
/**
 * What a held shot must fit. On a wide screen: the whole tray and every cube's
 * path. Upright (aspect < 1) the words are what matter: their slots and the
 * tray's top rim only, from a little higher, so the tray tucks under the words
 * and the letters get the width (a cube may leave the frame briefly as it rises).
 */
const subject = (shows, aspect) => (aspect < 1 ? [...RIM, ...shows.flatMap(slotPoints)] : [...TRAY, ...shows.flatMap(showPoints)]);
const heroEl = (el, aspect) => (aspect < 1 ? el + 0.12 : el);
// Upright the widest line sets the letter size, so it gets the slimmest safe margin.
const heroMargin = (aspect) => (aspect < 1 ? 1.04 : 1.12);

/**
 * Opening: glide in from the room's lobby pose, hold on the words (re-framed
 * between formations to fit them, with a slow drift), rise to straight down
 * over the tray as the last cubes go home, then push into the felt. extra[i]:
 * more points formation i must fit (its captions).
 */
export function openingCamera(plan, aspect, lobby, extra = []) {
  const frames = plan.forms.map((f, i) => framing([...subject([...f.shows.values()], aspect), ...(extra[i] ?? [])], { yaw: 0, el: heroEl(NEAR.el, aspect), fov: lens(NEAR.fov, aspect) }, aspect, heroMargin(aspect)));
  const held = stepper(frames, plan.forms.slice(0, -1).map((f) => f.leave), plan.forms.slice(1).map((f) => f.shown));
  const first = Math.min(...[...plan.forms[0].shows.values()].map((s) => s.rise[0]));
  const last = plan.forms[plan.forms.length - 1];
  const start = orbitFrom(lobby.pos, lobby.look, 40);
  const glide = [0, first + 0.2];
  // The drift never stops: it runs the whole film and each move blends out of it.
  const near = (t) => ({ ...held(t), yaw: lerp(-0.12, 0.12, t / plan.duration) });
  const top = framing(TRAY, { yaw: 0, el: Math.PI / 2, fov: lens(26, aspect) }, aspect, 1.04);
  // The rise starts once the last word's cubes are on their way down, so they drop into view, not out of it.
  const rise = [lerp(last.leave, plan.home, 0.4), plan.home + 0.8];
  const dive = [plan.home + 0.35, plan.duration];
  return (t) => {
    let o = mixOrbit(start, near(t), smoother((t - glide[0]) / (glide[1] - glide[0])));
    o = mixOrbit(o, top, smoother((t - rise[0]) / (rise[1] - rise[0])));
    const d = clamp01((t - dive[0]) / (dive[1] - dive[0]));
    o.dist *= lerp(1, 0.5, d * d); // speeds up into the fade
    return orbitPose(o);
  };
}

/**
 * Outro: a low hero angle that fits both words and both names, a slow orbit
 * while the words hold, then a curved pull back to the lobby pose as the cubes
 * go home and the lid closes. names: [{ c: centre, h: half-size }] of the name labels.
 */
export function outroCamera(plan, aspect, lobby, names = []) {
  const points = [...subject(plan.cubes.flatMap((c) => c.shows), aspect), ...names.flatMap((n) => corners(n.c, n.h))];
  const hero = framing(points, { yaw: 0, el: heroEl(0.16, aspect), fov: lens(34, aspect) }, aspect, heroMargin(aspect));
  const end = orbitFrom(lobby.pos, lobby.look, 40);
  const pull = [plan.leave + 1, plan.duration];
  return (t) => orbitPose(mixOrbit({ ...hero, yaw: lerp(-0.18, 0.18, t / plan.duration) }, end, smoother((t - pull[0]) / (pull[1] - pull[0]))));
}
