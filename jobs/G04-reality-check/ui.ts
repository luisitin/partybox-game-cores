import {game,type State,type Input,type PhoneView,type QuestionView} from './core.ts';
import {createRng,type Rng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
type SeatKind='human'|BotSkill;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const h=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const names=new Map<string,string>();
let state:State|null=null;
let kinds:Record<string,SeatKind>={},rngs:Record<string,Rng>={};
let phaseTimer:ReturnType<typeof setTimeout>|null=null,botTimer:ReturnType<typeof setTimeout>|null=null;
let viewer:string|null=null,open=false,visited:string[]=[],privateStamp='',wheelStamp='';
const drafts=new Map<string,{fake?:string;answer?:string}>();
const draftKey=()=>state&&viewer?`${phaseKey(state)}:${viewer}`:null;
function rememberDraft(){
 const key=draftKey();if(!open||!key)return;
 const fake=$<HTMLTextAreaElement>('fake'),answer=$<HTMLInputElement>('answer');
 if(fake)drafts.set(key,{fake:fake.value});else if(answer)drafts.set(key,{answer:answer.value});
}
const value=<T extends HTMLInputElement|HTMLSelectElement>(id:string)=>$(id) as T;
function seatFields(){
 const old=Array.from(document.querySelectorAll<HTMLSelectElement>('#seats select')).map(e=>e.value);
 const oldNames=Array.from(document.querySelectorAll<HTMLInputElement>('#seats input')).map(e=>e.value);
 $('seats').innerHTML=Array.from({length:Number(value('players').value)},(_,i)=>`<div class="seat"><label for="name-${i}">Player ${i+1}</label><input id="name-${i}" maxlength="24" value="${h(oldNames[i]??`Player ${i+1}`)}"><label for="seat-${i}">Controller</label><select id="seat-${i}"><option value="human">Person</option><option value="easy">Easy bot</option><option value="normal">Medium bot</option><option value="sharp">Strong bot</option></select></div>`).join('');
 old.forEach((kind,i)=>{const element=$<HTMLSelectElement>(`seat-${i}`);if(element)element.value=kind;});
}
function clearTimers(){if(phaseTimer!==null)clearTimeout(phaseTimer);if(botTimer!==null)clearTimeout(botTimer);phaseTimer=botTimer=null;}
const phaseKey=(s:State)=>`${s.phase.id}:${s.phase.startedAt}`;
function humans(){return state?.seats.filter(id=>kinds[id]==='human')??[];}
function nextViewer(){viewer=humans().find(id=>!visited.includes(id))??null;open=false;privateStamp='';}
function dispatch(event:Parameters<typeof game.reduce>[1]){
 if(!state)return;rememberDraft();const old=state,next=game.reduce(state,event);if(next===old)return;
 const changed=phaseKey(old)!==phaseKey(next);state=next;
 if(changed){drafts.clear();visited=[];nextViewer();}
 if(state.phase.paused){open=false;privateStamp='';}
 render();schedule();if(changed)$('match').scrollIntoView({block:'start'});
}
function schedule(){
 clearTimers();if(!state||state.phase.paused||state.phase.id==='done')return;
 const token=phaseKey(state),{id,startedAt,deadline}=state.phase;
 if(deadline!==null)phaseTimer=setTimeout(()=>dispatch({type:'timer',phaseId:id,startedAt,now:Date.now()}),Math.max(0,deadline-Date.now()));
 const actor=state.phase.id==='reveal'?null:state.seats.find(playerId=>kinds[playerId]!=='human'&&game.controllerView(state!,playerId).inputType);
 if(actor)botTimer=setTimeout(()=>{
  if(!state||phaseKey(state)!==token||state.phase.paused)return;
  const input=game.bot.sampleInput(state,actor,rngs[actor]!,kinds[actor] as BotSkill);
  if(input)dispatch({type:'input',playerId:actor,input,now:Date.now()});
 },350);
}
function dateLabel(q:QuestionView,n:number):string{return q.kind==='decade'?`${n}s`:`Century ${Math.abs(n)} ${n<0?'BCE':'CE'}`;}
function displayAnswer(q:{kind:string;left?:string;right?:string},correct:string|number){return q.kind==='choice'?(Number(correct)===0?q.left:q.right)??String(correct):q.kind==='century'?`Century ${Math.abs(Number(correct))} ${Number(correct)<0?'BCE':'CE'}`:q.kind==='decade'?`${correct}s`:String(correct);}
function wheel(v:ReturnType<typeof game.tvView>){
 const stamp=`${phaseKey(state!)}:${v.realm}`;
 const previous=$('wheel-panel').querySelector<SVGElement>('svg');
 if(previous)previous.style.animationPlayState=v.paused?'paused':'running';
 if(stamp===wheelStamp)return;wheelStamp=stamp;
 const landing=1080-(v.realms.findIndex(r=>r.id===v.realm)+.5)*45;
 const wedges=v.realms.map((r,i)=>{
  const a=i*Math.PI/4-Math.PI/2,b=a+Math.PI/4,x=100+94*Math.cos(a),y=100+94*Math.sin(a),xx=100+94*Math.cos(b),yy=100+94*Math.sin(b),mid=(a+b)/2;
  return `<path d="M100 100 L${x} ${y} A94 94 0 0 1 ${xx} ${yy} Z" fill="${r.id===v.realm&&v.phaseId!=='wheel'?'#80e0d0':i%2?'#40617b':'#29485e'}" stroke="#101c29" stroke-width="2"/><text x="${100+68*Math.cos(mid)}" y="${106+68*Math.sin(mid)}" text-anchor="middle" fill="#fff" font-size="16">${i+1}</text>`;
 }).join('');
 $('wheel-panel').innerHTML=`<p class="kicker">Realm wheel</p><div class="wheel ${v.phaseId==='wheel'?'spin':''}" style="--landing:${landing}deg" aria-label="${v.phaseId==='wheel'?'Spinning realm wheel':'Selected realm'}"><svg viewBox="0 0 200 200" style="animation-play-state:${v.paused?'paused':'running'}" aria-hidden="true">${wedges}</svg><span class="hub">✦</span></div><ol class="realm-list">${v.realms.map((r,i)=>`<li class="${r.id===v.realm&&v.phaseId!=='wheel'?'chosen':''}">${i+1}. ${h(r.name)}</li>`).join('')}</ol>`;
}
function renderPublic(v:ReturnType<typeof game.tvView>){
 let content='';
 if(v.phaseId==='wheel')content='<h2>Where will the wheel land?</h2><p class="hint">A new realm teaches its rules before anyone scores.</p>';
 if(v.demo){const q=v.demo.question;content=`<p class="kicker">Unscored demo · ${h(q.name)}</p><h2 class="question">${h(q.prompt)}</h2><p class="hint">${h(q.hint)}</p><div class="demo-answer">Example answer: <strong>${h(displayAnswer(q,v.demo.correct))}</strong></div><p class="hint">Your scored question will be different. Watch the 10-second demo.</p>`;}
 if(v.question&&['answer','write','vote'].includes(v.phaseId)){const q=v.question;content=`<p class="kicker">${h(q.name)} · ${v.phaseId==='answer'?'Make your estimate':v.phaseId==='write'?'Write a believable bluff':'Find the truth'}</p><h2 class="question">${h(q.prompt)}</h2><p class="hint">${h(q.hint)}</p><p class="hint">${v.phaseId==='vote'?'Answers are anonymous. Use your private controller to vote.':`${v.received} of ${v.players.length} answers locked in.`}</p>`;}
 if(v.phaseId==='reveal'&&v.last){const last=v.last,q=v.question!;content=`<p class="kicker">Round ${last.round} revealed${last.multiplier===2?' · Double points':''}</p><h2 class="question">${h(last.prompt)}</h2><div class="truth">The truth: <strong id="truth">${h(displayAnswer(q,last.correct))}</strong></div><div class="reveal-grid">${v.players.map(p=>`<div class="receipt"><strong>${h(p.name)} +${last.awards[p.id]}</strong><br>${last.kind==='bluff'?'Wrote': 'Guessed'}: ${h(last.answers[p.id]??'No answer')}${last.kind==='bluff'?`<br>Vote: ${h(last.options.find(o=>o.id===last.votes[p.id])?.text??'No vote')}`:''}</div>`).join('')}</div>${last.kind==='bluff'?`<ul class="reveal-options">${last.options.map(o=>`<li>${h(o.text)} — ${o.correct?'truth':h(o.owners.map(id=>names.get(id)).join(', '))}</li>`).join('')}</ul>`:''}<p class="hint">${h(last.fact)}</p><button id="next">${v.round===v.rounds?'Show final results':'Next round'}</button>`;}
 if(v.phaseId==='done'){const result=game.results(state!)!;const winners=result.winnerIds.map(id=>names.get(id)).join(' & ');content=`<p class="kicker">Final results</p><h2>${h(winners)} ${result.winnerIds.length===1?'wins':'share the win'}!</h2><p class="hint">Same settings and replay seed reproduce the same question order.</p><div class="reveal-grid">${[...result.ranking].sort((a,b)=>a.rank-b.rank).map(p=>`<div class="receipt">#${p.rank} ${h(names.get(p.playerId))}<br><strong>${p.score} points</strong></div>`).join('')}</div>`;}
 $('public').dataset.phase=v.phaseId;
 $('public').innerHTML=`<div class="meta"><span>Round ${v.round} / ${v.rounds}${v.round===v.rounds?' · ×2':''}</span><span id="countdown" class="clock"></span></div>${v.paused?'<p class="tag">Game paused</p>':''}${content}<div class="scoreboard">${v.players.map(p=>`<div class="score"><small>${h(p.name)}</small><strong>${p.score??0}</strong></div>`).join('')}</div>`;
 const next=$('next');if(next)next.onclick=()=>dispatch({type:'input',playerId:state!.seats[0]!,input:{type:'next'},now:Date.now()});
}
function pass(){if(viewer&&!visited.includes(viewer))visited.push(viewer);nextViewer();renderPrivate();}
function submit(input:Input){
 if(!state||!viewer)return;const previous=state,id=viewer,key=draftKey();rememberDraft();
 // Conceal the submitted input before any public update or handover.
 open=false;privateStamp='';dispatch({type:'input',playerId:id,input,now:Date.now()});
 if(state===previous){open=true;privateStamp='';renderPrivate();$('input-error').textContent='Check the allowed range and answer format.';return;}
 if(key)drafts.delete(key);
 if(phaseKey(previous)===phaseKey(state!)){visited.push(id);nextViewer();renderPrivate();}
}
function renderPrivate(){
 const area=$('private');if(!state)return;
 const phase=state.phase.id;
 area.dataset.open=String(open&&!!viewer&&['answer','write','vote'].includes(phase)&&!state.phase.paused);
 if(!['answer','write','vote'].includes(phase)||state.phase.paused){area.hidden=true;area.replaceChildren();privateStamp='';return;}
 area.hidden=false;
 if(!viewer){area.innerHTML=`<h3>Controllers concealed</h3><p class="hidden-note">${humans().length?'Your answers are locked. Waiting for the other players or the deadline.':'The bots are taking their turns.'}</p>`;privateStamp='';return;}
 const v=game.controllerView(state,viewer),stamp=`${phaseKey(state)}:${viewer}:${open}:${v.inputType}:${v.foundTruth}`;
 if(stamp===privateStamp)return;privateStamp=stamp;
 if(!open){area.innerHTML=`<h3>Pass the screen to ${h(names.get(viewer))}</h3><p class="hidden-note">Keep other players looking away. Only ${h(names.get(viewer))} should open this controller.</p><button id="reveal-private">Reveal my controller</button>`;$('reveal-private').onclick=()=>{open=true;privateStamp='';renderPrivate();};return;}
 let form='';const q=v.question!,draft=drafts.get(draftKey()!);
 if(v.inputType==='write')form=`<form id="input-form"><label for="fake">Your fake answer · up to 160 characters</label><textarea id="fake" maxlength="160" required autocomplete="off" spellcheck="false">${h(draft?.fake??'')}</textarea><div class="actions"><button type="submit">Lock in bluff</button></div></form>`;
 if(v.inputType==='vote')form=`<p class="hint">Choose the real answer. Your own bluff is marked and cannot be chosen.</p><div class="option-grid">${v.menu.map(o=>`<button data-choice="${o.id}" ${o.mine?'disabled':''}>${h(o.text)}${o.mine?' · Your bluff':''}</button>`).join('')}</div>`;
 if(v.inputType==='answer'){
  if(q.kind==='choice')form=`<div class="option-grid"><button data-value="0">${h(q.left)}</button><button data-value="1">${h(q.right)}</button></div>`;
  else {const min=q.min!,max=q.max!,initial=q.kind==='century'?1:q.kind==='decade'?Math.floor((min+max)/20)*10:Math.round(Math.sqrt(min*max));
   const raw=draft?.answer??String(initial),n=Number(raw),zero=q.kind==='century'&&n===0;
   form=`<form id="input-form"><label for="answer">${q.kind==='number'?`Estimate between ${min} and ${max}`:q.kind==='century'?'Century slider · negative values are BCE':'Decade dial · labelled by its starting year'}</label><input id="answer" type="${q.kind==='number'?'number':'range'}" min="${min}" max="${max}" step="${q.kind==='decade'?10:q.kind==='century'?1:'any'}" value="${h(raw)}" required><output id="answer-readout" for="answer" class="answer-readout">${h(q.kind==='number'?raw:zero?'No century zero':dateLabel(q,n))}</output><div class="actions"><button id="lock-answer" type="submit" ${zero?'disabled':''}>Lock in estimate</button></div></form>`;
  }
 }
 if(!v.inputType)form=`<p class="hidden-note">${v.foundTruth?'You wrote the truth! You earn its points at the reveal, and do not vote.':`Your answer is locked${v.mine!==null?`: ${h(v.mine)}`:'.'}`}</p><button id="acknowledge">Hide and pass</button>`;
 area.innerHTML=`<div class="meta"><h3>${h(names.get(viewer))}</h3><span id="controller-countdown" class="clock"></span></div><p class="hint private-question">${h(q.prompt)}</p><p class="hint">${h(q.hint)}</p>${form}<p id="input-error" class="error" role="alert"></p><button id="hide-private" class="secondary">Hide controller</button>`;
 $('hide-private').onclick=()=>{rememberDraft();open=false;privateStamp='';renderPrivate();};
 const ack=$('acknowledge');if(ack)ack.onclick=pass;
 area.querySelectorAll<HTMLButtonElement>('[data-choice]').forEach(b=>b.onclick=()=>submit({type:'vote',choice:b.dataset.choice!}));
 area.querySelectorAll<HTMLButtonElement>('[data-value]').forEach(b=>b.onclick=()=>submit({type:'answer',value:Number(b.dataset.value)}));
 const formElement=$<HTMLFormElement>('input-form');if(formElement)formElement.onsubmit=event=>{event.preventDefault();const fake=$<HTMLTextAreaElement>('fake');submit(fake?{type:'write',text:fake.value}:{type:'answer',value:Number(value('answer').value)});};
 const answer=$<HTMLInputElement>('answer');if(answer)answer.oninput=()=>{
  const n=Number(answer.value);$('answer-readout').textContent=q.kind==='number'?String(n):n===0&&q.kind==='century'?'No century zero':dateLabel(q,n);
  $<HTMLButtonElement>('lock-answer').disabled=q.kind==='century'&&n===0;
 };
 area.querySelector<HTMLElement>('textarea,input,[data-value],[data-choice]:not(:disabled),#acknowledge')?.focus();countdown();
}
function countdown(){if(!state)return;const at=state.phase.paused?.at??Date.now(),label=state.phase.id==='done'?'Finished':state.phase.paused?'Paused':`${Math.max(0,Math.ceil((state.phase.deadline!-at)/1000))} s`;for(const id of ['countdown','controller-countdown'])if($(id))$(id).textContent=label;}
function render(){if(!state)return;const v=game.tvView(state);renderPublic(v);wheel(v);renderPrivate();countdown();$('pause').textContent=v.paused?'Resume':'Pause';$<HTMLButtonElement>('pause').disabled=$<HTMLButtonElement>('end').disabled=v.phaseId==='done';$<HTMLButtonElement>('skip').disabled=v.paused||v.phaseId==='done';}
$('start').onclick=()=>{
 const seed=Number(value('seed').value);if(!Number.isInteger(seed)||seed<0||seed>4294967295){$('setup-error').textContent='Use a whole replay seed from 0 to 4294967295.';return;}
 const players=Array.from({length:Number(value('players').value)},(_,i)=>{
  const id=`p${i}`,kind=value<HTMLSelectElement>(`seat-${i}`).value as SeatKind,name=value<HTMLInputElement>(`name-${i}`).value.trim()||`Player ${i+1}`;
  kinds[id]=kind;names.set(id,name);rngs[id]=createRng(seed^(i+113));return {id,name,avatarId:'🙂',connected:true,bot:kind!=='human'};
 });
 state=game.init({players,seed,now:Date.now(),settings:{mode:value('mode').value,rounds:value('rounds').value}});drafts.clear();visited=[];nextViewer();$('setup').hidden=true;$('match').hidden=false;render();schedule();
};
$('players').onchange=seatFields;
$('pause').onclick=()=>dispatch({type:'vip',action:state?.phase.paused?'resume':'pause',now:Date.now()});
$('skip').onclick=()=>dispatch({type:'vip',action:'skip',now:Date.now()});
$('end').onclick=()=>dispatch({type:'vip',action:'end',now:Date.now()});
$('restart').onclick=()=>{clearTimers();drafts.clear();state=null;open=false;viewer=null;visited=[];privateStamp='';kinds={};rngs={};$('private').replaceChildren();$('match').hidden=true;$('setup').hidden=false;};
seatFields();setInterval(countdown,100);
