# Sources and provenance

Live research: 2026-10-08 UTC. Rules and algorithm facts are paraphrased;
no federation document, source artwork, book extract or external database
is bundled by this research checkpoint. Original code uses MIT. Earlier
denied requests were not source evidence; the relevant live text is now
readable. Exa searches and full-page reads were followed by direct GitHub
and HTTP metadata checks. Mirrors count as one underlying author.

## Rules

| ID | URL | Actually read and taken | Independence / reuse |
| --- | --- | --- | --- |
| A1 | https://nccheckers.org/NCCA/WCDF%20Checker%20-%20Draughts%20-%20English%20Rules.htm | WCDF rules text: setup, all moves, compulsory captures, free route choice, crown-stop, no-move win, threefold and 40 moves each without man advancement/capture. | Federation primary text mirrored by NCCA; facts only, no copy. |
| A2 | https://www.flyordie.com/checkers/rules?portal=flyordie_com | Operating-platform rules confirm short kings, full compulsory jumps, any complete route, crown-stop, 40 pairs and same-side threefold; additional cap/material claims recorded separately. | Independent explanation by a shipped game; no source text/art copied. |
| A3 | https://trevorldavis.com/piecepackr/share/rules/american_checkers.pdf | Independent Biggar/Davis adaptation: moves, compulsory full jumps, crown-stop, 40/threefold, huffing/crown-continuation/ballot variants. | ©2019 Trevor L. Davis, CC BY-SA4.0; facts paraphrased, no artwork/text copied. |
| A4 | https://www.nccheckers.org/NCCA/ACF%20Rules%20for%20National%20Tournaments.htm | Search extraction for ACF formats: go-as-you-please, two-/three-move restriction and 11-man ballots. | Primary tournament context; not independent corroboration of harmonized WCDF rules. |
| I1 | https://www.fmjd.org/downloads/FMJD_Annexes_2024_8-sig.pdf | Latest dated primary Annex1 text: setup/moves, longest capture, delayed removal, final-square promotion, 25/16/5 draws, long-diagonal five-move clause, final-move no-move precedence. | FMJD federation primary text; facts paraphrased, PDF not copied. |
| I2 | https://www.fmjd.org/docs/Annex_1.pdf | Older standalone Annex1 read fully through movement/capture/draw/format sections. Most rules corroborate2024; it omits the newer long-diagonal clause and §6.4 precedence detail. | Same federation author, not an independent source. |
| I3 | https://lidraughts.org/variant/standard | Independently authored operating-game explanation corroborates setup, captures/blockers, maximum routes, delayed crowning, repetition and 25/16/5 draws. | Shipped International game; source diagrams not copied. Older draw summary lacks2024 diagonal clause. |
| I4 | https://opensourcesports.io/rules/draughts-international-fmjd/scoring-draw-rules | Independent rule explanation confirms2024 long-diagonal five-move clause, capture-preserved16 count and final-move winning precedence. | Commentary explicitly cites FMJD sections; independent explanation, not independent rule authority. |
| I5 | https://boardgames.stackexchange.com/questions/61692/how-does-different-draw-rules-interact-with-each-other-in-international-draughts | Independent question/answer explaining that a16 allowance with3 moves left is not extended by a new5 allowance after capture. | Community interpretation checked against explicit primary no-reset clause; no quoted content bundled. |
| I6 | https://github.com/RoepStoep/lidraughts/blob/master/modules/draughts/src/main/variant/Standard.scala | Actual shipped counter implementation starts material count after move creating eligibility, distinguishes first promotion from later promotions, and never resets active5. It omits2024 diagonal rule and does not preserve every earlier16 situation. | Older independent implementation, Git blob ee397751283bcfe1c7923ab03f8bfe729539033c. Algorithm facts only; no code copied. |
| C1 | http://www.darkfish.com/checkers/rules.html | Search extraction comparing rulebooks: historical40/50-move, third/fourth repetition and huffing differences. | Independent comparison; current federation text takes precedence. |
| C2 | https://en.wikipedia.org/wiki/International_draughts | Full page's winning/draw section and references: includes unsupported immediate K-vs-K draw and abbreviated/older limits. | Secondary overview; unsupported shortcuts rejected in CONFLICTS.md. |

American mechanics are corroborated by A1 with A2/A3. International
mechanics are corroborated by I1 with I3; latest draw details additionally
have I4/I5. Exact digital counter assumptions are distinguished from
source facts in CONFLICTS.md. Tournament administration is background.

