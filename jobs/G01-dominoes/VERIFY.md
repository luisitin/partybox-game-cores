# Checks actually run (2026-10-07 UTC)

- `git ls-remote origin HEAD`: pass, returned f1fc60ff51a01887402153543b05fdf35c230217.
  Checks scoped native Git read access, not API/push permissions.
- `git push origin main`: pass for `claim G01`. Checks actual push permission.
- In contract/: `npm --cache /workspace/.npm-cache install --ignore-scripts
  --no-package-lock --no-audit --no-fund`: pass, zod 4.6.5 installed.
  Default cache first failed because /home/agent/.npm was unwritable;
  switching cache location resolved the installation problem.
- From repository root: `/workspace/.onboarding-tools/node_modules/.bin/tsc
  --noEmit --strict --target ES2022 --module ES2022 --moduleResolution bundler
  --skipLibCheck contract/*.ts`: pass with TypeScript 5.9.3.
  Checks the existing shared contract; does not check a nonexistent game.
- Node ESM import of contract/node_modules/zod/index.js, accepting
  `{action:'pass'}` and rejecting `{action:'play'}` against a literal schema:
  pass. Checks actual dependency loading/validation, not game behavior.
- `curl -L --fail --max-time 30 -o /tmp/domino-rules.html
  https://www.pagat.com/domino/line/draw.html`: failed 403.
- Same command for https://www.pagat.com/domino/line/block.html and
  https://bicyclecards.com/how-to-play/dominoes: both failed 403.
- `curl -sS -I --max-time 15 https://en.wikipedia.org/wiki/Dominoes`:
  failed CONNECT 403. No article content inspected.
- `curl -sS -o /tmp/github-api-response.txt -w '%{http_code}\n'
  --max-time 15 https://api.github.com/repos/luisitin/partybox-game-cores`:
  failed CONNECT 403, exit 56, HTTP output 000.
- `gh api repos/luisitin/partybox-game-cores --jq .permissions`:
  failed Forbidden. gh auth status also reports an unusable configured token;
  that does not imply native Git is unauthenticated. No token requested.
- `git clone --depth 1 https://github.com/abw333/dominoes.git
  /tmp/partybox-domino-ai` and equivalent angeris/DominAI clone: pass.
  AI research available; no AI benchmark executed yet.

Game tests, mutation tests, simulations, leagues, UI checks, captures and CI:
UNRUN. Zero game tests executed. No game readiness or completion claim.
