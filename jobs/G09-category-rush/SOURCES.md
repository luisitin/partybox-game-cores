# Sources, originality and licensing

All URLs below were read live on **2026-10-08 UTC** with Exa search/fetch. Search discovery was followed by direct page reads for the decisive rule and hand-check sources. No runtime code reads these URLs.

## Shipped content and rights

- `content/authored.mjs` is the authoritative **original** authored prompt and example bank. Its 320 situational prompts, clarifications, grouping and curated example selections were written for this job, without importing a published category deck, copying category lists, scraping a dictionary dataset or using proprietary answer data. Code, prompts and these original data selections are offered under **MIT**, matching the repository's code license.
- `scripts/generate-content.mjs` regenerates `content/categories.json` and `content/categories.ts` solely from that original source, with stable theme/row IDs, fixed letter order and stable example order. `content/schema.ts` generates `content/categories.schema.json` through `scripts/content-schema.ts`.
- Ordinary words and independently confirmed mechanics/facts are used as facts. The wording, list arrangement and implementation are original. The references' copyrighted prose and assets are **not** redistributed. Wikipedia was used for factual verification; its prose is CC BY-SA, but no passage or list is copied into this deck. Publisher manuals, dictionary entries, manufacturer descriptions and photographs retain their owners' rights; no implied license to redistribute them is claimed.
- No downloaded commercial category cards, publisher examples, paid content, logos, illustrations, brands in answer banks, or other media assets are shipped. A product vendor may be cited to establish that a generic tool or toy exists; its product text, brand and image do not become game content.
- The answer bank is an illustrative offline bot vocabulary, not a factual claim that every other answer is invalid. Human creative answers are decided by the group's votes. Most everyday examples were authored from ordinary knowledge; the thirty seeded checks below independently verify a spread of that curation. They do not claim exhaustive external verification of all thousands of examples.

## Rules research

| ID | Exact URL read | What was taken as mechanics or evidence |
|---|---|---|
| R1 | https://www.hasbro.com/common/instruct/scattergories_(2003).pdf | Primary 2003 rules: three rounds, twelve categories, 180-second timer, one point for valid unique answers, reuse prohibition, articles, proper-name order, majority challenge voting and author-vote exclusion only on ties; same-list/repeated-letter/tiebreak behavior; bonus and time variants. Original paraphrase only. |
| R2 | https://gamerules.com/rules/scattergories/ | Independently authored Mia Kim explanation corroborating core rules, author tie rule, article treatment, proper names, no decorative adjective padding, reuse and optional alliteration. Its ambiguous “one instance” reuse penalty is discussed in CONFLICTS.md. |
| R3 | https://www.ultraboardgames.com/scattergories/game-rules.php | Readable transcription corroborating the older edition. Text matches publisher closely; not counted as an independently authored source for a disputed fact. |
| R4 | https://manualsnet.com/hasbro/classic-scattergories-f6795 | Newer F6795 publisher guide mirrored by Manualsnet: four rounds, changing-list option, same core article/challenge rules, two-answer and broad double-point variants. One publisher source mirrored, not two independent sources. |
| R5 | https://en.wikipedia.org/wiki/Scattergories | Independently edited exact twenty-letter alphabet; alternate card, solitaire and Categories editions. Proper-name-component claim conflicts with publisher and is not selected. |
| R6 | https://www.gameroomlegends.com/scattergories-unused-letters/ | Independent corroboration that Q/U/V/X/Y/Z are excluded; all-26-letter house suggestion. Speculative design-motive explanations were not taken as facts. |
| R7 | https://therulebook.com/party-games/scattergories/ | Independently authored variant suggestions and counter-evidence. Internal timer/die and voting contradictions are recorded, not promoted to authoritative rules. |
| R8 | https://winning-moves.com/images/ScatCat_Rules_2023.pdf | Primary separate Categories edition: theme-word letters, two-minute timer, first-to-25, shared victory and its own scoring. No categories/examples copied. |
| R9 | https://www.cactusgamedesign.com/wp-content/uploads/2017/01/rules_scattergories.pdf | Primary licensed themed edition: wild-star choice, correct/other-letter 2/1 scoring, Bible scope option, challenge/timer/alliteration rules. No themed deck copied. |
| R10 | https://instructions.hasbro.com/en-us/instruction/scattergories-game | Publisher product page corroborates six-player retail box, twenty-letter die and unique-answer mechanic. Product marketing is not a full rulebook. |

## Thirty seeded membership hand checks

