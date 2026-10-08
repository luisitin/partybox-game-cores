import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {spawn} from 'node:child_process';
import {gameInputHashes} from './game-inputs.mjs';

// This acceptance inventory is independent of the runner's check registration.
export const CHECK_NAMES=Object.freeze([
  'disk load, no external assets and reduced motion',
  'American standard board and complete hot-seat turn',
  'multi-jump draft leaves the actual position unchanged',
  'American crown ends the capture turn',
  'International full maximum capture and promotion',
  'International crown transit stays a man',
  'pause/resume and optional exact deadline forfeit',
  'winner/results and explicit next table',
  'manual Strong move uses local full-corpus worker and preserves legal core choice',
  'International actual2–5 corpus worker prepares offline and preserves pending input',
  'International actual six-piece Strong worker reads original local blocks',
  'consecutive bot turns reuse the prepared worker and pause cancels it',
  'pause cancels worker before it can apply an old move',
  'names remain text and hostile original IDs have finite public results',
  'viewport fits both boards and all controls',
]);
export const PROFILES=Object.freeze([{name:'desktop',width:1920,height:1080,throttle:1},{name:'phone',width:390,height:844,throttle:4}]);
export const VARIANTS=Object.freeze(['american','international']);
export const FRAME_WORKLOAD='600 consecutive RAF intervals with real board selection/cancel each callback; no filtering; acceptance measurements run separately from recorded clips';
const GUARD_FILES=Object.freeze([
  'scripts/browser-check.mjs','scripts/browser-evidence.mjs','scripts/browser-evidence-controls.mjs','scripts/integrity.mjs','scripts/check.mjs','scripts/build.mjs','scripts/corpus-pack.mjs',
  'src/browser.ts','src/play.template.html','src/bot-worker.ts','src/bots.ts','src/core.ts','src/moves.ts','src/draws.ts','src/endgame.ts','src/international.ts','src/international-search.ts',
  'dist/corpus-pack.json','dist/worker-american.mjs','dist/worker-international.mjs','manifest.json',
  'data/chinook/manifest.json','data/international/manifest.json','data/international/six/manifest.json',
  'LICENSE','data/chinook/LICENSE.txt','data/international/LICENSE.md','data/international/BOOST-LICENSE.txt','THIRD-PARTY-LICENSES.txt','package.json','package-lock.json',
  'tsconfig.json','node_modules/zod/LICENSE','../../contract/constants.ts','../../contract/contract.ts','../../contract/minigame-schema.ts','../../contract/rng.ts','../../contract/player-count-schema.ts','../../contract/package.json',
]);
const digest=value=>createHash('sha256').update(value).digest('hex');
export async function hashFile(path){const hash=createHash('sha256');for await(const bytes of createReadStream(path))hash.update(bytes);return hash.digest('hex');}
export async function sourceGuards(){
  const inputs=await gameInputHashes(),host=Object.fromEntries(await Promise.all(GUARD_FILES.map(async file=>[file,await hashFile(file)])));
  return Object.fromEntries(Object.entries({...inputs,...host}).sort(([a],[b])=>a.localeCompare(b)));
}
export const guardsFingerprint=guards=>digest(JSON.stringify(guards));
const near=(actual,expected,label)=>assert(Number.isFinite(actual)&&Math.abs(actual-expected)<1e-8,label);
const uuid=value=>assert(typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value),'Actual UUID v4 required');

// A historical check-coverage audit is deliberately separate from current acceptance.
export function validateCheckCoverage(report){
  assert.equal(report.failure,undefined,'A failed report cannot be accepted');
  assert.equal(report.totalChecks,30);assert(Array.isArray(report.checks));assert.equal(report.checks.length,30);
  assert(Array.isArray(report.profiles));assert.deepEqual(report.profiles.map(profile=>profile.name),PROFILES.map(profile=>profile.name));
  const expected=PROFILES.flatMap(profile=>CHECK_NAMES.map(name=>({profile:profile.name,name,pass:true})));
  assert.deepEqual(report.checks,expected,'Require each exact named functional check once, in each profile, with literal pass:true');
  for(const profile of report.profiles)assert.equal(profile.checks,15,'Profile count must match the actual check rows');
}

