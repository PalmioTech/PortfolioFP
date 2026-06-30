/* ============================================================
   MAIN.JS — FPdeveloper Portfolio
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     NAVBAR — sticky scroll behavior + mobile toggle
  ---------------------------------------------------------- */
  const navbar = document.querySelector('.navbar');
  const burger = document.querySelector('.navbar__burger');
  const mobileNav = document.querySelector('.navbar__mobile');

  if (navbar) {
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  if (burger && mobileNav) {
    burger.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('open');
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close mobile nav on link click or outside click
    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', e => {
      if (!burger.contains(e.target) && !mobileNav.contains(e.target)) {
        mobileNav.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     ACTIVE NAV LINK + SLIDING PILL
  ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  const navContainer = document.querySelector('.navbar__nav');
  if (navContainer) {
    const pill = document.createElement('span');
    pill.className = 'navbar__pill';
    navContainer.prepend(pill);

    const activeLink = navContainer.querySelector('.navbar__link.active');
    const navLinks   = navContainer.querySelectorAll('.navbar__link');

    function movePill(target, instant) {
      if (instant) pill.style.transition = 'none';
      else         pill.style.transition = '';
      pill.style.left  = target.offsetLeft + 'px';
      pill.style.width = target.offsetWidth + 'px';
    }

    if (activeLink) {
      movePill(activeLink, true);
      pill.getBoundingClientRect(); // flush layout so transition fires later
    }

    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => movePill(link, false));
      link.addEventListener('mouseleave', () => {
        if (activeLink) movePill(activeLink, false);
      });
    });
  }

  /* ----------------------------------------------------------
     SCROLL REVEAL — Intersection Observer
  ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealElements.length > 0) {
    if (!('IntersectionObserver' in window)) {
      // Failsafe: never leave content stuck invisible
      revealElements.forEach(el => el.classList.add('revealed'));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        // Pre-reveal before the section scrolls into view so mobile never
        // shows an empty gap waiting for the animation to fire.
        { threshold: 0, rootMargin: '0px 0px 240px 0px' }
      );

      revealElements.forEach(el => observer.observe(el));
    }
  }

  /* ----------------------------------------------------------
     CURSOR GLOW + TARGET CURSOR (desktop only)
  ---------------------------------------------------------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    /* ambient glow */
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    /* target cursor markup */
    const targetCursor = document.createElement('div');
    targetCursor.className = 'target-cursor';
    targetCursor.innerHTML = `
      <div class="target-cursor__ring target-cursor__outer"></div>
      <div class="target-cursor__lines"></div>
      <div class="target-cursor__ring target-cursor__inner"></div>
    `;
    document.body.appendChild(targetCursor);
    document.body.classList.add('has-target-cursor');

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let glowX = 0, glowY = 0;
    let isHover = false;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      /* hover detection — any interactive element or .cursor-target */
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const hoverable = el && el.closest(
        'a, button, [role="button"], input, textarea, select, label, .cursor-target, [tabindex]'
      );
      if (hoverable && !isHover) {
        isHover = true;
        targetCursor.classList.add('target-cursor--hover');
      } else if (!hoverable && isHover) {
        isHover = false;
        targetCursor.classList.remove('target-cursor--hover');
      }
    });

    document.addEventListener('mousedown', () => {
      targetCursor.classList.add('target-cursor--click');
    });
    document.addEventListener('mouseup', () => {
      targetCursor.classList.remove('target-cursor--click');
    });

    document.addEventListener('mouseleave', () => {
      targetCursor.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      targetCursor.style.opacity = '1';
    });

    const animateCursor = () => {
      /* target cursor — tight follow */
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      targetCursor.style.left = curX + 'px';
      targetCursor.style.top  = curY + 'px';

      /* glow — lazy follow */
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top  = glowY + 'px';

      requestAnimationFrame(animateCursor);
    };
    animateCursor();
  }

  /* ----------------------------------------------------------
     SMOOTH SCROLL for anchor links
  ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement)
          .getPropertyValue('--nav-height')) || 72;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

  /* ----------------------------------------------------------
     PORTFOLIO FILTER
  ---------------------------------------------------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card[data-category]');

  if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.filter;

        portfolioCards.forEach(card => {
          const match = category === 'all' || card.dataset.category.split(' ').includes(category);
          if (match) {
            if (card.style.display === 'none') {
              card.style.transition = 'none';
              card.style.opacity = '0';
              card.style.transform = 'scale(0.94) translateY(8px)';
              card.style.display = 'flex';
              card.offsetHeight; // force reflow
            }
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'scale(1) translateY(0)';
          } else {
            card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.94) translateY(8px)';
            setTimeout(() => { card.style.display = 'none'; }, 260);
          }
        });
      });
    });
  }

  /* ----------------------------------------------------------
     FAQ ACCORDION
  ---------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all others
        faqItems.forEach(other => {
          if (other !== item) other.classList.remove('open');
        });

        item.classList.toggle('open', !isOpen);
      });
    }
  });

  /* ----------------------------------------------------------
     FLOATING LABEL — select fill detection
  ---------------------------------------------------------- */
  document.querySelectorAll('.fp-field--select .fp-field__input').forEach(function(sel) {
    function syncFill() { sel.classList.toggle('is-filled', sel.value !== ''); }
    sel.addEventListener('change', syncFill);
    syncFill();
  });

  /* ----------------------------------------------------------
     CONTACT FORM — validation + AJAX submit
  ---------------------------------------------------------- */
  const contactForm = document.querySelector('#contact-form');
  const formMessage = document.querySelector('.form-message');
  const submitBtn   = document.querySelector('#contact-form .btn--submit');

  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();

      const name    = contactForm.querySelector('[name="name"]').value.trim();
      const email   = contactForm.querySelector('[name="email"]').value.trim();
      const message = contactForm.querySelector('[name="message"]').value.trim();

      // Basic validation
      if (!name || !email || !message) {
        showMessage('Per favore compila tutti i campi obbligatori.', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('Inserisci un indirizzo email valido.', 'error');
        return;
      }

      // Submit state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Invio in corso…';
      }

      try {
        const formData = new FormData(contactForm);
        const response = await fetch('send-mail.php', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();

        if (data.success) {
          showMessage('Messaggio inviato con successo! Ti rispondo presto.', 'success');
          contactForm.reset();
        } else {
          showMessage(data.message || 'Si è verificato un errore. Riprova.', 'error');
        }
      } catch {
        // Fallback: form was submitted but PHP not running
        showMessage('Grazie per il messaggio! Ti contatterò al più presto.', 'success');
        contactForm.reset();
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Invia Messaggio';
        }
      }
    });
  }

  function showMessage(msg, type) {
    if (!formMessage) return;
    formMessage.textContent = msg;
    formMessage.className = 'form-message ' + type;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => {
      formMessage.className = 'form-message';
    }, 6000);
  }

  /* ----------------------------------------------------------
     ANIMATED COUNTER (stats)
  ---------------------------------------------------------- */
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length > 0) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const end   = parseInt(el.dataset.counter);
        const suffix = el.dataset.suffix || '';
        const dur   = 1800;
        let startTime;

        const step = (timestamp) => {
          if (!startTime) startTime = timestamp;
          const progress = Math.min((timestamp - startTime) / dur, 1);
          const ease = 1 - Math.pow(1 - progress, 4);
          el.textContent = Math.floor(ease * end) + suffix;
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = end + suffix;
        };

        requestAnimationFrame(step);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ----------------------------------------------------------
     MARQUEE — pause on hover
  ---------------------------------------------------------- */
  const marqueeTrack = document.querySelector('.marquee-track');
  if (marqueeTrack) {
    marqueeTrack.addEventListener('mouseenter', () => {
      marqueeTrack.style.animationPlayState = 'paused';
    });
    marqueeTrack.addEventListener('mouseleave', () => {
      marqueeTrack.style.animationPlayState = 'running';
    });
  }

  /* ----------------------------------------------------------
     CARD MOUSE GRADIENT EFFECT
  ---------------------------------------------------------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ----------------------------------------------------------
     TYPEWRITER WORD ROTATION (hero "converte")
  ---------------------------------------------------------- */
  const typeEl = document.querySelector('.typewriter-rotate');
  if (typeEl) {
    const words = JSON.parse(typeEl.dataset.words);
    let wIdx = 0, cIdx = words[0].length, deleting = false;

    // Lock min-width to the longest word so the line never reflows.
    // Deferred to fonts.ready so Syne is loaded before measuring.
    typeEl.style.display = 'inline-block';
    const longest = words.reduce((a, b) => a.length > b.length ? a : b);
    document.fonts.ready.then(() => {
      typeEl.textContent = longest;
      typeEl.style.minWidth = typeEl.offsetWidth + 'px';
      typeEl.textContent = words[0];
    });

    function typeTick() {
      typeEl.textContent = words[wIdx].substring(0, cIdx);

      if (!deleting && cIdx === words[wIdx].length) {
        setTimeout(() => { deleting = true; typeTick(); }, 2200);
        return;
      }
      if (deleting && cIdx === 0) {
        deleting = false;
        wIdx = (wIdx + 1) % words.length;
        setTimeout(typeTick, 280);
        return;
      }
      cIdx += deleting ? -1 : 1;
      setTimeout(typeTick, deleting ? 45 : 95);
    }

    // Start after hero entrance animation
    setTimeout(typeTick, 2000);
  }

  /* ----------------------------------------------------------
     WORD SPLIT REVEAL on section headings
  ---------------------------------------------------------- */
  const splitEls = document.querySelectorAll('[data-split]');

  if (splitEls.length > 0) {
    function buildSplitWords(el) {
      const children = Array.from(el.childNodes);
      el.innerHTML = '';
      let wi = 0;

      children.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          const words = node.textContent.trim().split(/\s+/).filter(Boolean);
          words.forEach(word => {
            if (el.lastChild && el.lastChild.nodeName !== 'BR') {
              el.appendChild(document.createTextNode(' '));
            }
            const s = document.createElement('span');
            s.className = 'sw';
            s.style.setProperty('--wi', wi++);
            s.textContent = word;
            el.appendChild(s);
          });
        } else if (node.nodeName === 'BR') {
          el.appendChild(document.createElement('br'));
        } else {
          if (el.lastChild && el.lastChild.nodeName !== 'BR') {
            el.appendChild(document.createTextNode(' '));
          }
          node.classList.add('sw');
          node.style.setProperty('--wi', wi++);
          el.appendChild(node);
        }
      });

      el.classList.add('sw-ready');
    }

    const splitObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('sw-visible');
          splitObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    splitEls.forEach(el => {
      buildSplitWords(el);
      splitObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     THEME TOGGLE (dark / light)
  ---------------------------------------------------------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      localStorage.setItem('fp-theme', next);
    });
  }

  /* ----------------------------------------------------------
     HERO MOUSE PARALLAX + SPOTLIGHT
  ---------------------------------------------------------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroBg = hero.querySelector('.hero__bg');

      const spotlight = document.createElement('div');
      spotlight.className = 'hero__spotlight';
      heroBg.appendChild(spotlight);

      let spotX = 0, spotY = 0, targetX = 0, targetY = 0, rafId = null;

      function tickSpotlight() {
        spotX += (targetX - spotX) * 0.08;
        spotY += (targetY - spotY) * 0.08;
        spotlight.style.left = spotX + 'px';
        spotlight.style.top  = spotY + 'px';
        rafId = requestAnimationFrame(tickSpotlight);
      }

      hero.addEventListener('mouseenter', () => {
        hero.classList.add('hero--mouse-active');
        if (!rafId) rafId = requestAnimationFrame(tickSpotlight);
      });

      hero.addEventListener('mouseleave', () => {
        hero.classList.remove('hero--mouse-active');
        cancelAnimationFrame(rafId);
        rafId = null;
      });

      hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect();
        targetX = e.clientX - rect.left;
        targetY = e.clientY - rect.top;

        const nx = (targetX / rect.width  - 0.5);
        const ny = (targetY / rect.height - 0.5);
        hero.style.setProperty('--grid-x', (nx * 15) + 'px');
        hero.style.setProperty('--grid-y', (ny * 15) + 'px');
      });
    }
  }

  // ── ANTIGRAVITY PARTICLE EFFECT (sitewide) ────────────────────────
  (function () {
    const canvas = document.createElement('canvas');
    canvas.className = 'site-particles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const ctx  = canvas.getContext('2d');
    const DPR  = Math.min(window.devicePixelRatio || 1, 2);

    const COUNT         = 490;
    const LERP          = 0.12;
    const WAVE_SPEED    = 0.5;
    const MAGNET_RADIUS = 130;
    const MAGNET_FORCE  = 0.45;

    // [r, g, b] site palette
    const PALETTE = [[255,53,0],[255,100,50],[198,255,0],[255,210,170],[255,255,255]];
    const WEIGHTS = [45, 20, 15, 12, 8];
    const TOTAL_W = WEIGHTS.reduce((a, b) => a + b, 0);

    function pickColor() {
      let r = Math.random() * TOTAL_W;
      for (let i = 0; i < WEIGHTS.length; i++) {
        r -= WEIGHTS[i];
        if (r <= 0) return PALETTE[i];
      }
      return PALETTE[0];
    }

    let W = 0, H = 0;
    const particles = [];

    function buildParticles(w, h) {
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const [r, g, b] = pickColor();
        particles.push({
          ox: Math.random() * w,
          oy: Math.random() * h,
          x:  Math.random() * w,
          y:  Math.random() * h,
          phase:   Math.random() * Math.PI * 2,
          waveAmp: 8 + Math.random() * 22,
          size:    0.5 + Math.random() * 2,
          speed:   0.3 + Math.random() * 1.2,
          r, g, b,
          alpha: 0.08 + Math.random() * 0.35,
        });
      }
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      canvas.style.width  = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(DPR, DPR);
      buildParticles(W, H);
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    let mouseX = -9999, mouseY = -9999;
    let time   = 0;

    if (window.matchMedia('(pointer: fine)').matches) {
      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      time += 0.016;

      for (let i = 0; i < COUNT; i++) {
        const p = particles[i];
        const t = time * WAVE_SPEED * p.speed + p.phase;

        let tx = p.ox + Math.sin(t)       * p.waveAmp;
        let ty = p.oy + Math.cos(t * 0.7) * p.waveAmp * 0.6;

        const dx   = mouseX - tx;
        const dy   = mouseY - ty;
        const dist = Math.hypot(dx, dy);
        if (dist < MAGNET_RADIUS && dist > 0) {
          const force = (1 - dist / MAGNET_RADIUS) * MAGNET_FORCE;
          tx += dx * force;
          ty += dy * force;
        }

        p.x += (tx - p.x) * LERP;
        p.y += (ty - p.y) * LERP;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    tick();
  })();

  // ── SERVICE CARDS 3D TILT ─────────────────────────────────────
  (function () {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.service-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const dx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
        const dy = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);
        card.style.transform = [
          'perspective(600px)',
          `rotateX(${(-dy * 7).toFixed(2)}deg)`,
          `rotateY(${( dx * 7).toFixed(2)}deg)`,
          'translateZ(6px)'
        ].join(' ');
        card.style.transition = 'transform 0.1s ease-out, filter 0.3s, border-color 0.3s';
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s, border-color 0.3s';
      });
    });
  })();

  /* ----------------------------------------------------------
     PAGE TRANSITION OVERLAY
  ---------------------------------------------------------- */
  (function () {
    var COVER_MS = 500;

    var overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
      '<div class="page-transition__brand">' +
        '<span class="page-transition__fp">FP</span>' +
        '<span class="page-transition__dev">developer</span>' +
        '<span class="page-transition__bar"></span>' +
      '</div>';
    document.body.appendChild(overlay);

    // Reveal page content after load
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add('is-revealing');
      });
    });

    // Intercept internal navigation
    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;

      var href = link.getAttribute('href');
      if (!href || href.charAt(0) === '#') return;
      if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;
      if (link.target === '_blank') return;

      var url;
      try { url = new URL(href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      e.preventDefault();
      overlay.classList.remove('is-revealing');
      void overlay.offsetWidth; // force reflow to reset animation
      overlay.classList.add('is-covering');

      setTimeout(function () {
        window.location.href = href;
      }, COVER_MS);
    });
  })();

  /* ----------------------------------------------------------
     TEXT SHUFFLE — per-letter scramble reveal (vanilla)
     Reimplements the React-Bits "Shuffle" effect with no deps.
     Applies to any [data-shuffle] element. Each glyph is a strip
     that scrolls through scrambled chars to its final letter.
     Triggers on scroll-into-view (once) + replays on hover.
     Degrades to plain text with no JS / reduced motion.
  ---------------------------------------------------------- */
  (function () {
    var nodes = document.querySelectorAll('[data-shuffle]');
    if (!nodes.length) return;

    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return; // leave original text untouched

    var DEFAULT_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/*';
    var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

    function rand(set) {
      return set.charAt(Math.floor(Math.random() * set.length));
    }

    function setup(el) {
      var duration = parseFloat(el.dataset.shuffleDuration) || 0.55;
      var stagger  = parseFloat(el.dataset.shuffleStagger)  || 0.035;
      var rolls    = Math.max(1, parseInt(el.dataset.shuffleTimes || '5', 10));
      var charset  = el.dataset.shuffleCharset || DEFAULT_SET;

      // Capture structure (chars / spaces / line breaks), tracking gradient
      var tokens = [];
      (function walk(node, grad) {
        Array.prototype.forEach.call(node.childNodes, function (n) {
          if (n.nodeType === 3) {
            var t = n.textContent;
            for (var i = 0; i < t.length; i++) {
              if (/\s/.test(t[i])) tokens.push({ type: 'space' });
              else tokens.push({ type: 'char', ch: t[i], grad: grad });
            }
          } else if (n.nodeType === 1) {
            if (n.tagName === 'BR') tokens.push({ type: 'br' });
            else walk(n, grad || n.classList.contains('text-gradient'));
          }
        });
      })(el, false);

      // Accessibility: expose the real, readable text; hide the scaffold
      var label = tokens.map(function (t) {
        return t.type === 'char' ? t.ch : ' ';
      }).join('').replace(/\s+/g, ' ').trim();
      if (label) el.setAttribute('aria-label', label);

      // Rebuild DOM — each glyph starts as clean static text (a single cell)
      el.textContent = '';
      var wraps = [];
      var idx = 0;

      var word = null; // current word container (keeps glyphs unbreakable)
      tokens.forEach(function (tok) {
        if (tok.type === 'space') { word = null; el.appendChild(document.createTextNode(' ')); return; }
        if (tok.type === 'br')    { word = null; el.appendChild(document.createElement('br')); return; }

        if (!word) { word = document.createElement('span'); word.className = 'shuffle-word'; el.appendChild(word); }

        var wrap = document.createElement('span');
        wrap.className = 'shuffle-cw';
        wrap.setAttribute('aria-hidden', 'true');

        var strip = document.createElement('span');
        strip.className = 'shuffle-strip';

        var fin = document.createElement('span');
        fin.className = 'shuffle-cell' + (tok.grad ? ' text-gradient' : '');
        fin.textContent = tok.ch;
        strip.appendChild(fin);

        wrap.appendChild(strip);
        word.appendChild(wrap);
        wraps.push({ wrap: wrap, strip: strip, fin: fin, grad: tok.grad, i: idx++ });
      });

      // Measure each glyph in the real font (collapsed = natural width)
      wraps.forEach(function (o) { o.w = o.fin.getBoundingClientRect().width; });

      function fillStrip(o) {
        // Prepend `rolls` scramble cells ahead of the final glyph
        var gradCls = o.grad ? ' text-gradient' : '';
        for (var k = 0; k < rolls; k++) {
          var s = document.createElement('span');
          s.className = 'shuffle-cell' + gradCls;
          s.textContent = rand(charset);
          s.style.width = o.w + 'px';
          o.strip.insertBefore(s, o.fin);
        }
        o.fin.style.width = o.w + 'px';
        o.wrap.style.width = o.w + 'px';
        o.dist = rolls * o.w;
        o.strip.style.willChange = 'transform';
        o.strip.style.transition = 'none';
        o.strip.style.transform = 'translateX(0px)';
      }

      function collapse(o) {
        // Back to one clean glyph — crisp, no clipping, no lingering GPU layer
        while (o.strip.firstChild !== o.fin) o.strip.removeChild(o.strip.firstChild);
        o.strip.style.transition = 'none';
        o.strip.style.transform = 'none';
        o.strip.style.willChange = 'auto';
        o.fin.style.width = 'auto';
        o.wrap.style.width = 'auto';
      }

      var playing = false;

      function play() {
        if (playing) return;
        playing = true;
        var done = 0;

        wraps.forEach(fillStrip);
        void el.offsetWidth; // flush the reset before animating

        wraps.forEach(function (o) {
          // even/odd flavour: odd glyphs lead, even follow slightly
          var group = (o.i % 2) * (stagger * 1.6);
          var delay = o.i * stagger + group;
          o.strip.style.transition =
            'transform ' + duration + 's ' + EASE + ' ' + delay + 's';
          o.strip.addEventListener('transitionend', function once() {
            o.strip.removeEventListener('transitionend', once);
            collapse(o);
            if (++done === wraps.length) playing = false;
          });
          o.strip.style.transform = 'translateX(' + (-o.dist) + 'px)';
        });
      }

      el.addEventListener('mouseenter', play);

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { play(); io.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
      io.observe(el);
    }

    // Measure in the real font to avoid mis-sized cells
    var run = function () {
      Array.prototype.forEach.call(nodes, setup);
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run);
    else run();
  })();

  /* ----------------------------------------------------------
     MAMMOTH HERO — rotating scramble word + looping bio
  ---------------------------------------------------------- */
  (function () {
    var reduced = window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Narrow glyphs only — keeps scramble width close to the final word
    var SET = 'ABCDEFGHIJKLNOPRSTUVXYZ0123456789/<>*-';

    /* Giant headline word: scrambles, then settles on the next word */
    document.querySelectorAll('[data-scramble-rotate]').forEach(function (el) {
      var words;
      try { words = JSON.parse(el.dataset.words); } catch (e) { return; }
      if (!words || !words.length) return;
      var i = 0;
      var raf = null;
      var current = words[0];

      // Keep the word on screen: long words shrink to fit, short words
      // stay big — never clipped at the viewport edges.
      function fit() {
        el.style.fontSize = '';                         // back to the CSS clamp
        var max = parseFloat(getComputedStyle(el).fontSize) || 0;
        var w = el.scrollWidth * 1.25;                  // headroom for wider scramble glyphs
        if (!w || !max) return;
        var bleed = window.innerWidth <= 900 ? 0.9 : 1.0;
        var avail = window.innerWidth * bleed;
        if (w > avail) el.style.fontSize = (max * avail / w) + 'px';
      }

      function scrambleTo(target) {
        if (raf) cancelAnimationFrame(raf);
        current = target;
        el.textContent = target;
        fit();                                          // size to the final word
        if (reduced) return;
        var len = target.length;
        var DUR = 650;
        var start = null;
        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min(1, (ts - start) / DUR);
          var revealed = Math.floor(p * len);
          var out = '';
          for (var j = 0; j < len; j++) {
            if (j < revealed || target.charAt(j) === ' ') out += target.charAt(j);
            else out += SET.charAt(Math.floor(Math.random() * SET.length));
          }
          el.textContent = out;
          if (p < 1) raf = requestAnimationFrame(tick);
          else el.textContent = target;
        }
        raf = requestAnimationFrame(tick);
      }

      scrambleTo(words[0]);
      setInterval(function () {
        i = (i + 1) % words.length;
        scrambleTo(words[i]);
      }, 4000);

      // Re-fit once the display font loads (fallback font measures narrower,
      // which would otherwise leave the word too big and overflow).
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () { el.textContent = current; fit(); });
      }

      var rt;
      window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () { el.textContent = current; fit(); }, 150);
      }, { passive: true });
    });

    /* Bio: staggered per-character reveal, re-runs on a loop */
    var bio = document.querySelector('[data-typeloop]');
    if (bio) {
      var full = bio.textContent;
      if (reduced) {
        bio.textContent = full; // static, readable
      } else {
        var build = function () {
          bio.classList.remove('is-typing');
          bio.textContent = '';
          var gi = 0; // global char index drives the stagger
          var words = full.split(' ');
          words.forEach(function (word, wi) {
            // Keep each word whole — line breaks only happen at spaces
            var wspan = document.createElement('span');
            wspan.className = 'tw-word';
            for (var j = 0; j < word.length; j++) {
              var s = document.createElement('span');
              s.className = 'tw-char';
              s.textContent = word.charAt(j);
              s.style.animationDelay = (gi * 0.02) + 's';
              wspan.appendChild(s);
              gi++;
            }
            bio.appendChild(wspan);
            if (wi < words.length - 1) {
              bio.appendChild(document.createTextNode(' '));
              gi++;
            }
          });
          void bio.offsetWidth; // flush so the animation restarts
          bio.classList.add('is-typing');
        };
        build(); // animate the entrance once, then leave it in place
      }
    }
  })();

})();

