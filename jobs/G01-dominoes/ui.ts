// Hot-seat play page. Renders only from the core's views (plus the local seat roster);
// every motion is transform/opacity and has an instant reduced-motion path.
import {game,init,reduce,controllerView,tvView,tile,type State,type Input} from './core.ts';
import {createRng} from '../../contract/rng.ts';

type Skill='human'|'easy'|'normal'|'sharp';
type ViewMode='tv'|'phone';
type Rect={left:number;top:number;width:number;height:number};
interface Place {x:number;y:number;rot:number;top:number;bottom:number;w:number;h:number}
interface Arm {cx:number;cy:number;dx:number;dy:number;half:number;lastH:number;turnSign:number;vertical:number}

const SKILL_LABEL:Record<Skill,string>={human:'Human',easy:'Easy bot',normal:'Medium bot',sharp:'Strong bot'};
const COLORS=['#ff5d8f','#ffd166','#06d6a0','#4cc9f0'];
const TEAMS=[{name:'Team A',c:'#06d6a0'},{name:'Team B',c:'#ffd166'}];
const POSITIONS:Record<number,string[]>={2:['S','N'],3:['S','W','E'],4:['S','W','N','E']};
const EASE='cubic-bezier(.2,.8,.2,1)';
const SPRING='cubic-bezier(.3,1.45,.5,1)';
const U0={tv:60,phone:30},BOUND={tv:8,phone:5};

