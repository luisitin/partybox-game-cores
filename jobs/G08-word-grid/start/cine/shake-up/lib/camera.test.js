// The film cameras: no jumps between frames, starting and ending where promised.
import { describe, expect, it } from 'vitest';
import { openingCamera, outroCamera, orbitFrom, orbitPose } from './camera.js';
import { openingPlan, outroPlan } from './choreo.js';

const lobby = { pos: [0, 8, 24], look: [0, 0, -4] };
const DT = 0.004;

function sweep(cam, end) {
  let prev = null;
  for (let t = 0; t <= end + 1e-9; t += DT) {
    const c = cam(t);
    for (const v of [...c.pos, ...c.rot, c.fov]) expect(Number.isFinite(v)).toBe(true);
    if (prev) {
      // Step relative to the camera's distance from the tray: what the eye reads as speed.
      const step = Math.hypot(c.pos[0] - prev.pos[0], c.pos[1] - prev.pos[1], c.pos[2] - prev.pos[2]) / Math.hypot(...c.pos);
      expect(step, `t=${t}`).toBeLessThan(0.006);
      expect(Math.abs(c.rot[0] - prev.rot[0]) + Math.abs(c.rot[1] - prev.rot[1]), `t=${t}`).toBeLessThan(0.01);
      expect(Math.abs(c.fov - prev.fov)).toBeLessThan(0.08); // degrees per 4 ms: a gentle zoom
    }
    prev = c;
  }
}
const close = (a, b) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 4));

describe.each([16 / 9, 9 / 19.5])('film cameras at aspect %f', (aspect) => {
  it('opening glides in from the lobby pose and ends straight down over the tray', () => {
    const plan = openingPlan(['Ana', 'Bartholomew', 'Cleo', 'Dev']);
    const cam = openingCamera(plan, aspect, lobby);
    sweep(cam, plan.duration);
    close(cam(0).pos, orbitPose(orbitFrom(lobby.pos, lobby.look, 40)).pos);
    const end = cam(plan.duration);
    expect(end.rot[0]).toBeCloseTo(-Math.PI / 2, 6);
    expect(end.rot[1]).toBeCloseTo(0, 6);
    close([end.pos[0], end.pos[2]], [0, 0]);
  });
  it('opening keeps every name of a long, crowded room in a smooth camera', () => {
    const plan = openingPlan(['Maximiliano Fernández', 'Bartholomew the Great', 'Cleo', 'Jo', 'Ana', 'Ben', 'Eli', 'Priya']);
    sweep(openingCamera(plan, aspect, lobby), plan.duration);
  });
  it('opening frames a crowd of long names and their captions without a jump', () => {
    const plan = openingPlan(['Alexandria', 'Christopher', 'Bartholomew', 'Maximiliano', 'Konstantin', 'Gwendolyn', 'Evangeline', 'Montgomery']);
    const extra = plan.forms.map((f) => f.captions.flatMap((c) => [[c.at[0] - 3, c.at[1] - 0.3, c.at[2]], [c.at[0] + 3, c.at[1] + 0.3, c.at[2]]]));
    const cam = openingCamera(plan, aspect, lobby, extra);
    sweep(cam, plan.duration);
    expect(cam(plan.duration).rot[0]).toBeCloseTo(-Math.PI / 2, 6);
  });
  it('outro frames a 16-letter word and a long name, and still lands on the lobby pose', () => {
    const plan = outroPlan({ longest: { word: 'INCOMPREHENSIBLE', playerId: 'a' }, runnerUp: null });
    const cam = outroCamera(plan, aspect, lobby, [{ c: [0, 6.7, 0.2], h: [8, 0.45, 0] }]);
    sweep(cam, plan.duration);
    close(cam(plan.duration).pos, lobby.pos);
  });
  it('outro lands exactly on the lobby pose', () => {
    const plan = outroPlan({ longest: { word: 'QUARTERBACKS', playerId: 'a' }, runnerUp: { word: 'TAN', playerId: 'b' } });
    const cam = outroCamera(plan, aspect, lobby);
    sweep(cam, plan.duration);
    close(cam(plan.duration).pos, lobby.pos);
  });
});
