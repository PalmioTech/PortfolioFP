# Home Page Redesign — "Hacker Raffinato"

**Date:** 2026-03-28
**Scope:** `index.html` + `assets/css/style.css` + `assets/js/main.js`
**Direction:** Tech Manifesto, intensità media — grid visibile ma elegante, monospace come accento, lime più presente, orange protagonista, orbital hero visual, 3D tilt sui service cards.

---

## Design Direction

**"Hacker Raffinato"** — Developer portfolio con identità tecnica forte ma raffinata. Il codice compare come texture semantica: commenti, key:value, type annotations. La struttura è pulita, il movimento è fisico e preciso.

### Palette (invariata)
- Background: `#060508`
- Accent orange: `#FF3500` — dominante
- Acid lime: `#C6FF00` — più visibile, usato su label/commenti/badge monospace
- Font display: `Syne`
- Font body: `Figtree`
- Font mono: `Space Mono` — **nuovo**, per label, commenti, badge, stats, tag

---

## Modifiche per Sezione

### 1. Google Fonts — aggiunta

Aggiungere `Space Mono` all'import in `style.css`:
```
family=Space+Mono:wght@400;700
```
Aggiungere variabile CSS:
```css
--font-mono: 'Space Mono', monospace;
```

---

### 2. Grid Background (Hero only)

Aggiungere grid sottile alla `.hero`:
```css
.hero {
  background-image:
    linear-gradient(rgba(255,53,0,0.032) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,53,0,0.032) 1px, transparent 1px);
  background-size: 28px 28px;
}
```

---

### 3. Hero Section

#### HTML — modifiche a `index.html`

1. **Commento sopra badge:**
   ```html
   <div class="hero__comment">// federico palmieri — disponibile per nuovi progetti</div>
   ```

2. **Badge:** diventa `status: available` con font mono e border-radius 4px (non pill).

3. **Parola rotante:** `<span class="typewriter-rotate">` aggiunge classe `typewriter-rotate--mono` → `font-family: var(--font-mono)`, `color: var(--color-secondary)`, `font-size: 0.85em`.

4. **CTA secondario:** testo `→ lavoriamo_insieme()`, font mono, colore lime, border lime, border-radius 4px.

5. **Stats labels:** `progetti: completati`, `rating: medio`, `exp: anni` — font mono.

6. **Floating badges:** `{ performance: 98 }` e `ai_enhanced: true` — font mono, border-radius 5px.

#### HTML — sostituzione `hero__visual`

Sostituire l'intero `<div class="hero__visual">` (il code window) con la scena orbitale:

```html
<div class="hero__orbital" aria-hidden="true">
  <!-- Particelle -->
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>
  <div class="orbital__particle"></div>

  <!-- Anelli -->
  <div class="orbital__ring orbital__ring--1">
    <div class="orbital__dot pos-top"><div class="orbital__pill pill--orange counter-r1">HTML/CSS</div></div>
    <div class="orbital__dot pos-right"><div class="orbital__pill pill--orange counter-r1">JavaScript</div></div>
    <div class="orbital__dot pos-bottom"><div class="orbital__pill pill--orange counter-r1">PHP</div></div>
  </div>
  <div class="orbital__ring orbital__ring--2">
    <div class="orbital__dot pos-top"><div class="orbital__pill pill--lime counter-r2">WordPress</div></div>
    <div class="orbital__dot pos-right"><div class="orbital__pill pill--lime counter-r2">AI Tools</div></div>
    <div class="orbital__dot pos-bottom"><div class="orbital__pill pill--lime counter-r2">MySQL</div></div>
  </div>
  <div class="orbital__ring orbital__ring--3">
    <div class="orbital__dot pos-top"><div class="orbital__pill pill--muted counter-r3">UI/UX Design</div></div>
    <div class="orbital__dot pos-right"><div class="orbital__pill pill--muted counter-r3">Performance</div></div>
  </div>

  <!-- Sfera centrale -->
  <div class="orbital__sphere"></div>
</div>
```

