# G07 — Liar's Dice

Current queue follow-up fixes an initially disconnected random starter.
First new-source runtime94/94 passes; full CI failed a stale historical binding.
That comparison is corrected; new-head full acceptance is pending. See NEXT.md.
The completed delivery and measurements below describe the protected prior source.

Complete Perudo-style private-cup game for 2–8 players: wild ones, palifico,
optional calza, exact-odds bots and a learned bluffing model.

Open play.html directly from disk to play hot-seat or against bots. Everything
is inline/offline; no build needed to play. Keep other players looking away when
opening a cup. Settings are on the first screen; reveal screens wait for Next.
Bot pace is adjustable during play: Fast, Normal (2 s), Slow or Manual.
A visible turn clock can expire before the selected bot delay.
Reloading this tab offers Resume/Discard with cups covered and time held.
Finished games show every original seat, exact places, ties and remaining dice.

Development: npm ci --ignore-scripts; npx playwright install chromium; npm test.
Node 22.16+; strict ES2022 TypeScript, runtime Zod only. npm run build rebuilds the
single page; npm run fixtures regenerates manifest/phase states; npm run league
runs the paired skill comparison. Contract skills normal/sharp = Medium/Strong.

src/core.ts exports the exact shared game contract. src/probability.ts counts
integer outcomes; tests/probability-reference.mjs independently convolves dice.
Historical game checks:46 node tests,7,000 games (1,000 each2–8),1,003 property seeds,
20,000 differential cases,25/25 source mutants and full94/94 browser checks.
Default-duel league:Strong64.70% against Medium; Medium58.90% against Easy,
2,000 games each. Fresh holdout66.8%/57.0%; all confidence lower bounds>50%.
The multiplayer matrix checks legality/completion; strategy advantage beyond
default duels remains unproved. BOTS.md gives methods, seeds and bounds.
Historical original-runner raw600 frames:desktop60.0024FPS/phone4x59.8032FPS,
p9916.8ms. Phone is Chrome CPU emulation; physical devices were not tested.

VERIFY.md gives commands, raw results, failures and material limits. RULES.md,
SOURCES.md and CONFLICTS.md record edition choices; ASSUMPTIONS.md records policy.
Full SDK is absent: local ordered adapter conforms to unchanged shared types.
Original code/CSS/SVG are MIT; standalone includes original and Zod notices.
Browser-only verification hook: API.md. Historical blocked attempt: evidence/.
NEXT.md tracks hosted CI, KEEP GOING and queue status; current-head CI is required.

Five completed improvements: pacing/timer races, Medium certainty decisions,
same-tab recovery, final standings, accurate palifico help/supported saved seats.
Historical original-runner full report:evidence/browser/historical-runner-f8a8d602/.
The resume audit adds70 passing evidence/coordination tests,30 source guards,
and requires a fresh complete94-check report for each current hosted run.
Canonical PR6 is Ready at 1cc4a970 with independently verified full hosted proof.
The separate 2026-10-09 review passed 336 games across all 48 settings and 2–8
players, 72,036 natural saves and 95,160 hidden-info bot controls.
See evidence/checks/independent-review-20261009/README.md and NEXT.md.
Gameplay is unchanged; earlier failures and original KEEP6–8 remain preserved.
