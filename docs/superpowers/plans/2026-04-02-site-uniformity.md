# Site Uniformity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uniformize all inner pages (about, services, portfolio, contact) to match index.html — moving all inline `<style>` blocks to the external stylesheet, fixing footer inconsistencies, and cleaning up inline style attributes.

**Architecture:** All CSS lives in `assets/css/style.css`. Each inner page has a `<style>` block that must be cut and appended to style.css. Footer HTML must match index.html exactly. Inline `style=""` attributes on elements are replaced with CSS classes.

**Tech Stack:** Vanilla HTML, CSS custom properties, no build tools.

---

## File Map

| File | Action |
|------|--------|
| `assets/css/style.css` | Add all moved CSS from 4 pages (tasks 1–4) |
| `about.html` | Remove `<style>` block, remove inline label style |
| `services.html` | Remove `<style>` block, replace `.srv-cta-btn` with `.btn.btn--primary`, remove inline label style, fix footer |
| `portfolio.html` | Remove `<style>` block, remove inline label style, fix footer |
| `contact.html` | Remove `<style>` block, remove inline label style, fix footer contact links |

---

## Task 1: Add moved CSS to style.css

**Files:**
- Modify: `assets/css/style.css` (append at end)

- [ ] **Step 1: Append about.html CSS to style.css**

Add this block at the very end of `assets/css/style.css`:

```css
/* ============================================================
   ABOUT PAGE
   ============================================================ */
.about-hero-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.about-portrait {
  position: relative;
  display: flex;
  justify-content: center;
}
.about-portrait__frame {
  width: 380px;
  height: 460px;
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 6rem;
  position: relative;
  overflow: hidden;
}
.about-portrait__frame::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent 0deg, rgba(255,53,0,0.08) 60deg, transparent 120deg);
  animation: rotate-glow 8s linear infinite;
}
@keyframes rotate-glow {
  to { transform: rotate(360deg); }
}
.about-portrait__badge {
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  white-space: nowrap;
}
.about-portrait__corner {
  position: absolute;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #fff;
}
.about-portrait__corner--tl { top: 1rem; left: -1.5rem; }
.about-portrait__corner--br { bottom: 2rem; right: -1.5rem; }
.stack-columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}
.stack-category {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 1.25rem 1rem;
  text-align: center;
  transition: all var(--dur-base);
}
.stack-category:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-3px);
}
.stack-category__title {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-dim);
  margin-bottom: 0.5rem;
}
.stack-category__items {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
@media (max-width: 1024px) {
  .about-hero-layout { grid-template-columns: 1fr; }
  .about-portrait { display: none; }
  .stack-columns { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .stack-columns { grid-template-columns: 1fr; }
}
```

- [ ] **Step 2: Append services.html CSS to style.css**

Add this block immediately after the about page block:

```css
/* ============================================================
   SERVICES PAGE
   ============================================================ */
.service-detail-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem;
  display: grid;
  grid-template-columns: 1fr 1.8fr;
  gap: 3rem;
  align-items: start;
  transition: all var(--dur-base) var(--ease-out);
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}
.service-detail-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to bottom, var(--color-accent), transparent);
  opacity: 0;
  transition: opacity var(--dur-base);
}
.service-detail-card:hover::before { opacity: 1; }
.service-detail-card:hover {
  border-color: rgba(255,53,0,0.2);
  transform: translateX(4px);
  z-index: 10;
}
.service-detail-card__left {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.service-detail-card__icon {
  font-size: 3rem;
  line-height: 1;
}
.service-detail-card__price {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
  background: var(--color-accent-glow-s);
  border: 1px solid rgba(255,53,0,0.2);
  border-radius: var(--radius-full);
  padding: 0.3rem 0.75rem;
  display: inline-block;
}
.service-detail-card__title {
  font-size: 1.5rem;
  font-weight: 800;
}
.service-detail-card__right {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.service-detail-card__desc {
  color: var(--color-text-muted);
  line-height: 1.8;
  font-size: 1rem;
}
.service-detail-card__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.service-detail-card__item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.service-detail-card__item::before {
  content: '→';
  color: var(--color-accent);
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.service-detail-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}
.process-step {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  padding: 2rem 0;
  border-bottom: 1px solid var(--color-border);
}
.process-step:last-child { border-bottom: none; }
.process-step__num {
  width: 48px;
  height: 48px;
  background: var(--color-accent-glow-s);
  border: 1px solid rgba(255,53,0,0.2);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  color: var(--color-accent);
  font-size: 1.1rem;
  flex-shrink: 0;
}
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.pricing-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  text-align: center;
  transition: all var(--dur-base);
  position: relative;
  overflow: hidden;
}
.pricing-card--featured {
  border-color: var(--color-accent);
  background: var(--color-surface-2);
}
.pricing-card--featured::before {
  content: 'Più scelto';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.3rem 1.5rem;
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.pricing-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.pricing-card__name {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  margin-bottom: 1rem;
  margin-top: 0.5rem;
}
.pricing-card__price {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 900;
  color: var(--color-text);
  line-height: 1;
  margin-bottom: 0.3rem;
}
.pricing-card__price span {
  font-size: 1.25rem;
  color: var(--color-text-muted);
}
.pricing-card__period {
  font-size: 0.8rem;
  color: var(--color-text-dim);
  margin-bottom: 2rem;
}
.pricing-card__items {
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.pricing-card__item {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.pricing-card__item::before {
  content: '✓';
  color: var(--color-accent);
  font-weight: 700;
}
@media (max-width: 1024px) {
  .service-detail-card {
    grid-template-columns: 1fr;
    padding: 2rem;
  }
  .pricing-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .process-step { flex-direction: column; gap: 1rem; }
}
```

