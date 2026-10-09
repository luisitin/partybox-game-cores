import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import * as general from '../dist/core.mjs';
import {searchMove as fullSearch} from '../dist/bots.mjs';
import {context,positionState} from './helpers.mjs';
import {evidence} from './evidence.mjs';

test('variant bundles preserve exact choices, reports, cursors and complete game transcripts',async()=>{
  const reports=[];
  for(const variant of ['american','international']){
    const core=await import('../dist/core-'+variant+'.mjs'),{searchMove}=await import('../dist/bots-'+variant+'.mjs');
    const length=variant==='american'?32:50,board=Array(length).fill(0);board[0]=-2;board[2]=-2;board[length-7]=2;board[length-1]=2;
    const quiet=positionState(general,board,variant),capture=Array(length).fill(0);
    if(variant==='american'){capture[22]=1;capture[17]=-1;capture[9]=-1;capture[26]=1;}
    else{capture[20]=1;capture[16]=-1;capture[7]=-1;capture[24]=1;capture[19]=-1;}
    const cases=[quiet,positionState(general,capture,variant),{...quiet,quietPlies:48,ply:70,drawWindows:[{kind:'five',weak:1,started:64,limit:10}]},
      {...quiet,repetition:{...quiet.repetition,historical:2}}];
    for(const state of cases)for(const skill of ['easy','normal','sharp']){
      const a=general.createRng(12345),b=core.createRng(12345);
      assert.deepEqual(searchMove(state,state.settings,b,skill),fullSearch(state,state.settings,a,skill));assert.deepEqual(b.state(),a.state());
    }
    for(const higher of ['normal','sharp']){
      let a=general.init(context({variant},1234)),b=core.init(context({variant},1234));
      const ar=general.createRng(0x1234),br=core.createRng(0x1234),transcript=createHash('sha256');let plies=0;
      for(;a.phase.id==='move'&&plies<2400;plies++){
        const skill=a.side===1?higher:'easy',id=general.turnId(a),ai=general.sampleInput(a,id,ar,skill),bi=core.sampleInput(b,id,br,skill);
        assert.deepEqual(bi,ai);assert.deepEqual(br.state(),ar.state());
        const event={type:'input',playerId:id,input:ai,now:2000+plies};a=general.reduce(a,event);b=core.reduce(b,event);assert.deepEqual(b,a);transcript.update(JSON.stringify([ai,ar.state(),a]));
      }
      assert.equal(a.phase.id,'done');reports.push({variant,higher,plies,winner:a.winner,transcriptSha256:transcript.digest('hex')});
    }
    if(variant==='international')assert(!readFileSync(new URL('../dist/endgame-international.mjs',import.meta.url),'utf8').includes('baee42a2b49390'));
  }
  evidence('variant-bundles.json',{choices:48,reports,scope:'Same pure source and budget; unused opposite-variant corpus removed only at build boundary; quiet/capture/draw-history decisions and complete games identical'});
});
