// Test/offline bindings intentionally use the owner's flat fallback. Original 3D assets stay intact.
import type { ReactNode } from 'react';
import { useMotion } from './ui';
export function useMotionTokens(): { slow: number; fast: number; base: number; pulse: number } {
  return useMotion() ? { slow: 600, fast: 150, base: 350, pulse: 1000 } : { slow: 0, fast: 0, base: 0, pulse: 0 };
}
type Props = { children?: ReactNode; fallback?: ReactNode; pose?: (t: number) => unknown; rig?: { at: number; pose(t: number, aspect: number): unknown }; [key: string]: unknown };
declare global { namespace JSX { interface IntrinsicElements { group: Record<string, unknown>; } } }
export const Table3d = (p: Props) => <>{p.fallback}</>;
export const Motion3d = (_p: Props) => null;
export const Solid3d = (_p: Props) => null;
export const Dice3d = (_p: Props) => null;
export const Line3d = (_p: Props) => null;
export const Pulse3d = (_p: Props) => null;
