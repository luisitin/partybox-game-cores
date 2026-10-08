# Verification in progress

`cat README.md RULES.md JOBS.md CLAIMS.md` on current main: read; lowest
unclaimed G04 after fresh G01/G02/G03 lines. Claim0d43479 pushed to main.
`git switch -c job/G04-reality-check-core`: new branch from main; existing
research-only job/G04-reality-check branch preserved.
`gh api repos/<source>/readme` and contents/doc paths: four source texts read,
commit snapshots pinned in SOURCES.md. No game checks claimed yet.

Required remaining: full strict types/contract properties,1000 seeded games
per count,independent10,000-case hardest-function diff,25 mutations,2,000-game
bot comparisons,all fixtures,offline HTML/TV/phone/reduced-motion/capture,
checksums,actual current-head green CI,PR and KEEP GOING.

Initial `npm ci --ignore-scripts --no-audit --no-fund --cache /workspace/.npm-cache`
at repo root failed EUSAGE: the workshop root has no package lock. Re-run
from jobs/G04-reality-check uses its pinned lock; no root manifest invented.
