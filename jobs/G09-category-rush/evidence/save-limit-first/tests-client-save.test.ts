import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRng} from '../../../contract/rng';
import {game} from '../src/index';
import type {State,Input} from '../src/model';
import {CATEGORIES} from '../content/categories';
import {decodeSave,encodeSave,restoreBotRng,MAX_SAVE_CHARS,MAX_SAVE_BYTES} from '../client-save';
import type {SavedGame,SavedSeat} from '../client-save';

const compat='a'.repeat(64);
function initial(count:number,seed=42):{state:State;seats:SavedSeat[]} {
  const seats:SavedSeat[]=Array.from({length:count},(_,i)=>({id:`p${i+1}`,name:`Seat ${i+1}`,kind:'human'}));
  return {seats,state:game.init({players:seats.map(seat=>({id:seat.id,name:seat.name,avatarId:'default',connected:true})),settings:{rounds:2,roundSeconds:60},seed,now:0})};
}
function snapshot(state:State,seats:SavedSeat[]):SavedGame {
  const pending=seats.find(seat=>seat.kind==='human'&&(state.phase.id==='answer'?!state.submitted[seat.id]:state.phase.id==='review'&&!Object.hasOwn(state.votes,seat.id)));
  return {version:1,compat,state:structuredClone(state),seats:structuredClone(seats),config:{...state.cfg,seed:state.rng.seed},activeHuman:pending?.id??null,handover:!!pending,draft:Array<string>(12).fill(''),ballot:Array<boolean|null>(state.phase.id==='review'?(game.tvView(state).review?.groups.length??0):0).fill(null),coreNow:state.phase.startedAt,phaseBase:state.phase.startedAt,phaseElapsed:0,seatElapsed:0,botRngs:Object.fromEntries(seats.map((seat,i)=>[seat.id,{seed:(state.rng.seed+i*7919)>>>0,step:0}])),receiptRound:null};
}
function eventInput(state:State,id:string,input:Input):State {
  return game.reduce(state,{type:'input',playerId:id,now:state.phase.startedAt,input});
}

test('bounded local snapshots retain actual played two/eight-seat states, private draft and pause',()=>{
  for(const count of [2,8])for(const seed of [1,2,3,42]){
    let {state,seats}=initial(count,seed);const phases=new Set<string>();let checked=0;
    for(let step=0;step<250&&state.phase.id!=='done';step++){
      const save=snapshot(state,seats);
      if(state.phase.id==='answer')save.draft[0]=`${state.letter} private draft`;
      const raw=encodeSave(save),decoded=decodeSave(raw,compat);
      assert.equal(decoded.kind,'valid',`${count}/${seed}/${state.phase.id}/${step}`);
      if(decoded.kind==='valid')assert.deepEqual(decoded.snapshot,save);
      phases.add(state.phase.id);checked++;
      if(state.phase.id==='answer'){
        const id=state.order.find(player=>!state.submitted[player]);assert(id);
        const row=CATEGORIES.find(category=>category.id===state.categories[0].id)!;
        const answers=Array<string>(12).fill('');answers[0]=row.answers[state.letter][0];
        state=eventInput(state,id,{type:'submit',answers});
      }else if(state.phase.id==='review'){
        const id=state.order.find(player=>!Object.hasOwn(state.votes,player));assert(id);
        state=eventInput(state,id,{type:'vote',votes:Array<boolean|null>(game.tvView(state).review!.groups.length).fill(null)});
      }else state=game.reduce(state,{type:'input',playerId:state.order[0],vip:true,now:state.phase.startedAt,input:{type:'next'}});
    }
    assert.equal(state.phase.id,'done');assert(checked>20);phases.add(state.phase.id);
    assert.deepEqual([...phases].sort(),['answer','done','review','scores']);
    assert.equal(decodeSave(encodeSave(snapshot(state,seats)),compat).kind,'valid');
    const fresh=initial(count,seed);fresh.state=game.reduce(fresh.state,{type:'vip',action:'pause',now:5000});
    const paused=snapshot(fresh.state,fresh.seats);paused.coreNow=5000;paused.seatElapsed=5000;paused.phaseElapsed=5000;
    assert.equal(decodeSave(encodeSave(paused),compat).kind,'valid');
  }
});

