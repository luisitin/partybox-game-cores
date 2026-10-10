import {game} from './src/index';
import {firstLetter} from './src/match';
import {draftWarnings} from './client-draft';
import type {Input, State, PublicView, PrivateView} from './src/model';
import {createRng} from '../../contract/rng';
import type {BotSkill} from '../../contract/constants';
import {SAVE_KEY,decodeSave,encodeSave,restoreBotRng} from './client-save';
import type {SavedGame,SavedSeat} from './client-save';

declare const __G09_SAVE_COMPAT__:string;
type Seat = SavedSeat;
const main = document.querySelector<HTMLElement>('#main')!;
const modalRoot = document.querySelector<HTMLElement>('#modal-root')!;
const announcer = document.querySelector<HTMLElement>('#announcer')!;
const vipButton = document.querySelector<HTMLButtonElement>('#vip-button')!;
let seats:Seat[] = [{id:'p1',name:'Alex',kind:'human'},{id:'p2',name:'Sam',kind:'human'}];
let state:State|null = null;
let activeHuman:string|null = null;
let handover = true;
let draft:string[] = Array(12).fill('');
let ballot:(boolean|null)[] = [];
let coreNow = 0;
let phaseKey = '';
let phaseElapsed = 0;
let phaseBase = 0;
let seatStarted = 0;
let seatElapsed = 0;
let menuOpen = false;
let modalLastFocus:HTMLElement|null = null;
let botRunning = false;
let receiptRound:number|null = null;
let saveOffer:SavedGame|null = null;
let saveProblem = '';
let restoredTurn = false;
let savePending:ReturnType<typeof setTimeout>|null = null;
let lastCheckpoint = 0;
let config = {rounds:3,roundSeconds:180,seed:42};
const botRngs = new Map<string,ReturnType<typeof createRng>>();
const escape = (value:unknown):string => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const arrows = '<span aria-hidden="true">→</span>';
const privacyIcon = '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true"><rect x="9" y="17" width="22" height="18" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M13 17v-6a7 7 0 0 1 14 0v6" stroke="currentColor" stroke-width="2.5"/><path d="M20 24v5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
function announce(text:string):void {announcer.textContent = text;}
function updateDraftWarnings():void {
  if(!state||state.phase.id!=='answer'||!activeHuman||handover)return;
  for(const [index,text] of draftWarnings(draft,state.letter).entries()){
    const hint=document.querySelector<HTMLElement>(`#draft-warning-${index}`);
    if(!hint)continue;
    if(hint.textContent!==text)hint.textContent=text;
    hint.hidden=!text;
  }
}
function view():PublicView {return game.tvView(state!);}
function privateView(id:string):PrivateView {return game.controllerView(state!,id);}
function name(id:string):string {return seats.find(s=>s.id===id)?.name ?? id;}
function kindLabel(kind:Seat['kind']):string {return kind==='human'?'Person':`${({easy:'Easy',normal:'Medium',sharp:'Strong'})[kind]} bot`;}
function humanIds():string[] {return seats.filter(s=>s.kind==='human').map(s=>s.id);}
function budget():number {if(!state) return 0;return state.phase.id==='answer'?state.cfg.roundSeconds*1000:Math.max(1000,(state.phase.deadline ?? phaseBase+30000)-phaseBase);}
function elapsed():number {return seatElapsed + (!handover && activeHuman && !menuOpen && !state?.phase.paused ? performance.now()-seatStarted : 0);}
function updateClock():void {if(!state || !activeHuman || handover || menuOpen || state.phase.paused) return;phaseElapsed=Math.max(phaseElapsed,Math.min(budget()-1,elapsed()));coreNow=Math.max(coreNow,phaseBase+phaseElapsed);}
function saveStatus(text:string):void {const status=document.querySelector('#save-status');if(status&&status.textContent!==text)status.textContent=text;}
function loadSavedGame():void {
  try {const raw=localStorage.getItem(SAVE_KEY);if(raw===null)return;const decoded=decodeSave(raw,__G09_SAVE_COMPAT__);if(decoded.kind==='valid'){saveOffer=decoded.snapshot;saveStatus('A saved game is ready to resume.');}else saveProblem=decoded.kind==='stale'?'This saved game belongs to a different version. Discard it to start fresh.':'This saved game could not be read. Discard it to start fresh.';}
  catch {saveProblem='Saving is unavailable in this browser. Keep the game page open while you play.';saveStatus('Saving is unavailable on this device.');}
}
function saveNow():void {
  if(savePending!==null){clearTimeout(savePending);savePending=null;}
  if(!state)return;
  updateClock();
  const saved:SavedGame={version:1,compat:__G09_SAVE_COMPAT__,state,seats,config,activeHuman,handover,draft,ballot,coreNow,phaseBase,phaseElapsed,seatElapsed:activeHuman?Math.min(budget(),elapsed()):seatElapsed,botRngs:Object.fromEntries([...botRngs].map(([id,rng])=>[id,rng.state()])),receiptRound};
  try {const raw=encodeSave(saved);localStorage.setItem(SAVE_KEY,raw);if(localStorage.getItem(SAVE_KEY)!==raw)throw new Error('Storage did not retain the game');saveStatus('Saved on this device.');}
  catch {saveStatus('Game could not be saved. Keep this page open.');}
  lastCheckpoint=performance.now();
}
function scheduleSave():void {if(!state)return;saveStatus('Saving changes…');if(savePending!==null)clearTimeout(savePending);savePending=setTimeout(saveNow,250);}
function discardSavedGame():void {
  try {localStorage.removeItem(SAVE_KEY);if(localStorage.getItem(SAVE_KEY)!==null)throw new Error('Storage did not remove the game');saveOffer=null;saveProblem='';saveStatus('Saved game discarded.');}
  catch {saveOffer=null;saveProblem='The saved game could not be removed. Saving may be unavailable in this browser.';saveStatus('Saving is unavailable on this device.');}
  syncConfig();renderSetup();
}
function resumeSavedGame():void {
  if(!saveOffer)return;
  const saved=saveOffer;saveOffer=null;saveProblem='';state=saved.state;seats=saved.seats;config=saved.config;activeHuman=saved.activeHuman;draft=saved.draft;ballot=saved.ballot;coreNow=saved.coreNow;phaseBase=saved.phaseBase;phaseElapsed=saved.phaseElapsed;seatElapsed=saved.seatElapsed;receiptRound=saved.receiptRound;phaseKey=instanceKey();seatStarted=performance.now();
  botRngs.clear();for(const [id,rng] of Object.entries(saved.botRngs))botRngs.set(id,restoreBotRng(rng));
  const wasPaused=!!state.phase.paused;handover=!!activeHuman;restoredTurn=!!activeHuman;
  render();if(wasPaused)showControls();saveNow();
}
function chips(v:PublicView):string {return `<div class="seat-chips" role="list" aria-label="Player progress">${v.players.map(p=>`<span role="listitem" aria-label="${escape(p.name)}, ${p.status==='submitted'?'submitted':p.id===activeHuman?(handover?'next to play':'current turn'):'waiting'}" class="chip ${p.id===activeHuman&&!handover?'active':p.status==='submitted'?'done':''}"><span aria-hidden="true">${p.status==='submitted'?'✓':'•'}</span>${escape(p.name)}${seats.find(s=>s.id===p.id)?.kind!=='human'?'<small>BOT</small>':''}</span>`).join('')}</div>`;}
function heading(v:PublicView,title:string,eyebrow:string,timed=false):string {return `<div class="session-top"><div><p class="eyebrow">${escape(eyebrow)} · round ${v.round} of ${v.totalRounds}</p><h2 id="phase-heading" tabindex="-1">${escape(title)}</h2></div><div class="round-pill"><div class="letter-badge" aria-label="Letter ${escape(v.letter)}">${escape(v.letter)}</div>${timed?'<div class="timer-box"><div class="timer" id="timer" role="timer" aria-live="off"></div><div class="timer-label">your time left</div><div class="timer-track"><div class="timer-fill" id="timer-fill"></div></div></div>':''}</div></div>`;}
function renderSetup():void {
  vipButton.hidden=true;
  main.innerHTML=`${saveOffer?`<section class="resume-panel panel" aria-labelledby="resume-title"><h2 id="resume-title">Pick up where you left off.</h2><p class="small muted">Round ${saveOffer.state.round} of ${saveOffer.config.rounds} · ${saveOffer.seats.length} players. Your timer waited while the page was closed. Private turns resume behind a handover.</p><div class="modal-actions"><button class="primary" id="resume-game">Resume game ${arrows}</button><button class="secondary" id="discard-save">Discard saved game</button></div></section>`:saveProblem?`<section class="resume-panel aside"><p role="status">${escape(saveProblem)}</p><button class="secondary" id="discard-save" style="margin-top:12px">Discard saved game</button></section>`:''}<div class="layout page-enter"><section class="hero"><p class="eyebrow">a game for quick minds</p><h1>One letter.<br>Endless ideas.</h1><p class="lead muted">Think fast, get creative, and find the answers nobody else thought of.</p><div class="letter-art" aria-hidden="true"><div class="letter-card">R</div><div class="mini-card">12</div><span class="spark"><svg width="44" height="44" viewBox="0 0 44 44" fill="none"><path d="M22 3v38M3 22h38M8.6 8.6l26.8 26.8M8.6 35.4L35.4 8.6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span></div><div class="instructions"><div class="instruction"><span class="step">1</span><span>Fill 12 categories with words starting with one letter.</span></div><div class="instruction"><span class="step">2</span><span>Pass the screen in private. Review answers together.</span></div><div class="instruction"><span class="step">3</span><span>Vote on what fits. Unique, accepted answers score.</span></div></div></section><section class="panel" aria-labelledby="setup-title"><div class="panel-head"><div><h2 id="setup-title">Gather your people</h2><p class="small muted" style="margin-top:8px">One screen. Good company. Friendly competition.</p></div><span class="tag">2–8 PLAYERS</span></div><form id="setup-form"><div class="player-rows">${seats.map((s,i)=>`<div class="player-row"><span class="avatar" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><input class="field player-name" data-seat="${s.id}" aria-label="Player ${i+1} name" value="${escape(s.name)}" maxlength="24" required><select class="field player-kind" data-seat="${s.id}" aria-label="Player ${i+1} type">${(['human','easy','normal','sharp'] as const).map(k=>`<option value="${k}" ${s.kind===k?'selected':''}>${kindLabel(k)}</option>`).join('')}</select><button type="button" class="remove" data-remove="${s.id}" aria-label="Remove player ${i+1}" ${seats.length<=2?'disabled':''}>×</button></div>`).join('')}</div><button type="button" class="add" id="add-player" ${seats.length>=8?'disabled':''}>+ Add another player</button><div class="settings"><label class="setting-row"><span class="setting-label">Rounds</span><select class="field" id="rounds">${[1,2,3,4,5].map(n=>`<option value="${n}" ${config.rounds===n?'selected':''}>${n} ${n===1?'round · quick game':'rounds'}</option>`).join('')}</select></label><label class="setting-row"><span class="setting-label">Time per person</span><select class="field" id="seconds">${[30,60,90,120,150,180].map(n=>`<option value="${n}" ${config.roundSeconds===n?'selected':''}>${n<60?n+' seconds · sprint':(n/60)+' '+(n===60?'minute · quick':'minutes'+(n===180?' · classic':''))}</option>`).join('')}</select></label><details><summary class="small muted">Repeatable game seed</summary><label class="setting-row" style="margin-top:12px"><span>Seed</span><input class="field" type="number" min="0" max="4294967295" step="1" id="seed" value="${config.seed}" style="width:178px"></label></details><p class="settings-note">Private hot-seat: each person gets the full timer. Handovers pause it. Bots answer automatically; their answers stay hidden.</p></div><div id="setup-error" role="alert"></div><button class="primary" type="submit" ${saveOffer?'disabled':''}>Let’s play ${arrows}</button><p class="bottom-note">Everything stays on this device.</p></form></section></div>`;
}
function syncConfig():void {const rounds=document.querySelector<HTMLSelectElement>('#rounds');if(!rounds) return;config={rounds:Number(rounds.value),roundSeconds:Number(document.querySelector<HTMLSelectElement>('#seconds')!.value),seed:Number(document.querySelector<HTMLInputElement>('#seed')!.value)>>>0};}
function start():void {
  if(saveOffer)return;restoredTurn=false;receiptRound=null;saveProblem='';
  syncConfig();seats=seats.map((s,i)=>({...s,name:s.name.trim() || `Player ${i+1}`}));
  if(!seats.some(s=>s.kind==='human')) {document.querySelector('#setup-error')!.innerHTML='<p class="error">Choose at least one person to play with the bots.</p>';return;}
  coreNow=0;phaseKey='';phaseElapsed=0;activeHuman=null;handover=true;
  botRngs.clear();seats.forEach((s,i)=>botRngs.set(s.id,createRng((config.seed+i*7919)>>>0)));
  state=game.init({players:seats.map(s=>({id:s.id,name:s.name,avatarId:'default',connected:true,...(s.kind!=='human'?{bot:true}:{})})),settings:{rounds:config.rounds,roundSeconds:config.roundSeconds},seed:config.seed,now:coreNow});
  settle();
}
function dispatchInput(id:string,input:Input,vip=false):void {if(!state) return;updateClock();const parsed=game.inputSchema.safeParse(input);if(!parsed.success) {announce('That action could not be accepted. Try again.');return;}state=game.reduce(state,{type:'input',now:coreNow,playerId:id,input:parsed.data,vip});settle();}
function dispatchVip(action:'skip'|'pause'|'resume'|'end'):void {if(!state) return;updateClock();const heldElapsed=elapsed();state=game.reduce(state,{type:'vip',now:coreNow,action});if(action==='pause') {seatElapsed=heldElapsed;seatStarted=performance.now();}settle();}
function instanceKey():string {return state?`${state.phase.id}:${state.phase.startedAt}:${state.phase.id==='review'?state.reviewIndex:''}`:'';}
function runBots():void {
  if(!state||botRunning||state.phase.paused) return;botRunning=true;
  try {for(let i=0;i<256;i++){let moved=false;for(const s of seats){if(s.kind==='human'||!state||state.phase.id==='scores'||state.phase.id==='done') continue;const input=game.bot.sampleInput(state,s.id,botRngs.get(s.id)!,s.kind);if(!input) continue;const parsed=game.inputSchema.safeParse(input);if(!parsed.success) throw new Error('Bot returned invalid input');const next=game.reduce(state,{type:'input',now:coreNow,playerId:s.id,input:parsed.data});if(next!==state){state=next;moved=true;coreNow=Math.max(coreNow,state.phase.startedAt);}}if(!moved) break;}}finally{botRunning=false;}
}
function settle():void {
  if(!state) return;runBots();
  // No ballot can change an empty category. Advance through the real timer
  // boundary, preserving core scoring and the next nonempty private review.
  for(let steps=0;steps<12&&state.phase.id==='review'&&!state.phase.paused&&!menuOpen&&view().review?.groups.length===0;steps++){
    const deadline=state.phase.deadline;if(deadline===null)break;
    const previous:State=state;coreNow=Math.max(coreNow,deadline);
    state=game.reduce(state,{type:'timer',now:coreNow,phaseId:state.phase.id,startedAt:state.phase.startedAt});
    if(state===previous)break;runBots();
  }
  const key=instanceKey();
  if(key!==phaseKey){restoredTurn=false;receiptRound=null;phaseKey=key;phaseElapsed=0;seatElapsed=0;seatStarted=0;activeHuman=null;handover=true;draft=Array(12).fill('');ballot=[];coreNow=Math.max(coreNow,state.phase.startedAt);phaseBase=coreNow;}
  if(state.phase.id==='answer'||state.phase.id==='review') {
    const pending=humanIds().find(id=>state!.phase.id==='answer'?!privateView(id).submitted:!privateView(id).voted);
    if(pending && pending!==activeHuman){activeHuman=pending;handover=true;seatElapsed=0;draft=Array(12).fill('');ballot=Array(view().review?.groups.length??0).fill(null);}
    if(!pending){coreNow=Math.max(coreNow,state.phase.deadline??coreNow);const previous=state;state=game.reduce(state,{type:'timer',now:coreNow,phaseId:state.phase.id,startedAt:state.phase.startedAt});if(state!==previous){settle();return;}}
  } else {activeHuman=null;handover=false;}
  render();
}
function renderHandover(v:PublicView):void {main.innerHTML=`<section class="handover page-enter"><div class="privacy-icon">${privacyIcon}</div><p class="eyebrow">${state!.phase.id==='answer'?'Private answer time':'Private ballot'} · round ${v.round}</p><h2>Pass to ${escape(name(activeHuman!))}.</h2><p class="lead muted">${state!.phase.id==='answer'?'Keep the screen to yourself while you write. Your answers stay hidden until everyone has finished.':'Review the answers and cast your vote. The authors stay hidden until scoring.'}</p><button class="primary" id="ready">I’m ${escape(name(activeHuman!))} — ${state!.phase.id==='answer'?'start timer':'ready to vote'} ${arrows}</button><p class="small muted">${state!.phase.id==='answer'?`${state!.cfg.roundSeconds/60} ${state!.cfg.roundSeconds===60?'minute':'minutes'} for you · the timer waits here`:'The timer waits here · choose keep, reject, or abstain'}</p>${chips(v)}</section>`;announce(`Pass the screen to ${name(activeHuman!)}. ${state!.phase.id==='answer'?'Your answers are private.':'Authors are hidden during voting.'}`);}
function renderAnswer(v:PrivateView):void {main.innerHTML=`<section class="page-enter">${heading(v,'What comes to mind?','write your answers',true)}<div class="turn-strip"><span><span class="turn-name">${escape(name(activeHuman!))}</span>, your private turn</span><span class="muted"><span id="filled">${draft.filter(answer=>answer.trim()).length}</span> / 12 answered · start with ${escape(v.letter)}</span></div><form id="answer-form"><div class="categories">${v.categories.map((c,i)=>`<div class="category"><div class="category-head"><span class="category-number" aria-hidden="true">${String(i+1).padStart(2,'0')}</span><label for="answer-${i}">${escape(c.prompt)}</label></div><input class="field answer-input" id="answer-${i}" data-answer="${i}" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="80" placeholder="${escape(v.letter)}…" value="${escape(draft[i]??'')}" aria-describedby="hint-${i} draft-warning-${i}"><p class="category-help" id="hint-${i}">${escape(c.clarification)}</p><p class="draft-warning" id="draft-warning-${i}" aria-live="polite" aria-atomic="true" hidden></p></div>`).join('')}</div><div class="answer-footer"><p class="small muted">Use each answer only once. Ignore “A”, “An”, and “The” at the start. Blank answers are okay — keep moving.</p><button class="primary" type="submit">Lock my answers ${arrows}</button></div></form>${chips(v)}</section>`;updateDraftWarnings();tick();announce(`${name(activeHuman!)}. Write twelve answers beginning with ${v.letter}. Your timer has started.`);}
function renderReview(v:PrivateView):void {const review=v.review!;main.innerHTML=`<section class="page-enter">${heading(v,review.category.prompt,`review category ${review.categoryIndex+1} of 12`,true)}<div class="turn-strip"><span><span class="turn-name">${escape(name(activeHuman!))}</span>, your private ballot</span><span class="muted">Authors hidden · duplicate answers score zero</span></div><div class="voting-layout"><form id="vote-form"><div class="vote-list">${review.groups.map((g,i)=>`<div class="vote-card"><div><p class="answer-text">${escape(g.text)}</p><p class="answer-meta">${!g.eligible?'Wrong initial · cannot score':g.duplicateCount>1?`Shared answer (${g.duplicateCount}) · scores zero`:'Unique answer · up to 1 point if accepted'}</p></div><div class="vote-controls" role="group" aria-label="Vote on ${escape(g.text)}">${(['true','false','null'] as const).map((value)=>`<button type="button" class="vote-button" data-vote="${i}" data-value="${value}" aria-pressed="${String(ballot[i]===({true:true,false:false,null:null}[value]))}" ${!g.eligible?'disabled':''}>${{true:'Keep',false:'Reject',null:'Abstain'}[value]}</button>`).join('')}</div></div>`).join('') || '<div class="aside"><h3>No answers this time</h3><p>Everyone left this category blank. Lock your ballot to keep the round moving.</p></div>'}</div><div class="answer-footer"><p class="small muted">${escape(review.category.clarification)}</p><button class="primary" type="submit">Lock my ballot ${arrows}</button></div></form><aside class="aside"><h3>Does it fit?</h3><p>An answer needs to fit the category and start with <strong>${escape(v.letter)}</strong>. Creative answers are welcome if the group accepts them.</p><p style="margin-top:12px">A majority decides. On a tie, the answer’s author’s vote is excluded. An uncontested answer is accepted.</p><div class="progress-dots" aria-label="Category ${review.categoryIndex+1} of 12">${Array.from({length:12},(_,i)=>`<span class="progress-dot ${i<review.categoryIndex?'done':i===review.categoryIndex?'current':''}"></span>`).join('')}</div></aside></div>${chips(v)}</section>`;tick();announce(`${name(activeHuman!)} votes on category ${review.categoryIndex+1}: ${review.category.prompt}. Authors are hidden.`);}
function renderScores(v:PublicView):void {const receipt=v.history.find(round=>round.round===receiptRound)??v.roundResult??v.history.at(-1);const result=game.results(state!);const isFinal=state!.phase.id==='done';const ranked=[...v.players].sort((a,b)=>(b.score??0)-(a.score??0));const winnerNames=result?.winnerIds.map(name)??[];const title=isFinal?(winnerNames.length>1?`${winnerNames.join(' & ')} tie!`:`${winnerNames[0]??ranked[0]?.name??'Everyone'} wins!`):'Good ideas add up.';main.innerHTML=`<section class="page-enter">${heading(v,title,isFinal?'final results':'round complete')}<div class="score-grid"><div class="score-panel"><h3>${isFinal?'The final tally':'The scoreboard'}</h3><div class="scoreboard">${ranked.map((p,i)=>`<div class="score-row"><span class="rank">${i&&ranked[i-1]?.score===p.score?'=':i+1}</span><span class="avatar" aria-hidden="true">${escape(p.name.slice(0,1).toUpperCase())}</span><div class="score-name">${escape(p.name)}<div class="score-gain">${seats.find(s=>s.id===p.id)?.kind!=='human'?`${kindLabel(seats.find(s=>s.id===p.id)!.kind)} · `:''}+${receipt?.points[p.id]??0} in round ${receipt?.round??v.round}</div></div><strong class="points">${p.score??0}</strong></div>`).join('')}</div><button class="primary" id="next-round" style="margin-top:24px;width:100%">${isFinal?'Play again':v.round>=v.totalRounds?'See final results':'Next round'} ${arrows}</button><p class="small muted" style="margin-top:15px">${isFinal?'Tied scores share the win. Start a fresh game to keep playing.':'Authors are revealed now. Open a category to see how each answer scored.'}</p></div><div class="score-panel" id="receipt-panel"><h3>Round ${receipt?.round??v.round} · letter ${escape(receipt?.letter??v.letter)} · the answer reveal</h3>${v.history.length>1?`<label class="setting-row" for="history-round"><span>Review a completed round</span><select class="field" id="history-round">${v.history.map(round=>`<option value="${round.round}" ${round.round===receipt?.round?'selected':''}>Round ${round.round} · letter ${escape(round.letter)}</option>`).join('')}</select></label>`:''}<div class="receipt">${receipt?.categories.map((c,i)=>{const groups=receipt!.entries.find(entry=>entry.categoryId===c.id)?.groups??[];return `<details class="receipt-category" ${i===0?'open':''}><summary>${String(i+1).padStart(2,'0')} · ${escape(c.prompt)}</summary><div class="receipt-lines">${groups.map(g=>`<div class="receipt-answer"><div><strong>${escape(g.text)}</strong><p class="small muted">${g.owners.map(id=>escape(name(id))).join(', ')}</p></div><span class="verdict ${g.points===0?'zero':''}">${g.points>0?'+1 point':g.duplicate?'Duplicate · 0':!g.eligible?(firstLetter(g.text)!==receipt!.letter?'Wrong initial · 0':'Used twice · 0'):!g.accepted?'Voted out · 0':'0 points'}</span></div>`).join('') || '<p class="small muted">No answers submitted.</p>'}</div></details>`;}).join('') || '<p class="small muted">The host ended the game before this round was scored.</p>'}</div></div></div></section>`;announce(isFinal?`${title} Final scores are ready.`:'Round complete. Authors and points are revealed.');}
function render():void {if(!state){renderSetup();return;}vipButton.hidden=state.phase.id==='done';const v=view();if(handover&&activeHuman){renderHandover(v);document.querySelector<HTMLButtonElement>('#ready')?.focus({preventScroll:true});}else if(state.phase.id==='answer'&&activeHuman)renderAnswer(privateView(activeHuman));else if(state.phase.id==='review'&&activeHuman)renderReview(privateView(activeHuman));else {renderScores(v);document.querySelector<HTMLElement>('#phase-heading')?.focus({preventScroll:true});}window.scrollTo({top:0,behavior:'instant'});saveNow();}
function beginTurn():void {if(!state||!activeHuman||menuOpen)return;if(restoredTurn){if(state.phase.paused)state=game.reduce(state,{type:'vip',action:'resume',now:coreNow});restoredTurn=false;}else seatElapsed=0;handover=false;seatStarted=performance.now();render();if(state.phase.id==='answer')document.querySelector<HTMLInputElement>('#answer-0')?.focus({preventScroll:true});else (document.querySelector<HTMLButtonElement>('.vote-button:not(:disabled)')??document.querySelector<HTMLButtonElement>('#vote-form button[type=submit]'))?.focus({preventScroll:true});}
function submitTurn():void {if(!state||!activeHuman||handover||menuOpen||state.phase.paused) return;const id=activeHuman;const input:Input=state.phase.id==='answer'?{type:'submit',answers:[...draft]}:{type:'vote',votes:[...ballot]};draft=Array(12).fill('');ballot=[];dispatchInput(id,input);document.querySelector<HTMLButtonElement>('#ready')?.focus({preventScroll:true});}
function tick():void {if(!state||!activeHuman||handover||menuOpen||state.phase.paused) return;const remaining=Math.max(0,budget()-elapsed());const timer=document.querySelector('#timer');if(timer){const seconds=Math.ceil(remaining/1000);const label=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;if(timer.textContent!==label)timer.textContent=label;timer.classList.toggle('low',remaining<=20000);timer.setAttribute('aria-label',`${Math.floor(seconds/60)} minutes ${seconds%60} seconds left`);const fill=document.querySelector<HTMLElement>('#timer-fill');if(fill)fill.style.transform=`scaleX(${remaining/budget()})`;}
  if(remaining<=0){announce('Time is up. Your answers or ballot have been locked.');submitTurn();}else if(performance.now()-lastCheckpoint>=5000)saveNow();
}
function closeModal(resume=true):void {modalRoot.replaceChildren();if(menuOpen){menuOpen=false;if(resume&&state?.phase.paused){state=game.reduce(state,{type:'vip',action:'resume',now:coreNow});}seatStarted=performance.now();}modalLastFocus?.focus();saveNow();}
function showModal(title:string,body:string,actions:string):void {if(!modalRoot.firstElementChild)modalLastFocus=document.activeElement as HTMLElement;modalRoot.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title">${escape(title)}</h2>${body}${actions}</section></div>`;modalRoot.querySelector<HTMLButtonElement>('button')?.focus();}
function showHelp():void {if(state&&!menuOpen){updateClock();seatElapsed=elapsed();state=game.reduce(state,{type:'vip',action:'pause',now:coreNow});menuOpen=true;}showModal('One letter. Twelve ideas.','<p>Write an answer for each category that begins with the round’s letter. Ignore “A”, “An”, and “The” at the start. Use an answer only once per round.</p><p>Keep your answers private, then pass the screen. Each person gets the full timer; it waits during handovers.</p><p>Vote on the anonymous answers. Accepted, unique answers score 1 point. Duplicates score zero. Authors appear after scoring; ties share the final win.</p>','<div class="modal-actions"><button class="primary" data-close>Got it</button></div>');saveNow();}
function showControls():void {if(!state)return;updateClock();seatElapsed=elapsed();if(!state.phase.paused)state=game.reduce(state,{type:'vip',action:'pause',now:coreNow});menuOpen=true;showModal('Host controls','<p>The game is paused. Resume when everyone is ready, skip this phase, or end the game with the current scores.</p>','<div class="control-menu"><button class="primary" data-close>Resume game</button><button class="secondary" id="host-skip">'+escape(view().vipSkipLabel??'Skip current phase')+'</button><button class="secondary" id="host-end">End game</button></div>');saveNow();}
document.addEventListener('input',event=>{const target=event.target;if(!(target instanceof HTMLInputElement))return;if(target.matches('.player-name')){const seat=seats.find(s=>s.id===target.dataset.seat);if(seat)seat.name=target.value;}if(target.matches('.answer-input')){draft[Number(target.dataset.answer)]=target.value;document.querySelector('#filled')!.textContent=String(draft.filter(a=>a.trim()).length);updateDraftWarnings();scheduleSave();}});
document.addEventListener('change',event=>{const target=event.target;if(target instanceof HTMLSelectElement&&target.id==='history-round'&&state){receiptRound=Number(target.value);renderScores(view());document.querySelector<HTMLSelectElement>('#history-round')?.focus({preventScroll:true});announce(`Showing completed round ${receiptRound}. Scores are unchanged.`);saveNow();return;}if(target instanceof HTMLSelectElement&&target.matches('.player-kind')){const seat=seats.find(s=>s.id===target.dataset.seat);if(seat)seat.kind=target.value as Seat['kind'];}syncConfig();});
document.addEventListener('submit',event=>{const target=event.target;if(!(target instanceof HTMLFormElement))return;event.preventDefault();if(target.id==='setup-form')start();if(target.id==='answer-form'||target.id==='vote-form')submitTurn();});
document.addEventListener('click',event=>{const target=(event.target as HTMLElement).closest<HTMLButtonElement>('button');if(!target||target.disabled)return;
  if(target.id==='add-player'){syncConfig();const next=Math.max(...seats.map(s=>Number(s.id.slice(1))))+1;seats.push({id:`p${next}`,name:`Player ${next}`,kind:'human'});renderSetup();document.querySelector<HTMLInputElement>(`[data-seat="p${next}"].player-name`)?.focus();}
  if(target.dataset.remove){syncConfig();seats=seats.filter(s=>s.id!==target.dataset.remove);renderSetup();}
  if(target.id==='resume-game')resumeSavedGame();
  if(target.id==='discard-save')discardSavedGame();
  if(target.id==='ready')beginTurn();
  if(target.dataset.vote){const i=Number(target.dataset.vote);ballot[i]=target.dataset.value==='null'?null:target.dataset.value==='true';target.parentElement!.querySelectorAll<HTMLButtonElement>('button').forEach(b=>b.setAttribute('aria-pressed',String(b===target)));saveNow();}
  if(target.id==='next-round'){if(state?.phase.id==='done'){if(savePending!==null){clearTimeout(savePending);savePending=null;}state=null;activeHuman=null;restoredTurn=false;config.seed=(config.seed+1)>>>0;discardSavedGame();announce('New game settings.');}else dispatchInput(humanIds()[0]!,{type:'next'},true);}
  if(target.id==='help-button')showHelp();if(target.id==='vip-button')showControls();if(target.hasAttribute('data-close'))closeModal();
  if(target.id==='host-skip'){closeModal();dispatchVip('skip');}
  if(target.id==='host-end'){showModal('End this game?','<p>Finish with the points already scored. The current unfinished round will not earn points.</p>','<div class="modal-actions"><button class="secondary" data-close>Keep playing</button><button class="primary" id="confirm-end">End game</button></div>');}
  if(target.id==='confirm-end'){closeModal();dispatchVip('end');}
});
document.addEventListener('keydown',event=>{if(!modalRoot.firstElementChild){const target=event.target;if(event.key==='Enter'&&target instanceof HTMLInputElement&&target.matches('.answer-input')){event.preventDefault();const index=Number(target.dataset.answer);if(index<11)document.querySelector<HTMLInputElement>(`#answer-${index+1}`)?.focus();else document.querySelector<HTMLButtonElement>('#answer-form button[type="submit"]')?.focus();}return;}if(event.key==='Escape'){event.preventDefault();closeModal();return;}if(event.key==='Tab'){const focusable=Array.from(modalRoot.querySelectorAll<HTMLElement>('button,a,input,select,[tabindex="0"]'));const first=focusable[0];const last=focusable.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}});
// The offline shell owns wall time. The imported game remains a deterministic state machine.
setInterval(tick,100);
window.addEventListener('pagehide',saveNow);
window.addEventListener('beforeunload',saveNow);
loadSavedGame();
renderSetup();
