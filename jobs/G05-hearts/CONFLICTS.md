# Rule decisions

- The older hearts-only game and American Black Lady differ. G05 selects the
  familiar13 hearts+Q♠ game (26 points), supported by Pagat, Nathan Long and
  independently implemented OpenSpiel.
- Three-player deck: Pagat/Nathan Long remove2♦; Cached Cards/Arnold remove2♣.
  Default to2♦; offer the2♣ alternative. Five players remove2♣+2♦. Six follow
  the published Arnold table:2♣,3♣,2♦,2♠. Do not silently substitute3♦.
- Passing:4 is left/right/across/hold;3 uses left/right/hold;5 uses left/right/
  second-left/second-right/hold. Six use left/right/second-left/second-right/opposite/hold. No pass is a
  separate setting. All selected schedules are fixed before a hand is dealt.
- First-trick points: some sources omit the only-points exception. Follow
  Nathan Long/OpenSpiel: follow suit first, then avoid points if possible;
  if the entire eligible hand is points, one must be legal.
- Q♠ breaking hearts differs. Default only an actual heart breaks hearts;
  provide an explicit Q♠-breaks setting, as OpenSpiel/Pagat document.
- Moon: choose in settings between0-to-shooter/+26-others and−26-to-shooter/
  0-others. J♦ always gives its actual taker−10 after moon adjustment and is
  not needed for moon qualification.
- End-of-game tied low scores: use shared winners rather than extra hands.
  Default threshold100; optional short/long thresholds must be settings.

- Six-player pass cycles vary. The BGA implementation reaches every other seat
  before hold; choose left/right/second-left/second-right/opposite/hold, extending
  the independently corroborated five-seat cycle. The generic four-beat account
  in the Rummy screen does not explain five-seat "across" and is not used there.
- Six-player cut confirmation: Arnold/Wikipedia and independent BGA code agree
  on2♣,3♣,2♦,2♠. The earlier pending status is resolved; no3♦ substitution.
