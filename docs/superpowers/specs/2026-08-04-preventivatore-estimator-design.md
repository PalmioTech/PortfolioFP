# Preventivatore automatico — bottone ancorato + bottom-sheet

**Data:** 2026-08-04
**Stato:** design approvato, pronto per il piano di implementazione
**Stack:** vanilla HTML/CSS/JS, zero dipendenze (vincolo di progetto)

## Obiettivo

Bottone fisso ancorato in basso, presente su tutte le pagine marketing tranne
`contact.html`. Al tap apre un **bottom-sheet** con un wizard a step che raccoglie
le esigenze del progetto e restituisce una **forbice di prezzo indicativa** (Da X
a Y €), con disclaimer e CTA verso il contatto reale. Nessun numero secco: sempre
una stima con range.

Sostituisce/realizza il "preventivatore automatico" in sospeso descritto in
`HANDOFF.md` → Next steps.

## Non-obiettivi (YAGNI)

- Nessuna persistenza dello stato tra sessioni: chiudere il sheet resetta tutto.
- Nessun backend, nessun database, nessun account.
- Nessun preventivo vincolante o PDF generato al volo: la stima è indicativa.
- Nessun gate email obbligatorio per vedere la stima (deciso: forbice libera).
- Nessuna analytics/tracking custom.

## UX / Flusso

1. **Bottone pill fisso**, bottom-center, on-brand (arancio `#FF3500`, testo scuro,
   icona monoline). Label: **"Calcola il preventivo"**. Sempre visibile (non si
   nasconde allo scroll — semplice).
2. Tap → **bottom-sheet** scivola su dal basso (~85% altezza viewport, angoli alti
   arrotondati), con backdrop semi-trasparente dietro; il sito resta intravisto.
3. Wizard **una domanda per schermo**, indicatore `Step n/N` + barra progresso.
   Navigazione: **Avanti** / **Indietro**. Avanti disabilitato finché lo step
   richiesto non è compilato (gli step multi-scelta e la manutenzione possono
   avere risposta vuota = "nessuna").
4. Ultimo step → **Calcola** → schermata risultato con la forbice.
5. Chiusura: ✕ in alto nel sheet, tap sul backdrop, tasto **Esc**. Alla chiusura
   lo stato si resetta.

### Reduced motion
`prefers-reduced-motion: reduce` → niente slide: il sheet appare in dissolvenza
(o istantaneo). Il sheet deve comunque aprirsi (l'animazione è decorativa, non
funzionale).

### Body scroll lock
Sheet aperto → `overflow: hidden` sul `body`; ripristino alla chiusura.

## Wizard — lista step

Step condizionali marcati. Step effettivi: Landing ≈ 5, Vetrina/WordPress ≈ 6,
E-commerce ≈ 7.

1. **Tipo di sito** (radio, obbligatorio) → fissa il prezzo base.
   Se **Web app / gestionale su misura** → esce dal calcolo, mostra schermata
   "Progetto su misura" (nessun numero) + CTA. Salta tutti gli step successivi.
2. **Numero di pagine** (radio) — *salta se Landing*.
3. **Funzioni extra** (multi-scelta, può essere vuoto).
4. **Contenuti** (una schermata, 2 gruppi radio):
   - **a) Testi**: li fornisco io / li scrivi tu
   - **b) Foto & video**: li ho già / serve selezione stock + ritocco / serve
     produzione foto + video
5. **Prodotti** (radio) — *solo se E-commerce*: chi carica i prodotti e in che
   quantità.
6. **Urgenza** (radio) → moltiplicatore.
7. **Manutenzione** (radio) → riga separata (canone annuale), non entra nella
   forbice una-tantum.

## Price engine

Motore puro (input = oggetto risposte, output = `{ base, tot, low, high,
maintenance, custom }`). Nessun accesso al DOM: testabile in isolamento.

### Tabelle (single source of truth nel codice)

