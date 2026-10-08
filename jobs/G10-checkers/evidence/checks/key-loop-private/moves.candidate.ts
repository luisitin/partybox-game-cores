import type {Move,Piece,Side,Variant} from './types.js';

const directions=[[-1,-1],[-1,1],[1,-1],[1,1]] as const;
function makeGeometry(size:number){
  const count=size*size/2;
  const rows=Array.from({length:count},(_,square)=>Math.floor(square/(size/2)));
  const columns=rows.map((row,square)=>2*(square%(size/2))+(row+1)%2);
  const index=(row:number,column:number)=>row<0||row>=size||column<0||column>=size||(row+column)%2!==1?
    -1:row*(size/2)+Math.floor(column/2);
  const next=directions.map(([dy,dx])=>Object.freeze(rows.map((row,square)=>index(row+dy,columns[square]+dx))));
  return Object.freeze({size,count,rows:Object.freeze(rows),columns:Object.freeze(columns),next:Object.freeze(next)});
}
const american=makeGeometry(8),international=makeGeometry(10);
export const geometry=(variant:Variant)=>variant==='american'?american:international;
const isCrown=(variant:Variant,square:number,side:Side)=>geometry(variant).rows[square]===(side===1?0:geometry(variant).size-1);
const own=(piece:number,side:Side)=>piece!==0&&Math.sign(piece)===side;
const enemy=(piece:number,side:Side)=>piece!==0&&Math.sign(piece)===-side;
const comparePath=(a:Move,b:Move)=>{
  for(let i=0;i<Math.min(a.path.length,b.path.length);i++)if(a.path[i]!==b.path[i])return a.path[i]-b.path[i];
  return a.path.length-b.path.length;
};

export function initialBoard(variant:Variant):Piece[]{
  const g=geometry(variant),home=variant==='american'?3:4;
  return g.rows.map(row=>row<home?-1:row>=g.size-home?1:0) as Piece[];
}

// Production walks a precomputed dark-square adjacency graph and undoes its
// temporary local board edits. The independent oracle uses a full matrix.
export function legalMoves(source:readonly Piece[],variant:Variant,side:Side):Move[]{
  const g=geometry(variant);
  if(source.length!==g.count)return [];
  const board=[...source],captures:Move[]=[],quiet:Move[]=[];
  for(let origin=0;origin<board.length;origin++){
    const piece=board[origin];if(!own(piece,side))continue;
    const king=Math.abs(piece)===2,allowed=king||variant==='international'?[0,1,2,3]:side===1?[0,1]:[2,3];
    const path=[origin],victims:number[]=[],taken=new Set<number>();
    function walk(square:number):void{
      let extended=false;
      for(const direction of allowed){
        let target=g.next[direction][square];if(target<0)continue;
        if(king&&variant==='international'){
          while(target>=0&&board[target]===0)target=g.next[direction][target];
          if(target<0||!enemy(board[target],side)||taken.has(target))continue;
          let landing=g.next[direction][target];
          while(landing>=0&&board[landing]===0){jump(square,target,landing);extended=true;landing=g.next[direction][landing];}
        }else{
          const landing=g.next[direction][target];
          if(landing>=0&&board[landing]===0&&enemy(board[target],side)&&!taken.has(target)){
            jump(square,target,landing);extended=true;
          }
        }
      }
      if(!extended&&victims.length>0)captures.push({path:[...path],captures:[...victims],promotes:!king&&isCrown(variant,square,side)});
    }
    function jump(square:number,victim:number,landing:number):void{
      const removed=board[victim];board[square]=0;board[landing]=piece;
      if(variant==='american')board[victim]=0;
      taken.add(victim);victims.push(victim);path.push(landing);
      if(!king&&variant==='american'&&isCrown(variant,landing,side)){
        captures.push({path:[...path],captures:[...victims],promotes:true});
      }else walk(landing);
      path.pop();victims.pop();taken.delete(victim);
      board[landing]=0;board[square]=piece;board[victim]=removed;
    }
    walk(origin);
    const forward=king?[0,1,2,3]:side===1?[0,1]:[2,3];
    for(const direction of forward){
      let landing=g.next[direction][origin];
      while(landing>=0&&board[landing]===0){
        quiet.push({path:[origin,landing],captures:[],promotes:!king&&isCrown(variant,landing,side)});
        if(!king||variant==='american')break;
        landing=g.next[direction][landing];
      }
    }
  }
  if(captures.length===0)return quiet.sort(comparePath);
  const maximum=variant==='international'?captures.reduce((most,move)=>Math.max(most,move.captures.length),0):0;
  return (variant==='international'?captures.filter(move=>move.captures.length===maximum):captures).sort(comparePath);
}

export function applyMove(source:readonly Piece[],move:Move):Piece[]{
  const board=[...source],origin=move.path[0],destination=move.path.at(-1)!;
  const piece=board[origin];board[origin]=0;
  for(const victim of move.captures)board[victim]=0;
  board[destination]=(move.promotes?Math.sign(piece)*2:piece) as Piece;
  return board;
}
export const moveKey=(move:Pick<Move,'path'>)=>move.path.join('-');
export function positionKey(board:readonly Piece[],side:Side,variant:Variant):string{
  let key=`${variant}:${side}:`;
  const length=board.length;
  for(let square=0;square<length;square++)if(square in board)key+=board[square]+2;
  return key;
}
