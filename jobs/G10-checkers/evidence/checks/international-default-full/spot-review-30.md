# Agent review: 30 second-reader spot checks

Reviewed UTC: 2026-10-08T14:21:46.310884+00:00.

These first 30 pre-existing numbered queries span 30 distinct six-piece material files. The reviewing agent read the original C++ output, the independently authored reference result, the compact piece locations, side to move and actual public default result for each row. This is a review of retained executed results; the native binary was not rerun during this review, and these outcomes were not solved by hand. All 30 agree.

Original result codes: 1 = win, 2 = loss, 3 = draw, always relative to the player whose turn it is. Default codes: +1 = win, −1 = loss, 0 = draw. Piece notation: W/w are positive king/man, B/b are negative king/man. Playable squares are zero-based, top to bottom.

| ID | Material file | Side | Piece locations | Original C++ | Independent reference | Actual default |
|---:|---|---:|---|---:|---|---:|
| 0 | db6-0303 | +1 | W6 B27 W34 W35 B38 B44 | 3 | draw | +0 |
| 1 | db6-0312 | +1 | B8 B10 W11 W22 w43 B48 | 3 | draw | +0 |
| 2 | db6-0321 | +1 | W15 w25 w29 B36 B39 B49 | 3 | draw | +0 |
| 3 | db6-0330 | +1 | B0 B7 B17 w26 w27 w30 | 2 | loss | -1 |
| 4 | db6-0402 | +1 | W11 B25 B30 B32 W47 B49 | 3 | draw | +0 |
| 5 | db6-0411 | +1 | w5 W10 B15 B35 B42 B44 | 2 | loss | -1 |
| 6 | db6-0420 | -1 | B14 w25 w39 B41 B47 B49 | 1 | win | +1 |
| 7 | db6-0501 | -1 | B22 B23 B27 B33 B36 W44 | 1 | win | +1 |
| 8 | db6-0510 | +1 | B2 B18 B19 B29 B35 w48 | 2 | loss | -1 |
| 9 | db6-1212 | +1 | B0 b9 B14 w21 W32 W49 | 3 | draw | +0 |
| 10 | db6-1221 | +1 | b1 w6 B7 W8 w12 B42 | 3 | draw | +0 |
| 11 | db6-1230 | -1 | w5 b10 B12 w32 B44 w48 | 1 | win | +1 |
| 12 | db6-1302 | +1 | B5 b13 W14 B31 W35 B49 | 3 | draw | +0 |
| 13 | db6-1311 | +1 | w5 B17 b30 B37 B39 W45 | 3 | draw | +0 |
| 14 | db6-1320 | -1 | B1 w18 w23 B24 b42 B44 | 1 | win | +1 |
| 15 | db6-1401 | -1 | B2 B11 W14 B27 B33 b42 | 1 | win | +1 |
| 16 | db6-1410 | +1 | B1 b14 B28 w31 B45 B47 | 2 | loss | -1 |
| 17 | db6-2121 | +1 | B5 W7 b9 w33 b35 w40 | 3 | draw | +0 |
| 18 | db6-2130 | -1 | b1 B10 w17 w20 w33 b35 | 1 | win | +1 |
| 19 | db6-2202 | -1 | W1 b3 W5 B23 b27 B40 | 3 | draw | +0 |
| 20 | db6-2211 | +1 | B0 b8 b12 w26 B35 W41 | 3 | draw | +0 |
| 21 | db6-2220 | +1 | B3 w9 b12 B31 b37 w47 | 2 | loss | -1 |
| 22 | db6-2301 | -1 | B30 b32 W34 B38 b39 B47 | 1 | win | +1 |
| 23 | db6-2310 | -1 | b6 B8 b9 B24 B29 w32 | 1 | win | +1 |
| 24 | db6-3030 | +1 | b4 b14 b18 w19 w20 w36 | 3 | draw | +0 |
| 25 | db6-3102 | -1 | W0 b20 W22 b23 b42 B48 | 3 | draw | +0 |
| 26 | db6-3111 | +1 | W1 b4 b15 B16 w19 b40 | 2 | loss | -1 |
| 27 | db6-3120 | +1 | b13 B15 b21 w31 w37 b38 | 2 | loss | -1 |
| 28 | db6-3201 | -1 | W1 b10 b11 B20 b29 B48 | 1 | win | +1 |
| 29 | db6-3210 | -1 | b6 B18 w21 B28 b32 b40 | 1 | win | +1 |

Reviewed details: the WLD sign is relative to side, not a fixed colour; the original 3v3/4v2/5v1 material labels match the six distinct occupied squares; the sampled unpromoted men avoid their promotion rows. The broader 10,000-row acceptance receipt separately verifies all 37 classes, all 148 colour/turn orientations, 22 second-subslice positions and all ranks against the separately authored reference. Draw history and current captures are separate game checks.

Primary second reader: [unchanged Boost C++ source revision](https://github.com/eygilbert/egdb_intl/tree/eacf10797e8f6c81d618caa7af1eba05df139ac7). Original native execution, query hashes and unchanged-source compilation are recorded in [the original proof](../international-original-complete/international-original-reference-report.json).

Read source hashes:

- Original C++ raw output: `992f4bde749d9c4824cb9a61d60dadf58d16362e490bedbd19a32660e09cfb78`.
- Actual default replay output: `da1c308738c89729daf43600b9296d2055b9be488a119104fb445f14d8b1c904`.
- Native + independent query transcript: `b47f0d22bbf35757eba24a34d7e0b02bbddbc6651985d43dd38c828c51908167`.

The earlier generated `second-source-30.json` sampler is retained separately. This review uses the explicit IDs 0–29; it does not relabel that generated sampler as manual evidence.
