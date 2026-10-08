import { game } from './core.js';
import { createRng } from '../../../contract/rng.js';
import { evaluateLayout, orient, placementCells } from './geometry.js';
import type { HoldState, Placement } from './types.js';
import type { BotSkill } from '../../../contract/constants.js';

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;
const colors = ['#cf6742', '#276ca1', '#9c6330', '#56855c', '#86629b', '#b36e32', '#367d82', '#ae5272', '#67699f', '#608634', '#8c7161', '#518590'];
let state: HoldState | null = null;
let selected: string | null = null; let rotation = 0; let x = 0; let y = 0; let dragging = false;
let handoff = false; let lastClock = ''; let revealPlayer = ''; let showSolution = false;
let boardKey = '';
const skills = new Map<string, BotSkill>();
const escapeHtml = (text: string): string => text.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
const selectedPlacement = (): Placement | null => selected ? { crateId: selected, x, y, rotation } : null;

function setupSeats(): void {
  const count = Number($<HTMLSelectElement>('player-count').value);
  $('seats').innerHTML = Array.from({ length: count }, (_, i) => `<div class="seat-setting"><label for="name-${i}">Seat ${i + 1}</label><input id="name-${i}" maxlength="24" value="Player ${i + 1}" aria-label="Seat ${i + 1} name"><select id="skill-${i}" aria-label="Seat ${i + 1} type"><option value="human">Human</option><option value="easy">Easy bot · 60%</option><option value="normal" ${i === 1 ? 'selected' : ''}>Medium bot · 80%</option><option value="sharp">Strong bot · 95%</option></select></div>`).join('');
}
function startGame(): void {
  skills.clear(); const count = Number($<HTMLSelectElement>('player-count').value);
  const players = Array.from({ length: count }, (_, i) => {
    const id = `p${i}`; const skill = $<HTMLSelectElement>(`skill-${i}`).value;
    if (skill !== 'human') skills.set(id, skill as BotSkill);
    return { id, name: $<HTMLInputElement>(`name-${i}`).value.trim() || `Player ${i + 1}`, avatarId: String(i), connected: true, bot: skill !== 'human' };
  });
  state = game.init({ players, settings: {
    rounds: Number($<HTMLSelectElement>('rounds').value), difficulty: Number($<HTMLInputElement>('difficulty').value),
    turnSeconds: Number($<HTMLSelectElement>('seconds').value), allowFlip: $<HTMLInputElement>('flip-setting').checked,
  }, seed: Number($<HTMLInputElement>('seed').value) >>> 0, now: Date.now() });
  $('setup').hidden = true; $('game').hidden = false; selected = null; showSolution = false; revealPlayer = ''; boardKey = '';
  enterSeat(); render();
}
function enterSeat(): void {
  if (!state || state.phase.id !== 'pack') { handoff = false; return; }
  const id = state.order[state.seat] as string;
  handoff = !skills.has(id);
  if (handoff) state = game.reduce(state, { type: 'vip', action: 'pause', now: Date.now() });
}
function dispatch(input: Parameters<typeof game.reduce>[1]): void {
  if (!state) return;
  const previous = state; state = game.reduce(state, input);
  if (state === previous) return;
  if (state.round !== previous.round || state.seat !== previous.seat || state.phase.id !== previous.phase.id) {
    selected = null; rotation = 0; dragging = false; showSolution = false; revealPlayer = state.order[0] as string; enterSeat();
  }
  render();
}
function own(): Placement[] {
  return state ? game.controllerView(state, state.order[state.seat] as string).ownLayout : [];
}
function canEdit(): boolean { return Boolean(state && state.phase.id === 'pack' && !state.phase.paused && !skills.has(state.order[state.seat] as string)); }
function colorFor(id: string): string { return colors[Number(id.split('-')[1]) - 1] ?? '#cf6742'; }
function svgShape(cells: readonly (readonly [number, number])[], color: string): string {
  const w = 1 + Math.max(...cells.map(c => c[0])); const h = 1 + Math.max(...cells.map(c => c[1]));
  return `<svg viewBox="-0.06 -0.06 ${w + 0.12} ${h + 0.12}" aria-hidden="true" class="crate-preview">${cells.map(([a, b]) => `<rect x="${a + 0.035}" y="${b + 0.035}" width=".93" height=".93" rx=".12" fill="${color}"/>`).join('')}</svg>`;
}
function renderBoard(): void {
  if (!state) return;
  const s = state; const preview = selectedPlacement(); const crate = s.level.crates.find(c => c.id === selected);
  const layouts = s.phase.id === 'pack' ? own() : showSolution ? game.tvView(s).solution : game.tvView(s).revealed[revealPlayer] ?? [];
  const candidate = preview ? evaluateLayout(s.level, [...layouts.filter(p => p.crateId !== selected), preview]) : null;
  const placed = layouts.filter(p => !(canEdit() && p.crateId === selected));
  const tiles = s.level.cells.map(([a, b]) => `<rect x="${a}" y="${b}" width="1" height="1" rx=".055" fill="#e8edf0" stroke="#cad5dc" stroke-width=".025"/>`).join('');
  const cargo = placed.map(p => {
    const c = s.level.crates.find(c => c.id === p.crateId)!;
    return placementCells(c, p).map(([a, b], i) => `<g data-crate="${c.id}"><rect x="${a + 0.045}" y="${b + 0.045}" width=".91" height=".91" rx=".12" fill="${colorFor(c.id)}"/>${i === 0 ? `<text x="${a + 0.5}" y="${b + 0.63}" text-anchor="middle" fill="white" font-size=".32" font-weight="700">${c.value}</text>` : ''}</g>`).join('');
  }).join('');
  const ghost = canEdit() && crate && preview ? placementCells(crate, preview).map(([a, b]) => `<rect x="${a + 0.045}" y="${b + 0.045}" width=".91" height=".91" rx=".12" fill="${candidate?.valid ? '#249574' : '#bd4551'}" opacity=".65" stroke="${candidate?.valid ? '#116451' : '#86212b'}" stroke-width=".045" stroke-dasharray=".12 .08"/>`).join('') : '';
  const key = `${s.round}/${s.seat}/${s.phase.id}/${showSolution}/${revealPlayer}/${JSON.stringify(placed)}`;
  if (key !== boardKey || !document.getElementById('placement-ghost')) {
    $('board').innerHTML = `<svg id="hold-svg" viewBox="-.25 -.25 ${s.level.width + 0.5} ${s.level.height + 0.5}" role="img" aria-label="Ship hold: ${s.level.cells.length} cells. ${layouts.length} packed crates.">${tiles}${cargo}<g id="placement-ghost">${ghost}</g></svg>`;
    boardKey = key;
  } else $('placement-ghost').innerHTML = ghost;
  $('place').textContent = candidate?.valid ? 'Place crate' : selected ? 'Does not fit here' : 'Select a crate';
  $<HTMLButtonElement>('place').disabled = !canEdit() || !candidate?.valid;
}
function render(): void {
  if (!state) return; const s = state; const tv = game.tvView(s); const id = s.order[s.seat] as string;
  const focusedCrate = (document.activeElement as HTMLElement | null)?.dataset?.select;
  $('round-label').textContent = `Round ${s.round} of ${s.settings.rounds} · difficulty ${s.settings.difficulty}`;
  $('turn-label').textContent = s.phase.id === 'pack' ? `${s.players[id]!.name}'s hold` : s.phase.id === 'reveal' ? 'Cargo inspection' : 'Voyage complete';
  $('scores').innerHTML = tv.players.map(p => `<span class="score-chip ${p.id === id && s.phase.id === 'pack' ? 'active' : ''}"><span>${escapeHtml(p.name)}</span><b>${p.score?.toFixed(2) ?? '0.00'}</b></span>`).join('');
  $('pack-controls').hidden = s.phase.id !== 'pack'; $('reveal-controls').hidden = s.phase.id === 'pack';
  $('handoff').hidden = !handoff;
  $('handoff-name').textContent = s.players[id]!.name;
  $('start-turn').textContent = `Start my ${s.settings.turnSeconds}-second turn`;
  const layouts = own(); const value = evaluateLayout(s.level, layouts).value;
  $('value').textContent = s.phase.id === 'pack' ? `${value} cargo value` : `Optimum ${tv.optimum} · each round scores value ÷ optimum`;
  $('tray').innerHTML = s.level.crates.map(c => `<button type="button" class="crate ${selected === c.id ? 'selected' : ''} ${layouts.some(p => p.crateId === c.id) ? 'packed' : ''}" data-select="${c.id}" aria-pressed="${selected === c.id}" aria-label="Crate ${c.id.split('-')[1]}, value ${c.value}, ${c.cells.length} cells${layouts.some(p => p.crateId === c.id) ? ', packed' : ''}" ${canEdit() ? '' : 'disabled'}>${svgShape(orient(c.cells, selected === c.id ? rotation : 0), colorFor(c.id))}<span class="crate-value">${c.value}</span><span class="crate-status">${layouts.some(p => p.crateId === c.id) ? 'Packed' : `${c.cells.length} cells`}</span></button>`).join('');
  for (const name of ['rotate', 'remove', 'clear', 'submit']) $<HTMLButtonElement>(name).disabled = !canEdit() || (name !== 'clear' && name !== 'submit' && !selected);
  $('flip').hidden = !s.level.allowFlip; $<HTMLButtonElement>('flip').disabled = !canEdit() || !selected;
  $('reveal-player').innerHTML = s.order.map(player => `<option value="${player}" ${player === revealPlayer ? 'selected' : ''}>${escapeHtml(s.players[player]!.name)} · ${Math.round((tv.roundScores[player]?.ratio ?? 0) * 100)}%</option>`).join('');
  $('solution').textContent = showSolution ? 'Show player cargo' : 'Show optimum';
  $('next').textContent = s.phase.id === 'done' ? 'Play again' : s.round === s.settings.rounds ? 'Final results' : 'Next round';
  const results = game.results(s);
  $('result').hidden = !results;
  if (results) $('result').textContent = `${results.winnerIds.map(w => s.players[w]!.name).join(' & ')} ${results.winnerIds.length === 1 ? 'wins' : 'tie'}! ${results.ranking.map(row => `${s.players[row.playerId]!.name}: ${row.score.toFixed(2)}`).join(' · ')}`;
  renderBoard(); updateClock();
  if (focusedCrate && !handoff) document.querySelector<HTMLButtonElement>(`[data-select="${CSS.escape(focusedCrate)}"]`)?.focus({ preventScroll: true });
}
function announceSelection(): void {
  if (!state || !selected) { $('message').textContent = 'Crate deselected.'; return; }
  const p = selectedPlacement() as Placement;
  const fits = evaluateLayout(state.level, [...own().filter(a => a.crateId !== selected), p]).valid;
  $('message').textContent = `Crate ${selected.split('-')[1]}: row ${y + 1}, column ${x + 1}, ${rotation % 4 * 90} degrees${rotation >= 4 ? ', mirrored' : ''}. ${fits ? 'Fits here.' : 'Does not fit here.'}`;
}
function selectCrate(id: string): void {
  if (!canEdit() || !state) return;
  if (selected === id) { render(); return; }
  selected = id; const previous = own().find(p => p.crateId === id); rotation = previous?.rotation ?? 0; x = previous?.x ?? 0; y = previous?.y ?? 0;
  render(); announceSelection();
}
function movePointer(event: PointerEvent): void {
  const svg = document.getElementById('hold-svg') as unknown as SVGSVGElement | null;
  if (!svg || !state) return;
  const matrix = svg.getScreenCTM(); if (!matrix) return;
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
  const nextX = Math.floor(point.x); const nextY = Math.floor(point.y);
  if (nextX !== x || nextY !== y) { x = nextX; y = nextY; renderBoard(); }
}
function place(): void {
  const p = selectedPlacement(); if (!p || !state || !canEdit()) return;
  if (!evaluateLayout(state.level, [...own().filter(a => a.crateId !== selected), p]).valid) { $('message').textContent = 'Keep every cell inside the hold, with no overlaps.'; return; }
  dispatch({ type: 'input', playerId: state.order[state.seat] as string, input: { type: 'place', placement: p }, now: Date.now() });
  selected = null; $('message').textContent = 'Crate packed.'; render();
}
function updateClock(): void {
  if (!state) return;
  const clockNow = state.phase.paused?.at ?? Date.now();
  const text = state.phase.deadline === null ? 'Finished' : `${Math.max(0, Math.ceil((state.phase.deadline - clockNow) / 1000))}s${state.phase.paused ? ' · paused' : ''}`;
  if (text !== lastClock) { $('clock').textContent = text; lastClock = text; }
  $('clock').classList.toggle('urgent', state.phase.id === 'pack' && !state.phase.paused && state.phase.deadline !== null && state.phase.deadline - clockNow <= 5000);
}
function tick(): void {
  if (state) {
    updateClock(); const now = Date.now();
    if (!state.phase.paused && state.phase.deadline !== null && now >= state.phase.deadline) dispatch({ type: 'timer', phaseId: state.phase.id, startedAt: state.phase.startedAt, now });
    if (state.phase.id === 'pack' && !state.phase.paused) {
      const id = state.order[state.seat] as string; const skill = skills.get(id);
      if (skill) {
        const value = game.bot.sampleInput(state, id, createRng(state.rng.seed ^ state.round ^ state.seat), skill);
        if (value) dispatch({ type: 'input', playerId: id, input: value, now });
      }
    }
  }
  requestAnimationFrame(tick);
}
$('player-count').addEventListener('change', setupSeats);
$('difficulty').addEventListener('input', () => { $('difficulty-label').textContent = $<HTMLInputElement>('difficulty').value; });
$('start').addEventListener('click', startGame);
$('start-turn').addEventListener('click', () => { if (state) { handoff = false; dispatch({ type: 'vip', action: 'resume', now: Date.now() }); render(); } });
$('tray').addEventListener('pointerdown', event => {
  const target = (event.target as Element).closest<HTMLElement>('[data-select]');
  if (!target || !canEdit()) return; selectCrate(target.dataset.select as string); dragging = true; $('tray').setPointerCapture(event.pointerId); event.preventDefault();
});
$('tray').addEventListener('click', event => { const target = (event.target as Element).closest<HTMLElement>('[data-select]'); if (target && !dragging) selectCrate(target.dataset.select as string); });
$('board').addEventListener('pointerdown', event => {
  if (!canEdit()) return;
  const target = (event.target as Element).closest<SVGElement>('[data-crate]');
  if (target) selectCrate(target.dataset.crate as string);
  if (selected) { dragging = true; $('board').setPointerCapture(event.pointerId); movePointer(event); event.preventDefault(); }
});
document.addEventListener('pointermove', event => { if (dragging) movePointer(event); });
document.addEventListener('pointerup', event => {
  if (!dragging) return; dragging = false;
  const rect = $('board').getBoundingClientRect();
  if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) { movePointer(event); place(); }
});
document.addEventListener('pointercancel', () => { dragging = false; });
$('rotate').addEventListener('click', () => { rotation = Math.floor(rotation / 4) * 4 + (rotation + 1) % 4; render(); announceSelection(); });
$('flip').addEventListener('click', () => { rotation = (rotation + 4) % 8; render(); announceSelection(); });
$('place').addEventListener('click', place);
$('remove').addEventListener('click', () => { if (state && selected) { dispatch({ type: 'input', playerId: state.order[state.seat] as string, input: { type: 'remove', crateId: selected }, now: Date.now() }); selected = null; render(); } });
$('clear').addEventListener('click', () => { if (state) dispatch({ type: 'input', playerId: state.order[state.seat] as string, input: { type: 'clear' }, now: Date.now() }); });
$('submit').addEventListener('click', () => { if (state) dispatch({ type: 'input', playerId: state.order[state.seat] as string, input: { type: 'submit', placements: own() }, now: Date.now() }); });
$('reveal-player').addEventListener('change', () => { revealPlayer = $<HTMLSelectElement>('reveal-player').value; showSolution = false; renderBoard(); });
$('solution').addEventListener('click', () => { showSolution = !showSolution; render(); });
$('next').addEventListener('click', () => {
  if (!state) return;
  if (state.phase.id === 'done') { state = null; $('setup').hidden = false; $('game').hidden = true; return; }
  dispatch({ type: 'input', playerId: state.order[0] as string, input: { type: 'next' }, now: Date.now() });
});
$('pause').addEventListener('click', () => { if (state && !handoff) dispatch({ type: 'vip', action: state.phase.paused ? 'resume' : 'pause', now: Date.now() }); });
document.addEventListener('keydown', event => {
  if (!canEdit() || !selected || (event.target instanceof Element && event.target.matches('input,select'))) return;
  let fullRender = false;
  if (event.key === 'ArrowLeft') x--; else if (event.key === 'ArrowRight') x++; else if (event.key === 'ArrowUp') y--; else if (event.key === 'ArrowDown') y++;
  else if (event.key.toLowerCase() === 'r') { rotation = Math.floor(rotation / 4) * 4 + (rotation + 1) % 4; fullRender = true; }
  else if (event.key.toLowerCase() === 'f' && state?.level.allowFlip) { rotation = (rotation + 4) % 8; fullRender = true; }
  else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); place(); return; }
  else if (event.key === 'Escape') { selected = null; fullRender = true; } else return;
  event.preventDefault(); if (fullRender) render(); else renderBoard(); announceSelection();
});
setupSeats(); requestAnimationFrame(tick);
