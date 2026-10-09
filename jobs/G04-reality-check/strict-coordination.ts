import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdirSync,readFileSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';

export type Identity={profile:'tv'|'phone';sourceSha256:string;attemptNonce:string};
export type Window=Identity&{coordination:'root-granted'|'uncoordinated';readyUtc:string|null;grantUtc:string|null;base:string|null};
export type Closure=Omit<Window,'base'>&Record<string,unknown>&{utc:string};
export function matchesGrant(value:unknown,identity:Identity):boolean{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;
 const record=value as Record<string,unknown>;
 return Object.keys(record).sort().join(',')==='attemptNonce,profile,sourceSha256'&&Object.entries(identity).every(([key,item])=>record[key]===item);
}
export const atomicJson=(path:string,value:unknown)=>{const temporary=path+'.'+randomUUID()+'.tmp';writeFileSync(temporary,JSON.stringify(value,null,2)+'\n');renameSync(temporary,path);};
export async function awaitStrictGrant(profile:Identity['profile'],sourceSha256:string,setupWitness:unknown,timeoutMs=600000):Promise<Window>{
 assert(/^[a-f0-9]{64}$/.test(sourceSha256));assert(timeoutMs>0&&Number.isFinite(timeoutMs));
 const identity:Identity={profile,sourceSha256,attemptNonce:randomUUID()},directory=process.env.G04_STRICT_FRAME_BARRIER_DIR;
 if(!directory)return {...identity,coordination:'uncoordinated',readyUtc:null,grantUtc:null,base:null};
 mkdirSync(resolve(directory),{recursive:true});const base=resolve(directory,profile);
 for(const suffix of ['ready.json','grant.json','closed.json'])rmSync(base+'-'+suffix,{force:true});
 const readyUtc=new Date().toISOString();atomicJson(base+'-ready.json',{...identity,utc:readyUtc,intervals:600,rawFiltering:'none',performanceWhileRecording:false,setupWitness});
 console.log(JSON.stringify({frameWindow:'READY',...identity,utc:readyUtc}));
 const started=performance.now();
 while(performance.now()-started<timeoutMs){
  let value:unknown;try{value=JSON.parse(readFileSync(base+'-grant.json','utf8'));}catch{value=null;}
  if(matchesGrant(value,identity))return {...identity,coordination:'root-granted',readyUtc,grantUtc:new Date().toISOString(),base};
  await new Promise(done=>setTimeout(done,100));
 }
 closeStrictWindow({...identity,coordination:'root-granted',readyUtc,grantUtc:null,base},{status:'failed',reason:'matching grant timed out'});
 throw new Error('G04 matching frame grant timed out');
}
export function closeStrictWindow(window:Window,result:Record<string,unknown>):Closure{
 const {base,...identity}=window,receipt={...identity,...result,utc:new Date().toISOString()};
 if(base)atomicJson(base+'-closed.json',receipt);
 console.log(JSON.stringify({frameWindow:'CLOSED',...receipt}));return receipt;
}
