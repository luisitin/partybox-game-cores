# Measured bots

The bot policy receives only its controller projection: its revealed hand,
public bids, scores, tricks and history. Blind decisions receive no cards.
No policy reads other hands or the stock. Privacy substitutions test this
boundary for every phase and all three skills.

Easy (`easy`) randomizes legal plays and exchange cards, uses rough honour/
trump bidding with noise, and occasionally tries nil. Medium (`normal`)
counts honours/trump length, cautiously bids nil, tries to make contracts,
protects its nil partner and avoids unnecessary bags. Strong (`sharp`)
weights suit length/trump rank, checks singleton nil danger, chooses the
cheapest winning card, tracks public played ranks and inferred void suits,
and protects partner contracts/nils. It does not claim expert search strength.
SOURCES records the bidding/history/AI research actually read; no code,
models or weights were copied.

`node league.ts --write` measured seeds1–2000,2,000 complete matches per
row. The higher skill rotates seats; partnership teams alternate parity.
Cutthroat includes a declared fixed third easy seat; outright and direct
pairwise wins are both reported. Ties count as losses in Wilson bounds.

| Table | Higher vs lower | Outright wins | Direct pair wins | 95% lower bound (outright) |
| --- | --- | --- | --- | --- |
| 3-player Cutthroat | Strong vs medium | 1440/2000 (72.00%) | 1485/2000 (74.25%) | 69.99% |
| 3-player Cutthroat | Medium vs easy | 1795/2000 (89.75%) | 1890/2000 (94.50%) | 88.34% |
| 4-player partnerships | Strong team vs medium team | 1515/2000 (75.75%) | same | 73.82% |
| 4-player partnerships | Medium team vs easy team | 1996/2000 (99.80%) | same | 99.49% |

All four direct-pair lower bounds also exceed50%. One Cutthroat strong/
medium pair tie; no other ties. All8,000 matches ended naturally at the
500-point or documented−500 mercy condition. Average hands respectively
19.5855,22.6875,12.2530,12.2955; maxima34,48,26,28. Largest final state
5,637 bytes with scheduled review timers. These are comparisons within this implementation, not claims
against published AIs. Measured total286,438.80 ms with core checks running
concurrently. `bot-results.json` contains exact reproducible counts;
`node league.ts` recomputes/asserts them. Optional`--start=2001` measures a
fresh held-out sequence, which has not run at this milestone.

Round3 corrected the bot API's review behavior:it returns null instead of
premature Next. Engine timers now drive8s trick/60–90s ledger reviews;
human Next remains available. Recomputed all8,000 matches in230,678.18ms:
every win/tie/hand/input count above is unchanged; final timestamp sizes
increase slightly.31 invariant/replay/completion tests and25 mutations pass.
