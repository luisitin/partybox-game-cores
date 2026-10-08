import {game, canCalza, canChangePalificoFace} from './core.js';
import type {State, Input} from './core.js';
import {SAVE_KEY, encodeSession, decodeSession, createResumableRng, restoreSessionState, phaseKey, currentBidKey} from './session.js';
import type {Skill, Pace, SavedSession} from './session.js';

// This file is the local browser host. Entropy, elapsed real time and timers live
// here; the core receives deterministic inputs and explicit timestamps only.
const $ = (id: string): HTMLElement => document.getElementById(id)!;
const select = (id: string): HTMLSelectElement => $(id) as HTMLSelectElement;
const input = (id: string): HTMLInputElement => $(id) as HTMLInputElement;
const button = (id: string): HTMLButtonElement => $(id) as HTMLButtonElement;
type Settings = Record<string, string | number | boolean>;
type HostOptions = {players?: number; settings?: Settings; mode?: string; skill?: Skill; pace?: Pace; seed?: number};
type Event = Parameters<typeof game.reduce>[1];
// Host presentation only: the core's turn deadline always takes precedence.
const pacing: Record<Pace, {regular: number | null; interrupt: number | null}> = {
  fast: {regular: 750, interrupt: 400},
  normal: {regular: 2000, interrupt: 1650},
  slow: {regular: 4000, interrupt: 3650},
  manual: {regular: null, interrupt: null},
};
let botPace: Pace = 'normal';
let state: State | null = null;
let viewer: string | null = null;
let openFor: string | null = null;
let botDue: number | null = null;
let interruptDue: number | null = null;
let interruptSampled: string | null = null;
let lastClock = 0;
let clockOffset = 0;
let pendingSession: SavedSession | null = null;
let botRng = createResumableRng(entropy());
let cachedState: State | null = null;
let cachedViewer: string | null = null;
let cachedController: ReturnType<typeof game.controllerView> | null = null;
let bidsByQuantity = new Map<number, {quantity: number; face: number}[]>();
const firedTimers = new Set<string>();
const skills = new Map<string, Skill>();
const settingControls = new Map<string, HTMLInputElement | HTMLSelectElement>();

