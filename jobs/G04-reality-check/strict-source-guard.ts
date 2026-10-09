import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {dirname} from 'node:path';
import {realpathSync} from 'node:fs';
import {decoderIdentity} from './strict-decode.ts';

export type Hashes=Record<string,string>;
export const sha256=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
const walk=(directory:string):string[]=>readdirSync(directory).sort().flatMap(name=>{
 const path=join(directory,name);return statSync(path).isDirectory()?walk(path):[path];
});
// Cover the actual Node-side schema/runtime used by the checks, in addition to
// the self-contained page and all local checker/build/type inputs.
export function strictSourcePaths():string[]{
 const local=readdirSync('.').filter(name=>name.endsWith('.ts'));
 const contracts=readdirSync('../../contract').filter(name=>name.endsWith('.ts')).map(name=>'../../contract/'+name);
 const inputs=['play.html','shell.html','samples.json','manifest.json','property-seeds.json','host-deadline-equality-old-six-runner.txt','package.json','package-lock.json','tsconfig.json','THIRD-PARTY-LICENSES.md','../../contract/package.json','../../.github/workflows/G04.yml',...walk('fixtures')];
 const packages=['node_modules/zod','../../contract/node_modules/zod','node_modules/playwright','node_modules/playwright-core'];
 const runtime=packages.flatMap(directory=>walk(directory).filter(path=>/\.(?:js|cjs|mjs|json)$/.test(path)||/\/LICENSE(?:\.txt)?$/.test(path)));
 return [...new Set([...local,...contracts,...inputs,...runtime])].sort();
}
export function strictSourceHashes():Hashes{return Object.fromEntries(strictSourcePaths().map(path=>[path,sha256(readFileSync(path))]));}
export function strictRuntimeIdentity(){
 const zod=fileURLToPath(import.meta.resolve('zod'));
 const versions=Object.fromEntries(['zod','playwright','playwright-core'].map(name=>[name,(JSON.parse(readFileSync('node_modules/'+name+'/package.json','utf8')) as {version:string}).version]));
 assert.equal(versions.zod,'4.6.5');assert.equal(versions.playwright,'1.56.1');assert.equal(versions['playwright-core'],'1.56.1');
 const require=createRequire(import.meta.url),{registry}=require(join(dirname(require.resolve('playwright-core/package.json')),'lib/server/registry/index.js')) as {registry:{findExecutable(name:string):{executablePath():string}|undefined}};
 const encoder=registry.findExecutable('ffmpeg')?.executablePath();assert(encoder);
 return {versions,nodeVersion:process.version,v8Version:process.versions.v8,zodModule:relative(resolve('.'),zod),zodModuleSha256:sha256(readFileSync(zod)),captureEncoder:{registryPath:encoder,realPath:realpathSync(encoder),sha256:sha256(readFileSync(encoder))},captureDecoder:decoderIdentity()};
}
