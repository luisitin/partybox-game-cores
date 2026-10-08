import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdirSync,readFileSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {performance} from 'node:perf_hooks';

const atomic=(path,data)=>{
 const temporary=path+'.'+randomUUID()+'.tmp';
 writeFileSync(temporary,JSON.stringify(data,null,2)+'\n');renameSync(temporary,path);
};
export async function awaitFrameGrant(profile,sourceSha256,{timeoutMs=600000}={}){
 assert(['desktop','phone4x'].includes(profile));assert(/^[a-f0-9]{64}$/.test(sourceSha256));
 assert(Number.isFinite(timeoutMs)&&timeoutMs>0);
 const identity={profile,sourceSha256,attemptNonce:randomUUID()};
 const directory=process.env.G02_FRAME_BARRIER_DIR;
 if(!directory)return {...identity,coordination:'uncoordinated',readyUtc:null,grantUtc:null,base:null};
 mkdirSync(resolve(directory),{recursive:true});const base=resolve(directory,profile);
 for(const suffix of ['ready.json','grant.json','closed.json'])rmSync(base+'-'+suffix,{force:true});
 const readyUtc=new Date().toISOString();
 atomic(base+'-ready.json',{...identity,utc:readyUtc,intervals:600,minimumFps:59,maximumP99Ms:17,rawFiltering:'none',captureDuringSample:false});
 console.log(JSON.stringify({frameWindow:'READY',...identity,utc:readyUtc}));
 const began=performance.now();
 while(performance.now()-began<timeoutMs){
  let grant;try{grant=JSON.parse(readFileSync(base+'-grant.json','utf8'));}catch{grant=null;}
  if(grant&&typeof grant==='object'&&!Array.isArray(grant)&&
      Object.keys(grant).sort().join(',')==='attemptNonce,profile,sourceSha256'&&
      Object.keys(identity).every(key=>grant[key]===identity[key]))
   return {...identity,coordination:'root-granted',readyUtc,grantUtc:new Date().toISOString(),base};
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 const window={...identity,coordination:'root-granted',readyUtc,grantUtc:null,base};
 closeFrameWindow(window,{status:'failed',reason:'matching grant timed out'});
 throw new Error('G02 matching frame grant timed out');
}
export function closeFrameWindow(window,result){
 if(!window)return null;
 const {base,...identity}=window,receipt={...identity,...result,utc:new Date().toISOString()};
 if(base)atomic(base+'-closed.json',receipt);
 console.log(JSON.stringify({frameWindow:'CLOSED',...receipt}));return receipt;
}
