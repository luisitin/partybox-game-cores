# KEEP3 text admission boundaries
An independent code-unit decoder matches the actual write schema and catalog factory
over all 65,536 single units, all 1,048,576 valid surrogate pairs, 5,120 adjacent
edges, 1,003 additional seeded strings and 455 catalog controls: 1,120,690 saved rows.
Python independently reads the complete gzip EOF and checks every row using its
strict UTF16 decoder. There are 2,517 actual malformed-input refusals with valid
retries, 210 expected catalog refusals, and no discrepancies. The original raw
gzip is 10,324,975 bytes, SHA f450abe5087a1fc747a83304b3988f08151b419e993323fb04e79b6381135949.

The new regression first failed an extra length assumption: pinned Zod4.6.5 counts
raw Unicode code points, whereas the existing normalized storage/UI bound counts
UTF16 units. The exact failed test, installed public source, logs and wrapper are
preserved. This is an oracle/prose correction, not a product change. A failed
wrapper's generic source flags are not observed changes; all 3,839 physical guards
were independently byte equal before correction. The output-directory allocation
error before the separate reader launched is also retained.

Distinct actual controls cover 24 raw length edges and 14 catalog boundaries.
Nine full games with maximum admitted supplementary-plane catalogs finish with
1,560 legal replay events, 432 writes, 108 rounds and exact independent scores.
Every saved state stays under the unchanged 262,144-byte limit; peak 158,015 bytes.
The corrected permanent test adds independent codepoint counting plus actual
normalized storage refusals and valid emoji boundaries. Local 36 focused/four
original strict controls/types/data/fixtures/two builds/benign equality pass.
No product, page, bot, original oracle, sampler, gate or clock changes.
Genuine current c30 original full proof is included; new source still needs its own
full original workflow and whole official archive. KEEP3 is only prospective second
no-player-gain until that acceptance. PR18 remains Draft.