The selection used Python `random.Random(909)`, sampled thirty of the original 320 category rows, then chose one bank example from each sampled row. Actual checked excerpts were read from two independent authored sources for every row. Where a source proves the mechanism and another supplies a concrete example, the table says so. “Can,” “might” and contextual prompts require a plausible real example, not universality. A toy answer and nail-care answer were clarified after inspection. Full observations and selected original answers are in SPOTCHECKS.md and are to be included in VERIFY.md.

| Category row | First source actually read | Second source actually read | Membership fact taken |
|---|---|---|---|
| hygiene-06 | https://www.collinsdictionary.com/us/dictionary/english/nail-clippers | https://www.dictionary.com/browse/nailclipper | Nail clippers are handheld trimmers for fingernails. |
| science-04 | https://science.nasa.gov/mission/mars-reconnaissance-orbiter/ | https://en.wikipedia.org/wiki/Orbiter | Orbiters operate in orbit about a planetary body. |
| hygiene-10 | https://www.cdc.gov/skin-cancer/sun-safety/index.html | https://dictionary.cambridge.org/dictionary/english/sunblock | Sunblock is sunscreen; sunscreen protects skin from sunlight. |
| streets-02 | https://dictionary.cambridge.org/dictionary/english/footbridge | https://www.collinsdictionary.com/dictionary/english/footbridge | Pedestrian bridges can carry walkers across a road; Cambridge includes a road-crossing example. |
| kitchen-tools-05 | https://dictionary.cambridge.org/dictionary/english/canister | https://www.dictionary.com/browse/canister | Kitchen canisters are food-storage containers with covers/lids. |
| practical-actions-10 | https://dictionary.cambridge.org/dictionary/english/wipe | https://www.collinsdictionary.com/dictionary/english/wipe | Wiping removes dirt and crumbs from tables. |
| parks-09 | https://www.rspca.org.uk/adviceandwelfare/pets/dogs/walking | https://www.bluecross.org.uk/advice/dog/wellbeing-and-care/dog-laws-uk | Public dog walks use a collar; the local legal statements are not generalized worldwide. |
| landscape-03 | https://education.nationalgeographic.org/resource/dune/ | https://en.wikipedia.org/wiki/Dune | Sand dunes occur in deserts, though not only there. |
| science-09 | http://www.billwillis.ca/teaching/resources/opaque/page.html | https://openstax.org/books/college-physics-2e/pages/25-3-the-law-of-refraction | Air transmits visible light; refraction text explicitly discusses light entering air. |
| games-toys-04 | https://www.brio.us/en-US/products/toddler-baby-toys/push-pull-toys/dachshund-63033200 | https://leantoys.com/product-eng-15552-Wooden-Dachshund-Dog-on-a-string-Pull-Toy-13623.html | A generic pull-along toy dog moves using a string. No brand enters the bank. |
| music-10 | https://www.britannica.com/art/recorder-musical-instrument | https://www.yamaha.com/en/musical_instrument_guide/recorder/play/ | A recorder produces sound when air is blown through it. |
| art-08 | https://mudtools.com/products/polymer-rib-shape-0 | https://clayartcenter.net/product/wiziwig-ultimate-flex-rib-large/ | Pottery ribs shape and smooth wet clay. Different tool manufacturers are represented. |
| practical-actions-08 | https://learn.microsoft.com/en-us/windows/win32/wmp/controls-pause | https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/pause | Pausing stops media playback, so stopping audible playback can quiet a room. |
| school-08 | https://www.writingmindset.org/blog/2019/8/27/classroom-tour-2019 | https://jodidurgin.com/teachers-desk-setting-up-classroom_09/ | One teacher explicitly keeps teaching books on her desk; another desk guide provides homes for plan books/manuals. |
| events-05 | https://theatrehouse.com/collections/gloves | https://chicagocostume.com/collections/gloves | Theater costume suppliers offer gloves; stage performers can wear them. |
| breakfast-03 | https://www.oregondairy.com/wp-content/uploads/2025/05/2025-Breakfast-Menu.pdf | https://www.milkandhoneyjcc.com/menu/ | Independent breakfast restaurant menus list milk as a drink. No menu copied. |
| practical-actions-03 | https://www.kingarthurbaking.com/blog/2024/06/24/why-sift-flour | https://www.kitchenaid.com/countertop-appliances/pinch-of-help/how-to-sift-flour | Sifting is a possible cake-preparation step, not a requirement for every cake. |
| landscape-10 | https://freestatetourism.co.za/trip/discover-the-echo-ravine-trail/ | http://english.ioa.cas.cn/psk/201301/t20130104_97726.html | A real ravine is described as echoing; acoustic reflection explains the effect. |
| travel-packing-10 | https://www.rei.com/learn/expert-advice/day-hiking-checklist.html | https://www.nps.gov/articles/10essentials.htm | Compass is listed as hiking/navigation equipment. |
| house-maintenance-01 | https://www.blackanddecker.com/products/bcd382ds1 | https://www.hikoki-powertools.com/products/powertools/li-ion-drill/dv18da/dv18da.pdf | Driver drills support household screw-driving with suitable bits. |
| house-maintenance-06 | https://www.popularwoodworking.com/techniques/the-indispensable-mortise-tenon/ | https://www.woodsmith.com/article/pinned-mortise-tenon-joinery/ | Independently authored joinery guides show wooden pegs/pins fastening wood joints. |
| jobs-01 | https://www.whiteley.co.uk/product/12-classic-tailors-shears/ | https://www.zwilling.com/uk/zwilling-twin-l-22-cm-stainless-steel-tailors-shears-41300-221-0/41300-221-0.html | Tailors' shears are sharp fabric-cutting tools. |
| produce-04 | https://en.wikipedia.org/wiki/Cherry | https://dictionary.cambridge.org/dictionary/english/cherry | Cherries are stone fruit with a single hard central seed/stone. |
| breakfast-05 | https://www.bbcgoodfood.com/recipes/congee-soy-eggs | https://en.wikipedia.org/wiki/Congee | Congee is breakfast rice porridge; a recipe explicitly serves it in bowls. |
| kitchen-tools-02 | https://www.wmf.com/de/en/profi-plus-apple-corer-3201002815.html | https://www.leevalley.com/en-us/shop/kitchen/kitchen-tools/corers/73345-apple-corer | Apple corers have serrated cutting edges that remove cores. |
| digital-07 | https://support.apple.com/en-us/102381 | https://support.microsoft.com/en-us/windows/configure-windows-hello-dae28983-8242-bb2a-d3d1-87c9d265a5f0 | Facial/fingerprint biometrics can unlock or sign into devices. |
| community-10 | https://www.rhs.org.uk/get-involved/community-gardening/projects/growing-wellbeing-connections | https://extension.missouri.edu/publications/mp906?p=1 | Community gardeners plant herbs together. |
| weather-08 | https://www.weather.gov/mlb/hail_rules | https://weather.metoffice.gov.uk/warnings-and-advice/seasonal-advice/stay-safe-in-a-thunderstorm | Indoor business shelter is a plausible place during hail-bearing thunderstorms. This is contextual membership, not blanket emergency advice. |
| home-rooms-08 | https://www.homedepot.com/p/47-x-40-in-2-3-Seater-Replacement-Outdoor-Swing-Cushions-with-Back-Support-Waterproof-Bench-Cushion-Palm-Leaves-Palm-Leaves-47inX40in/334188987 | https://www.target.com/p/arden-indoor-outdoor-swing-cushion-set-56-x-20-water-repellent-fade-resistant-cushion-set-for-swing-or-bench-black-leala/-/A-1009777921 | Different household swing cushion products establish a swing can have cushions. |
| produce-06 | https://www.rhs.org.uk/vegetables/cabbages/grow-your-own | https://en.wikipedia.org/wiki/Cabbage | Cabbage has green varieties and is eaten cooked. |

