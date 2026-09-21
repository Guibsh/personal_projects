# Movimento: scroll, hover e microinterações

Animação boa é quase imperceptível: o usuário não pensa "que animação legal", ele acha
que o site é rápido e caro. Animação ruim chama atenção para si mesma, atrasa a leitura
e trava em celular fraco.

Três regras que resolvem a maioria dos casos:

1. **Entrar uma vez e ficar quieto.** Elemento que reanima toda vez que volta à
   viewport irrita. Use `observer.unobserve()` depois do primeiro reveal.
2. **Rápido de sair, suave de entrar.** Hover em 150-200ms; reveal em 500-700ms com
   easing de desaceleração.
3. **Nunca segurar o conteúdo.** Se o JS falhar, o texto tem que aparecer assim mesmo
   (veja `.no-js` / fallback abaixo). Conteúdo invisível por causa de animação é o pior
   bug possível: parece página quebrada e derruba SEO.

## O que animar (e como)

### Reveal no scroll
`IntersectionObserver` adicionando uma classe + transição CSS. Nunca calcule posição a
cada evento de `scroll` — é jank garantido. Implementado em `assets/scroll-kit.js`
(`data-reveal`, `data-reveal-delay`).

Valores que funcionam: `opacity 0 → 1`, `translateY(24px) → 0`, 600ms,
`cubic-bezier(0.16, 1, 0.3, 1)`, threshold ~0.15, `rootMargin: "0px 0px -10% 0px"`.

### Stagger (cascata)
Filhos entrando com 60-100ms de diferença. Mais que ~8 elementos em cascata fica lento:
agrupe. Em `scroll-kit.js`: `data-reveal-stagger` no container.

### Reveal de texto por palavra/linha
Reserve para 1-2 títulos principais (hero e talvez um manifesto). Aplicado em todo
parágrafo, vira ruído e destrói a seleção de texto e a leitura por leitor de tela —
mantenha o texto original acessível e anime apenas spans de apresentação.

### Contadores numéricos
Animam de 0 até o valor quando entram na viewport, em ~1.2s com easing de saída.
Sempre com `aria-live` desligado e o valor final no HTML como fallback.
Em `scroll-kit.js`: `data-counter="1200"` (`data-counter-suffix="+"`).

### Hover
- Botão: leve mudança de fundo/brilho + `translateY(-1px)`. Sem crescer 10%.
- Card: elevação sutil (sombra + 2-4px de subida) ou borda que acende.
- Link: underline que cresce (`background-size` animado), não `text-decoration` piscando.
- Imagem: `scale(1.03)` dentro de container com `overflow: hidden`.
- **Nunca deixe informação essencial só no hover** — em touch ela não existe.

### Parallax
Translate de 10-40px no elemento, nunca o fundo inteiro. Sempre em `transform` e dentro
de `requestAnimationFrame`. Desative em mobile: consome bateria e o ganho é mínimo.

### Smooth scroll (Lenis)
Vale em site longo e imersivo; atrapalha em checkout e em qualquer coisa onde o usuário
quer chegar rápido. ~3kb. Se usar, garanta que âncoras e teclado continuam funcionando.

### Timeline complexa (GSAP + ScrollTrigger)
Só quando o projeto realmente pede pin de seção, scrub, morph ou sequência encadeada.
Para reveal e fade, GSAP é peso desnecessário — o `scroll-kit.js` resolve.

## O que evitar

- Rotação, bounce e elástico em UI séria — parece propaganda de 2014.
- Animar `width`, `height`, `top`, `left`, `margin` → causa layout reflow. Anime
  `transform` e `opacity`; se precisar, `will-change: transform` (e remova depois).
- Loading artificial (skeleton por 2s num site estático) — é mentira e atrasa.
- Carrossel automático de depoimentos que ninguém consegue ler até o fim.
- Cursor customizado que esconde o cursor real sem oferecer estado de clique/hover.
- Vídeo de fundo pesado em autoplay sem `poster`, sem `muted playsinline`, sem
  versão leve para mobile.

## Acessibilidade e performance (não opcional)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
}
```

- Quem tem sensibilidade vestibular passa mal com parallax — a media query acima não é
  detalhe, é requisito.
- Fallback sem JS: `scroll-kit.js` marca `document.documentElement.classList.add('js')`
  e o CSS só esconde elementos com `.js [data-reveal]`. Sem JS, tudo aparece.
- Um `IntersectionObserver` para muitos elementos > um observer por elemento.
- Teste com throttle de CPU 4x no DevTools; se engasgar, corte efeito, não qualidade.
