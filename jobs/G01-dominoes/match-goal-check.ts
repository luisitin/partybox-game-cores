// A public-information endgame where preserving the match differs from pip loss.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import * as base from './core.ts';
export function matchAwareSource(source:string):string{
 const from=' return group(root)===winning?100+points:-100-points;';assert(source.includes(from));
 return source.replace(from,` if(p.scores&&p.target!==undefined&&p.scores[winning]!+points>=p.target)return group(root)===winning?10000:-10000;
${from}`).replace('seat:number;counts:number[];hand:', 'seat:number;counts:number[];scores:number[];hand:').replace('return {seat,counts:', 'return {seat,scores:[...s.scores],counts:').replace('partners:boolean;blocked?:', 'partners:boolean;scores?:number[];target?:number;blocked?:').replace('partners:o.settings.partners,blocked:', 'partners:o.settings.partners,scores:[...o.scores],target:o.settings.target,blocked:');
}
const path='./mutant-match-goal.ts';writeFileSync(path,matchAwareSource(readFileSync('core.ts','utf8')));
try{
 const candidate:typeof base=await import(path);const id=(a:number,b:number)=>base.allTiles().find(t=>JSON.stringify(base.tile(t))===JSON.stringify([a,b]))!;
 const hand=[id(0,1),id(0,2)],others=[id(1,1),id(2,2)];
 const initial=base.init({players:[0,1,2].map(i=>({id:`p${i}`,name:`P${i}`,avatarId:'🙂',connected:true})),seed:1,now:0,settings:{mode:'draw',deal:'traditional'}});const settings=initial.settings;
 const o={seat:0,counts:[2,1,1],scores:[0,0,99],hand,played:base.allTiles().filter(t=>!hand.includes(t)&&!others.includes(t)),ends:[1,2] as const,missed:[0,1<<2,1<<1],settings,forced:null,legal:[{type:'play' as const,tile:hand[0]!,side:'left' as const},{type:'play' as const,tile:hand[1]!,side:'right' as const}]};
 const remaining=new Set(o.played);const board:base.State['board']=[];
 const walk=(a:number)=>{while(true){const t=[...remaining].find(t=>base.tile(t).includes(a));if(t===undefined)break;remaining.delete(t);const [x,y]=base.tile(t),b=x===a?y:x;walk(b);board.push({tile:t,a,b,player:t%3});}};
 walk(1);board.reverse();assert.equal(remaining.size,0);assert.equal(board[0]!.a,1);assert.equal(board.at(-1)!.b,2);for(let i=1;i<board.length;i++)assert.equal(board[i-1]!.b,board[i]!.a);
 const fixture:base.State={...initial,hands:[hand,[others[0]!],[others[1]!]],stock:[],board,ends:o.ends,turn:0,forced:null,missed:o.missed,scores:o.scores,round:8,last:{winner:2,points:10,blocked:false}};
 assert.deepEqual(base.legal(fixture),o.legal);assert.deepEqual([...fixture.hands.flat(),...board.map(t=>t.tile)].sort((a,b)=>a-b),base.allTiles());
 const playOut=(input:base.Input)=>{let s=base.reduce(fixture,{type:'input',playerId:'p0',input,now:1}),now=2;while(s.phase.id==='play'&&now<10){const moves=base.legal(s);assert.equal(moves.length,1);s=base.reduce(s,{type:'input',playerId:s.seats[s.turn]!,input:moves[0]!,now:now++});}return s;};
 const before=base.choose(o,createRng(77),'sharp'),after=candidate.choose(o,createRng(77),'sharp');
 assert.equal(before?.type,'play');assert.equal(after?.type,'play');if(after?.type==='play')assert.equal(after.tile,hand[1]);
 assert(before&&after);const oldOutcome=playOut(before),newOutcome=playOut(after);assert.equal(oldOutcome.phase.id,'done');assert.equal(oldOutcome.scores[2],103);assert.equal(newOutcome.phase.id,'round-end');assert.equal(newOutcome.scores[1],5);
 const report={before,after,beforePhase:oldOutcome.phase.id,afterPhase:newOutcome.phase.id,rootScores:o.scores,target:100,beforeOutcome:'p2 (third seat) plays its last tile for 4 points and reaches 103: match lost',afterOutcome:'p1 (second seat) plays its last tile for 5 points and reaches 5: match continues',publicConstraints:'missing-suit evidence uniquely assigns remaining opponents tiles; no stock remains'};
 writeFileSync('match-goal-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
}finally{unlinkSync(path);}
