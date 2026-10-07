// Shake Up · outro film (about 12 s). Crossfades over the results on a low hero
// angle of the open tray. The winner's longest word rises out of it in big gold
// cubes in a shallow arch, their name above in their player colour; the
// runner-up's best word comes up below in white with their name under it. A
// hold while the camera orbits, then every cube goes home, the lid swings back
// on (SHAKE UP engraving) and the camera pulls back to the room's lobby pose.
// Input: results.detail (see server/results.ts) →
//   { longest: { word, playerId, letters } | null, runnerUp: { word, playerId } | null,
//     perPlayer: [{ id, name, unique, shared, best }], missed: { word, letters } | null }
import { outroCamera } from './lib/camera.js';
import { clamp01, outroPlan, smoother } from './lib/choreo.js';
import { runFilm } from './lib/film.js';
import { applyCamera, box, local, spotOn, trayStage } from './lib/stage.js';
import { nameSprite } from './lib/tray.js';

const PLAYER = ['#ff5d8f', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f43', '#48dbfb', '#f368e0'];
// The big word's label when no player owns it: a word nobody found, or SHAKE UP when no word was played at all.
const UNOWNED = { missed: { en: 'Nobody found', es: 'Nadie la encontró' }, none: { en: 'Thanks for playing', es: 'Gracias por jugar' } };

const sample = {
  names: ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya'],
  final: {
    longest: { word: 'STRANDED', playerId: 'cleo', letters: 8 },
    runnerUp: { word: 'TRAINED', playerId: 'ana' },
    perPlayer: ['Ana', 'Ben', 'Cleo', 'Dev', 'Eli', 'Priya'].map((n) => ({ id: n.toLowerCase(), name: n })),
    missed: { word: 'RESTRAINED', letters: 10 },
  },
};

runFilm({
  sample,
  endFade: null,
  build: ({ scene, camera, room, input, renderer }) => {
    const f = input.final ?? sample.final;
    const plan = outroPlan(f);
    const { B, tray, pose } = trayStage(scene, room, plan, 3, renderer);
    const people = f.perPlayer ?? [];
    const who = (id) => { const i = people.findIndex((p) => p.id === id); return { name: people[i]?.name ?? '', color: PLAYER[Math.max(0, i) % PLAYER.length] }; };

    // Names: the winner's above the arch, the runner-up's under their word in front of the tray's back
    // wall, each about as tall as a letter on its cubes (the text fills ~38 % of a sprite's height; a
    // sprite is as wide as its text, so a long name is never shrunk). Colour travels with the name.
    const labels = [];
    const label = (text, color, at, height) => {
      const s = nameSprite(text, color);
      s.position.set(...at);
      s.material.opacity = 0;
      tray.group.add(s);
      labels.push({ s, height });
    };
    const unowned = UNOWNED[plan.top.kind];
    const winner = unowned ? { name: unowned[input.lang] ?? unowned.en, color: '#f5f6ff' } : who(plan.top.playerId);
    label(winner.name, winner.color, [0, 5.1 + 0.73 + 0.85, 0.2], 1.5);
    if (plan.R.length) { const r = who(f.runnerUp.playerId); label(r.name, r.color, [0, 2.1, 1.9], 1.1); }
    const slots = plan.cubes.flatMap((c) => c.shows.flatMap((s) => box(s.slot, 0.5 * s.scale + 0.1)));
    spotOn(scene, tray, B, [...box([0, 0.5, 0], 2.6), ...slots, ...labels.map(({ s }) => s.position.toArray())], 150);

    const lobby = { pos: local(B, room.lobby.pos), look: local(B, room.lobby.look) };
    let aspect = 0;
    let cam = null;
    const render = (t) => {
      pose(t);
      // Names fade in as the last cube turns, and out as the words leave.
      const k = smoother((t - plan.shown + 0.3) / 0.5) * (1 - smoother((t - plan.leave + 0.4) / 0.4));
      for (const { s, height } of labels) {
        s.material.opacity = k;
        const grow = 0.85 + 0.15 * clamp01(k);
        s.scale.set(height * s.userData.aspect * grow, height * grow, 1);
      }
      if (camera.aspect !== aspect) {
        aspect = camera.aspect;
        cam = outroCamera(plan, aspect, lobby, labels.map(({ s, height }) => ({ c: s.position.toArray(), h: [(height * s.userData.aspect) / 2, height * 0.3, 0] })));
      }
      applyCamera(camera, B, cam(t));
    };
    return { render, duration: plan.duration };
  },
});
