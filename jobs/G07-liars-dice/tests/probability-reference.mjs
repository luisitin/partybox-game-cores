/**
 * Independent test oracle for fair six-sided dice.
 *
 * This deliberately counts complete die outcomes by polynomial convolution.
 * It does not import, translate, or call the game's probability implementation.
 * Every coefficient is an integer count of equally likely labelled full rolls.
 */
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

export function referenceProbability(n, needed, matchingFaces) {
  requireInteger(n, 'n');
  requireInteger(needed, 'needed');
  if (n < 0 || n > 40) throw new RangeError('n must be in 0..40');
  if (matchingFaces !== 1 && matchingFaces !== 2) {
    throw new RangeError('matchingFaces must be 1 or 2');
  }

  const hitWays = BigInt(matchingFaces);
  const missWays = BigInt(6 - matchingFaces);
  let coefficients = [1n];
  for (let die = 0; die < n; die += 1) {
    const product = Array(coefficients.length + 1).fill(0n);
    for (let hits = 0; hits < coefficients.length; hits += 1) {
      product[hits] += coefficients[hits] * missWays;
      product[hits + 1] += coefficients[hits] * hitWays;
    }
    coefficients = product;
  }

  let total = 0n;
  let atLeastNumerator = 0n;
  let exactNumerator = 0n;
  for (let hits = 0; hits < coefficients.length; hits += 1) {
    const ways = coefficients[hits];
    total += ways;
    if (hits >= needed) atLeastNumerator += ways;
    if (hits === needed) exactNumerator = ways;
  }
  return {
    atLeastNumerator: atLeastNumerator.toString(),
    exactNumerator: exactNumerator.toString(),
    total: total.toString(),
    atLeast: Number(atLeastNumerator) / Number(total),
    exact: Number(exactNumerator) / Number(total),
  };
}

/**
 * Condition only on the caller's supplied visible dice, never on another cup.
 * `wild` is the effective rule for this round (false in palifico).
 */
export function referenceBidProbability(ownDice, totalDice, quantity, face, wild) {
  if (!Array.isArray(ownDice)) throw new TypeError('ownDice must be an array');
  requireInteger(totalDice, 'totalDice');
  requireInteger(quantity, 'quantity');
  requireInteger(face, 'face');
  if (totalDice < ownDice.length || totalDice > 40 || totalDice < 0) {
    throw new RangeError('totalDice must be in ownDice.length..40');
  }
  if (face < 1 || face > 6) throw new RangeError('face must be in 1..6');
  if (typeof wild !== 'boolean') throw new TypeError('wild must be boolean');

  const onesAlsoMatch = wild && face !== 1;
  let visibleMatches = 0;
  for (const die of ownDice) {
    requireInteger(die, 'die');
    if (die < 1 || die > 6) throw new RangeError('die must be in 1..6');
    if (die === face || (onesAlsoMatch && die === 1)) visibleMatches += 1;
  }
  return referenceProbability(
    totalDice - ownDice.length,
    quantity - visibleMatches,
    onesAlsoMatch ? 2 : 1,
  );
}

function requireInteger(value, name) {
  if (!Number.isSafeInteger(value)) throw new TypeError(`${name} must be a safe integer`);
}

// A second, intentionally slow method visits individual six-sided full rolls.
// It is used only when this oracle file is run directly, never on import.
function enumerateRolls(diceCount, visit, prefix = []) {
  if (prefix.length === diceCount) {
    visit(prefix);
    return;
  }
  for (let face = 1; face <= 6; face += 1) {
    enumerateRolls(diceCount, visit, [...prefix, face]);
  }
}

function expectedFromEnumeratedCounts(counts, needed) {
  let total = 0n;
  let tail = 0n;
  let exact = 0n;
  for (let count = 0; count < counts.length; count += 1) {
    total += counts[count];
    if (count >= needed) tail += counts[count];
    if (count === needed) exact = counts[count];
  }
  return {
    atLeastNumerator: `${tail}`,
    exactNumerator: `${exact}`,
    total: `${total}`,
    atLeast: Number(tail) / Number(total),
    exact: Number(exact) / Number(total),
  };
}