const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
function h<K extends keyof HTMLElementTagNameMap>(tag:K,cls='',text=''):HTMLElementTagNameMap[K]{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
const app=$('app'),frame=$('frame'),fx=$('fx'),layer=$('boardLayer'),boardBox=$('board'),feltInner=$('feltInner');
const reducedQuery=matchMedia('(prefers-reduced-motion: reduce)');
const moving=()=>!reducedQuery.matches&&!document.hidden;
let cosmetic=0x9e3779b9;const rand=()=>{cosmetic=(Math.imul(cosmetic^(cosmetic>>>15),0x2c1b3c6d)+0x6d2b79f5)>>>0;return cosmetic/4294967296;};

// ── View mode and stage scaling ──────────────────────────────────────────
const forcedView=new URLSearchParams(location.search).get('view');
let view:ViewMode='tv',stageScale=1;
function chooseView(){view=forcedView==='phone'||forcedView==='tv'?forcedView:(innerWidth<760||innerHeight>innerWidth*1.15?'phone':'tv');app.dataset.view=view;
 if(view==='tv'){stageScale=Math.min(innerWidth/1920,innerHeight/1080);frame.style.transform=`translate(${(innerWidth-1920*stageScale)/2}px,${(innerHeight-1080*stageScale)/2}px) scale(${stageScale})`;}
 else{stageScale=1;frame.style.transform='';}
 $('end').textContent=view==='tv'?'End match':'End';}
chooseView();

// ── Tiles as SVG objects ─────────────────────────────────────────────────
const PIPS:number[][][]=[[],[[50,50]],[[27,27],[73,73]],[[27,27],[50,50],[73,73]],[[27,27],[73,27],[27,73],[73,73]],[[27,27],[73,27],[50,50],[27,73],[73,73]],[[28,23],[72,23],[28,50],[72,50],[28,77],[72,77]]];
const half=(v:number,dy:number)=>(PIPS[v]??[]).map(([x,y])=>`<circle cx="${x!+1}" cy="${y!+dy+1.4}" r="9.4" fill="#fff" opacity=".75"/><circle cx="${x}" cy="${y!+dy}" r="9.4" fill="url(#pbPip)"/>`).join('');
const faces=new Map<string,string>();
function faceSVG(top:number,bottom:number):string{const key=`${top}-${bottom}`;let svg=faces.get(key);if(!svg){svg=`<svg viewBox="0 0 100 200" aria-hidden="true"><rect x="1.5" y="1.5" width="97" height="197" rx="12.5" fill="url(#pbIvory)" stroke="#d6cbae" stroke-width="1.5"/><path d="M9 30V16Q9 8 17 8H62" stroke="url(#pbSheen)" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="13" y="97.6" width="74" height="3" rx="1.5" fill="#a09276"/><rect x="13" y="100.6" width="74" height="1.6" rx=".8" fill="#fff" opacity=".85"/>${half(top,0)}${half(bottom,100)}<circle cx="50" cy="99.6" r="5" fill="url(#pbBrass)"/></svg>`;faces.set(key,svg);}return svg;}
const BACK='<svg viewBox="0 0 100 200" aria-hidden="true"><rect x="1.5" y="1.5" width="97" height="197" rx="12.5" fill="url(#pbBack)" stroke="#12142e" stroke-width="1.5"/><rect x="11" y="11" width="78" height="178" rx="8" fill="none" stroke="#ffd166" stroke-opacity=".38" stroke-width="2"/><path d="M50 76 61 100 50 124 39 100Z" fill="#ffd166" fill-opacity=".42"/><path d="M9 30V16Q9 8 17 8H62" stroke="#fff" stroke-opacity=".28" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
function tileEl(top:number|null,bottom=0,extra=''):HTMLDivElement{const d=h('div',`tile${top===null?' back':''}${extra?' '+extra:''}`);d.innerHTML=top===null?BACK:faceSVG(top,bottom);return d;}
const dieSVG=(v:number)=>`<svg viewBox="0 0 100 100" aria-hidden="true">${half(v,0)}</svg>`;
const rotClass=(r:number)=>r===90?'r90':r===-90?'r-90':r===180?'r180':'';

// ── Sound: short synthesized cues, quiet, only after a user gesture ─────
let audio:AudioContext|null=null,noise:AudioBuffer|null=null,soundOn=true;
function initAudio(){if(audio)return;try{audio=new AudioContext();noise=audio.createBuffer(1,audio.sampleRate*0.2,audio.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=rand()*2-1;}catch{audio=null;}}
function cue(kind:'clack'|'draw'|'score'|'win'|'tick'|'pass'){
 if(!audio||!noise||!soundOn)return;
 try{const t=audio.currentTime,out=audio.createGain();out.gain.value=0.5;out.connect(audio.destination);
  const tone=(f:number,at:number,len:number,vol:number,type:OscillatorType='sine')=>{const o=audio!.createOscillator(),g=audio!.createGain();o.type=type;o.frequency.setValueAtTime(f,t+at);g.gain.setValueAtTime(0.0001,t+at);g.gain.exponentialRampToValueAtTime(vol,t+at+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+at+len);o.connect(g).connect(out);o.start(t+at);o.stop(t+at+len+0.02);};
  const burst=(freq:number,q:number,len:number,vol:number,at=0)=>{const s=audio!.createBufferSource(),f=audio!.createBiquadFilter(),g=audio!.createGain();s.buffer=noise;f.type='bandpass';f.frequency.value=freq;f.Q.value=q;g.gain.setValueAtTime(vol,t+at);g.gain.exponentialRampToValueAtTime(0.0001,t+at+len);s.connect(f).connect(g).connect(out);s.start(t+at);s.stop(t+at+len+0.02);};
  if(kind==='clack'){burst(2600,1.6,0.07,0.35);tone(150,0,0.07,0.12);}
  else if(kind==='draw'||kind==='tick'){burst(1800,1.2,0.04,kind==='tick'?0.08:0.16);}
  else if(kind==='pass'){tone(330,0,0.12,0.05,'triangle');tone(262,0.1,0.16,0.05,'triangle');}
  else if(kind==='score'){tone(660,0,0.16,0.07,'triangle');tone(990,0.11,0.22,0.07,'triangle');}
  else{[523,659,784,1046].forEach((f,i)=>tone(f,i*0.12,0.3,0.07,'triangle'));tone(1318,0.5,0.6,0.05,'sine');}
 }catch{/* sound is optional */}
}
const SPEAKER='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/>';
function renderSound(){const b=$('sound');b.innerHTML=SPEAKER+(soundOn?'<path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>':'<path d="M17 9l5 6M22 9l-5 6"/></svg>');b.setAttribute('aria-pressed',String(soundOn));b.setAttribute('aria-label',soundOn?'Sound on':'Sound off');}
$('sound').addEventListener('click',()=>{soundOn=!soundOn;initAudio();renderSound();if(soundOn)cue('tick');});
renderSound();

// ── Setup card ───────────────────────────────────────────────────────────
const roster:{name:string;skill:Skill}[]=[0,1,2,3].map(i=>({name:`Player ${i+1}`,skill:i===0?'human':'normal'}));
const checked=(name:string)=>(document.querySelector(`input[name=${name}]:checked`) as HTMLInputElement).value;
function renderRoster(){
 const n=Number(checked('players')),list=$('roster');
 while(list.children.length>n)list.lastElementChild!.remove();
 for(let i=list.children.length;i<n;i++){
  const row=h('div','seat-row');row.style.setProperty('--c',COLORS[i]!);
  const name=h('input','txt');name.id=`name-${i}`;name.value=roster[i]!.name;name.maxLength=14;name.autocomplete='off';name.spellcheck=false;name.setAttribute('aria-label',`Seat ${i+1} name`);
  name.addEventListener('input',()=>{roster[i]!.name=name.value;});
  const select=h('select','sel');select.id=`seat-${i}`;select.setAttribute('aria-label',`Seat ${i+1} player`);
  for(const skill of ['human','easy','normal','sharp'] as Skill[]){const o=h('option','',SKILL_LABEL[skill]);o.value=skill;select.append(o);}
  select.value=roster[i]!.skill;select.addEventListener('change',()=>{roster[i]!.skill=select.value as Skill;});
  row.append(h('span','seat-dot',String(i+1)),name,select);list.append(row);
 }
 const partners=$<HTMLInputElement>('partners');partners.disabled=n!==4;if(n!==4)partners.checked=false;$('partnersRow').classList.toggle('off',n!==4);
}
for(const input of document.querySelectorAll<HTMLInputElement>('input[name=players]'))input.addEventListener('change',renderRoster);
renderRoster();
{const hero=$('heroTiles');[[6,6],[3,5],[1,4]].forEach(([a,b],i)=>hero.append(tileEl(a!,b!,`h${i+1}`)));}

// ── Match state (the page keeps the core state; everything drawn comes from its views) ──
let state:State|null=null,modes:Skill[]=[],names:string[]=[],solo=-1,matchSeed=1,botStep=0;
let revealed:number|null=null,selected:number|null=null,anchorTile:number|null=null,pending:ReturnType<typeof setTimeout>|null=null;
let veilHoldUntil=0,shownScores:number[]=[],fresh=new Set<number>(),timedStart=-1,winnerTimer:ReturnType<typeof setTimeout>|null=null;
const boardEls=new Map<number,HTMLDivElement>();let zoom={from:1,to:1},stockEls:HTMLDivElement[]=[];
const label=(seat:number)=>names[seat]??`Seat ${seat+1}`;
// Avatar letter: the name's initial, or the seat number while the default “Player N” names are kept.
const initial=(seat:number)=>/^Player \d$/.test(label(seat))?String(seat+1):(label(seat)[0]??'?').toUpperCase();
const isHuman=(seat:number)=>modes[seat]==='human';
const partners=()=>state!.settings.partners;
const sideName=(seat:number)=>partners()?`${TEAMS[seat%2]!.name}`:label(seat);
const sideMembers=(seat:number)=>partners()?`${label(seat%2)} & ${label(seat%2+2)}`:label(seat);

function startMatch(seed:number){
 const n=Number(checked('players'));
 modes=[];names=[];for(let i=0;i<n;i++){modes.push($<HTMLSelectElement>(`seat-${i}`).value as Skill);names.push(($<HTMLInputElement>(`name-${i}`).value.trim()||`Player ${i+1}`).slice(0,14));}
 const settings={mode:checked('mode'),deal:$<HTMLSelectElement>('deal').value,partners:$<HTMLInputElement>('partners').checked,target:checked('target'),reserve:$<HTMLSelectElement>('reserve').value,opening:$<HTMLSelectElement>('opening').value,blocked:$<HTMLSelectElement>('blocked').value,teamPoints:$<HTMLSelectElement>('teamPoints').value};
 matchSeed=seed;botStep=0;cosmetic=(seed*2654435761)>>>0||1;
 state=init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:names[i]!,avatarId:'🙂',connected:true,bot:modes[i]!=='human'})),settings,seed,now:Date.now()});
 const humans=modes.flatMap((m,i)=>m==='human'?[i]:[]);solo=humans.length===1?humans[0]!:-1;
 revealed=null;selected=null;anchorTile=null;fresh.clear();shownScores=state.scores.map(()=>0);timedStart=-1;
 if(winnerTimer!==null)clearTimeout(winnerTimer);
 for(const el of boardEls.values())el.remove();boardEls.clear();
 $('setup').hidden=true;$('table').hidden=false;$('end').hidden=false;$('winner').hidden=true;$('roundEnd').hidden=true;
 buildSeats();render();
 if(moving())$('table').animate([{opacity:0,transform:'scale(1.02)'},{opacity:1,transform:'none'}],{duration:450,easing:EASE});
 dealBeat();schedule();
}
$('start').addEventListener('click',()=>{initAudio();matchSeed=Math.trunc(Number($<HTMLInputElement>('seed').value))||1;startMatch(matchSeed);});
$('end').addEventListener('click',()=>act(s=>reduce(s,{type:'vip',action:'end',now:Date.now()})));