function entropy(): number { return crypto.getRandomValues(new Uint32Array(1))[0]!; }
function clockNow(): number { lastClock = Math.max(lastClock, Math.floor(performance.now()) + clockOffset); return lastClock; }
function storageMessage(message: string): void {
  $('storage-note').textContent = message; $('storage-note').hidden = !message;
}
function removeSaved(): boolean {
  try { sessionStorage.removeItem(SAVE_KEY); return true; }
  catch {
    // A tombstone also prevents an older game returning if removal is blocked.
    try { sessionStorage.setItem(SAVE_KEY, ''); return true; }
    catch { storageMessage('The previous game could not be cleared. This tab may offer it again after a reload.'); return false; }
  }
}
function saveSession(): void {
  // A reload at the recovery gate keeps the original checkpoint unchanged.
  if (!state || pendingSession) return;
  const value: SavedSession = {
    version: 1, gameId: 'liars-dice', gameVersion: game.manifest.version,
    state, savedHostNow: clockNow(), botRng: {...botRng.state()},
    skills: [...skills], pace: botPace,
    currentTimerConsumed: firedTimers.has(phaseKey(state)),
    sampledCurrentBid: interruptKey() !== null && interruptSampled === interruptKey(),
  };
  const encoded = encodeSession(value);
  try {
    if (encoded === null) throw new Error('Unavailable checkpoint');
    sessionStorage.setItem(SAVE_KEY, encoded); storageMessage('');
  } catch {
    const cleared = removeSaved();
    if (cleared) storageMessage('This game could not be kept for a reload. Keep this page open to continue playing.');
  }
}
function name(id: string): string { return state?.players[id]?.name ?? 'Player'; }
function clearResults(): void {
  $('result').hidden = true;
  $('winner-title').textContent = ''; $('winner-copy').textContent = '';
  $('standings-body').replaceChildren();
}
function ordinal(value: number): string {
  const suffix = value % 100 >= 11 && value % 100 <= 13 ? 'th' : ({1: 'st', 2: 'nd', 3: 'rd'} as Record<number, string>)[value % 10] ?? 'th';
  return `${value}${suffix}`;
}
function renderResults(): void {
  const results = state ? game.results(state) : null;
  if (!state || !results) { clearResults(); return; }
  const winners = new Set(results.winnerIds);
  $('result').hidden = false;
  $('winner-title').textContent = results.winnerIds.length === 1
    ? `${name(results.winnerIds[0])} ${state.endReason === 'vip-end' ? 'finishes first' : 'wins'}`
    : results.winnerIds.length > 1 ? 'A tie for first place' : 'Final standings';
  $('winner-copy').textContent = results.headlineNote ?? '';
  // Ranking, competition places and winners are owned by the core. Remaining
  // dice are shown directly; the core's composite ranking score stays internal.
  $('standings-body').replaceChildren(...results.ranking.map(standing => {
    const row = document.createElement('tr'); row.dataset.playerId = standing.playerId;
    const winner = winners.has(standing.playerId);
    row.className = winner ? 'standing-winner' : '';
    const rank = document.createElement('td'); rank.className = 'standing-rank'; rank.textContent = String(standing.rank);
    const player = document.createElement('th'); player.scope = 'row'; player.className = 'standing-player';
    const playerName = document.createElement('span'); playerName.className = 'standing-name'; playerName.textContent = name(standing.playerId);
    const status = document.createElement('span'); status.className = 'standing-status';
    const eliminatedAt = state!.eliminated.indexOf(standing.playerId);
    status.textContent = winner ? results.winnerIds.length > 1 ? 'Tied winner' : 'Winner'
      : eliminatedAt >= 0 ? `${ordinal(eliminatedAt + 1)} out`
      : state!.diceCount[standing.playerId] === 0 ? 'No dice left' : 'At host end';
    player.append(playerName, status);
    const dice = document.createElement('td'); dice.className = 'standing-dice'; dice.textContent = String(state!.diceCount[standing.playerId]);
    row.append(rank, player, dice); return row;
  }));
}
function option(value: string, text = value): HTMLOptionElement {
  const o = document.createElement('option'); o.value = value; o.textContent = text; return o;
}
function tag(text: string, gold = false): HTMLElement {
  const el = document.createElement('span'); el.className = 'tag' + (gold ? ' gold' : ''); el.textContent = text; return el;
}
function makeLabel(text: string, control: HTMLElement): HTMLLabelElement {
  const label = document.createElement('label'); label.textContent = text; label.append(control); return label;
}
function die(face: number, matched = false): HTMLElement {
  const el = document.createElement('span'); el.className = 'die' + (matched ? ' match' : '');
  el.setAttribute('role', 'img'); el.setAttribute('aria-label', String(face));
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 60 60'); svg.setAttribute('aria-hidden', 'true');
  const rect = document.createElementNS(ns, 'rect');
  rect.setAttribute('x', '1'); rect.setAttribute('y', '1'); rect.setAttribute('width', '58'); rect.setAttribute('height', '58');
  rect.setAttribute('rx', '11'); rect.setAttribute('fill', '#fff8e7'); svg.append(rect);
  const points: Record<number, number[][]> = {
    1: [[30,30]], 2: [[17,17],[43,43]], 3: [[17,17],[30,30],[43,43]],
    4: [[17,17],[43,17],[17,43],[43,43]], 5: [[17,17],[43,17],[30,30],[17,43],[43,43]],
    6: [[17,15],[43,15],[17,30],[43,30],[17,45],[43,45]],
  };
  for (const [x,y] of points[face] ?? []) {
    const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y));
    c.setAttribute('r', '4.3'); c.setAttribute('fill', '#143338'); svg.append(c);
  }
  el.append(svg); return el;
}

