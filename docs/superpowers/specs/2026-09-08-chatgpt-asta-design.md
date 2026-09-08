# ChatGPT in asta — assistente conversazionale per Assistente Fanta (design)

**Data:** 2026-09-08
**App:** `assistentefanta/` (già in produzione con dati reali 2026/27)
**Stato:** design approvato, spec da revisionare

## 1. Obiettivo

Aggiungere all'app un **pannello chat** che aiuta Federico dinamicamente durante l'asta live. Ogni domanda porta con sé, automaticamente, lo **stato corrente dell'asta** (rosa, budget, slot, giocatore in asta, rivali, disponibili). Due modi di risposta: **copia-incolla con ChatGPT Plus** (default, gratis) o **API OpenAI automatica** (opzionale, se l'utente incolla una key). L'app resta statica, senza backend.

## 2. Vincoli e assunzioni

- **Nessun backend**: l'app resta una pagina statica servita da `file://` o GitHub Pages. La modalità API chiama `api.openai.com` **direttamente dal browser** (OpenAI espone CORS).
- **ChatGPT Plus ≠ API**: Plus non dà accesso programmatico. Perciò due modi: copia-incolla (usa Plus) e API (key separata a consumo).
- **Vanilla JS**, zero framework/build/dipendenze. Coerente col resto dell'app.
- **Nuovo file `ai.js`** per non gonfiare `app.js`; carico dopo `app.js`.
- **Costruttore del contesto puro e testabile**; la chiamata di rete no.
- **Privacy**: la API key la inserisce l'utente, sta solo in `localStorage`, viaggia solo verso OpenAI. Mai nel repo.
- **Cutoff modello**: il modello non conosce la stagione 2026/27 (successiva al suo cutoff) → il system prompt gli impone di basarsi SOLO sui dati forniti.

## 3. Architettura

```
assistentefanta/
├── index.html   # + pannello chat (#aiPanel) e toggle
├── app.css      # + stile pannello
├── ai.js        # NUOVO: buildContext (puro) + contextToText + prompt + chiamata API + controller chat
├── app.js       # invariato salvo esporre STATE/QUEUE già globali
├── store.js / advisor.js  # invariati (puri)
└── tests/
    ├── fixture.js   # TEST_PLAYERS (già esistente)
    └── suite.js     # + test di buildContext/contextToText
```

`ai.js` (`window.AI`) espone: `buildContext(state, players, queue) → ctx`, `contextToText(ctx) → string`, `buildUserMessage(ctx, question) → string`, `callOpenAI(key, messages) → Promise<string>`, e un `initChat()` che aggancia il pannello DOM. Legge `window.Store`, `window.Advisor`, `STATE`, `QUEUE`, `PLAYERS_EFF` esposti da `app.js`.

## 4. Il contesto asta — `buildContext` (puro)

Ritorna un oggetto compatto (NON i 531 giocatori):

```json
{
  "config": { "budget": 500, "slots": {"P":3,"D":8,"C":8,"A":6}, "modDifesa": true, "split": {"P":0.08,"D":0.32,"C":0.28,"A":0.32} },
  "io": {
    "budgetResiduo": 500,
    "slotResidui": {"P":3,"D":8,"C":8,"A":6},
    "rosa": {"P":[{"nome":"...","prezzo":16}],"D":[],"C":[],"A":[]},
    "crPerSlotRuoloCorrente": 13
  },
  "inAsta": {
    "nome":"...","squadra":"...","ruolo":"P","tier":3,"titolarita":"titolare","nota":"...","quota":7,
    "verdetto":"SERVE","maxConsigliato":15,"scarsita":{"titolari":24,"squadre":14,"alta":false}
  },
  "rivali": [ {"nome":"Sq 1","budgetResiduo":500,"slotResidui":{"P":3,"D":8,"C":8,"A":6}} ],
  "topDisponibiliRuolo": [ {"nome":"...","squadra":"...","tier":1,"titolarita":"titolare","quota":18,"maxConsigliato":40} ]
}
```

Regole:
- `io` = squadra `isMe`. Derivati da `Store` (budget/slot) + `Advisor` (cr/slot del ruolo corrente).
- `inAsta` = `QUEUE[STATE.cursore.index]` con l'output di `Advisor.advice`; `null` se coda finita.
- `rivali` = 13 squadre `!isMe` con budget e slot residui.
- `topDisponibiliRuolo` = fino a 15 giocatori NON venduti del ruolo del giocatore in asta, ordinati per tier poi quota desc, con `maxConsigliato`.

`contextToText(ctx)` rende l'oggetto in un blocco di testo italiano compatto e leggibile (righe tipo "Mia rosa: … | Budget 500 | slot P3 D8 …"; "In asta: Nome (Squadra) P tier3 titolare — advisor SERVE, max 15"; ecc.).

`buildUserMessage(ctx, question)` = `"STATO ATTUALE ASTA:\n" + contextToText(ctx) + "\n\nDOMANDA: " + question`. Lo stesso testo serve sia per il copia-incolla sia come messaggio utente API (così ogni domanda porta lo snapshot aggiornato).

## 5. UI pannello

