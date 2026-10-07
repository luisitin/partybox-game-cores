# Shake Up · films and cinematics plan

Both films are three.js pages in code. They are **seekable**: each is `render(t)`, so the TV and every
phone (muted) draw the same frame for the same time. They use the room that already exists in the repo
(`films/shared/`) through `lib/room.js`; a box-built stand-in room is used only when that module is
missing (as in this preview).

| File | What it is |
|---|---|
| `opening.html` / `opening.js` | Opening film, about 14 to 22 s (set by how many names and how long) |
| `outro.html` / `outro.js` | Outro film, about 12 s |
| `lib/choreo.js` | **Every cube and lid pose as a pure function of t** (no three.js): formations, the hinged lid, both film plans |
| `lib/camera.js` | Both cameras as pure functions of t: orbits eased between framings that fit the shot to any aspect |
| `lib/choreo.test.js`, `lib/camera.test.js` | The promises, checked every 4 ms of film: no cube passes through another cube, the felt, a wall or a divider; the lid never touches a cube; nothing jumps between frames; letters are painted only while hidden; every player's name shows whole; a 16-letter word is spelled whole; cameras start and end where promised |
| `lib/stage.js` | Builds the tray and cubes from a plan and poses them; key spotlight aimed from what the shot shows |
| `lib/kit.js` | Timing helpers, deterministic hash, film input |
| `lib/film.js` | Runner: renderer, room, real-time playback, skip, `?t=` stills, end fade; waits for the face font |
| `lib/room.js` | Room adapter (shared room → table top, lobby pose), stand-in fallback |
| `lib/tray.js` | **Shared asset**: tray with hinged lid, letter cubes, name sprites (also baked to the station GLBs) |
| `build-preview.mjs` | Bundles each film into one self-contained HTML in `dist/` for review |
| `stills.mjs`, `montage.mjs`, `frames.mjs` | Headless review: stills at given times, contact sheets, and frame-exact filmstrips (`node frames.mjs opening 2.9 5.3 30`). `FILM='<window.pbFilm json>'` feeds stress inputs (long names, Spanish, nobody found); stills take `SIZE`, `OUT`, `TAG`. SwiftShader's MSAA leaves hairline seams and specks on large flat faces; they are not in the scene (gone with `antialias: false`) |
| `export-glb.mjs` | Bakes the tray and P/L/A/Y cubes to GLB for the living-room station |

## How the words move (both films)
A word is spelled by cubes rising out of the tray, never by letters appearing in the air:
1. Each cube rises straight up out of its own cell. Back rows rise higher (1.1 apart), so cubes sharing a column never meet, and the highest leave first so all arrive together.
2. All of them glide together to their places in the word: sideways first, height last, cells paired with places left to right so no two paths cross.
3. A wave, left to right: each cube tips a quarter turn forward to show its bottom face, which carries the letter (painted while it rested on the felt, so no letter ever changes on screen). The plain front face rolls up to become the top, so nothing sits over a letter; the game letter that was on top now faces the lid. A gold word's plain faces warm to gold as it tips, so it reads as a gold tile.
4. Going home is the same path backwards, a little faster.
Two lines show at once at most (the top line from the back rows, the bottom line from the front rows; a line may carry several short names, a gap apart), each formation goes home before the next, and the lid is hinged on the back wall, so it swings up and back over the cubes and stands behind the tray, felt lining to camera, as a backdrop for the words.

