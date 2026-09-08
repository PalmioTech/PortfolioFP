# Assistente Fanta — Asta Live

Assistente di consultazione per l'asta live di fantacalcio in formato classic con modificatore difesa.

## 1. Cos'è

**Assistente Fanta** è uno strumento per gestire e consultare verdetti di acquisto durante l'asta live di fantacalcio.

- **Formato**: Classic + Modificatore Difesa
- **Squadre**: 14 (voi + 13 rivali)
- **Rosa**: 3 Portieri + 8 Difensori + 8 Centrocampisti + 6 Attaccanti
- **Budget**: 500 crediti totali (distribuiti per ruolo)
- **Coda di asta**: Alfabetica per ruolo (P → D → C → A)

## 2. Uso durante l'asta

### Avviare l'app

Apri `index.html` nel browser. Non serve alcun server (funziona anche da `file://`).

### Durante la chiamata di ogni giocatore

Per ogni giocatore in asta:
1. **Navigazione**: premi `←` o `→` per scorrere la lista
2. **Consulta il verdetto**: nella sezione "Consiglio" vedi:
   - **Verdetto**: `SERVE` / `NON SERVE` / `PRIORITÀ`
   - **Max consigliato**: prezzo suggerito per il tuo ruolo/budget
   - **Scarsità**: quanti titolari rimangono vs. quante squadre han bisogno

### Quando il giocatore viene venduto

1. Premi `v` per aprire il **modulo di vendita**
2. Scegli la squadra (griglia 14 squadre; "IO" è in evidenza)
3. Inserisci il prezzo realizzato
4. Clicca **VENDUTO** per registrare

### Scorciatoie da tastiera

| Tasto | Azione |
|-------|--------|
| `←` / `→` | Naviga il giocatore precedente/successivo |
| `v` | Apri il form di vendita |
| `m` | Assegna il giocatore a te (se il form è aperto) |
| `z` | Undo: annulla l'ultima azione |
| `/` | Apri la ricerca per nome giocatore |

### Funzioni aggiuntive

- **Undo**: pulsante per tornare indietro (es. prezzo sbagliato, squadra sbagliata)
- **Export**: salva lo stato asta in JSON (backup/import successivo)
- **Import**: carica uno stato salvato precedentemente
- **✎ nota**: modifica al volo titolarità e note su un giocatore (news last-minute)
- **⚙︎**: pannello configurazione (modifica split budget, moltiplicatori tier, boost difesa)
- **Reset**: cancella tutto e ricomincia

## 3. Test

Per eseguire i test:

1. Apri `tests/tests.html` nel browser
2. La pagina stampa nella console: `TESTS: N passed, M failed`
3. I dettagli dei test falliti appaiono sia nel corpo della pagina che nella console

Non è richiesto Node.js né alcun test runner esterno. È un harness browser auto-contenuto.

## 4. Dati (`data/players.js`)

Il file `data/players.js` espone `window.PLAYERS` con la seguente struttura:

```javascript
window.PLAYERS = {
  meta: {
    stagione: '2025-26',
    generato: '2026-09-08 (SAMPLE)',
    fonte_listone: 'sample',
    note: 'dati fittizi per sviluppo'
  },
  giocatori: [
    {
      id: 'falcone-lecce',        // Identificativo univoco
      nome: 'Falcone',            // Nome giocatore
      squadra: 'Lecce',           // Squadra Serie A
      ruolo: 'P',                 // Ruolo: P (Portiere), D (Difensore), C (Centrocampista), A (Attaccante)
      quota: 9,                   // Prezzo partenza (crediti)
      titolarita: 'titolare',     // 'titolare', 'ballottaggio', 'riserva', 'incerto'
      tier: 4,                    // Fascia di qualità (1=top, 5=giovane/riserva)
      nota: '',                   // Nota libera (ballottaggi, infortuni, news)
      flags: [],                  // Array: 'rigorista', 'assist', etc.
      affidabilita_difesa: 'bassa'// Solo P/D: 'alta', 'media', 'bassa' (bonus mod-difesa se 'alta'); null per C/A
    },
    // ... altri giocatori ...
  ]
}
```

## 5. Pipeline dati

I dati attuali sono **sample**. Quando arriva il listone ufficiale, segui questi step:

1. **Ricevi il listone**: CSV o XLSX con colonne `nome, squadra, ruolo, quota`

2. **Integra metadati online**:
   - Titolarità e ballottaggi: siti probabili formazioni (es. Gazzetta, Sky)
   - Tier (fascia di qualità): classifiche Fantasy, voti storici, età/esperienza
   - Note: articoli TikTok/Instagram, ultime notizie transfer/infortuni
   - Affidabilità difesa (P/D): statistica difese per squadra, attacchi concessi, storia infortuni

3. **Verifica incongruenze**: controlla che nomi non siano duplicati, quote realistiche, ruoli allineati

4. **Genera `window.PLAYERS`**: scrivi il file `data/players.js` con la struttura sopra

**Nota onestà**: i dati sono uno snapshot pre-asta. Per news last-minute (una gara rinviata, un infortunio), usa il pulsante **✎ nota** per override al volo durante l'asta.

## 6. Config

Il pannello ⚙︎ permette di editare:

| Parametro | Significato | Esempio |
|-----------|-------------|---------|
| `split` | Distribuzione del budget per ruolo. Somma = 1.0. | `{P: 0.08, D: 0.32, C: 0.28, A: 0.32}` → 8% budget per P, 32% per D, etc. |
| `tierMult` | Moltiplicatore di prezzo consigliato per tier. Tier 1 (top) ha moltiplicatore alto; tier 5 (riserva) basso. | `{1: 2.5, 2: 1.8, 3: 1.1, 4: 0.6, 5: 0.02}` → Lautaro (tier 1) costa ~2.5x media slot |
| `modDifesaBoost` | Bonus prezzo per P/D con `affidabilita_difesa: 'alta'`. Simula valore extra della difesa solida. | `{P: 1.15, D: 1.15}` → +15% al max consigliato |

Tutti editabili durante l'asta dal pannello ⚙︎.

## 7. Limiti noti

- **Dati sample**: finché non arriva il listone ufficiale, i giocatori sono fittizi
- **Taratura moltiplicatori**: i valori di `tierMult` e `modDifesaBoost` sono calibrazioni iniziali. Dopo l'asta, i dati reali permetteranno di perfezionarli
- **Offline**: l'app funziona senza connessione internet, ma il reperimento di metadati online (titolarità, ballottaggi) rimane manuale
- **No sincronizzazione**: ogni dispositivo ha la sua sessione locale. Usa Export/Import per sincronizzare tra PC e telefono

---

**Domande?** Controlla la console del browser (F12) per messaggi di errore. Il harness di test fornisce feedback su dati/logica.
