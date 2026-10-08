import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const sum=b=>createHash('sha256').update(b).digest('hex');
const manifest=await readFile('SHA256SUMS.txt','utf8'),covered=new Set();
for(const line of manifest.trim().split('\n')){
 const [hash,p]=line.split('  ');assert(/^[0-9a-f]{64}$/.test(hash));assert(!p.startsWith('/')&&!p.includes('..'));assert(!covered.has(p));
 assert.equal(sum(await readFile(p)),hash,'stale delivered file '+p);covered.add(p);
}
async function walk(dir='.') {
 for(const e of await readdir(dir,{withFileTypes:true})) {
  if(['.work','dist','node_modules','.git'].includes(e.name))continue;
  const p=dir==='.'?e.name:dir+'/'+e.name;
  if(e.isDirectory())await walk(p);else if(e.isFile()&&p!=='SHA256SUMS.txt'){
   assert(covered.has(p),'manifest omitted '+p);const bytes=(await stat(p)).size;
   assert(bytes<=30*1024*1024,'file exceeds 30MB');if(p.startsWith('media/'))assert(bytes<10*1024*1024,'video exceeds 10MB');
  }
 }
}await walk();
const inputs=['manifest.json',...(await readdir('fixtures')).map(p=>'fixtures/'+p)];
const before=Object.fromEntries(await Promise.all(inputs.map(async p=>[p,sum(await readFile(p))])));
for(let run=0;run<2;run++) {
 const result=spawnSync(process.execPath,['scripts/fixtures.mjs'],{encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);
 for(const p of inputs)assert.equal(sum(await readFile(p)),before[p],'non-deterministic generated fixture '+p);
}
const html=await readFile('play.html','utf8');assert(!/<(?:script|link)[^>]+(?:src|href)=['"]https?:/i.test(html));
const browserSnapshot=JSON.parse(await readFile('evidence/browser/report.json','utf8'));
assert.equal(browserSnapshot.passed,true,'latest delivered browser snapshot must pass');
assert.equal(browserSnapshot.htmlSha256,sum(Buffer.from(html)),'browser evidence must match delivered page');
for(const p of browserSnapshot.profiles){
 assert.equal(p.sampleCount,600,'snapshot must measure 600 frames');
 const raw=JSON.parse(await readFile('evidence/browser/'+p.frameFile,'utf8'));
 assert.equal(raw.timestampsMs.length,601,'raw frame timestamps omitted');
 assert.equal(raw.intervalsMs.length,600,'raw frame intervals omitted');
 assert(raw.intervalsMs.every(ms=>Number.isFinite(ms)&&ms>0),'invalid measured interval');
 const mean=raw.intervalsMs.reduce((sum,ms)=>sum+ms,0)/600;
 assert(Math.abs(1000/mean-p.fps)<1e-7,'snapshot FPS differs from all raw frames');
 const p99=[...raw.intervalsMs].sort((a,b)=>a-b)[Math.ceil(600*.99)-1];
 assert.equal(p.p99Ms,p99,'snapshot percentile differs from all raw frames');
 for(let i=0;i<600;i++)assert(Math.abs(raw.timestampsMs[i+1]-raw.timestampsMs[i]-raw.intervalsMs[i])<1e-7,'interval does not match consecutive timestamps');
 assert(p.fps>=59&&p.p99Ms<=17,'delivered browser measurement fails its unchanged gate');
}
const zodLicense=await readFile('node_modules/zod/LICENSE','utf8');
assert((await readFile('THIRD-PARTY-LICENSES.txt','utf8')).includes(zodLicense),'Zod notice must match the pinned package');
assert(html.includes(zodLicense),'standalone page must retain the bundled Zod permission/copyright notice');
assert(html.includes(await readFile('LICENSE','utf8')),'standalone page must retain the original game license too');
for(const file of await readdir('src'))if(file.endsWith('.ts')&&file!=='browser.ts') {
 const text=await readFile('src/'+file,'utf8');assert(!/Math\.random|Date\.now|setTimeout|setInterval|\bfetch\(|\bconsole\.|from ['"]node:/.test(text),'impure core '+file);
}
console.log(JSON.stringify({suite:'integrity',fileHashes:covered.size,regenerationRuns:2,byteIdentical:true,coreNoIo:true,mediaUnder10MB:true}));
