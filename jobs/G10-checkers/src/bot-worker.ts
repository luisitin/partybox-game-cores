import {searchMove} from './bots.js';
import {nextFloat,nextInt,pick,shuffle} from '../../../contract/rng';
import type {Rng,RngState} from '../../../contract/rng';
import type {BotSkill} from '../../../contract/constants';
import type {Position,Config} from './types.js';
// This is a browser host boundary, separate from the pure game logic.
type Request={id:number;position:Position;settings:Config;skill:BotSkill;cursor:RngState};
const scope=self as unknown as {onmessage:((event:MessageEvent<Request>)=>void)|null;postMessage:(value:unknown)=>void};
scope.onmessage=event=>{
  const request=event.data;let cursor={...request.cursor};
  const rng:Rng={
    float(){const [value,next]=nextFloat(cursor);cursor=next;return value;},
    int(min,max){const [value,next]=nextInt(cursor,min,max);cursor=next;return value;},
    pick(items){const [value,next]=pick(cursor,items);cursor=next;return value;},
    shuffle(items){const [value,next]=shuffle(cursor,items);cursor=next;return value;},
    chance(p){return rng.float()<p;},state(){return {...cursor};},
  };
  try{scope.postMessage({id:request.id,report:searchMove(request.position,request.settings,rng,request.skill),cursor});}
  catch{scope.postMessage({id:request.id,error:'Bot calculation could not finish'});}
};