#### CSS — `.hero__orbital` e scena

```css
.hero__orbital {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  max-width: 440px;
  justify-self: center;
  transform-style: preserve-3d;
  transition: transform 0.15s ease-out;
}

/* Sfera */
.orbital__sphere {
  position: absolute;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%,
    rgba(255,100,60,0.9) 0%,
    rgba(255,53,0,0.7) 40%,
    rgba(180,30,0,0.5) 70%,
    rgba(60,10,0,0.3) 100%
  );
  box-shadow:
    0 0 60px rgba(255,53,0,0.5),
    0 0 120px rgba(255,53,0,0.2),
    inset 0 0 30px rgba(255,150,80,0.3);
  animation: orbital-pulse 3s ease-in-out infinite;
  z-index: 10;
}
.orbital__sphere::before {
  content: '';
  position: absolute; inset: 12px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,180,120,0.6) 0%, transparent 60%);
}
.orbital__sphere::after {
  content: '</>';
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.85rem; font-weight: 700;
  color: rgba(255,240,220,0.9);
  text-shadow: 0 0 10px rgba(255,100,60,0.8);
}
@keyframes orbital-pulse {
  0%,100% { box-shadow: 0 0 60px rgba(255,53,0,0.5),0 0 120px rgba(255,53,0,0.2),inset 0 0 30px rgba(255,150,80,0.3); }
  50%      { box-shadow: 0 0 80px rgba(255,53,0,0.7),0 0 160px rgba(255,53,0,0.3),inset 0 0 40px rgba(255,150,80,0.4); }
}

/* Anelli */
.orbital__ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.07);
}
.orbital__ring--1 { width: 200px; height: 200px; border-color: rgba(255,53,0,0.15); animation: orbital-flat 8s linear infinite; }
.orbital__ring--2 { width: 290px; height: 290px; border-color: rgba(198,255,0,0.1);  animation: orbital-tilt-ccw 12s linear infinite; }
.orbital__ring--3 { width: 380px; height: 380px; border-color: rgba(255,255,255,0.05); animation: orbital-tilt-cw 18s linear infinite; }

@keyframes orbital-flat     { from{transform:rotateX(0deg) rotateZ(0deg)}  to{transform:rotateX(0deg) rotateZ(360deg)}  }
@keyframes orbital-tilt-ccw { from{transform:rotateX(62deg) rotateZ(0deg)} to{transform:rotateX(62deg) rotateZ(-360deg)} }
@keyframes orbital-tilt-cw  { from{transform:rotateX(72deg) rotateZ(20deg)} to{transform:rotateX(72deg) rotateZ(380deg)} }

/* Dots e pill */
.orbital__dot { position: absolute; top: 50%; left: 50%; }
.pos-top    { transform: translate(-50%, calc(-100px - 50%)); }  /* ring-1 */
.pos-right  { transform: translate(calc(100px - 50%), -50%); }
.pos-bottom { transform: translate(-50%, calc(100px - 50%)); }

.orbital__ring--2 .pos-top    { transform: translate(-50%, calc(-145px - 50%)); }
.orbital__ring--2 .pos-right  { transform: translate(calc(145px - 50%), -50%); }
.orbital__ring--2 .pos-bottom { transform: translate(-50%, calc(145px - 50%)); }
.orbital__ring--3 .pos-top    { transform: translate(-50%, calc(-190px - 50%)); }
.orbital__ring--3 .pos-right  { transform: translate(calc(190px - 50%), -50%); }

.orbital__pill {
  background: rgba(6,5,8,0.88);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 100px;
  padding: 4px 10px;
  font-family: var(--font-mono);
  font-size: 0.52rem; font-weight: 700;
  white-space: nowrap; letter-spacing: 0.04em;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 12px rgba(0,0,0,0.4);
}
.pill--orange { color: rgba(255,120,80,0.9);  border-color: rgba(255,53,0,0.25); }
.pill--lime   { color: rgba(198,255,0,0.85);  border-color: rgba(198,255,0,0.2); }
.pill--muted  { color: rgba(200,190,220,0.7); border-color: rgba(255,255,255,0.08); }

/* Counter-rotate pills per leggibilità */
.counter-r1 { animation: counter-r1 8s linear infinite; }
.counter-r2 { animation: counter-r2 12s linear infinite; }
.counter-r3 { animation: counter-r3 18s linear infinite; }
@keyframes counter-r1 { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }
@keyframes counter-r2 { from{transform:rotate(0deg)}   to{transform:rotate(360deg)}  }
@keyframes counter-r3 { from{transform:rotate(0deg)}   to{transform:rotate(-360deg)} }

/* Particelle */
.orbital__particle {
  position: absolute;
  width: 3px; height: 3px;
  border-radius: 50%;
  opacity: 0;
  animation: particle-float 4s ease-in-out infinite;
}
.orbital__particle:nth-child(1) { top:20%;left:70%; animation-delay:0s;    background:#FF3500; }
.orbital__particle:nth-child(2) { top:75%;left:20%; animation-delay:0.7s;  background:#C6FF00; width:2px;height:2px; }
.orbital__particle:nth-child(3) { top:40%;left:85%; animation-delay:1.4s;  background:#FF3500; }
.orbital__particle:nth-child(4) { top:85%;left:65%; animation-delay:2.1s;  background:#C6FF00; width:2px;height:2px; }
.orbital__particle:nth-child(5) { top:15%;left:30%; animation-delay:2.8s;  background:#FF3500; }
.orbital__particle:nth-child(6) { top:60%;left:10%; animation-delay:0.4s;  background:#C6FF00; width:2px;height:2px; }
@keyframes particle-float {
  0%   { opacity:0;   transform:translateY(0); }
  20%  { opacity:0.7; }
  80%  { opacity:0.4; }
  100% { opacity:0;   transform:translateY(-20px); }
}
```

