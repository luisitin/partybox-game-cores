import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
type Mutation={id:string;file:string;before:string;after:string};
const mutations:Mutation[]=[
  {id:'M01 retain leading articles',file:'match.ts',before:".replace(/^(a|an|the)\\s+/,'')",after:".replace(/^(a|an|the)\\s+/,'the ')"},
  {id:'M02 do not decompose accents',file:'match.ts',before:"normalize('NFD')",after:"normalize('NFC')"},
  {id:'M03 omit number-word conversion',file:'match.ts',before:"const tens=TENS.indexOf(words[i]),one=ONES.indexOf(words[i]);",after:"const tens=-1,one=-1;"},
  {id:'M04 disable plural stemming',file:'match.ts',before:"export function stem(word:string):string {",after:"export function stem(word:string):string { return word;"},
  {id:'M05 disable long-answer typo matching',file:'match.ts',before:'Math.min(left.compact.length,right.compact.length)>=6',after:'Math.min(left.compact.length,right.compact.length)>=99'},
  {id:'M06 fuzzy-match numerical answers',file:'match.ts',before:"!/[0-9]/.test(left.compact+right.compact)&&",after:''},
  {id:'M07 do not group duplicates',file:'match.ts',before:'if(sameAnswer(texts[i],texts[j]))',after:'if(false)'},
  {id:'M08 allow repeated own answer across categories',file:'scoring.ts',before:'const eligible=group.eligible&&!ownRepeated;',after:'const eligible=group.eligible;'},
  {id:'M09 allow wrong initial',file:'scoring.ts',before:'eligible:firstLetter(text)===s.letter',after:'eligible:true'},
  {id:'M10 award duplicate groups',file:'scoring.ts',before:'points:accepted&&!group.duplicate?1:0',after:'points:accepted?1:0'},
  {id:'M11 always accept group vote',file:'scoring.ts',before:'return all===0?sum(ballots.filter(x=>!owners.includes(x.id)))>0:all>0;',after:'return true;'},
  {id:'M12 keep author vote on tie',file:'scoring.ts',before:'return all===0?sum(ballots.filter(x=>!owners.includes(x.id)))>0:all>0;',after:'return all>=0;'},
  {id:'M13 reject unchallenged answers',file:'scoring.ts',before:'if(ballots.length===0)return true;',after:'if(ballots.length===0)return false;'},
  {id:'M14 accept stale startedAt',file:'index.ts',before:'event.startedAt===s.phase.startedAt&&',after:''},
  {id:'M15 fire timer before deadline',file:'index.ts',before:'event.now>=s.phase.deadline?advance(s,event.now):s;',after:'true?advance(s,event.now):s;'},
  {id:'M16 stepped review never re-arms later',file:'index.ts',before:'const deadline=Math.max(now+reviewMs(s,index),(s.phase.deadline??now)+1);',after:'const deadline=s.phase.deadline;'},
  {id:'M17 allow inputs while paused',file:'index.ts',before:"if(s.phase.paused||s.phase.id==='done')return s;",after:"if(s.phase.id==='done')return s;"},
  {id:'M18 fail to shift deadline on resume',file:'index.ts',before:'s.phase.deadline+held',after:'s.phase.deadline'},
  {id:'M19 put an active deadline on done',file:'index.ts',before:"phase(s,'done',now,null)",after:"phase(s,'done',now,1000)"},
  {id:'M20 trust inherited prototype player keys',file:'index.ts',before:'Object.hasOwn(s.players,id)',after:'Boolean(s.players[id])'},
  {id:'M21 expose another player own answers',file:'index.ts',before:'myAnswers:valid?[...s.answers[id]]:[]',after:'myAnswers:valid?[...s.answers[s.order[0]]]:[]'},
  {id:'M22 leak all private answers in TV envelope',file:'index.ts',before:'return {gameId:manifest.id,phaseId:s.phase.id',after:'return {answers:s.answers,gameId:manifest.id,phaseId:s.phase.id'},
  {id:'M23 fail totality on malformed input',file:'index.ts',before:'const parsed=inputSchema.safeParse(event.input);if(!parsed.success)return s;',after:'const parsed={success:true,data:event.input};'},
  {id:'M24 ignore explicit VIP end',file:'index.ts',before:"if(event.action==='end')return finish(s,event.now);",after:"if(event.action==='end')return s;"},
  {id:'M25 omit initialized seat from results',file:'index.ts',before:'scores:{...s.scores},ranking',after:'scores:Object.fromEntries(Object.entries(s.scores).slice(1)),ranking'},
];
const report:unknown[]=[];
const pattern='normalization:|score cancellation|settings clamp|pause ignores|unknown prototype|views never|reducer is total|manifest exact|bot strategies';
for(const mutation of mutations){
  const path=new URL(`../src/${mutation.file}`,import.meta.url),original=readFileSync(path,'utf8');
  if(!original.includes(mutation.before))throw new Error(`Mutation anchor unavailable: ${mutation.id}`);
  let result:ReturnType<typeof spawnSync>;
  try{
    writeFileSync(path,original.replace(mutation.before,mutation.after));
    result=spawnSync(process.execPath,['--import','tsx','--test',`--test-name-pattern=${pattern}`,'tests/core.test.ts'],{encoding:'utf8',timeout:120000});
  }finally{writeFileSync(path,original);}
  const killed=result!.status!==0&&!result!.error;
  const failures=(result!.stdout+'\n'+result!.stderr).split('\n').filter(line=>line.includes('not ok')||line.startsWith('✖')).slice(0,3);
  report.push({id:mutation.id,killed,exitCode:result!.status,failures});console.log(`${killed?'KILLED':'SURVIVED'} ${mutation.id}`);
}
const killed=report.filter((row:any)=>row.killed).length;
writeFileSync(new URL('../evidence/mutations.json',import.meta.url),JSON.stringify({total:mutations.length,killed,mutations:report},null,2)+'\n');
if(killed<24)throw new Error(`Only ${killed}/25 real mutations killed`);
