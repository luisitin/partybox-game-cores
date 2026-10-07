// Film choreography as pure functions of t (seconds): every cube's pose, the
// lid and each cube's display label. No three.js here, so it is unit-tested
// (choreo.test.js: no cube passes through another, nothing snaps, every cube
// ends in its cell). Tray-local units: cube = 1, felt at y = 0.
//
// A formation shows up to two words at once, a top word from the back rows of
// the tray and a bottom word from the front rows. Every cube:
//   1. rises straight up out of its own cell to a height set by its row
//      (back rows higher, 1.1 apart, so cubes sharing a column never meet);
//   2. all together, glides to its slot: sideways first, height last, with
//      cells and slots paired left to right so no two paths cross;
//   3. at the slot, tips a quarter turn forward (a wave, left to right) so its
//      BOTTOM face, painted with the letter while hidden on the felt, faces the
//      camera; the plain front face rolls up to become the top (no stray glyph
//      ever sits over a letter) and the cube grows if the word is shown big.
// Going home is the same path backwards. The tip turns in the y-z plane only,
// so neighbours in a word never need room for it; rows are far enough apart.
export const PITCH = 1.12;
export const REST_Y = 0.5;
export const SIZE = 4;
export const N = SIZE * SIZE;
export const BACK = 3; // the display face: −y, hidden while the cube rests
const ROW_LIFT = 1.1;
const BASE_LIFT = 1.9;

export const cellXZ = (i) => [((i % SIZE) - (SIZE - 1) / 2) * PITCH, (Math.floor(i / SIZE) - (SIZE - 1) / 2) * PITCH];
export const restOf = (i) => { const [x, z] = cellXZ(i); return [x, REST_Y, z]; };
const liftOf = (i) => BASE_LIFT + (SIZE - 1 - Math.floor(i / SIZE)) * ROW_LIFT;

