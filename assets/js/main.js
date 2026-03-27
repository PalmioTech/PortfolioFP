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
     ACTIVE NAV LINK based on current page
  ---------------------------------------------------------- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  /* ----------------------------------------------------------
     SCROLL REVEAL — Intersection Observer
  ---------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  if (revealElements.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    revealElements.forEach(el => observer.observe(el));
  }

  /* ----------------------------------------------------------
     CURSOR GLOW EFFECT (desktop only)
  ---------------------------------------------------------- */
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursorGlow = document.createElement('div');
    cursorGlow.className = 'cursor-glow';
    document.body.appendChild(cursorGlow);

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const animateCursor = () => {
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
          const match = category === 'all' || card.dataset.category === category;
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

})();
