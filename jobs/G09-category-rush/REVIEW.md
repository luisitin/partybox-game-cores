# Player review

## Round 1, after initial exact-head CI green

Re-read JOBS.md G09 and all binding RULES.md after run 37758960937 passed
on `b389ce4` at 2026-10-08 09:53:09 UTC. The independent browser reviewer
and core owner ranked these five weaknesses before implementation:

| Rank | Weakness | Evidence and decision |
| --- | --- | --- |
| 1 | Empty categories require private ballot confirmations with no decision to make. | Actual old-file measurements required 24 ballot locks + 24 Ready clicks at two humans (48 actions), or 96 + 96 at eight (192). The new actual-file blank checks measured zero review actions at both rosters. It advances only empty public review steps through real core timer events, preserving nonempty ballots and host pause/menu control. Full regression and exact-source frame verification remain pending. |
| 2 | Bots have limited variety for many category/letter pairs. | 1,694 of 2,565 supported banks contain one example; median breadth is one. Human alternatives remain valid and unfamiliar answers receive bot abstentions. Finite vocabulary affects replay variety despite clear adjacent-skill duel wins. |
| 3 | Earlier-round receipts are absent from the page. | The public core exposes completed-round history, but the scoring page renders only the latest round's entries. |
| 4 | Zero-point explanations combine two different reasons. | `Invalid · 0` covers both a wrong initial and a repeated answer on the same sheet. Public scored receipts contain enough information to explain the difference. |
| 5 | Scoring transitions lack a deliberate keyboard focus target. | The locked form is removed; the focus attempt targets only a subsequent Ready button, which does not exist on scores. |

Fix the first issue in the offline adapter only. It must use the real reducer,
keep virtual time monotonic, remain bounded to twelve review steps, and stop
while paused or while the host menu is open. No private future answers may
influence the decision. Baseline and after measurements are recorded by the
actual-file browser regression; they are not inferred from a replacement game.