// ── Transitions: apply an event, then animate what changed ──────────────
function act(step:(s:State)=>State){
 if(!state)return;const before=state,after=step(before);if(after===before)return;
 const from=measureSources(before,after);state=after;transition(before,after,from);
}
const sendAs=(seat:number,input:Input)=>act(s=>reduce(s,{type:'input',playerId:s.seats[seat]!,input,now:Date.now()}));
const send=(input:Input)=>sendAs(state!.turn,input);
const fire=(captured:number)=>act(s=>s.phase.startedAt!==captured?s:reduce(s,{type:'timer',phaseId:s.phase.id,startedAt:captured,now:Math.max(Date.now(),s.phase.deadline??0)}));
function measureSources(b:State,a:State):Rect|null{
 if(a.round!==b.round||a.board.length===b.board.length)return null;
 const t=(a.board[0]!.tile!==b.board[0]?.tile?a.board[0]:a.board.at(-1))!.tile;
 const rackTile=document.querySelector<HTMLElement>(`#hand [data-tile="${t}"]`);
 return rackTile?rect(rackTile):seatRect(b.turn);
}
function transition(b:State,a:State,from:Rect|null){
 if(a.round!==b.round){selected=null;anchorTile=null;fresh.clear();if(solo<0)revealed=null;else if(revealed!==null)revealed=solo;$('roundEnd').hidden=true;sweepBoard();render();dealBeat();schedule();return;}
 const played=a.board.length>b.board.length?(a.board[0]!.tile!==b.board[0]?.tile?a.board[0]!:a.board.at(-1)!):null;
 if(played&&b.board.length===0)anchorTile=played.tile;
 const drew=!played&&a.hands[b.turn]!.length>b.hands[b.turn]!.length?a.hands[b.turn]!.at(-1)!:null;
 const passed=!played&&drew===null&&a.passes>b.passes;
 if(a.turn!==b.turn||a.phase.id!=='play'){selected=null;fresh.clear();if(solo<0)revealed=null;}
 if(drew!==null&&rackSeat()===b.turn)fresh.add(drew);
 if(played&&a.phase.id==='play'&&solo<0&&isHuman(a.turn)&&a.turn!==b.turn&&moving())veilHoldUntil=performance.now()+620;
 render();
 if(played)flyPlay(played.tile,b.turn,from);
 if(drew!==null)flyDraw(drew,b.turn);
 if(passed)passBeat(b.turn);
 applyZoom();
 if(a.phase.id==='round-end'&&b.phase.id==='play')roundEndBeat(b,a,played!==null);
 if(a.phase.id==='done'&&b.phase.id!=='done'){
  if(b.phase.id==='play'&&a.last!==b.last&&a.history.length>b.history.length){roundEndBeat(b,a,played!==null);winnerTimer=setTimeout(()=>showWinner(),moving()?4200:1500);}
  else showWinner();
 }
 if(veilHoldUntil>performance.now())setTimeout(()=>{veilHoldUntil=0;renderDock();},640);
 schedule();
}

// ── Scheduling: bots, turn timers and the round-end countdown (fake-clock friendly) ──
// An all-computer table moves on a little before the core's 5 s round-end deadline; people get the full countdown.
const roundEndDue=(s:State)=>modes.every(m=>m!=='human')?s.phase.startedAt+4600:s.phase.deadline!;
function schedule(){
 if(pending!==null)clearTimeout(pending);pending=null;if(!state||state.phase.id==='done')return;
 const s=state,captured=s.phase.startedAt;
 if(s.phase.id==='round-end'){
  const bots=modes.every(m=>m!=='human');
  pending=setTimeout(()=>{if(!state||state.phase.startedAt!==captured)return;if(bots)send({type:'next'});else fire(captured);},Math.max(0,roundEndDue(s)-Date.now()));
  return;
 }
 const skill=modes[s.turn]!;
 if(skill!=='human')pending=setTimeout(()=>{if(!state||state.phase.startedAt!==captured)return;const i=game.bot.sampleInput(state,state.seats[state.turn]!,createRng(matchSeed+botStep++),skill);if(i)send(i);},s.board.length===0?1300:820);
 else pending=setTimeout(()=>fire(captured),Math.max(0,s.phase.deadline!-Date.now()));
}

// ── Rendering ────────────────────────────────────────────────────────────
function rackSeat():number|null{
 const s=state;if(!s||s.phase.id!=='play')return null;
 if(solo>=0)return revealed===solo?solo:null;
 return isHuman(s.turn)&&revealed===s.turn?s.turn:null;
}
function render(){
 if(!state)return;const s=state,v=tvView(s);
 $('roundPill').textContent=view==='tv'?`Round ${s.round} · first to ${s.settings.target}`:`R${s.round} · to ${s.settings.target}`;
 renderStatus();renderInfo(v.stockCount);renderSeats();renderBoard();renderBoneyard(v.stockCount);renderDock();renderSpot();
}
function renderStatus(){
 const s=state!,status=$('status'),msg=$('message');status.replaceChildren();
 if(s.phase.id==='done'){status.textContent='Match complete';const r=game.results(s)!;msg.textContent=`${r.winnerIds.map(id=>label(s.seats.indexOf(id))).join(' & ')} ${r.winnerIds.length>1?'share the win':'wins the match'}.`;return;}
 if(s.phase.id==='round-end'){status.textContent='Round complete';msg.textContent=s.last!.winner===null?'Blocked tie — no points.':`${sideName(s.last!.winner!)} scores ${s.last!.points}.`;return;}
 const t=s.turn,dot=h('span','chip-dot');dot.style.setProperty('--c',COLORS[t]!);
 const open=rackSeat()===t,ends=s.ends;let text:string,line:string;
 if(!isHuman(t)){text=`${label(t)} is thinking`;line=ends?`Open ends: ${ends[0]} and ${ends[1]}.`:'Opening the round.';}
 else if(!open){text=`${label(t)}’s turn`;line=solo>=0?'Reveal your tiles when you’re ready.':`Pass the screen to ${label(t)}.`;}
 else{
  text=`Your turn, ${label(t)}`;const legal=controllerView(s,s.seats[t]!).legal;
  if(legal.some(i=>i.type==='play'))line=s.forced!==null?`Lead with your ${tile(s.forced)[0]}–${tile(s.forced)[1]}.`:ends===null?'Lead any tile.':`Match a ${ends[0]}${ends[0]===ends[1]?'':` or a ${ends[1]}`} — tap a lit tile.`;
  else line=legal[0]?.type==='draw'?'Nothing matches — draw from the boneyard.':'Nothing matches — you have to pass.';
 }
 status.append(dot,document.createTextNode(text));msg.textContent=line;
}
function renderInfo(stock:number){
 const s=state!,ends=$('ends');ends.replaceChildren();
 const lab=h('span','',view==='tv'?'Ends':'');if(view==='tv')ends.append(lab);
 for(const v of s.ends??[null,null]){const d=h('span',`die${v===null?' empty':''}`);if(v!==null){d.innerHTML=dieSVG(v);d.setAttribute('aria-label',`open end ${v}`);}ends.append(d);}
 const yard=$('yard');yard.replaceChildren(h('span','mini-back'),h('b','',String(stock)),h('span','',view==='tv'?(s.settings.mode==='draw'?'in the boneyard':'out of play'):(s.settings.mode==='draw'?'left':'out')));
}

