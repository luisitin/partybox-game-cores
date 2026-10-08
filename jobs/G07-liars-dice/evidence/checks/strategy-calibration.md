# Initial-core strategy calibration, 2026-10-08

Historical record from before round2's exact-own-cup correction. The old
holdout below is retained evidence for that earlier core, not current-source
validation. Current reproduction and scope are at the end of this note.

Only the bot section of src/core.ts changed. Easy's original mental expected-count bid and challenge policy remained unchanged. No rules, reveal learning, views or probability exports changed. Calza interruption before the turn guard now uses the same raw exact odds threshold as the ordinary-turn policy.

Medium now calculates exact own-cup-conditioned independent binomial probabilities and uses a fixed support likelihood for the previous bidder's possible match count. It challenges when the heuristic previous-bid credibility is below 0.40 or no raise has raw credibility at least 0.30; otherwise it bids the most credible legal raise.

Strong uses the same exact binomial hypotheses with a sharper support likelihood, adapted only by truth/false counts recorded after public reveals. Positive likelihood floor is clamped to 0.015. The previously observed bid is also used to assess same-face raises: the hypothetical new quantity is queried against the posterior without treating the hypothetical raise as new evidence. Different-face raises retain independent raw probabilities. Strong compares challenge success with the best raise's credibility (0.01 continuation margin), then mixes mostly safe raises with occasional supported aggressive raises and random equivalent choices. This is an explicitly heuristic opponent posterior and a one-step survival comparison, not a claim of equilibrium or an exact strategic posterior.

Exploration used paired-seat matchups at salts 0x88a4e107, 2876125503, 207162093 and 168103391. Fixed medium likelihood exponent 1.5/floor 0.16 and challenge threshold 0.40 improved medium over easy. One-step comparison and conditioning same-face raises improved strong. Strong exponent 3, adaptive floor 0.04 clamped to 0.015, gave 65.0% vs medium on the final 200-pair exploration salt, while medium gave 57.5% vs easy. The official league salt is 0x607d1ce. Its first100 pairs were used in early diagnostic pilots; this league is not an untouched generalization test. BOTS.md and the fresh round2 holdout disclose and address that reuse.

Historical initial-core holdout command: `node .work/holdout.mjs` (private acquisition/calibration scratch; not a current public reproduction dependency). Salt 0x7b3196e2 (2066847458), 1,000 paired seeds with both seats per matchup. Results are in strategy-holdout.json: strong 1282/2000 (64.1%) vs medium, 95% Wilson [61.9724%,66.1735%], paired-seed interval [62.0657%,66.1343%]; medium 1180/2000 (59.0%) vs unchanged easy, Wilson [56.8292%,61.1363%], paired [57.0998%,60.9002%]. Both interval lower bounds exceed 50%.

Type checking: `npx tsc --noEmit` passed. The core was bundled independently into `.work/final-core.mjs` with esbuild, without rebuilding the browser during calibration. The parent and checks agent were notified to rebuild the shared artifact only after the stable policy passed the holdout.

Information restrictions: bot logic reads only its own cup, public surviving dice counts, legal bids, public bid history/current bid, revealed-outcome model counts, settings and the supplied external bot RNG. No opponent cup, game PRNG, player skill flag or future round metadata is read. Numeric binomial quantities remain exact before explicitly heuristic Bayesian weighting. Models still originate at truth=3,false=2 and retain the unchanged reveal-only learning/rescale behavior.

## Current source and public reproduction

Round2 source SHA2565d10032d64f7a91361e22423bc1203181bde488d16d895f2753d03911ededb18
adds exact-own-cup certainty protection to Medium; no later core strategy
change has been made. Current required league: Strong1294/2000 (64.70%) and
Medium1178/2000 (58.90%), `node scripts/league.mjs`,
`evidence/checks/league.json`. The concrete measured round2 gain is a corrected
proved-true challenge decision, not a claimed across-seed win-rate gain.

Current fresh holdout: `node tests/strategy-holdout.mjs`, salt0x8c42f5d1,
Strong1336/2000 (66.8%), Medium1140/2000 (57.0%). Both Wilson and paired-seed
lower95 bounds exceed50%. Raw seeds/seats/outcomes and source/bundle/runner
hashes: `evidence/checks/round-2/strategy-holdout.json`. Its1,000 paired seeds
have zero overlap with the18,000-seed superset of recorded exploration,
league and old holdout seeds; no strategy retuning used this fresh holdout.
These default-duel results compare these implementations. Multiplayer/
variant strength, human superiority and optimal play remain unproved.