## Additional successful reads and limits

These sources were inspected as corroboration, fallback discovery or scope checks; no new shipped data or copyrighted wording was taken:

- https://en.wikipedia.org/wiki/List_of_vegetables — culinary versus botanical use; factual naming only.
- https://www.britannica.com/topic/list-of-herbs-and-spices-2024392 — herb/spice distinction; extraction cut early, so not an all-bank verification.
- https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices — culinary herb/spice scope; no copied list.
- https://en.wikipedia.org/wiki/Root_vegetable and https://www.britannica.com/science/root-vegetable — underground parts include roots, tubers and rhizomes; supports careful prompt wording.
- https://www.nhs.uk/live-well/seasonal-health/sunscreen-and-sun-safety/ — sunscreen protection corroboration.
- https://www.merriam-webster.com/dictionary/canister — container sense, but not used alone to establish a lid.
- https://www.cdc.gov/hygiene/about/cleaning-and-disinfecting-with-bleach.html and https://www.food.gov.uk/safety-hygiene/cleaning — cleaning context; dictionary definitions give the specific wiping proof.
- https://en.wikipedia.org/wiki/Transparency_and_translucency — optical transmission mechanism; direct air examples supplied by the more specific references above.
- https://www.gov.uk/control-dog-public — UK dog-control context; collars independently verified in the animal-welfare references.
- https://www.britannica.com/plant/cherry — confirms the plant/fruit, but extracted text did not reach stone anatomy; replaced for that claim with Cambridge.
- https://extension.umn.edu/garden-and-home/yard-and-garden/gardening-in-minnesota/growing-herbs — herb cultivation scope.
- https://www.weareteachers.com/teacher-desk-organization/ and https://www.teachstarter.com/us/teacher-organisation/classroom-organization/ — organization background; replaced with direct teaching-book statements for the sampled membership claim.

