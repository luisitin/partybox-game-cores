# Content sources (licences recorded for the record)
| Pack | Built from | Licence | Notes |
|---|---|---|---|
| words.en.json | `an-array-of-english-words` 2.0.0 | MIT | a–z, 3–17 letters, every q followed by u |
| words.es.json | `an-array-of-spanish-words` 2.0.0 | MIT | accents folded (CAÑÓN = cañon), ñ kept |
| blocked.{en,es}.json | `naughty-words` 1.2.0 (LDNOOBW) | CC-BY-4.0 | single words that are in the dictionary |
| bot-words.en.json | `wordlist-english` 1.2.1 (SCOWL 10/20/35/40/50) | MIT/SCOWL | easy ≤5 letters, normal ≤7, sharp ≤9 |
| bot-words.es.json | hermitdave/FrequencyWords `es_50k.txt` (2018) | CC-BY-SA-4.0 | top 2.5k / 10k / 30k ∩ dictionary |
| cubes.en.json | classic 16-cube set; commonly published 25-cube set | game facts | 25-cube letters: verify against a real box |
| cubes.es.json | written for Shake Up | own | ~166 solvable words per 4×4 grid (en ≈141) |

Rebuild: `pnpm tsx games/shake-up/content/build-words.ts --es-freq <es_50k.txt>`.
Sizes: words.en 3.2 MB, words.es 8.1 MB, bot-words 0.85 MB. Loaded once per server process; never sent to phones.
The English list is permissive (it accepts words like TONDINO and HOIDEN). If that feels too loose in play,
intersect it with SCOWL 70 in the build script.
