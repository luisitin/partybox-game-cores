import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const original=readFileSync('core.ts','utf8');
const bugs:[string,string,string][]=[
 ['stale phase accepted',"event.phaseId===s.phase.id&&","true&&"],
 ['stale nonce accepted',"event.startedAt===s.phase.startedAt&&","true&&"],
 ['early timer accepted',"event.now>=s.phase.deadline?","true?"],
 ['paused play accepted',"if(s.phase.paused||s.phase.id==='done')return s;","if(s.phase.id==='done')return s;"],
 ['prototype spectator becomes player','Object.hasOwn(s.players,id)&&s.seats.includes(id)','id in s.players'],
 ['century zero accepted','Number.isInteger(value)&&value!==0','Number.isInteger(value)'],
 ['nondecade answer accepted','Number.isInteger(value)&&value%10===0','Number.isInteger(value)'],
 ['out-of-range estimate accepted','if(value<row.min||value>row.max)return false;','if(false)return false;'],
 ['answer can be replaced',"s.phase.id!=='answer'||Object.hasOwn(s.responses,id)||","s.phase.id!=='answer'||"],
 ['own fake vote accepted','!option||option.owners.includes(id)','!option'],
 ['duplicate author lost','if(group)group.owners.push(id);','if(group){}'],
 ['fake case normalization lost','const normalized=normalize(answer);','const normalized=answer;'],
 ['correct write earns nothing','if(s.knowledge.includes(id)){awards[id]!+=1000;','if(s.knowledge.includes(id)){awards[id]!+=0;'],
 ['fooled credit removed','Math.floor(500/choice.owners.length)','Math.floor(0/choice.owners.length)'],
 ['truth overwrites earlier fooled credit','if(choice.correct)awards[id]!+=1000;','if(choice.correct)awards[id]=1000;'],
 ['last round not doubled','s.round===s.settings.rounds?2:1','s.round===s.settings.rounds?1:1'],
 ['results never returned',"if(s.phase.id!=='done')return null;","if(true)return null;"],
 ['left seat omitted from ranking','ranking:s.seats.map(id=>','ranking:s.seats.filter(id=>!s.left.includes(id)).map(id=>'],
 ['pause duration lost','rest.deadline+delay','rest.deadline'],
 ['resume remains paused','const {paused,...rest}=s.phase;','const rest=s.phase;'],
 ['demo only one second','demo:10000','demo:1000'],
 ['every repeat gets demo','if(!s.seen.includes(s.question.realm))','if(true)'],
 ['demo reveals live row','example:{...example}','example:{...question}'],
 ['live answer leaks in projection','return out;','return {...out,correct:row.correct} as QuestionView;'],
 ['phone gets another private answer','s.responses[id]!:null','s.responses[s.seats[1]!]!:null']
];
assert.equal(bugs.length,25);
function run(path?:string){return spawnSync(process.execPath,['--test','test.ts'],{encoding:'utf8',env:{...process.env,FAST_TEST:'1',...(path?{CORE_PATH:path}:{})},timeout:60000});}
const baseline=run();assert.equal(baseline.status,0,baseline.stdout+baseline.stderr);
const report=[];
for(let i=0;i<bugs.length;i++){
 const [name,from,to]=bugs[i]!;assert.equal(original.split(from).length,2,`${name}: mutation must target exactly once`);
 const path=`./mutant-${i}.ts`;writeFileSync(path,original.replace(from,to));
 try{const result=run(path),output=result.stdout+result.stderr;
  assert(!/SyntaxError|ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX/.test(output),`${name}: startup failure is not a killed bug`);
  const killed=result.status!==0&&/ℹ fail [1-9]/.test(output);report.push({name,killed});console.log(name,killed?'KILLED':'SURVIVED');
 }finally{unlinkSync(path);}
}
const killed=report.filter(r=>r.killed).length;
writeFileSync('mutation-report.json',JSON.stringify({planted:25,killed,baseline:'22 focused tests passed',mutations:report},null,2)+'\n');
assert(killed>=24,`${killed}/25 killed; at least24 required`);
