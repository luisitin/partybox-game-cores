# Bounded English noun matcher research

Direct page reads were completed on 2026-10-08, approximately 12:00–12:17 UTC, using Exa fetches of the URLs below. This is a factual spelling audit, not a copied dictionary or a published category list. No full source text, definitions, illustrations, or assets are bundled. External prose remains copyrighted by its publishers; our small exception table, test selection, summaries, and implementation are original. Runtime matching remains entirely offline.

The root Typed answers contract requires singular/plural stems to meet. The absent shared SDK is still represented by the documented standalone adapter; this work does not claim SDK integration. Existing normalization, numeric protection, six-letter one-edit matching, and transitive grouping are unchanged.

## Actual before evidence

The frozen 62-case baseline contains 46 positive singular/plural facts: 33 fail `sameAnswer` and grouping; 37 fail stem equality. Analysis/analyses, diagnosis/diagnoses, thesis/theses and crisis/crises already match through fuzzy spelling but fail the stem requirement. Every one of the 33 failed pairs awards two points in a controlled, same-initial, uncontested actual `scoreCategory` probe with two owners, and two points when one owner uses the forms in two rows. These are controlled scoring probes, distinct from the parent's separately retained actual-reducer game protocol.

Baseline SHA-256: matcher `122be10962c5afb81580e6b307c0b0d60c576ceb7096d9eb300967c6b26d78a7`; core `320c99f20ed38543d53cfe22a558b92f18f4d84735f45ed3617ca4e340d880d1`; scoring `6df081171d36c780d68e6fe217c71645154a1c313313ac2e6fc72a2e7d40a3ff`; content JSON `5ae665bbbafc1a1bf8d7f4a692761c9ede63ab74a7e6d3f8c62a3300e7148dea`.

## Sources actually read and used

Independent sources mean different publishers, not two Cambridge dictionary products. Each positive fact below has support from two different publishers. Grammar pages contain explicit singular/plural tables; dictionary plural headers are preferred. For chief/chiefs, Cambridge and Oxford both give unequivocal plural noun examples. Cambridge proof supplies countable printing-copy examples; Merriam-Webster explicitly lists proofs in that sense. Cambridge status supplies statuses examples and Merriam-Webster explicitly lists statuses.

