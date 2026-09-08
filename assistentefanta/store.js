window.Store = (function () {
  const DEFAULT_CONFIG = {
    budget: 500,
    slots: { P: 3, D: 8, C: 8, A: 6 },
    split: { P: 0.08, D: 0.32, C: 0.28, A: 0.32 },
    tierMult: { 1: 2.5, 2: 1.8, 3: 1.1, 4: 0.6, 5: 0.02 },
    modDifesaBoost: { P: 1.15, D: 1.15 }
  };
  const ROLES = ['P', 'D', 'C', 'A'];

  function initState(config, teamNames) {
    const cfg = config || DEFAULT_CONFIG;
    const squadre = [];
    for (let i = 0; i < 14; i++) {
      squadre.push({ id: 't' + i, nome: i === 0 ? 'IO' : ((teamNames && teamNames[i]) || ('Sq ' + i)), isMe: i === 0 });
    }
    return { config: cfg, squadre, vendite: [], cursore: { index: 0 }, overrides: {} };
  }
  function myId(state) { const t = state.squadre.find(s => s.isMe); return t ? t.id : 't0'; }
  function playerById(players, id) { return players.find(p => p.id === id) || null; }
  function teamSpent(state, teamId) {
    return state.vendite.filter(v => v.squadraId === teamId).reduce((s, v) => s + v.prezzo, 0);
  }
  function teamBudget(state, teamId) { return state.config.budget - teamSpent(state, teamId); }
  function teamRosterCountByRole(state, players, teamId) {
    const c = { P: 0, D: 0, C: 0, A: 0 };
    for (const v of state.vendite) {
      if (v.squadraId !== teamId) continue;
      const p = playerById(players, v.giocatoreId);
      if (p) c[p.ruolo]++;
    }
    return c;
  }
  function teamSlotsRemaining(state, players, teamId) {
    const filled = teamRosterCountByRole(state, players, teamId);
    const rem = {};
    for (const r of ROLES) rem[r] = state.config.slots[r] - filled[r];
    return rem;
  }
  function soldIds(state) { return new Set(state.vendite.map(v => v.giocatoreId)); }
  function validateSale(state, players, sale) {
    const p = playerById(players, sale.giocatoreId);
    if (!p) return { ok: false, reason: 'giocatore inesistente' };
    if (soldIds(state).has(sale.giocatoreId)) return { ok: false, reason: 'già venduto' };
    if (!(sale.prezzo >= 1)) return { ok: false, reason: 'prezzo minimo 1' };
    if (sale.prezzo > teamBudget(state, sale.squadraId)) return { ok: false, reason: 'budget insufficiente' };
    if (teamSlotsRemaining(state, players, sale.squadraId)[p.ruolo] <= 0) return { ok: false, reason: 'slot ruolo pieno' };
    return { ok: true };
  }
  function applySale(state, sale) {
    const seq = state.vendite.length ? state.vendite[state.vendite.length - 1].seq + 1 : 1;
    return Object.assign({}, state, { vendite: state.vendite.concat([{ giocatoreId: sale.giocatoreId, squadraId: sale.squadraId, prezzo: sale.prezzo, seq }]) });
  }
  function undoSale(state) {
    if (!state.vendite.length) return state;
    return Object.assign({}, state, { vendite: state.vendite.slice(0, -1) });
  }
  function applyOverrides(players, overrides) {
    if (!overrides) return players;
    return players.map(p => overrides[p.id] ? Object.assign({}, p, overrides[p.id]) : p);
  }
  function buildQueue(players) {
    return players.slice().sort((a, b) => {
      const r = ROLES.indexOf(a.ruolo) - ROLES.indexOf(b.ruolo);
      if (r !== 0) return r;
      return a.nome.localeCompare(b.nome, 'it');
    });
  }
  function firstUnsoldIndex(queue, sold, from) {
    for (let i = (from || 0); i < queue.length; i++) if (!sold.has(queue[i].id)) return i;
    return -1;
  }
  return { DEFAULT_CONFIG, ROLES, initState, myId, playerById, teamSpent, teamBudget, teamRosterCountByRole, teamSlotsRemaining, soldIds, validateSale, applySale, undoSale, applyOverrides, buildQueue, firstUnsoldIndex };
})();
