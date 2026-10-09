# Shake Up

## Overview
A simultaneous word hunt. Each round, letter cubes are thrown into a 4×4 (or 5×5) tray on the TV and the
same grid appears on every phone. For the hunt clock, players trace words through touching cubes (diagonals
count, each cube once). Then each list is revealed: a word found by two or more players is crossed off for
everyone; words only you found score by length. Three rounds by default; highest total wins.
Example: Cleo traces S-T-R-A-N-D-E-D (8 letters, +11). Ben and Eli both found TRAIN, so it scores 0 for both.

## Players
1–16, best with 3–8. One player plays solo: nothing is crossed off. Bots welcome (`supportsBots: true`).
Late joiners join the current round at once with score 0 through the trusted host `joinPlayer(PlayerInfo)` adapter. Unknown socket ids remain spectators. Every input is on the phone.

## Phases
| id | TV | Phone | Exit |
|---|---|---|---|
| `shake` | 3D tray: cubes thrown and landing (cinematic camera; they rest about 3.4 s in, then a ripple across the grid fills the phase); "Round n of N · Shake it up!" | 👀 Watch the TV; the grid comes with the hunt clock (PhoneStage: laid out like the hunt so the grid does not move at the hand-off; face down, turned over in a diagonal wave from 60% of the roll that ends a fast step before the hunt, its steps shortened on 5×5) | deadline 4.2 s · VIP skip |
| `hunt` | top-down tray, 128 px clock, per-player word COUNTS in one ranked column (a re-sort glides, never blinks), ✓ for done, toast for 7+ letter finds | grid, trace, own list (its own scroller under the grid, always two chip rows deep; the clock and grid never scroll away), verdicts, "I'm done" (a card over the grid, which never moves) | deadline (`huntSeconds`) · every connected human done · VIP skip |
| `reveal` | one card per beat, its best scoring word glows on the tray (nothing glows when nothing scored); then "the best word nobody found" | 👀 Watch the TV; VIP: which card is up, rule on dictionary misses (with who found each) + Next card in the sticky bar (PhoneStage: the card, its total as a badge) | one beat each (`readingMs`, 3.5–9 s, `nextStep`) · VIP skip = next beat |
| `tally` | longest unique word spotlit with its finder (and anyone tied on length), Scoreboard climbs | own round summary after the climb (PhoneStage: the spotlight and the board) | deadline ≥ 6 s · VIP skip |
| `done` | (shell results) | your place, score and awards (PhoneStage: the whole result — winner, ranking, awards, best word nobody found) | — |

Beat order: players with words, lowest round score first (the biggest list lands last), one card for
everyone with no words, then the missed word. Rounds repeat shake → tally; after the last tally, `done`.

A player card lists up to 14 words in three bands: words that score (chips with points), dictionary misses
(❓), then shared words, crossed off with the faces of who else found them (8 on the TV, 6 on a phone, then
"+N more shared"). Dictionary misses and counted words are always listed (every ruling moves a chip the room
sees); the best unique words fill the room left, then shared ones. Scoring words left off are one last chip,
"+N more words +P", so the chips always add up to the total. A VIP ruling moves its chip between bands in
place; the total counts it as it lands. Every phone phase and PhoneStage card crossfades into the next, and so does the swap between the hunt and
the PhoneStage on a phone that cannot see the TV (except shake → hunt: both hold the grid in one place).
The path line on a flat grid runs under the cubes, so it links them without covering a letter; the TV's flat
grid (reduced motion, no WebGL) also numbers the glowing word's cubes so its order reads. On the 3D tray the
word reads in order by a dot on its first cube and an arrow into each next one.

