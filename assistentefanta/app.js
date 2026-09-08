'use strict';
let STATE, QUEUE, PLAYERS_EFF;
const $ = (id) => document.getElementById(id);

function rebuildQueue() {
  PLAYERS_EFF = Store.applyOverrides(PLAYERS.giocatori, STATE.overrides);
  QUEUE = Store.buildQueue(PLAYERS_EFF);
}
function currentPlayer() { return QUEUE[STATE.cursore.index] || null; }

function badgeTitolarita(t) {
  const map = { titolare: '🟢 titolare', ballottaggio: '🟡 ballottaggio', riserva: '🔴 riserva', incerto: '⚪ incerto' };
  return map[t] || t;
}
function verdettoLabel(v) {
  return { PRIORITA: '⭐ PRIORITÀ', SERVE: '✅ SERVE', NON_SERVE: '⛔ NON SERVE' }[v] || v;
}

function renderCard() {
  const p = currentPlayer();
  if (!p) { $('card').innerHTML = '<em>Coda finita.</em>'; $('advice').innerHTML = ''; return; }
  const a = Advisor.advice(STATE, PLAYERS_EFF, p);
  const sc = a.scarsita;
  $('card').innerHTML =
    '<h2>' + p.nome + ' <small>' + p.squadra + '</small></h2>' +
    '<div>' + p.ruolo + ' · tier ' + p.tier + ' · ' + badgeTitolarita(p.titolarita) + ' · quota ' + p.quota + '</div>' +
    (p.nota ? '<div class="nota">' + p.nota + '</div>' : '');
  $('advice').innerHTML =
    '<div class="verdetto v-' + a.verdetto + '">' + verdettoLabel(a.verdetto) + '</div>' +
    '<div class="max">max consigliato: <strong>' + a.max + '</strong></div>' +
    '<div class="scars">scarsità ' + p.ruolo + ': ' + sc.titolari + ' titolari / ' + sc.squadre + ' squadre' + (sc.alta ? ' · ALTA' : '') + '</div>';
}
function renderHeader() {
  const p = currentPlayer();
  const me = Store.myId(STATE);
  const ruolo = p ? p.ruolo : '—';
  const slotRes = p ? Advisor.mySlotsRemaining(STATE, PLAYERS_EFF, ruolo) : 0;
  const resBudget = p ? Math.max(0, Advisor.roleRemainingBudget(STATE, PLAYERS_EFF, ruolo)) : 0;
  $('phase').textContent = 'Ruolo in asta: ' + ruolo;
  $('mybudget').textContent = 'Budget: ' + Store.teamBudget(STATE, me);
  $('perslot').textContent = slotRes > 0 ? ('cr/slot ' + ruolo + ': ' + Math.round(resBudget / slotRes)) : '';
}
function renderQueue() {
  const sold = Store.soldIds(STATE);
  const html = QUEUE.map((p, i) => {
    const cls = (i === STATE.cursore.index ? 'cur' : '') + (sold.has(p.id) ? ' sold' : '');
    return '<li class="' + cls + '" data-id="' + p.id + '">' + p.ruolo + ' ' + p.nome + ' <small>' + p.squadra + '</small></li>';
  }).join('');
  $('queue').innerHTML = '<ul id="qlist">' + html + '</ul>';
  const cur = $('qlist').querySelector('.cur');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}
function render() { rebuildQueue(); renderHeader(); renderCard(); renderQueue(); }

function go(delta) {
  const n = STATE.cursore.index + delta;
  if (n >= 0 && n < QUEUE.length) { STATE.cursore.index = n; render(); }
}
function jumpTo(id) {
  const i = QUEUE.findIndex(p => p.id === id);
  if (i >= 0) { STATE.cursore.index = i; render(); }
}
function wireEvents() {
  $('btnPrev').onclick = () => go(-1);
  $('btnNext').onclick = () => go(1);
  $('queue').onclick = (e) => { const li = e.target.closest('li'); if (li) jumpTo(li.dataset.id); };
}
function boot() { STATE = Store.initState(); rebuildQueue(); render(); wireEvents(); }
document.addEventListener('DOMContentLoaded', boot);