// Seats: chips around the table (TV) or a row above it (phone)
const seatEls:HTMLDivElement[]=[];
function buildSeats(){
 const layerEl=$('seatsLayer');layerEl.replaceChildren();seatEls.length=0;const s=state!,n=s.seats.length;
 for(let i=0;i<n;i++){
  const el=h('div',`seat pos-${POSITIONS[n]![i]}${isHuman(i)?'':' bot'}`);el.style.setProperty('--c',COLORS[i]!);el.dataset.seat=String(i);
  el.innerHTML=`<div class="top"><div class="avatar"><svg viewBox="0 0 76 76" aria-hidden="true"><circle cx="38" cy="38" r="36"/></svg>${initial(i)}</div><div class="who"><b><span></span><span class="thinking" aria-hidden="true"><i></i><i></i><i></i></span></b><small>${SKILL_LABEL[modes[i]!]} · <span class="tc"></span></small></div></div><div class="bottom"><div class="score"><b>0</b><small>pts</small></div><div class="backs"></div><span class="count"></span></div>`;
  el.querySelector('.who b span')!.textContent=label(i);
  if(s.settings.partners){const tag=h('span','team-tag',TEAMS[i%2]!.name);tag.style.setProperty('--tc',TEAMS[i%2]!.c);el.append(tag);}
  layerEl.append(el);seatEls.push(el);
 }
}
function renderSeats(){
 const s=state!,v=tvView(s),n=s.seats.length;
 seatEls.forEach((el,i)=>{
  if(view==='phone'){const w=(Math.min(innerWidth,600)-16-(n-1)*6)/n;el.style.left=`${8+i*(w+6)}px`;el.style.width=`${w}px`;el.style.right='auto';}else{el.style.left='';el.style.width='';el.style.right='';}
  const active=s.phase.id==='play'&&s.turn===i;el.classList.toggle('active',active);el.classList.toggle('waiting',s.phase.id==='play'&&!active);
  const scoreEl=el.querySelector<HTMLElement>('.score b')!;
  if(shownScores[i]!==s.scores[i]){const from=shownScores[i]??0,to=s.scores[i]!;shownScores[i]=to;setTimeout(()=>{countUp(scoreEl,from,to,1100);pop(scoreEl);},s.phase.id==='play'?0:moving()?1700:0);}
  else scoreEl.textContent=String(s.scores[i]);
  const count=v.counts[i]!,backs=el.querySelector<HTMLElement>('.backs')!,shown=Math.min(count,9);
  while(backs.children.length>shown)backs.lastElementChild!.remove();while(backs.children.length<shown)backs.append(h('span','mini-back'));
  const tiles=`${count} tile${count===1?'':'s'}`,countEl=el.querySelector<HTMLElement>('.count')!;countEl.textContent=view==='tv'?tiles:String(count);countEl.title=tiles;el.querySelector('.tc')!.textContent=tiles;
  const timed=active&&isHuman(i)&&s.phase.deadline!==null;
  if(timed&&timedStart!==s.phase.startedAt){timedStart=s.phase.startedAt;el.classList.remove('timed');void el.offsetWidth;el.style.setProperty('--dur',`${s.phase.deadline!-s.phase.startedAt}ms`);el.style.setProperty('--delay',`${-(Math.max(0,Date.now()-s.phase.startedAt))}ms`);el.classList.add('timed');}
  if(!timed)el.classList.remove('timed');
 });
}
function renderSpot(){
 const s=state!,spot=$('spot');if(s.phase.id!=='play'){spot.style.opacity='0';return;}
 const pos=POSITIONS[s.seats.length]![s.turn],w=feltInner.clientWidth,hh=feltInner.clientHeight;
 const [x,y]=pos==='S'?[w/2,hh*0.98]:pos==='N'?[w/2,hh*0.02]:pos==='W'?[w*0.02,hh/2]:[w*0.98,hh/2];
 spot.style.setProperty('--c',COLORS[s.turn]!);spot.style.transform=`translate(${x}px,${y}px)`;spot.style.opacity='1';
}

// The line of play: a snake that turns at the table edge; doubles lie crosswise.
const GAP=0.06;
function turn(m:Arm,ndx:number,ndy:number,across:number){m.cx=m.cx+m.dx*(across/2)-ndx*m.half;m.cy=m.cy+m.dy*(across/2)-ndy*m.half;m.dx=ndx;m.dy=ndy;}
function step(m:Arm,inner:number,outer:number,limit:number):Place{
 const double=inner===outer,along=double?1:2,across=double?2:1;
 if(m.dy===0){const end=m.cx+m.dx*along;if(m.dx>0?end>limit:end<-limit){m.lastH=m.dx;turn(m,0,m.turnSign,across);m.vertical=0;}}
 else if(m.vertical>=1){turn(m,-m.lastH,0,across);}
 const x=m.cx+m.dx*along/2,y=m.cy+m.dy*along/2;
 const rot=double?(m.dy===0?0:90):m.dx===1?-90:m.dx===-1?90:m.dy===1?0:180;
 m.cx+=m.dx*(along+GAP);m.cy+=m.dy*(along+GAP);m.half=across/2;if(m.dy!==0)m.vertical++;
 const sideways=Math.abs(rot)===90;return {x,y,rot,top:inner,bottom:outer,w:sideways?2:1,h:sideways?1:2};
}
function layoutChain(board:State['board'],anchor:number,limit:number){
 const places:Place[]=[];
 if(!board.length){const c={x:0,y:0,rot:-90,top:-1,bottom:-1,w:2,h:1};return {places,left:c,right:null as Place|null};}
 const a=board[anchor]!,dbl=a.a===a.b;
 places[anchor]=dbl?{x:0,y:0,rot:0,top:a.a,bottom:a.b,w:1,h:2}:{x:0,y:0,rot:-90,top:a.a,bottom:a.b,w:2,h:1};
 const right:Arm={cx:dbl?0.5+GAP:1+GAP,cy:0,dx:1,dy:0,half:dbl?1:0.5,lastH:1,turnSign:1,vertical:0};
 const left:Arm={cx:dbl?-0.5-GAP:-1-GAP,cy:0,dx:-1,dy:0,half:dbl?1:0.5,lastH:-1,turnSign:-1,vertical:0};
 for(let i=anchor+1;i<board.length;i++)places[i]=step(right,board[i]!.a,board[i]!.b,limit);
 for(let i=anchor-1;i>=0;i--)places[i]=step(left,board[i]!.b,board[i]!.a,limit);
 return {places,left:step({...left},board[0]!.a,9,limit),right:step({...right},board.at(-1)!.b,9,limit) as Place|null};
}
const placeTransform=(p:Place,u:number)=>`translate(${p.x*u-u/2}px,${p.y*u-u}px) rotate(${p.rot}deg)`;
function renderBoard(){
 const s=state!,board=s.board,u=U0[view];
 for(const [id,el] of boardEls)if(!board.some(t=>t.tile===id)){el.remove();boardEls.delete(id);}
 if(anchorTile===null||!board.some(t=>t.tile===anchorTile))anchorTile=board.length?board[Math.floor((board.length-1)/2)]!.tile:null;
 const L=layoutChain(board,board.findIndex(t=>t.tile===anchorTile),BOUND[view]);
 board.forEach((t,i)=>{const p=L.places[i]!;let el=boardEls.get(t.tile);
  if(!el){el=tileEl(p.top,p.bottom);el.dataset.tile=String(t.tile);boardEls.set(t.tile,el);layer.append(el);}
  el.className=`tile ${rotClass(p.rot)}`;el.style.width=`${u}px`;el.style.height=`${2*u}px`;el.style.transform=placeTransform(p,u);el.dataset.rot=String(p.rot);el.dataset.top=String(p.top);
 });
 // Where the next tile goes at each open end (live when the selected tile can go there).
 for(const g of [...layer.querySelectorAll('.ghost-slot')])g.remove();
 const slots:{side:'left'|'right';p:Place;value:number|null}[]=[];
 if(s.phase.id==='play'){if(!board.length)slots.push({side:'right',p:L.left,value:null});else{slots.push({side:'left',p:L.left,value:s.ends![0]});slots.push({side:'right',p:L.right!,value:s.ends![1]});}}
 const seat=rackSeat(),options=seat!==null&&s.turn===seat&&selected!==null?controllerView(s,s.seats[seat]!).legal.filter((i):i is Extract<Input,{type:'play'}>=>i.type==='play'&&i.tile===selected):[];
 for(const slot of slots){
  const g=h('button','ghost-slot');g.type='button';g.style.width=`${u}px`;g.style.height=`${2*u}px`;g.style.transform=placeTransform(slot.p,u);
  const b=h('b','',slot.value===null?'':String(slot.value));b.style.transform=`rotate(${-slot.p.rot}deg)`;b.style.fontSize=`${u*0.62}px`;g.append(b);
  const live=options.some(o=>o.side===slot.side)&&options.length>1;g.classList.toggle('live',live);g.tabIndex=live?0:-1;
  g.setAttribute('aria-label',live?`Play on the ${slot.side} end`:'Open end');if(!live)g.setAttribute('aria-hidden','true');
  if(live)g.addEventListener('click',()=>{const o=options.find(x=>x.side===slot.side);if(o)playInput(o);});
  layer.prepend(g);
 }
 // Fit the whole snake (plus next slots) on the felt, keeping the opener centred.
 let hw=1.2,hh=1.2;for(const p of [...L.places,L.left,...(L.right?[L.right]:[])]){if(!p)continue;hw=Math.max(hw,Math.abs(p.x)+p.w/2);hh=Math.max(hh,Math.abs(p.y)+p.h/2);}
 const strip=view==='tv'?230:0,availW=feltInner.clientWidth-strip-(view==='tv'?40:16),availH=feltInner.clientHeight-(view==='tv'?48:20);
 const k=Math.min(1,availW/((hw*2+0.5)*u),availH/((hh*2+0.5)*u));
 boardBox.style.setProperty('--bx',`${strip+(feltInner.clientWidth-strip)/2}px`);
 if(Math.abs(k-zoom.to)>0.001){zoom={from:zoom.to,to:k};}
 layer.style.transform=`scale(${k})`;
}
function applyZoom(){if(zoom.from!==zoom.to){if(moving())layer.animate([{transform:`scale(${zoom.from})`},{transform:`scale(${zoom.to})`}],{duration:520,easing:EASE});zoom={from:zoom.to,to:zoom.to};}}
function renderBoneyard(count:number){
 const yard=$('boneyard');if(view!=='tv'){stockEls=[];yard.replaceChildren();return;}
 if(!yard.querySelector('.stock-label')){yard.replaceChildren();stockEls=[];const lab=h('span','stock-label');yard.append(lab);}
 yard.querySelector('.stock-label')!.textContent=count===0?(state!.settings.mode==='draw'?'Boneyard empty':''):state!.settings.mode==='draw'?'Boneyard':'Out of play';
 while(stockEls.length>count)stockEls.pop()!.remove();
 while(stockEls.length<count){const i=stockEls.length;let seed=(i+1)*2654435761>>>0;const r=()=>{seed=(Math.imul(seed^(seed>>>13),0x5bd1e995)+0x9e3779b9)>>>0;return seed/4294967296;};
  const el=tileEl(null,0,'stock-tile');const col=i%3,row=Math.floor(i/3);el.style.transform=`translate(${10+col*50+r()*14}px,${16+row*54+r()*18}px) rotate(${(r()-.5)*44}deg)`;yard.append(el);stockEls.push(el);}
 yard.style.opacity=state!.settings.mode==='draw'?'1':'.7';
}

