// i test vengono aggiunti qui nei task successivi

test('initState: 14 squadre, t0 = IO', () => {
  const s = Store.initState();
  assertEqual(s.squadre.length, 14);
  assertEqual(s.squadre[0].isMe, true);
  assertEqual(s.squadre[0].nome, 'IO');
  assertEqual(s.vendite.length, 0);
  assertEqual(Store.myId(s), 't0');
});
test('teamBudget fresh = budget config', () => {
  const s = Store.initState();
  assertEqual(Store.teamBudget(s, 't0'), 500);
});
test('teamSlotsRemaining fresh = slots config', () => {
  const s = Store.initState();
  const rem = Store.teamSlotsRemaining(s, TEST_PLAYERS, 't0');
  assertEqual(rem.P, 3); assertEqual(rem.D, 8); assertEqual(rem.C, 8); assertEqual(rem.A, 6);
});
test('validateSale ok su acquisto valido', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, TEST_PLAYERS, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 67 });
  assertEqual(r.ok, true);
});
test('validateSale ko se prezzo > budget', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, TEST_PLAYERS, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 600 });
  assertEqual(r.ok, false);
});
test('validateSale ko se già venduto', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'lautaro-inter', squadraId: 't1', prezzo: 50 });
  const r = Store.validateSale(s, TEST_PLAYERS, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 10 });
  assertEqual(r.ok, false);
});
test('applySale aggiunge vendita con seq incrementale', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'sommer-inter', squadraId: 't0', prezzo: 20 });
  s = Store.applySale(s, { giocatoreId: 'meret-napoli', squadraId: 't2', prezzo: 8 });
  assertEqual(s.vendite.length, 2);
  assertEqual(s.vendite[0].seq, 1);
  assertEqual(s.vendite[1].seq, 2);
  assertEqual(Store.teamBudget(s, 't0'), 480);
});
test('undoSale rimuove ultima; su vuoto non rompe', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'sommer-inter', squadraId: 't0', prezzo: 20 });
  s = Store.undoSale(s);
  assertEqual(s.vendite.length, 0);
  s = Store.undoSale(s);
  assertEqual(s.vendite.length, 0);
});
test('validateSale ko se slot ruolo pieno', () => {
  let s = Store.initState();
  s.config = Object.assign({}, s.config, { slots: Object.assign({}, s.config.slots, { P: 2 }) });
  s = Store.applySale(s, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'meret-napoli',  squadraId: 't0', prezzo: 1 });
  // P pieni (2/2); sommer-inter è un P NON venduto → deve essere respinto per slot pieno, non "già venduto"
  const r = Store.validateSale(s, TEST_PLAYERS, { giocatoreId: 'sommer-inter', squadraId: 't0', prezzo: 1 });
  assertEqual(r.ok, false);
  assertEqual(r.reason, 'slot ruolo pieno');
});
test('validateSale ko se prezzo < 1', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, TEST_PLAYERS, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 0 });
  assertEqual(r.ok, false);
  assertEqual(r.reason, 'prezzo minimo 1');
});
test('buildQueue: P prima, poi D,C,A; alfabetico dentro ruolo', () => {
  const q = Store.buildQueue(TEST_PLAYERS);
  const roles = ['P','D','C','A'];
  let last = -1;
  for (const p of q) { const idx = roles.indexOf(p.ruolo); assert(idx >= last, 'ruoli non ordinati'); last = idx; }
  const p = q.filter(x => x.ruolo === 'P').map(x => x.nome);
  assertEqual(p[0], 'Falcone'); assertEqual(p[1], 'Meret'); assertEqual(p[2], 'Sommer');
});
test('firstUnsoldIndex salta i venduti', () => {
  const q = Store.buildQueue(TEST_PLAYERS);
  const sold = new Set([q[0].id]);
  assertEqual(Store.firstUnsoldIndex(q, sold, 0), 1);
});
test('applyOverrides sovrascrive titolarita/nota', () => {
  const ov = { 'sommer-inter': { titolarita: 'ballottaggio', nota: 'acciaccato' } };
  const eff = Store.applyOverrides(TEST_PLAYERS, ov);
  const s = eff.find(p => p.id === 'sommer-inter');
  assertEqual(s.titolarita, 'ballottaggio');
  assertEqual(s.nota, 'acciaccato');
  const orig = TEST_PLAYERS.find(p => p.id === 'sommer-inter');
  assertEqual(orig.titolarita, 'titolare'); // immutato
});
test('maxConsigliato Lautaro fresco = 67', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'lautaro-inter');
  assertEqual(Advisor.maxConsigliato(s, TEST_PLAYERS, p), 67);
});
test('maxConsigliato Bastoni fresco = 58 (boost mod difesa)', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'bastoni-inter');
  assertEqual(Advisor.maxConsigliato(s, TEST_PLAYERS, p), 58);
});
test('maxConsigliato Sommer fresco = 28', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'sommer-inter');
  assertEqual(Advisor.maxConsigliato(s, TEST_PLAYERS, p), 28);
});
test('maxConsigliato = 0 se slot ruolo pieni', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'meret-napoli',  squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'sommer-inter',  squadraId: 't0', prezzo: 1 });
  const p = Store.playerById(TEST_PLAYERS, 'falcone-lecce');
  assertEqual(Advisor.maxConsigliato(s, TEST_PLAYERS, p), 0);
});
test('scarsita A fresco: 3 titolari, 14 squadre, alta', () => {
  const s = Store.initState();
  const sc = Advisor.scarsita(s, TEST_PLAYERS, 'A');
  assertEqual(sc.titolari, 3); // Lautaro, Retegui, Thuram
  assertEqual(sc.squadre, 14);
  assertEqual(sc.alta, true);
});
test('verdetto Lautaro fresco = PRIORITA (titolare + scarsità alta)', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'lautaro-inter');
  assertEqual(Advisor.verdetto(s, TEST_PLAYERS, p), 'PRIORITA');
});
test('verdetto Colombo fresco = SERVE (ballottaggio, non priorità)', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'colombo-genoa');
  assertEqual(Advisor.verdetto(s, TEST_PLAYERS, p), 'SERVE');
});
test('verdetto NON_SERVE se slot ruolo A pieni', () => {
  let s = Store.initState();
  const ids = ['colombo-genoa','lautaro-inter','retegui-atalanta','thuram-inter'];
  ids.forEach(id => { s = Store.applySale(s, { giocatoreId: id, squadraId: 't0', prezzo: 1 }); });
  // 4 su 6 A presi; testiamo un ruolo pieno forzando config a 4 slot A
  s.config = Object.assign({}, s.config, { slots: Object.assign({}, s.config.slots, { A: 4 }) });
  const p = Store.playerById(TEST_PLAYERS, 'colombo-genoa');
  assertEqual(Advisor.verdetto(s, TEST_PLAYERS, p), 'NON_SERVE');
});
test('verdetto NON_SERVE se budget ruolo ~1cr/slot e tier top', () => {
  let s = Store.initState();
  // io spendo 156 su un A → residuo A = 160-156 = 4, slot A res = 5 → 4<=5, tier1 Thuram → NON_SERVE
  s = Store.applySale(s, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 156 });
  const p = Store.playerById(TEST_PLAYERS, 'thuram-inter');
  assertEqual(Advisor.verdetto(s, TEST_PLAYERS, p), 'NON_SERVE');
});
test('advice overpay = rilancio - max', () => {
  const s = Store.initState();
  const p = Store.playerById(TEST_PLAYERS, 'lautaro-inter');
  const a = Advisor.advice(s, TEST_PLAYERS, p, 80);
  assertEqual(a.max, 67);
  assertEqual(a.overpay, 13);
});
test('buildContext fresco: inAsta = primo P (Falcone), 13 rivali, budget 500', () => {
  const s = Store.initState();
  const q = Store.buildQueue(TEST_PLAYERS);
  const ctx = AI.buildContext(s, TEST_PLAYERS, q);
  assertEqual(ctx.inAsta.nome, 'Falcone');
  assertEqual(ctx.io.budgetResiduo, 500);
  assertEqual(ctx.rivali.length, 13);
  assertEqual(ctx.topDisponibiliRuolo.length, 3); // Falcone, Meret, Sommer (i 3 P della fixture)
});
test('buildContext dopo vendita: rosa aggiornata, venduto fuori dai disponibili', () => {
  let s = Store.initState();
  const q = Store.buildQueue(TEST_PLAYERS);
  s = Store.applySale(s, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 5 });
  const ctx = AI.buildContext(s, TEST_PLAYERS, q);
  assertEqual(ctx.io.budgetResiduo, 495);
  assertEqual(ctx.io.rosa.P.length, 1);
  assert(!ctx.topDisponibiliRuolo.some(x => x.nome === 'Falcone'), 'Falcone venduto non tra i disponibili');
});
test('buildUserMessage contiene giocatore in asta, stato e domanda', () => {
  const s = Store.initState();
  const q = Store.buildQueue(TEST_PLAYERS);
  const ctx = AI.buildContext(s, TEST_PLAYERS, q);
  const msg = AI.buildUserMessage(ctx, 'meglio lui o aspetto?');
  assert(msg.includes('Falcone'), 'contiene giocatore in asta');
  assert(msg.includes('meglio lui o aspetto?'), 'contiene la domanda');
  assert(msg.includes('budget') || msg.includes('Budget'), 'contiene lo stato');
});
test('messagesFor: system + cronologia + user finale', () => {
  const s = Store.initState();
  const q = Store.buildQueue(TEST_PLAYERS);
  const ctx = AI.buildContext(s, TEST_PLAYERS, q);
  const msgs = AI.messagesFor(ctx, [{ role: 'user', content: 'ciao' }, { role: 'assistant', content: 'ok' }], 'e adesso?');
  assertEqual(msgs[0].role, 'system');
  assertEqual(msgs.length, 4);
  assertEqual(msgs[3].role, 'user');
  assert(msgs[3].content.includes('e adesso?'), 'ultimo = domanda');
});
