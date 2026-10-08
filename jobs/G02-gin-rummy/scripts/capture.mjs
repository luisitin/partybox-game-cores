import {chromium} from 'playwright';
import {resolve} from 'node:path';
import {mkdir,stat} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {seedHost} from './clock-check.mjs';
const tag=process.argv[2]??'latest';assert(/^[a-z0-9-]+$/.test(tag));
await mkdir('.work/browser',{recursive:true});await mkdir('media',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const [label,width,height,rate]of [['desktop',1920,1080,1],['phone4x',390,844,4]]){
  const context=await browser.newContext({viewport:{width,height},recordVideo:{dir:'.work/browser',size:{width:Math.min(width,1280),height:Math.min(height,844)}}});
  await seedHost(context);const page=await context.newPage(),cd=await context.newCDPSession(page);
  await cd.send('Emulation.setCPUThrottlingRate',{rate});await page.goto('file://'+resolve('play.html'));
  await page.locator('#start').click();
  for(let i=0;i<2;i++){await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pass upcard',exact:true}).click();}
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Draw stock',exact:true}).click();
  await page.locator('#hand .card').first().click();await page.getByRole('button',{name:'Discard selected',exact:true}).click();
  await page.getByRole('button',{name:'Show my hand',exact:true}).click();await page.getByRole('button',{name:'Pause',exact:true}).click();
  await page.getByRole('button',{name:'Resume',exact:true}).click();await page.getByRole('button',{name:'End match',exact:true}).click();
  const video=page.video();await context.close();const path=`media/${tag}-${label}.webm`;await video.saveAs(path);
  const bytes=(await stat(path)).size;assert(bytes<10*1024*1024);console.log(JSON.stringify({path,bytes,cpuThrottle:rate,viewport:{width,height},performanceMeasurement:false}));
 }
}finally{await browser.close();}
