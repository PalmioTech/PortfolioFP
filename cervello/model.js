// Core puro di Cervello: date, ricorrenze, mapping evento Google. Niente DOM, niente rete.
(function (g) {
  const CATEGORIES = {
    gomme_inv:     { label: 'Gomme invernali', icon: '🛞', colore: 'accent', ricorrente: true,  meseDefault: 11, giornoDefault: 1,  giorniPrima: 10 },
    gomme_est:     { label: 'Gomme estive',    icon: '🛞', colore: 'accent', ricorrente: true,  meseDefault: 4,  giornoDefault: 15, giorniPrima: 10 },
    compleanno:    { label: 'Compleanno',      icon: '🎂', colore: 'lime',   ricorrente: true,  giorniPrima: 3 },
    assicurazione: { label: 'Assicurazione',   icon: '🚗', colore: 'accent', ricorrente: true,  giorniPrima: 20 },
    certificato:   { label: 'Certificato',     icon: '🏅', colore: 'lime',   ricorrente: true,  giorniPrima: 28 },
    altro:         { label: 'Altro',           icon: '📌', colore: 'muted',  ricorrente: false, giorniPrima: 7 },
  };

  const DAY = 86400000;
  const parse = (iso) => new Date(iso + 'T00:00:00Z');
  const fmt = (d) => d.toISOString().slice(0, 10);
  const pad = (n) => String(n).padStart(2, '0');

  function giorniMancanti(dateISO, todayISO) {
    return Math.round((parse(dateISO) - parse(todayISO)) / DAY);
  }

  function prossimaOccorrenza(dateISO, todayISO) {
    const [, m, d] = dateISO.split('-').map(Number);
    let y = Number(todayISO.slice(0, 4));
    for (let i = 0; i < 2; i++, y++) {
      let c = parse(y + '-' + pad(m) + '-' + pad(d));
      if (c.getUTCMonth() + 1 !== m) c = parse(y + '-03-01'); // 29 feb non bisestile
      if (fmt(c) >= todayISO) return fmt(c);
    }
  }

  function buildEvent({ categoria, nome, dateISO, giorniPrima, ricorrente }) {
    if (!CATEGORIES[categoria]) categoria = 'altro';
    const cat = CATEGORIES[categoria];
    if (typeof giorniPrima !== 'number' || isNaN(giorniPrima)) giorniPrima = cat.giorniPrima;
    const ev = {
      summary: cat.icon + ' ' + nome,
      start: { date: dateISO },
      end: { date: fmt(new Date(parse(dateISO).getTime() + DAY)) },
      reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: Math.min(giorniPrima * 1440, 40320) }] },
      extendedProperties: { private: { app: 'cervello', categoria } },
    };
    if (ricorrente) ev.recurrence = ['RRULE:FREQ=YEARLY'];
    return ev;
  }

  function fromEvent(ev) {
    const cat = ev.extendedProperties && ev.extendedProperties.private && ev.extendedProperties.private.categoria;
    const icon = (CATEGORIES[cat] || CATEGORIES.altro).icon + ' ';
    const s = ev.summary || '';
    return {
      id: ev.id,
      categoria: cat,
      nome: s.startsWith(icon) ? s.slice(icon.length) : s,
      dateISO: ev.start && ev.start.date,
      ricorrente: !!ev.recurrence,
    };
  }

  function buildListQuery({ timeMinISO }) {
    return new URLSearchParams({
      privateExtendedProperty: 'app=cervello',
      singleEvents: 'false',
      timeMin: timeMinISO,
    }).toString();
  }

  const Model = { CATEGORIES, giorniMancanti, prossimaOccorrenza, buildEvent, fromEvent, buildListQuery };
  g.Model = Model;
  if (typeof module !== 'undefined' && module.exports) module.exports = Model;
})(typeof window !== 'undefined' ? window : globalThis);
