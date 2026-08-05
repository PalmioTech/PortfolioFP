# HANDOFF — FPdeveloper portfolio

## Goal
Sito portfolio di **Federico Palmieri** (brand "FPdeveloper"), sviluppatore web.
Migliorarlo in continuo: design, copy, SEO, contenuti, e feature client-facing.
Feature client-facing più recente: **preventivatore automatico** (bottone
ancorato + bottom-sheet wizard), ora live. Vedi **Current progress**.

## Project facts (leggere prima di toccare)
- **Stack: vanilla HTML/CSS/JS. NIENTE build, framework, npm.** Tutto il CSS in
  `assets/css/style.css`, tutto il JS in `assets/js/main.js` (una IIFE + IIFE
  separate in coda). Pagine: `index/about/services/portfolio/contact.html` +
  `404.html` + cartella `metanapp/`.
- Se l'utente incolla blueprint React/GSAP/Three/Lottie → **reimplementare in
  vanilla**, mantenere il brand, niente dipendenze (memoria
  `vanilla-reimplement-react-effects`).
- **Brand**: near-black `#060508` + arancio `#FF3500` + lime `#C6FF00` (lime solo
  su label/marker). Font: Syne (display 900) / Figtree / Space Mono. Usare SEMPRE
  le CSS var, mai hardcodare. `overflow-x: clip` (non `hidden`, rompe sticky).
- **Dominio LIVE: https://federicopalmieri.it** (comprato su Aruba, custom domain
  su GitHub Pages, HTTPS enforced). File `CNAME` = `federicopalmieri.it`.
  Redirect attivi: `http→https` e `www→apex` (301). `/x` senza slash → `/x/`.
- **Deploy = GitHub Pages**, repo `PalmioTech/PortfolioFP`, branch `main`.
  **Autorizzazione permanente "pusha sempre"**: commit + push su main dopo ogni
  modifica, senza chiedere. Deploy live in **~30s** dopo il push.
- Contatti reali: `fede-palma@hotmail.it`, `+39 327 290 5579`. Social: LinkedIn
  `linkedin.com/in/federico-palmieri-0a3079243`, GitHub `github.com/PalmioTech`.
- **Posizionamento**: il sito dice "in collaborazione con **Pecas SRLS**" (non più
  "freelance" come auto-etichetta). MA i "freelance" riferiti ai CLIENTI restano
  (es. "per freelance, aziende e piccoli brand"). **Attenzione: MetanApp è di
  Federico Palmieri da solo — Pecas NON c'entra** (la privacy usa persona fisica).

## Current progress (fatto, tutto già live su main)
### Questa sessione (recente → vecchio)
- **Preventivatore automatico**: bottone tondo stile chat in **basso a sinistra**
  (con **fumetto nudge** "Scopri il tuo preventivo" dopo ~4s, una volta a sessione)
  → **bottom-sheet** wizard, tutto vanilla in **una IIFE in coda a
  `main.js`** + sezione `PREVENTIVATORE` in `style.css`. Iniettato via JS su tutte
  le pagine **tranne `contact.html`** (skip su `location.pathname`; le pagine
  metanapp non caricano `main.js` → già escluse). 7 step condizionali (tipo,
  pagine, funzioni, contenuti[testi+media], prodotti[solo e-commerce], urgenza,
  manutenzione); motore prezzi puro (`computeQuote`) → **forbice** "Da X€ a Y€" +
  riga "manutenzione da 300€/anno" separata; percorso "su misura" per web
  app/gestionale (niente numero). Output: CTA **"Richiedi il preventivo reale"**
  (mini-form email → **Web3Forms**, stesso `access_key`/honeypot del form contatti)
  + **"Scarica il brief"** (PDF). A11y (role=dialog, focus in/out, Esc), reduced-
  motion, scroll-lock. Self-check del motore gated da `#preventivo-selfcheck`.
  **Desktop (≥1024px)**: `.container` ha `padding-left` extra (gutter + 4.5rem) →
  contenuto sezioni spostato a destra, **corsia vuota a sinistra per il bottone chat**
  (navbar/hero non usano `.container` → intatti). Sotto 1024px: nessuno shift.
  (Nota: c'era anche una barra/carrello scroll-linked nella corsia — **rimossa** su
  richiesta, tenuto solo lo spazio.)
  Spec+piano in `docs/superpowers/{specs,plans}/2026-08-04-preventivatore-*`.
