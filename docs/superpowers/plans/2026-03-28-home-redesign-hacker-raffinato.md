# Home Page Redesign — Hacker Raffinato

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyling della home page con estetica "Hacker Raffinato" — grid background, monospace accents, orbital hero animation con 3D tilt sui service cards.

**Architecture:** Modifiche additive a tre file esistenti: HTML per struttura, CSS per stili e animazioni, JS per interattività (orbital parallax + 3D tilt). Nessun nuovo file, nessuna dipendenza esterna. La visual hero (code window) viene sostituita interamente dall'animazione orbitale.

**Tech Stack:** Vanilla HTML/CSS/JS. Google Fonts (aggiunta Space Mono). CSS @keyframes per animazioni, CSS 3D transforms per orbital e tilt, mousemove events per parallax.

---

## File Map

| File | Modifiche |
|------|-----------|
| `index.html` | Aggiungere `hero__comment`, badge mono, typewriter mono, CTA outline code, stats label mono, floating badges JSON, sostituire `hero__visual` con `hero__orbital`, `service-card__type` su 6 card, rimuovere emoji dal marquee |
| `assets/css/style.css` | `--font-mono` var, import Space Mono, hero grid bg, hero comment/badge/stat CSS, orbital scene completa + responsive, marquee mono, section-label mono, service-card type/clip/hover |
| `assets/js/main.js` | Orbital parallax mouse, service card 3D tilt |

---

## Task 1: Aggiungere Space Mono e `--font-mono`

**Files:**
- Modify: `assets/css/style.css:4` (import fonts)
- Modify: `assets/css/style.css:34` (typography variables)

- [ ] **Step 1: Aggiornare l'import Google Fonts**

In `style.css` riga 4, sostituire la riga `@import` esistente con:

```css
@import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Space+Mono:wght@400;700&family=Syne:wght@600;700;800;900&display=swap');
```

- [ ] **Step 2: Aggiungere `--font-mono` alle variabili CSS**

Dopo la riga `--font-display: 'Syne', system-ui, sans-serif;` (circa riga 36), aggiungere:

```css
--font-mono:    'Space Mono', monospace;
```

- [ ] **Step 3: Verifica visiva**

Aprire `index.html` nel browser. Aprire DevTools → Network. Ricaricare. Verificare che `Space+Mono` appaia nei font caricati.

- [ ] **Step 4: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: add Space Mono font and --font-mono CSS variable"
```

---

## Task 2: Hero — Grid background e commento sopra il badge

**Files:**
- Modify: `assets/css/style.css` (sezione HERO)
- Modify: `index.html:61-67` (hero text)

- [ ] **Step 1: Aggiungere grid background alla hero section**

Trovare il blocco `.hero` in `style.css` (circa riga 600). Aggiungere `background-image` alla regola esistente:

```css
.hero {
  /* proprietà esistenti invariate ... */
  background-image:
    linear-gradient(rgba(255, 53, 0, 0.032) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 53, 0, 0.032) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

- [ ] **Step 2: Aggiungere il commento hero in CSS**

Trovare la sezione `/* Hero visual side */` in `style.css`. Prima di essa, aggiungere:

```css
/* Hero — comment monospace sopra badge */
.hero__comment {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: rgba(255, 53, 0, 0.4);
  letter-spacing: 0.02em;
  margin-bottom: var(--space-3);
}
```

- [ ] **Step 3: Aggiungere `hero__comment` nell'HTML**

In `index.html`, trovare il `<div class="hero__text">`. Aggiungere come primo figlio, prima del `<div class="hero__badge">`:

```html
<div class="hero__comment">// federico palmieri — disponibile per nuovi progetti</div>
```

- [ ] **Step 4: Verifica visiva**

Aprire `index.html`. Verificare: griglia arancio sottilissima visibile nella hero, testo commento monospace arancio-rosso sopra il badge.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: hero grid background and monospace comment"
```

---

## Task 3: Hero — Badge, typewriter, CTA e stats mono

**Files:**
- Modify: `assets/css/style.css` (hero badge, stat-label)
- Modify: `index.html` (badge text, typewriter class, CTA, stats labels, floating badges)

- [ ] **Step 1: Aggiornare il CSS del badge**

Trovare `.hero__badge` in `style.css` (riga ~700). Aggiungere/modificare:

```css
.hero__badge {
  /* proprietà esistenti invariate */
  font-family: var(--font-mono);       /* sostituisce var(--font-display) */
  border-radius: var(--radius-sm);     /* sostituisce var(--radius-full) */
  letter-spacing: 0.07em;
  text-transform: none;                /* aggiungere: rimuove uppercase */
}
```

- [ ] **Step 2: Aggiornare `.hero__stat-label`**

Trovare `.hero__stat-label` (riga ~784). Aggiungere `font-family`:

```css
.hero__stat-label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 400;
}
```

- [ ] **Step 3: Aggiungere CSS per typewriter mono e floating badges mono**

Aggiungere subito dopo `.hero__stat-label`:

```css
/* Typewriter word in monospace lime */
.typewriter-rotate--mono {
  font-family: var(--font-mono);
  font-size: 0.82em;
  color: var(--color-secondary);
  font-weight: 700;
}