// ---------- math ----------
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
export const smoother = (x) => { const t = clamp01(x); return t * t * t * (t * (t * 6 - 15) + 10); };
const smooth = (x) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
const lerp = (a, b, k) => a + (b - a) * k;
/** The display tip: turn 0 resting, 1 with the bottom face square to +z. */
export const qTip = (turn) => [Math.sin((-Math.PI / 4) * turn), 0, 0, Math.cos((-Math.PI / 4) * turn)];
export function hash01(...n) {
  let h = 2166136261 >>> 0;
  for (const x of n) { h ^= Math.floor(x * 1000) >>> 0; h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

/** Slots for one line: centred, `pitch` apart, at height y (a shallow arch when `arch` > 0). */
export const rowSlots = (n, pitch, y, z, arch = 0) => Array.from({ length: n }, (_, k) => {
  const x = (k - (n - 1) / 2) * pitch;
  return [x, y - arch * x * x, z];
});

/** Pose on the way out (rise, glide, tip, grow) at absolute time t; turn also warms the plain faces. */
function outbound(sh, t) {
  const rise = smoother((t - sh.rise[0]) / (sh.rise[1] - sh.rise[0]));
  const glide = (t - sh.glide[0]) / (sh.glide[1] - sh.glide[0]);
  const turn = smoother((t - sh.turn[0]) / (sh.turn[1] - sh.turn[0]));
  const [cx, cy, cz] = sh.cell;
  const [sx, sy, sz] = sh.slot;
  const wx = smooth(clamp01(glide));
  const wy = smooth(clamp01((glide - 0.7) / 0.3)); // height changes only once the cubes have spread sideways
  const y = glide <= 0 ? lerp(cy, sh.lift, rise) : lerp(sh.lift, sy, wy);
  // Grow in the second half of the turn, once the cube is nearly square to its neighbours again.
  const grow = smoother((t - lerp(sh.turn[0], sh.turn[1], 0.45)) / ((sh.turn[1] - sh.turn[0]) * 0.55));
  return { p: [lerp(cx, sx, wx), y, lerp(cz, sz, wx)], q: qTip(turn), s: lerp(1, sh.scale, grow), turn };
}

// Home is the outbound path mirrored about the formation's last turn, so the way back is synchronous too.
const homeAt = (sh) => sh.leave + (sh.mirror - sh.rise[0]) * sh.backPace;

/** Where a show is at t: null when home, else outbound, held, or inbound (the outbound path mirrored in time). */
function showPose(sh, t) {
  if (t <= sh.rise[0] || t >= homeAt(sh)) return null;
  if (t < sh.turn[1]) return outbound(sh, t);
  if (t < sh.leave) {
    const k = (t - sh.turn[1]) / (sh.leave - sh.turn[1]);
    const waves = Math.max(1, Math.round((sh.leave - sh.turn[1]) / 1.4));
    const bob = sh.bob * Math.sin(Math.PI * k) * Math.sin(2 * Math.PI * k * waves);
    return { p: [sh.slot[0], sh.slot[1] + bob, sh.slot[2]], q: qTip(1), s: sh.scale, turn: 1 };
  }
  return outbound(sh, sh.mirror - (t - sh.leave) / sh.backPace);
}

/** A cube's state at t: pose, scale, turn (0 at rest, 1 tipped) and the show whose letter its bottom carries (null: blank). */
export function cubeState(cube, t) {
  for (const sh of cube.shows) {
    if (t < homeAt(sh)) {
      const p = showPose(sh, t);
      return p ? { ...p, label: sh } : { p: cube.rest, q: qTip(0), s: 1, turn: 0, label: sh };
    }
  }
  return { p: cube.rest, q: qTip(0), s: 1, turn: 0, label: null };
}

// The lid is hinged along the top of the back wall. Every part of it starts at
// or above the hinge and swings up and back, so it never meets a cube; open,
// it stands just past upright behind the tray, felt lining to the camera.
export const LID_OPEN = Math.PI / 2 + 0.17;

/** Lid angle about its hinge at t (0 closed): lid.open and lid.close are [from, to] seconds. */
export function lidAngle(t, lid) {
  const open = lid.open ? smoother((t - lid.open[0]) / (lid.open[1] - lid.open[0])) : 1;
  const close = lid.close ? smoother((t - lid.close[0]) / (lid.close[1] - lid.close[0])) : 0;
  return LID_OPEN * Math.min(open, 1 - close);
}

// ---------- formations ----------
/**
 * Places up to two lines. top: cubes from the back rows; bottom: from the front rows.
 * Each line: { letters, y, z, pitch, scale, gold, arch }; a null letter is a gap (a slot, no cube),
 * so one line can carry several short names. at: start time; hold: seconds fully shown;
 * pace stretches the outbound timing, backPace the way home.
 */
export function formation({ top, bottom, at, hold, pace = 1, backPace = 0.75, bob = 0.04 }) {
  const rowsTop = rowsFor(top);
  const rowsBottom = rowsFor(bottom);
  if (rowsTop + rowsBottom > SIZE) throw new Error('formation does not fit the tray');
  const placed = [];
  const place = (w, fromBack) => {
    const at = w.letters.flatMap((l, k) => (l ? [k] : [])); // slots that get a cube
    const n = at.length;
    const rows = rowsFor(w);
    const rowIds = Array.from({ length: rows }, (_, k) => (fromBack ? k : SIZE - 1 - k));
    // A part-used row gives its middle cells first, so the fan-out stays even.
    const picked = rowIds.flatMap((r) => [...Array(SIZE).keys()].map((c) => r * SIZE + c)
      .sort((a, b) => Math.abs(cellXZ(a)[0]) - Math.abs(cellXZ(b)[0]) || a - b)).slice(0, n);
    const cells = picked.sort((a, b) => cellXZ(a)[0] - cellXZ(b)[0] || a - b);
    const slots = rowSlots(w.letters.length, w.pitch, w.y, w.z, w.arch ?? 0);
    cells.forEach((cell, j) => placed.push({ cell, k: at[j], w, slot: slots[at[j]] }));
  };
  if (top) place(top, true);
  if (bottom) place(bottom, false);
  // The glide takes longer for longer reaches, so no cube ever whips across the frame.
  const reach = Math.max(1, ...placed.map(({ cell, slot }) => Math.hypot(slot[0] - cellXZ(cell)[0], slot[2] - cellXZ(cell)[1])));
  // Rises cascade: the highest (back-row) cubes leave first and every cube reaches its height together.
  const riseFor = (cell) => ((liftOf(cell) - REST_Y) / 7 + 0.12) * pace;
  const g0 = at + Math.max(...placed.map(({ cell }) => riseFor(cell)));
  // The climb (lift to slot height) happens in the glide's last 30 %, so a tall climb stretches it too.
  const climb = Math.max(...placed.map(({ cell, slot }) => Math.abs(slot[1] - liftOf(cell))));
  const glide = [g0 + 0.04 * pace, g0 + 0.04 * pace + Math.max(0.5, reach / 9, climb / 2) * pace];
  let turnEnd = glide[1];
  const shows = new Map();
  for (const { cell, k, w, slot } of placed) {
    const ts = glide[1] + 0.02 + k * 0.06 * pace;
    const te = ts + 0.34 * pace;
    turnEnd = Math.max(turnEnd, te);
    shows.set(cell, { cell: restOf(cell), slot, lift: liftOf(cell), letter: w.letters[k], gold: w.gold, scale: w.scale ?? 1, rise: [g0 - riseFor(cell), g0], glide, turn: [ts, te], bob, backPace });
  }
  const leave = turnEnd + hold;
  for (const sh of shows.values()) Object.assign(sh, { leave, mirror: turnEnd });
  return { shows, home: leave + (turnEnd - at) * backPace, shown: turnEnd, leave };
}

function rowsFor(w) { return Math.ceil((w?.letters.filter(Boolean).length ?? 0) / SIZE); }

function cubesFrom(formations) {
  const cubes = Array.from({ length: N }, (_, i) => ({ rest: restOf(i), shows: [] }));
  for (const f of formations) for (const [cell, sh] of f.shows) cubes[cell].shows.push(sh);
  return cubes;
}

// ---------- the two films ----------
const NAME_MAX = 12; // faces a name may take: three tray rows, leaving one for a short partner line
const LINE_SLOTS = 9; // short names share a line while it fits this many slots (gaps included)

/** One user-perceived character each (an emoji with its skin tone or flag stays whole). */
const SEG = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
const graphemes = (s) => (SEG ? [...SEG.segment(s)].map((g) => g.segment) : [...s]);
/** Text → cube faces: one per letter or digit in any script (Ñ, Qu as one; other accents dropped) or emoji. */
const faces = (s) => {
  const up = String(s ?? '').toUpperCase().normalize('NFD').replace(/N\u0303/g, 'Ñ').replace(/[\u0300-\u036f]/g, '').normalize('NFC');
  const gs = graphemes(up).filter((g) => /[\p{L}\p{N}\p{Extended_Pictographic}\p{Regional_Indicator}]/u.test(g));
  return gs.flatMap((g, k) => (g === 'U' && gs[k - 1] === 'Q' ? [] : [g === 'Q' && gs[k + 1] === 'U' ? 'Qu' : g]));
};

/**
 * Name → cube faces, never cut mid-name: the whole name (a gap between its
 * words) when it fits `max` faces, else its first word, else that word's first
 * faces and an ellipsis cube.
 */
export function nameFaces(n, max = NAME_MAX) {
  const words = String(n ?? '').split(/\s+/).map(faces).filter((w) => w.length);
  if (!words.length) return ['?'];
  const whole = words.flatMap((w, k) => (k ? [null, ...w] : w));
  if (whole.length <= max) return whole;
  return words[0].length <= max ? words[0] : [...words[0].slice(0, max - 1), '…'];
}
export const wordFaces = (w) => faces(w).slice(0, N);

/** The name as written when its cubes cannot show all of it (cut short, or no face to carry), else null. */
export function nameCaption(n, letters) {
  const text = String(n ?? '').trim().replace(/\s+/g, ' ');
  return text && (letters.includes('?') || letters.length < nameFaces(text, Infinity).length) ? text : null;
}

/**
 * Names (up to 8) → formations of one or two lines. A name too long for two
 * tray rows takes the back three and the first name short enough for one row
 * goes under it; the rest share lines, a gap apart, while a line fits
 * LINE_SLOTS (at most 8 cubes), and lines pair up two to a formation. A
 * two-word name or a captioned one (see nameCaption) keeps its line to itself.
 * A crowd that would need more than three formations, or more than two
 * three-row names, shows names of at most eight faces instead, so the opening
 * stays short (the caption carries the rest).
 */
export function nameForms(names, max = NAME_MAX) {
  const all = names.slice(0, 8).map((n) => { const letters = nameFaces(n, max); return { letters, names: 1, caption: nameCaption(n, letters) }; });
  const cubes = (l) => l.letters.filter(Boolean).length;
  const left = [...all];
  const forms = [];
  const longs = all.filter((l) => cubes(l) > 2 * SIZE);
  for (const long of longs) {
    left.splice(left.indexOf(long), 1);
    const k = left.findIndex((l) => cubes(l) <= SIZE);
    forms.push([long, ...(k < 0 ? [] : left.splice(k, 1))]);
  }
  const lines = [];
  const solo = (x) => x.names === 1 && (x.letters.includes(null) || Boolean(x.caption));
  for (const l of left) {
    const last = lines[lines.length - 1];
    if (last && !solo(last) && !solo(l) && last.letters.length + 1 + l.letters.length <= LINE_SLOTS) {
      last.letters.push(null, ...l.letters);
      last.names += 1;
    } else lines.push({ letters: [...l.letters], names: 1, caption: l.caption });
  }
  for (let k = 0; k < lines.length; k += 2) forms.push(lines.slice(k, k + 2));
  if ((forms.length > 3 || longs.length > 2) && max > 2 * SIZE) return nameForms(names, 2 * SIZE);
  return forms;
}

const NAME_ROWS = { top: 4.75, bottom: 3.3, z: 0.4 };
export const CAPTION_H = 1.0; // a caption's sprite height (tray units): its letters about as tall as a cube's
// A caption's centre: over a top line (half a cube, a gap, half the text); under a bottom line a wider gap and
// on its front faces' plane, since the camera looks down and a cube's near bottom edge reaches lower on screen.
const captionAt = (up) => (up ? [0, NAME_ROWS.top + 0.5 + 0.12 + CAPTION_H * 0.22, NAME_ROWS.z] : [0, NAME_ROWS.bottom - 0.5 - 0.3 - CAPTION_H * 0.22, NAME_ROWS.z + 0.5]);

/** A caption's opacity at t: in as its line's letters tip, out as they tip back. */
export const captionAlpha = (c, t) => smoother((t - c.fade[0]) / 0.4) * (1 - smoother((t - c.fade[1]) / 0.35));

/**
 * Opening: lid off, then every player's name (two lines at a time, see
 * nameForms; a captioned line has its name as written above or below it),
 * then SHAKE / UP; everything settles home and the camera takes over.
 */
export function openingPlan(names) {
  const pairs = nameForms(names);
  // A full room holds a little less and moves only as much brisker as it must to end by OPENING_MAX.
  let plan = null;
  for (let pace = 1; !plan || (plan.duration > OPENING_MAX && pace > 0.6 - 1e-9); pace -= 0.05) plan = openingAt(pairs, Math.max(0.6, pace));
  return plan;
}
const OPENING_MAX = 22;

function openingAt(pairs, pace) {
  const lid = { open: [1.5, 2.9] };
  const forms = [];
  let at = 3.0;
  const word = (line, row) => line && { letters: line.letters, y: NAME_ROWS[row], z: NAME_ROWS.z, pitch: line.letters.length > 8 ? 1.3 : 1.5, gold: true };
  for (const [top, bottom] of pairs) {
    // A little longer to read when more names are up, and a caption to read too (room allowing).
    const captioned = [top, bottom].filter((l) => l?.caption);
    const names = top.names + (bottom?.names ?? 0);
    const hold = pairs.length > 3 ? 0.35 + 0.2 * names : 0.45 + 0.2 * names + 0.15 * captioned.length;
    const f = formation({ top: word(top, 'top'), bottom: word(bottom, 'bottom'), at, hold, pace, backPace: Math.max(0.6, 0.5 / pace) });
    f.captions = captioned.map((l) => ({ text: l.caption, at: captionAt(l === top), fade: [f.shown - 0.4, f.leave - 0.05] }));
    forms.push(f);
    at = f.home + 0.05;
  }
  const shake = formation({ top: word({ letters: ['S', 'H', 'A', 'K', 'E'] }, 'top'), bottom: word({ letters: ['U', 'P'] }, 'bottom'), at, hold: pairs.length > 3 ? 0.95 : 1.2, backPace: 0.65 });
  shake.captions = [];
  forms.push(shake);
  return { cubes: cubesFrom(forms), lid, shakeAt: at, home: shake.home, duration: shake.home + 1.9, forms, lines: pairs.flat(), pace };
}

/**
 * Outro: the winner's longest word (all 16 faces at most) in big gold cubes
 * in a shallow arch, the runner-up's best word below in white when both fit
 * the tray, a hold, then home and the lid closes. top.kind says what the big
 * word is: 'winner', 'missed' (nobody found it) or 'none' (SHAKE UP, no word
 * was played at all).
 */
export function outroPlan(final) {
  let top = final?.longest ? { ...final.longest, kind: 'winner' } : final?.missed ? { word: final.missed.word, playerId: null, kind: 'missed' } : null;
  let W = wordFaces(top?.word);
  if (!W.length) { top = { word: 'SHAKE UP', playerId: null, kind: 'none' }; W = ['S', 'H', 'A', 'K', 'E', null, 'U', 'P']; }
  const r = final?.runnerUp ? wordFaces(final.runnerUp.word) : [];
  const R = rowsFor({ letters: W }) + rowsFor({ letters: r }) <= SIZE ? r : [];
  // 13 to 16 faces (the whole tray) close up a little so the arch stays a sane width.
  const big = W.length > 12;
  const wPitch = big ? 1.6 : 1.8;
  const half = ((W.length - 1) * wPitch) / 2;
  const arch = half > 0 ? 0.7 / Math.max(16, half * half) : 0;
  const f = formation({
    top: { letters: W, y: 5.1, z: 0.2, pitch: wPitch, scale: big ? 1.25 : 1.45, gold: true, arch },
    bottom: R.length ? { letters: R, y: 3.0, z: 0.9, pitch: 1.5, gold: false } : null,
    at: 0.6, hold: 4.0, pace: 1.6, backPace: 0.6, bob: 0.05,
  });
  const lid = { close: [f.home + 0.05, f.home + 1.25] };
  return { cubes: cubesFrom([f]), W, R, top, lid, back: f.home, shown: f.shown, leave: f.leave, duration: lid.close[1] + 0.8 };
}
