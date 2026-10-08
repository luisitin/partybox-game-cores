import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {scanPureSource} from '../scripts/purity.mjs';

test('purity scanner distinguishes actual host identifiers from comments, strings and local draw windows',()=>{
  const allowed=[
    'const value = items.map(window => window.kind);',
    'const value = "window Date.now Math.random fetch"; // document setTimeout',
    'function calculate({window}:{window:{limit:number}}){return window.limit;}',
    'const descriptors={window:1,document:2};',
    'const staticLookup=Object.freeze([1,2,3]);',
  ];
  for(const source of allowed)assert.deepEqual(scanPureSource(source),[],source);
  const forbidden=[
    'const value=window.location;',
    'const value=items.map(window=>window.kind); document.createElement("x");',
    'const value=Date.now();','const value=Math.random();',
    'setTimeout(()=>{},10);','const response=fetch("https://invalid.invalid");',
    'const value=globalThis["fetch"];','import fs from "node:fs";',
    'const value=import("./runtime.mjs");','let mutableGameCounter=0;',
    'const value="a".localeCompare("b");',
  ];
  for(const source of forbidden)assert(scanPureSource(source).length>0,source);
});

test('all delivered pure production modules pass AST inspection; host adapters are explicit',()=>{
  for(const name of readdirSync(new URL('../src/',import.meta.url))){
    if(!name.endsWith('.ts')||name.endsWith('.d.ts')||['browser.ts','bot-worker.ts'].includes(name))continue;
    const failures=scanPureSource(readFileSync(new URL('../src/'+name,import.meta.url),'utf8'),name);
    assert.deepEqual(failures,[],name+': '+JSON.stringify(failures));
  }
});
