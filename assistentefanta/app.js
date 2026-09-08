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
    '<div class="scars">scarsità ' + p.ruolo + ': ' + sc.titolari + ' titolari / ' + sc.squadre + ' squadre' + (sc.alta ? ' · ALTA' : '') + '</div>' +
    '<button id="btnSold" type="button">VENDUTO</button>';
}
let SALE = { open: false, prezzo: 1 };
function renderSaleFlow() {
  if (!SALE.open || !currentPlayer()) { $('saleflow').innerHTML = ''; return; }
  const teams = STATE.squadre.map(t =>
    '<button class="teamBtn' + (t.isMe ? ' me' : '') + '" data-team="' + t.id + '">' + t.nome + ' (' + Store.teamBudget(STATE, t.id) + ')</button>'
  ).join('');
  $('saleflow').innerHTML =
    '<div class="price">Prezzo: <strong id="pz">' + SALE.prezzo + '</strong> ' +
    '<button data-add="1">+1</button><button data-add="5">+5</button><button data-add="10">+10</button>' +
    '<button data-add="-1">-1</button><button data-set="1">reset</button></div>' +
    '<div class="teams">' + teams + '</div>' +
    '<div class="err" id="saleErr"></div>';
}
function openSale() { SALE = { open: true, prezzo: 1 }; renderSaleFlow(); }
function advanceAfterSale() {
  const sold = Store.soldIds(STATE);
  const next = Store.firstUnsoldIndex(QUEUE, sold, STATE.cursore.index);
  STATE.cursore.index = next >= 0 ? next : STATE.cursore.index;
}
function confirmSale(squadraId) {
  const p = currentPlayer();
  const sale = { giocatoreId: p.id, squadraId, prezzo: SALE.prezzo };
  const v = Store.validateSale(STATE, PLAYERS_EFF, sale);
  if (!v.ok) { const el = $('saleErr'); if (el) el.textContent = 'Errore: ' + v.reason; return; }
  STATE = Store.applySale(STATE, sale);
  SALE.open = false;
  advanceAfterSale();
  render();
}
function doUndo() { STATE = Store.undoSale(STATE); render(); }
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
function playersOfTeam(teamId) {
  return STATE.vendite.filter(v => v.squadraId === teamId).map(v => {
    const p = Store.playerById(PLAYERS_EFF, v.giocatoreId);
    return { nome: p ? p.nome : v.giocatoreId, ruolo: p ? p.ruolo : '?', prezzo: v.prezzo };
  });
}
function renderRoster() {
  const me = Store.myId(STATE);
  const rem = Store.teamSlotsRemaining(STATE, PLAYERS_EFF, me);
  const rows = ['P', 'D', 'C', 'A'].map(r => {
    const list = playersOfTeam(me).filter(x => x.ruolo === r).map(x => x.nome + ' (' + x.prezzo + ')').join(', ');
    return '<div class="rrow"><b>' + r + '</b> ' + (STATE.config.slots[r] - rem[r]) + '/' + STATE.config.slots[r] + ' — ' + (list || '<span class=muted>vuoto</span>') + '</div>';
  }).join('');
  $('roster').innerHTML = '<h3>La mia rosa</h3>' + rows + '<div class="rbudget">Budget: <b>' + Store.teamBudget(STATE, me) + '</b></div>';
}
function renderRivals() {
  const p = currentPlayer();
  const ruolo = p ? p.ruolo : null;
  const rows = STATE.squadre.filter(t => !t.isMe).map(t => {
    const rem = Store.teamSlotsRemaining(STATE, PLAYERS_EFF, t.id);
    const compete = ruolo && rem[ruolo] > 0;
    return '<div class="rivrow' + (compete ? ' compete' : '') + '"><b>' + t.nome + '</b> ' +
      Store.teamBudget(STATE, t.id) + 'cr · ' + ['P', 'D', 'C', 'A'].map(r => r + rem[r]).join(' ') + '</div>';
  }).join('');
  $('rivals').innerHTML = '<h3>Rivali</h3>' + rows;
}
function render() { rebuildQueue(); renderHeader(); renderCard(); renderSaleFlow(); renderQueue(); renderRoster(); renderRivals(); }

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
  $('btnUndo').onclick = doUndo;
  $('card').addEventListener('dblclick', openSale); // doppio click sulla card apre la vendita
  $('advice').addEventListener('click', (e) => { if (e.target.id === 'btnSold') openSale(); });
  $('saleflow').addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.add) { SALE.prezzo = Math.max(1, SALE.prezzo + parseInt(t.dataset.add, 10)); renderSaleFlow(); }
    else if (t.dataset.set) { SALE.prezzo = parseInt(t.dataset.set, 10); renderSaleFlow(); }
    else if (t.dataset.team) { confirmSale(t.dataset.team); }
  });
}
function boot() { STATE = Store.initState(); rebuildQueue(); render(); wireEvents(); }
document.addEventListener('DOMContentLoaded', boot);
