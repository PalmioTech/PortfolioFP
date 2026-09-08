# ChatGPT in asta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un pannello chat all'app `assistentefanta/` che allega automaticamente lo stato dell'asta a ogni domanda, con due modi di risposta: copia-incolla (ChatGPT Plus) e API OpenAI opzionale.

**Architecture:** Nuovo `ai.js` (`window.AI`) con funzioni pure di contesto (`buildContext`/`contextToText`/`buildUserMessage`/`messagesFor`) testabili, più `callOpenAI` (rete) e un controller DOM `initChat`. Pannello in `index.html`, stile in `app.css`. Nessun backend; `store.js`/`advisor.js` invariati.

**Tech Stack:** Vanilla HTML/CSS/JS. `fetch` verso `api.openai.com` solo in modo API. Test in-browser (`tests/tests.html`).

## Global Constraints

- **Vanilla only**, nessun framework/build/dipendenza, **nessun backend**. Modo API = `fetch` diretto dal browser a `https://api.openai.com/v1/chat/completions`.
- **Ordine script** in `index.html`: `store.js → advisor.js → data/players.js → app.js → ai.js` (ai.js per ultimo: legge i global `STATE`, `QUEUE`, `PLAYERS_EFF` di app.js e `window.Store`/`window.Advisor`).
- **Ordine script** in `tests/tests.html`: `store.js → advisor.js → fixture.js → ai.js → harness.js → suite.js`. In tests.html NON c'è app.js: `ai.js` NON deve inizializzare il DOM lì → l'auto-init è guardato dalla presenza di `#aiPanel` (assente in tests.html).
- **`store.js`/`advisor.js` invariati** (puri). Le funzioni di contesto in `ai.js` sono pure: prendono `(state, players, queue)` e usano `Store`/`Advisor` (anch'essi puri).
- **UI in italiano.**
- **Privacy/sicurezza**: la API key la digita l'utente; salvata SOLO in `localStorage` (`assistentefanta:aikey`); inviata SOLO nell'header verso OpenAI. Mai altrove, mai nel repo.
- **Modello**: `gpt-4o-mini`, non-streaming, `temperature: 0.4`.
- **Test**: usano la fixture `TEST_PLAYERS` (non i dati reali). I 23 test esistenti restano verdi.
- Non modificare la logica esistente di `app.js` salvo, se necessario, esporre ciò che già è globale (STATE/QUEUE/PLAYERS_EFF sono già `let` top-level → accessibili).

---

### Task 1: ai.js — funzioni di contesto pure + test

**Files:**
- Create: `assistentefanta/ai.js`
- Modify: `assistentefanta/tests/tests.html` (carica ai.js)
- Test: `assistentefanta/tests/suite.js`

**Interfaces:**
- Produces (`window.AI`): `SYSTEM_PROMPT` (string), `AIKEY_LS` (string), `buildContext(state, players, queue) → ctx`, `contextToText(ctx) → string`, `buildUserMessage(ctx, question) → string`, `messagesFor(ctx, history, question) → array`, `callOpenAI(key, messages) → Promise<string>`.
- Consumes: `window.Store`, `window.Advisor`.

- [ ] **Step 1: Carica ai.js nei test** — modifica `assistentefanta/tests/tests.html`

```html
<script src="../advisor.js"></script>
<script src="fixture.js"></script>
<script src="../ai.js"></script>
<script src="harness.js"></script>
```
(inserisci `<script src="../ai.js"></script>` fra `fixture.js` e `harness.js`)

- [ ] **Step 2: Test (append a `tests/suite.js`)**

```js
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
```

- [ ] **Step 3: Verifica fallimento** — apri `tests/tests.html` (server statico; il preview `file://` non esegue JS). Expected: i 4 nuovi test ❌ (`AI is not defined`).

- [ ] **Step 4: Implementazione** — crea `assistentefanta/ai.js`

```js
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

  return { SYSTEM_PROMPT, AIKEY_LS, buildContext, contextToText, buildUserMessage, messagesFor, callOpenAI };
})(window.Store, window.Advisor);
```

- [ ] **Step 5: Verifica passaggio** — ricarica `tests/tests.html` (server statico, porta nuova per bypassare cache). Expected: **27 passed, 0 failed** (23 esistenti + 4 nuovi).

- [ ] **Step 6: Commit**

```bash
git add assistentefanta/ai.js assistentefanta/tests/tests.html assistentefanta/tests/suite.js
git commit -m "feat(assistentefanta): ai.js contesto asta (buildContext) + test"
```

---

### Task 2: pannello chat (DOM + CSS + toggle)

**Files:**
- Modify: `assistentefanta/index.html`
- Modify: `assistentefanta/app.css`
- Modify: `assistentefanta/ai.js` (aggiunge `initChat` + auto-init guardato)

**Interfaces:**
- Produces: struttura DOM `#aiPanel` e i controlli; `initChat()` che apre/chiude il pannello. Behavior di invio arriva nei Task 3-4.

- [ ] **Step 1: DOM** — in `assistentefanta/index.html`

Aggiungi il toggle dentro `#controls` (dopo `#btnConfig`):
```html
    <button id="btnAI" type="button">💬</button>
```
E aggiungi il pannello subito prima di `<script src="store.js"></script>`:
```html
<div id="aiPanel" hidden>
  <div id="aiHead">
    <strong>Assistente AI</strong>
    <input id="aiKey" type="password" placeholder="API key OpenAI (opzionale)" autocomplete="off">
    <span id="aiMode"></span>
    <button id="aiClose" type="button">✕</button>
  </div>
  <div id="aiKeyNote">La key resta nel tuo browser (localStorage) e va solo a OpenAI. Vuota = modo copia-incolla con ChatGPT.</div>
  <div id="aiMessages"></div>
  <div id="aiQuick">
    <button id="aiQuickValuta" type="button">Valuta il giocatore</button>
    <button id="aiQuickManca" type="button">Cosa mi manca</button>
    <button id="aiQuickMeglio" type="button">Meglio X o Y</button>
  </div>
  <div id="aiInputRow">
    <textarea id="aiInput" rows="2" placeholder="chiedi qualcosa sull'asta…"></textarea>
    <button id="aiSend" type="button">Invia</button>
  </div>
</div>
```
Poi aggiungi il caricamento di ai.js come ULTIMO script (dopo `app.js`):
```html
<script src="app.js"></script>
<script src="ai.js"></script>
```

- [ ] **Step 2: initChat + auto-init** — in `assistentefanta/ai.js`, PRIMA della riga `return { ... }`, aggiungi il controller e includilo nell'oggetto restituito

```js
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
    // gli handler di invio/quick sono agganciati nei task successivi
    initChat._send = initChat._send || function () {};
    $('aiSend').onclick = () => initChat._send($('aiInput').value);
  }
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', function () { if (document.getElementById('aiPanel')) initChat(); });
  }
```
Aggiungi `initChat` all'oggetto `return`.

- [ ] **Step 3: CSS** — append a `assistentefanta/app.css`

```css
#aiPanel { position:fixed; right:1rem; bottom:4rem; width:min(94vw,420px); max-height:70vh; display:flex; flex-direction:column; background:var(--card); border:1px solid var(--lime); border-radius:12px; padding:.6rem; z-index:20; }
#aiHead { display:flex; align-items:center; gap:.4rem; }
#aiHead strong { color:var(--lime); }
#aiHead #aiKey { flex:1; min-width:0; background:#0f0c14; color:var(--fg); border:1px solid #2a2233; border-radius:6px; padding:.3rem; }
#aiMode { font-size:.75rem; color:var(--muted); white-space:nowrap; }
#aiKeyNote { font-size:.7rem; color:var(--muted); margin:.3rem 0; }
#aiMessages { flex:1; overflow:auto; display:flex; flex-direction:column; gap:.4rem; margin:.4rem 0; min-height:6rem; }
.aiMsg { padding:.4rem .6rem; border-radius:8px; white-space:pre-wrap; font-size:.9rem; }
.aiMsg.user { background:#241a0e; align-self:flex-end; }
.aiMsg.assistant { background:#141b12; align-self:flex-start; }
.aiMsg.err { background:#2a0f0c; color:var(--accent); }
#aiQuick { display:flex; gap:.3rem; flex-wrap:wrap; }
#aiQuick button { flex:1; min-height:36px; background:#17131d; color:var(--fg); border:1px solid #2a2233; border-radius:6px; font-size:.8rem; }
#aiInputRow { display:flex; gap:.4rem; margin-top:.4rem; }
#aiInput { flex:1; background:#0f0c14; color:var(--fg); border:1px solid #2a2233; border-radius:6px; padding:.4rem; resize:vertical; }
#aiSend { min-height:40px; padding:0 1rem; background:var(--lime); color:#000; border:0; border-radius:6px; font-weight:700; }
.aiCopyBox { display:flex; flex-direction:column; gap:.3rem; }
.aiCopyBox textarea { width:100%; background:#0f0c14; color:var(--fg); border:1px solid #2a2233; border-radius:6px; padding:.4rem; }
```

- [ ] **Step 4: Verify — apertura pannello**

Server statico (il preview `file://` non esegue JS): `preview_start` `{url:"http://127.0.0.1:PORT/assistentefanta/index.html"}` dopo aver avviato `python3 -m http.server`. Click **💬** → il pannello appare con campo key (vuoto → "modo: copia-incolla"), area messaggi, 3 tasti rapidi, input+Invia. Digita una key finta nel campo → "modo: API automatica" e ricarica → resta (localStorage). Click ✕ → si chiude. Nessun errore console. `tests/tests.html` resta 27/27. Screenshot.

- [ ] **Step 5: Commit**

```bash
git add assistentefanta/index.html assistentefanta/app.css assistentefanta/ai.js
git commit -m "feat(assistentefanta): pannello chat AI + toggle"
```

---

### Task 3: modo copia-incolla (default, ChatGPT Plus)

**Files:**
- Modify: `assistentefanta/ai.js`

**Interfaces:**
- Produces: `initChat._send(question)` completo per il ramo SENZA key: genera il prompt, mostra blocco con "copia" + casella "incolla risposta"; i 3 tasti rapidi. Consuma `AI.buildContext`/`buildUserMessage` e i global `STATE`, `PLAYERS_EFF`, `QUEUE`.

- [ ] **Step 1: Implementazione** — in `assistentefanta/ai.js`, dentro `initChat` (sostituisci lo stub `_send` e aggiungi gli helper e i tasti rapidi)

```js
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
```
> Nota: `apiFlow` è ancora un placeholder qui — se l'utente ha inserito una key ma il Task 4 non è ancora implementato, `_send` chiamerebbe un `apiFlow` vuoto. Va bene perché Task 3 e Task 4 si implementano in sequenza; alla fine del Task 4 `apiFlow` è completo.

- [ ] **Step 2: Verify — copia-incolla**

Server statico. Campo key VUOTO. Click **Valuta il giocatore** → compare il messaggio utente + un blocco con il prompt (contiene il giocatore in asta, la mia rosa, budget, rivali), tasto **copia prompt** (click → "copiato ✓"), casella incolla + **aggiungi risposta**. Scrivi qualcosa nella casella, click aggiungi → appare come risposta assistente e il blocco sparisce. Prova anche a scrivere nell'input e Invia. Nessun errore console. Screenshot.

- [ ] **Step 3: Commit**

```bash
git add assistentefanta/ai.js
git commit -m "feat(assistentefanta): chat modo copia-incolla + tasti rapidi"
```

---

### Task 4: modo API (OpenAI automatico, opzionale)

**Files:**
- Modify: `assistentefanta/ai.js`

**Interfaces:**
- Produces: `apiFlow(question, key)` completo: costruisce i messaggi, chiama `AI.callOpenAI`, mostra "sto pensando…", risposta o errore; aggiorna la cronologia.

- [ ] **Step 1: Implementazione** — in `assistentefanta/ai.js`, sostituisci il placeholder `function apiFlow() { /* ... */ }` con:

```js
    async function apiFlow(question, key) {
      appendMsg('user', question);
      const pending = appendMsg('assistant', 'sto pensando…');
      const messages = messagesFor(ctxNow(), history, question);
      try {
        const ans = await callOpenAI(key, messages);
        pending.textContent = ans;
        history.push({ role: 'user', content: messages[messages.length - 1].content });
        history.push({ role: 'assistant', content: ans });
      } catch (e) {
        pending.className = 'aiMsg err';
        pending.textContent = 'Errore: ' + e.message + ' — controlla la API key o usa il modo copia-incolla (svuota il campo key).';
      }
    }
```

- [ ] **Step 2: Verify — modo API (wiring + errore, senza key reale)**

Server statico. Inserisci nel campo key una stringa NON valida (es. `sk-test-invalid`) → "modo: API automatica". Click **Valuta il giocatore** → compare "sto pensando…" poi un messaggio d'errore rosso (401 da OpenAI o errore rete) con l'istruzione di ricadere sul copia-incolla. Questo verifica il flusso e la gestione errori senza spendere. Poi SVUOTA la key → torna copia-incolla. Nessun errore non gestito in console. Screenshot dell'errore gestito.
> Test manuale reale (facoltativo, da fare da te con una tua key valida): con una key valida la stessa azione mostra la risposta del modello in chat. Non è automatizzabile qui.

- [ ] **Step 3: Commit**

```bash
git add assistentefanta/ai.js
git commit -m "feat(assistentefanta): chat modo API OpenAI (gpt-4o-mini)"
```

---

## Self-Review (compilato in fase di scrittura)

**Spec coverage:**
- §3 architettura (ai.js: pure + controller; nessun backend) → Task 1 (pure) + Task 2-4 (DOM). ✓
- §4 buildContext (shape esatto, io/inAsta/rivali/topDisponibili) → Task 1. ✓
- §5 UI pannello (toggle, key, messaggi, quick, input) → Task 2. ✓
- §6 due modi (copia-incolla / API) → Task 3 / Task 4. ✓
- §7 system prompt → Task 1 (`SYSTEM_PROMPT`). ✓
- §8 sicurezza key (localStorage, solo OpenAI, nota in UI) → Task 2 (`#aiKeyNote`, salvataggio). ✓
- §10 test buildContext/buildUserMessage/messagesFor → Task 1. ✓
- §12 criteri successo → coperti dai Verify Task 2-4 + test Task 1. ✓

**Type consistency:** `AI.buildContext(state,players,queue)`, `buildUserMessage(ctx,question)`, `messagesFor(ctx,history,question)`, `callOpenAI(key,messages)` usati coerentemente in Task 1/3/4. `initChat._send` definito Task 2 (stub) e completato Task 3; `apiFlow` placeholder Task 3 → completo Task 4. Global consumati (`STATE`,`QUEUE`,`PLAYERS_EFF`) sono quelli di app.js. `AIKEY_LS` unico.

**Ordine script:** ai.js ultimo in index.html (dopo app.js) e fra fixture e harness in tests.html; auto-init guardato da `#aiPanel` (assente in tests.html) → nessun crash nei test. ✓

**Placeholder scan:** l'unico "placeholder" è `apiFlow` vuoto nel Task 3, dichiarato esplicitamente e completato nel Task 4 (sequenza) — non è un TODO irrisolto a fine piano.
