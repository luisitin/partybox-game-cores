// Shake Up · opening film (about 14 to 22 s, set by how many names). Night
// living room; the camera glides to the tray on the coffee table and the lid
// lifts off and stands behind it. Every player's name rises out of the tray
// in gold cubes, two lines at a time (short names share a line), then
// SHAKE / UP; each formation goes home before the next. A name the cubes cannot
// show whole is captioned as written while its line is up. As the last cubes land the camera rises to
// straight down over the tray (the game's own framing) and pushes into the
// felt, which fades to felt green for the shell to dissolve into the rules card.
// Every pose is a function of t from lib/choreo.js (proven collision-free) and
// lib/camera.js, so phones draw the same frame as the TV.
import { openingCamera } from './lib/camera.js';
import { CAPTION_H, captionAlpha, clamp01, openingPlan } from './lib/choreo.js';
import { runFilm } from './lib/film.js';
import { applyCamera, box, local, spotOn, trayStage } from './lib/stage.js';
import { LOOK, nameSprite } from './lib/tray.js';

const sample = { names: ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya'], final: null };

runFilm({
  sample,
  endFade: { seconds: 0.6 },
  build: ({ scene, camera, room, input, renderer }) => {
    const plan = openingPlan(input.names);
    const { B, tray, pose } = trayStage(scene, room, plan, 1, renderer);
    spotOn(scene, tray, B, [...box([0, 0.5, 0], 2.6), ...plan.forms.flatMap((f) => [...f.shows.values()].flatMap((s) => box(s.slot, 0.6)))]);
    // Captions: the name as written, drawn at full size (as wide as its text), fading with its line's turn.
    const captions = plan.forms.flatMap((f) => f.captions.map((c) => {
      const s = nameSprite(c.text, LOOK.cube);
      s.position.set(...c.at);
      s.material.opacity = 0;
      s.visible = false;
      tray.group.add(s);
      return { s, c };
    }));
    const extra = plan.forms.map((f) => captions.filter(({ c }) => f.captions.includes(c))
      .flatMap(({ s, c }) => [-1, 1].flatMap((x) => [-1, 1].map((y) => [c.at[0] + (x * CAPTION_H * s.userData.aspect) / 2, c.at[1] + y * CAPTION_H * 0.3, c.at[2]]))));
    const lobby = { pos: local(B, room.lobby.pos), look: local(B, room.lobby.look) };
    let aspect = 0;
    let cam = null;
    const render = (t) => {
      pose(t);
      for (const { s, c } of captions) {
        const k = captionAlpha(c, t);
        s.visible = k > 0;
        s.material.opacity = k;
        const grow = CAPTION_H * (0.85 + 0.15 * clamp01(k));
        s.scale.set(grow * s.userData.aspect, grow, 1);
      }
      if (camera.aspect !== aspect) { aspect = camera.aspect; cam = openingCamera(plan, aspect, lobby, extra); }
      applyCamera(camera, B, cam(t));
    };
    return { render, duration: plan.duration };
  },
});