/* Floating badges — monospace */
.hero__floating-badge {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  border-radius: 5px;
  letter-spacing: 0.03em;
}
```

- [ ] **Step 4: Aggiornare HTML — badge, typewriter, CTA, stats, floating badges**

In `index.html`:

**Badge** (riga ~62): cambiare testo da `Disponibile per nuovi progetti` a `status: available`

**Typewriter** (riga ~67): aggiungere classe `typewriter-rotate--mono` alla span esistente:
```html
<span class="text-gradient typewriter-rotate typewriter-rotate--mono" data-words='["converte()","fidelizza()","vende()","stupisce()"]'>converte()</span>
```

**CTA outline** (riga ~76): cambiare testo e classe:
```html
<a href="contact.html" class="btn btn--outline btn--lg btn--outline-mono">→ lavoriamo_insieme()</a>
```

**Stats labels** (righe ~80-90): cambiare i tre `.hero__stat-label`:
```html
<span class="hero__stat-label">progetti: completati</span>
<span class="hero__stat-label">rating: medio</span>
<span class="hero__stat-label">exp: anni</span>
```

**Floating badge 1** (riga ~97): cambiare testo:
```html
<div class="hero__floating-badge hero__floating-badge--1">{ performance: 98 }</div>
```

**Floating badge 2** (riga ~121): cambiare testo:
```html
<div class="hero__floating-badge hero__floating-badge--2">ai_enhanced: true</div>
```

- [ ] **Step 5: Aggiungere CSS per `.btn--outline-mono`**

Trovare la sezione bottoni in `style.css`. Aggiungere:

```css
/* Outline CTA con stile code */
.btn--outline-mono {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-secondary);
  border-radius: var(--radius-sm);
  letter-spacing: 0.04em;
}
.btn--outline-mono::before {
  border-color: rgba(198, 255, 0, 0.3);
}
.btn--outline-mono:hover {
  color: var(--color-secondary);
  background: rgba(198, 255, 0, 0.05);
}
```

- [ ] **Step 6: Verifica visiva**

Aprire `index.html`. Verificare: badge rettangolare monospace "status: available", parola rotante in lime monospace con `()`, CTA secondario lime con `→`, stat labels come `key: valore`, floating badges come JSON.

- [ ] **Step 7: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: hero badge, typewriter, CTA and stats mono treatment"
```

---

## Task 4: Orbital HTML — sostituire il code window

**Files:**
- Modify: `index.html` (sezione hero__visual → hero__orbital)

- [ ] **Step 1: Sostituire `hero__visual` con `hero__orbital`**

In `index.html`, trovare l'intero blocco `<div class="hero__visual" aria-hidden="true">` e tutto il suo contenuto fino al `</div>` di chiusura (righe ~95-123). Sostituirlo interamente con:

```html
<div class="hero__orbital" aria-hidden="true">
  <!-- Particelle flottanti -->
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>

  <!-- Anello 1 — piatto, badge orange, raggio 100px -->
  <div class="orbital__ring orbital__ring--1">
    <div class="orbital__dot"><div class="orbital__pill pill--orange counter-r1">HTML/CSS</div></div>
    <div class="orbital__dot"><div class="orbital__pill pill--orange counter-r1">JavaScript</div></div>
    <div class="orbital__dot"><div class="orbital__pill pill--orange counter-r1">PHP</div></div>
  </div>

  <!-- Anello 2 — inclinato, badge lime, raggio 145px -->
  <div class="orbital__ring orbital__ring--2">
    <div class="orbital__dot"><div class="orbital__pill pill--lime counter-r2">WordPress</div></div>
    <div class="orbital__dot"><div class="orbital__pill pill--lime counter-r2">AI Tools</div></div>
    <div class="orbital__dot"><div class="orbital__pill pill--lime counter-r2">MySQL</div></div>
  </div>

  <!-- Anello 3 — più inclinato, badge muted, raggio 190px -->
  <div class="orbital__ring orbital__ring--3">
    <div class="orbital__dot"><div class="orbital__pill pill--muted counter-r3">UI/UX Design</div></div>
    <div class="orbital__dot"><div class="orbital__pill pill--muted counter-r3">Performance</div></div>
  </div>

  <!-- Sfera centrale -->
  <div class="orbital__sphere"></div>
</div>
```

- [ ] **Step 2: Verifica struttura**

Aprire `index.html` nel browser. Il lato destro della hero sarà vuoto/invisibile (ancora nessun CSS). Verificare in DevTools che `.hero__orbital` esiste nel DOM con figli corretti.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: replace hero code window with orbital HTML structure"
```

---

## Task 5: Orbital CSS — sfera, anelli e animazioni base

**Files:**
- Modify: `assets/css/style.css` (dopo la sezione hero__visual esistente)

- [ ] **Step 1: Aggiungere il blocco CSS orbital completo**

In `style.css`, trovare la sezione `/* Hero visual side */` (riga ~792). Dopo la fine dei blocchi `.hero__visual`, `.hero__code-window`, `.code-window__*`, `.hero__floating-badge` (circa riga 920), aggiungere il nuovo blocco:

```css
/* ============================================================
   HERO ORBITAL ANIMATION
   ============================================================ */

.hero__orbital {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 440px;
  justify-self: center;
}

/* Sfera centrale */
.orbital__sphere {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 100, 60, 0.9) 0%,
    rgba(255, 53, 0, 0.7) 40%,
    rgba(180, 30, 0, 0.5) 70%,
    rgba(60, 10, 0, 0.3) 100%
  );
  box-shadow:
    0 0 60px rgba(255, 53, 0, 0.5),
    0 0 120px rgba(255, 53, 0, 0.2),
    inset 0 0 30px rgba(255, 150, 80, 0.3);
  animation: orbital-pulse 3s ease-in-out infinite;
  z-index: 10;
  flex-shrink: 0;
}

.orbital__sphere::before {
  content: '';
  position: absolute;
  inset: 12px;
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 180, 120, 0.6) 0%,
    transparent 60%
  );
}

.orbital__sphere::after {
  content: '</>';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: rgba(255, 240, 220, 0.9);
  text-shadow: 0 0 10px rgba(255, 100, 60, 0.8);
}

@keyframes orbital-pulse {
  0%, 100% {
    box-shadow:
      0 0 60px rgba(255, 53, 0, 0.5),
      0 0 120px rgba(255, 53, 0, 0.2),
      inset 0 0 30px rgba(255, 150, 80, 0.3);
  }
  50% {
    box-shadow:
      0 0 80px rgba(255, 53, 0, 0.7),
      0 0 160px rgba(255, 53, 0, 0.3),
      inset 0 0 40px rgba(255, 150, 80, 0.4);
  }
}

/* Anelli orbitali */
.orbital__ring {
  position: absolute;
  border-radius: 50%;
  top: 50%;
  left: 50%;
}

