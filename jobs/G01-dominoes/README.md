# G01 Dominoes

Pure double-six Draw or Block dominoes core: 2–4 seats, optional four-seat
partners, 100/150/250 targets, hidden-information views and three seeded bot
policies (easy, normal, sharp) that see only a sanitized observation.
`play.html` is a standalone hot-seat table built from `ui.ts` and `shell.html`.

## Open the table

Double-click `play.html`. It needs no server, network or external asset.
Choose each seat as Human, Easy, Medium or Strong. The pass-the-screen veil
hides each human hand until its owner taps. The public board never shows a
private hand; hands turn face up only after a round ends.

## Product files (these port)

- `core.ts`: the game. `game` conforms to `contract/contract.ts`.
- `manifest.json`: id, settings and limits. `RULES.md`: rules and conventions.
- `reference.ts`: independent endgame solver that checks the core evaluator.
- `ui.ts`, `shell.html`, `build.ts`: the standalone page, generated into `play.html`.
- `fixtures/{play,round-end,done}.json`: one full state per phase.
- `THIRD-PARTY-LICENSES.txt`: the Zod notice for the bundled standalone page.

## Evidence (stays behind)

`*-report.json`, `media/`, `SHA256SUMS.txt`, `VERIFY.md`, `CHANGES.md`,
`REVIEW.md`, `LOOP.md`, `NEXT.md`, `ASSUMPTIONS.md`, `SOURCES.md`,
`CONFLICTS.md`, `BOTS.md`, the `*.ts` studies and probes, `baseline*.py`,
`test.ts`, `browser.ts` and `league.ts`. They prove the work; a port does not
need them. `INTEGRATION.md` names the assertions worth copying.

## Run the checks

From this directory, with Node 24+, Python 3 and ffmpeg:

```sh
npm ci --ignore-scripts
python -m pip install --require-hashes --target .baseline -r baseline-requirements.txt
CHROMIUM_PATH=/path/to/chrome BASELINE_PYTHONPATH="$PWD/.baseline" npm test
```

`npx playwright install chromium` works when `CHROMIUM_PATH` is unset.
Single steps:

- `npm run check`: strict TypeScript.
- `npm run build` and `node build.ts --check`: regenerate or verify `play.html`.
- `npm run fixtures`: regenerate `fixtures/` and `manifest.json`.
- `node league.ts` and `npm run draw-league`: 2,000-match strength leagues.
- `node browser.ts`: Chromium checks at 1920×1080 (TV) and 390×844 (phone,
  4× CPU). Frame gate: TV average at least 58 fps; phone p95 at most 18 ms.
- `node checksums.ts --check`: hashes of every shipped file.

## Status

Rules, privacy, determinism and bot checks are the job's own harness. The
browser frame-rate gate is open on this loaded shared machine (see
`INTEGRATION.md`, "Known gaps and risks"). The gate is not weakened. Do not
treat the job as green until `npm test` exits 0 on a machine that can meet it.
