// Functional transport controls; these simulated ports/timers are not native FPS proof.
import test from 'node:test';
import assert from 'node:assert/strict';
import {StrongBot,type WorkerPort} from './strong-bot.ts';
import {init,observe,choose,type Input} from './core.ts';
import {createRng} from '../../contract/rng.ts';
import type {StrongRequest} from './strong-worker.ts';
class Port implements WorkerPort {
 onmessage:WorkerPort['onmessage']=null;onerror:WorkerPort['onerror']=null;onmessageerror:WorkerPort['onmessageerror']=null;
 sent:StrongRequest[]=[];terminated=0;
 postMessage(request:StrongRequest){this.sent.push(structuredClone(request));}
 terminate(){this.terminated++;}
 reply(id:number,input:unknown){this.onmessage?.(new MessageEvent('message',{data:{id,input}}));}
}
const observation=()=>{const s=init({players:[0,1].map(i=>({id:`p${i}`,name:`Player ${i+1}`,avatarId:'🙂',connected:true})),settings:{opening:'rotating'},seed:23,now:0});return observe(s,'p0')!;};
test('worker request includes only public observation, and legal reply is accepted once',()=>{
 const port=new Port(),bot=new StrongBot('',()=>port),o=observation(),accepted:Input[]=[];let fallback=0;
 try{
  bot.request(o,771,()=>true,i=>accepted.push(i),()=>fallback++);
  const request=port.sent[0]!;assert.deepEqual(Object.keys(request).sort(),['id','observation','seed']);
  assert.deepEqual(Object.keys(request.observation).sort(),['counts','ends','forced','hand','legal','missed','played','round','scores','seat','settings']);
  assert.equal(request.seed,771);assert.deepEqual(request.observation.hand,o.hand);assert(!('hands' in request.observation));assert(!('stock' in request.observation));
  const expected=choose(o,createRng(request.seed),'sharp')!;
  port.reply(request.id,expected);port.reply(request.id,expected);
  assert.deepEqual(accepted,[expected]);assert.equal(fallback,0);
 }finally{bot.stop();}
});
test('stale state drops actual reply and terminates pending transport without fallback',()=>{
 const port=new Port(),bot=new StrongBot('',()=>port),o=observation();let current=true,accepted=0,fallback=0;
 bot.request(o,33,()=>current,()=>accepted++,()=>fallback++);const req=port.sent[0]!;current=false;port.reply(req.id,o.legal[0]);
 assert.equal(accepted,0);assert.equal(fallback,0);assert.equal(port.terminated,1);bot.stop();
});
test('cancel and rematch reject old IDs without changing new seed or reply',()=>{
 const ports:Port[]=[],bot=new StrongBot('',()=>{const p=new Port();ports.push(p);return p;}),o=observation(),accepted:Input[]=[];let fallback=0;
 try{
  bot.request(o,1,()=>true,i=>accepted.push(i),()=>fallback++);const old=ports[0]!.sent[0]!;bot.cancel();
  assert.equal(ports[0]!.terminated,1);
  bot.request(o,2,()=>true,i=>accepted.push(i),()=>fallback++);const next=ports[1]!.sent[0]!;
  assert(next.id>old.id);ports[1]!.reply(old.id,o.legal[0]);assert.equal(accepted.length,0);
  ports[1]!.reply(next.id,o.legal[0]);assert.deepEqual(accepted,[o.legal[0]]);assert.equal(next.seed,2);assert.equal(fallback,0);
 }finally{bot.stop();}
});
test('unsupported worker uses same captured policy/seed once, with genuine permanent fallback',()=>{
 const o=observation();let factories=0;const accepted:Input[]=[];const bot=new StrongBot('',()=>{factories++;throw new Error('Worker unavailable');});
 const fallback=(seed:number)=>()=>accepted.push(choose(o,createRng(seed),'sharp')!);
 bot.request(o,81,()=>true,i=>accepted.push(i),fallback(81));bot.request(o,82,()=>true,i=>accepted.push(i),fallback(82));
 assert.equal(factories,1);assert.deepEqual(accepted,[choose(o,createRng(81),'sharp'),choose(o,createRng(82),'sharp')]);bot.stop();
});
test('invalid schema, illegal action, worker errors and decoding errors all fall back once',()=>{
 for(const kind of ['schema','illegal','error','messageerror'] as const){
  const port=new Port(),bot=new StrongBot('',()=>port),o=observation();let accepted=0,fallback=0;
  bot.request(o,71,()=>true,()=>accepted++,()=>fallback++);const req=port.sent[0]!;
  if(kind==='schema')port.reply(req.id,{...o.legal[0],extra:true});
  else if(kind==='illegal')port.reply(req.id,{type:'pass'});
  else if(kind==='error')port.onerror?.(new Event('error',{cancelable:true}) as ErrorEvent);
  else port.onmessageerror?.(new MessageEvent('messageerror'));
  assert.equal(accepted,0,kind);assert.equal(fallback,1,kind);assert.equal(port.terminated,1,kind);bot.stop();
 }
});
test('unresponsive worker watchdog and stale watchdog honor actual ten-second boundary',t=>{
 t.mock.timers.enable({apis:['setTimeout']});
 for(const current of [true,false]){
  const port=new Port(),bot=new StrongBot('',()=>port),o=observation();let active=true,fallback=0;
  bot.request(o,91,()=>active,()=>assert.fail('no response exists'),()=>fallback++);
  active=current;t.mock.timers.tick(9999);assert.equal(fallback,0);assert.equal(port.terminated,0);
  t.mock.timers.tick(1);assert.equal(fallback,current?1:0);assert.equal(port.terminated,1);
  t.mock.timers.tick(10000);assert.equal(fallback,current?1:0);bot.stop();
 }
});
