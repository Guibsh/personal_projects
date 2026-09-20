/* =========================================================
   CONFIGURAÇÃO — altere apenas esta linha para trocar o número
   Formato: código do país + DDD + número, sem espaços ou símbolos
   ========================================================= */
const WHATSAPP = '5500000000000';

(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- links de WhatsApp ---- */
  document.querySelectorAll('[data-wa]').forEach(el => {
    const msg = el.dataset.waMsg || 'Olá Greissi!';
    el.setAttribute('href', `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---- reveal ao rolar ---- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---- nav: estado fixo, menu mobile, link ativo ---- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const waFloat = document.getElementById('waFloat');
  const progressBar = document.getElementById('progressBar');

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('.nav__links a').forEach(a =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  let ticking = false;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('is-stuck', y > 40);
    waFloat.classList.toggle('is-visible', y > innerHeight * 0.7);
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  const navLinks = [...nav.querySelectorAll('.nav__links a')].filter(a =>
    (a.getAttribute('href') || '').startsWith('#')
  );
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a =>
        a.classList.toggle('is-active', a.getAttribute('href') === '#' + e.target.id)
      );
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(a => {
    const el = document.querySelector(a.getAttribute('href'));
    if (el) sectionObserver.observe(el);
  });

  /* ---- parallax suave na foto do hero ---- */
  const heroImg = document.querySelector('.hero__frame img');
  if (heroImg && !reduced) {
    let raf = false;
    addEventListener('scroll', () => {
      if (raf) return;
      raf = true;
      requestAnimationFrame(() => {
        const y = Math.min(scrollY, innerHeight);
        heroImg.style.transform = `translate3d(0, ${y * 0.06}px, 0) scale(1.04)`;
        raf = false;
      });
    }, { passive: true });
  }

  /* ---- buquê: floresce ao entrar na tela ---- */
  const art = document.getElementById('bouquetArt');
  if (art) {
    art.querySelectorAll('.stem').forEach(p => {
      const len = Math.ceil(p.getTotalLength());
      p.style.setProperty('--len', len);
    });
    const steps = [...document.querySelectorAll('.bouquet__steps li')];
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        art.classList.add('is-blooming');
        steps.forEach((li, i) =>
          setTimeout(() => li.classList.add('is-lit'), reduced ? 0 : 900 + i * 350)
        );
        obs.unobserve(e.target);
      });
    }, { threshold: 0.35 }).observe(art);
  }

  /* ---- filtro de produtos ---- */
  const filters = [...document.querySelectorAll('.filter')];
  const cards = [...document.querySelectorAll('.card')];
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const show = cat === 'all' || card.dataset.cat === cat;
        card.classList.toggle('is-hidden', !show);
      });
    });
  });

  /* ---- carrossel de depoimentos ---- */
  const track = document.getElementById('track');
  if (track) {
    const slides = [...track.children];
    const dotsBox = document.getElementById('dots');
    let index = 0;
    let timer;

    const dots = slides.map((_, i) => {
      const d = document.createElement('button');
      d.setAttribute('aria-label', `Depoimento ${i + 1}`);
      d.addEventListener('click', () => go(i, true));
      dotsBox.appendChild(d);
      return d;
    });

    function go(i, manual) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, n) => d.classList.toggle('is-active', n === index));
      if (manual) restart();
    }
    function restart() {
      clearInterval(timer);
      if (!reduced) timer = setInterval(() => go(index + 1), 7000);
    }

    document.getElementById('next').addEventListener('click', () => go(index + 1, true));
    document.getElementById('prev').addEventListener('click', () => go(index - 1, true));

    let startX = null;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 45) go(index + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

    go(0);
    restart();
  }
})();