- **MetanApp**: due pagine statiche on-brand (stesso layout `.legal`):
  - `metanapp/index.html` → `/metanapp/` (supporto/FAQ, URL assistenza store).
  - `metanapp/privacy/index.html` → `/metanapp/privacy/` (privacy, rev. 3 ago 2026:
    Nominatim, download elenco da sito, dati MIMIT/IODL 2.0). Titolare = Federico
    Palmieri, email `fede-palma@hotmail.it`.
- **Brief PDF compilabile**: `assets/docs/brief-progetto-fpdeveloper.pdf` (AcroForm,
  3 pagine, 53 campi). Generato da **`tools/make-brief.py`** (reportlab). Link
  "Scarica il brief" nella colonna info di `contact.html` (`.brief-download`).
  Sezioni: dati, attività (+target/zona/keyword), obiettivo (+metrica successo),
  tipo sito, pagine/funzioni, contenuti, stile, budget/tempi, chi decide, note.
- **Layout full-width desktop**: `--container-max: 2100px` + `.container` padding =
  gutter dell'hero `clamp(1.25rem,5vw,4.5rem)`. Le sezioni ora seguono la larghezza
  dell'hero fino a ~2100px. Cap leggibilità: `.section-subtitle` 580px, `.faq-list`
  720px, `.service-detail-card__desc` 62ch.
- **Griglie a 4 colonne** (desktop): `.services-grid`, `.portfolio-grid` (home),
  `.portfolio-page-grid` → `repeat(4)`; step a **3** sotto 1300px, 2 sotto 1024, 1
  mobile. Aggiunta 4ª card home (Drum Art) per riga piena.
- **Hero**: sperimentato "foto a destra" poi **revertito a foto centrata**. Fix
  "testa tagliata": accent ridotto a `clamp(3rem,12vw,9rem)` + foto abbassata ~7%
  su desktop (`translateY` scoped `@media min-width:901px`).
- **Icone animate** (CSS + JS, tutto reduced-motion-gated):
  - loop firma: globe (spin), spark (twinkle), target (anello/punto), bolt (flash),
    cube (float) — **in pausa finché la sezione non ha `.revealed`** (partono allo
    scroll, via `animation-play-state`).
  - draw-in "si disegna" delle icone monoline al reveal (IntersectionObserver in
    `main.js`, `stroke-dashoffset`). Convive coi loop (proprietà diverse).
  - hover su social footer, righe contatti, toggle tema.
- **Favicon**: `assets/img/favicon.svg` (FP arancio su near-black) + `apple-touch-icon`
  su tutte le pagine.
