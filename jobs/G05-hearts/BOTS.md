# Bots and measured strength

Every bot is a deterministic function of its own controller view and a passed
seeded RNG. Opponent hands, private passes and deal order are unavailable.

- Easy: pass the highest ranks; play the lowest legal rank. This is a simple
  genuine avoidance policy, not deliberately illegal play or random forfeits.
- Medium: pass dangerous Q/K/A♠, high hearts and short suits; preserve J♦ when
  enabled. Lead low safely, duck under the current led-suit winner, shed Q♠ or
  high hearts when void, and discard a high safe card from a last-seat clean trick.
- Strong: examine every three-card pass, accounting for safe low-suit guards and
  void creation. Track public suit voids, played cards and known cards sent to
  one opponent. Estimate remaining danger with exact sampling-without-replacement
  probabilities under a uniform unknown-card model; actual opponent hands are
  not uniform after strategic passing, so the model is an estimate of play.
  Capture a negative J♦ trick when safe; deny an opponent a developing moon.
  Fixed finite work, no wall-clock search or module cache. No source code ported.

## Held-out complete matches

`node scripts/leagues.mjs` regenerates data/bot-leagues.json; npm test independently
reruns and compares it.2,000 full100-point four-seat games PER league, default
moon-add/no-J♦ rules. One stronger focal bot plays three weaker bots; its seat
cycles0–3 and its designated head-to-head rival is the next seat. Tied first
places split credit. Head-to-head ties do not count as wins. Wilson95% intervals
are for the head-to-head rate. Four equal bots have25% expected first-place share.

|League|Head-to-head wins|95% interval|Ties|First-place share|Mean penalties focal / rival|
|---|---:|---:|---:|---:|---:|
|strong vs medium|1422/2000 (71.10%)|69.07–73.04%|16|48.050%|56.810 / 76.734|
|medium vs easy|1559/2000 (77.95%)|76.08–79.71%|10|57.325%|52.488 / 79.145|

Strong seeds10000–11999; medium/easy seeds20000–21999. Pilot0–199 was kept
separate and is recorded in VERIFY.md. No parameters were fitted to these
held-out leagues. Both lower confidence bounds exceed60%; both first-place
shares exceed33%, and the stronger bot averages fewer penalties.

Completion checks additionally play1,000 matches at EACH count3,4,5,6 with
rotating easy/medium/strong seats, both moon settings, J♦ on/off and both3-seat
cuts. Those are mechanical/termination checks, not claimed variant win rates.
No expert-human/POMDP superiority or unmeasured variant strength is claimed.
