import type {Config,DrawClock,Move,Piece,Position,Side} from './types.js';
import {applyMove,geometry,positionKey} from './moves.js';

export function endingWindows(board:readonly Piece[],variant:Config['variant'],windows:readonly DrawClock[],ply:number,policy:Config['drawPolicy']):DrawClock[]{
  if(variant!=='international'||policy!=='official')return [];
  const next=windows.map(window=>({...window})),g=geometry(variant);
  for(const weak of [1,-1] as const){
    const own=board.flatMap((piece,square)=>piece!==0&&Math.sign(piece)===weak?[square]:[]);
    const opposing=board.flatMap((piece,square)=>piece!==0&&Math.sign(piece)===-weak?[square]:[]);
    if(own.length!==1||Math.abs(board[own[0]])!==2||!opposing.some(square=>Math.abs(board[square])===2))continue;
    const add=(kind:DrawClock['kind'],limit:number)=>{
      if(!next.some(window=>window.kind===kind&&window.weak===weak))next.push({kind,weak,started:ply,limit});
    };
    if(opposing.length===3){
      add('sixteen',32);
      const square=own[0];
      if(g.rows[square]+g.columns[square]===9&&opposing.every(other=>g.rows[other]+g.columns[other]!==9))add('diagonalFive',10);
    }
    if(opposing.length<=2&&opposing.length>0)add('five',10);
  }
  return next;
}
export function nextPosition(position:Position,move:Move,config:Config):Position{
  const man=Math.abs(position.board[move.path[0]])===1;
  const irreversible=move.captures.length>0||man;
  const board=applyMove(position.board,move),side=-position.side as Side,ply=position.ply+1;
  const key=positionKey(board,side,position.variant);
  const repetition=irreversible?{[key]:1}:{...position.repetition,[key]:(Object.hasOwn(position.repetition,key)?position.repetition[key]:0)+1};
  return {board,side,variant:position.variant,ply,quietPlies:irreversible?0:position.quietPlies+1,
    repetition,drawWindows:endingWindows(board,position.variant,position.drawWindows,ply,config.drawPolicy)};
}
export function drawReason(position:Position,config:Config):string|null{
  const key=positionKey(position.board,position.side,position.variant);
  if(config.repetition&&Object.hasOwn(position.repetition,key)&&position.repetition[key]>=3)return 'threefold-repetition';
  const quietLimit=position.variant==='international'&&config.drawPolicy==='official'?50:80;
  if(position.quietPlies>=quietLimit)return quietLimit===50?'twenty-five-move-draw':'forty-move-draw';
  const expired=position.drawWindows.find(window=>position.ply-window.started>=window.limit);
  return expired?expired.kind==='sixteen'?'sixteen-move-ending':expired.kind==='five'?'five-move-ending':'long-diagonal-five-move-ending':null;
}