.orbital__ring--1 {
  width: 200px;
  height: 200px;
  margin-top: -100px;
  margin-left: -100px;
  border: 1px solid rgba(255, 53, 0, 0.18);
  animation: orbital-flat 8s linear infinite;
}

.orbital__ring--2 {
  width: 290px;
  height: 290px;
  margin-top: -145px;
  margin-left: -145px;
  border: 1px solid rgba(198, 255, 0, 0.12);
  animation: orbital-tilt-ccw 12s linear infinite;
}

.orbital__ring--3 {
  width: 380px;
  height: 380px;
  margin-top: -190px;
  margin-left: -190px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: orbital-tilt-cw 18s linear infinite;
}

@keyframes orbital-flat {
  from { transform: rotateX(0deg)   rotateZ(0deg);   }
  to   { transform: rotateX(0deg)   rotateZ(360deg); }
}
@keyframes orbital-tilt-ccw {
  from { transform: rotateX(62deg)  rotateZ(0deg);    }
  to   { transform: rotateX(62deg)  rotateZ(-360deg); }
}
@keyframes orbital-tilt-cw {
  from { transform: rotateX(72deg)  rotateZ(20deg);   }
  to   { transform: rotateX(72deg)  rotateZ(380deg);  }
}

/* Dot container — posizionato al centro dell'anello */
.orbital__dot {
  position: absolute;
  top: 50%;
  left: 50%;
}

/* Posizioni dei dot per anello 1 (raggio 100px) */
.orbital__ring--1 .orbital__dot:nth-child(1) {
  transform: translate(-50%, calc(-100px - 50%));
}
.orbital__ring--1 .orbital__dot:nth-child(2) {
  transform: translate(calc(100px - 50%), -50%);
}
.orbital__ring--1 .orbital__dot:nth-child(3) {
  transform: translate(-50%, calc(100px - 50%));
}

/* Posizioni dei dot per anello 2 (raggio 145px) */
.orbital__ring--2 .orbital__dot:nth-child(1) {
  transform: translate(-50%, calc(-145px - 50%));
}
.orbital__ring--2 .orbital__dot:nth-child(2) {
  transform: translate(calc(145px - 50%), -50%);
}
.orbital__ring--2 .orbital__dot:nth-child(3) {
  transform: translate(-50%, calc(145px - 50%));
}

/* Posizioni dei dot per anello 3 (raggio 190px) */
.orbital__ring--3 .orbital__dot:nth-child(1) {
  transform: translate(-50%, calc(-190px - 50%));
}
.orbital__ring--3 .orbital__dot:nth-child(2) {
  transform: translate(calc(190px - 50%), -50%);
}

