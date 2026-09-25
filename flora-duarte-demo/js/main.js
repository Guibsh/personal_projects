/* =========================================================
   SITE DEMONSTRATIVO
   Os botões da Flora (compra, WhatsApp, Instagram) não levam a lugar
   nenhum de verdade: abrem a janela #demo, que explica o que o botão faria
   num site real. Os contatos reais (do Guilherme) estão escritos direto no
   index.html, na seção #bastidores e na janela #demo.
   ========================================================= */

(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // o que a visita fez, para a cena pós-créditos contar de volta
  const visita = { compras: 0, conversas: 0, quiz: false };

  /* ---- botões da demonstração ----
     href para uma âncora que não existe: o link fica focável no teclado, o
     scroll suave abaixo ignora (não acha o alvo) e o clique é tratado aqui. */
  document.querySelectorAll('a[data-demo]').forEach(el => el.setAttribute('href', '#demonstracao'));

  const demo = document.getElementById('demo');
  const DEMO = {
    checkout: {
      titulo: 'Aqui entraria o checkout',
      texto: p => `Esta é uma página de demonstração. No seu site, este botão leva direto para o pagamento${p ? ` de <b>${p}</b>` : ''}, na Hotmart, na Kiwify ou na plataforma que você já usa.`
    },
    whatsapp: {
      titulo: 'Aqui abriria o WhatsApp da Flora',
      texto: () => 'Esta é uma página de demonstração. No seu site, este botão abre a conversa com você e a mensagem já chega escrita. A cliente só aperta enviar:'
    },
    instagram: {
      titulo: 'Aqui abriria o Instagram da Flora',
      texto: () => 'Esta é uma página de demonstração. No seu site, este botão leva direto para o seu perfil.'
    }
  };

  const abrirDemo = el => {
    const tipo = DEMO[el.dataset.demo] ? el.dataset.demo : 'checkout';
    if (tipo === 'checkout') visita.compras++;
    if (tipo === 'whatsapp') visita.conversas++;
    if (!demo || typeof demo.showModal !== 'function') return;
    demo.querySelector('#demoTitle').textContent = DEMO[tipo].titulo;
    demo.querySelector('#demoText').innerHTML = DEMO[tipo].texto(el.dataset.produto);
    const msg = demo.querySelector('#demoMsg');
    msg.hidden = !(tipo === 'whatsapp' && el.dataset.msg);
    msg.textContent = el.dataset.msg || '';
    demo.showModal();
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-demo]');
    if (!el) return;
    e.preventDefault();
    abrirDemo(el);
  });

  if (demo) {
    // clique no fundo escurecido fecha, como qualquer janela do tipo
    demo.addEventListener('click', e => { if (e.target === demo) demo.close(); });
    // fecha ANTES de rolar: ao fechar, a janela devolve o foco ao botão que a
    // abriu, e se isso acontecesse no meio da rolagem ela parava no caminho
    demo.querySelector('.demo__who')?.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();
      demo.close();
      const alvo = document.getElementById('bastidores');
      // posição absoluta, lida depois do fechamento: o Lenis ainda não viu o
      // scroll que a devolução de foco pode ter causado, e calcular a partir
      // do elemento usaria a posição velha dele
      requestAnimationFrame(() => {
        const y = alvo.getBoundingClientRect().top + scrollY;
        if (lenis) lenis.scrollTo(y); else scrollTo(0, y);
      });
    });
  }

  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---- scroll suave ---- */
  let lenis = null;
  if (!reduced && window.Lenis) {
    lenis = new Lenis({ duration: 1.12, smoothWheel: true, touchMultiplier: 1.6 });
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
  // na cena pós-créditos o botão flutuante da Flora sai: ali os botões são
  // os de quem fez a página, e dois "fale comigo" diferentes confundiriam
  let creditosNaTela = false;
  const onScroll = () => {
    const y = scrollY;
    velocity += (y - lastY);
    lastY = y;
    nav.classList.toggle('is-stuck', y > 40);
    waFloat.classList.toggle('is-visible', y > innerHeight * 0.7 && !creditosNaTela);
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
  const flores = [];

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
      // guardado para a abelha: a base da haste e o comprimento dela bastam
      // para recalcular onde a flor está a cada quadro, já com o vento
      flores.push({ el: g, bx: x, by: 116, h, vento: null });
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
    speed: 0.52 + (i % 3) * 0.09,
    current: 0,
    box: null
  }));

  // liga cada flor ao seu registro de vento: a abelha precisa saber para onde
  // a flor balançou antes de mirar nela, senão pousa no lugar de um quadro atrás
  flores.forEach(f => { f.vento = windEls.find(w => w.el === f.el) || null; });

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

  /* ---- abelhinha ----
     Voa entre as flores do canteiro e, de tempos em tempos, pousa numa delas
     como se recolhesse pólen. É toda em coordenadas do viewBox do canteiro
     (430x210), então acompanha a cena em qualquer largura sem conta extra.

     O voo não é uma interpolação de A para B: é direção + amortecimento. Ela
     acelera na direção do alvo, perde velocidade sozinha e ainda leva um
     tremido de seno por cima — que é o que tira a cara de objeto animado e
     dá a de bicho. */
  const abelha = document.getElementById('bee');
  let voo = null;

  if (abelha && flores.length && !reduced) {
    // onde a flor está AGORA: a haste gira em torno da base com o vento, então
    // a cabeça descreve um arco de raio h em volta de (bx, by)
    const cabecaDaFlor = f => {
      const ang = (f.vento ? f.vento.current : 0) * Math.PI / 180;
      return { x: f.bx + Math.sin(ang) * f.h, y: f.by - Math.cos(ang) * f.h };
    };

    voo = {
      x: flores[0].bx, y: 40,
      vx: 0, vy: 0,
      dir: 1,
      fase: 'voando',        // voando → descendo → pousada
      alvo: null,            // flor de destino, ou null para um ponto no ar
      ar: null,              // ponto solto quando ela só está passeando
      ate: 0,                // quando a fase atual acaba
      voltas: 0              // voos soltos antes de procurar outra flor
    };

    const escolherDestino = agora => {
      // duas em cada três vezes ela vai para uma flor; a outra é só um giro no
      // ar, para não virar um metrônomo de flor em flor
      if (voo.voltas > 0 || Math.random() < .34) {
        voo.voltas = Math.max(0, voo.voltas - 1);
        voo.alvo = null;
        voo.ar = { x: 60 + Math.random() * 310, y: -30 + Math.random() * 90 };
      } else {
        voo.voltas = Math.random() < .5 ? 1 : 0;
        voo.ar = null;
        let f = flores[(Math.random() * flores.length) | 0];
        // não repete a flor de onde acabou de sair
        if (f === voo.ultima && flores.length > 1) {
          f = flores[(flores.indexOf(f) + 1 + ((Math.random() * (flores.length - 1)) | 0)) % flores.length];
        }
        voo.alvo = f;
      }
      voo.fase = 'voando';
      voo.ate = agora + 2600 + Math.random() * 2600;
    };

    escolherDestino(0);

    const moverAbelha = agora => {
      const alvoPos = voo.alvo ? cabecaDaFlor(voo.alvo) : voo.ar;
      const dx = alvoPos.x - voo.x, dy = alvoPos.y - voo.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (voo.fase === 'pousada') {
        // colada na flor: acompanha o balanço dela e faz um bico de leve,
        // como quem cutuca o miolo atrás do pólen
        const p = cabecaDaFlor(voo.alvo);
        voo.x = p.x + Math.sin(agora / 520) * 1.1;
        voo.y = p.y - 4.4 + Math.sin(agora / 300) * .9;
        if (agora > voo.ate) {
          abelha.classList.remove('is-still');
          voo.ultima = voo.alvo;
          voo.vy = -1.1;
          escolherDestino(agora);
        }
      } else if (voo.fase === 'descendo') {
        // a aproximação final é direta e lenta — steering aqui faria ela
        // orbitar a flor sem nunca encostar
        voo.x += dx * .09;
        voo.y += (dy - 4.4) * .09;
        if (dist < 6) {
          voo.fase = 'pousada';
          voo.ate = agora + 2200 + Math.random() * 3200;
          voo.vx = voo.vy = 0;
          abelha.classList.add('is-still');
        }
      } else {
        // aceleração na direção do alvo, teto de velocidade e atrito:
        // ela nunca chega em linha reta, sempre num arco
        const acc = .05;
        voo.vx += (dx / dist) * acc * Math.min(dist, 60) / 18;
        voo.vy += (dy / dist) * acc * Math.min(dist, 60) / 18;
        voo.vx += Math.sin(agora / 240 + voo.y) * .05;
        voo.vy += Math.cos(agora / 190 + voo.x) * .05;
        voo.vx *= .935; voo.vy *= .935;
        const v = Math.hypot(voo.vx, voo.vy);
        const MAX = 1.5;
        if (v > MAX) { voo.vx = voo.vx / v * MAX; voo.vy = voo.vy / v * MAX; }
        voo.x += voo.vx; voo.y += voo.vy;

        if (voo.alvo && dist < 30) voo.fase = 'descendo';
        else if (!voo.alvo && (dist < 16 || agora > voo.ate)) escolherDestino(agora);
        else if (agora > voo.ate + 3000) escolherDestino(agora);
      }

      // vira para o lado do deslocamento, com um limiar para não piscar de
      // frente para trás quando a velocidade horizontal passa perto de zero
      if (voo.vx > .28) voo.dir = 1;
      else if (voo.vx < -.28) voo.dir = -1;

      const inclina = clamp(voo.vy * 7, -16, 16) * voo.dir;
      abelha.setAttribute('transform',
        `translate(${voo.x.toFixed(2)} ${voo.y.toFixed(2)}) scale(${(1.5 * voo.dir).toFixed(3)} 1.5) rotate(${inclina.toFixed(1)})`);
    };

    voo.mover = moverAbelha;
    setTimeout(() => abelha.classList.add('is-live'), 1400);
  }

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

  // Pulo para a cena pós-créditos: a rolagem animada atravessa todas as
  // seções em um segundo e abriria o buquê inteiro de graça. Durante o pulo
  // as flores não abrem; ficam esperando a visitante passar de verdade.
  let pulando = false;
  let fimPulo = 0;
  const pular = ms => {
    pulando = true;
    clearTimeout(fimPulo);
    fimPulo = setTimeout(() => { pulando = false; }, ms);
  };
  document.addEventListener('click', e => {
    if (!e.target.closest('a[href="#bastidores"]')) return;
    if (colhidas < PONTAS.length) visita.pulou = true;
    pular(2600);
  }, true);

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
        if (!e.isIntersecting || pulando) return;
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
  let faseRastelo = 'esperando'; // esperando → varrendo → assentando → parado
  let tPousio = 0;               // quando a última pétala pousou
  let rakeInfo = null;
  const TOTAL_QUEDA = innerWidth < 700 ? 14 : 24;
  const easeDentroFora = k => (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2);
  const easeFora = k => 1 - (1 - k) ** 3;

  const listaPains = document.querySelector('.pains');
  const caixaEcho = document.getElementById('painsEcho');

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
    // Com a caixa branca aberta, a linha desce para dentro dela: as pétalas
    // pousam por cima do branco e o rastelo varre nessa mesma linha. É por
    // isso que a .fallzone subiu para z-index 2 — sem isso, tudo passaria
    // por trás da caixa.
    const caixa = caixaEcho && !caixaEcho.hidden ? caixaEcho.getBoundingClientRect() : null;
    // A linha é a FAIXA DE CIMA da caixa, não a de baixo: ali a caixa é só
    // branco (o "2 de 6" é curto e fica à esquerda do monte), e o cabo do
    // rastelo sobe para o vão acima dela. Pela borda de baixo, no celular,
    // o rastelo pousava em cima do botão e comia o texto dele.
    chaoY = caixa ? caixa.top - r.top + 16
          : lista ? lista.bottom - r.top + 26
          : r.height - 34;
  };
  if (zona) {
    medirZona();
    addEventListener('resize', medirZona, { passive: true });
    // os reveals entram com translateY; remedir depois deles assentarem
    addEventListener('load', () => setTimeout(medirZona, 1200));
  }

  const nascerPetala = () => {
    if (!campoQueda) return;
    // cada nova varrida traz pétalas novas; sem teto, marcar e desmarcar a
    // lista várias vezes encheria a seção
    while (caidas.length > 58) { const v = caidas.shift(); v.el.remove(); }
    const el = document.createElement('span');
    const tom = Math.random();
    el.className = 'fallpetal' + (tom > .7 ? ' fallpetal--pale' : tom < .25 ? ' fallpetal--deep' : '');
    campoQueda.appendChild(el);
    caidas.push({
      el,
      // faixa da direita, alinhada com o trecho que o rastelo varre
      x: larguraZona * (0.56 + Math.random() * 0.30),
      y: -30 - Math.random() * 60,
      // a terça parte da velocidade anterior: pétala não despenca, ela
      // desce planando. É a diferença entre cair e pousar.
      vy: 0.82 + Math.random() * 0.5,
      deriva: (Math.random() - 0.5) * 0.4,
      rot: Math.random() * 360,
      giro: (Math.random() - 0.5) * 1.1,
      pousada: false
    });
  };

  // uma pessoa varrendo não desliza o rastelo em linha reta: ela alcança,
  // puxa com força (acelera e desacelera), solta, alcança de novo. Isso vira
  // uma sequência de golpes — cada um com sua própria curva de tempo — em vez
  // de um único deslocamento linear.
  const dispararRastelo = (retomando = false) => {
    faseRastelo = 'varrendo';
    // DIREÇÃO. No desenho a cabeça fica à esquerda e o cabo sobe para a
    // direita — ou seja, quem segura está do lado direito. Varrendo para a
    // ESQUERDA a cabeça ia na frente do cabo: o rastelo entrava empurrando,
    // que era exatamente o defeito. Varrendo para a DIREITA a cabeça vem
    // atrás do cabo, como vassoura puxada na direção de quem varre.
    const larg = rastelo?.offsetWidth || 150;
    const cx = larg * (64 / 150);    // centro da cabeça dentro do elemento
    const meia = larg * (48 / 150);  // meia largura da cabeça
    const xFinal = larguraZona * (larguraZona < 620 ? 0.80 : 0.82) - cx;
    const xInicio = larguraZona * 0.50 - cx;
    const centroPilha = xFinal + cx + meia * 0.55;
    const N = 4;
    const passo = (xFinal - xInicio) / N;

    const golpes = [];
    let cursor = xInicio;
    if (retomando && rakeInfo) {
      // ficou encostado no monte da vez anterior: ergue e caminha de volta ao
      // começo, de dentes no ar, em vez de teleportar
      golpes.push({ tipo: 'volta', de: rakeInfo.xFinal, ate: xInicio, dur: 1150 });
    }
    for (let i = 0; i < N; i++) {
      if (i > 0) {
        // entre uma varrida e outra a vassoura recua um pouco, erguida — é
        // esse recuo que faz o gesto parecer repetido por uma pessoa, e não
        // um único deslize contínuo. Erguida, não arrasta o que já juntou.
        const recuo = cursor - passo * 0.30;
        golpes.push({ tipo: 'recuo', de: cursor, ate: recuo, dur: 420 });
        cursor = recuo;
      }
      const alvo = i === N - 1 ? xFinal : cursor + passo;
      golpes.push({ tipo: 'varre', de: cursor, ate: alvo, dur: 820 });
      cursor = alvo;
    }

    // o Y do rastelo sai do mesmo chão das pétalas: a ponta dos dentes está
    // a ~131/150 da altura do SVG, então o topo do elemento sobe essa medida
    const baseY = chaoY - (rastelo?.offsetHeight || 150) * (131 / 150);

    rakeInfo = { inicio: performance.now(), tGolpe: 0, indice: 0, golpes,
                 centroPilha, xFinal, cx, meia, baseY, comecou: false };
    if (rastelo) {
      rastelo.style.opacity = '1';
      rastelo.style.transform = `translate3d(${xInicio.toFixed(1)}px, ${(baseY + 8).toFixed(1)}px, 0) rotate(8deg)`;
    }
    // o que ainda estiver no ar desce depressa, para o rastelo não varrer
    // um chão pela metade
    caidas.forEach(p => { if (!p.pousada) p.vy = Math.max(p.vy, 2.1); });
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
          p.alvoX = rakeInfo.centroPilha + (Math.random() - 0.5) * 58;
          p.alvoY = chaoY - Math.floor(i / 5) * 6;
        });
        return;
      }

      const k = clamp((agora - rakeInfo.tGolpe) / golpe.dur, 0, 1);
      const varrendo = golpe.tipo === 'varre';
      const voltando = golpe.tipo === 'volta';
      // easeDentroFora em tudo: sai devagar, ganha corpo no meio, encosta
      // macio no fim. É a curva do braço de quem varre sem pressa.
      const ek = easeDentroFora(k);
      const rx = golpe.de + (golpe.ate - golpe.de) * ek;

      // varrendo, a vassoura apoia no chão e o cabo passa de recostado para
      // inclinado à frente; recuando ela se ergue; na volta fica no ar o
      // caminho todo, num arco de seno.
      const rot = voltando ? 20 - 4 * Math.sin(Math.PI * k)
                : varrendo ? 8 - 15 * ek
                : 12 - 4 * ek;
      const y = rakeInfo.baseY + (voltando ? -13 - 9 * Math.sin(Math.PI * k)
                                : varrendo ? 2 + 6 * ek
                                : 6 - 9 * ek);
      rastelo.style.transform = `translate3d(${rx.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg)`;

      if (varrendo) {
        // as pétalas que a cabeça alcança seguem junto, encostadas na face
        // dos dentes — é o acúmulo acontecendo durante a varrida, não só no
        // assentamento do fim
        const cab = rx + rakeInfo.cx;
        const frente = cab + rakeInfo.meia - 8;
        for (const p of caidas) {
          if (!p.pousada) continue;
          if (p.x > cab - rakeInfo.meia - 18 && p.x < frente + 12) {
            // 0.07: a pétala cede devagar, não gruda no rastelo
            p.x += (frente - p.x) * 0.07;
            p.rot += 0.8;
            p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
          }
        }
      }

      if (k >= 1) { rakeInfo.indice++; rakeInfo.tGolpe = agora; }
    } else if (faseRastelo === 'assentando') {
      const DURACAO = 900;
      const k = clamp((agora - rakeInfo.assentarInicio) / DURACAO, 0, 1);
      const ek = easeFora(k);
      for (const p of caidas) {
        if (!p.pousada || p.alvoX == null) continue;
        p.x = p.origX + (p.alvoX - p.origX) * ek;
        p.y = p.origY + (p.alvoY - p.origY) * ek;
        p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
      }
      if (k >= 1) faseRastelo = 'parado';
    } else if (faseRastelo === 'parado') {
      // Ele não some mais. Fica encostado ao lado do monte que juntou, com um
      // respiro mínimo — desaparecer depois do trabalho feito desfazia a cena
      // inteira, e era justamente a imagem que devia permanecer.
      const b = Math.sin(agora / 1500) * 1.1;
      rastelo.style.opacity = '1';
      // para exatamente onde a última varrida terminou, com a inclinação em
      // que terminou — sem salto entre o fim do gesto e o repouso
      rastelo.style.transform =
        `translate3d(${rakeInfo.xFinal.toFixed(1)}px, ${(rakeInfo.baseY + 8 + b).toFixed(1)}px, 0) rotate(${(-7 + b * .7).toFixed(1)}deg)`;
    }
  };

  /* Refaz a varrida quando a caixa branca aparece ou muda de tamanho.
     O pedido: ao marcar um padrão, o rastelo aparece e varre na linha da
     caixa, com as pétalas pousando por cima dela. */
  let tRetomada = 0;
  const refazerVarrida = () => {
    if (!zona || reduced) return;
    clearTimeout(tRetomada);
    // dois quadros: um para a caixa entrar no layout, outro para o
    // getBoundingClientRect já enxergar a altura final dela
    requestAnimationFrame(() => requestAnimationFrame(() => {
      medirZona();
      // o que já estava pousado acerta a linha nova: se ela desceu, as pétalas
      // voltam a cair; se subiu (a caixa fechou), sobem junto em vez de ficar
      // flutuando soltas no fim da seção
      for (const p of caidas) {
        if (!p.pousada) continue;
        p.alvoX = null;
        if (p.y < chaoY - 2) { p.pousada = false; p.vy = 1.3; }
        else if (p.y > chaoY + 2) {
          p.y = chaoY;
          p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
        }
      }
      const extras = innerWidth < 700 ? 5 : 8;
      for (let i = 0; i < extras; i++) nascerPetala();
      const retomando = faseRastelo === 'parado' || faseRastelo === 'assentando';
      // 'pausa' não é fase conhecida do rastelo: ele fica parado enquanto as
      // pétalas novas descem, e só então a varrida começa
      faseRastelo = 'pausa';
      tPousio = 0;
      tRetomada = setTimeout(() => dispararRastelo(retomando), 1600);
    }));
  };

  const passoQueda = () => {
    if (!zona || !doresEl || reduced) return;

    for (const p of caidas) {
      if (p.pousada) continue;
      p.y += p.vy;
      // onda mais longa e mais larga: o zigue-zague curto parecia tremor,
      // este parece a pétala procurando o ar
      p.x += p.deriva + Math.sin(p.y / 78) * 0.62;
      p.rot += p.giro;
      if (p.y >= chaoY) { p.y = chaoY; p.pousada = true; p.rot = 80 + Math.random() * 20; }
      p.el.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
    }

    if (faseRastelo === 'esperando') {
      const r = doresEl.getBoundingClientRect();
      const inicioViewport = innerHeight * .85;
      const fimViewport = innerHeight * .60;
      const distancia = r.height + inicioViewport - fimViewport;
      const progresso = clamp((inicioViewport - r.top) / distancia, 0, 1);
      // nascem todas na PRIMEIRA METADE do percurso da seção. Espalhadas pelo
      // percurso inteiro, as últimas só apareciam quando já não havia mais
      // scroll pela frente e nunca chegavam a pousar antes do rastelo.
      const alvo = Math.round(clamp(progresso / .5, 0, 1) * TOTAL_QUEDA);
      while (nascidas < alvo) { nascerPetala(); nascidas++; }

      const naTela = r.bottom > 0 && r.top < innerHeight;
      const todasNasceram = nascidas >= TOTAL_QUEDA;

      // só quando a seção já está claramente indo embora (base acima de 55% da
      // tela) o que sobrou no ar ganha um empurrãozinho para terminar de
      // descer. Com um limiar generoso demais (95%) isso disparava logo na
      // entrada e a queda lenta virava queda rápida disfarçada.
      if (todasNasceram && r.bottom < innerHeight * .55) {
        for (const p of caidas) if (!p.pousada) p.vy = Math.min(p.vy * 1.01, 2);
      }

      // O GATILHO É O CHÃO, NÃO O SCROLL. Antes ele era "a base da seção
      // passou de 62% da tela", e por isso o rastelo aparecia enquanto as
      // pétalas ainda estavam caindo — ele entrava antes do que ia juntar.
      const pousadas = caidas.reduce((n, p) => n + (p.pousada ? 1 : 0), 0);
      const chegaram = todasNasceram && caidas.length > 0 &&
                       pousadas >= Math.ceil(caidas.length * .85);

      if (chegaram && naTela) {
        // e ainda uma pausa depois da última pousar: dá tempo de ver o monte
        // no chão antes de alguém vir recolhê-lo
        if (!tPousio) tPousio = performance.now();
        else if (performance.now() - tPousio > 900) dispararRastelo();
      } else {
        tPousio = 0;
      }
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

  /* ---- partículas das estações nas faixas de produtos ----
     Mesmo motor das pétalas à deriva da jornada: posição em FRAÇÃO da caixa,
     movida por transform no laço de rAF que já existe. O que muda de uma
     faixa para outra é só o comportamento — velocidade, deriva, giro e
     sentido. Nenhum código de animação novo, nenhuma biblioteca. */
  const COMPORTAMENTO = {
    // folha de outono: cai girando, com deriva larga
    outono:    { qtd: 9, vy: [ .00030,  .00042], vx: .00055, onda: .00040, giro: 1.5 },
    // pétala de primavera: cai devagar, quase flutuando de lado
    primavera: { qtd: 8, vy: [ .00018,  .00026], vx: .00070, onda: .00052, giro: .8 },
    // pólen de verão: SOBE, quase sem girar — é o ar quente levando
    verao:     { qtd: 10, vy: [-.00016, -.00026], vx: .00030, onda: .00030, giro: .2 },
    // neve de inverno: desce reto e muito devagar, sem giro
    inverno:   { qtd: 10, vy: [ .00014,  .00021], vx: .00016, onda: .00014, giro: 0 }
  };

  const estacoes = [];
  if (!reduced) {
    document.querySelectorAll('.band[data-estacao] .seasonzone').forEach(zona => {
      const nome = zona.closest('.band').dataset.estacao;
      const c = COMPORTAMENTO[nome];
      if (!c) return;
      const qtd = innerWidth < 700 ? Math.ceil(c.qtd * .6) : c.qtd;
      const bichos = [];
      for (let i = 0; i < qtd; i++) {
        const el = document.createElement('span');
        el.className = 'flake';
        zona.appendChild(el);
        bichos.push({
          el,
          x: Math.random(),
          y: Math.random(),
          vy: c.vy[0] + Math.random() * (c.vy[1] - c.vy[0]),
          vx: (Math.random() - .5) * c.vx,
          rot: Math.random() * 360,
          giro: (Math.random() - .5) * c.giro
        });
      }
      estacoes.push({ zona, c, bichos, caixa: null });
    });
  }

  const medirEstacoes = () => estacoes.forEach(e => { e.caixa = e.zona.getBoundingClientRect(); });
  if (estacoes.length) {
    medirEstacoes();
    addEventListener('resize', medirEstacoes, { passive: true });
  }

  const moverEstacoes = kick => {
    for (const e of estacoes) {
      // remede a cada quadro porque a caixa se move com o scroll e o filtro
      // pode esconder a faixa inteira; se está fora da tela, nem anima
      const r = e.zona.getBoundingClientRect();
      if (r.height === 0 || r.bottom < -80 || r.top > innerHeight + 80) continue;
      const w = r.width, h = r.height;
      for (const p of e.bichos) {
        p.y += p.vy + kick * .00010;
        p.x += p.vx + Math.sin(p.y * 6 + p.rot) * e.c.onda;
        p.rot += p.giro;
        // reentra pelo lado oposto ao do sentido de queda: o pólen do verão
        // sobe, então ele nasce embaixo
        if (p.y > 1.08) { p.y = -.08; p.x = Math.random(); }
        if (p.y < -.12) { p.y = 1.05; p.x = Math.random(); }
        if (p.x > 1.05) p.x = -.03;
        if (p.x < -.05) p.x = 1.03;
        p.el.style.transform =
          `translate3d(${(p.x * w).toFixed(1)}px, ${(p.y * h).toFixed(1)}px, 0) rotate(${p.rot.toFixed(1)}deg)`;
      }
    }
  };

  /* ---- plantas que crescem com o scroll ----
     Semente na terra → regada → haste crescendo → folhas → flor abrindo.
     Duas delas na página: o girassol do "sobre mim" e a rosa do CTA. Mesmo
     motor, mesma marcação, só muda a flor no topo da haste.

     Tudo é dirigido pelo progresso do scroll na seção, não por animação em
     loop: subir a página desfaz o crescimento na mesma ordem em que ele
     aconteceu. O balanço vem do motor de vento (classe js-wind no grupo).

     As janelas de cada etapa terminam em 74% do percurso, não em 96%: a flor
     precisa estar aberta enquanto a seção ainda está na tela, senão o
     desabrochar acontece quando ninguém mais está olhando para ela. */
  const ETAPAS = {
    gotas:  [.04, .16],   // a rega, antes de tudo
    caule:  [.10, .46],
    folhaA: [.22, .38],
    folhaB: [.32, .48],
    flor:   [.40, .58],   // a cabeça surge
    abre:   [.46, .70],   // pétalas de fora
    abre2:  [.56, .80]    // miolo / camada de dentro (só a rosa usa)
  };

  const plantas = [
    ['.about__media', '#sunflower'],
    ['.cta__media',   '#rosebush']
  ].map(([seletor, id]) => {
    const host = document.querySelector(seletor);
    const svg = document.querySelector(id);
    if (!host || !svg) return null;
    const caule = svg.querySelector('.sf__caule');
    // o comprimento do traço tem de sair do próprio path: chutar um número
    // aqui deixaria a haste crescendo até um ponto que não é a ponta dela
    if (caule) svg.style.setProperty('--len', caule.getTotalLength().toFixed(1));
    return {
      host, svg,
      folhas: [...svg.querySelectorAll('.sf__folha')],
      gotas: [...svg.querySelectorAll('.sf__gota')],
      p: -1
    };
  }).filter(Boolean);

  const pintarPlantas = () => {
    for (const pl of plantas) {
      const r = pl.host.getBoundingClientRect();
      if (!r.height) continue;
      const inicio = innerHeight * .92, fim = innerHeight * .46;
      const p = clamp((inicio - r.top) / (r.height + inicio - fim), 0, 1);
      if (Math.abs(p - pl.p) < .002) continue;
      pl.p = p;
      pl.host.style.setProperty('--p', p.toFixed(3));

      // recorta uma janela [a,b] do progresso e devolve 0..1 dentro dela
      const etapa = ([a, b]) => easeFora(clamp((p - a) / (b - a), 0, 1));

      pl.gotas.forEach((g, i) => {
        const [a, b] = ETAPAS.gotas;
        const k = clamp((p - (a + i * .035)) / (b - a), 0, 1);
        g.style.transform = `translateY(${(36 + k * 220).toFixed(1)}px)`;
        g.style.opacity = k <= 0 || k >= 1 ? '0' : Math.min(1, (1 - k) * 3).toFixed(2);
      });

      pl.svg.style.setProperty('--cresc', etapa(ETAPAS.caule).toFixed(3));
      pl.folhas[0]?.style.setProperty('--f', etapa(ETAPAS.folhaA).toFixed(3));
      pl.folhas[1]?.style.setProperty('--f', etapa(ETAPAS.folhaB).toFixed(3));
      pl.svg.style.setProperty('--flor', etapa(ETAPAS.flor).toFixed(3));
      pl.svg.style.setProperty('--ab', etapa(ETAPAS.abre).toFixed(3));
      pl.svg.style.setProperty('--ab2', etapa(ETAPAS.abre2).toFixed(3));
    }
  };

  /* ---- laço principal ---- */
  let t = 0;
  const frame = () => {
    requestAnimationFrame(frame);
    t += 0.016;

    velocity *= 0.9;
    const kick = clamp(velocity * 0.35, -22, 22);
    // o vento tem um empurrão próprio, bem mais curto que o das pétalas: com o
    // mesmo kick as flores chicoteavam a cada rolagem rápida. Aqui a rolagem
    // inclina o canteiro de leve e ele volta sozinho.
    const brisa = clamp(velocity * 0.14, -7, 7);

    if (!reduced) {
      for (const w of windEls) {
        let target = Math.sin(t * w.speed + w.phase) * w.amp + brisa + tilt.x * 6;
        if (pointer.active && w.box) {
          const dx = pointer.x - (w.box.left + w.box.width / 2);
          const dy = pointer.y - (w.box.top + w.box.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 170) target -= (dx / (dist || 1)) * (1 - dist / 170) * 18;
        }
        // 0.045 em vez de 0.09: o dobro de tempo para alcançar o alvo, que é o
        // que transforma o balanço em respiração
        w.current += (target - w.current) * 0.045;
        w.el.style.setProperty('--wind', w.current.toFixed(2) + 'deg');
      }

      voo?.mover(performance.now());
    }

    posy?.classList.toggle('is-visible', scrollY > innerHeight * 0.55);
    moverPetalas(kick);
    pintarJornada();
    pintarCena();
    pintarPlantas();
    moverDeriva(kick);
    moverEstacoes(kick);
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

  /* ---- filtro de produtos ----
     Agora os produtos vivem em faixas por categoria, então o filtro esconde
     a faixa inteira em vez de card a card: sem isso sobrariam cabeçalhos de
     seção vazios. */
  const filters = [...document.querySelectorAll('.filter')];
  const faixas = [...document.querySelectorAll('.band')];
  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      const cat = btn.dataset.filter;
      faixas.forEach(f => {
        f.classList.toggle('is-hidden', !(cat === 'all' || f.dataset.band === cat));
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
    // wa: produto vendido pela conversa; sem wa, o botão vai para o checkout
    const CATALOGO = {
      palavra: {
        nome: 'Palavra Certa',
        tipo: 'E-book',
        texto: 'Mais de 300 mensagens e perguntas para puxar assunto, manter o interesse e dizer o que sente sem soar ensaiada.'
      },
      pagina: {
        nome: 'Virar a Página',
        tipo: 'E-book',
        texto: 'Um exercício curto por dia para parar de reler o passado e recuperar a autoestima no seu ritmo.'
      },
      desafio: {
        nome: 'Diário de 30 Dias',
        tipo: 'Programa',
        texto: 'Dez minutos por dia de exercícios sobre autoestima, crenças e hábitos, direto no celular.'
      },
      raiz: {
        nome: 'Método Raiz',
        tipo: 'Mentoria em grupo',
        texto: 'Oito semanas de encontros ao vivo para entender o seu padrão, falar com clareza e ocupar o seu lugar na relação.'
      },
      individual: {
        nome: 'Só Você',
        tipo: 'Mentoria individual',
        texto: 'Três encontros só com você, com diagnóstico, plano de ação escrito e suporte entre as sessões.',
        wa: 'Olá, Flora! Fiz o quiz no site e o resultado indicou a mentoria individual Só Você.'
      },
      terra: {
        nome: 'Terra Firme',
        tipo: 'Imersão de 2 dias',
        texto: 'Um fim de semana ao vivo, em turma pequena, para trabalhar amor-próprio, limites e padrões antigos.'
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
      // o resultado usa os mesmos botões de demonstração do resto da página;
      // o clique é pego pela delegação lá no topo, então não precisa ligar nada
      const demoAttrs = p => p.wa
        ? `href="#demonstracao" data-demo="whatsapp" data-msg="${p.wa}"`
        : `href="#demonstracao" data-demo="checkout" data-produto="${p.nome}"`;

      visita.quiz = true;
      resultBox.innerHTML = `
        <p class="eyebrow">O seu ponto de partida</p>
        <h3>${first.nome}</h3>
        <p class="quiz__type">${first.tipo}</p>
        <p>${first.texto}</p>
        <a class="btn" ${demoAttrs(first)}>Quero começar por aqui</a>
        ${second ? `<p class="quiz__also">Também combina com você: <a ${demoAttrs(second)}>${second.nome}</a></p>` : ''}
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
      'Um só já merece atenção. É por ele que a gente começa.',
      'Dois. Perceber o padrão já é metade do caminho.',
      'Três. Isso não é azar, é repetição. E repetição tem saída.',
      'Quatro. Você tem sustentado sozinha o que era para ser dividido.',
      'Cinco. Não te falta amor. Ele só está indo todo para fora.',
      'Todos. Se ler doeu, é sinal de que uma parte sua já decidiu mudar.'
    ];

    pains.forEach(btn => {
      btn.addEventListener('click', () => {
        const on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!on));
        btn.classList.toggle('is-on', !on);

        const n = pains.filter(b => b.classList.contains('is-on')).length;
        echo.hidden = n === 0;
        if (!n) { refazerVarrida(); return; }
        score.textContent = n;
        msg.textContent = RESPOSTAS[n];
        refazerVarrida();
        if (!on) {
          const r = btn.getBoundingClientRect();
          soprar(r.left + r.width * 0.12, r.top + r.height * 0.5);
        }
      });
    });
  }

  /* ---- cena pós-créditos: a visita contada de volta ----
     O tempo só corre com a aba visível, para o número ser honesto: quem
     deixou a página aberta em outra aba não "passou" esse tempo aqui. */
  const creditos = document.getElementById('bastidores');
  const prova = document.getElementById('proof');
  if (creditos && prova) {
    let ms = 0;
    let desde = document.hidden ? 0 : performance.now();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { ms += performance.now() - desde; desde = 0; }
      else desde = performance.now();
    });
    const tempoNaPagina = () => ms + (desde ? performance.now() - desde : 0);

    const formatarTempo = total => {
      const s = Math.max(1, Math.round(total / 1000));
      if (s < 60) return `${s} segundo${s > 1 ? 's' : ''}`;
      return `${Math.floor(s / 60)}min${String(s % 60).padStart(2, '0')}s`;
    };
    const plural = (n, um, varios) => `<b>${n} ${n === 1 ? um : varios}</b>`;
    const juntar = l => l.length < 2 ? l.join('') : l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1];

    const contar = () => {
      const tempo = formatarTempo(tempoNaPagina());
      const faltam = PONTAS.length - colhidas;
      // quem pulou direto para cá não viveu a página: em vez de uma conta
      // quase vazia, o texto admite o pulo e manda de volta para o começo
      if (visita.pulou && faltam > 0) {
        prova.innerHTML =
          `Você pulou direto para o fim em <b>${tempo}</b>. Tudo bem, agora você já sabe o segredo. ` +
          `Volte lá para cima e role com calma: o buquê do canto ainda tem ${plural(faltam, 'flor', 'flores')} esperando por você. ` +
          '<a class="credits__back" href="#topo">Voltar ao começo ↑</a>';
        return;
      }
      const feito = [];
      if (colhidas === PONTAS.length) feito.push(`colheu as <b>${colhidas} flores</b> do buquê`);
      else if (colhidas > 0) feito.push(`colheu ${plural(colhidas, 'flor', 'flores')} do buquê`);
      const marcados = document.querySelectorAll('.pain.is-on').length;
      if (marcados) feito.push(`marcou ${plural(marcados, 'padrão', 'padrões')}`);
      if (visita.quiz) feito.push('fez o quiz');
      if (visita.compras) feito.push(`clicou para comprar ${plural(visita.compras, 'vez', 'vezes')}`);
      else if (visita.conversas) feito.push('tentou chamar a Flora no WhatsApp');

      prova.innerHTML =
        `Você passou <b>${tempo}</b> na página de alguém que não existe.` +
        (feito.length ? ` E ainda ${juntar(feito)}.` : '');
    };

    // volta instantânea: animada, ela atravessaria as seções de novo
    prova.addEventListener('click', e => {
      if (!e.target.closest('.credits__back')) return;
      e.preventDefault();
      pular(600);
      if (lenis) lenis.scrollTo(0, { immediate: true });
      else scrollTo(0, 0);
    });

    let relogio = 0;
    new IntersectionObserver(([e]) => {
      creditosNaTela = e.isIntersecting;
      nav.classList.toggle('is-away', e.isIntersecting && !nav.classList.contains('is-open'));
      posy?.classList.toggle('is-away', e.isIntersecting);
      onScroll();
      clearInterval(relogio);
      if (e.isIntersecting) { contar(); relogio = setInterval(contar, 1000); }
    }, { threshold: 0.08 }).observe(creditos);
  }

  /* ---- copiar e-mail: quem não tem programa de e-mail no computador
     clica em "Mandar um e-mail" e nada acontece; o copiar resolve ---- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const texto = btn.dataset.copy;
      const ok = () => {
        btn.textContent = 'Copiado';
        setTimeout(() => { btn.textContent = 'Copiar'; }, 2200);
      };
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(texto).then(ok, () => {});
      else {
        const t = document.createElement('textarea');
        t.value = texto;
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); ok(); } catch (_) {}
        t.remove();
      }
    });
  });

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
