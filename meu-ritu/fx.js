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
      title.classList.add("is-split");
    }
    if (!on("respiracao") || reduced) root.classList.remove("fx-breath");
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

    var lastY = window.scrollY, kept = items.map(function () { return 0; }), keptWarm = 0;
    scrollers.push(function (vh) {
      var r = section.getBoundingClientRect();
      var goingDown = window.scrollY >= lastY;
      lastY = window.scrollY;
      if (r.bottom < -100 || r.top > vh + 100) return;
      var line = vh * 0.42;                       // linha de leitura
      var lr = last.getBoundingClientRect();
      // A luz esquenta quando a última frase passa pela linha de leitura
      var warm = clamp((line + vh * 0.12 - (lr.top + lr.height / 2)) / (vh * 0.22), 0, 1);
      // Descendo, nada volta a desfocar; só subindo a neblina pode voltar
      warm = goingDown ? Math.max(warm, keptWarm) : warm;
      keptWarm = warm;
      section.style.setProperty("--warm", warm.toFixed(3));
      items.forEach(function (li, i) {
        var b = li.getBoundingClientRect();
        var sdist = (b.top + b.height / 2 - line) / (vh * 0.32);
        // Já lida (acima): fica clara. Por ler (abaixo): na neblina.
        var clarity = sdist < 0 ? 1 : 1 - Math.min(1, sdist);
        clarity = Math.max(clarity, warm);
        if (goingDown) clarity = Math.max(clarity, kept[i]);
        kept[i] = clarity;
        li.style.setProperty("--clarity", clarity.toFixed(3));
      });
    });
  })();

  /* 1d. LUZ DO DIA NA FOTO DO "QUEM CONDUZ" -------------------------------
     A foto em arco é uma janela: o sol atravessa de um lado para o outro,
     projeta a luz da janela na parede e move a sombra, como o dia passando. */
  (function daylight() {
    var fig = document.querySelector(".story__media");
    var patch = fig && fig.querySelector(".daylight__patch");
    if (!patch) return;
    var s = svg("0 0 200 320", patch);
    var mask = el("mask", { id: "daymask" }, el("defs", {}, s));
    el("path", { d: "M0,320 L0,100 A100,100 0 0 1 200,100 L200,320 Z", fill: "#fff" }, mask);
    el("rect", { x: 96, y: 0, width: 8, height: 320, fill: "#000" }, mask);
    el("rect", { x: 0, y: 150, width: 200, height: 7, fill: "#000" }, mask);
    el("path", { d: "M34,100 A66,66 0 0 1 166,100", fill: "none", stroke: "#000", "stroke-width": 6 }, mask);
    el("rect", { x: 0, y: 0, width: 200, height: 320, fill: "currentColor", mask: "url(#daymask)" }, s);

    var MORNING = [255, 244, 224], EVENING = [255, 208, 156];
    function mix(a, b, t) { return a.map(function (v, i) { return Math.round(v + (b[i] - v) * t); }).join(","); }
    function apply(d) {
      var side = 0.5 - d;                                      // +: sol à esquerda (manhã)
      var len = Math.abs(side) * 2;                            // sombra mais longa nas pontas do dia
      fig.style.setProperty("--sx", (side * 90).toFixed(1) + "px");
      fig.style.setProperty("--sblur", (14 + len * 12).toFixed(1) + "px");
      fig.style.setProperty("--sskew", (-side * 16).toFixed(1) + "deg");
      fig.style.setProperty("--px", (-side * 105).toFixed(1) + "%");
      fig.style.setProperty("--pskew", (side * 34).toFixed(1) + "deg");
      fig.style.setProperty("--gx", (170 - d * 260).toFixed(1) + "%");
      fig.style.setProperty("--warm", (d * d).toFixed(3));
      fig.style.setProperty("--sun", mix(MORNING, EVENING, d));
    }
    if (reduced) { apply(0.35); return; }
    var target = 0, cur = 0, raf = 0;
    function tick() {
      cur += (target - cur) * 0.08;
      if (Math.abs(target - cur) < 0.0006) { cur = target; raf = 0; } else raf = requestAnimationFrame(tick);
      apply(cur);
    }
    scrollers.push(function (vh) {
      var r = fig.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      target = clamp((vh * 0.95 - r.top) / (vh * 0.95 + r.height * 0.35), 0, 1);
      if (!raf) raf = requestAnimationFrame(tick);
    });
    apply(0);
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

  /* 7. VISITANTES: borboleta, passarinho ou abelhinha cruzam a tela às vezes
     Voo orgânico: a direção muda aos poucos (como um ser vivo pilotando),
     a velocidade respira, e as asas são animadas quadro a quadro. */
  (function visitors() {
    if (!on("visitantes") || reduced) return;
    var layer = document.createElement("div");
    layer.className = "visitors";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    var uid = 0;

    function grad(defs, id, a, b) {
      var g = el("linearGradient", { id: id, x1: "1", y1: "0", x2: "0", y2: "0" }, defs);
      el("stop", { offset: "0", "stop-color": a }, g);
      el("stop", { offset: "1", "stop-color": b }, g);
    }
    function makeButterfly() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bfly";
      var s = svg("-22 -18 44 36", d);
      var id = "bf" + (++uid);
      var defs = el("defs", {}, s);
      grad(defs, id + "a", "#FBF1EA", "#D7A497");
      grad(defs, id + "b", "#F7E6DE", "#CB988C");
      var fore = [], hind = [];
      [1, -1].forEach(function (side) {
        var g = el("g", { transform: side < 0 ? "scale(-1,1)" : "" }, s);
        var h = el("g", {}, g);
        el("path", { "class": "bf-wing", fill: "url(#" + id + "b)", d: "M-1,0.5 C-5,0.5 -11.5,2 -13.5,6.5 C-15,10.5 -12.5,14 -8.5,13 C-5.5,12 -2.5,7 -1,2.5 Z" }, h);
        el("path", { "class": "bf-line", d: "M-2,2 C-5,4 -8,7 -10,10.5" }, h);
        var f = el("g", {}, g);
        el("path", { "class": "bf-wing", fill: "url(#" + id + "a)", d: "M-1,-2 C-3,-9 -9,-16 -17,-17 C-20.5,-17.4 -21.5,-13 -19.5,-9 C-16.5,-3.5 -8.5,-0.5 -1,0 Z" }, f);
        el("path", { "class": "bf-line", d: "M-2,-1.5 C-7,-5 -12,-10 -16.5,-14.5" }, f);
        el("path", { "class": "bf-edge", d: "M-17,-17 C-20.5,-17.4 -21.5,-13 -19.5,-9" }, f);
        el("circle", { "class": "bf-dot", cx: -15.5, cy: -12.5, r: 1.2 }, f);
        el("circle", { "class": "bf-dot", cx: -17.8, cy: -10, r: 0.75 }, f);
        fore.push(f); hind.push(h);
      });
      el("ellipse", { "class": "bf-body", cx: 0, cy: 2, rx: 1.3, ry: 7 }, s);
      el("circle", { "class": "bf-body", cx: 0, cy: -6, r: 1.7 }, s);
      el("path", { "class": "bf-ant", d: "M-0.6,-7 C-2,-12 -4,-14 -6.5,-15.5 M0.6,-7 C2,-12 4,-14 6.5,-15.5" }, s);
      el("circle", { "class": "bf-body", cx: -6.5, cy: -15.5, r: 0.8 }, s);
      el("circle", { "class": "bf-body", cx: 6.5, cy: -15.5, r: 0.8 }, s);
      d.__fore = fore; d.__hind = hind;
      return d;
    }
    function makeBee() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bee";
      var s = svg("-12 -11 24 20", d);
      var flip = el("g", {}, s);
      el("ellipse", { "class": "bee-wing", cx: 1, cy: -5, rx: 4, ry: 3, transform: "rotate(-20 1 -5)" }, flip);
      el("ellipse", { "class": "bee-wing", cx: 3, cy: -4.5, rx: 3.4, ry: 2.6, transform: "rotate(15 3 -4.5)" }, flip);
      el("ellipse", { "class": "bee-body", cx: 1, cy: 1, rx: 6.5, ry: 4.2 }, flip);
      el("path", { "class": "bee-stripe", d: "M0,-3 Q-1,1 0,5 M3,-3 Q2,1 3,5" }, flip);
      el("circle", { "class": "bee-head", cx: -6.2, cy: 0.5, r: 2.4 }, flip);
      el("path", { "class": "bee-sting", d: "M7.4,1 L9.4,1.4" }, flip);
      d.__flip = flip;
      return d;
    }
    function makeBird() {
      var d = document.createElement("div");
      d.className = "visitor visitor--bird";
      var s = svg("0 -2 24 12", d);
      d.__wing = el("path", { "class": "bird-line", d: BIRD_UP }, s);
      return d;
    }

    function angDiff(a, b) { var d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }

    var KINDS = {
      //       velocidade px/s  vaguear (rad)  rapidez da curva
      bfly: { make: makeButterfly, speed: 62, wander: 1.0, turn: 1.6 },
      bee:  { make: makeBee,       speed: 78, wander: 1.3, turn: 2.6 },
      bird: { make: makeBird,      speed: 170, wander: 0.18, turn: 1.2 }
    };
    var order = ["bfly", "bird", "bfly", "bee", "bfly", "bird", "bee"];
    var count = 0, busy = false, started = false;

    function fly(kind) {
      var K = KINDS[kind];
      var node = K.make();
      layer.appendChild(node);
      busy = true;
      var W = window.innerWidth, H = window.innerHeight;
      var ltr = Math.random() > 0.5;
      var x = ltr ? -40 : W + 40, y = H * (0.3 + Math.random() * 0.3);
      var goalY = H * (0.25 + Math.random() * 0.4);
      var heading = ltr ? 0 : Math.PI, speed = K.speed;
      var seeds = [Math.random() * 9, Math.random() * 9, Math.random() * 9];
      var flapPhase = 0, flapping = true, flapsLeft = 4, glideT = 0, wOpen = 1;
      var hoverT = 0, nextHover = 2 + Math.random() * 2, facing = ltr ? 1 : -1, tilt = 0;
      var birdWing = 0, glide = 0;
      var last = performance.now(), born = last;

      (function frame(now) {
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        var t = (now - born) / 1000;
        // Direção: rumo ao outro lado + vaguear suave (soma de senos lentos)
        var tx = ltr ? W + 200 : -200;
        var toward = Math.atan2(goalY - y, tx - x);
        var wander = K.wander * (0.6 * Math.sin(t * 0.7 + seeds[0]) + 0.3 * Math.sin(t * 1.9 + seeds[1]) + 0.1 * Math.sin(t * 4.3 + seeds[2]));
        var desired = toward + wander;
        heading += angDiff(desired, heading) * Math.min(1, K.turn * dt);
        var spd = speed;

        if (kind === "bfly") {
          // Batidas em série, depois plana com as asas abertas
          if (flapping) {
            flapPhase += dt * 2 * Math.PI * 6.5;
            if (flapPhase >= 2 * Math.PI) { flapPhase -= 2 * Math.PI; if (--flapsLeft <= 0) { flapping = false; glideT = 0.35 + Math.random() * 0.55; } }
            wOpen = 0.55 + 0.45 * Math.cos(flapPhase);
            spd *= 1.15;
          } else {
            glideT -= dt;
            wOpen += (0.92 + 0.05 * Math.sin(t * 9) - wOpen) * Math.min(1, dt * 10);
            spd *= 0.75;
            if (glideT <= 0) { flapping = true; flapsLeft = 2 + Math.floor(Math.random() * 4); flapPhase = 0; }
          }
          var lift = flapping ? -Math.sin(flapPhase) * 2.2 : 0.6;   // sobe a cada batida, desce ao planar
          y += lift * dt * 20;
          var hindW = 0.6 + 0.4 * wOpen;
          node.__fore.forEach(function (f) { f.setAttribute("transform", "scale(" + Math.max(0.12, wOpen).toFixed(3) + ",1)"); });
          node.__hind.forEach(function (h) { h.setAttribute("transform", "scale(" + Math.max(0.15, hindW * wOpen + 0.08).toFixed(3) + ",1)"); });
        }
        if (kind === "bee") {
          // De vez em quando para no ar, como se olhasse uma flor
          nextHover -= dt;
          if (nextHover <= 0 && hoverT <= 0) { hoverT = 0.9 + Math.random() * 0.8; nextHover = 2.5 + Math.random() * 2.5; }
          if (hoverT > 0) { hoverT -= dt; spd *= 0.12 + 0.88 * Math.pow(Math.max(0, 1 - hoverT) , 2); }
        }
        if (kind === "bird") {
          var cyc = Math.sin(t * 0.9 + seeds[0]);
          glide += ((cyc > 0.3 ? 1 : 0) - glide) * Math.min(1, dt * 3);
          birdWing += dt * 11 * (1 - glide * 0.85);
          var kk = (1 + Math.sin(birdWing)) / 2 * (1 - glide) + 0.35 * glide;
          var tips = 6 - 4 * kk, ctrl = -1 + 10 * kk;
          node.__wing.setAttribute("d", "M0," + tips.toFixed(2) + " Q6," + ctrl.toFixed(2) + " 12,6 Q18," + ctrl.toFixed(2) + " 24," + tips.toFixed(2));
        }

        x += Math.cos(heading) * spd * dt;
        y += Math.sin(heading) * spd * dt;
        if (y < H * 0.12) goalY = H * 0.45;                       // fica no meio da tela
        if (y > H * 0.82) goalY = H * 0.4;

        var tf;
        if (kind === "bfly") {
          tf = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + (heading * 180 / Math.PI + 90).toFixed(1) + "deg)";
        } else if (kind === "bee") {
          var vx = Math.cos(heading);
          facing += ((vx >= 0 ? -1 : 1) - facing) * Math.min(1, dt * 4);   // vira de lado suavemente
          tilt += (Math.sin(heading) * 18 - tilt) * Math.min(1, dt * 5);
          var bob = Math.sin(t * 5.2) * 2;
          tf = "translate3d(" + x.toFixed(1) + "px," + (y + bob).toFixed(1) + "px,0) rotate(" + (tilt * (vx >= 0 ? 1 : -1)).toFixed(1) + "deg)";
          node.__flip.setAttribute("transform", "scale(" + (Math.sign(facing) * Math.max(0.2, Math.abs(facing))).toFixed(3) + ",1)");
        } else {
          tilt += (Math.sin(heading) * 25 * (ltr ? 1 : -1) - tilt) * Math.min(1, dt * 3);
          tf = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0) rotate(" + tilt.toFixed(1) + "deg)";
        }
        node.style.transform = tf;

        var out = ltr ? x > W + 60 : x < -60;
        if (!out && t < 40) requestAnimationFrame(frame);
        else { node.remove(); busy = false; schedule(); }
      })(last);
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