- [ ] **Step 3: Append portfolio.html CSS to style.css**

```css
/* ============================================================
   PORTFOLIO PAGE
   ============================================================ */
.portfolio-page-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.result-strip {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: 3rem 0;
  text-align: center;
  margin: 4rem 0;
}
.result-strip__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}
.result-strip__value {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-accent);
  display: block;
  line-height: 1;
  margin-bottom: 0.25rem;
}
.result-strip__label {
  font-size: 0.75rem;
  color: var(--color-text-dim);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 500;
}
@media (max-width: 1024px) {
  .portfolio-page-grid { grid-template-columns: repeat(2, 1fr); }
  .result-strip__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .portfolio-page-grid { grid-template-columns: 1fr; }
  .result-strip__grid { grid-template-columns: repeat(2, 1fr); }
  .result-strip { padding: 2rem var(--space-6); }
  .result-strip__value { font-size: 2rem; }
}
```

- [ ] **Step 4: Append contact.html CSS to style.css**

```css
/* ============================================================
   CONTACT PAGE
   ============================================================ */
.collab-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 3rem;
}
.collab-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  text-align: center;
  transition: all var(--dur-base);
}
.collab-card:hover {
  border-color: rgba(255,53,0,0.25);
  transform: translateY(-4px);
}
.collab-card__icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  display: block;
}
.collab-card__title {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}
.collab-card__text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}
@media (max-width: 768px) {
  .collab-grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 5: Add page-hero section-label centering to style.css**

In the existing `.page-hero` block in style.css, find the section and add (or verify existence of):

```css
.page-hero .section-label {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}
```

If the `.page-hero` block doesn't have this rule, add it right after the `.page-hero__subtitle` rule.

- [ ] **Step 6: Verify style.css loads correctly**

Open `about.html` in a browser. Page should look identical to before — no visual change yet since the CSS classes are the same. Confirm no console errors.

- [ ] **Step 7: Commit**

```bash
git add assets/css/style.css
git commit -m "refactor: move all page-specific inline CSS to style.css"
```

---

## Task 2: Clean up about.html

**Files:**
- Modify: `about.html`

- [ ] **Step 1: Remove the inline `<style>` block**

Delete the entire `<style>...</style>` block (approximately lines 10–111 in about.html). This block contains the about-portrait, stack-columns, and related CSS — all now in style.css.

- [ ] **Step 2: Remove inline style from section-label in page-hero**

Find:
```html
<span class="section-label" style="justify-content:center; display:flex; margin-bottom:1rem;">Chi sono</span>
```

Replace with:
```html
<span class="section-label">Chi sono</span>
```

- [ ] **Step 3: Add Manutenzione to footer services list**

Find the footer services `<ul>` (contains Siti Vetrina, Landing Page, WordPress, Integrazione AI) and add the missing item:

```html
<li><a href="services.html" class="footer__link">Siti Vetrina</a></li>
<li><a href="services.html" class="footer__link">Landing Page</a></li>
<li><a href="services.html" class="footer__link">WordPress</a></li>
<li><a href="services.html" class="footer__link">Integrazione AI</a></li>
<li><a href="services.html" class="footer__link">Manutenzione</a></li>
```

- [ ] **Step 4: Add title attributes to footer social links**

Find the footer socials block and update to:
```html
<a href="#" class="footer__social" aria-label="LinkedIn" title="LinkedIn">in</a>
<a href="#" class="footer__social" aria-label="GitHub" title="GitHub">gh</a>
<a href="#" class="footer__social" aria-label="Twitter" title="Twitter">𝕏</a>
```

- [ ] **Step 5: Verify in browser**

Open `about.html`. Page must look identical to before step 1. Verify portrait frame, stack columns, and animations all render correctly.

- [ ] **Step 6: Commit**

```bash
git add about.html
git commit -m "refactor: remove inline styles from about.html, fix footer"
```

---

## Task 3: Clean up services.html

**Files:**
- Modify: `services.html`

- [ ] **Step 1: Remove the inline `<style>` block**

Delete the entire `<style>...</style>` block (~lines 10–342 in services.html). All classes are now in style.css.

- [ ] **Step 2: Remove inline style from section-label in page-hero**

Find:
```html
<span class="section-label" style="justify-content:center; display:flex; margin-bottom:1rem;">
```

Replace with:
```html
<span class="section-label">
```

- [ ] **Step 3: Replace the off-brand .srv-cta-btn with standard button**

The `.srv-cta-btn` element uses pink (`rgb(255,0,170)`) decorative elements that are completely off-brand. Find the `<a class="srv-cta-btn" ...>` element (it wraps a CTA call-to-action, likely "Parliamo del tuo progetto" or similar) and replace the entire element including its inner spans with:

```html
<a href="contact.html" class="btn btn--primary btn--lg">Parliamo del tuo progetto →</a>
```

Adjust the link text to match what the original button said, keeping it concise.

- [ ] **Step 4: Add Manutenzione + title attrs to footer**

Same as Task 2 steps 3 and 4 — add the 5th services item and title attributes on social links.

Note: services.html footer services list already has 5 items — only the title attrs need adding.

- [ ] **Step 5: Verify in browser**

Open `services.html`. Service detail cards, pricing grid, process steps should all render correctly. The replaced CTA button should look like the standard orange btn--primary.

- [ ] **Step 6: Commit**

```bash
git add services.html
git commit -m "refactor: remove inline styles from services.html, replace off-brand btn, fix footer"
```

---

## Task 4: Clean up portfolio.html

**Files:**
- Modify: `portfolio.html`

- [ ] **Step 1: Remove the inline `<style>` block**

Delete the entire `<style>...</style>` block (~lines 10–55 in portfolio.html).

- [ ] **Step 2: Remove inline style from section-label in page-hero**

Find and replace:
```html
<span class="section-label" style="justify-content:center; display:flex; margin-bottom:1rem;">
```
→
```html
<span class="section-label">
```

- [ ] **Step 3: Add Manutenzione + title attrs to footer**

Add the 5th footer services item and title attributes on social links (same as Task 2 steps 3 and 4).

- [ ] **Step 4: Verify in browser**

Open `portfolio.html`. The portfolio grid and result-strip stats block should render correctly.

- [ ] **Step 5: Commit**

```bash
git add portfolio.html
git commit -m "refactor: remove inline styles from portfolio.html, fix footer"
```

---

## Task 5: Clean up contact.html

**Files:**
- Modify: `contact.html`

- [ ] **Step 1: Remove the inline `<style>` block**

Delete the entire `<style>...</style>` block (~lines 10–47 in contact.html).

- [ ] **Step 2: Remove inline style from section-label in page-hero**

Find and replace:
```html
<span class="section-label" style="justify-content:center; display:flex; margin-bottom:1rem;">
```
→
```html
<span class="section-label">
```

- [ ] **Step 3: Add Manutenzione + title attrs to footer**

Add the 5th services item and title attributes on social links (same as previous tasks).

- [ ] **Step 4: Fix footer contact links to use functional anchor tags**

The contact.html footer already has clickable `<a>` links for email and phone — this is better UX than `<span>`. Update the other pages' footers to match contact.html here (not the other way around). No change needed on contact.html itself for this.

- [ ] **Step 5: Verify in browser**

Open `contact.html`. Collab cards should render correctly. Form and layout unchanged.

- [ ] **Step 6: Commit**

```bash
git add contact.html
git commit -m "refactor: remove inline styles from contact.html, fix footer"
```

---

## Task 6: Make footer contact links functional on all pages

**Files:**
- Modify: `index.html`, `about.html`, `services.html`, `portfolio.html`

The contact.html footer already uses `<a href="mailto:...">` and `<a href="tel:...">` — this is correct UX. Update the remaining pages to match.

- [ ] **Step 1: Update index.html footer contact section**

Find:
```html
<li><span class="footer__link">📧 info@fpdeveloper.it</span></li>
<li><span class="footer__link">📱 +39 333 000 0000</span></li>
<li><span class="footer__link">📍 Italia (remoto)</span></li>
```

Replace with:
```html
<li><a href="mailto:info@fpdeveloper.it" class="footer__link">📧 info@fpdeveloper.it</a></li>
<li><a href="tel:+393330000000" class="footer__link">📱 +39 333 000 0000</a></li>
<li><span class="footer__link">📍 Italia (remoto)</span></li>
```

- [ ] **Step 2: Apply same change to about.html, services.html, portfolio.html**

Make the identical replacement in the footer contact section of about.html, services.html, and portfolio.html.

- [ ] **Step 3: Verify**

Open any page, scroll to footer, click the email link — it should open the email client.

- [ ] **Step 4: Commit**

```bash
git add index.html about.html services.html portfolio.html
git commit -m "fix: make footer email/phone links clickable across all pages"
```

---

## Task 7: Push to GitHub

- [ ] **Push all commits**

```bash
git push origin main
```

- [ ] **Verify GitHub Pages deployment**

Wait ~60 seconds, then open the live site and spot-check each page: about, services, portfolio, contact. Confirm no layout breakage.
