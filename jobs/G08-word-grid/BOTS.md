# Shake Up bots

Actual original reducer and seeded bot entry, 1 Hz clock. The job’s medium/strong levels retain the owner’s normal/sharp names. Found share against the unbounded family-mode solver on 2000 independent boards (500 each language/size). Leagues are complete default three-round games with alternating seats; ties count as non-wins.

Original pace, budgets and vocabulary remain unchanged. Public-board/vocabulary options are precomputed per round in immutable state; no opponent words or hidden state affect a choice. Independent privacy tests change opponents’ lists while preserving the same bot move.

| Words | Grid | Easy mean found/share | Normal | Sharp | Sharp below full solver |
|---|---|---:|---:|---:|---:|
|en|4x4|6.524 / 5.86%|13.762 / 13.01%|26.080 / 23.85%|500/500|
|en|5x5|6.700 / 3.13%|13.984 / 6.72%|26.450 / 12.61%|500/500|
|es|4x4|6.746 / 4.87%|13.426 / 9.80%|26.420 / 19.35%|500/500|
|es|5x5|6.918 / 2.53%|13.672 / 5.10%|27.096 / 10.12%|500/500|

Found-share is the average per-board ratio of distinct accepted words to the full family-mode solver, not a human win probability. Sharp leaves additional findable words on all 2000 boards; a person can win with unique long words. No promise that every player can beat sharp.

| League | Games | Wins / losses / ties | Mean stronger score | Mean weaker score |
|---|---:|---:|---:|---:|
|sharp vs normal|2000|2000 / 0 / 0|77.287|15.524|
|normal vs easy|2000|2000 / 0 / 0|51.752|14.415|

Leagues use the original full three-round game, default English 4×4/full/180-second hunts, 1 Hz bot calls, and alternate seat order. Both stronger levels win 100%; Wilson 95% interval [99.808%, 100%] for 2000/2000. The level separation is intentionally clear; these are bot-vs-bot checks, not user playtests.

`npx tsx start/verification/bot-study.ts` regenerates the 2000-board and 4000-game report. `start/verification/seeded.ts` separately completes 1000 games at each supported 1–16 roster, plus 1003 adversarial replays and idle tests. Full distributions and all seeds/methods are committed in the JSON reports.

The [bot report](start/verification/bot-study.json) separates the 2000-board calibration from the two 2000-game default three-round leagues. The [roster/property report](start/verification/seeded-report.json) uses one-round, 90-second roster games to test completion at every supported count. Those different samples are never pooled into a human win-rate claim.
