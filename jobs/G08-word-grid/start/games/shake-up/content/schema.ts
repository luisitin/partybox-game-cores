// zod schemas for every Shake Up pack. The contract suite validates each pack.
import { z } from 'zod';

const face = z.string().regex(/^(Qu|[A-ZÑ])$/, 'one capital letter, Ñ, or Qu');

export const cubeSchema = z.object({ id: z.string().min(1), faces: z.array(face).length(6) });

export const cubePackSchema = z.object({
  lang: z.enum(['en', 'es']),
  source: z.string(),
  sets: z.object({ '4x4': z.array(cubeSchema).length(16), '5x5': z.array(cubeSchema).length(25) }),
});

const word = z.string().regex(/^[a-zñ]{3,26}$/);
/** Sorted by code unit, no duplicates (checked in the content test, too slow for zod at 600k). */
export const wordListSchema = z.array(word);

export const botWordsSchema = z.object({ easy: z.array(word), normal: z.array(word), sharp: z.array(word) });

export type CubePack = z.infer<typeof cubePackSchema>;
export type BotWords = z.infer<typeof botWordsSchema>;
