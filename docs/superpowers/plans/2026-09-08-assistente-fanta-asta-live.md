# Assistente Fanta — Asta Live Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web app offline single-device che assiste durante l'asta live del fantacalcio (14 squadre) dicendo, a ogni giocatore chiamato, se serve alla rosa e quanto spendere al massimo.

**Architecture:** Tre parti nettamente separate. `store.js` = stato puro (init, vendite, coda, selettori) esposto come `window.Store`. `advisor.js` = motore consigli puro (max, verdetto, scarsità) esposto come `window.Advisor`, dipende da `Store`. `app.js` = solo wiring DOM. Dati in `data/players.js` (`window.PLAYERS`). Persistenza `localStorage`.

**Tech Stack:** Vanilla HTML/CSS/JS. Zero framework, zero build, zero package manager, nessun backend. Test in-browser (`tests/tests.html`) con harness `assert` fatto in casa, verificato aprendo la pagina e leggendo la console.

## Global Constraints

- **Stack**: vanilla HTML/CSS/JS puro. Nessun framework, build step, npm, o dipendenza esterna a runtime. Nessun backend.
- **Offline**: l'app deve funzionare aperta da `file://` E servita in HTTP. Dati caricati via `<script src="data/players.js">` che assegna `window.PLAYERS` — MAI `fetch()` (bloccato da `file://`).
- **Moduli puri**: `store.js` e `advisor.js` non toccano il DOM né `localStorage`; sono funzioni pure su `(state, players, …)`. Tutta la persistenza e il DOM stanno in `app.js`.
- **Caricamento script (ordine fisso)** in `index.html` e `tests/tests.html`: `store.js` → `advisor.js` → (dati) → `app.js`. `advisor.js` usa `window.Store`.
- **Lingua**: tutta la UI e le stringhe in **italiano**.
- **Config asta** (default, editabili in-app): budget 500, slots `{P:3,D:8,C:8,A:6}`, split `{P:0.08,D:0.32,C:0.28,A:0.32}`, tierMult `{1:2.5,2:1.8,3:1.1,4:0.6,5:0.02}`, modDifesaBoost `{P:1.15,D:1.15}`.
- **Ruoli**: ordine coda fisso `['P','D','C','A']`, alfabetico per `nome` dentro il ruolo (`localeCompare(...,'it')`).
- **Deploy**: cartella `assistentefanta/` in questo repo → `federicopalmieri.it/assistentefanta/`.
- **Commit**: messaggi in italiano, chiudi con `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Scaffold + dati sample + harness di test

**Files:**
- Create: `assistentefanta/index.html`
- Create: `assistentefanta/app.css`
- Create: `assistentefanta/store.js` (stub)
- Create: `assistentefanta/advisor.js` (stub)
- Create: `assistentefanta/app.js` (stub)
- Create: `assistentefanta/data/players.js`
- Create: `assistentefanta/tests/tests.html`
- Create: `assistentefanta/tests/harness.js`
- Create: `assistentefanta/tests/suite.js` (vuoto per ora)

**Interfaces:**
- Produces: `window.PLAYERS = { meta, giocatori: [...] }`; harness globali `test(name, fn)`, `assert(cond, msg)`, `assertEqual(actual, expected, msg)`, `summary()`.

- [ ] **Step 1: Dati sample** — `assistentefanta/data/players.js`

```js
window.PLAYERS = {
  meta: { stagione: '2025-26', generato: '2026-09-08 (SAMPLE)', fonte_listone: 'sample', note: 'dati fittizi per sviluppo' },
  giocatori: [
    { id: 'falcone-lecce',        nome: 'Falcone',     squadra: 'Lecce',     ruolo: 'P', quota: 9,  titolarita: 'titolare',    tier: 4, nota: '',                          flags: [],            affidabilita_difesa: 'bassa' },
    { id: 'meret-napoli',         nome: 'Meret',       squadra: 'Napoli',    ruolo: 'P', quota: 13, titolarita: 'ballottaggio', tier: 3, nota: 'ballottaggio con Caprile',  flags: [],            affidabilita_difesa: 'media' },
    { id: 'sommer-inter',         nome: 'Sommer',      squadra: 'Inter',     ruolo: 'P', quota: 16, titolarita: 'titolare',    tier: 2, nota: '',                          flags: [],            affidabilita_difesa: 'alta' },
    { id: 'bastoni-inter',        nome: 'Bastoni',     squadra: 'Inter',     ruolo: 'D', quota: 22, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: 'alta' },
    { id: 'dimarco-inter',        nome: 'Dimarco',     squadra: 'Inter',     ruolo: 'D', quota: 24, titolarita: 'titolare',    tier: 1, nota: 'rigorista occasionale',    flags: ['rigorista'], affidabilita_difesa: 'alta' },
    { id: 'gatti-juventus',       nome: 'Gatti',       squadra: 'Juventus',  ruolo: 'D', quota: 14, titolarita: 'titolare',    tier: 3, nota: '',                          flags: [],            affidabilita_difesa: 'media' },
    { id: 'zortea-cagliari',      nome: 'Zortea',      squadra: 'Cagliari',  ruolo: 'D', quota: 8,  titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio fascia',      flags: [],            affidabilita_difesa: 'bassa' },
    { id: 'barella-inter',        nome: 'Barella',     squadra: 'Inter',     ruolo: 'C', quota: 26, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: null },
    { id: 'fagioli-fiorentina',   nome: 'Fagioli',     squadra: 'Fiorentina',ruolo: 'C', quota: 11, titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio a centrocampo',flags: [],           affidabilita_difesa: null },
    { id: 'koopmeiners-juventus', nome: 'Koopmeiners', squadra: 'Juventus',  ruolo: 'C', quota: 24, titolarita: 'titolare',    tier: 2, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
    { id: 'zaniolo-udinese',      nome: 'Zaniolo',     squadra: 'Udinese',   ruolo: 'C', quota: 9,  titolarita: 'riserva',     tier: 5, nota: '',                          flags: [],            affidabilita_difesa: null },
    { id: 'colombo-genoa',        nome: 'Colombo',     squadra: 'Genoa',     ruolo: 'A', quota: 7,  titolarita: 'ballottaggio', tier: 4, nota: 'ballottaggio punta',       flags: [],            affidabilita_difesa: null },
    { id: 'lautaro-inter',        nome: 'Lautaro',     squadra: 'Inter',     ruolo: 'A', quota: 40, titolarita: 'titolare',    tier: 1, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
    { id: 'retegui-atalanta',     nome: 'Retegui',     squadra: 'Atalanta',  ruolo: 'A', quota: 34, titolarita: 'titolare',    tier: 1, nota: '',                          flags: ['rigorista'], affidabilita_difesa: null },
    { id: 'thuram-inter',         nome: 'Thuram',      squadra: 'Inter',     ruolo: 'A', quota: 32, titolarita: 'titolare',    tier: 1, nota: '',                          flags: [],            affidabilita_difesa: null }
  ]
};
```

- [ ] **Step 2: Harness** — `assistentefanta/tests/harness.js`

```js
window.__results = { pass: 0, fail: 0, fails: [] };
function test(name, fn) {
  try { fn(); window.__results.pass++; console.log('✅ ' + name); }
  catch (e) { window.__results.fail++; window.__results.fails.push(name + ': ' + e.message); console.error('❌ ' + name + ' — ' + e.message); }
}
function assert(cond, msg) { if (!cond) throw new Error(msg || 'assert failed'); }
function assertEqual(actual, expected, msg) {
  if (actual !== expected) throw new Error((msg || '') + ' expected ' + JSON.stringify(expected) + ' got ' + JSON.stringify(actual));
}
function summary() {
  const r = window.__results;
  const line = 'TESTS: ' + r.pass + ' passed, ' + r.fail + ' failed';
  console.log(line);
  document.body.textContent = line + (r.fail ? ' — ' + r.fails.join(' | ') : '');
  return line;
}
```

- [ ] **Step 3: Test page** — `assistentefanta/tests/tests.html`

```html
<!doctype html>
<html lang="it"><head><meta charset="utf-8"><title>Test — Assistente Fanta</title></head>
<body>
<script src="../store.js"></script>
<script src="../advisor.js"></script>
<script src="../data/players.js"></script>
<script src="harness.js"></script>
<script src="suite.js"></script>
<script>summary();</script>
</body></html>
```

- [ ] **Step 4: Stub dei moduli** — creare i tre file con export vuoto

`assistentefanta/store.js`:
```js
window.Store = (function () {
  return {};
})();
```
`assistentefanta/advisor.js`:
```js
window.Advisor = (function (Store) {
  return {};
})(window.Store);
```
`assistentefanta/app.js`:
```js
// wiring DOM — riempito nei task UI
```

- [ ] **Step 5: Suite vuota** — `assistentefanta/tests/suite.js`

```js
// i test vengono aggiunti qui nei task successivi
```

- [ ] **Step 6: index.html** — `assistentefanta/index.html`

```html
<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Assistente Fanta — Asta Live</title>
  <link rel="stylesheet" href="app.css">
</head>
<body>
<main id="app">
  <header id="hdr">
    <div id="phase">—</div>
    <div id="mybudget">—</div>
    <div id="perslot">—</div>
  </header>
  <section id="cols">
    <aside id="roster"></aside>
    <div id="center">
      <div id="card"></div>
      <div id="advice"></div>
      <div id="saleflow"></div>
      <div id="queue"></div>
    </div>
    <aside id="rivals"></aside>
  </section>
  <footer id="controls">
    <button id="btnPrev" type="button">◀</button>
    <button id="btnNext" type="button">▶</button>
    <button id="btnUndo" type="button">Undo</button>
    <input id="search" type="search" placeholder="cerca…">
    <button id="btnExport" type="button">Export</button>
    <button id="btnImport" type="button">Import</button>
    <input id="fileImport" type="file" accept="application/json" hidden>
    <button id="btnConfig" type="button">⚙︎</button>
    <button id="btnReset" type="button">Reset</button>
  </footer>
  <div id="configPanel" hidden></div>
</main>
<script src="store.js"></script>
<script src="advisor.js"></script>
<script src="data/players.js"></script>
<script src="app.js"></script>
</body>
</html>
```

- [ ] **Step 7: CSS minimo** — `assistentefanta/app.css`

```css
:root { --bg:#060508; --fg:#f4f2ee; --accent:#FF3500; --lime:#C6FF00; --muted:#9a978f; --card:#141118; --ok:#39d353; --warn:#FF3500; }
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font-family:system-ui,sans-serif; }
#hdr { display:flex; gap:1rem; align-items:baseline; padding:.75rem 1rem; border-bottom:1px solid #221c29; }
#cols { display:grid; grid-template-columns:1fr 2fr 1fr; gap:1rem; padding:1rem; }
#controls { display:flex; gap:.5rem; flex-wrap:wrap; padding:.75rem 1rem; border-top:1px solid #221c29; }
button { cursor:pointer; }
@media (max-width:900px){ #cols { grid-template-columns:1fr; } }
```

- [ ] **Step 8: Verify — carica in browser**

Run: `preview_start` con `{url}` sul percorso `file://` di `assistentefanta/tests/tests.html` (oppure avvia un server statico e naviga lì).
Expected: la pagina mostra `TESTS: 0 passed, 0 failed`; nessun errore in console (`read_console_messages`); `window.PLAYERS.giocatori.length === 15` (verifica con `javascript_tool`).

- [ ] **Step 9: Commit**

```bash
git add assistentefanta/
git commit -m "feat(assistentefanta): scaffold, dati sample, harness test"
```

---

### Task 2: store.js — init stato + selettori squadra

**Files:**
- Modify: `assistentefanta/store.js`
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces (in `window.Store`): `DEFAULT_CONFIG`, `initState(config?, teamNames?) → state`, `playerById(players, id) → player|null`, `teamSpent(state, teamId) → number`, `teamBudget(state, teamId) → number`, `teamRosterCountByRole(state, players, teamId) → {P,D,C,A}`, `teamSlotsRemaining(state, players, teamId) → {P,D,C,A}`, `myId(state) → string`.
- State shape: `{ config, squadre:[{id,nome,isMe}×14], vendite:[], cursore:{index:0}, overrides:{} }`.

- [ ] **Step 1: Test (append a `tests/suite.js`)**

```js
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
```

- [ ] **Step 2: Verifica fallimento** — apri `tests/tests.html`, `read_console_messages`. Expected: 3 `❌` (`Store.initState is not a function`).

- [ ] **Step 3: Implementazione** — sostituisci il corpo di `store.js`

```js
window.Store = (function () {
  const DEFAULT_CONFIG = {
    budget: 500,
    slots: { P: 3, D: 8, C: 8, A: 6 },
    split: { P: 0.08, D: 0.32, C: 0.28, A: 0.32 },
    tierMult: { 1: 2.5, 2: 1.8, 3: 1.1, 4: 0.6, 5: 0.02 },
    modDifesaBoost: { P: 1.15, D: 1.15 }
  };
  const ROLES = ['P', 'D', 'C', 'A'];

  function initState(config, teamNames) {
    const cfg = config || DEFAULT_CONFIG;
    const squadre = [];
    for (let i = 0; i < 14; i++) {
      squadre.push({ id: 't' + i, nome: i === 0 ? 'IO' : ((teamNames && teamNames[i]) || ('Sq ' + i)), isMe: i === 0 });
    }
    return { config: cfg, squadre, vendite: [], cursore: { index: 0 }, overrides: {} };
  }
  function myId(state) { const t = state.squadre.find(s => s.isMe); return t ? t.id : 't0'; }
  function playerById(players, id) { return players.find(p => p.id === id) || null; }
  function teamSpent(state, teamId) {
    return state.vendite.filter(v => v.squadraId === teamId).reduce((s, v) => s + v.prezzo, 0);
  }
  function teamBudget(state, teamId) { return state.config.budget - teamSpent(state, teamId); }
  function teamRosterCountByRole(state, players, teamId) {
    const c = { P: 0, D: 0, C: 0, A: 0 };
    for (const v of state.vendite) {
      if (v.squadraId !== teamId) continue;
      const p = playerById(players, v.giocatoreId);
      if (p) c[p.ruolo]++;
    }
    return c;
  }
  function teamSlotsRemaining(state, players, teamId) {
    const filled = teamRosterCountByRole(state, players, teamId);
    const rem = {};
    for (const r of ROLES) rem[r] = state.config.slots[r] - filled[r];
    return rem;
  }
  return { DEFAULT_CONFIG, ROLES, initState, myId, playerById, teamSpent, teamBudget, teamRosterCountByRole, teamSlotsRemaining };
})();
```

- [ ] **Step 4: Verifica passaggio** — ricarica `tests/tests.html`. Expected: i 3 test `✅`, `read_console_messages` non mostra `❌`.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/store.js assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): store init stato + selettori squadra"
```

---

### Task 3: store.js — vendite (valida / applica / undo)

**Files:**
- Modify: `assistentefanta/store.js`
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces: `soldIds(state) → Set`, `validateSale(state, players, sale) → {ok, reason?}`, `applySale(state, sale) → state'`, `undoSale(state) → state'`. `sale = {giocatoreId, squadraId, prezzo}`. `applySale` è puro (non valida): aggiunge `{…sale, seq}` a `vendite`. `undoSale` rimuove l'ultima.

- [ ] **Step 1: Test (append a `tests/suite.js`)**

```js
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
  s = Store.applySale(s, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'meret-napoli',  squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'sommer-inter',  squadraId: 't0', prezzo: 1 });
  const r = Store.validateSale(s, PLAYERS.giocatori, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 1 });
  assertEqual(r.ok, false); // P pieni (3) + già venduto
});
```

- [ ] **Step 2: Verifica fallimento** — apri `tests/tests.html`. Expected: nuovi test `❌` (`validateSale is not a function`).

- [ ] **Step 3: Implementazione** — dentro l'IIFE di `store.js`, aggiungi le funzioni e includile nel `return`

```js
  function soldIds(state) { return new Set(state.vendite.map(v => v.giocatoreId)); }
  function validateSale(state, players, sale) {
    const p = playerById(players, sale.giocatoreId);
    if (!p) return { ok: false, reason: 'giocatore inesistente' };
    if (soldIds(state).has(sale.giocatoreId)) return { ok: false, reason: 'già venduto' };
    if (!(sale.prezzo >= 1)) return { ok: false, reason: 'prezzo minimo 1' };
    if (sale.prezzo > teamBudget(state, sale.squadraId)) return { ok: false, reason: 'budget insufficiente' };
    if (teamSlotsRemaining(state, players, sale.squadraId)[p.ruolo] <= 0) return { ok: false, reason: 'slot ruolo pieno' };
    return { ok: true };
  }
  function applySale(state, sale) {
    const seq = state.vendite.length ? state.vendite[state.vendite.length - 1].seq + 1 : 1;
    return Object.assign({}, state, { vendite: state.vendite.concat([{ giocatoreId: sale.giocatoreId, squadraId: sale.squadraId, prezzo: sale.prezzo, seq }]) });
  }
  function undoSale(state) {
    if (!state.vendite.length) return state;
    return Object.assign({}, state, { vendite: state.vendite.slice(0, -1) });
  }
