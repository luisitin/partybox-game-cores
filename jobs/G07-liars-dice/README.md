# G07 — Liar's Dice

Complete Perudo-style private-cup game for 2–8 players: wild ones, palifico,
optional calza, exact-odds bots and a learned bluffing model.

Open play.html directly from disk to play hot-seat or against bots. Everything
is inline/offline; no build needed to play. Keep other players looking away when
opening a cup. Settings are on the first screen; reveal screens wait for Next.
Bot pace is adjustable during play: Fast, Normal (2 s), Slow or Manual.
A visible turn clock can expire before the selected bot delay.

Development: npm ci --ignore-scripts; npx playwright install chromium; npm test.
Node 22.16+; strict ES2022 TypeScript, runtime Zod only. npm run build rebuilds the
single page; npm run fixtures regenerates manifest/phase states; npm run league
runs the paired skill comparison. Contract skills normal/sharp = Medium/Strong.

src/core.ts exports the exact shared game contract. src/probability.ts counts
integer outcomes; tests/probability-reference.mjs independently convolves dice.
Initial delivery checks passed: 7,000 games across 2–8 seats, 1,003 property seeds,
20,000 differential cases, 25/25 source mutants, 4,000 league games, 37 browser checks.
Strong wins 64.75%; Medium 58.75%. Desktop and phone at 4× CPU slowdown measured 60 FPS.

VERIFY.md gives commands, raw results, failures and material limits. RULES.md,
SOURCES.md and CONFLICTS.md record edition choices; ASSUMPTIONS.md records policy.
Full SDK is absent: local ordered adapter conforms to unchanged shared types.
Original code/CSS/SVG are MIT; standalone includes original and Zod notices.
Browser-only verification hook: API.md. Historical blocked attempt: evidence/.
NEXT.md tracks hosted CI, KEEP GOING and queue status; current-head CI is required.

KEEP GOING round 1: GitHub run 37741554805 passed at head 6387696.
Round 2's Medium correction passes38 node tests,7,000 games and 52 browser checks.
Strong 64.70%/Medium 58.90%; GitHub run 37746548680 passed the completed head.
Round 3 adds explicit same-tab reload recovery; browser verification is pending.
