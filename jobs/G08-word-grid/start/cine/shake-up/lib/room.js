// Room adapter. The real living room (films/shared/, ADR-077/079) already
// exists in the repo; this film only needs three things from it:
//   - the coffee-table top centre (where the tray sits),
//   - the lobby camera pose (where the outro lands),
//   - the room's own lights/mood.
// ASSUMED shared API (check on main): films/shared/room.js exports
//   loadRoom({ THREE, scene, renderer }) → Promise<{ tableTop: [x,y,z], lobby: { pos, look }, update?(t) }>
// If that module is missing or shaped differently, a stand-in room is built so
// the film still previews. Swap the mapping in `fromShared` once on main.
import * as THREE from 'three';

export async function loadRoom(scene, renderer) {
  try {
    const shared = '../../shared/room.js'; // films/shared/room.js once imported into packages/client/public/films/
    const mod = await import(/* @vite-ignore */ shared);
    if (typeof mod.loadRoom === 'function') return fromShared(await mod.loadRoom({ THREE, scene, renderer }));
  } catch { /* no shared room in this preview */ }
  return standInRoom(scene);
}

function fromShared(r) {
  return { tableTop: new THREE.Vector3(...r.tableTop), lobby: { pos: new THREE.Vector3(...r.lobby.pos), look: new THREE.Vector3(...r.lobby.look) }, update: r.update ?? (() => {}), standIn: false };
}

/** Night living room, built from boxes: enough to judge framing and mood. */
function standInRoom(scene) {
  const mat = (color, rough = 0.85) => new THREE.MeshStandardMaterial({ color, roughness: rough });
  const box = (w, h, d, color, x, y, z, rough) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, rough));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
  };
  scene.background = new THREE.Color('#0b0c1a');
  scene.fog = new THREE.Fog('#0b0c1a', 30, 70);
  box(60, 0.2, 60, '#2a1d17', 0, -0.1, 0, 0.7); // floor
  box(60, 20, 0.4, '#16182e', 0, 10, -14); // back wall
  box(0.4, 20, 60, '#14162a', -18, 10, 0); // side wall
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.05, 64), mat('#3b2546', 1)); rug.position.y = 0.03; rug.receiveShadow = true; scene.add(rug);
  // sofa
  box(14, 2.2, 4, '#3a3f7a', 0, 1.1, -9); box(14, 3.8, 1.2, '#343a72', 0, 2.6, -10.6); box(1.4, 3, 4, '#343a72', -7.4, 1.6, -9); box(1.4, 3, 4, '#343a72', 7.4, 1.6, -9);
  // coffee table
  const top = box(10, 0.4, 6, '#6b4428', 0, 2.6, 0, 0.55);
  for (const [x, z] of [[-4.5, -2.5], [4.5, -2.5], [-4.5, 2.5], [4.5, 2.5]]) box(0.4, 2.4, 0.4, '#4d301c', x, 1.2, z);
  // shelf + TV glow on the right
  box(0.6, 8, 6, '#2b2240', 16, 4, -6); box(9, 5, 0.3, '#05060c', 6, 7, -13.6, 0.3);
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 4.6), new THREE.MeshBasicMaterial({ color: '#1a1d45' })); screen.position.set(6, 7, -13.4); scene.add(screen);
  // window with moon
  const win = new THREE.Mesh(new THREE.PlaneGeometry(7, 9), new THREE.MeshBasicMaterial({ color: '#1d3a6b' })); win.position.set(-17.7, 9, -2); win.rotation.y = Math.PI / 2; scene.add(win);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: '#e8f0ff' })); moon.position.set(-17.6, 11, -3.5); moon.rotation.y = Math.PI / 2; scene.add(moon);
  // lights: moonlight, warm lamp, soft fill
  scene.add(new THREE.HemisphereLight('#4a5aa8', '#1a1010', 0.55));
  const moonL = new THREE.DirectionalLight('#9fb6ff', 1.1); moonL.position.set(-16, 14, 2); moonL.castShadow = true;
  moonL.shadow.mapSize.set(2048, 2048); Object.assign(moonL.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14 }); scene.add(moonL);
  const lamp = new THREE.PointLight('#ffb36b', 60, 30, 2); lamp.position.set(10, 7, -6); scene.add(lamp);
  box(0.3, 6, 0.3, '#222', 10, 3, -6); const shade = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.4, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#ffcf99', emissive: '#ffae5c', emissiveIntensity: 0.8, side: THREE.DoubleSide })); shade.position.set(10, 6.8, -6); scene.add(shade);
  return { tableTop: new THREE.Vector3(0, top.position.y + 0.2, 0), lobby: { pos: new THREE.Vector3(0, 11, 24), look: new THREE.Vector3(0, 3, -4) }, update: () => {}, standIn: true };
}
