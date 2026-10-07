// Film kit: pure timing helpers. A film is render(t) for t in seconds, so the
// TV and every phone draw the same frame for the same t (phones play muted, in sync).
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
/** Progress of t through [a, b], 0..1. */
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const easeOut = (x) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutBack = (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const lerp = (a, b, k) => a + (b - a) * k;
export const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
/** Bezier through three points (camera moves without corners). */
export const bez3 = (a, m, b, k) => lerp3(lerp3(a, m, k), lerp3(m, b, k), k);

/** Deterministic hash → 0..1 (no Math.random in films either: phones must match the TV). */
export function hash01(...n) {
  let h = 2166136261 >>> 0;
  for (const x of n) { h ^= Math.floor(x * 1000) >>> 0; h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d) >>> 0; h ^= h >>> 12;
  return (h >>> 0) / 4294967296;
}

/** Reads the film input. The shell passes window.pbFilm (assumed shape, see FILMS.md); URL params are for previews. */
export function filmInput(sample) {
  const q = new URLSearchParams(location.search);
  const given = typeof window !== 'undefined' && window.pbFilm ? window.pbFilm : {};
  const names = given.names ?? (q.get('names') ? q.get('names').split(',') : sample.names);
  const final = given.final ?? sample.final;
  const t = q.has('t') ? Number(q.get('t')) : null;
  const lang = given.lang ?? q.get('lang') ?? 'en';
  return { names, final, lang, still: t, onDone: given.onDone ?? (() => {}), reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches };
}
