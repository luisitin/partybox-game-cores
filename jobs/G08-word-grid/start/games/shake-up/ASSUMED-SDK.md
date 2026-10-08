# What this game assumes about the SDK (check on main before merging)

G08 verification status: the original assumptions below are retained as integration history. Actual root `contract/` types now bind `game` directly: numeric seed, PlayerInfo avatarId/connected/bot, phase.paused/deadline|null, timer phaseId/startedAt without step, bot(state,id,Rng,skill), results scores/rank/playerId and envelopes. `nextStep` takes a change callback. Unknown player events cannot carry names; trusted `joinPlayer` restores late joins. Language-specific reader options are enforced. Test/offline SDK/UI/speech/table bindings live only in `start/test-support/`, and no original standin/harness folders are included. Missing production audio/3D/UI runtime is an explicit unverified integration point, not a fabricated successful check.

Written without repo access. Every **name** below comes from the PartyBox context; every **signature** is a
guess, implemented by the local stand-in in `standin/game-sdk/` so the game could be run, tested and
screenshotted. Where main differs, adapt the call sites listed; the game logic does not change.

## Server (`@partybox/game-sdk`)
| Used as | Where | If main differs |
|---|---|---|
| `nextFloat(rng) → [value, rng]`, `nextInt(rng, n)`, `shuffle(arr, rng) → [arr, rng]`, `seedRng(seed)` | phases/shake.ts, bot.ts, index.ts | swap to main's rng helpers; keep rng in `state.rng` |
| `composeReduce({ phases, advance, end, onPlayer, afterVip })` | index.ts | `afterVip(state, ev, prev)` is used to add pause time to `pausedMs` and recheck all-done on resume; map to main's pause hook / `recheckOnResume` |
| `isTimerFor(state, ev)` with timer `{ phaseId, startedAt, step }` | every phase | reveal beats rely on `nextStep(state, deadline)` re-arming the timer |
| `readingMs(words, { lang })` | phases/reveal.ts, phases/tally.ts | — |
| `hasPlayer(rec, id)` | index.ts | — |
| `numberSetting / boolSetting / selectSetting(settings, key, …)` | index.ts | — |
| `InitCtx { players: { id, name, isBot }, settings, seed, now, presence, contentLang }` | index.ts | late joiners come from `player` events with `name` |
| `Bot.sampleInput(view, { playerId, rng, skill })` | bot.ts | if main passes `(view, rng)` only, read skill from the view or ctx |
| `Results { ranking, winnerIds, awards, headline, headlineNote, placeLines, tags, detail }` | results.ts | built by hand; swap to `buildResults` / `pickAwards` if preferred |
| `SpeechRequest { key, voice, parts }`, `reader()`, `toSpeakable()`, `drainSpeech()` | speech.ts | — |

Not used: `onPlayerEvent`, `patienceNet`, `drawFromDeck`, the matcher (no typed answers). "Everyone done"
is `allDone()` in phases/hunt.ts, called from the hunt reducer, `onPlayer` and resume.