const count = document.createElement('select'); count.id = 'player-count';
for (let n = 2; n <= 8; n++) count.append(option(String(n), `${n} players`));
count.value = '4';
const mode = document.createElement('select'); mode.id = 'mode';
mode.append(option('hotseat', 'Pass the device'), option('bots', 'You vs bots'));
const difficulty = document.createElement('select'); difficulty.id = 'bot-skill';
difficulty.append(option('easy', 'Easy'), option('normal', 'Normal'), option('sharp', 'Strong'));
difficulty.value = 'normal';
const paceSetup = document.createElement('select'); paceSetup.id = 'bot-pace-setup';
for (const [value, text] of [['fast', 'Fast · 0.75 s'], ['normal', 'Normal · 2 s'], ['slow', 'Slow · 4 s'], ['manual', 'Manual · step only']]) {
  paceSetup.append(option(value, text)); select('bot-pace').append(option(value, text));
}
paceSetup.value = botPace; select('bot-pace').value = botPace;
$('setup-grid').append(makeLabel('Players', count), makeLabel('Play style', mode), makeLabel('Bot strength', difficulty), makeLabel('Bot pace', paceSetup));
function changePace(value: string): void {
  botPace = Object.hasOwn(pacing, value) ? value as Pace : 'normal';
  paceSetup.value = botPace; select('bot-pace').value = botPace;
  botDue = null; interruptDue = null; interruptSampled = null;
  if (state) { cover(); render(); saveSession(); }
}
paceSetup.onchange = () => changePace(paceSetup.value);
select('bot-pace').onchange = () => changePace(select('bot-pace').value);
for (const spec of game.manifest.settings) {
  const control = spec.type === 'boolean' || spec.type === 'number' ? document.createElement('input') : document.createElement('select');
  control.id = 'setting-' + spec.key;
  const label = makeLabel(spec.label, control);
  if (control instanceof HTMLInputElement) {
    if (spec.type === 'boolean') { control.type = 'checkbox'; control.checked = spec.default; label.className = 'check'; }
    else if (spec.type === 'number') {
      control.type = 'number'; control.min = String(spec.min); control.max = String(spec.max); control.step = String(spec.step ?? 1); control.value = String(spec.default);
    }
  } else if (spec.type === 'select' || spec.type === 'multiselect') {
    for (const item of spec.options) control.append(option(item.value, item.label)); control.value = spec.default;
  }
  const wrapper = document.createElement('div'); wrapper.append(label);
  if (spec.description) { const p = document.createElement('small'); p.textContent = spec.description; wrapper.append(p); }
  $('settings').append(wrapper); settingControls.set(spec.key, control);
}

function renderNames(): void {
  const prior = Array.from(document.querySelectorAll<HTMLInputElement>('#names input')).map(el => el.value);
  const kinds = Array.from(document.querySelectorAll<HTMLSelectElement>('#names select')).map(el => el.value);
  $('names').replaceChildren();
  for (let n = 0; n < Number(count.value); n++) {
    const field = document.createElement('div'); field.className = 'seat-field';
    const title = document.createElement('div'); title.className = 'seat-title'; title.textContent = 'Seat ' + (n + 1);
    const control = document.createElement('input'); control.id = 'name-' + n; control.maxLength = 40;
    control.value = prior[n] ?? (mode.value === 'bots' && n === 0 ? 'You' : `Player ${n + 1}`);
    const kind = document.createElement('select'); kind.id = 'seat-' + n;
    kind.append(option('human', 'Human'), option('easy', 'Easy bot'), option('normal', 'Normal bot'), option('sharp', 'Strong bot'));
    kind.value = kinds[n] ?? (mode.value === 'bots' && n > 0 ? difficulty.value : 'human');
    field.append(title, makeLabel('Name', control), makeLabel('Controller', kind)); $('names').append(field);
  }
}
count.onchange = renderNames;
function changeMode(): void {
  for (let n = 0; n < Number(count.value); n++) select('seat-' + n).value = mode.value === 'bots' && n > 0 ? difficulty.value : 'human';
  if (mode.value === 'bots' && input('name-0').value === 'Player 1') input('name-0').value = 'You';
}
mode.onchange = changeMode;
function changeDifficulty(): void {
  for (let n = 0; n < Number(count.value); n++) if (select('seat-' + n).value !== 'human') select('seat-' + n).value = difficulty.value;
}
difficulty.onchange = changeDifficulty;
renderNames();

