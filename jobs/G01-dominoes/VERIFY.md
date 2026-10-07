# Checks actually run (2026-10-07 UTC)

- `git ls-remote origin HEAD`: pass, returned f1fc60ff51a01887402153543b05fdf35c230217.
  Checks scoped native Git read access, not API/push permissions.
- `git push origin main`: pass for `claim G01`. Checks actual push permission.
- In contract/: `npm --cache /workspace/.npm-cache install --ignore-scripts
  --no-package-lock --no-audit --no-fund`: pass, zod 4.6.5 installed.
  Default cache first failed because /home/agent/.npm was unwritable;
  switching cache location resolved the installation problem.
- From repository root: `/workspace/.onboarding-tools/node_modules/.bin/tsc
  --noEmit --strict --target ES2022 --module ES2022 --moduleResolution bundler
  --skipLibCheck contract/*.ts`: pass with TypeScript 5.9.3.
  Checks the existing shared contract; does not check a nonexistent game.
- Node ESM import of contract/node_modules/zod/index.js, accepting
  `{action:'pass'}` and rejecting `{action:'play'}` against a literal schema:
  pass. Checks actual dependency loading/validation, not game behavior.
- `curl -L --fail --max-time 30 -o /tmp/domino-rules.html
  https://www.pagat.com/domino/line/draw.html`: failed 403.
- Same command for https://www.pagat.com/domino/line/block.html and
  https://bicyclecards.com/how-to-play/dominoes: both failed 403.
- `curl -sS -I --max-time 15 https://en.wikipedia.org/wiki/Dominoes`:
  failed CONNECT 403. No article content inspected.
- `curl -sS -o /tmp/github-api-response.txt -w '%{http_code}\n'
  --max-time 15 https://api.github.com/repos/luisitin/partybox-game-cores`:
  failed CONNECT 403, exit 56, HTTP output 000.
- `gh api repos/luisitin/partybox-game-cores --jq .permissions`:
  failed Forbidden. gh auth status also reports an unusable configured token;
  that does not imply native Git is unauthenticated. No token requested.
- `git clone --depth 1 https://github.com/abw333/dominoes.git
  /tmp/partybox-domino-ai` and equivalent angeris/DominAI clone: pass.
  AI research available; no AI benchmark executed yet.

Game tests, mutation tests, simulations, leagues, UI checks, captures and CI:
UNRUN. Zero game tests executed. No game readiness or completion claim.

## Implemented workflow (research-only blocker superseded)

The web-blocked fallback added to main RULES.md supersedes the original stop.
Unverified conventions are explicit in RULES.md/SOURCES.md/NEXT.md.
All commands below run from jobs/G01-dominoes unless otherwise noted.

- `npm ci --ignore-scripts --cache /workspace/.npm-cache --no-audit --no-fund`:
  pass; installs the frozen development/runtime dependency lockfile.
- `python -m pip install --cache-dir /workspace/.pip-cache --target
  /workspace/.baseline-libs --upgrade --require-hashes -r baseline-requirements.txt`:
  pass; installs the independently researched test-only reference with hash checks.
- `npm run check`: pass before integration; strict TypeScript ES2022 checks the
  core, UI, bridges, tests and exact shared contract interface.
- `node fixtures.ts`, hash manifest/all fixture bytes, `node fixtures.ts`, compare
  with `cmp /tmp/G01-fixture-hashes-before /tmp/G01-fixture-hashes-after`: pass,
  byte-identical second regeneration. Every fixture is also played to completion
  in test.ts, and manifest equality is asserted and schema-validated in build.ts.
- `node build.ts` then `node build.ts --check`: pass; no external resource links
  or fetch calls, generated-script syntax is checked and manifest schema validates.
- `node checksums.ts` then `node checksums.ts --check`: pass at checkpoint;
  covers all shipped fixture/manifest/report JSON, PNG and WebM files.
- `BASELINE_GAMES=200 node baseline.ts`: pass; actual upstream package policy
  comparison, 142/200 strong-team wins. players.py/search.py SHA256 comparison
  with the live pinned checkout: both identical. See BOTS.md for bounded scope.
- `node browser.ts`: passed before final integration with 1920x1080 and 390x844
  viewports, 4x phone CPU throttle, 300 measured frames per mode, about 60fps,
  p95 16.7ms/p99 16.8ms; human handover privacy, full browser bot match, zero
  external requests, zero page errors and reduced-motion play all passed.
  Managed file:// navigation failed ERR_BLOCKED_BY_ADMINISTRATOR; exact HTML
  was exercised through setContent. File navigation and physical phone hardware
  remain unverified. The final integration reruns after TV-layout/timer changes.