- **SEO** (dall'audit skill claude-seo): `sitemap.xml` + `robots.txt`; **JSON-LD**
  (Person+WebSite+ProfessionalService in home, FAQPage+Breadcrumb in servizi,
  Breadcrumb nelle interne, `Person.worksFor` = Pecas SRLS); canonical assoluti;
  **OG + Twitter** su tutte le pagine + immagine OG `assets/img/og-image.png`
  (generata da `scratchpad/make_og.py`, Pillow, logo reale composito);
  `404.html`; meta description accorciate.
- **Form contatti**: `send-mail.php` NON gira su Pages → **eliminato**. Ora il form
  usa **Web3Forms** (`action=https://api.web3forms.com/submit`, `access_key`
  `2c7f91ae-9b42-4cc0-bddd-8dad87342094` in `contact.html`, honeypot `botcheck`).
  `main.js` fa fetch su `contactForm.action`; su errore mostra messaggio reale.
- **iubenda**: widget `embeds.iubenda.com/widgets/4e61ecd6-...js` + Cookie Solution
  `_iub.csConfiguration` (siteId **4624270**, cookiePolicyId **74830433**) caricati
  **per primi nel `<head>`** su tutte le pagine; link Privacy/Cookie policy nel
  footer (loader `cdn.iubenda.com/iubenda.js`). Il banner al primo accesso dipende
  dalla config nel cruscotto iubenda (l'utente stava completando "Prova integrazione"
  — il codice sul sito è corretto, verificato che `_iub.cs` si attiva).
- **Copyright** → © 2026.

### Sessioni precedenti (ancora vere sul codice)
- **Hero "mammoth" scroll-scrub**: `index.html` hero dentro `.hero-track` (sticky
  pin), `.hero-cutout--center` con `<img>` fallback + `<canvas class="hero-scrub">`.
  Engine vanilla in `main.js` (IIFE "HERO SCROLL-SCRUB ENGINE"): 52 frame webp in
  `assets/img/hero-seq/` scrubbati dallo scroll; watermark rimosso via mask canvas
  bakeata per resize. Gira desktop+mobile, anche sotto reduced-motion (scroll-driven).
  `progress()` divide per `pin.offsetHeight` (100svh), non `innerHeight`.
- Portfolio mobile = deck "raccoglitore" via CSS `position: sticky`. Icone tutte
  SVG monoline (niente emoji). Copy umanizzata su tutte le pagine.

## What worked
- CSS `position: sticky` per pin/deck (robusto anche nei browser in-app).
- Icone che partono allo scroll: `animation-play-state: paused` di default +
  `.revealed <sel> { running }` (l'observer aggiunge `.revealed` alle sezioni).
- PDF compilabile: **reportlab `canvas.acroForm`** (textfield/checkbox/radio; radio
  con stesso `name` = gruppo esclusivo). Far **avanzare il cursore Y dentro ogni
  helper** (i campi `field_row` erano disegnati sporgendo 11px sopra la baseline →
  sovrapposizioni). Verifica overlap **estraendo i `/Rect` con pypdf** e controllando
  le coppie (il viewer del pannello NON è affidabile per i PDF).
- Immagine OG e card raster: **Pillow** con font di sistema (Arial Black/Bold) +
  compositing del logo reale; auto-fit del nome per non toccare il logo.
- Pagine legali/supporto in sottocartella: **path asset root-relative** (`/assets/...`)
  perché la pagina è annidata (`/metanapp/privacy/`).
- Full-width leggibile: bande full-width con gutter dell'hero MA cap di larghezza sui
  blocchi di testo lungo (regola UX line-length 60-75 caratteri).

## What didn't work (NON ripetere)
- **Browser pane con i PDF**: cacha in modo aggressivo per path (ignora `?query`, e
  anche copie con nome nuovo mostravano versioni vecchie). **Non fidarsi del render
  del pannello per i PDF** → verificare con pypdf (testo + `/Rect`).
- **Browser pane in generale (questa sessione)**: mostra spesso uno **splash "FP
  DEVELOPER"** al posto della pagina, e cacha `style.css`. Verificare via **curl sul
  live** + misure DOM iniettando `style.css?v=<random>` fresco.
- **Hero "foto a destra"**: provato, non convinceva → revertito a centrata.
- **`window.innerHeight` nello scrub** → "scalino" su mobile (barra URL dinamica).
- Gate `if(reduced) stop()` + override CSS reduced-motion → hero congelata in Low
  Power Mode. Lo scrub deve girare (è scroll-driven).
- Specificità: un override in `@media` NON batte una regola base a singola classe
  scritta DOPO nel file (le media query non aggiungono specificità).

## Environment limits / tooling
- Deploy live ~30s dopo push. Verifica preferita: `curl -s https://federicopalmieri.it/…`
  (grep del contenuto) + misure DOM sul live con CSS bustato.
- Niente `ffmpeg`/`ffprobe`. Niente `poppler` (no render PDF via Read). `reportlab`,
  `pypdf`, `Pillow` **installati** (pip). Screenshot siti esterni: Chrome headless CDP.
- La barra URL mobile dinamica non è emulabile → per i bug hero il telefono reale è
  l'arbitro.

## Next steps
### 1. ✅ PREVENTIVATORE AUTOMATICO — FATTO (questa sessione)
Implementato come bottone ancorato + bottom-sheet wizard (vedi Current progress).
Possibili follow-up: tarare i numeri del listino dopo qualche preventivo reale;
A/B sul copy del pill; eventuale variante "pagina `/preventivo/`" se serve un link
condivisibile.

### 2. Aperti minori
- **iubenda banner**: se dopo "Prova integrazione" non appare, è config del cruscotto
  (Cookie Solution/Consent da attivare per il sito 4624270), non codice.
- Email dedicata (`@federicopalmieri.it` o Zoho) al posto di hotmail → poi aggiornare
  footer, form note, brief PDF, pagine MetanApp.
- Immagini WebP: hero `foto-profilo.png` (1.5MB) e loghi (~700KB) da convertire
  (`cwebp` non installato) → +performance/SEO.
- Verificare l'anteprima OG (LinkedIn Post Inspector) dopo che il DNS/social cachano.
