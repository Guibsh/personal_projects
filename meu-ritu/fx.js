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

  // Borboleta vista de lado (olhando para a direita), em 3 espécies ---------
  // setWings(k): k=1 asas para cima (fechadas), k~0.15 asas abertas/baixas.
  var BF_SPECIES = {
    rose:  { fore: ["#FDF0EA", "#E3A595"], hind: ["#FAE3DA", "#E8B5A8"], edge: "#B5705F", vein: "#C08A7C", veinW: 0.3, dots: "#FFFFFF", eye: true },
    sky:   { fore: ["#EEF2FA", "#8EA3D3"], hind: ["#E2E8F6", "#A7B7E0"], edge: "#4F5B85", vein: "#8090BB", veinW: 0.3, dots: "#FFFFFF", eye: true },
    honey: { fore: ["#FDEBC8", "#E39A3F"], hind: ["#FADFAE", "#EAAE5C"], edge: "#5E4030", vein: "#5E4030", veinW: 0.45, dots: "#FFF4E2", eye: false }
  };
  var bfUid = 0;
  var BF_FORE = "M0,-1 C-2,-8 -1,-15 3,-21 C5,-23.5 10,-23.5 12,-21 C13,-19 12,-16 10,-13 C7,-8 3.5,-4 0.8,-0.6 Z";
  var BF_HIND = "M-0.4,-0.6 C-4,-1 -10,-3 -13,-7.5 C-15,-11 -13,-15 -9.5,-14.5 C-6.5,-14 -4,-10.5 -2.5,-7 C-1.5,-4.5 -0.6,-2.5 0,-1 Z";
  function sideButterfly(parent, species) {
    var sp = BF_SPECIES[species] || BF_SPECIES.rose;
    var id = "sbf" + (++bfUid);
    var g = el("g", { "class": "sbf" }, parent);
    var defs = el("defs", {}, g);
    [["f", sp.fore], ["h", sp.hind]].forEach(function (p) {
      var lg = el("linearGradient", { id: id + p[0], x1: "0", y1: "1", x2: "0.5", y2: "0" }, defs);
      el("stop", { offset: "0", "stop-color": p[1][0] }, lg);
      el("stop", { offset: "1", "stop-color": p[1][1] }, lg);
    });
    function wingSet() {
      var w = el("g", {}, g);
      var line = { fill: "none", stroke: sp.vein, "stroke-width": sp.veinW, "stroke-linecap": "round", opacity: 0.8 };
      el("path", { d: BF_HIND, fill: "url(#" + id + "h)", stroke: sp.edge, "stroke-width": 0.4, "stroke-linejoin": "round" }, w);
      el("path", Object.assign({ d: "M-0.6,-1 C-4,-4 -8,-8 -11,-11 M-0.6,-0.8 C-4,-2 -8,-4.5 -12,-7" }, line), w);
      el("path", { d: "M-13,-7.5 C-15,-11 -13,-15 -9.5,-14.5", fill: "none", stroke: sp.edge, "stroke-width": 1.3, "stroke-linecap": "round", opacity: 0.75 }, w);
      if (sp.eye) {
        el("circle", { cx: -9.2, cy: -10.6, r: 1.5, fill: sp.edge, opacity: 0.85 }, w);
        el("circle", { cx: -9.2, cy: -10.6, r: 0.6, fill: "#fff" }, w);
      }
      el("path", { d: BF_FORE, fill: "url(#" + id + "f)", stroke: sp.edge, "stroke-width": 0.4, "stroke-linejoin": "round" }, w);
      el("path", Object.assign({ d: "M0.6,-1 C1,-8 2,-14 4.5,-19.5 M0.8,-1 C3,-7 6,-12 9.5,-16 M0.8,-0.8 C3.5,-4 6.5,-8 9.5,-11.5" }, line), w);
      el("path", { d: "M3,-21 C5,-23.5 10,-23.5 12,-21 C13,-19 12,-16 10,-13", fill: "none", stroke: sp.edge, "stroke-width": 2.2, "stroke-linecap": "round", opacity: 0.9 }, w);
      [[5.6, -21.9, 0.5], [8.4, -22.4, 0.55], [10.9, -20.6, 0.5], [11.4, -17.4, 0.45], [10.4, -14.6, 0.4]].forEach(function (d) {
        el("circle", { cx: d[0], cy: d[1], r: d[2], fill: sp.dots }, w);
      });
      return w;
    }
    var far = wingSet();
    far.setAttribute("opacity", "0.5");
    var ink = "#45302A";
    el("path", { d: "M-9,0.8 C-6,1.9 -1,1.9 2,0.9 C0,-0.5 -6,-0.5 -9,0.8 Z", fill: ink }, g);
    el("path", { d: "M-7,0.2 L-7,1.4 M-5,0 L-5,1.6 M-3,0 L-3,1.6", stroke: "#6B5244", "stroke-width": 0.25 }, g);
    el("ellipse", { cx: 3.4, cy: 0, rx: 2.2, ry: 1.5, fill: ink }, g);
    el("circle", { cx: 6.4, cy: -0.5, r: 1.25, fill: ink }, g);
    el("path", { d: "M6.8,-1.6 C8.2,-6 10,-9.5 12.6,-11.4 M6.4,-1.7 C7.2,-6 8.2,-10 9.8,-12.6 M2.2,1.3 L1.6,3.8 M4.2,1.3 L4.8,3.8", fill: "none", stroke: ink, "stroke-width": 0.38, "stroke-linecap": "round" }, g);
    el("circle", { cx: 12.7, cy: -11.5, r: 0.6, fill: ink }, g);
    el("circle", { cx: 9.9, cy: -12.7, r: 0.55, fill: ink }, g);
    var near = wingSet();
    return {
      g: g,
      setWings: function (k) {
        near.setAttribute("transform", "translate(1.6,-1) scale(1," + k.toFixed(3) + ") translate(0,1)");
        var kf = k * 0.92 - 0.06;
        far.setAttribute("transform", "translate(0.4,-1.4) scale(0.95," + kf.toFixed(3) + ") translate(0,1)");
      }
    };
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
    if (reduced) { section.classList.remove("is-foggy"); return; }

    var lastY = window.scrollY, kept = items.map(function () { return 0; }), keptWarm = 0;
    // Frase que aparece inteira na tela clareia sozinha em poucos instantes
    // (no notebook a seção cabe toda na tela e ninguém precisa rolar para ler)
    var seen = items.map(function () { return false; }), queue = 0;
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var i = items.indexOf(en.target);
          io.unobserve(en.target);
          setTimeout(function () { seen[i] = true; runScroll(); }, 450 + (queue++) * 550);
        });
      }, { threshold: 0.95 });
      items.forEach(function (li) { io.observe(li); });
    }
    scrollers.push(function (vh) {
      var r = section.getBoundingClientRect();
      var goingDown = window.scrollY >= lastY;
      lastY = window.scrollY;
      if (r.bottom < -100 || r.top > vh + 100) return;
      var line = vh * 0.6;                        // linha de leitura
      var lr = last.getBoundingClientRect();
      // A luz esquenta quando a última frase passa pela linha de leitura
      var warm = seen.every(Boolean) ? 1 : clamp((line + vh * 0.12 - (lr.top + lr.height / 2)) / (vh * 0.22), 0, 1);
      // Descendo, nada volta a desfocar; só subindo a neblina pode voltar
      warm = goingDown ? Math.max(warm, keptWarm) : warm;
      keptWarm = warm;
      section.style.setProperty("--warm", warm.toFixed(3));
      items.forEach(function (li, i) {
        var b = li.getBoundingClientRect();
        var sdist = (b.top + b.height / 2 - line) / (vh * 0.32);
        // Já lida (acima): fica clara. Por ler (abaixo): na neblina.
        var clarity = sdist < 0 ? 1 : 1 - Math.min(1, sdist);
        clarity = Math.max(clarity, warm, seen[i] ? 1 : 0);
        if (goingDown) clarity = Math.max(clarity, kept[i]);
        kept[i] = clarity;
        li.style.setProperty("--clarity", clarity.toFixed(3));
      });
    });
  })();

  /* 1d. TREPADEIRA EM VOLTA DA FOTO DO "QUEM CONDUZ" ------------------------
     Com a rolagem, ramos entrelaçados nascem nos cantos de baixo e sobem
     contornando o arco, brotando folhas e flores de vários tipos. No fim,
     uma borboleta sai de uma flor e fica visitando as outras. */
  (function vine() {
    var box = document.querySelector(".vine");
    if (!box) return;
    var fig = box.parentElement, arch = fig.querySelector(".arch");
    var M = 30;                                   // folga em volta da foto (menor no celular)
    var vines = [], decos = [], blooms = [], g = 0, target = 0, raf = 0, bfly = null;

    // Florzinhas de tipos diferentes ------------------------------------
    function daisy(p, x, y, r) {
      var o = el("g", { transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")" }, p);
      var f = el("g", { "class": "flower" }, o);
      for (var i = 0; i < 11; i++) el("ellipse", { "class": "daisy__petal", cx: 0, cy: -r * 0.6, rx: r * 0.17, ry: r * 0.55, transform: "rotate(" + (i * 360 / 11).toFixed(1) + ")" }, f);
      el("circle", { "class": "flower__core", r: r * 0.3 }, f);
      return f;
    }
    function bell(p, x, y, r, ang) {
      var o = el("g", { transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + (ang || 0) + ")" }, p);
      var f = el("g", { "class": "flower" }, o);
      el("path", { "class": "bell__stem", d: "M0,0 Q" + (r * 0.5) + "," + (r * 0.4) + " " + (r * 0.6) + "," + (r * 1.1) }, f);
      el("path", { "class": "bell__cup", d: "M" + (r * 0.6 - r * 0.55) + "," + (r * 1.1) + " C" + (r * 0.6 - r * 0.6) + "," + (r * 2.1) + " " + (r * 0.6 + r * 0.6) + "," + (r * 2.1) + " " + (r * 0.6 + r * 0.55) + "," + (r * 1.1) + " L" + (r * 0.6 + r * 0.35) + "," + (r * 2.1) + " L" + (r * 0.6) + "," + (r * 1.8) + " L" + (r * 0.6 - r * 0.35) + "," + (r * 2.1) + " Z" }, f);
      return f;
    }
    function forget(p, x, y, r) {
      var o = el("g", { transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ")" }, p);
      var f = el("g", { "class": "flower" }, o);
      for (var i = 0; i < 5; i++) el("circle", { "class": "forget__petal", cx: (Math.sin(i * 1.2566) * r * 0.55).toFixed(2), cy: (-Math.cos(i * 1.2566) * r * 0.55).toFixed(2), r: r * 0.45 }, f);
      el("circle", { "class": "forget__core", r: r * 0.22 }, f);
      return f;
    }
    function bud(p, x, y, ang) {
      var o = el("g", { transform: "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") rotate(" + ang + ")" }, p);
      var f = el("g", { "class": "flower" }, o);
      el("ellipse", { "class": "flower__petal", cx: 0, cy: -3.4, rx: 2.4, ry: 4 }, f);
      el("path", { "class": "bud__sepal", d: "M-2.6,-1 Q0,1.5 2.6,-1 L0,0.8 Z" }, f);
      return f;
    }

    function build() {
      box.innerHTML = ""; vines = []; decos = []; blooms = [];
      if (bfly) { bfly.stop(); bfly = null; }
      var w = arch.offsetWidth, h = arch.offsetHeight;
      if (!w || !h) return;
      var small = w < 380;
      M = small ? 16 : 30;
      box.style.inset = (-M) + "px";
      var W = w + 2 * M, H = h + 2 * M;
      var s = svg("0 0 " + W + " " + H, box);
      s.setAttribute("width", W); s.setAttribute("height", H);
      var r = w / 2, side = h - r, arcL = Math.PI * r, L = 2 * side + arcL;
      // Ponto no contorno do arco (s: 0 = canto inferior esquerdo, 1 = inferior direito)
      function P(t, off) {
        var d = t * L, x, y, nx, ny;
        if (d < side) { x = 0; y = h - d; nx = -1; ny = 0; }
        else if (d < side + arcL) { var a = Math.PI - (d - side) / r; x = r + r * Math.cos(a); y = r - r * Math.sin(a); nx = Math.cos(a); ny = -Math.sin(a); }
        else { x = w; y = r + (d - side - arcL); nx = 1; ny = 0; }
        return { x: M + x + nx * off, y: M + y + ny * off, nx: nx, ny: ny };
      }
      function smooth(pts) {
        var d = "M" + pts[0].x.toFixed(1) + "," + pts[0].y.toFixed(1);
        for (var i = 0; i < pts.length - 1; i++) {
          var p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
          d += " C" + (p1.x + (p2.x - p0.x) / 6).toFixed(1) + "," + (p1.y + (p2.y - p0.y) / 6).toFixed(1) + " " +
               (p2.x - (p3.x - p1.x) / 6).toFixed(1) + "," + (p2.y - (p3.y - p1.y) / 6).toFixed(1) + " " + p2.x.toFixed(1) + "," + p2.y.toFixed(1);
        }
        return d;
      }
      // Dois pares de ramos (um de cada lado), cada par se enrolando no outro
      var defs = [
        { a: 0, b: 0.57, phase: 0, cls: "vine__main", delay: 0 },
        { a: 0, b: 0.5, phase: Math.PI, cls: "vine__twin", delay: 0.06 },
        { a: 1, b: 0.43, phase: 0.8, cls: "vine__main", delay: 0.02 },
        { a: 1, b: 0.5, phase: 0.8 + Math.PI, cls: "vine__twin", delay: 0.09 }
      ];
      var waves = Math.max(5, Math.round(L / 70));
      defs.forEach(function (v, vi) {
        var pts = [], n = 60;
        for (var i = 0; i <= n; i++) {
          var t = v.a + (v.b - v.a) * i / n;
          var off = (small ? 5 : 9) + (small ? 4 : 6) * Math.sin(t * waves * Math.PI * 2 + v.phase);
          pts.push(P(t, off));
        }
        var path = el("path", { "class": v.cls, d: smooth(pts) }, s);
        var len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        vines.push({ path: path, len: len, delay: v.delay });
        // Enfeites ao longo do ramo
        var main = v.cls === "vine__main";
        var step = main ? 24 : 40, k = 0, outS = v.a === 0 ? -1 : 1;
        for (var dd = 18; dd < len - 6; dd += step + ((k * 7) % 11)) {
          var p = path.getPointAtLength(dd), p2 = path.getPointAtLength(Math.min(len, dd + 1));
          var ang = Math.atan2(p2.y - p.y, p2.x - p.x) * 180 / Math.PI;
          var frac = dd / len, sd = k % 2 ? 1 : -1;
          var o = el("g", { transform: "translate(" + p.x.toFixed(1) + "," + p.y.toFixed(1) + ")" }, s);
          var nodes = [];
          // folha (às vezes duas)
          var lo = el("g", { transform: "rotate(" + (ang + sd * (50 + (k * 13) % 25)).toFixed(1) + ") scale(" + (main ? 0.62 + (k % 3) * 0.1 : 0.48) + ")" }, o);
          var lf = el("g", { "class": "leaf leaf--grow" }, lo);
          el("path", { "class": "leaf__shape", d: LEAF }, lf); el("path", { "class": "leaf__vein", d: LEAF_VEIN }, lf);
          nodes.push(lf);
          if (main && k % 4 === 1) {
            // gavinha enroladinha
            var tg = el("g", { "class": "leaf leaf--grow", transform: "rotate(" + (ang - sd * 70).toFixed(1) + ")" }, o);
            el("path", { "class": "vine__tendril", d: "M0,0 C4,-2 8,-2 9,1 C10,4 7,6 5.5,4.2 C4.5,3 5.6,1.6 6.8,2.4" }, tg);
            nodes.push(tg);
          }
          // flores: mais concentradas no alto do arco
          var nearTop = p.y < M + r * 1.15;
          var pick = (k * 5 + vi * 3) % 7;
          if (main && (nearTop ? k % 3 !== 1 : k % 3 === 2)) {
            var na = (ang + outS * 90) * Math.PI / 180, dist = 8 + (k % 2) * 4;
            var fx = dist * Math.cos(na), fy = dist * Math.sin(na);
            var fl;
            if (pick === 0 || pick === 4) fl = flower(o, fx, fy, 8.5, 0);
            else if (pick === 1) fl = daisy(o, fx, fy, 9.5);
            else if (pick === 2 || pick === 5) fl = forget(o, fx, fy, 6);
            else if (pick === 3) fl = bell(o, fx, fy, 5.5, ang + outS * 60);
            else fl = bud(o, fx, fy, ang - 90);
            nodes.push(fl);
            if (pick !== 6) blooms.push({ x: p.x + fx, y: p.y + fy, frac: frac, vine: vi });
          } else if (!main && k % 3 === 1) {
            nodes.push(forget(o, outS * 6 * Math.cos((ang + 90) * Math.PI / 180), outS * 6 * Math.sin((ang + 90) * Math.PI / 180), 4.4));
          }
          decos.push({ vine: vi, frac: frac, nodes: nodes });
          k++;
        }
      });
      bfly = butterflyLife(s);
      apply(g);
    }

    function apply(gg) {
      vines.forEach(function (v, i) {
        var pv = clamp((gg - v.delay) / (1 - v.delay), 0, 1);
        v.path.style.strokeDashoffset = (v.len * (1 - pv)).toFixed(1);
        v.p = pv;
      });
      decos.forEach(function (d) {
        var onD = vines[d.vine].p >= d.frac + 0.015;
        d.nodes.forEach(function (n) { n.classList.toggle("is-on", onD); });
      });
      if (bfly) bfly.update(gg);
    }

    // A borboleta que mora na trepadeira ---------------------------------
    function butterflyLife(s) {
      if (reduced || !blooms.length) return null;
      var top = blooms.slice().sort(function (a, b) { return a.y - b.y; }).slice(0, 5);
      var low = blooms.slice().sort(function (a, b) { return b.y - a.y; })[0];
      var wrap = el("g", { "class": "vine__bfly" }, s);
      var flip = el("g", {}, wrap);
      var bf = sideButterfly(flip, ["rose", "sky", "honey"][Math.floor(Math.random() * 3)]);
      var state = "hidden", x = low.x, y = low.y, face = 1, scale = 0, wing = 1, t0 = 0, from = null, to = null, dur = 0, rest = 0, alive = true, rafB = 0;
      var cur = 0;
      function place() {
        wrap.setAttribute("transform", "translate(" + x.toFixed(1) + "," + (y - 4).toFixed(1) + ") scale(" + (0.62 * scale).toFixed(3) + ")");
        flip.setAttribute("transform", "scale(" + face.toFixed(3) + ",1)");
        bf.setWings(wing);
      }
      function goTo(b) {
        from = { x: x, y: y }; to = b; t0 = performance.now();
        var dist = Math.hypot(b.x - x, b.y - y);
        dur = 1800 + dist * 9; state = "flying";
      }
      function loop(now) {
        if (!alive) return;
        var t = now / 1000;
        if (state === "emerging") {
          var e = clamp((now - t0) / 1600, 0, 1);
          scale = 1 - Math.pow(1 - e, 3);
          wing = 1 - 0.5 * Math.sin(e * Math.PI);
          if (e >= 1) goTo(cur = top[0]);
        } else if (state === "flying") {
          var u = clamp((now - t0) / dur, 0, 1), ee = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          var cx = (from.x + to.x) / 2, cy = Math.min(from.y, to.y) - 40;
          var nx = (1 - ee) * (1 - ee) * from.x + 2 * (1 - ee) * ee * cx + ee * ee * to.x;
          var ny = (1 - ee) * (1 - ee) * from.y + 2 * (1 - ee) * ee * cy + ee * ee * to.y + Math.sin(u * Math.PI * 6) * 3 * (1 - ee);
          var dir = nx >= x ? 1 : -1;
          face += (dir - face) * 0.08;
          x = nx; y = ny;
          wing = 0.2 + 0.8 * (0.5 + 0.5 * Math.cos(t * 2 * Math.PI * 5));
          if (u >= 1) { state = "resting"; rest = now + 5500 + Math.random() * 3500; }
        } else if (state === "resting") {
          // pousada: abre e fecha as asas devagar
          wing = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(t * 1.6));
          if (now > rest) {
            var next = top[Math.floor(Math.random() * top.length)];
            if (next === cur) next = top[(top.indexOf(cur) + 1) % top.length];
            goTo(cur = next);
          }
        }
        place();
        rafB = requestAnimationFrame(loop);
      }
      place();
      return {
        update: function (gg) {
          if (state === "hidden" && gg > 0.97) {
            state = "emerging"; t0 = performance.now(); x = low.x; y = low.y; scale = 0;
            wrap.classList.add("is-on");
            if (!rafB) rafB = requestAnimationFrame(loop);
          } else if (state !== "hidden" && gg < 0.55) {
            state = "hidden"; scale = 0; wrap.classList.remove("is-on");
            cancelAnimationFrame(rafB); rafB = 0; place();
          }
        },
        stop: function () { alive = false; cancelAnimationFrame(rafB); }
      };
    }

    function tick() {
      g += (target - g) * 0.07;
      if (Math.abs(target - g) < 0.0005) { g = target; raf = 0; } else raf = requestAnimationFrame(tick);
      apply(g);
    }
    scrollers.push(function (vh) {
      var r = fig.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      target = reduced ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.62 + r.height * 0.25), 0, 1);
      if (reduced) { g = 1; apply(g); return; }
      if (!raf) raf = requestAnimationFrame(tick);
    });
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(build, 200); });
    var img = arch.querySelector("img");
    if (img && !img.complete) img.addEventListener("load", build);
    build();
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

  /* 2. 15 DOS 1.440 MINUTOS: animação contínua, toca uma vez ao aparecer --- */
  (function minutes() {
    var sec = document.querySelector(".minutes");
    if (!sec) return;
    var ticks = sec.querySelector(".minutes__ticks");
    ticks.innerHTML = "";
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
    var MINE = parseInt(youNum.textContent, 10) || 15;   // minutos "seus" (vem do HTML)
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
      slice.style.strokeDasharray = (MINE * mine).toFixed(2) + " 1440";
      slice.style.opacity = Math.min(1, mine * 8).toFixed(2);
      youNum.textContent = Math.round(MINE * mine);
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
    btn.innerHTML = "";
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

  /* 4b. AS DUAS SEMANAS DO DESAFIO: uma folhinha brota em cada dia -------- */
  (function weeks() {
    var box = document.querySelector(".weeks");
    if (!box) return;
    var days = box.querySelectorAll(".weeks__days li");
    days.forEach(function (li, i) {
      li.style.setProperty("--i", i);
      if (li.querySelector(".weeks__leaf")) return;          // já veio desenhada no arquivo
      var s = svg("0 0 30 18", li, "weeks__leaf");
      el("path", { "class": "leaf__shape", d: LEAF, transform: "translate(0,9)" }, s);
      el("path", { "class": "leaf__vein", d: LEAF_VEIN, transform: "translate(0,9)" }, s);
    });
    if (reduced) { box.classList.add("is-on"); return; }
    onceVisible(box, function () { box.classList.add("is-on"); }, 0.35);
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

  /* 6b. VARAL DE FOTOS: balançam com a rolagem, com a brisa e ao toque ---- */
  document.querySelectorAll(".clothesline__track").forEach(function (track) {
    var withButterfly = !track.closest(".clothesline--notes");
    var pins = Array.prototype.slice.call(track.querySelectorAll(".pin"));
    var path = track.querySelector(".clothesline__string path");
    var svgEl = track.querySelector(".clothesline__string");
    var st = pins.map(function () { return { a: 0, v: 0 }; });

    function layout() {
      var W = track.scrollWidth, y0 = 18, sag = Math.min(56, W * 0.05);
      svgEl.setAttribute("viewBox", "0 0 " + W + " 120");
      svgEl.style.width = W + "px";
      path.setAttribute("d", "M0," + y0 + " Q" + (W / 2) + "," + (y0 + sag * 2) + " " + W + "," + y0);
      var tr = track.getBoundingClientRect();
      pins.forEach(function (p) {
        var r = p.getBoundingClientRect();
        var cx = r.left - tr.left + track.scrollLeft + r.width / 2;
        var u = cx / W;
        var y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * (y0 + sag * 2) + u * u * y0;   // altura do barbante ali
        p.style.setProperty("--hang", (y - 6).toFixed(1) + "px");
      });
    }
    layout();
    window.addEventListener("resize", function () { layout(); if (bf) bf.relayout(); });
    if (!on("varal") || reduced) return;
    var bf = withButterfly ? clotheslineButterfly() : null;


    // Borboleta que mora no varal: pousa no barbante ou num pregador e voa
    // para outro lugar quando as fotos balançam forte ou alguém toca nelas.
    function clotheslineButterfly() {
      var layer = svg("0 0 10 10", track, "clothesline__bfly");
      var spots = [];
      function relayout() {
        var W = track.scrollWidth, H = track.offsetHeight;
        layer.setAttribute("viewBox", "0 0 " + W + " " + H);
        layer.style.width = W + "px"; layer.style.height = H + "px";
        spots = [];
        pins.forEach(function (p, i) {
          spots.push({ x: p.offsetLeft + p.offsetWidth / 2 + 1, y: p.offsetTop - 15, pin: i });   // em cima do pregador
        });
        var len = path.getTotalLength();
        [0.2, 0.38, 0.62, 0.8].forEach(function (f) {
          var pt = path.getPointAtLength(len * f);
          spots.push({ x: pt.x, y: pt.y - 1, pin: null });                                   // no barbante
        });
      }
      relayout();
      var wrap = el("g", {}, layer), flip = el("g", {}, wrap);
      var b = sideButterfly(flip, "sky");
      var state = "away", x = 0, y = 0, face = -1, wing = 1, from, to, t0 = 0, dur = 0, spot = null, nextMove = 0, raf = 0, seen = false;
      function place() {
        wrap.setAttribute("transform", "translate(" + x.toFixed(1) + "," + y.toFixed(1) + ") scale(1.2)");
        flip.setAttribute("transform", "scale(" + face.toFixed(3) + ",1)");
        b.setWings(wing);
      }
      function goTo(s) {
        from = { x: x, y: y }; to = s; spot = s; t0 = performance.now();
        dur = 1600 + Math.hypot(s.x - x, s.y - y) * 5; state = "flying";
        run();
      }
      function pickSpot(avoidPin) {
        var opts = spots.filter(function (s) { return s !== spot && (avoidPin == null || s.pin !== avoidPin); });
        return opts[Math.floor(Math.random() * opts.length)];
      }
      function loop(now) {
        raf = 0;
        var t = now / 1000;
        if (state === "flying") {
          var u = clamp((now - t0) / dur, 0, 1), e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
          var cx = (from.x + to.x) / 2, cy = Math.min(from.y, to.y) - 70;
          var nx = (1 - e) * (1 - e) * from.x + 2 * (1 - e) * e * cx + e * e * to.x;
          var ny = (1 - e) * (1 - e) * from.y + 2 * (1 - e) * e * cy + e * e * to.y + Math.sin(u * Math.PI * 5) * 4 * (1 - e);
          face += ((nx >= x ? 1 : -1) - face) * 0.08;
          x = nx; y = ny;
          wing = 0.2 + 0.8 * (0.5 + 0.5 * Math.cos(t * 2 * Math.PI * 5));
          if (u >= 1) { state = "resting"; nextMove = now + 9000 + Math.random() * 6000; }
        } else if (state === "resting") {
          wing = 0.55 + 0.45 * (0.5 + 0.5 * Math.cos(t * 1.5));
          if (now > nextMove) goTo(pickSpot());
        }
        place();
        if (visibleB) run();
      }
      function run() { if (!raf) raf = requestAnimationFrame(loop); }
      var visibleB = false;
      new IntersectionObserver(function (e) {
        visibleB = e[0].isIntersecting;
        if (visibleB && !seen) {
          seen = true;
          x = track.scrollWidth + 40; y = 30; place();
          layer.classList.add("is-on");
          setTimeout(function () { goTo(pickSpot()); }, 900);
        } else if (visibleB) run();
      }, { threshold: 0.35 }).observe(track);
      return {
        relayout: relayout,
        startle: function (pinIndex) {
          if (state !== "resting") return;
          if (pinIndex == null || spot.pin === pinIndex || spot.pin === null) goTo(pickSpot(pinIndex));
        }
      };
    }

    var lastY = window.scrollY, lastT = performance.now(), running = false, visible = false;
    function kick(amount, only) {
      st.forEach(function (s, i) { if (only == null || only === i) s.v += amount * (0.8 + i * 0.15) * (i % 2 ? -1 : 1); });
      if (bf && (Math.abs(amount) > 9 || only != null)) bf.startle(only);
      start();
    }
    function start() { if (!running && visible) { running = true; lastT = performance.now(); requestAnimationFrame(step); } }
    function step(now) {
      var dt = Math.min(0.04, (now - lastT) / 1000); lastT = now;
      var t = now / 1000, moving = false;
      st.forEach(function (s, i) {
        var breeze = Math.sin(t * 0.9 + i * 1.7) * 0.7 + Math.sin(t * 2.3 + i) * 0.25;   // brisa leve
        var acc = -14 * (s.a - breeze) - 2.6 * s.v;                                    // mola amortecida
        s.v += acc * dt; s.a += s.v * dt;
        s.a = clamp(s.a, -14, 14);
        pins[i].style.setProperty("--sw", s.a.toFixed(2) + "deg");
        moving = true;
      });
      if (visible && moving) requestAnimationFrame(step); else running = false;
    }
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) start(); }).observe(track);
    window.addEventListener("scroll", function () {
      var now = performance.now(), dy = window.scrollY - lastY, dtt = Math.max(16, now - lastT);
      lastY = window.scrollY;
      if (visible) kick(clamp(dy / dtt * 6, -20, 20));
    }, { passive: true });
    pins.forEach(function (p, i) {
      p.addEventListener("click", function () {
        var was = p.classList.contains("is-front");
        pins.forEach(function (q) { q.classList.remove("is-front"); });
        if (!was) p.classList.add("is-front");
        kick(28, i);
      });
    });
  });

  /* 8b. FOLHA SECA QUE CAI nos marcadores de "Não é para você se…" ------- */
  (function dryLeaves() {
    if (!on("folhaSeca") || reduced || !("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".checks--no li");
    if (!items.length) return;
    root.classList.add("fx-dry");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, k) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        en.target.style.setProperty("--fall-delay", (k * 260) + "ms");
        en.target.classList.add("is-on");
      });
    }, { threshold: 1, rootMargin: "0px 0px -10% 0px" });
    items.forEach(function (li) { io.observe(li); });
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

  /* 9. CONTAGEM REGRESSIVA PARA A PRÓXIMA TURMA ---------------------------- */
  (function countdown() {
    var box = document.querySelector(".countdown");
    if (!box) return;
    var end = new Date(window.MEU_RITU_TURMA || "").getTime();
    if (!end || isNaN(end)) { box.remove(); return; }
    var els = {};
    box.querySelectorAll("[data-cd]").forEach(function (b) { els[b.getAttribute("data-cd")] = b; });
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var left = Math.max(0, end - Date.now());
      if (!left) { box.classList.add("is-done"); box.querySelector(".countdown__label").textContent = "Turma começando agora: ainda dá tempo de entrar"; return; }
      var s = Math.floor(left / 1000);
      els.d.textContent = pad(Math.floor(s / 86400));
      els.h.textContent = pad(Math.floor(s % 86400 / 3600));
      els.m.textContent = pad(Math.floor(s % 3600 / 60));
      els.s.textContent = pad(s % 60);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
  })();

  /* 10. O CARD DA OFERTA CHEGA EMBRULHADO E SE ABRE ------------------------ */
  (function gift() {
    var g = document.querySelector(".gift");
    if (!g) return;
    if (reduced) { g.remove(); return; }
    var card = g.parentElement;
    card.classList.add("is-wrapped");
    onceVisible(card, function () {
      setTimeout(function () {
        card.classList.add("is-opening");
        setTimeout(function () { card.classList.remove("is-wrapped"); g.remove(); }, 1700);
      }, 350);
    }, 0.45);
  })();

  /* 11. GOTINHAS DE ORVALHO: tocar ou passar o mouse numa folha ------------ */
  (function dew() {
    if (!on("orvalho") || reduced) return;
    root.classList.add("fx-dew");
    var last = new WeakMap();
    function drip(leaf) {
      var now = performance.now();
      if (now - (last.get(leaf) || 0) < 1200) return;
      last.set(leaf, now);
      leaf.classList.remove("is-dew"); void leaf.getBBox(); leaf.classList.add("is-dew");
      var svgRoot = leaf.ownerSVGElement;
      var m = leaf.getScreenCTM(), rm = svgRoot.getScreenCTM();
      if (!m || !rm) return;
      var p = svgRoot.createSVGPoint(); p.x = 27; p.y = 0;
      var tip = p.matrixTransform(m).matrixTransform(rm.inverse());
      var drop = el("g", { "class": "dew", transform: "translate(" + tip.x.toFixed(1) + "," + tip.y.toFixed(1) + ")" }, svgRoot);
      var inner = el("g", { "class": "dew__fall" }, drop);
      el("path", { "class": "dew__drop", d: "M0,-3.2 C1.6,-0.8 2.2,0.6 2.2,1.4 C2.2,2.8 1.2,3.6 0,3.6 C-1.2,3.6 -2.2,2.8 -2.2,1.4 C-2.2,0.6 -1.6,-0.8 0,-3.2 Z" }, inner);
      el("circle", { "class": "dew__shine", cx: -0.7, cy: 1, r: 0.6 }, inner);
      setTimeout(function () { drop.remove(); }, 1500);
    }
    function bind(scope) {
      document.querySelectorAll(scope).forEach(function (svgEl) {
        svgEl.addEventListener("pointerover", function (e) {
          var leaf = e.target.closest && e.target.closest(".leaf");
          if (leaf && leaf.classList.contains("is-on")) drip(leaf);
        });
        svgEl.addEventListener("pointerdown", function (e) {
          var leaf = e.target.closest && e.target.closest(".leaf");
          if (leaf) drip(leaf);
        });
      });
    }
    // as folhas são criadas depois (resize recria): liga nos contêineres
    bind(".journey__stem");
    bind(".vine");
  })();

  /* 12. RAMOS QUE SE DESENHAM ENTRE AS SEÇÕES ------------------------------ */
  (function sprigs() {
    var list = document.querySelectorAll(".sprig");
    if (!list.length) return;
    var R = function (seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; };
    var items = [];
    list.forEach(function (box, n) {
      var s = svg("0 0 560 60", box);
      var rnd = R(31 + n * 7);
      var d = "M10,34 C90," + (20 + rnd() * 12).toFixed(0) + " 160," + (44 + rnd() * 8).toFixed(0) + " 280,32 S470," + (20 + rnd() * 10).toFixed(0) + " 550,30";
      var stem = el("path", { "class": "sprig__line", d: d }, s);
      var len = stem.getTotalLength();
      stem.style.strokeDasharray = len; stem.style.strokeDashoffset = len;
      var bits = [];
      for (var k = 0; k < 9; k++) {
        var f = 0.08 + k * 0.105 + (rnd() - 0.5) * 0.04;
        var lf = leafAt(s, stem, f, k % 2 ? 1 : -1, 15 + rnd() * 6, "leaf leaf--grow");
        bits.push({ f: f, node: lf });
      }
      var mid = stem.getPointAtLength(len * 0.5);
      bits.push({ f: 0.5, node: flower(s, mid.x, mid.y - 2, 6, 0) });
      var fall = null;
      if (!reduced) {
        // uma folhinha que se solta e cai, uma vez
        var fp = stem.getPointAtLength(len * 0.72);
        var fo = el("g", { transform: "translate(" + fp.x.toFixed(1) + "," + fp.y.toFixed(1) + ")" }, s);
        fall = el("g", { "class": "sprig__fall" }, fo);
        el("path", { "class": "leaf__shape", d: LEAF, transform: "rotate(30) scale(0.5)" }, fall);
      }
      items.push({ box: box, stem: stem, len: len, bits: bits, fall: fall, p: 0, t: 0, dropped: false });
    });
    var raf = 0;
    function tick() {
      raf = 0;
      var again = false;
      items.forEach(function (it) {
        it.p += (it.t - it.p) * 0.08;
        if (Math.abs(it.t - it.p) > 0.001) again = true; else it.p = it.t;
        it.stem.style.strokeDashoffset = (it.len * (1 - it.p)).toFixed(1);
        it.bits.forEach(function (b) { b.node.classList.toggle("is-on", it.p >= b.f); });
        if (it.fall && !it.dropped && it.p > 0.98) { it.dropped = true; it.fall.classList.add("is-falling"); }
      });
      if (again) raf = requestAnimationFrame(tick);
    }
    scrollers.push(function (vh) {
      items.forEach(function (it) {
        var r = it.box.getBoundingClientRect();
        it.t = reduced ? 1 : clamp((vh * 0.95 - r.top) / (vh * 0.4), 0, 1);
      });
      if (!raf) raf = requestAnimationFrame(tick);
    });
  })();


  runScroll();
})();
