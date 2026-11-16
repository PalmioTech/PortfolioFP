# Cervello — ora appuntamento + promemoria a orario + login silenzioso (design corto)

**Data:** 2026-11-16
**Stato:** approvato a voce ("si parti"), design scritto
**Base:** estende `cervello/` (vedi `2026-11-16-cervello-secondario-design.md`). Branch `feat/cervello-ora`.

## Intento / perché
Dall'uso reale di Federico emergono due attriti:
1. **Riconnessione continua.** Il token GIS dura ~1h e non è salvato → oggi deve ricliccare "Connetti" a ogni apertura. Inaccettabile per un uso quotidiano.
2. **Solo date, niente orari.** Un appuntamento è a un'ora (es. cambio gomme mer 15:00) e il promemoria deve scattare a un momento preciso (es. mar 18:00, per caricare le gomme), non "N giorni prima a mezzanotte".

## Obiettivi
- All'apertura: se il consenso è già stato dato, entrare **senza click** (token silenzioso); rinnovo silenzioso anche a token scaduto in corso d'uso.
- Scadenza con **ora opzionale** → evento con orario.
- **"Avvisami" opzionale** a un momento preciso (data+ora) per le scadenze una tantum → il promemoria scatta lì.
- Restare statico, zero backend, token mai salvato (posture di sicurezza invariata).

## Non-obiettivi / anti-obiettivi
- Niente refresh token / backend (resterebbe il login persistente "vero" ma rompe il modello statico).
- Promemoria assoluto NON sulle ricorrenti (un orario fisso non ha senso ripetuto ogni anno → restano "giorni prima").
- Non superare il limite Google di **40320 min (28 giorni)** di anticipo.
- Fallimento: un promemoria che non scatta all'ora giusta, o un login che chiede ancora il click quando non serve.

## Vincoli
- GIS token model: `requestAccessToken({prompt:''})` = silenzioso se c'è sessione Google + consenso già dato; serve interazione solo al primo consenso o da disconnesso.
- Evento con orario: `start.dateTime`/`end.dateTime` + `timeZone:'Europe/Rome'`. All-day resta `start.date`.
- Reminder Google = minuti-prima dell'inizio evento; assoluto → `minuti = inizioEvento − avvisa`, clamp 0..40320.

## Approcci
- **Login persistente:** (A) token silenzioso GIS ← **scelto** (zero backend, niente segreti salvati); (B) salvare il token in localStorage — scartato (downgrade di sicurezza, scade comunque a 1h); (C) backend con refresh token — scartato (rompe lo statico).
- **Promemoria a orario:** (A) campo assoluto "data+ora" ← **scelto** (combacia col modo di pensare di Federico: "ricordamelo martedì alle 18"); (B) "giorni/ore prima" relativo — scartato (lo costringe a calcolare).

## Come (decisioni prese)
### gcal.js — login silenzioso
- `connect(opts)` passa `opts` a `requestAccessToken` (default interattivo; `{prompt:''}` = silenzioso).
- `boot()`: dopo `init`, prova `connect({prompt:''})` → ok ⇒ `render()` diretto; fallisce ⇒ mostra "Connetti".
- `req()`: su 401 azzera il token, prova UN rinnovo silenzioso (`connect({prompt:''})`) e ritenta la richiesta; se anche quello fallisce ⇒ `TOKEN_SCADUTO` (UI mostra "riconnetti").

### model.js — ora + avvisa
- `buildEvent` nuovi campi opzionali `oraISO` ('HH:MM') e `avvisaISO` ('YYYY-MM-DDTHH:MM'):
  - `oraISO` presente ⇒ evento con orario: `start.dateTime = dateISO+'T'+oraISO+':00'`, `end.dateTime = +1h`, `timeZone:'Europe/Rome'`. Altrimenti all-day come ora.
  - `avvisaISO` presente **e non ricorrente** ⇒ `minuti = clamp(inizioEvento − avvisa, 0, 40320)`; inizioEvento = `dateISO+'T'+(oraISO||'00:00')`. Altrimenti `giorniPrima*1440`.
  - Calcolo minuti deterministico (parse UTC su entrambe le stringhe locali, l'offset si annulla). *Nota: un cambio DST tra avvisa ed evento può sfasare di 1h — raro, accettabile v1.*
  - Round-trip: salva `ora` e `avvisa` in `extendedProperties.private`.
- `fromEvent`: `dateISO` da `start.date` o dalla parte-data di `start.dateTime`; restituisce anche `ora` e `avvisa`.

### UI (index.html / app.js / app.css)
- Form: + `Ora (opz.)` `<input type="time" id="fOra">`; + `Avvisami (opz.)` `<input type="datetime-local" id="fAvvisa">` con nota, **mostrato solo per le una tantum** (nascosto/ignorato quando "Si ripete" è spuntato).
- `fAvvisa` valorizzato ⇒ vince sul campo "giorni prima".
- `edit()` ripopola `fOra`/`fAvvisa` dal round-trip; toggle visibilità avvisa su cambio categoria/ricorrente.
- Validazione: avvisa ≥ inizio evento ⇒ messaggio, blocca. Dashboard: mostra l'ora accanto alla data se presente.

## Cosa resta al builder
- Testo IT esatto, layout dei 2 campi nel form, stile coerente coi token.
- Helper puro `minutiPrima(dateISO, oraISO, avvisaISO)` + test (incluso il caso di Federico: evento mer 15:00 / avvisa mar 18:00 → 1260 min).
- Test: evento con orario (dateTime+TZ), round-trip ora/avvisa, clamp a 40320, avvisa su ricorrente ignorato.
- gcal.js: il flusso silenzioso non deve incastrarsi (pending singolo; serializzare il retry).
