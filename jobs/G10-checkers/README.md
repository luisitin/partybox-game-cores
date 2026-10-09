# G10 Checkers

American 8 × 8 and International 10 × 10 for two seats, hot-seat or bots.
Both include all licensed 2–6-piece endgame databases and draw rules.
The strong bot keeps its original 6000-node alpha-beta search.

The reviewed startup fix lets either variant prepare its bot while the
complete offline page is still loading. International requests wait for
their actual source blocks; the complete data and search stay intact.
One controlled desktop/phone CPU4 comparison observed the first legal
International move 17.5s/73.5s sooner. Detailed evidence is in VERIFY.md.
The fix is integrated and its strict compiler/full offline build passed.
The complete integrated original CI/native/game/raw/media/source checks
passed. Permanent full standalone delivery and KEEP qualification remain
pending. PR #10 stays Draft/open; this is not a completion claim.

Requires Node 22.16+ and pinned package-lock.json. From this directory:

```sh
npm ci --ignore-scripts
npm test
```

One read-only workflow runs Node, both 2000-game leagues and original
browser checks on separate Ubuntu runners, each with a 30-minute timeout.
All current stages, source hashes and original workloads must pass.
Download all four G10-standalone-part artifacts from that exact successful
run, extract into one folder and use their identical manifest/helper:

```sh
python3 standalone-parts.py join standalone-parts.json play.html
```

Open the resulting single play.html from disk; it makes no runtime calls.
Current integrated full page: 1,390,847,100bytes; actual SHA-256:
b85a8288345c8e0040d523e3998d31216aa61b6872c8e3bc76313944802dd1b2.
Historical full baseline: 1,390,846,291bytes; SHA-256:
b4f5267561bd95d68455ea5a83b936692b246d1a8ed936199c820e430a2da3eb.
Artifacts expire after seven days; permanent Release delivery is pending.
Tracked play.html is the older 2–5-piece baseline. Rebuild the full current
page with G10_HTML_OUT=/tmp/play-current.html npm run build, with enough
free disk and memory. All old failures and actual receipts stay preserved.

American data terms require Chinook/University of Alberta acknowledgement
and prohibit database sale. Ed Gilbert permits International distribution.
Original terms and Boost notices accompany source data and the full page.
Read RULES.md,SOURCES.md,CONFLICTS.md,VERIFY.md,BOTS.md and NEXT.md.
