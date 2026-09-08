window.AI = (function (Store, Advisor) {
  const AIKEY_LS = 'assistentefanta:aikey';
  const SYSTEM_PROMPT =
    "Sei l'assistente di un'asta di fantacalcio Classic a 14 squadre con modificatore difesa attivo. " +
    "Rispondi in italiano, breve e azionabile: dì se il giocatore serve, un prezzo massimo sensato e alternative. " +
    "Basati SOLO sui dati forniti nel messaggio (rosa, budget, giocatore in asta, disponibili, rivali): " +
    "NON usare la tua memoria sui giocatori, la stagione 2026/27 è successiva al tuo training. " +
    "Tieni conto del modificatore difesa: un difensore/portiere titolare affidabile vale di più.";

  function myTeam(state) { return state.squadre.find(s => s.isMe) || state.squadre[0]; }
  function rosaByRole(state, players, teamId) {
    const r = { P: [], D: [], C: [], A: [] };
    for (const v of state.vendite) {
      if (v.squadraId !== teamId) continue;
      const p = Store.playerById(players, v.giocatoreId);
      if (p) r[p.ruolo].push({ nome: p.nome, prezzo: v.prezzo });
    }
    return r;
  }
  function current(state, queue) { return queue[state.cursore.index] || null; }

  function buildContext(state, players, queue) {
    const me = myTeam(state);
    const slotRes = Store.teamSlotsRemaining(state, players, me.id);
    const p = current(state, queue);
    const ruolo = p ? p.ruolo : null;
    let inAsta = null;
    if (p) {
      const a = Advisor.advice(state, players, p);
      inAsta = { nome: p.nome, squadra: p.squadra, ruolo: p.ruolo, tier: p.tier, titolarita: p.titolarita, nota: p.nota || '', quota: p.quota, verdetto: a.verdetto, maxConsigliato: a.max, scarsita: a.scarsita };
    }
    const sold = Store.soldIds(state);
    let top = [];
    if (ruolo) {
      top = players.filter(x => x.ruolo === ruolo && !sold.has(x.id))
        .sort((a, b) => (a.tier - b.tier) || ((b.quota || 0) - (a.quota || 0)))
        .slice(0, 15)
        .map(x => ({ nome: x.nome, squadra: x.squadra, tier: x.tier, titolarita: x.titolarita, quota: x.quota, maxConsigliato: Advisor.maxConsigliato(state, players, x) }));
    }
    const crPerSlot = (ruolo && slotRes[ruolo] > 0)
      ? Math.round(Math.max(0, Advisor.roleRemainingBudget(state, players, ruolo)) / slotRes[ruolo]) : null;
    return {
      config: { budget: state.config.budget, slots: state.config.slots, modDifesa: true, split: state.config.split },
      io: { budgetResiduo: Store.teamBudget(state, me.id), slotResidui: slotRes, rosa: rosaByRole(state, players, me.id), crPerSlotRuoloCorrente: crPerSlot },
      inAsta: inAsta,
      rivali: state.squadre.filter(s => !s.isMe).map(t => ({ nome: t.nome, budgetResiduo: Store.teamBudget(state, t.id), slotResidui: Store.teamSlotsRemaining(state, players, t.id) })),
      topDisponibiliRuolo: top
    };
  }

  function contextToText(ctx) {
    const io = ctx.io, S = ctx.config.slots;
    const rosaTxt = ['P', 'D', 'C', 'A'].map(r => r + ': ' + (io.rosa[r].map(x => x.nome + ' (' + x.prezzo + ')').join(', ') || '—')).join(' | ');
    const lines = [];
    lines.push('Lega: Classic 14 squadre, budget ' + ctx.config.budget + ', rosa P' + S.P + ' D' + S.D + ' C' + S.C + ' A' + S.A + ', modificatore difesa ATTIVO.');
    lines.push('Mia rosa — ' + rosaTxt);
    lines.push('Mio Budget residuo: ' + io.budgetResiduo + ' | slot mancanti P' + io.slotResidui.P + ' D' + io.slotResidui.D + ' C' + io.slotResidui.C + ' A' + io.slotResidui.A + (io.crPerSlotRuoloCorrente != null ? (' | cr/slot ruolo corrente ~' + io.crPerSlotRuoloCorrente) : ''));
    if (ctx.inAsta) {
      const a = ctx.inAsta;
      lines.push('IN ASTA ORA: ' + a.nome + ' (' + a.squadra + ') ' + a.ruolo + ' tier' + a.tier + ' ' + a.titolarita + (a.nota ? (' — ' + a.nota) : '') + ' | quota ' + a.quota + ' | advisor: ' + a.verdetto + ', max ' + a.maxConsigliato + ', scarsità ' + (a.scarsita.alta ? 'ALTA' : 'ok') + ' (' + a.scarsita.titolari + ' titolari/' + a.scarsita.squadre + ' squadre)');
    } else {
      lines.push('IN ASTA ORA: (coda finita)');
    }
    if (ctx.topDisponibiliRuolo.length) {
      lines.push('Disponibili nel ruolo ' + (ctx.inAsta ? ctx.inAsta.ruolo : '') + ' (top): ' + ctx.topDisponibiliRuolo.map(x => x.nome + ' [' + x.tier + ',' + x.titolarita + ',max' + x.maxConsigliato + ']').join('; '));
    }
    lines.push('Rivali (budget/slot): ' + ctx.rivali.map(r => r.nome + ' ' + r.budgetResiduo + 'cr P' + r.slotResidui.P + 'D' + r.slotResidui.D + 'C' + r.slotResidui.C + 'A' + r.slotResidui.A).join(' · '));
    return lines.join('\n');
  }

  function buildUserMessage(ctx, question) {
    return 'STATO ATTUALE ASTA:\n' + contextToText(ctx) + '\n\nDOMANDA: ' + question;
  }
  function messagesFor(ctx, history, question) {
    return [{ role: 'system', content: SYSTEM_PROMPT }].concat(history || []).concat([{ role: 'user', content: buildUserMessage(ctx, question) }]);
  }
  async function callOpenAI(key, messages) {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
      body: JSON.stringify({ model: 'gpt-4o-mini', messages: messages, temperature: 0.4 })
    });
    if (!res.ok) {
      let msg = 'Errore API ' + res.status;
      try { const e = await res.json(); if (e && e.error && e.error.message) msg += ': ' + e.error.message; } catch (_) {}
      throw new Error(msg);
    }
    const data = await res.json();
    return (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '(risposta vuota)';
  }

  function initChat() {
    const $ = (id) => document.getElementById(id);
    const panel = $('aiPanel');
    if (!panel) return;
    const keyEl = $('aiKey');
    try { keyEl.value = localStorage.getItem(AIKEY_LS) || ''; } catch (e) {}
    function updateMode() {
      const has = !!(keyEl.value || '').trim();
      $('aiMode').textContent = has ? 'modo: API automatica' : 'modo: copia-incolla';
    }
    updateMode();
    keyEl.addEventListener('change', () => {
      try { localStorage.setItem(AIKEY_LS, keyEl.value.trim()); } catch (e) {}
      updateMode();
    });
    $('btnAI').onclick = () => { panel.hidden = !panel.hidden; };
    $('aiClose').onclick = () => { panel.hidden = true; };
    const msgsEl = $('aiMessages');
    const history = [];
    function appendMsg(role, text) {
      const d = document.createElement('div');
      d.className = 'aiMsg ' + role;
      d.textContent = text;
      msgsEl.appendChild(d);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return d;
    }
    function ctxNow() { return buildContext(STATE, PLAYERS_EFF, QUEUE); }
    function copyPasteFlow(question) {
      const prompt = buildUserMessage(ctxNow(), question);
      appendMsg('user', question);
      const box = document.createElement('div');
      box.className = 'aiMsg assistant aiCopyBox';
      const ta = document.createElement('textarea'); ta.readOnly = true; ta.rows = 6; ta.value = prompt;
      const copy = document.createElement('button'); copy.type = 'button'; copy.textContent = 'copia prompt';
      copy.onclick = () => { ta.select(); try { document.execCommand('copy'); } catch (e) {} copy.textContent = 'copiato ✓'; };
      const paste = document.createElement('textarea'); paste.rows = 3; paste.placeholder = 'incolla qui la risposta di ChatGPT…';
      const add = document.createElement('button'); add.type = 'button'; add.textContent = 'aggiungi risposta';
      add.onclick = () => { if (paste.value.trim()) { history.push({ role: 'user', content: prompt }); history.push({ role: 'assistant', content: paste.value.trim() }); appendMsg('assistant', paste.value.trim()); box.remove(); } };
      box.appendChild(ta); box.appendChild(copy); box.appendChild(paste); box.appendChild(add);
      msgsEl.appendChild(box); msgsEl.scrollTop = msgsEl.scrollHeight;
    }
    initChat._send = function (question) {
      question = (question || '').trim();
      if (!question) return;
      $('aiInput').value = '';
      const key = (keyEl.value || '').trim();
      if (key) { apiFlow(question, key); } else { copyPasteFlow(question); }
    };
    function apiFlow() { /* completato nel Task 4 */ }
    $('aiQuickValuta').onclick = () => initChat._send('Valuta il giocatore in asta: mi serve per la mia rosa? A che prezzo massimo conviene? Alternative?');
    $('aiQuickManca').onclick = () => initChat._send('Guardando la mia rosa, gli slot mancanti e il budget, cosa mi manca e su quali ruoli/giocatori dovrei puntare i prossimi crediti?');
    $('aiQuickMeglio').onclick = () => { $('aiInput').value = 'Meglio X o Y? '; $('aiInput').focus(); };
    $('aiSend').onclick = () => initChat._send($('aiInput').value);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { if (document.getElementById('aiPanel')) initChat(); });
  }

  return { SYSTEM_PROMPT, AIKEY_LS, buildContext, contextToText, buildUserMessage, messagesFor, callOpenAI, initChat };
})(window.Store, window.Advisor);
