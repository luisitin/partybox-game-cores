// The films' promises, checked: no cube passes through another cube, the felt,
// a wall or a divider; nothing snaps between frames; a cube's display face is
// repainted only while it rests face-hidden in its cell; all end at home.
import { describe, expect, it } from 'vitest';
import { captionAlpha, cubeState, lidAngle, N, nameCaption, nameFaces, nameForms, openingPlan, outroPlan, PITCH, REST_Y, wordFaces } from './choreo.js';

const DT = 0.004;
const axesOf = ([x, y, z, w]) => [
  [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w)],
  [2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w)],
  [2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y)],
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
function penetration(a, b) {
  const d = [b.c[0] - a.c[0], b.c[1] - a.c[1], b.c[2] - a.c[2]];
  const axes = [...a.axes, ...b.axes];
  for (const u of a.axes) for (const v of b.axes) axes.push(cross(u, v));
  let min = Infinity;
  for (const L of axes) {
    const n = Math.hypot(...L);
    if (n < 1e-6) continue;
    const l = L.map((v) => v / n);
    const ra = a.axes.reduce((s, ax, i) => s + Math.abs(dot(ax, l)) * a.h[i], 0);
    const rb = b.axes.reduce((s, ax, i) => s + Math.abs(dot(ax, l)) * b.h[i], 0);
    const o = ra + rb - Math.abs(dot(d, l));
    if (o <= 0) return 0;
    min = Math.min(min, o);
  }
  return min;
}
const AX = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const inner = 4 * PITCH + 0.12;
const parts = [];
for (let k = 1; k < 4; k++) {
  const b = -inner / 2 + 0.06 + k * PITCH;
  parts.push({ c: [b, 0.1, 0], axes: AX, h: [0.03, 0.1, inner / 2] }, { c: [0, 0.1, b], axes: AX, h: [inner / 2, 0.1, 0.03] });
}
for (const s of [-1, 1]) parts.push({ c: [s * (inner / 2 + 0.5), 0.24, 0], axes: AX, h: [0.5, 0.24, inner] }, { c: [0, 0.24, s * (inner / 2 + 0.5)], axes: AX, h: [inner, 0.24, 0.5] });

function check(plan, end) {
  let worst = 0;
  let worstAt = '';
  const prev = [];
  for (let t = 0; t <= end; t += DT) {
    const st = plan.cubes.map((c) => cubeState(c, t));
    const boxes = st.map((s) => ({ c: s.p, axes: axesOf(s.q), h: [s.s / 2, s.s / 2, s.s / 2] }));
    for (let i = 0; i < N; i++) {
      const a = boxes[i];
      const note = (v, what) => { if (v > worst) { worst = v; worstAt = `${what} t=${t.toFixed(3)}`; } };
      note(-(a.c[1] - a.axes.reduce((s, ax) => s + Math.abs(ax[1]) * a.h[0], 0)), `floor cube ${i}`);
      if (a.c[1] < 1.6) for (const p of parts) note(penetration(a, p), `tray cube ${i}`);
      for (let j = i + 1; j < N; j++) note(penetration(a, boxes[j]), `cubes ${i},${j}`);
      const p = prev[i];
      if (p) {
        expect(Math.hypot(st[i].p[0] - p.p[0], st[i].p[1] - p.p[1], st[i].p[2] - p.p[2])).toBeLessThan(0.1);
        expect(2 * Math.acos(Math.min(1, Math.abs(st[i].q[0] * p.q[0] + st[i].q[1] * p.q[1] + st[i].q[2] * p.q[2] + st[i].q[3] * p.q[3])))).toBeLessThan(0.2);
        expect(Math.abs(st[i].s - p.s)).toBeLessThan(0.02);
        expect(Math.abs(st[i].turn - p.turn)).toBeLessThan(0.1); // the plain faces warm to gold as smoothly as the cube tips
        if (st[i].label !== p.label) {
          // Repainting the display face only happens at home, bottom face down on the felt (no turn at all).
          expect(st[i].p[1]).toBe(REST_Y);
          expect(Math.abs(st[i].q[0]) + Math.abs(st[i].q[1]) + Math.abs(st[i].q[2])).toBeLessThan(1e-9);
          expect(st[i].turn).toBe(0);
        }
      }
    }
    st.forEach((s, i) => { prev[i] = s; });
  }
  for (const c of plan.cubes) {
    const s = cubeState(c, end);
    expect(s.p).toEqual(c.rest);
    expect(s.s).toBe(1);
  }
  return { worst, worstAt };
}

const FIVES = ['Alice', 'Bobby', 'Carol', 'Diana', 'Ethan', 'Fiona', 'Grace', 'Henry'];
const LONGS = ['Alexandria', 'Christopher', 'Bartholomew', 'Maximiliano', 'Konstantin', 'Gwendolyn', 'Evangeline', 'Montgomery'];

