import {writeFile,mkdir} from 'node:fs/promises';
import {generateTwoPieceTable} from '../dist/retrograde.mjs';
import {legalMoves,applyMove,positionKey,geometry} from '../dist/moves.mjs';
import {createRng} from '../dist/core.mjs';
const rows=[],stats={},seed=0xC10D2026;
for(const variant of ['american','international']){
  const result=generateTwoPieceTable(variant);rows.push(...result.rows);
  stats[variant]={...result,rows:undefined};
  const rng=createRng(seed^(variant==='american'?0:0x1A7E)),g=geometry(variant),unique=new Set(result.rows.map(row=>row[0]));
  let candidates=0,accepted=0;
  while(candidates<40000&&accepted<2000){
    candidates++;const count=rng.int(3,6),side=rng.chance(.5)?1:-1;
    const cells=rng.shuffle(Array.from({length:g.count},(_,i)=>i)).slice(0,count);
    const board=Array(g.count).fill(0);
    for(let i=0;i<count;i++){
      const owner=i===0?-side:side,row=g.rows[cells[i]];
      const king=rng.chance(.65)||row===(owner===1?0:g.size-1);
      board[cells[i]]=owner*(king?2:1);
    }
    const moves=legalMoves(board,variant,side);
    if(!moves.length||!moves[0].captures.length)continue;
    // Independent-of-search witnessed class: every compulsory capture removes
    // the opponent's sole piece. The exact result is a one-ply terminal win.
    if(!moves.every(move=>!applyMove(board,move).some(piece=>piece!==0&&Math.sign(piece)===-side)))continue;
    const key=positionKey(board,side,variant);if(unique.has(key))continue;unique.add(key);
    rows.push([key,1,1]);accepted++;
  }
  stats[variant].tacticalThreeToSix={candidates,accepted,definition:'every legal forced capture removes the sole opposing piece'};
}
rows.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
const data={version:1,seed,coverage:{status:'generated',maximumPieces:6,
  completeMaterialClasses:['one piece','one piece per side: every valid man/king arrangement for both variants'],
  partialMaterialClasses:['three through six pieces: generated forced final-capture positions and exact closed capture-only proof graphs'],
  fullSixPieceCoverage:false,drawHistoryIncluded:false,
  unresolved:'quiet positions with three through six pieces outside the generated rows return null and use bounded alpha-beta'},stats,rows};
await mkdir('data',{recursive:true});await writeFile('data/endgames.json',JSON.stringify(data)+'\n');
await mkdir('evidence/checks',{recursive:true});
await writeFile('evidence/checks/endgame-generation.json',JSON.stringify({command:'node scripts/endgames.mjs',seed,coverage:data.coverage,stats,totalRows:rows.length},null,2)+'\n');
process.stdout.write(JSON.stringify({suite:'endgame-generation',stats,totalRows:rows.length})+'\n');
