import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';

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
 return {versions,zodModule:relative(resolve('.'),zod),zodModuleSha256:sha256(readFileSync(zod))};
}
