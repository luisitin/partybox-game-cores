import type {BotSkill} from '../../../contract/constants';
import type {Rng} from '../../../contract/rng';
import type {Config,Move,Piece,Position,Side} from './types.js';
import {geometry,legalMoves,moveKey,positionKey} from './moves.js';
import {nextPosition,drawReason} from './draws.js';
import {probeEndgame} from './endgame.js';
const WIN=100_000;
export interface SearchReport {move:Move|null;score:number;nodes:number;completedDepth:number;budgetExhausted:boolean;databaseHits:number;corpusHits:number}
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
export function searchMove(position:Position,config:Config,rng:Rng,skill:BotSkill,databaseProbe:typeof probeEndgame=probeEndgame):SearchReport{
  const rootMoves=legalMoves(position.board,position.variant,position.side);
  if(!rootMoves.length)return {move:null,score:-WIN,nodes:0,completedDepth:0,budgetExhausted:false,databaseHits:0,corpusHits:0};
  if(skill==='easy')return {move:rootMoves[rng.int(0,rootMoves.length-1)],score:0,nodes:0,completedDepth:0,budgetExhausted:false,databaseHits:0,corpusHits:0};
  const maximum=skill==='sharp'?5:2,budget=skill==='sharp'?6000:800;
  let nodes=0,hits=0,corpusHits=0,exhausted=false,best=rootMoves[0],bestScore=-Infinity,completed=0;
  const table=new Map<string,{depth:number;score:number;bound:'exact'|'lower'|'upper';move:string|null}>();
  const moveCache=new Map<string,Move[]>();
  const ordered=(moves:Move[],preferred:string|null)=>moves.map(move=>({move,key:moveKey(move)})).sort((a,b)=>
    Number(b.key===preferred)-Number(a.key===preferred)||Number(b.move.promotes)-Number(a.move.promotes)||
    b.move.captures.length-a.move.captures.length||(a.key<b.key?-1:a.key>b.key?1:0)).map(row=>row.move);
  function visit(current:Position,depth:number,alpha:number,beta:number,ply:number):number{
    nodes++;if(nodes>budget){exhausted=true;return evaluate(current.board,current.variant,current.side);}
    const originalAlpha=alpha,originalBeta=beta,level=Math.max(0,depth);
    const boardKey=positionKey(current.board,current.side,current.variant);
    const key=boardKey+'|'+current.quietPlies+'|'+ply+'|'+
      JSON.stringify(current.drawWindows.map(window=>[window.kind,window.weak,current.ply-window.started,window.limit]))+'|'+
      JSON.stringify(Object.entries(current.repetition).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0));
    const cached=table.get(key);
    if(cached&&cached.depth>=level){if(cached.bound==='exact')return cached.score;if(cached.bound==='lower')alpha=Math.max(alpha,cached.score);else beta=Math.min(beta,cached.score);if(alpha>=beta)return cached.score;}
    let moves=moveCache.get(boardKey);
    if(!moves){moves=legalMoves(current.board,current.variant,current.side);moveCache.set(boardKey,moves);}
    if(!moves.length)return -WIN+ply;
    if(drawReason(current,config))return 0;
    if(skill==='sharp'){
      const table=databaseProbe(current.board,current.variant,current.side);
      if(table){
        hits++;
        if(table.source==='chinook'||table.source==='kingsrow')corpusHits++;
        if(table.outcome===0)return 0;
        // WDL is board-only. A historical draw clock can change a game's result;
        // only a fresh position and a short proven line gets a decisive value.
        const limit=current.variant==='international'&&config.drawPolicy==='official'?50:80;
        const remaining=current.drawWindows.reduce((left,window)=>Math.min(left,window.limit-(current.ply-window.started)),limit-current.quietPlies);
        const fresh=Object.values(current.repetition).every(value=>value===1);
        if(table.dtm!==null&&table.dtm<=remaining&&fresh)return table.outcome*(WIN-1000-table.dtm-ply);
        // A board-only WDL without distance is strategic guidance; history and
        // limited draw allowances prevent treating it as a proved game win.
        if(table.dtm===null&&remaining>6&&fresh)return table.outcome*(20_000-ply)+evaluate(current.board,current.variant,current.side);
      }
    }
    // Finish forced-capture lines at the horizon instead of evaluating a piece
    // before the obligatory reply. Captures strictly lower material.
    if(depth<=0&&!moves[0].captures.length)return evaluate(current.board,current.variant,current.side);
    let value=-Infinity,chosen:string|null=null;
    for(const move of ordered(moves,cached?.move??null)){
      const result=-visit(nextPosition(current,move,config),depth-1,-beta,-alpha,ply+1);
      if(result>value){value=result;chosen=moveKey(move);}
      alpha=Math.max(alpha,value);if(alpha>=beta||exhausted)break;
    }
    if(!exhausted)table.set(key,{depth:level,score:value,bound:value<=originalAlpha?'upper':value>=originalBeta?'lower':'exact',move:chosen});
    return value;
  }
  for(let depth=1;depth<=maximum;depth++){
    const scores:{move:Move;score:number}[]=[],preferred=moveKey(best);let iterationBest=-Infinity;
    for(const move of ordered(rootMoves,preferred)){
      // A scout window prunes inferior roots. Any apparent tie or improvement
      // is re-searched with a full window before randomized ties are admitted.
      const child=nextPosition(position,move,config);
      let score=-visit(child,depth-1,scores.length?-iterationBest-1:-Infinity,scores.length?-iterationBest:Infinity,1);
      if(scores.length&&score>=iterationBest&&!exhausted)score=-visit(child,depth-1,-Infinity,Infinity,1);
      iterationBest=Math.max(iterationBest,score);
      scores.push({move,score});if(exhausted)break;
    }
    if(exhausted)break;
    const value=scores.reduce((most,result)=>Math.max(most,result.score),-Infinity);
    const ties=scores.filter(result=>result.score===value);
    best=ties[rng.int(0,ties.length-1)].move;bestScore=value;completed=depth;
  }
  return {move:best,score:Number.isFinite(bestScore)?bestScore:evaluate(position.board,position.variant,position.side),
    nodes,completedDepth:completed,budgetExhausted:exhausted,databaseHits:hits,corpusHits};
}
export const chooseMove=(position:Position,config:Config,rng:Rng,skill:BotSkill):Move|null=>searchMove(position,config,rng,skill).move;
