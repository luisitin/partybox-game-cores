import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
// Playwright's genuine encoder build lacks image2pipe. The workflow explicitly
// installs this system decoder, independently of the pinned capture encoder.
const decoder='/usr/bin/ffmpeg';
export function decoderIdentity(){
 assert(existsSync(decoder),'install system ffmpeg for actual capture decoding');
 const version=spawnSync(decoder,['-version'],{encoding:'utf8',timeout:10000});assert.equal(version.status,0,version.stderr);
 return {path:decoder,realPath:realpathSync(decoder),sha256:createHash('sha256').update(readFileSync(decoder)).digest('hex'),version:version.stdout.split('\n')[0]!};
}
export function decodeCurrentCapture(path:string){
 const identity=decoderIdentity();
 // Decode every real video frame, dropping output only after actual decoding.
 const result=spawnSync(decoder,['-v','info','-nostats','-progress','pipe:2','-i',path,'-f','image2pipe','-c:v','mjpeg','-'],{stdio:['ignore','ignore','pipe'],encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
 assert.equal(result.error,undefined,'decode error');assert.equal(result.signal,null,'decode terminated');assert.equal(result.status,0,result.stderr);
 const counts=[...(result.stderr??'').matchAll(/(?:^|\n)frame=(\d+)/g)].map(m=>Number(m[1]));assert(counts.length>0,'decoder did not report frames');
 const video=result.stderr.match(/Stream #0:\d+[^\n]*Video:\s*(\S+),[^\n]*?\b(\d{2,5})x(\d{2,5})\b/);assert(video,'actual video dimensions missing');
 assert.deepEqual(decoderIdentity(),identity,'decoder changed during actual decode');
 return {exit:result.status,frames:counts.at(-1)!,width:Number(video[2]),height:Number(video[3]),codec:video[1]!,identity,progress:result.stderr};
}
