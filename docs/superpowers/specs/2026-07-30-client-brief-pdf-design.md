# Brief di progetto — PDF compilabile (client intake)

**Data:** 2026-07-30
**Obiettivo:** un PDF che Federico invia ai potenziali clienti; compilandolo, il cliente fornisce tutte le informazioni per definire il sito e preparare un preventivo.

## Decisioni approvate

- **Formato:** PDF compilabile a schermo (campi AcroForm: text field, checkbox, radio). Il cliente scrive dentro dal PC/telefono, salva e lo rimanda.
- **Lunghezza:** completo, 3-4 pagine.
- **Lingua:** italiano.
- **Look:** sfondo chiaro (bianco/panna) con accenti arancio brand (`#FF3500`) e i font del brand (Syne per i titoli, Figtree per il corpo — con fallback se non incorporabili). Scelta deliberata: un form si legge/stampa meglio chiaro, diverso dal near-black del sito ma coerente col marchio.
- **Campi:** prevalenza di checkbox + campi brevi (i form PDF hanno campi a lunghezza fissa); poche aree di testo libero.

## Vincoli tecnici

- Generazione con **reportlab** (`canvas.acroForm`) in Python — unico modo affidabile per campi PDF realmente compilabili. Da installare in fase di build (`pip install reportlab`).
- Font brand: se i .ttf non sono disponibili localmente, usare font di sistema simili (grotesque bold per i titoli, sans leggibile per il corpo) senza bloccare la generazione.
- Nomi dei campi AcroForm in inglese/snake (es. `nome_azienda`) per pulizia; etichette visibili in italiano.
- Output: `assets/docs/brief-progetto-fpdeveloper.pdf` (nuova cartella), così è linkabile anche dal sito in futuro.

## Struttura del documento

**Intestazione (ogni pagina o solo la prima):** logo/wordmark FP, titolo "Brief di progetto", sottotitolo "Compila e rimandamelo: da qui preparo il preventivo."

### 1. I tuoi dati
- Nome e cognome / Azienda (text)
- Referente (text)
- Email (text)
- Telefono / WhatsApp (text)
- Sito attuale, se c'è (text)
- Social principali (text)

### 2. La tua attività
- Cosa fai / settore (text breve)
- Da quanto tempo sei attivo (text breve)
- Cosa ti distingue dai concorrenti (text, 1-2 righe)
- 2-3 concorrenti o siti simili — URL (text)

### 3. Obiettivo del sito (checkbox, multipli)
- Farmi trovare su Google
- Ricevere richieste / contatti
- Vendere online (e-commerce)
- Prendere prenotazioni / appuntamenti
- Presentare il mio lavoro (vetrina / portfolio)
- Altro (text)

### 4. Tipo di sito (radio, singola scelta)
- Sito vetrina
- Landing page
- WordPress avanzato
- E-commerce
- Gestionale / web app
- Non lo so, consigliami tu

### 5. Pagine e funzioni (checkbox, multipli)
- **Pagine:** Home · Chi siamo · Servizi / Prodotti · Portfolio / Gallery · Blog · Contatti · Altro (text)
- **Funzioni:** Form contatti · Prenotazioni / booking · E-commerce · Area riservata / login · Multilingua (quali lingue: text) · Chat / AI · Newsletter · Mappa · Integrazione social

### 6. Contenuti e materiali (radio per riga)
- Testi: già pronti / da scrivere insieme / li scrivi tu (Federico)
- Foto e immagini: ho le mie / servono stock / serve servizio fotografico
- Logo e brand: ho logo e colori / da creare
- Dominio: ce l'ho (quale: text) / da registrare
- Hosting: ce l'ho / da configurare

### 7. Stile e gusto
- 3 aggettivi che deve trasmettere il sito (text)
- Colori preferiti / da evitare (text)
- 2-3 siti che ti piacciono + cosa ti piace (text)

### 8. Budget e tempi (radio)
- Budget indicativo: < €1.000 · €1.000–2.500 · €2.500–5.000 · €5.000+ · non so ancora
- Tempistica: urgente (< 1 mese) · 1-2 mesi · 2-3 mesi · nessuna fretta
- Manutenzione dopo il lancio: sì · no · da valutare

### 9. Note libere
- Area di testo più ampia (multiline) per qualsiasi altra cosa.

**Chiusura:** "Rimanda il PDF compilato a fede-palma@hotmail.it o su WhatsApp +39 327 290 5579. Ti rispondo entro 24 ore con il preventivo." + riga piccola "FPdeveloper — Federico Palmieri · in collaborazione con Pecas SRLS".

## Contatti (confermati)
- Email: fede-palma@hotmail.it
- Telefono / WhatsApp: +39 327 290 5579
- Brand: FPdeveloper (Federico Palmieri), in collaborazione con Pecas SRLS

## Verifica (definizione di "fatto")
- Il PDF apre senza errori e i campi sono realmente compilabili in Anteprima (macOS) e in un lettore PDF comune.
- Checkbox/radio selezionabili; i radio della stessa domanda sono mutuamente esclusivi.
- Sta in 3-4 pagine, niente testo tagliato, accenti brand presenti.
- Il testo compilato resta nel file dopo il salvataggio.
