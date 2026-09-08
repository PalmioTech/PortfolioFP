window.Advisor = (function (Store) {
  function roleTarget(config, ruolo) { return Math.round(config.budget * config.split[ruolo]); }
  function roleSpentMe(state, players, ruolo) {
    const me = Store.myId(state);
    return state.vendite.reduce((s, v) => {
      if (v.squadraId !== me) return s;
      const p = Store.playerById(players, v.giocatoreId);
      return s + (p && p.ruolo === ruolo ? v.prezzo : 0);
    }, 0);
  }
  function roleRemainingBudget(state, players, ruolo) {
    return roleTarget(state.config, ruolo) - roleSpentMe(state, players, ruolo);
  }
  function mySlotsRemaining(state, players, ruolo) {
    return Store.teamSlotsRemaining(state, players, Store.myId(state))[ruolo];
  }
  function maxConsigliato(state, players, player) {
    const ruolo = player.ruolo;
    const slotRes = mySlotsRemaining(state, players, ruolo);
    if (slotRes <= 0) return 0;
    const residuo = Math.max(0, roleRemainingBudget(state, players, ruolo));
    const mediaSlot = residuo / slotRes;
    let base = Math.round(mediaSlot * (state.config.tierMult[player.tier] != null ? state.config.tierMult[player.tier] : 1));
    if ((ruolo === 'P' || ruolo === 'D') && player.affidabilita_difesa === 'alta') base = Math.round(base * state.config.modDifesaBoost[ruolo] + 1e-9);
    const cap = residuo - (slotRes - 1);
    const max = Math.min(base, cap);
    return Math.max(1, Math.min(max, residuo));
  }
  return { roleTarget, roleSpentMe, roleRemainingBudget, mySlotsRemaining, maxConsigliato };
})(window.Store);
