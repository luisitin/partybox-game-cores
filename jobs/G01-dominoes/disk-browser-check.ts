// Exercise the shipped file through actual file:// navigation. Never substitutes setContent.
import {chromium} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync,realpathSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
import {init,observe,choose,type Observation} from './core.ts';
import {createRng} from '../../contract/rng.ts';

const identity=(path:string)=>{const actual=realpathSync(path),bytes=readFileSync(actual);return {path:actual,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const files=['disk-browser-check.ts','play.html','ui.ts','strong-bot.ts','strong-worker.ts','core.ts','build.ts','shell.html','package.json','../../contract/rng.ts'];
const sourceMap=()=>Object.fromEntries(files.map(path=>[path,identity(path)]));
const executable=process.env.CHROMIUM_PATH??(existsSync('/usr/lib/chromium/chromium')?'/usr/lib/chromium/chromium':chromium.executablePath());
const before=sourceMap(),nodeBefore=identity(process.execPath),chromiumBefore=identity(executable);
const fileURL=pathToFileURL(resolve('play.html')).href;
const result:Record<string,unknown>={schema:'g01-disk-browser-proof/1',status:'STARTED',startedAt:new Date().toISOString(),navigationMode:'Actual page.goto(file://); no setContent fallback',fileURL,sourcesBefore:before,nodeBefore,nodeVersion:process.version,chromiumBefore};
mkdirSync('.tmp/g01-evidence',{recursive:true});
const save=()=>writeFileSync('.tmp/g01-evidence/disk-current.json',JSON.stringify(result,null,2)+'\n');save();
const errors:string[]=[],requests:string[]=[];
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox']});result.chromiumVersion=browser.version();
interface Trace {created:number;urls:string[];requests:{id:number;seed:number;observation:Observation}[];replies:{id:number;input:unknown;rngState:unknown}[]}
type DiagnosticWindow=typeof globalThis&{__g01DiskWorker:Trace};
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('**/*',route=>/^https?:/.test(route.request().url())?route.abort():route.continue());
 await context.addInitScript(()=>{
  const scope=globalThis as DiagnosticWindow,OriginalWorker=Worker;
  scope.__g01DiskWorker={created:0,urls:[],requests:[],replies:[]};
  const trace=scope.__g01DiskWorker;
  scope.Worker=class extends OriginalWorker{
   constructor(url:string|URL,options?:WorkerOptions){super(url,options);trace.created++;trace.urls.push(String(url));this.addEventListener('message',event=>trace.replies.push(structuredClone(event.data)));}
   override postMessage(message:unknown,transferOrOptions?:Transferable[]|StructuredSerializeOptions){trace.requests.push(structuredClone(message) as Trace['requests'][number]);if(Array.isArray(transferOrOptions))super.postMessage(message,transferOrOptions);else super.postMessage(message,transferOrOptions);}
  };
 });
 const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('request',request=>{if(/^https?:/.test(request.url()))requests.push(request.url());});
 await page.goto(fileURL,{waitUntil:'load'});assert.equal(page.url(),fileURL);result.actualURL=page.url();
 // A real human handover must remain concealed when opened directly from disk.
 await page.click('#houseRules summary');await page.selectOption('#opening','rotating');await page.selectOption('#seat-1','human');await page.click('#start');
 assert.equal(await page.locator('#hand .hand-tile').count(),0);await page.getByRole('button',{name:/reveal hand/}).click();assert.equal(await page.locator('#hand .hand-tile').count(),7);
 await page.locator('#hand .hand-tile.playable').first().click();assert.equal(await page.locator('#hand .hand-tile').count(),0);await page.click('#end');
 result.humanHandover='PASS';
 // Fresh actual file navigation checks the inline Blob Worker rather than its fallback.
 await page.goto(fileURL,{waitUntil:'load'});assert.equal(page.url(),fileURL);
 await page.click('#houseRules summary');await page.selectOption('#opening','rotating');await page.selectOption('#seat-0','sharp');await page.fill('#seed','23');await page.click('#start');
 await page.waitForFunction(()=>(globalThis as DiagnosticWindow).__g01DiskWorker.replies.length>0,undefined,{timeout:15_000});
 const trace=await page.evaluate(()=>(globalThis as DiagnosticWindow).__g01DiskWorker);
 const state=init({players:[0,1].map(i=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings:{opening:'rotating'},seed:23,now:0});
 const observation=observe(state,'p0')!,rng=createRng(23),input=choose(observation,rng,'sharp');
 assert(trace.created>=1);assert(trace.urls.every(url=>url.startsWith('blob:')));
 assert.deepEqual(Object.keys(trace.requests[0]!).sort(),['id','observation','seed']);assert.equal(trace.requests[0]!.seed,23);assert.deepEqual(trace.requests[0]!.observation,observation);
 assert.equal(trace.replies[0]!.id,trace.requests[0]!.id);assert.deepEqual(trace.replies[0]!.input,input);assert.deepEqual(trace.replies[0]!.rngState,rng.state());
 assert.equal(Number(await page.locator('#boardLayer .tile').first().getAttribute('data-tile')),(input as {tile:number}).tile);
 result.realInlineWorker={status:'PASS',trace,expected:{input,rngState:rng.state()}};
 await page.click('#end');await context.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 result.status='PASS';result.finishedAt=new Date().toISOString();
}catch(error){result.status='FAIL';result.failure=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:String(error);throw error;}
finally{
 result.errors=errors;result.externalRequests=requests;
 try{await browser.close();result.browserClosedAt=new Date().toISOString();result.sourcesAfter=sourceMap();result.nodeAfter=identity(process.execPath);result.chromiumAfter=identity(executable);assert.deepEqual(result.sourcesAfter,before);assert.deepEqual(result.nodeAfter,nodeBefore);assert.deepEqual(result.chromiumAfter,chromiumBefore);}
 catch(error){result.status='FAIL';result.closureOrGuardFailure=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:String(error);throw error;}
 finally{save();}
}
console.log('Actual file:// standalone hot-seat privacy and inline Blob Worker replay passed with zero external requests.');
