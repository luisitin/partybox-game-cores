# Verification — implementation milestone, not ready yet

Nine actually read Exa extractions, exact extraction hashes and all short quote
matches are recorded in evidence/research-sources.json. Origin HTTP unobserved.

| Executed command | Actual result | What it catches |
|---|---|---|
| `npm run build` | Strict TS/ES2022 compile, offline page generated | Type/contract drift |
| `node --test tests/rules.test.mjs tests/differential.test.mjs` | 8 tests PASS; 10,000 hands (5,000 each of 10/11 cards), checksum584788 | Wrong exact minimum, overlap, ace/run/set errors, scoring and turn rules |
| `node --test tests/contract.test.mjs` | Historical random-easy baseline PASS: 6,000 matches +6,000 exact replays, 1,003 property seeds, hidden-state and idle tests | All contract invariants, conservation, state mutation, hidden cards/order, malformed events, schema-valid bots, phase exits |
| `node --test tests/ends.test.mjs` | Three reducer edge suites PASS | Actual Big Gin/Gin, disabled claims, layoffs, custom layouts, boxes, match scoring and rotation |
| `node scripts/league.mjs` | Current strong1151/2000 (57.55%), medium1743/2000 (87.15%); confidence bounds>50% | Real skill separation |
| `node scripts/mutations.mjs` | First23/25; after two meaningful edge goldens25/25 compiled assertion kills | Real isolated source bugs, no parse/compile-failure kills |
| `node scripts/browser-check.mjs --capture` | Desktop60.002FPS/p9916.8ms; 4x phone59.341FPS/p9916.8ms/max33.3ms, privacy/offline/reduced motion PASS | Actual play interactions, DOM privacy cover, pause/end, no network, frame responsiveness |

All25 mutation source edits/compile/assertion outcomes are in mutations.json.
Browser uses60Hz target with explicit rounding gates mean>=59FPS,p99<=17ms;
all actual samples/maxima are retained. Simulated4x phone, not physical hardware.
Performance is normal play without recording; screen capture uses a separate
context to avoid encoder overhead. Both milestone videos are under10MB.
Earlier failed source access,23/25 mutation run and browser failures are preserved.

Current full npm test, fixture regeneration twice and complete file hashes must
still run; exact-head PR CI is pending. No READY claim until these actually pass.
Post-green KEEP GOING must subsequently reach its three-round stop condition.