## Inputs
```ts
type Input =
  | { t: 'word'; path: number[] }                 // cell indices; server derives the word
  | { t: 'done'; done: boolean }                  // "I'm done" / "Keep hunting"
  | { t: 'counts'; word: string; counts: boolean } // VIP only (event.vip), reveal only
```
Free text never enters. Unchanged state for: a path that is not touching/repeats/out of range, fewer than
`minLen` letters, a word already on my list, a word while I'm done, wrong phase, `counts` from a non-VIP or
for a word not yet shown on the TV. Accepted but recorded as a verdict (no list change): a blocked word in
family mode (`blocked`), a full list (`full`: 150 words, or 12 non-dictionary words, or the round's conservative96KB serialized-submission allowance). Paths have at most25 cells; Qu allows26-letter words. Disconnected players cannot submit until reconnecting.
Keyboard: arrows move the focused cube, Enter/Space adds it, Escape clears; Submit sends the traced path. Cancelled pointer gestures clear without submitting.

## Scoring
- Points by letters: 3–4 → 1 · 5 → 2 · 6 → 3 · 7 → 5 · 8+ → 11. "Qu" is one cube and two letters.
- A word scores only if exactly one player has it AND it is in the content-language dictionary, or the VIP
  ruled "✓ That counts" (word-level: applies to whoever has it; still 0 if shared).
- Non-dictionary words stay on the list as ❓ and score 0 unless counted.
- Solo: every valid word scores. Scores never go down; rejected and shared words score 0, never negative.
- Ties share a place (1, 1, 3). Awards (3–5): 📏 Wordsmith (longest unique word), 🐺 Lone Wolf (most unique),
  🧠 Great Minds (most shared), ⚡ Quick Draw (fastest first word, averaged), 📖 Dictionary Diver (most counted,
  only if any); fallbacks for idle games: 🎯 Big Round, ✍️ Steady Hand, 🪷 Zen Garden.
- Results text (headline, note, place lines, award titles, descriptions and values) is written in the
  content language, like the reader's lines, with numbers inside whole sentences ("1 palabra única").

## Edge cases
- One player: solo scoring; reveal shows the list and the best missed word.
- Drop mid-hunt: words stay and count. "Everyone done" ignores away players and bots, so a drop can close the
  hunt. Back in the same round: carry on with the same list.
- Late joiner: added by the trusted host with score0; can hunt at once; spectates reveal/tally until the next shake. Root connection events carry no names and cannot create seats.
- Everyone idle: hunt ends at its deadline; reveal is one "No words this round" card + the missed word; the
  game still ends after the set rounds. Results still give 3 awards.
- Ties: shared place, no tie-break. Same word by different paths: one entry, first path kept for the glow.
- VIP skip: shake → hunt · hunt → reveal (words so far) · reveal → next beat, then tally · tally → next shake
  or done. VIP end: a round mid-reveal is scored, then done.
- Pause: deadline shifts (SDK); word times exclude the pause (`pausedMs`); phones grey the grid.
- Family mode: blocked words are refused and never read; the missed word skips them too.

## Settings
| key | type | default | range |
|---|---|---|---|
| `rounds` | number | 3 | 1–5 |
| `huntSeconds` | select | `180` | `90` · `120` · `180` · `240` |
| `grid` | select | `4x4` | `4x4` (3+ letters) · `5x5` (4+ letters) |
| `reader` | select | `host-hype` (en), `dora` (es) | content-language voice + `none`; stale language choices fall back |
| `dictionary` | select | `full` | full list or optional English SCOWL70 intersection; Spanish always full |
| `spicy` | boolean | false | off: LDNOOBW words refused |

## Content
- `cubes.en.json` / `cubes.es.json`: `{ lang, source, sets: { '4x4': 16 cubes, '5x5': 25 cubes } }`, cube =
  `{ id, faces: [6] }` (capital letter, `Ñ` or `Qu`). Spanish sets are original. 10000-grid means: en4=134.54, en5BIG=255.2593, es4=183.9479, es5=368.8508; edition/spread/lower-tail details in job research report.
- `words.<lang>.json`: sorted dictionary (en274711 · es636513 words, accents folded, ñ kept), binary search. Common English105840 words; SCOWL70 still contains uncommon words, not a promise every word is familiar.
- `blocked.<lang>.json`: LDNOOBW single words in the dictionary. `bot-words.<lang>.json`: `{ easy, normal, sharp }`.
- Built only by `content/build-words.ts` from MIT/CC lists (see `content/SOURCES.md`). Production phones receive views; the self-contained offline host bundles the lists to run the same reducer locally.
- No typed answers: the path is the answer and the dictionary is the judge (no matcher needed).

## Standalone verification and offline host
From `jobs/G08-word-grid`, `npm ci` then `npm test` runs the job gates. `play.html` opens from disk without a build/network. It wraps the existing phone/TV pieces and uses their authored flat fallback; models, film look and CSS are preserved. Each hot-seat human gets the same clock on the same board, with masked handoff. Bots play during the first turn; everyone else looks away while a person hunts. This local timing adaptation does not change the simultaneous production rules.
The actual root contract is checked using explicitly test-only SDK/UI/speech/flat-table bindings. Production audio and3D SDK integration still requires its real runtime; those capabilities are not claimed by the offline host.

Initial/trusted-join ids are bounded by both128 code units and130 UTF-8 bytes in JSON (including quotes and escaping); names allow80 and avatarIds128 code units. This keeps repeated round-log keys inside the256KB contract even for Unicode/control/surrogate inputs. Invalid initial context throws; an invalid trusted join preserves state.
