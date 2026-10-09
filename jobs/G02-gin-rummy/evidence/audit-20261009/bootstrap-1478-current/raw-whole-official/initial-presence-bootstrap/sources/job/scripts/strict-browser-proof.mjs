import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {browserSourcePaths,browserSourceHashes,sha256} from './browser-source-guard.mjs';

export function frameStatistics(frames){
 assert.equal(frames.length,600,'all600 consecutive intervals are required');
 assert(frames.every(ms=>typeof ms==='number'&&Number.isFinite(ms)&&ms>0),'invalid interval');
 const sorted=[...frames].sort((a,b)=>a-b),mean=frames.reduce((a,b)=>a+b,0)/frames.length;
 return {meanMs:mean,p99Ms:sorted[Math.floor(599*.99)],maxMs:sorted[599],fps:1000/mean};
}
const guard=(actual,expected)=>{
 assert.deepEqual(Object.keys(actual).sort(),[...browserSourcePaths].sort(),'complete guarded inventory');
 assert.deepEqual(actual,expected,'current guarded source differs');
};
export function verifyActiveHand(witness){
 assert.equal(witness.phase,'draw');assert.equal(witness.cardCount,10);
 assert.equal(witness.tableVisible,true);assert.equal(witness.setupHidden,true);
 assert.equal(witness.privateVisible,true);assert.equal(witness.handoffHidden,true);
 assert.equal(witness.pauseButton,'Pause');assert.equal(witness.clockHidden,true);
 assert.equal(witness.turnSeconds,0,'default turn clock must remain off');
 assert.equal(witness.drawStockEnabled,true);assert.equal(witness.drawDiscardEnabled,true);
 assert(Number.isFinite(witness.nativeNowMs)&&witness.nativeNowMs>=0,'real native time witness');
}
export function verifyStrictBrowserProof({report,raw,sources,captures,media}){
 guard(report.sourceStart,sources);guard(report.sourceEnd,sources);
 assert.equal(report.sourceUnchanged,true);assert.equal(report.passed,true);assert.equal(report.failure,null);
 assert.equal(report.htmlSha256,sources['play.html']);assert.equal(report.performanceWhileRecording,false);
 assert.equal(report.rows.length,2);assert.equal(report.physicalPhoneTested,false);
 for(const [i,[label,width,height,rate]] of [['desktop',1920,1080,1],['phone4x',390,844,4]].entries()){
  const row=report.rows[i],sample=raw[label];assert.equal(row.label,label);assert.equal(sample.profile,label);
  assert.deepEqual(row.viewport,{width,height});assert.deepEqual(sample.viewport,row.viewport);
  assert.equal(row.cpuThrottle,rate);assert.equal(sample.cpuThrottle,rate);
  assert.equal(sample.sourceSha256,sources['play.html']);assert.equal(sample.runId,report.runId);
  guard(sample.sourceStart,sources);guard(sample.sourceAfterSample,sources);
  assert.equal(row.sourceSha256,sample.sourceSha256);assert.equal(row.attemptNonce,sample.attemptNonce);
  assert.match(sample.attemptNonce,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
  assert.equal(sample.transport,'file:');assert.equal(sample.rawFiltering,'none');
  assert.equal(sample.performanceWhileRecording,false);
  assert.deepEqual(sample.nativeClock,{requestAnimationFrame:true,performanceNow:true});
  assert.equal(sample.timestamps.length,601);assert.equal(sample.witnesses.length,601);
  assert(sample.timestamps.every(x=>typeof x==='number'&&Number.isFinite(x)&&x>=0));
  for(let j=0;j<600;j++)assert.equal(sample.frames[j],sample.timestamps[j+1]-sample.timestamps[j],'native consecutive interval');
  for(const witness of [sample.beforeGrant,sample.afterGrant,...sample.witnesses,sample.afterSample])verifyActiveHand(witness);
  for(let j=1;j<sample.witnesses.length;j++)assert(sample.witnesses[j].nativeNowMs>=sample.witnesses[j-1].nativeNowMs,'native witness time order');
  assert.deepEqual(row.frames,sample.frames);const stats=frameStatistics(sample.frames);
  for(const key of Object.keys(stats)){assert.equal(row[key],stats[key]);assert.equal(sample[key],stats[key]);}
  assert(stats.fps>=59&&stats.p99Ms<=17,'strict raw frame gate');
  assert.equal(row.frameGatePassed,true);assert.equal(row.networkRequests,0);assert.equal(row.pageErrors,0);
  assert.equal(row.interactionChecks,17);assert.equal(row.reducedMotion.matches,true);
  assert.equal(row.reducedMotion.transform,'none');assert.equal(row.reducedMotion.animation,'none');
  assert.equal(row.frameWindow.profile,label);assert.equal(row.frameWindow.sourceSha256,sample.sourceSha256);
  assert.equal(row.frameWindow.attemptNonce,sample.attemptNonce);assert.equal(row.frameWindow.status,'samples-written');
  assert.equal(row.frameWindow.rawIntervals,600);
  assert(['root-granted','uncoordinated'].includes(row.frameWindow.coordination));
  if(row.frameWindow.coordination==='root-granted'){
   assert(Number.isFinite(Date.parse(row.frameWindow.readyUtc)));
   assert(Date.parse(row.frameWindow.grantUtc)>=Date.parse(row.frameWindow.readyUtc));
   assert(Date.parse(row.frameWindow.utc)>=Date.parse(row.frameWindow.grantUtc));
  }
 }
 assert.notEqual(raw.desktop.attemptNonce,raw.phone4x.attemptNonce,'each profile needs a distinct attempt');
 if(captures){
  guard(captures.sourceStart,sources);guard(captures.sourceEnd,sources);assert.equal(captures.sourceUnchanged,true);
  assert.equal(captures.htmlSha256,sources['play.html']);assert.equal(captures.performanceMeasurement,false);
  assert.equal(captures.rows.length,2);assert.equal(media.length,2);
  for(const [i,row] of captures.rows.entries()){
   assert.equal(row.path.endsWith(i===0?'-desktop.webm':'-phone4x.webm'),true);
   assert.equal(row.bytes,media[i].bytes);assert(row.bytes>0&&row.bytes<10*1024*1024);
   assert.equal(row.sha256,media[i].sha256);assert.equal(row.performanceMeasurement,false);
   assert.equal(row.cpuThrottle,i===0?1:4);assert.deepEqual(row.viewport,i===0?{width:1920,height:1080}:{width:390,height:844});
   assert.equal(row.newMatchPrivateDomCleared,true);assert.equal(row.actualElapsedTimeoutCoveredHand,true);
   assert.equal(row.publicPassHistoryShown,true);assert.equal(row.networkRequests,0);assert.equal(row.pageErrors,0);
  }
 }
 return {suite:'strict-current-browser-proof',guardedSources:browserSourcePaths.length,profiles:2,rawIntervals:1200,nativeTimestamps:1202,activeHandWitnesses:1208,unfiltered:true,recordingsMatched:captures?2:0};
}
const safe=path=>{assert(typeof path==='string'&&!path.startsWith('/')&&!path.split('/').includes('..'));return path;};
export async function loadStrictBrowserProof(indexPath='evidence/reverify-1900/current-proof.json'){
 const json=async path=>JSON.parse(await readFile(safe(path),'utf8')),index=await json(indexPath);
 assert.equal(index.version,2);const report=await json(index.report),captures=await json(index.captures);
 const raw=Object.fromEntries(await Promise.all(['desktop','phone4x'].map(async label=>[label,await json(index.raw[label])])));
 const sources=await browserSourceHashes();
 const media=await Promise.all(captures.rows.map(async row=>{assert(row.path.startsWith('media/'));const bytes=await readFile(safe(row.path));return {bytes:bytes.length,sha256:sha256(bytes)};}));
 return {report,raw,sources,captures,media};
}
export async function checkStrictBrowserProof(){return verifyStrictBrowserProof(await loadStrictBrowserProof());}
export async function loadLiveStrictBrowserProof(){
 const json=async path=>JSON.parse(await readFile(safe(path),'utf8'));
 const report=await json('.work/browser/report.json'),captures=await json('.work/browser/captures.json');
 const raw=Object.fromEntries(await Promise.all(['desktop','phone4x'].map(async label=>[label,await json(`.work/browser/${label}-frames.json`)])));
 const sources=await browserSourceHashes();
 const media=await Promise.all(captures.rows.map(async row=>{assert(row.path.startsWith('.work/browser/'));const bytes=await readFile(safe(row.path));return {bytes:bytes.length,sha256:sha256(bytes)};}));
 return {report,raw,sources,captures,media};
}
export async function checkLiveStrictBrowserProof(){return verifyStrictBrowserProof(await loadLiveStrictBrowserProof());}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)console.log(JSON.stringify(process.argv.includes('--live')?await checkLiveStrictBrowserProof():await checkStrictBrowserProof()));
