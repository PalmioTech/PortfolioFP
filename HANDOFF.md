# HANDOFF — FPdeveloper portfolio

## Goal
Portfolio sito di **Federico Palmieri** (brand "FPdeveloper"), freelance web dev.
Migliorarlo: più dinamico/bello, copy umana, portfolio aggiornato, e una
**hero animata scroll-scrub** (il soggetto si toglie il cappuccio scrollando).

## Project facts (leggere prima di toccare)
- **Stack: vanilla HTML/CSS/JS. NIENTE build, framework, npm.** 1 file PHP
  (`send-mail.php`). Tutto CSS in `assets/css/style.css`, tutto JS in
  `assets/js/main.js` (un'unica IIFE + IIFE separate aggiunte in coda).
- Quando l'utente incolla blueprint React/GSAP/Three/Lottie → **reimplementare
  in vanilla**, mantenere brand. Non aggiungere dipendenze. (vedi memoria
  `vanilla-reimplement-react-effects`).
- **Brand**: near-black `#060508` + arancio `#FF3500` + lime `#C6FF00` (lime solo
  su label/marker). Font: Syne (display, peso 900) / Figtree / Space Mono.
  In **light theme** il lime è illeggibile → rimappato a verde scuro `#466100`;
  `html`/`body` usano `overflow-x: clip` (NON `hidden`, altrimenti rompe
  `position: sticky`).
  `--color-text-dim` = `#857A99` (era `#524862`, contrasto 2.4:1 → bocciato AA;
  ora 5.1:1). Target touch = **44px min** su tutti i controlli navbar/filtri.
- **Deploy = GitHub Pages**, repo `PalmioTech/PortfolioFP`, branch `main`.
  Workflow: **commit + push su main dopo ogni modifica** (push = deploy live su
  https://palmiotech.github.io/PortfolioFP/). `.nojekyll` presente.
  **L'utente ha dato autorizzazione permanente "pusha sempre"** → committare +
  pushare dopo ogni modifica SENZA chiedere (memoria `project_github`).
- Contatti reali: `fede-palma@hotmail.it`, `+39 327 290 5579`. **Social ora reali**:
  LinkedIn `linkedin.com/in/federico-palmieri-0a3079243`, GitHub `github.com/PalmioTech`
  (`target=_blank rel=noopener`). Twitter/X **rimosso** (niente account). Form PHP
  non gira su Pages (statico) — i link mailto/tel sì.

## Current progress (fatto, tutto già su main)
- **Icone**: tutte le emoji → set SVG monoline coerente.
- **Hero "mammoth"** (home): titolo stroke "Sviluppo con" + parola gigante
  arancio che ruota con **scramble** (PASSIONE/CREATIVITÀ/INNOVAZIONE/VISIONE),
  auto-fit per non sforare; bio mono con typewriter (una volta). `[data-shuffle]`
  scramble anche sui titoli page-hero (about/servizi/portfolio/contatti).
- **Portfolio**: aggiunti Olea B&B, Drum Art, Italiangas, Top Fit, MetanApp
  (+ filtro "Web App"). Screenshot catturati via Chrome headless CDP
  (`/Applications/Google Chrome.app --headless=new --remote-debugging-port=9222`
  + script `/tmp/shot.mjs` con WebSocket CDP — **ffmpeg NON installato**).
  Conteggio "siti creati" rimosso.
- **Portfolio mobile = deck "raccoglitore"** via **CSS `position: sticky`**
  (fan a gradini con `--si` impostato una volta in JS, cap via `min()`).
- **Servizi snelliti**: rimossi "Frontend & Backend Custom" e "Manutenzione".
- **Copy umanizzata** su tutte le pagine (tolti tell AI: triplette, parallelismi
  negativi, "macchina di conversione", ecc.).
- **HERO SCROLL-SCRUB** (feature attiva, ultima lavorata):
  - `index.html`: hero dentro `<div class="hero-track">` (sticky pin); nel
    `.hero-cutout--center` c'è `<img class="hero-cutout__img">` (fallback no-JS)
    + `<canvas class="hero-scrub">`.
  - Engine vanilla in `assets/js/main.js` (ultima IIFE "HERO SCROLL-SCRUB ENGINE"):
    52 frame webp in `assets/img/hero-seq/frame-000.webp..frame-051.webp`
    (il tipo si toglie il cappuccio), scrubbati dallo scroll (progress 0→1 →
    indice frame). Contain-fit *0.95 (faccia mai tagliata).
  - **Watermark "DeeVid AI"** dei frame rimosso via canvas: una **mask offscreen
    bakeata 1 volta per resize** (`buildMask`): erase top-right (2 passate:
    blur16 sull'icona, blur6 sul testo) + dissolvenza radiale dei bordi
    (vignette). Per-frame = `drawImage(frame)` + `destination-in drawImage(mask)`
    (niente blur per-frame → veloce su mobile).
  - **Attivo desktop E mobile**. Pin `.hero-track{height:160vh}` +
    `.hero--mammoth{position:sticky;top:0;height:100svh}` a tutte le larghezze.
    Su mobile la foto/canvas è dietro al testo a opacità 0.55.
  - **Gira ANCHE sotto `prefers-reduced-motion`** (iOS Low Power Mode lo forza;
    prima congelava la foto). Lo scrub è 100% scroll-driven → carve-out accettato.
    Rimosso il gate JS `if(reduced)` E l'override CSS reduced-motion su `.hero-track`.
    Solo no-JS → resta `<img>` statica.
  - `progress()` divide per **`pin.offsetHeight` (100svh)**, NON `window.innerHeight`
    (che salta quando la barra URL mobile si ritrae → "scalino"). Denominatore
    stabile = `trackH - pinH`, geometricamente corretto.
  - Testo hero su mobile = **`justify-content:flex-start`** (era `center`, lasciava
    un buco vuoto enorme sopra il titolo). Foto/canvas sono `absolute`, non toccati.
  - Config per cambiare sorgente in cima all'IIFE: `var VIDEO=''` (se valorizzato
    usa scrub di un `<video>`), `var FRAMES=[...]` (sequenza immagini, in uso).
- **Fix hero mobile (sessione 30/6–1/7)**: (1) scrub non più bloccato da Low
  Power Mode; (2) buco vuoto sopra il titolo rimosso (flex-start, no doppio
  padding nav-height); (3) "scalino" scrub risolto (denominatore = pin height).
- **Audit UI/UX (skill ui-ux-pro-max)**: touch target 44px (burger, theme
  toggle, filtri portfolio, nav link mobile), contrasto `text-dim` sistemato,
  `-webkit-tap-highlight-color:transparent` + `touch-action:manipulation`,
  `aria-expanded` aggiunto al burger di contact.html. Social links collegati.
- **Screenshot Oleificio Vieste aggiornato** (nuova home "Figli della natura")
  in `assets/img/portfolio/vieste.jpg`. Catturato con Chrome headless CDP +
  rimozione banner cookie via `Runtime.evaluate` (vedi `What worked`).

## What worked
- CSS `position: sticky` per pin/deck = robusto nei browser in-app (Instagram).
- `overflow-x: clip` su html/body (invece di `hidden`) per non rompere sticky.
- Bake della mask una volta → scrub fluido su mobile (no `ctx.filter` per-frame).
- Screenshot siti esterni via Chrome headless CDP (script in `/tmp/shot.mjs`).
  **Node 22+ ha `WebSocket`/`fetch` globali** → driver CDP a **zero dipendenze**
  (launch `--remote-debugging-port`, `Page.navigate`, `Runtime.evaluate` per
  togliere banner cookie/consent, `Page.captureScreenshot`). Poi `sips` per jpeg.
- `progress()` scrub: dividere per **altezza del pin (`100svh`)**, non per
  `window.innerHeight` → stabile alla barra URL mobile (niente "scalino").
- Scrub sotto reduced-motion: OK farlo girare se è **scroll-driven** (utente
  controlla ogni frame). Low Power Mode iOS forza reduced-motion → altrimenti hero
  morta per una fetta enorme di utenti mobile.
- Verifica scrub in preview (browser desktop): `behavior:'instant'` per scroll
  sincrono (`scroll-behavior:smooth` rende `scrollY` stale nella stessa eval);
  `getImageData` sul centro canvas per provare che il frame cambia.
- Auto-fit della parola hero (misura + scala) per non sforare a 375px.

## What didn't work (NON ripetere)
- **Deck portfolio con JS transform/scrollY/vh** → si rompeva nel browser
  in-app di Instagram (card sovrapposte, contenuto sopra la navbar). Sostituito
  con CSS sticky.
- **Hero scrub con `<video>` (mp4)**: il video `freamHero.mp4` aveva il
  **watermark DeeVid** e l'mp4 non ha alpha → scartato a favore dei 52 webp.
- **Crop del top dei frame** per togliere il watermark → tagliava i capelli
  (testa e watermark alla stessa altezza). Risolto con erase mascherato.
- `cover`-fit dei frame → tagliava la faccia. Usare `contain`.
- **`progress()` con `window.innerHeight`** → "scalino" su mobile: la barra URL
  si ritrae al primo scroll, `innerHeight` cambia, il denominatore salta e il
  frame skippa ~6/52 senza scroll reale. Usare l'altezza del pin (`100svh`).
- **Gate `if(reduced) stop()` nello scrub + override CSS reduced-motion**
  congelavano la hero sotto Low Power Mode. Rimossi entrambi (serve TUTTI e due:
  anche solo il CSS che collassa `.hero-track` a `height:auto` → `dist≈0` → freeze).
- **Specificità CSS**: override in `@media` NON batte una regola base a singola
  classe scritta DOPO nel file (le media query non aggiungono specificità). Il
  fix mobile del theme-toggle serviva prefisso `.navbar__actions` per vincere.

## IMPORTANT — limite ambiente
- **Preview (browser pane `mcp__Claude_Browser__*`)**: lo scroll ORA funziona se
  usi `window.scrollTo({top, behavior:'instant'})` — con `smooth` (default del
  sito) `scrollY` resta stale nella stessa `javascript_exec`. `progress`/frame
  verificabili via DOM + `getImageData`.
- **Splash intro copre gli screenshot**: dopo reload/navigate c'è un overlay
  `.page-transition.is-revealing` (z9999, "FP DEVELOPER"). Prima di `screenshot`:
  `document.querySelector('.page-transition').style.display='none'`.
- **La barra URL mobile dinamica NON è emulabile** (l'emulatore ha viewport fisso).
  I bug tipo "scalino"/spacing dipendono da quella → **il telefono reale è l'arbitro**.
- Niente `ffmpeg`/`ffprobe`. Per metadati video usare `mdls`. Per screenshot
  pagine usare Chrome headless + CDP (Node built-in WebSocket, zero deps).

## Next steps / aperti
- **Verificare sul telefono reale (con Low Power Mode ON)** i fix di questa
  sessione: (1) scrub gira anche in risparmio energetico; (2) niente "scalino"
  scrollando (frame continuo dal primo pixel); (3) niente buco vuoto sopra il
  titolo hero. Il watermark non deve vedersi (~21/255 alpha residuo sull'icona ▷).
- Eventuale: caricare i 52 frame (1.8MB) **solo quando l'hero entra in vista**
  per risparmiare dati su mobile (ora preload immediato).
- Se si vuole un form contatti funzionante su Pages: integrare Formspree/Web3Forms
  (il PHP non gira su hosting statico).
- Possibili tuning hero scrub: opacità mobile (0.55), lunghezza pin (160vh),
  scala soggetto (`*0.95`), forza dissolvenza (`0.36/0.68` in `buildMask`).
