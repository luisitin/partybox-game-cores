import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {game} from '../dist/core.mjs';
import {rng,freeze,invariant} from './helpers.mjs';
test('1000 seeded invalid JSON inputs and malformed event/identity metadata in every phase',async()=>{
 const r=rng(912701),invalid=[];
 const json=(depth=0)=>{
  const kind=r.int(0,depth<2?5:3);
  if(kind===0)return null;if(kind===1)return r.int(-60,100);if(kind===2)return r.chance(.5);
  if(kind===3)return r.pick(['pass','draw','discard','stock','discard','bigGin','finishLayoff','next','__proto__','']);
  if(kind===4)return Array.from({length:r.int(0,4)},()=>json(depth+1));
  return Object.fromEntries(Array.from({length:r.int(0,5)},()=>[r.pick(['type','card','source','knock','melds','extra','__proto__','constructor']),json(depth+1)]));
 };
 while(invalid.length<1000){const input=json();if(!game.inputSchema.safeParse(input).success)invalid.push(input);}
 let rejectedInputs=0,metadataChecks=0,viewChecks=0;
 for(const phase of game.phases){
  const s=JSON.parse(await readFile(`fixtures/${phase}.json`,'utf8'));freeze(s);const before=JSON.stringify(s);
  for(const input of invalid){assert.equal(game.reduce(s,{type:'input',playerId:s.turn,input,now:999}),s);rejectedInputs++;}
  for(const id of [null,undefined,false,0,[],{}, {toString:null,valueOf:null}, {toString:''},'unknown','__proto__','constructor']){
   for(const event of [{type:'input',playerId:id,input:{type:'pass'},now:999},{type:'player',playerId:id,connected:false,now:999}]){
    assert.equal(game.reduce(s,event),s);metadataChecks++;
   }
   const view=game.controllerView(s,id);assert.equal(view.me.role,'spectator');assert.deepEqual(view.handCards,[]);assert.deepEqual(view.legal,[]);
   assert.deepEqual(JSON.parse(JSON.stringify(view)),view);assert.equal(game.bot.sampleInput(s,id,r,'sharp'),null);viewChecks++;
  }
  for(const connected of [null,0,'false',[],{}]){assert.equal(game.reduce(s,{type:'player',playerId:s.turn,connected,now:999}),s);metadataChecks++;}
  for(const gone of [true,0,'away',[],{}]){assert.equal(game.reduce(s,{type:'player',playerId:s.turn,connected:false,gone,now:999}),s);metadataChecks++;}
  for(const now of [null,undefined,NaN,Infinity,-Infinity,'999',[],{}]){assert.equal(game.reduce(s,{type:'vip',action:'skip',now}),s);metadataChecks++;}
  for(const event of [null,undefined,false,0,[],{}, {type:'unknown',now:999}]){assert.equal(game.reduce(s,event),s);metadataChecks++;}
  assert.equal(JSON.stringify(s),before);
 }
 console.log(JSON.stringify({suite:'boundary-fuzz',seed:912701,invalidInputs:invalid.length,phases:game.phases.length,rejectedInputs,metadataChecks,viewChecks}));
});
test('mixed event families replay through JSON after every transition from every phase',async()=>{
 let transitions=0,changed=0;const families=new Set();
 for(const phase of game.phases)for(let seed=1;seed<=100;seed++){
  let s=JSON.parse(await readFile(`fixtures/${phase}.json`,'utf8')),replica=structuredClone(s),r=rng(seed*991+phase.length),now=1e6;
  s.config.turnSeconds=10;replica.config.turnSeconds=10;
  for(let i=0;i<80;i++){
   now+=r.int(1,50000);const family=r.int(0,7);let event;
   if(family===0){const input=game.bot.sampleInput(s,s.turn,r,'normal');event={type:'input',playerId:s.turn,input:input??null,now};}
   else if(family===1)event={type:'vip',action:r.pick(['pause','resume','skip']),now};
   else if(family===2)event={type:'player',playerId:r.pick([...s.order,'unknown']),connected:r.chance(.5),now};
   else if(family===3)event={type:'timer',phaseId:s.phase.id,startedAt:r.chance(.5)?s.phase.startedAt:-1,now};
   else if(family===4)event={type:'speech',key:'unused',ms:-1,now};
   else if(family===5)event={type:'speechStart',key:'unused',now};
   else if(family===6)event={type:'input',playerId:'unknown',input:{type:'discard',card:99},now};
   else event={type:'vip',action:i===79?'end':'skip',now};
   families.add(event.type);freeze(s);const before=JSON.stringify(s),next=game.reduce(s,event);
   const repeated=game.reduce(replica,JSON.parse(JSON.stringify(event))),text=JSON.stringify(next),replayText=JSON.stringify(repeated);
   const hash=value=>createHash('sha256').update(value).digest('hex');assert.equal(hash(text),hash(replayText));assert.equal(text,replayText);
   assert.equal(JSON.stringify(s),before);invariant(next);assert.deepEqual(JSON.parse(text),next);
   if(next!==s)changed++;s=next;replica=JSON.parse(replayText);transitions++;
  }
 }
 assert.equal(families.size,6);assert(changed>1000);
 console.log(JSON.stringify({suite:'mixed-event-replay',phaseStarts:6,seedsPerPhase:100,transitions,changed,eventFamilies:[...families].sort()}));
});
