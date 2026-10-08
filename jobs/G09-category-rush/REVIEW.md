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
