# Mobile, performance e acessibilidade

A maior parte do tráfego chega por celular, mas o layout costuma ser desenhado em
1440px. O resultado clássico: no desktop está lindo, no celular o título quebra em
cinco linhas e o botão some abaixo da dobra.

Trabalhe **mobile-first de verdade**: escreva o CSS base para a tela pequena e use
`min-width` para adicionar complexidade, não `max-width` para desfazer bagunça.

## Checklist mobile

- [ ] Testado em **375px**, 768px e 1440px (DevTools basta)
- [ ] Nenhum scroll horizontal (procure elementos com largura fixa e `100vw` + padding)
- [ ] Título do hero legível sem quebrar feio: `clamp(2rem, 8vw, 5.5rem)`
- [ ] Gutter lateral ≥ 20px
- [ ] Alvos de toque ≥ 44x44px, com espaço entre eles
- [ ] Nada essencial depende de `:hover`
- [ ] Menu mobile abre, fecha (botão, Esc, clique fora) e trava o scroll do fundo
- [ ] CTA principal alcançável cedo; em página de vendas longa, considere CTA fixo
- [ ] Tabelas e grids viram lista ou rolagem horizontal intencional
- [ ] Formulários com `type` correto (`email`, `tel`, `numeric`) para abrir o teclado certo
- [ ] Fontes ≥ 16px em inputs (abaixo disso o iOS dá zoom sozinho)
- [ ] `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Parallax e vídeo de fundo desligados ou simplificados
- [ ] Safe area em iPhone quando houver barra fixa: `env(safe-area-inset-bottom)`

Ferramentas úteis: `clamp()` para tipografia e espaçamento fluidos,
`grid-template-columns: repeat(auto-fit, minmax(260px, 1fr))` para grids que se viram
sozinhos, `aspect-ratio` para mídia sem layout shift.

## Performance

- **Imagens** são 80% do peso: dimensione no tamanho real de exibição, use WebP/AVIF,
  `loading="lazy"` fora da dobra (**nunca** na imagem do hero), `width`/`height` ou
  `aspect-ratio` sempre presentes.
- **Fontes**: 2-3 pesos, `display=swap`, `preconnect` no Google Fonts ou self-host.
- **JS**: o site descrito nesta skill não precisa de framework. Se usar Lenis/GSAP,
  carregue com `defer`.
- **LCP**: normalmente o título ou a imagem do hero — não esconda atrás de animação de
  entrada longa nem de fade-in dependente de JS.
- **CLS**: reserve espaço para imagens, vídeos, iframes e banners.
- Objetivo prático: Lighthouse mobile ≥ 90 em Performance e ≥ 95 em Acessibilidade num
  site estático. Se estiver longe, quase sempre é imagem ou fonte.

## Acessibilidade

- Contraste AA: 4.5:1 texto normal, 3:1 texto grande. Cinza claro sobre branco é o erro
  mais comum em site "clean".
- Hierarquia de headings correta (um `h1`, sem pular níveis) — é estrutura, não tamanho.
- `alt` descritivo em imagem com conteúdo; `alt=""` em decorativa.
- `:focus-visible` com contorno claro; navegue a página inteira só com Tab antes de
  entregar.
- Botão é `<button>`, link é `<a>`. Div clicável quebra teclado e leitor de tela.
- `lang="pt-BR"` no `<html>`, `<title>` e meta description reais.
- Ícone sem texto precisa de `aria-label`.

## Antes de entregar

- [ ] Todos os links funcionam (inclusive âncoras)
- [ ] Formulário envia ou está claramente marcado como demo
- [ ] Favicon, `<title>`, description, Open Graph (`og:image` 1200x630)
- [ ] Sem `console.log`, sem TODO, sem Lorem ipsum
- [ ] Testado em um navegador além do Chrome, se possível
