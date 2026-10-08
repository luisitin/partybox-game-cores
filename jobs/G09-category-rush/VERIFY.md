# Verification

## Initial milestone, 2026-10-08

| Exact command | Actual result | What it catches |
| --- | --- | --- |
| `npm install --ignore-scripts` | 11 pinned packages installed | Reproducible development/runtime dependency setup |
| `npm run generate` | Manifest plus answer/review/scores/done fixtures generated from actual core | Missing phase artifacts or fake fixtures |
| `npm run typecheck` | PASS, strict ES2022 exact contract types | Wrong game, event, player, RNG or envelope types |
| `npx tsx --test --test-name-pattern='normalization:\|score cancellation\|settings clamp\|pause ignores\|unknown prototype\|views never\|reducer is total\|manifest exact\|bot strategies' tests/core.test.ts` | 9/9 PASS | Articles, accents, numbers, plurals, fuzzy grouping, votes, duplicate/repeated cancellation, early/stale timers, pause/resume/drop, hostile ids, secret privacy, totality, manifest schema, fixture coverage and bot hidden-information independence |
| `npm run build:play` | Initial actual-core inline page, 407,979 bytes | External assets or unbundled shell/core |
| `python scripts/browser-performance.py` | Both strict 600-frame profiles PASS; desktop 60.0028 fps, phone 4× 60.0027 fps, both p99/max 16.8 ms; videos below 1 MB | Real consecutive RAF frame drops, runtime requests, errors, provenance drift |

The initial browser proof is bound to HTML SHA-256
`3ce64d2667bc19f930cd6ea8902106e444b4fe61c34e5616dd6b60864d0e8307`,
archived under `evidence/browser/milestone-initial/`.
Source changes after that measurement require a final bundle and new proof.

Content schema/drift tests exposed a compact duplicate and semantic membership
issues; the authoritative authored source is corrected, and regeneration awaits
the CPU isolation window. These are pending checks, not delivery claims.

## Mandatory delivery checks in progress

`npm test` includes a different normalization/Levenshtein/graph/per-seat scoring
implementation across 10,000 generated cases; 7,000 games (1,000 for every roster
2–8) with state restored after every event; seeded property checks for 1, 2, 3
plus 1,000 generated seeds; all nine contract invariants; real schema validation
and content drift; and pure-source scans. A second deterministic replay and full
view/size checks run on seeds 1–3 at each roster, while dedicated privacy/fuzz
tests cover every phase and all player/spectator roles.

`npm run mutations` temporarily changes one actual production source at a time,
runs the targeted behavior suite and restores the source in a finally block.
The planned 25 mutants and their real killed/survived results are recorded by the
script in `evidence/mutations.json` once run.

`npm run bots` runs 2,000 seeded three-round duels per adjacent skill pairing,
alternating seats. It records wins/ties/mean scores and fails unclear separation.
`node scripts/browser-check.mjs` exercises the real offline file on desktop and
phone, complete hot-seat and 2–8-seat bot games, privacy, accessibility, timers,
host controls and zero runtime network requests.

## Current full local results

- `npm test`: **20/20 PASS**, strict types plus content/JSON Schema checks, a separately implemented scorer across **10,000 cases**, **7,000 games** restored after every event (1,000 at each roster 2–8), **1,003 property seeds**, all nine contract invariants, **2,000 event-fuzz cases**, and future-private-answer view/bot regression. Raw output: `evidence/core-tests.txt`. Wall duration 695.996 s includes an observed ~6m44 SIGSTOP for another worker's isolated frame run; approximately 4m52 active wall time, not a standalone CPU benchmark.
- `npm run mutations`: **25/25 planted production bugs killed**, each restored in a finally block. Full IDs and failure evidence: `evidence/mutations.json`.
- `npm run bots`: **4,000 three-round duels PASS**; Strong beats Medium 1,970/2,000 (98.5%); Medium beats Easy 1,981/2,000 (99.05%). Counts and mean scores: BOTS.md and `evidence/bot-matchups.jsonl`.
- Corrected content/schema each regenerated twice byte-identically. Four data tests pass, including independent evaluation of the actual Draft 2020-12 JSON Schema. CONTENT-VERIFY.md contains exact commands/hashes; the thirty random-row observations are below, with two actually read independent sources each in SOURCES.md.
- `npm run build:play` twice: byte-identical current licensed HTML `0975fc8982ba5363d49151aecd9288ac06a0490353929ae2a34849c9d3d78113`, 439,586 bytes. Both complete MIT notices are inline and in the source package.
- `node scripts/browser-check.mjs`: **28/28 PASS** on that current HTML, desktop+phone full games and every bot roster 2–8; zero runtime network/errors. `node scripts/browser-clock.mjs`: independent review-step clock probe PASS, correctly handles a later deadline with unchanged phase startedAt.
- `node scripts/browser-performance.mjs`: first current licensed cold run **FAILED**: desktop 600 consecutive real RAF deltas, 57.419 fps, p99 33.4 ms, max 166.6 ms. Source/HTML fingerprints matched before/after and both notices were checked; zero errors/network. Runner stopped before phone. Failed raw samples/report/video are preserved; earlier milestone proof belongs to its own distinct hash. An unchanged confirmation is pending after the current CPU-isolation hold, with no gate relaxation.

Final visual, checksum/drift and exact-head CI status remain pending; this is a milestone, not completion.

