// The Shake Up tray and letter cubes, built in code. ONE object for every form:
// the films, the living-room station and the game's 3D tray share these looks
// (asset library entry: assets/library/shake-up/letter-tray/asset.json).
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const LOOK = {
  wood: '#8a5a35', woodDark: '#5e3a20', felt: '#1f5c48', cube: '#f5f6ff', ink: '#0f1020', gold: '#ffd166', font: 'Nunito, system-ui, sans-serif',
};

const faceCache = new Map();
export function faceTexture(label, body = LOOK.cube, ink = LOOK.ink) {
  const key = `${label}|${body}|${ink}`;
  if (faceCache.has(key)) return faceCache.get(key);
  const px = 256;
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  g.fillStyle = body; g.fillRect(0, 0, px, px);
  const grad = g.createLinearGradient(0, 0, 0, px);
  grad.addColorStop(0, 'rgba(255,255,255,0.10)'); grad.addColorStop(1, 'rgba(0,0,0,0.14)');
  g.fillStyle = grad; g.fillRect(0, 0, px, px);
  if (label) {
    g.fillStyle = ink; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${label.length > 1 ? 120 : 160}px ${LOOK.font}`;
    g.fillText(label, px / 2, px / 2 + 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  faceCache.set(key, t);
  return t;
}

const cubeGeo = new Map();
// The tray, cubes and names are the subject: matte (so overhead light never veils the ink) and never fogged.
/** A letter cube. Slots: +x −x +y −y +z −z. setFace(slot, label) swaps one face. */
export function letterCube(faces, size = 1) {
  if (!cubeGeo.has(size)) cubeGeo.set(size, new RoundedBoxGeometry(size, size, size, 4, size * 0.14));
  const mats = faces.map((f) => new THREE.MeshStandardMaterial({ map: faceTexture(f), roughness: 0.85, fog: false }));
  const mesh = new THREE.Mesh(cubeGeo.get(size), mats);
  mesh.castShadow = true;
  mesh.userData.setFace = (slot, label, gold = false) => {
    const m = mats[slot];
    const tex = faceTexture(label, gold ? LOOK.gold : LOOK.cube);
    if (m.map !== tex) { m.map = tex; m.needsUpdate = true; }
  };
  return mesh;
}

function woodMat(color = LOOK.wood) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02, fog: false });
}

/**
 * The lidded tray, the same build as the game's 3D tray: low walls, a divider
 * grid, felt at y = 0. The lid is hinged along the top of the back wall: a rim
 * sits on the walls, the slab clears the cubes, the SHAKE UP engraving is on
 * top and the inside is lined with felt, so when it opens it stands behind the
 * tray as a backdrop for the words. lid is the hinge group (turn it with
 * rotation.x = -angle). Returns { group, lid, liningGlow, inner, outer, pitch, height, seat, cell }.
 */
export function letterTray(size = 4) {
  const pitch = 1.12;
  const inner = size * pitch + 0.12;
  const wall = 0.3, h = 0.48, outer = inner + wall * 2;
  const group = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(outer, 0.16, outer), woodMat());
  base.position.y = -0.1; base.receiveShadow = true; group.add(base);
  // A faint glow of its own keeps felt in shade (an empty cell under a hovering cube) green, never black.
  const feltMat = new THREE.MeshStandardMaterial({ color: LOOK.felt, emissive: LOOK.felt, emissiveIntensity: 0.12, roughness: 0.95, fog: false });
  const felt = new THREE.Mesh(new THREE.BoxGeometry(inner, 0.02, inner), feltMat);
  felt.position.y = -0.01; felt.receiveShadow = true; group.add(felt);
  const sides = [[0, -1, outer, wall], [0, 1, outer, wall], [-1, 0, wall, inner], [1, 0, wall, inner]];
  for (const [sx, sz, w, d] of sides) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h + 0.02, d), woodMat());
    m.position.set(sx * (inner / 2 + wall / 2), h / 2 - 0.01, sz * (inner / 2 + wall / 2));
    m.castShadow = m.receiveShadow = true; group.add(m);
  }
  for (let k = 1; k < size; k++) {
    const b = -inner / 2 + 0.06 + k * pitch;
    for (const [w, d, x, z] of [[0.06, inner, b, 0], [inner, 0.06, 0, b]]) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), woodMat(LOOK.woodDark));
      m.position.set(x, 0.1, z); m.receiveShadow = true; group.add(m);
    }
  }
  // Lid, built around its hinge: y up from the wall top, z forward from the back edge.
  const lid = new THREE.Group();
  lid.position.set(0, h, -outer / 2);
  const rimH = 0.56, slabT = 0.14, rimT = 0.1; // the slab's underside clears the cubes (top at 1.0) by 0.04
  const part = (w, ht, d, x, y, z, mat = woodMat(LOOK.woodDark)) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, ht, d), mat);
    m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; lid.add(m); return m;
  };
  part(outer, slabT, outer, 0, rimH + slabT / 2, outer / 2);
  part(outer, rimH, rimT, 0, rimH / 2, rimT / 2);
  part(outer, rimH, rimT, 0, rimH / 2, outer - rimT / 2);
  for (const sx of [-1, 1]) part(rimT, rimH, outer - rimT * 2, sx * (outer / 2 - rimT / 2), rimH / 2, outer / 2);
  // Mid-swing the lining faces the camera at an angle no light reaches, so it has a glow of its own
  // (films raise it with the swing: liningGlow) and never reads as a black slab.
  const liningMat = new THREE.MeshStandardMaterial({ color: LOOK.felt, emissive: LOOK.felt, emissiveIntensity: 0.35, roughness: 0.95, fog: false });
  const lining = new THREE.Mesh(new THREE.PlaneGeometry(outer - rimT * 2, outer - rimT * 2), liningMat);
  lining.rotation.x = Math.PI / 2; lining.position.set(0, rimH - 0.002, outer / 2); lid.add(lining); // no cast shadows on the backdrop: they read as holes
  const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.14, 24), woodMat());
  knob.position.set(0, rimH + slabT + 0.07, outer - 0.55); knob.castShadow = true; lid.add(knob);
  for (const sx of [-1, 1]) {
    const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 12), new THREE.MeshStandardMaterial({ color: '#c9a45c', metalness: 0.7, roughness: 0.35, fog: false }));
    hinge.rotation.z = Math.PI / 2; hinge.position.set(sx * outer * 0.3, 0, -0.02); lid.add(hinge);
  }
  // Engraved title on top: a canvas decal, big and centred, readable from the lobby's low angle when
  // closed (anisotropic filtering keeps the foreshortened letters crisp, not smeared).
  const c = document.createElement('canvas'); c.width = 2048; c.height = 512;
  const g = c.getContext('2d');
  g.font = `900 330px ${LOOK.font}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineWidth = 22; g.strokeStyle = 'rgba(40,20,8,0.55)'; g.strokeText('SHAKE UP', 1024, 270);
  g.fillStyle = '#f6dfb0'; g.fillText('SHAKE UP', 1024, 270);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 16;
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(outer * 0.9, outer * 0.225), new THREE.MeshBasicMaterial({ map: tex, transparent: true, fog: false }));
  decal.rotation.x = -Math.PI / 2; decal.position.set(0, rimH + slabT + 0.005, outer * 0.5); lid.add(decal);
  group.add(lid);
  // seat: raise the group this much to stand its base on a surface (the felt is at the group's y = 0).
  /** k: 0 open (the spot lights the lining) .. 1 closed; the glow peaks while the lining faces down-forward. */
  const liningGlow = (k) => { liningMat.emissiveIntensity = 0.35 + 1.1 * Math.sin(Math.PI * Math.min(1, Math.max(0, k)) * 0.5) ** 0.7; };
  return { group, lid, liningGlow, inner, outer, pitch, height: h, seat: 0.18, cell: (i) => [((i % size) - (size - 1) / 2) * pitch, (Math.floor(i / size) - (size - 1) / 2) * pitch] };
}

/**
 * Text sprite for player names (colour always travels with the name), always
 * drawn at full size: the canvas is as wide as the text, and
 * userData.aspect (width / height) tells the film how wide to scale it.
 */
export function nameSprite(text, color) {
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  const font = `900 140px ${LOOK.font}`;
  g.font = font;
  c.width = Math.ceil(g.measureText(text).width + 72); c.height = 256;
  g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 26; g.strokeStyle = 'rgba(10,10,25,0.9)'; g.strokeText(text, c.width / 2, 128);
  g.fillStyle = color; g.fillText(text, c.width / 2, 128);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, fog: false }));
  s.userData.aspect = c.width / c.height;
  s.scale.set(s.userData.aspect, 1, 1);
  return s;
}
