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
- **Deploy = GitHub Pages**, repo `PalmioTech/PortfolioFP`, branch `main`.
  Workflow: **commit + push su main dopo ogni modifica** (push = deploy live su
  https://palmiotech.github.io/PortfolioFP/). `.nojekyll` presente.
- Contatti reali: `fede-palma@hotmail.it`, `+39 327 290 5579`. Social = `#`
  (placeholder, da fornire). Form PHP non gira su Pages (statico) — i link
  mailto/tel sì.

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
  - Fallback: `prefers-reduced-motion` e no-JS → resta `<img>` statica.
  - Config per cambiare sorgente in cima all'IIFE: `var VIDEO=''` (se valorizzato
    usa scrub di un `<video>`), `var FRAMES=[...]` (sequenza immagini, in uso).

## What worked
- CSS `position: sticky` per pin/deck = robusto nei browser in-app (Instagram).
- `overflow-x: clip` su html/body (invece di `hidden`) per non rompere sticky.
- Bake della mask una volta → scrub fluido su mobile (no `ctx.filter` per-frame).
- Screenshot siti esterni via Chrome headless CDP (script in `/tmp/shot.mjs`).
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

## IMPORTANT — limite ambiente
- **La preview headless ha lo SCROLL CONGELATO** (scrollY resta 0 su tutte le
  pagine) e a volte il viewport va a `innerWidth=0`. Quindi **animazioni
  scroll-driven (sticky deck, hero scrub, reveal IntersectionObserver) NON sono
  filmabili nella preview.** Verificare:
  1. via `preview_eval` (stato DOM, alpha pixel del canvas, `position` computata,
     transform), e/o
  2. **sul dispositivo reale dell'utente** (è il vero arbitro).
  Riavviare il preview server a volte recupera il viewport (da 0 a reale).
- Niente `ffmpeg`/`ffprobe`. Per metadati video usare `mdls`. Per screenshot
  pagine usare Chrome headless + CDP.

## Next steps / aperti
- **Verificare l'hero scrub sul telefono reale** (desktop + mobile): scrollare
  l'hero → il tipo si toglie il cappuccio; controllare fluidità e che il
  watermark non si veda. Restano ~21/255 di alpha sull'icona ▷ (residuo minimo).
- Eventuale: caricare i 52 frame (1.8MB) **solo quando l'hero entra in vista**
  per risparmiare dati su mobile (ora preload immediato).
- **Social links** ancora `href="#"` su tutte le pagine: l'utente deve fornire
  URL LinkedIn/GitHub/X.
- Se si vuole un form contatti funzionante su Pages: integrare Formspree/Web3Forms
  (il PHP non gira su hosting statico).
- Possibili tuning hero scrub: opacità mobile (0.55), lunghezza pin (160vh),
  scala soggetto (`*0.95`), forza dissolvenza (`0.36/0.68` in `buildMask`).
