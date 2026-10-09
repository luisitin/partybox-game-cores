// UI transport only. Game logic, search budget and deterministic seed stay in core.ts.
import {inputSchema,sameInput,type Observation,type Input} from './core.ts';
import type {StrongRequest} from './strong-worker.ts';
export interface WorkerPort {
 postMessage(request:StrongRequest):void;terminate():void;
 onmessage:((event:MessageEvent<unknown>)=>void)|null;
 onerror:((event:ErrorEvent)=>void)|null;
 onmessageerror:((event:MessageEvent<unknown>)=>void)|null;
}
type Pending={id:number;observation:Observation;current:()=>boolean;accept:(input:Input)=>void;fallback:()=>void};
export class StrongBot {
 private port:WorkerPort|null=null;private url:string|null=null;
 private pending:Pending|null=null;private serial=0;private disabled=false;
 private watchdog:ReturnType<typeof setTimeout>|null=null;
 private source:string;private factory:(url:string)=>WorkerPort;
 constructor(source:string,factory:(url:string)=>WorkerPort=url=>new Worker(url)){this.source=source;this.factory=factory;}
 private clear(){if(this.watchdog!==null)clearTimeout(this.watchdog);this.watchdog=null;this.pending=null;}
 private close(){if(this.port){this.port.onmessage=this.port.onerror=this.port.onmessageerror=null;this.port.terminate();this.port=null;}if(this.url!==null)URL.revokeObjectURL(this.url);this.url=null;}
 cancel(){const active=this.pending!==null;this.clear();if(active)this.close();}
 stop(){this.clear();this.close();}
 private fail(){const active=this.pending;this.clear();this.close();this.disabled=true;if(active?.current())active.fallback();}
 request(observation:Observation,seed:number,current:()=>boolean,accept:(input:Input)=>void,fallback:()=>void){
  this.cancel();if(!current())return;if(this.disabled){fallback();return;}
  const id=++this.serial;this.pending={id,observation,current,accept,fallback};
  try{
   if(!this.port){
    this.url=URL.createObjectURL(new Blob([this.source],{type:'text/javascript'}));this.port=this.factory(this.url);
    this.port.onmessage=event=>this.receive(event.data);
    this.port.onerror=event=>{event.preventDefault();this.fail();};
    this.port.onmessageerror=()=>this.fail();
   }
   // Genuine failed/unresponsive-worker fallback. Never reduce policy work or change seed.
   this.watchdog=setTimeout(()=>this.fail(),10_000);
   this.port.postMessage({id,seed,observation});
  }catch{this.fail();}
 }
 private receive(value:unknown){
  const active=this.pending;if(!active)return;
  if(!value||typeof value!=='object')return;
  const reply=value as Record<string,unknown>;if(reply.id!==active.id)return;
  if(!active.current()){this.cancel();return;}
  if(reply.error===true){this.fail();return;}
  const input=inputSchema.safeParse(reply.input);
  if(!input.success||!active.observation.legal.some(i=>sameInput(i,input.data))){this.fail();return;}
  this.clear();active.accept(input.data);
 }
}
