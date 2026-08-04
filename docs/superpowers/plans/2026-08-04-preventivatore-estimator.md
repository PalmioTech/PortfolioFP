# Preventivatore automatico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bottone fisso ancorato in basso (tutte le pagine tranne `contact.html`) che apre un bottom-sheet con wizard a step e restituisce una forbice di prezzo indicativa.

**Architecture:** Una singola IIFE aggiunta in coda a `assets/js/main.js` (stesso pattern di `PAGE TRANSITION OVERLAY`): motore prezzi puro + costruzione DOM iniettata in `<body>` + gestione step/stato + invio Web3Forms. Zero markup nelle pagine HTML. Stili in una nuova sezione di `assets/css/style.css`. Nessuna dipendenza.

**Tech Stack:** Vanilla HTML/CSS/JS. Web3Forms per l'invio (riuso della config di `contact.html`). Nessun build, nessun npm, nessun framework.

## Global Constraints

- **Tutto il JS del sito in `assets/js/main.js`**; tutto il CSS in `assets/css/style.css`. Nessun file JS/CSS nuovo per il runtime del sito.
- **Zero dipendenze.** Nessuna libreria, nessun `import`, nessun npm.
- **Solo CSS variables** per colori/spazi/raggi — mai hardcode. Brand: `#060508`, `#FF3500`, lime `#C6FF00` (solo label/marker). Font già caricati: Syne / Figtree / Space Mono.
- **Copy in italiano.**
- **`overflow-x: clip`** (mai `hidden`, rompe sticky) — vale se si tocca il layout.
- **Reduced-motion gated:** ogni animazione decorativa dietro `@media (prefers-reduced-motion: reduce)`; il sheet deve comunque aprirsi.
- **Deploy = GitHub Pages**, repo `PalmioTech/PortfolioFP`, branch `main`. Push a fine feature (dopo verifica cross-page), non a metà.
- **Web3Forms:** endpoint `https://api.web3forms.com/submit`, `access_key` `2c7f91ae-9b42-4cc0-bddd-8dad87342094` (stesso di `contact.html`), honeypot `botcheck`. Email fallback: `fede-palma@hotmail.it`.
- **Skip pagina:** il preventivatore NON deve apparire su `contact.html`. Le pagine `metanapp/*` non caricano `main.js` → già escluse.

---

## File Structure

- **Modify** `assets/js/main.js` — append una IIFE `PREVENTIVATORE (QUOTE ESTIMATOR)` in coda (attualmente ~1416 righe). Responsabilità interne, come funzioni separate dentro l'IIFE: `PRICING`/`computeQuote`/`roundTo100`/`formatEuro` (motore puro), `runSelfCheck` (dev), `STEPS` (config wizard), builder DOM, open/close, render step, render result, submit Web3Forms.
- **Modify** `assets/css/style.css` — append una sezione `/* PREVENTIVATORE */` in coda (~4505 righe attuali): pill, backdrop, sheet, step/opzioni, progress, result, mini-form.

Nessun altro file toccato. Il PDF brief (`assets/docs/brief-progetto-fpdeveloper.pdf`) esiste già.

## Testing approach (leggere prima)

Il repo non ha test runner (vanilla, no build) — è una scelta di progetto. Quindi:

- **Task 1 (motore prezzi):** check automatico via `runSelfCheck()` con `console.assert`/throw sui casi pinnati, attivato quando l'URL ha hash `#preventivo-selfcheck`. È l'unico pezzo con logica vera → merita un check ripetibile. Ciclo TDD: scrivi il self-check (fallisce, `computeQuote` non definita), implementa, passa. Il check resta committato ma è inerte senza l'hash.
  - *Dev speed opzionale (non si committa):* per iterare veloce senza browser, copia il blocco motore + i casi in `.../scratchpad/quote-check.mjs` e lancia `node quote-check.mjs`. Lo shipping check resta quello hash-gated.
- **Task 2–5 (DOM/wizard):** niente DOM runner → **verifica manuale nella preview** con osservazioni attese esatte. Ogni task elenca cosa aprire e cosa deve succedere.
- Preview del progetto: nessun `launch.json` esiste ancora. Usare `preview_start` con `{url}` su un server statico locale, oppure `python3 -m http.server` nella root e navigare. La preview cacha `style.css` (vedi HANDOFF) → bustare con `?v=<random>` o hard reload.

---

## Task 1: Motore prezzi + self-check

**Files:**
- Modify: `assets/js/main.js` (append nuova IIFE in coda)

**Interfaces:**
- Consumes: niente (motore puro, nessun DOM).
- Produces (usate dai task successivi):
  - `PRICING` — oggetto costanti (vedi sotto).
  - `roundTo100(x:number) → number`
  - `computeQuote(answers:object) → { custom:true } | { custom:false, low:number, high:number, maintenance:number }`
  - `formatEuro(n:number) → string` (separatore migliaia IT)
  - Forma di `answers`: `{ tipo, pagine?, funzioni:string[], testi, media, prodotti?, urgenza, manutenzione }`

- [ ] **Step 1: Scrivi il self-check che fallisce**

Append in coda a `assets/js/main.js`:

