import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
const require=createRequire(import.meta.url);
export function decodeCurrentCapture(path:string){
 const {registry}=require(join(dirname(require.resolve('playwright-core/package.json')),'lib/server/registry/index.js')) as {registry:{findExecutable(name:string):{executablePath():string}|undefined}};
 const encoder=registry.findExecutable('ffmpeg')?.executablePath();assert(encoder&&existsSync(encoder),'install pinned Playwright ffmpeg');
 // This pinned binary supports VP8 decode, JPEG encoding and image2pipe. Drop
 // decoded output while retaining actual progress and the decoder exit code.
 const result=spawnSync(encoder,['-v','error','-nostats','-progress','pipe:2','-i',path,'-f','image2pipe','-c:v','mjpeg','-'],{stdio:['ignore','ignore','pipe'],encoding:'utf8',timeout:60000,maxBuffer:1024*1024});
 assert.equal(result.error,undefined,'decode error');assert.equal(result.signal,null,'decode terminated');assert.equal(result.status,0,result.stderr);
 const counts=[...(result.stderr??'').matchAll(/(?:^|\n)frame=(\d+)/g)].map(m=>Number(m[1]));assert(counts.length>0,'decoder did not report frames');
 return {exit:result.status,frames:counts.at(-1)!,progress:result.stderr};
}
