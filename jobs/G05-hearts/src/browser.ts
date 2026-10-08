import {game} from './core.js';
import {createRng} from '../../../contract/rng.js';
import {cardName,rank,suit} from './rules.js';
import type {HeartsState,Input} from './types.js';
import type {BotSkill} from '../../../contract/constants.js';
type Mode='human'|BotSkill;
const $=<T extends Element=HTMLElement>(sel:string):T=>{const v=document.querySelector<T>(sel);if(!v)throw new Error(`Missing ${sel}`);return v;};
const escape=(s:string):string=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const seatPrefs:Array<{name:string;mode:Mode}>=Array.from({length:6},(_,i)=>({name:i===0?'You':`Player ${i+1}`,mode:i===0?'human':'normal'}));
let state:HeartsState|null=null;
let revealed:string|null=null;let selected=new Set<number>();let lastBotAt=0;let fast=false;let revision=0;
const now=():number=>Math.max(Date.now(),state?.phase.startedAt??0);
function setupSeats():void{
 const n=Number($<HTMLSelectElement>('#seat-count').value);
 $('#seats').innerHTML=seatPrefs.slice(0,n).map((p,i)=>`<div class="seat-row"><span class="seat-index">${i+1}</span><label><span class="sr">Player ${i+1} name</span><input id="name-${i}" data-name="${i}" maxlength="24" value="${escape(p.name)}" required autocomplete="off"></label><label><span class="sr">Player ${i+1} type</span><select id="mode-${i}" data-mode="${i}">${(['human','easy','normal','sharp'] as const).map(m=>`<option value="${m}"${p.mode===m?' selected':''}>${m==='human'?'Human':m==='normal'?'Medium bot':m==='sharp'?'Strong bot':'Easy bot'}</option>`).join('')}</select></label></div>`).join('');
}
$('#seat-count').addEventListener('change',setupSeats);
$('#seats').addEventListener('input',e=>{const t=e.target as HTMLInputElement;if(t.dataset.name!==undefined)seatPrefs[Number(t.dataset.name)]!.name=t.value;});
$('#seats').addEventListener('change',e=>{const t=e.target as HTMLSelectElement;if(t.dataset.mode!==undefined)seatPrefs[Number(t.dataset.mode)]!.mode=t.value as Mode;});
function concealIfNeeded():void{
 if(!state)return;const s=state;const privatePhase=s.phase.id==='pass'||s.phase.id==='play';
 if(privatePhase&&!s.players[s.actor]!.bot&&revealed!==s.actor&&!s.phase.paused)state=game.reduce(s,{type:'vip',action:'pause',now:now()});
}
function dispatch(event:Parameters<typeof game.reduce>[1],draw=true):void{
 if(!state)return;const old=state;const next=game.reduce(old,event);if(next===old)return;
 state=next;revision++;
 if(next.actor!==old.actor||next.phase.id!==old.phase.id||next.handNumber!==old.handNumber||next.phase.id==='done') {revealed=null;selected=new Set();}
 if(event.type==='vip'&&event.action==='pause'){revealed=null;selected=new Set();}
 concealIfNeeded();if(draw)render();
}
const input=(value:Input):void=>{if(!state)return;dispatch({type:'input',playerId:state.actor,input:value,now:now()});};
function startTable(e:Event):void{
 e.preventDefault();const n=Number($<HTMLSelectElement>('#seat-count').value);const prefs=seatPrefs.slice(0,n);
 const roster=prefs.map((p,i)=>({id:`p${i}`,name:p.name.trim()||`Player ${i+1}`,avatarId:'face-1',connected:true,bot:p.mode!=='human'}));
 state=game.init({players:roster,seed:Number($<HTMLInputElement>('#seed').value)>>>0,now:Date.now(),settings:{target:Number($<HTMLSelectElement>('#target').value),moon:$<HTMLSelectElement>('#moon').value,jack:$<HTMLInputElement>('#jack').checked,noPass:$<HTMLInputElement>('#no-pass').checked,queenBreaks:$<HTMLInputElement>('#queen-breaks').checked,threeDeck:$<HTMLSelectElement>('#three-deck').value,turnSeconds:Number($<HTMLSelectElement>('#clock-setting').value)}});
 revealed=null;selected=new Set();fast=false;revision=0;lastBotAt=performance.now();$('#setup').hidden=true;$('#table').hidden=false;concealIfNeeded();render();focusPrimary();
}
$('#setup-form').addEventListener('submit',startTable);
function cardMarkup(card:number,extra=''):string{
 const color=suit(card)===1||suit(card)===3?'red':'black';
 return `<span class="card-face ${color}" ${extra}><span class="card-rank">${'23456789TJQKA'[rank(card)]}</span><span class="card-suit" aria-hidden="true">${['♣','♦','♠','♥'][suit(card)]}</span></span>`;
}
function spokenCard(card:number):string{return `${['2','3','4','5','6','7','8','9','10','Jack','Queen','King','Ace'][rank(card)]} of ${['clubs','diamonds','spades','hearts'][suit(card)]}`;}
function focusPrimary():void{const focus=document.querySelector<HTMLElement>('#start-turn, #continue, #pass-confirm:not([disabled]), .hand-card:not([disabled])');focus?.focus({preventScroll:true});}
function refreshSelection():void{
 for(const button of document.querySelectorAll<HTMLButtonElement>('.hand-card')){
  const on=selected.has(Number(button.dataset.card));button.classList.toggle('selected',on);button.setAttribute('aria-pressed',String(on));button.disabled=selected.size===3&&!on;
  const mark=button.querySelector('.picked');
  if(on&&!mark){const pick=document.createElement('span');pick.className='picked';pick.setAttribute('aria-hidden','true');pick.textContent='✓';button.append(pick);}else if(!on)mark?.remove();
 }
 const confirm=$<HTMLButtonElement>('#pass-confirm');confirm.disabled=selected.size!==3;confirm.textContent=`Pass ${selected.size} / 3 selected`;
}
function render():void{
 if(!state)return;const s=state,v=game.tvView(s);const phase=v.phaseId;const name=(id:string)=>escape(s.players[id]!.name);
 const oldFocus=document.activeElement instanceof HTMLElement?document.activeElement.dataset.card:undefined;
 const privatePhase=phase==='pass'||phase==='play';const human=privatePhase&&!s.players[s.actor]!.bot;
 const cv=human&&revealed===s.actor&&!s.phase.paused?game.controllerView(s,s.actor):null;
 const direction=v.passOffset===0?'Hold':v.passOffset===1?'Left':v.passOffset===-1?'Right':Math.abs(v.passOffset)===s.order.length/2?'Opposite':v.passOffset===2?'Second left':'Second right';
 const phaseLabel=phase==='pass'?`Pass three · ${direction}`:phase==='play'?`Trick ${v.trickNumber+1}`:phase==='trick'?`Trick won by ${name(v.lastWinner!)}`:phase==='hand'?'Hand scored':'Final scores';
 const heading=phase==='pass'?'A little strategy before the first trick.':phase==='play'?v.trick.length?'Follow suit. Keep the points away.':v.trickNumber===0?`Open with ${cardName(v.opening)}.`:'The winner leads.':phase==='trick'?'The highest card of the led suit takes it.':phase==='hand'?'Lowest total wins. Take your time.':'A good table, a clean finish.';
 const cards=v.trick.length?v.trick:phase==='hand'||phase==='done'?v.lastTrick:[];
 const trick=cards.length?cards.map(p=>`<div class="played-card${p.playerId===v.lastWinner&&phase!=='play'?' won':''}">${cardMarkup(p.card)}<span class="played-name">${name(p.playerId)}</span></div>`).join(''):`<div class="empty-trick"><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 53 9 30C-7 9 19-7 32 14 45-7 71 9 55 30Z"/></svg><p>${phase==='pass'?'Pass face down. Receive together.':'No card has been led yet.'}</p></div>`;
 const scores=v.players.map(p=>`<div class="score-chip${p.id===v.actor?' current':''}"><div class="score-name">${escape(p.name)}${s.players[p.id]!.bot?'<span class="bot-dot" title="Bot">●</span>':''}</div><div class="score-values"><strong>${p.score}</strong><span>${v.handCounts[p.id]} cards · ${v.takenPoints[p.id]} taken</span></div></div>`).join('');
 let privateContent='';
 if(cv){
  const prompt=phase==='pass'?`Choose 3 cards to pass ${direction.toLowerCase()}.`:`${cv.legal.length===1?'One legal card.':'Choose a lit card.'} ${v.trick.length?'You must follow suit if you can.':!v.heartsBroken?'Hearts are not broken.':'Hearts are broken.'}`;
  privateContent=`<div class="hand-heading"><div><p class="eyebrow">PRIVATE HAND</p><h2>${name(s.actor)}</h2></div><button class="plain" id="hide-hand">Hide hand</button></div><p class="hand-instruction">${prompt}</p><div class="hand-grid">${cv.hand.map(card=>{const on=selected.has(card),disabled=phase==='play'?!cv.legal.includes(card):selected.size===3&&!on;return `<button type="button" class="hand-card${on?' selected':''}${!disabled?' legal':''}" data-card="${card}" aria-label="${spokenCard(card)}"${phase==='pass'?` aria-pressed="${on}"`:''}${disabled?' disabled':''}>${cardMarkup(card)}${on?'<span class="picked" aria-hidden="true">✓</span>':''}</button>`;}).join('')}</div>${phase==='pass'?`<button class="primary wide" id="pass-confirm"${selected.size===3?'':' disabled'}>Pass ${selected.size} / 3 selected</button>`:''}${cv.receivedCards?.length?`<details class="pass-memory"><summary>Cards received / sent</summary><p>Received: ${cv.receivedCards.map(cardName).join(' · ')}</p><p>Sent to ${name(cv.sentTo!)}: ${cv.sentCards!.map(cardName).join(' · ')}</p></details>`:''}`;
 }else if(human){
  privateContent=`<div class="handoff"><span class="lock" aria-hidden="true">◈</span><p class="eyebrow">PRIVATE HANDOFF</p><h2>Pass the screen to<br><span>${name(s.actor)}</span></h2><p>Everyone else, look away.<br>The turn clock starts after reveal.</p><button class="primary" id="start-turn">Show my hand</button></div>`;
 }else if(privatePhase){
  privateContent=`<div class="handoff"><span class="lock" aria-hidden="true">♣</span><p class="eyebrow">BOT TURN</p><h2>${name(s.actor)}</h2><p>${phase==='pass'?'Choosing a private pass.':'Thinking about the next card.'}<br>Bot hands stay face down.</p></div>`;
 }else{
  const result=phase==='done'?game.results(s):null;const moon=v.lastHand?.moon;
  privateContent=`<div class="summary-panel"><p class="eyebrow">${phase==='done'?'TABLE COMPLETE':phase==='hand'?'HAND '+v.handNumber:'PUBLIC TRICK'}</p><h2>${phase==='done'?result!.winnerIds.map(name).join(' &amp; ')+' win'+(result!.winnerIds.length===1?'s':''):phase==='hand'?moon?name(moon)+' shot the moon':'The score is in':name(v.lastWinner!)+' takes the trick'}</h2>${phase==='trick'?`<p>${v.takenPoints[v.lastWinner!]} penalty points taken so far this hand.</p>`:`<div class="score-rows">${(result?.ranking.map(r=>r.playerId)??s.order).map(id=>`<div><span>${name(id)}</span><strong>${v.scores[id]}</strong>${v.lastHand?`<small>${v.lastHand.points[id]!>=0?'+':''}${v.lastHand.points[id]} this hand</small>`:''}</div>`).join('')}</div>`}<p class="fine">${phase==='trick'?'No trump: only the led suit can win.':`${s.settings.jack?'The J♦ taker receives −10 separately. ':''}${moon?(s.settings.moon==='add'?'Moon: +26 to everyone else.':'Moon: −26 to the shooter.'):'Hearts +1 each · Q♠ +13.'}`}</p>${phase==='done'?'<button class="primary" id="new-table">New table</button>':`<button class="primary" id="continue">${phase==='trick'?'Next trick':s.order.some(id=>s.scores[id]!>=s.settings.target)?'See final scores':'Deal next hand'}</button>`}</div>`;
 }
 const canPause=!human||Boolean(cv);const paused=Boolean(s.phase.paused);
 $('#table').innerHTML=`<div class="table-top"><div><p class="eyebrow">HAND ${v.handNumber} · FIRST TO ${s.settings.target} ENDS THE MATCH</p><h1>${phaseLabel}</h1></div><div class="top-controls"><span class="clock" id="clock-label">${paused?'Clock held':v.deadline===null?'No rush':'Clock running'}</span><details class="manage"><summary>Manage</summary><div><button id="pause"${!canPause?' disabled':''}>${paused?'Resume':'Pause'}</button><button id="skip">Auto-play / continue</button><button id="end">End match</button><button id="reset">New table</button></div></details></div></div><div class="score-strip">${scores}</div><div class="play-layout"><section class="felt" aria-label="Public trick"><div class="felt-top"><span class="eyebrow">${v.heartsBroken?'HEARTS BROKEN':'HEARTS UNBROKEN'}</span><span class="phase-pill">${s.order.length} seats · ${direction}</span></div><div class="trick-grid">${trick}</div><p class="table-instruction">${heading}</p><div class="felt-bottom"><span>♥ +1 · Q♠ +13${s.settings.jack?' · J♦ −10':''}</span><span>${s.settings.moon==='add'?'Moon adds 26 to others':'Moon subtracts 26'}</span></div></section><section class="private-panel" aria-label="Player controls">${privateContent}</section></div><div class="table-footer"><p>Private hands · shared table · lowest score wins</p>${s.order.every(id=>s.players[id]!.bot)?`<label class="fast-option"><input id="fast-bots" type="checkbox"${fast?' checked':''}> Fast bot table</label>`:''}<button id="rules-toggle" class="plain">Rules</button></div>`;
 document.querySelector('#start-turn')?.addEventListener('click',()=>{if(!state)return;revealed=state.actor;state=game.reduce(state,{type:'vip',action:'resume',now:now()});render();focusPrimary();});
 // These elements vary by phase; direct optional queries avoid hidden placeholders.
 for(const button of document.querySelectorAll<HTMLButtonElement>('.hand-card'))button.addEventListener('click',()=>{if(!state)return;const card=Number(button.dataset.card);if(state.phase.id==='pass'){selected.has(card)?selected.delete(card):selected.size<3&&selected.add(card);refreshSelection();}else input({type:'play',card});});
 document.querySelector('#pass-confirm')?.addEventListener('click',()=>input({type:'pass',cards:[...selected]}));
 document.querySelector('#hide-hand')?.addEventListener('click',()=>{revealed=null;selected=new Set();concealIfNeeded();render();focusPrimary();});
 document.querySelector('#continue')?.addEventListener('click',()=>input({type:'next'}));
 document.querySelector('#new-table')?.addEventListener('click',reset);
 $('#pause').addEventListener('click',()=>dispatch({type:'vip',action:state?.phase.paused?'resume':'pause',now:now()}));
 $('#skip').addEventListener('click',()=>dispatch({type:'vip',action:'skip',now:now()}));
 $('#end').addEventListener('click',()=>dispatch({type:'vip',action:'end',now:now()}));
 $('#reset').addEventListener('click',reset);
 $('#rules-toggle').addEventListener('click',()=>{$('#rules').hidden=!$('#rules').hidden;});
 document.querySelector<HTMLInputElement>('#fast-bots')?.addEventListener('change',e=>{fast=(e.target as HTMLInputElement).checked;lastBotAt=0;});
 if(oldFocus!==undefined){const match=document.querySelector<HTMLElement>(`.hand-card[data-card="${Number(oldFocus)}"]`);if(match&&!match.hasAttribute('disabled'))match.focus({preventScroll:true});else focusPrimary();}
 else if(human&&cv===null)focusPrimary();
 updateClock();
}
function reset():void{state=null;revealed=null;selected=new Set();$('#table').hidden=true;$('#table').innerHTML='';$('#setup').hidden=false;setupSeats();$('#seat-count').focus({preventScroll:true});}
function updateClock():void{
 if(!state)return;const label=$('#clock-label');const text=state.phase.paused?'Clock held':state.phase.deadline===null?'No rush':`${Math.max(0,Math.ceil((state.phase.deadline-now())/1000))}s`;
 if(label.textContent!==text)label.textContent=text;
}
function tick(t:number):void{
 if(state&&!state.phase.paused&&state.phase.id!=='done'){
  if(state.phase.deadline!==null&&now()>=state.phase.deadline)dispatch({type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt,now:now()});
  if(state&&!state.phase.paused&&(fast||t-lastBotAt>360)){
   let changed=false;const batch=fast?8:1;
   for(let k=0;k<batch&&state&&!state.phase.paused&&state.phase.id!=='done';k++){
    const s:HeartsState=state;const publicPhase=s.phase.id==='trick'||s.phase.id==='hand';
    if(publicPhase&&!fast)break;
    const id=publicPhase?s.order.find(id=>s.players[id]!.bot&&!s.left.includes(id)):s.actor;
    if(!id||!s.players[id]!.bot)break;
    const choice=game.bot.sampleInput(s,id,createRng((s.rng.seed^Math.imul(revision+1,123457))>>>0),seatPrefs[Number(id.slice(1))]!.mode as BotSkill);
    if(!choice)break;const prev:HeartsState=state;dispatch({type:'input',playerId:id,input:choice,now:now()},false);changed ||= prev!==state;
   }
   lastBotAt=t;if(changed)render();
  }
 }
 if(state)updateClock();requestAnimationFrame(tick);
}
setupSeats();requestAnimationFrame(tick);
const bridge=window as unknown as{__hearts:{snapshot:()=>unknown}};
bridge.__hearts={snapshot:()=>state?{view:game.tvView(state),result:game.results(state),revealed,privateCards:document.querySelectorAll('.hand-card').length,selected:[...selected],revision,fast}:null};