describe('opening film choreography', () => {
  for (const names of [
    ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya'], ['Bartholomew', 'Quique', 'Ñoño', 'X'], ['Solo'], ['Maximiliano', 'Guadalupe', 'Al'],
    ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hal'], ['Maximiliano Fernández', 'Bartholomew the Great', 'Mary Jo', 'Jo', 'Constantinopla'],
    FIVES, LONGS, ['Анастасия', 'Δημήτρης', '李华', '😀😀', 'Bartholomew the Great', 'Ana', 'Maximiliano Fernández', '!!!'],
  ]) {
    it(`never collides or snaps (${names.join(', ')})`, () => {
      const plan = openingPlan(names);
      const { worst, worstAt } = check(plan, plan.duration);
      expect(worst, worstAt).toBeLessThan(0.02);
      expect(plan.lid.open[1]).toBeLessThanOrEqual(Math.min(...plan.cubes.flatMap((c) => c.shows.map((s) => s.rise[0]))));
      // A caption is fully up while its line's letters face the camera and gone before they tip back, never popping.
      for (const f of plan.forms) for (const c of f.captions) {
        expect(captionAlpha(c, f.shown)).toBeCloseTo(1, 6);
        expect(captionAlpha(c, f.leave + 0.3)).toBeCloseTo(0, 6);
        for (let t = 0; t < plan.duration; t += DT) expect(Math.abs(captionAlpha(c, t + DT) - captionAlpha(c, t))).toBeLessThan(0.03);
      }
    });
  }
});

describe('names and words on cubes', () => {
  const spelled = (f) => f.map((x) => x ?? ' ').join('');
  it('shows every player (up to 8) and never cuts a name mid-word', () => {
    const names = ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya', 'Maximiliano Fernández', 'Bartholomew'];
    const shown = openingPlan(names).lines.map((l) => spelled(l.letters)).join(' ');
    for (const n of ['ANA', 'BEN', 'CLEO', 'DEV', 'ELI', 'PRIYA', 'MAXIMILIANO', 'BARTHOLOMEW']) expect(shown.split(' ')).toContain(n);
    expect(spelled(nameFaces('Mary Jo'))).toBe('MARY JO');
    expect(spelled(nameFaces('Ñoño Quique'))).toBe('ÑOÑO QuIQuE');
    expect(spelled(nameFaces('Supercalifragilistic'))).toBe('SUPERCALIFR…');
    // Any script and emoji go on cubes as written; a name with nothing a cube can carry is '?' and captioned.
    expect(spelled(nameFaces('Анастасия'))).toBe('АНАСТАСИЯ');
    expect(spelled(nameFaces('李华 👍🏽'))).toBe('李华 👍🏽');
    expect(spelled(nameFaces('😀'))).toBe('😀');
    expect(spelled(nameFaces('Łukasz Øre'))).toBe('ŁUKASZ ØRE');
    expect(spelled(nameFaces('!!!'))).toBe('?');
    expect(nameCaption('!!!', nameFaces('!!!'))).toBe('!!!');
    expect(nameCaption('Zoë', nameFaces('Zoë'))).toBeNull(); // a dropped accent is not a cut
    expect(nameCaption('Mary Elizabeth', nameFaces('Mary Elizabeth'))).toBe('Mary Elizabeth');
  });
  it('captions every name its cubes cut short, alone on its line, and never merges two unknowns', () => {
    const forms = nameForms(['!!!', '???', 'Zoë', "O'Bri"]);
    expect(forms.flat().map((l) => [spelled(l.letters), l.caption])).toEqual([['?', '!!!'], ['?', '???'], ['ZOE OBRI', null]]);
    const lines = openingPlan(LONGS).lines;
    expect(lines.map((l) => l.caption)).toEqual(LONGS);
    for (const l of lines) expect(l.names).toBe(1);
  });
  it('keeps a full room\'s opening short however long the names', () => {
    for (const names of [FIVES, LONGS]) expect(openingPlan(names).duration).toBeLessThanOrEqual(23);
    // A seeded sweep of mixed rooms (no Math.random: the same rooms every run).
    const pool = ['Jo', 'Ana', 'Alice', 'Ximena', 'Leonardo', 'Guadalupe', 'Alexandria', 'Bartholomew', 'Supercalifragilistic', 'Mary Jo', 'Mary Elizabeth', 'Maximiliano Fernández', '李华', '😀😀', '!!!', 'Анастасия'];
    let seed = 7;
    const next = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };
    for (let k = 0; k < 400; k++) {
      const names = Array.from({ length: 1 + next(8) }, () => pool[next(pool.length)]);
      expect(openingPlan(names).duration, names.join(', ')).toBeLessThanOrEqual(23);
    }
    // Small rooms keep the unhurried pace.
    expect(openingPlan(['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya']).pace).toBe(1);
  });
  it('short names share a line, a gap apart, and a line never needs more than two tray rows', () => {
    const forms = nameForms(['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya']);
    expect(forms.map((f) => f.map((l) => spelled(l.letters)))).toEqual([['ANA BEN', 'CLEO DEV'], ['ELI PRIYA']]);
    for (const l of forms.flat()) expect(l.letters.filter(Boolean).length).toBeLessThanOrEqual(8);
    // A long name takes three rows and a one-row name goes under it.
    const long = nameForms(['Maximiliano Fernández', 'Bartholomew the Great', 'Cleo', 'Jo']);
    expect(long.map((f) => f.map((l) => spelled(l.letters)))).toEqual([['MAXIMILIANO', 'CLEO'], ['BARTHOLOMEW', 'JO']]);
  });
  it('spells a 16-letter word whole', () => {
    expect(wordFaces('INCOMPREHENSIBLE')).toHaveLength(16);
    expect(outroPlan({ longest: { word: 'INCOMPREHENSIBLE', playerId: 'a' }, runnerUp: { word: 'TAN', playerId: 'b' } }).W.join('')).toBe('INCOMPREHENSIBLE');
  });
  it('labels the big word truthfully', () => {
    expect(outroPlan({ longest: { word: 'ANT', playerId: 'a' } }).top.kind).toBe('winner');
    expect(outroPlan({ longest: null, missed: { word: 'TEN' } }).top.kind).toBe('missed');
    expect(outroPlan({ longest: null, missed: null }).top.kind).toBe('none');
  });
});

