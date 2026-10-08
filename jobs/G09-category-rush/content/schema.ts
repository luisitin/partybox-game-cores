import { z } from 'zod';

const letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','R','S','T','W'] as const;
export const categorySchema = z.object({
  id: z.string().regex(/^[a-z]+(?:-[a-z]+)*-\d{2}$/),
  prompt: z.string().min(15).max(110),
  clarification: z.string().min(20).max(180),
  theme: z.string().regex(/^[a-z]+(?:-[a-z]+)*$/),
  answers: z.partialRecord(z.enum(letters), z.array(z.string().min(2).max(80).regex(/^[a-z0-9][a-z0-9 ,.'()/-]*$/)).min(1).max(40)),
}).strict();

export const categoryPackSchema = z.object({
  schemaVersion: z.literal(1),
  lang: z.literal('en'),
  letters: z.array(z.enum(letters)).length(20),
  categories: z.array(categorySchema).min(300).max(1000),
}).strict();
