// Private offline worker: only the acting seat's public observation crosses here.
// The original choose() policy and PRNG are shared verbatim with the synchronous bot.
import {choose,type Observation,type Input} from './core.ts';
import {createRng,type RngState} from '../../contract/rng.ts';
export interface StrongRequest {id:number;seed:number;observation:Observation}
export interface StrongReply {id:number;input:Input|null;rngState:RngState;error?:true}
const scope=globalThis as unknown as {
 onmessage:((event:MessageEvent<StrongRequest>)=>void)|null;
 postMessage:(reply:StrongReply)=>void;
};
scope.onmessage=({data})=>{
 const rng=createRng(data.seed);
 try{const input=choose(data.observation,rng,'sharp');scope.postMessage({id:data.id,input,rngState:rng.state()});}
 catch{scope.postMessage({id:data.id,input:null,rngState:rng.state(),error:true});}
};
