/** Development-only schema for the retained actual-core content experiment. */
import { z } from 'zod';

const hash = () => z.string().regex(/^[a-f0-9]{64}$/);
const number = () => z.number();
const sources = z.object({ authored: hash(), data: hash(), generated: hash(), core: hash(), scoring: hash(), matcher: hash(), experiment: hash() }).strict();
const bank = z.object({ categoryId: z.string(), letter: z.string().length(1), appearances: number(), submitted: number(), duplicated: number(), awarded: number(), width: number() }).strict();
const row = z.object({ seed: number(), letter: z.string().length(1), layout: z.array(z.string()).length(12), submitted: number(), duplicated: number(), awarded: number(), scores: z.record(z.string(), number()), answerHash: hash(), stateHash: hash() }).strict();

export const breadthReportSchema = z.object({
  protocol: z.literal('eight-sharp-one-round-200-v1'), label: z.enum(['baseline', 'after']), games: z.literal(200), players: z.literal(8), seeds: z.array(number()).length(2),
  sourceHashes: sources,
  breadth: z.object({ categories: number(), examples: number(), banks: number(), singleton: number(), median: number(), widthAtLeast4: number(), widthAtLeast8: number() }).strict(),
  outcomes: z.object({ submitted: number(), duplicated: number(), duplicateOwnerRate: number(), awarded: number(), meanAwardedPerGame: number(), meanAwardedPerSeat: number(), blank: number(), repeatedOwn: number(), replayMatches: number(), distinctAnswerSheets: number(), distinctFinalStates: number() }).strict(),
  bankImpacts: z.array(bank), rows: z.array(row).length(200),
}).strict();

export const breadthComparisonSchema = z.object({
  protocol: z.literal('eight-sharp-one-round-200-v1'), baselineCommit: z.literal('b1663d9'),
  baselineReportHash: hash(), afterReportHash: hash(), baselineDataHash: hash(), afterDataHash: hash(),
  matchingLayouts: z.literal(200), matchingMechanics: z.literal(true), unchangedCategoryMetadata: z.literal(true), unchangedBankKeys: z.literal(true),
  additions: number(), changedCategories: number(), changedBanks: number(), improvedGames: number(), worsenedGames: number(), tiedGames: number(),
  baselineAwarded: number(), afterAwarded: number(), awardedGain: number(),
  changes: z.array(z.object({ id: z.string(), letter: z.string().length(1), before: z.array(z.string()), after: z.array(z.string()), added: z.array(z.string()) }).strict()),
}).strict();
