import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { categoryPackSchema } from '../content/schema';

const target = fileURLToPath(new URL('../content/categories.schema.json', import.meta.url));
const data = JSON.stringify(z.toJSONSchema(categoryPackSchema), null, 2) + '\n';
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== data) throw new Error('categories.schema.json needs regeneration');
} else writeFileSync(target, data);
const pack = JSON.parse(readFileSync(new URL('../content/categories.json', import.meta.url), 'utf8'));
categoryPackSchema.parse(pack);
console.log('Draft 2020-12 JSON Schema regenerated and authored category pack validated.');
