# Assumptions and limits

- G02 was unclaimed on main. Its old research-only blocked branch was merged
  into the fresh claimed-main branch, preserving all original failure history.
- Chosen rules are explicitly sourced presets, not a nonexistent universal
  official Gin rulebook. Classic 20/10/20 is default; every scoring choice
  offered to players is in settings. The requested four-seat winner-stays
  extension, optional Big Gin 50 and Oklahoma extra boxes are named house choices.
- Player IDs are engine identifiers, not object prototype lookups. Original
  players remain in results even after leaving; a departure never erases score.
- Contract types and schemas are the exact provided files. The application SDK
  referenced by the explanatory contract is absent from this public workshop.
  The core implements the documented event order locally without inventing
  an unavailable package dependency or changing the shared contract.
- Two independently designed exact algorithms are implemented by the same
  author: primary weighted first-card bitmask recursion versus reference
  enumeration of every subset and every disjoint packing. This is not claimed
  as separate blind authorship. No primary code is imported by the reference.
- Bots see only the controller observation and their passed RNG, including
  public pickups/discards and their own forbidden return card. They never use
  hidden opponent cards, stock order or engine RNG. No outside AI strength
  is claimed; separate bot league measurements determine the delivered levels.
- The privacy cover is hot-seat etiquette, not cryptographic separation on a
  shared device. The core TV/spectator views and other-player views are tested
  for actual hidden-state independence; the active player's own hand is private.
- Turn clock is optional/off by default. Idle matches persist until VIP end,
  as the classic-board-game contract permits. Timed play uses event timestamps.
  A monotonic logical phase stamp disambiguates multiple transitions in one
  event millisecond; deadlines still use the supplied actual event time. State
  version1.1.0 carries this stamp so older1.0.0 saves are not falsely compatible.
- Full source extractions were read via Exa; origin HTTP codes are unobserved.
  No unread candidate is promoted to evidence. Source failures remain historical.
- Desktop and 4x-throttled mobile browser performance will be measured locally
  rather than pretending this environment is a physical mid-range phone.

- A disconnected or permanently departed seat is played with deterministic
  medium-bot legal actions until the next present player or hand reveal. It
  remains the original seat, with its original results entry; no computer
  player is invented. A present waiting player may advance a revealed hand.
  Empty rooms automatically pause; reconnecting resumes only that automatic
  pause. VIP pauses require explicit resume, and permanent leaves stay final.
  Version1.2.0 carries the empty-room pause marker. These lifecycle choices
  are workshop behavior, not a claim that classic Gin specifies departures.

- The offline host uses performance.now monotonic elapsed time and Web Crypto
  to seed its passed PRNG. Neither enters the pure core. Browser tests inject
  controlled entropy7199 and synthetic time in a separate clock context;
  normal-play frame profiles always use the actual browser frame clock.

Version1.2.1 treats valid player IDs as arbitrary strings, including empty,
without coercing invalid metadata. Invalid controller IDs use an empty string
spectator envelope but never gain the registered empty-ID player's cards.
A game's target winner and final settlement leader can differ; target winner
ranks first, remaining seats rank by final points. Early end reports current
raw standings and earns no game/line bonuses.
