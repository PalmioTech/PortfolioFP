# Cervello Secondario Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pagina privata `cervello/` dentro il sito che mostra le scadenze personali di Federico e le scrive nel suo Google Calendar, così l'app Calendar lo avvisa sul telefono con anticipo.

**Architecture:** Statico puro, zero backend/npm. Google Identity Services (GIS) prende un access token in-browser; le scadenze sono eventi sul calendario `primary`, marcati con `extendedProperties.private.app='cervello'` e letti filtrando per quella proprietà. Tutta la logica pura (date, ricorrenze, costruzione/mapping evento, query) sta in `model.js` ed è testata con un harness in-browser; `gcal.js` è solo il guscio di rete; `app.js` è il DOM.

**Tech Stack:** HTML/CSS/JS vanilla, Google Identity Services (`accounts.google.com/gsi/client`), Google Calendar REST v3 via `fetch`. Nessuna dipendenza npm, nessun build.

**Spec:** `docs/superpowers/specs/2026-11-16-cervello-secondario-design.md`

## Global Constraints

- Vanilla HTML/CSS/JS. Zero npm, zero build, zero dipendenze. Unico script esterno: GIS (`https://accounts.google.com/gsi/client`).
- Scope OAuth: esattamente `https://www.googleapis.com/auth/calendar.events` (niente scope sensibile).
- Eventi su `calendarId=primary`, filtrati con `privateExtendedProperty=app=cervello`. Mai creare/scegliere calendari.
- Ogni evento: `extendedProperties.private = { app:'cervello', categoria:<cat> }`; promemoria `reminders.overrides=[{method:'popup', minutes: giorniPrima*1440}]`, `useDefault:false`.
- Evento all-day: `start.date=YYYY-MM-DD`, `end.date` = giorno **dopo** (end esclusivo in Google).
- Il Client ID OAuth è pubblico per natura: può stare in `config.js` nel repo pubblico. Nessun secret.
- Stile coi token del sito riusati da `assistentefanta/app.css`: `--accent:#FF3500`, `--lime:#C6FF00`, `--muted:#8C7FA3`, font `Figtree`/`Syne`/`Space Mono`. Copy tutta in italiano.
- `index.html` ha `<meta name="robots" content="noindex">`; la pagina non va linkata dal menu del sito.
- Commit trailer su ogni commit: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

## Review Focus

- **Token scaduto (~1h) a metà sessione** → `list`/`insert`/`patch`/`remove` danno 401: la UI deve mostrare "riconnetti", non fallire muto. (app.js, T3/T4 — verifica manuale)
- **Ricorrenza annuale già passata quest'anno** (es. compleanno a marzo, oggi novembre) → "mancano X giorni" deve puntare all'anno prossimo, non dare negativi. (model.js — testato in T1)
- **Compleanno 29 feb in anno non bisestile** → calcolo prossima occorrenza non deve crashare; convenzione: cade il 1° marzo. (model.js — testato in T1)
- **Primo avvio senza Client ID / lista vuota** → schermata di setup e stato-vuoto chiari, nessun errore in console. (app.js — verifica manuale T3)
- **Nome con apostrofo/accenti** (es. "L'assicurazione") → query `events.list` codificata bene e summary intatto. (model.js — testato in T1)

---

### Task 1: Core puro (`model.js`) + harness di test

**Files:**
- Create: `cervello/model.js`
- Create: `cervello/config.js`
- Create: `cervello/tests/tests.html`, `cervello/tests/harness.js`, `cervello/tests/suite.js`
- Create: `cervello/index.html` (shell minimo: carica `config.js`, `model.js`; gli altri script si aggiungono nei task dopo)

**Interfaces:**
- Consumes: niente.
- Produces: `window.Model` con:
  - `CATEGORIES`: mappa `{ [cat]: { label, icon, colore, ricorrente, meseDefault?, giornoDefault?, giorniPrima } }`. Categorie: `gomme_inv`(🛞,accent,ric,11/1,10), `gomme_est`(🛞,accent,ric,4/15,10), `compleanno`(🎂,lime,ric,3), `assicurazione`(🚗,accent,ric,20), `certificato`(🏅,lime,ric,30), `altro`(📌,muted,non-ric,7).
  - `giorniMancanti(dateISO, todayISO) -> number` — giorni interi da today a date (via UTC, niente DST).
  - `prossimaOccorrenza(dateISO, todayISO) -> string` — prossima data `YYYY-MM-DD` con stesso mese/giorno ≥ today (annuale); 29 feb in anno non bisestile → `MM-DD`=`03-01`.
  - `buildEvent({categoria, nome, dateISO, giorniPrima, ricorrente}) -> object` — risorsa evento Google.
  - `fromEvent(googleEvent) -> { id, categoria, nome, dateISO, ricorrente }` — mapping inverso (nome = summary senza icona iniziale).
  - `buildListQuery({timeMinISO}) -> string` — querystring per `events.list`.

