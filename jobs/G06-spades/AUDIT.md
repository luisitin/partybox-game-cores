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

Round4, re-read JOBS;five largest remaining weaknesses:
1. Repeated player names produce identical private handover labels.
2. Held-out skill generalization is not yet measured.
3. Presence churn combinations exceed the fixed regression cases.
4. Final reader timing has only one independent frame measurement.
5. Mixed names that resemble generated seat labels could remain ambiguous.

Fix worst:when any names repeat, append each public roster seat number to
every label. This also prevents a third name resembling a generated label
from colliding. Baseline:all-Alex handovers have only1 distinct label in
both editions. Check actual revealed cards against each expected seat.

Round5, re-read JOBS;five largest remaining weaknesses:
1. Skill ordering has only been measured on the first2,000 seeds.
2. Disconnect/permanent-leave/pause combinations need wider sampling.
3. Final presentation needs another independent browser-process sample.
4. No physical phone is available;4×CPU remains an approximation.
5. Bot policy is heuristic; strength against outside expert AIs is unknown.

Check worst:run another2,000 full matches per comparison on held-out seeds
2001–4000,unchanged policy/settings/seat rotation. Require both outright
and direct-pair95% lower bounds above50%. Fix strategy only if evidence
shows an actual weakness; don't claim outside expertise from local leagues.
