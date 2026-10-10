import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
type Mutation={file:'core'|'cards'|'scoring';name:string;before:string;after:string};
const mutations:Mutation[]=[
 {file:'scoring',name:'Exact contract treated as failure',before:'contractTricks>=bid',after:'contractTricks>bid'},
 {file:'scoring',name:'Contracts worth nine instead of ten',before:'made?10*bid:-10*bid',after:'made?9*bid:-9*bid'},
 {file:'scoring',name:'Failed contract awards points',before:'made?10*bid:-10*bid',after:'made?10*bid:10*bid'},
 {file:'scoring',name:'Blind nil loses double bonus',before:"p.bid.kind==='blind'?2:1",after:"p.bid.kind==='blind'?1:1"},
 {file:'scoring',name:'Nil success and failure signs reversed',before:'p.won===0?1:-1',after:'p.won===0?-1:1'},
 {file:'scoring',name:'Bag penalty waits until eleven',before:'Math.floor((beforeBags+newBags)/10)',after:'Math.floor((beforeBags+newBags)/11)'},
 {file:'scoring',name:'Bag carry uses nine',before:'bags=(beforeBags+newBags)%10',after:'bags=(beforeBags+newBags)%9'},
 {file:'scoring',name:'Carried bags ignored by penalty',before:'Math.floor((beforeBags+newBags)/10)',after:'Math.floor(newBags/10)'},
 {file:'scoring',name:'Failed nil silently rescues normal contract',before:'+(failedNilCounts?nilWon:0)',after:'+nilWon'},
 {file:'scoring',name:'Nil tricks stop counting as bags',before:'extra+(!failedNilCounts||!normal.length?nilWon:0)',after:'extra'},
 {file:'cards',name:'Follow latest card instead of original lead',before:'suit(c)===suit(trick[0]!.card)',after:'suit(c)===suit(trick.at(-1)!.card)'},
 {file:'cards',name:'Unbroken spades always leadable',before:'broken||!normal.length?',after:'true?'},
 {file:'cards',name:'All-spades exception removed',before:'broken||!normal.length?',after:'broken?'},
 {file:'cards',name:'Lower rank beats higher rank',before:'rank(play.card)>rank(winner.card)',after:'rank(play.card)<rank(winner.card)'},
 {file:'cards',name:'Hearts become trump',before:'suit(play.card)===3&&suit(winner.card)!==3',after:'suit(play.card)===2&&suit(winner.card)!==2'},
 {file:'core',name:'Blind decision leaks own hand',before:'playing&&s.looked.includes(id)',after:'playing'},
 {file:'core',name:'Four-player bids exceed thirteen',before:'input.value<=(s.seats.length===4?13:17)',after:'input.value>=1'},
 {file:'core',name:'Duplicate exchange accepted',before:'new Set(input.cards).size!==2',after:'false'},
 {file:'core',name:'Wrong actor accepted',before:'if(current!==id)return s;',after:'if(false)return s;'},
 {file:'core',name:'Spectator input accepted',before:'if(!eligible(s,event.playerId))return s;',after:'if(false)return s;'},
 {file:'core',name:'Stale phase nonce ignored',before:'event.startedAt===s.phase.startedAt',after:'true'},
 {file:'core',name:'Early deadline accepted',before:'event.now>=s.phase.deadline',after:'true'},
 {file:'core',name:'Pause stops freezing input/timer',before:"if(s.phase.paused||s.phase.id==='done')return s;",after:"if(s.phase.id==='done')return s;"},
 {file:'core',name:'Exact 500 fails to end match',before:'target=high>=500',after:'target=high>500'},
 {file:'core',name:'Shared leading tie ends match',before:'leaders===1&&(target||mercy)',after:'(target||mercy)'}
];
const run=(env:Record<string,string>={})=>spawnSync(process.execPath,['--test','test.ts'],{encoding:'utf8',timeout:60000,maxBuffer:4*1024*1024,env:{...process.env,FAST_TEST:'1',...env}});
const baseline=run();assert.equal(baseline.status,0,baseline.stdout+baseline.stderr);assert(/(?:ℹ tests 28|# tests 28)/.test(baseline.stdout));
const records=[];
for(const [i,m] of mutations.entries()){
 const source=readFileSync(`${m.file}.ts`,'utf8');assert.equal(source.split(m.before).length,2,`mutation ${i+1} must replace exactly once`);
 const path=`.mutation-${m.file}-${i+1}.ts`,variable=m.file==='core'?'CORE_PATH':m.file==='cards'?'CARD_PATH':'SCORE_PATH';
 let output='';try{
  writeFileSync(path,source.replace(m.before,m.after));const result=run({[variable]:`./${path}`});output=result.stdout+result.stderr;
  assert(!result.error,`mutation ${i+1} timed out or failed to execute`);
  assert(!/SyntaxError|ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED/.test(output),`mutation ${i+1} must reach assertions`);
  assert(result.status!==0&&/ERR_ASSERTION/.test(output)&&/(?:ℹ fail [1-9]|# fail [1-9])/.test(output),`surviving mutation ${i+1}: ${output}`);
 }finally{unlinkSync(path);}
 const failedNames=output.split('\n').filter(line=>line.startsWith('✖ ')||line.startsWith('not ok ')).map(line=>line.replace(/ \([\d.]+ms\)$/,''));
 records.push({id:i+1,module:m.file,bug:m.name,killed:true,assertionFailures:[...new Set(failedNames)]});console.log(`${i+1}/25 killed: ${m.name}`);
}
const report={planted:25,killed:records.length,baselineTests:28,startupFailuresCounted:0,timeoutsCounted:0,records};
if(process.argv.includes('--write'))writeFileSync('mutation-results.json',JSON.stringify(report,null,2)+'\n');
else {const prior=JSON.parse(readFileSync('mutation-results.json','utf8'));assert.equal(prior.planted,25);assert.equal(prior.killed,25);assert.deepEqual(prior.records.map((m:{bug:string})=>m.bug),records.map(m=>m.bug));}
console.log('25/25 genuine assertion kills; baseline 28/28; no startup failures/timeouts counted');
