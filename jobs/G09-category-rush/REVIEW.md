# Player review

## Round 1, after initial exact-head CI green

Re-read JOBS.md G09 and all binding RULES.md after run 37758960937 passed
on `b389ce4` at 2026-10-08 09:53:09 UTC. The independent browser reviewer
and core owner ranked these five weaknesses before implementation:

| Rank | Weakness | Evidence and decision |
| --- | --- | --- |
| 1 | Empty categories require private ballot confirmations with no decision to make. | Actual old-file measurements required 24 ballot locks + 24 Ready clicks at two humans (48 actions), or 96 + 96 at eight (192). The new actual-file blank checks measured zero review actions at both rosters. It advances only empty public review steps through real core timer events, preserving nonempty ballots and host pause/menu control. All 28 gameplay checks, eight targeted regressions, clock probe, typecheck, reproducible builds and new exact-source strict frame proof pass. Desktop/phone mean 59.311184/60.003180 fps, both p99 16.8 ms; no review action remains for either blank roster. |
| 2 | Bots have limited variety for many category/letter pairs. | 1,694 of 2,565 supported banks contain one example; median breadth is one. Human alternatives remain valid and unfamiliar answers receive bot abstentions. Finite vocabulary affects replay variety despite clear adjacent-skill duel wins. |
| 3 | Earlier-round receipts are absent from the page. | The public core exposes completed-round history, but the scoring page renders only the latest round's entries. |
| 4 | Zero-point explanations combine two different reasons. | `Invalid · 0` covers both a wrong initial and a repeated answer on the same sheet. Public scored receipts contain enough information to explain the difference. |
| 5 | Scoring transitions lack a deliberate keyboard focus target. | The locked form is removed; the focus attempt targets only a subsequent Ready button, which does not exist on scores. |

Fix the first issue in the offline adapter only. It must use the real reducer,
keep virtual time monotonic, remain bounded to twelve review steps, and stop
while paused or while the host menu is open. No private future answers may
influence the decision. Baseline and after measurements are recorded by the
actual-file browser regression; they are not inferred from a replacement game.

## Round 2, after completed round-1 local proof and push

Re-read the complete binding root RULES.md and the G09 job on 2026-10-08.
Round-1 source-matched checks are complete and pushed at `b1663d9`; its CI is
running. The parent permits further review while CI runs, with final exact-head
green required before completion.

| Rank | Weakness | Evidence and decision |
| --- | --- | --- |
| 1 | Many bot category/letter banks force the same answer at a large table. | 1,694 of 2,565 supported banks are singleton, median breadth one. Measure 200 seeded eight-Strong-bot rounds before/after substantive authored expansion; never treat dictionary absence as a human-answer veto. |
| 2 | Earlier completed-round receipts are inaccessible from the page. | Public history exists, but current scoring renders only the latest result. A player cannot revisit a prior disputed answer. |
| 3 | Zero-point explanations conflate wrong initials and own repeats. | Scored receipts expose sufficient public evidence to distinguish these reasons safely after scoring. |
| 4 | Score transitions have no deliberate keyboard focus destination. | The locked form is removed and only an absent Ready button is searched. |
| 5 | Round history does not expose its own letter in a browsable receipt. | Each public historical result stores its letter; the current page displays the latest letter only. This belongs with the receipt-access problem, not a new rule. |

Fix the first issue with bounded, genuinely different authored examples in
high-impact banks. Compare identical seeds, rosters and bot RNG streams against
retained baseline source/data hashes. Reject equivalent-answer padding and
arbitrary adjective alliteration. Regeneration, schema, authored semantic checks,
bot skill separation and newly rebuilt-page proof remain required.