> **Listino "esca":** numeri volutamente bassi/attraenti (il preventivatore serve
> ad attrarre; il prezzo reale si concorda dopo il brief). Valori correnti autorevoli
> in `PRICING` in `main.js` (con self-check). Sotto lo snapshot.

**Base — Step 1**
| chiave | label | base |
|---|---|---|
| `landing` | Landing (1 pagina) | 300 |
| `vetrina` | Sito vetrina | 400 |
| `wordpress` | WordPress (gestibile/blog) | 600 |
| `ecommerce` | E-commerce | 800 |
| `custom` | Web app / gestionale su misura | *null → percorso "su misura"* |

**Pagine — Step 2** (salta `landing` e `custom`)
| chiave | delta |
|---|---|
| `1-4` | 0 |
| `5-8` | 150 |
| `9+` | 350 |

**Funzioni — Step 3** (multi, si sommano). Due tabelle: `functions` (default) e
`functionsLanding` (usata quando `tipo === landing`, perché è una pagina sola).
| chiave | label | delta (default) | delta (landing) |
|---|---|---|---|
| `multilingua` | Multilingua | 200 | 100 |
| `prenotazioni` | Prenotazioni / booking | 250 | 150 |
| `area_riservata` | Area riservata / login | 300 | 150 |
| `ai` | Integrazione AI | 350 | 200 |
| `blog` | Blog / news | 100 | 50 |

*(E-commerce NON è qui: è un tipo in Step 1, per evitare doppio conteggio.)*

**Contenuti — Step 4a testi**
| chiave | delta |
|---|---|
| `forniti` | 0 |
| `copywriting` | 150 |

**Contenuti — Step 4b media**
| chiave | delta |
|---|---|
| `forniti` | 0 |
| `stock` | 100 |
| `produzione` | 300 |

**Prodotti — Step 5** (solo `ecommerce`; se non e-commerce → contributo 0)
| chiave | delta |
|---|---|
| `cliente` | 0 |
| `io_fino20` | 100 |
| `io_21_100` | 200 |
| `io_100plus` | 400 |

**Urgenza — Step 6** (moltiplicatore)
| chiave | mult |
|---|---|
| `flessibile` | 1.0 |
| `entro_1_mese` | 1.05 |
| `urgente` | 1.25 |

**Manutenzione — Step 7** (riga separata, NON nella forbice)
| chiave | effetto |
|---|---|
| `indipendente` | nessuna riga |
| `canone` | mostra "+ manutenzione da 150€/anno (opzionale)" |

### Formula

```
somma = base + pagine + Σfunzioni + testi + media + prodotti
tot   = somma × urgenza
low   = roundTo100(tot)
high  = roundTo100(tot × 1.35)
```

`roundTo100(x) = Math.round(x / 100) * 100`

- Output forbice: **"Da {low}€ a {high}€"** (formattazione IT: `toLocaleString('it-IT')`
  → separatore migliaia `.`).
- Se `tipo === custom`: nessun calcolo → schermata "Progetto su misura — parliamone".
- Se manutenzione `canone`: sotto la forbice, riga "+ manutenzione da 150€/anno
  (opzionale)".

### Esempio di verifica

E-commerce + 5–8 pagine + multilingua + testi `copywriting` + media `produzione`
+ prodotti `cliente` + urgenza `urgente`:
`somma = 800 + 150 + 200 + 150 + 300 + 0 = 1600` → `tot = 1600 × 1.25 = 2000`
→ low `roundTo100(2000) = 2000`, high `roundTo100(2700) = 2700`
→ **"Da 2.000€ a 2.700€"**.

Landing, tutto minimo, flessibile: `300 × 1.0 = 300` → low `300`,
high `roundTo100(405) = 400` → **"Da 300€ a 400€"**.

Arrotondamento (verifica bidirezionale) — Vetrina + prenotazioni + media stock,
urgenza `entro_1_mese`: `somma = 400 + 250 + 100 = 750` → `tot = 750 × 1.05 =
787.5` → low `roundTo100(787.5) = 800`, high `roundTo100(1063.125) = 1100`
→ **"Da 800€ a 1.100€"**.