function activeHumans(): string[] {
  return state ? state.order.filter(id => state!.diceCount[id]! > 0 && !state!.players[id]!.bot && state!.players[id]!.connected && !state!.left.includes(id)) : [];
}
function isBotTurn(): boolean {
  return !!state && state.phase.id === 'bid' && (!!state.players[state.turn]?.bot || !state.players[state.turn]?.connected || state.left.includes(state.turn));
}
function hasBotInterrupt(): boolean {
  return !!state && state.phase.id === 'bid' && state.order.some(id => id !== state!.turn && state!.players[id]!.bot && canCalza(state!, id));
}
function interruptKey(): string | null {
  return state ? currentBidKey(state) : null;
}
function privateView(): ReturnType<typeof game.controllerView> | null {
  if (!state || !viewer) return null;
  // Exact odds and legal raises depend on immutable state + viewer, not the
  // draft quantity/face selection. Reuse that result while editing a bid.
  if (cachedState !== state || cachedViewer !== viewer) {
    cachedState = state; cachedViewer = viewer;
    cachedController = game.controllerView(state, viewer);
    bidsByQuantity = new Map();
    for (const bid of cachedController.legalBids) {
      const group = bidsByQuantity.get(bid.quantity);
      if (group) group.push(bid); else bidsByQuantity.set(bid.quantity, [bid]);
    }
  }
  return cachedController;
}
function chooseViewer(): void {
  if (!state) { viewer = null; return; }
  const humans = activeHumans();
  viewer = humans.includes(state.turn) ? state.turn : humans.includes(viewer ?? '') ? viewer : humans[0] ?? null;
}
function cover(): void {
  openFor = null;
  // Clear the values themselves, instead of relying on CSS to conceal dice.
  $('cup').replaceChildren(); $('private-note').textContent = '';
  $('private').hidden = true;
}
function clearPrivateDraft(): void {
  cover(); cachedState = null; cachedViewer = null; cachedController = null;
  bidsByQuantity.clear(); select('bid-quantity').replaceChildren(); select('bid-face').replaceChildren();
  $('private-note').textContent = ''; $('action-hint').textContent = ''; $('notice').textContent = '';
}
function start(options: HostOptions = {}): void {
  pendingSession = null; $('recovery').hidden = true; clearPrivateDraft();
  if (options.players !== undefined) { count.value = String(options.players); renderNames(); }
  if (options.mode !== undefined) { mode.value = options.mode; changeMode(); }
  if (options.skill !== undefined) { difficulty.value = options.skill; changeDifficulty(); }
  if (options.pace !== undefined) changePace(options.pace);
  const settings: Settings = {};
  for (const [key, control] of settingControls) settings[key] = control instanceof HTMLInputElement ? control.type === 'checkbox' ? control.checked : Number(control.value) : control.value;
  Object.assign(settings, options.settings);
  const seed = options.seed ?? entropy(); botRng = createResumableRng(seed ^ 0xc3a5c85c); skills.clear(); firedTimers.clear();
  const players = Array.from({length: Number(count.value)}, (_, n) => {
    const kind = select('seat-' + n).value; skills.set('p' + n, kind === 'easy' ? 'easy' : kind === 'sharp' ? 'sharp' : 'normal');
    return {id: 'p' + n, name: input('name-' + n).value.trim() || `Player ${n + 1}`, avatarId: 'face-' + n, connected: true, bot: kind !== 'human'};
  });
  state = game.init({players, settings, seed, now: clockNow()});
  viewer = null; cover(); chooseViewer(); botDue = null; interruptDue = null; interruptSampled = null;
  $('setup').hidden = true; $('table').hidden = false; render(); saveSession();
}
function apply(event: Event): void {
  if (!state) return;
  // Sampling a bot input can itself cross a deadline. Recheck at dispatch as
  // well as before sampling; timer events enter this function without recursion.
  if (event.type === 'input' && deliverDueTimer()) return;
  const old = state, next = game.reduce(old, event);
  if (next === old) return;
  // A timer can explicitly schedule a later second beat. Other events,
  // including a pause shifting the deadline, do not re-arm a delivered timer.
  if (event.type === 'timer' && next.phase.id === old.phase.id && next.phase.startedAt === old.phase.startedAt && next.phase.deadline !== null && old.phase.deadline !== null && next.phase.deadline > old.phase.deadline) {
    firedTimers.delete(`${old.phase.id}:${old.phase.startedAt}`);
  }
  const consumed = firedTimers.has(phaseKey(next));
  firedTimers.clear(); if (consumed) firedTimers.add(phaseKey(next));
  state = next; cover(); chooseViewer(); botDue = null; interruptDue = null; render(); saveSession();
}
function send(move: Input): void {
  if (!state || !viewer) return;
  if (deliverDueTimer()) return;
  const before = state;
  apply({type: 'input', now: clockNow(), playerId: viewer, input: move});
  if (state === before) $('notice').textContent = 'That move is unavailable. Choose one of the legal options.';
}
function selectedBid(): void {
  if (!state || !viewer) return;
  const v = privateView()!;
  const legal = bidsByQuantity.get(Number(select('bid-quantity').value)) ?? [];
  const faces = select('bid-face'), previous = faces.value;
  const unchanged = faces.options.length === legal.length && legal.every((bid, index) => faces.options.item(index)!.value === String(bid.face));
  if (!unchanged) {
    faces.replaceChildren(...legal.map(b => option(String(b.face), `${b.face}${b.face === 1 && v.wild ? ' · wild ones' : ''}`)));
    if (faces.value !== previous && legal.some(b => String(b.face) === previous)) faces.value = previous;
  }
  const disabled = !v.canBid || legal.length === 0;
  if (button('make-bid').disabled !== disabled) button('make-bid').disabled = disabled;
}
select('bid-quantity').onchange = selectedBid;
select('viewer').onchange = () => { viewer = select('viewer').value || null; cover(); render(); };