/* Pill badge */
.orbital__pill {
  background: rgba(6, 5, 8, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 100px;
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 0.52rem;
  font-weight: 700;
  white-space: nowrap;
  letter-spacing: 0.04em;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  display: block;
}

.pill--orange {
  color: rgba(255, 120, 80, 0.9);
  border-color: rgba(255, 53, 0, 0.28);
}

.pill--lime {
  color: rgba(198, 255, 0, 0.85);
  border-color: rgba(198, 255, 0, 0.22);
}

.pill--muted {
  color: rgba(200, 190, 220, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

/* Counter-rotazioni: le pill ruotano in direzione opposta per restare leggibili */
.counter-r1 {
  animation: counter-r1 8s linear infinite;
}
.counter-r2 {
  animation: counter-r2 12s linear infinite;
}
.counter-r3 {
  animation: counter-r3 18s linear infinite;
}

@keyframes counter-r1 {
  from { transform: rotate(0deg);    }
  to   { transform: rotate(-360deg); }
}
@keyframes counter-r2 {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
@keyframes counter-r3 {
  from { transform: rotate(0deg);    }
  to   { transform: rotate(-360deg); }
}

/* Particelle flottanti */
.orbital__particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  opacity: 0;
  animation: orbital-particle 4s ease-in-out infinite;
  pointer-events: none;
}

.orbital__particle:nth-child(1) { top: 20%; left: 70%; animation-delay: 0s;    background: var(--color-accent); }
.orbital__particle:nth-child(2) { top: 75%; left: 20%; animation-delay: 0.7s;  background: var(--color-secondary); width: 2px; height: 2px; }
.orbital__particle:nth-child(3) { top: 40%; left: 85%; animation-delay: 1.4s;  background: var(--color-accent); }
.orbital__particle:nth-child(4) { top: 85%; left: 65%; animation-delay: 2.1s;  background: var(--color-secondary); width: 2px; height: 2px; }
.orbital__particle:nth-child(5) { top: 15%; left: 30%; animation-delay: 2.8s;  background: var(--color-accent); }
.orbital__particle:nth-child(6) { top: 60%; left: 10%; animation-delay: 0.4s;  background: var(--color-secondary); width: 2px; height: 2px; }

@keyframes orbital-particle {
  0%   { opacity: 0;   transform: translateY(0);     }
  20%  { opacity: 0.7; }
  80%  { opacity: 0.4; }
  100% { opacity: 0;   transform: translateY(-20px); }
}
```

- [ ] **Step 2: Verifica visiva desktop**

Aprire `index.html`. Verificare: sfera arancione pulsante con `</>` visibile, tre anelli che ruotano a velocità diverse, pill con nomi tecnologie che orbitano, particelle che fluttuano. Controllare che lo `z-index` della sfera la tenga sopra gli anelli.

- [ ] **Step 3: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: orbital hero animation — sphere, rings, pills, particles"
```

---

## Task 6: Orbital CSS — responsive

**Files:**
- Modify: `assets/css/style.css` (sezione media queries, circa riga 2160)

- [ ] **Step 1: Trovare la media query mobile esistente per `.hero__visual`**

In `style.css`, cercare `@media (max-width: 768px)` o simile dove appare `.hero__visual { display: none; }` (riga ~2170). Aggiungere subito dopo le regole esistenti per questa breakpoint:

```css
/* Orbital: hidden su mobile come già era hero__visual */
.hero__orbital { display: none; }
```

- [ ] **Step 2: Aggiungere breakpoint tablet (900px) per scalare gli anelli**

Trovare la sezione media queries e aggiungere prima del blocco mobile esistente:

```css
@media (max-width: 900px) {
  .hero__orbital {
    max-width: 320px;
  }

  .orbital__sphere {
    width: 90px;
    height: 90px;
  }

  .orbital__ring--1 {
    width: 150px;
    height: 150px;
    margin-top: -75px;
    margin-left: -75px;
  }
  .orbital__ring--2 {
    width: 220px;
    height: 220px;
    margin-top: -110px;
    margin-left: -110px;
  }
  .orbital__ring--3 {
    width: 290px;
    height: 290px;
    margin-top: -145px;
    margin-left: -145px;
  }

  /* Aggiorna posizioni dot per raggio ridotto */
  .orbital__ring--1 .orbital__dot:nth-child(1) { transform: translate(-50%, calc(-75px - 50%)); }
  .orbital__ring--1 .orbital__dot:nth-child(2) { transform: translate(calc(75px - 50%), -50%); }
  .orbital__ring--1 .orbital__dot:nth-child(3) { transform: translate(-50%, calc(75px - 50%)); }

  .orbital__ring--2 .orbital__dot:nth-child(1) { transform: translate(-50%, calc(-110px - 50%)); }
  .orbital__ring--2 .orbital__dot:nth-child(2) { transform: translate(calc(110px - 50%), -50%); }
  .orbital__ring--2 .orbital__dot:nth-child(3) { transform: translate(-50%, calc(110px - 50%)); }

  .orbital__ring--3 .orbital__dot:nth-child(1) { transform: translate(-50%, calc(-145px - 50%)); }
  .orbital__ring--3 .orbital__dot:nth-child(2) { transform: translate(calc(145px - 50%), -50%); }

  .orbital__pill {
    font-size: 0.48rem;
    padding: 3px 8px;
  }
}
```

- [ ] **Step 3: Verifica responsive**

Aprire `index.html`. Usare DevTools per testare a 900px (tablet): anelli più piccoli, pill leggibili. A 768px o meno: orbital sparisce (comportamento identico al code window originale).

- [ ] **Step 4: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: orbital responsive — scale at 900px, hide at mobile"
```

---

## Task 7: Orbital JS — parallax mouse

**Files:**
- Modify: `assets/js/main.js` (aggiungere al blocco di inizializzazione esistente)

- [ ] **Step 1: Trovare il punto di inserimento in main.js**

Aprire `assets/js/main.js`. Trovare la sezione degli event listener esistenti (scroll, resize, ecc.). Aggiungere alla fine del file, prima della chiusura dell'eventuale wrapper DOMContentLoaded:

```js
// ── ORBITAL PARALLAX ──────────────────────────────────────
(function () {
  const orbital = document.querySelector('.hero__orbital');
  const heroSection = document.querySelector('.hero');
  if (!orbital || !heroSection) return;

  // Skip su touch device — inutile e costoso
  if (window.matchMedia('(hover: none)').matches) return;

  heroSection.addEventListener('mousemove', (e) => {
    const rect = heroSection.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    orbital.style.transform = `rotateY(${(dx * 8).toFixed(2)}deg) rotateX(${(-dy * 5).toFixed(2)}deg)`;
    orbital.style.transition = 'transform 0.12s ease-out';
  });

  heroSection.addEventListener('mouseleave', () => {
    orbital.style.transform = 'rotateY(0deg) rotateX(0deg)';
    orbital.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
  });
})();
```

- [ ] **Step 2: Verifica interattività**

Aprire `index.html`. Muovere il mouse lentamente sopra la hero. Verificare che la scena orbitale si inclini leggermente seguendo il cursore e torni alla posizione neutra quando il mouse esce dalla sezione.

- [ ] **Step 3: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: orbital parallax mouse effect"
```

---

## Task 8: Service Cards — HTML type annotations

**Files:**
- Modify: `index.html` (6 service cards nella sezione #servizi)

- [ ] **Step 1: Aggiungere `service-card__type` a ogni card**

In `index.html`, trovare la sezione `<div class="services-grid">`. Per ognuna delle 6 `<article class="service-card ...">`, aggiungere come primo figlio (prima di `<div class="service-card__accent-line">`):

```html
<!-- Card 1 — Siti Vetrina -->
<div class="service-card__type">type: vetrina</div>

<!-- Card 2 — Landing Page -->
<div class="service-card__type">type: landing</div>

<!-- Card 3 — WordPress Avanzato -->
<div class="service-card__type">type: cms</div>

<!-- Card 4 — Integrazione AI -->
<div class="service-card__type">type: ai</div>

<!-- Card 5 — Frontend & Backend Custom -->
<div class="service-card__type">type: custom</div>

<!-- Card 6 — Manutenzione & Restyling -->
<div class="service-card__type">type: maintenance</div>
```

- [ ] **Step 2: Verifica struttura DOM**

Aprire `index.html`. In DevTools verificare che ogni `.service-card` abbia come primo figlio `.service-card__type` con il testo corretto.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: service cards type annotations in HTML"
```

---

## Task 9: Service Cards — CSS e hover

**Files:**
- Modify: `assets/css/style.css` (sezione service cards, circa riga 1040)

- [ ] **Step 1: Trovare il blocco `.service-card` in style.css**

Cercare `.service-card {` (circa riga 1040). Aggiungere/modificare queste proprietà alla regola esistente (senza rimuovere nulla):

```css
.service-card {
  /* proprietà esistenti invariate ... */
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
  border-top: 1px solid rgba(198, 255, 0, 0.16);
  transition: transform 0.1s ease-out,
              box-shadow var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
}
```

- [ ] **Step 2: Aggiungere `::before` decorativo e stile hover**

Subito dopo `.service-card { ... }`, aggiungere:

```css
/* Gradient lime in cima alle card */
.service-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(198, 255, 0, 0.5) 0%,
    rgba(198, 255, 0, 0.15) 50%,
    transparent 100%
  );
  pointer-events: none;
}

/* Type annotation monospace */
.service-card__type {
  font-family: var(--font-mono);
  font-size: 0.52rem;
  font-weight: 700;
  color: rgba(198, 255, 0, 0.5);
  letter-spacing: 0.06em;
  margin-bottom: var(--space-3);
}

/* Icon hover animation */
.service-card:hover .service-card__icon {
  transform: rotate(-8deg) scale(1.15);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Hover: glow + border orange */
.service-card:hover {
  box-shadow:
    0 20px 50px rgba(255, 53, 0, 0.12),
    0 0 0 1px rgba(255, 53, 0, 0.18);
  border-color: rgba(255, 53, 0, 0.2);
}
```

- [ ] **Step 3: Aggiornare i badge tag delle card a stile mono**

Trovare `.badge--default` in `style.css`. Aggiungere una variante per i tag delle service cards:

```css
.service-card .badge--default {
  font-family: var(--font-mono);
  font-size: 0.5rem;
  border-radius: var(--radius-sm);
  letter-spacing: 0.04em;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  color: var(--color-text-dim);
}
```

- [ ] **Step 4: Verifica visiva**

Aprire `index.html`. Verificare: testo `type: vetrina` visibile sopra ogni card, corner clip visibile in alto a destra, bordo lime sottile in cima, tag badge in font mono. Al hover: icona ruota con overshoot, card si solleva leggermente con glow orange.

- [ ] **Step 5: Commit**

```bash
git add assets/css/style.css
git commit -m "feat: service cards — corner clip, type annotation, mono badges, hover glow"
```

---

## Task 10: Service Cards — JS 3D Tilt

**Files:**
- Modify: `assets/js/main.js`

- [ ] **Step 1: Aggiungere 3D tilt listener in main.js**

Dopo il blocco ORBITAL PARALLAX aggiunto nel Task 7, aggiungere:

```js
// ── SERVICE CARDS 3D TILT ─────────────────────────────────
(function () {
  // Skip su touch device
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
      const dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
      card.style.transform = [
        `perspective(600px)`,
        `rotateX(${(-dy * 7).toFixed(2)}deg)`,
        `rotateY(${( dx * 7).toFixed(2)}deg)`,
        `translateZ(6px)`
      ].join(' ');
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s, border-color 0.3s';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s, border-color 0.3s';
    });
  });
})();
```

- [ ] **Step 2: Verifica 3D tilt**

Aprire `index.html`. Muovere il mouse lentamente su una service card: la card deve inclinarsi in 3D seguendo il cursore (max ~7°). Al mouseleave, torna alla posizione piatta con un rimbalzo morbido (cubic-bezier overshoot).

- [ ] **Step 3: Commit**

```bash
git add assets/js/main.js
git commit -m "feat: service cards 3D tilt on mousemove"
```

---

## Task 11: Marquee e section labels mono

**Files:**
- Modify: `index.html` (marquee items — rimuovere emoji)
- Modify: `assets/css/style.css` (marquee-item, section-label)

- [ ] **Step 1: Rimuovere le emoji dai marquee items in HTML**

In `index.html`, trovare la `<div class="marquee-track">`. Sostituire l'intero contenuto con versione senza emoji, alternando la classe `accent`:

```html
<div class="marquee-track">
  <span class="marquee-item marquee-item--accent">HTML5 & CSS3</span>
  <span class="marquee-item">JavaScript</span>
  <span class="marquee-item marquee-item--accent">PHP</span>
  <span class="marquee-item">WordPress</span>
  <span class="marquee-item marquee-item--accent">AI Integration</span>
  <span class="marquee-item">UI/UX Design</span>
  <span class="marquee-item marquee-item--accent">Performance</span>
  <span class="marquee-item">Responsive Design</span>
  <span class="marquee-item marquee-item--accent">Web Security</span>
  <span class="marquee-item">HTML5 & CSS3</span>
  <span class="marquee-item marquee-item--accent">JavaScript</span>
  <span class="marquee-item">PHP</span>
  <span class="marquee-item marquee-item--accent">WordPress</span>
  <span class="marquee-item">AI Integration</span>
  <span class="marquee-item marquee-item--accent">UI/UX Design</span>
  <span class="marquee-item">Performance</span>
  <span class="marquee-item marquee-item--accent">Responsive Design</span>
  <span class="marquee-item">Web Security</span>
