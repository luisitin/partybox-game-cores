# Round 2: Medium exact-certainty guard

The sole production change adds `raw.atLeastNumerator !== raw.total` to Medium's
existing dudo condition. Medium's thresholds and fixed support likelihood remain
unchanged, as do Easy and Strong. Exact decimal integer strings determine
at-least certainty; exact-count probability and rounded floating values do not.

`round-2-medium-transcript.json` is an original, fully replayable transcript:
seed 1309716532, 27 accepted inputs, actual seeded rolls, round 8, two dice against
one, hero cup `[1,1]`, opposing bid two ones. Setup deliberately uses legal
impossible bluffs and public pool counts to reach the endgame; it is test input,
not a recommended strategy. No private cup/count/model or RNG state is injected.
The prefix is identical before and after this bot-only change.

The old core is pinned to revision
`6387696d0891f25e01df76f50aa4c7aefdb3ee35`, original built-core SHA-256
`d45b2a5b68b7082b1543dea949777a89ac1f3af5664cae2c5240852e20bea7ee`.
The evidence script can use a hash-verified archived old bundle, or reproduce
that source from the Git object into ignored `.work` using esbuild. The old
commit object must be available for the latter method; CI regression tests
only require the published transcript, so shallow checkout is supported.

The current two-ones bid is guaranteed by the hero's cup in all six compatible
opposing die cases. Previously Medium called dudo and lost a die in all six.
Now it selects three ones, the sole positive-probability legal raise, whose
exact **raw** fair-die probability is 1/6; the other seven legal raises are
impossible. All six bid inputs are accepted. If the opponent immediately calls
dudo in every case, the hero still loses a die in five cases; in the remaining
case the opponent loses its last die and the hero keeps both. Zero losses on
accepting the new bid input are not a claim of later survival or a league gain.

Read traps reject any opposing-cup or game-RNG access in all six cases. All 35
other ordered two-die hero cups retain their previous uncertain dudo behavior.
A supported eight-seat control with own five twos and a six-twos bid has raw
probability about 0.999999313, with unequal exact numerator/denominator, and
retains the previous seven-twos raise. Easy/Strong actions remain unchanged in
the six primary cases. No artificial production hooks were used.

Commands, from this job directory:

```text
node --test tests/medium-certainty.test.mjs
CORE_DIR=.work/mixed-table-holdout/frozen-dist node --test tests/medium-certainty.test.mjs
G07_MEDIUM_BASELINE_CORE=.work/mixed-table-holdout/frozen-dist/core.mjs node scripts/medium-certainty.mjs
```

The old-core regression is expected to fail only the first test, proving it
catches the original defect. Fresh-clone evidence reproduction can instead run
`node scripts/medium-certainty.mjs` after the normal build and fetching the
pinned old commit if needed. Actual focused results and the measured before/
after cases are recorded in the adjacent round-2-medium JSON files. Full matrix,
leagues, mutations, fixtures and browser verification remain separate gates.
