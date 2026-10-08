import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {z} from 'zod';
import {gameManifestSchema} from '../dist/contract.mjs';
import {game,tvView,controllerView,results} from '../dist/core.mjs';
import {scanPureSource} from './purity.mjs';
import {gameInputHashes} from './game-inputs.mjs';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
for(const line of (await readFile('SHA256SUMS.txt','utf8')).trim().split('\n')){
  const match=/^([a-f0-9]{64})  (.+)$/.exec(line);assert(match,'Malformed checksum line');assert.equal(hash(await readFile(match[2])),match[1],match[2]);
}
const manifest=await json('manifest.json');assert(gameManifestSchema.safeParse(manifest).success);assert.deepEqual(manifest,game.manifest);
assert((await readFile('README.md','utf8')).split('\n').length<60);
for(const phase of game.phases){
  const state=await json('fixtures/'+phase+'.json');assert(z.fromJSONSchema(await json('fixtures/schema.json')).safeParse(state).success);
  assert.deepEqual(await json('fixtures/'+phase+'.views.json'),{tv:tvView(state),controllers:state.order.map(id=>controllerView(state,id)),results:results(state)});
}
assert(z.fromJSONSchema(await json('data/schema.json')).safeParse(await json('data/endgames.json')).success);
const corpus=await json('data/chinook/manifest.json');assert(z.fromJSONSchema(await json('data/chinook/schema.json')).safeParse(corpus).success);
for(const [member,path] of [['DB6','data/chinook/DB6.bin'],['DB6.idx','data/chinook/DB6.idx'],['DB6.zip','data/chinook/DB6.zip']]){
  const bytes=await readFile(path);assert.equal(bytes.length,corpus.files[member].bytes);assert.equal(hash(bytes),corpus.files[member].sha256);
}
const international=await json('data/international/manifest.json');assert(z.fromJSONSchema(await json('data/international/schema.json')).safeParse(international).success);
assert(z.fromJSONSchema(await json('data/international/dictionary-schema.json')).safeParse(await json('data/international/dictionary-manifest.json')).success);
for(const [name,metadata] of Object.entries(international.files)){const bytes=await readFile('data/international/'+name);assert.equal(bytes.length,metadata.bytes);assert.equal(hash(bytes),metadata.sha256);}
const six=await json('data/international/six/manifest.json');
assert(z.fromJSONSchema(await json('data/international/six/schema.json')).safeParse(six).success);
assert.equal(six.files.length,37);assert.equal(new Set(six.files.map(file=>file.name)).size,37);
for(const file of six.files){
  const digest=createHash('sha256');let size=0;
  for(const chunk of file.chunks){const bytes=await readFile('data/international/six/'+chunk.file);assert.equal(bytes.length,chunk.bytes);assert.equal(hash(bytes),chunk.sha256);size+=bytes.length;digest.update(bytes);}
  assert.equal(size,file.bytes);assert.equal(digest.digest('hex'),file.sha256);
  const bytes=await readFile('data/international/six/'+file.index.file);assert.equal(bytes.length,file.index.bytes);assert.equal(hash(bytes),file.index.sha256);
}
for(const name of await readdir('src')){
  if(!name.endsWith('.ts')||name.endsWith('.d.ts')||['browser.ts','bot-worker.ts'].includes(name))continue;
  const source=await readFile('src/'+name,'utf8');
  assert.deepEqual(scanPureSource(source,name),[],'Forbidden nondeterministic or host operation: '+name);
}
const packageData=await json('package.json');assert.deepEqual(packageData.dependencies,{zod:'4.6.5'});
const html=await readFile('play.html','utf8');assert(/<script>/.test(html));assert(!/\b(?:src|href)\s*=\s*['"](?:https?:|\/\/)/i.test(html));assert(!html.includes('<!--G10_SCRIPT-->'));
assert(html.includes('prefers-reduced-motion'));assert(html.includes('Chinook'));assert(html.includes('prohibited'));
if(!process.argv.includes('--sources')){
  const checksDirectory=resolve(process.env.G10_EVIDENCE_DIR??'evidence/checks'),browserDirectory=resolve(process.env.G10_BROWSER_DIR??'evidence/browser'),mediaDirectory=resolve(process.env.G10_MEDIA_DIR??'media');
  const matrix=await json(checksDirectory+'/matrix.json');assert.equal(matrix.games,7000);assert(matrix.reports.every(row=>row.games===1000&&row.playerCount===2));
  const mutations=await json(checksDirectory+'/mutations.json');assert.equal(mutations.total,25);assert(mutations.assertionKilled>=24);
  const league=await json(checksDirectory+'/league.json');assert.equal(league.totalGames,4000);assert.equal(league.gamesPerComparison,2000);
  assert.equal(league.botSourceSha256,hash(await readFile('src/bots.ts')));assert(league.comparisons.every(row=>row.games===1000&&row.scoreShare>.55&&row.decisiveWilson95[0]>.5));
  assert.deepEqual(league.gameInputHashes,await gameInputHashes(),'League evidence must match every current pure game/data input');
  const browser=await json(browserDirectory+'/checks.json');assert.equal(browser.sourceSha256,hash(html));assert.equal(browser.totalChecks,28);assert(browser.checks.every(row=>row.pass));
  const capture=await json(browserDirectory+'/capture.json');assert.equal(capture.sourceSha256,browser.sourceSha256);assert.equal(capture.totalChecks,28);
  for(const name of ['desktop','phone']){
    const frames=await json(browserDirectory+'/'+name+'-frames.json');assert.equal(frames.sourceSha256,browser.sourceSha256);assert.equal(frames.frames.length,600);assert.equal(frames.capturing,false);assert(frames.meanFps>=59&&frames.p99Ms<=17);
    assert((await stat(mediaDirectory+'/'+name+'.webm')).size<10*1024*1024);
  }
}
process.stdout.write('PASS: checksums, authoritative schemas/manifest, pure core source, fixed corpus provenance, original offline page'+(process.argv.includes('--sources')?' (delivery execution gates explicitly excluded).':', required simulations/mutations/leagues and source-matched browser/media proof.')+'\n');
