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
async function copy(response,start,end,signal){
 if(end===start)return 0;
 const input=createReadStream(manifest.basePath,{start,end:end-1,highWaterMark:262144,signal});
 let bytes=0;
 for await(const chunk of input){bytes+=chunk.length;if(!response.write(chunk))await once(response,'drain',{signal});}
 return bytes;
}
const logs=[];
const server=createServer(async(request,response)=>{
 const variant=request.url==='/baseline.html'?'baseline':request.url==='/candidate.html'?'candidate':null;
 if(!variant){response.writeHead(404);response.end('No external resources are served');return;}
 const abort=new AbortController();let finished=false;response.on('close',()=>{if(!finished)abort.abort();});
 const startedAt=new Date().toISOString();let bytes=0;
 try{
  assert.equal((await stat(manifest.basePath)).size,initialStat.size);
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Content-Length':String(variant==='baseline'?manifest.baseBytes:manifest.resultBytes),'Cache-Control':'no-store'});
  if(variant==='baseline')bytes=await copy(response,0,manifest.baseBytes,abort.signal);
  else for(const row of manifest.operations){
   if(row.kind==='copy')bytes+=await copy(response,row.start,row.end,abort.signal);
   else{const data=inserted.get(row.path);bytes+=data.length;if(!response.write(data))await once(response,'drain',{signal:abort.signal});}
  }
  assert.equal(bytes,variant==='baseline'?manifest.baseBytes:manifest.resultBytes);
  finished=true;response.end();logs.push({variant,startedAt,closedAt:new Date().toISOString(),bytes,status:'COMPLETE'});
 }catch(error){logs.push({variant,startedAt,closedAt:new Date().toISOString(),bytes,status:'ERROR',error:String(error)});response.destroy(error);}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
console.log(JSON.stringify({status:'LISTENING',port:server.address().port,manifestSha256:createHash('sha256').update(await readFile(directory+'/delta-controls.json')).digest('hex'),scope:'Private honest full-byte HTTP parser diagnostic only; no reduced/intercepted corpus or final offline acceptance'}));
async function close(){
 server.close();server.closeAllConnections();
 const final=await stat(manifest.basePath);assert.equal(final.size,initialStat.size);assert.equal(final.mtimeMs,initialStat.mtimeMs);
 console.log(JSON.stringify({status:'CLOSED',closedAt:new Date().toISOString(),requests:logs}));
}
process.once('SIGTERM',close);process.once('SIGINT',close);
