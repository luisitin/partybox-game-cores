import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';

export const browserGuardFiles=['play.html','ui.ts','core.ts','bots.ts','cards.ts','scoring.ts','pilot.ts','runner.ts','preflight.ts','deck.json','manifest.json','shell.html','build.ts','browser.ts','THIRD-PARTY-LICENSES.txt','../../contract/contract.ts','../../contract/rng.ts'] as const;
export const captureGuardFiles=['play.html','ui.ts','core.ts','bots.ts','cards.ts','scoring.ts','deck.json','manifest.json','capture.ts','capture-encoder.ts'] as const;
export const sha256=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
type ReadArtifact=(file:string)=>Uint8Array;
type JsonObject=Record<string,unknown>;
const object=(value:unknown,label:string):JsonObject=>{assert(value!==null&&typeof value==='object'&&!Array.isArray(value),`${label}: object required`);return value as JsonObject;};
const list=(value:unknown,label:string):unknown[]=>{assert(Array.isArray(value),`${label}: array required`);return value;};
const finite=(value:unknown,label:string):number=>{assert(typeof value==='number'&&Number.isFinite(value),`${label}: finite number required`);return value;};
const time=(value:unknown,label:string):number=>{assert(typeof value==='string'&&/^\d{4}-\d\d-\d\dT/.test(value)&&value.endsWith('Z'),`${label}: UTC timestamp required`);const parsed=Date.parse(value);assert(Number.isFinite(parsed),`${label}: valid timestamp required`);return parsed;};
const json=(read:ReadArtifact,file:string):unknown=>JSON.parse(Buffer.from(read(file)).toString('utf8'));
const sourceMap=(files:readonly string[],read:ReadArtifact)=>Object.fromEntries(files.map(file=>[file,sha256(read(file))]));
function sourceIdentity(report:JsonObject,files:readonly string[],read:ReadArtifact,label:string){
 const expected=sourceMap(files,read);
 assert.deepEqual(object(report.sourceHashesAtStart,`${label} start guards`),expected,`${label}: all current source guards must match`);
 assert.deepEqual(object(report.sourceHashesAtEnd,`${label} end guards`),expected,`${label}: final guards must match`);
 assert.equal(report.sourceUnchanged,true,`${label}: unchanged source required`);
 return expected;
}
export function recomputeFrames(value:unknown){
 const raw=list(value,'frame intervals');assert.equal(raw.length,900,'exactly 900 consecutive intervals required');
 const intervals=raw.map((v,i)=>{const n=finite(v,`interval ${i}`);assert(n>0,'intervals must be positive');return n;});
 const sorted=[...intervals].sort((a,b)=>a-b),averageMs=intervals.reduce((sum,n)=>sum+n,0)/intervals.length;
 return {frames:900,averageMs,fps:1000/averageMs,p95Ms:sorted[Math.floor(.95*sorted.length)]!,p99Ms:sorted[Math.floor(.99*sorted.length)]!,maxMs:sorted.at(-1)!};
}
const metric=(profile:JsonObject,key:string,expected:number)=>assert(Math.abs(finite(profile[key],key)-expected)<1e-8,`${key}: recorded metric differs from all raw intervals`);
export function validateBrowserReport(value:unknown,read:ReadArtifact=readFileSync){
 const report=object(value,'browser report');assert.equal(report.passed,true,'passing complete report required');
 assert(time(report.finishedAt,'browser finish')>=time(report.startedAt,'browser start'),'report finish precedes start');
 assert.equal(report.navigationMode,'Actual self-contained play.html from disk via file:// for every functional and frame case','actual disk transport required');
 const guards=sourceIdentity(report,browserGuardFiles,read,'browser');assert.equal(report.htmlSha256,guards['play.html'],'HTML identity required');
 assert.deepEqual(list(report.errors,'browser errors'),[],'application errors must be empty');assert.deepEqual(list(report.externalRequests,'browser requests'),[],'network requests must be empty');assert.deepEqual(list(report.failures,'browser failures'),[],'failure list must be empty');
 assert(typeof report.phoneLimitation==='string'&&report.phoneLimitation.includes('no physical phone available'),'phone approximation must be disclosed');
 const functional=list(report.functional,'browser functional').map(v=>{assert.equal(typeof v,'string');return v as string;});
 assert.equal(functional.length,13,'all 13 grouped functional checks required');assert.equal(new Set(functional).size,13,'functional groups must be distinct');
 const requiredFunctionals=[
  'partnership valid40-character names fit390px, concealed and open',
  'cutthroat valid40-character names fit390px, concealed and open',
  'partnership duplicate-name handovers disambiguated by seat / each revealed hand matches its owner / name resembling seat label stays distinct',
  'cutthroat duplicate-name handovers disambiguated by seat / each revealed hand matches its owner / name resembling seat label stays distinct',
  'follow-suit hand focuses first enabled card; native keyboard Enter plays it',
  'four humans / concealed handover / escaped names / bid draft hide-pause-resume / legal keyboard play / trick timer and winner lead / partial end / restart',
  'blind cards absent / late blind unavailable / sequential exchange / two selected cards survive hide and pause / received cards returned / handover removes DOM',
  'four blind bids / both pairs exchange once / all four sequential transfers complete',
  'complete UI partnership/52-card / exact core scores / half nil / contribution / no mercy / no blind-exchange / no overflow / finite final sides',
  'complete UI cutthroat/low-club / exact core scores / half nil / contribution / no mercy / no blind-exchange / lowest club / no overflow / finite final sides',
  'complete UI cutthroat/stock / exact core scores / half nil / contribution / no mercy / no blind-exchange / lowest club / no overflow / finite final sides',
  'TV reduced motion / no overflow','phone-4x reduced motion / no overflow'
 ];
 assert.deepEqual(functional,requiredFunctionals,'all actual grouped functional cases required');
 const games=list(report.completeGames,'complete games');assert.equal(games.length,3,'three complete UI/core-matched games required');
 const expectedGames=[['partnership','52-card',[226,503]],['cutthroat','low-club',[547,397,86]],['cutthroat','stock',[368,305,518]]] as const;
 games.forEach((v,i)=>{const game=object(v,`game ${i}`),expected=expectedGames[i]!;assert.equal(game.mode,expected[0]);assert.equal(game.deck,expected[1]);assert.deepEqual(list(game.scores,'scores'),expected[2],'exact independently confirmed seed44 game scores required');assert(Number.isInteger(finite(game.clockSteps,'clock steps'))&&Number(game.clockSteps)>0&&Number(game.clockSteps)<5000);assert(finite(game.durationMs,'game duration')>0);});
 const profiles=list(report.performance,'profiles');assert.equal(profiles.length,2,'both native-time profiles required');
 const expectedProfiles=[{label:'TV',viewport:{width:1920,height:1080},cpuThrottle:1},{label:'phone-4x',viewport:{width:390,height:844},cpuThrottle:4}];
 let repeatNumber:string|undefined;
 const metrics=profiles.map((value,i)=>{
  const profile=object(value,`profile ${i}`),expected=expectedProfiles[i]!;
  assert.equal(profile.label,expected.label);assert.deepEqual(profile.viewport,expected.viewport);assert.equal(profile.cpuThrottle,expected.cpuThrottle);assert.equal(profile.frameFiltering,'none','no interval filtering allowed');
  assert.equal(profile.frames,900,'recorded exact900 count required');const recomputed=recomputeFrames(profile.intervalsMs);for(const [key,n] of Object.entries(recomputed))metric(profile,key,n);
  assert(recomputed.fps>=59&&recomputed.p95Ms<=18,`${expected.label}: strict near60 frame gate failed`);
  assert(typeof profile.rawFile==='string'&&/^browser-raw-[1-9]\d*-(?:TV|phone-4x)\.json$/.test(profile.rawFile),'bounded raw artifact filename required');
  const filename=profile.rawFile.match(/^browser-raw-([1-9]\d*)-(TV|phone-4x)\.json$/)!;assert.equal(filename[2],expected.label,'raw filename profile identity');if(repeatNumber===undefined)repeatNumber=filename[1];else assert.equal(filename[1],repeatNumber,'same run repeat number required');
  const raw=object(json(read,profile.rawFile),'raw frame artifact');assert.deepEqual(raw.profile,profile,'raw artifact and report profiles must match');assert.deepEqual(raw.sourceHashesAtStart,guards,'raw start identity');assert.deepEqual(raw.sourceHashesAtEnd,guards,'raw end identity');
  return {profile:expected.label,...recomputed};
 });
 return {htmlSha256:guards['play.html'],sourceGuards:browserGuardFiles.length,rawIntervals:1800,metrics};
}
export function validateCaptureReport(value:unknown,read:ReadArtifact=readFileSync){
 const report=object(value,'capture report');assert(time(report.finishedAt,'capture finish')>=time(report.startedAt,'capture start'),'capture chronology');
 assert.equal(report.scope,'Actual-file functional/source-bound short capture only; not FPS acceptance','capture must remain separate from speed acceptance');
 const guards=sourceIdentity(report,captureGuardFiles,read,'capture');assert.deepEqual(list(report.errors,'capture errors'),[]);assert.deepEqual(list(report.externalRequests,'capture requests'),[]);
 assert.deepEqual(list(report.functional,'capture functionals'),['actual file: four seats, 13 own cards, conceal/reopen preserves bid5, hidden cards absent','new table clears cards; three seats own17 cards; phone does not overflow','reduced motion disables animation']);assert.equal(report.frameCount,18);assert.equal(report.encodedFps,12);
 assert(typeof report.output==='string'&&/^media\/milestone-[1-9]\d{0,3}-pinned-encoder\.webm$/.test(report.output),'bounded clip filename required');
 assert.equal(report.command,`node capture.ts --milestone=${report.output.match(/milestone-(\d+)-/)![1]}`,'capture command and milestone must match');
 const bytes=read(report.output);assert(bytes.length>1024&&bytes.length<10*1024*1024,'real short clip byte bound');assert.equal(report.bytes,bytes.length,'actual clip byte count');assert.equal(report.sha256,sha256(bytes),'actual clip SHA-256');assert.equal(Buffer.from(bytes.subarray(0,4)).toString('hex'),'1a45dfa3','WebM EBML header required');
 return {htmlSha256:guards['play.html'],sourceGuards:captureGuardFiles.length,bytes:bytes.length,sha256:report.sha256,scope:'functional capture only'};
}
if(import.meta.url===pathToFileURL(resolve(process.argv[1]??'')).href){
 const browserFile=process.argv.find(v=>v.startsWith('--browser='))?.slice(10),captureFile=process.argv.find(v=>v.startsWith('--capture='))?.slice(10);
 assert(browserFile||captureFile,'supply --browser=<report.json> and/or --capture=<report.json>');
 if(browserFile)console.log('G06 independently verified native-time evidence '+JSON.stringify(validateBrowserReport(json(readFileSync,browserFile))));
 if(captureFile)console.log('G06 independently verified actual clip '+JSON.stringify(validateCaptureReport(json(readFileSync,captureFile))));
}
