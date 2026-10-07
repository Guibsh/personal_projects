// Coloca os desenhos já prontos (trepadeira, ninho, caminho de 14 dias, relógio,
// barbante do varal) dentro de esboco-meu-ritu.html. Assim eles aparecem mesmo
// onde o JavaScript é bloqueado; onde ele roda, fx.js redesenha e anima.
// Uso: python3 build-esboco.py && node prerender.js   (precisa do Playwright)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "esboco-meu-ritu.html");

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const p = await ctx.newPage();
  await p.goto("file://" + file);
  await p.waitForTimeout(1200);
  const H = await p.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < H; y += 300) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(100); }
  await p.waitForTimeout(600);

  const parts = await p.evaluate(() => {
    const get = (sel) => { const e = document.querySelector(sel); return e ? e.innerHTML : ""; };
    return {
      ticks: get(".minutes__ticks"),
      vine: get(".vine"),
      nest: get(".nest"),
      stem: get(".journey__stem"),
      strings: [...document.querySelectorAll(".clothesline__string")].map((s) => ({
        viewBox: s.getAttribute("viewBox"), width: s.style.width, d: s.querySelector("path").getAttribute("d"),
      })),
    };
  });
  await b.close();

  let html = fs.readFileSync(file, "utf8");
  const put = (open, close, inner) => {
    if (!html.includes(open + close)) throw new Error("não achei: " + open);
    html = html.replace(open + close, open + inner + close);
  };
  put('<g class="minutes__ticks">', "</g>", parts.ticks);
  put('<div class="vine" data-fx="trepadeira" aria-hidden="true">', "</div>", parts.vine);
  html = html.replace(/(<button type="button" class="nest"[^>]*>)(<\/button>)/, (m, a, c) => a + parts.nest + c);
  put('<div class="journey__stem" aria-hidden="true">', "</div>", parts.stem);
  parts.strings.forEach((st) => {
    html = html.replace(
      '<svg class="clothesline__string" aria-hidden="true"><path d=""/></svg>',
      `<svg class="clothesline__string" aria-hidden="true" viewBox="${st.viewBox}" style="width:${st.width}"><path d="${st.d}"/></svg>`
    );
  });
  fs.writeFileSync(file, html);
  console.log("desenhos colocados:", Object.keys(parts).join(", "), "·", (html.length / 1e6).toFixed(2), "MB");
})();
