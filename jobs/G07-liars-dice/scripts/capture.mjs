import assert from 'node:assert/strict';
import {constants} from 'node:fs';
import {access, mkdir, readFile, rm, stat, writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname, resolve} from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {game} from '../dist/core.mjs';

// Encoding runs separately from browser-check.mjs: its overhead must not be
// confused with the strict unrecorded requestAnimationFrame measurements.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const html = resolve(root, 'play.html');
const paceDemo = process.argv.includes('--pace-demo');
const standingsDemo = process.argv.includes('--standings-demo') || process.argv.includes('round-4');
const recoveryDemo = process.argv.includes('--recovery-demo') || process.argv.includes('round-3');
const saveKey = 'partybox.g07.session.v1';
const htmlSha256 = createHash('sha256').update(await readFile(html)).digest('hex');
const tag = process.argv.slice(2).find(value => !value.startsWith('--')) ?? (paceDemo ? 'round-1' : 'milestone');
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
    let recovery = null;
    if (recoveryDemo) {
      // A real reload keeps the checkpoint in this exact browser tab. No
      // initialization script clears storage in the recovery demonstration.
      await page.evaluate(() => window.__G07.init({players: 3, mode: 'hotseat', pace: 'manual', seed: 17,
        settings: {turnSeconds: 12}}));
      await page.locator('#show-cup').click();
      const before = await page.evaluate(() => window.__G07.state());
      await page.waitForTimeout(650);
      await page.reload(); await page.waitForFunction(() => Boolean(window.__G07));
      assert.equal(await page.evaluate(() => window.__G07.state()), null);
      assert(await page.locator('#recovery').isVisible());
      assert.equal(await page.locator('#cup .die').count(), 0);
      await page.waitForTimeout(750);
      await page.screenshot({path: resolve(evidence, `${tag}-${label}-resume-gate.png`), fullPage: true});
      await page.locator('#resume-saved').click();
      const resumed = await page.evaluate(() => window.__G07.state());
      assert.deepEqual(resumed.cups, before.cups); assert.deepEqual(resumed.rng, before.rng);
      assert.equal(resumed.turn, before.turn); assert.equal(await page.locator('#cup .die').count(), 0);
      await page.waitForTimeout(650); await page.locator('#show-cup').click(); await page.waitForTimeout(500);
      await page.reload(); await page.waitForFunction(() => Boolean(window.__G07));
      assert(await page.locator('#recovery').isVisible()); await page.waitForTimeout(500);
      await page.locator('#discard-saved').click();
      assert.equal(await page.evaluate(key => sessionStorage.getItem(key), saveKey), null);
      await page.locator('#start').click(); await page.waitForTimeout(300); await page.locator('#new-game').click();
      assert.equal(await page.evaluate(key => sessionStorage.getItem(key), saveKey), null);
      recovery = {actualReloads: 2, pendingStateNull: true, coveredOnResume: true,
        cupsAndRngPreserved: true, discardRemovedCheckpoint: true, newGameRemovedCheckpoint: true};
    }
    let pacingDemo = null;
    if (paceDemo) {
      // Only initialization is seeded. Bot moves below come from the actual
      // normal scheduler and ordinary manual-step/human controls.
      await page.evaluate(() => window.__G07.init({players: 3, mode: 'bots', pace: 'normal', seed: 17,
        settings: {turnSeconds: 0, calzaEnabled: false}}));
      let before = await page.evaluate(() => ({at: window.__G07.time(), state: window.__G07.state()}));
      if (!before.state.players[before.state.turn].bot) {
        await page.locator('#show-cup').click();
        const bid = await page.evaluate(() => window.__G07.controller().legalBids[0]);
        await page.locator('#bid-quantity').selectOption(String(bid.quantity));
        await page.locator('#bid-face').selectOption(String(bid.face));
        await page.locator('#make-bid').click();
        before = await page.evaluate(() => ({at: window.__G07.time(), state: window.__G07.state()}));
      }
      await page.waitForFunction(turn => window.__G07.state().turn !== turn || window.__G07.state().phase.id !== 'bid', before.state.turn, {timeout: 4000});
      const normalActionMs = (await page.evaluate(() => window.__G07.time())) - before.at;
      let active = await page.evaluate(() => window.__G07.state());
      if (active.phase.id === 'reveal') { await page.locator('#next-round').click(); active = await page.evaluate(() => window.__G07.state()); }
      if (!active.players[active.turn].bot) {
        await page.locator('#show-cup').click();
        const bid = await page.evaluate(() => window.__G07.controller().legalBids[0]);
        await page.locator('#bid-quantity').selectOption(String(bid.quantity));
        await page.locator('#bid-face').selectOption(String(bid.face));
        await page.locator('#make-bid').click();
      }
      await page.locator('#bot-pace').selectOption('manual');
      const manual = await page.evaluate(() => ({at: window.__G07.time(), state: window.__G07.state()}));
      await page.waitForTimeout(2250);
      const held = await page.evaluate(() => window.__G07.state());
      assert.equal(held.turn, manual.state.turn); assert.deepEqual(held.bid, manual.state.bid);
      assert(await page.locator('#bot-step').isVisible());
      await page.locator('#bot-step').click();
      const stepped = await page.evaluate(() => window.__G07.state());
      const signature = state => JSON.stringify({phase: state.phase.id, turn: state.turn, bid: state.bid, round: state.round});
      assert.notEqual(signature(stepped), signature(held), 'manual step must execute an actual bot action');
      pacingDemo = {seed: 17, normalPace: 'normal', normalActionMs, manualHeldMs: (await page.evaluate(() => window.__G07.time())) - manual.at,
        manualStepTurn: manual.state.turn, normalActionsInjected: false};
      await page.waitForTimeout(450);
      await page.locator('#new-game').click();
      await page.locator('#mode').selectOption('hotseat');
      await page.locator('#bot-pace-setup').selectOption('normal');
    }
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
    if (standingsDemo) await page.locator('#standings').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    await page.screenshot({path: resolve(evidence, `${tag}-${label}-winner.png`), fullPage: true});
    const final = await page.evaluate(() => window.__G07.state());
    assert(final.winner);
    let standings = null;
    if (standingsDemo) {
      const natural = game.results(final);
      const displayed = await page.locator('#standings-body tr').evaluateAll(rows => rows.map(row => ({playerId: row.dataset.playerId,
        rank: Number(row.querySelector('.standing-rank').textContent), name: row.querySelector('.standing-name').textContent,
        dice: Number(row.querySelector('.standing-dice').textContent), status: row.querySelector('.standing-status').textContent})));
      assert.deepEqual(displayed.map(row => ({playerId:row.playerId,rank:row.rank})), natural.ranking.map(row => ({playerId:row.playerId,rank:row.rank})));
      await page.locator('#new-game').click();
      await page.locator('#player-count').selectOption('8');
      const names = ['<literal player>', 'L'.repeat(40), 'Player three', 'Player four', 'Player five', 'Player six', 'Player seven', 'Player eight'];
      for (const [index, name] of names.entries()) await page.locator(`#name-${index}`).fill(name);
      await page.locator('#start').click();
      // This short prepared live position illustrates host-end competition
      // places; the transition itself uses the ordinary End game button.
      await page.evaluate(() => {
        const h = window.__G07, s = h.state(), counts = [5,5,4,3,3,1,0,0];
        for (const [index,id] of s.order.entries()) { s.diceCount[id] = counts[index]; s.cups[id] = Array(counts[index]).fill(3); }
        s.turn = 'p0'; s.nextStarter = 'p0'; s.eliminated = ['p7','p6'];
        s.bid = null; s.bidLog = []; s.reveal = null; s.palifico = false; s.palificoStarter = null; s.nextPalifico = null;
        h.setState(s);
      });
      await page.locator('#show-cup').click(); await page.waitForTimeout(400); await page.locator('#end-game').click();
      const early = await page.evaluate(() => window.__G07.state()), expected = game.results(early);
      assert.equal(early.endReason, 'vip-end'); assert.deepEqual(expected.winnerIds, ['p0','p1']);
      const earlyRows = await page.locator('#standings-body tr').evaluateAll(rows => rows.map(row => ({playerId:row.dataset.playerId,
        rank:Number(row.querySelector('.standing-rank').textContent),dice:Number(row.querySelector('.standing-dice').textContent),status:row.querySelector('.standing-status').textContent})));
      assert.equal(earlyRows.length,8);assert.equal(earlyRows.filter(row=>row.status==='Tied winner').length,2);
      assert.deepEqual(earlyRows.map(row=>row.rank),expected.ranking.map(row=>row.rank));
      await page.locator('#result').scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
      await page.locator('#standings-body tr:last-child').scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
      await page.screenshot({path:resolve(evidence,`${tag}-${label}-tied-standings.png`),fullPage:true});
      standings = {naturalResults:natural,naturalRows:displayed,earlyFixturePrepared:true,actualEndButton:true,earlyResults:expected,earlyRows};
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(network, []);
    const video = page.video();
    await context.close();
    const path = resolve(root, 'media', `${tag}-${label}.webm`);
    await video.saveAs(path);
    const bytes = (await stat(path)).size;
    assert(bytes < 10_000_000, `${path} exceeds the 10MB capture budget`);
    const capture = {path: `media/${tag}-${label}.webm`, bytes, sha256: createHash('sha256').update(await readFile(path)).digest('hex'), viewport: {width, height}, videoSize, cpuThrottle: rate,
      seed: 7199, rounds, winner: final.winner, initialRoster: initial.order.length,
      recordingMeasuresPerformance: false, pacingDemo, recoveryDemo: recovery, standingsDemo: standings, networkRequests: network.length, pageErrors: errors.length};
    captures.push(capture);
    console.log(JSON.stringify(capture));
  }
} catch (error) {
  failure = error instanceof Error ? error.stack : String(error);
  throw error;
} finally {
  await browser.close();
  await rm(temporary, {recursive: true, force: true});
  const finalHtmlSha256 = createHash('sha256').update(await readFile(html)).digest('hex');
  if (finalHtmlSha256 !== htmlSha256 && failure === null) { failure = 'HTML source changed during capture'; process.exitCode = 1; }
  await writeFile(resolve(evidence, `${tag}-captures.json`), JSON.stringify({browser: browser.version(),
    htmlSha256, finalHtmlSha256, sourceUnchanged: finalHtmlSha256 === htmlSha256,
    passed: failure === null && captures.length === 2, failure, captures}, null, 2) + '\n');
}
