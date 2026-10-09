import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createRng} from '../../contract/rng.ts';
import {init,reduce} from './core.ts';
// Independently total credit author by author, using displayed option text and
// raw writings. Production totals voter by voter and uses option ownership.
const canonical=(text:string)=>text.normalize('NFKC').replace(/[\p{Cc}\p{Cf}]/gu,' ').split(/\s+/u).filter(Boolean).join(' ').toLowerCase();
let lastRounds=0,duplicates=0,correctWrites=0;
for(let seed=1;seed<=10000;seed++){
 const rng=createRng(seed),n=2+seed%7;
 let s=init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true,bot:true})),seed,now:0,settings:{mode:'bluff'}});
 while(s.phase.id!=='write')s=reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:s.phase.startedAt,now:s.phase.deadline!});
 if(seed%2===0){s={...s,round:s.settings.rounds};lastRounds++;}
 const truth=String(s.question.correct),writing:Record<string,string>={};
 for(const id of s.seats){const text=rng.chance(.15)?truth:rng.pick(['fake one','FAKE  ONE','fake two','fake three','  ｆａｋｅ\nｔｗｏ  ']);writing[id]=text;s=reduce(s,{type:'input',playerId:id,input:{type:'write',text},now:s.phase.startedAt+1});}
 const options=s.options.map(o=>({id:o.id,text:o.text})),votes:Record<string,string>={};
 if(s.phase.id==='vote')for(const id of s.seats){
  if(canonical(writing[id]!)===canonical(truth))continue;
  const choices=options.filter(o=>canonical(o.text)!==canonical(writing[id]!));
  const chosen=rng.pick(choices);votes[id]=chosen.text;
  s=reduce(s,{type:'input',playerId:id,input:{type:'vote',choice:chosen.id},now:s.phase.startedAt+1});
 }
 assert.equal(s.phase.id,'reveal');
 const expected:Record<string,number>={};
 for(const author of s.seats){
  const word=canonical(writing[author]!),knows=word===canonical(truth);if(knows)correctWrites++;
  let points=knows||canonical(votes[author]??'')===canonical(truth)?1000:0;
  if(!knows){const owners=s.seats.filter(id=>canonical(writing[id]!)===word);if(owners.length>1)duplicates++;
   const fooled=s.seats.filter(voter=>canonical(writing[voter]!)!==canonical(truth)&&!owners.includes(voter)&&canonical(votes[voter]??'')===word).length;
   points+=fooled*Math.floor(500/owners.length);
  }
  expected[author]=points*(s.round===s.settings.rounds?2:1);
 }
 assert.deepEqual(s.last!.awards,expected,`seed ${seed}`);
}
const report={cases:10000,mismatches:0,lastRounds,duplicateAuthorCases:duplicates,correctWrites,implementations:['production voter accumulation','independent author accumulation from raw text']};
writeFileSync('bluff-differential-report.json',JSON.stringify(report,null,2)+'\n');console.log(report);
