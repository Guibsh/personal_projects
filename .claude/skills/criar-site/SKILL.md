---
name: criar-site
description: Metodologia completa para criar sites, landing pages e páginas de vendas premium (HTML/CSS/JS, React, Next.js ou Tailwind) que não parecem "feitos por IA". Use sempre que o usuário pedir para criar, redesenhar ou melhorar um site, landing page, página de vendas, portfólio, one-page, hero section ou site institucional — mesmo que ele não fale em design, e mesmo que o pedido pareça simples ("faz uma landing pra meu curso"). Também use quando o pedido envolver design system / design.md, referências visuais (Awwwards, Godly, Dribbble, refero.design, 21st.dev), animações de scroll, reveal de texto, cursor customizado, responsividade mobile, ou quando o usuário reclamar que o resultado ficou "genérico", "com cara de IA" ou "sem personalidade".
---

# Criar sites premium (anti-AI-slop)

Um prompt simples ("crie uma landing page") produz sempre o mesmo site: fundo escuro,
gradiente violeta, fonte Inter, hero centralizado, três cards lado a lado, tudo
arredondado e com vidro fosco. Isso é o **AI slop**: a média estatística de milhões de
templates. Não é feio — é invisível.

Site premium não nasce de um prompt melhor, nasce de um **processo**: decidir a
linguagem visual *antes* de escrever código, e depois obedecer essa decisão em cada
componente. Esta skill é esse processo.

## Antes de começar: 60 segundos de briefing

Não pule esta parte, mas também não transforme em interrogatório. Se o usuário já deu
as respostas, siga direto. Se faltar algo **essencial**, pergunte de uma vez só (no
máximo 3-4 perguntas juntas) e comece:

1. **O que é e para quem?** (produto, curso, serviço, portfólio — e quem compra)
2. **Qual a ação única?** (comprar, agendar, inscrever, baixar, entrar em contato)
3. **Alguma referência visual ou marca existente?** (link, print, cores, logo)
4. **Stack?** Se não disser, use **HTML + CSS + JS puro em arquivo único ou 3 arquivos**
   — abre em qualquer lugar, faz deploy em qualquer lugar, zero build.

