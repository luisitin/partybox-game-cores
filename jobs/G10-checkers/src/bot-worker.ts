import {searchMove} from './bots.js';
import {nextFloat,nextInt,pick,shuffle} from '../../../contract/rng';
import type {Rng,RngState} from '../../../contract/rng';
import type {BotSkill} from '../../../contract/constants';
import type {Position,Config} from './types.js';
import {searchWithInternationalBlocks} from './international-search.js';
import type {InternationalBlockNeed} from './international-search.js';
import {internationalIndexes} from './international-indexes.js';
import dictionary from '../data/international/tunstall-v2.bin';
declare const G10_BLOCK_INTERNATIONAL:boolean;
// This is a browser host boundary, separate from the pure game logic.
type Request={id:number;position:Position;settings:Config;skill:BotSkill;cursor:RngState};
type BlockReply={id:number;blocks:{file:string;offset:number;data:Uint8Array}[];more:boolean};
const scope=self as unknown as {onmessage:((event:MessageEvent<Request|BlockReply>)=>void)|null;postMessage:(value:unknown)=>void};
const cached=new Map<string,Map<number,Uint8Array>>();
let active:Request|null=null,needed=new Map<string,InternationalBlockNeed>(),cachedBlockCount=0;
const maximumCachedBlocks=32768;
function calculate(request:Request){
  if(G10_BLOCK_INTERNATIONAL&&request.position.variant==='international'){
    const sources=internationalIndexes.map(source=>({...source,blocks:[...(cached.get(source.name)??new Map<number,Uint8Array>())].map(([offset,data])=>({offset,data}))}));
    const result=searchWithInternationalBlocks(request,sources,dictionary);
    if('missing' in result){
      needed=new Map(result.missing.map(value=>[value.file+':'+value.offset,value]));
      scope.postMessage({id:request.id,blocksNeeded:result.missing});return;
    }
    active=null;needed.clear();scope.postMessage({id:request.id,...result});return;
  }
  let cursor={...request.cursor};
  const rng:Rng={
    float(){const [value,next]=nextFloat(cursor);cursor=next;return value;},
    int(min,max){const [value,next]=nextInt(cursor,min,max);cursor=next;return value;},
    pick(items){const [value,next]=pick(cursor,items);cursor=next;return value;},
    shuffle(items){const [value,next]=shuffle(cursor,items);cursor=next;return value;},
    chance(p){return rng.float()<p;},state(){return {...cursor};},
  };
  active=null;scope.postMessage({id:request.id,report:searchMove(request.position,request.settings,rng,request.skill),cursor});
}
scope.onmessage=event=>{
  const message=event.data;
  try{
    if('blocks' in message){
      if(!active||message.id!==active.id)return;
      if(!Array.isArray(message.blocks)||message.blocks.length>16||typeof message.more!=='boolean')throw new Error('Invalid offline block reply');
      for(const block of message.blocks){
        const key=block.file+':'+block.offset,wanted=needed.get(key);
        if(!wanted||!(block.data instanceof Uint8Array)||block.data.length!==wanted.length)throw new Error('Unexpected offline block');
        let file=cached.get(block.file);if(!file){file=new Map();cached.set(block.file,file);}
        if(!file.has(block.offset)){if(cachedBlockCount>=maximumCachedBlocks)throw new Error('Offline request exceeded its bounded cache');cachedBlockCount++;}
        file.set(block.offset,new Uint8Array(block.data));needed.delete(key);
      }
      if(message.more)return;
      if(needed.size)throw new Error('Incomplete offline block reply');
      calculate(active);return;
    }
    active=message;needed.clear();
    // Evict only between requests; an active calculation keeps every original
    // byte it has already asked for, so retries can reach an exact result.
    if(cachedBlockCount>maximumCachedBlocks/2){cached.clear();cachedBlockCount=0;}
    calculate(message);
  }catch{const id=active?.id??message.id;active=null;needed.clear();scope.postMessage({id,error:'Bot calculation could not finish'});}
};
