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

  /* ---- scroll suave ---- */
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ duration: 1.12, smoothWheel: true, touchMultiplier: 1.6 });
    document.documentElement.style.scrollBehavior = 'auto';
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
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

  /* ---- cena da janela: planta o canteiro ---- */
  const SVG_NS = 'http://www.w3.org/2000/svg';
  // x na jardineira, altura da haste, escala da flor, variação de cor
  const PLANTIO = [
    [ 92, 118, .96, 'deep'], [126, 156, 1.08, ''],
    [158,  96, .84, 'pale'], [196, 178, 1.16, ''],
    [232, 110, .9,  'pale'], [266, 146, 1.02, 'deep'],
    [300,  88, .8,  ''    ], [334, 128, .98, 'pale'],
  ];
  const canteiro = document.getElementById('stalks');

  if (canteiro) {
    PLANTIO.forEach(([x, h, sc, variante], i) => {
      const g = document.createElementNS(SVG_NS, 'g');
      g.setAttribute('class', 'stalk' + (variante ? ' stalk--' + variante : ''));
      g.style.setProperty('--x', x + 'px');
      g.style.setProperty('--y', '116px');

      const curva = (i % 2 ? 1 : -1) * (6 + (i % 3) * 4);
      const stem = document.createElementNS(SVG_NS, 'path');
      stem.setAttribute('class', 'stem');
      stem.setAttribute('d', `M0 0 C${curva} ${-h * .4} ${curva * 1.4} ${-h * .7} 0 ${-h}`);
      g.appendChild(stem);

      const fy = -h * .45;
      const lado = i % 2 ? 1 : -1;
      const folha = document.createElementNS(SVG_NS, 'path');
      folha.setAttribute('class', 'leaf');
      folha.setAttribute('d', `M0 ${fy} C${14 * lado} ${fy - 4} ${22 * lado} ${fy - 13} ${24 * lado} ${fy - 22} C${11 * lado} ${fy - 19} ${2 * lado} ${fy - 9} 0 ${fy}Z`);
      g.appendChild(folha);

      const cabeca = document.createElementNS(SVG_NS, 'g');
      cabeca.setAttribute('transform', `translate(0 ${-h}) scale(${sc})`);
      for (let a = 0; a < 6; a++) {
        const p = document.createElementNS(SVG_NS, 'ellipse');
        p.setAttribute('class', 'pet');
        p.setAttribute('cy', '-7.5');
        p.setAttribute('rx', '4.6');
        p.setAttribute('ry', '8.4');
        p.setAttribute('transform', `rotate(${a * 60})`);
        cabeca.appendChild(p);
      }
      const miolo = document.createElementNS(SVG_NS, 'circle');
      miolo.setAttribute('class', 'core');
      miolo.setAttribute('r', '3.1');
      cabeca.appendChild(miolo);
      g.appendChild(cabeca);

      canteiro.appendChild(g);
    });
  }

  /* ---- motor do vento ----
     Precisa vir depois do plantio: as flores do canteiro são criadas por JS
     acima, e um querySelectorAll('.stalk') rodado antes delas existirem no
     DOM as deixa de fora do vento para sempre — foi exatamente o bug que
     fazia o canteiro parecer estático. */
  const windEls = [...document.querySelectorAll('.js-wind, .stalk')].map((el, i) => ({
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

  /* ---- cena da janela: profundidade e respiro da foto ---- */
  const cena = document.getElementById('scene');
  const camadasCena = cena ? [...cena.querySelectorAll('[data-depth]')] : [];
  const heroPhoto = document.getElementById('heroPhoto');
  // a altura da cena só muda em resize; guardá-la evita medir o layout a
  // cada quadro — mas .top é lido fresco em pintarCena(), a cada chamada,
  // porque essa parte muda a cada scroll
  let alturaCena = 0;
  const medirCena = () => { if (cena) alturaCena = cena.getBoundingClientRect().height; };
  if (cena) { medirCena(); addEventListener('resize', medirCena, { passive: true }); }

  // a foto emerge em vez de simplesmente estar lá
  if (heroPhoto && !reduced) {
    heroPhoto.style.transition = 'opacity 1.1s ease-out, filter 1.1s ease-out, transform 1.1s ease-out';
    heroPhoto.style.opacity = '0';
    heroPhoto.style.filter = 'blur(10px)';
    heroPhoto.style.transform = 'scale(1.06)';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      heroPhoto.style.opacity = '1';
      heroPhoto.style.filter = 'blur(0px)';
      heroPhoto.style.transform = 'scale(1.015)';
    }));
  }

  const pintarCena = () => {
    if (!cena || reduced) return;
    const topoCena = cena.getBoundingClientRect().top;
    // 0 no topo da página, 1 quando a cena já saiu de vista rolando para baixo
    const p = clamp(-topoCena / (alturaCena || 1), 0, 1.6);
    for (const l of camadasCena) {
      const d = Number(l.dataset.depth) * (innerWidth < 700 ? .65 : 1);
      l.style.transform = `translate3d(0, ${(p * d).toFixed(1)}px, 0)`;
    }
    if (heroPhoto) heroPhoto.style.transform = `scale(${(1.015 + p * 0.02).toFixed(3)})`;
  };

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


  /* ---- pétalas que caem, se acumulam e são recolhidas pelo rastelo ----
     Tudo aqui roda no requestAnimationFrame já existente, sem depender de
     nenhuma biblioteca externa: é a mesma tática do motor de vento e do
     buquê, que já funcionam de forma comprovada no site publicado. ---- */
  const zona = document.getElementById('fallzone');
  const campoQueda = document.getElementById('fallPetals');
  const rastelo = document.getElementById('rake');
  const doresEl = document.getElementById('dores');
  const caidas = [];
  let chaoY = 0, larguraZona = 0, nascidas = 0;
  let faseRastelo = 'esperando'; // esperando → varrendo → assentando → escondendo → fim
  let rakeInfo = null;
  const TOTAL_QUEDA = innerWidth < 700 ? 14 : 24;
  const easeDentroFora = k => (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
  const easeFora = k => 1 - (1 - k) ** 3;

  const listaPains = document.querySelector('.pains');

  const medirZona = () => {
    if (!zona) return;
    const r = zona.getBoundingClientRect();
    larguraZona = r.width;
    // O chão acompanha o fim da lista, não o fim da seção. A caixa de resposta
    // aparece embaixo quando a visitante marca um padrão e faz a seção crescer;
    // preso à altura total, o rastelo varreria por dentro dela, bem onde a
    // pessoa está lendo. A diferença entre os dois rects é imune ao scroll,
    // porque ambos deslocam junto.
    const lista = listaPains?.getBoundingClientRect();
    chaoY = lista ? lista.bottom - r.top + 26 : r.height - 34;
  };
  if (zona) {
    medirZona();
    addEventListener('resize', medirZona, { passive: true });
    // os reveals entram com translateY; remedir depois deles assentarem
    addEventListener('load', () => setTimeout(medirZona, 1200));
  }

  const nascerPetala = () => {
    if (!campoQueda) return;
    const el = document.createElement('span');
    const tom = Math.random();
    el.className = 'fallpetal' + (tom > .7 ? ' fallpetal--pale' : tom < .25 ? ' fallpetal--deep' : '');
    campoQueda.appendChild(el);
    caidas.push({
      el,
      // caem numa faixa estreita da lateral direita, longe da coluna de texto
      x: larguraZona * (0.62 + Math.random() * 0.33),
      y: -30 - Math.random() * 60,
      vy: 1.5 + Math.random() * 1.1,
      deriva: (Math.random() - 0.5) * 0.7,
      rot: Math.random() * 360,
      giro: (Math.random() - 0.5) * 2.4,
      pousada: false
    });
  };

  // uma pessoa varrendo não desliza o rastelo em linha reta: ela alcança,
  // puxa com força (acelera e desacelera), solta, alcança de novo. Isso vira
  // uma sequência de golpes — cada um com sua própria curva de tempo — em vez
  // de um único deslocamento linear.
  const dispararRastelo = () => {
    faseRastelo = 'varrendo';
    const pilha = larguraZona * 0.56;
    const xFinal = pilha - 30;
    const xInicio = larguraZona + 40;
    const N = 3;
    const passo = (xInicio - xFinal) / N;

    const golpes = [];
    let cursor = xInicio;
    for (let i = 0; i < N; i++) {
      if (i > 0) {
        // reposiciona um pouco à direita antes do próximo puxão — o rastelo
        // "solta" o chão aqui, por isso não arrasta pétalas nesta parte
        const alcance = cursor + passo * 0.32;
        golpes.push({ tipo: 'alcance', de: cursor, ate: alcance, dur: 260 });
        cursor = alcance;
      }
      const alvo = i === N - 1 ? xFinal : cursor - passo;
      golpes.push({ tipo: 'puxada', de: cursor, ate: alvo, dur: 560 });
      cursor = alvo;
    }

    rakeInfo = { inicio: performance.now(), tGolpe: 0, indice: 0, golpes, pilha, comecou: false };
    if (rastelo) {
      rastelo.style.opacity = '1';
      rastelo.style.transform = `translate3d(${xInicio}px, 8px, 0) rotate(6deg)`;
    }
    // o que ainda estiver no ar desce depressa, para o rastelo não varrer
    // um chão pela metade
    caidas.forEach(p => { if (!p.pousada) p.vy = Math.max(p.vy, 6); });
  };

  const atualizarRastelo = () => {
    if (!rastelo || !rakeInfo) return;
    const agora = performance.now();

    if (faseRastelo === 'varrendo') {
      const ATRASO = 480;
      if (!rakeInfo.comecou) {
        if (agora - rakeInfo.inicio < ATRASO) return;
        rakeInfo.comecou = true;
        rakeInfo.tGolpe = agora;
      }

      const golpe = rakeInfo.golpes[rakeInfo.indice];
      if (!golpe) {
        faseRastelo = 'assentando';
        rakeInfo.assentarInicio = agora;
        caidas.filter(p => p.pousada).forEach((p, i) => {
          p.origX = p.x; p.origY = p.y;
          p.alvoX = rakeInfo.pilha + (Math.random() - 0.5) * 70;
          p.alvoY = chaoY - Math.floor(i / 5) * 6;
        });
        return;
      }

      const k = clamp((agora - rakeInfo.tGolpe) / golpe.dur, 0, 1);
      const puxando = golpe.tipo === 'puxada';
      const ek = puxando ? easeFora(k) : easeDentroFora(k);
      const rx = golpe.de + (golpe.ate - golpe.de) * ek;

      // durante a puxada o rastelo inclina para trás e afunda no chão;
      // durante o alcance ele se ergue e inclina para frente, como um pulso
      const rot = puxando ? -7 + 5 * (1 - ek) : 11 - 5 * ek;
      const y = puxando ? 2 + 7 * ek : 9 - 7 * ek;
      rastelo.style.transform = `translate3d(${rx.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;

      if (puxando) {
        for (const p of caidas) {
          if (p.pousada && p.x > rx && p.x < rx + 150) {
            p.x += (rx + 40 - p.x) * 0.1;
            p.rot += 1.6;
            p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
          }
        }
      }

      if (k >= 1) { rakeInfo.indice++; rakeInfo.tGolpe = agora; }
    } else if (faseRastelo === 'assentando') {
      const DURACAO = 700;
      const k = clamp((agora - rakeInfo.assentarInicio) / DURACAO, 0, 1);
      const ek = easeFora(k);
      for (const p of caidas) {
        if (!p.pousada || p.alvoX == null) continue;
        p.x = p.origX + (p.alvoX - p.origX) * ek;
        p.y = p.origY + (p.alvoY - p.origY) * ek;
        p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
      }
      if (k >= 1) { faseRastelo = 'escondendo'; rakeInfo.esconderInicio = agora; }
    } else if (faseRastelo === 'escondendo') {
      const ATRASO = 500, DURACAO = 1100;
      const passado = agora - rakeInfo.esconderInicio;
      if (passado < ATRASO) return;
      const k = clamp((passado - ATRASO) / DURACAO, 0, 1);
      rastelo.style.opacity = String(1 - k);
      rastelo.style.transform = `translate3d(${(rakeInfo.pilha - 30 - 90 * k).toFixed(1)}px, 8px, 0)`;
      if (k >= 1) faseRastelo = 'fim';
    }
  };

  const passoQueda = () => {
    if (!zona || !doresEl || reduced) return;

    for (const p of caidas) {
      if (p.pousada) continue;
      p.y += p.vy;
      p.x += p.deriva + Math.sin(p.y / 46) * 0.55;
      p.rot += p.giro;
      if (p.y >= chaoY) { p.y = chaoY; p.pousada = true; p.rot = 80 + Math.random() * 20; }
      p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
    }

    if (faseRastelo === 'esperando') {
      const r = doresEl.getBoundingClientRect();
      const inicioViewport = innerHeight * .85;
      const fimViewport = innerHeight * .60;
      // distância de scroll entre "o topo entra a 85% da tela" e
      // "a base sai a 60%": a mesma janela que o ScrollTrigger usava
      const distancia = r.height + inicioViewport - fimViewport;
      const progresso = clamp((inicioViewport - r.top) / distancia, 0, 1);
      const alvo = Math.round(progresso * TOTAL_QUEDA);
      while (nascidas < alvo) { nascerPetala(); nascidas++; }

      if (r.bottom <= innerHeight * .62) dispararRastelo();
    } else {
      atualizarRastelo();
    }
  };

  /* ---- pétalas à deriva na jornada ----
     Só travessia: nascem acima, cruzam a faixa e reiniciam. Sem pouso e sem
     rastelo, que ficam sendo o momento exclusivo das dores. */
  const deriva = document.getElementById('driftzone');
  const derivando = [];

  if (deriva && !reduced) {
    const QTD = innerWidth < 700 ? 7 : 13;
    for (let i = 0; i < QTD; i++) {
      const el = document.createElement('span');
      const tom = Math.random();
      el.className = 'driftpetal' + (tom > .72 ? ' driftpetal--cream' : tom < .3 ? ' driftpetal--pale' : '');
      deriva.appendChild(el);
      derivando.push({
        el,
        x: Math.random(),                        // fração da largura
        y: Math.random(),                        // fração da altura
        vy: .00035 + Math.random() * .0005,      // em frações por quadro
        vx: (Math.random() - .5) * .0004,
        rot: Math.random() * 360,
        giro: (Math.random() - .5) * 1.4
      });
    }
  }

  let caixaDeriva = null;
  const medirDeriva = () => { if (deriva) caixaDeriva = deriva.getBoundingClientRect(); };
  if (deriva) { medirDeriva(); addEventListener('resize', medirDeriva, { passive: true }); }

  const moverDeriva = kick => {
    if (!derivando.length || !caixaDeriva) return;
    const { width: w, height: h } = caixaDeriva;
    for (const p of derivando) {
      p.y += p.vy + kick * .00022;
      p.x += p.vx + Math.sin(p.y * 7 + p.rot) * .00025;
      p.rot += p.giro + kick * .05;
      if (p.y > 1.08) { p.y = -.1; p.x = Math.random(); }
      if (p.y < -.2) p.y = 1.05;
      if (p.x > 1.05) p.x = -.03;
      if (p.x < -.05) p.x = 1.03;
      p.el.style.transform =
        `translate3d(${(p.x * w).toFixed(1)}px, ${(p.y * h).toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
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

    }

    posy?.classList.toggle('is-visible', scrollY > innerHeight * 0.55);
    moverPetalas(kick);
    pintarJornada();
    pintarCena();
    moverDeriva(kick);
    passoQueda();
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
