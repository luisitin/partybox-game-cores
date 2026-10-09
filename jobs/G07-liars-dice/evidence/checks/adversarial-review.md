# Adversarial core and observer review — 2026-10-08

Scope: exact repository contract, reducer event order and totality, Perudo
raises/challenges/starter selection, palifico/calza edition toggles, hidden
information, view ownership, departed seats, unlimited idle, and original-player
results. The review initially made no changes to shared source or tests. Root
authorized the new `tests/timestamp-boundaries.test.mjs` regressions after the
two timestamp defects were reproduced. Browser source remains owned by its
separate reviewer.

## Actual findings before correction

1. **Observer reveals advanced after 1.6 seconds.** `activeHumans()` excluded
   eliminated humans. When bots remained, the browser scheduled an automatic
   reveal continuation after 1,600 ms, including for a connected eliminated
   human observer. This contradicted the selected rule that reveals remain until
   acknowledged. Source inspection and the browser test owner's confirmation
   established the trigger; the root requested explicit acknowledgement for
   connected humans, including eliminated ones. Browser checks own the final
   executable regression and evidence.
2. **Finite timestamps could make saved state nonfinite.** On a timed game,
   `vip.pause` at `-Number.MAX_VALUE`, followed by `vip.resume` at
   `Number.MAX_VALUE`, passed the former finite-number guard. Subtracting those
   times yielded `Infinity`, and the resumed deadline became `Infinity`.
   JSON serialization silently changed it to `null`.
3. **Finite large timestamps could reuse a live timer.** A bid with
   `now: 1e20` and `turnSeconds: 1` made both `phaseClock + 1` and
   `now + 1000` round back to `1e20`. The same timer object was accepted twice;
   the observed turn sequence was `p0 → p1 → p2`, with all three phase stamps
   equal to `1e20`.

Root corrected findings 2 and 3 with an explicit host-time domain: finite
nonnegative milliseconds at most `1e15`, excluding negative zero. Fractional
times remain supported. Out-of-domain reducer events return the same state
reference; init rejects them. The domain is documented in ASSUMPTIONS.md.

## Commands and observed results

Commands were run from `jobs/G07-liars-dice/`.

The initial read-only snapshot was built into ignored reviewer storage:

```sh
node_modules/.bin/esbuild src/core.ts --bundle --platform=node --format=esm --target=es2022 --outfile=.work/review/core-snapshot.mjs
node .work/review/probe.mjs
```

That private probe passed 69 hostile-event same-reference assertions with zero
metadata coercions, 27 nested controller-view mutation probes, and two complete
games using legitimate empty/prototype-named player IDs. Its additional printed
cases reproduced the nonfinite deadline and twice-applied timer described above.
The private snapshot/probe is intentionally not a delivered artifact. The public
regression file independently covers those failure classes.

After root's correction, the current core and exact contract were bundled into
separate ignored storage to avoid changing another agent's build outputs:

```sh
node --input-type=module -e 'import {build} from "esbuild"; import {resolve} from "node:path"; for (const name of ["core","rules","probability","contract"]) { await build({entryPoints:[name==="contract"?"../../contract/contract.ts":`src/${name}.ts`],bundle:true,platform:"node",format:"esm",target:"es2022",outfile:`.work/review/fixed/${name}.mjs`,alias:{zod:resolve("node_modules/zod")}}); }'
CORE_DIR=.work/review/fixed node --test tests/timestamp-boundaries.test.mjs
```

**Result: 6 tests passed, 0 failed**, in 412 ms for the final observed run. The
first authored run passed 5/6: a test accidentally called the existing `input`
helper with `now: undefined`, which invoked its default timestamp. The test was
corrected to construct an explicit undefined field; this was a test construction
error, not a remaining product defect.

The normal delivered reproduction command is:

```sh
npm run build
node --test tests/timestamp-boundaries.test.mjs
```

The public tests assert:

- 360 unsupported-time events across every phase return the original reference;
  unsupported init times throw a `RangeError`.
- Valid zero/fractional/upper-bound init times remain JSON-safe; live timers
  advance once; repeated valid events at `1e15` get distinct increasing phase
  stamps.
- Long and near-boundary VIP pauses and automatic empty-room holds resume with
  finite deadlines and identical results after JSON save/reload.
- 129 hostile metadata/unknown-identity events, including throwing getters,
  symbols and custom `Symbol.toPrimitive`, return the original reference;
  metadata is never coerced.
- Recursively mutating 33 returned TV/controller view trees cannot mutate the
  frozen source state, including nested public reveals and private cups.
- Two entire games using `['', 'other', 'third']` and
  `['__proto__', 'constructor', 'toString']` finish with all original scores and
  the actual final survivor as the sole rank-one winner.

## Five highest-priority review areas and remaining limits

1. Connected eliminated humans must retain explicit reveal acknowledgement.
   This is a player-visible correction; final browser evidence is maintained by
   the browser reviewer.
2. Hostile finite time arithmetic must preserve JSON saves. Corrected and
   covered by the new time-boundary tests.
3. Phase stamps must reject already-consumed timers even at large valid times.
   Corrected and covered separately from nonfinite arithmetic.
4. Adversarial metadata, legitimate hostile IDs and mutation of returned views
   needed deeper executable coverage. The 129/33/two-game probes now cover these
   gaps; no gameplay defect was found in those cases.
5. Bot strength is statistically certified by the paired two-player league;
   the 2–8-player completion matrix proves legality and termination, not a
   per-setting/per-seat multiplayer strength advantage. Extending strategic
   comparisons to mixed 3–8-player tables remains a possible future measurement,
   not a claim established by this review.

No ordinary Perudo loss assignment, equality handling, clockwise next starter,
palifico once-only/no-duel restriction, selected calza reward/starter/policy,
hidden-opponent-cup dependency, or omission of original-player results was found
in the source review and bounded probes. This review does not prove optimal bot
play or all possible event transcripts.

Known integration boundary: the exact contract assigns empty-room pausing to
the engine. Local `occupied()` counts connected bot seats too, so a standalone
player event disconnecting every human while bots stay connected does not itself
pause the core. The external engine must still send its empty-room pause. This
was recorded as an integration responsibility rather than a new contract
defect. Departed seats retain their dice and deterministic takeover by the
explicit room policy; they can still win, which is a documented policy choice.

The timestamp domain is for supplied host events. A deadline computed from a
host timestamp exactly at `1e15` may exceed that domain while remaining finite;
events beyond the domain are intentionally rejected. Upper-bound regressions
exercise in-domain timer delivery and repeated same-time inputs/VIP skips, not
unsupported future host timestamps. Normal real clocks are far below this bound.
