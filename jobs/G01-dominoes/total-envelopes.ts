import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {init,legal,reduce,type State} from './core.ts';

function freeze<T>(value:T):T{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;}
const rng=createRng(0xe71e),seeds=[1,2,3];
while(seeds.length<1003){const seed=rng.int(4,0xffffffff);if(!seeds.includes(seed))seeds.push(seed);}
const states:State[]=[];
for(const seed of seeds){
 const count=2+seed%3;
 const initial=init({players:Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true})),seed,now:0,settings:{mode:seed%2?'draw':'block',partners:count===4&&seed%2===0,opening:seed%3?'rotating':'highest-double'}});
 const next=reduce(initial,{type:'input',playerId:initial.seats[initial.turn]!,input:legal(initial)[0]!,now:1});
 const paused=reduce(next,{type:'vip',action:'pause',now:2});
 states.push(initial,next,paused);
}
for(const phase of ['play','round-end','done'])states.push(JSON.parse(readFileSync(`fixtures/${phase}.json`,'utf8')) as State);
let probes=0;
const phases:Record<string,number>={};
for(const state of states){
 freeze(state);const before=JSON.stringify(state),actor=state.seats[state.turn]!,now=state.phase.startedAt+1;
 const invalidInputs:unknown[]=[null,false,0,'pass',[],{}, {type:'unknown'},{type:null},{type:['pass']},{type:'pass',extra:true},{type:'next',extra:true},{type:'draw',extra:true},{type:'play',tile:-1,side:'left'},{type:'play',tile:28,side:'right'},{type:'play',tile:1.5,side:'left'},{type:'play',tile:{toString:null},side:'left'},{type:'play',tile:0,side:'middle'}];
 const invalidActors:unknown[]=[null,false,0,[],[actor],{toString:null,valueOf:null},'unknown','__proto__','constructor'];
 const events:unknown[]=[null,false,0,'input',[],{}, {now},{type:'unknown',now},{type:{toString:null},now},{type:'vip',action:{toString:null},now},{type:'timer',phaseId:'stale',startedAt:state.phase.startedAt,now:now+60000},{type:'timer',phaseId:state.phase.id,startedAt:{toString:null},now:now+60000},{type:'speech',key:'unused',ms:100,now},{type:'speechStart',key:'unused',now}];
 for(const input of invalidInputs)events.push({type:'input',playerId:actor,input,now});
 for(const playerId of invalidActors)events.push({type:'input',playerId,input:{type:'pass'},now},{type:'player',playerId,connected:false,now});
 for(const connected of [null,0,'false',{},[]])events.push({type:'player',playerId:actor,connected,now});
 for(const gone of [null,false,0,'unknown',{},[]])events.push({type:'player',playerId:actor,connected:false,gone,now});
 for(const clock of [null,false,'1',[],{},undefined])events.push({type:'input',playerId:actor,input:legal(state)[0]??{type:'next'},now:clock},{type:'vip',action:'end',now:clock},{type:'player',playerId:actor,connected:false,now:clock});
 for(const event of events){
  const jsonEvent=JSON.parse(JSON.stringify(event));
  assert.equal(reduce(state,jsonEvent as never),state,`phase ${state.phase.id}: ${JSON.stringify(jsonEvent)}`);
  assert.equal(JSON.stringify(state),before);probes++;
 }
 phases[state.phase.id]=(phases[state.phase.id]??0)+1;
}
const report={seeds:seeds.length,states:states.length,pausedStates:states.filter(s=>!!s.phase.paused).length,phases,jsonEnvelopeProbes:probes,exceptions:0,mutations:0,identityFailures:0};
const bytes=JSON.stringify(report,null,2)+'\n';
if(process.argv.includes('--write'))writeFileSync('total-envelopes-report.json',bytes);
else assert.equal(readFileSync('total-envelopes-report.json','utf8'),bytes);
console.log(bytes);
