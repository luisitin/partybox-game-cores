# KEEP GOING audits

Initial exact-head hosted gate:PR7/headbadf4005bd3961764492a4f48f6047af3fa249cc,
run37738084749 SUCCESS,2026-10-08T06:46:28Z. Re-read root RULES/JOBS and
the selected G06 rules before each round. No completed-job restart.

Round1, five largest weaknesses:
1. Valid40-character unbroken names expand390px phone page to830px.
2. Follow-suit hand opening focuses a disabled first card, losing keyboard focus.
3. Bots can submit Next during trick/score review before a reader is ready.
4. Two-second trick/fifteen-second score review is short for slow readers.
5. Duplicate names make the private handover's owner ambiguous.

Fix worst:wrap long labels within their containers. Measure both editions
before/after; add actual browser regressions with40-character names and
private hand opening. No layout change without evidence of a problem.

Round2, re-read JOBS;five largest remaining weaknesses:
1. Confirmed keyboard focus loss when first held card cannot follow suit.
2. Bots can submit Next before trick/score review is read.
3. Review durations are short for slow readers.
4. Duplicate names make the private handover's owner ambiguous.
5. Win-rate generalization beyond the original2,000 seeds is unmeasured.

Fix worst:focus the first enabled card when a private hand opens. Native
keyboard Enter must actually play it; a test that focuses the card manually
would miss the defect. Confirm original suit legality remains enforced.

Round3, re-read JOBS;five largest remaining weaknesses:
1. Bots/readability clocks rush review:24/24 policies submit early Next,
   trick2s/score15s is short for the visible new words/ledger.
2. Duplicate names leave the private handover's owner ambiguous.
3. Held-out skill generalization is not yet measured.
4. Presence churn combinations exceed the current fixed regression cases.
5. Repeated browser measurements have not covered the final timing model.

Fix worst:bot API waits for engine data timers during reviews; human Next
still signals readiness. Give tricks8s and side ledgers60s(partners)/90s
(three individuals). Drivers must exercise actual timers, not bot shortcuts.
