import {describe,it,expect} from 'vitest';
import {game} from '../games/shake-up/server';
import {minLength,isLegalPath,wordFromPath,pointsFor} from '../games/shake-up/server/rules';
import {roundPoints} from '../games/shake-up/server/scoring';
import {hasWord} from '../games/shake-up/server/dict';
import {packFor} from '../games/shake-up/server/content';
import {fire,GRID,input,room,until} from '../games/shake-up/__tests__/helpers';
describe('published rules: two independent pinned reports, conflicts recorded',()=>{
  it('minimum letters are3 on4x4 and4 on5x5, including Qu as two letters',()=>{
    expect([minLength(4),minLength(5)]).toEqual([3,4]);
    const grid=['qu','i','t',...Array(13).fill('x')];
    let four={...until(room(1,{rounds:1}),'hunt'),grid};
    four=game.reduce(four,input('p1',{t:'word',path:[0,1]},four.phase.startedAt+1));
    expect(four.words.p1?.[0]?.w).toBe('qui');expect(wordFromPath(grid,[0,1,2])).toBe('quit');expect(pointsFor('quit')).toBe(1);
    const five={...until(room(1,{rounds:1,grid:'5x5'}),'hunt'),grid:[...grid,...Array(9).fill('x')]};
    expect(game.reduce(five,input('p1',{t:'word',path:[0,1]},five.phase.startedAt+1))).toBe(five);
  });
  it('last cell and diagonals are usable, wrap-around and reuse are forbidden',()=>{
    expect(isLegalPath([0,5,10,15],4)).toBe(true);expect(isLegalPath([23,24],5)).toBe(true);
    expect(isLegalPath([3,4],4)).toBe(false);expect(isLegalPath([0,5,0],4)).toBe(false);
  });
  it('the same valid word may score again next round and totals accumulate',()=>{
    let s=room(2,{rounds:2});
    for(const expected of [11,22]){
      s={...until(s,'hunt'),grid:GRID.slice()};
      s=game.reduce(s,input('p1',{t:'word',path:[0,1,2,3,6,5,9,10]},s.phase.startedAt+1));
      s=until(fire(s),'tally');expect(s.scores.p1).toBe(expected);s=fire(s);
    }
    expect(s.phase.id).toBe('done');
  });
  it('accepting a shared unknown word still gives both players zero; dropped submissions still cancel',()=>{
    let s={...until(room(3,{rounds:1}),'hunt'),grid:GRID.slice()};
    for(const id of ['p1','p2'])s=game.reduce(s,input(id,{t:'word',path:[1,5,4]},s.phase.startedAt+1));
    s=game.reduce(s,{type:'player',playerId:'p2',connected:false,now:s.phase.startedAt+2});s=fire(s);
    s=game.reduce(s,input('p1',{t:'counts',word:'tde',counts:true},s.phase.startedAt+1,true));
    expect(s.counted).toEqual(['tde']);expect(roundPoints(s)).toEqual({p1:0,p2:0,p3:0});
  });
  it('VIP rulings and views cannot reach another player’s dictionary miss before its reveal beat',()=>{
    let s={...until(room(2,{rounds:1}),'hunt'),grid:GRID.slice()};
    expect(hasWord(packFor('en').words,'tdn')).toBe(false);
    s=game.reduce(s,input('p1',{t:'word',path:[1,5,4]},s.phase.startedAt+1));
    s=game.reduce(s,input('p2',{t:'word',path:[1,5,6]},s.phase.startedAt+1));
    s=game.reduce(s,input('p2',{t:'word',path:[0,1,2,3,6,5,9,10]},s.phase.startedAt+1));s=fire(s);
    expect(game.controllerView(s,'p1').reveal?.rulable.map(r=>r.w)).toEqual(['TDE']);
    expect(JSON.stringify(game.tvView(s))).not.toContain('TDN');
    expect(game.reduce(s,input('p1',{t:'counts',word:'tdn',counts:true},s.phase.startedAt+1,true))).toBe(s);
    s=fire(s);expect(game.controllerView(s,'p1').reveal?.rulable.map(r=>r.w)).toEqual(['TDE','TDN']);
    s=game.reduce(s,input('p1',{t:'counts',word:'tdn',counts:true},s.phase.deadline!-1,true));expect(s.counted).toEqual(['tdn']);
  });
});