/* ----------------------------------------------------------
   PORTFOLIO SCROLL-STACK (mobile only) — vanilla, no deps
   Pins + scales the portfolio cards on scroll and reveals
   each card's text (image → text), then stacks the next one.
---------------------------------------------------------- */
(function () {
  var grid = document.querySelector('.portfolio-page-grid');
  if (!grid) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.portfolio-card'));
  if (!cards.length) return;

  // Mobile deck is now pure CSS (position: sticky). Set each card's stack
  // index so the CSS can fan them slightly (peek). One-time, no scroll JS.
  cards.forEach(function (c, i) { c.style.setProperty('--si', i); });

  // The old JS transform/pin deck below is left dormant — it was unreliable
  // in in-app browsers (Instagram). CSS sticky handles the deck now.
  return;

  var mq = window.matchMedia('(max-width: 768px)');
  // Front card pins at PIN_TOP; cards behind it fan up-left, smaller (deck look)
  var PIN_TOP = 118, PEEK_Y = 16, PEEK_X = 12, STEP = 0.05, ROT = 2.2;
  var raf = null, active = false, tops = [], releaseScroll = Infinity;

  function measure() {
    var prev = cards.map(function (c) { return c.style.transform; });
    cards.forEach(function (c) { c.style.transform = 'none'; });
    tops = cards.map(function (c) { return c.getBoundingClientRect().top + window.scrollY; });
    // Release point: once the grid bottom reaches the viewport bottom the
    // whole stack un-pins and scrolls away like a normal section.
    var gridBottom = grid.getBoundingClientRect().bottom + window.scrollY;
    releaseScroll = Math.max(0, gridBottom - window.innerHeight);
    cards.forEach(function (c, i) { c.style.transform = prev[i] || ''; });
  }

  var LERP = 0.2, lastSy = -1, idle = 0;

  function resetState() {
    cards.forEach(function (c) { c._dx = 0; c._dy = 0; c._sc = 1; c._rt = 0; });
  }

  // Compute + apply one frame. Returns true if anything still needs easing.
  function step() {
    // Cap the scroll used for pinning so the stack releases at the section end
    var sy = Math.min(window.scrollY, releaseScroll);
    var vis = [];
    cards.forEach(function (c, i) { if (c.offsetParent !== null) vis.push(i); });

    // A card is "pinned" once its top reaches PIN_TOP
    var pinned = vis.map(function (idx) { return (sy + PIN_TOP) - tops[idx] > 0; });

    var moving = false;
    vis.forEach(function (idx, k) {
      var c = cards[idx];
      var depthAbove = 0;
      for (var j = k + 1; j < vis.length; j++) if (pinned[j]) depthAbove++;
      // Collected cards rest at ONE fixed slot — still once filed away.
      var d = depthAbove > 0 ? 1 : 0;

      // Decorative deck offsets (these EASE for a fluid file-away animation)
      var tDx = pinned[k] ? -d * PEEK_X : 0;
      var tDy = pinned[k] ? -d * PEEK_Y : 0;
      var tSc = pinned[k] ? 1 - d * STEP : 1;
      var tRt = pinned[k] ? -d * ROT : 0;
      if (Math.abs(tDx - c._dx) > 0.03 || Math.abs(tDy - c._dy) > 0.03 ||
          Math.abs(tSc - c._sc) > 0.001 || Math.abs(tRt - c._rt) > 0.03) moving = true;
      c._dx += (tDx - c._dx) * LERP;
      c._dy += (tDy - c._dy) * LERP;
      c._sc += (tSc - c._sc) * LERP;
      c._rt += (tRt - c._rt) * LERP;

      // Pin offset is EXACT (no easing) so the collector never drifts
      var pinTy = pinned[k] ? (sy + PIN_TOP) - tops[idx] : 0;
      var ty = pinTy + c._dy;

      c.style.transform = 'translate3d(' + c._dx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + c._sc.toFixed(3) + ') rotate(' + c._rt.toFixed(2) + 'deg)';
      c.style.zIndex = String(10 + k);     // incoming card always slides on top
      c.classList.toggle('is-open', pinned[k] && depthAbove === 0);
    });

    if (window.scrollY !== lastSy) { moving = true; lastSy = window.scrollY; }
    return moving;
  }

  function loop() {
    var moving = step();
    idle = moving ? 0 : idle + 1;
    raf = (active && idle < 8) ? requestAnimationFrame(loop) : null;
  }

  // Apply immediately on scroll (responsive even if rAF is throttled), and
  // keep the rAF loop alive so the deck offsets ease smoothly between events.
  function onScroll() { if (active) { step(); kick(); } }
  function kick() { if (active && !raf) { idle = 0; raf = requestAnimationFrame(loop); } }

  function enable() {
    if (active) return;
    active = true;
    document.body.classList.add('scrollstack-on');
    measure();
    resetState();
    step();          // apply once synchronously so cards are placed right away
    kick();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  function disable() {
    if (!active) return;
    active = false;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    document.body.classList.remove('scrollstack-on');
    window.removeEventListener('scroll', onScroll);
    cards.forEach(function (c) { c.style.transform = ''; c.style.zIndex = ''; c.classList.remove('is-open'); });
  }

  function apply() { if (mq.matches) enable(); else disable(); }

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { if (active) { measure(); kick(); } apply(); }, 150);
  }, { passive: true });

  // Filtering changes the layout — re-measure card positions afterwards
  document.querySelectorAll('.filter-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      if (active) setTimeout(function () { measure(); kick(); }, 320);
    });
  });

  apply();
})();

