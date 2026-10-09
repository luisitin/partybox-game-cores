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

Corrective KEEP11 PRE-EDIT 2026-10-08T15:42:25.063617+00:00: root README/RULES/JOBS and selectedG06 reread after exact40eb223 CI37800519599SUCCESS15:36:35Z. Actual97,619-character log inspected; full31core/25realmutants/16kmatch/13browser/55current-sourcecontrols+8groups PASS; hostedindependentCLI verifies all1,800raw both60.002400096FPS/p95<=16.8 andactual95,268Bclip/10guards. Five weaknesses: (1) reusedsame-source framebarrier directory accepts anoldgrant; (2) capture script can overwrite published milestone media; (3) historical17guard fixture lacksexplicitly separate validator boundary; (4) CPU4phone approximation; (5) outside-expert bot strength unmeasured. Fix worstwithfreshnonce/atomicREADY/grantmatching and18th helperguard; retain17onlyinexplicit historical-testvalidator, nevercurrentCLI. Private9focusedactualtempfilecontrols/strictcompiler alreadyPASS; productionintegration/currentfullCI stillunrun. No gamepolicy/framegate/playergain intended.

Corrective KEEP12 PRE-EDIT 2026-10-08T16:09:36.138203+00:00: reread root README/RULES/JOBS andselectedG06 after exact416afd1 CI37803971795GREEN16:04:51Z; actual99,343-characterfulljob113403259966log inspected. All31core/25realmutants/16kskills/13browser/18focusedgroups/58current-source negatives PASS; hostedCLI independently all1800raw TV60.0024/phone60.0028FPS/18guards andactual95,304B currentcapture12 PASS. Five remainingweaknesses: (1) re-running capture overwrites delivered milestone clip/report; (2) invalid or omitted milestone silently fallsbackto9 instead ofpreservingcorrectprovenance; (3) repeatedcapture instructions couldoverwritealready-published proof; (4) physicalphoneapproximation; (5) externalexpertbot/originalpublisheraccess gaps remainexplicitlyunclaimed. Fixworstwith requiredexplicitvalidunused milestone andexistingclip/report refusal beforebrowserlaunch, actualCLIexistingbytespreservation controls, fresh13boundtocurrentcapturetool. Privateactual12rejections/3groupsalreadyPASS; currentintegration/hostfullproofpending. No gamepolicy/UI/framegate change or player gain intended.

Resumed pre-edit review 2026-10-09T05:07:07.154379+00:00: see audit-resume-20261009.md for the five
ranked weaknesses, actual live two-source scoring reread, and unadopted failed-nil
contract-support lead. Whole canonical tracked job bytes matched immutable Git
before edits. Current full acceptance and any measured gameplay gain are pending.

KEEP14 measured worst weakness, prepared2026-10-09T05:34:12.249638+00:00: original wholly accepted0ed
full workflow, then finite legal seeded probe3014hands/208127replayevents finds
120point contract gain. Adopt only failedNilCounts&&ownwon>0 guard; retain exact
default/Easy policy and source-bound legal/reference/privacy controls. Five
weaknesses remain listed in the first resumed audit; next address already-failed
partner-nil protection only with actual legal evidence, not speculation. New
current full accepted proof pending; no renewed no-gain round has been counted.

### Original failed-nil golden recovery, prepared 2026-10-09T06:04:30.287444+00:00
First full changed-head5f5 original CI correctly rejected stale churn data after
all36 core/tactical groups,20,000 independent differentials and25 real mutants
passed. Actual original1003-seed generator includes failedNilCounts=true, so the
adopted strategy changes six counts while total181386 events, all seven phases,
145 prototype-ID cases,45036 privacy and135108 bot-privacy comparisons stay equal.
The original churn generator and every assertion are byte-unchanged. Its exact
--write command genuinely regenerated twice, closed05:58:36.829927 and05:59:08.791894
EXIT0/groupempty, byte-identical, all3414 immutable inputs unchanged. Old golden
764fcdd7… and new43f1a188… are both preserved; only generated data is replaced.
Fresh unused functional capture15 closed06:01:36.454117,88875B, all3897 frozen
inputs unchanged, zero network/errors. It is never a native FPS result.
The entire50960-character failed native log and90497B real official3-member ZIP
are preserved. Its uploaded browser-report is inherited historical data: no
current raw frames or leagues were invoked, so it proves neither current.
Public proof archive media/failed-nil-churn-recovery-20261009.zip: 30
safe unique fullyCRC/byte-verified members, 1002136B SHA256 9c399c7170fb51c1fec4b2ba7f622e464131fc330870fc4befd85c58c2a74222.
Package/workflow only select capture15; original core/scoring/churn/mutation/
league/native-frame assertions and literal gates are unchanged.
Current full CI/genuine original reader remain required; PR16DRAFT, KEEP14
tacticalgain still provisional/streak0. This is delivery correction, not a
formal after-green no-player-gain round. Preserve actual failed source and prior
35m05 source interval/miss; do not retry unchanged timing samples.

