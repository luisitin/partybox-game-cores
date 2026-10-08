// Independently inspect actual clip bytes/decoder metadata and complete current functional coverage.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname,join,basename} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const digest=d=>createHash('sha256').update(d).digest('hex'),walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):[join(p,e.name)]);
// ffprobe versions may add empty stream_groups/programs arrays. Compare every
// requested codec, size and duration field; retain the original report verbatim.
const metadataFields=m=>({format:{duration:m.format?.duration},streams:m.streams?.map(s=>({codec_name:s.codec_name,width:s.width,height:s.height}))});
try{
 const path=resolve(process.argv[2]??readFileSync('.tmp/visual/browser-native-current-path.txt','utf8').trim()),r=JSON.parse(readFileSync(path,'utf8'));
 assert.equal(r.version,1);assert.equal(r.fileOpened,true);assert.equal(r.urlMode,'disk');assert.equal(typeof r.nativeOnly,'boolean');if(!process.argv.includes('--allow-partial'))assert.equal(r.nativeOnly,false);
 assert.equal(r.pageErrors,0);assert.equal(r.outgoingRequests,0);assert.deepEqual(r.pageErrorsObserved,[]);assert.deepEqual(r.outgoingRequestsObserved,[]);
 const paths=[...walk('start'),...walk('../../contract'),'../../.github/workflows/G08.yml','play.html','package.json','package-lock.json','tsconfig.json','vitest.config.ts'].sort(),current=Object.fromEntries(paths.map(p=>[p.replaceAll('\\','/'),digest(readFileSync(p))]));assert.deepEqual(r.startHashes,current);assert.deepEqual(r.endHashes,current);
 const gates=['originalClient','nativeKeyboard','arrowFocus','nativeDrag','nativeCancel','privateHandoff','otherPhonePrivate','publicCountsOnly','pauseResume','reducedMotion','spanishFiveByFive','allPhasesToResults','longNamesFit','fullSixteenSeatHotseat','sixteenTiedWinnersFit','cancelRestartKeepsProgress','newGameFreshSeed','handoffAndGridFocus','spanishHostControls','botObserverPublicOnly','observerFullFinalAwards'];assert.deepEqual(Object.keys(r.gates).sort(),[...gates,'rosters'].sort());for(const gate of gates)assert.equal(r.gates[gate],true,gate);assert.deepEqual(r.gates.rosters,[1,2,3,8,16]);
 const expected=['native-private-input-and-results.webm','spanish-host.webm','max-roster-long-names.webm','restart-preserves-progress.webm','bot-observer.webm'];assert(Array.isArray(r.videos));assert.deepEqual(r.videos.map(v=>basename(v.path)).sort(),expected.sort());
 for(const v of r.videos){const name=basename(v.path);assert(expected.includes(name));const file=join(dirname(path),name),bytes=readFileSync(file);assert(bytes.length>0&&bytes.length<10*1024*1024);assert.equal(v.bytes,bytes.length);assert.equal(v.sha256,digest(bytes));assert.equal(bytes.subarray(0,4).toString('hex'),'1a45dfa3');const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration:stream=codec_name,width,height','-of','json',file],{encoding:'utf8'}));assert.deepEqual(metadataFields(v.metadata),metadataFields(metadata));assert(Number(metadata.format.duration)>0);assert.equal(metadata.streams.length,1);assert.equal(metadata.streams[0].codec_name,'vp8');assert.equal(metadata.streams[0].width,390);assert.equal(metadata.streams[0].height,844);execFileSync('ffmpeg',['-v','error','-xerror','-i',file,'-f','null','-'],{stdio:'pipe',timeout:120000});}
 for(const [key,name]of [['videoBytes','native-private-input-and-results.webm'],['spanishVideoBytes','spanish-host.webm'],['layoutVideoBytes','max-roster-long-names.webm'],['restartVideoBytes','restart-preserves-progress.webm'],['observerVideoBytes','bot-observer.webm']])assert.equal(r[key],r.videos.find(v=>basename(v.path)===name).bytes);
 console.log(JSON.stringify({verified:true,sourceGuards:paths.length,functionalGates:gates.length,rosters:5,clips:5,nativeOnly:r.nativeOnly}));
}catch(error){console.error(String(error));process.exitCode=1;}
