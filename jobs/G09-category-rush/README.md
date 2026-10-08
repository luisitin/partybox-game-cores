# Category Rush

A deterministic, original category game for 2–8 people: one seeded letter, twelve
prompts, private answers, group voting and one point per valid unique answer.
The pack contains 320 original prompts. Rules and house choices are in RULES.md.

Open `play.html` directly from disk to play privately in hot-seat mode or against
easy, medium and strong bots. The entire page is inline and makes no network calls.
Each person gets a private writing turn with the same full timer; pass the screen
at the handover. Host controls pause, skip and end. Equal final scores share a win.
Local saves offer explicit Resume/Discard after reload, with private handover
and remaining time preserved. If the browser denies storage, keep the page open.

```sh
cd jobs/G09-category-rush
npm ci
npm test
npm run generate
npm run build:play
npm run mutations
npm run bots
node scripts/browser-check.mjs
node scripts/browser-resume.mjs after
node scripts/browser-performance.mjs
```

Development tools are build/test dependencies. Zod is the only runtime dependency
of the pure core and is bundled in the offline page. No server or build is needed
to play. The exact workshop contract types are imported; the absent SDK is
replaced by a small documented standalone adapter (ASSUMPTIONS.md).

`src/index.ts` exports `game`; `src/model.ts` defines state/views/inputs.
`content/authored.mjs` regenerates the category data. `fixtures/` contains a full
state for each phase. VERIFY.md, VERIFY-PLAY.md, BOTS.md and SOURCES.md describe
the evidence. NEXT.md records current completion status.
