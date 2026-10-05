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
    if (on("amanhecer") && !reduced) root.classList.add("fx-dawn");
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
        var g = el("g", { "class": "hero-bird", style: "animation-delay:" + (3.2 + b[3]) + "s" }, s);
        var inner = flyingBird(g, b[2]);
        inner.setAttribute("transform", "translate(" + b[0] + "," + b[1] + ")");
      });
    }
  })();

  /* 1b. O CICLO QUE SE ABRE (seção do cansaço) ----------------------------- */
  (function cycle() {
    var box = document.querySelector(".cycle");
    if (!box) return;
    var section = box.closest("section");
    var s = svg("0 0 340 240", box);
    var cx = 84, cy = 84, R = 58, C = 2 * Math.PI * R;
    var ox = cx + R, oy = cy;  // ponto onde o ciclo se abre (lado direito)
    var ring = el("path", { "class": "cycle__ring", d: "M" + ox + "," + oy + " A" + R + "," + R + " 0 1 1 " + (cx - R) + "," + cy + " A" + R + "," + R + " 0 1 1 " + ox + "," + oy }, s);
    var tail = el("path", { "class": "cycle__tail", d: "M" + ox + "," + oy + " C" + ox + "," + (oy + 46) + " " + (ox + 24) + "," + (oy + 96) + " " + (ox + 80) + "," + (oy + 112) + " S" + (ox + 160) + "," + (oy + 116) + " " + (ox + 178) + "," + (oy + 84) }, s);
    var tailLen = tail.getTotalLength();
    tail.style.strokeDasharray = tailLen;
    var end = tail.getPointAtLength(tailLen);
    var sprout = el("g", { transform: "translate(" + end.x.toFixed(1) + "," + end.y.toFixed(1) + ")" }, s);
    var l1 = el("g", { transform: "rotate(-70) scale(0.8)" }, sprout);
    var g1 = el("g", { "class": "leaf leaf--grow" }, l1);
    el("path", { "class": "leaf__shape", d: LEAF }, g1); el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g1);
    var l2 = el("g", { transform: "rotate(-130) scale(0.6)" }, sprout);
    var g2 = el("g", { "class": "leaf leaf--grow" }, l2);
    el("path", { "class": "leaf__shape", d: LEAF }, g2); el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g2);
    var fl = flower(sprout, 6, -26, 8, 120);
    var dot = el("circle", { "class": "cycle__dot", r: 4.5 }, s);

    var mode = "orbit", ang = -Math.PI / 2, o = 0, oTarget = 0, visible = false, last = 0;
    var TWO = Math.PI * 2;

    function draw() {
      var oo = mode === "exit" ? o : 0;
      ring.style.strokeDasharray = (C * (1 - 0.24 * oo)).toFixed(1) + " " + C.toFixed(1);
      ring.style.opacity = (1 - 0.45 * oo).toFixed(2);
      tail.style.strokeDashoffset = (tailLen * (1 - oo)).toFixed(1);
      var x, y;
      if (mode === "exit") { var p = tail.getPointAtLength(tailLen * o); x = p.x; y = p.y; }
      else { x = cx + Math.cos(ang) * R; y = cy + Math.sin(ang) * R; }
      dot.setAttribute("cx", x.toFixed(1)); dot.setAttribute("cy", y.toFixed(1));
      var bloom = mode === "exit" && o > 0.96;
      g1.classList.toggle("is-on", bloom); g2.classList.toggle("is-on", bloom); fl.classList.toggle("is-on", bloom);
    }

    function frame(t) {
      var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
      last = t;
      o += (oTarget - o) * (mode === "exit" ? 0.035 : 0.1);
      if (mode === "orbit") {
        var before = ang;
        ang += dt * (oTarget > 0.02 ? 4.2 : 1.6);            // gira; acelera para sair
        var crossed = Math.floor(before / TWO) !== Math.floor(ang / TWO);
        if (oTarget > 0.02 && crossed) { mode = "exit"; o = 0; }
      } else if (oTarget <= 0.01 && o < 0.02) {
        mode = "orbit"; ang = 0;                                 // volta para o ciclo
      }
      draw();
      if (visible) requestAnimationFrame(frame); else last = 0;
    }

    // Gira enquanto a pessoa lê; abre ~3s depois que a última frase aparece.
    // Se a seção sai da tela, o ciclo volta a girar (e se abre de novo na volta).
    var lastPhrase = section.querySelector(".pain__list li:last-child") || box;
    var openTimer;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e) {
        if (e[0].isIntersecting) {
          clearTimeout(openTimer);
          openTimer = setTimeout(function () { oTarget = 1; }, 3000);
        }
      }, { threshold: 1 }).observe(lastPhrase);
      new IntersectionObserver(function (e) {
        if (!e[0].isIntersecting) { clearTimeout(openTimer); oTarget = 0; o = 0; mode = "orbit"; }
      }).observe(section);
    }

    if (reduced) { mode = "exit"; o = 1; draw(); return; }
    new IntersectionObserver(function (e) {
      var was = visible;
      visible = e[0].isIntersecting;
      if (visible && !was) requestAnimationFrame(frame);
    }).observe(box);
    draw();
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

  /* 2. 20 DOS 1.440 MINUTOS: acompanha a rolagem de forma contínua -------- */
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

    function render(p) {
      var day = stage(p, 0.02, 0.4);
      track.style.strokeDashoffset = (1000 * (1 - day)).toFixed(1);
      tickEls.forEach(function (t, i) { t.style.opacity = day * 24 > i ? 1 : 0; });
      dayNum.textContent = Math.round(1440 * day).toLocaleString("pt-BR");
      sec.style.setProperty("--swap", stage(p, 0.42, 0.54).toFixed(3));
      var mine = stage(p, 0.46, 0.8);
      slice.style.strokeDasharray = (20 * mine).toFixed(2) + " 1440";
      slice.style.opacity = mine > 0 ? 1 : 0;
      youNum.textContent = Math.round(20 * mine);
      sec.style.setProperty("--line2", stage(p, 0.46, 0.62).toFixed(3));
      sec.style.setProperty("--line3", stage(p, 0.74, 0.88).toFixed(3));
    }

    // Sem travar a página: o progresso segue a posição da seção na tela,
    // suavizado a cada quadro para o movimento ficar contínuo.
    var target = 0, cur = 0, raf = 0;
    function tick() {
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0008) { cur = target; raf = 0; } else raf = requestAnimationFrame(tick);
      render(cur);
    }
    function update(vh) {
      var r = sec.getBoundingClientRect();
      target = reduced ? 1 : clamp((vh * 0.9 - r.top) / (vh * 0.6 + r.height * 0.9), 0, 1);
      if (reduced) { cur = target; render(cur); return; }
      if (!raf) raf = requestAnimationFrame(tick);
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
    var FLOWER_DAYS = [2, 5, 8, 10, 12];

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
        var tilt = [35, 22, 44, 30, 18, 40, 27][i % 7];        // varia o ângulo e o tamanho
        var size = [0.85, 0.72, 0.95, 0.8, 0.9, 0.7, 0.88][(i * 3) % 7];
        var outer = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ") rotate(" + (side > 0 ? -tilt : 180 + tilt) + ") scale(" + size + ")" }, s);
        var g = el("g", { "class": "leaf leaf--grow" }, outer);
        el("path", { "class": "leaf__shape", d: LEAF }, g);
        el("path", { "class": "leaf__vein", d: LEAF_VEIN }, g);
        if (FLOWER_DAYS.indexOf(i) > -1) {
          // Alguns dias brotam com uma florzinha do outro lado do caule
          var fo = el("g", { transform: "translate(" + pt.x.toFixed(1) + "," + pt.y.toFixed(1) + ")" }, s);
          var stalk = el("g", { "class": "leaf leaf--grow" }, fo);
          var fx2 = -side * 22, fy2 = -18;
          el("path", { "class": "journey__stalk", d: "M0,0 Q" + (fx2 * 0.4) + "," + (fy2 * 0.2) + " " + fx2 + "," + fy2 }, stalk);
          var f = flower(fo, fx2, fy2, 8.5 + (i % 3), 250);
          g.__flower = f; g.__stalk = stalk;
        }
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
        var lf = leaves[i];
        if (lf) {
          lf.classList.toggle("is-on", onNow);
          if (lf.__flower) { lf.__flower.classList.toggle("is-on", onNow); lf.__stalk.classList.toggle("is-on", onNow); }
        }
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

  /* 7. BORBOLETA VISITANTE: aparece algumas vezes, pousa e vai embora ------ */
  (function butterfly() {
    if (!on("borboleta") || reduced) return;
    var targets = [".story h2", ".journey__title", ".fit h2", ".offer__card", ".faq h2"]
      .map(function (q) { return document.querySelector(q); }).filter(Boolean);
    if (!targets.length) return;

    var layer = document.createElement("div");
    layer.className = "bfly-layer";
    layer.setAttribute("aria-hidden", "true");
    var b = document.createElement("div");
    b.className = "bfly";
    var s = svg("-20 -16 40 32", b);
    var WING_UP = "M-1,-2 C-7,-15 -20,-15 -18,-4 C-17,2 -8,2 -1,0Z";
    var WING_LOW = "M-1,1 C-8,2 -15,8 -11,13 C-8,16 -3,10 -1,3Z";
    ["bfly__wl", "bfly__wr"].forEach(function (cls, k) {
      var side = el("g", { transform: k ? "scale(-1,1)" : "" }, s);
      var w = el("g", { "class": "bfly__wing " + cls }, side);
      el("path", { "class": "bfly__up", d: WING_UP }, w);
      el("path", { "class": "bfly__low", d: WING_LOW }, w);
      el("path", { "class": "bfly__vein", d: "M-2,-1 C-7,-6 -11,-9 -15,-9 M-2,2 C-5,5 -8,8 -10,11" }, w);
    });
    el("path", { "class": "bfly__body", d: "M0,-6 L0,9" }, s);
    el("path", { "class": "bfly__ant", d: "M0,-6 C-1,-10 -3,-12 -6,-13 M0,-6 C1,-10 3,-12 6,-13" }, s);
    layer.appendChild(b);
    document.body.appendChild(layer);

    var state = "idle", visits = 0, lastVisit = 0, born = Date.now(), pos = { x: 0, y: 0 }, timer;
    var MAX_VISITS = 4;

    function place(x, y, tilt) {
      pos.x = x; pos.y = y;
      b.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px) rotate(" + (tilt || 0).toFixed(1) + "deg)";
    }
    function fly(to, done) {
      var from = { x: pos.x, y: pos.y };
      var dx = to.x - from.x, dy = to.y - from.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      var dur = clamp(dist / 0.23, 1600, 5200);
      var c1 = { x: from.x + dx * 0.3 + (Math.random() - 0.5) * 220, y: from.y + dy * 0.2 - 80 - Math.random() * 120 };
      var c2 = { x: from.x + dx * 0.75 + (Math.random() - 0.5) * 160, y: to.y - 60 - Math.random() * 80 };
      var t0 = performance.now();
      b.classList.add("is-flying");
      (function step(now) {
        var t = clamp((now - t0) / dur, 0, 1);
        var e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        var u = 1 - e;
        var x = u * u * u * from.x + 3 * u * u * e * c1.x + 3 * u * e * e * c2.x + e * e * e * to.x;
        var y = u * u * u * from.y + 3 * u * u * e * c1.y + 3 * u * e * e * c2.y + e * e * e * to.y;
        y += Math.sin(t * Math.PI * 7) * 9 * (1 - e);           // voo ondulado
        place(x, y, Math.sin(t * Math.PI * 5) * 14 * (1 - e));
        if (t < 1) requestAnimationFrame(step);
        else { b.classList.remove("is-flying"); done && done(); }
      })(t0);
    }
    function landingPoint(t) {
      var rect;
      if (t.matches(".offer__card")) rect = t.getBoundingClientRect();
      else { var rg = document.createRange(); rg.selectNodeContents(t); rect = rg.getBoundingClientRect(); }
      var x = t.matches(".offer__card") ? rect.left + rect.width * 0.78 : rect.right - 8;
      return { x: x + window.scrollX, y: rect.top + window.scrollY - 12 };
    }
    function leave() {
      if (state !== "landed") return;
      clearTimeout(timer);
      state = "leaving";
      b.classList.remove("is-landed");
      var right = Math.random() > 0.5;
      fly({ x: window.scrollX + (right ? window.innerWidth + 60 : -60), y: window.scrollY - 40 }, function () {
        state = "idle"; b.classList.remove("is-on");
      });
    }
    function visit(t) {
      state = "arriving"; visits++; lastVisit = Date.now();
      var fromRight = Math.random() > 0.5;
      place(window.scrollX + (fromRight ? window.innerWidth + 50 : -50), window.scrollY + window.innerHeight * (0.15 + Math.random() * 0.3));
      b.classList.add("is-on");
      fly(landingPoint(t), function () {
        state = "landed";
        b.classList.add("is-landed");
        timer = setTimeout(leave, 5500 + Math.random() * 2500);
      });
    }
    b.addEventListener("click", leave);
    b.addEventListener("mouseenter", function () { if (state === "landed") setTimeout(leave, 250); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || state !== "idle" || visits >= MAX_VISITS) return;
        if (Date.now() - born < 4000 || Date.now() - lastVisit < 12000) return;
        if (en.target.dataset.visited) return;
        en.target.dataset.visited = "1";
        visit(en.target);
      });
    }, { threshold: 0.9, rootMargin: "0px 0px -15% 0px" });
    targets.forEach(function (t) { io.observe(t); });
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