```
Aggiungi `soldIds, validateSale, applySale, undoSale` all'oggetto restituito.

- [ ] **Step 4: Verifica passaggio** — ricarica `tests/tests.html`. Expected: tutti i test vendite `✅`, nessun `❌`.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/store.js assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): store vendite valida/applica/undo"
```

---

### Task 4: store.js — coda + overrides

**Files:**
- Modify: `assistentefanta/store.js`
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces: `applyOverrides(players, overrides) → players'` (nuovo array, merge di `overrides[id]` su ogni giocatore), `buildQueue(players) → players[]` (ordinati per ruolo P,D,C,A poi `nome` alfabetico `it`), `firstUnsoldIndex(queue, sold, from=0) → number` (-1 se nessuno).

- [ ] **Step 1: Test (append a `tests/suite.js`)**

```js
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
```

- [ ] **Step 2: Verifica fallimento** — apri `tests/tests.html`. Expected: nuovi `❌`.

- [ ] **Step 3: Implementazione** — dentro l'IIFE, aggiungi e includi nel `return`

```js
  function applyOverrides(players, overrides) {
    if (!overrides) return players;
    return players.map(p => overrides[p.id] ? Object.assign({}, p, overrides[p.id]) : p);
  }
  function buildQueue(players) {
    return players.slice().sort((a, b) => {
      const r = ROLES.indexOf(a.ruolo) - ROLES.indexOf(b.ruolo);
      if (r !== 0) return r;
      return a.nome.localeCompare(b.nome, 'it');
    });
  }
  function firstUnsoldIndex(queue, sold, from) {
    for (let i = (from || 0); i < queue.length; i++) if (!sold.has(queue[i].id)) return i;
    return -1;
  }
```
Aggiungi `applyOverrides, buildQueue, firstUnsoldIndex` al `return`.

