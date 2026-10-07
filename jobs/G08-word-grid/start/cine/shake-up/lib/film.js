// Film runner: renderer, room, real-time playback of a seekable render(t),
// skip on click/key, skipped entirely under reduced motion, ?t=<s> for stills.
// build() returns { render, duration }: a film's length follows its plan (how many names, how long the word).
import * as THREE from 'three';
import { filmInput } from './kit.js';
import { loadRoom } from './room.js';
import { LOOK } from './tray.js';

export async function runFilm({ build, sample, endFade }) {
  const input = filmInput(sample);
  const done = (() => { let called = false; return () => { if (!called) { called = true; input.onDone(); document.body.dataset.done = '1'; } }; })();
  if (input.reducedMotion && input.still === null) { done(); return; }
  const canvas = document.querySelector('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // filtered by each light's shadow.radius (soft edges)
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 200);
  const room = await loadRoom(scene, renderer);
  // Letters are drawn into textures once, so the face font must be ready first (never wait long for it).
  await Promise.race([document.fonts?.load(`900 100px ${LOOK.font}`), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});
  const { render, duration } = build({ scene, camera, room, input, renderer });
  const fade = document.getElementById('fade');
  const size = () => { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);
  const frame = (t) => {
    render(t);
    room.update(t);
    if (fade && endFade) fade.style.opacity = String(Math.max(0, Math.min(1, (t - (duration - endFade.seconds)) / endFade.seconds)));
    renderer.render(scene, camera);
  };
  if (input.still !== null) { frame(input.still); document.body.dataset.ready = '1'; return; }
  const skip = () => done();
  addEventListener('keydown', skip); addEventListener('pointerdown', skip);
  // The shell may hand a shared start time so phones stay in sync; else start now.
  const t0 = window.pbFilm?.startAt ?? performance.now();
  const tick = () => {
    const t = (performance.now() - t0) / 1000;
    frame(Math.min(t, duration));
    if (t >= duration) return done();
    requestAnimationFrame(tick);
  };
  document.body.dataset.ready = '1';
  requestAnimationFrame(tick);
}
