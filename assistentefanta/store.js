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
  return { DEFAULT_CONFIG, ROLES, initState, myId, playerById, teamSpent, teamBudget, teamRosterCountByRole, teamSlotsRemaining };
})();
