(function () {
const M = () => (typeof window !== 'undefined' ? window : globalThis).Model;
const Model = new Proxy({}, { get: (_, k) => M()[k] });
test('CATEGORIES default anticipi', () => {
  assertEq(Model.CATEGORIES.gomme_inv.giorniPrima, 10);
  assertEq(Model.CATEGORIES.certificato.giorniPrima, 30);
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
  assert(q.includes('singleEvents=true')); assert(q.includes('orderBy=startTime'));
});
test("nome con apostrofo resta intatto nel summary", () => {
  const ev = Model.buildEvent({categoria:'assicurazione',nome:"L'assicurazione",dateISO:'2026-11-26',giorniPrima:20,ricorrente:true});
  assert(ev.summary.includes("L'assicurazione"));
});
})();
