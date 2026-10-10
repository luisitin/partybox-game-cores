# Thirty hand-checked random content rows

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