</div>
```

- [ ] **Step 2: Aggiornare CSS `.marquee-item`**

Trovare `.marquee-item` in `style.css` (riga ~955). Aggiungere/modificare:

```css
.marquee-item {
  /* proprietà esistenti (padding, border-right) invariate */
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #3a3050;
}

.marquee-item--accent {
  color: rgba(255, 53, 0, 0.38);
}
```

- [ ] **Step 3: Aggiornare CSS `.section-label`**

Trovare `.section-label` in `style.css` (riga ~182). Modificare:

```css
.section-label {
  /* proprietà esistenti invariate */
  font-family: var(--font-mono);
  letter-spacing: 0.12em;
}

/* Sostituire il rettangolino ::before con // */
.section-label::before {
  content: '//';
  display: inline;
  width: auto;
  height: auto;
  background: none;
  border-radius: 0;
  color: rgba(198, 255, 0, 0.45);
  font-family: var(--font-mono);
  font-size: inherit;
  margin-right: var(--space-2);
}
```

- [ ] **Step 4: Verifica visiva**

Aprire `index.html`. Verificare: marquee senza emoji, testo monospace uppercase scuro con item accent in arancio; section labels mostrano `// Cosa faccio` con il doppio slash lime.

- [ ] **Step 5: Commit**

```bash
git add index.html assets/css/style.css
git commit -m "feat: marquee mono uppercase, section labels with // prefix"
```