/* ----------------------------------------------------------
   HERO SCROLL-SCRUB ENGINE (desktop/tablet) — vanilla, no deps
   Pins the hero (CSS sticky) and scrubs an animation on <canvas>
   as you scroll (mouse or touch).

   >>> TO USE A REAL FRAME SEQUENCE: fill FRAMES with the ordered
   image URLs, e.g.
     FRAMES = Array.from({length:120}, function(_,i){
       return 'assets/img/hero-seq/frame-' + String(i+1).padStart(3,'0') + '.webp';
     });
   With FRAMES empty it runs the photo + desk/monitor placeholder.
---------------------------------------------------------- */
(function () {
  var track = document.querySelector('.hero-track');
  if (!track) return;
  var canvas = track.querySelector('.hero-scrub');
  var img = track.querySelector('.hero-cutout__img');
  if (!canvas || !img) return;

  var FRAMES = []; // <-- fill with real frame URLs to use the true animation

  var mq = window.matchMedia('(min-width: 769px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d');
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, ready = false, active = false, raf = null;
  var frames = [], photo = null;

  function size() {
    var r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function progress() {
    var rect = track.getBoundingClientRect();
    var dist = track.offsetHeight - window.innerHeight;
    if (dist <= 0) return 0;
    return clamp(-rect.top / dist);
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawFrames(p) {
    ctx.clearRect(0, 0, W, H);
    var fr = frames[Math.min(frames.length - 1, Math.round(p * (frames.length - 1)))];
    if (!fr || !fr.naturalWidth) return;
    var dh = H, dw = dh * (fr.naturalWidth / fr.naturalHeight);
    if (dw > W) { dw = W; dh = dw * (fr.naturalHeight / fr.naturalWidth); }
    ctx.drawImage(fr, (W - dw) / 2, H - dh, dw, dh);
  }

  // Placeholder: the real photo settles down/back while a desk + monitor
  // rise in front — a stand-in for "subject sits at the computer".
  function drawPlaceholder(p) {
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2;
    var scale = lerp(1, 0.86, p);
    var dh = H * 0.92 * scale;
    var dw = dh * (photo.naturalWidth / photo.naturalHeight);
    var dy = lerp(0, H * 0.05, p);
    ctx.save();
    ctx.filter = 'grayscale(1) contrast(1.08) brightness(0.96)';
    ctx.drawImage(photo, cx - dw / 2, H - dh + dy, dw, dh);
    ctx.restore();

    var dp = clamp((p - 0.18) / 0.82);
    if (dp <= 0) return;
    var deskTop = lerp(H * 1.06, H * 0.6, dp);
    ctx.fillStyle = 'rgba(12,10,15,0.92)';
    rr(W * 0.1, deskTop, W * 0.8, H - deskTop, 14); ctx.fill();
    ctx.fillStyle = '#FF3500';
    ctx.fillRect(W * 0.1, deskTop, W * 0.8, 3);

    var mp = clamp((dp - 0.35) / 0.65);
    if (mp <= 0) return;
    var mw = W * 0.34 * mp, mh = mw * 0.62, mx = cx - mw / 2, my = deskTop - mh + 6;
    ctx.fillStyle = 'rgba(20,17,28,0.96)';
    rr(mx, my, mw, mh, 8); ctx.fill();
    ctx.fillStyle = 'rgba(198,255,0,' + (0.12 * mp) + ')';
    rr(mx + 6, my + 6, mw - 12, mh - 12, 5); ctx.fill();
    ctx.strokeStyle = 'rgba(255,53,0,0.5)'; ctx.lineWidth = 2;
    rr(mx, my, mw, mh, 8); ctx.stroke();
    ctx.fillStyle = 'rgba(20,17,28,0.96)';
    ctx.fillRect(cx - 3, my + mh, 6, 10);
  }

  function render() {
    raf = null;
    if (!ready || !W) return;
    var p = progress();
    if (FRAMES.length) drawFrames(p); else drawPlaceholder(p);
  }
  function onScroll() { if (!raf) raf = requestAnimationFrame(render); }

  function start() {
    if (active) return;
    active = true;
    canvas.style.display = 'block';
    img.style.visibility = 'hidden';
    size(); render();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize, { passive: true });
  }
  function onResize() { size(); render(); }
  function stop() {
    active = false;
    canvas.style.display = 'none';
    img.style.visibility = '';
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  }

  function load() {
    if (reduced || !mq.matches) { stop(); return; }
    if (active) return;
    if (FRAMES.length) {
      var n = 0;
      FRAMES.forEach(function (u, i) {
        var im = new Image();
        im.onload = function () { if (++n === FRAMES.length) { ready = true; start(); } };
        im.src = u; frames[i] = im;
      });
    } else {
      photo = new Image();
      photo.onload = function () { ready = true; start(); };
      photo.src = img.currentSrc || img.src;
      if (photo.complete && photo.naturalWidth) { ready = true; start(); }
    }
  }

  load();
  if (mq.addEventListener) mq.addEventListener('change', function () { stop(); load(); });
})();
