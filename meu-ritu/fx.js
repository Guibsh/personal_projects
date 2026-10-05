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
        var g = el("g", { "class": "hero-bird", style: "animation-delay:" + (1.4 + b[3]) + "s" }, s);
        var inner = flyingBird(g, b[2]);
        inner.setAttribute("transform", "translate(" + b[0] + "," + b[1] + ")");
      });
    }
  })();

  /* 2. 20 DOS 1.440 MINUTOS: anima com a rolagem (e desfaz ao voltar) ------- */
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
    function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function stage(p, a, b) { return ease(clamp((p - a) / (b - a), 0, 1)); }

    // Fases (p de 0 a 1 ao longo da seção alta):
    // 0.05–0.45 relógio do dia se desenha e conta até 1.440
    // 0.50–0.62 troca o centro para "minutos para você"
    // 0.55–0.85 a fatia verde cresce devagar de 0 a 20
    // 0.85–0.95 frase final aparece
    function update(vh) {
      var p;
      if (reduced) p = 1;
      else {
        var r = sec.getBoundingClientRect();
        p = clamp(-r.top / Math.max(1, r.height - vh), 0, 1);
      }
      var day = stage(p, 0.05, 0.45);
      track.style.strokeDashoffset = (1000 * (1 - day)).toFixed(1);
      tickEls.forEach(function (t, i) { t.style.opacity = day * 24 > i ? 1 : 0; });
      dayNum.textContent = Math.round(1440 * day).toLocaleString("pt-BR");
      var swap = stage(p, 0.5, 0.62);
      sec.style.setProperty("--swap", swap.toFixed(3));
      var mine = stage(p, 0.55, 0.85);
      slice.style.strokeDasharray = (20 * mine).toFixed(2) + " 1440";
      slice.style.opacity = mine > 0 ? 1 : 0;
      youNum.textContent = Math.round(20 * mine);
      sec.style.setProperty("--line2", stage(p, 0.55, 0.7).toFixed(3));
      sec.style.setProperty("--line3", stage(p, 0.82, 0.95).toFixed(3));
    }
    scrollers.push(update);
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

    function build() {
      holder.innerHTML = "";
      leaves = []; flowers = []; marks = [];
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
        var outer = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ") rotate(" + (side > 0 ? -35 : 215) + ") scale(0.85)" }, s);
        var g = el("g", { "class": "leaf leaf--grow" }, outer);
        el("path", { "class": "leaf__shape", d: LEAF }, g);
        el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g);
        leaves.push(g);
      });
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
        leaves[i] && leaves[i].classList.toggle("is-on", onNow);
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

  runScroll();
})();
