import type {Piece,Side,Variant} from './types.js';
import type {TableRow} from './endgame.js';
import {geometry,legalMoves,applyMove,positionKey} from './moves.js';
export interface RetrogradeResult {rows:TableRow[];positions:number;edges:number;wins:number;losses:number;draws:number;maximumDtm:number}
export function generateTwoPieceTable(variant:Variant):RetrogradeResult{
  const g=geometry(variant),positions:{board:Piece[];side:Side}[]=[],index=new Map<string,number>();
  const add=(board:Piece[],side:Side)=>{
    const key=positionKey(board,side,variant);if(index.has(key))return;
    index.set(key,positions.length);positions.push({board,side});
  };
  const valid=(square:number,piece:Piece)=>Math.abs(piece)===2||g.rows[square]!==(piece>0?0:g.size-1);
  for(let white=0;white<g.count;white++)for(const w of [1,2] as const)if(valid(white,w)){
    for(let black=0;black<g.count;black++)if(white!==black)for(const b of [-1,-2] as const)if(valid(black,b)){
      const board=Array<Piece>(g.count).fill(0);board[white]=w;board[black]=b;add(board,1);add(board,-1);
    }
  }
  for(let square=0;square<g.count;square++)for(const piece of [1,2,-1,-2] as const)if(valid(square,piece)){
    const board=Array<Piece>(g.count).fill(0);board[square]=piece;add(board,1);add(board,-1);
  }
  const count=positions.length,predecessors=Array.from({length:count},()=>[] as number[]),remaining=new Int32Array(count);
  const values=new Int8Array(count).fill(2),distance=new Int32Array(count),maxChild=new Int32Array(count),queue:number[]=[];
  let edges=0;
  for(let i=0;i<count;i++){
    const {board,side}=positions[i],own=board.some(piece=>piece!==0&&Math.sign(piece)===side),other=board.some(piece=>piece!==0&&Math.sign(piece)===-side);
    const moves=legalMoves(board,variant,side);
    if(!own||!other||!moves.length){values[i]=!own||!moves.length?-1:1;queue.push(i);continue;}
    const children=new Set<number>();
    for(const move of moves){
      const child=index.get(positionKey(applyMove(board,move),-side as Side,variant));
      if(child===undefined)throw new Error('Two-piece graph is not closed');children.add(child);
    }
    remaining[i]=children.size;
    for(const child of children){predecessors[child].push(i);edges++;}
  }
  for(let cursor=0;cursor<queue.length;cursor++){
    const child=queue[cursor];
    for(const parent of predecessors[child]){
      if(values[parent]!==2)continue;
      if(values[child]===-1){values[parent]=1;distance[parent]=distance[child]+1;queue.push(parent);}
      else if(values[child]===1){
        remaining[parent]--;maxChild[parent]=Math.max(maxChild[parent],distance[child]);
        if(remaining[parent]===0){values[parent]=-1;distance[parent]=maxChild[parent]+1;queue.push(parent);}
      }
    }
  }
  let wins=0,losses=0,draws=0,maximumDtm=0;
  const rows=positions.map(({board,side},i):TableRow=>{
    if(values[i]===2){values[i]=0;draws++;}else if(values[i]===1)wins++;else losses++;
    maximumDtm=Math.max(maximumDtm,distance[i]);
    return [positionKey(board,side,variant),values[i] as -1|0|1,values[i]===0?null:distance[i]];
  }).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
  return {rows,positions:count,edges,wins,losses,draws,maximumDtm};
}
