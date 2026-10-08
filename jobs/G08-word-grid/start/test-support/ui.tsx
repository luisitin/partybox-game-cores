// Test/offline shell primitives. These wrap the owner's unmodified game client components.
// They do not claim to implement the missing production SDK's sound, avatars or 3D runtime.
import React, { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
export type Me = { id: string; name: string; isVip: boolean; canSeeTv: boolean };
type Shell = { now(): number; play(s: string): void; say(s: unknown): void; motion: boolean };
const DEFAULT: Shell = { now: () => 0, play: () => {}, say: () => {}, motion: true };
const Context = createContext<Shell>(DEFAULT);
export const ShellProvider = Context.Provider;
let locale = 'en';
let translations: Record<string, string> = {};
export function setLocale(lang: string, words: Record<string, string>): void { locale = lang; translations = words; }
export function L(text: string, vars: Record<string, string | number> = {}): string {
  return (locale === 'es' ? translations[text] ?? text : text).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}
export function useMotion(): boolean { return useContext(Context).motion; }
export function useSound(): (name: string) => void { return useContext(Context).play; }
export function useReading(line: unknown, opts: { on?: boolean; delayMs?: number; holdMs?: number } = {}): void {
  const shell = useContext(Context); useEffect(() => { if (opts.on !== false && line) shell.say(line); }, [line, opts.on, shell]);
}
export function useServerNow(ms = 250): number {
  const shell = useContext(Context); const [now, setNow] = useState(shell.now);
  useEffect(() => { const id = setInterval(() => setNow(shell.now()), ms); return () => clearInterval(id); }, [ms, shell]);
  return now;
}
export const buzz = (_ms?: number | number[]): void => {};
export function Screen({ title, footer, children }: { title?: ReactNode; footer?: ReactNode; children?: ReactNode }): React.JSX.Element {
  return <section className="pb-screen">{title ? <h1>{title}</h1> : null}<div className="pb-screen-body">{children}</div>{footer ? <footer className="pb-footer">{footer}</footer> : null}</section>;
}
export function PrimaryButton({ children, variant = 'primary', ariaLabel, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string; ariaLabel?: string }): React.JSX.Element {
  return <button {...props} type="button" aria-label={ariaLabel} className={`pb-button pb-${variant}`}>{children}</button>;
}
export const WaitingScreen = ({ icon, title, body }: { icon?: ReactNode; title: ReactNode; body?: ReactNode }) => <section className="pb-wait"><span aria-hidden>{icon}</span><h1>{title}</h1>{body ? <p>{body}</p> : null}</section>;
export const Avatar = ({ player, size = 40 }: { player: { id: string; name: string; bot?: boolean }; size?: number }) => <span className="pb-avatar" aria-label={player.name} style={{ width: size, height: size, minWidth: size, fontSize: Math.round(size * .4) }}>{Array.from(player.name)[0] ?? '?'}{player.bot ? <small aria-hidden>🤖</small> : null}</span>;
export const BigText = ({ children, size = 'display' }: { children?: ReactNode; size?: string }) => <div className="pb-big" style={{ fontSize: `var(--pb-tv-${size})` }}>{children}</div>;
type Leaving = { key: string; node: ReactNode; rose: boolean };
export function keepLeaving<T extends Leaving>(leaving: readonly T[], current: T, next: string): T[] {
  const out = leaving.filter(x => x.key !== next && x.key !== current.key); if (current.key !== next) out.push(current); return out;
}
export function CrossfadeSwap({ swapKey, children }: { swapKey: string; children?: ReactNode }): React.JSX.Element {
  const motion = useMotion(); const previous = useRef<Leaving>({ key: swapKey, node: children, rose: false });
  const [leaving, setLeaving] = useState<Leaving[]>([]);
  useEffect(() => {
    if (previous.current.key !== swapKey) {
      const was = previous.current; previous.current = { key: swapKey, node: children, rose: true };
      if (motion) { setLeaving(l => keepLeaving(l, was, swapKey)); const id = setTimeout(() => setLeaving([]), 350); return () => clearTimeout(id); }
      setLeaving([]);
    } else previous.current.node = children;
  }, [swapKey, children, motion]);
  return <div className="pb-swap">{leaving.filter(x => x.key !== swapKey).map(x => <div key={x.key} className="pb-leaving" aria-hidden {...{ inert: '' }}>{x.node}</div>)}<div key={swapKey} className={motion && previous.current.rose ? 'pb-entering' : ''}>{children}</div></div>;
}
export const climbMs = (count: number, stagger = 120, delay = 0): number => delay + 760 + Math.max(0, count - 1) * stagger;
export function Scoreboard({ rows, climb, delay = 0 }: { rows: { player: { id: string; name: string; bot?: boolean }; score: number; place: number; delta?: number }[]; climb?: boolean; delay?: number }): React.JSX.Element {
  return <ol className="pb-scoreboard">{rows.map((r, i) => <li key={r.player.id} style={{ animationDelay: `${delay + (climb ? i * 120 : 0)}ms` } as CSSProperties}><span>{r.place}</span><Avatar player={r.player} size={40} /><strong>{r.player.name}</strong>{r.delta !== undefined ? <small>+{r.delta}</small> : null}<b>{r.score}</b></li>)}</ol>;
}