- [ ] **Step 1: Scrivi i test che falliscono** in `cervello/tests/suite.js` (stile assistentefanta: `test('nome', () => assert(...))`).

```js
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
test('nome con apostrofo resta intatto nel summary', () => {
  const ev = Model.buildEvent({categoria:'assicurazione',nome:"L'assicurazione",dateISO:'2026-11-26',giorniPrima:20,ricorrente:true});
  assert(ev.summary.includes("L'assicurazione"));
});
```

- [ ] **Step 2: Apri `cervello/tests/tests.html` nel browser, verifica che falliscano** (Model non definito).
Run: avvia `python3 -m http.server 8010` nella root repo, apri `http://localhost:8010/cervello/tests/tests.html`.
Expected: tutti i test falliti (ReferenceError Model).

- [ ] **Step 3: Implementa `window.Model` in `cervello/model.js`.**
Parsing data: `new Date(iso+'T00:00:00Z')`, diff in giorni via `Math.round((b-a)/86400000)`. `prossimaOccorrenza`: prova mese/giorno nell'anno di today; se < today o data invalida (29 feb non bisestile → `03-01`), passa all'anno dopo. `fromEvent`: `nome` = `summary` tolta l'icona+spazio iniziale; `ricorrente` = `!!googleEvent.recurrence`; `dateISO`=`start.date`.

- [ ] **Step 4: Ricarica `tests.html`, verifica che passino.** Expected: tutti verdi.

- [ ] **Step 5: Commit.**

```bash
git add cervello/model.js cervello/config.js cervello/index.html cervello/tests/
git commit -m "feat(cervello): modello puro (date, ricorrenze, evento) + harness test"
```

---

### Task 2: Guscio Google (`gcal.js`)

**Files:**
- Create: `cervello/gcal.js`
- Modify: `cervello/index.html` (aggiungi `<script src="https://accounts.google.com/gsi/client" async></script>` e `<script src="gcal.js"></script>` dopo `model.js`)

**Interfaces:**
- Consumes: `Model.buildListQuery`, `Model.fromEvent`, `window.CONFIG.CLIENT_ID` (da `config.js`, può essere vuoto; app.js può passarlo da localStorage).
- Produces: `window.GCal` con:
  - `init(clientId)` — crea il token client GIS (`google.accounts.oauth2.initTokenClient`, scope `calendar.events`).
  - `connect() -> Promise<void>` — richiede token interattivo; risolve a token ottenuto.
  - `isConnected() -> boolean`.
  - `list(timeMinISO) -> Promise<Array<scadenza>>` — GET `calendar/v3/calendars/primary/events?<buildListQuery>`; mappa ogni item con `Model.fromEvent`.
  - `insert(eventObj) -> Promise<{id}>` — POST events.
  - `patch(id, eventObj) -> Promise<void>` — PATCH events/{id}.
  - `remove(id) -> Promise<void>` — DELETE events/{id}.
  - Su risposta 401: `GCal` segna disconnesso e lancia `Error('TOKEN_SCADUTO')` così app.js mostra "riconnetti".

- [ ] **Step 1: Implementa `window.GCal` in `cervello/gcal.js`.**
`fetch` a `https://www.googleapis.com/calendar/v3/...` con header `Authorization: Bearer <token>`. Helper interno `req(method, path, body?)` che gestisce 401→`TOKEN_SCADUTO` e `!res.ok`→throw con testo. `list` usa `Model.buildListQuery` e `Model.fromEvent`. Nessun unit test automatico (richiede rete/OAuth): la correttezza del *shaping* è coperta dai test di Model in T1; lo smoke live è rimandato a quando Federico ha il Client ID.

- [ ] **Step 2: Carica `index.html` nel browser e verifica che non ci siano errori di sintassi/caricamento.**
Run: `http://localhost:8010/cervello/` → console pulita, `window.GCal` definito (`typeof GCal.list === 'function'`).
Expected: nessun errore in console; GCal esposto.

- [ ] **Step 3: Commit.**

```bash
git add cervello/gcal.js cervello/index.html
git commit -m "feat(cervello): guscio Google Calendar (GIS auth + REST)"
```

---

### Task 3: UI lettura — connect + dashboard

**Files:**
- Modify: `cervello/index.html` (markup: header, pulsante connetti, campo setup Client ID, contenitore lista; aggiungi `<script src="app.js"></script>` per ultimo e `<link rel="stylesheet" href="app.css">`)
- Create: `cervello/app.css`
- Create: `cervello/app.js`

**Interfaces:**
- Consumes: `Model.*`, `GCal.init/connect/isConnected/list`, `CONFIG.CLIENT_ID`.
- Produces: `window.App` con `render()` (ridisegna la dashboard dalla lista) — usato anche da T4 dopo le scritture. Funzione interna `clientId()` che prende `CONFIG.CLIENT_ID` o `localStorage['cervello_client_id']`.

