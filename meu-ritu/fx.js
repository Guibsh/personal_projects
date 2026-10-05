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

  /* 2. GALHO SECO QUE FLORESCE (seção do cansaço) -------------------------- */
  (function branch() {
    var box = document.querySelector(".branch");
    if (!box) return;
    var section = box.closest("section");
    var s = svg("0 0 300 190", box);
    var main = el("path", { "class": "branch__line", d: "M6,182 C70,160 110,130 160,96 S250,40 294,26" }, s);
    var twigs = [
      "M112,128 C116,108 128,96 142,86",
      "M196,66 C200,52 212,44 226,42",
      "M66,158 C56,144 56,128 64,116",
      "M244,48 C248,34 256,24 266,18"
    ].map(function (d) { return el("path", { "class": "branch__line branch__twig", d: d }, s); });

    var leaves = [];
    [0.18, 0.3, 0.42, 0.55, 0.68, 0.8, 0.92].forEach(function (f, i) {
      leaves.push(leafAt(s, main, f, i % 2 ? 1 : -1, 22 + (i % 2) * 4, "leaf leaf--grow"));
    });
    twigs.forEach(function (t, i) { leaves.push(leafAt(s, t, 0.6, i % 2 ? -1 : 1, 18, "leaf leaf--grow")); });
    var flowers = [[142, 86, 9], [226, 42, 8], [64, 116, 7], [266, 18, 8], [294, 26, 6]].map(function (f, i) {
      return flower(s, f[0], f[1], f[2], i * 90);
    });

    function update(vh) {
      var r = section.getBoundingClientRect();
      var p = reduced ? 1 : clamp((vh * 0.75 - r.top) / (r.height * 0.75), 0, 1);
      box.style.setProperty("--p", p.toFixed(3));
      leaves.forEach(function (l, i) { l.classList.toggle("is-on", p > 0.12 + i * (0.6 / leaves.length)); });
      flowers.forEach(function (f) { f.classList.toggle("is-on", p > 0.82); });
    }
    scrollers.push(update);
    update(window.innerHeight);
  })();

  /* 3. 20 DOS 1.440 MINUTOS ------------------------------------------------- */
  (function minutes() {
    var sec = document.querySelector(".minutes");
    if (!sec) return;
    var ticks = sec.querySelector(".minutes__ticks");
    for (var h = 0; h < 24; h++) {
      var a = h / 24 * Math.PI * 2;
      var r1 = 100, r2 = h % 6 === 0 ? 92 : 96;
      el("line", {
        x1: (110 + Math.sin(a) * r1).toFixed(1), y1: (110 - Math.cos(a) * r1).toFixed(1),
        x2: (110 + Math.sin(a) * r2).toFixed(1), y2: (110 - Math.cos(a) * r2).toFixed(1)
      }, ticks);
    }
    onceVisible(sec, function () { sec.classList.add("is-on"); }, 0.4);
    if (reduced) sec.classList.add("is-on");
  })();

  /* 4. NINHO COM 3 FILHOTES ------------------------------------------------- */
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

  /* 5. JARDIM DE 14 DIAS ---------------------------------------------------- */
  (function garden() {
    var box = document.querySelector(".garden");
    if (!box) return;
    var holder = box.querySelector(".garden__svg");
    var nEl = box.querySelector(".garden__n");
    var tEl = box.querySelector(".garden__t");
    var DAYS = [
      "O primeiro passo", "Acordar o corpo", "Força nas pernas", "Abdômen e postura",
      "Mais energia", "Mobilidade", "Metade do caminho", "Glúteos",
      "Braços e costas", "Resistência", "Corpo inteiro", "Constância",
      "Confiança", "De volta pra mim"
    ];
    var leaves = [], flowers = [], stem, stemLen, picked = false, lastDay = 0, mode = "";

    function build() {
      var wide = window.innerWidth >= 700;
      if ((wide ? "w" : "n") === mode) return;
      mode = wide ? "w" : "n";
      holder.innerHTML = "";
      leaves = []; flowers = [];
      var s = wide ? svg("0 0 1000 230", holder) : svg("0 0 600 300", holder);
      var d = wide
        ? "M20,170 C170,120 260,200 420,150 S690,80 900,118"
        : "M14,230 C110,170 170,260 280,190 S440,90 540,140";
      el("path", { "class": "garden__ghost", d: d }, s);
      stem = el("path", { "class": "garden__stem", d: d }, s);
      stemLen = stem.getTotalLength();
      stem.style.strokeDasharray = stemLen;
      DAYS.forEach(function (t, i) {
        var frac = 0.05 + i * (0.86 / 13);
        var leaf = leafAt(s, stem, frac, i % 2 ? 1 : -1, wide ? 40 : 46, "leaf leaf--grow garden__leaf");
        var hit = el("circle", { "class": "garden__hit", cx: 15, cy: 0, r: 17 }, leaf);
        leaf.setAttribute("tabindex", "0");
        leaf.setAttribute("role", "button");
        leaf.setAttribute("aria-label", "Dia " + (i + 1) + ": " + t);
        leaf.addEventListener("click", function () { picked = true; show(i); });
        leaf.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); picked = true; show(i); }
        });
        leaves.push(leaf);
      });
      var end = stem.getPointAtLength(stemLen);
      var fs = wide ? 1 : 1.25;
      [[0, -4, 11], [-16, 10, 8], [14, 14, 7], [-4, 26, 6]].forEach(function (f, i) {
        flowers.push(flower(s, end.x + f[0] * fs, end.y + f[1] * fs, f[2] * fs, i * 140));
      });
      runScroll();
    }

    function show(i) {
      leaves.forEach(function (l, k) { l.classList.toggle("is-active", k === i); });
      nEl.textContent = "Dia " + (i + 1);
      tEl.textContent = DAYS[i];
    }

    function update(vh) {
      if (!stem) return;
      var r = box.getBoundingClientRect();
      var p = reduced ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.55), 0, 1);
      stem.style.strokeDashoffset = (stemLen * (1 - p)).toFixed(1);
      var grown = 0;
      leaves.forEach(function (l, i) {
        var onNow = p >= 0.05 + i * (0.86 / 13);
        l.classList.toggle("is-on", onNow);
        if (onNow) grown = i + 1;
      });
      flowers.forEach(function (f) { f.classList.toggle("is-on", p >= 0.98); });
      if (!picked && grown && grown !== lastDay) { lastDay = grown; show(grown - 1); }
    }

    scrollers.push(update);
    build();
    window.addEventListener("resize", build);
  })();

  /* 6. PÁSSAROS QUE LEVANTAM VOO (CTA final) ------------------------------- */
  (function finalBirds() {
    var box = document.querySelector(".final__birds");
    if (!box) return;
    var section = box.closest("section");
    var s = svg("0 0 600 140", box);
    var branchPath = el("path", { "class": "final__branch", d: "M-10,118 C90,104 180,112 280,100 S440,84 520,90" }, s);
    leafAt(s, branchPath, 0.12, 1, 22, "leaf");
    leafAt(s, branchPath, 0.5, -1, 20, "leaf");
    leafAt(s, branchPath, 0.86, 1, 18, "leaf");
    var len = branchPath.getTotalLength();
    var PERCH = "M-8,1 L-1,-1 C0,-6 6,-8 9,-6 C10,-10 15,-11 16,-7 L19,-6.5 L16,-5.5 C16,-1 11,2 4,1.5 C1.5,1.3 0,0.5 -1,-1";
    [0.22, 0.34, 0.47, 0.62, 0.74].forEach(function (f, i) {
      var pt = branchPath.getPointAtLength(len * f);
      var g = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + (pt.y - 5).toFixed(1) + ") scale(1.45)" }, s);
      var bird = el("g", {
        "class": "pbird",
        style: "--dx:" + (180 + i * 50) + "px;--dy:" + (-170 - (i % 3) * 40) + "px;--delay:" + (i * 140) + "ms"
      }, g);
      var perch = el("g", { "class": "pbird__perch" }, bird);
      el("path", { d: PERCH }, perch);
      el("circle", { cx: 12.5, cy: -6.5, r: 0.8, "class": "pbird__eye" }, perch);
      el("path", { d: "M5,1.5 L5,5 M8,1.5 L8,5" }, perch);
      var fly = flyingBird(bird, 0.9);
      fly.setAttribute("class", "fbird pbird__fly");
      fly.setAttribute("transform", "translate(-4,-10)");
    });
    if (reduced) return;
    function takeOff() { section.classList.add("birds-away"); }
    onceVisible(section, function () { setTimeout(takeOff, 1600); }, 0.55);
    var btn = section.querySelector(".btn");
    if (btn) btn.addEventListener("mouseenter", takeOff);
  })();

  /* 7. PÉTALAS NA OFERTA ---------------------------------------------------- */
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
