// Private complete-byte parser comparison; this is not the delivered offline page.
import {createServer} from 'node:http';
import {createReadStream} from 'node:fs';
import {readFile,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {once} from 'node:events';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';
const directory=resolve('.work/american-ready-private');
const manifest=JSON.parse(await readFile(directory+'/delta-controls.json','utf8'));
assert.equal(manifest.status,'PASS');
const initialStat=await stat(manifest.basePath);
assert.equal(initialStat.size,manifest.baseBytes);
assert.equal(manifest.baseBytes,1390845993);
assert.equal(manifest.baseSha256,'5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801');
const sameIdentity=value=>['dev','ino','size','mtimeMs','ctimeMs'].every(key=>value[key]===initialStat[key]);
const expected=[
 {kind:'copy',start:0,end:manifest.bootstrap.start},
 {kind:'insert',path:'candidate-bootstrap.js'},
 {kind:'copy',start:manifest.bootstrap.end,end:manifest.americanSignalInsertionOffset},
 {kind:'insert',path:'american-ready-marker.html'},
 {kind:'copy',start:manifest.americanSignalInsertionOffset,end:manifest.baseBytes},
];
assert.equal(manifest.bootstrap.start,12092);assert.equal(manifest.bootstrap.end,12231912);
assert.equal(manifest.americanSignalInsertionOffset,48753284);
assert.equal(manifest.operations.length,expected.length);
let outputOffset=0;
for(let index=0;index<expected.length;index++){
 const row=manifest.operations[index],topology=expected[index];
 for(const [key,value] of Object.entries(topology))assert.equal(row[key],value);
 assert.equal(row.outputOffset,outputOffset);
 assert(Number.isSafeInteger(row.bytes)&&row.bytes>0&&/^[0-9a-f]{64}$/.test(row.sha256));
 if(row.kind==='copy')assert.equal(row.bytes,row.end-row.start);
 outputOffset+=row.bytes;
}
assert.equal(outputOffset,manifest.resultBytes);
const digest=createHash('sha256');
for await(const chunk of createReadStream(manifest.basePath))digest.update(chunk);
assert.equal(digest.digest('hex'),manifest.baseSha256);
const inserted=new Map();
for(const row of manifest.operations.filter(row=>row.kind==='insert')){
 assert(['candidate-bootstrap.js','american-ready-marker.html'].includes(row.path));
 const data=await readFile(directory+'/'+row.path);
 assert.equal(data.length,row.bytes);assert.equal(createHash('sha256').update(data).digest('hex'),row.sha256);
 inserted.set(row.path,data);
}
async function copy(response,start,end,signal,whole,expectedSha){
 if(end===start)return 0;
 const input=createReadStream(manifest.basePath,{start,end:end-1,highWaterMark:262144,signal});
 let bytes=0;const digest=createHash('sha256');
 for await(const chunk of input){bytes+=chunk.length;digest.update(chunk);whole.update(chunk);if(!response.write(chunk))await once(response,'drain',{signal});}
 const actualSha=digest.digest('hex');assert.equal(actualSha,expectedSha);
 return bytes;
}
const logs=[];
const server=createServer(async(request,response)=>{
 const variant=request.url==='/baseline.html'?'baseline':request.url==='/candidate.html'?'candidate':null;
 if(!variant){response.writeHead(404);response.end('No external resources are served');return;}
 const abort=new AbortController();let finished=false;response.on('close',()=>{if(!finished)abort.abort();});
 const startedAt=new Date().toISOString();let bytes=0;
 const whole=createHash('sha256');
 try{
  assert(sameIdentity(await stat(manifest.basePath)),'Exact canonical source identity changed');
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':String(variant==='baseline'?manifest.baseBytes:manifest.resultBytes),'Cache-Control':'no-store'});
  if(variant==='baseline')bytes=await copy(response,0,manifest.baseBytes,abort.signal,whole,manifest.baseSha256);
  else for(const row of manifest.operations){
   assert.equal(bytes,row.outputOffset);
   if(row.kind==='copy')bytes+=await copy(response,row.start,row.end,abort.signal,whole,row.sha256);
   else{const data=inserted.get(row.path);bytes+=data.length;whole.update(data);if(!response.write(data))await once(response,'drain',{signal:abort.signal});}
  }
  assert.equal(bytes,variant==='baseline'?manifest.baseBytes:manifest.resultBytes);
  const wholeSha256=whole.digest('hex');assert.equal(wholeSha256,variant==='baseline'?manifest.baseSha256:manifest.resultSha256);
  assert(sameIdentity(await stat(manifest.basePath)),'Exact canonical source identity changed during emission');
  finished=true;response.end();logs.push({variant,startedAt,closedAt:new Date().toISOString(),bytes,wholeSha256,status:'EMITTED_VERIFIED'});
 }catch(error){logs.push({variant,startedAt,closedAt:new Date().toISOString(),bytes,status:'ERROR',error:String(error)});response.destroy(error);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
console.log(JSON.stringify({status:'LISTENING',port:server.address().port,manifestSha256:createHash('sha256').update(await readFile(directory+'/delta-controls.json')).digest('hex'),scope:'Private honest full-byte HTTP parser diagnostic only; no reduced/intercepted corpus or final offline acceptance'}));
async function close(){
 server.close();server.closeAllConnections();
 const final=await stat(manifest.basePath);assert(sameIdentity(final));
 const finalDigest=createHash('sha256');for await(const chunk of createReadStream(manifest.basePath))finalDigest.update(chunk);
 const finalSourceSha256=finalDigest.digest('hex');assert.equal(finalSourceSha256,manifest.baseSha256);
 console.log(JSON.stringify({status:'CLOSED',closedAt:new Date().toISOString(),finalSourceSha256,requests:logs}));
}
process.once('SIGTERM',close);process.once('SIGINT',close);
