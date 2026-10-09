import {describe,it,expect} from 'vitest';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {setTimeout as delay} from 'node:timers/promises';
import {waitForFrameGrant,parseFrameGrantTimeout} from './frame-coordination';
const hash='a'.repeat(64);
async function ready(directory:string){for(let i=0;i<60;i++){try{return JSON.parse(await readFile(join(directory,'en-4x4-TV-ready.json'),'utf8')) as Record<string,unknown>;}catch{await delay(10);}}throw Error('ready missing');}
describe('actual frame coordination preflight',()=>{
 it('defaults to a full600second coordination window',()=>{expect(parseFrameGrantTimeout(undefined)).toBe(600000);expect(parseFrameGrantTimeout('700000')).toBe(700000);});
 for(const input of ['', '-1','0','NaN','Infinity','599999','1e6','600001.5','3600001'])it(`rejects invalid production timeout ${input}`,()=>{expect(()=>parseFrameGrantTimeout(input)).toThrow();});
 it('accepts only a fresh exact source/profile/nonce tuple',async()=>{const directory=await mkdtemp(join(tmpdir(),'g08-grant-'));try{const pending=waitForFrameGrant(directory,'en-4x4-TV',hash,2000),r=await ready(directory);await writeFile(join(directory,'en-4x4-TV-grant.json'),JSON.stringify({profile:r.profile,sourceSha256:r.sourceSha256,attemptNonce:r.attemptNonce}));expect(await pending).toEqual(r);}finally{await rm(directory,{recursive:true,force:true});}});
 for(const defect of ['old-nonce','wrong-source','wrong-profile','extra-field','malformed'])it(`rejects ${defect}`,async()=>{const directory=await mkdtemp(join(tmpdir(),'g08-grant-'));try{const pending=waitForFrameGrant(directory,'en-4x4-TV',hash,2000),rejected=expect(pending).rejects.toThrow(),r=await ready(directory),grant:Record<string,unknown>={profile:r.profile,sourceSha256:r.sourceSha256,attemptNonce:r.attemptNonce};if(defect==='old-nonce')grant.attemptNonce='old';if(defect==='wrong-source')grant.sourceSha256='b'.repeat(64);if(defect==='wrong-profile')grant.profile='es-5x5-TV';if(defect==='extra-field')grant.approved=true;await writeFile(join(directory,'en-4x4-TV-grant.json'),defect==='malformed'?'{':JSON.stringify(grant));await rejected;}finally{await rm(directory,{recursive:true,force:true});}});
 it('times out without a grant and keeps the readiness receipt',async()=>{const directory=await mkdtemp(join(tmpdir(),'g08-grant-'));try{await expect(waitForFrameGrant(directory,'en-4x4-TV',hash,20)).rejects.toThrow('timeout');expect((await ready(directory)).sourceSha256).toBe(hash);}finally{await rm(directory,{recursive:true,force:true});}});
});
