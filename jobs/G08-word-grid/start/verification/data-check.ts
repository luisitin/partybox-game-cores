import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {join,relative} from 'node:path';
import Ajv from 'ajv';
import {gameManifestSchema} from '../../../../contract/contract';
import {game} from '../games/shake-up/server';
import {jsonSafe} from '../games/shake-up/__tests__/helpers';
import {hasWord,isSorted} from '../games/shake-up/server/dict';
import type {State} from '../games/shake-up/server/types';
const root=process.cwd(),ajv=new Ajv({allErrors:true,strict:false});
const schema=JSON.parse(readFileSync('start/verification/data.schema.json','utf8'));
ajv.addSchema(schema);assert(ajv.validateSchema(schema));
const walk=(p:string):string[]=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(p,e.name)):e.name.endsWith('.json')?[join(p,e.name)]:[]);
let checked=0;
for(const path of walk('start')) {
  const data=JSON.parse(readFileSync(path,'utf8'));assert.equal(jsonSafe(data),null,path);
  if(path.endsWith('data.schema.json')) {assert(ajv.validateSchema(data));checked++;continue;}
  const kind=path.endsWith('cube-study.json')?'study':path.endsWith('bot-study.json')?'calibration':path.endsWith('seeded-report.json')?'seeded':path.endsWith('mutation-report.json')?'mutations':path.endsWith('fixture-rebuild-report.json')?'fixtureRebuild':path.endsWith('rebuild-report.json')?'rebuild':path.endsWith('spot-checks.json')?'spots':path.includes('/fixtures/')?'fixture':path.includes('/assets/')?'asset':path.endsWith('manifest.es.json')?'translations':path.endsWith('manifest.json')?'manifest':path.endsWith('cube-candidates.json')?'candidates':path.endsWith('original-files.json')?'original':path.endsWith('source-receipts.json')?'receipts':path.includes('/content/cubes.')?'cubes':path.includes('/content/bot-words.')?'bots':path.includes('/content/')?'words':path.includes('/research/')||path.includes('/verification/')?'report':null;
  assert(kind,`No schema assigned: ${path}`);const validate=ajv.getSchema(`${schema.$id}#/definitions/${kind}`)!;assert(validate(data),`${path}: ${JSON.stringify(validate.errors)}`);
  if(kind==='manifest'){assert.deepEqual(gameManifestSchema.parse(data),game.manifest);}
  if(kind==='fixture') {
    const s=data as State;assert.deepEqual(s.order.slice().sort(),Object.keys(s.players).sort());assert(s.grid.length===s.cfg.size**2);assert(Buffer.byteLength(JSON.stringify(s))<=256*1024);
    assert.equal(jsonSafe(game.tvView(s)),null);for(const id of s.order)assert.equal(jsonSafe(game.controllerView(s,id)),null);
    assert((game.results(s)!==null)===(s.phase.id==='done'));
  }
  if(kind==='words')assert(isSorted(data),`${path}: sorted unique words`);
  checked++;
}
for(const lang of ['en','es']) {
  const words=JSON.parse(readFileSync(`start/games/shake-up/content/words.${lang}.json`,'utf8')) as string[];
  const bots=JSON.parse(readFileSync(`start/games/shake-up/content/bot-words.${lang}.json`,'utf8')) as Record<string,string[]>;
  for(const [skill,list] of Object.entries(bots)){assert(isSorted(list));assert(list.every(w=>hasWord(words,w)),`${lang} ${skill} outside dictionary`);}
}
const study=JSON.parse(readFileSync('start/research/cube-study.json','utf8'));assert.equal(study.differentialCases,10000);assert.equal(study.results.length,5);for(const row of study.results){assert.equal(row.grids,10000);assert.equal(row.q.invalidQuPaths,0);}
console.log(JSON.stringify({jsonFiles:checked,schemaValidated:true,actualContractManifest:true,allPhaseFixtures:true}));
