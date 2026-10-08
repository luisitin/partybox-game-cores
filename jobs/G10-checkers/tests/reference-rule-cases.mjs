/** Original rule fixtures plus one published game-facts draw replay. MIT. */
export function sparseBoard(variant, pieces) {
  const board = Array(variant === 'american' ? 32 : 50).fill(0);
  for (const [square, piece] of Object.entries(pieces)) board[Number(square)] = piece;
  return board;
}

export const REFERENCE_RULE_CASES = [
  {
    name: 'American forced complete double jump excludes quiet moves',
    source: 'WCDF 1.18–1.20; FlyOrDie multiple jumps',
    variant: 'american', side: 1, pieces: { 22: 1, 26: 1, 17: -1, 9: -1 },
    exact: [{ path: [22, 13, 6], captures: [17, 9], promotes: false }]
  },
  {
    name: 'American crown ends capture even with backward king jump available',
    source: 'WCDF 1.16,1.19; FlyOrDie kings',
    variant: 'american', side: 1, pieces: { 10: 1, 6: -1, 5: -1 },
    exact: [{ path: [10, 1], captures: [6], promotes: true }]
  },
  {
    name: 'International man passes crown row and remains man after continuing',
    source: 'FMJD2024 3.5,4.15; lidraughts king',
    variant: 'international', side: 1, pieces: { 12: 1, 7: -1, 6: -1 },
    exact: [{ path: [12, 1, 10], captures: [7, 6], promotes: false }]
  },
  {
    name: 'International global longest route excludes another piece short route',
    source: 'FMJD2024 4.13–4.14; lidraughts moves and captures',
    variant: 'international', side: 1, pieces: { 20: 1, 24: 1, 16: -1, 7: -1, 19: -1 },
    exact: [{ path: [20, 11, 2], captures: [16, 7], promotes: true }]
  },
  {
    name: 'American permits shorter route from a different piece',
    source: 'WCDF1.20; FlyOrDie choice of jumps',
    variant: 'american', side: 1, pieces: { 16: 1, 22: 1, 13: -1, 6: -1, 18: -1 },
    exact: [
      { path: [16, 9, 2], captures: [13, 6], promotes: true },
      { path: [22, 15], captures: [18], promotes: false }
    ]
  },
  {
    name: 'International taken pieces block reversing king between two enemies',
    source: 'FMJD2024 4.8,4.11; lidraughts delayed removal',
    variant: 'international', side: 1, pieces: { 22: 2, 17: -1, 28: -1 },
    exact: [
      { path: [22, 11], captures: [17], promotes: false },
      { path: [22, 6], captures: [17], promotes: false },
      { path: [22, 0], captures: [17], promotes: false },
      { path: [22, 33], captures: [28], promotes: false },
      { path: [22, 39], captures: [28], promotes: false },
      { path: [22, 44], captures: [28], promotes: false }
    ]
  },
  {
    name: 'International uncrowned man captures backwards',
    source: 'FMJD2024 4.1; lidraughts captures',
    variant: 'international', side: 1, pieces: { 17: 1, 22: -1 },
    exact: [{ path: [17, 28], captures: [22], promotes: false }]
  },
  {
    name: 'American uncrowned man cannot capture backwards',
    source: 'WCDF1.18; Trevor Davis moves',
    variant: 'american', side: 1, pieces: { 14: 1, 18: -1 },
    exact: [
      { path: [14, 9], captures: [], promotes: false },
      { path: [14, 10], captures: [], promotes: false }
    ]
  },
  {
    name: 'American king may return to origin in a four-enemy capture',
    source: 'WCDF1.19–1.21; FMJD2024 4.8 corroborates empty-square revisit',
    variant: 'american', side: 1, pieces: { 17: 2, 14: -1, 15: -1, 23: -1, 22: -1 },
    exact: [
      { path: [17, 10, 19, 26, 17], captures: [14, 15, 23, 22], promotes: false },
      { path: [17, 26, 19, 10, 17], captures: [22, 23, 15, 14], promotes: false }
    ]
  },
  {
    name: 'American short king has only adjacent quiet destinations',
    source: 'WCDF1.17; FlyOrDie kings',
    variant: 'american', side: 1, pieces: { 18: 2 },
    exact: [
      { path: [18, 14], captures: [], promotes: false },
      { path: [18, 15], captures: [], promotes: false },
      { path: [18, 22], captures: [], promotes: false },
      { path: [18, 23], captures: [], promotes: false }
    ]
  }
];

// Public game facts from the independently authored question, not prose:
// https://boardgames.stackexchange.com/questions/61692/how-does-different-draw-rules-interact-with-each-other-in-international-draughts
// All path squares below are one-based official FMJD notation.
export const PUBLISHED_DRAW_REGRESSION = {
  url: 'https://boardgames.stackexchange.com/questions/61692/how-does-different-draw-rules-interact-with-each-other-in-international-draughts',
  initialFen: 'W:WK46,K47,K48:BK3',
  variant: 'international', side: 1,
  pieces: { 45: 2, 46: 2, 47: 2, 2: -2 },
  paths: [
    [47, 38], [3, 9], [46, 23], [9, 22], [38, 24], [22, 17],
    [48, 31], [17, 39], [24, 38], [39, 17], [31, 42], [17, 22],
    [38, 15], [22, 6], [42, 31], [6, 1], [31, 18], [1, 6],
    [18, 13], [6, 17], [15, 20], [17, 39], [13, 18], [39, 17],
    [20, 33], [17, 39], [18, 13], [39, 33], [13, 27], [33, 17],
    [23, 19], [17, 12]
  ],
  expectedDrawAfterPly: 32,
  captureAtPly: 26,
  explanation: 'Old 16-each allowance survives capture; new five-each allowance cannot extend it.'
};

export const DRAW_EXPECTATIONS = [
  { name: 'American 40-each is eighty plies', quietPlies: 79, nextQuietEndsDraw: true, limit: 80 },
  { name: 'International ordinary 25-each is fifty plies', quietPlies: 49, nextQuietEndsDraw: true, limit: 50 },
  { name: '16-each ending creation move excluded', eligibleAtPly: 12, firstCountedPly: 13, deadlinePly: 44 },
  { name: 'Five-each ending creation move excluded', eligibleAtPly: 26, firstCountedPly: 27, deadlinePly: 36 },
  { name: 'Old 16 and new five intersect', activeDeadlinePly: 32, newDeadlinePly: 36, expectedDeadlinePly: 32 },
  { name: 'Promotion with existing stronger king preserves 16', deadlineBeforePly: 32, deadlineAfterPly: 32 },
  { name: 'Capture preserves old16 even if weaker king removes stronger final king', deadlineBeforePly: 32, deadlineAfterPly: 32 },
  { name: 'Final allowed move leaving opponent blocked wins', drawDeadlineReached: true, opponentLegalMoves: 0, expected: 'win' },
  { name: 'Different side to move is a different repetition position', sameBoard: true, sameSide: false, incrementsSamePosition: false }
];
