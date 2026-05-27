# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Portfolio website for a freelance web developer / digital professional. Static multi-page site built with vanilla HTML, CSS, and JavaScript — no build tools, no frameworks, no package manager. One PHP file handles contact form submissions.

## Project Structure

```
FPdeveloper/
├── index.html          # Home page
├── about.html          # Chi sono / About
├── services.html       # Servizi
├── portfolio.html      # Progetti / Portfolio
├── contact.html        # Contatti
├── send-mail.php       # Contact form backend
├── assets/
│   ├── css/
│   │   └── style.css   # Single stylesheet — all styles live here
│   ├── js/
│   │   └── main.js     # Single JS file — all interactivity
│   └── img/            # Images and placeholder visuals
└── CLAUDE.md
```

## Development

Open any `.html` file directly in a browser — no build step needed.

For the PHP contact form, a local PHP server is required:
```bash
php -S localhost:8000
```
Then visit `http://localhost:8000`.

## Design System (CSS Variables)

All design tokens are defined as CSS custom properties in `style.css` at `:root`. The palette is:
- **Accent**: orange (`--color-accent`)
- **Primary**: deep blue (`--color-primary`)
- **Background**: near-black or white depending on mode
- **Font**: modern sans-serif (e.g. Inter or similar via Google Fonts)

When editing styles, always use the CSS variables — never hardcode colors, spacing, or radii.

## Architecture Notes

- **Single CSS file**: all styles including animations, responsive breakpoints, and component variants. Sections are delimited by comments.
- **Single JS file**: handles navbar scroll behavior, intersection observer animations, smooth scroll, portfolio filtering, and any cursor/glow effects. Uses vanilla JS only — no jQuery, no Alpine, no HTMX.
- **No external JS libraries**: animations are CSS-based or written in vanilla JS.
- **PHP mailer**: `send-mail.php` receives POST from the contact form and sends via `mail()`. It validates input and returns JSON for the JS handler.
- **Placeholder images**: stored in `assets/img/` with descriptive names; easily replaceable.

## Content Language

All copy is written in Italian. When editing or adding text content, maintain Italian throughout.

## Key Sections per Page

| Page | Key components |
|------|---------------|
| `index.html` | Hero split-text, services cards, skills grid, portfolio preview, why-choose-me, CTA |
| `about.html` | Bio, work approach, tech stack, timeline/method block |
| `services.html` | Service cards with value-oriented copy (vetrina, landing, WordPress, AI integration, maintenance) |
| `portfolio.html` | Filterable project cards with stack badges and results |
| `contact.html` | Styled form, availability note, final CTA |

## SEO & Accessibility

Each page must have: unique `<title>`, `<meta name="description">`, correct heading hierarchy (one `<h1>` per page), `alt` attributes on all images, and semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`).

## Frontend Aesthetics

Avoid converging toward generic "AI slop" outputs. Produce creative, distinctive frontends that surprise and delight.

**Typography**: Use fonts that are beautiful and unique. **Never use Inter, Roboto, Arial, Space Grotesk, or system fonts for display.** Current project uses `Syne` (headings/display) + `Figtree` (body).

**Color & Theme**: Commit to a cohesive aesthetic using CSS variables. Dominant colors with sharp accents outperform timid palettes. Draw from IDE themes and cultural aesthetics. **Current palette**: warm near-black background (`#060508`) + vivid raw orange accent (`#FF3500`) + acid lime secondary (`#C6FF00`, used only on section labels/markers).

**Motion**: Prioritize CSS-only animations. One well-orchestrated page-load with staggered reveals creates more delight than scattered micro-interactions.

**Backgrounds**: Create atmosphere with layered CSS gradients, mesh gradients, and contextual effects — never solid colors alone.

**Avoid**: purple gradients on white, predictable tech-portfolio layouts, cookie-cutter component patterns, timid/evenly-distributed color palettes, overused fonts. Think outside the box: vary choices, avoid converging on common combinations.
