/* =========================================================
   CONFIGURAÇÃO — altere apenas esta linha para trocar o número
   Formato: código do país + DDD + número, sem espaços ou símbolos
   ========================================================= */
const WHATSAPP = '5500000000000';

(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---- links de WhatsApp ---- */
  document.querySelectorAll('[data-wa]').forEach(el => {
    const msg = el.dataset.waMsg || 'Olá Greissi!';
    el.setAttribute('href', `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`);
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---- scroll suave (Lenis) ---- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true, touchMultiplier: 1.6 });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const el = document.querySelector(a.getAttribute('href'));
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -70 });
      });
    });
  }

  /* ---- reveal ao rolar ---- */
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* ---- nav ---- */
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

  /* ---- estado de rolagem: velocidade alimenta o vento ---- */
  let lastY = scrollY;
  let velocity = 0;
  const onScroll = () => {
    const y = scrollY;
    velocity += (y - lastY);
    lastY = y;
    nav.classList.toggle('is-stuck', y > 40);
    waFloat.classList.toggle('is-visible', y > innerHeight * 0.7);
    const max = document.documentElement.scrollHeight - innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- ponteiro e giroscópio, compartilhados pelas animações ---- */
  const pointer = { x: -9999, y: -9999, active: false };
  if (fine) {
    addEventListener('pointermove', e => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    }, { passive: true });
    addEventListener('pointerleave', () => { pointer.active = false; }, { passive: true });
  }

  const tilt = { x: 0, y: 0 };
  if (!reduced) {
    const onOrient = e => {
      if (e.gamma == null) return;
      tilt.x = clamp(e.gamma / 45, -1, 1);
      tilt.y = clamp(((e.beta ?? 45) - 45) / 45, -1, 1);
    };
    const DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      // iOS exige um gesto do usuário; pedimos no primeiro toque e seguimos sem
      // o efeito caso a permissão seja negada
      addEventListener('touchstart', function ask() {
        removeEventListener('touchstart', ask);
        DOE.requestPermission()
          .then(r => { if (r === 'granted') addEventListener('deviceorientation', onOrient); })
          .catch(() => {});
      }, { once: true, passive: true });
    } else if (DOE) {
      addEventListener('deviceorientation', onOrient);
    }
  }

  /* ---- motor do vento ---- */
  const windEls = [...document.querySelectorAll('.js-wind')].map((el, i) => ({
    el,
    phase: i * 1.7,
    amp: parseFloat(getComputedStyle(el).getPropertyValue('--amp')) || 3.2,
    speed: 0.8 + (i % 3) * 0.14,
    current: 0,
    box: null
  }));

  const measureWind = () => windEls.forEach(w => { w.box = w.el.getBoundingClientRect(); });
  let measureQueued = false;
  const queueMeasure = () => {
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(() => { measureWind(); measureQueued = false; });
  };
  addEventListener('resize', queueMeasure, { passive: true });
  addEventListener('scroll', queueMeasure, { passive: true });
  measureWind();

  /* ---- camadas 3D do hero ---- */
  const heroStage = document.getElementById('heroStage');
  const layers = heroStage ? [...heroStage.querySelectorAll('[data-depth]')] : [];
  const heroImg = document.querySelector('.hero__frame img');
  const hero = { tx: 0, ty: 0, cx: 0, cy: 0 };

  /* ---- buquê que ganha uma flor a cada seção ---- */
  const MARCOS = ['dores', 'sobre', 'jornada', 'quiz', 'produtos', 'depoimentos', 'duvidas'];
  const posy = document.getElementById('posy');
  const posyBlooms = posy?.querySelector('.posy__blooms');
  // pontas dos caules, na mesma ordem em que eles aparecem no SVG
  const PONTAS = [[60, 46], [34, 58], [86, 58], [22, 84], [98, 84], [36, 102], [84, 102]];
  const NS = 'http://www.w3.org/2000/svg';
  let colhidas = 0;

  if (posy) {
    PONTAS.forEach(([x, y], n) => {
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'posy__bloom');
      g.style.setProperty('--x', x + 'px');
      g.style.setProperty('--y', y + 'px');
      g.style.setProperty('--sc', (n === 0 ? 1.15 : n < 3 ? 1 : 0.85).toFixed(2));
      for (let a = 0; a < 6; a++) {
        const e = document.createElementNS(NS, 'ellipse');
        e.setAttribute('cy', '-7.5');
        e.setAttribute('rx', '4.4');
        e.setAttribute('ry', '8');
        e.setAttribute('transform', `rotate(${a * 60})`);
        g.appendChild(e);
      }
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('r', '3');
      c.setAttribute('class', 'core');
      g.appendChild(c);
      posyBlooms.appendChild(g);
    });
  }

  const contador = posy?.querySelector('.posy__count b');
  // abre tudo até n: quem chega por um link de âncora ou rola rápido pode pular
  // seções, e o buquê não pode ficar com buracos no meio
  const abrirFlor = n => {
    if (!posyBlooms || n < colhidas) return;
    for (let k = colhidas; k <= n; k++) {
      posyBlooms.children[k]?.classList.add('is-open');
    }
    colhidas = n + 1;
    if (contador) contador.textContent = colhidas;
    posy.classList.add('is-puff');
    setTimeout(() => posy.classList.remove('is-puff'), 700);
    const r = posy.getBoundingClientRect();
    soprar(r.left + r.width * 0.5, r.top + r.height * 0.35);
  };

  MARCOS.forEach((id, n) => {
    const el = document.getElementById(id);
    if (!el) return;
    new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        abrirFlor(n);
        obs.unobserve(e.target);
      });
    }, { rootMargin: '-35% 0px -35% 0px' }).observe(el);
  });

  /* ---- pétalas conduzidas pelo scroll ---- */
  const campo = document.getElementById('petals');
  const petalas = [];
  const QTD = innerWidth < 700 ? 9 : 16;

  if (campo && !reduced) {
    for (let i = 0; i < QTD; i++) {
      const el = document.createElement('span');
      el.className = 'petal';
      campo.appendChild(el);
      petalas.push({
        el,
        x: Math.random() * innerWidth,
        y: Math.random() * innerHeight,
        vy: 0.25 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.35,
        rot: Math.random() * 360,
        spin: (Math.random() - 0.5) * 1.1,
        esc: 0.65 + Math.random() * 0.6,
        vida: 1
      });
    }
  }

  // sopro extra quando uma flor nasce
  function soprar(ox, oy) {
    if (reduced) return;
    petalas.filter(p => p.vida >= 1).slice(0, 5).forEach((p, i) => {
      p.x = ox + (Math.random() - 0.5) * 30;
      p.y = oy + (Math.random() - 0.5) * 20;
      p.vx = (Math.random() - 0.2) * 2.4;
      p.vy = -1.2 - Math.random() * 1.2;
      p.spin = (Math.random() - 0.5) * 6;
      p.vida = 0.001 + i * 0.001;
    });
  }

  const moverPetalas = kick => {
    for (const p of petalas) {
      if (p.vida < 1) {
        p.vida = Math.min(1, p.vida + 0.012);
        p.vy += 0.045;
      }
      p.y += p.vy + kick * 0.22;
      p.x += p.vx + Math.sin((p.y + p.rot) / 120) * 0.5;
      p.rot += p.spin + kick * 0.1;

      if (p.y > innerHeight + 40) { p.y = -40; p.x = Math.random() * innerWidth; p.vida = 1; }
      if (p.y < -60) { p.y = innerHeight + 30; }
      if (p.x > innerWidth + 40) p.x = -30;
      if (p.x < -40) p.x = innerWidth + 30;

      p.el.style.transform =
        `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg) scale(${p.esc.toFixed(2)})`;
    }
  };

  /* ---- linha do tempo da jornada ---- */
  const journey = document.getElementById('journey');
  const vine = journey?.querySelector('.journey__stem');
  const marcos = journey ? [...journey.querySelectorAll('.journey__steps li')] : [];
  if (vine) vine.style.setProperty('--len', Math.ceil(vine.getTotalLength()));

  const pintarJornada = () => {
    if (!journey) return;
    const r = journey.getBoundingClientRect();
    const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.25), 0, 1);
    if (vine) vine.style.setProperty('--p', p.toFixed(3));
    marcos.forEach((li, i) => li.classList.toggle('is-lit', p > 0.12 + i * 0.2));
  };

  /* ---- laço principal ---- */
  let t = 0;
  const frame = () => {
    requestAnimationFrame(frame);
    t += 0.016;

    velocity *= 0.9;
    const kick = clamp(velocity * 0.35, -22, 22);

    if (!reduced) {
      for (const w of windEls) {
        let target = Math.sin(t * w.speed + w.phase) * w.amp + kick + tilt.x * 9;
        if (pointer.active && w.box) {
          const dx = pointer.x - (w.box.left + w.box.width / 2);
          const dy = pointer.y - (w.box.top + w.box.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 170) target -= (dx / (dist || 1)) * (1 - dist / 170) * 26;
        }
        w.current += (target - w.current) * 0.09;
        w.el.style.setProperty('--wind', w.current.toFixed(2) + 'deg');
      }

      if (layers.length) {
        const r = heroStage.getBoundingClientRect();
        const tx = pointer.active
          ? clamp((pointer.x - (r.left + r.width / 2)) / r.width, -1, 1)
          : tilt.x;
        const ty = pointer.active
          ? clamp((pointer.y - (r.top + r.height / 2)) / r.height, -1, 1)
          : tilt.y;
        hero.cx += (tx - hero.cx) * 0.07;
        hero.cy += (ty - hero.cy) * 0.07;
        for (const l of layers) {
          const d = Number(l.dataset.depth);
          l.style.transform =
            `translate3d(${(hero.cx * d).toFixed(2)}px, ${(hero.cy * d * 0.6).toFixed(2)}px, 0)`;
        }
        heroStage.style.transform =
          `perspective(900px) rotateY(${(hero.cx * 4).toFixed(2)}deg) rotateX(${(-hero.cy * 3).toFixed(2)}deg)`;
      }

      if (heroImg) {
        const y = Math.min(scrollY, innerHeight);
        heroImg.style.transform = `translate3d(0, ${(y * 0.06).toFixed(1)}px, 0) scale(1.04)`;
      }
    }

    posy?.classList.toggle('is-visible', scrollY > innerHeight * 0.55);
    moverPetalas(kick);
    pintarJornada();
  };
  requestAnimationFrame(frame);

  /* ---- inclinação 3D dos cards ---- */
  if (fine && !reduced) {
    document.querySelectorAll('.card, .quiz__opt').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(800px) rotateY(${(px * 7).toFixed(2)}deg) rotateX(${(-py * 7).toFixed(2)}deg) translateY(-5px)`;
        card.style.setProperty('--gx', (px * 100 + 50).toFixed(1) + '%');
        card.style.setProperty('--gy', (py * 100 + 50).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });
  }

  /* ---- contadores ---- */
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      obs.unobserve(el);
      const target = Number(el.dataset.count);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      if (reduced) return;
      const dur = 1400;
      const t0 = performance.now();
      const tick = now => {
        const k = clamp((now - t0) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = prefix + Math.round(target * eased).toLocaleString('pt-BR') + suffix;
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

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
        card.classList.toggle('is-hidden', !(cat === 'all' || card.dataset.cat === cat));
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

  /* ---- quiz de recomendação ---- */
  const quiz = document.getElementById('quiz');
  if (quiz) {
    const CATALOGO = {
      mulher: {
        nome: 'A Mulher Que Ele Nunca Esquece',
        tipo: 'E-book',
        texto: 'Mais de 500 frases, perguntas e respostas para conduzir qualquer conversa com confiança e deixar uma marca.',
        href: 'https://hotmart.com/pt-br/marketplace/produtos/hagsxd-a-mulher-que-ele-nunca-esquece-6igil/F106278418L'
      },
      frases: {
        nome: '100 Frases que Conectam',
        tipo: 'E-book',
        texto: 'Frases testadas que transformam cada mensagem numa oportunidade real de conexão.',
        href: 'https://greissidematos.my.canva.site/ebook100frases'
      },
      atracao: {
        nome: 'Atração Natural',
        tipo: 'E-book',
        texto: 'Presença, energia e a forma como você se apresenta antes mesmo de dizer qualquer palavra.',
        href: 'https://hotmart.com/pt-br/marketplace/produtos/atracao-natural/A101321374E'
      },
      desapego: {
        nome: 'A Arte do Desapego',
        tipo: 'E-book',
        texto: 'Exercícios práticos para reconstruir a autoestima e conquistar autonomia emocional.',
        href: 'https://hotmart.com/pt-br/marketplace/produtos/hagsxd-a-arte-do-desapego-083m2/M102455467L'
      },
      bloqueios: {
        nome: 'Bloqueios Mentais',
        tipo: 'E-book',
        texto: 'Identifique com clareza o que trava a sua prosperidade e desfaça um bloqueio de cada vez.',
        href: 'https://hotmart.com/pt-br/marketplace/produtos/bloqueios-mentais-identifique-os-e-liberte-se-deles/P92382211X'
      },
      desafio: {
        nome: 'Desafio 21 Dias',
        tipo: 'Programa',
        texto: 'Missões diárias de inteligência emocional para instalar hábitos novos e colher resultados novos.',
        href: 'https://hotmart.com/pt-br/marketplace/produtos/hagsxd-desafio-21-dias-k5nv6/M91534646P'
      },
      escolhida: {
        nome: 'Pare de Rastejar, Seja Escolhida',
        tipo: 'Consultoria em grupo',
        texto: 'Dois meses de aulas ao vivo para resgatar valor, comunicação e posicionamento.',
        wa: 'Olá Greissi! Fiz o quiz no site e o resultado indicou a consultoria Pare de Rastejar, Seja Escolhida.'
      },
      reconquista: {
        nome: 'Jornada da Reconquista',
        tipo: 'Consultoria individual',
        texto: 'Duas sessões individuais para entender o que aconteceu e se reposicionar com clareza.',
        href: 'https://greissidematos.my.canva.site/jornada-da-reconquista-'
      },
      imersao: {
        nome: 'Ame-se Para Ser Amada',
        tipo: 'Imersão de 2 dias',
        texto: 'Um intensivo para reencontrar o que você sente e precisa, além das vozes externas.',
        wa: 'Olá Greissi! Fiz o quiz no site e o resultado indicou a imersão Ame-se Para Ser Amada.'
      }
    };

    const questions = [...quiz.querySelectorAll('.quiz__step')];
    const resultBox = quiz.querySelector('.quiz__result');
    const bar = quiz.querySelector('.quiz__bar span');
    const counter = quiz.querySelector('.quiz__count');
    const scores = {};
    let step = 0;

    const show = i => {
      questions.forEach((q, n) => q.classList.toggle('is-current', n === i));
      bar.style.width = ((i / questions.length) * 100) + '%';
      counter.textContent = `${Math.min(i + 1, questions.length)} de ${questions.length}`;
    };

    const finish = () => {
      const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const [first, second] = ranked.map(([k]) => CATALOGO[k]).filter(Boolean);
      const linkOf = p => p.wa
        ? `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(p.wa)}`
        : p.href;

      resultBox.innerHTML = `
        <p class="eyebrow">O seu ponto de partida</p>
        <h3>${first.nome}</h3>
        <p class="quiz__type">${first.tipo}</p>
        <p>${first.texto}</p>
        <a class="btn" href="${linkOf(first)}" target="_blank" rel="noopener">Quero começar por aqui</a>
        ${second ? `<p class="quiz__also">Também combina com você: <a href="${linkOf(second)}" target="_blank" rel="noopener">${second.nome}</a></p>` : ''}
        <button class="quiz__again" type="button">Refazer o quiz</button>`;

      questions.forEach(q => q.classList.remove('is-current'));
      resultBox.hidden = false;
      resultBox.classList.add('is-current');
      bar.style.width = '100%';
      counter.textContent = 'resultado';
      resultBox.querySelector('.quiz__again').addEventListener('click', () => {
        Object.keys(scores).forEach(k => delete scores[k]);
        step = 0;
        resultBox.hidden = true;
        resultBox.classList.remove('is-current');
        show(0);
      });
    };

    quiz.querySelectorAll('.quiz__opt').forEach(opt => {
      opt.addEventListener('click', () => {
        opt.dataset.score.split(',').forEach(pair => {
          const [key, val] = pair.split(':');
          scores[key] = (scores[key] || 0) + Number(val);
        });
        step++;
        if (step >= questions.length) finish();
        else show(step);
      });
    });

    show(0);
  }

  /* ---- dores: a visitante marca o que reconhece ---- */
  const pains = [...document.querySelectorAll('.pain')];
  const echo = document.getElementById('painsEcho');
  if (pains.length && echo) {
    const score = echo.querySelector('.pains__score b');
    const msg = echo.querySelector('.pains__msg');
    const RESPOSTAS = [
      '',
      'Um já é o bastante para valer a pena olhar com atenção.',
      'Dois padrões reconhecidos. Reconhecer é sempre o primeiro passo.',
      'Três. Não é coincidência, é padrão — e padrão se reescreve.',
      'Quatro. Você está carregando mais do que deveria sozinha.',
      'Cinco. Nada disso é falta de amor: é excesso dele, no endereço errado.',
      'Todas. E, se dói ler, é porque alguma parte de você já sabe que é hora.'
    ];

    pains.forEach(btn => {
      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
        btn.classList.toggle('is-on', !on);

        const n = pains.filter(b => b.classList.contains('is-on')).length;
        echo.hidden = n === 0;
        if (!n) return;
        score.textContent = n;
        msg.textContent = RESPOSTAS[n];
        if (!on) {
          const r = btn.getBoundingClientRect();
          soprar(r.left + r.width * 0.12, r.top + r.height * 0.5);
        }
      });
    });
  }

  /* ---- botões magnéticos ---- */
  if (fine && !reduced) {
    document.querySelectorAll('.btn, .wa-float').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = `translate(${(dx * 8).toFixed(1)}px, ${(dy * 5).toFixed(1)}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }
})();
