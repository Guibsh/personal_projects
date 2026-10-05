/* ---------------------------------------------------------------------------
   scroll-kit.js — movimento essencial em vanilla JS, sem dependências (~3kb)
   Pareado com tokens.css. Inclua com <script src="scroll-kit.js" defer></script>

   Uso no HTML:
     <div data-reveal>                      entra ao aparecer na viewport
     <div data-reveal data-reveal-delay="200">   com atraso em ms
     <ul data-reveal-stagger="80">          filhos entram em cascata
     <span data-counter="1200" data-counter-suffix="+">1200+</span>
     <img data-parallax="0.15">             deslocamento sutil no scroll (desktop)
     <div data-scroll-progress>             barra de progresso (scaleX 0→1)

   Princípios: cada elemento entra uma vez só, nada é escondido sem JS, e
   prefers-reduced-motion desliga tudo.
--------------------------------------------------------------------------- */

(function () {
  "use strict";

  // Marca que o JS rodou — o CSS só esconde [data-reveal] sob .js, então uma
  // falha de script nunca deixa a página em branco.
  document.documentElement.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  onReady(function () {
    if (reduced) {
      // Mostra tudo no estado final e não anima nada.
      document.querySelectorAll("[data-reveal]").forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    setupStagger();
    setupReveal();
    setupCounters();
    setupParallax();
    setupScrollProgress();
  });

  /* --- Stagger: converte filhos em [data-reveal] com delay incremental ---- */
  function setupStagger() {
    document.querySelectorAll("[data-reveal-stagger]").forEach(function (group) {
      var step = parseInt(group.dataset.revealStagger, 10) || 80;
      Array.prototype.forEach.call(group.children, function (child, i) {
        if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
        child.style.setProperty("--reveal-delay", i * step + "ms");
      });
    });
  }

  /* --- Reveal: um observer para todos, unobserve depois de revelar -------- */
  function setupReveal() {
    var items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-revealed"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = el.dataset.revealDelay;
        if (delay) el.style.setProperty("--reveal-delay", delay + "ms");
        el.classList.add("is-revealed");
        observer.unobserve(el); // entra uma vez; reanimar a cada scroll irrita
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

    items.forEach(function (el) { observer.observe(el); });
  }

  /* --- Contadores numéricos ---------------------------------------------- */
  function setupCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.5 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  function animateCounter(el) {
    var target = parseFloat(el.dataset.counter);
    if (isNaN(target)) return;
    var duration = parseInt(el.dataset.counterDuration, 10) || 1200;
    var decimals = parseInt(el.dataset.counterDecimals, 10) || 0;
    var prefix = el.dataset.counterPrefix || "";
    var suffix = el.dataset.counterSuffix || "";
    var locale = el.dataset.counterLocale || "pt-BR";
    var start = performance.now();

    function frame(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      var value = target * eased;
      el.textContent = prefix + value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* --- Parallax leve (só desktop, só transform) --------------------------- */
  function setupParallax() {
    if (window.innerWidth < 900) return; // em mobile o custo não compensa
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
    if (!items.length) return;

    var ticking = false;

    function update() {
      var viewportH = window.innerHeight;
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportH) return; // fora da tela
        var speed = parseFloat(el.dataset.parallax) || 0.15;
        var center = rect.top + rect.height / 2 - viewportH / 2;
        el.style.transform = "translate3d(0," + (-center * speed).toFixed(2) + "px,0)";
      });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    window.addEventListener("resize", update, { passive: true });
    update();
  }

  /* --- Barra de progresso de leitura -------------------------------------- */
  function setupScrollProgress() {
    var bars = document.querySelectorAll("[data-scroll-progress]");
    if (!bars.length) return;
    var ticking = false;

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bars.forEach(function (bar) {
        bar.style.transform = "scaleX(" + p + ")";
        bar.style.transformOrigin = "left";
      });
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }, { passive: true });

    update();
  }
})();
