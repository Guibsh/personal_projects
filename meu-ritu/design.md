# design.md — Meu Ritú por Lidia Vicente

> Fonte única de verdade visual da landing do Desafio "De Volta Pra Mim".

## 1. Identidade

- **Projeto:** Meu Ritú — Desafio De Volta Pra Mim
- **O que é:** desafio de 14 dias de treinos curtos em casa para mães 30+ (porta de entrada para o programa Meu Ritú 1.0)
- **Público:** mães cansadas, sedentárias, sem autoestima, que querem sair do ciclo
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

- **Display:** Playfair Display 400/500 + itálico — títulos (mesma do banner "De Volta Pra Mim"; Cormorant foi descartada porque o circunflexo dela fica estranho em "você")
- **Corpo:** Montserrat 400/500 — texto e UI (mesma do banner "Desafio de 14 dias")
- **Escala:** 12 · 14 · 16 · 18 · 24 · 32 · 44 · 56 · 76
- **line-height:** corpo 1.7 · títulos 1.05–1.15
- **Label:** 12px maiúsculo, letter-spacing 0.16em

## 4. Forma

- Primeira tela: foto quente sem moldura, fundindo com a parede. Da segunda foto em diante: **topo em arco**. Demais cantos retos.
- Ilustrações em **traço fino** (marrom/creme), folhas verde-sálvia, **florzinhas pequenas e delicadas** (5 pétalas rosé).
- Botões em pílula (999px). Nada de 16px genérico em tudo.
- Sem sombras; separação por cor de fundo e borda 1px.

## 5. Movimento (fx.js — cada efeito liga/desliga em `MEU_RITU_FX`)

- **Abertura "respiração":** a foto se afasta devagar (6,5s, como quem inspira) e depois respira de leve em loop; o título entra palavra por palavra, saindo do desfoque, no mesmo ritmo; sombra de folhas surge aos poucos. CTA visível em ~2s.
- **Neblina que some** (cansaço): fundo acinzentado e frases embaçadas; a frase na linha de leitura fica nítida, as já lidas ficam claras; quando a última frase passa, a neblina some e a luz quente da janela esquenta o fundo.
- **Luz de janela em arco** só na seção do cansaço: é a luz que esquenta quando a neblina some (saiu de "para quem é" e "dúvidas", onde no celular parecia uma mancha).
- **20 dos 1.440 minutos:** animação contínua de ~8s que toca uma vez quando o relógio aparece (desenha o dia até 1.440 → troca para "para você" → fatia verde cresce até 20 → frases). Curvas suaves, sem depender da rolagem.
- **Ninho com 3 filhotes** (história), traço suave.
- **Caminho de 14 dias** vertical; folhas variadas e 12 enfeites espalhados pelo galho (flor solta, par de flores ou botão com folhinha), em posições e lados variados, que brotam quando o galho chega neles.
- **Visitantes:** depois que a pessoa passa da primeira tela, de vez em quando (a cada 14–26s, até 7 vezes) cruza o meio da tela uma borboleta (asas em degradê rosé, batidas em série e planeio, sobe a cada batida), um passarinho (bate asas e plana) ou uma abelhinha (paira no ar e vira de lado suavemente). Voo por "direção que muda aos poucos", sem trajetos em zigue-zague.
- **Folhas que brotam** nos marcadores de "É para você se…"; **folhinha que se abre** ao lado da pergunta aberta nas dúvidas.
- **Bando no CTA final**, **pétalas** na oferta e **folhinha no botão**.
- CTA nunca espera animação. `prefers-reduced-motion` mostra o estado final, sem visitantes nem loops.
