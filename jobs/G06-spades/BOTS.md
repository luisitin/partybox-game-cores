# Measured bots

The bot policy receives only its controller projection: its revealed hand,
public bids, scores, tricks and history. Blind decisions receive no cards.
No policy reads other hands or the stock. Privacy substitutions test this
boundary for every phase and all three skills.

Easy (`easy`) randomizes legal plays and exchange cards, uses rough honour/
trump bidding with noise, and occasionally tries nil. Medium (`normal`)
counts honours/trump length, cautiously bids nil, tries to make contracts,
protects its nil partner and avoids unnecessary bags. Strong (`sharp`)
weights suit length/trump rank, checks singleton nil danger, chooses the
cheapest winning card, tracks public played ranks and inferred void suits,
and protects partner contracts/nils. It does not claim expert search strength.
SOURCES records the bidding/history/AI research actually read; no code,
models or weights were copied.

`node league.ts --write` measured seeds1–2000,2,000 complete matches per
row. The higher skill rotates seats; partnership teams alternate parity.
Cutthroat includes a declared fixed third easy seat; outright and direct
pairwise wins are both reported. Ties count as losses in Wilson bounds.

| Table | Higher vs lower | Outright wins | Direct pair wins | 95% lower bound (outright) |
| --- | --- | --- | --- | --- |
| 3-player Cutthroat | Strong vs medium | 1440/2000 (72.00%) | 1485/2000 (74.25%) | 69.99% |
| 3-player Cutthroat | Medium vs easy | 1795/2000 (89.75%) | 1890/2000 (94.50%) | 88.34% |
| 4-player partnerships | Strong team vs medium team | 1515/2000 (75.75%) | same | 73.82% |
| 4-player partnerships | Medium team vs easy team | 1996/2000 (99.80%) | same | 99.49% |

All four direct-pair lower bounds also exceed50%. One Cutthroat strong/
medium pair tie; no other ties. All8,000 matches ended naturally at the
500-point or documented−500 mercy condition. Average hands respectively
19.5855,22.6875,12.2530,12.2955; maxima34,48,26,28. Largest final state
5,637 bytes with scheduled review timers. These are comparisons within this implementation, not claims
against published AIs. Measured total286,438.80 ms with core checks running
concurrently. `bot-results.json` contains exact reproducible counts;
`node league.ts` recomputes/asserts them. `--start=2001` recomputes/asserts
the independent held-out sequence below; both run in npm test.

Round3 corrected the bot API's review behavior:it returns null instead of
premature Next. Engine timers now drive8s trick/60–90s ledger reviews;
human Next remains available. Recomputed all8,000 matches in230,678.18ms:
every win/tie/hand/input count above is unchanged; final timestamp sizes
increase slightly.31 invariant/replay/completion tests and25 mutations pass.

Round5:`node league.ts --write --start=2001`,8,000 fresh matches,seeds
2001–4000,221,792.38ms,unchanged policies/defaults/seat rotation:

| Table | Higher vs lower | Outright wins | Direct pair wins | 95% lower bound (outright) |
| --- | --- | --- | --- | --- |
| 3-player Cutthroat | Strong vs medium | 1497/2000 (74.85%) | 1530/2000 (76.50%) | 72.90% |
| 3-player Cutthroat | Medium vs easy | 1780/2000 (89.00%) | 1883/2000 (94.15%) | 87.55% |
| 4-player partnerships | Strong team vs medium team | 1521/2000 (76.05%) | same | 74.13% |
| 4-player partnerships | Medium team vs easy team | 1997/2000 (99.85%) | same | 99.56% |

All direct-pair bounds also exceed50%;zero pair ties. Average hands
19.4645,22.4640,12.3320,12.2545;maxima31,45,24,31. Largest final state
5,643bytes. `bot-results-2001.json` records the reproducible exact counts.
No player-visible policy change was warranted by this held-out audit.

2026-10-09 failed-nil recovery: with failedNilCounts=true only, once an own nil
has already failed, normal/strong bots use the existing partner-contract play
policy. When nil is still alive or contribution is false, the previous nil
strategy stays intact. Actual legal seed377 improves−160→−40; no universal
win-rate improvement is claimed. Original default leagues and seed44 results
are unchanged; changed-head original full leagues/CI remain pending.

2026-10-09 KEEP15: after f92 full genuine acceptance, rankfive in private/public audit; preserve the last trump under final-two-trick contract pressure with a contributing already-failed partner nil. Legitimate seed674/bid9 normal+sharp first action41→29/team-190→-10(+180), original independentledger agrees. Real olddefault3FAIL3PASS/candidate6PASS/all3423physicalguards;400genuinehands/67100unaffectedchoices/5268live-nil observations. Broadernilproposal rejected for100-point bag cliff; newpredicate requiresfourthcard/last2/missing>=2. Defaultfalse/Easy/live-nil/cutthroat unchanged. Fresh actualunusedfunctionalcapture16 PASS; current originalchurn-twice and whole newfullCI acceptance still REQUIRED/PENDING. All original scorers/reducer/churngenerator/league/sampler/strictgates unchanged. See failed-partner-nil-audit-summary.json, both fulllegal replayJSONs and media/failed-partner-nil-audit-20261009.zip. No overallleague/hardware/timinggain claim.

