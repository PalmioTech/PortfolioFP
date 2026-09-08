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
  const rem = Store.teamSlotsRemaining(s, PLAYERS.giocatori, 't0');
  assertEqual(rem.P, 3); assertEqual(rem.D, 8); assertEqual(rem.C, 8); assertEqual(rem.A, 6);
});
test('validateSale ok su acquisto valido', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 67 });
  assertEqual(r.ok, true);
});
test('validateSale ko se prezzo > budget', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 600 });
  assertEqual(r.ok, false);
});
test('validateSale ko se già venduto', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'lautaro-inter', squadraId: 't1', prezzo: 50 });
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 10 });
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
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'sommer-inter', squadraId: 't0', prezzo: 1 });
  assertEqual(r.ok, false);
  assertEqual(r.reason, 'slot ruolo pieno');
});
test('validateSale ko se prezzo < 1', () => {
  const s = Store.initState();
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 0 });
  assertEqual(r.ok, false);
  assertEqual(r.reason, 'prezzo minimo 1');
});
test('buildQueue: P prima, poi D,C,A; alfabetico dentro ruolo', () => {
  const q = Store.buildQueue(PLAYERS.giocatori);
  const roles = ['P','D','C','A'];
  let last = -1;
  for (const p of q) { const idx = roles.indexOf(p.ruolo); assert(idx >= last, 'ruoli non ordinati'); last = idx; }
  const p = q.filter(x => x.ruolo === 'P').map(x => x.nome);
  assertEqual(p[0], 'Falcone'); assertEqual(p[1], 'Meret'); assertEqual(p[2], 'Sommer');
});
test('firstUnsoldIndex salta i venduti', () => {
  const q = Store.buildQueue(PLAYERS.giocatori);
  const sold = new Set([q[0].id]);
  assertEqual(Store.firstUnsoldIndex(q, sold, 0), 1);
});
test('applyOverrides sovrascrive titolarita/nota', () => {
  const ov = { 'sommer-inter': { titolarita: 'ballottaggio', nota: 'acciaccato' } };
  const eff = Store.applyOverrides(PLAYERS.giocatori, ov);
  const s = eff.find(p => p.id === 'sommer-inter');
  assertEqual(s.titolarita, 'ballottaggio');
  assertEqual(s.nota, 'acciaccato');
  const orig = PLAYERS.giocatori.find(p => p.id === 'sommer-inter');
  assertEqual(orig.titolarita, 'titolare'); // immutato
});