export function validateFrameStatistics(raw,summary){
  assert.equal(raw.capturing,false);assert.equal(raw.workload,FRAME_WORKLOAD);
  assert(Array.isArray(raw.frames));assert.equal(raw.frames.length,600);assert(raw.frames.every(value=>Number.isFinite(value)&&value>0));
  const sorted=[...raw.frames].sort((a,b)=>a-b),mean=raw.frames.reduce((sum,value)=>sum+value,0)/600,p99=sorted[Math.ceil(.99*600)-1],fps=1000/mean;
  near(raw.meanMs,mean,'Raw mean must match all intervals');near(raw.meanFps,fps,'Raw FPS must match all intervals');near(raw.p99Ms,p99,'Raw p99 must match all intervals');
  assert(fps>=59&&p99<=17,JSON.stringify({profile:raw.name,variant:raw.variant,fps,p99}));
  assert.deepEqual(summary,{frames:600,meanFps:fps,p99Ms:p99},'Report summary must match the genuine raw file');
}
export function validateRawFrames(raw,profile,variant,sourceSha256,summary){
  assert.equal(raw.sourceSha256,sourceSha256);assert.equal(raw.name,profile.name);assert.equal(raw.variant,variant);
  for(const key of ['width','height','throttle'])assert.equal(raw[key],profile[key]);
  assert.equal(summary.variant,variant);const {variant:reportedVariant,...statistics}=summary;validateFrameStatistics(raw,statistics);
}

async function command(binary,args){
  const child=spawn(binary,args,{stdio:['ignore','pipe','pipe']}),out=[],errors=[];
  child.stdout.on('data',bytes=>out.push(bytes));child.stderr.on('data',bytes=>errors.push(bytes));
  const exit=await new Promise((yes,no)=>{child.once('error',no);child.once('exit',(code,signal)=>yes({code,signal}));});
  assert.deepEqual(exit,{code:0,signal:null},binary+' failed: '+Buffer.concat(errors));
  assert.equal(Buffer.concat(errors).length,0,binary+' reported a decode/probe error');
  return Buffer.concat(out).toString('utf8');
}
export async function probeVideo(path){
  const probe=JSON.parse(await command('ffprobe',['-v','error','-count_frames','-show_entries','stream=codec_name,codec_type,width,height,avg_frame_rate,nb_read_frames:format=format_name,duration','-of','json',resolve(path)]));
  assert.equal(probe.streams.length,1,'Exactly one video stream is required');const stream=probe.streams[0];assert.equal(stream.codec_type,'video');
  assert.equal(stream.codec_name,'vp8');assert.equal(probe.format.format_name,'matroska,webm');
  // Decode the complete actual clip. Metadata-only probes cannot establish this.
  await command('ffmpeg',['-hide_banner','-v','error','-threads','1','-i',resolve(path),'-map','0:v:0','-f','null','-']);
  return {container:probe.format.format_name,codec:stream.codec_name,width:stream.width,height:stream.height,frameRate:stream.avg_frame_rate,frames:Number(stream.nb_read_frames),durationSeconds:Number(probe.format.duration)};
}
export async function describeClip(path,file){return {file,bytes:(await stat(path)).size,sha256:await hashFile(path),probe:await probeVideo(path)};}
export async function prepareCaptureClip(mediaDirectory,profile){
  const originalFile=profile.name+'-original.webm',originalPath=resolve(mediaDirectory,originalFile),original=await describeClip(originalPath,originalFile);
  assert(original.probe.durationSeconds>=10,'Capture must contain at least ten seconds of real gameplay');
  const file=profile.name+'.webm',clipPath=resolve(mediaDirectory,file),seekSeconds=original.probe.durationSeconds-10;
  const args=['-hide_banner','-loglevel','error','-ss',String(seekSeconds),'-i',originalPath,'-t','10','-an','-c:v','libvpx','-deadline','realtime','-cpu-used','8','-threads','2','-b:v',profile.name==='desktop'?'900k':'400k','-y',clipPath];
  await command('ffmpeg',args);const clip=await describeClip(clipPath,file);await validateClip(clipPath,clip,profile);
  return {...clip,original,sourceSeekSeconds:seekSeconds,command:['ffmpeg',...args],scope:'Last ten seconds of actual recorded International hot-seat legal moves; diagnostic recording, never frame acceptance.'};
}
export async function validateClip(path,receipt,profile,canonicalFile=profile.name+'.webm'){
  assert.equal(receipt.file,canonicalFile,'Capture must name the canonical current clip');
  const bytes=(await stat(path)).size;assert(bytes>0&&bytes<10*1024*1024,'Actual clip must be nonempty and smaller than 10 MiB');
  assert.equal(receipt.bytes,bytes);assert.match(receipt.sha256,/^[a-f0-9]{64}$/);assert.equal(receipt.sha256,await hashFile(path),'Capture hash must bind the actual clip');
  const prefix=await readFile(path);assert.equal(prefix.subarray(0,4).toString('hex'),'1a45dfa3','Actual WebM EBML header required');
  const probe=await probeVideo(path);assert.deepEqual(receipt.probe,probe,'Capture metadata must match actual decoded video');
  assert.equal(probe.width,profile.width);assert.equal(probe.height,profile.height);assert.equal(probe.frameRate,'25/1');
  assert(probe.durationSeconds>=8&&probe.durationSeconds<=12,'Milestone clip must show 8–12 seconds of actual gameplay');
  assert(probe.frames>=200&&probe.frames<=300);near(probe.frames/25,probe.durationSeconds,'All decoded frame times must match clip duration');
}

