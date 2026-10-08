# Verification in progress

`cat README.md RULES.md JOBS.md CLAIMS.md` on current main: read; lowest
unclaimed G04 after fresh G01/G02/G03 lines. Claim0d43479 pushed to main.
`git switch -c job/G04-reality-check-core`: new branch from main; existing
research-only job/G04-reality-check branch preserved.
`gh api repos/<source>/readme` and contents/doc paths: four source texts read,
commit snapshots pinned in SOURCES.md. No game checks claimed yet.

Required remaining: full strict types/contract properties,1000 seeded games
per count,independent10,000-case hardest-function diff,25 mutations,2,000-game
bot comparisons,all fixtures,offline HTML/TV/phone/reduced-motion/capture,
checksums,actual current-head green CI,PR and KEEP GOING.

Initial `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/.npm-cache`
at repo root failed EUSAGE: the workshop root has no package lock. Re-run
from jobs/G04-reality-check uses its pinned lock; no root manifest invented.

Job-directory npm ci:PASS,eight pinned packages installed. `npm run check`:PASS.
`node generate.ts` then `node generate.ts --check`:160 rows,20/realm,valid
schema,byte-identical regeneration. `node differential.ts`:10,000 seeded
cases plus14 edges,ZERO mismatches; unit scale/reciprocal/zero/overflow pass.
Initial native schema import in tests failed ERR_MODULE_NOT_FOUND at shared
minigame-schema; resolved by bundling the actual schema in preflight.ts.

`FAST_TEST=1 node --test --test-name-pattern='fooled-vote credit is independent'
test.ts`:before correction FAIL(actual1000,expected1500). After additive
truth awards, `FAST_TEST=1 node --test test.ts`:22/22 PASS.
`node fixtures.ts`:all seven phases plus matching manifest generated.
`node checksums.ts` / `node checksums.ts --check`:PASS.
Full property/21,000 count-and-mode games and12,000 league matches underway;
no result presumed. Browser,mutations,full npm test and CI remain unfinished.

Completed preliminary checks: node --test test.ts PASS 45/45 in
214,713 ms: 21,000 bot games (1,000 per 2–8 count × three modes), 1,003
exact event replays and 1,000 timer-only games. This precedes the new
BCE/CE scoring regression; final full npm test is still required.

node mutations.ts: PASS 25/25 kills, baseline 22/22 focused tests.
The actual list is mutation-report.json: stale phase/nonce/early timers;
paused play; prototype spectator; century zero/nondecade/out-of-range
answers; replaced answer; self-vote; lost duplicate author/normalization;
missing correct-write/fooled credit; truth overwrite; lost final doubling;
missing results/left rank; lost pause offset/paused resume; short/repeated/
live-row demo; live-answer leak and another player's private answer.

node bluff-differential.ts: 10,000 cases, ZERO mismatches, 5,000 doubled
last rounds, 32,711 duplicate author occurrences and 7,381 correct writes.
Production accumulates voter credits; independent reference accumulates
author credits from raw text and selected text, without hidden flags.

node league.ts: all six 2,000-match comparisons PASS (12,000 games).
Strong/Medium Quick 89.50%, Mixed 99.05%, Bluff 99.60%; Medium/Easy
98.45%, 99.20%, 99.60%. All approximate 95% lower bounds exceed 50%.
Scope and exact counts/intervals: BOTS.md and league-report.json.

npm run check: PASS. FAST_TEST=1 node --test test.ts: PASS 23/23 after
century-boundary fix. node fixtures.ts: all seven phases regenerated.
node build.ts: standalone HTML 490,940 bytes. Initial overbroad URL check
rejected zod's inert documentation strings; resource-specific check passes.

node browser.ts: PASS 18 functional scenarios including all four Quick
controls, exact 3 s wheel/10 s demo/pause-shifted timer, escaped bluff
input/duplicates/self-vote, concealed correct-writer confirmation, retained
draft/focus, nine completed Quick/Mixed/Bluff games at 2/4/8 seats and
reduced-motion. No external requests or page errors. Initial nonfrozen
clock caused a timing-boundary failure; explicit pause fixed the harness.

300 requestAnimationFrame intervals per profile: TV1920×1080/1× and
phone390×844/4× both mean16.6660 ms, p95 16.70 ms, p99 16.80 ms,
60.002 fps. TV fits vertically; phone has no horizontal overflow.
media/milestone-1.webm: 290,245 bytes (<10 MB), with TV/phone screenshots.
Physical phone not available. Managed direct file:// navigation is blocked;
the exact delivered HTML bytes are exercised through setContent instead.
Current-head complete npm test and actual PR CI remain unverified.
