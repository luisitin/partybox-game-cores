import {game,manifest} from './core';
import type {State,Input,PrivateView} from './core';
import {cardName,minimizeDeadwood,suit} from './cards';
import {createRng} from '../../../contract/rng';
const $=(id:string)=>document.getElementById(id)!;
let state:State|null=null,openFor:string|null=null,selected:number|null=null,now=0;
let viewedState:State|null=null,cachedPrivateView:PrivateView|null=null;
const rng=createRng(7199);
const controls=new Map<string,HTMLInputElement|HTMLSelectElement>();
function option(value:string,label=value):HTMLOptionElement {const el=document.createElement('option');el.value=value;el.textContent=label;return el;}
function button(label:string,action:()=>void,primary=false):HTMLButtonElement {const b=document.createElement('button');b.textContent=label;b.onclick=action;if(primary)b.className='primary';return b;}
const count=document.createElement('select');count.id='player-count';for(let i=2;i<=4;i++)count.append(option(String(i),`${i} players`));
const countLabel=document.createElement('label');countLabel.textContent='Players';countLabel.append(count);$('setup-grid').append(countLabel);
for(const spec of manifest.settings) {
  if(spec.key==='mode')continue;
  const label=document.createElement('label');label.textContent=spec.label;
  const control=spec.type==='boolean'?document.createElement('input'):spec.type==='number'?document.createElement('input'):document.createElement('select');
  control.id='setting-'+spec.key;
  if(control instanceof HTMLSelectElement&&spec.type==='select'){for(const o of spec.options)control.append(option(o.value,o.label));control.value=spec.default;}
  if(control instanceof HTMLInputElement){control.type=spec.type==='boolean'?'checkbox':'number';if(spec.type==='boolean')control.checked=spec.default;else if(spec.type==='number'){control.value=String(spec.default);control.min=String(spec.min);control.max=String(spec.max);control.step=String(spec.step??1);}}
  label.append(control);$('setup-grid').append(label);controls.set(spec.key,control);
}
function names():void {
  $('names').replaceChildren();
  for(let i=0;i<Number(count.value);i++) {
    const label=document.createElement('label');label.textContent=`Seat ${i+1}`;
    const input=document.createElement('input');input.id='name-'+i;input.value=`Player ${i+1}`;input.maxLength=24;
    const type=document.createElement('select');type.id='seat-'+i;for(const x of ['Human','Easy bot','Medium bot','Strong bot'])type.append(option(x));
    label.append(input,type);$('names').append(label);
  }
}count.onchange=names;names();
function skill(id:string):'easy'|'normal'|'sharp' {const kind=(document.getElementById('seat-'+id.slice(1)) as HTMLSelectElement)?.value;return kind==='Strong bot'?'sharp':kind==='Easy bot'?'easy':'normal';}
function start():void {
  const settings:Record<string,string|number|boolean>={mode:Number(count.value)===2?'duel':'rotation'};
  for(const [key,control]of controls)settings[key]=control instanceof HTMLInputElement?control.type==='checkbox'?control.checked:Number(control.value):control.value;
  state=game.init({players:Array.from({length:Number(count.value)},(_,i)=>({id:'p'+i,name:(document.getElementById('name-'+i) as HTMLInputElement).value||`Player ${i+1}`,avatarId:'face-'+i,connected:true,bot:(document.getElementById('seat-'+i) as HTMLSelectElement).value!=='Human'})),settings,seed:rng.int(0,0xffffffff),now:++now});
  openFor=null;selected=null;$('setup').hidden=true;$('table').hidden=false;render();
}
function send(input:Input):void {
  if(!state)return;
  const before=state;
  const actor=state.phase.id==='round-end'?state.order.find(id=>state!.players[id].connected&&!state!.left.includes(id))??state.turn:state.turn;
  state=game.reduce(state,{type:'input',playerId:actor,input,now:++now});
  if(state===before){$('notice').textContent='That move is not legal. Your hand is unchanged.';return;}
  if(state.turn!==before.turn||state.hand!==before.hand||state.phase.id==='done'){openFor=null;selected=null;}
  render();
}
function card(c:number,choose=false):HTMLElement {
  const b=choose?button(cardName(c),()=>selectCard(c)):document.createElement('div');
  b.textContent=cardName(c);b.className='card'+([1,2].includes(suit(c))?' red':'')+(c===selected?' selected':'');
  b.setAttribute('aria-label',cardName(c)+(choose?`, card number ${c}`:''));
  if(choose)b.setAttribute('aria-pressed',String(c===selected));
  if(choose)b.dataset.card=String(c);
  return b;
}
function selectCard(c:number):void {
  selected=c;
  for(const card of document.querySelectorAll<HTMLElement>('#hand .card')){
    const chosen=Number(card.dataset.card)===c;card.classList.toggle('selected',chosen);card.setAttribute('aria-pressed',String(chosen));
  }
  const v=cachedPrivateView;if(!v)return;
  $('deadwood').textContent=`Minimum deadwood: ${v.deadwood}. Selected: ${cardName(c)} (card number ${c}).`;
  const discard=document.getElementById('discard-selected') as HTMLButtonElement|null;
  if(discard)discard.disabled=c===v.forbiddenDiscard;
  const knock=document.getElementById('knock-selected') as HTMLButtonElement|null;
  if(knock)knock.disabled=!v.legal.some(x=>x.type==='discard'&&x.card===c&&x.knock);
}
function displayLayout(cards:number[]):HTMLElement {
  const d=document.createElement('div');d.className='layout';const sol=minimizeDeadwood(cards);
  for(const group of [...sol.melds,...(sol.loose.length?[sol.loose]:[])]){const el=document.createElement('div');el.className='meld';el.textContent=group.map(cardName).join(' · ');d.append(el);}return d;
}
function render():void {
  if(!state)return;
  if(viewedState!==state){viewedState=state;cachedPrivateView=game.controllerView(state,state.turn);}
  const v:PrivateView=cachedPrivateView!,publicView=v;
  $('notice').textContent='';
  $('scores').replaceChildren(...v.players.map(p=>{const d=document.createElement('div');d.className='score'+(p.id===v.turn?' current':'');d.textContent=`${p.name} · ${p.score} points${state!.left.includes(p.id)?' · left; auto-playing':!p.connected?' · disconnected; auto-playing':v.waiting.includes(p.id)?' · waiting':''}`;return d;}));
  $('meta').textContent=`Hand ${v.hand} · Target ${v.target} · Knock at ${v.knockLimit} or less${v.multiplier===2?' · DOUBLE HAND':''}`;
  const name=state.players[state.turn].name;
  $('status').textContent=state.finished?game.results(state)!.winnerIds.map(id=>state!.players[id].name).join(' & ')+' wins':v.paused?'Paused':v.phaseId==='round-end'?'Hand complete':`${name} · ${v.phaseId==='upcard'?'accept the upcard or pass':v.phaseId==='draw'?'draw one card':v.phaseId==='discard'?'discard or knock':'resolve your best layoffs'}`;
  $('piles').replaceChildren();const stock=document.createElement('div');stock.textContent=`Stock · ${v.stockCount} cards`;$('piles').append(stock);if(v.discard.length)$('piles').append(card(v.discard.at(-1)!));
  const reveal=['layoff','round-end','done'].includes(v.phaseId),bot=!!state.players[state.turn].bot;
  $('handoff').hidden=reveal||bot||openFor===state.turn||v.paused;
  $('private').hidden=reveal||bot||openFor!==state.turn||v.paused;
  $('handoff').replaceChildren();
  if(!$('handoff').hidden){const h=document.createElement('h2');h.textContent=`Pass to ${name}`;const p=document.createElement('p');p.textContent='Other players: look away before the hand opens.';$('handoff').append(h,p,button('Show my hand',()=>{openFor=state!.turn;render();},true));}
  $('hand').replaceChildren(...(!$('private').hidden?v.handCards.slice().sort((a,b)=>a-b).map(c=>card(c,true)):[]));
  $('deadwood').textContent=v.deadwood===null?'':`Minimum deadwood: ${v.deadwood}. Select a card to discard.${selected!==null?' Selected card number: '+selected+'.':''}`;
  $('actions').replaceChildren();
  if(!$('private').hidden) {
    for(const input of v.legal) {
      if(input.type==='discard')continue;
      $('actions').append(button(input.type==='draw'?`Draw ${input.source}`:'Pass upcard',()=>send(input)));
    }
    if(v.phaseId==='discard') {
      const discard=button('Discard selected',()=>{if(selected!==null)send({type:'discard',card:selected});});discard.disabled=selected===null||selected===v.forbiddenDiscard;
      discard.id='discard-selected';
      const knock=button('Knock / Gin',()=>{if(selected===null)return;let melds:number[][]|undefined;
        const text=(document.getElementById('melds') as HTMLInputElement).value.trim();
        if(text)melds=text.split(';').map(g=>g.split(',').map(x=>Number(x.trim())));
        send({type:'discard',card:selected,knock:true,...(melds?{melds}:{})});},true);
      knock.disabled=selected===null||!v.legal.some(x=>x.type==='discard'&&x.card===selected&&x.knock);
      knock.id='knock-selected';
      $('actions').append(discard,knock);
      if(v.canBigGin)$('actions').append(button('Big Gin',()=>send({type:'bigGin'}),true));
      $('actions').append(button('Cover my hand',()=>{openFor=null;render();}));
    }
  }
  $('meld-choice').hidden=$('private').hidden||v.phaseId!=='discard';
  $('reveal').replaceChildren();
  if(reveal&&publicView.roundResult) {
    const r=publicView.roundResult;const heading=document.createElement('h2');heading.textContent=r.winner?`${state.players[r.winner].name}: ${r.kind} +${r.points}`:v.phaseId==='layoff'?'Both hands are now public':'Drawn hand';$('reveal').append(heading);
    for(const [id,cards]of Object.entries(r.hands)){const p=document.createElement('p');p.textContent=state.players[id].name;$('reveal').append(p,displayLayout(cards));}
    if(r.defenderLayout){const p=document.createElement('p');p.textContent=`Defender's remaining deadwood: ${r.defenderLayout.deadwood}. Laid off: ${r.defenderLayout.laid.map(x=>cardName(x.card)).join(', ')||'none'}.`;$('reveal').append(p);}
  }
  if(v.phaseId==='layoff')$('reveal').append(button('Use optimal melds and layoffs',()=>send({type:'finishLayoff'}),true));
  if(v.phaseId==='round-end')$('reveal').append(button('Next hand',()=>send({type:'next'}),true));
  $('bot-step').hidden=!bot||state.finished||v.paused;
  $('leave-seat').hidden=bot||state.finished||v.paused||reveal;
  $('pause').textContent=v.paused?'Resume':'Pause';$('pause').hidden=state.finished;$('end').hidden=state.finished;
  $('log').replaceChildren(...v.log.map(x=>{const p=document.createElement('p');p.textContent=`${state!.players[x.player].name}: ${x.action}${x.card===null?'':' '+cardName(x.card)}`;return p;}));
}
$('start').onclick=start;$('new-match').onclick=()=>{$('setup').hidden=false;$('table').hidden=true;state=null;};
$('bot-step').onclick=()=>{if(state){const input=game.bot.sampleInput(state,state.turn,rng,skill(state.turn));if(input)send(input);}};
$('pause').onclick=()=>{if(state){state=game.reduce(state,{type:'vip',action:state.phase.paused?'resume':'pause',now:++now});openFor=null;render();}};
$('end').onclick=()=>{if(state){state=game.reduce(state,{type:'vip',action:'end',now:++now});openFor=null;render();}};
$('leave-seat').onclick=()=>{if(state){state=game.reduce(state,{type:'player',playerId:state.turn,connected:false,gone:'left',now:++now});openFor=null;selected=null;render();}};
// The host page alone owns real time. The core receives explicit monotonic event timestamps.
setInterval(()=>{if(!state||state.finished||state.phase.paused)return;now+=1000;
  if(state.phase.deadline!==null&&now>=state.phase.deadline){state=game.reduce(state,{type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt,now});openFor=null;selected=null;render();}
},1000);
