# design.md — Meu Ritú por Lidia Vicente

> Fonte única de verdade visual da landing do Desafio "De Volta Pra Mim".

## 1. Identidade

- **Projeto:** Meu Ritú — Desafio De Volta Pra Mim
- **O que é:** desafio de 14 dias, com treinos de cerca de 15 minutos em videoaula, em casa e com o peso do corpo; Meu Ritú Tracker; bônus minicurso O Poder da Postura (4 aulas); canal de suporte; acesso por 30 dias; de R$ 97 por R$ 47 na Kiwify
- **Público:** mulheres, especialmente mães, que querem voltar a cuidar de si mas não conseguem manter a constância
- **Ideia central:** 15 minutos por dia → rotina possível → constância → resultados. Frases da marca: "O resultado mora na constância. Não no excesso.", "Decisão vale mais que motivação.", "Você não precisa fazer muito para começar a ter resultados. Precisa conseguir continuar." e "Faça por você o que só você pode fazer."
- **Tom:** acolhedor, feminino e vivo; possibilidade, transformação, confiança e desejo de começar
- **Nunca:** 20 minutos, 14 treinos diferentes, calendário detalhado dos treinos, descrição de aula que não corresponda ao conteúdo real, depoimentos inventados, acompanhamento individual/grupo, contagem regressiva (o acesso é imediato), Meu Ritú 1.0, benefício ou condição que não exista no produto, elementos infantis ou excesso de enfeites
- **Ação principal:** comprar o desafio (R$ 47)
- **Nome:** Lidia, sem acento

## 2. Cor — paleta "Pôr do sol" (escolhida pela Lidia)

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F8E6D3` | Fundo mel claro |
| `--color-surface` | `#FDF2E6` | Blocos claros |
| `--color-sand` | `#F0CBA8` | Fundos alternados (descoberta, o que você recebe) |
| `--color-border` | `#E8C19C` | Divisores 1px |
| `--color-text` | `#3A1E0E` | Café (texto), igual ao logo |
| `--color-text-muted` | `#845A3E` | Texto secundário |
| `--color-brand` | `#5A6834` | Verde-oliva — botões de compra e destaques |
| `--color-accent` / `--color-accent-ink` | `#B5623A` / `#9C4F2C` | Terracota suave — detalhes / textos pequenos (rótulos) |
| `--color-highlight` | `#F2C49C` | Marca-texto suave da pergunta da seção nova |
| `--color-dark` | `#55291A` | Seções escuras: oferta, fechamento, rodapé |
| `--color-on-dark` | `#FBE3CC` | Texto sobre o escuro |
| `--color-wall*` | `#8A5E36` e vizinhos | Fundo da primeira tela, no tom do painel de madeira da foto |
| `--color-hero-em` | `#EDE6B4` | Itálicos e frases de destaque sobre fundo escuro |

Regras: verde-oliva nos botões e em detalhes pequenos. Terracota só em rótulos e detalhes. Escuro só na oferta, no fechamento e no rodapé.

## 3. Tipografia (fontes oficiais da marca)

- **DM Serif Display:** títulos e frases de destaque (regular e itálico)
- **Poppins:** textos, perguntas, descrições, botões e demais elementos (400, 500, 600)
- Arquivos locais em `assets/fonts/`
- **Escala:** 12 · 14 · 16 · 18 · 24 · 32 · 44 · 56 · 76 · **line-height:** corpo 1.7 · títulos 1.05–1.15 · **Rótulos:** 12px maiúsculo, letter-spacing 0.16em

## 4. Forma e fotos

- Logo original da marca, recortado com fundo transparente: `assets/img/logo-marrom.png` (fundo claro) e `logo-creme.png` (fundo escuro). Originais e máscaras em `assets/img/logo-original/`.
- Fotos reais da Lidia (originais em `assets/img/fotos-lidia/`). Tratamento: fundo de madeira mais suave, sem o brilho do flash e no tom mel da paleta; a Lidia fica intacta (recorte por máscara). Script em `scratchpad` não fica no projeto; o resultado está em `assets/img/`.
- Nenhuma foto se repete na página.
- Topo em arco nas fotos de retrato; foto da praia com cantos arredondados (sem moldura); sombra leve nas fotos, como se saíssem da página.
- Botões em pílula.

## 5. Estrutura (versão 4)

1. Abertura: título, subtítulo novo, botão para a Kiwify, "R$ 47"
2. Só dar o play (nova): foto de corpo inteiro, de mãe para mãe, pergunta da barriga/cintura/bumbum/pernas em destaque, "Então esse desafio é pra você!", botão
3. Identificação: quatro perguntas na neblina que some + a virada (força de vontade × método)
4. A descoberta: plantinhas 15 min → rotina possível → constância → resultados
5. Seu dia tem 1.440 minutos (relógio)
6. Minha história: foto na praia com os três filhos, vídeo grande (espaço reservado), Instagram @meu.ritu
7. O que você recebe: "14 dias para criar a sua constância" + 3 cards com fotos (desafio, Tracker, bônus Postura)
8. O verão está chegando: foto, sol, fechamento "Faça por você o que só você pode fazer.", botão
9. Investimento + oferta: de R$ 97 por R$ 47 em destaque, até 11x de R$ 5,22, Pix/boleto/cartão, compra segura e 7 dias pelo CDC
10. Dúvidas (13 perguntas)
11. Chamada final: "Decisão vale mais que motivação." + protagonismo + botão "Quero voltar pra mim · R$ 47"

Todos os botões de compra têm o link da Kiwify no próprio HTML e um `data-checkout` com o local (topo, abertura, play, verao, oferta, fechamento, barra).

## 6. Movimento (fx.js; cada efeito liga/desliga em `MEU_RITU_FX`)

- Abertura "respiração", neblina na identificação, plantinhas que crescem na descoberta, relógio de 15 minutos, solzinho no verão, pétalas na oferta, folhinha nas dúvidas e no botão, passarinhos no topo e no fechamento.
- Os enfeites fora da história (passarinhos, sombra de folhas, pétalas, folhinhas) esperam a resposta da Lidia: ver `pendencias.md`.
- `prefers-reduced-motion` mostra tudo no estado final, sem nada girando.
