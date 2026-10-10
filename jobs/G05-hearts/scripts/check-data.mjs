import{readFileSync,readdirSync}from'node:fs';import{createHash}from'node:crypto';import assert from'node:assert/strict';import Ajv2020 from'ajv/dist/2020.js';
const parse=p=>JSON.parse(readFileSync(p,'utf8'));const ajv=new Ajv2020({strict:false,allErrors:true});const jsonFiles=[];
function scan(dir=''){for(const e of readdirSync(dir||'.',{withFileTypes:true})){if(['node_modules','.build','.tmp','.git'].includes(e.name))continue;const p=dir?dir+'/'+e.name:e.name;if(e.isDirectory())scan(p);else if(e.name.endsWith('.json'))jsonFiles.push(p);}}scan();
const validators=new Map();for(const p of jsonFiles.filter(p=>p.startsWith('schemas/'))){const schema=parse(p);assert.ok(ajv.validateSchema(schema),p+':'+JSON.stringify(ajv.errors));validators.set(p,ajv.compile(schema));}
for(const p of jsonFiles.filter(p=>!p.startsWith('schemas/'))){
 const key=p.startsWith('fixtures/')?'state':p==='manifest.json'?'manifest':p==='research-access.json'?'research':p==='data/property-seeds.json'?'seeds':p==='data/bot-leagues.json'?'leagues':p.startsWith('media/visual-measurements-')?'visual':['package.json','package-lock.json','tsconfig.json'].includes(p)?'tooling':null;
 assert.ok(key,`${p}: no schema coverage`);const validate=validators.get(`schemas/${key}.schema.json`);assert.ok(validate,`${p}: schema missing`);assert.ok(validate(parse(p)),`${p}: ${JSON.stringify(validate.errors)}`);
}
const sums=readFileSync('SHA256SUMS.txt','utf8').trim().split('\n');const files=new Set();for(const line of sums){const[sha,path]=line.split('  ');assert.match(sha,/^[a-f0-9]{64}$/);assert.ok(!files.has(path),'duplicate hash path');files.add(path);assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),sha,path);}
for(const p of jsonFiles)assert.ok(files.has(p),p+': unhashed JSON');assert.ok(files.has('play.html'),'standalone page hash');for(const f of readdirSync('media'))assert.ok(files.has('media/'+f),'media hash:'+f);
console.log(JSON.stringify({schemaValidatedJson:jsonFiles.length,checksums:sums.length,allJsonCovered:true}));