```js
  /* ----------------------------------------------------------
     PREVENTIVATORE (QUOTE ESTIMATOR) — bottone ancorato + bottom-sheet
  ---------------------------------------------------------- */
  (function () {
    'use strict';

    /* --- self-check (dev): attivo solo con hash #preventivo-selfcheck --- */
    function runSelfCheck() {
      function eq(got, exp, name) {
        var okv = JSON.stringify(got) === JSON.stringify(exp);
        if (!okv) throw new Error('SELFCHECK FAIL [' + name + ']: got ' +
          JSON.stringify(got) + ' exp ' + JSON.stringify(exp));
        console.log('✓ ' + name);
      }
      // A: landing minimo
      eq(computeQuote({ tipo:'landing', funzioni:[], testi:'forniti',
        media:'forniti', urgenza:'flessibile', manutenzione:'indipendente' }),
        { custom:false, low:600, high:800, maintenance:0 }, 'landing-min');
      // B: e-commerce pieno, urgente, canone
      eq(computeQuote({ tipo:'ecommerce', pagine:'5-8', funzioni:['multilingua'],
        testi:'copywriting', media:'produzione', prodotti:'cliente',
        urgenza:'urgente', manutenzione:'canone' }),
        { custom:false, low:4000, high:5400, maintenance:300 }, 'ecommerce-full');
      // C: rounding bidirezionale (vetrina + prenotazioni + stock, entro 1 mese)
      eq(computeQuote({ tipo:'vetrina', pagine:'1-4', funzioni:['prenotazioni'],
        testi:'forniti', media:'stock', urgenza:'entro_1_mese',
        manutenzione:'indipendente' }),
        { custom:false, low:1700, high:2300, maintenance:0 }, 'rounding');
      // D: custom → nessun numero
      eq(computeQuote({ tipo:'custom' }), { custom:true }, 'custom');
      console.log('%cPREVENTIVATORE selfcheck OK', 'color:#C6FF00');
    }
    if (location.hash === '#preventivo-selfcheck') runSelfCheck();
  })();
```

- [ ] **Step 2: Esegui e verifica che fallisce**

Apri la preview su una pagina qualsiasi con `#preventivo-selfcheck` (es. `http://localhost:8000/index.html#preventivo-selfcheck`) e leggi la console.
Expected: **errore** `ReferenceError: computeQuote is not defined` (o `PRICING`/`roundTo100`). Il check gira ma non trova il motore.

- [ ] **Step 3: Implementa il motore (minimo per far passare)**

Dentro la stessa IIFE, **sopra** `runSelfCheck`:

```js
    /* --- price engine (pure) --- */
    var PRICING = {
      base:      { landing:600, vetrina:800, wordpress:1200, ecommerce:1200, custom:null },
      pages:     { '1-4':0, '5-8':400, '9+':900 },
      functions: { multilingua:500, prenotazioni:600, area_riservata:800, ai:900, blog:300 },
      testi:     { forniti:0, copywriting:400 },
      media:     { forniti:0, stock:250, produzione:700 },
      prodotti:  { cliente:0, io_fino20:200, io_21_100:500, io_100plus:1000 },
      urgenza:   { flessibile:1.0, entro_1_mese:1.05, urgente:1.25 },
      maintenance: { annual:300 },
      spread:    1.35
    };

    function roundTo100(x) { return Math.round(x / 100) * 100; }

    function computeQuote(a) {
      if (a.tipo === 'custom') return { custom:true };
      var sum = PRICING.base[a.tipo] || 0;
      if (a.pagine && PRICING.pages[a.pagine] != null) sum += PRICING.pages[a.pagine];
      (a.funzioni || []).forEach(function (f) { sum += PRICING.functions[f] || 0; });
      sum += PRICING.testi[a.testi] || 0;
      sum += PRICING.media[a.media] || 0;
      if (a.tipo === 'ecommerce' && a.prodotti) sum += PRICING.prodotti[a.prodotti] || 0;
      var tot = sum * (PRICING.urgenza[a.urgenza] || 1);
      return {
        custom: false,
        low:  roundTo100(tot),
        high: roundTo100(tot * PRICING.spread),
        maintenance: a.manutenzione === 'canone' ? PRICING.maintenance.annual : 0
      };
    }

    function formatEuro(n) { return n.toLocaleString('it-IT'); }
```

- [ ] **Step 4: Esegui e verifica che passa**

Ricarica `http://localhost:8000/index.html#preventivo-selfcheck` (hard reload). Console.
Expected: quattro righe `✓ landing-min` `✓ ecommerce-full` `✓ rounding` `✓ custom` + `PREVENTIVATORE selfcheck OK`. Nessun throw.

- [ ] **Step 5: Commit**

```bash
git add assets/js/main.js
git commit -m "feat(preventivo): price engine + hash-gated self-check"
```

---

## Task 2: Bottom-sheet shell (bottone + apri/chiudi)

