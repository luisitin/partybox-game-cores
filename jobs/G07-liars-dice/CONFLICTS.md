# Edition disagreements and choices

| Issue | Observations | Selection and reason |
| --- | --- | --- |
| Palifico face changes | B/T lock every face; P exempts experienced current one-die players; Z exempts experienced players even after recovery. | Strict default; explicit none/oneDie/experienced setting rather than silently conflating editions. |
| Calza caller | Z/B allow next player too; P permits an interrupt except next player. | anyOther default; interruptOnly setting. Bidder never calls their own bid. |
| Calza restrictions | P/T forbid palifico/duel; modern Z does not state both restrictions. | Forbid both, documented hybrid profile; it keeps the endgame and palifico ordinary. |
| Calza next starter | B says caller; Z's general lost-die wording is ambiguous when a die is gained. | Caller starts, including after successful recovery. |
| Spot-on effect | U removes dice from other players; Z/P/B recover one for caller. | Recover one at most five; U supplies math corroboration only, not this rule. |
| First starter | P initial highest roll/tie reroll; Z random. | Seeded uniform random, avoiding an extra reveal/setup phase. |
| Number of players | Publisher set supplies 2–6. Owner requires 2–8. | 2–8 with at most forty fair dice, explicitly an owner extension. |
| Visibility of counts | P hides lost dice; B offers visible counts; T shows remaining counts. | Public counts, private values. Exact conditional bot odds require the known pool. |
| Nonwild plus palifico | Disabling wild ones is an observed variant; sources do not specify every combined toggle. | Palifico still locks face; explicit deterministic house combination. |
| Bluff probability | Binomial S/U conditions on own cup, not an opponent's bidding policy. L models the latter separately. | Exact raw IID odds plus a separately labeled heuristic learned bluff model; no exact Bayesian posterior claim. |

The once-only palifico flag is marked when the round starts; the current new
starter is excluded from the experienced exemption throughout their own first
palifico. This resolves a wording ambiguity without allowing immediate evasion.
