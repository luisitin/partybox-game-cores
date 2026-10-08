# Conflicts and selected interpretations

Checked 2026-10-08; source IDs refer to SOURCES.md.

| Question | Conflict | Selection |
| --- | --- | --- |
|40 or25 moves? | A1 says40 each American; I1/I3 say25 each International, with shorter endings. | `official` follows variant. International `fortyMove` is an explicit house policy. |
|40 half-moves? | A1 says each player's40; A2 says40 pairs; A3 abbreviates. |80 plies; a complete multi-jump counts once. |
|Third/fourth repetition? | A1/A2/A3/I1/I3 say third; C1 reports an older fourth. |Third, keyed by full board and side to move; digital adjudication after accepted move replaces referee claim. |
|Longest route? | American permits any complete capture; International requires greatest number. |Variant-specific, without International king preference. |
|Crown mid-jump? | American ends on crown row; International crowns only at final landing. A3 documents immediate continuation as house variant. |Apply selected federation behavior; house continuation is not a hidden default. |
|Retain captured blockers? | A1's single jump removes on completion; its chain removes at end. I1/I3 explicitly retain throughout. |International retains blockers. American short jumps can retain them equivalently: landing row parity is fixed during jumps, unlike jumped squares, so prior taken squares cannot later be landings. Forbid recapture. |
|Newer diagonal draw clause? | I1's dated2024 text adds lone-king sole long-diagonal occupation5-each; I2/I3/I6 omit it. |Prefer latest dated primary2024, corroborated by I4. |
|Capture starts a fresh16? | I1 explicitly preserves16 through capture; I6 can drop an earlier 16 window on material transitions. I5 explains16 remaining 3 versus new 5. |Keep old window and intersect new windows at earliest expiry. Promotion with same qualifying material does not restart it. |
|When ending count starts? | I1 says additional moves; I6 resets on move first creating qualifying material/first king. |Start after creation move, not counting it as first additional turn. |
|Long-diagonal withdrawal/reentry? | I1 states sole occupation shortens allowance, but no restart rule. |Explicit digital assumption: activated window persists even after withdrawal/reentry. Sole occupancy means lone king plus no other piece on row+col=9. No stronger source verification claimed. |
|Final-limit capture wins? | I1 explicitly gives no-move/capture win priority for16 and5. Older I2 lacks last5 detail. |Evaluate no-legal-move win first. |
|Immediate K-vs-K draw? | C2 includes unsupported automatic shortcut; federation rules allow decisive immediate capture/blocking. |No blanket material draw. Use legal game/draw proof. |
|Absolute150-each cap? | A2 adds platform cap absent A1. |Do not import as official. |
|Six-piece global coverage? | D3 label versus D4 max 3/side and omitted captures; D5 International much larger. |Publish scope; recurse forced captures; missing material is UNKNOWN, not a draw. Partial <=6 evidence cannot be called complete six-piece coverage. |
|WDL proves history-aware result? | D1 WDL assumes board+side; A1/I1 draw history and D7 conversion difficulty can alter playable result. |Separate theoretical WDL and counter/repetition-aware proof. Heuristic search is not a database entry. |
|Source licence licenses binary data? | D4 Unlicense/D3 source grant do not clearly grant hosted Cake data. Kingsrow author D11 separately gives unrestricted data availability. |Kingsrow has a primary informal author grant; Cake/Scan still need a grant or original generation. Free download alone is not treated as permission evidence. |
|Chinook data is MIT? | D13 permits free use with acknowledgement and prohibits database sale; original project code uses MIT. |Keep data conditions separate and attached. Original JS parser is not a copy of the access-code source. |
|All American six-piece material present? | Cake caps each side at 3, while actual Chinook DB6.idx has every nonempty material/king/man tuple through six [D14]. |Use actual tuple audit, including 4v2/5v1. Complete tuple presence does not verify an untested decoder or every rank/address. |
|Opponent-only capture threat? | Chinook direct queries exclude captures for either side [D15]; simple forced-capture-only descent handles only the current side. |Resolve current-side quiet choices as well. Complete temporary graph closure is required to prove cycles; side-flip negation and bounded-search draw guesses are invalid. |
|Scan npm licence metadata? | D17 package metadata says MIT while actual LICENSE/upstream README say GPLv3, and bitbases are expressly excluded. |No permissive corpus/probe licence inferred from the manifest. |

The delivered core targets standard two-seat play. This is the natural
official game scope, not a claim that federation checkers has 3–8 seats.
Generic tests must disclose which player counts are actually supported.
