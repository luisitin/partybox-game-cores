import{cpSync,readFileSync,writeFileSync,mkdirSync,rmSync}from'node:fs';import{spawnSync}from'node:child_process';import{resolve}from'node:path';import assert from'node:assert/strict';
const mutations=[
 ['M01','rules.js','suit(card) === 3 ? 1 :','suit(card) === 3 ? 0 :','Hearts worth zero'],
 ['M02','rules.js','card === 36 ? 13 : 0','card === 36 ? 1 : 0','Queen worth one'],
 ['M03','rules.js','return [0, 1, 13, 26];','return [0, 14, 13, 26];','Wrong six-seat cut'],
 ['M04','rules.js','count / 2, 0','1, 0','Wrong across recipient'],
 ['M05','rules.js','hand.includes(opening) ? [opening] : []','[...hand]','Unforced opening'],
 ['M06','rules.js','if (following.length)','if (false)','Ignore suit following'],
 ['M07','rules.js','const safe = first ?','const safe = false ?','Allow first-trick penalty when safe card exists'],
 ['M08','rules.js','broken || suit(c) !== 3','true','Lead unbroken hearts'],
 ['M09','rules.js','return leads.length ? leads : [...hand];','return leads;','Block all-heart exception'],
 ['M10','rules.js','suit(play.card) === suit(winner.card) &&','true &&','Off-suit card wins'],
 ['M11','rules.js','rank(play.card) > rank(winner.card)','rank(play.card) < rank(winner.card)','Lowest led card wins'],
 ['M12','rules.js','raw[id] === 26','raw[id] === 25','Wrong moon qualification'],
 ['M13','rules.js','id === moon ? 0 : 26','id === moon ? 26 : 0','Reverse add-moon recipients'],
 ['M14','rules.js','id === moon ? -26 : 0','id === moon ? 26 : 0','Wrong subtract-moon sign'],
 ['M15','rules.js','score -= 10;','score += 10;','Jack adds penalties'],
 ['M16','core.js','new Set(cards).size !== 3','false','Accept duplicate pass cards'],
 ['M17','core.js','i - s.passOffset + n','i + s.passOffset + n','Reverse pass direction'],
 ['M18','core.js','id !== s.actor ||','false ||','Allow out-of-turn play'],
 ['M19','core.js','!legalCards(s.hands[id] ?? [], s.trick, s.trickNumber === 0, s.heartsBroken, s.opening).includes(card)','false','Allow unowned or illegal play'],
 ['M20','core.js',"if (s.phase.paused || s.phase.id === 'done')","if (false || s.phase.id === 'done')",'Accept input during pause'],
 ['M21','core.js','event.startedAt === s.phase.startedAt','true','Accept stale timer instance'],
 ['M22','core.js','event.now >= s.phase.deadline ? advance','true ? advance','Accept early timer'],
 ['M23','core.js','info.deadline + Math.max(0, event.now - paused.at)','info.deadline','Lose pause duration'],
 ['M24','core.js','if (s.handScored)','if (false)','Double-count completed hand on end'],
 ['M25','bot.js',"skill === 'sharp' ? strongCard(view)","skill === 'sharp' ? mediumCard(view)",'Collapse strong Jack strategy to medium'],
];
const dir=resolve('.tmp/mutant-build');mkdirSync('.tmp',{recursive:true});const outcomes=[];
try{for(const[id,file,from,to,description]of mutations){
 rmSync(dir,{recursive:true,force:true});cpSync('.build',dir,{recursive:true});const path=`${dir}/jobs/G05-hearts/src/${file}`,source=readFileSync(path,'utf8');assert.equal(source.split(from).length-1,1,`${id}: unique mutation anchor required`);writeFileSync(path,source.replace(from,to));
 const valid=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});assert.equal(valid.status,0,`${id}: syntactically invalid`);
 const result=spawnSync(process.execPath,['--test','tests/focused.test.mjs'],{env:{...process.env,G05_BUILD_DIR:dir},encoding:'utf8',timeout:60_000});if(result.error)throw result.error;
 const killed=result.status!==0,failedTests=result.stdout.split('\n').filter(line=>/not ok|^✖/.test(line)).map(x=>x.trim());assert.ok(!killed||failedTests.length,`${id}: setup failure rather than test catch: ${result.stderr}`);
 outcomes.push({id,file,description,killed,failedTests});console.log(`${id}: ${killed?'caught':'SURVIVED'} — ${description}`);
}writeFileSync('.tmp/mutation-results.json',JSON.stringify(outcomes,null,2)+'\n');assert.ok(outcomes.filter(x=>x.killed).length>=24);console.log(JSON.stringify({planted:25,caught:outcomes.filter(x=>x.killed).length}));}finally{rmSync(dir,{recursive:true,force:true});}
