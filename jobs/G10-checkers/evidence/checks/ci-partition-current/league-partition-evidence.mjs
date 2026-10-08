import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {referenceMoves,referenceAfter} from '../tests/reference-moves.mjs';
export const VARIANTS=Object.freeze(['american','international']);
export const COMPARISONS=Object.freeze([['sharp','normal'],['normal','easy']]);
export function validatePartitionReport(report,variant,inputs,botSha256){
 assert(VARIANTS.includes(variant));assert.equal(report.ciPartition,variant);
 assert.equal(report.command,'node scripts/league.mjs --variant '+variant+' --ci-partition');
 assert.equal(report.totalGames,2000);assert.equal(report.gamesPerVariantComparison,1000);assert.equal(report.gamesPerComparison,1000);
 assert.equal(report.workers,4);assert.equal(report.botSourceSha256,botSha256);assert.deepEqual(report.gameInputHashes,inputs);
 assert(Array.isArray(report.comparisons));assert.equal(report.comparisons.length,2);
 assert.deepEqual(report.comparisons.map(row=>[row.variant,row.higher,row.lower]),COMPARISONS.map(([higher,lower])=>[variant,higher,lower]));
 assert(Number.isFinite(report.elapsedSeconds)&&report.elapsedSeconds>0);
 for(const row of report.comparisons){assert.equal(row.games,1000);assert(row.scoreShare>.55&&row.decisiveWilson95[0]>.5);}
}
export async function validateGameRecords(records,row){
 const core=await import('../dist/core.mjs');
 assert.equal(records.length,1000);const digest=createHash('sha256');let wins=0,draws=0,losses=0,moves=0,maximumPlies=0;
 const size=row.variant==='american'?8:10,count=size*size/2,home=row.variant==='american'?3:4;
 for(let n=0;n<1000;n++){
  const game=records[n];assert.equal(game.index,n);for(const key of ['variant','higher','lower'])assert.equal(game[key],row[key]);
  assert.equal(game.seed,(0xC10B0700+(n>>1)+(row.variant==='international'?200000:0)+(row.higher==='normal'?100000:0))>>>0);
  const stronger=n%2===0?'light':'dark';assert.equal(game.stronger,stronger);
  assert.deepEqual(game.skills,Object.fromEntries(['light','dark'].map(side=>[side,side===stronger?row.higher:row.lower])));
  assert(['light','dark',null].includes(game.winner));assert(typeof game.endReason==='string'&&game.endReason.length>0);
  assert(Array.isArray(game.moves)&&game.moves.length===game.plies&&game.plies>0&&game.plies<=2400);
  assert(Array.isArray(game.finalBoard)&&game.finalBoard.length===count&&game.finalBoard.every(piece=>Number.isInteger(piece)&&piece>=-2&&piece<=2));
  let board=Array.from({length:count},(_,square)=>{const rank=Math.floor(square/(size/2));return rank<home?-1:rank>=size-home?1:0;}),side=1;
  let actual=core.init({players:['light','dark'].map(id=>({id,name:id,avatarId:id,connected:true,bot:true})),settings:{variant:row.variant},seed:game.seed,now:1000});
  for(const input of game.moves){
   assert.deepEqual(Object.keys(input).sort(),['path','type']);assert.equal(input.type,'move');assert(Array.isArray(input.path));
   const move=referenceMoves(board,row.variant,side).find(move=>JSON.stringify(move.path)===JSON.stringify(input.path));
   assert(move,'Every recorded move must obey the independent coordinate oracle');board=referenceAfter(board,move,side);side=-side;
   assert.equal(actual.phase.id,'move','No recorded turn may follow a real terminal result');
   const previous=actual;actual=core.reduce(actual,{type:'input',playerId:core.turnId(actual),input,now:2000+actual.ply});
   assert.notEqual(actual,previous);assert.equal(actual.ply,previous.ply+1);
  }
  assert.deepEqual(board,game.finalBoard,'Independent legal-move replay must reach the exact recorded board');
  assert.deepEqual(actual.board,game.finalBoard);assert.equal(actual.phase.id,'done');assert.equal(actual.ply,game.plies);
  assert.equal(actual.winner,game.winner,'Reported winner must equal the current pure reducer result');
  assert.equal(actual.endReason,game.endReason,'Reported ending must equal the current draw/terminal rules');assert(core.results(actual));
  game.winner===stronger?wins++:game.winner===null?draws++:losses++;
  moves+=game.plies;maximumPlies=Math.max(maximumPlies,game.plies);
  digest.update(JSON.stringify([row.variant,row.higher,row.lower,game.seed,game.stronger,game.winner,game.endReason,game.plies,game.finalBoard]));
 }
 assert.equal(row.wins,wins);assert.equal(row.draws,draws);assert.equal(row.losses,losses);assert.equal(row.moves,moves);assert.equal(row.maximumPlies,maximumPlies);
 const score=(wins+draws/2)/1000,decisive=wins+losses,p=wins/decisive,z=1.96,denom=1+z*z/decisive,center=(p+z*z/(2*decisive))/denom;
 const margin=z*Math.sqrt((p*(1-p)+z*z/(4*decisive))/decisive)/denom;
 assert.equal(row.scoreShare,score);assert.equal(row.decisiveWinRate,p);assert(score>.55&&center-margin>.5);
 for(let i=0;i<2;i++)assert(Math.abs(row.decisiveWilson95[i]-[center-margin,center+margin][i])<1e-12);
 assert.equal(row.transcriptSha256,digest.digest('hex'));
 return {games:1000,wins,draws,losses,moves,independentLegalMoveReplay:true};
}