function renderClock(): void {
  if (!state) return;
  const el = $('clock');
  el.hidden = state.phase.deadline === null || state.phase.id === 'done';
  if (el.hidden) { el.textContent = ''; return; }
  const at = state.phase.paused?.at ?? clockNow();
  const text = `${state.phase.paused ? 'Paused · ' : ''}${Math.max(0, Math.ceil((state.phase.deadline! - at) / 1000))}s left`;
  if (el.textContent !== text) el.textContent = text;
}
function render(): void {
  if (!state) return;
  const publicView = game.tvView(state);
  const cv = privateView();
  const paused = !!state.phase.paused, done = state.phase.id === 'done', revealed = state.phase.id === 'reveal';
  const bot = isBotTurn();
  $('round-label').textContent = `Round ${publicView.round} · ${publicView.totalDice} dice at the table`;
  $('status').textContent = done ? publicView.winner ? `${name(publicView.winner)} wins` : 'Game ended' : paused ? 'The table is paused' : revealed ? 'The truth is out' : bot ? `${name(publicView.turn)} ${botPace === 'manual' ? 'is waiting' : 'is thinking'}` : `${name(publicView.turn)}, your move`;
  $('meta').replaceChildren(tag(publicView.wild ? 'Ones are wild' : 'Ones count as ones'), ...(publicView.palifico ? [tag('Palifico round', true), tag(publicView.bid === null ? 'Opening face is free' : canChangePalificoFace(state, state.turn) ? 'This seat may change face' : 'Keep the bid face')] : []), ...(publicView.settings.calzaEnabled ? [tag('Calza enabled')] : []));
  button('pause').hidden = paused || done; button('resume').hidden = !paused || done; button('end-game').hidden = done;
  $('players').replaceChildren(...state.order.map((id, index) => {
    const p = state!.players[id]!, alive = publicView.diceCount[id]! > 0;
    const el = document.createElement('div'); el.className = 'player' + (publicView.turn === id && !done && !revealed ? ' current' : '') + (alive ? '' : ' eliminated');
    const badge = document.createElement('span'); badge.className = 'player-badge'; badge.textContent = String(index + 1);
    const content = document.createElement('div'); content.className = 'player-content';
    const title = document.createElement('p'); title.className = 'player-name'; title.textContent = p.name;
    const detail = document.createElement('p'); detail.className = 'player-note';
    detail.textContent = !alive ? 'Out of the game' : state!.left.includes(id) ? 'Left · auto-playing' : !p.connected ? 'Away · auto-playing' : p.bot ? `${skills.get(id) === 'sharp' ? 'Strong' : skills.get(id) === 'easy' ? 'Easy' : 'Normal'} bot` : id === publicView.turn && !revealed && !done ? 'Your turn' : 'Human';
    content.append(title, detail);
    const number = document.createElement('span'); number.className = 'dice-count'; number.setAttribute('aria-label', `${publicView.diceCount[id]} dice remaining`);
    const icon = die(1); icon.classList.add('count-die'); icon.removeAttribute('role'); icon.removeAttribute('aria-label'); icon.setAttribute('aria-hidden', 'true');
    number.append(icon, document.createTextNode(String(publicView.diceCount[id]))); el.append(badge, content, number); return el;
  }));
  $('bid-display').replaceChildren();
  if (publicView.bid) {
    const quantity = document.createElement('span'); quantity.className = 'bid-quantity'; quantity.textContent = String(publicView.bid.quantity);
    const times = document.createElement('span'); times.className = 'times'; times.textContent = '×';
    $('bid-display').append(quantity, times, die(publicView.bid.face));
    $('bid-display').setAttribute('aria-label', `${publicView.bid.quantity} dice showing ${publicView.bid.face}`);
    $('bid-description').textContent = `${name(publicView.bid.playerId)} says there are at least ${publicView.bid.quantity} ${publicView.bid.face}s${publicView.wild && publicView.bid.face !== 1 ? ', counting wild ones' : ''}.`;
  } else {
    const prompt = document.createElement('p'); prompt.className = 'empty-bid'; prompt.textContent = 'Every bluff starts with a first bid.'; $('bid-display').append(prompt);
    $('bid-display').removeAttribute('aria-label');
    $('bid-description').textContent = publicView.palifico ? 'Choose the face for this palifico round. Ones are not wild.' : 'Look at your dice, then bid on the whole table.';
  }
  $('log').replaceChildren(...publicView.bidLog.slice(-5).reverse().map(b => {
    const row = document.createElement('div'); row.className = 'log-item';
    const who = document.createElement('span'); who.textContent = name(b.playerId);
    const bid = document.createElement('span'); bid.className = 'log-bid'; bid.textContent = `${b.quantity} × ${b.face}`; row.append(who, bid); return row;
  }));
  if (publicView.bidLog.length === 0) { const text = document.createElement('p'); text.className = 'muted'; text.textContent = 'No bids yet. Make the first one.'; $('log').append(text); }
  select('viewer').replaceChildren(...activeHumans().map(id => option(id, name(id))));
  select('viewer').value = viewer ?? ''; select('viewer').disabled = paused || revealed || done;
  const isOpen = !!cv && openFor === viewer && !paused && !revealed && !done;
  const canOpen = !!viewer && !paused && !revealed && !done;
  $('handoff').hidden = !canOpen || isOpen;
  $('private').hidden = !isOpen;
  $('waiting').hidden = canOpen || revealed || done;
  $('private-panel').hidden = revealed || done;
  $('handoff-title').textContent = viewer ? `Pass to ${name(viewer)}` : 'Cups covered';
  $('handoff-copy').textContent = viewer === state.turn ? 'Everyone else: look away. Open your cup when the device is safely yours.' : `Waiting for ${name(state.turn)}. You can inspect your own cup${cv?.canCalza ? ' or call calza' : ''}.`;
  $('waiting-title').textContent = paused ? 'Cups covered' : botPace === 'manual' ? 'The bots are waiting' : 'The bots are thinking';
  $('waiting-copy').textContent = paused ? 'Resume when everyone is ready. All private dice have been removed from the screen.' : botPace === 'manual' ? 'Use Play next bot action when you are ready. Turn clocks keep running.' : 'They use their own dice, public bids, and exact probabilities.';
  $('cup').replaceChildren(...(isOpen ? cv!.ownDice.map(face => die(face)) : []));
  $('private-note').textContent = isOpen ? cv!.odds === null ? `${cv!.ownDice.length} dice in your cup. What story do they tell?` : `Last bid: ${publicView.bid!.quantity} × ${publicView.bid!.face}. Chance it holds, from your cup: ${(cv!.odds.atLeast * 100).toFixed(1)}%.` : '';
  if (isOpen) {
    const quantities = [...new Set(cv!.legalBids.map(b => b.quantity))];
    const before = select('bid-quantity').value;
    select('bid-quantity').replaceChildren(...quantities.map(n => option(String(n), String(n))));
    if (quantities.some(n => String(n) === before)) select('bid-quantity').value = before;
    selectedBid();
    $('bid-controls').hidden = !cv!.canBid; button('make-bid').textContent = publicView.bid ? 'Raise the bid' : 'Make the first bid';
    button('dudo').disabled = !cv!.canDudo; button('calza').disabled = !cv!.canCalza;
    button('calza').hidden = !publicView.settings.calzaEnabled;
    $('action-hint').textContent = cv!.canBid ? publicView.palifico ? 'Palifico: ones are not wild. The available faces follow your table rules.' : 'Only legal raises are listed. Dudo means you think the bid is too high.' : `It is ${name(state.turn)}'s turn.${cv!.canCalza ? ' You may interrupt with an exact calza call.' : ''}`;
  } else {
    // Legal choices and computed odds are private too; remove them on handoff.
    select('bid-quantity').replaceChildren(); select('bid-face').replaceChildren(); $('action-hint').textContent = '';
  }
  $('bot-step').hidden = !(bot || hasBotInterrupt()) || paused || done || revealed;
  $('notice').textContent = '';
  $('play-grid').hidden = done || revealed;
  $('reveal-panel').hidden = !publicView.reveal;
  $('reveal-cups').replaceChildren();
  if (publicView.reveal) {
    const r = publicView.reveal;
    $('verdict-title').textContent = `${name(r.caller)} called ${r.kind === 'dudo' ? 'dudo' : 'calza'} · ${r.correct ? 'correct' : 'incorrect'}`;
    $('verdict-copy').textContent = `${r.matches} matching dice for a bid of ${r.bid.quantity} ${r.bid.face}s. ${r.gained ? `${name(r.caller)} gains one die.` : r.loser ? `${name(r.loser)} loses one die${publicView.diceCount[r.loser] === 0 ? ' and is out' : ''}.` : 'No die was gained.'}`;
    for (const id of state.order) {
      const dice = r.dice[id]; if (!dice?.length) continue;
      const el = document.createElement('div'); el.className = 'revealed-seat';
      const title = document.createElement('p'); title.textContent = name(id);
      const cup = document.createElement('div'); cup.className = 'revealed-dice';
      cup.append(...dice.map(face => die(face, face === r.bid.face || publicView.wild && r.bid.face !== 1 && face === 1)));
      el.append(title, cup); $('reveal-cups').append(el);
    }
    button('next-round').disabled = paused; button('next-round').hidden = done;
  }
  renderResults();
  renderClock();
  const wait = pacing[botPace];
  if (!paused && botDue === null && wait.regular !== null) {
    if (bot) botDue = clockNow() + wait.regular;
  }
  if (!paused && wait.interrupt !== null && state.bid && interruptSampled !== interruptKey() && interruptDue === null && hasBotInterrupt()) {
    interruptDue = clockNow() + wait.interrupt;
  }
}