## Current changed-policy acceptance, 2026-10-09

Exact092 full original CI37891792425/job113694132749 SUCCESS. Actual whole official11598961283:98094bytes/SHA25679f7f837c67d033f2c5afbc60d951b35edc0cf6fdd0538d8cf9eede966399499. Full original reader naturally closed06:36:23.607811Z, EXIT0/all272outerguards unchanged. All36core groups,21focused groups,25genuine mutation kills,1003full-match byte replays,16000leagues,1800native intervals/current18sourceguards,10clipguards and18actualVP8frames accepted. TV60.0028001307/CPU4x60.0029281429FPS; p95 16.7/16.8ms. Physical-phone approximation and historical58.381FAIL retained. No unchanged native timing trial.

See failed-nil-current-full-acceptance-20261009.json and media/failed-nil-current-full-acceptance-20261009.zip for the full native/whole official/raw/complete original reader and before/after guards. Initial text wrapper added one terminal LF: retained initial101310-character result; fresh exact101309 text matches entire connector raw and saved-evidence reader passed unchanged gates. This is a source qualification milestone, not an invented no-gain round. KEEP14+120 is qualified; renewed no-gain streak0. Previous source06:06:05.327440Z→hard06:36:05.327440Z was exceeded; actual source publication and lateness must be recorded without backdating.

2026-10-09 KEEP15: after f92 full genuine acceptance, rankfive in private/public audit; preserve the last trump under final-two-trick contract pressure with a contributing already-failed partner nil. Legitimate seed674/bid9 normal+sharp first action41→29/team-190→-10(+180), original independentledger agrees. Real olddefault3FAIL3PASS/candidate6PASS/all3423physicalguards;400genuinehands/67100unaffectedchoices/5268live-nil observations. Broadernilproposal rejected for100-point bag cliff; newpredicate requiresfourthcard/last2/missing>=2. Defaultfalse/Easy/live-nil/cutthroat unchanged. Fresh actualunusedfunctionalcapture16 PASS; current originalchurn-twice and whole newfullCI acceptance still REQUIRED/PENDING. All original scorers/reducer/churngenerator/league/sampler/strictgates unchanged. See failed-partner-nil-audit-summary.json, both fulllegal replayJSONs and media/failed-partner-nil-audit-20261009.zip. No overallleague/hardware/timinggain claim.

2026-10-09T07:26:32.561418+00:00: delivery qualification update: ORIGINAL unchanged churn.ts --write ran twice under3426 full frozen inputs, both natural EXIT0 and groups empty; overallclosed07:15:16.046646Z. Both1003-seed/181386-event outputs are exactly the old golden SHA43f1a188f8cc4c2e91d98e896e97ec4b569282eeeecca778e89329d3b0ab7537; no golden or assertion edits. Durable archive media/partner-nil-parent-and-churn-20261009.zip contains all24 actual parent-f92/full-native/whole-official/original-reader and new churn-twice/controller/freeze/raw members, 804376B SHAd3cd27bd5e60e0682adf9ed9a527144e1149c79da0bcdd7392169ec0ba90c417. Original earlier42-member player-probe archive remains immutable. Prior hard07:10:55.187634Z was missed; actual publication timing is retained, never backdated. Current changed-source full42/21 groups,25 mutants,16k leagues/native/whole official still pending; KEEP15+180 provisional/noGain0. This delivery is not a new KEEP round.

