# Shake Up · build hand-off

Everything here is laid out like the PartyBox repo so folders copy straight across.

| Folder | What it is | Goes to |
|---|---|---|
| `games/shake-up/` | The game plugin: server reducer, phases, bots, content packs, TV + phone clients, station models, tests, README spec | `games/shake-up/` |
| `sdk-tasks/dice3d-letter-faces/` | Letter faces for `Dice3d` (SDK change, kept out of the game) | the SDK package |
| `cine/shake-up/` | Opening (about 14 to 22 s, set by the players) and outro (about 12 s) films as seekable three.js pages, plus the cinematics plan | the films folder |
| `assets/library/shake-up/` | Asset entries for the letter tray and letter cube | the shared asset library |
| `standin/game-sdk/` | LOCAL stand-in for `@partybox/game-sdk` so this builds and runs here. **Do not copy.** | nowhere |
| `harness/` | Local preview (TV + three phones). **Do not copy.** | nowhere |

## Run it
```
npm install
npx tsc -p tsconfig.json --noEmit   # typecheck
npx vitest run                      # incl. 200 seeded sims + replay
node harness/build.mjs              # harness/dist/shake-up-preview.html (open in a browser)
node cine/shake-up/build-preview.mjs  # cine/shake-up/dist/*.html film previews
```

## Before merging
1. SDK signatures are assumed. `games/shake-up/ASSUMED-SDK.md` lists every call site to adapt.
2. `Dice3d` needs the `faces` prop from `sdk-tasks/dice3d-letter-faces`.
3. The films import the room from `../../shared/room.js`; `cine/shake-up/lib/room.js` falls back to a stand-in room when it is missing.
4. The English word list is permissive (accepts some obscure words). See `games/shake-up/content/SOURCES.md`.
5. Results text is written in the content language by the server (results.ts); see ASSUMED-SDK.md "Results text".
6. The 25-cube English set for 5×5 is a reasonable mix but not playtested.
