# G10 Checkers

American 8×8 and International 10×10 Checkers for two seats, hot-seat or bots.
The full licensed American and International 2–6-piece databases are included.

Exact historical head ae36b497 passed the complete hosted workflow: 91 tests,
25 actual mutants, 7,000 configuration games, 4,000 strength games, all four
600-frame desktop/phone-4× profiles and separate decoded gameplay captures.
Independent readers checked all actual raw games, native frames and source hashes.
The genuine earlier local International 17.510-FPS failure remains preserved;
a different hosted environment does not establish its cause or a causal fix.

The first uploaded full-page ZIP exceeded the connector's 512-MiB download
limit. Current delivery publishes four bounded parts of the identical page.
All four actual downloads passed ZIP/part/whole-byte verification at that head.
Draft PR #10 exists; fresh checkpoint CI and KEEP GOING remain pending.

Requires Node 22.16+ and pinned package-lock.json. From this directory:

```sh
npm ci --ignore-scripts
npm test
```

One workflow runs the complete Node, both 2,000-game leagues and browser checks
on separate Ubuntu runners, each with a 30-minute timeout. Final validation
requires all current stages, source hashes and all original workloads to pass.
After success, download all four G10-standalone-part artifacts from that run
and extract them into the same folder. Their identical source/part/whole SHA
manifest and standard-library Python helper accompany every part. Then run:

```sh
python3 standalone-parts.py join standalone-parts.json play.html
```

Open the resulting single play.html from disk. It makes no runtime network calls.
Full page: 1,390,845,993 bytes; SHA-256:
5ed2173b7264574565dd29ff14773236cac5a00833bf75df3de9e64a66451801.
Actions artifacts expire after seven days; they are not persistent Release assets.
Tracked play.html is the older 2–5-piece baseline. Rebuild the full page with
G10_HTML_OUT=.work/play-full.html npm run build. Full phone data load can exceed
two minutes. Two Human seats may start earlier; bots wait for all required data.

American database terms require Chinook/University of Alberta acknowledgement
and prohibit database sale. Ed Gilbert permits International database distribution;
original source bytes, terms and Boost notices accompany the data and page.
Read RULES.md, SOURCES.md and CONFLICTS.md for research, VERIFY.md for checks,
BOTS.md for actual strength results, and NEXT.md for the exact resume checkpoint.
