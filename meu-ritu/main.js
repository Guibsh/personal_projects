(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var mobileCta = document.querySelector(".mobile-cta");
  var hero = document.querySelector(".hero");
  var offer = document.querySelector("#oferta");
  var toast = document.querySelector(".toast");

  // Borda no header ao rolar
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // CTA fixo no celular: aparece depois do hero e some na seção de oferta
  if ("IntersectionObserver" in window) {
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

  // Botões de compra: usam CHECKOUT_URL; enquanto vazio, avisa que é esboço
  var timer;
  document.querySelectorAll("[data-checkout]").forEach(function (btn) {
    if (window.CHECKOUT_URL) {
      btn.href = window.CHECKOUT_URL;
      return;
    }
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      toast.textContent = "Esboço: aqui vai abrir o pagamento do desafio (R$ 47).";
      toast.classList.add("is-visible");
      clearTimeout(timer);
      timer = setTimeout(function () { toast.classList.remove("is-visible"); }, 3200);
    });
  });
})();
