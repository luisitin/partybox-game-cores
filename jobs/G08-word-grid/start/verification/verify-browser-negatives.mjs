// Mutate real accepted evidence only; never fabricate a passing frame sample.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const path=readFileSync('.tmp/visual/browser-frames-current-path.txt','utf8').trim(),check=p=>spawnSync(process.execPath,['start/verification/verify-browser.mjs',p],{encoding:'utf8'});
assert.equal(check(path).status,0,'fresh real baseline must pass');const original=JSON.parse(readFileSync(path,'utf8'));let rejected=0;
const cases=[['missing-profile',r=>r.profiles.pop()],['duplicate-profile',r=>r.profiles[3]=r.profiles[0]],['wrong-language',r=>r.profiles[2].lang='en'],['empty-raw',r=>r.profiles[0].intervalsMs=[]],['stale-source',r=>r.startHashes['play.html']='0'.repeat(64)],['missing-checker',r=>delete r.startHashes['start/verification/verify-browser.mjs']],['changed-end-source',r=>r.endHashes['play.html']='f'.repeat(64)],['outlier',r=>r.profiles[0].intervalsMs[0]=10000],['filtered',r=>r.frameFiltering='positive-only'],['network',r=>r.outgoingRequests=['https://example.invalid/']],['page-error',r=>r.pageErrors=['error']],['wrong-target',r=>r.target='http://localhost/'],['wrong-profile-size',r=>r.profiles[2].grid='4x4'],['zero-interval',r=>r.profiles[0].intervalsMs[0]=0]];
for(const [name,mutate]of cases){const temp=mkdtempSync(join(tmpdir(),'g08-negative-'));try{cpSync(dirname(path),temp,{recursive:true});const r=structuredClone(original);mutate(r);
 if(name==='outlier'){const row=r.profiles[0],dt=row.intervalsMs,sorted=[...dt].sort((a,b)=>a-b);row.milliseconds=dt.reduce((a,b)=>a+b,0);row.meanMs=row.milliseconds/600;row.fps=1000/row.meanMs;row.p95Ms=sorted[569];row.p99Ms=sorted[593];row.maxMs=sorted[599];}
 for(const row of r.profiles){const {rawSha256,...raw}=row,bytes=JSON.stringify(raw,null,2)+'\n';writeFileSync(join(temp,row.rawFile),bytes);row.rawSha256=createHash('sha256').update(bytes).digest('hex');}
 const candidate=join(temp,'report.json');writeFileSync(candidate,JSON.stringify(r));assert.notEqual(check(candidate).status,0,name);rejected++;
 }finally{rmSync(temp,{recursive:true,force:true});}}
assert.notEqual(check(join(tmpdir(),'g08-nonexistent-report.json')).status,0);console.log(JSON.stringify({realBaseline:true,negativeCases:rejected+1}));