export function validateSourceBinding(report,{sourceSha256,htmlBytes,guards}){
  assert.equal(report.sourceSha256,sourceSha256);assert.equal(report.htmlBytes,htmlBytes);assert.equal(report.sourceSha256After,sourceSha256);assert.equal(report.htmlBytesAfter,htmlBytes);
  assert.deepEqual(report.sourceGuardsBefore,guards,'Report must use the current runner/runtime/build/license sources');
  assert.deepEqual(report.sourceGuardsAfter,guards,'All guarded sources must remain identical through the actual run');
}
export function validateRunIdentity(raw,runId,guards){
  uuid(runId);assert.equal(raw.runId,runId);uuid(raw.nonce);assert.equal(raw.sourceGuardsFingerprint,guardsFingerprint(guards));
}
export function validateIntervalContinuity(raw){
  assert(Array.isArray(raw.frames));assert(Array.isArray(raw.timestamps));assert.equal(raw.frames.length,600);assert.equal(raw.timestamps.length,601);
  assert(raw.frames.every(value=>Number.isFinite(value)&&value>0));assert(raw.timestamps.every(value=>Number.isFinite(value)));
  for(let i=0;i<600;i++)near(raw.frames[i],raw.timestamps[i+1]-raw.timestamps[i],'Every interval must match consecutive finite native RAF timestamps');
}
export function validateActiveWorkload(raw,variant){
  assert.deepEqual(raw.stateAfter,raw.stateBefore,'Real selection/cancel sampling must preserve the complete game state');
  for(const state of [raw.stateBefore,raw.stateAfter]){
    assert.equal(state.variant,variant);assert.equal(state.phase.id,'move');assert.equal(state.phase.deadline,null);assert.equal(state.phase.paused,undefined);
    assert.equal(state.settings.turnSeconds,0);assert.equal(state.ply,0);assert.equal(state.board.length,variant==='american'?32:50);
    assert.equal(state.board.filter(piece=>piece!==0).length,variant==='american'?24:40);
  }
  assert.deepEqual(raw.draftBefore,[]);assert.deepEqual(raw.draftAfter,[]);assert.equal(raw.legalMoveCountBefore,variant==='american'?7:9);assert.equal(raw.legalMoveCountAfter,raw.legalMoveCountBefore);
  assert.equal(raw.thinkingBefore,false);assert.equal(raw.thinkingAfter,false);
}
export function validateProfileReceipt(row,profile){
  assert.equal(row.name,profile.name);for(const key of ['width','height','throttle'])assert.equal(row[key],profile[key]);
  assert(Number.isFinite(row.loadMs)&&row.loadMs>=0);assert.equal(row.pageErrorCount,0);assert.equal(row.httpRequestCount,0);
  assert.deepEqual(row.pageErrors,[]);assert.deepEqual(row.httpRequests,[]);assert(Array.isArray(row.frameResults));
  assert.deepEqual(row.frameResults.map(result=>result.variant),VARIANTS);
}
export function validateCurrentReport(report,{sourceSha256,htmlBytes,guards,capture}){
  validateCheckCoverage(report);assert.equal(report.evidenceVersion,1);uuid(report.runId);
  validateSourceBinding(report,{sourceSha256,htmlBytes,guards});
  assert.equal(report.capture,capture);assert.equal(report.functionalOnly,false);assert.deepEqual(report.frameVariants,VARIANTS);
  assert.equal(report.command,'node scripts/browser-check.mjs'+(capture?' --capture':''));
  for(const profile of PROFILES){
    const row=report.profiles.find(value=>value.name===profile.name);
    validateProfileReceipt(row,profile);
  }
}

