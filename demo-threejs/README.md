# Demonstração — Three.js + GSAP ScrollTrigger

Exploração isolada, **não faz parte do site da Greissi** (`../greissi-landing`).
Pedida para mostrar como fica uma cena 3D de verdade (WebGL) com câmera
conduzida pelo scroll, em contraste com a abordagem de camadas 2D/SVG usada
no site.

## O que mostra
- Campo de flores em geometria 3D real (Three.js), não sprites 2D.
- Câmera avançando pelo campo conforme o scroll (GSAP + ScrollTrigger, `scrub`).
- Parallax de profundidade genuíno: objetos próximos deslocam mais rápido
  no quadro que objetos distantes, porque é perspectiva de câmera real, não
  números ajustados à mão em CSS.
- Neblina (`THREE.Fog`) e sombra projetada.

## O custo (o motivo de isso não estar no site)
`dist/scene.min.js` sozinho pesa ~134 KB gzip — mais do que o site inteiro
da Greissi (~30 KB de HTML+CSS+JS). Para o tom "leve, acolhedor, rápido no
celular" que o site pede, a abordagem em SVG continua sendo a certa. Isso
aqui é referência para o dia em que profundidade 3D real valer o peso.

## Rodar local
```
python3 -m http.server 8778
```

## Bibliotecas vendorizadas
Mesma regra do projeto principal — sem CDN (bloqueado neste ambiente):
- `vendor/gsap.min.js`, `vendor/ScrollTrigger.min.js` — via `npm install gsap`.
- `dist/scene.min.js` — bundle de `src/main.js` (que importa `three`) via
  esbuild: `npx esbuild src/main.js --bundle --minify --format=iife
  --outfile=dist/scene.min.js`. Precisa de `npm install three` num
  `node_modules` acessível ao esbuild antes de rebuildar.
