// Host verification only. Every start/ input and host checker plus the actual root contract is guarded.
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
export const sha256=(data:Uint8Array|string)=>createHash('sha256').update(data).digest('hex');
const walk=(path:string):string[]=>readdirSync(path,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(path,e.name)):[join(path,e.name)]);
export function sourceHashes():Record<string,string>{
 const paths=[...walk('start'),...walk('../../contract'),'play.html','package.json','package-lock.json','tsconfig.json','vitest.config.ts'].sort();
 return Object.fromEntries(paths.map(path=>[path.replaceAll('\\','/'),sha256(readFileSync(path))]));
}
export interface FrameResult {profile:string;lang:string;grid:string;width:number;height:number;cpuThrottle:number;frames:number;intervalsMs:number[];milliseconds:number;fps:number;meanMs:number;p95Ms:number;p99Ms:number;maxMs:number;frameFiltering:'none';rawFile:string;attemptNonce:string|null;capturing:false;}
export function summarize(intervalsMs:number[]):Pick<FrameResult,'frames'|'milliseconds'|'fps'|'meanMs'|'p95Ms'|'p99Ms'|'maxMs'>{
 const sorted=[...intervalsMs].sort((a,b)=>a-b),milliseconds=intervalsMs.reduce((a,b)=>a+b,0),meanMs=milliseconds/intervalsMs.length;
 return{frames:intervalsMs.length,milliseconds,meanMs,fps:1000/meanMs,p95Ms:sorted[Math.ceil(sorted.length*.95)-1]!,p99Ms:sorted[Math.ceil(sorted.length*.99)-1]!,maxMs:sorted.at(-1)!};
}