- [ ] **Step 4: Verifica passaggio** — ricarica. Expected: tutti `✅`.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/store.js assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): store coda + overrides"
```

---

### Task 5: advisor.js — max consigliato

**Files:**
- Modify: `assistentefanta/advisor.js`
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces (in `window.Advisor`): `roleTarget(config, ruolo) → number`, `roleSpentMe(state, players, ruolo) → number`, `roleRemainingBudget(state, players, ruolo) → number`, `mySlotsRemaining(state, players, ruolo) → number`, `maxConsigliato(state, players, player) → number`.
- Consumes: `window.Store` (`myId`, `teamSlotsRemaining`).
- Formula: `mediaSlot = residuoRuolo/slotRes; base = mediaSlot*tierMult[tier]; se ruolo∈{P,D} e affidabilita_difesa==='alta' → base*=modDifesaBoost[ruolo]; cap = residuoRuolo-(slotRes-1); max = round(min(base,cap))`, clamp `[1, residuoRuolo]`; `0` se slot pieni.

- [ ] **Step 1: Test (append a `tests/suite.js`)**

```js
test('maxConsigliato Lautaro fresco = 67', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'lautaro-inter');
  assertEqual(Advisor.maxConsigliato(s, PLAYERS.giocatori, p), 67);
});
test('maxConsigliato Bastoni fresco = 58 (boost mod difesa)', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'bastoni-inter');
  assertEqual(Advisor.maxConsigliato(s, PLAYERS.giocatori, p), 58);
});
test('maxConsigliato Sommer fresco = 28', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'sommer-inter');
  assertEqual(Advisor.maxConsigliato(s, PLAYERS.giocatori, p), 28);
});
test('maxConsigliato = 0 se slot ruolo pieni', () => {
  let s = Store.initState();
  s = Store.applySale(s, { giocatoreId: 'falcone-lecce', squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'meret-napoli',  squadraId: 't0', prezzo: 1 });
  s = Store.applySale(s, { giocatoreId: 'sommer-inter',  squadraId: 't0', prezzo: 1 });
  const p = Store.playerById(PLAYERS.giocatori, 'falcone-lecce');
  assertEqual(Advisor.maxConsigliato(s, PLAYERS.giocatori, p), 0);
});
```

> Calcoli attesi (budget 500): A target=160, 6 slot → mediaSlot 26.67; Lautaro tier1 ×2.5=66.7→**67**. D target=160, 8 slot → mediaSlot 20; Bastoni tier1 ×2.5=50, ×1.15=57.5→**58**. P target=40, 3 slot → mediaSlot 13.33; Sommer tier2 ×1.8=24, ×1.15=27.6→**28**.

- [ ] **Step 2: Verifica fallimento** — apri `tests/tests.html`. Expected: nuovi `❌`.

- [ ] **Step 3: Implementazione** — sostituisci il corpo di `advisor.js`

```js
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
    const max = Math.round(Math.min(base, cap));
    return Math.max(1, Math.min(max, residuo));
  }
  return { roleTarget, roleSpentMe, roleRemainingBudget, mySlotsRemaining, maxConsigliato };
})(window.Store);
```

- [ ] **Step 4: Verifica passaggio** — ricarica. Expected: 4 nuovi `✅`.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/advisor.js assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): advisor max consigliato"
```

