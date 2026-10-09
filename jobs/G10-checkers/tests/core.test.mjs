import test from 'node:test';
import {pathToFileURL} from 'node:url';
import {coreCases} from './core-cases.mjs';
const core=await import(process.env.G10_CORE?pathToFileURL(process.env.G10_CORE).href:'../dist/core.mjs');
for(const {name,run} of coreCases(core))test(name,run);
