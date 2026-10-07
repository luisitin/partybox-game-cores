# Shake Up: game-local rules
- Spec is README.md; tests pin it. Change both together.
- The server derives every word from a cell path. Never accept typed text.
- Dictionaries are sorted arrays; lookups are binary search (server/dict.ts). Rebuild packs only with
  content/build-words.ts, then run the content test (sorted, bot lists ⊂ dictionary).
- The TV never sees a word during the hunt (counts only). A phone sees only its own words until the TV
  has shown them. Rulable words = non-dictionary words from beats already shown.
- Scores never go down. VIP "counts" is word-level and only in reveal.
- Reveal pacing is beatMs() (readingMs clamped 3.5–9 s). Do not add per-game reading formulas.
- 3D tray is drama only: landing letters come from state.grid; physics never decides.
- One persistent TV stage for shake/hunt/reveal (keepMounted); tally uses the shell pan.
- Music: one bed id across phases. Films: cine/shake-up (see its README).
- SDK assumptions are listed in ASSUMED-SDK.md; fix call sites there, not game logic.
