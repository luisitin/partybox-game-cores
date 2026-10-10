import {createRequire} from 'node:module';
import {dirname,join} from 'node:path';
import {existsSync,statSync,readdirSync,readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {registry}=require(join(dirname(require.resolve('playwright-core/package.json')),'lib/server/registry/index.js')) as {registry:{findExecutable(name:string):{executablePath():string}|undefined}};
const encoder=(()=>{const path=registry.findExecutable('ffmpeg')?.executablePath();assert(path&&existsSync(path),'install the pinned capture encoder with npx playwright install ffmpeg');return path;})();
export function encodeCapture(directory:string,path:string){
 const input=Buffer.concat(readdirSync(directory).filter(n=>n.endsWith('.jpg')).sort().map(n=>readFileSync(join(directory,n))));
 assert(input.length>0,'capture needs JPEG frames');
 const result=spawnSync(encoder,['-y','-loglevel','error','-f','image2pipe','-framerate','12','-c:v','mjpeg','-i','pipe:0','-c:v','libvpx','-b:v','700k','-an',path],{input,encoding:'utf8',timeout:60000});
 assert.equal(result.status,0,result.stderr||result.error?.message);
 assert(statSync(path).size>0&&statSync(path).size<10*1024*1024);
}
