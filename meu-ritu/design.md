# design.md — Meu Ritú por Lidia Vicente

> Fonte única de verdade visual da landing do Desafio "De Volta Pra Mim".

## 1. Identidade

- **Projeto:** Meu Ritú — Desafio De Volta Pra Mim
- **O que é:** desafio de 14 dias, com 7 treinos de cerca de 15 minutos (repetidos na 2ª semana), em casa e com o peso do corpo; bônus Meu Ritú Tracker e minicurso O Poder da Postura (4 aulas); acesso por 30 dias; preço regular R$ 97, lançamento R$ 47 na Kiwify
- **Público:** mulheres, especialmente mães, que querem voltar a cuidar de si mas não conseguem manter a constância
- **Ideia central:** 15 minutos por dia → rotina possível → constância → resultados. Frases da marca: "O resultado mora na constância. Não no excesso.", "Decisão vale mais que motivação." e "Você não precisa fazer muito para começar a ter resultados. Precisa conseguir continuar."
- **Tom:** possibilidade, transformação, confiança e desejo de começar
- **Nunca:** 20 minutos, 14 treinos diferentes, descrição de aula que não corresponda ao conteúdo real, depoimentos inventados, acompanhamento individual/grupo, contagem regressiva (o acesso é imediato), Meu Ritú 1.0, benefício ou condição que não exista no produto
- **Ação principal:** comprar o desafio (R$ 47)
- **Direção visual:** orgânico / terroso, limpo, com muito respiro
- **Palavras:** motivação · conexão comigo · confiança
- **O que NÃO é:** não é academia "fitness agressivo", não é neon, não é pink-girl, não é cheio de selos e contadores falsos

## 2. Cor (tirada do logo)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F6F0E7` | Fundo areia |
| `--color-surface` | `#FBF8F3` | Blocos claros |
| `--color-sand` | `#EADBC8` | Bege do logo, fundos alternados |
| `--color-border` | `#E2D5C3` | Divisores 1px |
| `--color-text` | `#3A2519` | Marrom café (texto, seções escuras) |
| `--color-text-muted` | `#7A6656` | Texto secundário |
| `--color-brand` | `#56693F` | Verde sálvia escuro — CTA |
| `--color-leaf` | `#8A9A6E` | Verde folha — detalhes |
| `--color-wall` | `#6E5139` | Parede quente — fundo da primeira tela |
| `--color-blush` | `#E6C3B8` | Pétalas das florzinhas (rosé suave) |
| `--color-mustard` | `#C99A4B` | Miolo das flores, bico dos filhotes (ecoa o batente amarelo) |

Regras: verde só no CTA e em detalhes pequenos (folha, números). Uma única seção escura (oferta/CTA final) em marrom café. O rosa da roupa vive só nas fotos.

## 3. Tipografia

- **Manuscrita:** Caveat — só nos bilhetes dos depoimentos
- **Display:** Playfair Display 400/500 + itálico — títulos (mesma do banner "De Volta Pra Mim"; Cormorant foi descartada porque o circunflexo dela fica estranho em "você")
- **Corpo:** Montserrat 400/500 — texto e UI (mesma do banner "Desafio de 14 dias")
- **Escala:** 12 · 14 · 16 · 18 · 24 · 32 · 44 · 56 · 76
- **line-height:** corpo 1.7 · títulos 1.05–1.15
- **Label:** 12px maiúsculo, letter-spacing 0.16em

## 4. Forma

- Fotos em alta (1200×1600), versões originais guardadas em `assets/img/novas/`.
- Primeira tela: foto quente sem moldura, fundindo com a parede. Da segunda foto em diante: **topo em arco**. Demais cantos retos.
- Ilustrações em **traço fino** (marrom/creme), folhas verde-sálvia, **florzinhas pequenas e delicadas** (5 pétalas rosé).
- Botões em pílula (999px). Nada de 16px genérico em tudo.
- Sem sombras; separação por cor de fundo e borda 1px.

## 5. Estrutura (versão 3)

1. Abertura ("15 minutos por dia para começar a voltar pra você.", botão para a Kiwify e link "Conhecer o desafio")
2. Identificação (três perguntas na neblina que some + "talvez você não precise de mais cobrança")
3. A descoberta ("O resultado mora na constância", plantinhas 15 min → rotina possível → constância → resultados)
4. Seu dia tem 1.440 minutos (relógio; 1.440 e 15 em destaque também no título)
5. Minha história (trepadeira, ninho, vídeo opcional com a chamada "Você sabe que precisa cuidar de si…", Instagram @meu.ritu) + varal de fotos
6. O desafio (duas semanas de 7 treinos com folhinhas, bônus Tracker, bônus Postura)
7. O verão está chegando (foto, solzinho e botão de compra)
8. Investimento + oferta (perguntas sobre o que ela já gastou ao lado do card; de R$ 97 por R$ 47 em destaque, até 11x de R$ 5,22 com acréscimo, Pix/boleto/cartão, canal de suporte; compra segura e 7 dias de arrependimento pelo CDC)
9. Dúvidas e fechamento ("Decisão vale mais que motivação.")

Todos os botões de compra têm o link da Kiwify no próprio HTML (funcionam sem script) e um `data-checkout` com o local (topo, abertura, verao, oferta, fechamento, barra); o script repassa utm_*, src, sck, fbclid e gclid ao checkout e, quando `MEU_RITU_TRACK` tiver os IDs da Meta e do GA4, registra visita, ViewContent, InitiateCheckout (com o local do botão), cliques no Instagram e play no vídeo. A compra (Purchase) se configura na própria Kiwify.

## 6. Movimento (fx.js; cada efeito liga/desliga em `MEU_RITU_FX`)

- Abertura "respiração", neblina na identificação, plantinhas que crescem na descoberta, relógio de 15 minutos (~8s, uma vez), trepadeira com borboleta e ninho na história, varal de fotos com borboleta, folhinhas que brotam nas duas semanas do desafio, solzinho que se desenha no verão, pétalas na oferta, folhinha nas dúvidas e no botão, passarinhos no fechamento.
- Os desenhos vêm pré-prontos no arquivo único (`prerender.js`), então aparecem mesmo com script bloqueado.
- `prefers-reduced-motion` mostra tudo no estado final.