describe('outro film choreography', () => {
  const cases = [
    { longest: { word: 'STRANDED', playerId: 'cleo' }, runnerUp: { word: 'TRAINED', playerId: 'ana' } },
    { longest: { word: 'QUARTERBACKS', playerId: 'cleo' }, runnerUp: { word: 'TAN', playerId: 'ana' } },
    { longest: { word: 'ANT', playerId: 'cleo' }, runnerUp: null },
    { longest: null, runnerUp: null, missed: { word: 'RESTRAINED' } },
    { longest: { word: 'INCOMPREHENSIBLE', playerId: 'cleo' }, runnerUp: { word: 'QUIET', playerId: 'ana' } },
    { longest: { word: 'UNDERSTANDING', playerId: 'cleo' }, runnerUp: null },
    { longest: null, runnerUp: null, missed: null },
  ];
  for (const final of cases) {
    it(`never collides or snaps (${final.longest?.word ?? 'nobody'})`, () => {
      const plan = outroPlan(final);
      const { worst, worstAt } = check(plan, plan.duration);
      expect(worst, worstAt).toBeLessThan(0.02);
      expect(plan.lid.close[0]).toBeGreaterThanOrEqual(plan.back);
    });
  }
});

describe('the lid', () => {
  // Its outline about the hinge (y up from the wall top at 0.48, z forward from the back edge at -2.6).
  const outer = 5.2, rimH = 0.56, top = 0.7;
  // Slab and front and back rims; the side rims run outside the cubes (|x| > 2.5), so only the table matters for them.
  const outline = [];
  for (let z = 0; z <= outer + 1e-9; z += 0.05) outline.push([top, z], [rimH, z]);
  for (let y = 0; y <= top + 1e-9; y += 0.05) outline.push([y, 0], [y, 0.1], [y, outer - 0.1], [y, outer]);
  const sideRims = Array.from({ length: 105 }, (_, k) => [0, k * 0.05]);
  const world = (a, [y, z]) => [0.48 + y * Math.cos(a) + z * Math.sin(a), -outer / 2 - y * Math.sin(a) + z * Math.cos(a)];
  it('swings clear of the resting cubes and ends behind the tray', () => {
    const lid = { open: [0, 1] };
    let prev = 0;
    for (let t = 0; t <= 1; t += 0.002) {
      const a = lidAngle(t, lid);
      for (const pt of outline) {
        const [y, z] = world(a, pt);
        if (Math.abs(z) <= 2.18 + 0.03) expect(y, `cube at t=${t}`).toBeGreaterThan(1.03);
        expect(y).toBeGreaterThan(-0.18);
      }
      for (const pt of sideRims) expect(world(a, pt)[0]).toBeGreaterThan(-0.18);
      expect(Math.abs(a - prev) * outer).toBeLessThan(0.06);
      prev = a;
    }
    // Open, nothing of it is in front of the back wall, where the back row rises.
    for (const pt of outline) expect(world(lidAngle(1, lid), pt)[1]).toBeLessThanOrEqual(-outer / 2 + 1e-9);
    expect(lidAngle(0.5, { close: [1, 2] })).toBe(lidAngle(1, lid)); // the outro starts with it open
  });
});