2026-10-09T07:55:58.428415+00:00: exact3cb genuine ORIGINAL FULL acceptance closed07:47:19.366624Z:42core/21focused/25real mutants/1003byte-replays/16k leagues/1800native intervals/18source guards/58negative frame controls/12capture controls/full18VP8frames; all276Git/3434physical runtime/Python inputs unchanged. Whole official11602332026/98166B SHAc063f6e1d9eb2a5d6d07154326f141c543319f424e2316791da4c7675f10503f; full102264-character native string saved exactly. TV60.002800130672775FPS andCPU4phone60.00252810651755FPS/p9516.7ms, approximate notphysicalphone. KEEP15+180 nowQUALIFIED at3cb;noGain0. Current full public archivemedia/partner-nil-current-full-20261009.zip/29members/811885B SHA8700cfd7666f9e9aadf5cfe8c85cb26bc40a9383ea3d5583fa2985f8bf820208; allactualfilesCRC/member-bytes readback. Following after-green reread/rank5, an unadopted opponent-nil own-score-only probe naturally closed07:50:50.095661Z:13000complete hands/897308legal schema+conservation+immutability+replay events/22changed choices; noown-score gain/all3430frozen inputs unchanged. Opponent score margin andcarried-bag effects were not evaluated, so research remainsINCOMPLETE and noformal no-gain round is counted. Full new proof-only-head workflow/whole artifact remainspending; no runtime/gate/native-sampler or policy adoption.

Actual5dd whole acceptance 2026-10-09T08:28:07.780175+00:00: run37901931935/job113726262828/official11603441218,98170B SHAdaf17aa2d4259e58e3aa3790944ea5db3268526a95b03df747d8e8a61ed8eb8e. Entire102308-character native original equals saved readback. Original reader, full18-frame VP8 decode,278 currentGit files/3436 physical guards all PASS;42core21focused25realmutants1003fullbyte replays16k leagues1800raw58negative12capture controls. TV60.00240009600384FPS and CPU460.00266411828685FPS with p9916.8ms; functional clip18frames/88884B. This confirms current proof-only head, without changing gameplay or counting an extra KEEP round. All actual whole originals/controllers/maps are in media/opponent-nil-current-head-20261009.zip (24 members,528949B SHA65a635f22217982dac359a09e257499a538d53826498e9d07fa41f1e6ad8ccfe). KEEP16 is still INCOMPLETE/noadoption/noformalnogain/streak0. Shared native quiet and three actual pre-download receiver failures are explicitly recorded. Actual milestone publication missed08:26:29.471114; exact source receipt records actual closure/lateness, never backdated.

KEEP16 narrow failed-opponent-nil proposal adopted for current full verification. Genuine seed577, own numeric6/opponent9, p2+p3nil; at fourth card/final2 both contracts need2. Old duck18 scores own-160; legal trump41 scores-40: own+120, opponent0, margin+120 across all200 independent bag0..9/nil50+100 boundaries. Broad one-sided guard was rejected because it can deny opponent bag penalty. Original legal prefix/full two terminal traces are in failed-opponent-nil-replay.json. Six new focused groups PASS08:47:00.784193 after actual old policy3FAIL/3PASS;400 real hands67100 unaffected comparisons20184 live-opponent-nil observations, hidden-hand and one-trick-deficit controls. Actual private import-copy TS2307 failure is retained separately; corrected production diff is one predicate, using public information. Original churn generator/assertions unchanged, regenerated twice and BYTEIDENTICAL old43f1a188 golden,1003seeds181386events;3436 guards PASS08:56:11.868634. Functional original capture17 PASS08:51:23.313448 with3920 guards; this is not a native timing measurement. Whole raw archive media/failed-opponent-nil-audit-20261009.zip: 55 members/2510614B/SHAb0c3ab9ccdf7994ef806a11f279a17ba6c55cc1b35636943c04b42241ef9e67c. Prior5dd whole original accepted08:28:07.780175; current changed-source original full and whole genuine packet PENDING, so gain PROVISIONAL/noGainStreak0/DraftPR16. Original ReadyPR7 unchanged. Actual milestone deadline09:01:13.479797 missed; exact source receipt records real closure/lateness without backdating.