// The dock: the private rack of whoever may look, actions, and the pass-the-screen veil.
function renderDock(){
 const s=state!,hand=$('hand'),actions=$('actions'),veil=$('veil'),lab=$('rackLabel');hand.replaceChildren();actions.replaceChildren();
 const playing=s.phase.id==='play',t=s.turn,seat=rackSeat();
 const needVeil=playing&&solo<0&&isHuman(t)&&revealed!==t&&veilHoldUntil<=performance.now();
 if(needVeil&&veil.hidden)showVeil(t);else if(!needVeil&&!veil.hidden)veil.hidden=true;
 if(!playing){lab.textContent='';return;}
 if(seat===null){
  if(solo>=0){
   lab.textContent=`${label(solo)}’s tiles`;const backs=h('div','hidden-rack');for(let i=0;i<s.hands[solo]!.length;i++)backs.append(h('span','mini-back'));hand.append(backs);
   const b=h('button','btn primary reveal-inline',view==='tv'?'Reveal my tiles':'Show tiles');b.type='button';b.setAttribute('aria-label',`${label(solo)} — reveal hand`);b.addEventListener('click',()=>reveal(solo));hand.append(b);
  }else lab.textContent=isHuman(t)?'':`${label(t)} is choosing a tile…`;
  return;
 }
 const v=controllerView(s,s.seats[seat]!),mine=t===seat,legal=mine?v.legal:[];
 lab.textContent=solo>=0?`Your tiles · ${v.hand.length}`:`${label(seat)}’s tiles · ${v.hand.length}`;
 const n=v.hand.length,width=(view==='tv'?hand.clientWidth||1100:Math.min(innerWidth,600)-32);
 const hw=view==='tv'?Math.max(40,Math.min(66,(width-48-(n-1)*14)/n)):Math.max(30,Math.min(42,(width-16-(n-1)*6)/n));hand.style.setProperty('--hw',`${hw}px`);
 for(const id of v.hand){
  const [a,b]=tile(id),opts=legal.filter((i):i is Extract<Input,{type:'play'}>=>i.type==='play'&&i.tile===id);
  const btn=h('button',`hand-tile${opts.length?' playable':mine?' dim':' idle'}${selected===id?' selected':''}${fresh.has(id)?' fresh':''}`);btn.type='button';btn.dataset.tile=String(id);
  btn.setAttribute('aria-label',opts.length?`Play ${a}–${b}`:`${a}–${b}${mine?', no match':''}`);if(!opts.length)btn.setAttribute('aria-disabled','true');
  btn.append(tileEl(a,b));btn.addEventListener('click',()=>tapTile(id,opts));hand.append(btn);
 }
 if(!mine)return;
 if(selected!==null){
  const opts=legal.filter((i):i is Extract<Input,{type:'play'}>=>i.type==='play'&&i.tile===selected);
  if(opts.length>1){const picks=h('div','side-picks');for(const o of opts){const b=h('button','btn primary',o.side==='left'?`◀ Left ${s.ends![0]}`:`Right ${s.ends![1]} ▶`);b.type='button';b.setAttribute('aria-label',`Play on the ${o.side} end`);b.addEventListener('click',()=>playInput(o));picks.append(b);}actions.append(picks);}
 }
 for(const i of legal)if(i.type==='draw'||i.type==='pass'){const b=h('button','btn primary pulse',i.type==='draw'?'Draw a tile':'Pass');b.type='button';b.addEventListener('click',()=>send(i));actions.append(b);}
 if(solo<0){const b=h('button','btn quiet','Hide my tiles');b.type='button';b.addEventListener('click',()=>{revealed=null;selected=null;render();});actions.append(b);}
}
function showVeil(seat:number){
 const veil=$('veil'),inner=$('privacy');inner.replaceChildren();inner.style.setProperty('--c',COLORS[seat]!);
 const lock=h('div','lock',initial(seat));const title=h('h2','',`Pass to ${label(seat)}`);const p=h('p','',`Tap when only ${label(seat)} can see the screen.`);
 const b=h('button','btn primary',`I’m ${label(seat)} — reveal hand`);b.type='button';b.addEventListener('click',()=>reveal(seat));
 inner.append(h('p','eyebrow','Private tiles'),lock,title,p,b);veil.hidden=false;
 if(moving())veil.animate([{opacity:0},{opacity:1}],{duration:280,easing:EASE});
}
function reveal(seat:number){
 initAudio();revealed=seat;selected=null;const veil=$('veil');
 if(!veil.hidden&&moving()){const a=veil.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-30px)'}],{duration:260,easing:EASE});a.onfinish=()=>{veil.hidden=true;};}else veil.hidden=true;
 render();
 if(moving())[...document.querySelectorAll<HTMLElement>('#hand .hand-tile .tile')].forEach((el,i)=>el.animate([{transform:'perspective(600px) rotateY(180deg)',opacity:0},{transform:'perspective(600px) rotateY(0)',opacity:1}],{duration:380,delay:i*55,easing:EASE,fill:'backwards'}));
}
function tapTile(id:number,opts:Extract<Input,{type:'play'}>[]){
 const s=state!;if(!opts.length){const el=document.querySelector<HTMLElement>(`#hand [data-tile="${id}"]`);if(el&&s.turn===rackSeat()&&moving())el.animate([{transform:'translateX(0)'},{transform:'translateX(-7px)'},{transform:'translateX(7px)'},{transform:'translateX(0)'}],{duration:260});return;}
 const sameEnds=s.ends!==null&&s.ends[0]===s.ends[1];
 if(opts.length===1||sameEnds){playInput(opts.find(o=>o.side==='right')??opts[0]!);return;}
 selected=selected===id?null:id;render();
}
function playInput(i:Input){selected=null;send(i);}

