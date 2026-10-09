# Content sources (licences recorded for the record)
| Pack | Built from | Licence | Notes |
|---|---|---|---|
| words.en.json | `an-array-of-english-words` 2.0.0 | MIT | a–z, 3–26 letters, every q followed by u |
| words.es.json | `an-array-of-spanish-words` 2.0.0 | MIT | accents folded (CAÑÓN = cañon), ñ kept |
| blocked.{en,es}.json | `naughty-words` 1.2.0 (LDNOOBW) | CC-BY-4.0 | single words that are in the dictionary |
| bot-words.en.json | `wordlist-english` 1.2.1 (SCOWL 10/20/35/40/50) | MIT/SCOWL | easy ≤5 letters, normal ≤7, sharp ≤9 |
| bot-words.es.json | hermitdave/FrequencyWords `es_50k.txt` (2018) | CC-BY-SA-4.0 | top 2.5k / 10k / 30k ∩ dictionary |
| cubes.en.json | New4x4 and BIG5x5 tables, pinned Princeton/classroom/pf reports | game facts | originalBIG retained after10000grids per candidate; primary box edition recheck remains |
| cubes.es.json | written for Shake Up | own | 10000-grid mean183.9479 on4×4 and368.8508 on5×5; original faces retained |

Rebuild from the job folder: `npm run build:words`; pinned unchanged Spanish frequency input and all licence notices are in `start/research/`.
Sizes: words.en 3.2 MB, words.es 8.1 MB, bot-words 0.85 MB. Loaded once per production server process; production phones receive views. The self-contained offline host includes dictionaries to run the same reducer locally.
The English list is permissive (it accepts words like TONDINO and HOIDEN). Optional common English is the105840-word intersection with SCOWL levels<=70. It still contains uncommon words. The original builder regenerates it; default remains full.
