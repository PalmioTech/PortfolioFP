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
    let base = mediaSlot * (state.config.tierMult[player.tier] != null ? state.config.tierMult[player.tier] : 1);
    if ((ruolo === 'P' || ruolo === 'D') && player.affidabilita_difesa === 'alta') base *= state.config.modDifesaBoost[ruolo];
    const cap = residuo - (slotRes - 1);
    const max = Math.round(Math.min(base, cap) + 1e-9);
    return Math.max(1, Math.min(max, residuo));
  }
  function titolariRimasti(state, players, ruolo) {
    const sold = Store.soldIds(state);
    return players.filter(p => p.ruolo === ruolo && !sold.has(p.id) && (p.titolarita === 'titolare' || p.tier <= 3)).length;
  }
  function squadreConSlot(state, players, ruolo) {
    return state.squadre.filter(t => Store.teamSlotsRemaining(state, players, t.id)[ruolo] > 0).length;
  }
  function scarsita(state, players, ruolo) {
    const squadre = squadreConSlot(state, players, ruolo);
    const titolari = titolariRimasti(state, players, ruolo);
    const ratio = squadre > 0 ? titolari / squadre : Infinity;
    return { titolari, squadre, ratio, alta: ratio < 1 };
  }
  function verdetto(state, players, player) {
    const ruolo = player.ruolo;
    const slotRes = mySlotsRemaining(state, players, ruolo);
    if (slotRes <= 0) return 'NON_SERVE';
    const residuo = Math.max(0, roleRemainingBudget(state, players, ruolo));
    if (residuo <= slotRes && player.tier <= 2) return 'NON_SERVE';
    const sc = scarsita(state, players, ruolo);
    if (player.titolarita === 'titolare' && sc.alta) return 'PRIORITA';
    return 'SERVE';
  }
  function advice(state, players, player, rilancio) {
    const max = maxConsigliato(state, players, player);
    return {
      max,
      verdetto: verdetto(state, players, player),
      scarsita: scarsita(state, players, player.ruolo),
      overpay: (typeof rilancio === 'number' && rilancio > max) ? rilancio - max : 0
    };
  }
  return { roleTarget, roleSpentMe, roleRemainingBudget, mySlotsRemaining, maxConsigliato, scarsita, verdetto, advice };
})(window.Store);
