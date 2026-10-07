// Renders stills of each film at given times: node stills.mjs <film> t1 t2 ...
// Env: SIZE=WxH, FILM=<window.pbFilm json> (stress inputs), OUT=<dir> (default shots/), TAG=<file-name tag>.
import { chromium } from 'playwright';
const [film, ...ts] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const [vw, vh] = (process.env.SIZE ?? '960x540').split('x').map(Number); // SIZE=390x844 for a phone held upright
const page = await browser.newPage({ viewport: { width: vw, height: vh } });
const errs = []; page.on('pageerror', (e) => errs.push(String(e)));
if (process.env.FILM) await page.addInitScript((j) => { window.pbFilm = JSON.parse(j); }, process.env.FILM);
const out = process.env.OUT ?? '/home/claude/pb/shots';
for (const t of ts) {
  await page.goto(`file:///home/claude/pb/cine/shake-up/dist/shake-up-${film}.html?t=${t}`);
  await page.waitForSelector('body[data-ready="1"]', { timeout: 30000 }).catch(() => errs.push('not ready at ' + t));
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/film-${film}${process.env.TAG ? '-' + process.env.TAG : ''}-${t}${process.env.SIZE ? '-' + process.env.SIZE : ''}.png` });
}
console.log(errs.join('\n') || 'ok');
await browser.close();