Unsuccessful direct read attempts, not used as evidence: https://www.britannica.com/topic/list-of-vegetables-2035464 ; https://www.britannica.com/topic/list-of-vegetables-2078681 ; https://www.britannica.com/science/dune ; https://www.bbc.co.uk/bitesize/articles/z4b3trd ; https://www.melissaanddoug.com/products/pull-along-zoo-animals ; https://www.brio.us/products/all-products/pull-along-toys/pull-along-dachshund-63303000 ; https://www.collinsdictionary.com/dictionary/english/canister . Reachable, actually read replacements are recorded above. No unavailable page is represented as read evidence.

## Bundled runtime dependency

Zod 4.1.12 (https://www.npmjs.com/package/zod/v/4.1.12), MIT. The actual installed package LICENSE was read; its 2025 Colin McDonnell copyright and full MIT permission notice are preserved in THIRD_PARTY_NOTICES.txt and inline in every generated standalone play.html. Development tooling is not shipped as runtime code.

## KEEP GOING round 2: authored breadth

The 388 additions are original manually selected semantic examples across 32 existing prompts and 173 existing letter banks. All prompts, baseline example orders, category IDs and supported letters are retained. No published category deck, source prose, art, sound, brand term, logo or product identifier was copied into gameplay. Existing MIT authorship applies; only facts and ordinary names are used.

The complete thirty seeded changed-row checks, exact two live-read URLs and observed limits are in [SPOTCHECKS-R2.md](SPOTCHECKS-R2.md). They were sampled after semantic cleanup from the frozen generated pack. Other additions are original curation **from knowledge, unverified**, not represented as exhaustively source-checked. Contextual examples are possibilities, not claims about every teacher, school laboratory, gallery or library.

Additional live pages read for general curation, overlap review or discarded evidence:

- https://en.wikipedia.org/wiki/List_of_culinary_herbs_and_spices — culinary names and aliases; removed cilantro/coriander, perilla/shiso and cassia/cinnamon padding.
- https://www.fs.usda.gov/wildflowers/ethnobotany/food/spices.shtml — culinary herb/spice use only. Its seed-part list misclassifies several fruits/arils; not used as seed-anatomy evidence.
- https://en.wikipedia.org/wiki/List_of_root_vegetables — root/rhizome/tuber names; no list text copied.
- https://www.diy.com/ideas-advice/planting-digging-garden-hand-tools-buying-guide/PROD_npcart_100371.art — purposes of digging tools; auger/post-hole-digger overlap removed.
- https://www.acousticslab.org/world/Ensembles/NearEast/Buzuq.htm — instrument description; not counted as an independent second source for MaqamWorld because a mechanism sentence closely matches.
- https://www.britishmuseum.org/collection/object/E_Am1898-1 — extraction returned navigation only; discarded as evidence, replaced with V&A.
- https://en.wikipedia.org/wiki/Cellulose_acetate — general polymer description; transparency not established in extracted passage, replaced with technical overview.
- https://www.gardenweasel.com/products/weasel-scoop-hand-tool — soil scooping function.
- https://www.dripworks.com/gardenbee-stainless-steel-scoop — soil transfer function.
- https://www.bbcgoodfood.com/recipes/chocolate-cherry-porridge — cherries as a topping; insufficient alone for stirring claim.
- https://pointedkitchen.com/cherry-porridge-weight-watchers/ — cherries as a topping; replaced with recipes that mix them into porridge.
- https://p1sim.fr/products/usb-cable — wheel cable; replaced with explicit PC manuals.
- https://www.cubecontrols.com/product/cube-controls-universal-usb-cable/ — wheel cable; replaced with explicit PC manuals.
- https://www.tate.org.uk/art/art-terms/f/fumage — smoke in wet paint; paper-specific claim checked elsewhere.
- https://www.britannica.com/art/collage — general found-material/fabric definition; replaced for the sampled fur check by an explicit independent university material-collage record.
- https://www.ludwig-stiftung.at/collection-notes/an-ordinary-love-guelsuen-karamustafa — fur-pattern/textile collage, not evidence of actual animal fur.

Source disagreements: Serious Eats calls asafoetida resin a tree product; Good Food identifies giant fennel, consistent with the culinary-herb reference. Only the agreed culinary seasoning fact is adopted. USDA plant-part inaccuracies likewise do not affect the broad seasoning prompt. Sources remain external research references and are not bundled as copied datasets or assets.
