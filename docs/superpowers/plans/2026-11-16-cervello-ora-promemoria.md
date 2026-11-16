# Cervello — Ora + Promemoria a orario + Login silenzioso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere a `cervello/` l'ora sull'appuntamento, un promemoria a un orario preciso (data+ora) per le scadenze una tantum, e il login silenzioso (niente "Connetti" a ogni apertura).

**Architecture:** Estende l'app statica esistente. Logica pura in `model.js` (orario evento, promemoria assoluto→minuti, round-trip) testata con l'harness Node/browser; `gcal.js` guadagna il token silenzioso GIS (`requestAccessToken({prompt:''})`) + rinnovo su 401; la UI aggiunge due campi opzionali.

**Tech Stack:** HTML/CSS/JS vanilla, Google Identity Services, Google Calendar REST v3. Zero dipendenze/build.

**Spec:** `docs/superpowers/specs/2026-11-16-cervello-ora-promemoria-design.md`

## Global Constraints

- Vanilla, zero deps/build. Modifiche SOLO sotto `cervello/`. Stage solo `cervello/` nei commit (il file `.claude/launch.json` sporco resta intatto).
- Evento con orario: `start.dateTime`/`end.dateTime` (end = +1h) + `timeZone: 'Europe/Rome'`. Senza ora: all-day `start.date` + `end.date` = giorno dopo (invariato).
- Reminder = `reminders.overrides=[{method:'popup', minutes}]`, `useDefault:false`. `minutes` sempre in `[0, 40320]` (limite Google 28 giorni).
- Promemoria assoluto (`avvisaISO`) vale SOLO per scadenze NON ricorrenti; sulle ricorrenti si usa `giorniPrima*1440`.
- Token OAuth mai salvato (resta in closure). `calendar.events` scope invariato. Eventi su `primary` + `extendedProperties.private.app='cervello'`.
- Stile coi token del sito (Figtree/Syne/Space Mono, `--accent`/`--lime`/`--muted`). Copy IT. `noindex` invariato.
- Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Review Focus

- **Promemoria assoluto su scadenza ricorrente** → deve essere IGNORATO (usa `giorniPrima`), non produrre un reminder a una data fissa. (model.js — testato T1)
- **`avvisa` dopo l'inizio evento** → `minutiPrima` clampa a 0; la UI mostra un messaggio e blocca il salvataggio. (model.js test T1 + app.js T3)
- **`avvisa` oltre 28 giorni prima** → clamp a 40320, nessun 400 da Google. (model.js — testato T1)
- **Token silenzioso fallito** (disconnesso da Google) → fallback pulito al bottone "Connetti", nessun crash né loop. (app.js/gcal.js — verifica browser T2)
- **Retry su 401** → un solo tentativo di rinnovo silenzioso, niente ricorsione infinita. (gcal.js — verifica lettura T2)

---

### Task 1: `model.js` — ora evento + promemoria assoluto + round-trip (TDD)

**Files:**
- Modify: `cervello/model.js`
- Modify: `cervello/tests/suite.js`

**Interfaces:**
- Consumes: niente di nuovo.
- Produces (aggiunte a `window.Model`):
  - `minutiPrima(dateISO, oraISO, avvisaISO) -> number` — minuti tra inizio evento e `avvisa`, clamp `[0,40320]`. Inizio evento = `dateISO + 'T' + (oraISO||'00:00')`. Parse di entrambe le stringhe locali come UTC (`+':00Z'`) per determinismo nei test.
  - `buildEvent({categoria, nome, dateISO, giorniPrima, ricorrente, oraISO, avvisaISO})` — ora accetta `oraISO` ('HH:MM', opz.) e `avvisaISO` ('YYYY-MM-DDTHH:MM', opz.).
  - `fromEvent(ev)` — restituisce in più `ora` e `avvisa`.

- [ ] **Step 1: Scrivi i test che falliscono** in `cervello/tests/suite.js` (appendili, non toccare gli esistenti):

