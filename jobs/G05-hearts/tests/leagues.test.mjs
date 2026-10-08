import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {runLeagues} from '../scripts/leagues.mjs';
test('held-out2000 full matches per league: strong clearlybeatsmedium; mediumclearlybeatseasy',()=>{
 const actual=runLeagues();assert.deepEqual(actual,JSON.parse(readFileSync('data/bot-leagues.json','utf8')));
 for(const row of actual.leagues){assert.ok(row.wilson95[0]>0.6,`${row.league} not clearly above50% head-to-head`);assert.ok(row.firstPlaceShare>0.33,`${row.league} first place near25% four-seat baseline`);assert.ok(row.focalMean<row.rivalMean);console.log(JSON.stringify(row));}
});