---

### Task 6: advisor.js — scarsità + verdetto + advice

**Files:**
- Modify: `assistentefanta/advisor.js`
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces: `scarsita(state, players, ruolo) → {titolari, squadre, ratio, alta}`, `verdetto(state, players, player) → 'PRIORITA'|'SERVE'|'NON_SERVE'`, `advice(state, players, player, rilancio?) → {max, verdetto, scarsita, overpay}`.
- Regole verdetto: `NON_SERVE` se slot pieni **o** (`residuoRuolo <= slotRes` e `tier <= 2`, cioè resta ~1cr/slot: non ti puoi permettere un top). `PRIORITA` se `titolarita==='titolare'` e `scarsita.alta`. Altrimenti `SERVE`. Scarsità: `titolari rimasti` = giocatori del ruolo non venduti con `titolarita==='titolare' || tier<=3`; `squadre` = squadre con slot residuo nel ruolo; `alta = ratio<1`. `overpay = max(0, rilancio-max)` se `rilancio` è numero.

- [ ] **Step 1: Test (append a `tests/suite.js`)**

```js
test('scarsita A fresco: 3 titolari, 14 squadre, alta', () => {
  const s = Store.initState();
  const sc = Advisor.scarsita(s, PLAYERS.giocatori, 'A');
  assertEqual(sc.titolari, 3); // Lautaro, Retegui, Thuram
  assertEqual(sc.squadre, 14);
  assertEqual(sc.alta, true);
});
test('verdetto Lautaro fresco = PRIORITA (titolare + scarsità alta)', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'lautaro-inter');
  assertEqual(Advisor.verdetto(s, PLAYERS.giocatori, p), 'PRIORITA');
});
test('verdetto Colombo fresco = SERVE (ballottaggio, non priorità)', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'colombo-genoa');
  assertEqual(Advisor.verdetto(s, PLAYERS.giocatori, p), 'SERVE');
});
test('verdetto NON_SERVE se slot ruolo A pieni', () => {
  let s = Store.initState();
  const ids = ['colombo-genoa','lautaro-inter','retegui-atalanta','thuram-inter'];
  ids.forEach(id => { s = Store.applySale(s, { giocatoreId: id, squadraId: 't0', prezzo: 1 }); });
  // 4 su 6 A presi; testiamo un ruolo pieno forzando config a 4 slot A
  s.config = Object.assign({}, s.config, { slots: Object.assign({}, s.config.slots, { A: 4 }) });
  const p = Store.playerById(PLAYERS.giocatori, 'colombo-genoa');
  assertEqual(Advisor.verdetto(s, PLAYERS.giocatori, p), 'NON_SERVE');
});
test('verdetto NON_SERVE se budget ruolo ~1cr/slot e tier top', () => {
  let s = Store.initState();
  // io spendo 156 su un A → residuo A = 160-156 = 4, slot A res = 5 → 4<=5, tier1 Thuram → NON_SERVE
  s = Store.applySale(s, { giocatoreId: 'lautaro-inter', squadraId: 't0', prezzo: 156 });
  const p = Store.playerById(PLAYERS.giocatori, 'thuram-inter');
  assertEqual(Advisor.verdetto(s, PLAYERS.giocatori, p), 'NON_SERVE');
});
test('advice overpay = rilancio - max', () => {
  const s = Store.initState();
  const p = Store.playerById(PLAYERS.giocatori, 'lautaro-inter');
  const a = Advisor.advice(s, PLAYERS.giocatori, p, 80);
  assertEqual(a.max, 67);
  assertEqual(a.overpay, 13);
});
```

- [ ] **Step 2: Verifica fallimento** — apri `tests/tests.html`. Expected: nuovi `❌`.

- [ ] **Step 3: Implementazione** — dentro l'IIFE di `advisor.js`, aggiungi e includi nel `return`

```js
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
```
Aggiungi `scarsita, verdetto, advice` al `return`.

- [ ] **Step 4: Verifica passaggio** — ricarica. Expected: nuovi `✅`, zero `❌`.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/advisor.js assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): advisor scarsità + verdetto + advice"
```

---

### Task 7: app.js — boot, render card corrente + coda + navigazione

**Files:**
- Modify: `assistentefanta/app.js`
- Modify: `assistentefanta/app.css`

**Interfaces:**
- Consumes: `window.Store`, `window.Advisor`, `window.PLAYERS`.
- Produces (globali app.js): `STATE`, `QUEUE`, `boot()`, `rebuildQueue()`, `currentPlayer()`, `render()`, `go(delta)`, `jumpTo(id)`. Player corrente = `QUEUE[STATE.cursore.index]`.

- [ ] **Step 1: Implementazione** — `assistentefanta/app.js`

```js
'use strict';
let STATE, QUEUE, PLAYERS_EFF;
const $ = (id) => document.getElementById(id);

function rebuildQueue() {
  PLAYERS_EFF = Store.applyOverrides(PLAYERS.giocatori, STATE.overrides);
  QUEUE = Store.buildQueue(PLAYERS_EFF);
}
function currentPlayer() { return QUEUE[STATE.cursore.index] || null; }