2026-10-09T07:26:32.561418+00:00: delivery qualification update: ORIGINAL unchanged churn.ts --write ran twice under3426 full frozen inputs, both natural EXIT0 and groups empty; overallclosed07:15:16.046646Z. Both1003-seed/181386-event outputs are exactly the old golden SHA43f1a188f8cc4c2e91d98e896e97ec4b569282eeeecca778e89329d3b0ab7537; no golden or assertion edits. Durable archive media/partner-nil-parent-and-churn-20261009.zip contains all24 actual parent-f92/full-native/whole-official/original-reader and new churn-twice/controller/freeze/raw members, 804376B SHAd3cd27bd5e60e0682adf9ed9a527144e1149c79da0bcdd7392169ec0ba90c417. Original earlier42-member player-probe archive remains immutable. Prior hard07:10:55.187634Z was missed; actual publication timing is retained, never backdated. Current changed-source full42/21 groups,25 mutants,16k leagues/native/whole official still pending; KEEP15+180 provisional/noGain0. This delivery is not a new KEEP round.

2026-10-09T07:55:58.428415+00:00: exact3cb genuine ORIGINAL FULL acceptance closed07:47:19.366624Z:42core/21focused/25real mutants/1003byte-replays/16k leagues/1800native intervals/18source guards/58negative frame controls/12capture controls/full18VP8frames; all276Git/3434physical runtime/Python inputs unchanged. Whole official11602332026/98166B SHAc063f6e1d9eb2a5d6d07154326f141c543319f424e2316791da4c7675f10503f; full102264-character native string saved exactly. TV60.002800130672775FPS andCPU4phone60.00252810651755FPS/p9516.7ms, approximate notphysicalphone. KEEP15+180 nowQUALIFIED at3cb;noGain0. Current full public archivemedia/partner-nil-current-full-20261009.zip/29members/811885B SHA8700cfd7666f9e9aadf5cfe8c85cb26bc40a9383ea3d5583fa2985f8bf820208; allactualfilesCRC/member-bytes readback. Following after-green reread/rank5, an unadopted opponent-nil own-score-only probe naturally closed07:50:50.095661Z:13000complete hands/897308legal schema+conservation+immutability+replay events/22changed choices; noown-score gain/all3430frozen inputs unchanged. Opponent score margin andcarried-bag effects were not evaluated, so research remainsINCOMPLETE and noformal no-gain round is counted. Full new proof-only-head workflow/whole artifact remainspending; no runtime/gate/native-sampler or policy adoption.

Actual5dd whole acceptance 2026-10-09T08:28:07.780175+00:00: run37901931935/job113726262828/official11603441218,98170B SHAdaf17aa2d4259e58e3aa3790944ea5db3268526a95b03df747d8e8a61ed8eb8e. Entire102308-character native original equals saved readback. Original reader, full18-frame VP8 decode,278 currentGit files/3436 physical guards all PASS;42core21focused25realmutants1003fullbyte replays16k leagues1800raw58negative12capture controls. TV60.00240009600384FPS and CPU460.00266411828685FPS with p9916.8ms; functional clip18frames/88884B. This confirms current proof-only head, without changing gameplay or counting an extra KEEP round. All actual whole originals/controllers/maps are in media/opponent-nil-current-head-20261009.zip (24 members,528949B SHA65a635f22217982dac359a09e257499a538d53826498e9d07fa41f1e6ad8ccfe). KEEP16 is still INCOMPLETE/noadoption/noformalnogain/streak0. Shared native quiet and three actual pre-download receiver failures are explicitly recorded. Actual milestone publication missed08:26:29.471114; exact source receipt records actual closure/lateness, never backdated.