function botMove(): void {
  if (!state || state.phase.paused || !isBotTurn()) return;
  const id = state.turn;
  const move = game.bot.sampleInput(state, id, botRng, skills.get(id) ?? 'normal');
  if (move) apply({type: 'input', now: clockNow(), playerId: id, input: move});
  else botDue = pacing[botPace].regular === null ? null : clockNow() + pacing[botPace].regular!;
  saveSession();
}
function botInterrupt(): boolean {
  if (!state || state.phase.paused || state.phase.id !== 'bid') return false;
  interruptDue = null; interruptSampled = interruptKey();
  // One opportunity per public bid, before the next bot's regular turn. Rotate
  // the scan order so simultaneous exact calls do not always favour seat one.
  const offset = (state.round + state.bidLog.length) % state.order.length;
  const order = [...state.order.slice(offset), ...state.order.slice(0, offset)];
  for (const id of order) {
    if (id === state.turn || !state.players[id]!.bot || !canCalza(state, id)) continue;
    const move = game.bot.sampleInput(state, id, botRng, skills.get(id) ?? 'normal');
    if (move?.type === 'calza') {
      const before = state; apply({type: 'input', now: clockNow(), playerId: id, input: move}); saveSession(); return state !== before;
    }
  }
  saveSession(); return false;
}
function stepBot(): void {
  if (!state || state.phase.paused || state.phase.id !== 'bid') return;
  if (deliverDueTimer()) return;
  if (!botInterrupt()) botMove();
}
function deliverDueTimer(): boolean {
  if (!state || state.phase.paused || state.phase.id === 'done') return false;
  const at = clockNow();
  const instance = phaseKey(state);
  if (state.phase.deadline !== null && at >= state.phase.deadline && !firedTimers.has(instance)) {
    firedTimers.add(instance);
    apply({type: 'timer', now: at, phaseId: state.phase.id, startedAt: state.phase.startedAt}); saveSession(); return true;
  }
  return false;
}
function tick(): void {
  if (!state || state.phase.id === 'done') return;
  renderClock(); if (state.phase.paused || deliverDueTimer()) return;
  const at = clockNow();
  if (interruptDue !== null && at >= interruptDue) { botInterrupt(); return; }
  if (botDue !== null && at >= botDue) botMove();
}