Round-2 source changes also address the closely related scored-history, zero-point explanation and keyboard-focus weaknesses before one new source-matched page proof. Actual old five-round games at two/eight humans expose only one receipt. Content-only eight-bot awarded points rise 61→85; the separately measured strategy raises them to283 on identical layouts/seeds, all200 exact replays. All current source-specific checks pass, including24 unique tests,25actualmutants,4,000duels,28+8+clock+4actualUIcases andexact600-frame desktop/phone gates withseparateclips. Accessible2/8-human five-round receipts increased1→5 while score5 remainsunchanged. Finite banks still leave a low absolute mean1.415 points per eight-bot game; this limitation remains an honest next-review candidate.

## Round 3, after completed round-2 local proof and push

Re-read binding RULES.md and JOBS.md G09 after completed local/source-matched
round 2 was pushed at `c623ee9`; exact-head CI run 37767733344 is green. The independent
actual-file review found these remaining player weaknesses:

| Rank | Weakness | Evidence and decision |
| --- | --- | --- |
| 1 | Reload destroys an unfinished game. | An actual mid-game reload returns to default setup with no resume path. Locked sheets, partial writing and scores can be lost. Add a bounded, validated local save with explicit Resume/Discard and private handover recovery. |
| 2 | Crowded bot tables still have narrow vocabulary. | Final eight-Strong mean is 1.415 points/game, with 98.423% of submitted owners duplicated. No letter can fill twelve banks of width eight; seven letters have no bank of width four. Consider a measured selection-quality change while preserving letter fairness, twelve themes and exploration. Never inflate points by suppressing responses or altering scoring. |
| 3 | Selecting an earlier receipt keeps the latest round gain label. | Actual round 1 earned one point, round 2 earned two, total three; selecting round 1 still displays '+2 this round' beside its one-point receipt. Cumulative scores must stay unchanged while the gain label identifies the selected round. |
| 4 | A wrong-initial-only review loses focus after Ready. | Actual page has no enabled vote button and activeElement becomes BODY. Tab reaches Lock, so this is a minor orientation defect. Give the remaining ballot-lock action deliberate focus. |
| 5 | The standalone English matcher covers common regular plurals but has limited irregular coverage. | The absent full SDK is documented; pairs such as knife/knives require a separate lexical audit before claiming broader matching. Investigate actual scoring and intended contract behavior with independent sources. |

Fix the reload loss first in the real offline adapter. Keep the pure core and
contract unchanged, validate versioned/bounded saved data, preserve exact bot
RNG streams and remaining active time, freeze time while offline, and resume
through a private handover. Storage failure/corruption must be explicit and
recoverable. The already observed gain-label and focus defects can be corrected
in the same client milestone with independent real-page regressions. No no-gain
round is justified while these concrete player weaknesses remain.

The read-only matcher audit found nine distinct singular/plural pairs currently
unmatched: knife/knives, mouse/mice, person/people, leaf/leaves, child/children,
tooth/teeth, foot/feet, goose/geese and shelf/shelves. Direct independent grammar
reads are recorded in SOURCES.md. This identifies a later scoring review
candidate; it does not change the frozen round-3 core or claim the full absent SDK.

## Round 4, after exact round-3 CI green

Re-read binding root RULES.md, JOBS.md G09, this game's selected rules and the
contract's Typed answers section after exact-head run 37773541708 passed on
`87eb68c`. The selected rules cancel equivalent duplicates and explicitly
include common singular/plural matching; the contract likewise requires their
stem keys to meet. Independent live grammar reads confirm the noun facts.

| Rank | Weakness | Evidence and decision |
| --- | --- | --- |
| 1 | Common irregular singular/plural answers can score separately. | Nine verified pairs, including knife/knives and child/children, currently return false. Measure accepted-pair protocols through the real reducer at two/eight seats before fixing the bounded standalone matcher. |
| 2 | Crowded bot games still duplicate most answers. | The final same-seed eight-Strong study averages 1.415 points/game and 98.423% duplicated submitted owners. Broader prompt selection remains a separate measured candidate; do not suppress answers or change scoring. |
| 3 | One earlier reload-time comparison failed intermittently. | Eight-human review restored 0:20 from displayed 0:18 once. Exact failure is retained; three diagnostics and the final uninterrupted 17-check suite preserved time. No cause is established, so no speculative lifecycle change is justified. |
| 4 | Short regular suffix exceptions can evade the matcher. | The current -s heuristic and six-letter fuzzy minimum leave bus/buses and similar cases for actual lexical auditing. Confirm facts and measure outcomes before extending rules. |
| 5 | Broadening suffix rules can create false duplicate groups. | Cambridge and Grammarist document exceptions and ambiguities. Audit roof/roofs, mass nouns and axes forms; use bounded sourced facts and negative cases rather than universal -ves/-ses substitutions. |

