// Frame-accurate filmstrips of a film: Playwright's fake clock drives
// performance.now and requestAnimationFrame, so frame k is exactly k/fps
// seconds in, however slow the software renderer is. Writes PNGs and ffmpeg
// contact sheets (6 x 6) for checking motion frame by frame.
// Usage: node frames.mjs <opening|outro> <from s> <to s> [fps] [out dir] [WxH]
// FILM='{"names":[...],"final":{...},"lang":"es"}' sets window.pbFilm (the shell's input) for stress cases.
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';

const [film, from, to, fps = '30', out = `/home/claude/pb/shots/frames-${process.argv[2]}`, size = '960x540'] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: w, height: h } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
if (process.env.FILM) await page.addInitScript((j) => { window.pbFilm = JSON.parse(j); }, process.env.FILM);
await page.clock.install({ time: new Date('2026-10-05T20:00:00Z') });
await page.clock.pauseAt(new Date('2026-10-05T20:00:01Z'));
await page.goto(`file:///home/claude/pb/cine/shake-up/dist/shake-up-${film}.html`);
for (let k = 0; k < 100 && !(await page.evaluate(() => document.body.dataset.ready === '1')); k++) await page.clock.runFor(100);
const step = 1000 / Number(fps);
await page.clock.fastForward(Math.max(0, Number(from) * 1000 - step)); // a film is seekable: jump there, don't render every frame on the way
await page.clock.runFor(step);
const n = Math.round(((Number(to) - Number(from)) * 1000) / step);
for (let i = 0; i <= n; i++) {
  await page.screenshot({ path: `${out}/f${String(i).padStart(3, '0')}.png` });
  await page.clock.runFor(step);
}
await browser.close();
for (let s = 0; s * 36 <= n; s++) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-start_number', String(s * 36), '-i', `${out}/f%03d.png`, '-frames:v', '1', '-vf', `scale=${w > h ? 320 : 180}:-1,drawtext=text='%{frame_num}':start_number=${s * 36}:x=4:y=4:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.6,tile=6x6`, `${out}/sheet-${s}.png`]);
}
console.log(`${n + 1} frames → ${out}`, errors.length ? errors.slice(0, 5).join('\n') : 'no page errors');