function badgeTitolarita(t) {
  const map = { titolare: '🟢 titolare', ballottaggio: '🟡 ballottaggio', riserva: '🔴 riserva', incerto: '⚪ incerto' };
  return map[t] || t;
}
function verdettoLabel(v) {
  return { PRIORITA: '⭐ PRIORITÀ', SERVE: '✅ SERVE', NON_SERVE: '⛔ NON SERVE' }[v] || v;
}

function renderCard() {
  const p = currentPlayer();
  if (!p) { $('card').innerHTML = '<em>Coda finita.</em>'; $('advice').innerHTML = ''; return; }
  const a = Advisor.advice(STATE, PLAYERS_EFF, p);
  const sc = a.scarsita;
  $('card').innerHTML =
    '<h2>' + p.nome + ' <small>' + p.squadra + '</small></h2>' +
    '<div>' + p.ruolo + ' · tier ' + p.tier + ' · ' + badgeTitolarita(p.titolarita) + ' · quota ' + p.quota + '</div>' +
    (p.nota ? '<div class="nota">' + p.nota + '</div>' : '');
  $('advice').innerHTML =
    '<div class="verdetto v-' + a.verdetto + '">' + verdettoLabel(a.verdetto) + '</div>' +
    '<div class="max">max consigliato: <strong>' + a.max + '</strong></div>' +
    '<div class="scars">scarsità ' + p.ruolo + ': ' + sc.titolari + ' titolari / ' + sc.squadre + ' squadre' + (sc.alta ? ' · ALTA' : '') + '</div>';
}
function renderHeader() {
  const p = currentPlayer();
  const me = Store.myId(STATE);
  const ruolo = p ? p.ruolo : '—';
  const slotRes = p ? Advisor.mySlotsRemaining(STATE, PLAYERS_EFF, ruolo) : 0;
  const resBudget = p ? Math.max(0, Advisor.roleRemainingBudget(STATE, PLAYERS_EFF, ruolo)) : 0;
  $('phase').textContent = 'Ruolo in asta: ' + ruolo;
  $('mybudget').textContent = 'Budget: ' + Store.teamBudget(STATE, me);
  $('perslot').textContent = slotRes > 0 ? ('cr/slot ' + ruolo + ': ' + Math.round(resBudget / slotRes)) : '';
}
function renderQueue() {
  const sold = Store.soldIds(STATE);
  const html = QUEUE.map((p, i) => {
    const cls = (i === STATE.cursore.index ? 'cur' : '') + (sold.has(p.id) ? ' sold' : '');
    return '<li class="' + cls + '" data-id="' + p.id + '">' + p.ruolo + ' ' + p.nome + ' <small>' + p.squadra + '</small></li>';
  }).join('');
  $('queue').innerHTML = '<ul id="qlist">' + html + '</ul>';
  const cur = $('qlist').querySelector('.cur');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}
function render() { rebuildQueue(); renderHeader(); renderCard(); renderQueue(); }

function go(delta) {
  const n = STATE.cursore.index + delta;
  if (n >= 0 && n < QUEUE.length) { STATE.cursore.index = n; render(); }
}
function jumpTo(id) {
  const i = QUEUE.findIndex(p => p.id === id);
  if (i >= 0) { STATE.cursore.index = i; render(); }
}
function wireEvents() {
  $('btnPrev').onclick = () => go(-1);
  $('btnNext').onclick = () => go(1);
  $('queue').onclick = (e) => { const li = e.target.closest('li'); if (li) jumpTo(li.dataset.id); };
}
function boot() { STATE = Store.initState(); rebuildQueue(); render(); wireEvents(); }
document.addEventListener('DOMContentLoaded', boot);
```

- [ ] **Step 2: CSS card/coda** — append a `assistentefanta/app.css`

```css
#center { display:flex; flex-direction:column; gap:.75rem; }
#card h2 { margin:.2rem 0; } #card small { color:var(--muted); font-weight:400; }
.nota { color:var(--lime); font-size:.9rem; }
.verdetto { font-size:1.4rem; font-weight:700; }
.v-PRIORITA { color:var(--lime); } .v-SERVE { color:var(--ok); } .v-NON_SERVE { color:var(--muted); }
.max strong { color:var(--accent); font-size:1.3rem; }
#queue { max-height:40vh; overflow:auto; border:1px solid #221c29; border-radius:8px; }
#qlist { list-style:none; margin:0; padding:0; }
#qlist li { padding:.35rem .6rem; border-bottom:1px solid #17131d; }
#qlist li.cur { background:#241a0e; border-left:3px solid var(--accent); }
#qlist li.sold { opacity:.35; text-decoration:line-through; }
```

- [ ] **Step 3: Verify in browser**

`preview_start` su `assistentefanta/index.html`. Expected: header "Ruolo in asta: P", card mostra **Falcone** (primo P alfabetico) con verdetto/max; lista coda con Falcone evidenziato; nessun errore console. Click su **▶** → passa a Meret. Click su un nome in coda → salta a quel giocatore.

- [ ] **Step 4: Commit**

```bash
git add assistentefanta/app.js assistentefanta/app.css
git commit -m "feat(assistentefanta): render card + coda + navigazione"
```

---

### Task 8: app.js — flusso VENDUTO (assegna squadra + prezzo) + undo

**Files:**
- Modify: `assistentefanta/app.js`
- Modify: `assistentefanta/app.css`

**Interfaces:**
- Consumes: `Store.validateSale/applySale/undoSale`, `Store.soldIds/firstUnsoldIndex`.
- Produces: `openSale()`, `confirmSale(squadraId, prezzo)`, `doUndo()`, `advanceAfterSale()`. Dopo una vendita, il cursore avanza al primo giocatore non venduto da `index`.

- [ ] **Step 1: Implementazione** — aggiungi a `assistentefanta/app.js` (e chiama `renderSaleFlow()` dentro `render()`)

```js
let SALE = { open: false, prezzo: 1 };
function renderSaleFlow() {
  if (!SALE.open || !currentPlayer()) { $('saleflow').innerHTML = ''; return; }
  const teams = STATE.squadre.map(t =>
    '<button class="teamBtn' + (t.isMe ? ' me' : '') + '" data-team="' + t.id + '">' + t.nome + ' (' + Store.teamBudget(STATE, t.id) + ')</button>'
  ).join('');
  $('saleflow').innerHTML =
    '<div class="price">Prezzo: <strong id="pz">' + SALE.prezzo + '</strong> ' +
    '<button data-add="1">+1</button><button data-add="5">+5</button><button data-add="10">+10</button>' +
    '<button data-add="-1">-1</button><button data-set="1">reset</button></div>' +
    '<div class="teams">' + teams + '</div>' +
    '<div class="err" id="saleErr"></div>';
}
function openSale() { SALE = { open: true, prezzo: 1 }; renderSaleFlow(); }
function advanceAfterSale() {
  const sold = Store.soldIds(STATE);
  const next = Store.firstUnsoldIndex(QUEUE, sold, STATE.cursore.index);
  STATE.cursore.index = next >= 0 ? next : STATE.cursore.index;
}
function confirmSale(squadraId) {
  const p = currentPlayer();
  const sale = { giocatoreId: p.id, squadraId, prezzo: SALE.prezzo };
  const v = Store.validateSale(STATE, PLAYERS_EFF, sale);
  if (!v.ok) { const el = $('saleErr'); if (el) el.textContent = 'Errore: ' + v.reason; return; }
  STATE = Store.applySale(STATE, sale);
  SALE.open = false;
  advanceAfterSale();
  render();
}
function doUndo() { STATE = Store.undoSale(STATE); render(); }
```
In `render()` aggiungi la chiamata: dopo `renderCard();` inserisci `renderSaleFlow();`.
In `wireEvents()` aggiungi:
```js
  $('btnUndo').onclick = doUndo;
  $('card').addEventListener('dblclick', openSale); // doppio click sulla card apre la vendita
  $('saleflow').addEventListener('click', (e) => {
    const t = e.target;
    if (t.dataset.add) { SALE.prezzo = Math.max(1, SALE.prezzo + parseInt(t.dataset.add, 10)); renderSaleFlow(); }
    else if (t.dataset.set) { SALE.prezzo = parseInt(t.dataset.set, 10); renderSaleFlow(); }
    else if (t.dataset.team) { confirmSale(t.dataset.team); }
  });