#### CSS — Responsive

```css
/* Tablet (max 900px): ridurre gli anelli */
@media (max-width: 900px) {
  .hero__orbital {
    max-width: 320px;
  }
  .orbital__ring--1 { width: 150px; height: 150px; }
  .orbital__ring--2 { width: 220px; height: 220px; }
  .orbital__ring--3 { width: 290px; height: 290px; }
  .orbital__sphere  { width: 90px; height: 90px; }
  /* Aggiornare i pos-* di conseguenza */
  .pos-top   { transform: translate(-50%, calc(-75px - 50%)); }
  .pos-right { transform: translate(calc(75px - 50%), -50%); }
  .pos-bottom{ transform: translate(-50%, calc(75px - 50%)); }
  .orbital__ring--2 .pos-top   { transform: translate(-50%, calc(-110px - 50%)); }
  .orbital__ring--2 .pos-right { transform: translate(calc(110px - 50%), -50%); }
  .orbital__ring--2 .pos-bottom{ transform: translate(-50%, calc(110px - 50%)); }
  .orbital__ring--3 .pos-top   { transform: translate(-50%, calc(-145px - 50%)); }
  .orbital__ring--3 .pos-right { transform: translate(calc(145px - 50%), -50%); }
  .orbital__pill { font-size: 0.48rem; padding: 3px 8px; }
}

/* Mobile (max 640px): orbital va sotto il testo, solo ring-1 e ring-2 */
@media (max-width: 640px) {
  /* hero__content già diventa colonna singola dalla regola mobile esistente */
  .hero__orbital {
    max-width: 280px;
    margin: 2rem auto 0;
  }
  .orbital__ring--3 { display: none; } /* troppo grande su mobile */
  .orbital__ring--1 { width: 130px; height: 130px; }
  .orbital__ring--2 { width: 200px; height: 200px; }
  .orbital__sphere  { width: 80px; height: 80px; }
  .pos-top   { transform: translate(-50%, calc(-65px - 50%)); }
  .pos-right { transform: translate(calc(65px - 50%), -50%); }
  .pos-bottom{ transform: translate(-50%, calc(65px - 50%)); }
  .orbital__ring--2 .pos-top   { transform: translate(-50%, calc(-100px - 50%)); }
  .orbital__ring--2 .pos-right { transform: translate(calc(100px - 50%), -50%); }
  .orbital__ring--2 .pos-bottom{ transform: translate(-50%, calc(100px - 50%)); }
}
```

