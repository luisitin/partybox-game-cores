import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {strictSourceHashes,strictRuntimeIdentity,sha256,type Hashes} from './strict-source-guard.ts';
import {decodeCurrentCapture} from './strict-decode.ts';

export type Witness={nativeNowMs:number;wallUtcMs:number;phase:string|null;setupHidden:boolean;matchHidden:boolean;pauseButton:string;privateOpen:string|null;inputCount:number;fakeValue:string|null;fakeDisabled:boolean;countdown:string|null;controllerCountdown:string|null;question:string;received:number};
export type Stats={meanMs:number;fps:number;p95Ms:number;p99Ms:number;maxMs:number};
export type Raw=Stats&{runId:string;profile:'tv'|'phone';attemptNonce:string;sourceSha256:string;viewport:{width:number;height:number};cpuThrottle:number;transport:string;rawFiltering:string;performanceWhileRecording:boolean;nativeClock:Record<string,boolean>;timestamps:number[];intervals:number[];witnesses:Witness[];beforeGrant:Witness;afterGrant:Witness;afterSample:Witness;sourceStart:Hashes;sourceAfterSample:Hashes;runtimeIdentity:ReturnType<typeof strictRuntimeIdentity>;window:ReturnType<typeof import('./strict-coordination.ts')['closeStrictWindow']>|null;errors:string[];externalRequests:string[]};
export type Capture={profile:'tv'|'phone';path:string;bytes:number;sha256:string;frames:number;encodedFps:number;performanceMeasurement:false;decoded:boolean;decodeExit:number|null;witnesses:Witness[];sourceStart:Hashes;sourceEnd:Hashes;errors:string[];externalRequests:string[]};
export type Report={runId:string;passed:boolean;failure:string|null;scope:string;sourceStart:Hashes;sourceEnd:Hashes;runtimeIdentity:ReturnType<typeof strictRuntimeIdentity>;profiles:('tv'|'phone')[];captures:Capture[];physicalPhoneTested:false};
export function strictFrameStatistics(intervals:number[]):Stats{
 assert.equal(intervals.length,600,'all 600 consecutive intervals required');
 assert(intervals.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>0),'invalid interval');
 const ordered=[...intervals].sort((a,b)=>a-b),meanMs=intervals.reduce((a,b)=>a+b,0)/600;
 return {meanMs,fps:1000/meanMs,p95Ms:ordered[570]!,p99Ms:ordered[594]!,maxMs:ordered[599]!};
}
export function verifyActiveWrite(w:Witness){
 assert.equal(w.phase,'write');assert.equal(w.setupHidden,true);assert.equal(w.matchHidden,false);
 assert.equal(w.pauseButton,'Pause');assert.equal(w.privateOpen,'true');assert.equal(w.inputCount,1);
 assert.equal(w.fakeValue,'My harbour bluff');assert.equal(w.fakeDisabled,false);assert(w.question.length>0);
 assert(/^\d+ s$/.test(w.countdown??''));assert(Number.parseInt(w.countdown!)>0);assert.equal(w.controllerCountdown,w.countdown);
 assert(Number.isFinite(w.nativeNowMs)&&w.nativeNowMs>=0);assert(Number.isFinite(w.wallUtcMs)&&w.wallUtcMs>0);
 assert(Number.isInteger(w.received)&&w.received>=0&&w.received<=7);
}
export function verifyStrictProfile(raw:Raw,expected:Hashes,runtime= strictRuntimeIdentity()){
 assert.deepEqual(raw.sourceStart,expected,'current start source identity');assert.deepEqual(raw.sourceAfterSample,expected,'current end source identity');
 assert.deepEqual(raw.runtimeIdentity,runtime,'loaded dependency identity');assert.equal(raw.sourceSha256,expected['play.html']);
 assert.match(raw.attemptNonce,/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
 assert(['tv','phone'].includes(raw.profile));assert.deepEqual(raw.viewport,raw.profile==='tv'?{width:1920,height:1080}:{width:390,height:844});assert.equal(raw.cpuThrottle,raw.profile==='tv'?1:4);
 assert.equal(raw.transport,'file:');assert.equal(raw.rawFiltering,'none');assert.equal(raw.performanceWhileRecording,false);
 assert.deepEqual(raw.nativeClock,{requestAnimationFrame:true,performanceNow:true,dateNow:true,setTimeout:true,setInterval:true});
 assert.equal(raw.timestamps.length,601);assert.equal(raw.witnesses.length,601);
 assert(raw.timestamps.every(n=>typeof n==='number'&&Number.isFinite(n)&&n>=0));
 for(let i=0;i<600;i++)assert.equal(raw.intervals[i],raw.timestamps[i+1]!-raw.timestamps[i]!,'native consecutive interval');
 assert.equal(raw.beforeGrant.phase,'write');assert.equal(raw.beforeGrant.pauseButton,'Resume');assert.equal(raw.beforeGrant.countdown,'Paused');assert.equal(raw.beforeGrant.inputCount,0);
 for(const w of [raw.afterGrant,...raw.witnesses,raw.afterSample])verifyActiveWrite(w);
 assert(raw.afterGrant.received<7,'remaining bots must actually be active after grant');assert.equal(raw.afterSample.received,7,'all seven real bot callbacks completed');
 for(let i=1;i<raw.witnesses.length;i++){assert(raw.witnesses[i]!.nativeNowMs>=raw.witnesses[i-1]!.nativeNowMs);assert(raw.witnesses[i]!.wallUtcMs>=raw.witnesses[i-1]!.wallUtcMs);}
 assert(raw.afterSample.nativeNowMs-raw.afterGrant.nativeNowMs>=9000,'real elapsed workload');
 assert(Number.parseInt(raw.afterGrant.countdown!)-Number.parseInt(raw.afterSample.countdown!)>=8,'real countdown must advance');
 const stats=strictFrameStatistics(raw.intervals);for(const key of Object.keys(stats) as (keyof Stats)[])assert.equal(raw[key],stats[key],'recomputed '+key);
 assert(stats.fps>=59,'strict mean below original 59 FPS gate');assert(stats.p95Ms<=18,'strict p95 above original 18 ms gate');
 assert.deepEqual(raw.errors,[]);assert.deepEqual(raw.externalRequests,[]);
 const window=raw.window;assert(window,'missing closure');assert.equal(window.profile,raw.profile);assert.equal(window.sourceSha256,raw.sourceSha256);assert.equal(window.attemptNonce,raw.attemptNonce);
 assert.equal(window.status,'samples-written');assert.equal(window.rawIntervals,600);assert(['root-granted','uncoordinated'].includes(window.coordination));
 if(window.coordination==='root-granted'){assert(Number.isFinite(Date.parse(window.readyUtc!)));assert(Date.parse(window.grantUtc!)>=Date.parse(window.readyUtc!));assert(Date.parse(window.utc)>=Date.parse(window.grantUtc!));}
 return stats;
}
export function verifyStrictCapture(capture:Capture,expected:Hashes){
 assert.deepEqual(capture.sourceStart,expected);assert.deepEqual(capture.sourceEnd,expected);assert.equal(capture.performanceMeasurement,false);
 assert.equal(capture.decoded,true);assert.equal(capture.decodeExit,0);assert.equal(capture.frames,24);assert.equal(capture.encodedFps,12);
 assert(/^media\/strict-reverify-2019-(tv|phone)\.webm$/.test(capture.path));
 const bytes=readFileSync(capture.path);assert.equal(bytes.length,capture.bytes);assert(bytes.length>0&&bytes.length<10*1024*1024);assert.equal(sha256(bytes),capture.sha256);
 const decoded=decodeCurrentCapture(capture.path);assert.equal(decoded.frames,24,'actual decoded frame count');
 assert.equal(capture.witnesses.length,24);assert(capture.witnesses.some(w=>w.inputCount===0&&w.privateOpen!=='true'),'concealment captured');assert(capture.witnesses.some(w=>w.inputCount===1&&w.fakeValue==='My harbour bluff'),'reopened draft captured');
 assert(capture.witnesses.every(w=>w.phase==='write'),'actual active capture phase');assert.deepEqual(capture.errors,[]);assert.deepEqual(capture.externalRequests,[]);
}
export function verifyStrictCurrent(report:Report,raw:Raw[],expected=strictSourceHashes(),runtime=strictRuntimeIdentity()){
 assert.equal(report.passed,true);assert.equal(report.failure,null);assert.equal(report.scope,'current native workload and separately decoded captures');
 assert.deepEqual(report.sourceStart,expected);assert.deepEqual(report.sourceEnd,expected);assert.deepEqual(report.runtimeIdentity,runtime);assert.deepEqual(report.profiles,['tv','phone']);assert.equal(report.physicalPhoneTested,false);
 assert.equal(raw.length,2);assert.equal(report.captures.length,2);
 for(const [i,profile]of (['tv','phone'] as const).entries()){assert.equal(raw[i]!.profile,profile);assert.equal(raw[i]!.runId,report.runId);verifyStrictProfile(raw[i]!,expected,runtime);assert.equal(report.captures[i]!.profile,profile);verifyStrictCapture(report.captures[i]!,expected);}
 assert.notEqual(raw[0]!.attemptNonce,raw[1]!.attemptNonce);
 return {suite:'strict-current-native-browser-proof',profiles:2,unfilteredIntervals:1200,nativeTimestamps:1202,activeFrameWitnesses:1202,sourceGuards:Object.keys(expected).length,decodedCurrentCaptures:2,physicalPhoneTested:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const read=<T>(name:string):T=>JSON.parse(readFileSync('.work/strict/'+name,'utf8')) as T;
 console.log(JSON.stringify(verifyStrictCurrent(read<Report>('report.json'),['tv','phone'].map(p=>read<Raw>(p+'-raw.json'))),null,2));
}