- [ ] **Step 1: `app.css`** — riusa i token del sito (copia il blocco `:root` + body background da `assistentefanta/app.css`), stili per: header, card scadenza (icona categoria, nome, data, "mancano X giorni"), colore accento per categoria (`accent`/`lime`/`muted`), pulsanti pill, stato-vuoto, schermata setup. Pulsante primario = gradiente arancio come `#btnSold`.

- [ ] **Step 2: `index.html`** — shell: `<meta name="robots" content="noindex">`, header con titolo, `#setup` (input Client ID + salva, mostrato solo se manca), `#connectBar` (pulsante "Connetti Google"), `#list` (dashboard), `#empty` (stato vuoto). Ordine script: `config.js`→`model.js`→GIS→`gcal.js`→`app.js`.

- [ ] **Step 3: `app.js` — flusso lettura.**
Al load: se `clientId()` vuoto → mostra `#setup` (salva su `localStorage['cervello_client_id']` e ricarica); altrimenti `GCal.init(clientId())` e mostra "Connetti". `connect()` → al successo `list(inizio-anno-corrente)` → `render()`. `render()`: per ogni scadenza calcola la data da mostrare (`ricorrente` → `Model.prossimaOccorrenza(dateISO, oggiISO)`, altrimenti `dateISO`) e `giorniMancanti`; ordina per giorni mancanti crescente; icona+colore da `Model.CATEGORIES[categoria]`. Lista vuota → `#empty`. Errore `TOKEN_SCADUTO` → mostra "riconnetti". (`oggiISO` dal browser: `new Date().toISOString().slice(0,10)`.)

- [ ] **Step 4: Verifica manuale nel browser** (`http://localhost:8010/cervello/`):
  - Senza Client ID salvato → appare la schermata setup, console pulita.
  - Dopo aver incollato un Client ID (anche fittizio) → appare "Connetti Google", nessun crash.
  - Smoke live (connect reale + lista) rimandato a quando Federico fornisce il Client ID vero.
Expected: setup e stati vuoti renderizzano, zero errori console.

- [ ] **Step 5: Commit.**

```bash
git add cervello/index.html cervello/app.css cervello/app.js
git commit -m "feat(cervello): UI connect Google + dashboard scadenze"
```

---

### Task 4: UI scrittura — form aggiungi/modifica/elimina

**Files:**
- Modify: `cervello/index.html` (markup form: select categoria, input nome, input data, input giorni-prima, checkbox ricorrente, pulsanti salva/elimina)
- Modify: `cervello/app.js` (wiring form CRUD)
- Modify: `cervello/app.css` (stili form)

**Interfaces:**
- Consumes: `Model.buildEvent`, `Model.CATEGORIES`, `GCal.insert/patch/remove`, `App.render`.
- Produces: niente di nuovo per altri task (ultimo task).

- [ ] **Step 1: `index.html`** — form `#form` con: `<select>` categoria (da `Model.CATEGORIES`), `#nome`, `#data` (`<input type="date">`), `#giorniPrima` (`<input type="number">`), `#ricorrente` (`<input type="checkbox">`), `#salva`, `#elimina` (nascosto in modalità nuovo).

- [ ] **Step 2: `app.js` — CRUD.**
Cambio categoria → precompila `#giorniPrima` e `#ricorrente` dai default di `Model.CATEGORIES[cat]` (e, per `gomme_inv`/`gomme_est`, propone `mese/giorno` default nell'input data se vuoto). Submit nuovo → `Model.buildEvent(input)` → `GCal.insert` → `App.render`. Click su una card → popola il form con `eventId` corrente → submit = `GCal.patch(id, buildEvent)` ; `#elimina` → `confirm()` → `GCal.remove(id)` → `App.render`. Reset form dopo ogni operazione.

- [ ] **Step 3: Verifica manuale nel browser:**
  - Cambiando categoria i default (anticipo, ricorrente) si aggiornano.
  - Il form valida (nome + data obbligatori) e non lancia in console.
  - Flusso completo insert/patch/delete verificato live dopo il setup Client ID di Federico.
Expected: precompilazione default e validazione OK, zero errori console.

- [ ] **Step 4: Commit.**

```bash
git add cervello/index.html cervello/app.js cervello/app.css
git commit -m "feat(cervello): form scadenze (aggiungi/modifica/elimina)"
```

---

## Dopo l'implementazione (fuori dal codice, per Federico)

Smoke live end-to-end possibile solo dopo il setup OAuth di Federico:
1. Crea il Client ID (vedi design, sezione Prerequisito) e incollalo in setup.
2. Connetti Google, aggiungi una scadenza di prova a 2 giorni, controlla che appaia in dashboard e in Google Calendar col promemoria.
3. Verifica che le notifiche di Google Calendar siano attive sul telefono.
