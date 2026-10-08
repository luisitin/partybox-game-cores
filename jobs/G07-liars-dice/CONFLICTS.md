# Edition disagreements and choices

| Issue | Observations | Selection and reason |
| --- | --- | --- |
| Palifico face changes | B/T lock every face; P exempts experienced current one-die players; Z exempts experienced players even after recovery. | Strict default; explicit none/oneDie/experienced setting rather than silently conflating editions. |
| Calza caller | Z/B allow next player too; P permits an interrupt except next player. | anyOther default; interruptOnly setting. Bidder never calls their own bid. |
| Calza restrictions | P/T/G forbid palifico/duel; modern Z does not state both restrictions; D explicitly allows palifico. | Forbid both, documented hybrid profile; it keeps the endgame and palifico ordinary. |
| Calza next starter | B says caller; Z's general lost-die wording is ambiguous when a die is gained. | Caller starts, including after successful recovery. |
| Spot-on effect | U removes dice from other players; Z/P/B recover one for caller. | Recover one at most five; U supplies math corroboration only, not this rule. |
| First starter | P initial highest roll/tie reroll; Z random. | Seeded uniform random, avoiding an extra reveal/setup phase. |
| Number of players | Publisher set supplies 2–6. Owner requires 2–8. | 2–8 with at most forty fair dice, explicitly an owner extension. |
| Visibility of counts | P hides lost dice; B offers visible counts; T shows remaining counts. | Public counts, private values. Exact conditional bot odds require the known pool. |
| Ones exit threshold | D says double without plus one; Z/P/B/G say double plus one. | Use double plus one, the corroborated Perudo rule. |
| Palifico trigger wording | D body confuses an opening quantity of one with having one die; its FAQ describes losing down to one. | Use actual first 2→1 loss, corroborated Z/P/B; do not trigger by bid quantity. |
| Calza eliminated starter | D chooses bidder when caller is eliminated; Z/P/B ordinary loss order moves clockwise. | Caller or clockwise next survivor; matches the selected caller-start profile. |
| Nonwild plus palifico | Disabling wild ones is an observed variant; sources do not specify every combined toggle. | Palifico still locks face; explicit deterministic house combination. |
| Bluff probability | Binomial S/U conditions on own cup, not an opponent's bidding policy. L models the latter separately. | Exact raw IID odds plus a separately labeled heuristic learned bluff model; no exact Bayesian posterior claim. |

The once-only palifico flag is marked when the round starts; the current new
starter is excluded from the experienced exemption throughout their own first
palifico. This resolves a wording ambiguity without allowing immediate evasion.
