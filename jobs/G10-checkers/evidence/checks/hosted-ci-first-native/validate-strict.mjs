import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {sourceGuards,hashFile,validateCurrentReport,validateRunIdentity,validateIntervalContinuity,validateActiveWorkload,validateRawFrames,PROFILES,VARIANTS} from '../../scripts/browser-evidence.mjs';
const base=resolve('.work/hosted-a9-browser'),directory=base+'/extracted/.work/browser',html=resolve('.work/play-full-guarded.html');
const json=async path=>JSON.parse(await readFile(path,'utf8'));
const report=await json(directory+'/checks.json'),guards=await sourceGuards(),sourceSha256=await hashFile(html),htmlBytes=(await stat(html)).size;
assert.equal(sourceSha256,'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801');assert.equal(htmlBytes,1390845993);
validateCurrentReport(report,{sourceSha256,htmlBytes,guards,capture:false});
const samples=[];
for(const profile of PROFILES)for(const variant of VARIANTS){
 const raw=await json(directory+'/'+profile.name+'-'+variant+'-frames.json');
 validateRunIdentity(raw,report.runId,guards);validateIntervalContinuity(raw);validateActiveWorkload(raw,variant);
 validateRawFrames(raw,profile,variant,sourceSha256,report.profiles.find(row=>row.name===profile.name).frameResults.find(row=>row.variant===variant));
 samples.push({profile:profile.name,variant,intervals:raw.frames.length,timestamps:raw.timestamps.length,meanFps:raw.meanFps,p99Ms:raw.p99Ms,maximumMs:Math.max(...raw.frames),nonce:raw.nonce});
}
assert.equal(new Set(samples.map(row=>row.nonce)).size,4);
assert.deepEqual(await sourceGuards(),guards);assert.equal(await hashFile(html),sourceSha256);
const receipt={status:'PASS',validatedAt:new Date().toISOString(),head:'a9c09a2dcef7fe8acf4014d879d87b550c99e9e4',run:37834410114,artifact:11574787510,artifactZipBytes:4296739,artifactZipSha256:'c84b1b73dcc787ce9c37b60f55ed073d1855e9fa6f9238e27e51e4e42d2c044c',sourceSha256,htmlBytes,currentMatchedGuards:Object.keys(guards).length,functionalChecks:30,intervals:2400,nativeTimestamps:2404,samples,
 scope:'Actual historical a9 strict-only hosted artifact, independently recomputed from all four raw consecutive samples and all exact functional/error/source/identity/active-state guards. Pure game/HTML/158 browser guards remain identical. Capture failed ffprobe ENOENT; no current-head full acceptance, causal local-failure repair, clip proof or delivered standalone is inferred.'};
await writeFile(base+'/independent-strict-validation.json',JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt));
