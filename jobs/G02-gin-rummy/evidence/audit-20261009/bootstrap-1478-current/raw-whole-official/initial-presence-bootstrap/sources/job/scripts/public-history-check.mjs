import assert from 'node:assert/strict';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {game} from '../dist/core.mjs';
import {seedHost} from './clock-check.mjs';
export async function checkPublicHistory(browser,{before=false}={}){
 const rows=[];
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height}});await seedHost(context,7);
  try{
   const page=await context.newPage(),cd=await context.newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate});
   await page.goto(pathToFileURL(resolve('play.html')).href);await page.locator('#start').click();
   let expected=game.init({players:[0,1].map(i=>({id:'p'+i,name:'Player '+(i+1),avatarId:'face-'+i,connected:true,bot:false})),seed:3660348618,settings:{},now:0});
   const desired=[],actors=[];
   for(let i=0;i<2;i++){
    const actor=expected.turn;actors.push(actor);desired.push(expected.players[actor].name+': pass');
    assert((await page.locator('#status').textContent()).startsWith(expected.players[actor].name+' ·'));
    await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();
    assert.equal(await page.locator('#hand .card').count(),0);
    expected=game.reduce(expected,{type:'input',playerId:actor,input:{type:'pass'},now:i+1});
   }
   await page.getByText('Public turn history',{exact:true}).click();
   const actual=await page.locator('#log p').allTextContents();
   const core=game.tvView(expected).log.map(x=>expected.players[x.player].name+': '+x.action);
   assert.deepEqual(actual,core,'actual renderer must show the actual core history');
   if(before)assert.notDeepEqual(actual,desired,'negative control must reproduce wrong actors');
   else assert.deepEqual(actual,desired,'public history must name each actual human passer');
   assert.equal(expected.openingPasses,2);assert.equal(expected.mustStock,true);assert.equal(expected.phase.id,'draw');
   rows.push({label,viewport:{width,height},cpuThrottle:rate,actualFileNavigation:true,actualGameInitSeed:3660348618,entropySeed:7,actors,desired,actual,core,attributionCorrect:JSON.stringify(actual)===JSON.stringify(desired),stateInjected:false,privateCardsAfterPass:0});
  }finally{await context.close();}
 }
 return rows;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const before=process.argv.includes('--before'),paths=['play.html','src/core.ts','src/cards.ts','src/browser.ts'];
 const hashes=async()=>Object.fromEntries(await Promise.all(paths.map(async p=>[p,createHash('sha256').update(await readFile(p)).digest('hex')])));
 const sourceStart=await hashes(),started=new Date().toISOString(),browser=await chromium.launch({headless:true,args:['--no-sandbox']});let rows;
 try{rows=await checkPublicHistory(browser,{before});}finally{await browser.close();}
 const sourceEnd=await hashes();assert.deepEqual(sourceEnd,sourceStart);
 const report={negativeControl:before,started,completed:new Date().toISOString(),sourceStart,sourceEnd,sourceUnchanged:true,performanceMeasurement:false,rows};
 await mkdir('.work/review',{recursive:true});await writeFile(`.work/review/public-history-${before?'before':'after'}.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
