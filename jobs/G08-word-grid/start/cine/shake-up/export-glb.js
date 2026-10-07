// Bakes the shared tray and cube looks to GLB for the living-room station
// (games/shake-up/client/station/*.glb). Run via export-glb.mjs (headless browser).
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { letterCube, letterTray } from './lib/tray.js';

function toB64(buf) { let s = ''; const b = new Uint8Array(buf); for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000)); return btoa(s); }
const exp = new GLTFExporter();
const glb = (obj) => new Promise((res, rej) => exp.parse(obj, (r) => res(toB64(r)), rej, { binary: true, maxTextureSize: 256 }));

window.bake = async () => {
  const out = {};
  const tray = letterTray(4);
  // Closed tray with all 16 cubes inside (the station shows the lid on; the opening film opens it).
  // Raised by its seat, so the model's origin is the bottom of its base and it stands on the table at y = 0.
  const g = new THREE.Group(); g.add(tray.group);
  tray.group.position.y = tray.seat;
  for (let i = 0; i < 16; i++) { const c = letterCube(['S', 'H', 'A', 'K', 'E', 'U'], 1); const [x, z] = tray.cell(i); c.position.set(x, 0.5, z); c.rotation.x = -Math.PI / 2; tray.group.add(c); }
  out['tray'] = await glb(g);
  for (const l of ['P', 'L', 'A', 'Y']) out[`cube-${l.toLowerCase()}`] = await glb(letterCube([l, 'E', 'S', 'T', l, 'O'], 1));
  return out;
};
document.body.dataset.ready = '1';
