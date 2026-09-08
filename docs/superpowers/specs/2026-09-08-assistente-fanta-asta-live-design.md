# Assistente Fanta — Asta Live (design)

**Data:** 2026-09-08
**Percorso deploy:** `federicopalmieri.it/assistentefanta/` (cartella `assistentefanta/` in questo repo)
**Stato:** design approvato, spec da revisionare

## 1. Obiettivo

Web app che assiste Federico **durante l'asta live** del fantacalcio a 14 partecipanti nella scelta dei giocatori. A ogni giocatore chiamato, l'app dice **se serve** alla rosa e **quanto conviene spendere al massimo**, tenendo conto di budget, slot mancanti, avversari e modificatore difesa. Traccia gli acquisti di tutte le 14 squadre in tempo reale.

## 2. Vincoli e assunzioni

| Parametro | Valore |
|-----------|--------|
| Modalità | Classic (P/D/C/A) con **modificatore difesa** attivo |
| Partecipanti | 14 squadre |
| Budget | 500 crediti a squadra |
| Rosa | 3 P / 8 D / 8 C / 6 A = 25 giocatori |
| Chiamata | **Coda alfabetica fissa** per ruolo: prima tutti i P (alfabetici), poi D, poi C, poi A. Tutti rilanciano sullo stesso giocatore chiamato. |
| Tracking | **Completo**: ogni giocatore venduto assegnato a una delle 14 squadre |
| Dispositivo | Laptop o tablet — layout responsive touch+click, landscape |
| Rete | **Offline** durante l'asta (nessuna dipendenza di rete a runtime) |
| Stack | Vanilla HTML/CSS/JS, zero framework/build, nessun backend |

Contesto di scarsità: 14 × 25 = 350 slot su ~550 giocatori Serie A → i titolari scarseggiano, specie nei ruoli chiave. L'advisor segnala la scarsità.

## 3. Architettura

Tre parti, nettamente separate:

1. **Pipeline dati (prep, prima dell'asta)** — dal listone di Federico a un file `players.js` arricchito con ricerca online. Non è codice runtime dell'app; è un passo di preprocessing.
2. **App SPA (runtime, durante l'asta)** — singola pagina vanilla che carica `players.js`, gestisce lo stato dell'asta, mostra l'advisor. Persistenza su `localStorage`.
3. **Motore advisor** — modulo JS puro (funzioni deterministiche) che, dato stato + giocatore corrente, produce verdetto (serve/non serve/priorità) e max consigliato. Testabile in isolamento.

```
assistentefanta/
├── index.html          # unica pagina
├── app.css             # stile (riusa i token del sito dove sensato)
├── app.js              # stato, UI, persistenza, coda
├── advisor.js          # motore consigli (funzioni pure, testato)
├── data/
│   └── players.js      # dati pre-cotti: `window.PLAYERS = {…}` (vedi nota sotto)
└── README.md           # come rigenerare i dati e usare l'app
```

## 4. Modello dati — `players.js`

Caricato via `<script src="data/players.js">` che assegna `window.PLAYERS = { … }`. **Non** un `.json` con `fetch()`: aprendo l'app da `file://` (offline, criterio #6) i browser bloccano `fetch` di file locali (CORS). La global via `<script>` funziona sia da `file://` sia servita in HTTP. La struttura dell'oggetto:

```json
{
  "meta": {
    "stagione": "2025-26",
    "generato": "2026-09-08",
    "fonte_listone": "<nome file>",
    "note": "snapshot pre-asta; la titolarità può cambiare per infortuni last-minute"
  },
  "giocatori": [
    {
      "id": "vlahovic-juventus",
      "nome": "Vlahovic",
      "squadra": "Juventus",
      "ruolo": "A",
      "quota": 28,
      "titolarita": "titolare",        // titolare | ballottaggio | riserva | incerto
      "tier": 1,                        // 1 top … 5 filler
      "nota": "rigorista, prima punta",
      "flags": ["rigorista"],           // rigorista | nuovo | infortunato | giovane | rientro
      "affidabilita_difesa": null       // "alta"|"media"|"bassa" solo per P e D (mod difesa), altrove null
    }
  ]
}
```

- `quota` = valore dal listone (base), non il prezzo d'asta reale.
- Ricerca profonda sui ~300 giocatori rilevanti; i filler oltre la profondità della rosa taggati leggero (`riserva`, `tier 5`, senza nota).

## 5. Stato applicazione

Persistito in `localStorage` (chiave `assistentefanta:v1`), autosalvato a ogni modifica.

```json
{
  "config": {
    "budget": 500,
    "slots": { "P": 3, "D": 8, "C": 8, "A": 6 },
    "split": { "P": 0.08, "D": 0.32, "C": 0.28, "A": 0.32 },
    "tierMult": { "1": 2.5, "2": 1.8, "3": 1.1, "4": 0.6, "5": 0.02 },
    "modDifesaBoost": { "P": 1.15, "D": 1.15 }
  },
  "squadre": [
    { "id": "t0", "nome": "IO", "isMe": true, "budget": 500 }
    /* … 14 totali; budget derivato dalle vendite */
  ],
  "vendite": [
    { "giocatoreId": "vlahovic-juventus", "squadraId": "t0", "prezzo": 61, "seq": 1 }
  ],
  "cursore": { "ruolo": "P", "index": 0 },
  "overrides": { "vlahovic-juventus": { "titolarita": "ballottaggio", "nota": "acciaccato" } }
}
```

Derivati (mai memorizzati): budget residuo squadra = `500 − Σ prezzi`; slot residui per ruolo = `slots[ruolo] − n. acquisti in quel ruolo`. `vendite` è append-only → **undo = pop dell'ultima**.

## 6. UI — schermata asta (una sola vista)

Layout landscape multi-colonna; su schermi stretti collassa a colonne impilate.

- **Header**: ruolo in corso (P/D/C/A) + progressione (es. "D 34/almeno-necessari"), **budget mio residuo** grande, credito-per-slot residuo.
- **Centro — card giocatore corrente**: nome, squadra, ruolo, badge tier, badge titolarità colorato, nota, quota, e in grande: **MAX CONSIGLIATO** + verdetto **SERVE / NON SERVE / PRIORITÀ** + indicatore scarsità. Campo "rilancio corrente" opzionale → alert live se supera il max.
- **Azione VENDUTO**: apre assegnazione → griglia 14 squadre (**IO** evidenziato) + prezzo (tastierino, +1/+5/+10, o input) → conferma. Alternative: **salta / non chiamato**. **UNDO** ultimo sempre visibile.
- **Sinistra — la mia rosa**: slot P/D/C/A (pieni/vuoti), giocatori presi con prezzo, budget.
- **Destra — rivali (13)**: compatti — nome, budget residuo, slot residui per ruolo; evidenzia chi ha ancora slot nel ruolo corrente e chi ha più budget (chi può rilanciarti).
- **Basso — coda**: lista scrollabile del ruolo corrente (alfabetica), corrente evidenziato; click per saltare a un nome; **cerca** per nome.
- **Modifica al volo**: override di titolarità/nota di un giocatore (notizia dell'ultimo minuto) → persistito in `overrides`.
- **Scorciatoie tastiera** (laptop): ← → prev/next in coda, `V` venduto, `M` assegna a me, tasti squadra per acquirente, Invio conferma, `Z` undo, `/` cerca.

## 7. Motore advisor (`advisor.js`)

Euristica **trasparente e tunabile** — niente ottimizzatore complesso. Tutte funzioni pure di `(stato, giocatore) → risultato`.

**Budget-target per ruolo** = `budget × split[ruolo]`, pesato dal mod difesa (default alza P/D). Residuo ruolo = target − speso in quel ruolo.

**Max consigliato** per il giocatore corrente:
```
mediaSlot   = residuoRuolo / slotResiduiRuolo         // crediti medi per slot rimasto
base        = mediaSlot × tierMult[tier]
maxDifesa   = base × (mod difesa boost se ruolo∈{P,D} e affidabilita alta)
cap         = residuoRuolo − (slotResiduiRuolo − 1)   // lascia ≥1 cr per ogni altro slot
maxConsigliato = clamp(round(min(maxDifesa, cap)), 1, residuoRuolo)
```

**Verdetto serve/non serve**:
- `NON SERVE` se: slot ruolo pieni, **oppure** ruolo già coperto a sufficienza con tier ≥ e questo è ridondante di tier inferiore, **oppure** il minimo per il tier non è sostenibile senza rompere il piano.
- `SERVE` se: slot aperto nel ruolo e il tier rientra nel budget residuo.
- `PRIORITÀ` se: SERVE + titolare + scarsità alta.

**Scarsità** (per ruolo): `titolari disponibili rimasti / squadre che hanno ancora slot nel ruolo`. Ratio < 1 → scarsità alta → alza urgenza e leggermente il max.

**Overpay warning**: se il rilancio corrente > max consigliato → rosso con delta.

Tutte le manopole (`split`, `tierMult`, `modDifesaBoost`) editabili in-app; i default sono un punto di partenza da calibrare con Federico.

## 8. Persistenza e robustezza

- **Autosave** su `localStorage` a ogni cambiamento.
- **Export/Import** stato come file JSON (backup manuale anti-crash; ripristino su altro dispositivo).
- **Reset** con conferma esplicita.
- **Undo** ultima vendita (append-only log).
- Nessuna azione distruttiva senza conferma.

## 9. Pipeline dati (come si costruisce `players.js`)

Passo di build, **prima** dell'asta, quando arriva il listone:

1. **Parse listone** (CSV/XLSX) → nome, squadra, ruolo, quota.
2. **Ricerca online in parallelo** (fan-out di agenti, un blocco per squadra/ruolo): probabili formazioni, titolarità, ballottaggi, rigoristi, infortuni, nuovi acquisti — da siti di probabili formazioni e articoli. TikTok/Instagram solo best-effort, la sostanza dai siti. → tag `titolarita`, `tier`, `nota`, `flags`, `affidabilita_difesa`.
3. **Verifica adversarial**: un secondo agente controlla incongruenze (es. più titolari incompatibili stessa squadra/ruolo, tier vs quota fuori scala).
4. **Merge** → `players.js`. Filler oltre profondità rosa: tag leggero senza ricerca profonda.
5. Lo snapshot ha una data; l'app mostra la data e consente override al volo per notizie last-minute.

**Onestà sui limiti**: i dati sono uno snapshot pre-asta; infortuni/formazioni possono cambiare. L'accuratezza dipende dalle fonti; l'override manuale copre gli scarti.

## 10. Fuori scope (YAGNI)

No account/login, no cloud/sync, no multi-lega, no modalità Mantra, no scraping a runtime, no storicizzazione rose passate, no aste multiple simultanee. Un'asta, un dispositivo, un file.

## 11. Criteri di successo

1. Carico i dati (`players.js`) → vedo la coda dei P in ordine alfabetico.
2. Assegno una vendita a una squadra con prezzo → budget e slot si aggiornano ovunque, il giocatore esce dalla coda.
3. Undo ripristina lo stato precedente esatto.
4. L'advisor dà verdetto + max coerenti col budget residuo e col mod difesa.
5. Ricarico la pagina → lo stato è intatto (localStorage).
6. Funziona **offline** aprendo il file, su laptop e su tablet in landscape.

## 12. Rischi e punti aperti

- **Formato listone** (CSV vs XLSX, nomi colonne) → gestito quando arriva il file.
- **Accuratezza ricerca** su ~300 giocatori → mitigata da verifica adversarial + override.
- **Taratura moltiplicatori** advisor → da calibrare insieme con dati reali.
