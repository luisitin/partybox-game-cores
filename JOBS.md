# JOBS: whole game cores

Each job builds one complete game as a **pure core** that follows contract/GAME_CONTRACT.md (types in contract/*.ts; zod is the only allowed dependency), plus **play.html**: a single self-contained page where 2-8 people can play the core hot-seat (or vs bots) on one screen. No 3D, no art beyond clean CSS and SVG.

Every job also delivers:
- RULES.md: the full official rules from 2+ sources, every variant you saw, and which one you chose (house-rule toggles go in settings).
- The reducer, tvView, controllerView, results, bots (easy, medium, strong) with a real strategy, and fixtures/ (one JSON state per phase).
- Tests for all seven contract invariants in contract/GAME_CONTRACT.md, with 1,000 seeded bot games at every player count. No hidden info may leak into any view (test it by diffing views across players).
- BOTS.md: strong bot win rate vs medium and medium vs easy over 2,000 games (strong must win clearly).

## G01 Dominoes
Double-six, Draw and Block games (setting), 2-4 players, 4-player partners option, scoring to 100/150/250. Research the best open-source domino AIs first and match their strength.

## G02 Gin Rummy
Standard Gin: knocking at 10 or fewer, gin and big-gin bonuses, undercut, layoffs, box/line bonuses, Oklahoma variant as a setting. 2 players (plus a 3-4 rotation "winner stays" setting). Exact deadwood minimizer (prove optimal by brute force on 10,000 hands).

## G03 Pack the Hold
A puzzle race: each round every player gets the same seeded set of 6-12 polyomino crates (with values) and a ship hold shape. Drag, rotate and pack to maximise the value inside the hold before the timer. Deliver: the level generator (difficulty 1-10 by measured solve rate), an EXACT optimum solver (prove it on every generated level, report solve times), scoring = your value / optimum, and bots that play at 60/80/95% of optimum.

## G04 Reality Check (core only)
A data-quiz game made of realms. Each round the TV spins a realm wheel. First time a realm appears: a 10 s demo question. Quick realms: estimate a number (log-scale closeness scoring, research the fairest formula), pick left/right, a century slider, a decade dial. Bluff realms: everyone writes a fake answer, then votes for the real one (points for finding the truth and for fooling people). Settings: Quick only / Mixed (default, about 8 rounds in 12 min, last round double) / Bluff only. Use 20 made-up sample rows per realm; real data comes from the content-packs repo.

## G05 Hearts
Standard Hearts, 3-6 players (official deck adjustments), passing rotation, shooting the moon (both scoring options as a setting), Jack of Diamonds variant setting.

## G06 Spades
Partnership Spades, bids incl. nil and blind nil, bags (10 = -100), 500 points; cutthroat 3-player setting.

## G07 Liar's Dice
Perudo rules, 2-8 players, palifico round, ones wild setting; bots that use exact probability plus a bluffing model.

## G08 Word Grid (= the owner's Shake Up)
Already built: read jobs/G08-word-grid/START-HERE.md first. Verify and improve the existing Shake Up build in jobs/G08-word-grid/start/ (cube sets, word lists, bots, rules tests, play.html); never rebuild it or replace its assets.

## G09 Category Rush
Scattergories-style: a random letter and 12 categories, everyone writes answers, the group votes off bad ones, duplicates score zero. 300+ original categories you wrote.

## G10 Checkers
American checkers (8x8, forced captures, multi-jumps, kings) plus International 10x10 as a setting; a strong bot (alpha-beta with an endgame database for 6 or fewer pieces) and draw rules (40-move, repetition).