export async function validateCurrentBrowserEvidence({browserDirectory,mediaDirectory,htmlPath,sourceSha256}){
  const json=async path=>JSON.parse(await readFile(path,'utf8'));
  const guards=await sourceGuards(),htmlBytes=(await stat(htmlPath)).size;
  const strict=await json(browserDirectory+'/checks.json'),capture=await json(browserDirectory+'/capture.json');
  const expected={sourceSha256,htmlBytes,guards};validateCurrentReport(strict,{...expected,capture:false});validateCurrentReport(capture,{...expected,capture:true});
  assert.notEqual(strict.runId,capture.runId,'Recorded and unrecorded evidence must be separate actual executions');
  for(const profile of PROFILES){
    const row=strict.profiles.find(value=>value.name===profile.name),captureRow=capture.profiles.find(value=>value.name===profile.name);
    for(const variant of VARIANTS){
      const raw=await json(browserDirectory+'/'+profile.name+'-'+variant+'-frames.json');
      validateRunIdentity(raw,strict.runId,guards);validateIntervalContinuity(raw);validateActiveWorkload(raw,variant);
      validateRawFrames(raw,profile,variant,sourceSha256,row.frameResults.find(result=>result.variant===variant));
      const recorded=await json(browserDirectory+'/'+profile.name+'-'+variant+'-capture-frames.json');
      validateRunIdentity(recorded,capture.runId,guards);assert.equal(recorded.sourceSha256,sourceSha256);validateIntervalContinuity(recorded);validateActiveWorkload(recorded,variant);
      for(const key of ['name','width','height','throttle'])assert.equal(recorded[key],profile[key]);
      assert.equal(recorded.variant,variant);assert.equal(recorded.capturing,true);assert.equal(recorded.workload,FRAME_WORKLOAD);
      const sorted=[...recorded.frames].sort((a,b)=>a-b),mean=recorded.frames.reduce((sum,value)=>sum+value,0)/600,p99=sorted[593],fps=1000/mean;
      near(recorded.meanMs,mean,'Recorded raw mean');near(recorded.meanFps,fps,'Recorded raw FPS');near(recorded.p99Ms,p99,'Recorded raw p99');
      assert.deepEqual(captureRow.frameResults.find(result=>result.variant===variant),{variant,frames:600,meanFps:fps,p99Ms:p99});
    }
    assert(captureRow.gameplay);assert.equal(captureRow.gameplay.variant,'international');assert.equal(captureRow.gameplay.startPly,0);assert(Number.isInteger(captureRow.gameplay.endPly)&&captureRow.gameplay.endPly>0);assert(captureRow.gameplay.elapsedMs>=10000);
    assert(captureRow.video);await validateClip(resolve(mediaDirectory,profile.name+'.webm'),captureRow.video,profile);
    const original=captureRow.video.original;assert.equal(original.file,profile.name+'-original.webm');assert.equal(original.bytes,(await stat(resolve(mediaDirectory,original.file))).size);assert(original.bytes>0);assert.equal(original.sha256,await hashFile(resolve(mediaDirectory,original.file)));
    assert.deepEqual(original.probe,await probeVideo(resolve(mediaDirectory,original.file)),'Original recording must also decode and match its receipt');
    assert.equal(original.probe.width,profile.width);assert.equal(original.probe.height,profile.height);
    near(captureRow.video.sourceSeekSeconds,original.probe.durationSeconds-10,'Excerpt must use the actual final ten seconds');
  }
  assert.deepEqual(await sourceGuards(),guards,'Sources changed while independently validating evidence');assert.equal(await hashFile(htmlPath),sourceSha256,'HTML changed while independently validating evidence');
}
