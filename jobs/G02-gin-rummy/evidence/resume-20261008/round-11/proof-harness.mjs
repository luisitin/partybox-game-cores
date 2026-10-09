import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const sourcePaths=['play.html','src/core.ts','src/cards.ts','src/browser.ts','src/play.template.html'];
const profiles=[['desktop',1920,1080,1],['phone4x',390,844,4]];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceGuard=(report,sources)=>{
 assert.deepEqual(Object.keys(sources).sort(),[...sourcePaths].sort(),'source inventory');
 assert.equal(report.sourceUnchanged,true,'sources changed during proof');
 assert.deepEqual(report.sourceStart,sources,'accepted proof has stale source hashes');
 assert.deepEqual(report.sourceEnd,sources,'accepted proof end hashes differ');
 assert.equal(report.htmlSha256,sources['play.html'],'accepted HTML hash differs');
};

// Verifies the committed snapshot independently of a new browser run. Every
// interval is retained: a fresh file manifest alone cannot certify old proof.
export function verifyBrowserProof({report,raw,captures,sources,media}){
 sourceGuard(report,sources);sourceGuard(captures,sources);
 assert.equal(report.passed,true,'accepted browser run failed');assert.equal(report.failure,null);
 assert.equal(report.performanceWhileRecording,false,'recording is not frame proof');
 assert.equal(captures.performanceMeasurement,false,'capture is functional evidence');
 assert.equal(report.rows.length,2);assert.equal(captures.rows.length,2);
 for(const [i,[label,width,height,rate]] of profiles.entries()){
  const row=report.rows[i],samples=raw[label],clip=captures.rows[i];
  assert.equal(row.label,label);assert.deepEqual(row.viewport,{width,height});assert.equal(row.cpuThrottle,rate);
  assert.equal(row.frameGatePassed,true);assert.equal(row.networkRequests,0);assert.equal(row.pageErrors,0);
  assert.equal(row.interactionChecks,17);assert.equal(row.reducedMotion.matches,true);
  assert.equal(row.reducedMotion.transform,'none');assert.equal(row.reducedMotion.animation,'none');
  assert.equal(samples.frames.length,600,'all 600 frame intervals are required');
  assert(samples.frames.every(ms=>typeof ms==='number'&&Number.isFinite(ms)&&ms>0),'invalid raw interval');
  assert.deepEqual(row.frames,samples.frames,'report/raw frame intervals differ');
  const sorted=[...samples.frames].sort((a,b)=>a-b),mean=samples.frames.reduce((a,b)=>a+b,0)/600;
  const actual={meanMs:mean,p99Ms:sorted[Math.floor(599*.99)],maxMs:sorted[599],fps:1000/mean};
  for(const key of Object.keys(actual)){
   assert.equal(samples[key],actual[key],'raw '+key+' differs from every retained interval');
   assert.equal(row[key],actual[key],'report '+key+' differs from raw intervals');
  }
  assert(actual.fps>=59&&actual.p99Ms<=17,'committed raw frame gate failed');
  assert.deepEqual(clip.viewport,{width,height});assert.equal(clip.cpuThrottle,rate);
  assert.equal(clip.performanceMeasurement,false);assert.equal(clip.newMatchPrivateDomCleared,true);
  assert.equal(clip.actualElapsedTimeoutCoveredHand,true);assert.equal(clip.publicPassHistoryShown,true);
  assert.equal(clip.bytes,media[i].bytes);assert(clip.bytes>0&&clip.bytes<10*1024*1024);
  assert.equal(clip.sha256,media[i].sha256,'recording hash differs');
 }
 return {suite:'committed-browser-proof',sourceMatched:true,profiles:2,rawIntervals:1200,unfiltered:true,recordingsMatched:2};
}

export async function loadBrowserProof(indexPath='evidence/resume-20261008/current-proof.json'){
 const json=async path=>JSON.parse(await readFile(path,'utf8'));
 const index=await json(indexPath);assert.equal(index.version,1);
 const safe=path=>{assert(typeof path==='string'&&!path.startsWith('/')&&!path.split('/').includes('..'));return path;};
 const report=await json(safe(index.report)),captures=await json(safe(index.captures));
 const raw=Object.fromEntries(await Promise.all(profiles.map(async([label])=>[label,await json(safe(index.raw[label]))])));
 const sources=Object.fromEntries(await Promise.all(sourcePaths.map(async path=>[path,sha(await readFile(path))])));
 const media=await Promise.all(captures.rows.map(async row=>{assert(row.path.startsWith('media/'));const bytes=await readFile(safe(row.path));return {bytes:bytes.length,sha256:sha(bytes)};}));
 return {report,raw,captures,sources,media};
}

export async function checkBrowserProof(){return verifyBrowserProof(await loadBrowserProof());}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(await checkBrowserProof()));
