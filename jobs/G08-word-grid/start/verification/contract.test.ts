import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRng } from '../../../../contract/rng';
import { game, joinPlayer } from '../games/shake-up/server';
import { hasWord } from '../games/shake-up/server/dict';
import { packFor } from '../games/shake-up/server/content';
import { solve } from '../games/shake-up/server/solver';
import { inputSchema, type State } from '../games/shake-up/server/types';
import { GRID, STRANDED, fire, input, jsonSafe, room, until } from '../games/shake-up/__tests__/helpers';
const timer=(s:State,now=s.phase.deadline!)=>({type:'timer' as const,now,phaseId:s.phase.id,startedAt:s.phase.startedAt});

describe('actual nine root contract invariants',()=>{
  it('unknown and prototype ids never throw, fabricate seats or find inherited words',()=>{
    for(const phase of game.phases){
      const s=until(room(3,{rounds:1}),phase);
      for(const id of ['spectator','__proto__','constructor','toString']){
        expect(jsonSafe(game.controllerView(s,id))).toBeNull();
        expect(game.controllerView(s,id).me.role).toBe('spectator');
        expect(game.reduce(s,input(id,{t:'word',path:STRANDED},s.phase.startedAt+1,true))).toBe(s);
        expect(game.reduce(s,{type:'player',now:s.phase.startedAt+1,playerId:id,connected:true})).toBe(s);
        expect(game.bot.sampleInput(s,id,createRng(1),'sharp')).toBeNull();
      }
      expect(jsonSafe(game.tvView(s))).toBeNull();
    }
  });
  it('all event families survive every phase, with invalid direct inputs ignored',()=>{
    for(const phase of game.phases){
      const s=until(room(2,{rounds:1}),phase),now=s.phase.startedAt+1;
      for(const action of ['skip','pause','resume','end'] as const)expect(()=>game.reduce(s,{type:'vip',now,action})).not.toThrow();
      for(const connected of [true,false])expect(()=>game.reduce(s,{type:'player',now,playerId:'p1',connected})).not.toThrow();
      expect(game.reduce(s,{type:'speech',now,key:'unknown',ms:10})).toBe(s);
      expect(game.reduce(s,{type:'speechStart',now,key:'unknown'})).toBe(s);
      for(const bad of [null,{}, {t:'word',path:[NaN]}, {t:'word',path:[0,1],text:'STRANDED'}, {t:'counts',word:'X',counts:true,secret:'x'}]){
        expect(inputSchema.safeParse(bad).success).toBe(false);
        expect(game.reduce(s,{type:'input',now,playerId:'p1',input:bad as never})).toBe(s);
      }
    }
  });
  it('matches root timer identity, rejects early/stale/duplicate beats, pauses input and clocks',()=>{
    let s=room(2,{rounds:1});
    expect(game.reduce(s,{...timer(s),startedAt:s.phase.startedAt-1})).toBe(s);
    expect(game.reduce(s,timer(s,s.phase.deadline!-1))).toBe(s);
    const shake=timer(s);s=fire(s);expect(game.reduce(s,shake)).toBe(s);
    s={...s,grid:GRID.slice()};s=game.reduce(s,input('p1',{t:'word',path:STRANDED},s.phase.startedAt+1));
    s=fire(s);const first=timer(s);s=fire(s);expect(s.phase.id).toBe('reveal');expect(game.reduce(s,first)).toBe(s);
    const before=s,at=s.phase.startedAt+10;
    s=game.reduce(s,{type:'vip',action:'pause',now:at});
    expect(s.phase.paused).toEqual({at});
    expect(game.reduce(s,input('p1',{t:'counts',word:'ZZZ',counts:true},at+1,true))).toBe(s);
    expect(game.reduce(s,timer(s,s.phase.deadline!+10000))).toBe(s);
    s=game.reduce(s,{type:'vip',action:'resume',now:at+10000});
    expect(s.phase.deadline).toBe(before.phase.deadline!+10000);
    expect(s.phase.paused).toBeUndefined();
  });
  it('trusted late join preserves the original rule without trusting unknown socket ids',()=>{
    let s=until(room(2,{rounds:1}),'hunt');s={...s,grid:GRID.slice()};const now=s.phase.startedAt+1;
    const joined=joinPlayer(s,{id:'late',name:'Zoe',avatarId:'face-z',connected:true},now);
    expect(joined.order).toEqual([...s.order,'late']);expect(joined.scores.late).toBe(0);expect(joined.phase).toBe(s.phase);
    const word=game.reduce(joined,input('late',{t:'word',path:STRANDED},now+1));expect(word.words.late?.[0]?.w).toBe('stranded');
    expect(joinPlayer(joined,{id:'late',name:'other',avatarId:'x',connected:true},now)).toBe(joined);
  });
  it('prototype-like valid seats survive initialization, submissions, every view and final results',()=>{
    const ids=['__proto__','constructor','toString'];
    let s=game.init({players:ids.map(id=>({id,name:id,avatarId:'x',connected:true})),settings:{rounds:1},seed:12,now:1000});
    s=fire(s);s={...s,grid:GRID.slice()};
    for(const id of ids)s=game.reduce(s,input(id,{t:'word',path:STRANDED},s.phase.startedAt+1));
    expect(Object.hasOwn(s.words,'__proto__')).toBe(true);expect(s.words.__proto__?.length).toBe(1);
    for(const id of ids)expect(jsonSafe(game.controllerView(s,id))).toBeNull();
    const done=until(s,'done');expect(jsonSafe(done)).toBeNull();expect(jsonSafe(game.results(done))).toBeNull();
    expect(game.results(done)?.ranking.map(r=>r.rank)).toEqual([1,1,1]);
  });
  it('private words/plans/timestamps stay absent while own words and public counts stay correct',()=>{
    let s=until(room(3,{rounds:1}),'hunt');s={...s,grid:GRID.slice()};
    s=game.reduce(s,input('p1',{t:'word',path:STRANDED},s.phase.startedAt+1));
    const tv=game.tvView(s),other=game.controllerView(s,'p2');
    expect(JSON.stringify(tv)).not.toContain('STRANDED');expect(JSON.stringify(other)).not.toContain('STRANDED');
    expect(game.controllerView(s,'p1').me.words[0]?.w).toBe('STRANDED');expect(tv.hunt?.counts.p1).toBe(1);
    for(const view of [tv,other])for(const key of ['botPlans','submissionBytes','rng','firstMs'])expect(JSON.stringify(view)).not.toContain(`"${key}"`);
    expect(game.results(s)).toBeNull();
    const clone=JSON.parse(JSON.stringify(s)) as State;clone.words.p3=[{w:'secret',p:[0],t:0,ok:true}];
    for(const skill of ['easy','normal','sharp'] as const)expect(game.bot.sampleInput(clone,'p1',createRng(9),skill)).toEqual(game.bot.sampleInput(s,'p1',createRng(9),skill));
  });
  it('unknown VIP-stamped ids cannot accept a revealed word',()=>{
    let s=until(room(2,{rounds:1}),'hunt');s={...s,grid:GRID.slice()};
    s=game.reduce(s,input('p1',{t:'word',path:[1,5,4]},s.phase.startedAt+1));s=fire(s);
    expect(game.reduce(s,input('spectator',{t:'counts',word:'tde',counts:true},s.phase.startedAt+1,true))).toBe(s);
  });
  it('sixteen maximum-length identities and five crowded rounds remain below 256 KB',()=>{
    const ids=Array.from({length:16},(_,i)=>`seat${i}-`+'x'.repeat(120));
    let s=game.init({players:ids.map(id=>({id,name:'N'.repeat(80),avatarId:'A'.repeat(128),connected:true})),settings:{rounds:5,grid:'5x5'},contentLang:'es',seed:17,now:1000});
    let submissions=0,peak=0;
    for(let round=0;round<5;round++){
      s=fire(s);const available=solve(s.grid,5,packFor('es').words,4).filter(f=>!hasWord(packFor('es').blocked,f.w));
      for(const f of available.slice(0,150))for(const id of ids){
        s=game.reduce(s,input(id,{t:'word',path:f.path},s.phase.startedAt+1));
        const bytes=Buffer.byteLength(JSON.stringify(s));peak=Math.max(peak,bytes);expect(bytes).toBeLessThanOrEqual(256*1024);submissions++;
      }
      s=until(fire(s),'tally');s=fire(s);expect(jsonSafe(s)).toBeNull();
    }
    expect(s.phase.id).toBe('done');expect(submissions).toBeGreaterThan(1000);expect(peak).toBeGreaterThan(40000);
    console.log(JSON.stringify({crowdedRounds:5,attempts:submissions,peakBytes:peak}));
  });
  it('common is a strict subset, obscure words are optional, and Spanish ignores stale English common',()=>{
    const full=packFor('en'),common=packFor('en','common');expect(common.words.length).toBeLessThan(full.words.length);
    expect(common.words.every(w=>hasWord(full.words,w))).toBe(true);
    expect(room(2,{dictionary:'common'}).cfg.dictionary).toBe('common');
    expect(room(2,{dictionary:'common'},1,{lang:'es'}).cfg.dictionary).toBe('full');
    expect(packFor('es','common')).toBe(packFor('es'));
  });
  it('frozen input states are never mutated and returned view paths cannot alter state',()=>{
    const freeze=(o:unknown):void=>{if(o&&typeof o==='object'){Object.freeze(o);for(const v of Object.values(o))freeze(v);}};
    let s=until(room(2,{rounds:1}),'hunt');s={...s,grid:GRID.slice()};freeze(s);
    const before=JSON.stringify(s),next=game.reduce(s,input('p1',{t:'word',path:STRANDED},s.phase.startedAt+1));expect(JSON.stringify(s)).toBe(before);
    const revealed=fire(next),tv=game.tvView(revealed),copy=JSON.stringify(revealed);
    if(tv.reveal?.beat.kind==='player')tv.reveal.beat.glow.push(24);
    expect(JSON.stringify(revealed)).toBe(copy);
  });
  it('server source has no ambient randomness, timers, I/O or mutable top-level bindings',()=>{
    const directory=join(__dirname,'../games/shake-up/server');
    const walk=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):e.name.endsWith('.ts')?[join(p,e.name)]:[]);
    for(const path of walk(directory)){
      const s=readFileSync(path,'utf8');expect(s).not.toMatch(/Math\.random|Date\.now|\bset(?:Timeout|Interval)\s*\(|\b(?:fetch|readFile|writeFile)\s*\(|from ['"]node:/);
      expect(s).not.toMatch(/^(?:export )?(?:let|var)\s/m);
    }
  });
});
