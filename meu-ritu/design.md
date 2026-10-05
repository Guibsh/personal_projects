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

- **Abertura "amanhecer":** a primeira tela abre mais escura, uma luz quente entra pela esquerda e passa pela foto, a sombra de folhas surge com a luz; título palavra por palavra; passarinhos cruzam depois (~3s). CTA visível em ~1,5s.
- **O ciclo que se abre** (cansaço): uma bolinha gira num círculo fino enquanto a pessoa lê; ~3s depois da última frase, o círculo se abre e a bolinha sai por um caminho que termina em folhas e flor. Saindo da seção, volta a girar.
- **Sombra de janela em arco** (cansaço, para quem é, dúvidas): mancha de luz quente com o desenho da janela, que desliza e muda de inclinação com a rolagem, como o sol mudando de lado.
- **20 dos 1.440 minutos:** sem travar a rolagem; o relógio acompanha a posição da seção de forma contínua e suavizada (desenha o dia → troca para "para você" → fatia verde até 20). Reversível.
- **Ninho com 3 filhotes** (história), traço suave.
- **Caminho de 14 dias** vertical; folhas variam de tamanho e ângulo; dias 3, 6, 9, 11 e 13 brotam com uma florzinha.
- **Borboleta visitante:** até 4 visitas por página, uma por alvo (títulos da história, caminho, "para quem é", card da oferta, dúvidas), com 12s de intervalo; pousa, abre e fecha as asas, vai embora após ~6s ou ao toque.
- **Folhas que brotam** nos marcadores de "É para você se…".
- **Bando no CTA final**, **pétalas** na oferta e **folhinha no botão**.
- CTA nunca espera animação. `prefers-reduced-motion` mostra o estado final, sem borboleta nem loops.