- **Toggle** 💬 (in `#controls`) apre/chiude `#aiPanel` (comprimibile, `hidden`).
- `#aiPanel`: intestazione con impostazioni (campo `#aiKey` opzionale + indicatore modo), lista messaggi `#aiMessages`, input `#aiInput` + `#aiSend`, 3 tasti rapidi `#aiQuickValuta` ("valuta il giocatore in asta"), `#aiQuickManca` ("cosa mi manca"), `#aiQuickMeglio` ("meglio X o Y" — precompila l'input).
- **Modo copia-incolla** (nessuna key): `#aiSend`/quick generano il prompt, mostrano un blocco con tasto **"copia"** e una casella `#aiPaste` "incolla qui la risposta"; l'incollato appare come risposta nella lista.
- **Modo API** (key presente): `#aiSend`/quick chiamano `callOpenAI` e mostrano la risposta in `#aiMessages`; stato "sto pensando…" durante l'attesa; errori mostrati inline.
- Target touch ampi (coerente col resto). Il pannello non interferisce con le scorciatoie da tastiera (quando il focus è nell'input, le scorciatoie sono già disattivate da `app.js`).

## 6. I due modi (flussi)

**Copia-incolla (default, usa Plus):**
1. Utente scrive/clicca un tasto rapido → `buildUserMessage`.
2. App mostra il prompt con "copia". Utente lo incolla nel suo ChatGPT, copia la risposta.
3. Utente incolla la risposta in `#aiPaste` → compare come messaggio assistente.

**API (opzionale):**
1. Utente incolla la API key in `#aiKey` (salvata in `localStorage: assistentefanta:aikey`).
2. `#aiSend` → `callOpenAI(key, messages)` a `https://api.openai.com/v1/chat/completions`, `model: 'gpt-4o-mini'`, non-streaming, `Authorization: Bearer <key>`.
3. `messages = [{role:'system', SYSTEM_PROMPT}, ...cronologia, {role:'user', buildUserMessage(ctx, question)}]`.
4. Risposta = `choices[0].message.content` → in lista. Errori (401/429/rete) → messaggio chiaro.

Cronologia chat: in memoria durante la sessione (non persistita). La key sì (localStorage).

## 7. System prompt

> "Sei l'assistente di un'asta di fantacalcio Classic a 14 squadre con modificatore difesa. Rispondi in italiano, breve e azionabile: dì se il giocatore serve, un prezzo massimo sensato, e alternative. **Basati SOLO sui dati forniti nel messaggio (rosa, budget, giocatore in asta, disponibili, rivali): NON usare la tua memoria sui giocatori, la stagione 2026/27 è successiva al tuo training.** Tieni conto del modificatore difesa (difesa titolare affidabile vale di più)."

## 8. Sicurezza e privacy

- La API key la digita l'utente nel proprio browser; sta in `localStorage`; è inviata solo nell'header verso `api.openai.com`. Mai committata, mai verso altri host.
- Pagina pubblica: ogni visitatore usa (eventualmente) la propria key; niente key condivisa.
- Il campo key indica chiaramente "resta nel tuo browser, va solo a OpenAI".

## 9. Persistenza

- `assistentefanta:aikey` in `localStorage` (try/catch, come lo stato asta).
- Modo (copia-incolla/API) derivato dalla presenza della key (nessun toggle separato necessario; opzionale un override).
- Cronologia chat non persistita.

## 10. Test

Nella suite in-browser (usa `fixture.js`):
- `buildContext`: con uno stato costruito (alcune vendite), verifica `io.budgetResiduo`, `io.slotResidui`, `inAsta.nome` = giocatore corrente, `rivali.length === 13`, `topDisponibiliRuolo` esclude i venduti ed è del ruolo giusto.
- `contextToText`/`buildUserMessage`: contengono nome del giocatore in asta, budget, e la domanda.
La chiamata di rete (`callOpenAI`) non si unit-testa (dipende da OpenAI); si verifica manualmente in browser con una key di test o si controlla solo la costruzione del `messages`.

## 11. Fuori scope (YAGNI)

No streaming, no cronologia persistente, no function-calling/tool-use, no scelta multi-modello (solo `gpt-4o-mini`, eventualmente cambiabile a mano nel codice), no provider diversi da OpenAI, no sintesi vocale.

## 12. Criteri di successo

1. Apro il pannello 💬 e vedo la chat.
2. Senza key: clicco "valuta il giocatore in asta" → ottengo un prompt con dentro il giocatore corrente + la mia rosa + budget; lo copio; incollo una risposta e appare in chat.
3. Con una key valida in `#aiKey`: la stessa azione chiama l'API e mostra la risposta in-app.
4. Il contesto riflette lo stato reale: dopo una vendita, il budget/slot nel prompt cambiano.
5. `buildContext` passa i test nella suite (23 esistenti restano verdi).
6. Nessun backend; funziona da `file://` (modo copia-incolla) e servito in HTTP (entrambi i modi).

## 13. Rischi e punti aperti

- **CORS OpenAI**: se in futuro OpenAI limitasse le chiamate browser, resta il copia-incolla (sempre funzionante).
- **Costo/uso key**: responsabilità dell'utente; il default gpt-4o-mini tiene i costi in centesimi.
- **Qualità risposte**: il modello dipende dal contesto fornito; per questo `buildContext` include i disponibili del ruolo e l'output dell'advisor.