## Opening (plays as the start stage appears, dissolves into the rules card)
| t (s) | Picture | Sound |
|---|---|---|
| 0–3.2 | Night room. The camera glides in a curve from the room's lobby pose to the tray on the coffee table; a warm spotlight finds it. | Room tone, soft pad |
| 1.5–2.9 | The lid swings open on its hinge and stands behind the tray. | Wooden creak |
| 3.0+ | Every player's name (up to 8), two lines at a time: one-word names share a line while it fits 9 slots; a name too long for that (up to 12 faces) takes three rows with a short name under it. A cube carries a letter or digit of any script (Ñ and Qu as one face; other accents dropped) or an emoji. A name is never cut mid-word: the whole name if it fits 12 faces, else its first word, else an ellipsis cube; a room that would need more than three name formations (or more than two three-row names) caps names at 8 faces instead. A name shown less than whole, or with nothing a cube can carry ('?'), keeps its line to itself and is captioned as written (above a top line, below a bottom one), fading in with its letters' wave and out as they tip back. Tiles rise, glide into place and tip to gold letters in a wave; a hold, then home. The camera re-frames between formations (captions included) and drifts slowly the whole time. | One clack per letter turning |
| after names | **SHAKE / UP** the same way. | Riser |
| last ~2.5 | As the last cubes drop home the camera rises to straight down over the tray (the game's own framing) and pushes into the felt; the page fades to felt green and the shell dissolves into the rules card. | Cascade of clacks, whoosh into silence |
Length (plan.duration): about 14 s with up to two short names, 19 s with six short ones, never more than 23 s. A room that would run past 22 s holds names a little less and moves only as much brisker as it must (plan.pace, down to 0.6; the way home is never more than 1.2 times as quick as at full pace, so no cube outruns the tests' frame-step limit): eight 5-letter names come to 22.0 s, eight 10-letter names to 22.8 s (choreo.test.js sweeps 400 seeded mixed rooms).

## Outro (crossfades over results, lands on the lobby)
Input is `results.detail`: `{ longest: { word, playerId, letters }, runnerUp: { word, playerId }, perPlayer: [{ id, name, … }], missed }`.
| t (s) | Picture |
|---|---|
| 0–0.6 | Low three-quarter hero angle on the open tray; the camera is already orbiting slowly. |
| 0.6–4 | The winner's longest unique word (up to all 16 cubes; 13+ letters close up a little) comes up as big gold cubes in a shallow arch; the runner-up's best word comes up below in white (only when both fit the tray). |
| 4–8 | Hold. The winner's name fades in above the arch in their player colour, the runner-up's under their word on the lid's felt; names are drawn at full size however long (the camera widens to fit). The cubes bob gently. |
| 8–10.1 | The words un-flip and every cube goes home. |
| 10.2–11.4 | The lid swings shut (SHAKE UP engraving up) while the camera pulls back on a curve to the lobby pose, landing at about 12.2 s. |
If nobody scored a unique word all game, the best word nobody found takes the stage under "Nobody found" ("Nadie la encontró" in Spanish; the shell passes `lang`). With no word at all, SHAKE UP takes the stage under "Thanks for playing" ("Gracias por jugar").

## Rules the films keep
- No `Math.random` (`hash01` only), so phones match the TV. There is no physics: every pose is a function of `t`.
- They are skipped under reduced motion and on click or key. The shell decides `?film=0` and no-WebGL before loading.
- Real names come from `window.pbFilm.names`, the final state from `window.pbFilm.final`, the language from `window.pbFilm.lang`. **Assumed handoff shape:** map it to `finalFor` on main.
- Framing fits the shot to the screen's aspect, so a phone held upright still sees every letter (smaller). Upright, a held shot frames only the words and the tray's rim from a little higher (a cube may leave the frame briefly on its rise); the letter size is then set by the widest line.
- The plan never depends on the screen, so every phone's film is as long as the TV's.
- Light: one warm key spot; its shadows are soft and half strength, the felt and the lid's lining glow faintly (the lining more while it swings), so nothing reads as a black hole.
- The import map points `three` to `../shared/three.module.js`. Point it at whatever `films/shared` ships.

## Living-room station
`games/shake-up/client/station-entry.ts` holds the closed tray (the lid shows SHAKE UP), four loose cubes spelling P-L-A-Y, a notepad and a pencil. The hourglass from the idea page is optional (its licence is unverified). The dive drops over the closed tray and the opening film takes over and opens the lid. The GLBs are baked from `lib/tray.js`, so the station, the films and the game share one look (`assets/library/shake-up/*`).

## Per-phase stage plan (game)
| Phase | TV move | Cue | Bed | Reader | Phone | Haptic |
|---|---|---|---|---|---|---|
| shake | `keepMounted` 3D tray, cinematic camera | `reveal` on the frame the cubes start | round bed starts (96 bpm), never restarts | "Round two. Shake it up!" | Watch the TV (PhoneStage: the grid fades in) | none |
| hunt | Same stage; the camera eases to top-down | `phase` | Same bed, plus a hats layer for the last 30 s | "Three minutes. Go!", "Thirty seconds!" | `tick` per cube, `submit`/`error`/`lock` | 8 ms per cube; double on accept; long on reject |
| reveal | Same stage; the best word glows cube by cube (Pulse3d) | `card` per beat | Bed ducks −9 dB | One line per beat, then "Nobody found X!" | Watch the TV; VIP rulings | VIP: buzz on rulings |
| tally | Shell pan; spotlight word lands; Scoreboard climb | `tally` | Same bed | "Cleo takes the lead!" | Own summary after the climb | none |
| results | Shell curtain, then the outro film | `win`/`tie` | Silent | The shell reads the headline | Shell | Shell |

Dead-air answers: the shake camera starts moving before the last cube lands. All-done closes the hunt at
once. Each reveal card rises in while the last glow fades, and the next reader line is already queued.
Empty players share one card. The hunt toast covers quiet stretches on the TV.
