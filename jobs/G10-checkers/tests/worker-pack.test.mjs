import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {rawZipMember,pack,workerBootstrap,sha256} from '../scripts/corpus-pack.mjs';
import * as core from '../dist/core.mjs';
import {searchMove} from '../dist/bots.mjs';
import {positionState} from './helpers.mjs';
import {evidence} from './evidence.mjs';
const data=name=>readFileSync(new URL('../data/'+name,import.meta.url));
const plain=value=>structuredClone(value);

test('native decompression reproduces exact installed corpora and preserves queued first requests',async()=>{
  const original=rawZipMember(data('chinook/DB6.zip'),'DB6'),payloads=[{name:'chinook',raw:data('chinook/DB6.bin'),compressed:original.compressed}];
  for(const name of ['db2','db3','db4','db5','tunstall-v2']){const raw=data('international/'+name+'.bin');payloads.push({name,raw,compressed:pack(raw).compressed});}
  const reports=[];
  for(const {name,raw,compressed} of payloads){
    const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    const recovered=new Uint8Array(await new Response(stream).arrayBuffer());assert.equal(sha256(recovered),sha256(raw));
    reports.push({name,bytes:recovered.length,sha256:sha256(recovered)});
  }
  for(const variant of ['american','international']){
    const length=variant==='american'?32:50,board=Array(length).fill(0);board[0]=-2;board[2]=-2;board[length-7]=2;board[length-1]=2;
    const position=positionState(core,board,variant),before=structuredClone(position),messages=[];
    let finish,fail;const result=new Promise((resolve,reject)=>{finish=resolve;fail=reject;});
    const scope={onmessage:null,postMessage(value){messages.push(plain(value));if(value.error)fail(new Error(value.error));if(value.id===123)finish(plain(value));}};
    const source=readFileSync(new URL('../dist/worker-'+variant+'.mjs',import.meta.url),'utf8');
    vm.runInNewContext(source,{self:scope,atob,Blob,Response,DecompressionStream,Uint8Array,DataView},{timeout:10000});
    scope.onmessage({data:{id:123,position,settings:position.settings,skill:'sharp',cursor:{seed:12345,step:0}}});
    const message=await result,rng=core.createRng(12345),expected=searchMove(position,position.settings,rng,'sharp');
    assert.deepEqual(message.report,expected);assert.deepEqual(message.cursor,rng.state());assert.deepEqual(position,before);
    assert.equal(messages[0].ready,true);assert(expected.corpusHits>0);reports.push({variant,report:expected,cursor:rng.state(),workerSha256:sha256(source),queuedFirstRequest:true});
  }
  evidence('worker-pack.json',{reports,scope:'Native local decompression exact source bytes; same offline worker code queues initial input and matches full general node Strong report/cursor in both variants'});
});

test('bootstrap reports unsupported native decompression without losing a pending caller silently',async()=>{
  const messages=[],scope={onmessage:null,postMessage(value){messages.push(plain(value));}};
  vm.runInNewContext(workerBootstrap('self.onmessage=()=>{};',[{name:'small',compressed:pack(Buffer.from('actual input')).compressed}]),{self:scope,atob,Blob,Response,Uint8Array});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(messages.length,1);assert.match(messages[0].error,/could not be prepared/);
});