**Files:**
- Modify: `assets/js/main.js` (estende l'IIFE del Task 1)
- Modify: `assets/css/style.css` (append sezione PREVENTIVATORE)

**Interfaces:**
- Consumes: niente dei task precedenti (solo struttura).
- Produces (usate da Task 3–5):
  - `els` — riferimenti DOM: `{ btn, backdrop, sheet, body }` dove `els.body` è il contenitore `.pv-sheet__body` in cui i task successivi montano gli step.
  - `openSheet()` / `closeSheet()`
  - `sheetIsOpen() → boolean`

- [ ] **Step 1: Inietta bottone + sheet e cabla apri/chiudi**

Nell'IIFE, **dopo** `formatEuro` e **prima** del blocco self-check, aggiungi lo skip pagina in cima all'IIFE e la costruzione DOM:

In cima all'IIFE (subito dopo `'use strict';`):
```js
    // Il form è già su contatti → niente pill lì
    if (/\/contact\.html$/.test(location.pathname)) return;
```

Poi, dopo `formatEuro`:
```js
    /* --- DOM shell --- */
    var lastFocus = null;

    var btn = document.createElement('button');
    btn.className = 'pv-fab';
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'pv-sheet');
    btn.innerHTML =
      '<svg class="pv-fab__icon" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" ' +
        'stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="4" y="3" width="16" height="18" rx="2"/>' +
        '<line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="10" y2="11"/>' +
        '<line x1="13" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="10" y2="15"/>' +
        '<line x1="13" y1="15" x2="16" y2="15"/></svg>' +
      '<span class="pv-fab__label">Calcola il preventivo</span>';

    var backdrop = document.createElement('div');
    backdrop.className = 'pv-backdrop';
    backdrop.hidden = true;

    var sheet = document.createElement('div');
    sheet.className = 'pv-sheet';
    sheet.id = 'pv-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'pv-sheet-title');
    sheet.hidden = true;
    sheet.innerHTML =
      '<div class="pv-sheet__head">' +
        '<h2 class="pv-sheet__title" id="pv-sheet-title">Calcola il preventivo</h2>' +
        '<button class="pv-sheet__close" type="button" aria-label="Chiudi">&times;</button>' +
      '</div>' +
      '<div class="pv-sheet__body"></div>';

    document.body.appendChild(btn);
    document.body.appendChild(backdrop);
    document.body.appendChild(sheet);

    var els = {
      btn: btn, backdrop: backdrop, sheet: sheet,
      body: sheet.querySelector('.pv-sheet__body')
    };

    var _open = false;
    function sheetIsOpen() { return _open; }

    function openSheet() {
      if (_open) return;
      _open = true;
      lastFocus = document.activeElement;
      backdrop.hidden = false; sheet.hidden = false;
      requestAnimationFrame(function () {
        backdrop.classList.add('is-open');
        sheet.classList.add('is-open');
      });
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('pv-lock');
      var first = sheet.querySelector('button, [href], input, [tabindex]');
      if (first) first.focus();
    }

    function closeSheet() {
      if (!_open) return;
      _open = false;
      backdrop.classList.remove('is-open');
      sheet.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('pv-lock');
      window.setTimeout(function () {
        if (!_open) { backdrop.hidden = true; sheet.hidden = true; }
      }, 320);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    btn.addEventListener('click', openSheet);
    sheet.querySelector('.pv-sheet__close').addEventListener('click', closeSheet);
    backdrop.addEventListener('click', closeSheet);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && _open) closeSheet();
    });
```

- [ ] **Step 2: Aggiungi la sezione CSS**

Append in coda a `assets/css/style.css`:
```css
/* ==========================================================
   PREVENTIVATORE (quote estimator)
   ========================================================== */
.pv-fab {
  position: fixed;
  left: 50%;
  bottom: clamp(1rem, 3vw, 1.75rem);
  transform: translateX(-50%);
  z-index: 9998;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.35rem;
  border: none;
  border-radius: var(--radius-full);
  background: var(--color-accent);
  color: #060508;
  font-family: var(--font-body, inherit);
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 8px 30px rgba(255, 53, 0, 0.35);
  transition: transform var(--dur-base) var(--ease-out),
              box-shadow var(--dur-base) var(--ease-out);
}
.pv-fab:hover { transform: translateX(-50%) translateY(-3px); }
.pv-fab__icon { width: 20px; height: 20px; }

.pv-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(6, 5, 8, 0.6);
  opacity: 0;
  transition: opacity var(--dur-base) var(--ease-out);
}
.pv-backdrop.is-open { opacity: 1; }

.pv-sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 9999;
  width: min(560px, 100%);
  max-height: 85svh;
  transform: translate(-50%, 100%);
  display: flex;
  flex-direction: column;
  background: var(--color-bg, #060508);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.5);
  transition: transform var(--dur-slow, 0.4s) var(--ease-out);
}
.pv-sheet.is-open { transform: translate(-50%, 0); }
.pv-sheet__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem 0.75rem;
}
.pv-sheet__title { font-size: 1.15rem; margin: 0; }
.pv-sheet__close {
  background: none; border: none; color: var(--color-text-muted);
  font-size: 1.75rem; line-height: 1; cursor: pointer; padding: 0 0.25rem;
}
.pv-sheet__close:hover { color: var(--color-text); }
.pv-sheet__body { padding: 0.5rem 1.5rem 1.75rem; overflow-y: auto; }

body.pv-lock { overflow: hidden; }

@media (prefers-reduced-motion: reduce) {
  .pv-sheet, .pv-backdrop, .pv-fab { transition: none; }
  .pv-sheet { transform: translate(-50%, 0); }
  .pv-sheet:not(.is-open) { display: none; }
}
```

- [ ] **Step 3: Verifica manuale — bottone e apri/chiudi**

Apri la preview su `index.html` (busta CSS con `?v=1`). Observations attese:
- Pill arancio in basso al centro con label "Calcola il preventivo".
- Click → sheet sale dal basso, backdrop scurisce, sfondo non scrolla.
- Chiusura funziona con: ✕, click sul backdrop, tasto **Esc**.
- Il focus entra nello sheet all'apertura e torna al pill alla chiusura.

- [ ] **Step 4: Verifica manuale — skip su contatti**

Apri `contact.html` nella preview.
Expected: **nessun** pill (l'IIFE fa `return` presto). `index/about/services/portfolio` invece lo mostrano.

- [ ] **Step 5: Verifica reduced-motion**

In preview, `resize_window` con `colorScheme` non basta → usa DevTools "Emulate prefers-reduced-motion: reduce" (o `javascript_tool` per verificare che `.pv-sheet` non abbia transizione). Expected: lo sheet appare/sparisce senza slide ma resta usabile.

- [ ] **Step 6: Commit**

```bash
git add assets/js/main.js assets/css/style.css
git commit -m "feat(preventivo): anchored FAB + bottom-sheet shell (skip contact)"
```

---

## Task 3: Wizard a step (config + navigazione + validazione)

**Files:**
- Modify: `assets/js/main.js` (estende l'IIFE)
- Modify: `assets/css/style.css` (append stili step/opzioni/progress/nav)

**Interfaces:**
- Consumes: `els`, `openSheet`, `closeSheet` (Task 2); `computeQuote` non ancora usata qui.
- Produces (usate da Task 4–5):
  - `answers` — oggetto stato compilato dal wizard.
  - `STEPS` — config (per `labelOf`).
  - `labelOf(stepId, value) → string` (value→label leggibile).
  - `goResult()` — hook chiamato quando il wizard finisce; **in questo task è uno stub** che il Task 4 sostituisce (rende un placeholder `els.body.innerHTML = 'RESULT'`).
  - `startWizard()` — reset stato + render step 0; da chiamare in `openSheet`.

- [ ] **Step 1: Config STEPS + stato + render**

Nell'IIFE, dopo il blocco DOM shell (Task 2), aggiungi:
```js
    /* --- wizard config --- */
    var STEPS = [
      { id:'tipo', title:'Che tipo di sito ti serve?', type:'radio', required:true,
        options:[
          { v:'landing',   label:'Landing page',    hint:'Una pagina, focalizzata' },
          { v:'vetrina',   label:'Sito vetrina',    hint:'Più pagine, presentazione' },
          { v:'wordpress', label:'WordPress',       hint:'Gestibile, blog' },
          { v:'ecommerce', label:'E-commerce',      hint:'Vendita online' },
          { v:'custom',    label:'Web app / gestionale su misura', hint:'Progetto custom' }
        ] },
      { id:'pagine', title:'Quante pagine, all’incirca?', type:'radio', required:true,
        skip:function (a) { return a.tipo === 'landing' || a.tipo === 'custom'; },
        options:[ { v:'1-4', label:'1–4' }, { v:'5-8', label:'5–8' }, { v:'9+', label:'9 o più' } ] },
      { id:'funzioni', title:'Quali funzioni ti servono?', type:'checkbox', required:false,
        skip:function (a) { return a.tipo === 'custom'; },
        options:[
          { v:'multilingua',    label:'Multilingua' },
          { v:'prenotazioni',   label:'Prenotazioni / booking' },
          { v:'area_riservata', label:'Area riservata / login' },
          { v:'ai',             label:'Integrazione AI' },
          { v:'blog',           label:'Blog / news' }
        ] },
      { id:'contenuti', title:'Chi mette i contenuti?', type:'dual', required:true,
        skip:function (a) { return a.tipo === 'custom'; },
        groups:[
          { key:'testi', label:'Testi', options:[
            { v:'forniti', label:'Li fornisco io' }, { v:'copywriting', label:'Li scrivi tu' } ] },
          { key:'media', label:'Foto & video', options:[
            { v:'forniti',    label:'Li ho già' },
            { v:'stock',      label:'Serve selezione stock + ritocco' },
            { v:'produzione', label:'Serve produzione foto + video' } ] }
        ] },
      { id:'prodotti', title:'I prodotti chi li carica?', type:'radio', required:true,
        skip:function (a) { return a.tipo !== 'ecommerce'; },
        options:[
          { v:'cliente',    label:'Li carico io (cliente)' },
          { v:'io_fino20',  label:'Li carichi tu · fino a 20' },
          { v:'io_21_100',  label:'Li carichi tu · 21–100' },
          { v:'io_100plus', label:'Li carichi tu · 100+' }
        ] },
      { id:'urgenza', title:'Quanto sei di fretta?', type:'radio', required:true,
        skip:function (a) { return a.tipo === 'custom'; },
        options:[
          { v:'flessibile',   label:'Nessuna fretta' },
          { v:'entro_1_mese', label:'Entro un mese' },
          { v:'urgente',      label:'Urgente (2 settimane)' }
        ] },
      { id:'manutenzione', title:'Vuoi la manutenzione annuale?', type:'radio', required:true,
        skip:function (a) { return a.tipo === 'custom'; },
        options:[
          { v:'indipendente', label:'No, gestisco io' },
          { v:'canone',       label:'Sì, canone annuale' }
        ] }
    ];

    var answers = {};
    var stepIndex = 0;

    function visibleSteps() {
      return STEPS.filter(function (s) { return !s.skip || !s.skip(answers); });
    }

    function labelOf(stepId, value, groupKey) {
      var s = STEPS.filter(function (x) { return x.id === stepId; })[0];
      if (!s) return value;
      var opts = s.options || [];
      if (s.groups) s.groups.forEach(function (g) {
        if (!groupKey || g.key === groupKey) opts = opts.concat(g.options);
      });
      var o = opts.filter(function (x) { return x.v === value; })[0];
      return o ? o.label : value;
    }
    // NB: i gruppi 'dual' (contenuti) condividono valori (es. 'forniti') tra testi e
    // media → passare groupKey per disambiguare la label. Vedi Task 5 buildSummary.

    function stepValid(step) {
      if (!step.required) return true;
      if (step.type === 'dual') return step.groups.every(function (g) { return answers[g.key]; });
      return answers[step.id] != null && answers[step.id] !== '';
    }

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }

    function renderStep() {
      var steps = visibleSteps();
      if (stepIndex >= steps.length) { goResult(); return; }
      var step = steps[stepIndex];
      var n = steps.length;
      var html = '' +
        '<div class="pv-progress"><span>Step ' + (stepIndex + 1) + '/' + n + '</span>' +
        '<i class="pv-progress__bar" style="--pv-p:' + ((stepIndex + 1) / n * 100) + '%"></i></div>' +
        '<h3 class="pv-step__title">' + esc(step.title) + '</h3>';

      if (step.type === 'dual') {
        step.groups.forEach(function (g) {
          html += '<p class="pv-group__label">' + esc(g.label) + '</p><div class="pv-options">';
          g.options.forEach(function (o) {
            html += optionHtml(g.key, o, answers[g.key] === o.v, 'radio');
          });
          html += '</div>';
        });
      } else {
        var kind = step.type === 'checkbox' ? 'checkbox' : 'radio';
        html += '<div class="pv-options">';
        step.options.forEach(function (o) {
          var on = kind === 'checkbox'
            ? (answers[step.id] || []).indexOf(o.v) !== -1
            : answers[step.id] === o.v;
          html += optionHtml(step.id, o, on, kind);
        });
        html += '</div>';
      }

      html += '<div class="pv-nav">' +
        (stepIndex > 0 ? '<button type="button" class="pv-btn pv-btn--ghost" data-pv="back">Indietro</button>' : '<span></span>') +
        '<button type="button" class="pv-btn pv-btn--next" data-pv="next">' +
          (stepIndex === n - 1 ? 'Vedi la stima' : 'Avanti') + '</button>' +
        '</div>';

      els.body.innerHTML = html;
      syncNext();
      wireStep(step);
    }

    function optionHtml(name, o, on, kind) {
      return '<label class="pv-opt' + (on ? ' is-on' : '') + '">' +
        '<input type="' + kind + '" name="' + name + '" value="' + o.v + '"' +
        (on ? ' checked' : '') + '>' +
        '<span class="pv-opt__label">' + esc(o.label) + '</span>' +
        (o.hint ? '<span class="pv-opt__hint">' + esc(o.hint) + '</span>' : '') +
        '</label>';
    }

    function syncNext() {
      var steps = visibleSteps();
      var step = steps[stepIndex];
      var next = els.body.querySelector('[data-pv="next"]');
      if (next) next.disabled = !stepValid(step);
    }

    function wireStep(step) {
      els.body.addEventListener('change', onChange);
      var back = els.body.querySelector('[data-pv="back"]');
      var next = els.body.querySelector('[data-pv="next"]');
      if (back) back.addEventListener('click', function () { stepIndex--; renderStep(); });
      if (next) next.addEventListener('click', function () {
        if (next.disabled) return;
        stepIndex++; renderStep();
      });

      function onChange(e) {
        var t = e.target;
        if (!t.name) return;
        if (step.type === 'checkbox') {
          var arr = answers[step.id] || [];
          if (t.checked) { if (arr.indexOf(t.value) === -1) arr.push(t.value); }
          else { arr = arr.filter(function (v) { return v !== t.value; }); }
          answers[step.id] = arr;
        } else {
          answers[t.name] = t.value; // radio (anche i due gruppi di 'dual')
        }
        // aggiorna stato visivo selezione + bottone
        var group = els.body.querySelectorAll('input[name="' + t.name + '"]');
        group.forEach(function (inp) { inp.closest('.pv-opt').classList.toggle('is-on', inp.checked); });
        syncNext();
      }
    }

    // stub sostituito dal Task 4
    function goResult() { els.body.innerHTML = '<p>RESULT</p>'; }

    function startWizard() { answers = {}; stepIndex = 0; renderStep(); }
```

- [ ] **Step 2: Aggancia il wizard all'apertura**

In `openSheet` (Task 2), dopo aver reso visibile lo sheet, chiama `startWizard()`. Modifica: subito prima di `var first = sheet.querySelector(...)` inserisci:
```js
      startWizard();
```
(Così ad ogni apertura il wizard riparte pulito.)

- [ ] **Step 3: CSS step/opzioni/progress/nav**

Append a `assets/css/style.css` (stessa sezione PREVENTIVATORE):
```css
.pv-progress { display:flex; flex-direction:column; gap:0.4rem; margin-bottom:1rem;
  font-size:0.8rem; color:var(--color-text-muted); font-family:var(--font-mono, monospace); }
.pv-progress__bar { display:block; height:3px; border-radius:2px; background:rgba(255,255,255,0.1); position:relative; }
.pv-progress__bar::after { content:''; position:absolute; inset:0 auto 0 0; width:var(--pv-p,0%);
  background:var(--color-accent); border-radius:2px; transition:width var(--dur-base) var(--ease-out); }
.pv-step__title { font-size:1.25rem; margin:0 0 1rem; }
.pv-group__label { font-size:0.85rem; color:var(--color-text-muted); margin:1rem 0 0.5rem;
  text-transform:uppercase; letter-spacing:0.05em; }
.pv-options { display:flex; flex-direction:column; gap:0.6rem; }
.pv-opt { display:grid; grid-template-columns:auto 1fr; align-items:center; gap:0.25rem 0.75rem;
  padding:0.85rem 1rem; border:1px solid rgba(255,255,255,0.1); border-radius:12px; cursor:pointer;
  transition:border-color var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out); }
.pv-opt:hover { border-color:rgba(255,255,255,0.25); }
.pv-opt.is-on { border-color:var(--color-accent); background:rgba(255,53,0,0.08); }
.pv-opt input { accent-color:var(--color-accent); width:18px; height:18px; }
.pv-opt__label { font-weight:600; }
.pv-opt__hint { grid-column:2; font-size:0.8rem; color:var(--color-text-muted); }
.pv-nav { display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-top:1.5rem; }
.pv-btn { padding:0.7rem 1.4rem; border-radius:var(--radius-full); font-weight:700; font-size:0.9rem;
  border:1px solid transparent; cursor:pointer; }
.pv-btn--next { background:var(--color-accent); color:#060508; }
.pv-btn--next:disabled { opacity:0.4; cursor:not-allowed; }
.pv-btn--ghost { background:none; color:var(--color-text); border-color:rgba(255,255,255,0.2); }
```

- [ ] **Step 4: Verifica manuale — flusso completo e condizionali**

Preview `index.html?v=2`, apri il pill. Observations:
- **Vetrina**: step ordine `tipo → pagine → funzioni → contenuti → urgenza → manutenzione` (6 step, no prodotti). Progress `1/6 … 6/6`.
- **Landing**: salta pagine → 5 step.
- **E-commerce**: appare lo step **prodotti** → 7 step.
- **Custom**: dopo `tipo` il bottone diventa "Vedi la stima" (1/1) e va allo stub RESULT.
- **Avanti** disabilitato finché lo step richiesto non è valido; **funzioni** (checkbox) permette Avanti anche vuoto; **contenuti** richiede entrambi i gruppi.
- **Indietro** conserva le scelte; **is-on** evidenzia le selezioni.
- Fine wizard → `els.body` mostra `RESULT` (stub).

- [ ] **Step 5: Commit**

```bash
git add assets/js/main.js assets/css/style.css
git commit -m "feat(preventivo): step wizard with conditional steps + validation"
```

---

## Task 4: Schermata risultato (forbice / custom)

**Files:**
- Modify: `assets/js/main.js` (sostituisce lo stub `goResult`)
- Modify: `assets/css/style.css` (stili result)

**Interfaces:**
- Consumes: `computeQuote`, `formatEuro` (Task 1); `answers`, `els`, `startWizard` (Task 2–3).
- Produces (usate da Task 5):
  - `goResult()` reale che rende la forbice e lascia un hook `els.body.querySelector('.pv-cta-slot')` dove il Task 5 monta la CTA.
  - `lastQuote` — l'oggetto tornato da `computeQuote`, per il messaggio Web3Forms.

- [ ] **Step 1: Sostituisci lo stub `goResult`**

Rimpiazza `function goResult() { els.body.innerHTML = '<p>RESULT</p>'; }` con:
```js
    var lastQuote = null;

    function goResult() {
      var q = computeQuote(answers);
      lastQuote = q;
      var html;
      if (q.custom) {
        html = '<div class="pv-result">' +
          '<p class="pv-result__eyebrow">Progetto su misura</p>' +
          '<h3 class="pv-result__range">Parliamone</h3>' +
          '<p class="pv-result__note">Un gestionale o una web app su misura hanno ' +
          'bisogno di un preventivo dedicato: raccontami cosa ti serve.</p>' +
          '<div class="pv-cta-slot"></div>' +
          '<button type="button" class="pv-restart" data-pv="restart">Ricomincia</button>' +
          '</div>';
      } else {
        html = '<div class="pv-result">' +
          '<p class="pv-result__eyebrow">Stima indicativa</p>' +
          '<h3 class="pv-result__range">Da ' + formatEuro(q.low) + '€ a ' + formatEuro(q.high) + '€</h3>' +
          (q.maintenance
            ? '<p class="pv-result__maint">+ manutenzione da ' + formatEuro(q.maintenance) + '€/anno (opzionale)</p>'
            : '') +
          '<p class="pv-result__note">Stima indicativa. Il preventivo reale arriva dopo il brief.</p>' +
          '<div class="pv-cta-slot"></div>' +
          '<button type="button" class="pv-restart" data-pv="restart">Ricomincia</button>' +
          '</div>';
      }
      els.body.innerHTML = html;
      els.body.querySelector('[data-pv="restart"]').addEventListener('click', startWizard);
      mountCta();  // definita nel Task 5; stub qui sotto finché non c'è
    }
```

- [ ] **Step 2: Stub temporaneo di `mountCta`**

Finché il Task 5 non la implementa, aggiungi accanto a `goResult` (verrà sostituita):
```js
    function mountCta() { /* Task 5 */ }
```

- [ ] **Step 3: CSS result**

Append:
```css
.pv-result { text-align:center; padding-top:0.5rem; }
.pv-result__eyebrow { font-family:var(--font-mono, monospace); font-size:0.8rem;
  text-transform:uppercase; letter-spacing:0.08em; color:var(--color-accent); margin:0 0 0.5rem; }
.pv-result__range { font-family:var(--font-display, inherit); font-size:clamp(2rem,8vw,2.75rem);
  line-height:1.05; margin:0 0 0.5rem; }
.pv-result__maint { font-size:0.95rem; color:var(--color-text); margin:0 0 0.75rem; }
.pv-result__note { font-size:0.85rem; color:var(--color-text-muted); max-width:38ch;
  margin:0 auto 1.25rem; line-height:1.6; }
.pv-restart { margin-top:1rem; background:none; border:none; color:var(--color-text-muted);
  font-size:0.85rem; text-decoration:underline; cursor:pointer; }
```

- [ ] **Step 4: Verifica manuale — numeri corretti**

Preview, apri il pill e componi il **caso B** del self-check: E-commerce · 5–8 · Multilingua · testi "Li scrivi tu" · media "produzione foto + video" · prodotti "Li carico io" · Urgente · manutenzione "canone".
Expected: **"Da 4.000€ a 5.400€"** + riga "+ manutenzione da 300€/anno (opzionale)".
Poi **custom**: scegli "Web app / gestionale su misura" → schermata "Parliamone", nessun numero.
"Ricomincia" → torna allo step 1 pulito.

- [ ] **Step 5: Commit**

```bash
git add assets/js/main.js assets/css/style.css
git commit -m "feat(preventivo): result screen (range / custom / maintenance line)"
```

---

## Task 5: CTA + invio Web3Forms + link brief

**Files:**
- Modify: `assets/js/main.js` (implementa `mountCta`, submit)
- Modify: `assets/css/style.css` (stili cta/mini-form/messaggi)

**Interfaces:**
- Consumes: `answers`, `lastQuote`, `labelOf`, `formatEuro`, `els`.
- Produces: niente per altri task (è l'ultimo).

- [ ] **Step 1: Implementa `mountCta` (riepilogo + mini-form + brief)**

Sostituisci lo stub `mountCta` con:
```js
    function buildSummary() {
      var q = lastQuote;
      var lines = ['— Preventivo automatico dal sito —'];
      lines.push('Tipo: ' + labelOf('tipo', answers.tipo));
      if (answers.pagine)   lines.push('Pagine: ' + labelOf('pagine', answers.pagine));
      if (answers.funzioni && answers.funzioni.length)
        lines.push('Funzioni: ' + answers.funzioni.map(function (f) { return labelOf('funzioni', f); }).join(', '));
      if (answers.testi)    lines.push('Testi: ' + labelOf('contenuti', answers.testi, 'testi'));
      if (answers.media)    lines.push('Foto & video: ' + labelOf('contenuti', answers.media, 'media'));
      if (answers.prodotti) lines.push('Prodotti: ' + labelOf('prodotti', answers.prodotti));
      if (answers.urgenza)  lines.push('Urgenza: ' + labelOf('urgenza', answers.urgenza));
      if (answers.manutenzione) lines.push('Manutenzione: ' + labelOf('manutenzione', answers.manutenzione));
      if (q && !q.custom) {
        lines.push('Stima: Da ' + formatEuro(q.low) + '€ a ' + formatEuro(q.high) + '€');
        if (q.maintenance) lines.push('Manutenzione annua: da ' + formatEuro(q.maintenance) + '€/anno');
      } else {
        lines.push('Stima: progetto su misura');
      }
      return lines.join('\n');
    }

    function mountCta() {
      var slot = els.body.querySelector('.pv-cta-slot');
      if (!slot) return;
      slot.innerHTML =
        '<button type="button" class="pv-btn pv-btn--next pv-cta-main" data-pv="ask">Richiedi il preventivo reale</button>' +
        '<a class="pv-btn pv-btn--ghost pv-cta-brief" href="/assets/docs/brief-progetto-fpdeveloper.pdf" target="_blank" rel="noopener">Scarica il brief</a>' +
        '<form class="pv-lead" hidden novalidate>' +
          '<input type="hidden" name="access_key" value="2c7f91ae-9b42-4cc0-bddd-8dad87342094">' +
          '<input type="hidden" name="subject" value="Preventivo automatico dal sito">' +
          '<input type="hidden" name="from_name" value="FPdeveloper — preventivatore">' +
          '<input type="hidden" name="message" value="">' +
          '<input type="checkbox" name="botcheck" class="pv-hp" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<input type="text"  name="name"  class="pv-input" placeholder="Nome (facoltativo)" autocomplete="name">' +
          '<input type="email" name="email" class="pv-input" placeholder="La tua email" required autocomplete="email">' +
          '<button type="submit" class="pv-btn pv-btn--next">Invia</button>' +
          '<p class="pv-lead__msg" role="status" aria-live="polite"></p>' +
        '</form>';

      var askBtn = slot.querySelector('[data-pv="ask"]');
      var form   = slot.querySelector('.pv-lead');
      var msg    = slot.querySelector('.pv-lead__msg');

      askBtn.addEventListener('click', function () {
        form.hidden = false;
        form.querySelector('input[name="message"]').value = buildSummary();
        askBtn.hidden = true;
        form.querySelector('input[name="email"]').focus();
      });

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var email = form.querySelector('input[name="email"]').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          showLead('Inserisci un’email valida.', 'error'); return;
        }
        var submit = form.querySelector('button[type="submit"]');
        submit.disabled = true; submit.textContent = 'Invio…';
        try {
          var res = await fetch('https://api.web3forms.com/submit',
            { method:'POST', body:new FormData(form) });
          var data = await res.json();
          if (data.success) showLead('Inviato! Ti ricontatto presto.', 'success');
          else showLead(data.message || 'Errore, riprova.', 'error');
        } catch (_) {
          showLead('Invio non riuscito. Scrivimi a fede-palma@hotmail.it.', 'error');
        } finally {
          submit.disabled = false; submit.textContent = 'Invia';
        }
      });

      function showLead(text, kind) {
        msg.textContent = text;
        msg.className = 'pv-lead__msg is-' + kind;
      }
    }
```

Nota: `labelOf('contenuti', ...)` funziona perché `labelOf` scorre anche i `groups` dello step `contenuti`.

- [ ] **Step 2: CSS cta/mini-form**

Append:
```css
.pv-cta-slot { display:flex; flex-direction:column; gap:0.6rem; margin-top:0.5rem; }
.pv-cta-main { width:100%; }
.pv-cta-brief { width:100%; text-align:center; text-decoration:none; }
.pv-lead { display:flex; flex-direction:column; gap:0.6rem; margin-top:0.4rem; }
.pv-input { padding:0.75rem 1rem; border-radius:10px; border:1px solid rgba(255,255,255,0.15);
  background:rgba(255,255,255,0.03); color:var(--color-text); font-size:0.95rem; }
.pv-input:focus { outline:none; border-color:var(--color-accent); }
.pv-hp { position:absolute; left:-9999px; width:1px; height:1px; opacity:0; }
.pv-lead__msg { font-size:0.85rem; margin:0; min-height:1.1em; }
.pv-lead__msg.is-success { color:var(--color-secondary, #C6FF00); }
.pv-lead__msg.is-error   { color:var(--color-accent); }
```

- [ ] **Step 3: Verifica manuale — CTA e invio**

Preview, arriva a un risultato numerico.
- "Scarica il brief" apre il PDF in nuova scheda.
- "Richiedi il preventivo reale" → compare mini-form; il campo hidden `message` contiene il riepilogo + stima (controlla in DevTools).
- Submit senza email valida → messaggio d'errore inline.
- Submit con email valida → chiamata a `api.web3forms.com/submit`; su success → "Inviato! Ti ricontatto presto." (verifica la request in `read_network_requests`). L'honeypot `botcheck` resta vuoto.

- [ ] **Step 4: Verifica cross-page finale**

Su `index/about/services/portfolio`: pill presente, flusso completo ok. Su `contact.html`: pill assente. Nessun errore in console (`read_console_messages`). `#preventivo-selfcheck` ancora verde.

- [ ] **Step 5: Commit + push (fine feature)**

```bash
git add assets/js/main.js assets/css/style.css
git commit -m "feat(preventivo): lead CTA (Web3Forms) + brief link"
git push
```

- [ ] **Step 6: Aggiorna HANDOFF**

Sposta il preventivatore da "Next steps" a "Current progress" in `HANDOFF.md` (una riga: pagine coperte, dove sta il codice, hash self-check). Commit + push.

---

## Self-Review (fatto dall'autore del piano)

**Spec coverage:**
- Pill fisso bottom-center → Task 2. Bottom-sheet + slide + reduced-motion + scroll-lock → Task 2. Skip contact / metanapp → Task 2 (+ Global Constraints).
- 7 step con condizionali (landing salta pagine, prodotti solo e-commerce, custom esce) → Task 3.
- Contenuti a due gruppi (testi + media) → Task 3 (`type:'dual'`).
- Motore prezzi (tabelle + formula + roundTo100 + forbice + custom + maintenance) → Task 1. Numeri verificati dai casi self-check (allineati agli esempi dello spec corretto).
- Output forbice + riga manutenzione + disclaimer → Task 4.
- CTA "Richiedi il preventivo reale" (mini-form, email, invio Web3Forms, no dati in URL, honeypot) + "Scarica il brief" → Task 5.
- A11y (role/aria/focus/Esc) → Task 2. `aria-live` progress: presente come `role=status` sul messaggio lead (Task 5); lo step indicator è testuale — accettabile.
- Self-check del motore → Task 1.

**Placeholder scan:** nessun TBD/TODO; ogni step ha codice reale. Gli "stub" (`goResult`, `mountCta`) sono dichiarati esplicitamente e sostituiti in un task successivo indicato per nome.

**Type consistency:** `answers`, `computeQuote`, `formatEuro`, `labelOf`, `els`, `openSheet/closeSheet`, `startWizard`, `goResult`, `mountCta`, `lastQuote` usati coerentemente tra i task. `PRICING.spread = 1.35` usato in `computeQuote`. `labelOf('contenuti', …)` coerente col fatto che `labelOf` scorre i `groups`.

**Note su ordine di append dentro l'IIFE:** l'ordine finale è: skip-guard → PRICING/roundTo100/computeQuote/formatEuro → DOM shell + open/close → STEPS + wizard → goResult/mountCta → runSelfCheck + hash trigger. Le funzioni sono dichiarate con `function` (hoisted), quindi l'ordine di dichiarazione non rompe i riferimenti incrociati; conta solo che l'esecuzione (build DOM, `if(hash)`) avvenga dopo le definizioni.