```js
// minutiPrima
test('minutiPrima caso Federico (mer 15:00, avvisa mar 18:00) = 1260', () =>
  assertEq(Model.minutiPrima('2026-11-18','15:00','2026-11-17T18:00'), 1260));
test('minutiPrima evento all-day (00:00) avvisa giorno prima 18:00 = 360', () =>
  assertEq(Model.minutiPrima('2026-11-18','','2026-11-17T18:00'), 360));
test('minutiPrima avvisa dopo evento -> 0', () =>
  assertEq(Model.minutiPrima('2026-11-18','10:00','2026-11-18T12:00'), 0));
test('minutiPrima oltre 28gg -> clamp 40320', () =>
  assertEq(Model.minutiPrima('2026-12-31','10:00','2026-01-01T00:00'), 40320));
// buildEvent con orario
test('buildEvent con ora -> evento dateTime + TZ Rome, niente start.date', () => {
  const e = Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-18',giorniPrima:7,ricorrente:false,oraISO:'15:00'});
  assertEq(e.start.dateTime, '2026-11-18T15:00:00'); assertEq(e.end.dateTime, '2026-11-18T16:00:00');
  assertEq(e.start.timeZone, 'Europe/Rome'); assert(!e.start.date);
});
test('buildEvent senza ora resta all-day', () => {
  const e = Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-18',giorniPrima:7,ricorrente:false});
  assertEq(e.start.date, '2026-11-18'); assert(!e.start.dateTime);
});
test('buildEvent avvisa (non ricorrente) -> minuti assoluti', () => {
  const e = Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-18',giorniPrima:7,ricorrente:false,oraISO:'15:00',avvisaISO:'2026-11-17T18:00'});
  assertEq(e.reminders.overrides[0].minutes, 1260);
});
test('buildEvent avvisa IGNORATO se ricorrente', () => {
  const e = Model.buildEvent({categoria:'compleanno',nome:'X',dateISO:'1990-03-10',giorniPrima:3,ricorrente:true,avvisaISO:'1990-03-01T09:00'});
  assertEq(e.reminders.overrides[0].minutes, 3*1440);
});
test('buildEvent salva ora e avvisa in extendedProperties', () => {
  const p = Model.buildEvent({categoria:'altro',nome:'X',dateISO:'2026-11-18',giorniPrima:7,ricorrente:false,oraISO:'15:00',avvisaISO:'2026-11-17T18:00'}).extendedProperties.private;
  assertEq(p.ora, '15:00'); assertEq(p.avvisa, '2026-11-17T18:00');
});
// fromEvent
test('fromEvent legge ora da dateTime', () => {
  const ev = Model.buildEvent({categoria:'altro',nome:'Gomme',dateISO:'2026-11-18',giorniPrima:7,ricorrente:false,oraISO:'15:00',avvisaISO:'2026-11-17T18:00'});
  const s = Model.fromEvent(ev);
  assertEq(s.dateISO,'2026-11-18'); assertEq(s.ora,'15:00'); assertEq(s.avvisa,'2026-11-17T18:00');
});
```

- [ ] **Step 2: Esegui e verifica il RED.** Run: `node cervello/tests/node.js`. Expected: i nuovi test falliscono (minutiPrima non definito, campi mancanti).

- [ ] **Step 3: Implementa in `cervello/model.js`.**
`minutiPrima`: `const ev = new Date(dateISO+'T'+(oraISO||'00:00')+':00Z'); const av = new Date(avvisaISO+':00Z'); return Math.max(0, Math.min(Math.round((ev-av)/60000), 40320));`. `buildEvent`: se `oraISO` → `start={dateTime:dateISO+'T'+oraISO+':00', timeZone:'Europe/Rome'}`, `end={dateTime: <+1h>, timeZone:'Europe/Rome'}` (somma 1h via Date UTC poi riformatta a `YYYY-MM-DDTHH:MM:00`); altrimenti all-day come ora. Reminder: `const minutes = (avvisaISO && !ricorrente) ? minutiPrima(dateISO,oraISO,avvisaISO) : Math.max(0,Math.min(giorni,28))*1440;`. `extendedProperties.private` aggiunge `ora: oraISO||'', avvisa: avvisaISO||''`. `fromEvent`: `dateISO = ev.start.date || (ev.start.dateTime||'').slice(0,10)`; `ora = ev.start.dateTime ? ev.start.dateTime.slice(11,16) : (priv.ora||undefined)`; `avvisa = priv.avvisa || undefined`.

- [ ] **Step 4: Esegui e verifica il GREEN.** Run: `node cervello/tests/node.js`. Expected: tutti verdi (vecchi + nuovi).

- [ ] **Step 5: Commit.**
```bash
git add cervello/model.js cervello/tests/
git commit -m "feat(cervello): ora appuntamento + promemoria assoluto nel model"
```

---

### Task 2: `gcal.js` + `app.js` boot — login silenzioso + rinnovo su 401

**Files:**
- Modify: `cervello/gcal.js`
- Modify: `cervello/app.js` (solo `boot()`)

**Interfaces:**
- Consumes: `GCal.init/connect`, `App.render`.
- Produces: `GCal.connect(opts)` accetta un oggetto opzionale passato a `requestAccessToken` (`{prompt:''}` = silenzioso). Comportamento interno: su 401 un rinnovo silenzioso + retry.