## Client (`@partybox/game-sdk/ui`, `/ui/table3d`)
| Used as | Where |
|---|---|
| `L(text, vars)` with `{name}` placeholders | everywhere |
| `Me { id, name, isVip, canSeeTv }` as the `me` prop; `skip` prop on the VIP phone | Controller.tsx, phone/* |
| `CrossfadeSwap { swapKey }` between phone phases and PhoneStage cards; `phoneStagePhases` includes `done` (PhoneStage shows the final results) | Controller.tsx, phone/Stage.tsx, phone/Final.tsx |
| `useServerNow(ms)` (server-synced clock), `useSound()`, `buzz()`, `useReading(line)`, `useMotion()` | Hunt.tsx, HuntPanel.tsx, Tv.tsx, Stage.tsx |
| `Screen { title, footer }`, `PrimaryButton { variant, onClick, disabled }`, `WaitingScreen { icon, title, body }` | phone/* |
| `Avatar { player, size }` (size in px; phones pass `remPx()` from CardList.tsx so faces follow the text size), `BigText`, `CrossfadeSwap { swapKey }`, `Scoreboard { rows, climb, delay }` | tv/*, CardList.tsx |
| `Table3d { rig: { at, pose(t, aspect) }, paused, fallback, label }`, `Motion3d { at, pose(t) }`, `Solid3d { shape: 'box' \| 'tray', size, wall, material, position }`, `Dice3d { faces, up, highlight, dim, delay, bare }`, `Line3d { points, radius, playKey, stepMs, leaving, trim }`, `Pulse3d { active, order }`, `useMotionTokens()` | tv/Tray3d.tsx |
| tv-entry: `keepMounted`, `quietTimer`, `ownLocks`; phone-entry: `PhoneStage`, `phoneStagePhases`, `phoneRoute` | entries |
| shared: `sounds` per phase, `beds` (one bed id for the whole round so music never restarts) | shared.ts |

New SDK work: **Dice3d `faces`** (six labels, `up` index), plus `Motion3d`, `Line3d` (with `trim`), the Table3d
`rig` and Dice3d `delay` and `bare` — see `sdk-tasks/dice3d-letter-faces/`. Until it lands, `Tray3d` falls back to the flat
`LetterGrid` (same information). `Drop3d` is not used: the drop-in is part of the choreography (tv/roll.ts).

Behaviour the tray relies on (the stand-in does it; check main):
- `Table3d` stays invisible until its first frame is drawn (shaders compiled in `onCreated`), then fades in
  over `--pb-motion-base`, so the tray never pops in fully opaque.
- `rig.pose`, `Motion3d.pose` take ms on the table clock (server time, frozen while `paused`), so a TV that
  joins mid-roll or resumes from pause lands on the same frame.
- `Dice3d` eases `highlight` and `dim` over `--pb-motion-base` (after `delay` ms when highlighting) instead of
  switching colours; `Line3d leaving` shrinks a line away over base; `Pulse3d` eases its lift in and out.
- `Dice3d bare` fades the five side-face letters into the body over base (the top face stays), so the
  overhead hunt grid shows no letter slivers at the cube edges and nothing changes at the hand-off.
- `Line3d trim` stops each link short of both points, draws an arrowhead at its end and a dot where the path
  starts: the traced word reads in order without covering a letter. `Pulse3d` lifts a lit cube 0.18.
- `Solid3d shape="tray"` sits on a soft contact shadow that fades out within about 0.16 of the rim, so no
  shadow edge is ever cut off by the canvas; the key light is steep enough that resting cubes shade only the
  rim's inner bevel.

Browser features the phone relies on: the hunt is a size container (`container-type: size`, `cqh` units,
a `rem` container query so large text counts as short), clipped with `overflow: clip` and
`overflow-clip-margin`; the unknown-word note uses `-webkit-line-clamp`; `justify-content: safe center`.

Behaviour the phone shell relies on (the harness does it; check main):
- The shell crossfades the swap between `Controller` and `PhoneStage` (a phone that cannot see the TV
  enters `phoneStagePhases`) with `CrossfadeSwap`, keyed by `phoneRoute(phase, canSeeTv)` from phone-entry, like any change of screen: PhoneStage
  no longer animates its own entrance. One exception: PhoneStage's `shake` hands over to the Controller's
  `hunt` in place (no crossfade), because both lay the grid out in the same place.

Behaviour the TV stage relies on (the stand-in and the harness shell do it; check main):
- `CrossfadeSwap` is a real crossfade: the old child stays mounted in the same cell and recedes over
  `--pb-motion-fast` (up, back and out of focus; gone by 60 %) while the new one rises over
  `--pb-motion-base` from the same frame, opaque by 40 % of it, so one of the two always carries the screen
  and it never dips to background between them; nothing animates on first mount.
- `Scoreboard delay` is ms before the climb starts: TallyStage passes the shell pan's settle time
  (`panEnterMs`, slow − fast), and the shell's strip hold must add the same delay (the harness does).
- The shell pans (about `--pb-motion-slow`) between stages that are not `keepMounted` (reveal → tally,
  tally → next shake), keeps the old stage mounted until the pan ends, uses a curtain into the results, and
  holds the strip scores during the tally climb, then counts them up.
- Token `--pb-accent-2-ink`: gold readable as text on each theme (stand-in: night `#ffd166`, daylight
  `#8a6400`, contrast `#ffe14d`). The game falls back to `--pb-accent-2` when it is missing.

## Results text
Resolved in the game: results.ts writes the headline, note, place lines and award titles, descriptions and
values in the content language itself (`es()` from lines.ts, like the reader's lines), with numbers inside
whole sentences. The results entries left in `strings.ts` are harmless if the shell still runs `L()` on them.

## Views
`deadline` is in both views (end of phase or beat). If the shell already gives games the phase deadline,
drop it from `Common`. `roll { at, ms }` is in both views during the shake (the phone turns its grid over
from it). In `done`, `ControllerView.final` carries the headline, awards, longest word and best missed word
for the phone's end screen. A card's `more` is `{ words, pts, shared }` (left-off scoring words with their
points, and left-off shared words); the VIP's `rulable` list is `{ w, by }[]` (each word with its finders).
