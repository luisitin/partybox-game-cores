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

Round6, re-read JOBS;five largest remaining weaknesses:
1. Presence churn combinations need wider seeded sampling across phases.
2. Final presentation needs another independent browser-process sample.
3. Full virtual-time UI games spend minutes executing unused review ticks.
4. Physical phone behavior cannot be measured with the available hardware.
5. Direct original-rule-site access remains blocked; mirrors are documented.

Check worst:seeds1/2/3 plus1,000 unique random cases,180 mixed events each,
including drops during pauses,permanent leave/reconnect,stale timers,three
bot grades and explicit end. Check immutable inputs,byte-identical restored
replays,schemas/conservation/storage/results every event;swap other hidden
cards and engine RNG without changing any viewer or bot action.

Round7, re-read JOBS;five largest remaining weaknesses:
1. Full browser audit takes408.87s,largely redundant virtual review ticks.
2. UI final scores have been checked for finiteness,but not exact core parity.
3. Final UI needs another independent browser-process frame sample.
4. Physical phone measurements remain unavailable,explicitly disclosed.
5. Outside expert-AI strength/original blocked-site provenance is unverified.

Fix worst in verification:accelerate only test-clock review waits;retain
the explicit7.9s hold check,actual application timer events and every UI
action. Compare each complete UI match's final scores with the pure core.
Measure full audit duration and fresh real-time frames in a new process.
No gameplay,policy,rule,layout or product timer change is proposed.

Additional delivery review8, re-read JOBS;five remaining weaknesses:
1. Bundled Zod's full MIT notice is absent from the minified standalone file.
2. Recorded media hashes are checked,but all clips should also be decoded.
3. Physical phone measurements remain unavailable and are disclosed.
4. Outside expert-AI comparisons remain unmeasured and are not claimed.
5. Blocked original rule sites need the documented later provenance recheck.

Fix worst:retain the installed pinned dependency's exact full MIT notice
inside the standalone script and deliver/hash the notice. Build checks must
assert installed/committed/embedded equality. This is delivery metadata;
the already-satisfied three no-player-gain rounds are not reset. After the
running full suite finishes,rebuild and repeat artifact/browser verification.

Corrective review PRE-EDIT 2026-10-08T14:43:12.295103+00:00: original0037add exact CI37748960265 SUCCESS08:34:15; actual57410-character full native logs read,31tests/25actual mutation kills/1003presence cases/16kskill matches/13browser groups with900 frames perprofile near60. Root README/RULES/JOBS and selected RULES read; both pinned Pagat mirror and independent Hughes README reread live. Five ranked weaknesses: (1) browser gate accepts55FPS/p95<=25 despite required60FPS; (2) raw intervals/source identity not retained; (3) functional checks use setContent despite actualdisk navigation nowavailable; (4) video capture overlaps speed sampling; (5) physicalphone approximation. Strengthen to >=59FPS/p95<=18, retain every one of900 genuine consecutive intervals before assertions, bind source identity, use actualfile for every case, record separately afterbothprofiles. Runtime/core/bot policies unchanged; no completed KEEP gain claimed before measurements.

Corrective KEEP10 PRE-EDIT 2026-10-08T15:17:17.239230+00:00: reread root README/RULES/JOBS and selected Spades rules after exact c60923dd80e357b29196133caddf3d5ccb5c7fd2 CI37797062112 SUCCESS. Actual full93,785-character native log inspected;31tests/25real kills/16,000skill games/13groups PASS. Actual8,220-byte artifact11558968769 ZIP SHA1dcdd3090f6c9e176fc943fa9c2dc837131e161c3180369cedea6164fc8a4efe verified; all1,800unfiltered intervals independently recomputed before code edits: TV60.002400096,phone60.002664118FPS/p95<=16.7/17currentguards. Five weaknesses ranked: (1) npm test does not independently couple current frame report/raw and genuine clip/source; (2) optional capture can add errors/HTTP after the last check; (3) final console report precedes final-close timestamp; (4) corruption/missing-sidecar/false-score acceptance lacks independent negative controls; (5) physical-phone behavior remains approximate. Fix worst with standalone checker/current CLI in npm test, genuine CI baseline controls, exact three seed44 scores and current media bytes, recheck after optional recording and final report. Keep all game policy/UI/scoring/frame59-18 thresholds unchanged. Historical three-round stop remains; this is a verification-only round, no measured player gain yet.
