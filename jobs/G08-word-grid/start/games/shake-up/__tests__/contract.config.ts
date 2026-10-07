// Hints for the shared contract suite (assumed shape).
export const contract = {
  hiddenFromTv: ['words'],
  hiddenFromController: ['words.<other>'],
  settingsVariants: [{ grid: '5x5' }, { huntSeconds: '90', rounds: 1 }, { spicy: true }, { reader: 'none' }],
  lastScores: 'fixtures/tally.json',
};
