# Montando o design.md

O `design.md` existe por um motivo prático: sem ele, cada seção nova inventa um cinza
diferente e um espaçamento novo, e a página fica "quase certa" em todo lugar. Com ele,
qualquer decisão futura (sua ou do usuário) tem onde ser conferida.

Regra geral: **poucas opções, bem escolhidas**. Um sistema com 5 tons de cinza e 7
tamanhos de fonte produz páginas mais coerentes do que um com 20 de cada.

## Cor

Estrutura mínima:

- **Neutros (5-7 tons)** — fundo, superfície elevada, borda, texto secundário, texto
  principal. Neutro puro (#FFF/#000) raramente é a melhor escolha: use off-white
  (#FAF9F6) e quase-preto (#111012). Dá profundidade sem parecer sujo.
- **Uma cor de marca** — a âncora. Use com disciplina: CTA, links, detalhes. Se ela
  aparece em tudo, deixa de significar "clique aqui".
- **0-2 cores de apoio** — destaque secundário e/ou uma cor quente para alertas.
- **Semânticas** — sucesso, erro, aviso. Podem ser derivadas.

Como escolher a âncora: parta do setor e vá para o lado oposto do óbvio (fintech não
precisa ser azul; saúde não precisa ser verde-menta). Verifique contraste do texto
sobre ela — se precisar de texto branco, garanta ≥ 4.5:1.

Dark mode só se o usuário pedir ou o produto pedir. Se fizer, defina os dois conjuntos
de tokens desde o começo — retrofit de dark mode é retrabalho garantido.

## Tipografia

- **Máximo 2 famílias** (3 só se a terceira for mono para números/código).
- **Display** com personalidade nos títulos; **corpo** neutra e muito legível.
- Pares que funcionam: Fraunces + Inter · Space Grotesk + IBM Plex Sans ·
  Playfair Display + Source Sans · Archivo Black + Archivo · Instrument Serif + Geist.
- **Escala**: use uma razão consistente (1.25 para páginas densas, 1.333-1.5 para
  páginas expressivas). Exemplo com 1.333 a partir de 16px:
  `12 · 14 · 16 · 21 · 28 · 37 · 50 · 66 · 88`.
- **line-height** inverso ao tamanho: 1.6-1.7 no corpo, 1.2 em h2/h3, 0.95-1.05 em
  títulos gigantes. Título grande com line-height 1.5 parece frouxo.
- **letter-spacing**: negativo (-0.02em a -0.04em) em títulos grandes; positivo
  (0.08em) em labels pequenos maiúsculos.
- **Medida**: 60-75 caracteres por linha no corpo (`max-width: 65ch`).
- Carregue só os pesos que vai usar (`&display=swap`), 2-3 no máximo.

## Espaçamento e grid

- Escala baseada em 4 ou 8px: `4 8 12 16 24 32 48 64 96 128 160`. Nada fora da escala.
- **Ritmo vertical**: seções em desktop costumam pedir 96-160px de padding vertical;
  em mobile, 56-80px. Consistência aqui é metade da sensação de acabamento.
- Largura do conteúdo: 1100-1280px para layout geral, 680-760px para blocos de leitura.
- Gutter mínimo de 20-24px nas laterais em mobile.

## Raio, borda, sombra

Escolha **uma** linguagem e mantenha:

- Reto (0-4px) → sério, editorial, técnico
- Suave (8-12px) → padrão amigável (cuidado: é o território do slop, compense com
  tipografia forte)
- Pill (999px em botões) → moderno, consumer

Sombra: defina no máximo 3 níveis, ou nenhuma (use borda de 1px). Sombra colorida
(derivada da cor de marca com baixa opacidade) parece mais cuidadosa que preta pura.

## Movimento

Trate como token também, senão cada componente inventa a própria duração:

- Durações: `fast 150ms` (hover), `base 250ms` (transições), `slow 600ms` (reveal)
- Easing: `ease-out` para entrada, `cubic-bezier(0.16, 1, 0.3, 1)` para reveal
- Deslocamento de reveal: 16-32px. Mais que isso parece saltitante.

## Do design.md para o CSS

Todo token vira CSS custom property em `:root` (veja `assets/tokens.css`). Depois disso,
**nenhum valor mágico no CSS das seções** — se aparecer um `#7C3AED` solto ou um
`margin: 37px`, ou falta token ou o token está sendo ignorado. É o sinal mais fácil de
detectar que o sistema começou a vazar.