#### JS — Parallax mouse su `hero__orbital`

```js
// In main.js — nella sezione inizializzazioni
const orbitalScene = document.querySelector('.hero__orbital');
if (orbitalScene) {
  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    orbitalScene.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 5}deg)`;
    orbitalScene.style.transition = 'transform 0.15s ease-out';
  });
  // Reset on leave hero section
  document.querySelector('.hero')?.addEventListener('mouseleave', () => {
    orbitalScene.style.transform = 'rotateY(0deg) rotateX(0deg)';
    orbitalScene.style.transition = 'transform 0.8s cubic-bezier(0.34,1.56,0.64,1)';
  });
}
```

---

### 4. Marquee Section

- Rimuovere emoji da tutti i `marquee-item`
- `font-family: var(--font-mono)`, `text-transform: uppercase`, `font-size: 0.58rem`
- Colori: `#3a3050` default, `rgba(255,53,0,0.4)` per gli `.accent` (alternati)
- `border-right: 1px solid rgba(255,255,255,0.04)` come separatore

---

### 5. Section Labels

`.section-label`:
- `font-family: var(--font-mono)`
- Sostituire il rettangolino `::before` con pseudo-content `//` in `rgba(198,255,0,0.45)`

---

### 6. Service Cards — 3D Tilt

**HTML — aggiungere per ogni card:**
```html
<div class="service-card__type">type: vetrina</div>
```
(Prima dell'icona. Valori: `vetrina`, `landing`, `cms`, `ai`, `custom`, `maintenance`)

**CSS:**
- `clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)`
- `border-top: 1px solid rgba(198,255,0,0.18)`
- `::before` gradient lime → trasparente (top border decorativo)
- `.service-card__type`: `font-family: var(--font-mono)`, `font-size: 0.55rem`, `color: rgba(198,255,0,0.5)`
- Badge tag: `font-family: var(--font-mono)`, `font-size: 0.5rem`, `border-radius: 3px`
- Icon hover: `transform: rotate(-8deg) scale(1.15)`, `transition: 0.4s cubic-bezier(0.34,1.56,0.64,1)`

**JS — 3D tilt:**
```js
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const dx = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2);
    const dy = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateX(${(-dy * 7).toFixed(2)}deg) rotateY(${(dx * 7).toFixed(2)}deg) translateZ(6px)`;
    card.style.transition = 'transform 0.1s ease-out, box-shadow 0.3s, border-color 0.3s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s';
  });
});
```

---

### 7. Portfolio Preview — INVARIATO

Nessuna modifica. Card con foto + hover reveal testo restano esattamente come sono.

---

## File Modificati

| File | Modifiche |
|------|-----------|
| `index.html` | `hero__comment`, badge mono, `typewriter-rotate--mono`, CTA outline code-style, stats label mono, floating badges JSON, `hero__orbital` (sostituisce `hero__visual`), `service-card__type` su ogni card, marquee emoji rimosse |
| `assets/css/style.css` | `--font-mono`, import Space Mono, hero grid bg, hero comment/badge/stats CSS, orbital scene completa (sphere, rings, dots, pills, particles, responsive), marquee mono, section-label mono, service-card type/clip/hover, 3D tilt CSS hover states |
| `assets/js/main.js` | Orbital parallax mouse, service card 3D tilt listeners |

## Cosa NON cambia

- Valori CSS variables — invariati
- Navbar — invariata
- Animazioni reveal/scroll — invariate
- Portfolio cards — invariate
- Tema light/dark — invariato
- Tutte le altre pagine — invariate