## Thirty independently sourced content checks

Selection: Python 3 `random.Random(909).sample(pack['categories'], 30)`, followed by `rng.choice([answer for bank in category['answers'].values() for answer in bank])`, on the initial 320-category generated pack. Read date: 2026-10-08 UTC. Sources: the matching two-source row in SOURCES.md. These are hand semantic checks, not automatic dictionary membership.

| # | Random row | Selected answer | Observation and result |
|---|---|---|---|
| 1 | hygiene-06 | trimmer | Collins and Dictionary.com define nail clippers as fingernail trimmers. Narrowed ambiguous `trimmer` to `nail trimmer`; pass after repair. |
| 2 | science-04 | orbiter | NASA's concrete Mars orbiter has Mars orbit insertion; the independent spacecraft overview defines planetary orbiting probes. Pass. |
| 3 | hygiene-10 | sunblock | Cambridge identifies the sunscreen sense; CDC explains sun protection for skin. Pass. |
| 4 | streets-02 | footbridge | Both dictionaries define a pedestrian bridge; Cambridge explicitly gives a crossing over roads. Pass. |
| 5 | kitchen-tools-05 | canister | Cambridge says food container with a cover; independent Dictionary.com explanation describes a fitted lid. Pass. |
| 6 | practical-actions-10 | wiping | Both dictionaries explicitly use wiping a table and removing dirt/crumbs. Pass. |
| 7 | parks-09 | collar | RSPCA walking guidance and independent Blue Cross public-place guidance mention collars. Pass. |
| 8 | landscape-03 | dune | National Geographic and Wikipedia both place sand dunes in deserts as well as other environments. Pass. |
| 9 | science-09 | air | Bill Willis explicitly lists transparent air; OpenStax describes visible light passing from water into air. Pass. |
| 10 | games-toys-04 | dog | Two independently described wooden pull-toy dogs establish the toy context. Made bank answer `pull-along dog` to avoid implying a real animal. Pass after repair. |
| 11 | music-10 | recorder | Britannica identifies the wind instrument; Yamaha explains blowing air to produce its sound. Pass. |
| 12 | art-08 | rib | Mudtools identifies shaping/finishing uses; independent Clay Art Center description explicitly says wet clay. Pass. |
| 13 | practical-actions-08 | pausing playback | Microsoft and MDN independently describe pausing media. Stopping audible media can quiet a room; no claim that all sources of noise stop. Pass. |
| 14 | school-08 | book | Writing Mindset teacher says teaching books are on her desk; Jodi Durgin independently discusses plan-book/manual storage in desk organization. Pass. |
| 15 | events-05 | gloves | Two costume suppliers independently identify theatrical/costume gloves. A performer may wear them. Pass. |
| 16 | breakfast-03 | milk | Two separate breakfast restaurant menus explicitly list milk as a drink. Pass. |
| 17 | practical-actions-03 | sifting | King Arthur and KitchenAid identify sifting in cake preparation; King Arthur stresses it is optional in many recipes. Prompt requires an action, not a universal step. Pass. |
| 18 | landscape-10 | ravine | Free State tourism describes a real echoing ravine; the Institute of Acoustics explains reflection from canyon walls. Pass. |
| 19 | travel-packing-10 | compass | REI day-hike checklist and National Park Service navigation essentials explicitly include a compass. Pass. |
| 20 | house-maintenance-01 | drill | Black+Decker driver-drill description includes household screw-driving; independent HiKOKI specification lists driver bits and screw capabilities. Pass with an appropriate driver bit. |
| 21 | house-maintenance-06 | peg | Two independently authored joinery guides describe pins/pegs holding wooden joints together. Pass. |
| 22 | jobs-01 | tailor | Whiteley and Zwilling independently describe sharp tailor's shears for fabric cutting. Pass. |
| 23 | produce-04 | cherry | Wikipedia calls it stone fruit; Cambridge describes one hard central seed and cherry stones. Pass. |
| 24 | breakfast-05 | congee | Good Food recipe calls it breakfast porridge and serves it in bowls; Wikipedia independently describes the breakfast use. Pass. |
| 25 | kitchen-tools-02 | apple corer | WMF describes a sharp serrated edge; independent Lee Valley describes its cutting blade. Pass. |
| 26 | digital-07 | biometrics | Apple describes facial recognition unlocking devices; Microsoft describes facial/fingerprint sign-in. Pass. |
| 27 | community-10 | herb | RHS reports shared community herb planting; Missouri Extension explicitly describes growing herbs with neighbors. Pass. |
| 28 | weather-08 | cafe | NWS allows shelter in a business; Met Office recommends indoors/enclosed shelter during thunderstorms. A substantial indoor cafe is a plausible business example. Prompt is not emergency advice. Pass with that contextual interpretation. |
| 29 | home-rooms-08 | swing | Home Depot YLLN and Target Arden descriptions concern different swing-cushion products. Household swings can have cushions. Pass. |
| 30 | produce-06 | cabbage | RHS explicitly identifies green varieties and cooking; Wikipedia independently describes common green cabbage and cooked consumption. Pass. |

Additional manual deck review corrected a shuttlecock sport in a ball-and-net prompt (`badminton` → `pickleball`) and removed a brand-like lip-care answer. Compact duplicate detection found `potholder`/`pot holder`; one was replaced. The seeded check sample is not a claim to have externally verified every answer.