Funzioni scontate su landing — Landing + `ai` (delta landing 200, non 350),
contenuti forniti, flessibile: `300 + 200 = 500` → **"Da 500€ a 700€"**.

## Output / CTA

Schermata risultato:
- Titolo + **forbice** grande.
- (eventuale) riga manutenzione annuale.
- **Disclaimer**: "Stima indicativa. Il preventivo reale arriva dopo il brief."
- **CTA primaria — "Richiedi il preventivo reale"**: espande inline un mini-form
  (nome opzionale, **email**, messaggio precompilato con riepilogo risposte +
  stima). Invio via **Web3Forms** (riusa `access_key` già presente in
  `contact.html`, stesso honeypot `botcheck`). Su successo: messaggio di conferma;
  su errore: messaggio reale + link a `contact.html`. Le risposte NON viaggiano in
  URL (privacy).
- **CTA secondaria — "Scarica il brief"**: link a
  `assets/docs/brief-progetto-fpdeveloper.pdf` (esistente).
- Link tenue "Ricomincia" per resettare il wizard.

## Architettura tecnica

### File toccati
- **`assets/js/main.js`**: una nuova **IIFE in coda** (come `PAGE TRANSITION
  OVERLAY`), che:
  - Fa **skip** se la pagina è `contact.html` (test su `location.pathname`).
    *(Le pagine `metanapp/*` non caricano `main.js` → già escluse.)*
  - Inietta bottone + sheet in `<body>` via `document.createElement` /
    `appendChild` (nessun markup da aggiungere nell'HTML delle pagine).
  - Contiene: tabelle prezzi, motore di calcolo puro, gestione step/stato,
    render, invio Web3Forms.
- **`assets/css/style.css`**: nuova sezione delimitata da commento (bottone pill,
  sheet, backdrop, step, progress, risultato, mini-form). Solo CSS var esistenti,
  mai hardcode. `z-index` ~9998 (sotto `page-transition` a 9999).

### Nessuna modifica all'HTML delle pagine
Tutto iniettato da JS → un solo punto di manutenzione, coerente col vincolo
"tutto il JS in main.js".

### Accessibilità
- Bottone: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- Sheet: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`.
- Apertura → focus sul primo controllo del sheet; chiusura → focus torna al
  bottone. Focus trap leggero (Tab ciclato dentro il sheet) + Esc.
- Gruppi radio/checkbox nativi (navigabili da tastiera).
- Indicatore step con `aria-live="polite"`.

## Edge cases
- `tipo = custom` → bypassa calcolo, schermata "su misura" + CTA.
- Nessuna funzione selezionata → Σfunzioni = 0 (valido).
- Non-e-commerce → step Prodotti saltato, contributo 0.
- Doppio tap sul bottone / apertura mentre aperto → idempotente.
- Invio Web3Forms fallito → messaggio reale + fallback a `contact.html`.

## Testing / verifica
- **Self-check del motore prezzi**: funzione `demo()` con `assert` sui due esempi
  sopra (E-commerce 3.800–5.100, Landing 600–800) + caso `custom` (ritorna
  `custom:true`, nessun numero). Eseguibile in console o come blocco `__demo__`
  gated da un flag, senza framework.
- Verifica manuale sul live (deploy Pages ~30s): apertura sheet, percorso completo,
  reduced-motion, Esc/backdrop, invio form. Browser pane inaffidabile per cache →
  bustare `style.css?v=…` o verificare sul dominio live (vedi HANDOFF).

## Copertura pagine (da confermare in review)
Deciso: "ovunque tranne contatti". Implementazione: skip solo `contact.html`.
`metanapp/*` è escluso automaticamente (non carica `main.js`) — coerente col fatto
che è un prodotto diverso. Se in futuro le pagine metanapp includeranno `main.js`,
aggiungere anche loro alla skip-list.
