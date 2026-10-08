import test,{after} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {recomputeFrames,validateBrowserReport,validateHistoricalC609BrowserReportForTests,validateCaptureReport} from './verification.ts';
type Obj=Record<string,unknown>;
const current=process.env.G06_CURRENT_BROWSER_REPORT;
const browser=JSON.parse(readFileSync(current??'browser-ci-c609-report.json','utf8')) as Obj;
const capture=JSON.parse(readFileSync('capture-milestone-12-report.json','utf8')) as Obj;
const object=(v:unknown)=>v as Obj;
const profile=(v:Obj,index=0)=>object((v.performance as unknown[])[index]);
const read=(file:string)=>readFileSync(!current&&file==='browser.ts'?'browser-ci-c609-runner.txt':!current&&file.startsWith('browser-raw-1-')?`browser-ci-c609-raw-${file.slice('browser-raw-1-'.length)}`:file);
const validate=current?validateBrowserReport:validateHistoricalC609BrowserReportForTests;
const controls:string[]=[];
const reject=(label:string,run:()=>unknown,pattern?:RegExp)=>{if(pattern)assert.throws(run,pattern);else assert.throws(run);controls.push(label);};
const rejectBrowser=(label:string,change:(v:Obj)=>void)=>{const copied=structuredClone(browser);change(copied);reject(label,()=>validate(copied,read));};