test('corrupt, oversized, stale and inconsistent local saves are rejected before reducer use',()=>{
  const {state,seats}=initial(2),valid=snapshot(state,seats);
  assert.equal(decodeSave('{',compat).kind,'invalid');
  assert.equal(decodeSave(' '.repeat(MAX_SAVE_CHARS+1),compat).kind,'invalid');
  assert.equal(decodeSave(JSON.stringify({...valid,version:2}),compat).kind,'stale');
  assert.equal(decodeSave(JSON.stringify(valid),'b'.repeat(64)).kind,'stale');
  const corruptions:Array<(save:SavedGame)=>void>=[
    save=>{save.state.order[1]=save.state.order[0];},
    save=>{delete save.state.answers.p2;},
    save=>{save.state.players.p1.name='Different';},
    save=>{save.state.scores.p1=1;},
    save=>{save.activeHuman='p2';},
    save=>{save.state.categories[0].prompt='Invented';},
    save=>{save.config.seed++;},
    save=>{save.botRngs.p1.step=257;},
    save=>{save.botRngs.p1.seed++;},
    save=>{save.seatElapsed=60001;},
    save=>{save.state.phase.deadline=null;},
    save=>{save.state.phase.startedAt=Number.POSITIVE_INFINITY;},
    save=>{save.state.usedLetters[0]='Q';},
    save=>{save.ballot=[true];},
  ];
  for(const [i,corrupt] of corruptions.entries()){
    const candidate=structuredClone(valid);corrupt(candidate);
    assert.equal(decodeSave(JSON.stringify(candidate),compat).kind,'invalid',`corruption ${i}`);
  }
  let review=state;
  for(const id of review.order){const answers=Array<string>(12).fill('');answers[0]=review.letter+' valid';review=eventInput(review,id,{type:'submit',answers});}
  for(const id of review.order)review=eventInput(review,id,{type:'vote',votes:Array<boolean|null>(game.tvView(review).review!.groups.length).fill(null)});
  assert.equal(review.phase.id,'review');assert.equal(review.reviewIndex,1);
  const corruptReviewed=snapshot(review,seats);corruptReviewed.state.reviewed[0].groups[0].owners=['p9'];
  assert.equal(decodeSave(JSON.stringify(corruptReviewed),compat).kind,'invalid','unknown owner in an already reviewed category');
});

test('restored actual contract RNG continues exactly through all supported saved counters',()=>{
  for(const seed of [0,1,2,3,42,0xffffffff])for(const step of [0,1,12,60,120,256]){
    const original=createRng(seed);for(let i=0;i<step;i++)original.float();
    const restored=restoreBotRng(original.state());
    assert.deepEqual(restored.state(),original.state());
    for(let draw=0;draw<25;draw++)assert.equal(restored.float(),original.float());
  }
  for(const state of [{seed:-1,step:0},{seed:0x100000000,step:0},{seed:42,step:257},{seed:42,step:-1},{seed:42,step:1.5}])assert.throws(()=>restoreBotRng(state));
});

test('a legal five-round eight-seat maximum-length Unicode history remains saveable',()=>{
  const seats:SavedSeat[]=Array.from({length:8},(_,i)=>({id:`p${i+1}`,name:`Seat ${i+1}`,kind:'human'}));
  let state=game.init({players:seats.map(seat=>({id:seat.id,name:seat.name,avatarId:'default',connected:true})),settings:{rounds:5,roundSeconds:180},seed:42,now:0});
  let largest=0;
  for(let round=1;round<=5;round++){
    assert.equal(state.phase.id,'answer');assert.equal(state.round,round);
    for(const [seat,id] of state.order.entries()){
      const answers=Array.from({length:12},(_,category)=>{
        const prefix=`${state.letter} seat${seat} row${category} round${round} `;
        return prefix+'界'.repeat(80-prefix.length);
      });
      state=eventInput(state,id,{type:'submit',answers});
    }
    for(let category=0;category<12;category++){
      assert.equal(state.phase.id,'review');assert.equal(state.reviewIndex,category);
      assert.equal(game.tvView(state).review!.groups.length,8);
      for(const id of state.order)state=eventInput(state,id,{type:'vote',votes:Array<boolean|null>(8).fill(null)});
    }
    assert.equal(state.phase.id,'scores');
    assert(state.order.every(id=>state.scores[id]===round*12),'all legal unique answers score');
    const saved=snapshot(state,seats),raw=encodeSave(saved),bytes=Buffer.byteLength(raw,'utf8');
    largest=Math.max(largest,bytes);assert(bytes<=MAX_SAVE_BYTES&&raw.length<=MAX_SAVE_CHARS);
    assert.equal(decodeSave(raw,compat).kind,'valid');
    state=game.reduce(state,{type:'input',playerId:state.order[0],vip:true,now:state.phase.startedAt,input:{type:'next'}});
  }
  assert.equal(state.phase.id,'done');assert.equal(state.history.length,5);
  assert(largest>200_000,'the original 200,000-byte ceiling rejected a legal game');
  assert.equal(decodeSave(encodeSave(snapshot(state,seats)),compat).kind,'valid');
  console.log(`Measured largest legal five-round Unicode save: ${largest} UTF-8 bytes`);
});