Fix the first issue, including closely related confirmed short-suffix defects
and negative guards in the same matcher milestone. Preserve normalization,
numeric no-fuzz, initials, transitive grouping, vote/self-repeat semantics and
all privacy. The independently implemented reference must not import the
production matcher or duplicate its algorithm. Archive historical matcher
sources so earlier bank/strategy experiments remain reproducible under their
actual old semantics. Changed-core oracle/roster/property/secrecy, actual
mutations, skill league, data/schema/semantic checks and rebuilt-page proof
remain required. No full absent-SDK stemmer is claimed.

Completed round 4: nine actual accepted-pair games per two/eight-seat roster
reduce improper duplicate points from 18 to zero; real mouse/mice review changes
two groups/two points into one anonymous group/zero points. The independent
oracle, all restored games/invariants/properties, 28 actual mutants, 4,000 duels,
schemas and real-page regressions pass. Exact 8c70a85 CI 37782409140 is green,
including genuine hosted be311/1ac strict600 and separate clips. Both local
phone failures stay archived and unresolved; hosted acceptance does not imply
local acceptance. This evidence-only completion commit awaits its own green CI
before another formal review. Four player-gain rounds leave the no-gain streak zero.

## Round 5, after exact clock-corrected full CI green

Re-read root RULES.md, JOBS.md G09, selected rules and actual full run37793856539 logs on exactbe02436467f78709bcf39d7a8437d2a10afe3778. All37 tests,10k independent oracle,7k restored/all9invariants,1003 properties,28actual mutants,4kduels and all real-page checks pass. Independent review ranks: (1) crowded bot zero/duplicate rounds (95/200whole-tablezero,mean1.415,98.4227%duplicated owners); (2) nonempty publicly ineligible reviews still require private confirmations, a source-derived burden not newly measured and currently deliberate policy; (3) no nonblocking private draft reuse/initial hints; (4) scarce-letter vocabulary (E6/6 andJ9/10pilotzero, sevenlettersno width4bank); (5) documented morphology/word-sense limits under the required fuzzy contract. No new demonstrated correctness defect outranks quantified duplication.

Primary narrow experiment: preserve uniform unused20-letter draw, full seededshuffle/postRNG, original12orderedthemes, exact below4present behavior, actual unchanged bots/scoring and explorationpositions0/4/8. Other slots consider first3same-theme candidates only, capped by public present roster and actual semantic group width, earliestties. No private sheet/ballot/skill input or additional random draw. Three explorationpositions are25% of slots, not25% exposure for everyprompt. Scarce-theme synthetic inputs preserve whole legacyfallback.

Registered800 independentheldoutseeds are40perletter, selected only by initialletter before candidate outcomes; compare separately from original200pilot, at actual2/4/8rosters with every-event restore and independentreplay. Preregistered guards retain fill, own-repeat, coverage/entropy, small-roster identity and letter/theme schedules. Absolute points/zero tables/per-letter losses and exhausted-versus-available blank pools must be reported. K3 isprimary; K2 onlysensitivity. Baseline3000actualgames+3000replays iscomplete beforeanylivecore wiring; heldout eight-seatmean1.36625 and338/800zero tables confirmtheworst issue. Unused purehelper and independent fixture/oracle tests are authored; no completed gain or LOOP5 line yet.
