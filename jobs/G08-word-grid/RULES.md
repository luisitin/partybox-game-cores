# Published rules and the Shake Up edition

This is the owner's existing simultaneous word hunt. The following rules were cross-checked in live, pinned sources before implementation. Manufacturer PDFs were denied by the managed proxy; none is represented as a read primary manual. Root RULES permits GitHub/registry fallbacks. Physical-box edition labels remain a re-verification item.

## Sources and agreement

- [Manufacturer-linked pf-boggle scoring/minimum table](https://github.com/pillowfication/pf-boggle/blob/bfe81ba0ddacaa9988e754fbf56e8686e57df6b1/README.md) and the independent [FiveThirtyEight rules quote](https://github.com/reallyasi9/riddlers/blob/d945efbe03914899aedbdf2c200dadb2b1cff896/boggle/README.md): length scores1,1,2,3,5,11; adjacency;4×4 minimum3 and5×5 minimum4 in the pf table. [WordCube](https://github.com/mkonikov/WordCube/blob/6a7ecadc7b597bbe258d7d4d441255e6527fe1e3/README.md) independently reports the5×5 minimum4.
- [Clifford Thompson](https://github.com/cliffordthompson/boggle/blob/05b095d3abc78bdd4e13bfc27a81dd57f3a1816d/README.md) and [Megulus](https://github.com/megulus/boggle/blob/d6ca286c0bccee5e88c0f77c2bb122fb9867e111/README.md): diagonals count, touching cubes, no cube reuse in one word; classic/New minimum3.
- [Taylor Scafe](https://github.com/taylor-scafe/Boggle-VB.NET/blob/12897d38ababae182e01f02e320e0ab743bfda50/README.md) and independent [Boggle Party](https://github.com/nsnishant1/Boggle-Party/blob/812fa852fbab43c0d0461e79bbf22c79fb13a532/README.md): words found by two or more players cancel for everyone; Qu occupies one cube and counts two letters. Taylor also corroborates the chosen score table.
- [Princeton-style BoggleBoard](https://github.com/phareskrad/algs4/blob/18abfcf9667d3ce67974f1628954cd6ea285c80d/assignments/Boggle/BoggleBoard.java) distinguishes BIG and MASTER5×5 faces; BIG is independently corroborated by [Rob's classroom specification](https://github.com/RobAWilkinson/boggle-react/blob/851bd98a2a6b3abc563cee74fa6ce336ab516fb1/README.md) and Megulus. MASTER agrees with pf-boggle. pf/plett/Taylor share BGG ancestry and are not counted as independent physical boxes.

Read receipts, hashes, additional sources, disagreements and30manual row checks are in SOURCES.md, CONFLICTS.md, VERIFY.md and start/research/.

## Board, hunt and accepted words

1. Shake the selected16 or25 letter cubes. Each cube appears once in a uniformly seeded permutation and contributes one uniformly selected face. The authoritative board is generated before any animation; physics never chooses letters.
2. Everyone hunts the same board for180seconds by default. Trace a path through horizontally, vertically or diagonally touching cells. Never use a cell twice in one word; crossing a previously traced segment without reusing its cells is allowed. Row edges do not wrap. Qu supplies both q and u using one cell, including for the word's letter count.
3. A4×4 word needs at least3letters; a5×5 word needs4. Different paths spelling the same word add only one entry to that person's list; their first path is retained. The server derives the word from the cell path and accepts no typed word text.
4. The chosen language dictionary judges words. English and Spanish have separate sorted lists; Spanish accents fold while ñ remains distinct. This software edition uses dictionary membership rather than an extra proper-name/abbreviation grammar filter. The broad list can contain obscure entries. English optionally uses the105840-word SCOWL≤70 intersection; default remains full. The optional list is smaller, not a guarantee of universal familiarity.
5. Family mode refuses the recorded blocked words; spicy allows them. Other dictionary misses can stay as question-mark entries for reveal-time VIP adjudication. Lists permit150entries and12unknowns per person, additionally bounded by a conservative96KB round submission allowance so total state stays below256KB.

## Scoring, reveal and winner

| Word length |3–4|5|6|7|8+|
|---|---:|---:|---:|---:|---:|
| Unique valid word |1|2|3|5|11|

- A word found by two or more players scores zero for every finder, including if the VIP accepts a shared dictionary miss. Dropped players' already-submitted words still cancel duplicates. Solo scores every accepted unique word. Rejected, blocked and shared words never subtract points.
- Reveal player lists in increasing round-score order, breaking order ties by seat. Group people with no words into one card, then show the best word nobody found. Cards last3.5–9seconds using shared reading-time estimation. The TV sees counts during the hunt; each phone sees only its own list until a word's public reveal beat.
- Only a real VIP input may accept a dictionary miss, and only once that word's beat has appeared. Acceptance applies to the word, never to one favoured person. Removing acceptance before the round is scored returns its pending points to zero; accumulated game scores never decrease.
- Add the round score once, at tally. Default3rounds; highest accumulated total wins. Ties share rank1,1,3, with all tied winners. The final screen includes3–5awards for longest unique word, unique/shared words, first-word speed or adjudicated words, with idle-game fallbacks. Awards do not alter scores.

## Owner edition settings and host rules

| Choice | Default | Supported options |
|---|---|---|
| Players | Owner's lobby |1–16, including solo and bots; best3–8|
| Grid |4×4|4×4 /5×5|
| Rounds |3|1–5|
| Hunt seconds |180|90 /120 /180 /240|
| Content |English|English /Spanish|
| English dictionary |Full|Full /common; Spanish always full|
| Family filter |On|Family /spicy|
| Reader |English host-hype; Spanish dora|Matching-language voice /none|

Connected humans may finish early together; bots and away players do not block that exit. Dropped lists/scores remain. Initial and trusted-join ids must be distinct, nonempty, <=128 code units and <=130 UTF-8 JSON bytes including quotes/escapes; names<=80 and avatarIds<=128 code units. A trusted host can add a named late joiner with score0, immediately able to hunt on the current board; unknown connection ids cannot fabricate a seat. Pause freezes input and shifts the deadline; word-speed awards exclude paused time. Skip advances shake→hunt, hunt→reveal, one reveal card, or tally→next round/results. End scores an already-revealing round once, then finishes. Idle rooms still finish through deadlines.

The offline page uses the same reducer and existing client pieces. Its explicit hot-seat timing adaptation gives each human an equal private hunt duration on the same board, with a masked handoff. Others look away; bots run during the first turn. The production game remains simultaneous. The offline host uses the owner's flat-grid fallback and does not claim the absent production sound/3D SDK.

## All researched variants and decisions

- English5×5 BIG vs MASTER/Deluxe: preserve original BIG. In10000grids each, BIG mean255.2593/below60=0.50%; MASTER246.3785/0.67%. MASTER has slightly lower absolute SD. Two DHLNOR cubes in BIG are corroborated, not repaired as a supposed duplicate error.
- English classic1983 vs New1992 four-by-four face tables, and6×6 Super Big/double-letter/blank-face variants appear in source reports. Keep the owner's New4×4 and BIG5×5; no6×6 edition or new digraph faces are added. Published Spanish faces differ; retain the owner's original Spanish design and report its independent10000-grid density rather than asserting a particular physical edition.
- Rob's5×5 classroom allows3letters; owner, manufacturer-linked pf table and WordCube use4. Choose4. hturnbull/Jordan give7letters4points; pf/FiveThirtyEight/Taylor give5. Choose5.
- Stanford's classroom uses length-minus-three scoring; Megulus describes all-word/simple-score and wagering alternatives. Taylor adds invalid-word penalties and underlined-letter multipliers. None replaces the owner's cancellation/length table or nondecreasing totals.
- WordCube uses120seconds; source editions also report3-minute hunts. Keep180default with the owner's existing90/120/180/240choices. Boggle Party exposes additional minimum-length/time settings; these are not imported.
- Permissive/full and common English dictionaries, Spanish accent folding, family/spicy, VIP word acceptance, rounds, pause/skip/end and equal-time offline hot-seat are clearly identified software/owner choices rather than unread manufacturer promises. No commercial SOWPODS corpus, game artwork or implementation was copied from the comparison projects.

Offline New game confirms before abandoning live progress, preserves setup choices and selects a fresh seed. Cancelling keeps the game and its private clock; enter a previous seed to replay deliberately.