- [ ] **Step 1: `gcal.js`.**
`connect(opts)` → `client.requestAccessToken(opts || {})`. In `req(method, path, body, _retried)`: su `res.status === 401` azzera `token`; se `!_retried`, prova `await connect({prompt:''})` (dentro try) e se ottieni il token ritenta `return req(method, path, body, true)`; se il rinnovo fallisce o `_retried`, `throw new Error('TOKEN_SCADUTO')`. Dedup: se un rinnovo silenzioso è già in volo, riusa la stessa Promise (evita `pending` sovrascritto da richieste concorrenti).

- [ ] **Step 2: `app.js` `boot()`.**
Dopo `GCal.init(id)` (quando GIS è pronto), invece di `showConnect()` diretto: prova il token silenzioso — `GCal.connect({prompt:''}).then(() => render()).catch(() => showConnect())`. Mostra `status('Caricamento…')` durante. `showConnect()` resta il fallback (bottone con `connect()` interattivo).

- [ ] **Step 3: Verifica (lettura + browser).**
`node --check cervello/gcal.js` e `cervello/app.js`. Avvia un server statico locale e apri la pagina con un Client ID salvato (anche fittizio): all'apertura NON deve crashare; dato che nel browser di test non c'è sessione Google consenziente, il token silenzioso fallisce e deve comparire "Connetti Google", console pulita. (Il successo silenzioso "vero" lo verifica Federico loggato.) Il controller fa questo smoke.
Expected: nessun crash/loop, fallback a Connetti, console pulita.

- [ ] **Step 4: Commit.**
```bash
git add cervello/gcal.js cervello/app.js
git commit -m "feat(cervello): login silenzioso GIS + rinnovo token su 401"
```

---

### Task 3: UI — campi Ora + Avvisami, display, validazione

**Files:**
- Modify: `cervello/index.html` (form)
- Modify: `cervello/app.js` (form submit, edit, resetForm, render, toggle)
- Modify: `cervello/app.css`

**Interfaces:**
- Consumes: `Model.buildEvent` (con `oraISO`/`avvisaISO`), `Model.fromEvent` (con `ora`/`avvisa`), `GCal.*`, `App.render`.
- Produces: niente di nuovo (ultimo task).

- [ ] **Step 1: `index.html`** — nel form aggiungi: `Ora (opz.)` `<input id="fOra" type="time">`; e un blocco `#avvisaRow` con `Avvisami (opz.)` `<input id="fAvvisa" type="datetime-local">` + `<small>` nota ("promemoria a un momento preciso; solo per scadenze non ricorrenti"). `#avvisaRow` serve a nasconderlo per le ricorrenti.

- [ ] **Step 2: `app.js`.**
- `submit`: leggi `oraISO = $('fOra').value`, `avvisaISO = $('fAvvisa').value` (datetime-local → 'YYYY-MM-DDTHH:MM'). Se `avvisaISO` ed evento non ricorrente: valida `Model.minutiPrima(dateISO, oraISO, avvisaISO) > 0`, altrimenti `fMsg('L\'avviso deve essere prima dell\'appuntamento.')` e blocca. Passa `oraISO`/`avvisaISO` a `buildEvent`.
- `toggleAvvisa()`: nascondi `#avvisaRow` quando `$('fRicorrente').checked`; mostralo altrimenti. Chiamalo in `prefill()`/`onCategoria` e su `fRicorrente` change.
- `edit(s)`: `$('fOra').value = s.ora || ''`, `$('fAvvisa').value = s.avvisa || ''`; poi `toggleAvvisa()`.
- `resetForm()`: pulisci `fOra` e `fAvvisa`.
- `render()`: se `s.ora`, mostra l'ora accanto alla data (es. `d + ' · ' + s.ora`). (Per le ricorrenti `s.ora` di norma manca.)

- [ ] **Step 3: `app.css`** — stila `#fOra`, `#fAvvisa`, `#avvisaRow` e la sua nota coi token esistenti; mobile ok (stack <600px, niente scroll orizzontale).

- [ ] **Step 4: Verifica (browser, controller).**
Smoke con stub `GCal.insert`: compila categoria `altro`, nome, data, **ora 15:00**, **avvisa = giorno prima 18:00** → submit → l'evento passato a `insert` ha `start.dateTime` con TZ Rome e `reminders.overrides[0].minutes === 1260`. Spuntando "Si ripete" `#avvisaRow` si nasconde. Un `avvisa` dopo l'evento mostra il messaggio e NON chiama insert. `edit` ripopola ora/avvisa. Console pulita.

- [ ] **Step 5: Commit.**
```bash
git add cervello/index.html cervello/app.js cervello/app.css
git commit -m "feat(cervello): UI ora appuntamento + avvisami a orario"
```
