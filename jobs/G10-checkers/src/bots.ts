import type {BotSkill} from '../../../contract/constants';
import type {Rng} from '../../../contract/rng';
import type {Config,Move,Piece,Position,Side} from './types.js';
import {geometry,legalMoves,moveKey} from './moves.js';
import {nextPosition,drawReason} from './draws.js';
import {probeEndgame} from './endgame.js';
const WIN=100_000;
export interface SearchReport {move:Move|null;score:number;nodes:number;completedDepth:number;budgetExhausted:boolean;databaseHits:number}
export function evaluate(board:readonly Piece[],variant:Config['variant'],side:Side):number{
  const g=geometry(variant);let value=0;
  for(let square=0;square<board.length;square++){
    const piece=board[square];if(!piece)continue;
    const king=Math.abs(piece)===2,owner=Math.sign(piece) as Side;
    const advancement=owner===1?g.size-1-g.rows[square]:g.rows[square];
    const center=2*g.size-Math.abs(2*g.rows[square]-(g.size-1))-Math.abs(2*g.columns[square]-(g.size-1));
    const amount=(king?(variant==='international'?275:190):100)+(king?0:advancement*5)+center*2;
    value+=owner===side?amount:-amount;
  }
  return value;
}
export function searchMove(position:Position,config:Config,rng:Rng,skill:BotSkill):SearchReport{
  const rootMoves=legalMoves(position.board,position.variant,position.side);
  if(!rootMoves.length)return {move:null,score:-WIN,nodes:0,completedDepth:0,budgetExhausted:false,databaseHits:0};
  if(skill==='easy')return {move:rootMoves[rng.int(0,rootMoves.length-1)],score:0,nodes:0,completedDepth:0,budgetExhausted:false,databaseHits:0};
  const maximum=skill==='sharp'?5:2,budget=skill==='sharp'?6000:800;
  let nodes=0,hits=0,exhausted=false,best=rootMoves[0],bestScore=-Infinity,completed=0;
  const ordered=(moves:Move[],preferred:string|null)=>[...moves].sort((a,b)=>
    Number(moveKey(b)===preferred)-Number(moveKey(a)===preferred)||Number(b.promotes)-Number(a.promotes)||
    b.captures.length-a.captures.length||moveKey(a).localeCompare(moveKey(b)));
  function visit(current:Position,depth:number,alpha:number,beta:number,ply:number):number{
    nodes++;if(nodes>budget){exhausted=true;return evaluate(current.board,current.variant,current.side);}
    const moves=legalMoves(current.board,current.variant,current.side);
    if(!moves.length)return -WIN+ply;
    if(drawReason(current,config))return 0;
    if(skill==='sharp'){
      const table=probeEndgame(current.board,current.variant,current.side);
      if(table){
        hits++;
        if(table.outcome===0)return 0;
        // WDL is board-only. A historical draw clock can change a game's result;
        // only a fresh position and a short proven line gets a decisive value.
        const limit=current.variant==='international'&&config.drawPolicy==='official'?50:80;
        const remaining=current.drawWindows.reduce((left,window)=>Math.min(left,window.limit-(current.ply-window.started)),limit-current.quietPlies);
        const fresh=Object.values(current.repetition).every(value=>value===1);
        if(table.dtm!==null&&table.dtm<=remaining&&fresh)return table.outcome*(WIN-1000-table.dtm-ply);
      }
    }
    // Finish forced-capture lines at the horizon instead of evaluating a piece
    // before the obligatory reply. Captures strictly lower material.
    if(depth<=0&&!moves[0].captures.length)return evaluate(current.board,current.variant,current.side);
    let value=-Infinity;
    for(const move of ordered(moves,null)){
      value=Math.max(value,-visit(nextPosition(current,move,config),depth-1,-beta,-alpha,ply+1));
      alpha=Math.max(alpha,value);if(alpha>=beta||exhausted)break;
    }
    return value;
  }
  for(let depth=1;depth<=maximum;depth++){
    const scores:{move:Move;score:number}[]=[],preferred=moveKey(best);
    for(const move of ordered(rootMoves,preferred)){
      // Full root windows make equal scores genuine ties rather than cut-off
      // bounds; randomized ties must never select a hidden inferior move.
      const score=-visit(nextPosition(position,move,config),depth-1,-Infinity,Infinity,1);
      scores.push({move,score});if(exhausted)break;
    }
    if(exhausted)break;
    const value=scores.reduce((most,result)=>Math.max(most,result.score),-Infinity);
    const ties=scores.filter(result=>result.score===value);
    best=ties[rng.int(0,ties.length-1)].move;bestScore=value;completed=depth;
  }
  return {move:best,score:Number.isFinite(bestScore)?bestScore:evaluate(position.board,position.variant,position.side),
    nodes,completedDepth:completed,budgetExhausted:exhausted,databaseHits:hits};
}
export const chooseMove=(position:Position,config:Config,rng:Rng,skill:BotSkill):Move|null=>searchMove(position,config,rng,skill).move;
