This is the complete failed recovery artifact from exact head
709fa78036bbfa127f913ffb0308b70be01f12e8, GitHub run 37790431928.
The fresh recovery attempt ran 14:12:57.560–14:13:25.283 UTC. Cases 1–7
passed; case 8, saved host pause, failed the unchanged exact timer assertion:
expected 0:50, observed 1:00. The failure remains a failure.

Atomic observations locate a clock discontinuity for this exact attempt.
Before pause, the DOM timer was 0:50, saved seatElapsed/phaseElapsed/coreNow
were 10,013 ms, but fake performance.now() was 679 ms. After the public pause
click, fake performance.now() was 716 ms and saved seatElapsed fell to 39 ms;
phaseElapsed/coreNow remained 10,013 ms. All observations retain the same
performance.timeOrigin. The incorrect 39 ms elapsed remains frozen through
reload and both closed/paused 120,000 ms advances; Ready displays 1:00.
The original draft, active player and saved game are preserved throughout.
This directly supports a test-clock discontinuity in this attempt; it does
not establish the cause of older unobserved recovery or local frame failures.

The production HTML is unchanged be311b9653a3ad4b295745f00d37dc5c3a72426480a51979459b410850985613.
The uploaded runner matches 3034f76530cc49f203006e5331375d192089fead549c0f8cab5373d9f081f256.
No production correction, relaxed assertion, cached acceptance or new formal
KEEP GOING round is claimed. The pinned dependency scheduler is being checked
with an independent empty-page control before any harness correction.
