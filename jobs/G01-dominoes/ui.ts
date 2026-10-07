import {game,init,reduce,controllerView,tvView,tile,manifest,type State,type Input} from './core.ts';
import {createRng} from '../../contract/rng.ts';
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
let state:State|null=null,viewer='',revealed=false,botStep=0,pending:ReturnType<typeof setTimeout>|null=null;
const modes:('human'|'easy'|'normal'|'sharp')[]=[];
const seed=()=>Number(element<HTMLInputElement>('seed').value)||1;
const button=(text:string,run:()=>void)=>{const b=document.createElement('button');b.textContent=text;b.addEventListener('click',run);return b;};
const label=(t:number)=>{const [a,b]=tile(t);return `${a} | ${b}`;};
function send(input:Input){if(!state)return;const previous=state.turn;state=reduce(state,{type:'input',playerId:state.seats[state.turn]!,input,now:Date.now()});if(previous!==state.turn)revealed=false;render();}
function schedule(){
 if(pending!==null)clearTimeout(pending);pending=null;if(!state||state.phase.id==='done')return;
 const captured=state.phase.startedAt;
 if(state.phase.id==='round-end'){
  if(modes.every(m=>m!=='human'))pending=setTimeout(()=>{if(state?.phase.startedAt===captured)send({type:'next'});},200);
  return;
 }
 const skill=modes[state.turn];
 if(skill!=='human')pending=setTimeout(()=>{if(!state||state.phase.startedAt!==captured)return;const i=game.bot.sampleInput(state,state.seats[state.turn]!,createRng(seed()+botStep++),skill);if(i)send(i);},200);
 else pending=setTimeout(()=>{if(!state||state.phase.startedAt!==captured)return;state=reduce(state,{type:'timer',phaseId:state.phase.id,startedAt:captured,now:Math.max(Date.now(),state.phase.deadline!)});revealed=false;render();},Math.max(0,state.phase.deadline!-Date.now()));
}
function render(){
 if(!state)return;const publicView=tvView(state);const turn=state.seats[state.turn]!;
 const status=element('status');status.textContent=state.phase.id==='done'?'Match complete':state.phase.id==='round-end'?'Round complete':`${state.players[turn]!.name}'s turn`;
 const scores=element('scores');scores.replaceChildren();publicView.players.forEach((p,i)=>{const span=document.createElement('span');span.textContent=`${p.name}${state!.settings.partners?` (team ${i%2+1})`:''}: ${p.score} · ${publicView.counts[i]} tiles`;scores.append(span);});
 element('progress').textContent=`Round ${state.round} · Target ${state.settings.target} · Boneyard ${state.stock.length}`;
 const board=element('board');board.replaceChildren();for(const t of publicView.board){const span=document.createElement('span');span.className='domino';span.textContent=`${t.a} | ${t.b}`;board.append(span);}
 element('ends').textContent=state.ends?`Open ends: ${state.ends[0]} and ${state.ends[1]}`:'Empty board — opening tile';
 const hand=element('hand');hand.replaceChildren();const privacy=element('privacy');privacy.replaceChildren();const actions=element('actions');actions.replaceChildren();
 if(state.phase.id==='done'){
  const winners=game.results(state)!.winnerIds.map(id=>state!.players[id]!.name).join(' & ');element('message').textContent=`Winner${game.results(state)!.winnerIds.length>1?'s':''}: ${winners}.`;schedule();return;
 }
 if(state.phase.id==='round-end'){
  const last=state.last!;element('message').textContent=last.winner===null?'Blocked tie — no points.':`${state.players[state.seats[last.winner]!]!.name}${state.settings.partners?' and partner':''} scored ${last.points}${last.blocked?' on a blocked board':''}.`;
  actions.append(button('Next round',()=>send({type:'next'})));schedule();return;
 }
 element('message').textContent='Match either open end. You must play when able. Stuck? Draw one at a time or pass.';
 if(modes[state.turn]!=='human'){privacy.textContent='Bot is thinking. All private hands stay hidden.';schedule();return;}
 if(viewer!==turn){viewer=turn;revealed=false;}
 if(!revealed){privacy.append(button(`Pass the screen to ${state.players[turn]!.name} — reveal hand`,()=>{revealed=true;render();}));schedule();return;}
 const v=controllerView(state,turn);
 for(const t of v.hand){const card=document.createElement('div');card.className='hand-tile';const title=document.createElement('span');title.className='domino';title.textContent=label(t);card.append(title);
  const choices=v.legal.filter((i):i is Extract<Input,{type:'play'}>=>i.type==='play'&&i.tile===t);
  for(const i of choices)card.append(button(i.side==='left'?'← Left':'Right →',()=>send(i)));
  if(!choices.length)card.classList.add('unplayable');hand.append(card);
 }
 for(const i of v.legal)if(i.type==='draw'||i.type==='pass')actions.append(button(i.type==='draw'?'Draw one tile':'Pass',()=>send(i)));
 actions.append(button('Hide hand',()=>{revealed=false;render();}));schedule();
}
function roster(){const n=Number(element<HTMLSelectElement>('players').value);const list=element('roster');list.replaceChildren();for(let i=0;i<n;i++){
 const line=document.createElement('label');line.textContent=`Seat ${i+1} `;const select=document.createElement('select');select.id=`seat-${i}`;for(const [value,text] of [['human','Human'],['easy','Easy bot'],['normal','Medium bot'],['sharp','Strong bot']]){const o=document.createElement('option');o.value=value!;o.textContent=text!;select.append(o);}if(i>0)select.value='normal';line.append(select);list.append(line);
}}
element('players').addEventListener('change',roster);roster();
element('start').addEventListener('click',()=>{
 const n=Number(element<HTMLSelectElement>('players').value);modes.length=0;for(let i=0;i<n;i++)modes.push(element<HTMLSelectElement>(`seat-${i}`).value as typeof modes[number]);
 const settings:Record<string,string|boolean>={};for(const spec of manifest.settings){const e=element<HTMLInputElement>(spec.key);settings[spec.key]=spec.type==='boolean'?e.checked:e.value;}
 state=init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Seat ${i+1}`,avatarId:'🙂',connected:true,bot:modes[i]!=='human'})),settings,seed:seed(),now:Date.now()});viewer='';revealed=false;botStep=0;element<HTMLDetailsElement>('setup').open=false;element('table').hidden=false;render();
});
element('end').addEventListener('click',()=>{if(!state)return;state=reduce(state,{type:'vip',action:'end',now:Date.now()});render();});
