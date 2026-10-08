# Implementation interface (G07)

`src/core.ts` exports `game`, `init`, `reduce`, `tvView`, `controllerView`,
`results`, `sampleInput`, `legalBids`, `effectiveWild`, `canChangePalificoFace`,
`canCalza`, and `State`, `Input`, `Bid` types. `game` has the exact shared contract.
Build outputs `dist/core.mjs`, `dist/probability.mjs`, `dist/rules.mjs`, and
`dist/contract.mjs`, and `dist/session.mjs`. Import shared `createRng` from the core re-export.

Phases: `bid`, `reveal`, `done`. Init starts in bid with privately rolled cups.
Inputs: `{type:'bid',quantity:number,face:number}`, `{type:'dudo'}`,
`{type:'calza'}`, `{type:'continue'}`. Continue is for reveal only; any known,
connected non-left player may acknowledge. Bots continue reveal.

State: phase/rng/players, order (all original ids), settings, cups (id→face[]),
diceCount (id→0..5), turn (id), round (1-based), bid (Bid|null),
bidLog (Bid[]), palifico (boolean), palificoStarter (id|null),
seenPalifico (id→boolean), nextStarter (id), nextPalifico (id|null),
reveal (null or public result), eliminated (id[] in loss order),
left (id[]), models (id→truth/false counts), autoPaused (boolean),
winner (id|null), endReason (string|null), contentLang, phoneOnly.
Bid = {quantity,face,playerId}. Reveal = {kind:'dudo'|'calza',caller,bid,
matches,correct,loser:string|null,gained:boolean,dice:Record<string,number[]>}.
Revealed dice are the cups before the die penalty/reward; their lengths may
therefore differ from the public counts for the upcoming round.

TV public fields: round, turn, bid, bidLog, diceCount, totalDice, palifico,
wild, settings, reveal, winner, endReason. No private cups/rng/model internals.
Controller adds me, ownDice (only the viewer), legalBids, canBid, canDudo,
canCalza, canContinue, and odds (null or exact raw probability for last bid).
Unknown/spectator controller gets ownDice=[], odds=null, legalBids=[].
Both views have the exact shared envelope; player ids/names use textContent.

Settings: onesWild (default true), palificoEnabled (true), palificoExemption
('none' default|'oneDie'|'experienced'), calzaEnabled (false),
calzaPolicy ('anyOther' default|'interruptOnly'), turnSeconds (0 default,
integer 0..120; no hidden fallback deadline). Calza is disabled in palifico
and when only two players remain, and a correct caller gains at most five dice.
Initial starter random; counts of remaining dice are public. 7–8-player owner
extension. Permanently departed seats play automatically while remaining
connected humans/bots are present; timestamps finite 0..10^15 milliseconds (not negative zero); empty room pauses and resume does not
override an intentional VIP hold.

Probability exports `probability(n,needed,matchingFaces)` and
`bidProbability(ownDice,totalDice,quantity,face,wild)` with the independent
reference's five-field exact integer-string API. `rules.ts` exports
`isRaise(previous,next,wild,lockedFace:boolean,mayChange:boolean)` and
`countMatches(dice,face,wild)` (each accepts a flat dice array).

## Local browser verification hook
The trusted offline host exposes window.__G07 for deterministic review: state(),
view(), controller(), init({players,settings,mode,skill,seed}), act(input),
event(fullEvent), setState(state), time(), tick(). Full state inspection/injection
is intentionally browser-only; it is not a TV/controller privacy contract.
Public game views and bot counterfactual secrecy are tested independently.

Host init also accepts pace ('fast'|'normal'|'slow'|'manual'); pace() reports the
current presentation setting. This host control is separate from core settings.

## Browser session recovery

The offline host keeps a versioned same-tab checkpoint under
`partybox.g07.session.v1` in sessionStorage. Loading a valid save shows an
explicit Resume/Discard gate; private cups, computed odds and legal selections
are absent until the usual handoff. New Game/Discard remove only this key.

`src/session.ts` exports SAVE_KEY, MAX_SESSION_BYTES, SavedSession, Skill, Pace,
encodeSession/decodeSession, restoreSessionState, createResumableRng, phaseKey
and currentBidKey. Decode rejects incompatible/corrupt/oversized state and uses
the authoritative fixture schema plus original-own-entry/semantic validation.
Resumable RNG delegates to the unchanged shared generator. Saved metadata is
host time, random cursor, skill tuples, pace and current timer/interrupt markers;
viewer and open-cup choice are not persisted.

A live unpaused turn recovers through ordinary core pause/resume events so
time away and time waiting at the gate do not expire it. Existing intentional
and automatic holds remain held; reveals still need an acknowledgement.
Presentation waits restart after explicit recovery. Storage failures are
reported in plain language while play remains available.

Additional trusted-host verification hooks: save(), host() (pending flag,
random cursor, skill mapping, pace and current markers). These remain browser
review controls and are not game contract view fields.
