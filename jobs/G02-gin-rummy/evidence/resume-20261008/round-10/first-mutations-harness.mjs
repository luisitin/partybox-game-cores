import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile,rm} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const cases=[
 ['M01','cards','c%13+1','c%13+2','wrong rank'],
 ['M02','cards','Math.floor(c/13)','Math.floor(c/12)','wrong suit'],
 ['M03','cards','Math.min(rank(c),10)','Math.min(rank(c),11)','wrong face value'],
 ['M04','cards','cards.length<3','cards.length<4','reject three-card meld'],
 ['M05','cards','cards.length<=4&&ranks','cards.length<=3&&ranks','reject four-card set'],
 ['M06','cards','r===ranks[0]+i','r===ranks[0]+i+1','off-by-one run'],
 ['M07','cards','if(r-start>=2)','if(r-start>=3)','omit three-card candidate runs'],
 ['M08','cards','if(indices.length>=3)','if(indices.length>=4)','omit three-of-kind candidates'],
 ['M09','cards','score<best','score>best','maximize instead of minimize'],
 ['M10','cards','if(!canLayOff)','if(canLayOff)','invert Gin layoff prohibition'],
 ['M11','cards','if(validMeld(extended))','if(false && validMeld(extended))','omit layoffs'],
 ['M12','core',"mustStock:passes===2","mustStock:false",'allow discard after two opening passes'],
 ['M13','core',"state.phase.id==='upcard'&&input.source!=='discard'","false && input.source!=='discard'",'allow opening stock draw'],
 ['M14','core','input.card===state.drawnDiscard','false','allow immediate returned upcard'],
 ['M15','core','if(state.stock.length<=2)','if(state.stock.length<=1)','continue past two stock cards'],
 ['M16','core','defenderDeadwood<=knockerDeadwood','defenderDeadwood<knockerDeadwood','deny tie undercut'],
 ['M17','core','config.ginBonus+defenderDeadwood','config.ginBonus-defenderDeadwood','subtract opponent Gin deadwood'],
 ['M18','core','config.bigGinBonus+defenderDeadwood','config.ginBonus+defenderDeadwood','Big Gin wrong bonus'],
 ['M19','core','config.undercutBonus+knockerDeadwood-defenderDeadwood','config.undercutBonus+defenderDeadwood-knockerDeadwood','reverse undercut difference'],
 ['M20','core','(defenderDeadwood-knockerDeadwood)*multiplier','(defenderDeadwood+knockerDeadwood)*multiplier','wrong knock difference'],
 ['M21','core','(config.bigGinBonus+defenderDeadwood)*multiplier','config.bigGinBonus+defenderDeadwood','ignore double Big Gin'],
 ['M22','core','state.config.aceGin?0:value(initialUpcard)','state.config.aceGin?1:value(initialUpcard)','Oklahoma ace wrong limit'],
 ['M23','core','suit(initialUpcard)===3','suit(initialUpcard)===2','double hearts instead of spades'],
 ['M24','core','event.startedAt===state.phase.startedAt','true','accept stale timer'],
 ['M25','core','state.phase.deadline+delta','state.phase.deadline','resume omits pause duration'],
 ['M26','core',"...appendLog(state,'pass'),turn:other(state),openingPasses:passes,mustStock:passes===2","...appendLog({...state,turn:other(state),openingPasses:passes,mustStock:passes===2},'pass')",'attribute opening Pass to next player']
];
const baseline=spawnSync(process.execPath,['--test','tests/rules.test.mjs'],{encoding:'utf8'});
assert.equal(baseline.status,0,baseline.stdout+baseline.stderr);
const originals={cards:await readFile('src/cards.ts','utf8'),core:await readFile('src/core.ts','utf8')};
await mkdir('.work/mutants',{recursive:true});const reports=[];
for(const [id,file,from,to,description]of cases){
 assert.notEqual(from,to);assert(originals[file].includes(from),id+' source target missing');
 const folder=resolve('.work/mutants/'+id);await mkdir(folder+'/tests',{recursive:true});await mkdir(folder+'/dist',{recursive:true});
 for(const name of ['helpers.mjs','rules.test.mjs','public-log.test.mjs'])await copyFile('tests/'+name,folder+'/tests/'+name);
 const mutated=originals[file].replace(from,to);
 const plugin={name:'one-real-source-mutation',setup(b){b.onLoad({filter:new RegExp('/src/'+file+'\\.ts$')},()=>({contents:mutated,loader:'ts'}));}};
 const alias={zod:resolve('node_modules/zod')};
 let compiled=true,error=null;
 try {
  await build({entryPoints:['src/core.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:folder+'/dist/core.mjs',alias,plugins:[plugin],logLevel:'silent'});
  await build({entryPoints:['src/cards.ts'],bundle:true,platform:'node',format:'esm',target:'es2022',outfile:folder+'/dist/cards.mjs',plugins:[plugin],logLevel:'silent'});
  await copyFile('dist/contract.mjs',folder+'/dist/contract.mjs');
 }catch(e){compiled=false;error=String(e);}
 let killed=false,output='';
 if(compiled){const run=spawnSync(process.execPath,['--test',folder+'/tests/rules.test.mjs',...(id==='M26'?[folder+'/tests/public-log.test.mjs']:[])],{encoding:'utf8',timeout:30000});
  output=run.stdout+run.stderr;
  killed=run.status!==0&&/AssertionError|ERR_ASSERTION/.test(output)&&!/SyntaxError|ERR_MODULE_NOT_FOUND/.test(output);
 }
 await writeFile(folder+'/test.log',output||String(error));
 reports.push({id,file,from,to,description,compiled,killed,error,actualAssertionFailure:killed});
 console.log(id+' '+(killed?'caught':compiled?'SURVIVED':'COMPILE FAILURE')+' '+description);
}
await writeFile('evidence/mutations.json',JSON.stringify({method:'one real source edit, compile, execute unchanged baseline-passing rules tests',planted:cases.length,caught:reports.filter(r=>r.killed).length,cases:reports},null,2)+'\n');
assert.equal(reports.length,26);assert(reports.every(r=>r.compiled),'compile failures are not kills');assert(reports.filter(r=>r.killed).length>=24);
