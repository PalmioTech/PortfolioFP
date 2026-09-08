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
