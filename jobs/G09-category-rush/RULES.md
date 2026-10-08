# Category Rush rules and researched variants

Category Rush is an original category game inspired by the mechanics of Scattergories. It is not an official edition, and contains no publisher category deck, artwork, logo or character.

## How this implementation plays

1. Two to eight players each receive the same twelve original prompts and one seeded letter. Letters are drawn without replacement from **A B C D E F G H I J K L M N O P R S T W**. The core selects twelve distinct prompts with at least one curated answer for that letter. A new prompt list is selected each round.
2. Everyone writes one answer per prompt before the round closes. Blank answers are allowed. The timer setting is 30–180 seconds in 30-second steps. Answers remain private until review; locking a sheet is final.
3. An answer must fit the prompt and start with the letter after ignoring one initial article, `a`, `an` or `the`. Established compound names are acceptable; an arbitrary adjective does not rescue a wrong-letter answer. Real examples are required. A proper name must be written with its qualifying first or surname first, where that name fits the prompt.
4. The same player may not reuse an equivalent answer elsewhere on the same sheet. This core cancels **all** of that player's repeated occurrences. This is an explicit house clarification of the published prohibition.
5. Review each prompt together. Players may accept, reject or abstain on answer validity. The group judges semantic fit; the bot bank is an example set, not an exhaustive dictionary or automatic rejection list. Bots accept recognized bank answers and abstain on unknown creative answers.
6. Majority voting includes an answer's author. If accepting and rejecting ballots tie, remove that author's ballot and compare again. A remaining tie rejects the answer; a mechanically eligible answer with no cast ballots is uncontested and accepted. These last two cases make abstentions and disconnected seats deterministic. An equivalent answer group with multiple authors uses the core's disclosed group ballot rule; see CONFLICTS.md.
7. A valid answer scores **one point only when no other player submitted an equivalent answer for the same prompt**. All duplicates score zero. Blanks, wrong letters, self-repeats and rejected answers score zero. Matching ignores case, accents, punctuation and initial articles, and handles common singular/plural forms; exact implementation details are in the core.
8. Scores accumulate for the configured 1–5 rounds (default three). Highest total wins; equal totals share victory. Review and score phases have deadlines and VIP advancement, so idle or disconnected players cannot prevent completion.

The default keeps the familiar one-answer, unique-answer mechanic, uses the newer edition's permission to change lists, and keeps a finite three-round house format. It does not claim to reproduce any single official edition exactly.

## Official rule baseline read live

The Hasbro 2003 rulebook [R1] says: 2–6 adult players; all use the same twelve-category list; play three rounds; start each with a twenty-sided letter die and three-minute timer; stop writing immediately when time expires; each acceptable answer unmatched by another player scores one point. Keep the same list for later rounds, reroll letters already used, then total the three scores. Tied leaders play one extra round with a new letter.

The first word must begin with the key letter; initial `A`, `An` and `The` do not count. The same answer cannot be used twice in a round. Proper names may be written first-name-first or surname-first, but the qualifying letter must start the written answer. Creative interpretations may count subject to a challenge. All players, including the author, vote on challenges; majority rules; if tied, the challenged author's vote is excluded. GameRules' independently authored explanation [R2] corroborates these central mechanics. UltraBoardGames [R3] transcribes the older edition and serves as an additional corroboration, not as an independent authored primary source.

The newer F6795 rulebook, read through Manualsnet [R4], specifies four rounds, a three-minute timer, one point for each acceptable unmatched answer, the same article/reuse restrictions, and the same challenge tie rule. It explicitly permits deciding between retaining a list and using a new one. Its physical sheet and retail player limits do not constrain this software's two-to-eight-player house adaptation.

The exact twenty-letter alphabet is corroborated by Wikipedia [R5] and Game Room Legends [R6]. The latter's speculation about the publisher's motive for omitting letters is not treated as a factual design history.

## Every variant encountered

| Source | Variant encountered | Implementation choice |
|---|---|---|
| Hasbro 2003; GameRules; UltraBoardGames | Bonus points for repeated starting letters in proper names or titles; multiple qualifying words can earn multiple points. | Not implemented. Always one point for a valid unique answer. |
| Hasbro 2003; UltraBoardGames | Time challenge using 150 or 120 seconds instead of 180. | Included within the broader 30–180-second timer setting. |
| F6795 via Manualsnet | Four rounds; category list may change each round. | Four rounds are selectable; lists always change to keep letter-compatible prompts playable. Default three is a house choice. |
| F6795 via Manualsnet | Up to two answers for each category; unique answers can earn multiple points. | Not implemented; one answer per prompt. |
| F6795 via Manualsnet | Two points for an answer repeating the letter, including ordinary compound nouns. | Not implemented; do not confuse this with the older names/titles-only variant. |
| TheRuleBook [R7] | Team answer sheets; 90-second speed rounds; roll twice; purported organized/tournament restrictions and a different author-excluded vote protocol. | Ninety seconds is selectable. Other proposals are not implemented; disputed claims are recorded in CONFLICTS.md. |
| Game Room Legends [R6] | All twenty-six letters with extra time or dictionary use. | Not implemented; only the researched twenty-letter set has offline coverage. |
| Wikipedia [R5] | Card-game race: reveal one letter and one category; first correct shout claims a card; finish when a deck ends. | Separate game; not implemented. |
| Wikipedia [R5]; Winning Moves Categories [R8] | One theme per round with different letters taken from the theme word; two-minute timer; first to 25 points; tied players share victory. | Separate game; not implemented. It corroborates shared victory as a published family variant, not the default older game. |
| Wikipedia [R5] | Solitaire word-search version: two answers, match hidden answers, leftover-letter bonuses, no rounds. | Separate puzzle; not implemented. |
| Cactus licensed Bible edition [R9] | Two points for a correct-letter unique answer, one for a different-letter unique answer; wild-star letter choice; Bible-limited answers, optional broader answers; doubled/tripled proper-name bonuses. | Separate themed edition; not implemented or used for content. |

See SOURCES.md for source identifiers, exact URLs, read dates and licensing. No commercial example answers or category lists were copied into the shipped deck.
