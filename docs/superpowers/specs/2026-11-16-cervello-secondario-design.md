# Cervello Secondario — design

**Data:** 2026-11-16
**Stato:** in attesa di approvazione

## Intento e perché

Federico vuole un'interfaccia privata che tenga le sue scadenze personali e
**lo avvisi sul telefono prima che scadano**, così non deve ricordarsele a
memoria né controllarle. Il valore non è "una lista di date": è il promemoria
**proattivo e con anticipo** — essere avvisato in tempo per *agire* (chiamare
il gommista, prenotare la visita del certificato, fare i preventivi
dell'assicurazione), non il giorno stesso.

Categorie dette da lui: cambio gomme (+ chiamare il gommista), compleanni
importanti, scadenza assicurazione, scadenza certificato sportivo.

## Obiettivi

- Pagina privata dove vede tutte le sue scadenze in un posto ("i miei dati").
- Aggiungere/modificare/eliminare una scadenza dall'interfaccia.
- Notifica **sul telefono** con anticipo configurabile per ogni voce.
- Ricorrenze giuste per categoria (compleanni ogni anno, gomme due volte
  l'anno, ecc.) senza doverle reinserire.
- Resta roba sua: i dati non sono pubblici, non passano da server di terzi
  oltre a Google (che lui già usa).

## Non-obiettivi

- Niente app da installare, niente notifiche push native / PWA / VAPID.
- Niente backend proprio, niente database da gestire, niente npm/build.
- Non è un calendario completo: gestisce solo le *sue scadenze-promemoria*, non
  tutti gli eventi.
- Niente multi-utente: è per lui. (Chiunque apra la pagina vede il *proprio*
  Google, non i dati di Federico.)

## Anti-obiettivi (fallimento anche se "funziona")

- Un promemoria che arriva **il giorno stesso** della scadenza → inutile, non
  fa in tempo ad agire. L'anticipo è il punto.
- Dover reinserire le ricorrenti ogni anno.
- Una notifica che non arriva perché dipende da infrastruttura fragile.
- Dati privati (assicurazione, date personali) finiti in un repo pubblico o su
  un servizio a caso.

## Vincoli

- Sito attuale = GitHub Pages statico (repo **pubblico** PalmioTech/PortfolioFP).
  Non può girare cron né backend.
- Stesso stack del resto: vanilla HTML/CSS/JS, zero dipendenze npm, zero build.
- Deve stare dentro il sito come sottocartella (come `assistentefanta/`).
- Stile uniforme col sito (Figtree/Syne/Space Mono + palette portfolio).

## Approcci considerati

Il nodo: per notificare "fra 3 giorni" senza che lui apra nulla, serve
*qualcosa che gira da solo* + un canale verso il telefono. Un sito statico non
può. Tre strade:

- **A — Cloudflare Worker + Telegram.** Un Worker gratis fa interfaccia + dati
  (KV) + cron giornaliero + messaggio Telegram. Robusto e autonomo, ma
  introduce un servizio esterno nuovo e la notifica è un messaggio Telegram.
- **B — PWA + Web Push.** App installabile con push native. La più "figa" ma la
  più lavoro e la più fragile (service worker, VAPID, grane iOS). Scartata:
  troppo costo per un tool personale da 4 categorie.
- **C — Interfaccia + Google Calendar.** ← **scelta.** La pagina scrive eventi
  nel Google Calendar di Federico; le notifiche le fa l'app Calendar che ha già
  sul telefono. Nessuna infrastruttura di notifica da costruire o mantenere.

Dentro C, due varianti:

- **C1 — launcher zero-setup** (link "Aggiungi a Google Calendar"/.ics, niente
  login). Scartata: niente dashboard, i dati non si rileggono, ogni aggiunta è
  un click-through manuale → non è "i miei dati in un'interfaccia".
- **C2 — dashboard vera** ← **scelta da Federico.** Login Google una tantum
  (OAuth), la pagina **legge e scrive** un calendario dedicato: vede tutto,
  aggiunge con un click, ricorrenze+promemoria automatici.

**Perché C2 batte le altre:** notifiche affidabili col minimo da costruire e
**zero da mantenere** (Google fa il lavoro di cron+push), resta statico (vive
nel sito), i dati stanno nel Google di Federico dietro il suo login. A aggiunge
un servizio e una dipendenza; B è sovradimensionata e fragile.

## Come funziona (le scelte già prese — *mie* dove non dette da Federico)

### Meccanica notifiche
La pagina crea **eventi in un Google Calendar dedicato** ("Secondo Cervello").
Ogni evento porta uno o più **promemoria** (reminder override) a *N giorni
prima*. La notifica sul telefono la fa l'app Google Calendar. → *Mia scelta:*
dipende dal fatto che le notifiche di Calendar siano attive sul telefono — è un
check una tantum che mettiamo nelle istruzioni di setup.

### Niente backend (statico puro)
- **Google Identity Services (GIS)**, token model in-browser: niente client
  secret, niente server. `initTokenClient` → access token, scope
  `https://www.googleapis.com/auth/calendar.events` (basta questo: legge e
  scrive eventi; niente scope sensibile su tutto il calendario).
- Chiamate a **Google Calendar REST** via `fetch` col Bearer token (le API
  Google permettono CORS da browser). → *Mia scelta:* REST via fetch invece
  della libreria `gapi`, per restare leggeri e senza script extra oltre a GIS.
- Il **Client ID OAuth è pubblico per natura** (non è un segreto): può stare nel
  codice/repo pubblico senza rischi. I *dati* stanno in Google dietro il login.

### Setup una tantum (lo fa Federico — vedi "Prerequisito" sotto)
Serve un Client ID OAuth creato da lui in Google Cloud. Io non posso creare
account/progetti Google né inserire le sue credenziali. È ~10 minuti, una volta
sola.

### Modello dati
- → *Mia scelta:* le scadenze vanno sul **calendario principale** di Federico,
  marcate con una proprietà dell'app. La dashboard legge solo le proprie
  (filtro per `privateExtendedProperty`), quindi non si confonde con altro. Così
  basta lo scope `calendar.events` (leggero, non sensibile) e non serve creare
  né far scegliere un calendario. Costo: le voci appaiono anche nella vista
  normale del suo calendario — accettabile, anzi comode da vedere lì. Override:
  calendario dedicato, ma costa scope pieno + UI di scelta → rimandato se serve.
- Ogni scadenza = un evento con:
  - `summary` con icona categoria (es. "🛞 Cambio gomme invernali").
  - `recurrence` RRULE per le ricorrenti.
  - `reminders.overrides` = popup a *giorni-prima × 1440* minuti.
  - `extendedProperties.private = { app:'cervello', categoria:'...' }` → la
    dashboard interroga
    `events.list?calendarId=primary&privateExtendedProperty=app=cervello` e
    vede **solo** le proprie voci, ignorando il resto del calendario.

### Categorie e default (tutti modificabili per voce)
→ *Mie scelte sui default*, da correggere se non ti tornano:

| Categoria | Ricorrenza | Promemoria (anticipo) | Note |
|---|---|---|---|
| 🛞 Gomme invernali | ogni anno, ~1 nov | 10 gg prima ("chiama gommista") | obbligo IT 15 nov–15 apr |
| 🛞 Gomme estive | ogni anno, ~15 apr | 10 gg prima | rimonta estivi |
| 🎂 Compleanno | ogni anno | 3 gg prima + mattina del giorno | |
| 🚗 Assicurazione | ogni anno (o una tantum) | 20 gg prima | tempo per preventivi |
| 🏅 Certificato sportivo | ogni anno (o una tantum) | 30 gg prima | tempo per prenotare visita |
| 📌 Altro | una tantum (o ricorrente) | 7 gg prima | scadenza generica |

### Interfaccia
- **Dashboard**: dopo il login, lista delle scadenze ordinate per data, con
  "mancano X giorni", icona+colore categoria, le più vicine in evidenza.
- **Form aggiungi/modifica**: categoria → precompila ricorrenza e anticipo di
  default, lui aggiusta data/anticipo/nome. Salva → `events.insert`.
- **Modifica/elimina** dal dettaglio voce (`events.patch`/`delete`).
- Stile: riuso i token del sito (`--accent #FF3500`, `--lime #C6FF00`,
  Figtree/Syne/Space Mono), stessa estetica di `assistentefanta/`.

### Architettura file (come assistentefanta: vanilla, pochi file, testabile)
```
cervello/
├── index.html        # fonts, GIS script, app.css, js
├── app.css           # token del sito riusati
├── config.js         # CLIENT_ID (lo riempie Federico) + default categorie
├── model.js          # window.Model — PURO: costruisce evento da input,
│                     #   RRULE, offset promemoria, giorni-mancanti. Testabile.
├── gcal.js           # window.GCal — auth GIS + wrapper REST list/insert/patch/delete
├── app.js            # DOM: dashboard, form, wiring
└── tests/tests.html  # harness in-browser, testa solo model.js (niente rete)
```

### Privacy / hosting
→ *Mia scelta:* sottocartella `cervello/` del repo attuale. Il codice è
pubblico ma **non contiene dati** (il Client ID è pubblico per design); i dati
stanno nel Google di Federico dietro il suo login. Chiunque apra la pagina vede
"Connetti Google" e il *proprio* calendario, mai quello di Federico → privato di
fatto, per-utente. Aggiungo `<meta name="robots" content="noindex">` e non la
linko dal menu. Override possibile: repo separato / solo locale, ma costa di più
e non serve.

## Cosa resta al builder

- Testo esatto UI in italiano, icone/colori per categoria entro la palette.
- Logica date precisa: giorni-mancanti a cavallo d'anno, RRULE `FREQ=YEARLY`,
  compleanno 29 feb, due eventi per le gomme da un'unica scelta "gomme".
- Flusso auth GIS (connetti/riconnetti a token scaduto ~1h) con stati UI chiari.
- Suite test su `model.js` (pura, senza rete): giorni-mancanti, offset
  promemoria in minuti, RRULE, default per categoria.

## Prerequisito a carico di Federico (una tantum, ~10 min)

Prima che la pagina funzioni serve il Client ID OAuth. Passi (te li do precisi
quando costruiamo, qui per sapere cosa accetti):
1. Google Cloud Console → nuovo progetto.
2. Abilita **Google Calendar API**.
3. Schermata consenso OAuth → tipo "Esterno", modalità **Test**, aggiungi te
   stesso come utente di test (così niente verifica Google).
4. Credenziali → **Client ID OAuth** (tipo *Applicazione web*), origine
   autorizzata = `https://federicopalmieri.it`.
5. Copi il Client ID in `cervello/config.js`.
E una volta sola: controlla che le **notifiche di Google Calendar siano attive**
sul telefono, altrimenti i promemoria non suonano.
