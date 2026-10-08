# G07 — Liar's Dice

Perudo-style private-cup game for 2–8 players, wild ones, palifico and optional calza.
Active implementation; see NEXT.md for exact completed/pending checks.

Open play.html directly from disk to play hot-seat or against bots. Everything
is inline and offline; no build is needed to play. Keep other players looking
away when opening a cup. Settings are on the first screen.

For development: npm ci --ignore-scripts; npx playwright install chromium;
npm test. Use npm run build to rebuild the single page, npm run fixtures to
regenerate phase states, and npm run league for the paired skill comparison.
Node 22.16+; strict ES2022 TypeScript, runtime Zod only.

src/core.ts exports the exact shared game contract; src/probability.ts uses exact
integer outcome counts. Bots inspect only their own cup and public information.
Research, variants and choices: RULES.md, SOURCES.md, CONFLICTS.md, ASSUMPTIONS.md.
Actual verification: VERIFY.md and evidence/. Full matrix/leagues/mutations and
source-matched final browser/CI are still pending; this is not delivery complete.
Browser-only review hook and its scope are documented in API.md.
Historical research failures are under evidence/historical-blocker/.
