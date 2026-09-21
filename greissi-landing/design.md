# design.md — Greissi de Matos

> Fonte única de verdade visual. Se um valor não está aqui, ele não deveria estar no CSS.
> Escrito depois do site existir, a partir de uma auditoria: os valores abaixo são os
> que o site passou a seguir, não uma intenção. Qualquer `1.07rem` solto que apareça
> no CSS daqui em diante é vazamento do sistema.

## 1. Identidade

- **Projeto:** landing page de Greissi de Matos
- **O que é:** vitrine dos materiais, consultorias e imersões de uma mentora de
  desenvolvimento pessoal e relacionamentos
- **Público:** mulheres adultas, maioria em celular, chegando pelo Instagram dela
- **Ação principal:** escolher um material e ir para o link de compra; secundária,
  falar no WhatsApp
- **Direção visual:** orgânico/terroso
- **Referências:** as próprias peças dela (imersão "Ame-se Para Ser Amada"), que já
  usavam bege, verde-oliva e serifa elegante. O material antigo de gradiente neon
  ("Pare de rastejar") foi deliberadamente abandonado.
- **Palavras que descrevem o site:** sereno, acolhedor, íntimo
- **O que este site NÃO é:** não é clínico/frio, não é agressivo/infoproduto gritado,
  não é minimalista tech (sem cinza-azulado, sem dark mode)

## 2. Cor

| Token | Valor | Uso |
|---|---|---|
| `--cream` | `#F9F4E6` | Fundo da página |
| `--cream-deep` | `#F1E9D6` | Fundo de seção alternada |
| `--white` | `#FFFDF8` | Cards e blocos elevados |
| `--ink` | `#2E3226` | Texto principal |
| `--ink-soft` | `#5C6152` | Texto secundário |
| `--olive` | `#5A6348` | Âncora: CTA, blocos escuros |
| `--olive-dark` | `#434B36` | Hover do CTA, bloco final |
| `--olive-light` | `#8A9070` | Labels, traços, texto terciário |
| `--terracotta` | `#C0705A` | Destaque: ênfase em título, marcador ativo |
| `--terracotta-soft` | `#D89882` | Pétalas, flores, detalhes decorativos |

**Regras de uso:** terracota é destaque, nunca fundo de bloco grande — se ela aparecer
em tudo, para de significar "olhe aqui". Verde-oliva é a cor de ação (botão) e dos dois
blocos escuros (jornada e CTA final). Nenhum neutro puro: nada de `#FFF` ou `#000`.

## 3. Tipografia

- **Display:** Cormorant Garamond — pesos 400, 500 + itálico 400 — títulos e números
- **Corpo:** Jost — pesos 300, 400, 500 — texto e UI
- **Assinatura:** Parisienne — peso 400 — **uso único**, só a assinatura sobre a foto.
  Terceira família só se justifica enquanto for esse um lugar.

**Escala (base 16px).** Seis degraus fixos + dois fluidos. O site tinha 60 valores
distintos em `rem`; cada degrau abaixo ficou a no máximo ~8% do valor que substituiu,
então o sistema se organizou sem virar redesenho.

| Token | Valor | Uso |
|---|---|---|
| `--fs-100` | `0.75rem` (12px) | eyebrow, tags, labels maiúsculos, rodapé |
| `--fs-200` | `0.875rem` (14px) | listas de card, legendas |
| `--fs-300` | `1.0625rem` (17px) | corpo — 17px é escolha deliberada, público adulto |
| `--fs-400` | `1.1875rem` (19px) | lead/intro de seção |
| `--fs-500` | `1.4375rem` (23px) | h3, título de card, pergunta do FAQ |
| `--fs-600` | `1.75rem` (28px) | números de destaque, preço |
| `--fs-h2` | `clamp(2rem, 4.5vw, 3.25rem)` | h2 |
| `--fs-h1` | `clamp(2.75rem, 7vw, 5rem)` | h1 |

O menor (12px) e o maior (80px no topo do clamp) precisam ficar longe um do outro:
esse contraste é o que faz parecer projetado em vez de template. Não encolher o h1.

- **line-height:** corpo 1.7 · h2/h3 1.15 · h1 1.05
- **letter-spacing:** display `-0.02em` (aperta o que é grande) · label `+0.2em`
  maiúsculo · corpo 0
- **Medida de leitura:** 56-62ch em parágrafos de seção

## 4. Espaçamento e layout

**Escala (base 4px)** — nenhum valor fora dela:

`--sp-1` 4px · `--sp-2` 8px · `--sp-3` 12px · `--sp-4` 16px · `--sp-5` 24px ·
`--sp-6` 32px · `--sp-7` 48px · `--sp-8` 64px · `--sp-9` 96px · `--sp-10` 128px

- **Padding de seção:** desktop 128px · mobile 72px (via `clamp`)
- **Largura máxima:** conteúdo 1180px · leitura 760px
- **Gutter mobile:** 20px
- **Grid:** sem grid rígido de 12 colunas; cada seção define o seu, com `gap` da escala

## 5. Forma

- **Linguagem de raio: reta.** `--r-flat: 2px` em cards, botões, caixas.
  Exceções deliberadas, não descuido:
  - `--r-pill: 999px` no botão flutuante de WhatsApp
  - `--r-petal: 60% 60% 60% 60% / 72% 72% 28% 28%` — a forma de pétala, usada nos
    marcadores de lista, nas pétalas que caem e no marcador da jornada. É o device
    visual da marca; é ela que substitui o bullet redondo genérico.
  - arco no topo da janela do hero (`48% 48% 2px 2px / 32% 32% 2px 2px`)
- **Borda:** `1px solid rgba(90,99,72,.14)` em cards; `rgba(90,99,72,.18)` em divisores
- **Sombras — três níveis, derivados do tom de tinta, nunca preto puro:**
  - `--shadow-1` `0 1px 2px rgba(46,50,38,.06)` — separação mínima
  - `--shadow-2` `0 12px 32px rgba(46,50,38,.10)` — card em hover, caixa do quiz
  - `--shadow-3` `0 26px 60px rgba(46,50,38,.16)` — janela do hero, flutuantes

## 6. Movimento

- **Durações:** `--dur-fast 180ms` (hover) · `--dur-base 320ms` (mudança de estado) ·
  `--dur-slow 700ms` (reveal de entrada)
- **Easing:** `--ease` `cubic-bezier(.22,.61,.36,1)` para estado ·
  `--ease-reveal` `cubic-bezier(.16,1,.3,1)` para entrada
- **Reveal:** `opacity` + `translateY(26px)`, stagger de 90ms, uma vez só
  (`unobserve` depois)
- **Efeitos usados:** reveal no scroll, contadores, parallax leve na cena da janela,
  scroll suave (Lenis), vento contínuo nas flores, pétalas que caem e são recolhidas
- `prefers-reduced-motion` respeitado: sim — pétalas e parallax desligam, conteúdo
  aparece inteiro

## 7. Componentes

- **Botão primário:** fundo oliva, texto creme, padding 16/32, raio 2px, hover com
  preenchimento em pétala subindo + `translateY(-2px)`
- **Botão secundário (`--ghost`):** borda 1px oliva-claro, fundo transparente
- **Card:** fundo branco-creme, borda 1px, padding 32/28, sem sombra em repouso;
  em hover ganha `--shadow-2` e inclina levemente em perspectiva
- **Label/eyebrow:** `--fs-100`, maiúsculo, `letter-spacing .2em`, cor oliva-claro
- **Marcador de lista:** pétala (`--r-petal`), nunca bullet redondo
- **Foco (teclado):** anel de 2px em terracota com 2px de afastamento, em todo
  elemento interagível — desenhado, não o anel azul padrão do navegador

## 8. Estrutura da página

1. Header fixo transparente que ganha fundo creme ao rolar
2. Hero — cena da janela com canteiro + promessa + CTA + números
3. Dores — lista marcável, com pétalas caindo e o rastelo que as recolhe
4. Sobre — foto com assinatura + três pilares
5. Jornada — faixa oliva, linha do tempo horizontal de 4 etapas
6. Quiz — 3 perguntas que recomendam o material certo
7. Materiais — catálogo filtrável de 14 produtos
8. Depoimentos — carrossel
9. CTA final — faixa oliva escura
10. Dúvidas — FAQ em acordeão
11. Footer

## 9. Imagens e mídia

- **Estilo:** fotografia real dela, luz suave, fundo neutro
- **Tratamento:** cantos retos (2px), sem filtro; degradê de escurecimento só onde
  há texto sobreposto (assinatura)
- **Origem:** fotos do cliente. Nenhuma imagem gerada por IA neste projeto.
- **Formato:** WebP, `width`/`height` sempre declarados, `loading="lazy"` em tudo
  menos o hero (que é o LCP)
