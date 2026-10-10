import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import vm from 'node:vm';
const path=resolve('node_modules/playwright-core/lib/generated/clockSource.js');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const generated=await readFile(path,'utf8'),packageJson=JSON.parse(await readFile('node_modules/playwright-core/package.json','utf8'));
const loader=vm.createContext({module:{exports:{}},console});
vm.runInContext(generated,loader,{filename:path,timeout:1000});
const shippedSource=loader.module.exports.source;
assert.equal(typeof shippedSource,'string');
const realm=vm.createContext({module:{exports:{}},console});
vm.runInContext(shippedSource,realm,{filename:'unmodified-playwright-generated-clock-source',timeout:1000});
// The generated exports contain accessor functions, exactly as its server
// wrapper calls module.exports.inject() to obtain the injector.
const ClockController=realm.module.exports.ClockController();
assert.equal(typeof ClockController,'function');
const report={diagnostic:true,acceptance:false,forcedSchedule:true,startedAt:new Date().toISOString(),pid:process.pid,dependency:{name:packageJson.name,version:packageJson.version,path,generatedSha256:hash(generated),embeddedSourceSha256:hash(shippedSource)},diagnosticRunnerSha256:hash(await readFile(new URL(import.meta.url))),method:'Evaluate the pinned dependency generated file and its embedded source unchanged in VMs. Supply an embedder whose timeout queue exposes continuation resolvers. Force overlapping public runFor(100) and fastForward(10000) operations, then compare sequential nonoverlap. This shows a possible scheduler mechanism; it does not prove the schedule in every hosted browser failure and is not game acceptance.',cases:[],complete:false};
console.log(JSON.stringify({pid:process.pid,dependency:report.dependency,startedAt:report.startedAt}));
function fresh(label){
 const events=[],queue=[];let nextId=0;
 const embedder={dateNow:()=>0,performanceNow:()=>0,setTimeout:(callback,delay)=>{const pending={id:++nextId,callback,delay:delay??null,cancelled:false};queue.push(pending);events.push({event:'continuationQueued',id:pending.id,delay:pending.delay});return ()=>{pending.cancelled=true;};},setInterval:()=>{throw new Error('Unexpected native interval: the control directly schedules a clock-owned interval');}};
 const controller=new ClockController(embedder);controller.install(0);
 controller.addTimer({type:'Interval',delay:100,func:()=>events.push({event:'intervalCallback',performanceNow:controller.performanceNow(),wallTime:controller.now()})});
 return {label,events,queue,controller,read:stage=>{const observation={event:'observation',stage,performanceNow:controller.performanceNow(),wallTime:controller.now()};events.push(observation);return observation;},release:id=>{const pending=queue.find(item=>item.id===id);assert(pending&&!pending.cancelled,`missing continuation ${id}`);events.push({event:'continuationReleased',id,performanceNow:controller.performanceNow()});pending.callback();}};
}
try{
 const overlap=fresh('forced overlap; newer completion before older completion');
 overlap.read('initial');const older=overlap.controller.runFor(100);assert.equal(overlap.queue.length,1);overlap.read('older callback at100 yielded');
 const newer=overlap.controller.fastForward(10000);assert.equal(overlap.queue.length,2);overlap.read('newer callback at10100 yielded');
 overlap.release(2);await newer;const afterNewer=overlap.read('newer run complete');
 overlap.release(1);await older;const afterOlder=overlap.read('older run complete');
 const callbacks=overlap.events.filter(item=>item.event==='intervalCallback').map(item=>item.performanceNow);
 assert.deepEqual(callbacks,[100,10100]);assert.equal(afterNewer.performanceNow,10100);assert.equal(afterOlder.performanceNow,100);
 report.cases.push({label:overlap.label,callbacks,afterNewer,afterOlder,rollbackMs:afterNewer.performanceNow-afterOlder.performanceNow,events:overlap.events,expectedMechanismObserved:true});
 const sequential=fresh('sequential nonoverlap control');
 sequential.read('initial');const first=sequential.controller.runFor(100);assert.equal(sequential.queue.length,1);sequential.release(1);await first;sequential.read('first run complete');
 const second=sequential.controller.fastForward(10000);assert.equal(sequential.queue.length,2);sequential.release(2);await second;const final=sequential.read('second run complete');
 const sequentialCallbacks=sequential.events.filter(item=>item.event==='intervalCallback').map(item=>item.performanceNow);
 assert.deepEqual(sequentialCallbacks,[100,10100]);assert.equal(final.performanceNow,10100);
 report.cases.push({label:sequential.label,callbacks:sequentialCallbacks,final,events:sequential.events,controlPreservedTime:true});
 assert.equal(hash(await readFile(path)),report.dependency.generatedSha256,'Dependency file changed');report.complete=true;
}catch(error){report.error=String(error);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await writeFile('.work/clock-overlap-diagnostic.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({complete:report.complete,cases:report.cases,error:report.error,finishedAt:report.finishedAt}));}