// ── Motion beats ─────────────────────────────────────────────────────────
const rect=(el:Element|null):Rect|null=>{if(!el)return null;const r=el.getBoundingClientRect();return r.width||r.height?{left:r.left,top:r.top,width:r.width,height:r.height}:null;};
function seatSource(seat:number):HTMLElement|null{const el=seatEls[seat];if(!el)return null;return view==='tv'?el.querySelector<HTMLElement>('.backs > :last-child')??el:el;}
// Where a face-down tile lands at (or leaves from) a seat: its newest back on the TV, a tile-sized spot on a phone chip.
function seatRect(seat:number):Rect|null{const r=rect(seatSource(seat));if(!r||view==='tv')return r;const w=14;return {left:r.left+r.width/2-w/2,top:r.top+r.height/2-w,width:w,height:w*2};}
let flying=0;
function twoSided(top:number,bottom:number,w:number,hgt:number):HTMLDivElement{
 const box=h('div');box.style.cssText=`position:absolute;left:0;top:0;width:${w}px;height:${hgt}px;transform-style:preserve-3d`;
 const front=tileEl(top,bottom),back=tileEl(null);for(const f of [front,back]){f.style.width='100%';f.style.height='100%';f.style.backfaceVisibility='hidden';}
 back.style.transform='rotateY(180deg)';box.append(front,back);return box;
}
function flight(clone:HTMLElement,from:Rect,to:Rect,o:{w:number;h:number;rot0:number;rot1:number;flip0:number;flip1:number;ms:number;lift:number}){
 const fx0=from.left+from.width/2,fy0=from.top+from.height/2,fx1=to.left+to.width/2,fy1=to.top+to.height/2;
 const s0=Math.max(from.width,from.height)/Math.max(o.w,o.h);const side=Math.abs(o.rot1%180)===90;
 const sx1=to.width/(side?o.h:o.w),sy1=to.height/(side?o.w:o.h);
 const at=(x:number,y:number,sx:number,sy:number,r:number,f:number)=>`translate(${x-o.w/2}px,${y-o.h/2}px) scale(${sx},${sy}) perspective(700px) rotate(${r}deg) rotateY(${f}deg)`;
 const mx=(fx0+fx1)/2,my=Math.min(fy0,fy1)-o.lift,ms=Math.max(s0,(sx1+sy1)/2)*1.12;
 clone.style.zIndex='5';fx.append(clone);flying++;
 const anim=clone.animate([
  {transform:at(fx0,fy0,s0,s0,o.rot0,o.flip0),offset:0},
  {transform:at(mx,my,ms,ms,(o.rot0+o.rot1)/2,(o.flip0+o.flip1)/2),offset:.48},
  {transform:at(fx1,fy1,sx1*1.05,sy1*1.05,o.rot1,o.flip1),offset:.84},
  {transform:at(fx1,fy1,sx1,sy1,o.rot1,o.flip1),offset:1}],{duration:o.ms,easing:'cubic-bezier(.35,.65,.4,1)'});
 return new Promise<void>(done=>{const end=()=>{flying--;clone.remove();done();};anim.onfinish=end;anim.oncancel=end;});
}
function settle(el:HTMLElement){
 const base=el.style.transform;el.style.opacity='';
 if(moving()){el.animate([{transform:`${base} scale(1.1)`},{transform:base}],{duration:280,easing:SPRING});
  const ring=h('div');const r=el.getBoundingClientRect();ring.style.cssText=`position:absolute;left:${r.left+r.width/2-60}px;top:${r.top+r.height/2-30}px;width:120px;height:60px;border-radius:50%;border:3px solid #ffffff55`;fx.append(ring);
  ring.animate([{transform:'scale(.5)',opacity:.8},{transform:'scale(1.7)',opacity:0}],{duration:460,easing:EASE}).onfinish=()=>ring.remove();}
 cue('clack');
}
function flyPlay(id:number,seat:number,from:Rect|null){
 const target=boardEls.get(id);if(!target)return;
 if(!moving()||!from||flying>10){settle(target);return;}
 const to=rect(target);if(!to){settle(target);return;}
 const [a,b]=tile(id),top=Number(target.dataset.top),rot=Number(target.dataset.rot);
 const w=U0[view]*zoom.to*stageScale,hgt=2*w;const startRot=top===a?0:180;let endRot=rot;while(endRot-startRot>180)endRot-=360;while(endRot-startRot<-180)endRot+=360;
 const fromRack=!!document.querySelector(`#hand [data-tile="${id}"]`)||(rackSeat()===seat);
 const clone=twoSided(a,b,w,hgt);target.style.opacity='0';
 const human=isHuman(seat)&&fromRack;
 flight(clone,from,to,{w,h:hgt,rot0:startRot,rot1:endRot,flip0:human?0:180,flip1:0,ms:520,lift:view==='tv'?140:60}).then(()=>{if(target.isConnected)settle(target);});
}
function flyDraw(id:number,seat:number){
 const src=stockEls.at(-1)??$('yard').querySelector('.mini-back'),from=rect(src??$('yard'));cue('draw');
 const own=rackSeat()===seat,target=own?document.querySelector<HTMLElement>(`#hand [data-tile="${id}"]`):null;
 if(!moving()||!from||flying>10||(own&&!target))return;
 const to=target?rect(target):seatRect(seat);if(!to)return;
 const [a,b]=tile(id),w=to.width||40,hgt=w*2,clone=twoSided(a,b,w,hgt);
 if(target)target.style.opacity='0';
 flight(clone,from,to,{w,h:hgt,rot0:-20,rot1:0,flip0:180,flip1:own?0:180,ms:480,lift:80}).then(()=>{if(!target)return;target.style.opacity='';target.animate([{transform:'translateY(-10px)'},{transform:'none'}],{duration:260,easing:SPRING});});
}
function passBeat(seat:number){
 cue('pass');toast(`${label(seat)} can’t match — pass`);
 const el=seatEls[seat];if(el&&moving())el.animate([{translate:'0 0'},{translate:'-8px 0'},{translate:'8px 0'},{translate:'0 0'}],{duration:360,easing:EASE});
}
function sweepBoard(){
 if(!moving()){for(const el of boardEls.values())el.remove();boardEls.clear();return;}
 const center=rect(feltInner);let i=0;
 for(const el of boardEls.values()){const r=rect(el);if(r&&center){const clone=el.cloneNode(true) as HTMLElement;clone.style.cssText=`position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;transform:none`;clone.className='tile';fx.append(clone);
   const dx=center.left+center.width*0.12-r.left,dy=center.top+center.height/2-r.top;
   clone.animate([{transform:'none',opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${(rand()-.5)*80}deg) scale(.5)`,opacity:0}],{duration:420,delay:i*12,easing:EASE,fill:'backwards'}).onfinish=()=>clone.remove();}
  el.remove();i++;}
 boardEls.clear();
}
function dealBeat(){
 if(!state||!moving())return;const s=state,from=rect($('feltInner'));if(!from)return;
 const cw=view==='tv'?40:24,c={left:from.left+from.width/2-cw/2,top:from.top+from.height/2-cw,width:cw,height:cw*2};let k=0;
 const max=Math.max(...s.hands.map(h=>h.length));
 for(let r=0;r<max;r++)for(let seat=0;seat<s.seats.length;seat++){
  if(r>=s.hands[seat]!.length||rackSeat()===seat)continue;const to=seatRect(seat);if(!to)continue;
  const w=view==='tv'?44:24,clone=twoSided(0,0,w,w*2);clone.style.opacity='0';
  setTimeout(()=>{clone.style.opacity='';flight(clone,c,{left:to.left,top:to.top,width:to.width,height:to.height},{w,h:w*2,rot0:(rand()-.5)*60,rot1:0,flip0:180,flip1:180,ms:420,lift:50});if(k%3===0)cue('tick');},(k++)*45);
 }
}
function toast(text:string){const t=h('div','toast',text);$('table').append(t);
 if(moving()){t.animate([{opacity:0,transform:'translate(-50%,10px)'},{opacity:1,transform:'translate(-50%,0)',offset:.15},{opacity:1,transform:'translate(-50%,0)',offset:.8},{opacity:0,transform:'translate(-50%,-10px)'}],{duration:1500,easing:EASE}).onfinish=()=>t.remove();}
 else setTimeout(()=>t.remove(),1500);}
function pop(el:HTMLElement){if(moving())el.animate([{transform:'scale(1)'},{transform:'scale(1.3)'},{transform:'scale(1)'}],{duration:480,easing:SPRING});}
function countUp(el:HTMLElement,from:number,to:number,ms:number,prefix=''){
 if(!moving()||from===to){el.textContent=prefix+to;return;}
 const t0=performance.now();const tick=(now:number)=>{const p=Math.min(1,Math.max(0,(now-t0)/ms)),e=1-Math.pow(1-p,3);el.textContent=prefix+Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(tick);};requestAnimationFrame(tick);
}

// Round end: hands turn face up, pips count, points fly to the scoreboard.
function roundEndBeat(b:State,a:State,afterPlay:boolean){
 const last=a.last!,c=last.winner===null?'#b3b7d9':COLORS[last.winner]!;
 const stamp=h('p','stamp',last.winner===null?'Blocked!':last.blocked?'Blocked!':'Domino!');stamp.style.setProperty('--c',c);
 const delay=moving()?(afterPlay?560:200):0;
 setTimeout(()=>{
  if(!state||state.round!==a.round)return;cue(last.winner===null?'pass':'score');
  if(moving()){$('table').append(stamp);stamp.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.5) rotate(-6deg)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.08) rotate(-3deg)',offset:.3},{opacity:1,transform:'translate(-50%,-50%) scale(1) rotate(-3deg)',offset:.75},{opacity:0,transform:'translate(-50%,-60%) scale(.96) rotate(-3deg)'}],{duration:1000,easing:EASE}).onfinish=()=>stamp.remove();}
  setTimeout(()=>showRoundEnd(b,a),moving()?650:0);
 },delay);
}
function showRoundEnd(b:State,a:State){
 if(!state||state.round!==a.round||state.phase.id==='play')return;
 const sheet=$('roundEnd'),v=tvView(a),last=a.last!,reveal=v.reveal!,n=a.seats.length;sheet.replaceChildren();
 const winnerSide=last.winner===null?null:last.winner;
 const title=winnerSide===null?'Blocked — a tie':last.blocked?`Blocked! ${sideName(winnerSide)} wins the round`:`${label(winnerSide)} dominoes!`;
 const sub=winnerSide===null?'Equal lightest hands — nobody scores this round.':a.settings.partners?`${sideMembers(winnerSide)} score ${last.points}${last.blocked?' with the lightest hands':''} — ${a.settings.teamPoints==='all'?'every pip left on the table':'the other team’s pips'}.`:last.blocked?(a.settings.blocked==='difference'?`Lightest hand: ${last.points} points — opponents’ pips minus their own.`:`Lightest hand: ${last.points} points — the pips left with opponents.`):`${last.points} points — every pip left in the other hands.`;
 sheet.append(h('p','eyebrow',`Round ${a.round}`),h('h2','',title),h('p','sub',sub));
 const tally=h('div','tally');
 for(let i=0;i<n;i++){
  const won=winnerSide!==null&&(a.settings.partners?i%2===winnerSide%2:i===winnerSide);
  const row=h('div',`tally-row${won?' win':''}`);row.style.setProperty('--c',COLORS[i]!);
  const nm=h('div','nm');nm.append(h('i'),h('span','',label(i)));const tiles=h('div','tally-tiles');
  if(!reveal.hands[i]!.length)tiles.append(h('span','out','Out!'));
  for(const t of reveal.hands[i]!){const [x,y]=tile(t);tiles.append(tileEl(x,y));}
  const pp=h('div','pp');const num=h('span','','0');pp.append(num,h('small','','pips'));row.append(nm,tiles,pp);tally.append(row);
  setTimeout(()=>countUp(num,0,reveal.pips[i]!,700),moving()?300+i*90:0);
  if(moving())[...tiles.querySelectorAll('.tile')].forEach((el,j)=>el.animate([{transform:'perspective(400px) rotateY(180deg)',opacity:0},{transform:'none',opacity:1}],{duration:340,delay:120+i*90+j*45,easing:EASE,fill:'backwards'}));
 }
 sheet.append(tally);
 const standings=h('div','standings'),sides=a.settings.partners?[0,1]:a.seats.map((_,i)=>i);
 for(const side of sides){
  const st=h('div','stand');st.style.setProperty('--c',a.settings.partners?TEAMS[side]!.c:COLORS[side]!);
  const name=h('span');name.append(h('b','',a.settings.partners?TEAMS[side]!.name:label(side)));if(a.settings.partners)name.append(h('small','',sideMembers(side)));
  const track=h('div','bar-track'),fill=h('div','bar-fill');track.append(fill);
  const before=b.scores[side]!,after=a.scores[side]!,tot=h('div','tot'),num=h('span','',String(before));tot.append(num);
  if(after>before)tot.append(h('small','',`+${after-before}`));
  const ratio=(x:number)=>Math.min(1,x/a.settings.target);fill.style.transform=`scaleX(${ratio(after)})`;
  if(moving()&&after!==before){fill.animate([{transform:`scaleX(${ratio(before)})`},{transform:`scaleX(${ratio(after)})`}],{duration:900,delay:1100,easing:EASE,fill:'backwards'});setTimeout(()=>{countUp(num,before,after,900);pop(num);},1100);}else num.textContent=String(after);
  st.append(name,track,tot);standings.append(st);
 }
 sheet.append(standings);
 const foot=h('div','sheet-foot'),left=h('div','countdown');
 if(a.phase.id==='round-end'){
  const ms=Math.max(0,roundEndDue(a)-Date.now());
  left.innerHTML='<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="20" stroke="#ffffff22"/><circle class="ring" cx="24" cy="24" r="20"/></svg>';left.style.setProperty('--dur',`${ms}ms`);left.append(document.createTextNode(`Round ${a.round+1} deals itself in ${Math.round(ms/1000)} s`));
  const next=h('button','btn primary','Next round');next.type='button';next.addEventListener('click',()=>{const human=modes.indexOf('human');if(human>=0)sendAs(human,{type:'next'});else send({type:'next'});});foot.append(left,next);
 }else{left.textContent=`Target ${a.settings.target} reached.`;const go=h('button','btn primary','See the winner');go.type='button';go.addEventListener('click',()=>showWinner());foot.append(left,go);}
 sheet.append(foot);sheet.hidden=false;
 if(moving())sheet.animate([{opacity:0,transform:'translateY(60px) scale(.97)'},{opacity:1,transform:'none'}],{duration:480,easing:EASE});
}

// Match end: a real winner moment (name, burst, podium), skippable.
function showWinner(){
 if(!state||state.phase.id!=='done')return;if(winnerTimer!==null){clearTimeout(winnerTimer);winnerTimer=null;}
 const s=state,r=game.results(s)!,box=$('winner');$('roundEnd').hidden=true;box.replaceChildren();
 const seats=r.winnerIds.map(id=>s.seats.indexOf(id)),lead=seats[0]!;
 const names=s.settings.partners&&seats.length===2&&seats[0]!%2===seats[1]!%2?`${TEAMS[lead%2]!.name}`:seats.map(label).join(' & ');
 const tie=!(s.settings.partners&&seats.every(x=>x%2===lead%2))&&seats.length>1;
 const inner=h('div','inner');inner.style.setProperty('--c',s.settings.partners?TEAMS[lead%2]!.c:COLORS[lead]!);
 inner.innerHTML='<svg class="crown" viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="crownG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset="1" stop-color="#ffb703"/></linearGradient></defs><path d="M14 92 8 34l30 24 22-38 22 38 30-24-6 58z" fill="url(#crownG)" stroke="#8a5a00" stroke-width="3" stroke-linejoin="round"/><rect x="14" y="92" width="92" height="14" rx="5" fill="#ffb703" stroke="#8a5a00" stroke-width="3"/><circle cx="60" cy="62" r="7" fill="#ff5d8f"/></svg>';
 inner.append(h('p','eyebrow',tie?'A shared win':'Match winner'),h('h2','',tie?`${names} tie!`:`${names} ${s.settings.partners&&!tie?'win!':'wins!'}`));
 const best=Math.max(...s.scores);inner.append(h('p','sub',`${s.settings.partners&&!tie?`${sideMembers(lead)} · `:''}${best} points after ${s.history.length} round${s.history.length===1?'':'s'}`));
 const podium=h('div','podium');
 const entries=(s.settings.partners?[0,1].map(t=>({name:TEAMS[t]!.name,sub:sideMembers(t),score:s.scores[t]!,c:TEAMS[t]!.c})):s.seats.map((_,i)=>({name:label(i),sub:SKILL_LABEL[modes[i]!],score:s.scores[i]!,c:COLORS[i]!}))).sort((x,y)=>y.score-x.score);
 const order=entries.length>=3?[1,0,2,...entries.slice(3).map((_,i)=>i+3)]:[0,1];
 order.forEach(idx=>{const e=entries[idx];if(!e)return;const rank=1+entries.filter(o=>o.score>e.score).length;const st=h('div',`step p${Math.min(4,idx+1)}`);st.style.borderTopColor=e.c;st.append(h('em','',rank===1?'1ST':rank===2?'2ND':rank===3?'3RD':'4TH'),h('b','',e.name),h('span','',String(e.score)));podium.append(st);});
 inner.append(podium);
 const btns=h('div','btns'),again=h('button','btn primary','Rematch'),setup=h('button','btn second','New table');again.type=setup.type='button';
 again.addEventListener('click',()=>{box.hidden=true;startMatch(matchSeed+1);});
 setup.addEventListener('click',()=>{box.hidden=true;state=null;if(pending!==null)clearTimeout(pending);$('table').hidden=true;$('end').hidden=true;$('setup').hidden=false;$('roundPill').textContent=view==='tv'?'2–4 players · offline':'2–4 players';});
 btns.append(again,setup);inner.append(btns);box.append(inner);box.hidden=false;cue('win');
 if(moving()){
  const anims:Animation[]=[];
  anims.push(box.animate([{opacity:0},{opacity:1}],{duration:400,easing:EASE}));
  anims.push(inner.querySelector('.crown')!.animate([{transform:'translateY(-60px) scale(.4) rotate(-20deg)',opacity:0},{transform:'translateY(6px) scale(1.08) rotate(4deg)',opacity:1,offset:.7},{transform:'none',opacity:1}],{duration:800,delay:150,easing:EASE,fill:'backwards'}));
  anims.push(inner.querySelector('h2')!.animate([{transform:'scale(.6)',opacity:0},{transform:'scale(1.06)',opacity:1,offset:.65},{transform:'none',opacity:1}],{duration:700,delay:250,easing:EASE,fill:'backwards'}));
  [...podium.children].forEach((el,i)=>anims.push(el.animate([{transform:'scaleY(0)',opacity:0},{transform:'none',opacity:1}],{duration:600,delay:700+i*140,easing:SPRING,fill:'backwards'})));
  anims.push(...confetti(s.settings.partners?[TEAMS[lead%2]!.c,'#fff','#ffd166']:[COLORS[lead]!,'#ffd166','#fff','#4cc9f0']));
  box.addEventListener('click',e=>{if((e.target as HTMLElement).closest('button'))return;for(const a of anims)if(a.playState==='running')a.finish();},{once:true});
 }
}
function confetti(colors:string[]):Animation[]{
 const out:Animation[]=[],W=innerWidth,H=innerHeight,count=view==='tv'?90:45;
 for(let i=0;i<count;i++){const c=h('i','confetti');c.style.background=colors[i%colors.length]!;fx.append(c);
  const x0=W/2+(rand()-.5)*W*0.16,y0=H*0.4,x1=x0+(rand()-.5)*W*1.1,y1=H*(1.05+rand()*0.2),peak=y0-(H*0.15+rand()*H*0.3),rz=(rand()-.5)*900;
  const a=c.animate([{transform:`translate(${x0}px,${y0}px) rotate(0deg) scale(.4)`,opacity:1},{transform:`translate(${(x0*0.4+x1*0.6)}px,${peak}px) rotate(${rz/2}deg) rotateY(${rand()*360}deg) scale(1)`,opacity:1,offset:.32},{transform:`translate(${x1}px,${y1}px) rotate(${rz}deg) rotateY(${rand()*720}deg) scale(.9)`,opacity:.2}],{duration:2400+rand()*1200,delay:rand()*220,easing:'cubic-bezier(.15,.7,.35,1)',fill:'backwards'});
  a.onfinish=()=>c.remove();a.oncancel=()=>c.remove();out.push(a);}
 return out;
}

const idlePill=()=>{if(!state)$('roundPill').textContent=view==='tv'?'2–4 players · offline':'2–4 players';};idlePill();
addEventListener('resize',()=>{chooseView();idlePill();if(state){render();applyZoom();}});
reducedQuery.addEventListener('change',()=>{if(state)render();});
