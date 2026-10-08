# G08 verification log

## 2026-10-08 research checkpoint
- `git clone --depth 1 https://github.com/<repo>.git /workspace/g08-research/repos/<name>`: read the pinned repositories recorded in source-receipts.json. Catches unread/incorrect cube and rules assumptions; no borrowed implementations or assets are delivered.
- `gh api repos/<repo>/contents/<path> -f ref=<commit> --method GET`: pinned source contents read, decoded and SHA-256 recorded. Native Git and GitHub REST work.
- `curl -fsSL --max-time 60 <registry tarball> -o <temporary file>`: English2.0, Spanish2.0, wordlist-English1.2.1 package contents/licences read. Receipt hashes identify exact inputs.
- Canonical Hasbro/Winning Moves HTTPS candidates: exit56/HTTP000 at08Oct07:52UTC, CONNECT denied. Read fallback sources instead under root RULES; never cite candidate contents.
- Original source baseline: 116 files, 5 GLB models, SHA-256 recorded before any edits. No production source edits at this checkpoint.

All implementation, measurement, schema, bot, mutation, browser and CI checks remain pending; no results invented.