Exact396 ORIGINAL WHOLE qualification accepted2026-10-09T09:26:51.334867+00:00: run37909278452/job113750228875/official11606915753/98105B SHAdd22c69e9e4b3568b16b7a3320645fba802b5759373431b40a6c19470b5ad56a. Entire103164-character native saved byteexact and whole physical readback equal. Original48core/21focused/25actualmutants/1003byte-replays/16kleagues/1800native/58negative/12capture controls/full18VP8 passed, all287Git/3445physical guards unchanged. KEEP16 genuine seed577 own+120/other0/margin+120 now qualified in its exact finite case; own+120 and partner+180 prior repairs remain. TV60.00226408543149FPS/CPU460.002800130672775FPS are native hosted observations, not physical-phone or universal strength. Additional12000-hand828014-event and1000-hand69014-event13/13-contract adverse probes naturally closed with all3440guards unchanged; each observed onlyone changed decision/no negative. This does not prove general nil safety or complete a no-gain round. KEEP17 reread/rankfive and live-partner/blind-nil investigation IN_PROGRESS/noGainStreak0/no extra adopted policy. Whole exact originals/controllers/probes/freeze maps archived in media/opponent-nil-current-full-20261009.zip, 41members/1326085B/SHAb9d59569177d029740cf1c9ea4767214f7dda195d33e4f16492f56f76f43e78a. Source cadence renews from exact actual push receipt; DraftPR16/protected ReadyPR7 remain.

Exact1120 ORIGINAL WHOLE qualification accepted2026-10-09T10:01:31.449033+00:00: run37912054471/job113759291886/official11606979916/98036B SHA051bd896a255ad000ebcbab9b26cbf49f069212a0d348fbbedacee51a139ec85. Entire103151-character native saved byteexact and whole physical readback equal. Original48core/21focused/25actualmutants/1003byte-replays/16kleagues/1800native/58negative/12capture controls/full18VP8 passed, all289Git/3447physical guards unchanged. KEEP16 genuine seed577 own+120/other0/margin+120 now qualified in its exact finite case; own+120 and partner+180 prior repairs remain. TV60.00240009600384FPS/CPU460.00252810651755FPS are native hosted observations, not physical-phone or universal strength. Additional12k+1k+9k legitimate hands (1518196events total) found no adverse decision under200 independent bag/nil boundaries; the NEW9k protocol found12 changed decisions/all3442 guards unchanged. Genuine16 ordinary/blind nil variants naturally passed1504events64pre-lookprivacy16legalexchanges3200both-team independent carried-bag comparisons/all3442guards unchanged. Whole saved controllers, raw JSON, actual closures and frozen inputs are preserved. These are substantive safety investigations, not universal nil safety or retrospective formal no-gain rounds. KEEP17 IN_PROGRESS/noGainStreak0/no extra adopted policy; next reread/rankfive and genuinely new privacy/outcome control after accepted current green. Whole exact originals/controllers/probes/freeze maps archived in media/opponent-nil-current-1120-full-20261009.zip, 55members/2224177B/SHAd197349bb127beab8af3824ba68ed2a4ac583444723cbf9f50fbe968ec94a57d. Source cadence renews from exact actual push receipt; DraftPR16/protected ReadyPR7 remain.

KEEP17 AFTER GREEN1120, actual controller10:06:01.241775Z: personally re-read README/RULES/JOBS and rankfive; test worst live-partner last-trump risk across all6 conserved public-unseen final-card allocations, public voids/private view/RNG/two legal continuations and2400 independent scoring boundaries. All3444guards unchanged; every observed margin120..180, but NO new production change or player gain(0), formal noGainStreak1. Synthetic projections are not six seeded histories. Original gameplay/gates unchanged. Whole originals/maps/closure archived in media/KEEP17-public-unseen-outcome-review-20261009.zip. Expanded13/13 probe header-range erratum is explicit in KEEP17-public-unseen-outcome-review-20261009.json; original bytes preserved.
