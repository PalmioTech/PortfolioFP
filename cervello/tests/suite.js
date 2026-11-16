(function () {
const M = () => (typeof window !== 'undefined' ? window : globalThis).Model;
const Model = new Proxy({}, { get: (_, k) => M()[k] });
test('CATEGORIES default anticipi', () => {
  assertEq(Model.CATEGORIES.gomme_inv.giorniPrima, 10);
  assertEq(Model.CATEGORIES.certificato.giorniPrima, 28);
  assertEq(Model.CATEGORIES.altro.ricorrente, false);
});
test('giorniMancanti base', () => assertEq(Model.giorniMancanti('2026-11-26','2026-11-16'), 10));
test('giorniMancanti oggi', () => assertEq(Model.giorniMancanti('2026-11-16','2026-11-16'), 0));
test('prossimaOccorrenza gia passata -> anno prossimo', () =>
  assertEq(Model.prossimaOccorrenza('1990-03-10','2026-11-16'), '2027-03-10'));
test('prossimaOccorrenza futura stesso anno', () =>
  assertEq(Model.prossimaOccorrenza('1990-12-25','2026-11-16'), '2026-12-25'));
test('prossimaOccorrenza 29feb non bisestile -> 1 marzo', () =>
  assertEq(Model.prossimaOccorrenza('2000-02-29','2026-11-16'), '2027-03-01'));
test('buildEvent end esclusivo (giorno dopo)', () =>
  assertEq(Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-26',giorniPrima:7,ricorrente:false}).end.date, '2026-11-27'));
test('buildEvent reminder in minuti', () =>
  assertEq(Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-26',giorniPrima:7,ricorrente:false}).reminders.overrides[0].minutes, 7*1440));
test('buildEvent ricorrente -> RRULE yearly', () =>
  assertEq(Model.buildEvent({categoria:'compleanno',nome:'X',dateISO:'1990-03-10',giorniPrima:3,ricorrente:true}).recurrence[0], 'RRULE:FREQ=YEARLY'));
test('buildEvent non ricorrente -> niente recurrence', () =>
  assertEq(Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-26',giorniPrima:7,ricorrente:false}).recurrence, undefined));
test('buildEvent extendedProperties', () => {
  const p = Model.buildEvent({categoria:'assicurazione',nome:'X',dateISO:'2026-11-26',giorniPrima:20,ricorrente:true}).extendedProperties.private;
  assertEq(p.app, 'cervello'); assertEq(p.categoria, 'assicurazione');
});
test('fromEvent inverte buildEvent', () => {
  const ev = Model.buildEvent({categoria:'compleanno',nome:'Mario',dateISO:'1990-03-10',giorniPrima:3,ricorrente:true});
  const s = Model.fromEvent(ev);
  assertEq(s.categoria,'compleanno'); assertEq(s.nome,'Mario'); assertEq(s.dateISO,'1990-03-10'); assertEq(s.ricorrente,true);
});
test('buildListQuery codifica il filtro', () => {
  const q = Model.buildListQuery({timeMinISO:'2026-01-01T00:00:00Z'});
  assert(q.includes('privateExtendedProperty=app%3Dcervello'));
  assert(q.includes('singleEvents=false')); assert(!q.includes('orderBy'));
});
test("nome con apostrofo resta intatto nel summary", () => {
  const ev = Model.buildEvent({categoria:'assicurazione',nome:"L'assicurazione",dateISO:'2026-11-26',giorniPrima:20,ricorrente:true});
  assert(ev.summary.includes("L'assicurazione"));
});
test('reminder certificato 28gg = limite Google', () =>
  assertEq(Model.buildEvent({categoria:'certificato',nome:'X',dateISO:'2026-11-26',giorniPrima:28,ricorrente:true}).reminders.overrides[0].minutes, 40320));
test('reminder clamp a 40320 con 30gg', () =>
  assertEq(Model.buildEvent({categoria:'certificato',nome:'X',dateISO:'2026-11-26',giorniPrima:30,ricorrente:true}).reminders.overrides[0].minutes, 40320));
test('reminder giorniPrima negativo -> 0 minuti', () =>
  assertEq(Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-26',giorniPrima:-3,ricorrente:false}).reminders.overrides[0].minutes, 0));
test('buildEvent giorniPrima mancante -> default categoria', () =>
  assertEq(Model.buildEvent({categoria:'assicurazione',nome:'X',dateISO:'2026-11-26',ricorrente:true}).reminders.overrides[0].minutes, 20*1440));
test('buildEvent categoria sconosciuta -> altro', () =>
  assertEq(Model.buildEvent({categoria:'boh',nome:'X',dateISO:'2026-11-26',ricorrente:false}).extendedProperties.private.categoria, 'altro'));
test('prossimaOccorrenza 29feb verso anno bisestile', () =>
  assertEq(Model.prossimaOccorrenza('2000-02-29','2027-06-01'), '2028-02-29'));
test('buildListQuery include timeMin codificato', () =>
  assert(Model.buildListQuery({timeMinISO:'2026-01-01T00:00:00Z'}).includes('timeMin=2026-01-01T00%3A00%3A00Z')));
})();