```
Aggiungi anche un pulsante "VENDUTO" nella card: in `renderCard()`, in fondo all'HTML di `#advice`, aggiungi `'<button id="btnSold" type="button">VENDUTO</button>'` e in `wireEvents` delega: `$('advice').addEventListener('click', (e)=>{ if(e.target.id==='btnSold') openSale(); });`

- [ ] **Step 2: CSS** — append a `app.css`

```css
.teams { display:grid; grid-template-columns:repeat(4,1fr); gap:.35rem; margin-top:.5rem; }
.teamBtn { padding:.5rem; border:1px solid #2a2233; background:#17131d; color:var(--fg); border-radius:6px; }
.teamBtn.me { border-color:var(--accent); color:var(--accent); font-weight:700; }
.price button { margin:0 .1rem; } .err { color:var(--accent); min-height:1.2em; }
#btnSold { margin-top:.4rem; background:var(--accent); color:#000; border:0; padding:.5rem 1rem; border-radius:6px; font-weight:700; }
```

- [ ] **Step 3: Verify in browser**

`preview_start` su `index.html`. Su Falcone: click **VENDUTO** → appare tastierino prezzo + griglia 14 squadre. `+5` due volte → prezzo 11. Click **IO** → Falcone assegnato, budget IO scende a 489, card avanza a Meret, in coda Falcone barrato. Click **Undo** → torna, budget 500, Falcone di nuovo attivo. Verifica assenza errori console; prova un prezzo > budget su una squadra per vedere il messaggio d'errore.

- [ ] **Step 4: Commit**

```bash
git add assistentefanta/app.js assistentefanta/app.css
git commit -m "feat(assistentefanta): flusso venduto + undo"
```

---

### Task 9: app.js — pannello mia rosa + pannello rivali

**Files:**
- Modify: `assistentefanta/app.js`
- Modify: `assistentefanta/app.css`

**Interfaces:**
- Produces: `renderRoster()`, `renderRivals()` (chiamate in `render()`). Evidenzia i rivali con slot residuo nel ruolo corrente.

- [ ] **Step 1: Implementazione** — aggiungi a `app.js` e chiama entrambe in `render()`

```js
function playersOfTeam(teamId) {
  return STATE.vendite.filter(v => v.squadraId === teamId).map(v => {
    const p = Store.playerById(PLAYERS_EFF, v.giocatoreId);
    return { nome: p ? p.nome : v.giocatoreId, ruolo: p ? p.ruolo : '?', prezzo: v.prezzo };
  });
}
function renderRoster() {
  const me = Store.myId(STATE);
  const rem = Store.teamSlotsRemaining(STATE, PLAYERS_EFF, me);
  const rows = ['P', 'D', 'C', 'A'].map(r => {
    const list = playersOfTeam(me).filter(x => x.ruolo === r).map(x => x.nome + ' (' + x.prezzo + ')').join(', ');
    return '<div class="rrow"><b>' + r + '</b> ' + (STATE.config.slots[r] - rem[r]) + '/' + STATE.config.slots[r] + ' — ' + (list || '<span class=muted>vuoto</span>') + '</div>';
  }).join('');
  $('roster').innerHTML = '<h3>La mia rosa</h3>' + rows + '<div class="rbudget">Budget: <b>' + Store.teamBudget(STATE, me) + '</b></div>';
}
function renderRivals() {
  const p = currentPlayer();
  const ruolo = p ? p.ruolo : null;
  const rows = STATE.squadre.filter(t => !t.isMe).map(t => {
    const rem = Store.teamSlotsRemaining(STATE, PLAYERS_EFF, t.id);
    const compete = ruolo && rem[ruolo] > 0;
    return '<div class="rivrow' + (compete ? ' compete' : '') + '"><b>' + t.nome + '</b> ' +
      Store.teamBudget(STATE, t.id) + 'cr · ' + ['P', 'D', 'C', 'A'].map(r => r + rem[r]).join(' ') + '</div>';
  }).join('');
  $('rivals').innerHTML = '<h3>Rivali</h3>' + rows;
}
```
In `render()` aggiungi `renderRoster(); renderRivals();`.

- [ ] **Step 2: CSS** — append a `app.css`

```css
#roster, #rivals { font-size:.85rem; border:1px solid #221c29; border-radius:8px; padding:.5rem; max-height:80vh; overflow:auto; }
#roster h3, #rivals h3 { margin:.2rem 0 .5rem; }
.rrow, .rivrow { padding:.25rem 0; border-bottom:1px solid #17131d; }
.rivrow.compete { color:var(--lime); }
.muted { color:var(--muted); }
```

- [ ] **Step 3: Verify in browser**

Ricarica `index.html`. Sinistra: "La mia rosa" con P/D/C/A 0/3…0/6 e budget 500. Destra: 13 rivali con budget 500 e slot. Con Falcone (P) in asta, i rivali con slot P>0 sono evidenziati (lime). Vendi un difensore a `Sq 3` → il suo budget e lo slot D calano nel pannello.

- [ ] **Step 4: Commit**

```bash
git add assistentefanta/app.js assistentefanta/app.css
git commit -m "feat(assistentefanta): pannelli mia rosa + rivali"
```

---

### Task 10: app.js — persistenza localStorage + export/import/reset

**Files:**
- Modify: `assistentefanta/app.js`

**Interfaces:**
- Produces: `LS_KEY='assistentefanta:v1'`, `saveState()`, `loadState() → state|null`, `exportState()`, `importState(file)`, `resetState()`. `boot()` carica da `localStorage` se presente. `render()` chiama `saveState()` alla fine (autosave).

- [ ] **Step 1: Implementazione** — aggiungi a `app.js`

