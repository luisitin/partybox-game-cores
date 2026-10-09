import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,statSync,readdirSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';

export const guardedFiles=['play.html','ui.ts','core.ts','bots.ts','samples.ts','samples.json','manifest.json','scoring.ts','estimates.ts','build.ts','shell.html','browser.ts','capture-encoder.ts','THIRD-PARTY-LICENSES.md','../../contract/contract.ts','../../contract/rng.ts'];
type Hashes=Record<string,string>;
type Profile={name:string;viewport:{width:number;height:number};throttle:number;scenario:string;frameFiltering:string;intervalsMs:number[];frames:number;meanMs:number;p95Ms:number;p99Ms:number;fps:number};
type Guards={htmlSha256:string;htmlSha256AtEnd:string;sourceHashesAtStart:Hashes;sourceHashesAtEnd:Hashes;errors:string[];externalRequests:string[]};
type FullReport=Guards&{functional:string[];evidenceScope:string;navigationMode:string;sourceUnchanged:boolean;performance:Profile[];capture:string;captureBytes:number;captureSha256?:string};
type RawReport=Guards&{evidenceScope:string;gates:{minimumMeanFps:number;maximumP95Ms:number};performance:Profile};
type Capture={capture:string;captureBytes:number;captureSha256?:string};
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const json=<T>(file:string):T=>JSON.parse(readFileSync(file,'utf8')) as T;
export const currentSourceHashes=():Hashes=>Object.fromEntries(guardedFiles.map(file=>[file,sha(readFileSync(file))]));
const functionalNames=[
 '3s wheel / 10s demo / exact pause-shifted deadline / end and restart',
 'all eight realm wedges land under the wheel pointer',
 ...['number','choice','century','decade'].map(kind=>`${kind} control / private handover / exact score`),
 'bluff write/vote/reveal / duplicates / own vote disabled / escaped user text',
 'correct-write credit confirmation is private and concealed before handover',
 'bluff/number/range drafts survive hide and pause, remain absent from hidden DOM and never cross owners',
 'draft and keyboard focus survive another player’s input',
 ...['quick','mixed','bluff'].flatMap(mode=>[2,4,8].map(seats=>`full ${mode}, ${seats} seats, eight rounds, finite results, no overflow`)),
 'phone controller has question, live timer and keyboard focus; shared board returns after hide',
 'maximum-length unbroken bluffs wrap within the phone viewport',
 'reduced-motion disables wheel animation'
];
const profiles=[['tv',1920,1080,1],['phone',390,844,4]] as const;
function guards(report:Guards,expected:Hashes):void{
 assert(report.sourceHashesAtStart&&report.sourceHashesAtEnd,'missing source guards');
 assert.deepEqual(Object.keys(expected).sort(),[...guardedFiles].sort(),'source inventory');
 for(const value of Object.values(expected))assert(/^[a-f0-9]{64}$/.test(value),'invalid source SHA256');
 assert.deepEqual(report.sourceHashesAtStart,expected,'stale start source guards');
 assert.deepEqual(report.sourceHashesAtEnd,expected,'stale end source guards');
 assert.equal(report.htmlSha256,expected['play.html'],'HTML start guard differs');
 assert.equal(report.htmlSha256AtEnd,expected['play.html'],'HTML end guard differs');
 assert.deepEqual(report.errors,[],'page errors');assert.deepEqual(report.externalRequests,[],'runtime network');
}
export function frameStatistics(intervals:number[]):{meanMs:number;p95Ms:number;p99Ms:number;fps:number}{
 assert.equal(intervals.length,300,'exactly 300 consecutive intervals required');
 let total=0;for(const value of intervals){assert(typeof value==='number'&&Number.isFinite(value)&&value>0,'invalid frame interval');total+=value;}
 const ordered=Array.from(intervals).sort((a,b)=>a-b),meanMs=total/300;
 return {meanMs,p95Ms:ordered[285]!,p99Ms:ordered[297]!,fps:1000/meanMs};
}
function profile(value:Profile,index:number):void{
 const [name,width,height,throttle]=profiles[index]!;
 assert.equal(value.name,name);assert.deepEqual(value.viewport,{width,height});assert.equal(value.throttle,throttle);
 assert.equal(value.scenario,'eight seats, open human controller, seven concurrent bot inputs');
 assert.equal(value.frameFiltering,'none','filtered samples cannot certify play');assert.equal(value.frames,300);
 const actual=frameStatistics(value.intervalsMs);
 for(const key of ['meanMs','p95Ms','p99Ms','fps'] as const){
  assert(typeof value[key]==='number'&&Number.isFinite(value[key]));
  assert(Math.abs(value[key]-actual[key])<=1e-9,'incorrect recomputed '+key);
 }
 assert(actual.fps>=59,'mean below original 59 FPS gate');assert(actual.p95Ms<=18,'p95 above original 18 ms gate');
}
export function validateCapture(capture:Capture):void{
 assert(typeof capture.capture==='string'&&capture.capture.startsWith('media/'),'capture must be local media');
 const path=resolve(capture.capture);assert(!relative(resolve('media'),path).startsWith('..'),'capture leaves media directory');
 const bytes=readFileSync(path);assert(statSync(path).isFile());
 assert(bytes.length>0&&bytes.length<10*1024*1024,'capture must be below 10 MB');
 assert.equal(capture.captureBytes,bytes.length,'capture byte mismatch');
 assert(typeof capture.captureSha256==='string'&&/^[a-f0-9]{64}$/.test(capture.captureSha256),'missing capture SHA256');
 assert.equal(capture.captureSha256,sha(bytes),'capture hash mismatch');
}
// History validates only the actual logged statistics/guards. It deliberately
// cannot turn unavailable hosted video bytes into current acceptance.
export function validateSuite(report:FullReport,raw:RawReport[],expected:Hashes,historyOnly=false){
 guards(report,expected);assert.equal(report.sourceUnchanged,true);
 assert.equal(report.evidenceScope,'full browser suite','historical/frame-only scope is not full proof');
 assert.equal(report.navigationMode,'Actual self-contained play.html opened from disk via file://','actual file navigation required');
 assert.deepEqual(report.functional,functionalNames,'all 22 functional scenarios required');
 assert.equal(report.performance.length,2);assert.equal(raw.length,2);
 for(let index=0;index<2;index++){
  const r=raw[index]!;guards(r,expected);
  assert.equal(r.evidenceScope,'full browser suite, profile saved before assertions');
  assert.deepEqual(r.gates,{minimumMeanFps:59,maximumP95Ms:18});
  profile(report.performance[index]!,index);profile(r.performance,index);
  assert.deepEqual(r.performance,report.performance[index],'raw/full profile mismatch');
 }
 if(!historyOnly)validateCapture(report);
 return {historyOnly,currentAcceptance:!historyOnly,captureBytesVerified:!historyOnly,profiles:2,intervals:600,functionalScenarios:22};
}
export function validateCurrentReports(){
 const expected=currentSourceHashes(),captures=new Set<string>();
 for(let repeat=1;repeat<=3;repeat++){
  const report=json<FullReport>(repeat===1?'browser-report.json':`browser-repeat-${repeat}.json`);
  const raw=profiles.map(([name])=>json<RawReport>(`browser-raw-${repeat}-${name}.json`));
  validateSuite(report,raw,expected);assert(!captures.has(report.capture),'each full run needs its own capture');captures.add(report.capture);
 }
 return {suite:'current-browser-proof',currentAcceptance:true,fullRuns:3,functionalScenarios:66,profiles:6,rawIntervals:1800,sourceGuards:16,unfiltered:true,capturesVerified:3};
}
export function selfTest(withHtmlComment=false){
 const suites=[1,2,3].map(repeat=>({report:json<FullReport>(`ci-7a7af73-g04_complete_report-${repeat}.json`),raw:[2*repeat-1,2*repeat].map(n=>json<RawReport>(`ci-7a7af73-g04_raw_profile-${n}.json`))}));
 for(const {report,raw}of suites)validateSuite(report,raw,report.sourceHashesAtStart,true);
 const original=suites[0]!,corruptions:string[]=[];
 const reject=(name:string,change:(item:typeof original)=>void)=>{const item=structuredClone(original);change(item);assert.throws(()=>validateSuite(item.report,item.raw,original.report.sourceHashesAtStart,true),name+' accepted');corruptions.push(name);};
 reject('missing source guards',item=>{delete (item.report as Partial<FullReport>).sourceHashesAtStart;});
 reject('stale source guard',item=>{item.report.sourceHashesAtStart['play.html']='0'.repeat(64);});
 reject('changed end guard',item=>{item.raw[1]!.sourceHashesAtEnd['ui.ts']='0'.repeat(64);});
 reject('historical setContent',item=>{item.report.navigationMode='setContent';});
 reject('frame-only report',item=>{item.report.evidenceScope='performance confirmation only';});
 reject('missing functional scenario',item=>{item.report.functional.pop();});
 reject('truncated raw',item=>{item.raw[0]!.performance.intervalsMs.pop();});
 reject('filtered raw',item=>{item.raw[0]!.performance.frameFiltering='outliers removed';});
 reject('invalid interval',item=>{item.raw[0]!.performance.intervalsMs[0]=0;});
 for(const key of ['meanMs','fps','p95Ms','p99Ms'] as const)reject('wrong '+key,item=>{item.raw[0]!.performance[key]+=1;item.report.performance[0]![key]+=1;});
 reject('wrong viewport',item=>{item.report.performance[1]!.viewport.width=1920;});
 reject('wrong phone throttle',item=>{item.raw[1]!.performance.throttle=1;});
 reject('page error',item=>{item.report.errors.push('actual error');});
 reject('network request',item=>{item.raw[0]!.externalRequests.push('https://example.invalid/');});
 reject('relaxed gate',item=>{item.raw[0]!.gates.minimumMeanFps=55;});
 for(const [name,intervals]of [['below FPS',Array(300).fill(20)],['above p95',Array.from({length:300},(_,i)=>i<30?19:15)]] as const){
  reject(name,item=>{for(const value of [item.report.performance[0]!,item.raw[0]!.performance]){value.intervalsMs=[...intervals];Object.assign(value,frameStatistics(value.intervalsMs));}});
 }
 const clip=json<{output:string;bytes:number;sha256:string}>('capture-pinned-encoder-milestone-15-report.json');
 const localCapture:Capture={capture:clip.output,captureBytes:clip.bytes,captureSha256:clip.sha256};validateCapture(localCapture);
 for(const [name,change]of [
  ['capture hash mismatch',(copy:Capture)=>{copy.captureSha256='0'.repeat(64);}],
  ['capture byte mismatch',(copy:Capture)=>{copy.captureBytes++;}],
  ['missing capture hash',(copy:Capture)=>{delete copy.captureSha256;}]
 ] as const){const copy=structuredClone(localCapture);change(copy);assert.throws(()=>validateCapture(copy),name+' accepted');corruptions.push(name);}
 let commentProbe:null|{oldChecksumsAccepted:boolean;newSourceProofRejected:boolean;htmlRestored:boolean}=null;
 if(withHtmlComment){
  const html=readFileSync('play.html'),before=currentSourceHashes();
  const inventory=()=>[...readdirSync('.').filter(n=>n.endsWith('.json')&&!['package.json','package-lock.json','tsconfig.json'].includes(n)),...readdirSync('fixtures').filter(n=>n.endsWith('.json')).map(n=>'fixtures/'+n),...readdirSync('media').map(n=>'media/'+n)].sort().map(path=>`${sha(readFileSync(path))}  ${path}`).join('\n')+'\n';
  const oldInventory=inventory();
  try{
   writeFileSync('play.html',Buffer.concat([html,Buffer.from('\n<!-- current-source negative control only -->\n')]));
   assert.equal(inventory(),oldInventory,'HTML change unexpectedly altered data/media inventory');
   const checks=spawnSync(process.execPath,['checksums.ts','--check'],{encoding:'utf8'});assert.equal(checks.status,0,checks.stdout+checks.stderr);
   assert.throws(()=>guards({htmlSha256:before['play.html']!,htmlSha256AtEnd:before['play.html']!,sourceHashesAtStart:before,sourceHashesAtEnd:before,errors:[],externalRequests:[]},currentSourceHashes()),/stale start source guards/);
   commentProbe={oldChecksumsAccepted:true,newSourceProofRejected:true,htmlRestored:false};
  }finally{writeFileSync('play.html',html);assert.deepEqual(currentSourceHashes(),before,'HTML was not restored');}
  commentProbe!.htmlRestored=true;
 }
 assert.throws(()=>validateSuite(original.report,original.raw,currentSourceHashes()),'historical logs cannot satisfy current full acceptance');
 return {suite:'browser-proof-self-test',historyOnly:true,currentAcceptance:false,historicalRuns:3,historicalProfiles:6,historicalRawIntervals:1800,hostedCaptureContentsRead:false,localCaptureOnly:{path:clip.output,bytes:clip.bytes,sha256:clip.sha256,pairedWithHostedProof:false},corruptionsRejected:corruptions.length,corruptions,commentProbe};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 console.log(JSON.stringify(process.argv.includes('--self-test')?selfTest(process.argv.includes('--with-html-comment')):validateCurrentReports(),null,2));
}
