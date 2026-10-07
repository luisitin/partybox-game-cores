# SDK task: Dice3d letter faces

**Why:** Shake Up's cubes are letter dice, and Smash City (idea 10) needs labelled dice too. Shared SDK
pieces ship as their own task, so this is separate from the game.

**API proposal:** `Dice3d` gets `faces?: string[6]` (any short label: "A", "Qu", "Ñ", "★") and keeps
`up` as the index of the face that points up. Without `faces`, Dice3d stays exactly as it is (pips).
Colours come from tokens (`--pb-cube`, `--pb-cube-ink`, and `--pb-accent-2` / `--pb-on-accent` for
`highlight`). `dim` sinks the body toward `--pb-bg` and the ink toward the body (cubes off the glowing
path stay solid, never see-through). `delay` (ms) holds the highlight (and the un-dim of a cube joining
the word) so a word lights cube by cube as its line is traced. `bare` fades the five side-face letters into the
body over base (the `up` face stays): once a roll has landed and the camera looks straight down, side letters
would only show as dark slivers at the cube edges.

**Colours tween, textures don't change:** draw each face texture once as a mask (white body, black ink).
Per frame set `material.color = body − ink` and `material.emissive = ink`, easing body and ink over
`--pb-motion-base`. Lit, a texel is `(body − ink) × light + ink`: the ink stays exactly the ink colour under
any light, and highlight/dim never rebuild materials. This assumes the ink is darker than the body (true for
all themes). Use a matte material (roughness about 0.85) and a key light off the overhead camera's axis, or
the specular highlight veils the letters from above.

**Also in the task (the stand-in has them):**
- `Motion3d { at, pose(tMs) → { p, q, s } }`: places children by a pure function of table-clock time.
- `Table3d rig { at, pose(tMs, aspect) → { pos, rot (YXZ Euler), fov } }`: a scripted camera.
- `Line3d { points, radius, playKey, stepMs, leaving, trim }`: draws a traced path segment by segment; `leaving`
  shrinks it away over base while the next one draws. With `trim` each link stops that far short of both
  points and ends in an arrowhead (cone, 2×radius wide, 3×radius long), and a dot (1.6×radius) marks the start;
  no joint spheres, so a line drawn just above the dice tops bridges the gaps without covering a letter.
- `Table3d` shows nothing until its first frame has rendered (compile in `onCreated`), then fades in.
- `Solid3d shape="tray"`: a rounded, bevelled rim, inset base and a soft contact shadow under it (a rounded-rect
  alpha falloff that reaches 0 about 0.16 outside the rim, not a shadow-catching plane, so a tight camera
  framing never cuts a shadow edge).

**Files:**
- `letterFaces.ts` goes in `packages/game-sdk/src/ui/table3d/`. It holds the cached canvas textures, the
  face-to-BoxGeometry slot mapping and the font sizing for two-letter labels.
- `letterFaces.test.ts` checks the slot mapping and label sizing.

**Wiring:** in Dice3d, when `faces` is set, build the materials with
`faces.forCube(faces, up, styleFromTokens)` instead of the pip textures. Dispose the cache when the table
unmounts. Physics never decides the up face: the game passes `up`.

The local stand-in (`standin/game-sdk/src/ui/table3d.tsx`) already renders Shake Up with it. See the
preview's 3D tray.
