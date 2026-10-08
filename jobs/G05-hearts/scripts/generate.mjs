import {readFileSync,writeFileSync,mkdirSync,readdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {z} from 'zod';
import {execFileSync} from 'node:child_process';
import {game,start,eventFor,propertySeeds} from '../tests/helpers.mjs';
import {saveSchema} from '../.build/jobs/G05-hearts/src/save.js';
import {stateSchema} from '../.build/jobs/G05-hearts/src/schema.js';
import {gameManifestSchema} from '../.build/contract-validation.mjs';
if(!process.argv.includes('--fixtures-only'))execFileSync(process.execPath,['scripts/leagues.mjs'],{stdio:'inherit'});
const json=(path,x)=>writeFileSync(path,JSON.stringify(x,null,2)+'\n');
for(const dir of ['fixtures','data','schemas'])mkdirSync(dir,{recursive:true});
let s=start(103,4,{target:25});const fixtures={};
for(let k=0;k<30_000;k++){
 if(!(s.phase.id in fixtures)||s.phase.id==='hand')fixtures[s.phase.id]=s;
 if(s.phase.id==='done')break;s=game.reduce(s,eventFor(s));
}
if(s.phase.id!=='done')throw new Error('fixture game stalled');
for(const phase of game.phases)json(`fixtures/${phase}.json`,fixtures[phase]);
json('manifest.json',game.manifest);json('data/property-seeds.json',propertySeeds());
const frames=z.object({width:z.number().int().positive(),height:z.number().int().positive(),cpu:z.number().positive(),warmupFrames:z.number().int().nonnegative(),interaction:z.string(),frames:z.number().int().positive(),meanMs:z.number().positive(),p95Ms:z.number().positive(),maxMs:z.number().positive(),fps:z.number().positive(),overflow:z.boolean()}).strict();
const visual=z.object({freshDeals:z.boolean().optional(),resumedSavedGame:z.boolean().optional(),corruptSaveRejected:z.boolean().optional(),schemaVersion:z.literal(1),chrome:z.string(),fileOpened:z.boolean(),serving:z.string(),desktop:frames,phone:frames,reducedMotion:z.boolean(),externalRequests:z.number().int().nonnegative(),runtimeExceptions:z.number().int().nonnegative(),completedPlayerCounts:z.array(z.number().int().min(3).max(6)).length(4),privateHandoff:z.boolean(),passing:z.boolean(),mouseCard:z.boolean(),touchCard:z.boolean(),keyboardCard:z.boolean(),keyboardFocus:z.boolean(),longNamesFit:z.boolean(),videoBytes:z.number().int().positive().max(10_000_000)}).strict();
const leagueRow=z.object({league:z.string(),games:z.literal(2000),seedStart:z.number().int(),seedEnd:z.number().int(),players:z.literal(4),target:z.literal(100),moon:z.literal('add'),jack:z.literal(false),wins:z.number().int().min(0).max(2000),ties:z.number().int().min(0).max(2000),headToHeadRate:z.number().min(0).max(1),wilson95:z.tuple([z.number(),z.number()]),firstPlaceShare:z.number().min(0).max(1),focalMean:z.number().finite(),rivalMean:z.number().finite(),steps:z.number().int().positive(),stateHash:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
const leagues=z.object({schemaVersion:z.literal(1),method:z.string(),leagues:z.array(leagueRow).length(2)}).strict();
const tooling=z.union([
 z.object({name:z.literal('partybox-hearts'),version:z.literal('1.0.0'),private:z.literal(true),type:z.literal('module'),scripts:z.record(z.string(),z.string()),dependencies:z.object({zod:z.literal('4.6.5')}).strict(),devDependencies:z.object({typescript:z.literal('5.9.3'),esbuild:z.literal('0.25.12'),ajv:z.literal('8.17.1')}).strict()}).strict(),
 z.object({name:z.literal('partybox-hearts'),version:z.literal('1.0.0'),lockfileVersion:z.literal(3),requires:z.literal(true),packages:z.record(z.string(),z.record(z.string(),z.any()))}).strict(),
 z.object({compilerOptions:z.object({target:z.literal('ES2022'),module:z.literal('ES2022'),moduleResolution:z.literal('Bundler'),strict:z.literal(true),noUncheckedIndexedAccess:z.literal(true),noUnusedLocals:z.literal(true),noUnusedParameters:z.literal(true),noEmitOnError:z.literal(true),skipLibCheck:z.literal(true),rootDir:z.literal('../..'),outDir:z.literal('.build'),lib:z.array(z.string()),baseUrl:z.literal('.'),paths:z.record(z.string(),z.array(z.string()))}).strict(),include:z.array(z.string())}).strict(),
]);
for(const [name,schema]of Object.entries({save:saveSchema,tooling,state:stateSchema,manifest:gameManifestSchema,seeds:z.array(z.number().int().min(0).max(0xffffffff)).length(1003),visual,leagues}))json(`schemas/${name}.schema.json`,z.toJSONSchema(schema,{target:'draft-2020-12',unrepresentable:'any'}));
// Source receipts are actual observations and must remain unchanged by regeneration.
const files=['package.json','package-lock.json','tsconfig.json','research-access.json','manifest.json',...readdirSync('data').filter(f=>f.endsWith('.json')).map(f=>'data/'+f),...readdirSync('fixtures').map(f=>'fixtures/'+f),...readdirSync('schemas').map(f=>'schemas/'+f)];
if(existsSync('play.html'))files.push('play.html');
if(existsSync('media'))files.push(...readdirSync('media').filter(f=>/\.(webm|mp4|png|json)$/.test(f)).map(f=>'media/'+f));
writeFileSync('SHA256SUMS.txt',files.sort().map(f=>`${createHash('sha256').update(readFileSync(f)).digest('hex')}  ${f}`).join('\n')+'\n');
console.log(JSON.stringify({generated:files.length,phases:game.phases,fixtureSeed:103,propertySeeds:1003}));
