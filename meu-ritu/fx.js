/* ---------------------------------------------------------------------------
   fx.js — animações de natureza do Meu Ritú (vanilla, sem dependências)

   Cada efeito pode ser desligado em window.MEU_RITU_FX (no fim do index.html).
   Desligado = o elemento [data-fx="nome"] é removido e nada roda.
   Com "reduzir movimento" ativo no aparelho, tudo aparece no estado final.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var FX = window.MEU_RITU_FX || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  function on(name) { return FX[name] !== false; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function svg(viewBox, parent, cls) {
    var s = el("svg", { viewBox: viewBox, "aria-hidden": "true", focusable: "false" }, parent);
    if (cls) s.setAttribute("class", cls);
    return s;
  }
  function onceVisible(node, fn, threshold) {
    if (!("IntersectionObserver" in window)) return fn();
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); fn(); }
    }, { threshold: threshold || 0.3 });
    io.observe(node);
  }

  // Remove os efeitos desligados
  document.querySelectorAll("[data-fx]").forEach(function (n) {
    if (!on(n.getAttribute("data-fx"))) n.remove();
  });
  if (on("folhaBotao")) root.classList.add("fx-btn-leaf");
  if (on("folhaFaq")) root.classList.add("fx-faq-leaf");
  if (reduced) root.classList.add("fx-reduced");

  // Formas reutilizadas --------------------------------------------------------
  var LEAF = "M0,0 C8,-9 22,-9 30,0 C22,9 8,9 0,0Z";
  var LEAF_VEIN = "M3,0 L26,0";
  var BIRD_UP = "M0,6 Q6,-1 12,6 Q18,-1 24,6";
  var BIRD_DOWN = "M0,2 Q6,9 12,6 Q18,9 24,2";

  function flyingBird(parent, scale) {
    var g = el("g", { "class": "fbird" }, parent);
    var p = el("path", { d: BIRD_UP, transform: "scale(" + (scale || 1) + ")" }, g);
    if (!reduced) {
      el("animate", {
        attributeName: "d", values: BIRD_UP + ";" + BIRD_DOWN + ";" + BIRD_UP,
        dur: (0.55 + Math.random() * 0.25).toFixed(2) + "s", repeatCount: "indefinite"
      }, p);
    }
    return g;
  }

  // Florzinha do campo: 5 pétalas rosé + miolo mostarda
  function flower(parent, x, y, r, delay) {
    var g = el("g", { transform: "translate(" + x + "," + y + ")" }, parent);
    var inner = el("g", { "class": "flower", style: "transition-delay:" + (delay || 0) + "ms" }, g);
    for (var i = 0; i < 5; i++) {
      el("ellipse", {
        "class": "flower__petal", cx: 0, cy: -r * 0.62, rx: r * 0.42, ry: r * 0.62,
        transform: "rotate(" + i * 72 + ")"
      }, inner);
    }
    el("circle", { "class": "flower__core", r: r * 0.28 }, inner);
    return inner;
  }

  // Folha posicionada num ponto de um path, apontando para um lado
  function leafAt(parent, path, frac, side, size, cls) {
    var len = path.getTotalLength();
    var pt = path.getPointAtLength(len * frac);
    var pt2 = path.getPointAtLength(Math.min(len, len * frac + 1));
    var ang = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180 / Math.PI + side * 55;
    var outer = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ") rotate(" + ang.toFixed(1) + ") scale(" + (size / 30) + ")" }, parent);
    var g = el("g", { "class": cls || "leaf" }, outer);
    el("path", { "class": "leaf__shape", d: LEAF }, g);
    el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g);
    return g;
  }

  // Atualização por scroll (um único listener, 1 rAF por frame) -------------
  var scrollers = [];
  var ticking = false;
  function runScroll() {
    ticking = false;
    var vh = window.innerHeight;
    scrollers.forEach(function (fn) { fn(vh); });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(runScroll); }
  }, { passive: true });
  window.addEventListener("resize", runScroll);

  /* 1. HERO: título palavra por palavra, folha desenhando, sombras e pássaros */
  (function hero() {
    var title = document.querySelector(".hero__title");
    if (title && !reduced) {
      var i = 0;
      (function split(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement("span");
              w.className = "word";
              w.style.setProperty("--i", i++);
              w.textContent = part;
              frag.appendChild(w);
            });
            node.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            split(child);
          }
        });
      })(title);
    }
    if (on("respiracao") && !reduced) root.classList.add("fx-breath");
    requestAnimationFrame(function () { root.classList.add("hero-in"); });

    var shadows = document.querySelector(".hero__shadows");
    if (shadows) {
      // Dois galhos de sombra (cantos), desfocados e balançando devagar
      [["hero__branch hero__branch--a", "M-20,40 C120,60 240,40 380,120 S560,220 640,260"],
       ["hero__branch hero__branch--b", "M640,-10 C520,40 430,60 330,150 S200,260 120,330"]].forEach(function (b) {
        var s = svg("0 0 620 360", shadows, b[0]);
        var path = el("path", { d: b[1], "class": "hero__branch-line" }, s);
        for (var k = 0; k < 16; k++) {
          leafAt(s, path, 0.04 + k * 0.06, k % 2 ? 1 : -1, 34 + (k % 3) * 8, "shadow-leaf");
        }
      });
    }

    var birds = document.querySelector(".hero__birds");
    if (birds && !reduced) {
      var s = svg("0 0 400 120", birds);
      [[0, 30, 1.1, 0], [40, 55, 0.85, 0.35], [-25, 70, 0.7, 0.7]].forEach(function (b, idx) {
        var g = el("g", { "class": "hero-bird", style: "animation-delay:" + (2.6 + b[3]) + "s" }, s);
        var inner = flyingBird(g, b[2]);
        inner.setAttribute("transform", "translate(" + b[0] + "," + b[1] + ")");
      });
    }
  })();

  /* 1b. NEBLINA QUE SOME (seção do cansaço) -------------------------------- */
  (function fog() {
    if (!on("neblina")) return;
    var section = document.querySelector(".pain");
    if (!section) return;
    var items = Array.prototype.slice.call(section.querySelectorAll(".pain__list li"));
    if (!items.length) return;
    section.classList.add("is-foggy");
    var last = items[items.length - 1];
    if (reduced) { section.style.setProperty("--warm", 1); section.classList.add("is-clear"); return; }

    scrollers.push(function (vh) {
      var r = section.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var line = vh * 0.42;                       // linha de leitura
      var lr = last.getBoundingClientRect();
      // A luz esquenta quando a última frase passa pela linha de leitura
      var warm = clamp((line + vh * 0.12 - (lr.top + lr.height / 2)) / (vh * 0.22), 0, 1);
      section.style.setProperty("--warm", warm.toFixed(3));
      items.forEach(function (li) {
        var b = li.getBoundingClientRect();
        var sdist = (b.top + b.height / 2 - line) / (vh * 0.32);
        // Já lida (acima): fica clara. Por ler (abaixo): na neblina.
        var clarity = sdist < 0 ? Math.max(0.7, 1 + sdist * 0.6) : 1 - Math.min(1, sdist);
        clarity = Math.max(clarity, warm);
        li.style.setProperty("--clarity", clarity.toFixed(3));
      });
    });
  })();

  /* 1c. SOMBRA DE JANELA EM ARCO (o sol muda de lado com a rolagem) -------- */
  (function windowLight() {
    var wins = document.querySelectorAll(".sunwin");
    if (!wins.length) return;
    wins.forEach(function (w, n) {
      var s = svg("0 0 200 320", w);
      var id = "winmask" + n;
      var defs = el("defs", {}, s);
      var mask = el("mask", { id: id }, defs);
      el("path", { d: "M0,320 L0,100 A100,100 0 0 1 200,100 L200,320 Z", fill: "#fff" }, mask);
      el("rect", { x: 95, y: 0, width: 10, height: 320, fill: "#000" }, mask);
      el("rect", { x: 0, y: 150, width: 200, height: 9, fill: "#000" }, mask);
      el("path", { d: "M30,100 A70,70 0 0 1 170,100", fill: "none", stroke: "#000", "stroke-width": 7 }, mask);
      el("rect", { x: 0, y: 0, width: 200, height: 320, "class": "sunwin__light", mask: "url(#" + id + ")" }, s);
    });
    scrollers.push(function (vh) {
      wins.forEach(function (w) {
        var r = w.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        var q = clamp((vh - r.top) / (vh + r.height), 0, 1);
        w.style.setProperty("--q", q.toFixed(3));
      });
    });
  })();

  /* 2. 20 DOS 1.440 MINUTOS: animação contínua, toca uma vez ao aparecer --- */
  (function minutes() {
    var sec = document.querySelector(".minutes");
    if (!sec) return;
    var ticks = sec.querySelector(".minutes__ticks");
    var tickEls = [];
    for (var h = 0; h < 24; h++) {
      var a = h / 24 * Math.PI * 2;
      var r1 = 100, r2 = h % 6 === 0 ? 92 : 96;
      tickEls.push(el("line", {
        x1: (110 + Math.sin(a) * r1).toFixed(1), y1: (110 - Math.cos(a) * r1).toFixed(1),
        x2: (110 + Math.sin(a) * r2).toFixed(1), y2: (110 - Math.cos(a) * r2).toFixed(1)
      }, ticks));
    }
    var track = sec.querySelector(".minutes__track");
    var slice = sec.querySelector(".minutes__slice");
    var dayNum = sec.querySelector(".minutes__label--day .minutes__num");
    var youNum = sec.querySelector(".minutes__label--you .minutes__num");
    // Curvas suaves (sem "trancos")
    function inOut(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
    function out(t) { return 1 - Math.pow(1 - t, 3); }
    function seg(ms, a, b, fn) { return (fn || inOut)(clamp((ms - a) / (b - a), 0, 1)); }

    function render(ms) {
      var day = seg(ms, 0, 3200);
      track.style.strokeDashoffset = (1000 * (1 - day)).toFixed(1);
      tickEls.forEach(function (t, i) { t.style.opacity = clamp(day * 24 - i, 0, 1).toFixed(2); });
      dayNum.textContent = Math.round(1440 * day).toLocaleString("pt-BR");
      sec.style.setProperty("--swap", seg(ms, 3900, 5000).toFixed(3));
      var mine = seg(ms, 4300, 7300, out);
      slice.style.strokeDasharray = (20 * mine).toFixed(2) + " 1440";
      slice.style.opacity = Math.min(1, mine * 8).toFixed(2);
      youNum.textContent = Math.round(20 * mine);
      sec.style.setProperty("--line2", seg(ms, 4600, 6000).toFixed(3));
      sec.style.setProperty("--line3", seg(ms, 6800, 8200).toFixed(3));
    }
    render(0);
    if (reduced) { render(99999); return; }
    onceVisible(sec.querySelector(".minutes__ring"), function () {
      var t0 = performance.now();
      (function frame(now) {
        var ms = now - t0;
        render(ms);
        if (ms < 8300) requestAnimationFrame(frame);
      })(t0);
    }, 0.7);
  })();

  /* 3. NINHO COM 3 FILHOTES ------------------------------------------------- */
  (function nest() {
    var btn = document.querySelector(".nest");
    if (!btn) return;
    var s = svg("0 0 220 130", btn);
    el("path", { "class": "nest__branch", d: "M0,104 C50,96 90,100 130,96 S200,86 220,80" }, s);
    leafAt(s, s.lastChild, 0.88, -1, 20, "leaf");
    leafAt(s, s.firstChild, 0.08, 1, 18, "leaf");
    [[78, 1], [110, 2], [142, 3]].forEach(function (c, i) {
      var g = el("g", { transform: "translate(" + c[0] + ",62)" }, s);
      var chick = el("g", { "class": "chick", style: "--d:" + i * 160 + "ms" }, g);
      el("path", { "class": "chick__body", d: "M-13,14 C-14,0 -10,-12 0,-12 C10,-12 14,0 13,14Z" }, chick);
      el("circle", { "class": "chick__eye", cx: -4, cy: -4, r: 1.3 }, chick);
      el("circle", { "class": "chick__eye", cx: 4, cy: -4, r: 1.3 }, chick);
      var beak = el("g", { "class": "chick__beak" }, chick);
      el("path", { "class": "chick__beak-up", d: "M-4,1 L0,-5 L4,1Z" }, beak);
      el("path", { "class": "chick__beak-down", d: "M-3.5,1.5 L0,6 L3.5,1.5Z" }, beak);
      el("path", { "class": "chick__tuft", d: "M-2,-12 C-3,-17 0,-18 1,-14 M1,-12 C2,-16 5,-16 4,-13" }, chick);
      var notes = el("g", { "class": "chick__chirp" }, chick);
      el("path", { d: "M10,-14 L15,-19 M12,-8 L19,-10 M8,-19 L10,-25" }, notes);
    });
    // Ninho por cima da parte de baixo dos filhotes
    el("path", { "class": "nest__bowl", d: "M50,70 C56,108 164,108 170,70 C140,78 80,78 50,70Z" }, s);
    ["M58,80 C90,92 130,92 162,80", "M62,90 C96,100 126,100 158,88", "M56,74 C80,86 110,82 128,96", "M164,74 C140,86 112,84 94,98"].forEach(function (d) {
      el("path", { "class": "nest__twig", d: d }, s);
    });

    function chirp() {
      btn.classList.remove("is-chirping");
      void btn.offsetWidth;
      btn.classList.add("is-chirping");
    }
    onceVisible(btn, function () {
      btn.classList.add("is-on");
      if (!reduced) setTimeout(chirp, 900);
    }, 0.6);
    btn.addEventListener("click", chirp);
    btn.addEventListener("mouseenter", chirp);
    if (reduced) btn.classList.add("is-on");
  })();

  /* 4. CAMINHO DE 14 DIAS (vertical): o caule cresce enquanto você desce ---- */
  (function journey() {
    var box = document.querySelector(".journey");
    if (!box) return;
    var holder = box.querySelector(".journey__stem");
    var list = box.querySelector(".journey__list");
    var days = Array.prototype.slice.call(list.querySelectorAll(".day"));
    var stem, stemLen, leaves = [], flowers = [], marks = [];
    var decos = [];
    // Gerador pseudoaleatório com semente: mesma "planta" a cada visita
    function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

    function build() {
      holder.innerHTML = "";
      leaves = []; flowers = []; marks = []; decos = [];
      var w = holder.offsetWidth, h = list.offsetHeight;
      if (!w || !h) return;
      var cx = w / 2, top = 0, bottom = h - 20;
      var s = svg("0 0 " + w + " " + h, holder);
      s.setAttribute("width", w); s.setAttribute("height", h);
      // Caule com ondulação suave
      var d = "M" + cx + "," + top, steps = 24;
      for (var k = 1; k <= steps; k++) {
        var y = top + (bottom - top) * k / steps;
        var yPrev = top + (bottom - top) * (k - 1) / steps;
        var x = cx + Math.sin(k * 1.3) * 6;
        d += " Q" + (cx + Math.sin(k * 1.3 - 0.65) * 12).toFixed(1) + "," + ((y + yPrev) / 2).toFixed(1) + " " + x.toFixed(1) + "," + y.toFixed(1);
      }
      el("path", { "class": "journey__ghost", d: d }, s);
      stem = el("path", { "class": "journey__line", d: d }, s);
      stemLen = stem.getTotalLength();
      stem.style.strokeDasharray = stemLen;
      var listTop = list.getBoundingClientRect().top;
      days.forEach(function (li, i) {
        var y = li.getBoundingClientRect().top - listTop + 14;
        // Ponto do caule nessa altura (busca simples)
        var lo = 0, hi = stemLen;
        for (var n = 0; n < 18; n++) {
          var mid = (lo + hi) / 2;
          if (stem.getPointAtLength(mid).y < y) lo = mid; else hi = mid;
        }
        marks.push(lo / stemLen);
        var pt = stem.getPointAtLength(lo);
        var side = i % 2 ? -1 : 1;
        var tilt = [35, 22, 44, 30, 18, 40, 27][i % 7];        // varia o ângulo e o tamanho
        var size = [0.85, 0.72, 0.95, 0.8, 0.9, 0.7, 0.88][(i * 3) % 7];
        var outer = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ") rotate(" + (side > 0 ? -tilt : 180 + tilt) + ") scale(" + size + ")" }, s);
        var g = el("g", { "class": "leaf leaf--grow" }, outer);
        el("path", { "class": "leaf__shape", d: LEAF }, g);
        el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g);
        leaves.push(g);
      });
      // Flores espalhadas pelo galho, em posições e formatos variados
      var R = rng(11), N = 12;
      for (var q = 0; q < N; q++) {
        var f = clamp(0.05 + q * (0.88 / N) + (R() - 0.5) * 0.05, 0.02, 0.93);
        var pp = stem.getPointAtLength(stemLen * f);
        var sd = R() < 0.5 ? -1 : 1;
        var kind = R();
        var dx = sd * (8 + R() * 20), dy = -(2 + R() * 16);
        var go = el("g", { transform: "translate(" + pp.x.toFixed(1) + "," + pp.y.toFixed(1) + ")" }, s);
        var stalk = el("g", { "class": "leaf leaf--grow" }, go);
        el("path", { "class": "journey__stalk", d: "M0,0 Q" + (dx * 0.5).toFixed(1) + "," + (dy * 0.1).toFixed(1) + " " + dx.toFixed(1) + "," + dy.toFixed(1) }, stalk);
        var parts = [stalk];
        if (kind < 0.45) {
          parts.push(flower(go, dx, dy, 6 + R() * 4, 120));
        } else if (kind < 0.75) {
          parts.push(flower(go, dx, dy, 6 + R() * 2.5, 120));
          parts.push(flower(go, dx + sd * 9, dy + 6, 4 + R() * 1.5, 320));
        } else {
          // botão ainda fechado + folhinha
          var bud = el("g", { "class": "flower" }, el("g", { transform: "translate(" + dx.toFixed(1) + "," + dy.toFixed(1) + ") rotate(" + (sd * 25) + ")" }, go));
          el("ellipse", { "class": "flower__petal", cx: 0, cy: -3, rx: 2.6, ry: 4.2 }, bud);
          parts.push(bud);
          var lo2 = el("g", { transform: "translate(" + (dx * 0.5).toFixed(1) + "," + (dy * 0.2).toFixed(1) + ") rotate(" + (sd > 0 ? 20 : 160) + ") scale(0.45)" }, go);
          var lg = el("g", { "class": "leaf leaf--grow" }, lo2);
          el("path", { "class": "leaf__shape", d: LEAF }, lg);
          parts.push(lg);
        }
        decos.push({ f: f, parts: parts });
      }
      var end = stem.getPointAtLength(stemLen);
      [[0, 0, 9], [-12, -10, 6.5], [11, -8, 6]].forEach(function (f, i) {
        flowers.push(flower(s, end.x + f[0], end.y + f[1], f[2], i * 140));
      });
      runScroll();
    }

    function update(vh) {
      if (!stem) return;
      var r = list.getBoundingClientRect();
      // A ponta do caule acompanha uma linha imaginária a 65% da altura da tela
      var p = reduced ? 1 : clamp((vh * 0.65 - r.top) / r.height, 0, 1);
      stem.style.strokeDashoffset = (stemLen * (1 - p)).toFixed(1);
      days.forEach(function (li, i) {
        var onNow = p >= marks[i];
        li.classList.toggle("is-on", onNow);
        if (leaves[i]) leaves[i].classList.toggle("is-on", onNow);
      });
      decos.forEach(function (dd) {
        var onD = p >= dd.f + 0.01;
        dd.parts.forEach(function (n) { n.classList.toggle("is-on", onD); });
      });
      flowers.forEach(function (f) { f.classList.toggle("is-on", p >= 0.995); });
    }

    scrollers.push(update);
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 150); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build); else build();
    build();
  })();

  /* 5. PÁSSAROS NO CTA FINAL: um bando pequeno cruza a seção em curva ------- */
  (function finalBirds() {
    var box = document.querySelector(".final__birds");
    if (!box || reduced) return;
    var section = box.closest("section");
    var flock = [
      // [início x, início y, controle x, controle y, fim x, fim y] em % da seção; escala; atraso (s)
      [-6, 26, 40, -6, 108, 10, 1, 0],
      [-8, 20, 44, -10, 108, 4, 0.8, 0.45],
      [-4, 32, 36, 0, 110, 16, 0.9, 0.9],
      [-10, 24, 30, -2, 106, 20, 0.65, 1.3]
    ];
    var birds = flock.map(function (b) {
      var wrap = document.createElement("div");
      wrap.className = "flyer";
      wrap.style.setProperty("--s", b[6]);
      wrap.style.animationDelay = b[7] + "s";
      var s = svg("0 0 26 12", wrap);
      flyingBird(s, 1);
      box.appendChild(wrap);
      return { el: wrap, pts: b };
    });
    function paths() {
      var W = section.offsetWidth, H = section.offsetHeight;
      birds.forEach(function (b) {
        var p = b.pts;
        b.el.style.offsetPath = 'path("M' + (p[0] * W / 100) + "," + (p[1] * H / 100) +
          " Q" + (p[2] * W / 100) + "," + (p[3] * H / 100) + " " + (p[4] * W / 100) + "," + (p[5] * H / 100) + '")';
      });
    }
    function fly() {
      paths();
      section.classList.remove("flock-go");
      void section.offsetWidth;
      section.classList.add("flock-go");
    }
    onceVisible(section, function () { setTimeout(fly, 700); }, 0.5);
    var btn = section.querySelector(".btn");
    var last = 0;
    if (btn) btn.addEventListener("mouseenter", function () {
      if (Date.now() - last > 9000) { last = Date.now(); fly(); }
    });
    window.addEventListener("resize", paths);
  })();

  /* 6. PÉTALAS NA OFERTA ---------------------------------------------------- */
  (function petals() {
    if (!on("petalas") || reduced) return;
    var offer = document.querySelector(".offer");
    if (!offer) return;
    onceVisible(offer, function () {
      var layer = document.createElement("div");
      layer.className = "petals";
      layer.setAttribute("aria-hidden", "true");
      for (var i = 0; i < 12; i++) {
        var p = document.createElement("span");
        p.className = "petal";
        p.style.setProperty("--x", (Math.random() * 100).toFixed(1) + "%");
        p.style.setProperty("--s", (9 + Math.random() * 7).toFixed(1) + "px");
        p.style.setProperty("--dur", (6 + Math.random() * 4).toFixed(2) + "s");
        p.style.setProperty("--delay", (Math.random() * 2.5).toFixed(2) + "s");
        p.style.setProperty("--sway", (20 + Math.random() * 40).toFixed(0) + "px");
        p.style.setProperty("--rot", (180 + Math.random() * 360).toFixed(0) + "deg");
        layer.appendChild(p);
      }
      offer.prepend(layer);
      setTimeout(function () { layer.remove(); }, 14000);
    }, 0.25);
  })();

  /* 7. VISITANTES: borboleta, passarinho ou abelhinha cruzam a tela às vezes */
  (function visitors() {
    if (!on("visitantes") || reduced) return;
    var layer = document.createElement("div");
    layer.className = "visitors";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    function makeButterfly() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bfly";
      var s = svg("-20 -16 40 32", d);
      var UP = "M-1,-2 C-7,-15 -20,-15 -18,-4 C-17,2 -8,2 -1,0Z";
      var LOW = "M-1,1 C-8,2 -15,8 -11,13 C-8,16 -3,10 -1,3Z";
      [0, 1].forEach(function (k) {
        var side = el("g", { transform: k ? "scale(-1,1)" : "" }, s);
        var w = el("g", { "class": "vwing" }, side);
        el("path", { "class": "bf-up", d: UP }, w);
        el("path", { "class": "bf-low", d: LOW }, w);
      });
      el("path", { "class": "bf-body", d: "M0,-6 L0,9" }, s);
      el("path", { "class": "bf-ant", d: "M0,-6 C-1,-10 -3,-12 -6,-13 M0,-6 C1,-10 3,-12 6,-13" }, s);
      return d;
    }
    function makeBee() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bee";
      var s = svg("-12 -11 24 20", d);
      var flip = el("g", { "class": "vflip" }, s);
      el("ellipse", { "class": "bee-wing vwing", cx: 1, cy: -5, rx: 4, ry: 3, transform: "rotate(-20 1 -5)" }, flip);
      el("ellipse", { "class": "bee-wing vwing", cx: 3, cy: -4.5, rx: 3.4, ry: 2.6, transform: "rotate(15 3 -4.5)" }, flip);
      el("ellipse", { "class": "bee-body", cx: 1, cy: 1, rx: 6.5, ry: 4.2 }, flip);
      el("path", { "class": "bee-stripe", d: "M0,-3 Q-1,1 0,5 M3,-3 Q2,1 3,5" }, flip);
      el("circle", { "class": "bee-head", cx: -6.2, cy: 0.5, r: 2.4 }, flip);
      el("path", { "class": "bee-sting", d: "M7.4,1 L9.4,1.4" }, flip);
      return d;
    }
    function makeBird() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bird";
      var s = svg("0 -2 24 12", d);
      var p = el("path", { "class": "bird-line", d: BIRD_UP }, s);
      d.__wing = p;
      return d;
    }

    var KINDS = {
      bfly: { make: makeButterfly, dur: [12000, 16000], amp: [34, 12], freq: [1.6, 4.1], tilt: 0.35 },
      bird: { make: makeBird, dur: [6500, 8500], amp: [0, 0], freq: [0, 0], tilt: 0.6, arc: 70 },
      bee:  { make: makeBee, dur: [8000, 10000], amp: [16, 6], freq: [1.2, 3.3], tilt: 0, loop: 26 }
    };
    var order = ["bfly", "bird", "bfly", "bee", "bfly", "bird", "bee"];
    var count = 0, busy = false, started = false;

    function fly(kind) {
      var k = KINDS[kind];
      var node = k.make();
      layer.appendChild(node);
      busy = true;
      var W = window.innerWidth, H = window.innerHeight;
      var ltr = Math.random() > 0.5;
      var x0 = ltr ? -50 : W + 50, x1 = ltr ? W + 50 : -50;
      var y0 = H * (0.25 + Math.random() * 0.35), y1 = H * (0.2 + Math.random() * 0.4);
      var dur = k.dur[0] + Math.random() * (k.dur[1] - k.dur[0]);
      var ph1 = Math.random() * 6, ph2 = Math.random() * 6;
      var t0 = performance.now(), px = x0, py = y0, ang = 0, glide = 0, wing = 0;
      if (kind === "bee") node.querySelector(".vflip").setAttribute("transform", ltr ? "scale(-1,1)" : "");

      (function frame(now) {
        var t = clamp((now - t0) / dur, 0, 1);
        var s = t;
        if (kind === "bee") s = t + 0.06 * Math.sin(t * Math.PI * 2);           // para um pouco no meio
        var x = x0 + (x1 - x0) * s;
        var y = y0 + (y1 - y0) * s;
        y += k.amp[0] * Math.sin(t * Math.PI * 2 * k.freq[0] + ph1) + k.amp[1] * Math.sin(t * Math.PI * 2 * k.freq[1] + ph2);
        if (k.arc) y -= k.arc * Math.sin(Math.PI * t);
        if (k.loop) { x += k.loop * Math.cos(t * Math.PI * 2 * 2.4); y += k.loop * 0.7 * Math.sin(t * Math.PI * 2 * 2.4); }
        var vx = x - px, vy = y - py;
        px = x; py = y;
        var target = Math.atan2(vy, Math.abs(vx) + 0.001) * 180 / Math.PI * k.tilt * (ltr ? 1 : -1);
        ang += (target - ang) * 0.08;
        node.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + ang.toFixed(1) + "deg)";
        if (kind === "bird") {
          // bate as asas e plana, alternando
          var cyc = (now - t0) / 1000;
          glide = (Math.sin(cyc * 0.9) > 0.35) ? Math.min(1, glide + 0.04) : Math.max(0, glide - 0.04);
          wing += 0.19 * (1 - glide * 0.85);
          var kk = (1 + Math.sin(wing)) / 2 * (1 - glide) + 0.35 * glide;
          var tips = 6 - 4 * kk, ctrl = -1 + 10 * kk;
          node.__wing.setAttribute("d", "M0," + tips.toFixed(2) + " Q6," + ctrl.toFixed(2) + " 12,6 Q18," + ctrl.toFixed(2) + " 24," + tips.toFixed(2));
        }
        if (t < 1) requestAnimationFrame(frame);
        else { node.remove(); busy = false; schedule(); }
      })(t0);
    }

    function schedule(first) {
      if (count >= 7) return;
      setTimeout(function tryFly() {
        if (document.hidden || busy) return setTimeout(tryFly, 3000);
        fly(order[count++ % order.length]);
      }, first ? 2500 : 14000 + Math.random() * 12000);
    }
    window.addEventListener("scroll", function () {
      if (!started && window.scrollY > window.innerHeight * 0.9) { started = true; schedule(true); }
    }, { passive: true });
  })();

  /* 8. FOLHAS QUE BROTAM NA LISTA "É PARA VOCÊ SE…" ------------------------ */
  (function listLeaves() {
    if (!on("folhasLista") || reduced || !("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".checks:not(.checks--no) li");
    if (!items.length) return;
    root.classList.add("fx-checks");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.classList.add("is-on");
      });
    }, { threshold: 1, rootMargin: "0px 0px -12% 0px" });
    items.forEach(function (li) { io.observe(li); });
  })();

  runScroll();
})();