| ID | Publisher and exact read URL | Observation used |
| --- | --- | --- |
| EF | EF, https://www.ef.edu/english-resources/english-grammar/singular-and-plural-nouns/ | Explicit regular, irregular and invariant tables; news takes singular agreement. |
| CB | Cambridge, https://dictionaryblog.cambridge.org/2017/10/18/feet-knives-and-sheep-forming-plurals-in-english-1/ | Author's article supplies common irregulars, f exceptions, selected o plurals and invariant nouns. Comments are not evidence. |
| GR | Grammarist, https://grammarist.com/grammar/irregular-plural-nouns/ | Explicit irregular tables; these are selected nouns, not universal suffix rules. |
| CQ | Cambridge, https://dictionary.cambridge.org/dictionary/english/quiz | Explicit plural quizzes. |
| OQ | Oxford, https://www.oxfordlearnersdictionaries.com/definition/english/quiz_1 | Explicit plural quizzes. |
| OB | Oxford, https://www.oxfordlearnersdictionaries.com/definition/english/bus_1 | Explicit buses and US variant busses. |
| MB | Merriam-Webster, https://www.merriam-webster.com/dictionary/bus | Explicit buses and busses. |
| CS | Cambridge, https://dictionary.cambridge.org/dictionary/english/status | Plural statuses in noun examples. |
| MS | Merriam-Webster, https://www.merriam-webster.com/dictionary/status | Explicit plural statuses. |
| MR | Merriam-Webster, https://www.merriam-webster.com/dictionary/roof | Explicit plural roofs. |
| CC | Cambridge, https://dictionary.cambridge.org/dictionary/english/chief | Plural chiefs in noun examples. |
| OC | Oxford, https://www.oxfordlearnersdictionaries.com/definition/english/chief_2 | Police, industry and security chiefs are plural noun examples. |
| CP | Cambridge, https://dictionary.cambridge.org/dictionary/english/proof | Proofs in countable printing and reasoning uses. |
| MP | Merriam-Webster, https://www.merriam-webster.com/dictionary/proof | Explicit plural proofs or proof for a correction copy. |
| CW | Cambridge, https://dictionary.cambridge.org/dictionary/english/wolf | Explicit plural wolves. |
| CF | Cambridge, https://dictionary.cambridge.org/dictionary/english/calf | Explicit plural calves. |
| CG | Cambridge, https://dictionary.cambridge.org/dictionary/english/gas | Business dictionary explicitly gives gases or gasses. |
| MG | Merriam-Webster, https://www.merriam-webster.com/dictionary/gas | Explicit plural gases, also gasses. |
| CK | Cambridge, https://dictionary.cambridge.org/dictionary/english/cactus | Explicit cacti and cactuses. |
| MK | Merriam-Webster, https://www.merriam-webster.com/dictionary/cactus | Explicit cacti, cactuses, also invariant cactus. |
| OH | Oxford, https://www.oxfordlearnersdictionaries.com/definition/english/house_1 | Explicit plural houses. |
| CX | Cambridge, https://dictionary.cambridge.org/dictionary/english/axes | Explicitly both plural of axis and plural of axe. |
| CA | Cambridge, https://dictionary.cambridge.org/dictionary/english/axis | Explicit axes and geometrical-line sense. |
| MA | Merriam-Webster, https://www.merriam-webster.com/dictionary/axis | Explicit axes and geometrical-line sense. |
| MX | Merriam-Webster, https://www.merriam-webster.com/dictionary/axe | Explicit axes and cutting-tool sense. |
| CI | Cambridge, https://dictionary.cambridge.org/dictionary/english/basis | Explicit bases. |
| MI | Merriam-Webster, https://www.merriam-webster.com/dictionary/basis | Explicit bases. |
| CE | Cambridge, https://dictionary.cambridge.org/dictionary/english/base | Military bases and other base senses. |
| ME | Merriam-Webster, https://www.merriam-webster.com/dictionary/base | Explicit bases. |
| CN | Cambridge, https://dictionary.cambridge.org/dictionary/english/news | News is uncountable information. |
| MN | Merriam-Webster, https://www.merriam-webster.com/dictionary/news | Plural in form but singular in construction. |
| MV | Merriam-Webster, https://www.merriam-webster.com/dictionary/new | New is an adjective, not the singular noun of news. |
| CY | Cambridge, https://dictionary.cambridge.org/dictionary/english/specie | Specie means coined money in finance. |
| MY | Merriam-Webster, https://www.merriam-webster.com/dictionary/specie | Coin money; also a nonstandard form of species. |
| CT | Cambridge, https://dictionary.cambridge.org/dictionary/english/statue | A statue is a sculptural object. |
| MT | Merriam-Webster, https://www.merriam-webster.com/dictionary/statue | A statue is a sculptural representation. |

Additional actual reads not needed as independent support: Cambridge bus https://dictionary.cambridge.org/dictionary/english/bus (buses in examples); Oxford status https://www.oxfordlearnersdictionaries.com/definition/english/status (no explicit plural header in fetched body); Oxford chief adjective https://www.oxfordlearnersdictionaries.com/definition/english/chief_1 (wrong part of speech for this fact); Merriam-Webster chief https://www.merriam-webster.com/dictionary/chief and quiz https://www.merriam-webster.com/dictionary/quiz (fetched bodies did not explicitly establish their noun plurals). No inference was promoted from a failed or incomplete fetch.

## Independently checked positive cases

The first 46 cases correspond to the retained baseline. Bus/busses is a separately sourced accepted US variant added to the final test suite. Repeating an invariant spelling is deliberate: it establishes that those nouns must not acquire an invented singular stem or generic plural replacement.

