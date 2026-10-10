# Independent exact probability reference

The reference in `tests/probability-reference.mjs` was authored from the job/API
requirements after reading the repository instructions. Production probability
and game-core implementations were not opened or imported. No source text or
public contact information was copied into these artifacts.

## Method and API

`referenceProbability(n, needed, matchingFaces)` starts with the polynomial `1`.
For each labelled die it multiplies the coefficient table by
`(6 - matchingFaces) + matchingFaces*x`, using `BigInt` throughout. The
coefficient of `x^k` counts complete six-sided rolls with exactly `k` matches.
Summing all coefficients gives `6^n`; summing coefficients with `k >= needed`
gives the inclusive tail. No floating arithmetic is used to count outcomes.

Both APIs return decimal strings `atLeastNumerator`, `exactNumerator`, and
`total`, plus `atLeast` and `exact` computed as `Number(numerator)/Number(total)`.
Those numeric ratios are ordinary floating approximations; the strings are exact.

`referenceBidProbability(ownDice, totalDice, quantity, face, wild)` subtracts the
visible matching dice from the requested quantity and counts only the remaining
`totalDice - ownDice.length` hidden dice. The denominator therefore counts hidden
completions, not possible re-rolls of already observed dice. A visible die matches
once if it is the named face or an eligible wild one. Ones are wild only when
`wild` is true and the named face is 2..6; a bid on ones always has one matching
face. The caller passes the effective rule for the current round, including
`wild=false` for palifico.

Assumptions: fair, independent six-sided hidden dice; the supplied visible dice
are all known dice being conditioned on. Bids/history provide no additional
conditioning information. `n` is limited to 0..40. Thresholds accept any safe
integer, so subtracting visible matches can move a conditional threshold below
the requested -5..45 test range. Invalid dice, faces, pool sizes and flags throw
explicitly in this test oracle.

## Actual checks

Run from the repository root:

```sh
node jobs/G07-liars-dice/tests/probability-reference.mjs
```

Actual exit status: `0`. Actual output:

```json
{"result":"PASS","handCases":21,"exhaustiveCases":714,"fullRolls":111974,"domainCases":4182,"conditionalCases":105264,"hiddenCompletions":133644,"invalidCalls":13}
```

- 21 explicit integer-count cases cover zero dice, one/two/three dice, the
  40-die all-match endpoints, visible wild ones, ordinary ones, and fully observed
  certainty/impossibility. For example, two dice with one matching face have
  10 exactly-one and 1 exactly-two rolls, hence 11 at least-one rolls out of 36.
  With two matching faces, those counts are 16, 4 and 20 out of 36.
- A separate recursive enumerator visits 111,974 concrete full rolls for pools
  0..6 with one/two matching faces. Its observed histograms agree at every
  threshold -5..45 (714 comparisons).
- All 4,182 requested `(n, needed, matchingFaces)` combinations pass exact total,
  boundary, monotonicity, PMF/tail difference, mass and first-moment identities.
- Conditional enumeration covers every visible hand of length 0..2, hidden
  pools 0..3, every named face and both wild flags. Its 133,644 individual hidden
  completions agree at every quantity -5..45 (105,264 comparisons). Visible
  arrays remain unchanged. These cases also exercise shifted thresholds below -5.
- 13 malformed argument cases are rejected. Running the file directly executes
  these checks; importing the two reference APIs does not execute them.

Additional actual command:

```sh
node --check jobs/G07-liars-dice/tests/probability-reference.mjs
```

Exit status `0`, no output. A separate reviewer examined only this reference
file, reran its direct checks, and reported no correctness findings. Exhaustive
enumeration stops at six unknown dice; larger pools are checked by identities and
40-die endpoint counts. Conditional exhaustive enumeration stops at two visible
and three hidden dice.
