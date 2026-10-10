import test from 'node:test';
import assert from 'node:assert/strict';
import { rulesCore } from './helpers.mjs';

function referenceRaise(previous, next, wild, locked, mayChange) {
  if (!Number.isSafeInteger(next.quantity) || next.quantity < 1 || next.quantity > 1000000 || !Number.isSafeInteger(next.face) || next.face < 1 || next.face > 6) return false;
  if (previous === null) return !wild || next.face !== 1;
  if (locked && !mayChange) return next.face === previous.face && next.quantity > previous.quantity;
  if (!wild || next.face === previous.face) return next.quantity > previous.quantity || (next.quantity === previous.quantity && next.face > previous.face);
  if (previous.face === 1) return next.face === 1 ? next.quantity > previous.quantity : next.quantity >= previous.quantity * 2 + 1;
  if (next.face === 1) return next.quantity >= Math.ceil(previous.quantity / 2);
  return next.quantity > previous.quantity || (next.quantity === previous.quantity && next.face > previous.face);
}

test('raise legality exhaustively matches independently stated Perudo transitions', () => {
  let cases = 0;
  for (const wild of [false, true]) for (const locked of [false, true]) for (const mayChange of [false, true]) {
    for (let oldQuantity = 1; oldQuantity <= 40; oldQuantity += 1) for (let oldFace = 1; oldFace <= 6; oldFace += 1) {
      const previous = { quantity: oldQuantity, face: oldFace };
      for (let quantity = 1; quantity <= 42; quantity += 1) for (let face = 1; face <= 6; face += 1) {
        assert.equal(rulesCore.isRaise(previous, { quantity, face }, wild, locked, mayChange), referenceRaise(previous, { quantity, face }, wild, locked, mayChange), `${JSON.stringify({ previous, quantity, face, wild, locked, mayChange })}`);
        cases += 1;
      }
    }
    for (const bid of [{ quantity: 1, face: 1 }, { quantity: 1, face: 6 }, { quantity: 0, face: 2 }, { quantity: 1.5, face: 2 }, { quantity: 1, face: 7 }]) assert.equal(rulesCore.isRaise(null, bid, wild, locked, mayChange), referenceRaise(null, bid, wild, locked, mayChange));
  }
  assert.equal(cases, 483840);
});

test('counting ones distinguishes wild faces, literal ones, and palifico', () => {
  const dice = [1, 1, 2, 2, 3, 4, 5, 6];
  for (let face = 1; face <= 6; face += 1) for (const wild of [true, false]) assert.equal(rulesCore.countMatches(dice, face, wild), dice.reduce((n, die) => n + Number(die === face || (wild && face !== 1 && die === 1)), 0));
  assert.equal(rulesCore.countMatches([], 1, true), 0);
  assert.equal(rulesCore.isRaise({ quantity: 5, face: 4 }, { quantity: 3, face: 1 }, true, false, false), true);
  assert.equal(rulesCore.isRaise({ quantity: 5, face: 4 }, { quantity: 2, face: 1 }, true, false, false), false);
  assert.equal(rulesCore.isRaise({ quantity: 3, face: 1 }, { quantity: 6, face: 2 }, true, false, false), false);
  assert.equal(rulesCore.isRaise({ quantity: 3, face: 1 }, { quantity: 7, face: 2 }, true, false, false), true);
});