Se o usuário não tem referência nenhuma, **não pergunte de novo**: proponha você uma
direção visual concreta (ex.: "editorial suíço, preto sobre off-white, Fraunces nos
títulos") e siga. Decisão proposta > pergunta em aberto.

## O fluxo em 7 passos

Os passos 1-3 são decisão, 4-5 são construção, 6-7 são acabamento. A tentação é pular
para o 4 — resista: cada minuto no passo 1 economiza dez de retrabalho, porque sem
tokens definidos o código inventa um roxo novo em cada seção.

### 1. design.md — a diretriz de marca

Antes da primeira linha de HTML, escreva `design.md` na raiz do projeto: paleta,
tipografia, escala de espaçamento, raios, sombras, movimento e regras de uso. É a única
fonte de verdade — ele é que impede o site de virar uma colcha de retalhos.

Use `assets/design.template.md` como ponto de partida e **preencha com valores reais**
(um template com placeholders não serve para nada). Depois transforme os tokens em
CSS custom properties — `assets/tokens.css` já traz a estrutura pronta.

Detalhes de como escolher cor, fonte e escala: leia `references/design-system.md`.

### 2. Objetivo → arquitetura da página

A finalidade define a forma. Não use o mesmo esqueleto para tudo:

| Tipo | Postura | Estrutura típica |
|---|---|---|
| E-commerce / checkout | Direto, sem fricção | Hero curto com CTA acima da dobra, prova social, produto, garantia. Scroll curto, CTA sempre alcançável |
| Página de vendas / curso | Persuasivo, progressivo | Promessa → dor → solução → conteúdo → prova → oferta → objeções (FAQ) → CTA final |
| SaaS / app | Claro e funcional | Hero com demo real do produto, como funciona (3 passos), features, preços, FAQ |
| Institucional / lançamento | Imersivo | Pode ter hero em tela cheia, capítulos com animação, manifesto, menos CTA |
| Portfólio | Mostra, não conta | Trabalho primeiro, texto mínimo, grid quebrado |

Escreva as seções em uma lista antes de codar, e diga ao usuário qual esqueleto você
escolheu e por quê. Em site de conversão, **animação nunca pode atrasar o CTA**.

### 3. Referência visual (o antídoto do slop)

Um site só escapa da média se você ancorar em algo específico. Três caminhos, do melhor
para o pior:

1. **O usuário mandou referência** (link/print): extraia dela a estrutura real — grid,
   proporção do hero, peso tipográfico, como o texto respira, o que é âncora de cor.
   Se tiver ferramenta de leitura de página/imagem, use-a; se não, peça o print.
2. **Você escolhe uma direção nomeada**: brutalismo editorial, suíço/Helvetica,
   Y2K/chrome, orgânico/terroso, tech-noir, retro-print. Nomear a direção é o que
   impede o modelo de cair no default.
3. **Bancos de referência** para o usuário escolher: `refero.design` (mostra o design
   system por trás, ótimo para copiar estrutura), Awwwards, Godly, Dribbble, Land-book.

Componentes interativos prontos (cursor customizado, brilho, efeitos 3D, partículas):
`21st.dev`. Peça ao usuário o link/código do componente e **adapte aos tokens do
`design.md`** — colar o componente com as cores originais dele quebra o sistema.

O checklist do que evitar e o que fazer no lugar está em `references/anti-ai-slop.md`.
**Leia esse arquivo antes de escrever a primeira seção** — é a parte mais útil da skill.

### 4. Construir a página

Ordem que funciona: HTML semântico completo → tokens/CSS base → seção por seção →
movimento por último. Página inteira antes de detalhe; nunca anime um layout que ainda
vai mudar.

- Use tags reais (`<header> <main> <section> <article> <footer>`) — vira SEO e
  acessibilidade de graça.
- Conteúdo real desde o início. `Lorem ipsum` esconde problemas de layout; texto de
  verdade (ou um rascunho honesto) revela.
- Imagens: `assets/` local, `loading="lazy"` fora da dobra, `width`/`height` sempre
  (evita o layout pulando), formato moderno quando possível.
- **Geração de imagem com IA**: se for usar skill/MCP de geração (Higgsfield, Recraft,
  DALL·E, etc.), **informe primeiro a quantidade total de imagens que pretende gerar e
  espere a confirmação** — cada geração gasta crédito do usuário e ele tem que decidir.

### 5. Movimento: scroll, hover e microinterações

O que separa "site bonito" de "site caro" é o movimento — desde que seja **contido**.
O padrão: elementos entram uma vez, suavemente, e ficam quietos.

Essencial (cobre 90% dos casos):

- **Reveal no scroll** com `IntersectionObserver` + transição CSS (não JS por frame)
- **Reveal de texto** por palavra/linha com delay escalonado nos títulos principais
- **Hover** com transição de 150-250ms em botões, links e cards
- **Contadores numéricos** que animam ao entrar na viewport
- **Smooth scroll** (Lenis, ~3kb) quando o site é longo e imersivo — não em checkout
- **Parallax leve** (translate de 10-40px), nunca o fundo inteiro se movendo

`assets/scroll-kit.js` já implementa reveal, stagger, contadores, parallax e progresso
de scroll em vanilla JS, sem dependência e respeitando `prefers-reduced-motion`. Copie
para o projeto em vez de reescrever. Quando o projeto pedir timeline complexa
(pin, morph, scrub), aí sim GSAP + ScrollTrigger.

Curvas, durações, o que nunca animar e como não matar a performance:
`references/animacoes.md`.

### 6. Mobile e performance

A maioria do tráfego é mobile, então **projete a versão mobile como primeira classe, não
como sobra**. Erros clássicos: título de 72px que quebra em cinco linhas, hover como
única forma de revelar informação, grid de 3 colunas espremido em 320px, menu que não
fecha, animação pesada que engasga em aparelho fraco.

Teste em 375px, 768px e 1440px antes de entregar. Checklist completo (touch targets,
CLS, fontes, vídeo, LCP): `references/mobile-performance.md`.

### 7. Os 10% que faltam

A primeira versão chega em ~85%. Os 15% finais são ajuste fino e é onde o site deixa de
parecer template. Em vez de esperar o usuário apontar, **faça você mesmo uma passada
crítica** e só então entregue:

- Hierarquia tipográfica: o título é grande o bastante? o corpo tem 60-75 caracteres
  por linha? `line-height` maior no corpo e menor nos títulos gigantes?
- Espaçamento: respiro vertical entre seções é generoso e **consistente**?
- Alinhamento: tudo na mesma grade? Nada com 1px de desalinho?
- Contraste e foco: texto legível (AA), `:focus-visible` visível em teclado?
- Estados: hover, ativo, disabled, vazio, erro, carregando.
- Detalhes: favicon, `<title>`, meta description, Open Graph, `lang="pt-BR"`, scroll
  suave nas âncoras, 404 se houver rotas.

Entregue dizendo **o que você decidiu e o que dá para ajustar** ("os títulos estão em
Fraunces 64px — posso deixar mais compacto"), em vez de pedir um feedback genérico.
Iteração dirigida é mais rápida para os dois.

## Texto: copy antes de floreio

Copy fraca afunda design bom. Se o usuário não deu o texto, escreva um rascunho forte e
marque como rascunho. Evite as muletas de IA ("revolucione", "eleve", "desbloqueie todo
o potencial", "no mundo de hoje", "não é apenas X, é Y"). Headline com promessa
específica e concreta > headline inteligente.

Princípios, fórmulas de headline e revisão de copy: `references/copywriting.md`.

## Entrega

Deixe o projeto rodável e implantável: estrutura de arquivos clara, `README.md` com
como abrir/rodar, e — se o usuário pedir deploy — sugira o mais simples que serve
(GitHub Pages, Netlify, Vercel). Nunca comite chaves de API em site estático.

## Combinando com outras ferramentas

Esta skill é o processo; as ferramentas abaixo entram como etapas dele quando
estiverem disponíveis na sessão. Nenhuma é obrigatória — o fluxo dos 7 passos funciona
sozinho.

- **Skill/artboard de design (`/design` ou similar)** — bom para explorar layout antes
  de codar. Gere o protótipo já com o `design.md` do passo 1 em mãos, e depois peça a
  conversão para HTML/CSS/JS em etapas: (1) entender as seções, (2) construir a página,
  (3) aplicar mídia.
- **Geração de imagem (MCP ou skill de imagem)** — para hero, texturas, ilustrações e
  microanimações em loop. Liste quantas imagens pretende gerar, com que prompt, e
  espere confirmação antes de consumir créditos.
- **Componentes de `21st.dev`** — cole o componente, depois reescreva cores, raios,
  fontes e durações para os tokens do projeto.
- **Skill de copy** — se houver uma na sessão, rode-a sobre o texto final; senão, use
  `references/copywriting.md` para revisar você mesmo.

## Arquivos desta skill

| Arquivo | Quando ler |
|---|---|
| `references/anti-ai-slop.md` | Sempre, antes de codar a primeira seção |
| `references/design-system.md` | No passo 1, ao montar o `design.md` |
| `references/animacoes.md` | No passo 5, ao adicionar movimento |
| `references/mobile-performance.md` | No passo 6, antes de entregar |
| `references/copywriting.md` | Quando você escreve ou revisa o texto |
| `assets/design.template.md` | Copiar para o projeto como `design.md` |
| `assets/tokens.css` | Base de CSS custom properties + reset |
| `assets/scroll-kit.js` | Reveal, contadores, parallax e progresso de scroll |