test('genuine successful CI baseline/current report verifies all1800raw intervals and all requiredguards',()=>{
 const result=validate(browser,read);assert.equal(result.rawIntervals,1800);assert.equal(result.sourceGuards,current?18:17);assert(result.metrics.every(p=>p.frames===900&&p.fps>=59&&p.p95Ms<=18));
});
test('reject stale, absent, or changed actual source identities',()=>{
 for(const key of ['sourceHashesAtStart','sourceHashesAtEnd']){
  rejectBrowser(`${key} stale HTML`,v=>{object(v[key])['play.html']='0'.repeat(64);});
  rejectBrowser(`${key} missing core`,v=>{delete object(v[key])['core.ts'];});
 }
 reject('actual changed disk HTML',()=>validate(browser,file=>file==='play.html'?Buffer.concat([read(file),Buffer.from('\n<!-- stale file control -->')]):read(file)));
 rejectBrowser('HTML top-level mismatch',v=>{v.htmlSha256='0'.repeat(64);});rejectBrowser('source changed flag',v=>{v.sourceUnchanged=false;});
});
test('reject missing, duplicated, wrongly sized, or throttled profiles',()=>{
 rejectBrowser('phone profile absent',v=>{(v.performance as unknown[]).pop();});
 rejectBrowser('duplicated TV profile',v=>{(v.performance as unknown[])[1]=structuredClone(profile(v));});
 rejectBrowser('wrong phone width',v=>{object(profile(v,1).viewport).width=391;});
 rejectBrowser('phone throttle1',v=>{profile(v,1).cpuThrottle=1;});
 rejectBrowser('899raw intervals',v=>{(profile(v).intervalsMs as number[]).pop();});
 rejectBrowser('fractional recorded900 count',v=>{profile(v).frames=900.000000001;});
 rejectBrowser('filtered frame label',v=>{profile(v).frameFiltering='dropped slow frames';});
 rejectBrowser('raw filename mismatches profile',v=>{profile(v).rawFile='browser-raw-1-phone-4x.json';});
 rejectBrowser('different repeat profiles',v=>{profile(v,1).rawFile='browser-raw-2-phone-4x.json';});
});
test('recompute every raw interval and reject corrupt statistics/gate failures',()=>{
 rejectBrowser('changed raw interval but stale60FPS',v=>{(profile(v).intervalsMs as number[])[400]=250;});
 for(const key of ['averageMs','fps','p95Ms','p99Ms','maxMs'])rejectBrowser(`wrong ${key}`,v=>{profile(v)[key]=Number(profile(v)[key])+1;});
 for(const n of [0,-16.7,NaN,Infinity])rejectBrowser(`invalid interval ${String(n)}`,v=>{(profile(v).intervalsMs as number[])[10]=n;});
 rejectBrowser('truthfully slow raw samples fail strict59gate',v=>{const p=profile(v);p.intervalsMs=Array.from({length:900},()=>18);Object.assign(p,recomputeFrames(p.intervalsMs));});
});
test('reject missing or altered actual raw sidecars',()=>{
 reject('raw sidecar absent',()=>validate(browser,file=>{assert(!file.startsWith('browser-raw-'),'deliberately unavailable raw artifact');return read(file);}));
 for(const key of ['profile','sourceHashesAtStart','sourceHashesAtEnd'])reject(`altered sidecar ${key}`,()=>validate(browser,file=>{
  const bytes=read(file);if(!file.startsWith('browser-raw-'))return bytes;
  const raw=JSON.parse(bytes.toString('utf8')) as Obj;if(key==='profile')object(raw.profile).fps=55;else object(raw[key])['play.html']='0'.repeat(64);return Buffer.from(JSON.stringify(raw));
 }));
});
test('reject incomplete functionals, corrupted actual game scores, error/network/chronology',()=>{
 rejectBrowser('missing functional group',v=>{(v.functional as string[]).pop();});
 rejectBrowser('duplicate functional group',v=>{(v.functional as string[])[1]=(v.functional as string[])[0]!;});
 rejectBrowser('wrong claimed functional group',v=>{(v.functional as string[])[0]='not executed';});
 for(let i=0;i<3;i++)rejectBrowser(`corrupt fullgame${i} final scores`,v=>{object((v.completeGames as unknown[])[i]).scores=Array.from({length:i===0?2:3},()=>0);});
 for(const [key,value] of [['passed',false],['errors',['application error']],['externalRequests',['https://example.invalid/']],['failures',['failed assertion']],['finishedAt','2020-01-01T00:00:00Z'],['navigationMode','setContent']] as const)rejectBrowser(`invalid ${key}`,v=>{v[key]=value;});
});
test('current genuine short capture verifies actual bytes and ten source guards',()=>{
 const result=validateCaptureReport(capture);assert.equal(result.sourceGuards,10);assert(result.bytes>1024&&result.bytes<10*1024*1024);
 reject('capture actual byte corruption',()=>validateCaptureReport(capture,file=>{const bytes=readFileSync(file);if(file===capture.output){const changed=Buffer.from(bytes);changed[changed.length-1]^=1;return changed;}return bytes;}));
 for(const [key,value] of [['bytes',0],['sha256','0'.repeat(64)],['externalRequests',['https://example.invalid/']],['errors',['app error']],['scope','speed acceptance'],['sourceUnchanged',false],['output','../play.html']] as const){const changed=structuredClone(capture);changed[key]=value;reject(`capture invalid ${key}`,()=>validateCaptureReport(changed));}
 for(const key of ['sourceHashesAtStart','sourceHashesAtEnd']){const changed=structuredClone(capture);object(changed[key])['play.html']='0'.repeat(64);reject(`capture stale ${key}`,()=>validateCaptureReport(changed));}
 reject('functional-only capture cannot replace browser report',()=>validate(capture,read));
});
test('current validator refuses the real legacy17guard fixture',()=>{
 const historical=JSON.parse(readFileSync('browser-ci-c609-report.json','utf8'));
 reject('legacy17guard fixture cannot prove current18guard acceptance',()=>validateBrowserReport(historical,read));
 if(current)for(const key of ['sourceHashesAtStart','sourceHashesAtEnd'])rejectBrowser(`missing current helper ${key}`,v=>{delete object(v[key])['frame-coordination.ts'];});
});
test('preserve genuine local900frame failure and old55gate contrast',()=>{
 const failed=JSON.parse(readFileSync('browser-repeat-9.json','utf8')) as Obj;
 const actual=profile(failed);const result=recomputeFrames(actual.intervalsMs);assert(Math.abs(result.fps-Number(actual.fps))<1e-8);assert(result.fps>=55&&result.fps<59);
 reject('actual failed local report cannot pass',()=>validate(failed,read));
});
after(()=>console.log('G06_VERIFICATION_CONTROLS '+JSON.stringify({basis:current?'actual current browser report':'archived genuine c609 CI/source snapshot; not current-run acceptance',negativeControls:controls.length,controls})));
