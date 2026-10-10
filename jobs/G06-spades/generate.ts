import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {z} from 'zod';
import {deck,rank,suit,cardName} from './cards.ts';
import {manifest} from './core.ts';
import {manifestSchema} from './preflight.ts';
import {stateSchema,deckSchema} from './data-schema.ts';
function generated(){return {deck:deck.map(id=>({id,rank:rank(id),suit:['clubs','diamonds','hearts','spades'][suit(id)]!,label:cardName(id)})),manifest};}
const first=generated(),second=generated();assert.equal(JSON.stringify(first),JSON.stringify(second));deckSchema.parse(first.deck);manifestSchema.parse(first.manifest);
assert.equal(new Set(first.deck.map(c=>c.id)).size,52);for(const color of ['clubs','diamonds','hearts','spades'])assert.equal(first.deck.filter(c=>c.suit===color).length,13);
const files={'deck.json':first.deck,'manifest.json':first.manifest,'state-schema.json':z.toJSONSchema(stateSchema),'deck-schema.json':z.toJSONSchema(deckSchema)};
for(const [path,data] of Object.entries(files)){const bytes=JSON.stringify(data,null,2)+'\n';if(process.argv.includes('--check'))assert.equal(readFileSync(path,'utf8'),bytes);else writeFileSync(path,bytes);}
console.log('52 standard cards/shared manifest/JSON schemas validated and byte-identical regeneration');