button('start').onclick = () => start();
button('show-cup').onclick = () => {
  if (viewer && state && !state.phase.paused) {
    openFor = viewer; render();
    if (!$('bid-controls').hidden) select('bid-quantity').focus();
    else button('hide-cup').focus();
  }
};
button('hide-cup').onclick = () => { cover(); render(); };
button('make-bid').onclick = () => send({type: 'bid', quantity: Number(select('bid-quantity').value), face: Number(select('bid-face').value)});
button('dudo').onclick = () => send({type: 'dudo'});
button('calza').onclick = () => send({type: 'calza'});
button('next-round').onclick = () => {
  if (!state) return;
  const present = (id: string): boolean => state!.players[id]!.connected && !state!.left.includes(id);
  const id = viewer ?? state.order.find(id => present(id) && !state!.players[id]!.bot) ?? state.order.find(present);
  if (id) {
    // Reveals remain on screen until the person holding this device advances.
    // Eliminated humans can acknowledge; an all-bot table uses its real adapter.
    const move = state.players[id]!.bot ? game.bot.sampleInput(state, id, botRng, skills.get(id) ?? 'normal') : {type: 'continue'} as const;
    if (move?.type === 'continue') apply({type: 'input', now: clockNow(), playerId: id, input: move});
  }
};
button('pause').onclick = () => apply({type: 'vip', action: 'pause', now: clockNow()});
button('resume').onclick = () => apply({type: 'vip', action: 'resume', now: clockNow()});
button('end-game').onclick = () => apply({type: 'vip', action: 'end', now: clockNow()});
button('bot-step').onclick = stepBot;
function newGame(): void {
  clearPrivateDraft(); state = null; pendingSession = null; viewer = null; botDue = null; interruptDue = null; interruptSampled = null;
  clearResults();
  cachedState = null; cachedViewer = null; cachedController = null;
  bidsByQuantity.clear();
  firedTimers.clear();
  $('reveal-cups').replaceChildren(); $('players').replaceChildren(); $('log').replaceChildren();
  $('table').hidden = true; $('recovery').hidden = true; $('setup').hidden = false;
  if (removeSaved()) storageMessage('');
}
button('new-game').onclick = newGame; button('play-again').onclick = newGame;
function resumeSaved(): void {
  if (!pendingSession) return;
  const saved = pendingSession;
  try { state = restoreSessionState(saved, clockNow()); }
  catch {
    clockOffset = 0; lastClock = 0; newGame();
    if ($('storage-note').hidden) storageMessage('The saved game could not be opened. Start a new table when you are ready.');
    return;
  }
  pendingSession = null;
  botRng = createResumableRng(saved.botRng); skills.clear();
  for (const [id, skill] of saved.skills) skills.set(id, skill);
  botPace = saved.pace; paceSetup.value = botPace; select('bot-pace').value = botPace;
  firedTimers.clear(); if (saved.currentTimerConsumed) firedTimers.add(phaseKey(state));
  interruptSampled = saved.sampledCurrentBid ? interruptKey() : null;
  viewer = null; clearPrivateDraft(); chooseViewer(); botDue = null; interruptDue = null;
  $('recovery').hidden = true; $('setup').hidden = true; $('table').hidden = false;
  render(); saveSession();
}
button('resume-saved').onclick = resumeSaved;
button('discard-saved').onclick = newGame;
window.addEventListener('pagehide', saveSession);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') saveSession(); });
setInterval(tick, 100);
// Browser-only verification controls, intentionally inspectable on this trusted
// local host. They are never part of the game's public/controller contract.
const hook = {
  state: () => state ? structuredClone(state) : null,
  view: () => state ? structuredClone(game.tvView(state)) : null,
  controller: () => structuredClone(privateView()),
  init: start,
  act: send,
  event: apply,
  setState: (value: State) => { pendingSession = null; $('recovery').hidden = true; state = structuredClone(value); clearPrivateDraft(); chooseViewer(); botDue = null; interruptDue = null; interruptSampled = null; firedTimers.clear(); $('setup').hidden = true; $('table').hidden = false; render(); saveSession(); },
  time: clockNow,
  pace: () => botPace,
  save: saveSession,
  host: () => ({pending: !!pendingSession, botRng: {...botRng.state()}, skills: [...skills], pace: botPace,
    currentTimerConsumed: !!state && firedTimers.has(phaseKey(state)),
    sampledCurrentBid: !!state && interruptKey() !== null && interruptSampled === interruptKey()}),
  tick,
};
Object.defineProperty(window, '__G07', {value: Object.freeze(hook), writable: false});
try {
  const raw = sessionStorage.getItem(SAVE_KEY);
  if (raw) {
    const saved = decodeSession(raw);
    if (saved) {
      pendingSession = saved; state = null; viewer = null; clearPrivateDraft();
      clockOffset = saved.savedHostNow - Math.floor(performance.now()); lastClock = saved.savedHostNow;
      $('setup').hidden = true; $('table').hidden = true; $('recovery').hidden = false;
      $('recovery-copy').textContent = saved.state.phase.id === 'done'
        ? 'Your finished game is ready to view. Cups stay covered.'
        : saved.state.phase.paused
          ? 'Your table is waiting. It was paused and will stay paused when you return. Cups stay covered.'
          : 'Your table is waiting. Its turn clock waits until you return, and cups stay covered.';
    } else {
      const cleared = removeSaved();
      if (cleared) storageMessage('The saved game could not be opened. Start a new table when you are ready.');
    }
  }
} catch { storageMessage('This tab cannot keep a game for a reload. Keep this page open to continue playing.'); }
