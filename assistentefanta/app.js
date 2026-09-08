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
    '<button id="btnSold" type="button">VENDUTO</button>' +
    '<button id="btnOverride" type="button">✎ nota</button>';
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
function renderConfig() {
  const c = STATE.config;
  const splitRows = ['P', 'D', 'C', 'A'].map(r =>
    r + ' <input class="cfg" data-grp="split" data-key="' + r + '" type="number" step="0.01" value="' + c.split[r] + '">').join(' ');
  const tierRows = [1, 2, 3, 4, 5].map(t =>
    't' + t + ' <input class="cfg" data-grp="tierMult" data-key="' + t + '" type="number" step="0.1" value="' + c.tierMult[t] + '">').join(' ');
  const boost = ['P', 'D'].map(r =>
    r + ' <input class="cfg" data-grp="modDifesaBoost" data-key="' + r + '" type="number" step="0.05" value="' + c.modDifesaBoost[r] + '">').join(' ');
  $('configPanel').innerHTML =
    '<h3>Config</h3><div>Split budget: ' + splitRows + '</div><div>Tier mult: ' + tierRows + '</div><div>Mod difesa: ' + boost + '</div>' +
    '<button id="cfgClose" type="button">Chiudi</button>';
}
function toggleConfig() {
  const el = $('configPanel');
  el.hidden = !el.hidden;
  if (!el.hidden) renderConfig();
}
function render() { rebuildQueue(); renderHeader(); renderCard(); renderSaleFlow(); renderQueue(); renderRoster(); renderRivals(); saveState(); }

const LS_KEY = 'assistentefanta:v1';
function saveState() { try { localStorage.setItem(LS_KEY, JSON.stringify(STATE)); } catch (e) {} }
function loadState() { try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function exportState() {
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'asta-backup.json'; a.click();
  URL.revokeObjectURL(url);
}
function importState(file) {
  const reader = new FileReader();
  reader.onload = () => { try { STATE = JSON.parse(reader.result); render(); } catch (e) { alert('File non valido'); } };
  reader.readAsText(file);
}
function resetState() {
  if (confirm('Azzerare tutta l\'asta? Operazione non annullabile.')) { STATE = Store.initState(); render(); }
}

function go(delta) {
  const n = STATE.cursore.index + delta;
  if (n >= 0 && n < QUEUE.length) { STATE.cursore.index = n; render(); }
}
function jumpTo(id) {
  const i = QUEUE.findIndex(p => p.id === id);
  if (i >= 0) { STATE.cursore.index = i; render(); }
}
function onSearch(q) {
  q = (q || '').trim().toLowerCase();
  if (!q) return;
  const hit = QUEUE.find(p => p.nome.toLowerCase().includes(q) || p.squadra.toLowerCase().includes(q));
  if (hit) jumpTo(hit.id);
}
function applyOverride(id, patch) {
  STATE.overrides = Object.assign({}, STATE.overrides, { [id]: Object.assign({}, STATE.overrides[id], patch) });
  render();
}
function openOverride() {
  const p = currentPlayer(); if (!p) return;
  const t = prompt('Titolarità (titolare/ballottaggio/riserva/incerto):', p.titolarita);
  if (t === null) return;
  const nota = prompt('Nota:', p.nota || '');
  applyOverride(p.id, { titolarita: t.trim() || p.titolarita, nota: nota || '' });
}
function wireEvents() {
  $('btnPrev').onclick = () => go(-1);
  $('btnNext').onclick = () => go(1);
  $('queue').onclick = (e) => { const li = e.target.closest('li'); if (li) jumpTo(li.dataset.id); };
  $('btnUndo').onclick = doUndo;
  $('card').addEventListener('dblclick', openSale); // doppio click sulla card apre la vendita
  $('advice').addEventListener('click', (e) => { if (e.target.id === 'btnSold') openSale(); else if (e.target.id === 'btnOverride') openOverride(); });
  $('saleflow').addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.add) { SALE.prezzo = Math.max(1, SALE.prezzo + parseInt(t.dataset.add, 10)); renderSaleFlow(); }
    else if (t.dataset.set) { SALE.prezzo = parseInt(t.dataset.set, 10); renderSaleFlow(); }
    else if (t.dataset.team) { confirmSale(t.dataset.team); }
  });
  $('btnExport').onclick = exportState;
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = (e) => { if (e.target.files[0]) importState(e.target.files[0]); };
  $('btnReset').onclick = resetState;
  $('btnConfig').onclick = toggleConfig;
  $('configPanel').addEventListener('click', (e) => { if (e.target.id === 'cfgClose') toggleConfig(); });
  $('configPanel').addEventListener('change', (e) => {
    const t = e.target; if (!t.classList.contains('cfg')) return;
    const val = parseFloat(t.value); if (isNaN(val)) return;
    STATE.config[t.dataset.grp][t.dataset.key] = val;
    render();
  });
  $('search').addEventListener('input', (e) => onSearch(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'v') openSale();
    else if (e.key === 'm' && SALE.open) confirmSale(Store.myId(STATE));
    else if (e.key === 'z') doUndo();
    else if (e.key === '/') { e.preventDefault(); $('search').focus(); }
  });
}
function boot() { STATE = loadState() || Store.initState(); rebuildQueue(); render(); wireEvents(); }
document.addEventListener('DOMContentLoaded', boot);