| Singular | Plural | First source | Independent second source |
| --- | --- | --- | --- |
| child | children | EF | CB |
| foot | feet | EF | CB |
| tooth | teeth | EF | CB |
| person | people | EF | CB |
| mouse | mice | EF | GR |
| goose | geese | EF | GR |
| man | men | EF | CB |
| woman | women | EF | CB |
| knife | knives | EF | CB |
| leaf | leaves | EF | CB |
| shelf | shelves | CB | GR |
| life | lives | EF | CB |
| wife | wives | EF | CB |
| half | halves | EF | GR |
| loaf | loaves | EF | GR |
| elf | elves | EF | GR |
| cactus | cacti | EF | GR |
| fungus | fungi | EF | GR |
| datum | data | EF | GR |
| syllabus | syllabi | EF | GR |
| analysis | analyses | EF | GR |
| diagnosis | diagnoses | EF | GR |
| oasis | oases | EF | GR |
| thesis | theses | EF | GR |
| crisis | crises | EF | GR |
| potato | potatoes | EF | CB |
| tomato | tomatoes | EF | CB |
| sheep | sheep | EF | CB |
| fish | fish | EF | GR |
| deer | deer | EF | CB |
| species | species | EF | CB |
| aircraft | aircraft | EF | CB |
| hero | heroes | CB | GR |
| echo | echoes | CB | GR |
| bus | buses | EF | OB |
| quiz | quizzes | CQ | OQ |
| status | statuses | CS | MS |
| roof | roofs | CB | MR |
| chief | chiefs | CC | OC |
| proof | proofs | CP | MP |
| wolf | wolves | CW | GR |
| calf | calves | CF | GR |
| gas | gases | CG | MG |
| gas | gasses | CG | MG |
| cactus | cactuses | CK | MK |
| house | houses | EF | OH |
| bus | busses | OB | MB |

## Bounded implementation and guard cases

The production stemmer has 38 exact whole-token plural aliases, followed by its original regular rules. A second alias lookup after the ordinary s removal preserves existing apostrophe-stripped forms such as men's/mens, women's/womens and mice's/mices. The independent oracle represents noun families and searches family membership rather than importing or duplicating the production alias map. News has an explicit singular protection. No lookup is applied to substrings: amen remains amen and gasmask remains gasmask.

Axes is both an axe plural and an axis plural (CX, CA/MA, MX). Bases is both a base plural and a basis plural (CE/ME, CI/MI). Adding both readings would join unrelated nouns through the contract's transitive grouping. These two ambiguous scientific readings remain excluded from automatic new canonicalization; current axe/axes and base/bases behavior is retained. Contextual voting does not create an automatic morphological solution for these homographs.

Roofs is the modern selected plural (CB/MR); CB explicitly notes historical rooves. The test which keeps roof/rooves separate checks our finite selected table and does not assert that rooves has never existed. Chief/chieves and proof/prooves are constructed guard inputs, not claimed English words: sourced chiefs/proofs prevent a blanket f-to-ves rule. Leaf/leave, knife/knave, bus/business and house/hose are similarly deliberate distinct or malformed-input guards.

Status/statue remains a match because both have six letters and one edit, as required by the existing contract. They have different meanings (CS/MS versus CT/MT); this fix does not override fuzzy semantics. Species/specie also remains a match. It is especially unsuitable as an absolute negative: MY records a nonstandard species sense as well as the monetary sense verified independently in CY. Numeric answers still never fuzz.

This is a bounded adapter correction, not complete English morphology. Unsupported irregulars, alternative plurals and lexical homographs remain possible. The table does not assert a universal f/fe, o, is or us rule. It does not singularize only-plural garments or adjudicate word senses.

## Frozen bank impact

The unchanged JSON contains 320 categories, 2,565 banks, 4,155 entries and 2,639 distinct spellings. The original 37-alias hypothesis changes nine entry instances / six spellings: tomatoes (pantry-05/T, breakfast-01/T, paper-05/T), potatoes (breakfast-01/P), children (parks-10/C), leaves (garden-08/L, weather-07/L), tea leaves (garden-08/T), data (science-08/D). No busses entry exists. The public fix keeps all content unchanged.

Four new equivalent spelling pairs occur across categories: tomato/tomatoes, potato/potatoes, leaf/leaves and child/children. They correctly prevent a player gaining points by reusing a noun in a later row. There are zero new within-bank equivalences. Two pre-existing within-bank matches are retained: glass/glasses in home-rooms-02/G; placing/playing in games-toys-10/P (the latter follows the existing one-edit policy). The affected-spelling scan checked 15,813 distinct pairs and found four new edges and zero removed edges. Final source-bound checks repeat this analysis against the actual implementation; the original hypothetical numbers are retained as before-edit planning evidence, not represented as a production execution.

`tests/plurals.test.ts` is the original hand-authored fact and guard fixture; `tests/reference.ts` supplies the independently structured family implementation. The focused suite checks all 47 facts, normalization composition, ambiguity, all facts in actual two/eight-seat scoring, own-repeat cancellation, 750 seeded oracle comparisons and every bank pair. The parent owns the actual reducer protocols, baseline archive, regenerated audit evidence, fixture regeneration and final artifact binding. Validation results belong in the current verification record after their actual executions; no pending check is marked passed here.