---

## Task 12: Light theme — aggiornamenti variabili orbitale

**Files:**
- Modify: `assets/css/style.css` (sezione `[data-theme="light"]`, circa riga 2380)

- [ ] **Step 1: Verificare l'orbital in tema light**

In DevTools cliccare il theme toggle (sole/luna). Controllare se la sfera e gli anelli sono leggibili su sfondo chiaro.

- [ ] **Step 2: Aggiungere overrides light theme per orbital**

Trovare la sezione `[data-theme="light"]` in `style.css`. Aggiungere:

```css
[data-theme="light"] .hero__orbital .orbital__pill {
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

[data-theme="light"] .orbital__particle {
  opacity-multiplier: 0.5; /* non è una proprietà CSS reale — */
}

[data-theme="light"] .hero__comment {
  color: rgba(200, 80, 0, 0.5);
}
```

Nota: se il tema light non è un requisito critico dell'orbital (la pagina è principalmente dark), questo task può essere semplificato a sole pill con background bianco.

- [ ] **Step 3: Verifica light theme**

Aprire `index.html`, attivare il tema light. Verificare che l'orbital sia leggibile e non rompa la pagina.

- [ ] **Step 4: Commit finale**

```bash
git add assets/css/style.css
git commit -m "feat: light theme adjustments for orbital hero"
```

---

## Self-Review — Spec Coverage Check

| Requisito spec | Task che lo implementa |
|---------------|------------------------|
| Space Mono import + `--font-mono` | Task 1 |
| Grid background hero | Task 2 |
| `hero__comment` monospace | Task 2 |
| Badge mono `status: available` | Task 3 |
| Typewriter `converte()` lime mono | Task 3 |
| CTA outline code-style | Task 3 |
| Stats labels `key: valore` | Task 3 |
| Floating badges JSON | Task 3 |
| `hero__orbital` HTML | Task 4 |
| Orbital CSS — sphere + rings + pills | Task 5 |
| Orbital responsive 900px + mobile | Task 6 |
| Orbital parallax mouse | Task 7 |
| Service cards `service-card__type` HTML | Task 8 |
| Service cards CSS corner-clip + border lime | Task 9 |
| Service cards 3D tilt JS | Task 10 |
| Marquee mono senza emoji | Task 11 |
| Section labels `//` mono | Task 11 |
| Light theme orbital | Task 12 |
| Portfolio cards invariate | ✅ nessuna modifica prevista |
