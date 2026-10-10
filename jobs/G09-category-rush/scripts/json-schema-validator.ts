/** Dependency-free evaluator for the Draft 2020-12 keywords emitted by this pack.
 * Unsupported validation keywords fail closed; this is not a general-purpose validator.
 */
type Schema = boolean | {
  $schema?: string; title?: string; description?: string;
  type?: string; const?: unknown; enum?: unknown[];
  properties?: Record<string, Schema>; required?: string[];
  additionalProperties?: Schema; propertyNames?: Schema;
  items?: Schema; prefixItems?: Schema[]; minItems?: number; maxItems?: number;
  minLength?: number; maxLength?: number; pattern?: string;
  minimum?: number; maximum?: number; exclusiveMinimum?: number; exclusiveMaximum?: number; anyOf?: Schema[];
};
const keywords = new Set(['$schema','title','description','type','const','enum','properties','required','additionalProperties','propertyNames','items','prefixItems','minItems','maxItems','minLength','maxLength','pattern','minimum','maximum','exclusiveMinimum','exclusiveMaximum','anyOf']);

export function validateJsonSchema(rawSchema: unknown, value: unknown, path = '$'): string[] {
  if (rawSchema === true) return [];
  if (rawSchema === false) return [`${path}: forbidden`];
  if (!rawSchema || typeof rawSchema !== 'object' || Array.isArray(rawSchema)) throw new Error('Invalid JSON Schema');
  const schema = rawSchema as Exclude<Schema, boolean>;
  for (const key of Object.keys(schema)) if (!keywords.has(key)) throw new Error(`Unsupported JSON Schema keyword: ${key}`);
  const errors: string[] = [];
  const kind = Array.isArray(value) ? 'array' : value === null ? 'null' : typeof value;
  const typeMatches=schema.type==='integer'?typeof value==='number'&&Number.isFinite(value)&&Number.isInteger(value):
    schema.type==='number'?typeof value==='number'&&Number.isFinite(value):kind===schema.type;
  if (schema.type && !typeMatches) return [`${path}: expected ${schema.type}`];
  if(schema.anyOf){
    const alternatives=schema.anyOf.map(branch=>validateJsonSchema(branch,value,path));
    if(!alternatives.some(branch=>branch.length===0))errors.push(`${path}: outside anyOf`);
  }
  if (Object.hasOwn(schema, 'const') && JSON.stringify(value) !== JSON.stringify(schema.const)) errors.push(`${path}: wrong constant`);
  if (schema.enum && !schema.enum.some(item => JSON.stringify(item) === JSON.stringify(value))) errors.push(`${path}: outside enum`);
  if(typeof value==='number'){
    if(schema.minimum!==undefined&&value<schema.minimum)errors.push(`${path}: below minimum`);
    if(schema.maximum!==undefined&&value>schema.maximum)errors.push(`${path}: above maximum`);
    if(schema.exclusiveMinimum!==undefined&&value<=schema.exclusiveMinimum)errors.push(`${path}: at or below exclusive minimum`);
    if(schema.exclusiveMaximum!==undefined&&value>=schema.exclusiveMaximum)errors.push(`${path}: at or above exclusive maximum`);
  }
  if (typeof value === 'string') {
    const length = [...value].length;
    if (schema.minLength !== undefined && length < schema.minLength) errors.push(`${path}: too short`);
    if (schema.maxLength !== undefined && length > schema.maxLength) errors.push(`${path}: too long`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: does not match pattern`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    value.forEach((item, index) => {
      const itemSchema = schema.prefixItems?.[index] ?? schema.items;
      if (itemSchema !== undefined) errors.push(...validateJsonSchema(itemSchema, item, `${path}[${index}]`));
    });
  } else if (value && typeof value === 'object') {
    const object = value as Record<string, unknown>;
    for (const key of schema.required ?? []) if (!Object.hasOwn(object, key)) errors.push(`${path}.${key}: missing`);
    for (const [key, item] of Object.entries(object)) {
      if (schema.propertyNames) errors.push(...validateJsonSchema(schema.propertyNames, key, `${path} key ${key}`));
      const propertySchema = schema.properties && Object.hasOwn(schema.properties, key) ? schema.properties[key] : schema.additionalProperties;
      if (propertySchema !== undefined) errors.push(...validateJsonSchema(propertySchema, item, `${path}.${key}`));
    }
  }
  return errors;
}
