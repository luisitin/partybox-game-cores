import assert from 'node:assert/strict';
import {game} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/dist/core.mjs';
import {discardSolutions,validMeld} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/dist/cards.mjs';
import {arranged} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/gin-cases.mjs';
import {rng,invariant,freeze} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/helpers.mjs';
import {bruteDefense} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/layoff-reference.mjs';
const hand=[2,15,28,3,16,29,0,1,13,14,26],defender=[4,5,6,7,8,17,18,19,40,41];
const s=arranged(hand,defender);s.discard=[51];s.initialUpcard=19;s.publicLog=[19,40,41].map(card=>({player:'p1',action:'take-discard',card}));
const used=new Set([...hand,...defender,51]);s.stock=Array.from({length:52},(_,c)=>c).filter(c=>!used.has(c));invariant(s);
const before=JSON.stringify(s);freeze(s);const random=rng(7),input=game.bot.sampleInput(s,'p0',random,'sharp');assert.equal(JSON.stringify(s),before);assert.equal(random.state().step,0);
const available=Array.from({length:52},(_,c)=>c).filter(c=>!hand.includes(c)&&!s.discard.includes(c));
const keys=melds=>melds.filter(m=>available.some(c=>validMeld([...m,c]))).map(m=>[...m].sort((a,b)=>a-b).join(',')).sort();
function finish(card){let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'discard',card,knock:true},now:1});invariant(n);assert.equal(n.phase.id,'layoff');n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:2});invariant(n);const r=n.roundResult;assert.equal(r.defenderLayout.deadwood,bruteDefense(defender,r.knockerLayout.melds));return {...r,signed:r.winner==='p0'?r.points:-r.points,liveTargets:keys(r.knockerLayout.melds)};}
const old=finish(input.card),candidate=finish(28),all=discardSolutions(hand).map(({card,solution})=>({card,deadwood:solution.deadwood,melds:solution.melds,liveTargets:keys(solution.melds)}));
console.log(JSON.stringify({acceptedSource:'f46153e6645cf22f1c66167a281c0e292155a329',actualOldInput:input,old,candidate,all,actualGain:candidate.signed-old.signed,rngStep:random.state().step,completeStateUnchanged:JSON.stringify(s)===before}));
assert.equal(input.card,26);assert.equal(old.knockerLayout.deadwood,6);assert.equal(candidate.knockerLayout.deadwood,1);assert(candidate.liveTargets.length<old.liveTargets.length&&candidate.liveTargets.every(k=>old.liveTargets.includes(k)));assert(candidate.signed>old.signed);
