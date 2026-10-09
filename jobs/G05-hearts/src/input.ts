import {number,object,array,literal,discriminatedUnion} from 'zod';
const card=number().int().min(0).max(51);
export const inputSchema=discriminatedUnion('type',[
 object({type:literal('pass'),cards:array(card).length(3)}).strict(),
 object({type:literal('play'),card}).strict(),
 object({type:literal('next')}).strict(),
]);
