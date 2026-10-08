// Development evidence only. The standalone game never imports this module.
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,copyFileSync,readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const sources=['browser.ts','browser-evidence.ts','core.ts','ui.ts','shell.html','build.ts','play.html','package.json','package-lock.json','tsconfig.json','../../contract/contract.ts','../../contract/rng.ts'];
export function identity(path:string){const p=realpathSync(path),bytes=readFileSync(p);return {path:p,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
const sourceMap=()=>Object.fromEntries(sources.map(path=>[path,identity(path)]));
export const evidence:Record<string,unknown>={schema:'g01-browser-evidence/1',startedAt:new Date().toISOString(),status:'STARTED',sourcesBefore:sourceMap(),nodeBefore:identity(process.execPath),nodeVersion:process.version,profiles:[],functionalClock:'Functional bot and mixed-idle contexts use Playwright clock; native refresh contexts do not.',sampler:{intervals:300,warmup:0,filtered:0,timestamp:'native requestAnimationFrame callback',gate:{minimumFps:58,maximumP95Ms:18}},navigation:'exact on-disk play.html bytes via setContent; no direct file navigation claim',phone:'390x844 Chromium viewport at actual 4x CPU throttle; emulation only'};
mkdirSync('.tmp/g01-evidence',{recursive:true});
export function saveEvidence(){writeFileSync('.tmp/g01-evidence/browser-current.json',JSON.stringify(evidence,null,2)+'\n');}
saveEvidence();
export function bindBrowser(path:string,version:string){evidence.chromiumBefore=identity(path);evidence.chromiumVersion=version;saveEvidence();}

function command(name:string,args:string[]){const result=spawnSync(name,args,{encoding:'utf8',maxBuffer:16*1024*1024});assert.equal(result.status,0,result.error?.message||result.stderr||String(result.signal));return result.stdout;}
function tool(name:string){const path=command('which',[name]).trim();return {...identity(path),version:command(path,['-version'])};}
export function beginEncoding(args:string[],folder:string){
 const encoder=tool('ffmpeg');const frames=readdirSync(folder).filter(name=>/^\d{3}\.png$/.test(name)).sort().map(name=>({name,...identity(resolve(folder,name))}));assert.equal(frames.length,36);
 evidence.encoding={tool:encoder,args,sourceFrames:frames,startedAt:new Date().toISOString()};saveEvidence();return encoder;
}
export function finishEncoding(encoder:ReturnType<typeof beginEncoding>,status:number|null){
 assert.deepEqual(identity(encoder.path),{path:encoder.path,bytes:encoder.bytes,sha256:encoder.sha256});Object.assign(evidence.encoding as object,{closedAt:new Date().toISOString(),status});saveEvidence();
}
export function verifyCapture(path:string){
 const before=identity(path),ffmpeg=tool('ffmpeg'),ffprobe=tool('ffprobe');
 assert(before.bytes<10_000_000);copyFileSync(path,'.tmp/g01-evidence/current-capture.webm');assert.equal(identity('.tmp/g01-evidence/current-capture.webm').sha256,before.sha256);
 const probeArgs=['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=codec_name,width,height,nb_read_frames,r_frame_rate:format=size,duration','-of','json',path];
 const metadata=JSON.parse(command(ffprobe.path,probeArgs));const video=metadata.streams?.[0];
 assert.equal(video?.codec_name,'vp9');assert.equal(video.width,1920);assert.equal(video.height,1080);assert.equal(Number(video.nb_read_frames),36);assert.equal(video.r_frame_rate,'12/1');
 assert.equal(Number(metadata.format.duration),3);assert.equal(Number(metadata.format.size),before.bytes);assert(before.bytes<10_000_000);
 const decodeArgs=['-v','error','-xerror','-i',path,'-map','0:v:0','-f','framehash','-hash','sha256','-'];
 const framehash=command(ffmpeg.path,decodeArgs);const rows=framehash.split('\n').filter(line=>/^\s*\d+\s*,/.test(line));assert.equal(rows.length,36,'full current clip must decode through all 36 frames');
 writeFileSync('.tmp/g01-evidence/capture-framehash.txt',framehash);
 assert.deepEqual(identity(path),before);assert.deepEqual(identity(ffmpeg.path),{path:ffmpeg.path,bytes:ffmpeg.bytes,sha256:ffmpeg.sha256});assert.deepEqual(identity(ffprobe.path),{path:ffprobe.path,bytes:ffprobe.bytes,sha256:ffprobe.sha256});
 evidence.capture={path:resolve(path),file:before,probe:{tool:ffprobe,args:probeArgs,metadata},decode:{tool:ffmpeg,args:decodeArgs,frames:rows.length,completeFramehashSha256:createHash('sha256').update(framehash).digest('hex'),completeOutput:'.tmp/g01-evidence/capture-framehash.txt'}};saveEvidence();
}
export function finishEvidence(status:'PASS'|'FAIL',error?:unknown){
 evidence.status=status;evidence.finishedAt=new Date().toISOString();if(error!==undefined)evidence.failure=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:String(error);
 evidence.sourcesAfter=sourceMap();evidence.nodeAfter=identity(process.execPath);
 const chromium=evidence.chromiumBefore as ReturnType<typeof identity>|undefined;if(chromium)evidence.chromiumAfter=identity(chromium.path);
 saveEvidence();assert.deepEqual(evidence.sourcesAfter,evidence.sourcesBefore,'source bytes changed during browser run');assert.deepEqual(evidence.nodeAfter,evidence.nodeBefore);if(chromium)assert.deepEqual(evidence.chromiumAfter,chromium);
}
