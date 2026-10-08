import database from '../data/endgames.json';
import type {Piece,Side,Variant} from './types.js';
import {legalMoves,applyMove,positionKey} from './moves.js';
import {chinookCorpus} from './chinook-corpus.js';
import {internationalCorpus} from './international-corpus.js';
export interface TablebaseHit {outcome:-1|0|1;dtm:number|null;source:'generated-table'|'closed-captures'|'terminal'|'chinook'|'kingsrow';pieceCount:number}
export type TableRow=[string,-1|0|1,number|null];
const rows=database.rows as unknown as readonly TableRow[];
export const databaseCoverage=()=>({...JSON.parse(JSON.stringify(database.coverage)),byVariant:{american:{fullQuietSixPieceCorpus:!!chinookCorpus,corpus:chinookCorpus?.coverage()??null},international:{fullQuietSixPieceCorpus:false,maximumInstalledPieces:internationalCorpus?5:2,corpus:internationalCorpus?.coverage()??null,scope:'Actual Kingsrow2–5 theoretical WLD plus exact closed capture components; quiet6-piece partitions remain pending'}}}) as unknown;
function lookup(key:string):TableRow|null{
  let low=0,high=rows.length;
  while(low<high){const mid=(low+high)>>>1;if(rows[mid][0]<key)low=mid+1;else high=mid;}
  return low<rows.length&&rows[low][0]===key?rows[low]:null;
}
// The database is theoretical board+side WDL. It does not silently claim to
// incorporate a game's earlier repetitions or accumulated draw allowances.
export function probeEndgame(board:readonly Piece[],variant:Variant,side:Side):TablebaseHit|null{
  const count=board.filter(piece=>piece!==0).length;if(count>6)return null;
  const cache=new Map<string,TablebaseHit|null>();
  function solve(current:readonly Piece[],turn:Side):TablebaseHit|null{
    const key=positionKey(current,turn,variant);if(cache.has(key))return cache.get(key)!;
    const pieces=current.filter(piece=>piece!==0).length;
    const own=current.some(piece=>piece!==0&&Math.sign(piece)===turn),other=current.some(piece=>piece!==0&&Math.sign(piece)===-turn);
    if(!own||!other){const outcome=own?1:other?-1:0;return {outcome,dtm:outcome===0?null:0,source:'terminal',pieceCount:pieces};}
    const found=lookup(key);
    if(found)return {outcome:found[1],dtm:found[2],source:'generated-table',pieceCount:pieces};
    if(variant==='american'&&chinookCorpus){const outcome=chinookCorpus.probe(current,turn);if(outcome!==null)return {outcome,dtm:null,source:'chinook',pieceCount:pieces};}
    if(variant==='international'&&internationalCorpus){const outcome=internationalCorpus.probe(current,turn);if(outcome!==null)return {outcome,dtm:null,source:'kingsrow',pieceCount:pieces};}
    const moves=legalMoves(current,variant,turn);
    if(!moves.length)return {outcome:-1,dtm:0,source:'terminal',pieceCount:pieces};
    if(!moves[0].captures.length){cache.set(key,null);return null;}
    // Every edge removes a piece, so this proof graph is finite and acyclic.
    const children=moves.map(move=>solve(applyMove(current,move),-turn as Side));
    if(children.some(child=>child===null)){cache.set(key,null);return null;}
    const known=children as TablebaseHit[];
    const losing=known.filter(child=>child.outcome===-1);
    let hit:TablebaseHit;
    if(losing.length)hit={outcome:1,dtm:losing.some(child=>child.dtm===null)?null:1+losing.reduce((best,child)=>Math.min(best,child.dtm!),Infinity),source:'closed-captures',pieceCount:pieces};
    else if(known.some(child=>child.outcome===0))hit={outcome:0,dtm:null,source:'closed-captures',pieceCount:pieces};
    else hit={outcome:-1,dtm:known.some(child=>child.dtm===null)?null:1+known.reduce((best,child)=>Math.max(best,child.dtm!),0),source:'closed-captures',pieceCount:pieces};
    cache.set(key,hit);return hit;
  }
  return solve(board,side);
}
