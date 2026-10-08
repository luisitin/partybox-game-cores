# KEEP round 10: accepted baseline and historical failure

Accepted baseline is a96d1354a3ec89ef67fa8fdee2a55b1bb0e92387. Both full hosted events passed: PR run 37841565937 at 20:51:25 UTC and push 37841560134 at 20:51:32 UTC. Both full logs were fetched and inspected: all 16 check stages, 185 assertions, 104 decoded JSON records, 52 schema files, 23 raw controls and 19 capture controls passed. Both actual ZIPs match server size/SHA256, have 57 safe entries and pass every CRC.

| Event | Artifact | ZIP bytes | SHA256 |
|---|---:|---:|---|
| PR | 11577329745 | 1716580 | fd9463f010ef393e9dd75eebc2f4b18de6f9bc0c4159a50bcbce6c4ec27bdaec |
| Push | 11578352159 | 1684258 | 54893eb6780cd6b3d694b5602ae3e704e37b8e28573cf1d36fe088a5ac4a7df6 |

Independent actual-artifact reading binds all 183 unique source inputs to immutable Git bytes, recomputes every unfiltered 600-interval profile (4800 intervals across the two separate artifacts), verifies advancing live hunt endpoints and checks all 22 native gates/five rosters. Ten real hashed VP8 clips fully decode. All eight profiles are 60.002–60.003 FPS with p99/max 16.8 ms. Actual two-second Pause holds are 2000.357425/2000.815948 ms and preserve 90 seconds before, during and immediately after Resume. Independent and ZIP/full-log receipts are copied verbatim as text here. No current result is inferred from an old green run.

Commands actually executed from the job folder:
- `python .tmp/ci/review-recovered-head-artifact.py a96d1354a3ec89ef67fa8fdee2a55b1bb0e92387 .tmp/ci/a96-pr-artifact .tmp/ci/a96-pr-independent.json`: PASS actual current inputs/raw/native clips.
- `python .tmp/ci/review-recovered-head-artifact.py a96d1354a3ec89ef67fa8fdee2a55b1bb0e92387 .tmp/ci/a96-push-artifact .tmp/ci/a96-push-independent.json`: PASS independently for the separate push artifact.

Historical failed sibling: immutable 22f695671d766ff362e7bb3d236e8e34236768ec, push run 37838439275 FAILURE at 20:26:27 UTC, genuine artifact 11576119468, ZIP 1790269 bytes/SHA256 00c3de505c24321bba3ab49e2564abcd41cfa0797b1457bfb13e07c8ced6c18a. The exact four-profile raw reports, native report and real clips are copied unchanged under historical-failed-22f-push. The failed native report retains its original bytes as browser-report.txt: its 1999.752709 ms hold correctly fails the unchanged accepted-report JSON Schema minimum of 2000 ms. Initial archive data-check observed that rejection; it is preserved as historical failure, not treated as valid accepted runtime data. Its frame gates passed, but actual Pause held 1999.752709 ms and correctly failed the required >=2000 gate. Overall result remains FAILURE. The same-head PR green is separately historical. These are not current-source acceptance.

The local current-page phone 57.6947 FPS failure, Spanish NOT RUN, original raw/grants/CLOSED and unknown interrupted capture session exit remain preserved. No unchanged local FPS retry, clock simulation, filter or threshold change.

This round re-read G08, START-HERE and root KEEP requirements after genuine accepted current full proof. Ranked weaknesses: README omits the measured Resume gain; VERIFY opens with stale historical pending scope; evidence navigation is scattered; exact reproduction commands are hard to locate; packaging/production SDK scope is easy to overlook. Fix the first with two direct current-evidence/countdown links and a correct round-history statement. Current Resume/evidence entry points increased from zero to two; page and all 183 runtime/proof inputs are unchanged. No player-visible gain, consecutive no-gain streak 1. New document head still requires its own final full CI acceptance before completion.