function runReferenceSelfChecks() {
  const handCases = [
    [0, -1, 1, '1', '0', '1'],
    [0, 0, 2, '1', '1', '1'],
    [0, 1, 1, '0', '0', '1'],
    [1, 1, 1, '1', '1', '6'],
    [1, 1, 2, '2', '2', '6'],
    [2, 0, 1, '36', '25', '36'],
    [2, 1, 1, '11', '10', '36'],
    [2, 2, 1, '1', '1', '36'],
    [2, 0, 2, '36', '16', '36'],
    [2, 1, 2, '20', '16', '36'],
    [2, 2, 2, '4', '4', '36'],
    [3, 2, 1, '16', '15', '216'],
    [3, 2, 2, '56', '48', '216'],
    [40, 40, 1, '1', '1', '13367494538843734067838845976576'],
    [40, 40, 2, '1099511627776', '1099511627776', '13367494538843734067838845976576'],
  ];
  for (const [n, needed, matching, tail, exact, total] of handCases) {
    assert.deepEqual(referenceProbability(n, needed, matching), {
      atLeastNumerator: tail,
      exactNumerator: exact,
      total,
      atLeast: Number(tail) / Number(total),
      exact: Number(exact) / Number(total),
    });
  }

  let exhaustiveCases = 0;
  let fullRolls = 0;
  for (let n = 0; n <= 6; n += 1) {
    for (const matching of [1, 2]) {
      const counts = Array(n + 1).fill(0n);
      enumerateRolls(n, (roll) => {
        const hits = roll.filter((die) => die <= matching).length;
        counts[hits] += 1n;
        fullRolls += 1;
      });
      for (let needed = -5; needed <= 45; needed += 1) {
        assert.deepEqual(
          referenceProbability(n, needed, matching),
          expectedFromEnumeratedCounts(counts, needed),
        );
        exhaustiveCases += 1;
      }
    }
  }

  let domainCases = 0;
  for (let n = 0; n <= 40; n += 1) {
    for (const matching of [1, 2]) {
      const expectedTotal = 6n ** BigInt(n);
      let previousTail = expectedTotal;
      const exactCounts = [];
      for (let needed = -5; needed <= 45; needed += 1) {
        const result = referenceProbability(n, needed, matching);
        const tail = BigInt(result.atLeastNumerator);
        const exact = BigInt(result.exactNumerator);
        assert.equal(BigInt(result.total), expectedTotal);
        assert.ok(tail >= 0n && tail <= previousTail);
        assert.ok(exact >= 0n && exact <= tail);
        assert.ok(Number.isFinite(result.atLeast) && Number.isFinite(result.exact));
        assert.equal(result.atLeast, Number(tail) / Number(expectedTotal));
        assert.equal(result.exact, Number(exact) / Number(expectedTotal));
        if (needed <= 0) assert.equal(tail, expectedTotal);
        if (needed < 0 || needed > n) assert.equal(exact, 0n);
        if (needed > n) assert.equal(tail, 0n);
        if (needed >= 0 && needed <= n) exactCounts.push(exact);
        if (needed > 0 && needed <= n + 1) {
          assert.equal(previousTail - tail, exactCounts[needed - 1]);
        }
        previousTail = tail;
        domainCases += 1;
      }
      assert.equal(exactCounts.reduce((sum, count) => sum + count, 0n), expectedTotal);
      const firstMoment = exactCounts.reduce((sum, count, hits) => sum + BigInt(hits) * count, 0n);
      assert.equal(firstMoment * 6n, BigInt(n * matching) * expectedTotal);
    }
  }

  let conditionalCases = 0;
  let hiddenCompletions = 0;
  for (let ownCount = 0; ownCount <= 2; ownCount += 1) {
    enumerateRolls(ownCount, (ownDice) => {
      const original = JSON.stringify(ownDice);
      for (let hidden = 0; hidden <= 3; hidden += 1) {
        for (let face = 1; face <= 6; face += 1) {
          for (const wild of [false, true]) {
            const counts = Array(ownCount + hidden + 1).fill(0n);
            enumerateRolls(hidden, (unseenDice) => {
              let hits = 0;
              for (const die of [...ownDice, ...unseenDice]) {
                if (die === face || (wild && face > 1 && die === 1)) hits += 1;
              }
              counts[hits] += 1n;
              hiddenCompletions += 1;
            });
            for (let quantity = -5; quantity <= 45; quantity += 1) {
              assert.deepEqual(
                referenceBidProbability(ownDice, ownCount + hidden, quantity, face, wild),
                expectedFromEnumeratedCounts(counts, quantity),
              );
              conditionalCases += 1;
            }
          }
        }
      }
      assert.equal(JSON.stringify(ownDice), original);
    });
  }

  const conditionalHandCases = [
    [[1, 2, 2], 5, 4, 2, true, '20', '16', '36'],
    [[1, 2, 2], 5, 4, 2, false, '1', '1', '36'],
    [[1, 2, 2], 5, 2, 1, true, '11', '10', '36'],
    [[1, 1], 2, 2, 1, true, '1', '1', '1'],
    [[1, 1], 2, 3, 1, true, '0', '0', '1'],
    [[2, 2], 2, 1, 2, false, '1', '0', '1'],
  ];
  for (const [own, totalDice, quantity, face, wild, tail, exact, total] of conditionalHandCases) {
    assert.deepEqual(referenceBidProbability(own, totalDice, quantity, face, wild), {
      atLeastNumerator: tail,
      exactNumerator: exact,
      total,
      atLeast: Number(tail) / Number(total),
      exact: Number(exact) / Number(total),
    });
  }

  const invalidCalls = [
    () => referenceProbability(-1, 1, 1),
    () => referenceProbability(41, 1, 1),
    () => referenceProbability(1.5, 1, 1),
    () => referenceProbability(1, NaN, 1),
    () => referenceProbability(1, 1, 0),
    () => referenceProbability(1, 1, 3),
    () => referenceBidProbability([0], 1, 1, 1, false),
    () => referenceBidProbability([7], 1, 1, 1, false),
    () => referenceBidProbability([1], 0, 1, 1, false),
    () => referenceBidProbability([], 41, 1, 1, false),
    () => referenceBidProbability([], 1, 1, 0, false),
    () => referenceBidProbability([], 1, 1, 7, false),
    () => referenceBidProbability([], 1, 1, 1, 'true'),
  ];
  for (const invoke of invalidCalls) assert.throws(invoke);

  console.log(JSON.stringify({
    result: 'PASS',
    handCases: handCases.length + conditionalHandCases.length,
    exhaustiveCases,
    fullRolls,
    domainCases,
    conditionalCases,
    hiddenCompletions,
    invalidCalls: invalidCalls.length,
  }));
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runReferenceSelfChecks();
}
