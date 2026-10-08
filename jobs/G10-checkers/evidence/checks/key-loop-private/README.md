Private board-key experiment; public moves.ts and all game/bot/data files remain unchanged.

14,004 exact key/immutability cases PASS, including4,000 actual final boards/10,000 synthetic/four sparse arrays. Native component ABBA was458/404ms original versus148/130ms candidate for280,000 calls each. Actual48 serialized SearchReport/cursor/block-request comparisons plus3 full games PASS, closed19:24:33.616 exit0. The subsequent native complete-game ABBA closed19:29:52.226 exit0; all32 complete records exactly match original gold.

International original14.137/13.500s versus candidate16.771/11.252s; American original2.179/1.749s versus candidate2.542/1.886s. Whole-game gain is inconsistent and not established; this prototype is not adopted. Root independently reviewed the single-function diff/source fingerprint and the preserved report/cursor/game proof. Microtiming is not full-game, frame or CI acceptance.
