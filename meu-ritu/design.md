# design.md — Meu Ritú por Lidia Vicente

> Fonte única de verdade visual da landing do Desafio "De Volta Pra Mim".

## 1. Identidade

- **Projeto:** Meu Ritú — Desafio De Volta Pra Mim
- **O que é:** desafio de 14 dias, com 7 treinos de cerca de 15 minutos (repetidos na 2ª semana), em casa e com o peso do corpo; inclui o Meu Ritú Tracker e o bônus O Poder da Postura (4 aulas); acesso por 30 dias; R$ 47 na Kiwify
- **Público:** mulheres, especialmente mães, que querem voltar a cuidar de si mas não conseguem manter a constância
- **Ideia central:** sair do ciclo de começar, parar e se culpar. Frases da marca: "O resultado mora na constância. Não no excesso." e "Decisão vale mais que motivação."
- **Nunca:** promessa de resultado físico em 14 dias, depoimentos inventados, acompanhamento individual/grupo, contagem regressiva, Meu Ritú 1.0
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

## 5. Estrutura (versão 2)

1. Abertura (15 min por dia, botão para a Kiwify e link "Conhecer o desafio")
2. Identificação (neblina que some)
3. A descoberta (relógio 15 dos 1.440 minutos + frase da constância)
4. Minha história (trepadeira, ninho, vídeo da Lidia, Instagram @meu.ritu) + varal de fotos
5. O desafio (duas semanas de 7 treinos com folhinhas, Tracker, bônus Postura)
6. Oferta (de R$ 97 por R$ 47, até 11x de R$ 5,22 com acréscimo, Pix/boleto/cartão, canal de suporte; compra segura e 7 dias de arrependimento pelo CDC)
7. Dúvidas e fechamento ("Decisão vale mais que motivação.")

Todos os botões de compra têm o link da Kiwify no próprio HTML (funcionam sem script); o script repassa utm_*, src, sck, fbclid e gclid ao checkout e dispara ViewContent e InitiateCheckout quando `MEU_RITU_TRACK` tiver os IDs da Meta e do GA4. A compra (Purchase) se configura na própria Kiwify.

## 6. Movimento (fx.js; cada efeito liga/desliga em `MEU_RITU_FX`)

- Abertura "respiração", neblina na identificação, relógio de 15 minutos (~8s, uma vez), trepadeira com borboleta e ninho na história, varal de fotos com borboleta, folhinhas que brotam nas duas semanas do desafio, pétalas na oferta, folhinha nas dúvidas e no botão, passarinhos no fechamento.
- Os desenhos vêm pré-prontos no arquivo único (`prerender.js`), então aparecem mesmo com script bloqueado.
- `prefers-reduced-motion` mostra tudo no estado final.
