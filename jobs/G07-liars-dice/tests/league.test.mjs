import test from 'node:test';
import { runLeague, saveLeague, requireClearWins } from '../scripts/league.mjs';

test('sharp clearly beats normal and normal clearly beats easy: 2,000 paired-seat seeded games per matchup, lower95CI > 50%', { timeout: 600000 }, () => {
  const league = runLeague();
  saveLeague(league);
  requireClearWins(league);
});
