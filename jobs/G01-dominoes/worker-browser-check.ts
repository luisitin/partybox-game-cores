// Real-worker functional proof. No fake clock, native frame gate or FPS claim here.
// Explicit fault fixtures modify only diagnostic Blob bytes, never production code.
import {chromium,type Page} from 'playwright';
import {readFileSync,writeFileSync,mkdirSync,existsSync,realpathSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {init,observe,choose,reduce,game,type Observation} from './core.ts';
import {createRng} from '../../contract/rng.ts';
const hash=(bytes:string|Buffer)=>createHash('sha256').update(bytes).digest('hex');
const files=['worker-browser-check.ts','strong-bot.ts','strong-worker.ts','strong-bot-checks.ts','core.ts','ui.ts','build.ts','shell.html','play.html','browser.ts','browser-evidence.ts','package.json','package-lock.json','tsconfig.json','test.ts','../../contract/rng.ts'];
const identity=(path:string)=>{const actual=realpathSync(path),bytes=readFileSync(actual);return {path:actual,bytes:bytes.length,sha256:hash(bytes)};};
const sourceMap=()=>Object.fromEntries(files.map(f=>[f,identity(f)]));
const executable=process.env.CHROMIUM_PATH??(existsSync('/usr/lib/chromium/chromium')?'/usr/lib/chromium/chromium':chromium.executablePath());
const before=sourceMap(),nodeBefore=identity(process.execPath),browserBefore=identity(executable),compilerBefore=identity(process.env.ESBUILD_BINARY_PATH??'node_modules/@esbuild/linux-x64/bin/esbuild');
const compilerVersion=spawnSync(compilerBefore.path,['--version'],{encoding:'utf8'});assert.equal(compilerVersion.status,0);
const result:Record<string,unknown>={schema:'g01-real-worker-proof/1',status:'STARTED',startedAt:new Date().toISOString(),scope:'Real offline worker functionality; explicit controlled fault fixtures; no fake clock or FPS acceptance',navigationMode:'Exact actual disk HTML bytes through page.setContent; no file:// or double-click navigation claim',sourcesBefore:before,nodeBefore,nodeVersion:process.version,chromiumBefore:browserBefore,compilerBefore,compilerVersion:compilerVersion.stdout.trim(),variants:[],cases:[]};
mkdirSync('.tmp/g01-evidence',{recursive:true});
const save=()=>writeFileSync('.tmp/g01-evidence/worker-current.json',JSON.stringify(result,null,2)+'\n');save();
const compilerArgs=['strong-worker.ts','--bundle','--format=iife','--target=es2022','--minify','--legal-comments=inline'];
const compiled=spawnSync(compilerBefore.path,compilerArgs,{encoding:'utf8',maxBuffer:8*1024*1024});assert.equal(compiled.status,0,compiled.stderr||String(compiled.signal));
result.compilation={tool:compilerBefore,args:compilerArgs,exit:compiled.status,outputSha256:hash(compiled.stdout)};
const workerJs=`/* Bundled Zod 4.6.5 — full MIT notice\n${readFileSync('THIRD-PARTY-LICENSES.txt','utf8')}*/\n`+compiled.stdout;
result.workerSourceSha256=hash(workerJs);save();
const golden=(observation:Observation,seed:number)=>{const rng=createRng(seed);return {input:choose(observation,rng,'sharp'),rngState:rng.state()};};
const firstObservation=(seed:number)=>{const s=init({players:[0,1].map(i=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings:{opening:'rotating'},seed,now:0});return observe(s,'p0')!;};
const browser=await chromium.launch({headless:true,executablePath:executable,args:['--no-sandbox']});result.chromiumVersion=browser.version();
const errors:string[]=[],requests:string[]=[];
interface Trace {requests:{id:number;seed:number;observation:Observation}[];replies:{id:number;input:unknown;rngState:unknown;error?:boolean}[];sources:string[];executedSources:string[];created:number;terminated:number}
type DiagnosticWindow=typeof globalThis&{__g01Worker:Trace};
async function pageFor(variant:'actual'|'csp-denial'|'runtime-error'|'unresponsive'|'delayed'){
 const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.route('**/*',r=>/^https?:/.test(r.request().url())?r.abort():r.continue());
 await page.evaluate(variant=>{
  const scope=globalThis as DiagnosticWindow;
  scope.__g01Worker={requests:[],replies:[],sources:[],executedSources:[],created:0,terminated:0};
  const trace=scope.__g01Worker,originalURL=URL.createObjectURL.bind(URL),OriginalWorker=Worker;
  URL.createObjectURL=blob=>{
   if(blob instanceof Blob){
    const text=blob.text();text.then(s=>trace.sources.push(s));
    if(variant==='runtime-error')blob=new Blob(['self.onmessage=()=>{throw new Error("controlled real-worker failure")}'],{type:'text/javascript'});
    if(variant==='unresponsive')blob=new Blob(['self.onmessage=()=>{}'],{type:'text/javascript'});
    if(variant==='delayed'){
     // Diagnostic-only real message delivery delay for cancellation; production source is unchanged.
     blob=new Blob([blob,'\nconst original=self.onmessage;self.onmessage=event=>setTimeout(()=>original(event),2500);'],{type:'text/javascript'});
    }
    (blob as Blob).text().then(s=>trace.executedSources.push(s));
   }
   return originalURL(blob);
  };
  scope.Worker=class extends OriginalWorker {
   constructor(url:string|URL,options?:WorkerOptions){super(url,options);trace.created++;this.addEventListener('message',e=>trace.replies.push(structuredClone(e.data)));}
   override postMessage(message:unknown,transferOrOptions?:Transferable[]|StructuredSerializeOptions){trace.requests.push(structuredClone(message) as Trace['requests'][number]);if(Array.isArray(transferOrOptions))super.postMessage(message,transferOrOptions);else super.postMessage(message,transferOrOptions);}
   override terminate(){trace.terminated++;super.terminate();}
  };
 },variant);
 await page.setContent(readFileSync('play.html','utf8'));
 if(variant==='csp-denial')await page.evaluate(()=>{const policy=document.createElement('meta');policy.httpEquiv='Content-Security-Policy';policy.content="worker-src 'none'";document.head.append(policy);});
 await page.click('#houseRules summary');await page.selectOption('#opening','rotating');await page.selectOption('#seat-0','sharp');await page.fill('#seed','23');await page.click('#start');
 return {context,page};
}
const trace=(page:Page)=>page.evaluate(()=>(globalThis as DiagnosticWindow).__g01Worker);
const summarize=(t:Trace)=>({...t,sources:t.sources.map(s=>({bytes:Buffer.byteLength(s),sha256:hash(s)})),executedSources:t.executedSources.map(s=>({bytes:Buffer.byteLength(s),sha256:hash(s)}))});
const waitForTile=(page:Page)=>page.waitForFunction(()=>document.querySelectorAll('#boardLayer .tile').length>0,undefined,{timeout:15_000});
function checkRequest(request:Trace['requests'][number],expected:Observation,seed:number){
 assert.deepEqual(Object.keys(request).sort(),['id','observation','seed']);assert.equal(request.seed,seed);assert.deepEqual(request.observation,expected);
 assert(!Object.hasOwn(request.observation,'hands'));assert(!Object.hasOwn(request.observation,'stock'));assert(!Object.hasOwn(request.observation,'players'));assert(!Object.hasOwn(request.observation,'rng'));
}
try {
 const actual=await pageFor('actual');await waitForTile(actual.page);const initial=await trace(actual.page),observation=firstObservation(23),expected=golden(observation,23);
 checkRequest(initial.requests[0]!,observation,23);assert.deepEqual(initial.replies[0]!.input,expected.input);assert.deepEqual(initial.replies[0]!.rngState,expected.rngState);
 assert(initial.created>0);assert.equal(initial.sources[0],workerJs,'actual UI worker Blob must equal the exact compiled source');
 const played=await actual.page.locator('#boardLayer .tile').first().getAttribute('data-tile');assert.equal(Number(played),(expected.input as {tile:number}).tile);
 await actual.page.click('#end');assert.equal(await actual.page.locator('#status').innerText(),'Match complete');
 (result.variants as unknown[]).push({variant:'actual UI',status:'PASS',request:initial.requests[0],reply:initial.replies[0],workerSourceSha256:hash(initial.sources[0]!)});save();
 // Independently generated real-core observations; only sanitized observations enter the browser worker.
 const probes:{id:number;seed:number;observation:Observation}[]=[],goldens:ReturnType<typeof golden>[]=[];
 for(const n of [2,3,4])for(const mode of ['draw','block'])for(const partners of [false,...(n===4?[true]:[])]){
  let s=init({players:Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings:{mode,partners,opening:'rotating',target:250,reserve:'2'},seed:47+n,now:0});let count=0;
  for(let step=0;step<100&&count<2&&s.phase.id==='play';step++){
   const o=observe(s,s.seats[s.turn]!)!;
   if(o.legal.length>1){const seed=8000+probes.length;probes.push({id:1000+probes.length,seed,observation:o});goldens.push(golden(o,seed));count++;}
   const input=game.bot.sampleInput(s,s.seats[s.turn]!,createRng(step),'normal')!;s=reduce(s,{type:'input',playerId:s.seats[s.turn]!,input,now:s.phase.startedAt+1});
  }
  assert.equal(count,2,`nontrivial ${n}/${mode}/${partners} observations required`);
 }
 const replies=await actual.page.evaluate(async({source,probes})=>{
  const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),worker=new Worker(url),replies:unknown[]=[];
  try{for(const request of probes){const reply=await new Promise<unknown>((resolve,reject)=>{worker.onmessage=event=>resolve(event.data);worker.onerror=event=>{event.preventDefault();reject(new Error(event.message));};worker.postMessage(request);});replies.push(reply);}}
  finally{worker.terminate();URL.revokeObjectURL(url);}return replies;
 },{source:workerJs,probes});
 assert.equal(replies.length,probes.length);for(let i=0;i<probes.length;i++){const reply=replies[i] as Trace['replies'][number];assert.equal(reply.id,probes[i]!.id);assert.deepEqual(reply.input,goldens[i]!.input);assert.deepEqual(reply.rngState,goldens[i]!.rngState);(result.cases as unknown[]).push({request:probes[i],reply,expected:goldens[i],status:'PASS'});}
 result.nontrivialRealWorkerReplays=probes.length;save();await actual.context.close();
 for(const variant of ['csp-denial','runtime-error','unresponsive'] as const){
  const {page,context}=await pageFor(variant),started=new Date().toISOString();await waitForTile(page);const observed=await trace(page);
  assert.equal(Number(await page.locator('#boardLayer .tile').first().getAttribute('data-tile')),(expected.input as {tile:number}).tile,'fallback must preserve original seed/policy action');
  if(observed.requests.length)checkRequest(observed.requests[0]!,observation,23);
  assert.equal(observed.replies.length,0);if(variant!=='csp-denial')assert(observed.terminated>=1);
  await page.click('#end');(result.variants as unknown[]).push({variant,status:'PASS',scope:'Explicit controlled platform/worker fault, actual UI fallback; not canonical/native FPS acceptance',startedAt:started,finishedAt:new Date().toISOString(),trace:summarize(observed)});save();await context.close();
 }
 const delayed=await pageFor('delayed');await delayed.page.waitForFunction(()=>(globalThis as DiagnosticWindow).__g01Worker.requests.length>0);
 const old=await trace(delayed.page);await delayed.page.click('#end');assert.equal(await delayed.page.locator('#status').innerText(),'Match complete');await delayed.page.waitForTimeout(2600);
 const ended=await trace(delayed.page);assert.equal(ended.replies.length,0);assert(ended.terminated>=1);assert.equal(await delayed.page.locator('#boardLayer .tile').count(),0);
 await delayed.page.getByRole('button',{name:'Rematch'}).click();await waitForTile(delayed.page);const rematch=await trace(delayed.page),next=rematch.requests.at(-1)!;
 checkRequest(next,firstObservation(24),24);assert(next.id>old.requests[0]!.id);assert.deepEqual(rematch.replies.at(-1)!.input,golden(firstObservation(24),24).input);
 (result.variants as unknown[]).push({variant:'delayed pending end/rematch',status:'PASS',scope:'Diagnostic-only delay with actual Worker termination; no fake clock',old:summarize(old),ended:summarize(ended),rematch:summarize(rematch)});save();await delayed.context.close();
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);result.status='PASS';result.finishedAt=new Date().toISOString();
}catch(error){result.status='FAIL';result.failure=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:String(error);throw error;}
finally{
 result.errors=errors;result.externalRequests=requests;
 try{
  await browser.close();result.browserClosedAt=new Date().toISOString();
  result.sourcesAfter=sourceMap();result.nodeAfter=identity(process.execPath);result.chromiumAfter=identity(executable);result.compilerAfter=identity(compilerBefore.path);
  assert.deepEqual(result.sourcesAfter,before);assert.deepEqual(result.nodeAfter,nodeBefore);assert.deepEqual(result.chromiumAfter,browserBefore);assert.deepEqual(result.compilerAfter,compilerBefore);
 }catch(error){
  result.status='FAIL';result.closureOrGuardFailure=error instanceof Error?{name:error.name,message:error.message,stack:error.stack}:String(error);throw error;
 }finally{save();}
}
console.log('Real offline Worker public observation/output/RNG replay, actual UI and controlled fallback/cancellation checks pass; no FPS claim.');
