import test from 'node:test';
import assert from 'node:assert/strict';
import {createRng} from '../dist/core.mjs';
import {searchMove} from '../dist/bots.mjs';
import {referenceMoves} from './reference-moves.mjs';
import {evidence} from './evidence.mjs';

function after(board,move){
  const next=[...board],piece=next[move.path[0]];next[move.path[0]]=0;
  for(const square of move.captures)next[square]=0;
  next[move.path.at(-1)]=move.promotes?Math.sign(piece)*2:piece;
  return next;
}
function staticValue(board,variant,side){
  const size=variant==='american'?8:10;
  return board.reduce((sum,piece,square)=>{
    if(!piece)return sum;const owner=Math.sign(piece),king=Math.abs(piece)===2;
    const row=Math.floor(square/(size/2)),column=2*(square%(size/2))+(row+1)%2;
    const forward=owner===1?size-1-row:row;
    const central=2*size-Math.abs(2*row-size+1)-Math.abs(2*column-size+1);
    return sum+(owner===side?1:-1)*((king?(variant==='american'?190:275):100)+(king?0:5*forward)+2*central);
  },0);
}
function exhaustive(board,variant,side,depth,ply){
  const moves=referenceMoves(board,variant,side);
  if(!moves.length)return -100000+ply;
  if(depth<=0&&moves[0].captures.length===0)return staticValue(board,variant,side);
  return Math.max(...moves.map(move=>-exhaustive(after(board,move),variant,-side,depth-1,ply+1)));
}

test('PVS/transposition tie handling agrees with independent exhaustive minimax and capture horizon',()=>{
  const rng=createRng(0xAB10C0DE),reports=[];
  for(const variant of ['american','international']){
    let matched=0,limited=0;
    for(let n=0;n<240;n++){
      const length=variant==='american'?32:50,board=Array(length).fill(0),squares=rng.shuffle(Array.from({length},(_,i)=>i)),count=2+n%4;
      for(let p=0;p<count;p++){
        const owner=p===0?1:p===1?-1:rng.chance(.5)?1:-1,square=squares[p];
        const crown=owner===1?square<length/(variant==='american'?8:10):square>=length-length/(variant==='american'?8:10);
        board[square]=owner*(crown||rng.chance(.15)?2:1);
      }
      const side=rng.chance(.5)?1:-1,moves=referenceMoves(board,variant,side);if(!moves.length)continue;
      const position={board,variant,side,quietPlies:0,ply:0,repetition:{},drawWindows:[]};
      const config={variant,drawPolicy:'fortyMove',repetition:false,turnSeconds:0};
      const report=searchMove(position,config,createRng(n+1),'normal');
      if(report.budgetExhausted){limited++;continue;}
      assert.equal(report.completedDepth,2);
      const scores=moves.map(move=>({move,score:-exhaustive(after(board,move),variant,-side,1,1)}));
      const best=Math.max(...scores.map(row=>row.score));
      assert.equal(report.score,best,JSON.stringify({variant,board,side,report,scores}));
      assert(scores.some(row=>row.score===best&&JSON.stringify(row.move.path)===JSON.stringify(report.move.path)));
      matched++;
    }
    assert(matched>=150,JSON.stringify({variant,matched,limited}));reports.push({variant,matched,limited});
  }
  evidence('bots-minimax.json',{cases:480,oracle:'Coordinate legal moves; exhaustive whole-tree minimax, no production pruning/cache/move helpers',reports});
});
