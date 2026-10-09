import {chromium} from 'playwright';
import {build} from 'esbuild';
import {writeFile,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
const targets=[[2,3,4],[15,16,17],[29,30,31]],cases=[
 {hand:[0,1,5,6,13,14,18,19,28,32],targets},
 {hand:[0,1,5,6,13,14,18,19,38,32],targets}];
const {outputFiles}=await build({entryPoints:['src/cards.ts'],bundle:true,write:false,format:'iife',globalName:'GinCards',target:'es2022'});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}});
 const cd=await page.context().newCDPSession(page);await cd.send('Emulation.setCPUThrottlingRate',{rate:4});
 await page.goto('file://'+resolve('play.html'));await page.addScriptTag({content:outputFiles[0].text});
 const rows=await page.evaluate(cases=>cases.map(({hand,targets})=>{const start=performance.now();const solution=GinCards.optimalDefense(hand,targets,true);return {hand,targets,elapsedMs:performance.now()-start,solution};}),cases);
 const report={cpuThrottle:4,browser:'Chromium 141',kind:'algorithm microbenchmark in throttled browser; not a frame-rate measurement',
  cardsSha256:createHash('sha256').update(await readFile('src/cards.ts')).digest('hex'),rows};
 await writeFile('.work/defense-browser-profile.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(rows.map(({elapsedMs,solution})=>({elapsedMs,deadwood:solution.deadwood}))));
}finally{await browser.close();}
