import {writeFileSync} from 'node:fs';
import {game} from '../src/index';
import {createRng} from '../../../contract/rng';
import type {Input} from '../src/model';
import type {BotSkill} from '../../../contract/constants';
import type {GameEvent} from '../../../contract/contract';
const lines:string[]=[];
for(const [a,b] of [['sharp','normal'],['normal','easy']] as [BotSkill,BotSkill][]){
  let aw=0,bw=0,ties=0,totalA=0,totalB=0;
  for(let seed=1;seed<=2000;seed++){
    const skills=seed%2===0?[a,b]:[b,a],rngs=[createRng(seed^0x76ad),createRng(seed^0x0c39)];
    let s=game.init({players:[0,1].map(i=>({id:`p${i}`,name:`Bot ${i}`,avatarId:'face0',connected:true,bot:true})),settings:{rounds:3,roundSeconds:30},seed:seed+8192,now:0});
    for(let step=0;step<200&&s.phase.id!=='done';step++){
      let event:GameEvent<Input>|null=null;
      for(let i=0;i<2;i++){
        const input=game.bot.sampleInput(s,`p${i}`,rngs[i],skills[i]);
        if(input){event={type:'input',now:s.phase.startedAt+10,playerId:`p${i}`,input};break;}
      }
      if(event===null)event={type:'timer',now:s.phase.deadline!,phaseId:s.phase.id,startedAt:s.phase.startedAt};
      s=game.reduce(s,event);
    }
    if(s.phase.id!=='done')throw new Error('Bot game did not end');
    const ai=skills.indexOf(a),bi=1-ai,as=s.scores[`p${ai}`],bs=s.scores[`p${bi}`];totalA+=as;totalB+=bs;
    if(as>bs)aw++;else if(bs>as)bw++;else ties++;
  }
  const report={matchup:`${a} vs ${b}`,games:2000,firstWins:aw,secondWins:bw,ties,firstMean:totalA/2000,secondMean:totalB/2000};
  lines.push(JSON.stringify(report));console.log(report);
  if(aw<=bw||aw/2000<0.60)throw new Error(`Skill separation not clear: ${a}`);
}
writeFileSync(new URL('../evidence/bot-matchups.jsonl',import.meta.url),lines.join('\n')+'\n');
