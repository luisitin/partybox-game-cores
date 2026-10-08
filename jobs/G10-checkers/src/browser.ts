import {init,reduce,tvView,controllerView,results,turnId} from './core.js';
import type {State,Input} from './core.js';
import type {GameEvent} from '../../../contract/contract';
import type {BotSkill} from '../../../contract/constants';
import type {RngState} from '../../../contract/rng';
import type {SearchReport} from './bots.js';
import {geometry} from './moves.js';
declare const G10_WORKER_SOURCE:string;
const el=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const text=(id:string,value:string)=>{const node=el(id);if(node.textContent!==value)node.textContent=value;};
const show=(id:string,visible:boolean)=>{el(id).hidden=!visible;};
const select=(id:string)=>el<HTMLSelectElement>(id).value;
type Controller='human'|BotSkill;
let state:State|null=null,controllers:Record<string,Controller>={},draft:number[]=[],cachedState:State|null=null;
let legal:ReturnType<typeof controllerView>['legalMoves']=[],squares:HTMLButtonElement[]=[],boardVariant='';
let worker:Worker|null=null,workerUrl:string|null=null,pending:{id:number;state:State}|null=null,requestId=0;
let botCursor:RngState={seed:20261008,step:0},botDue=Infinity,forcedStep=false,virtualNow:number|null=null;
let pace='1500',notice='',timerKey='';
const now=()=>virtualNow??performance.now();
const crown='<svg aria-hidden="true" viewBox="0 0 40 32"><path d="M4 9 12 16 20 4 28 16 36 9 31 27H9Z"/><path d="M9 29H31V32H9Z"/></svg>';
function stopWorker(){if(worker)worker.terminate();worker=null;pending=null;if(workerUrl)URL.revokeObjectURL(workerUrl);workerUrl=null;}
function humanTurn(){return !!state&&controllers[turnId(state)]==='human';}
function currentLegal(){
  if(state!==cachedState){cachedState=state;legal=state?controllerView(state,turnId(state)).legalMoves:[];}
  return legal;
}
function schedule(){botDue=now()+(pace==='manual'?Infinity:Number(pace));forcedStep=false;}
function install(next:State){
  if(next===state)return false;
  stopWorker();state=next;cachedState=null;draft=[];notice='';timerKey='';schedule();render();return true;
}
function event(value:GameEvent<Input>){if(state)return install(reduce(state,value));return false;}
function act(input:Input){if(state)return event({type:'input',playerId:turnId(state),input,now:now()});return false;}
function setup(){stopWorker();state=null;cachedState=null;draft=[];notice='';show('setup',true);show('table',false);show('result',false);}
function start(){
  const players=[0,1].map(index=>({id:'seat-'+index,name:el<HTMLInputElement>('name-'+index).value.trim()||'Player '+(index+1),avatarId:'checkers-'+index,connected:true}));
  controllers=Object.fromEntries(players.map((player,index)=>[player.id,select('seat-'+index) as Controller]));
  pace=select('pace-setup');el<HTMLSelectElement>('pace').value=pace;botCursor={seed:20261008,step:0};
  install(init({players,seed:20261008,now:now(),settings:{variant:select('variant'),drawPolicy:select('draw-policy'),repetition:true,turnSeconds:Number(el<HTMLInputElement>('turn-seconds').value)}}));
}
function ensureBoard(){
  if(!state||boardVariant===state.variant)return;
  boardVariant=state.variant;const g=geometry(state.variant),board=el('board');board.replaceChildren();squares=[];
  board.style.gridTemplateColumns='repeat('+g.size+',1fr)';
  for(let row=0;row<g.size;row++)for(let col=0;col<g.size;col++){
    if((row+col)%2===0){const cell=document.createElement('div');cell.className='square';cell.setAttribute('aria-hidden','true');board.append(cell);continue;}
    const index=row*(g.size/2)+Math.floor(col/2),button=document.createElement('button');
    button.type='button';button.className='square dark';button.dataset.square=String(index);button.addEventListener('click',()=>chooseSquare(index));
    squares[index]=button;board.append(button);
  }
}
function chooseSquare(square:number){
  if(!state||!humanTurn()||state.phase.paused||state.phase.id!=='move')return;
  const moves=currentLegal(),targets=moves.filter(move=>draft.every((value,index)=>move.path[index]===value));
  if(draft.length&&targets.some(move=>move.path[draft.length]===square)){
    draft=[...draft,square];const candidates=moves.filter(move=>draft.every((value,index)=>move.path[index]===value));
    const complete=candidates.find(move=>move.path.length===draft.length);
    if(complete){act({type:'move',path:[...complete.path]});return;}
    notice='Continue the jump: choose a highlighted landing square.';
  }else if(moves.some(move=>move.path[0]===square)){draft=[square];notice='Choose a highlighted landing square.';}
  else{notice=moves[0]?.captures.length?'A capture is required. Choose a highlighted piece.':'Choose a highlighted piece, then its destination.';}
  renderBoard();renderControls();
}
function renderBoard(){
  if(!state)return;ensureBoard();const moves=currentLegal(),enabled=humanTurn()&&state.phase.id==='move'&&!state.phase.paused;
  const origins=new Set(moves.map(move=>move.path[0]));
  const candidates=moves.filter(move=>draft.every((value,index)=>move.path[index]===value));
  const targets=new Set(draft.length?candidates.map(move=>move.path[draft.length]).filter(value=>value!==undefined):[]);
  const last=new Set(state.lastMove?.move.path??[]);
  for(let index=0;index<squares.length;index++){
    const button=squares[index],piece=state.board[index];
    const className='square dark'+(last.has(index)?' last':'')+(enabled&&!draft.length&&origins.has(index)?' available':'')+
      (draft.includes(index)?' selected':'')+(enabled&&targets.has(index)?' target':'');
    if(button.className!==className)button.className=className;
    const value=String(piece);if(button.dataset.piece!==value){button.dataset.piece=value;button.replaceChildren();
      const label=document.createElement('span');label.className='number';label.textContent=String(index+1);button.append(label);
      if(piece){const chip=document.createElement('span');chip.className='piece '+(piece>0?'white':'black');if(Math.abs(piece)===2)chip.innerHTML=crown;button.append(chip);}
    }
    button.disabled=!enabled;button.setAttribute('aria-label','Square '+(index+1)+(piece?' · '+(piece>0?'light':'dark')+' '+(Math.abs(piece)===2?'king':'man'):' · empty')+(targets.has(index)?' · legal landing':''));
  }
}
function renderClock(){
  if(!state)return;const enabled=state.phase.id==='move'&&state.phase.deadline!==null;show('clock',enabled);
  if(enabled){const current=state.phase.paused?.at??now();text('clock',Math.max(0,Math.ceil((state.phase.deadline!-current)/1000))+' s');}
}
function renderControls(){
  if(!state)return;const live=state.phase.id==='move',paused=!!state.phase.paused,bot=!humanTurn();
  show('pause',live&&!paused);show('resume',live&&paused);show('end',live);show('bot-step',live&&!paused&&bot&&pace==='manual');
  show('undo-draft',live&&draft.length>0);el<HTMLButtonElement>('resign').disabled=!live||paused||bot;
  text('notice',notice);renderClock();
}
function render(){
  if(!state)return;const view=tvView(state),done=state.phase.id==='done';show('setup',false);show('table',true);show('result',done);
  text('edition',state.variant==='american'?'American · 8 × 8':'International · 10 × 10');
  text('board-label',state.variant==='american'?'32 playable squares':'50 playable squares');
  text('turn-eyebrow',done?'Game finished':state.phase.paused?'On hold':pending?'Bot is thinking':humanTurn()?'Your move':'Bot’s move');
  text('status',done?(state.winner===null?'A drawn game':state.players[state.winner].name+' wins'):state.phase.paused?'Take your time':state.players[turnId(state)].name+' to move');
  const moves=currentLegal();text('rule-note',done?'The final board is shown below.':moves[0]?.captures.length?(state.variant==='international'?'Capture the most pieces, then finish the full sequence.':'A capture is required. Finish the full sequence.'):'Move diagonally to a highlighted square.');
  text('draw-note','Quiet moves: '+Math.floor(view.quietPlies/2)+' of '+(view.quietLimit/2)+' each.'+(view.drawWindows.length?' A shorter king-ending counter is active.':''));
  const seats=el('seats');seats.replaceChildren();for(let index=0;index<state.order.length;index++){
    const id=state.order[index],row=document.createElement('div');row.className='seat-summary'+(!done&&id===turnId(state)?' active':'');
    const info=document.createElement('div'),name=document.createElement('div'),detail=document.createElement('div');name.textContent=state.players[id].name;
    detail.className='seat-detail';const control=controllers[id]??'human';detail.textContent=(index===0?'Light':'Dark')+' · '+({human:'Human',easy:'Easy bot',normal:'Medium bot',sharp:'Strong bot'}[control]);info.append(name,detail);
    const material=document.createElement('div');material.className='material';const pieces=state.board.filter(piece=>Math.sign(piece)===(index===0?1:-1));material.textContent=pieces.length+' pieces · '+pieces.filter(piece=>Math.abs(piece)===2).length+' kings';row.append(info,material);seats.append(row);
  }
  const log=el('moves');log.replaceChildren();if(!state.moveLog.length){const empty=document.createElement('div');empty.textContent='Your first move starts the story.';log.append(empty);}
  state.moveLog.slice(-8).forEach(entry=>{const row=document.createElement('div');row.className='move-row';const name=document.createElement('span'),move=document.createElement('span');name.textContent=state!.players[entry.playerId].name;move.textContent=entry.move.path.map(square=>square+1).join(entry.move.captures.length?' × ':' – ');row.append(name,move);log.append(row);});
  if(done){const result=results(state)!;text('winner-title',state.winner===null?'Honours shared':state.players[state.winner].name+' wins');
    const reasons:Record<string,string>={'no-legal-move':'The other side has no legal move.','resignation':'The other side resigned.','turn-clock-forfeit':'The other side ran out of time.','vip-end':'The table was ended.','threefold-repetition':'The same position returned three times.','quiet-move-limit':'The move-count draw limit was reached.'};
    text('winner-copy',reasons[state.endReason??'']??'The shorter king-ending draw limit was reached.');const rows=el('result-rows');rows.replaceChildren();
    result.ranking.forEach(rank=>{const row=document.createElement('div');row.className='result-row';const name=document.createElement('span'),score=document.createElement('span');name.textContent=state!.players[rank.playerId].name;score.textContent=state!.winner===null?'Draw':rank.score?'Winner':'Runner-up';row.append(name,score);rows.append(row);});
  }
  renderBoard();renderControls();
}
function askBot(){
  if(!state||pending||state.phase.id!=='move'||state.phase.paused||humanTurn())return;
  const snapshot=state,id=++requestId,skill=controllers[turnId(state)] as BotSkill;
  try{
    if(!worker){workerUrl=URL.createObjectURL(new Blob([G10_WORKER_SOURCE],{type:'text/javascript'}));worker=new Worker(workerUrl);}
    pending={id,state:snapshot};worker.onmessage=(message:MessageEvent<{id:number;report?:SearchReport;cursor?:RngState;error?:string}>)=>{
      const data=message.data;if(!pending||data.id!==pending.id||state!==pending.state)return;
      pending=null;if(data.report?.move&&data.cursor){botCursor={...data.cursor};act({type:'move',path:[...data.report.move.path]});}
      else{stopWorker();notice=data.error??'This bot could not find a move. Pause or end the table.';botDue=Infinity;render();}
    };
    worker.onerror=()=>{stopWorker();notice='The bot could not finish. Pause or end the table.';botDue=Infinity;render();};
    worker.postMessage({id,position:{board:[...state.board],side:state.side,variant:state.variant,quietPlies:state.quietPlies,ply:state.ply,repetition:{...state.repetition},drawWindows:state.drawWindows.map(value=>({...value}))},settings:{...state.settings},skill,cursor:{...botCursor}});render();
  }catch{stopWorker();notice='This browser could not start the bot. Choose humans for a new table.';botDue=Infinity;render();}
}
function tick(){
  if(!state||state.phase.id!=='move'||state.phase.paused)return;
  const time=now(),key=state.phase.id+':'+state.phase.startedAt;
  if(state.phase.deadline!==null&&time>=state.phase.deadline&&timerKey!==key){timerKey=key;event({type:'timer',phaseId:state.phase.id,startedAt:state.phase.startedAt,now:time});return;}
  renderClock();if(!humanTurn()&&!pending&&(forcedStep||time>=botDue)){forcedStep=false;askBot();}
}
el('start').addEventListener('click',start);['new-game','play-again'].forEach(id=>el(id).addEventListener('click',setup));
['pause','resume','end'].forEach(action=>el(action).addEventListener('click',()=>event({type:'vip',action:action as 'pause'|'resume'|'end',now:now()})));
el('resign').addEventListener('click',()=>{if(humanTurn())act({type:'resign'});});
el('undo-draft').addEventListener('click',()=>{draft=[];notice='';renderBoard();renderControls();});
el('bot-step').addEventListener('click',()=>{forcedStep=true;tick();});
el('pace').addEventListener('change',()=>{pace=select('pace');schedule();renderControls();});
setInterval(tick,100);
(window as unknown as {__G10:unknown}).__G10={
  getState:()=>state?structuredClone(state):null,getView:()=>state?tvView(state):null,
  getController:(id:string)=>state?controllerView(state,id):null,getDraft:()=>[...draft],
  setState:(next:State,roles?:Record<string,Controller>)=>{if(roles)controllers={...roles};else controllers=Object.fromEntries(next.order.map(id=>[id,'human']));install(structuredClone(next));},
  setTime:(value:number|null)=>{virtualNow=value;},event:(value:GameEvent<Input>)=>event(value),act,
  tick,start,setup,setPace:(value:string)=>{pace=value;el<HTMLSelectElement>('pace').value=value;schedule();renderControls();},
  chooseSquare,host:()=>({thinking:!!pending,botCursor:{...botCursor},pace,now:now()}),
};
