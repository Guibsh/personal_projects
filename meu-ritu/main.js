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
  // Eventos que não são padrão da Meta (cliques no Instagram, play no vídeo)
  function trackCustom(metaEvent, gaEvent, params) {
    if (window.fbq) window.fbq("trackCustom", metaEvent, params || {});
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
      // "local" diz qual botão foi clicado (topo, abertura, verao, oferta...)
      track("InitiateCheckout", "begin_checkout", { value: 47, currency: "BRL", local: btn.getAttribute("data-checkout") || "botao" });
    });
  });

  // Cliques no Instagram
  document.querySelectorAll("[data-insta]").forEach(function (a) {
    a.addEventListener("click", function () { trackCustom("CliqueInstagram", "click_instagram"); });
  });

  // Vídeo da Lidia: nada é baixado até a pessoa tocar no cartão
  var VIDEO = window.MEU_RITU_VIDEO || {};
  var card = document.querySelector("[data-video]");
  if (card && VIDEO.src) {
    var mark = card.querySelector(".ph");
    if (mark) mark.remove();
    card.classList.add("is-ready");
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Assistir ao vídeo da Lidia");
    var play = function () {
      var box = document.createElement("div");
      box.className = "video-player" + (VIDEO.vertical ? " video-player--vertical" : "");
      var src = VIDEO.src, m, frame;
      if ((m = src.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{11})/))) {
        frame = "https://www.youtube-nocookie.com/embed/" + m[1] + "?autoplay=1&rel=0&playsinline=1";
      } else if ((m = src.match(/vimeo\.com\/(?:video\/)?(\d+)/))) {
        frame = "https://player.vimeo.com/video/" + m[1] + "?autoplay=1";
      }
      if (frame) {
        var f = document.createElement("iframe");
        f.src = frame;
        f.title = "Vídeo da Lidia";
        f.allow = "autoplay; fullscreen; picture-in-picture";
        f.allowFullscreen = true;
        box.appendChild(f);
      } else {
        var v = document.createElement("video");
        v.src = src;
        v.controls = true;
        v.autoplay = true;
        v.playsInline = true;
        var thumb = card.querySelector("img");
        if (thumb) v.poster = thumb.currentSrc || thumb.src;
        box.appendChild(v);
      }
      card.replaceWith(box);
      trackCustom("PlayVideo", "video_start");
    };
    card.addEventListener("click", play);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); play(); }
    });
  }
})();
