// The tray on the coffee table, posed from a plan: both films share it.
// Cubes carry a seeded random letter on top (what the game shows) and plain
// sides. The face that spells is the bottom, hidden on the felt while the
// cube rests and painted only then, so a letter never changes on screen; the
// cube tips it forward to the camera and the plain front rolls up to be the
// top. A gold word's plain faces warm to gold as it tips, so it reads as a
// gold tile, not a white cube with a sticker.
import * as THREE from 'three';
import { BACK, cubeState, hash01, LID_OPEN, lidAngle } from './choreo.js';
import { faceTexture, LOOK, letterCube, letterTray } from './tray.js';

const POOL = 'AEIORSTNLDMPBCGHUY';

/** Builds the tray and cubes for `plan` ({ cubes, lid }); returns the tray origin B and pose(t). */
export function trayStage(scene, room, plan, seed, renderer) {
  // Every face the film will paint is drawn and uploaded now, so a repaint never costs a frame.
  for (const c of plan.cubes) for (const sh of c.shows) renderer?.initTexture(faceTexture(sh.letter, sh.gold ? LOOK.gold : LOOK.cube));
  const tray = letterTray(4);
  const B = room.tableTop.clone();
  B.y += tray.seat;
  tray.group.position.copy(B);
  scene.add(tray.group);
  const cubes = plan.cubes.map((c, i) => {
    const letter = (k) => POOL[Math.floor(hash01(seed, i, k) * POOL.length)];
    const mesh = letterCube(['', '', letter(2), '', '', ''], 1); // +x −x +y −y +z −z
    mesh.receiveShadow = true;
    tray.group.add(mesh);
    return { mesh, label: undefined, warm: 0 };
  });
  // The plain faces are drawn in LOOK.cube; this tint turns them LOOK.gold.
  const [gold, cube] = [new THREE.Color(LOOK.gold), new THREE.Color(LOOK.cube)];
  const warm = new THREE.Color(gold.r / cube.r, gold.g / cube.g, gold.b / cube.b);
  const white = new THREE.Color(1, 1, 1);
  const pose = (t) => {
    const lid = lidAngle(t, plan.lid);
    tray.lid.rotation.x = -lid;
    tray.liningGlow(1 - lid / LID_OPEN);
    plan.cubes.forEach((c, i) => {
      const s = cubeState(c, t);
      const m = cubes[i];
      m.mesh.position.set(s.p[0], s.p[1], s.p[2]);
      m.mesh.quaternion.set(s.q[0], s.q[1], s.q[2], s.q[3]);
      m.mesh.scale.setScalar(s.s);
      if (s.label !== m.label) {
        m.label = s.label;
        m.mesh.userData.setFace(BACK, s.label ? s.label.letter : '', Boolean(s.label?.gold));
      }
      const k = s.label?.gold ? s.turn : 0;
      if (k !== m.warm) {
        m.warm = k;
        m.mesh.material.forEach((mat, slot) => { if (slot !== BACK) mat.color.lerpColors(white, warm, k); });
      }
    });
  };
  return { B, tray, pose };
}

/**
 * A warm key spotlight from above and in front, aimed at the middle of
 * `points` (tray-local) and wide enough that every one of them is in its full
 * beam, not the soft edge; its shadows are soft and half strength, and a
 * faint fill from the camera side lifts the shade further.
 */
export function spotOn(scene, tray, B, points, intensity = 130) {
  const lo = [0, 1, 2].map((i) => Math.min(...points.map((p) => p[i])));
  const hi = [0, 1, 2].map((i) => Math.max(...points.map((p) => p[i])));
  const aim = new THREE.Vector3(...lo.map((v, i) => (v + hi[i]) / 2));
  const from = new THREE.Vector3(1.5, 14, 6);
  const axis = aim.clone().sub(from).normalize();
  const widest = Math.max(...points.map((p) => axis.angleTo(new THREE.Vector3(...p).sub(from))));
  const penumbra = 0.4;
  const spot = new THREE.SpotLight('#fff1d6', intensity, 60, Math.min(1.2, widest / (1 - penumbra) + 0.04), penumbra, 1.2);
  spot.position.copy(from).add(B);
  spot.target.position.copy(aim);
  tray.group.add(spot.target);
  spot.castShadow = true;
  spot.shadow.mapSize.set(2048, 2048);
  // Shadows are shade, never holes: half strength, soft-edged (the arch of airborne cubes would
  // otherwise print a band of black squares on the floor and black out the empty cells under it).
  spot.shadow.intensity = 0.5;
  spot.shadow.radius = 5;
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.02; // no acne specks on the lid's top
  scene.add(spot);
  const fill = new THREE.DirectionalLight('#dfe4ff', 0.6);
  fill.position.set(B.x, B.y + 6, B.z + 14);
  fill.target = tray.group;
  scene.add(fill);
  return spot;
}

/** Corners of a cube of half-size h around c, for framing and lighting. */
export const box = (c, h) => [-1, 1].flatMap((x) => [-1, 1].flatMap((y) => [-1, 1].map((z) => [c[0] + x * h, c[1] + y * h, c[2] + z * h])));

/** Room pose (world) → tray-local, for the camera. */
export const local = (B, v) => [v.x - B.x, v.y - B.y, v.z - B.z];

/** Applies a camera pose from lib/camera.js (tray-local) to a three.js camera. */
export function applyCamera(camera, B, c) {
  camera.position.set(B.x + c.pos[0], B.y + c.pos[1], B.z + c.pos[2]);
  camera.rotation.set(c.rot[0], c.rot[1], 0, 'YXZ');
  if (camera.fov !== c.fov) { camera.fov = c.fov; camera.updateProjectionMatrix(); }
}
