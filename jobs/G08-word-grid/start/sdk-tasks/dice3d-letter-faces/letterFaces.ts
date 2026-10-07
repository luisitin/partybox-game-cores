// SDK task: Dice3d letter faces (packages/game-sdk/src/ui/table3d/letterFaces.ts).
// Lets Dice3d show any six short labels ("A", "Qu", "Ñ", "7", "★") instead of
// pips. Shake Up needs it; Smash City and Liar's Dice variants can reuse it.
//
// Design:
//  - Labels are drawn once per (label, style) onto a canvas and cached as a
//    texture, so 16–25 cubes with repeated letters cost a handful of textures.
//  - `faceMaterialOrder(up)` maps our "faces[up] points up" convention to
//    three.js BoxGeometry's material slots (+x, −x, +y, −y, +z, −z).
//  - Colours come from the caller (read from tokens), never hard-coded here.
//  - A letter on a side face is drawn upright for a camera looking down −z.
import { CanvasTexture, SRGBColorSpace, type Texture } from 'three';

export type FaceStyle = {
  /** Cube body colour (CSS colour, from a token). */
  body: string;
  /** Ink colour. */
  ink: string;
  /** CSS font family. */
  font: string;
  /** Texture size in px (power of two). */
  px?: number;
  /** Underline 6 and 9 so they read the right way up (dice only). */
  underlineAmbiguous?: boolean;
};

/** BoxGeometry material slot for each of our six faces when faces[up] is on top. */
const SLOT_ORDER: readonly number[][] = [
  // for up = 0..5: which faces[] index goes in slots [+x, −x, +y, −y, +z, −z]
  [1, 2, 0, 5, 3, 4],
  [0, 2, 1, 5, 3, 4],
  [1, 0, 2, 5, 3, 4],
  [1, 2, 3, 0, 5, 4],
  [1, 2, 4, 5, 3, 0],
  [1, 2, 5, 0, 3, 4],
];

export function faceMaterialOrder(up: number): readonly number[] {
  return SLOT_ORDER[((up % 6) + 6) % 6] as number[];
}

/** Font size so one glyph fills ~62 % of the face and "Qu" still fits. */
export function labelFontPx(label: string, px: number): number {
  const n = [...label].length;
  return Math.round(px * (n <= 1 ? 0.62 : n === 2 ? 0.48 : 0.34));
}

export type TextureFactory = (label: string, style: FaceStyle) => Texture;

/** Draws one face. Exported for tests and for the 2D fallback's sprite sheet. */
export function drawFace(ctx: CanvasRenderingContext2D, label: string, style: FaceStyle, px: number): void {
  ctx.fillStyle = style.body;
  ctx.fillRect(0, 0, px, px);
  // Soft inner bevel so flat-lit faces still read as a cube.
  const g = ctx.createLinearGradient(0, 0, 0, px);
  g.addColorStop(0, 'rgba(255,255,255,0.10)');
  g.addColorStop(1, 'rgba(0,0,0,0.12)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, px, px);
  if (!label) return;
  ctx.fillStyle = style.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${labelFontPx(label, px)}px ${style.font}`;
  ctx.fillText(label, px / 2, px / 2 + px * 0.03);
  if (style.underlineAmbiguous && (label === '6' || label === '9' || label === 'M' || label === 'W' || label === 'Z' || label === 'N')) {
    const w = px * 0.28;
    ctx.fillRect(px / 2 - w / 2, px * 0.8, w, px * 0.05);
  }
}

/**
 * Cached texture factory. One per renderer; call `dispose()` when the table unmounts.
 * The cache key is label + style so themes can switch without stale faces.
 */
export function createLetterFaces(makeCanvas: (px: number) => HTMLCanvasElement | OffscreenCanvas = defaultCanvas) {
  const cache = new Map<string, Texture>();
  const get: TextureFactory = (label, style) => {
    const px = style.px ?? 256;
    const key = `${label}\u0000${style.body}\u0000${style.ink}\u0000${style.font}\u0000${px}\u0000${style.underlineAmbiguous ? 1 : 0}`;
    const hit = cache.get(key);
    if (hit) return hit;
    const canvas = makeCanvas(px);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (ctx) drawFace(ctx, label, style, px);
    const tex = new CanvasTexture(canvas as HTMLCanvasElement);
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = 4;
    cache.set(key, tex);
    return tex;
  };
  return {
    get,
    /** Six textures in BoxGeometry slot order for faces[] with faces[up] on top. */
    forCube(faces: readonly string[], up: number, style: FaceStyle): Texture[] {
      return faceMaterialOrder(up).map((i) => get(faces[i] ?? '', style));
    },
    size: () => cache.size,
    dispose(): void {
      for (const t of cache.values()) t.dispose();
      cache.clear();
    },
  };
}

function defaultCanvas(px: number): HTMLCanvasElement | OffscreenCanvas {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(px, px);
  const c = document.createElement('canvas');
  c.width = px;
  c.height = px;
  return c;
}
