/** Registered actual-core selection study; sampler/scoring are never overridden. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {game} from '../src/index';
import {CATEGORIES,LETTERS} from '../content/categories';
import {sameAnswer} from '../src/match';
import {createRng} from '../../../contract/rng';
import type {GameEvent} from '../../../contract/contract';
import type {State,Input} from '../src/model';
const root=new URL('../',import.meta.url),digest=(s:string)=>createHash('sha256').update(s).digest('hex');
const fileHash=(name:string)=>digest(readFileSync(new URL(name,root),'utf8'));
const players=(count:number)=>Array.from({length:count},(_,i)=>({id:`p${i}`,name:`Bot ${i}`,avatarId:'face0',connected:true,bot:true}));
const initialize=(seed:number,count:number)=>game.init({players:players(count),settings:{rounds:1,roundSeconds:30},seed:seed+65536,now:0});
const fixturePath=new URL('evidence/selection-seeds.json',root);
const mode=process.argv[2]??'baseline';assert(['plan','baseline','candidate'].includes(mode));
if(mode==='plan'){
  assert(!existsSync(fixturePath),'Registered seeds may not be silently replaced');
  const counts=new Map<string,number>(),heldout:{seed:number;letter:string}[]=[];
  for(let seed=1000001;heldout.length<800;seed++){
    assert(seed<1020000);const letter=initialize(seed,2).letter,count=counts.get(letter)??0;
    if(count<40){heldout.push({seed,letter});counts.set(letter,count+1);}
  }
  assert.equal(counts.size,20);assert([...counts.values()].every(n=>n===40));
  const plan={protocol:'theme-window-k3-actual-core-v1',baselineCoreSha256:fileHash('src/index.ts'),matcherSha256:fileHash('src/match.ts'),dataSha256:fileHash('content/categories.json'),sampler:'actual unmodified sharp bot',rosters:[2,4,8],primaryWindow:3,explorationSlots:[0,4,8],pilotSeeds:Array.from({length:200},(_,i)=>i+1),heldout,guards:{minimumEightSeatMeanGain:1,alternativeZeroTableReductionPercentagePoints:10,maximumRelativeBankCoverageLoss:0.1,maximumRelativePromptCoverageLoss:0.1,minimumEntropyRatio:0.9,maximumBlankRateIncreasePercentagePoints:0.5,maximumNewOwnRepeats:0,smallRosterExactStateIdentity:true,letterAndThemeSchedulesUnchanged:true},notes:['Held-out seeds selected only by initial letter before candidate outcomes.','K3 is primary; K2 is sensitivity only and cannot replace it after outcomes.','Three exploration positions are25% of positions, not25% exposure per prompt.','All report rows are actual complete games with every-event JSON restore and independent replay.','Original200 pilot and balanced800 heldout are reported separately; no scoring, answer suppression or bot override.']};
  writeFileSync(fixturePath,JSON.stringify(plan,null,2)+'\n');console.log(JSON.stringify({registered:true,seeds:heldout.length,fixtureSha256:fileHash('evidence/selection-seeds.json'),baselineCoreSha256:plan.baselineCoreSha256}));
  process.exit(0);
}
const plan=JSON.parse(readFileSync(fixturePath,'utf8')) as {pilotSeeds:number[];heldout:{seed:number;letter:string}[];baselineCoreSha256:string;guards:Record<string,unknown>};
if(mode==='baseline')assert.equal(fileHash('src/index.ts'),plan.baselineCoreSha256,'Baseline must run before live core modification');
const report:{protocol:string;mode:string;sourceHashes:Record<string,string|null>;fixtureSha256:string;guards:Record<string,unknown>;cohorts:unknown[]}={protocol:'theme-window-k3-actual-core-v1',mode,sourceHashes:{core:fileHash('src/index.ts'),matcher:fileHash('src/match.ts'),scoring:fileHash('src/scoring.ts'),data:fileHash('content/categories.json'),experiment:fileHash('scripts/selection-experiment.ts'),selection:mode==='candidate'?fileHash('src/select.ts'):null},fixtureSha256:fileHash('evidence/selection-seeds.json'),guards:plan.guards,cohorts:[]};
const sourceById=new Map(CATEGORIES.map(c=>[c.id,c]));
function play(seed:number,count:number){
  const rngs=Array.from({length:count},(_,i)=>createRng((seed*8191)^(i*104729+0x76ad)));
  let state=initialize(seed,count);const letter=state.letter,layout=state.categories.map(c=>c.id),themes=state.categories.map(c=>c.theme),initialRng=state.rng;
  const events=createHash('sha256');let steps=0,exhaustedBlanks=0,availablePoolBlanks=0;
  for(;steps<200&&state.phase.id!=='done';steps++){
    let event:GameEvent<Input>|null=null;
    for(let i=0;i<count;i++){
      const input=game.bot.sampleInput(state,`p${i}`,rngs[i],'sharp');
      if(input){
        if(input.type==='submit')for(let c=0;c<12;c++)if(!input.answers[c]){
          const bank=sourceById.get(state.categories[c].id)!.answers[letter]??[];
          const available=bank.filter(a=>!input.answers.slice(0,c).some(used=>sameAnswer(used,a)));
          if(available.length===0)exhaustedBlanks++;else availablePoolBlanks++;
        }
        event={type:'input',now:state.phaseClock+1,playerId:`p${i}`,input};break;
      }
    }
    if(!event)event={type:'timer',now:state.phase.deadline!,phaseId:state.phase.id,startedAt:state.phase.startedAt};
    events.update(JSON.stringify(event));state=game.reduce(JSON.parse(JSON.stringify(state)) as State,event);
  }
  assert.equal(state.phase.id,'done');assert.equal(state.history.length,1);assert.equal(state.phase.deadline,null);
  let submitted=0,duplicates=0,repeatedOwn=0;
  for(const entry of state.history[0].entries)for(const group of entry.groups){submitted+=group.owners.length;if(group.duplicate)duplicates+=group.owners.length;if(!group.eligible)repeatedOwn+=group.owners.length;}
  const scores=state.order.map(id=>state.scores[id]),points=scores.reduce((a,b)=>a+b,0),blank=count*12-submitted;
  assert.equal(blank,exhaustedBlanks+availablePoolBlanks);assert.equal(new Set(layout).size,12);
  return {seed,letter,layout,themes,initialRng,points,scores,submitted,duplicates,blank,exhaustedBlanks,availablePoolBlanks,repeatedOwn,steps,eventHash:events.digest('hex'),stateHash:digest(JSON.stringify(state))};
}
for(const cohort of ['pilot','heldout'] as const)for(const count of [2,4,8]){
  const seeds=cohort==='pilot'?plan.pilotSeeds:plan.heldout.map(r=>r.seed),rows=[];
  const coverage=new Map<string,number>(),promptCoverage=new Set<string>();let points=0,zeroTables=0,zeroSeats=0,submitted=0,duplicates=0,blank=0,exhaustedBlanks=0,availablePoolBlanks=0,repeatedOwn=0;
  for(const seed of seeds){
    const first=play(seed,count),replay=play(seed,count);assert.deepEqual(replay,first,`exact restored replay ${cohort}/${count}/${seed}`);
    if(cohort==='heldout')assert.equal(first.letter,plan.heldout.find(r=>r.seed===seed)!.letter);
    rows.push(first);points+=first.points;zeroTables+=Number(first.points===0);zeroSeats+=first.scores.filter(p=>p===0).length;submitted+=first.submitted;duplicates+=first.duplicates;blank+=first.blank;exhaustedBlanks+=first.exhaustedBlanks;availablePoolBlanks+=first.availablePoolBlanks;repeatedOwn+=first.repeatedOwn;
    for(const id of first.layout){const key=id+'/'+first.letter;coverage.set(key,(coverage.get(key)??0)+1);promptCoverage.add(id);}
  }
  const exposures=rows.length*12,entropy=-[...coverage.values()].reduce((n,x)=>n+(x/exposures)*Math.log2(x/exposures),0);
  const perLetter=LETTERS.map(letter=>{const selected=rows.filter(r=>r.letter===letter);return {letter,games:selected.length,points:selected.reduce((n,r)=>n+r.points,0),zeroTables:selected.filter(r=>r.points===0).length,blank:selected.reduce((n,r)=>n+r.blank,0)};});
  const result={cohort,players:count,games:rows.length,summary:{points,meanPoints:points/rows.length,zeroTables,zeroTableRate:zeroTables/rows.length,zeroSeats,submitted,duplicates,duplicateOwnerRate:duplicates/submitted,blank,blankRate:blank/(rows.length*count*12),exhaustedBlanks,availablePoolBlanks,repeatedOwn,replays:rows.length,bankCoverage:coverage.size,promptCoverage:promptCoverage.size,entropyBits:entropy,maxBankShare:Math.max(...coverage.values())/exposures},perLetter,exposures:[...coverage].sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0).map(([bank,count])=>({bank,count})),rows};
  report.cohorts.push(result);console.log(JSON.stringify({mode,cohort,players:count,summary:result.summary}));
}
assert.equal(fileHash('src/index.ts'),report.sourceHashes.core,'Core changed while study ran');assert.equal(fileHash('src/match.ts'),report.sourceHashes.matcher);assert.equal(fileHash('content/categories.json'),report.sourceHashes.data);
writeFileSync(new URL(`evidence/selection-${mode}.json`,root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({complete:true,mode,games:3000,sourceHashes:report.sourceHashes,fixtureSha256:report.fixtureSha256}));
