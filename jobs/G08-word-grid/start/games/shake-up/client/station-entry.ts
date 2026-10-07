// Living-room intro station (ADR-077): pure data. Where Shake Up sits on the
// coffee table, which models make it up, and how the dive camera drops in.
// Units are the room's metres; ASSUMED shape (check StationPiece on main).
import tray from './station/tray.glb?url';
import cubeA from './station/cube-a.glb?url';
import cubeL from './station/cube-l.glb?url';
import cubeP from './station/cube-p.glb?url';
import cubeY from './station/cube-y.glb?url';

/** Tray is 5.2 units wide at scale 1 (origin at the bottom of its base); on the table it is a 31 cm box. */
const S = 0.06;

export const station = {
  game: 'shake-up',
  spot: 'coffee-table',
  position: [0.18, 0, -0.05] as const,
  rotationY: -0.22,
  pieces: [
    { id: 'tray', model: tray, position: [0, 0, 0], rotation: [0, 0, 0], scale: S, asset: 'shake-up/letter-tray' },
    // Four loose cubes in front of the tray spell PLAY, slightly askew.
    { id: 'cube-p', model: cubeP, position: [-0.1, 0.03, 0.22], rotation: [-Math.PI / 2, 0, 0.12], scale: S, asset: 'shake-up/letter-cube' },
    { id: 'cube-l', model: cubeL, position: [-0.033, 0.03, 0.235], rotation: [-Math.PI / 2, 0, -0.06], scale: S, asset: 'shake-up/letter-cube' },
    { id: 'cube-a', model: cubeA, position: [0.033, 0.03, 0.225], rotation: [-Math.PI / 2, 0, 0.04], scale: S, asset: 'shake-up/letter-cube' },
    { id: 'cube-y', model: cubeY, position: [0.1, 0.03, 0.24], rotation: [-Math.PI / 2, 0, -0.15], scale: S, asset: 'shake-up/letter-cube' },
    // Notepad and pencil: plain solids, no model needed.
    { id: 'notepad', solid: { shape: 'box', size: [0.1, 0.008, 0.14], color: 'paper' }, position: [0.26, 0.004, 0.06], rotation: [0, 0.35, 0] },
    { id: 'pencil', solid: { shape: 'cylinder', size: [0.004, 0.13], color: 'accent-2' }, position: [0.27, 0.012, 0.06], rotation: [0, 0.9, Math.PI / 2] },
    // Optional 3-minute hourglass from Poly Pizza (licence unverified); the station reads fine without it.
    // { id: 'hourglass', model: hourglass, position: [-0.24, 0, -0.04], rotation: [0, 0, 0], scale: 0.05 },
  ],
  /** Dive: from the room shot down over the tray, lid filling the frame, then the opening film takes over. */
  dive: { to: [0.18, 0.55, 0.32] as const, look: [0.18, 0.02, -0.05] as const },
} as const;