KEEP16 narrow failed-opponent-nil proposal adopted for current full verification. Genuine seed577, own numeric6/opponent9, p2+p3nil; at fourth card/final2 both contracts need2. Old duck18 scores own-160; legal trump41 scores-40: own+120, opponent0, margin+120 across all200 independent bag0..9/nil50+100 boundaries. Broad one-sided guard was rejected because it can deny opponent bag penalty. Original legal prefix/full two terminal traces are in failed-opponent-nil-replay.json. Six new focused groups PASS08:47:00.784193 after actual old policy3FAIL/3PASS;400 real hands67100 unaffected comparisons20184 live-opponent-nil observations, hidden-hand and one-trick-deficit controls. Actual private import-copy TS2307 failure is retained separately; corrected production diff is one predicate, using public information. Original churn generator/assertions unchanged, regenerated twice and BYTEIDENTICAL old43f1a188 golden,1003seeds181386events;3436 guards PASS08:56:11.868634. Functional original capture17 PASS08:51:23.313448 with3920 guards; this is not a native timing measurement. Whole raw archive media/failed-opponent-nil-audit-20261009.zip: 55 members/2510614B/SHAb0c3ab9ccdf7994ef806a11f279a17ba6c55cc1b35636943c04b42241ef9e67c. Prior5dd whole original accepted08:28:07.780175; current changed-source original full and whole genuine packet PENDING, so gain PROVISIONAL/noGainStreak0/DraftPR16. Original ReadyPR7 unchanged. Actual milestone deadline09:01:13.479797 missed; exact source receipt records real closure/lateness without backdating.

Exact396 ORIGINAL WHOLE qualification accepted2026-10-09T09:26:51.334867+00:00: run37909278452/job113750228875/official11606915753/98105B SHAdd22c69e9e4b3568b16b7a3320645fba802b5759373431b40a6c19470b5ad56a. Entire103164-character native saved byteexact and whole physical readback equal. Original48core/21focused/25actualmutants/1003byte-replays/16kleagues/1800native/58negative/12capture controls/full18VP8 passed, all287Git/3445physical guards unchanged. KEEP16 genuine seed577 own+120/other0/margin+120 now qualified in its exact finite case; own+120 and partner+180 prior repairs remain. TV60.00226408543149FPS/CPU460.002800130672775FPS are native hosted observations, not physical-phone or universal strength. Additional12000-hand828014-event and1000-hand69014-event13/13-contract adverse probes naturally closed with all3440guards unchanged; each observed onlyone changed decision/no negative. This does not prove general nil safety or complete a no-gain round. KEEP17 reread/rankfive and live-partner/blind-nil investigation IN_PROGRESS/noGainStreak0/no extra adopted policy. Whole exact originals/controllers/probes/freeze maps archived in media/opponent-nil-current-full-20261009.zip, 41members/1326085B/SHAb9d59569177d029740cf1c9ea4767214f7dda195d33e4f16492f56f76f43e78a. Source cadence renews from exact actual push receipt; DraftPR16/protected ReadyPR7 remain.

Exact1120 ORIGINAL WHOLE qualification accepted2026-10-09T10:01:31.449033+00:00: run37912054471/job113759291886/official11606979916/98036B SHA051bd896a255ad000ebcbab9b26cbf49f069212a0d348fbbedacee51a139ec85. Entire103151-character native saved byteexact and whole physical readback equal. Original48core/21focused/25actualmutants/1003byte-replays/16kleagues/1800native/58negative/12capture controls/full18VP8 passed, all289Git/3447physical guards unchanged. KEEP16 genuine seed577 own+120/other0/margin+120 now qualified in its exact finite case; own+120 and partner+180 prior repairs remain. TV60.00240009600384FPS/CPU460.00252810651755FPS are native hosted observations, not physical-phone or universal strength. Additional12k+1k+9k legitimate hands (1518196events total) found no adverse decision under200 independent bag/nil boundaries; the NEW9k protocol found12 changed decisions/all3442 guards unchanged. Genuine16 ordinary/blind nil variants naturally passed1504events64pre-lookprivacy16legalexchanges3200both-team independent carried-bag comparisons/all3442guards unchanged. Whole saved controllers, raw JSON, actual closures and frozen inputs are preserved. These are substantive safety investigations, not universal nil safety or retrospective formal no-gain rounds. KEEP17 IN_PROGRESS/noGainStreak0/no extra adopted policy; next reread/rankfive and genuinely new privacy/outcome control after accepted current green. Whole exact originals/controllers/probes/freeze maps archived in media/opponent-nil-current-1120-full-20261009.zip, 55members/2224177B/SHAd197349bb127beab8af3824ba68ed2a4ac583444723cbf9f50fbe968ec94a57d. Source cadence renews from exact actual push receipt; DraftPR16/protected ReadyPR7 remain.

KEEP17 AFTER GREEN1120, actual controller10:06:01.241775Z: personally re-read README/RULES/JOBS and rankfive; test worst live-partner last-trump risk across all6 conserved public-unseen final-card allocations, public voids/private view/RNG/two legal continuations and2400 independent scoring boundaries. All3444guards unchanged; every observed margin120..180, but NO new production change or player gain(0), formal noGainStreak1. Synthetic projections are not six seeded histories. Original gameplay/gates unchanged. Whole originals/maps/closure archived in media/KEEP17-public-unseen-outcome-review-20261009.zip. Expanded13/13 probe header-range erratum is explicit in KEEP17-public-unseen-outcome-review-20261009.json; original bytes preserved.