```js
const LS_KEY = 'assistentefanta:v1';
function saveState() { try { localStorage.setItem(LS_KEY, JSON.stringify(STATE)); } catch (e) {} }
function loadState() { try { const s = localStorage.getItem(LS_KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
function exportState() {
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'asta-backup.json'; a.click();
  URL.revokeObjectURL(url);
}
function importState(file) {
  const reader = new FileReader();
  reader.onload = () => { try { STATE = JSON.parse(reader.result); render(); } catch (e) { alert('File non valido'); } };
  reader.readAsText(file);
}
function resetState() {
  if (confirm('Azzerare tutta l\'asta? Operazione non annullabile.')) { STATE = Store.initState(); render(); }
}
```
Modifica `render()`: aggiungi `saveState();` come ultima riga.
Modifica `boot()`: `STATE = loadState() || Store.initState();`
In `wireEvents()` aggiungi:
```js
  $('btnExport').onclick = exportState;
  $('btnImport').onclick = () => $('fileImport').click();
  $('fileImport').onchange = (e) => { if (e.target.files[0]) importState(e.target.files[0]); };
  $('btnReset').onclick = resetState;
```

- [ ] **Step 2: Verify in browser**

Vendi 2 giocatori. **Ricarica la pagina** (`navigate` allo stesso URL) → lo stato è intatto (rosa e budget invariati). Click **Export** → si scarica `asta-backup.json` (nota: da `file://` il download può essere bloccato dal sandbox del preview; verifica invece che `localStorage` contenga la chiave con `javascript_tool`: `localStorage.getItem('assistentefanta:v1')`). Click **Reset** → conferma → torna a 500/vuoto.

> **ponytail:** l'export usa `<a download>`. Nel preview sandboxato il download può non partire; in produzione (HTTP) funziona. La persistenza vera è `localStorage`; l'export è solo backup manuale.

- [ ] **Step 3: Commit**

```bash
git add assistentefanta/app.js
git commit -m "feat(assistentefanta): persistenza localStorage + export/import/reset"
```

---

### Task 11: app.js — ricerca/salto + override al volo + scorciatoie tastiera

**Files:**
- Modify: `assistentefanta/app.js`
- Modify: `assistentefanta/app.css`

**Interfaces:**
- Produces: ricerca live che filtra e salta; `openOverride()` / `applyOverride(id, {titolarita, nota})` scrive in `STATE.overrides`; handler `keydown` globale.
- Scorciatoie: `←/→` prev/next, `v` apri vendita, `m` vendi a me al prezzo corrente (se vendita aperta), `z` undo, `/` focus ricerca. Disattive quando il focus è in un `input`.

- [ ] **Step 1: Implementazione ricerca + override** — aggiungi a `app.js`

```js
function onSearch(q) {
  q = (q || '').trim().toLowerCase();
  if (!q) return;
  const hit = QUEUE.find(p => p.nome.toLowerCase().includes(q) || p.squadra.toLowerCase().includes(q));
  if (hit) jumpTo(hit.id);
}
function applyOverride(id, patch) {
  STATE.overrides = Object.assign({}, STATE.overrides, { [id]: Object.assign({}, STATE.overrides[id], patch) });
  render();
}
function openOverride() {
  const p = currentPlayer(); if (!p) return;
  const t = prompt('Titolarità (titolare/ballottaggio/riserva/incerto):', p.titolarita);
  if (t === null) return;
  const nota = prompt('Nota:', p.nota || '');
  applyOverride(p.id, { titolarita: t.trim() || p.titolarita, nota: nota || '' });
}
```
Aggiungi in `renderCard()` un pulsante override accanto a VENDUTO: `'<button id="btnOverride" type="button">✎ nota</button>'` (nel blocco `#advice`), e nel delegato di `#advice` gestisci `if(e.target.id==='btnOverride') openOverride();`.

- [ ] **Step 2: Scorciatoie** — aggiungi in `wireEvents()`

```js
  $('search').addEventListener('input', (e) => onSearch(e.target.value));
  document.addEventListener('keydown', (e) => {
    if (/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      if (e.key === 'Escape') document.activeElement.blur();
      return;
    }
    if (e.key === 'ArrowLeft') go(-1);
    else if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'v') openSale();
    else if (e.key === 'm' && SALE.open) confirmSale(Store.myId(STATE));
    else if (e.key === 'z') doUndo();
    else if (e.key === '/') { e.preventDefault(); $('search').focus(); }
  });
```

- [ ] **Step 3: CSS** (facoltativo) — nessuna nuova regola necessaria.

- [ ] **Step 4: Verify in browser**

Ricarica. Digita "lauta" nella ricerca → salta a Lautaro. Premi `←`/`→` → naviga. Su un giocatore premi `v` → apre vendita; `m` → assegnato a IO. `z` → undo. Click **✎ nota** su un giocatore → cambia titolarità in "ballottaggio" → il badge nella card cambia e persiste dopo reload (override in `localStorage`).

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/app.js assistentefanta/app.css
git commit -m "feat(assistentefanta): ricerca, override al volo, scorciatoie tastiera"
```

---

### Task 12: app.js — pannello config + rifinitura layout responsive

**Files:**
- Modify: `assistentefanta/app.js`
- Modify: `assistentefanta/app.css`

**Interfaces:**
- Produces: `renderConfig()` / toggle `#configPanel`; editing di `STATE.config.split`, `tierMult`, `modDifesaBoost` con re-render immediato. Layout landscape a 3 colonne che collassa sotto 900px.

- [ ] **Step 1: Implementazione config** — aggiungi a `app.js`

```js
function renderConfig() {
  const c = STATE.config;
  const splitRows = ['P', 'D', 'C', 'A'].map(r =>
    r + ' <input class="cfg" data-grp="split" data-key="' + r + '" type="number" step="0.01" value="' + c.split[r] + '">').join(' ');
  const tierRows = [1, 2, 3, 4, 5].map(t =>
    't' + t + ' <input class="cfg" data-grp="tierMult" data-key="' + t + '" type="number" step="0.1" value="' + c.tierMult[t] + '">').join(' ');
  const boost = ['P', 'D'].map(r =>
    r + ' <input class="cfg" data-grp="modDifesaBoost" data-key="' + r + '" type="number" step="0.05" value="' + c.modDifesaBoost[r] + '">').join(' ');
  $('configPanel').innerHTML =
    '<h3>Config</h3><div>Split budget: ' + splitRows + '</div><div>Tier mult: ' + tierRows + '</div><div>Mod difesa: ' + boost + '</div>' +
    '<button id="cfgClose" type="button">Chiudi</button>';
}
function toggleConfig() {
  const el = $('configPanel');
  el.hidden = !el.hidden;
  if (!el.hidden) renderConfig();
}
```
In `wireEvents()`:
```js
  $('btnConfig').onclick = toggleConfig;
  $('configPanel').addEventListener('click', (e) => { if (e.target.id === 'cfgClose') toggleConfig(); });
  $('configPanel').addEventListener('change', (e) => {
    const t = e.target; if (!t.classList.contains('cfg')) return;
    const val = parseFloat(t.value); if (isNaN(val)) return;
    STATE.config[t.dataset.grp][t.dataset.key] = val;
    render();
  });
```

