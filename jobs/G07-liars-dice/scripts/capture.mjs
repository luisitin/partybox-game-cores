import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {access, mkdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';

// Encoding runs separately from browser-check.mjs: its overhead must not be
// confused with the strict unrecorded requestAnimationFrame measurements.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = resolve(root, 'play.html');
const tag = process.argv[2] ?? 'milestone';
assert(/^[a-z0-9-]+$/.test(tag), 'capture tag must contain only lowercase letters, digits and hyphens');
const evidence = resolve(root, 'evidence/browser');
const temporary = resolve(root, '.work/capture-temp');
await mkdir(temporary, {recursive: true});
await mkdir(resolve(root, 'media'), {recursive: true});
async function executablePath() {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH;
  try { await access(chromium.executablePath(), constants.X_OK); return undefined; }
  catch { await access('/usr/bin/chromium', constants.X_OK); return '/usr/bin/chromium'; }
}
const browser = await chromium.launch({headless: true, executablePath: await executablePath(), args: ['--no-sandbox']});
const captures = [];
let failure = null;
try {
  for (const [label, width, height, rate] of [['desktop', 1920, 1080, 1], ['phone4x', 390, 844, 4]]) {
    const scale = Math.min(1, 1280 / width);
    const videoSize = {width: Math.round(width * scale), height: Math.round(height * scale)};
    const context = await browser.newContext({viewport: {width, height}, offline: true,
      recordVideo: {dir: temporary, size: videoSize}});
    const page = await context.newPage();
    const errors = [], network = [];
    page.on('pageerror', error => errors.push(String(error)));
    page.on('request', request => { if (/^(https?|wss?):/i.test(request.url())) network.push(request.url()); });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', {rate});
    await page.goto(pathToFileURL(html).href);
    await page.waitForFunction(() => Boolean(window.__G07));
    await page.locator('#player-count').selectOption('2');
    await page.locator('#setting-turnSeconds').fill('12');
    await page.locator('#start').click();
    const initial = await page.evaluate(() => window.__G07.state());
    // Fixed seed for reproducible capture; no state, cup or dice edits. Every
    // bid, challenge, pause and continue below goes through ordinary controls.
    await page.evaluate(() => window.__G07.init({players: 2, mode: 'hotseat', seed: 7199, settings: {turnSeconds: 12}}));
    await page.waitForTimeout(400);
    await page.locator('#show-cup').click();
    await page.waitForTimeout(600);
    await page.locator('#pause').click();
    await page.waitForTimeout(350);
    await page.locator('#resume').click();
    await page.waitForTimeout(250);
    let rounds = 0;
    while ((await page.evaluate(() => window.__G07.state().phase.id)) !== 'done') {
      assert(rounds < 12, 'two-player dudo-only demonstration must terminate');
      if ((await page.evaluate(() => window.__G07.state().phase.id)) === 'reveal') {
        await page.locator('#next-round').click();
        continue;
      }
      await page.locator('#show-cup').click();
      const view = await page.evaluate(() => window.__G07.view());
      const quantity = rounds === 0 ? 2 : view.totalDice;
      await page.locator('#bid-quantity').selectOption(String(quantity));
      await page.locator('#bid-face').selectOption('6');
      await page.waitForTimeout(rounds === 0 ? 600 : 200);
      await page.locator('#make-bid').click();
      await page.waitForTimeout(rounds === 0 ? 450 : 150);
      assert.equal(await page.locator('#cup .die').count(), 0);
      await page.locator('#show-cup').click();
      await page.waitForTimeout(rounds === 0 ? 450 : 150);
      await page.locator('#dudo').click();
      assert.equal(await page.locator('#cup .die').count(), 0);
      await page.waitForTimeout(rounds === 0 ? 1000 : 300);
      rounds++;
    }
    await page.waitForTimeout(900);
    await page.screenshot({path: resolve(evidence, `${tag}-${label}-winner.png`), fullPage: true});
    const final = await page.evaluate(() => window.__G07.state());
    assert(final.winner);
    assert.deepEqual(errors, []);
    assert.deepEqual(network, []);
    const video = page.video();
    await context.close();
    const path = resolve(root, 'media', `${tag}-${label}.webm`);
    await video.saveAs(path);
    const bytes = (await stat(path)).size;
    assert(bytes < 10_000_000, `${path} exceeds the 10MB capture budget`);
    const capture = {path: `media/${tag}-${label}.webm`, bytes, viewport: {width, height}, videoSize, cpuThrottle: rate,
      seed: 7199, rounds, winner: final.winner, initialRoster: initial.order.length,
      recordingMeasuresPerformance: false, networkRequests: network.length, pageErrors: errors.length};
    captures.push(capture);
    console.log(JSON.stringify(capture));
  }
} catch (error) {
  failure = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  await browser.close();
  await rm(temporary, {recursive: true, force: true});
  await writeFile(resolve(evidence, `${tag}-captures.json`), JSON.stringify({browser: browser.version(),
    htmlSha256: createHash('sha256').update(await readFile(html)).digest('hex'),
    passed: failure === null && captures.length === 2, failure, captures}, null, 2) + '\n');
}
