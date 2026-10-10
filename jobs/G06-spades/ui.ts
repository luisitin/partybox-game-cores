import {game,type State,type Input,type PublicView,type PhoneView} from './core.ts';
import {cardName,rank,suit} from './cards.ts';
import {createRng} from '../../contract/rng.ts';
import type {BotSkill} from '../../contract/constants.ts';
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const esc=(value:unknown)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
let state:State|null=null,publicView:PublicView|null=null,openOwner:string|null=null;
let skills:Record<string,'human'|BotSkill>={},rngs:Record<string,ReturnType<typeof createRng>>={};
let exchangeDraft:{key:string;cards:number[]}={key:'',cards:[]},bidDraft:{key:string;value:string}={key:'',value:'1'};
const names=['Player 1','Player 2','Player 3','Player 4'],seatSkills=['human','human','human','human'];
function setupSeats(){
 for(let i=0;i<4;i++){const name=$<HTMLInputElement>(`name-${i}`),skill=$<HTMLSelectElement>(`seat-${i}`);if(name)names[i]=name.value;if(skill)seatSkills[i]=skill.value;}
 const n=$<HTMLSelectElement>('mode').value==='cutthroat'?3:4;
 $('seats').innerHTML=Array.from({length:n},(_,i)=>`<div class="seat-setup"><label>Seat ${i+1}${n===4?` · team ${i%2===0?'A':'B'}`:''}<input id="name-${i}" maxlength="40" value="${esc(names[i])}" required></label><label>Who plays<select id="seat-${i}">${[['human','Person'],['easy','Easy bot'],['normal','Medium bot'],['sharp','Strong bot']].map(([value,label])=>`<option value="${value}" ${seatSkills[i]===value?'selected':''}>${label}</option>`).join('')}</select></label></div>`).join('');
 for(const id of ['setting-cutDeck','setting-cutLead'])$<HTMLSelectElement>(id).disabled=n===4;
 $<HTMLInputElement>('setting-exchange').disabled=n===3;
}
$('settings').innerHTML=game.manifest.settings!.filter(s=>s.key!=='mode').map(s=>s.type==='boolean'?`<label class="check"><input type="checkbox" id="setting-${s.key}" ${s.default?'checked':''}>${esc(s.label)}</label>`:s.type==='select'?`<label>${esc(s.label)}<select id="setting-${s.key}">${s.options.map(o=>`<option value="${esc(o.value)}" ${o.value===s.default?'selected':''}>${esc(o.label)}</option>`).join('')}</select></label>`:'').join('');
setupSeats();$('mode').addEventListener('change',setupSeats);
const nameOf=(v:PublicView,id:string)=>{
 const seat=v.players.findIndex(p=>p.id===id);if(seat<0)return id;
 const duplicate=v.players.some(p=>v.players.some(other=>other.id!==p.id&&other.name===p.name));
 return `${v.players[seat]!.name}${duplicate?` (seat ${seat+1})`:''}`;
};
const sideName=(v:PublicView,ids:string[])=>ids.length===2?`Team ${v.players.findIndex(p=>p.id===ids[0])%2===0?'A':'B'}`:nameOf(v,ids[0]!);
const bidName=(v:PublicView,id:string)=>v.bids[id]?.kind==='number'?String(v.bids[id]!.value):v.bids[id]?.kind==='blind'?'Blind nil':v.bids[id]?'Nil':'—';
function face(card:number){const r=rank(card)>10?['J','Q','K','A'][rank(card)-11]:rank(card),pip=['♣','♦','♥','♠'][suit(card)];return `<span class="card-face ${[1,2].includes(suit(card))?'red':''}" aria-hidden="true"><span class="corner">${r}${pip}</span><span class="pip">${pip}</span><span class="corner">${r}${pip}</span></span>`;}
function renderPublic(v:PublicView){
 const done=v.phaseId==='done',top=Math.max(...v.sides.map(s=>s.score));
 const title=v.paused?'Table paused':done?v.doneReason==='host'?'Match ended':`${v.sides.filter(s=>s.score===top).map(s=>sideName(v,s.ids)).join(' & ')} wins`:v.phaseId==='hand'?'Hand scored':v.phaseId==='trick'?`${nameOf(v,v.completed.at(-1)!.winner)} takes the trick`:v.phaseId==='exchange'?`Two-card exchange`:v.phaseId==='play'?`${nameOf(v,v.turn!)} to play`:`${nameOf(v,v.turn!)} to bid`;
 $('public').dataset.phase=v.phaseId;
 $('public').innerHTML=`<div class="row"><h2 class="live-title">${esc(title)}</h2><span id="clock"></span></div><p class="muted">Hand ${v.handNumber} · trick ${v.trickNumber} / ${v.tricksPerHand} · dealer ${esc(nameOf(v,v.dealer))}${v.broken?' · spades broken':''}</p><div class="scoreboard ${v.sides.length===2?'two-sides':''}">${v.sides.map(side=>`<div class="score ${done&&side.score===top?'winner':''}"><h3>${esc(sideName(v,side.ids))}</h3><strong>${side.score}</strong> <span class="muted">/ 500 · ${side.bags} / 10 bags</span>${side.ids.map(id=>`<div class="seat-line"><span class="${id===v.turn?'active-name':''}">${esc(nameOf(v,id))}${!v.players.find(p=>p.id===id)!.connected?' · away':''}</span><span>Bid ${esc(bidName(v,id))} · took ${v.won[id]??0}</span></div>`).join('')}</div>`).join('')}</div><div class="table"><span class="table-watermark" aria-hidden="true">♠</span>${v.trick.length?v.trick.map(p=>`<div class="trick-card">${face(p.card)}<p>${esc(nameOf(v,p.playerId))}<br>${esc(cardName(p.card))}</p></div>`).join(''):`<p class="muted">${v.phaseId==='exchange'?`${esc(nameOf(v,v.exchange!.from))} sends two cards to ${esc(nameOf(v,v.exchange!.to))}`:done?'Final scores above':v.phaseId==='hand'?'Next hand rotates the dealer':'Spades are always trump'}</p>`}</div>${v.phaseId==='hand'&&v.report?`<div class="receipt-grid">${v.sides.map((side,i)=>{const r=v.report!.sides[i]!;return `<article class="receipt"><h3>${esc(sideName(v,side.ids))}</h3><dl><dt>Normal bid / contract tricks</dt><dd>${r.bid} / ${r.contractTricks}</dd><dt>Contract points</dt><dd>${r.contract}</dd><dt>Nil / blind nil points</dt><dd>${r.nil}</dd><dt>New bags (+1 each)</dt><dd>${r.newBags}</dd><dt>Bag penalty</dt><dd>−${r.penalty}</dd><dt>Side total</dt><dd>${v.report!.before[i]} → ${r.score}</dd></dl></article>`;}).join('')}</div>`:''}${done?`<p class="notice">${v.doneReason==='host'?'The unfinished hand was left unscored.':v.doneReason==='mercy'?'A side reached −500, ending this match.':'The highest side reached 500.'} All seats keep their scores.</p>`:''}`;
 $('pause').textContent=v.paused?'Resume':'Pause';$<HTMLButtonElement>('pause').disabled=done;$<HTMLButtonElement>('skip').disabled=done||v.paused;$<HTMLButtonElement>('end').disabled=done;
 $('skip').textContent=['hand','trick'].includes(v.phaseId)?'Next':'Skip decision';
}
function privateKey(v:PhoneView){return `${v.me.id}:${state!.phase.startedAt}:${v.phaseId}`;}
function renderPrivate(v:PhoneView|null){
 const panel=$('private');
 if(!v){panel.innerHTML='<p class="muted">The shared table is ready.</p>';return;}
 const id=v.me.id,name=nameOf(v,id),bot=skills[id]!=='human';
 if(v.paused){panel.innerHTML='<p>Private hands are hidden while paused.</p>';return;}
 if(v.phaseId==='done'){panel.innerHTML='<p>Use New table to play again.</p>';return;}
 if(v.phaseId==='trick'||v.phaseId==='hand'){panel.innerHTML=`<p>${v.phaseId==='hand'?'Review the points, then deal the next hand.':'The trick winner leads next.'}</p><button id="next" class="primary">${v.phaseId==='hand'?'Next hand':'Next trick'}</button>`;$('next').onclick=()=>dispatch({type:'next'},v.players.find(p=>p.connected)!.id);return;}
 if(bot){panel.innerHTML=`<p>${esc(name)} is thinking. Private cards stay hidden.</p>`;return;}
 if(openOwner!==id){panel.innerHTML=`<div class="handover"><h2>Pass to ${esc(name)}</h2><p>Everyone else looks away.</p><button id="show-hand" class="primary">I’m ${esc(name)} — open private panel</button></div>`;$('show-hand').onclick=()=>{openOwner=id;renderPrivate(v);($<HTMLInputElement>('bid-value')??$<HTMLButtonElement>('look')??panel.querySelector<HTMLButtonElement>('[data-card]:not(:disabled)'))?.focus();};return;}
 const key=privateKey(v);if(exchangeDraft.key!==key)exchangeDraft={key,cards:[]};if(bidDraft.key!==key)bidDraft={key,value:'1'};
 const instructions=v.inputType==='blind'?'Choose before looking. Blind nil promises no tricks; a failure loses the double bonus.':v.inputType==='bid'?`Bid 1–${v.tricksPerHand} tricks, or nil to promise zero.`:v.inputType==='exchange'?`Choose two cards to send to ${nameOf(v,v.exchange!.to)}. Received cards may be sent back.`:v.forcedLead!==null?`Lead ${cardName(v.forcedLead)}.`:v.trick.length?`Follow ${['clubs','diamonds','hearts','spades'][suit(v.trick[0]!.card)]} if you can.`:v.broken?'Lead any card.':'Lead a non-spade, unless only spades remain.';
 panel.innerHTML=`<div class="row"><h2>${esc(name)} · private hand</h2><button id="hide-hand">Hide hand</button></div><p>${esc(instructions)}</p>${v.inputType==='blind'?'<p class="notice">Your cards are still hidden.</p><div class="row"><button id="look" class="primary">Look and bid</button><button id="blind">Declare blind nil</button></div>':`<div class="hand">${v.hand.map(card=>`<button id="card-${card}" data-card="${card}" aria-label="${cardName(card)}${v.inputType==='exchange'?exchangeDraft.cards.includes(card)?', selected':', select to exchange':v.legal.includes(card)?', legal play':', unavailable'}" ${v.inputType==='exchange'?`aria-pressed="${exchangeDraft.cards.includes(card)}"`:v.inputType!=='play'||!v.legal.includes(card)?'disabled':''}>${face(card)}</button>`).join('')}</div>${v.inputType==='bid'?`<div class="row"><label>Tricks<select id="bid-value" class="bid-value">${Array.from({length:v.tricksPerHand},(_,i)=>`<option ${bidDraft.value===String(i+1)?'selected':''}>${i+1}</option>`).join('')}</select></label><button id="bid" class="primary">Lock bid</button><button id="nil">Declare nil</button></div>`:v.inputType==='exchange'?`<p id="selected-count">${exchangeDraft.cards.length} / 2 selected</p><button id="send-cards" class="primary" ${exchangeDraft.cards.length===2?'':'disabled'}>Send two cards</button>`:''}`}`;
 $('hide-hand').onclick=()=>{openOwner=null;renderPrivate(v);$('show-hand')?.focus();};
 if(v.inputType==='blind'){$('look').onclick=()=>dispatch({type:'look'},id);$('blind').onclick=()=>dispatch({type:'blind-nil'},id);}
 if(v.inputType==='bid'){$<HTMLSelectElement>('bid-value').onchange=()=>{bidDraft.value=$<HTMLSelectElement>('bid-value').value;};$('bid').onclick=()=>dispatch({type:'bid',value:Number(bidDraft.value)},id);$('nil').onclick=()=>dispatch({type:'nil'},id);}
 for(const button of panel.querySelectorAll<HTMLButtonElement>('[data-card]'))button.onclick=()=>{const card=Number(button.dataset.card);if(v.inputType==='play')dispatch({type:'play',card},id);else if(v.inputType==='exchange'){exchangeDraft.cards=exchangeDraft.cards.includes(card)?exchangeDraft.cards.filter(c=>c!==card):exchangeDraft.cards.length<2?[...exchangeDraft.cards,card]:exchangeDraft.cards;renderPrivate(v);$(`card-${card}`).focus();}};
 if(v.inputType==='exchange')$('send-cards').onclick=()=>dispatch({type:'exchange',cards:[...exchangeDraft.cards]},id);
}
function render(){
 if(!state)return;const v=game.tvView(state);publicView=v;
 if(v.paused||openOwner!==v.turn)openOwner=null;
 renderPublic(v);const viewer=v.turn??v.players.find(p=>p.connected)?.id??v.players[0]!.id;renderPrivate(game.controllerView(state,viewer));updateClock();
}
function dispatch(input:Input,id:string){if(!state)return;const next=game.reduce(state,{type:'input',playerId:id,input,now:Date.now()});if(next!==state){state=next;render();}}
function host(action:'pause'|'resume'|'skip'|'end'){if(!state)return;state=game.reduce(state,{type:'vip',action,now:Date.now()});render();}
function updateClock(){const clock=$('clock');if(clock&&publicView)clock.textContent=publicView.deadline===null||publicView.paused||publicView.phaseId==='done'?'':`Next in ${Math.max(0,Math.ceil((publicView.deadline-Date.now())/1000))}s`;}
$('setup-form').addEventListener('submit',event=>{
 event.preventDefault();const mode=$<HTMLSelectElement>('mode').value,n=mode==='cutthroat'?3:4,seed=Number($<HTMLInputElement>('seed').value);
 if(!Number.isInteger(seed)||seed<0||seed>0xffffffff){$('setup-error').textContent='Use a whole-number seed from 0 to 4294967295.';return;}
 const settings:Record<string,string|number|boolean>={mode};for(const setting of game.manifest.settings!.filter(s=>s.key!=='mode')){const input=$<HTMLInputElement>(`setting-${setting.key}`);settings[setting.key]=setting.type==='boolean'?input.checked:input.value;}
 skills={};rngs={};const players=Array.from({length:n},(_,i)=>{const id=`p${i}`,skill=$<HTMLSelectElement>(`seat-${i}`).value as 'human'|BotSkill;skills[id]=skill;rngs[id]=createRng(seed^Math.imul(i+13,0x9e3779b1));return {id,name:$<HTMLInputElement>(`name-${i}`).value.trim()||`Player ${i+1}`,avatarId:'🙂',connected:true,bot:skill!=='human'};});
 state=game.init({players,seed,settings,now:Date.now()});openOwner=null;exchangeDraft={key:'',cards:[]};bidDraft={key:'',value:'1'};$('setup').hidden=true;$('match').hidden=false;
 const v=game.tvView(state);$('rules').innerHTML=`<p>Four seats form opposite partnerships; three seats compete individually. Follow the original suit led. Spades trump; the winner leads next. Unbroken spades can lead only if your hand is all spades.</p><p>Normal contracts score ±10 per bid trick. Overtricks score +1 and a bag; every ten bags cost100, carrying the remainder. Nil scores ±${v.nilValue}; blind nil ±${v.nilValue*2}, declared before looking.${v.settings.exchange&&mode==='partnership'?' Blind bidders exchange two cards in each direction, sequentially.':''}</p><p>Failed nil tricks ${v.settings.failedNilCounts?'contribute to the normal contract':'never rescue the normal contract, and add bags'}. First to500 with a unique high score wins${v.settings.mercy?'; reaching−500 also ends the match with a unique leader':''}. Leading ties continue. The host may end a long match; unfinished hands do not score.</p>`;render();
});
$('pause').onclick=()=>host(state?.phase.paused?'resume':'pause');$('skip').onclick=()=>host('skip');$('end').onclick=()=>host('end');$('restart').onclick=()=>{state=null;publicView=null;openOwner=null;exchangeDraft={key:'',cards:[]};bidDraft={key:'',value:'1'};$('public').innerHTML='';$('private').innerHTML='';$('rules').innerHTML='';$('match').hidden=true;$('setup').hidden=false;};
setInterval(()=>{
 if(!state||state.phase.id==='done'||state.phase.paused)return;const now=Date.now();
 if(state.phase.deadline!==null&&now>=state.phase.deadline){state=game.reduce(state,{type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt,now});render();return;}
 const id=publicView?.turn;if(id&&skills[id]&&skills[id]!=='human'){const input=game.bot.sampleInput(state,id,rngs[id]!,skills[id] as BotSkill);if(input)dispatch(input,id);}updateClock();
},150);