## Endgame databases and strategy

| ID | URL | Actually read and taken | Scope / licence |
| --- | --- | --- | --- |
| D1 | https://webdocs.cs.ualberta.ca/~jonathan/publications/ai_publications/databases.pdf | Lake/Schaeffer/Lu's retrograde paper: terminal losses, WDL fixed point, residual draw only after complete closure, forced-capture descent, material/king/rank slices; six-piece count2,503,611,964. | Algorithm facts only; no paper copied. |
| D2 | http://webdocs.cs.ualberta.ca/%7Emmueller/ps/2023/2023_Jiuqi_COG.pdf | 2023 Deep Dive paper's size table/retrograde explanation and distinction between database truth and neural predictions. | Independent authors describing same Chinook family, not an independent computed corpus; facts only. |
| D3 | https://fierz.ch/download.php | First-hand source/corpus publication:5/6-piece ZIP21.9MB, smaller corpora prerequisites, source-use permission. Linked https://fierz.ch/db6.zip HEAD returned200 and22,912,173bytes at08:41:21UTC. | Source reuse permitted; hosted binary data redistribution grant not verified. Corpus not acquired/bundled at this checkpoint. |
| D4 | https://github.com/rhalbersma/cake | Actual LICENSE and dbmain/index/probe headers/bounds read: maxpieces6 but maxpiece3; capture-position values intentionally invalid; Windows-specific generator, theoretical WDL. | Repository source Unlicense. Separate data grant is not inferred from source licence. |
| D5 | https://hjetten.home.xs4all.nl/scan/scan.html | Direct Scan host: International standard2–6 corpus706MiB ZIP; independent variant archives; Linux/Mac/Windows engine. | Engine GPLv3; separately hosted data licence not established; no code/data copied. |
| D6 | https://github.com/rhalbersma/scan/blob/master/readme.txt | Author's WDL-only bitbase explanation, size6 around2GiB RAM, search/evaluation, normal/killer/breakthrough/Frisian/losing variants. | ©2015–2019 Fabien Letouzey GPLv3; algorithm facts only. |
| D7 | https://edgilbert.org/EnglishCheckers/mtc.htm | First-hand MTC explanation: WDL does not specify progress-making moves; conversion is man move/capture; conversions can lie beyond a search horizon. | Facts only; no dataset/code copied. |
| D8 | https://github.com/eygilbert/egdb_intl/blob/master/README.md | Actual driver docs: WLD/DTW/MTC distinctions, capture/side exclusions, UNKNOWN caveats, Linux portability. Actual LICENSE_1_0.txt read. | Driver Boost Software License1.0; separately hosted data licence not verified. No code/data copied. |
| D9 | https://github.com/eygilbert/GuiCheckers | README lead: optional six-piece DTW corpus externally hosted, too large for repository. | No data licence or delivered coverage assumed. |
| D10 | https://github.com/loks0n/rapid-draughts/ | Search/package/README lead: MIT TypeScript bitboard engine, WCDF rules, npm rapid-draughts@1.0.6. | Useful future independent-engine lead; implementation not read/imported into coordinate oracle. |

Pinned Cake Git blobs read:

- builddb4/dbmain.c:652ef6d6a41514f58e524836c7564f5805a299c7.
- builddb4/dbmain.h:bbad3f76480d6d7fe0194f1be173cf3cdc33ecc5.
- builddb4/index.c:93f21316252bd86f55d8c5b10661b92233994d9c.
- dblookup/dblookup.c:68ca6efa59dc849b3637d9c95818473a67744859.

Cake's label is not proof of global <=6 coverage: its probe omits
lopsided material and meaningful capture entries. An acquired/generated
corpus needs actual material coverage, licence, checksums and independent
checks. A resource-truncated graph is UNKNOWN, never DRAW. Bare-board WDL
is theoretical; it does not itself solve a game with existing draw history.

## Original independent oracle

tests/reference-moves.mjs was authored from rule sources before reading
future production move code. It clones full coordinate matrices per jump
and imports no production helper, adjacency, bitboard, apply or search.
Input/output indexing was agreed in advance. BOTS.md records independent
endgame validation design; no execution is claimed until it runs.

No source art, book passage, paid content, secret, signed download link,
tracking asset or runtime network dependency is bundled here. GitHub
provided source/license fallback; an npm package lead was reachable.
Knowledge fallback was unnecessary for the critical rules. Unread URLs
remain leads, never proof. Observed historical research blockers remain
historical evidence and are not grounds to stop this implementation.
