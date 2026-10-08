import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createReadStream} from 'node:fs';
import {resolve} from 'node:path';
import {z} from 'zod';
import {gameManifestSchema} from '../dist/contract.mjs';
import {game,tvView,controllerView,results} from '../dist/core.mjs';
import {scanPureSource} from './purity.mjs';
import {gameInputHashes} from './game-inputs.mjs';
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const hash=value=>createHash('sha256').update(value).digest('hex');
const hashFile=async path=>{const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes);return digest.digest('hex');};
for(const line of (await readFile('SHA256SUMS.txt','utf8')).trim().split('\n')){
  const match=/^([a-f0-9]{64})  (.+)$/.exec(line);assert(match,'Malformed checksum line');assert.equal(await hashFile(match[2]),match[1],match[2]);
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
const expectedSix=[];
for(let black=1;black<=5;black++)for(let white=1;white<=black;white++)if(black+white===6){
  for(let bk=0;bk<=black;bk++)for(let wk=0;wk<=white;wk++)if(black>white||bk>=wk)expectedSix.push('db6-'+(black-bk)+bk+(white-wk)+wk);
}
assert.deepEqual(six.files.map(file=>file.name).sort(),expectedSix.sort(),'All canonical six-piece source classes must be installed');
for(const file of six.files){
  assert.equal(file.originalFile,file.name+'.cpr1');assert.equal(file.index.file,file.name+'.idx');
  const digest=createHash('sha256');let size=0;
  for(let i=0;i<file.chunks.length;i++){
    const chunk=file.chunks[i];assert.equal(chunk.file,file.name+'.'+String(i).padStart(3,'0')+'.chunk');if(i<file.chunks.length-1)assert.equal(chunk.bytes,six.chunkBytes);
    const bytes=await readFile('data/international/six/'+chunk.file);assert.equal(bytes.length,chunk.bytes);assert.equal(hash(bytes),chunk.sha256);size+=bytes.length;digest.update(bytes);
  }
  assert.equal(size,file.bytes);assert.equal(digest.digest('hex'),file.sha256);
  const bytes=await readFile('data/international/six/'+file.index.file);assert.equal(bytes.length,file.index.bytes);assert.equal(hash(bytes),file.index.sha256);
}
for(const name of await readdir('src')){
  if(!name.endsWith('.ts')||name.endsWith('.d.ts')||['browser.ts','bot-worker.ts'].includes(name))continue;
  const source=await readFile('src/'+name,'utf8');
  assert.deepEqual(scanPureSource(source,name),[],'Forbidden nondeterministic or host operation: '+name);
}
const packageData=await json('package.json');assert.deepEqual(packageData.dependencies,{zod:'4.6.5'});
const htmlPath=resolve(process.env.G10_HTML_PATH??'play.html'),markers={script:false,motion:false,chinook:false,terms:false};let carry='';
for await(const bytes of createReadStream(htmlPath)){
  const html=carry+bytes.toString('utf8');
  assert(!/\b(?:src|href)\s*=\s*['"](?:https?:|\/\/)/i.test(html));assert(!html.includes('<!--G10_SCRIPT-->'));
  markers.script ||= /<script>/.test(html);markers.motion ||= html.includes('prefers-reduced-motion');markers.chinook ||= html.includes('Chinook');markers.terms ||= html.includes('prohibited');carry=html.slice(-1024);
}
assert(Object.values(markers).every(Boolean));const htmlSha256=await hashFile(htmlPath);
if(!process.argv.includes('--sources')){
  const checksDirectory=resolve(process.env.G10_EVIDENCE_DIR??'evidence/checks'),browserDirectory=resolve(process.env.G10_BROWSER_DIR??'evidence/browser'),mediaDirectory=resolve(process.env.G10_MEDIA_DIR??'media');
  const matrix=await json(checksDirectory+'/matrix.json');assert.equal(matrix.games,7000);assert(matrix.reports.every(row=>row.games===1000&&row.playerCount===2));
  const mutations=await json(checksDirectory+'/mutations.json');assert.equal(mutations.total,25);assert(mutations.assertionKilled>=24);
  const league=await json(checksDirectory+'/league.json');assert.equal(league.totalGames,4000);assert.equal(league.gamesPerComparison,2000);
  assert.equal(league.botSourceSha256,hash(await readFile('src/bots.ts')));assert(league.comparisons.every(row=>row.games===1000&&row.scoreShare>.55&&row.decisiveWilson95[0]>.5));
  assert.deepEqual(league.gameInputHashes,await gameInputHashes(),'League evidence must match every current pure game/data input');
  const browser=await json(browserDirectory+'/checks.json');assert.equal(browser.sourceSha256,htmlSha256);assert.equal(browser.totalChecks,30);assert(browser.checks.every(row=>row.pass));
  const capture=await json(browserDirectory+'/capture.json');assert.equal(capture.sourceSha256,browser.sourceSha256);assert.equal(capture.totalChecks,30);
  assert.deepEqual(browser.frameVariants,['american','international']);assert.equal(browser.capture,false);assert.equal(browser.functionalOnly,false);
  assert.deepEqual(browser.profiles.map(profile=>profile.name),['desktop','phone']);
  for(const name of ['desktop','phone']){
    const profile=browser.profiles.find(profile=>profile.name===name);
    assert.deepEqual(profile.frameResults.map(result=>result.variant),['american','international']);
    for(const variant of ['american','international']){
      const raw=await json(browserDirectory+'/'+name+'-'+variant+'-frames.json');
      assert.equal(raw.sourceSha256,browser.sourceSha256);assert.equal(raw.name,name);assert.equal(raw.variant,variant);
      assert.equal(raw.width,name==='desktop'?1920:390);assert.equal(raw.height,name==='desktop'?1080:844);assert.equal(raw.throttle,name==='desktop'?1:4);
      assert.equal(raw.frames.length,600);assert(raw.frames.every(value=>Number.isFinite(value)&&value>0));assert.equal(raw.capturing,false);
      const sorted=[...raw.frames].sort((a,b)=>a-b),mean=raw.frames.reduce((sum,value)=>sum+value,0)/600,p99=sorted[Math.ceil(.99*600)-1],fps=1000/mean;
      for(const [reported,actual] of [[raw.meanMs,mean],[raw.meanFps,fps],[raw.p99Ms,p99]])assert(Number.isFinite(reported)&&Math.abs(reported-actual)<1e-8);
      assert(fps>=59&&p99<=17,JSON.stringify({name,variant,fps,p99}));
      assert.deepEqual(profile.frameResults.find(result=>result.variant===variant),{variant,frames:600,meanFps:fps,p99Ms:p99});
    }
    assert((await stat(mediaDirectory+'/'+name+'.webm')).size<10*1024*1024);
  }
}
process.stdout.write('PASS: checksums, authoritative schemas/manifest, pure core source, fixed corpus provenance, original offline page'+(process.argv.includes('--sources')?' (delivery execution gates explicitly excluded).':', required simulations/mutations/leagues and source-matched browser/media proof.')+'\n');
