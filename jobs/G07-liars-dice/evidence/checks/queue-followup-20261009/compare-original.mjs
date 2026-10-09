import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import * as current from '../../../dist/core.mjs';

const flag=process.argv.slice(2);
assert.equal(flag.length,1);assert.ok(flag[0].startsWith('--baseline-core='));
const baselinePath=resolve(flag[0].slice('--baseline-core='.length));
const baselineBytes=readFileSync(baselinePath);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
assert.equal(hash(baselineBytes),'947f4f6fabf7d6eb0264a7175df2bb4003e918be7fa4dda1fc23acee83d5c076','use the actual immutable canonical core from official artifact 11575897174');
const old=await import(pathToFileURL(baselinePath).href);
const ids=['','__proto__','constructor','toString','alpha','beta','gamma','delta'];
const editions=[];
for(const onesWild of [false,true])for(const palificoEnabled of [false,true])
for(const palificoExemption of ['none','oneDie','experienced'])for(const calzaEnabled of [false,true])
for(const calzaPolicy of ['anyOther','interruptOnly'])editions.push({onesWild,palificoEnabled,palificoExemption,calzaEnabled,calzaPolicy});
const ctx=(count,mask,settings,seed,now=1000)=>({players:ids.slice(0,count).map((id,i)=>({id,name:`Seat ${i+1}`,avatarId:'face',connected:!!(mask&(1<<i)),bot:true})),settings,seed,now});
const transcript=createHash('sha256');
const stats={baselineCoreSha256:hash(baselineBytes),currentCoreSha256:hash(readFileSync(new URL('../../../dist/core.mjs',import.meta.url))),allConnectedByteEqualControls:0,mixedPresenceContexts:0,originalStalledStarts:0,currentStalledStarts:0,ordinaryDepartureByteEqualControls:0,unchangedPresentOrEmptyControls:0};
for(let count=2;count<=8;count++)for(const settings of editions)for(const turnSeconds of [0,1,120])
for(const seed of [1,2,3,7,17,7199,0xffffffff,0x80000000]){
  const context=ctx(count,(1<<count)-1,{...settings,turnSeconds},seed);
  const original=JSON.stringify(old.init(context)),next=JSON.stringify(current.init(context));
  assert.equal(next,original,'all-connected initialization must remain byte-identical');
  transcript.update(hash(original));stats.allConnectedByteEqualControls++;
}
for(let count=2;count<=8;count++)for(let edition=0;edition<editions.length;edition++)
for(let mask=0;mask<(1<<count);mask++){
  const context=ctx(count,mask,{...editions[edition],turnSeconds:0},(Math.imul(mask+1,0x9e3779b1)^Math.imul(edition+1,0x85ebca6b)^count)>>>0);
  const original=old.init(context),next=current.init(context),occupied=context.players.some(p=>p.connected);
  const oldStalled=occupied&&original.phase.id==='bid'&&!original.phase.paused&&!original.players[original.turn].connected;
  const newStalled=occupied&&next.phase.id==='bid'&&!next.phase.paused&&!next.players[next.turn].connected;
  if(oldStalled){
    const starter=original.turn;
    const ordinary=old.init({...context,players:context.players.map(p=>p.id===starter?{...p,connected:true}:p)});
    const expected=old.reduce(ordinary,{type:'player',playerId:starter,connected:false,now:context.now});
    assert.deepEqual(next,expected,'the actual old ordinary departure defines the unchanged automatic-turn policy');
    stats.originalStalledStarts++;stats.ordinaryDepartureByteEqualControls++;
  }else{
    assert.deepEqual(next,original,'an empty room or present first player must remain unchanged');
    stats.unchangedPresentOrEmptyControls++;
  }
  assert.equal(newStalled,false);stats.currentStalledStarts+=Number(newStalled);
  transcript.update(hash(JSON.stringify(original)));transcript.update(hash(JSON.stringify(next)));stats.mixedPresenceContexts++;
}
assert.equal(stats.allConnectedByteEqualControls,8064);assert.equal(stats.mixedPresenceContexts,24384);
assert.equal(stats.originalStalledStarts,11878);assert.equal(stats.currentStalledStarts,0);
const report={passed:true,...stats,transcriptSha256:transcript.digest('hex'),scope:'Actual original/new startup states and the old public departure behavior; no win-rate or timing claim'};
writeFileSync(new URL('./original-comparison.json',import.meta.url),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
