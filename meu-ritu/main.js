(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var mobileCta = document.querySelector(".mobile-cta");
  var hero = document.querySelector(".hero");
  var offer = document.querySelector("#oferta");
  var TRACK = window.MEU_RITU_TRACK || {};

  // Borda no header ao rolar
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // CTA fixo no celular: aparece depois da abertura e some na oferta
  if ("IntersectionObserver" in window && mobileCta) {
    var heroVisible = true;
    var offerVisible = false;
    var update = function () {
      mobileCta.classList.toggle("is-visible", !heroVisible && !offerVisible);
    };
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting; update();
    }).observe(hero);
    new IntersectionObserver(function (entries) {
      offerVisible = entries[0].isIntersecting; update();
    }, { threshold: 0.15 }).observe(offer);
  }

  // Rastreamento (só liga se os IDs forem preenchidos no index.html) -------
  function loadScript(src) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    document.head.appendChild(s);
  }
  if (TRACK.metaPixelId) {
    /* Meta Pixel: código padrão da Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = [];
      loadScript(v);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", TRACK.metaPixelId);
    window.fbq("track", "PageView");
  }
  if (TRACK.ga4Id) {
    loadScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(TRACK.ga4Id));
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", TRACK.ga4Id);
  }
  function track(metaEvent, gaEvent, params) {
    if (window.fbq) window.fbq("track", metaEvent, params || {});
    if (window.gtag) window.gtag("event", gaEvent, params || {});
  }

  // Quem chegou até a oferta (uma vez)
  if ("IntersectionObserver" in window && offer) {
    var seenOffer = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      seenOffer.disconnect();
      track("ViewContent", "view_item", { content_name: "Desafio De Volta Pra Mim", value: 47, currency: "BRL" });
    }, { threshold: 0.4 });
    seenOffer.observe(offer);
  }

  // Botões de compra: levam à Kiwify repassando os parâmetros do anúncio
  // (utm_*, src, sck), para a venda aparecer atribuída à campanha certa.
  var base = window.CHECKOUT_URL || "";
  var pass = [];
  try {
    new URLSearchParams(window.location.search).forEach(function (v, k) {
      if (/^utm_|^src$|^sck$|^fbclid$|^gclid$/.test(k)) pass.push(encodeURIComponent(k) + "=" + encodeURIComponent(v));
    });
  } catch (e) {}
  document.querySelectorAll("[data-checkout]").forEach(function (btn) {
    var url = base || btn.getAttribute("href");
    if (pass.length) url += (url.indexOf("?") > -1 ? "&" : "?") + pass.join("&");
    btn.href = url;
    btn.addEventListener("click", function () {
      track("InitiateCheckout", "begin_checkout", { value: 47, currency: "BRL" });
    });
  });
})();
