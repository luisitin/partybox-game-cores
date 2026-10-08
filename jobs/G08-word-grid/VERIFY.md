# G08 verification log

## 2026-10-08 research checkpoint
- `git clone --depth 1 https://github.com/<repo>.git /workspace/g08-research/repos/<name>`: read the pinned repositories recorded in source-receipts.json. Catches unread/incorrect cube and rules assumptions; no borrowed implementations or assets are delivered.
- `gh api repos/<repo>/contents/<path> -f ref=<commit> --method GET`: pinned source contents read, decoded and SHA-256 recorded. Native Git and GitHub REST work.
- `curl -fsSL --max-time 60 <registry tarball> -o <temporary file>`: English2.0, Spanish2.0, wordlist-English1.2.1 package contents/licences read. Receipt hashes identify exact inputs.
- Canonical Hasbro/Winning Moves HTTPS candidates: exit56/HTTP000 at08Oct07:52UTC, CONNECT denied. Read fallback sources instead under root RULES; never cite candidate contents.
- Original source baseline: 116 files, 5 GLB models, SHA-256 recorded before any edits. No production source edits at this checkpoint.

All implementation, measurement, schema, bot, mutation, browser and CI checks remain pending; no results invented.

## 2026-10-08 measurements and contract port
- `npm install --no-audit --no-fund`: locked tools install successfully, only zod is a core runtime dependency; React/Three are supplied-client build/test tools.
- `npx tsc --noEmit --pretty false`: strict ES2022, noUncheckedIndexedAccess, actual root GameDefinition types, clean at08:29UTC after port (later changes require recheck).
- `npm run build:words`: English274711, Spanish636513, common105840; frequency source/licences read live, two-run reproducibility still pending.
- `npx tsx start/research/measure.ts`: PASS. Five candidates x10000 seeds, no cap; exactly10000 independent trie/frontier comparisons,2383756 production paths separately checked; no invalidQu paths. All summaries in cube-study.json. This catches missing/reused/diagonal paths, prefix pruning errors and Qu scoring/face misinterpretation.
- `npm test` initial full run:151 tests passed but2 worker RPC errors -> FAIL, not an accepted green result. Second run118 tests passed but1 RPC error; also incorrectly launched the33 Vitest film tests with node:test -> FAIL. Restored their Vitest runner and added inter-case IPC yield; clean full rerun pending. No assertion/sample count was weakened.
- Profile `npx tsx .tmp/profile.ts`: 3-round seed17 games at2/6/16 players finish. Unused human-view work removed; measured16-player simulation wall time3946ms ->176ms on this workspace, same725-event trace. This is a development profile, not a bot-strength or frame-rate claim.
