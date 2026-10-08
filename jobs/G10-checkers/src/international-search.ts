import {searchMove} from './bots.js';
import type {SearchReport} from './bots.js';
import {probeEndgame} from './endgame.js';
import {createInternationalBlockDatabase,MissingInternationalBlock} from './international.js';
import type {InternationalBlockFile} from './international.js';
import {nextFloat,nextInt,pick,shuffle} from '../../../contract/rng';
import type {Rng,RngState} from '../../../contract/rng';
import type {BotSkill} from '../../../contract/constants';
import type {Position,Config} from './types.js';

export interface InternationalSearchRequest {position:Position;settings:Config;skill:BotSkill;cursor:RngState}
export interface InternationalBlockNeed {file:string;offset:number;length:number}
export type InternationalSearchResult={missing:InternationalBlockNeed[]}|{report:SearchReport;cursor:RngState};

// An incomplete attempt never exposes a move or an advanced random cursor.
// The same immutable request is repeated after all missing original bytes arrive.
export function searchWithInternationalBlocks(request:InternationalSearchRequest,sources:readonly InternationalBlockFile[],dictionary:Uint8Array):InternationalSearchResult{
  let cursor={...request.cursor};
  const rng:Rng={
    float(){const [value,next]=nextFloat(cursor);cursor=next;return value;},
    int(min,max){const [value,next]=nextInt(cursor,min,max);cursor=next;return value;},
    pick(items){const [value,next]=pick(cursor,items);cursor=next;return value;},
    shuffle(items){const [value,next]=shuffle(cursor,items);cursor=next;return value;},
    chance(probability){return rng.float()<probability;},state(){return {...cursor};},
  };
  if(request.skill!=='sharp')return {report:searchMove(request.position,request.settings,rng,request.skill),cursor};
  const database=createInternationalBlockDatabase(sources,dictionary),missing=new Map<string,InternationalBlockNeed>();
  const report=searchMove(request.position,request.settings,rng,request.skill,(board,variant,side)=>{
    try{return probeEndgame(board,variant,side,database);}
    catch(error){
      if(!(error instanceof MissingInternationalBlock))throw error;
      const need={file:error.file,offset:error.offset,length:error.length};
      missing.set(need.file+':'+need.offset,need);return null;
    }
  });
  if(missing.size)return {missing:[...missing.values()].sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:a.offset-b.offset)};
  return {report,cursor};
}