- [ ] **Step 2: CSS responsive/rifinitura** — append a `app.css`

```css
#configPanel { position:fixed; right:1rem; bottom:4rem; background:var(--card); border:1px solid var(--accent); border-radius:10px; padding:1rem; max-width:min(92vw,420px); z-index:10; }
#configPanel input { width:4rem; }
button, .teamBtn, #qlist li { min-height:40px; } /* target touch tablet */
@media (max-width:900px){ #cols { grid-template-columns:1fr; } #roster,#rivals { max-height:none; } }
@media (orientation:landscape) and (max-width:1200px){ #cols { gap:.5rem; padding:.5rem; } }
```

- [ ] **Step 3: Verify — desktop e tablet**

`preview_start` su `index.html`. Click **⚙︎** → pannello config; cambia `split D` da 0.32 a 0.40 → il "max consigliato" dei difensori aumenta subito. Chiudi. Poi `resize_window` preset **tablet** (768×1024) e **landscape** custom (1024×768): verifica che le 3 colonne restino usabili o collassino in modo pulito, e che i bottoni siano abbastanza grandi al tocco. Screenshot per conferma.

- [ ] **Step 4: Commit**

```bash
git add assistentefanta/app.js assistentefanta/app.css
git commit -m "feat(assistentefanta): pannello config + layout responsive"
```

---

### Task 13: README + documentazione pipeline dati

**Files:**
- Create: `assistentefanta/README.md`

**Interfaces:** nessuna (documentazione).

- [ ] **Step 1: Scrivi il README** — `assistentefanta/README.md`

Contenuto (in italiano) con queste sezioni:
1. **Cos'è** — assistente asta live fantacalcio (14 squadre, classic + mod difesa, coda alfabetica P/D/C/A).
2. **Uso durante l'asta** — apri `index.html`; per ogni giocatore chiamato guarda verdetto + max; alla vendita click VENDUTO → squadra + prezzo; scorciatoie `← → v m z /`; Undo per errori; Export per backup.
3. **Test** — apri `tests/tests.html` in un browser; la pagina stampa `TESTS: N passed, M failed` e i dettagli in console.
4. **Dati (`data/players.js`)** — struttura del record (copiare lo schema dalla spec §4); come rigenerarli dal listone (vedi sezione pipeline).
5. **Pipeline dati** — passi: (a) ricevere il listone (CSV/XLSX), (b) ricerca online titolarità/ballottaggi/tier/note/affidabilità difesa, (c) verifica incongruenze, (d) scrivere `window.PLAYERS`. Nota onestà: snapshot pre-asta, override al volo per notizie last-minute; fonti = siti probabili formazioni/articoli, TikTok/IG best-effort.
6. **Config** — significato di `split`, `tierMult`, `modDifesaBoost`; editabili dal pannello ⚙︎.
7. **Limiti noti** — sample data finché non arriva il listone reale; taratura moltiplicatori da calibrare.

- [ ] **Step 2: Verify** — apri il README, controlla che tutte e 7 le sezioni ci siano e i comandi/percorsi siano corretti.

- [ ] **Step 3: Commit**

```bash
git add assistentefanta/README.md
git commit -m "docs(assistentefanta): README uso + pipeline dati"
```

---

### Task 14 (DIFFERITA — richiede il listone): genera `data/players.js` reale

> **Bloccata** finché Federico non fornisce il listone (CSV/XLSX). Non blocca i Task 1-13: l'app gira coi dati sample. Da eseguire come passo di **prep dati**, non come codice runtime.

**Files:**
- Replace: `assistentefanta/data/players.js` (stessa struttura `window.PLAYERS`, dati reali)

- [ ] **Step 1** — Parse del listone → estrai `nome, squadra, ruolo, quota` per ogni giocatore; genera `id` = slug `nome-squadra`.
- [ ] **Step 2** — Ricerca online in parallelo (workflow ultracode, un blocco per squadra o ruolo): per ogni giocatore determina `titolarita`, `tier` (1-5), `nota`, `flags`, `affidabilita_difesa` (solo P/D) da siti di probabili formazioni e articoli. TikTok/IG solo best-effort.
- [ ] **Step 3** — Verifica adversarial: un secondo agente controlla incongruenze (troppi titolari incompatibili stessa squadra/ruolo; tier fuori scala rispetto alla quota).
- [ ] **Step 4** — Scrivi `data/players.js` con `meta.generato` = data reale e `meta.fonte_listone` = nome file. Filler oltre profondità rosa: `titolarita:'riserva'`, `tier:5`, senza nota.
- [ ] **Step 5** — Verify: apri `index.html`, la coda mostra i P reali in ordine alfabetico; apri `tests/tests.html` per assicurarti che i test (basati su fixture proprie, non su `PLAYERS`) restino verdi.
- [ ] **Step 6: Commit**

```bash
git add assistentefanta/data/players.js
git commit -m "feat(assistentefanta): dati reali listone stagione 2025-26"
```

---

## Self-Review (compilato in fase di scrittura)

**Spec coverage:**
- §2 vincoli → Global Constraints + Task 2 config. ✓
- §3 architettura (store/advisor/app separati) → Task 2-6 (puri) vs 7-12 (DOM). ✓
- §4 `players.js` (`window.PLAYERS`, no fetch) → Task 1 + Constraints. ✓
- §5 stato (squadre/vendite/cursore/overrides) → Task 2-4. ✓
- §6 UI (card, venduto, rosa, rivali, coda, override, scorciatoie) → Task 7-12. ✓
- §7 advisor (max, verdetto, scarsità, overpay, mod difesa) → Task 5-6. ✓
- §8 persistenza (autosave, export/import, reset, undo) → Task 3 (undo) + Task 10. ✓
- §9 pipeline dati → Task 13 (doc) + Task 14 (esecuzione). ✓
- §11 criteri successo → coperti dai Verify di Task 7-12. ✓

**Nota su §6 "credito-per-slot"** — l'header mostra `cr/slot` del ruolo corrente (Task 7 `renderHeader`). ✓

**Type consistency:** `soldIds` (Store) usato in advisor (Task 6) e app (Task 8) — definito Task 3. `mySlotsRemaining`/`roleRemainingBudget` (Advisor) usati in header (Task 7) — definiti Task 5. `applyOverrides` definito Task 4, usato in `rebuildQueue` Task 7. `firstUnsoldIndex` definito Task 4, usato Task 8. `SALE` definito Task 8, referenziato in scorciatoie Task 11. `currentPlayer`/`QUEUE`/`STATE`/`PLAYERS_EFF` definiti Task 7, usati ovunque dopo. Nessun nome divergente.

**Placeholder scan:** nessun TBD/TODO nei Task 1-13; Task 14 è esplicitamente differito con input mancante dichiarato, non un placeholder.