- `node idle.ts`: pass after correction; 18,000 complete timer-only matches
  (2/3/4 seats × Draw/Block × 100/150/250 × seeds 1–1,000). Maximum simulated
  duration 2,007,103ms; budget 3,600,000ms. Prior 30s-per-idle-turn version
  failed the budget; the adaptive timeout fixes it without reducing human time.

## Mutation list (one at a time, passing baseline mandatory)

1. Negative tile accepted.
2. Tile 28 accepted.
3. Extra pass fields accepted.
4. Seven-tile deal becomes six.
5. Five-tile deal becomes six.
6. Opening highest-double rule disabled.
7. Forced opener accepts any tile.
8. Left-end orientation reversed.
9. Right-end orientation reversed.
10. Played tile retained / wrong tiles removed.
11. Pass streak not reset after play.
12. Turn does not advance.
13. Draw ignores reserved stock.
14. Draw uses last instead of first tile.
15. Drawing advances turn.
16. Drawing preserves invalidated pass inference.
17. Block settles one pass early.
18. All-remaining partnership omits teammate pips.
19. Blocked tie awards first seat.
20. Adjacent seats become partners.
21. Target requires overshoot.
22. Prototype property counts as player membership.
23. Inputs run while paused.
24. Stale timer instance guard omitted.
25. TV leaks private hands.

Each was killed by an assertion against a passing baseline in the second
isolated run. The initial mutation run against a failing test was discarded;
only the passing-baseline report counts. Final integration repeats all 25.

## Final integration result

`npm test > /tmp/G01-npm-test.log 2>&1`: PASS, underlying exit status 0.
25 node:test tests passed; zero failed, skipped, cancelled or todo. Includes
6,000 complete bot matches (1,000 for each 2/3/4-seat Draw/Block configuration),
1,003 property-seed matches (pinned 1/2/3 + 1,000 independently generated seeds),
idle liveness, view secrecy, timer/paused/unknown-event fuzz cases, fixtures,
manifest equality, pure-code scan, JSON size, replay and tile-chain conservation.

The same command then executed and passed:
- 18,000 full idle matches; longest 2,007,103ms vs 3,600,000ms budget.
- 10,000 independent exhaustive-vs-alpha-beta cases, seed 53759; zero mismatches.
- 25 assertion kills out of 25 mutants, isolated from a passing baseline.
- Generated HTML syntax/manifest schema/offline checks.
- Strong/medium: 1,296/2,000 wins, 64.8%; 95% interval 62.7–66.9%.
- Medium/easy: 1,619/2,000 wins, 80.95%; 95% interval 79.2–82.7%.
  These are final results AFTER the doubles-first easy policy change.
- Upstream configured baseline: 142/200 wins, 71%; 95% interval 64.7–77.3%.
- Browser handover concealment, full partnership bot match, TV viewport fit,
  zero external requests, zero page errors and reduced-motion play.
- TV 1920x1080: 300 frames, mean 16.666ms, p95 16.7ms, p99 16.8ms,
  60.001fps. Phone 390x844 at 4x CPU throttle: mean 16.722ms, p95 16.7ms,
  p99 16.8ms, 59.803fps. Browser emulation, not physical-phone measurements.
- Original short video media/milestone-1.webm, under 10MB, plus TV/phone PNGs.
- Regenerated and checked checksums for all shipped JSON reports/fixtures,
  manifest and media. Additional `sha256sum -c SHA256SUMS.txt`: all 13 files OK.

`git diff --check`: pass. The shared contract and both unrelated repositories
remain unchanged. CI and PR delivery are NOT claimed passed until the actual
GitHub operations succeed. KEEP GOING has not started because green CI is not
established. The managed file-navigation and bounded-baseline limitations above
remain explicit; local functional checks do not remove those limits.

## GitHub delivery and first CI result

PR creation succeeded: https://github.com/luisitin/partybox-game-cores/pull/1.
`gh run view 37645288915 --json status,conclusion,jobs`: actual first CI FAILED
in npm test after all dependency/browser installation steps passed. This is not
reported as green. Check annotations initially exposed only exit status 1.
The log-download redirect to results-receiver.actions.githubusercontent.com
was denied. That exact hostname was added to the saved environment network
draft, preserving all prior entries; draft persistence is confirmed, application
is not. The verified local npm test result remains local evidence only.

Add explicit failure-tail annotations to the workflow while preserving npm's
underlying exit status. This permits diagnosis through the working GitHub API
without weakening assertions or depending only on an inaccessible log download.
No KEEP GOING rounds execute before actual green CI.
