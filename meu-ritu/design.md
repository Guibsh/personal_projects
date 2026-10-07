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

## 5. Movimento (fx.js — cada efeito liga/desliga em `MEU_RITU_FX`)

- **Abertura "respiração":** a foto já nasce ampliada (classe ligada no `<head>`, antes da primeira pintura, sem "travadinha") e se afasta devagar (6,5s, como quem inspira) e depois respira de leve em loop; o título entra palavra por palavra, saindo do desfoque, no mesmo ritmo; sombra de folhas surge aos poucos. CTA visível em ~2s.
- **Neblina que some** (cansaço): fundo acinzentado e frases embaçadas; a frase na linha de leitura (60% da tela) fica nítida, e toda frase que aparece inteira clareia sozinha em sequência (~0,5s cada), para o notebook não ficar desfocado; descendo, nada volta a desfocar. No fim, a neblina some (sem luz de janela nem brilho quente).
- **20 dos 1.440 minutos:** animação contínua de ~8s que toca uma vez quando o relógio aparece (desenha o dia até 1.440 → troca para "para você" → fatia verde cresce até 20 → frases). Curvas suaves, sem depender da rolagem.
- **Trepadeira na foto do "Quem conduz":** com a rolagem, dois pares de ramos entrelaçados nascem nos cantos de baixo e sobem contornando o arco, brotando folhas, gavinhas e flores variadas (rosé de 5 pétalas, margaridinha, sininho lilás, miosótis azul, botão), sempre para fora da foto e mais concentradas no alto. Quando fecha o arco, uma borboleta sai de uma flor de baixo, voa até o topo e fica visitando as flores (pousa abrindo e fechando as asas). Subindo, a trepadeira recolhe.
- **Sombra diagonal** atrás da foto do "Quem conduz" (sol vindo do alto, à esquerda): sombra em arco, desfocada, deslocada para baixo e para a direita.
- **Ninho com 3 filhotes** (história), traço suave.
- **Caminho de 14 dias** vertical; folhas variadas e 12 enfeites espalhados pelo galho (flor solta, par de flores ou botão com folhinha), em posições e lados variados, que brotam quando o galho chega neles.
- **Borboletas (vistas de lado), 3 espécies:** Rosé (rosé com olhinho na asa de trás), Céu (azul-lavanda com borda pontilhada) e Mel (laranja com nervuras escuras, tipo monarca). Asas animadas quadro a quadro (batidas em série e planeio).
- **Varal de fotos:** as 3 fotos impressas presas com pregadores de madeira num barbante; balançam com a rolagem e com uma brisa leve; tocar traz a foto para frente e balança. No celular, o varal desliza para o lado. Uma borboleta (espécie Céu) mora no varal: chega voando, pousa no barbante ou num pregador e, quando as fotos balançam forte ou alguém toca nelas, se assusta e pousa em outro ponto; sozinha, muda de lugar a cada 9–15s. O varal tem 110px de folga invisível em cima para o voo dela não ser cortado.
- **Borboletas só em dois lugares:** na trepadeira da foto do "Quem conduz" e no varal. Saíram os visitantes que cruzavam a tela (borboletas, passarinho e abelha).
- **Folhas que brotam** nos marcadores de "É para você se…"; **folhas secas que caem balançando** nos de "Não é para você se…"; **folhinha que se abre** ao lado da pergunta aberta nas dúvidas.
- **Depoimentos como bilhetes no varal:** papel pautado, print de WhatsApp (balões verdes) e papel kraft, com letra manuscrita (Caveat), presos com pregadores; balançam como o varal das fotos.
- **Contagem regressiva** no card da oferta para a próxima turma (`MEU_RITU_TURMA` no `index.html`; data de EXEMPLO até a Lidia definir). Quando a data passa, troca para "Turma começando agora".
- **Orvalho:** passar o mouse ou tocar numa folha do caminho de 14 dias ou da trepadeira faz a folha balançar e uma gotinha se formar na ponta e escorrer.
- **CTA final** centralizado, sem foto, com o bando de passarinhos; **pétalas** na oferta e **folhinha no botão**.
- CTA nunca espera animação. `prefers-reduced-motion` mostra o estado final, sem visitantes nem loops.
