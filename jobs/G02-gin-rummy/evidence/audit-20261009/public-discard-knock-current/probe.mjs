import assert from 'node:assert/strict';
import {game} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/dist/core.mjs';
import {arranged} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/gin-cases.mjs';
import {rng,invariant,freeze} from '/tmp/G02-source-93f0f58-20261009/jobs/G02-gin-rummy/tests/helpers.mjs';

const hand=[2,15,28,41,42,16,29,0,1,13,14];
const defender=[4,5,6,17,18,19,30,31,32,27];
const s=arranged(hand,defender);
s.discard=[3,51];s.stock=s.stock.filter(c=>c!==3);
s.initialUpcard=31;s.drawnDiscard=1;
s.publicLog=[{player:'p1',action:'take-discard',card:27},{player:'p1',action:'take-discard',card:31},{player:'p0',action:'take-discard',card:1}];
invariant(s);freeze(s);
const input=game.bot.sampleInput(s,'p0',rng(7),'sharp');
const finish=card=>{
 let n=game.reduce(s,{type:'input',playerId:'p0',input:{type:'discard',card,knock:true},now:1});invariant(n);assert.equal(n.phase.id,'layoff');
 n=game.reduce(n,{type:'input',playerId:'p1',input:{type:'finishLayoff'},now:2});invariant(n);return n.roundResult;
};
const old=finish(input.card),alternative=finish(14),signed=x=>x.winner==='p0'?x.points:-x.points;
assert.equal(input.card,0);assert.equal(old.kind,'undercut');assert.equal(alternative.kind,'knock');
assert.equal(signed(old),-10);assert.equal(signed(alternative),1);
console.log(JSON.stringify({suite:'accepted-e228-public-discard-closed-target-counterexample',sourceHead:'e228d522396392808575ab2254c74534c4f70453',actualPublicDiscard:s.discard,currentInput:input,beforeSigned:signed(old),legalAlternative:{type:'discard',card:14,knock:true},afterSigned:signed(alternative),gain:signed(alternative)-signed(old),beforeLayout:old.knockerLayout,afterLayout:alternative.knockerLayout,defenderDeadwood:old.defenderLayout.deadwood,valid52Cards:true,hiddenInfoReadByBot:false}));
