# Anti-AI-slop: como não entregar o site genérico

O "AI slop" visual não é um bug estético, é um efeito estatístico: sem restrição, o
modelo produz a média de tudo que já viu. A média é sempre a mesma. Este arquivo lista
os padrões default e o que colocar no lugar.

## Os sinais do default (se seu site tem 3+, ele é genérico)

| Sinal | Por que acontece | No lugar |
|---|---|---|
| Fonte Inter / system sans em tudo | É o default de todo template | Fonte com caráter nos títulos: serifa (Fraunces, Playfair, Instrument), grotesk (Space Grotesk, Archivo, Bricolage), mono (JetBrains, IBM Plex Mono). Sans neutra só no corpo |
| Fundo escuro + gradiente violeta/índigo | Combinação mais repetida da internet 2021-2024 | Escolha uma âncora de cor incomum (terracota, oliva, azul-petróleo, amarelo-ácido) sobre off-white ou quase-preto. Um gradiente no máximo, e sutil |
| Hero centralizado: título, subtítulo, 2 botões | Estrutura mais frequente do dataset | Hero assimétrico (texto à esquerda, mídia à direita), título fora do centro, ou título gigante que encosta nas bordas |
| Três cards iguais lado a lado | Padrão de "features" | Lista numerada editorial, grid quebrado (bento com tamanhos diferentes), ou uma feature grande + duas pequenas |
| `border-radius: 16px` em absolutamente tudo | Default do Tailwind/shadcn | Escolha uma linguagem: tudo reto (0-4px) **ou** tudo bem redondo (pill 999px). Misturar raios aleatórios é o que denuncia |
| Glassmorphism / blur em todo card | Efeito "premium" barato | Blur só onde há profundidade real (header sobre conteúdo). Contraste e espaçamento fazem mais por sofisticação do que blur |
| Ícones genéricos (foguete, raio, escudo, engrenagem) | Metáforas vazias | Sem ícone, ou número grande, ou um screenshot real do produto |
| Sombra suave idêntica em tudo | `shadow-lg` | Ou sombra dura e deslocada (estilo print), ou sem sombra e com borda de 1px |
| Espaçamento igual em toda a página | Nenhuma decisão de ritmo | Alterne seções densas e seções com muito respiro — o contraste é o que cria hierarquia |
| Emoji como ícone de seção | Atalho preguiçoso | Tipografia e cor já hierarquizam |

## As três alavancas que mais mudam o resultado

Se você só tiver tempo para três decisões, faça estas:

1. **Tipografia com personalidade.** Trocar a fonte do título muda mais a percepção do
   site do que qualquer animação. Escolha um par: display expressiva + corpo neutra.
2. **Uma âncora de cor específica.** Não "azul": `#1B4D3E` verde-garrafa. Uma cor forte
   usada com disciplina (CTA + detalhes) sobre neutros vale mais que cinco cores.
3. **Escala e ritmo.** Contraste real entre o maior e o menor elemento (título de 88px
   ao lado de label de 12px maiúsculo com letter-spacing) é o que parece design, não
   template.

## Direções visuais para nomear (escolha uma, não misture)

- **Editorial suíço** — Helvetica/Archivo, grid rígido visível, preto sobre branco,
  uma cor de destaque, muito espaço em branco.
- **Brutalismo refinado** — bordas de 1-2px pretas, zero raio, cores chapadas,
  tipografia enorme, sem sombras.
- **Orgânico / terroso** — bege, argila, oliva, serifa suave, fotos com grão,
  cantos levemente irregulares.
- **Tech-noir** — quase-preto real (#0A0A0B), mono, um neon único, linhas finas,
  ruído sutil.
- **Print retrô** — offset, cores limitadas (2-3), textura de papel, serifa condensada.
- **Y2K / chrome** — gradientes metálicos, blur radial, tipografia expandida.

## Aplicando uma referência corretamente

Quando o usuário manda um site de referência, o valor não está em copiar a cor — está
em extrair as **decisões estruturais**:

- Proporção do hero (ocupa a tela toda? metade? tem imagem?)
- Grid (quantas colunas, largura máxima do conteúdo, alinhamento à esquerda ou centro)
- Escala tipográfica (qual a razão entre h1 e corpo — 3x? 6x?)
- Densidade (muito ar ou informação compacta)
- Onde a cor aparece (só no CTA? em blocos inteiros?)
- Como o movimento entra (reveal sutil? parallax? nada?)

Escreva essas decisões no `design.md` **com os valores do projeto**, não com os da
referência. Copiar a paleta do Duolingo em um site de advocacia não é referência, é
fantasia.

## Teste final: o teste do print

Tire um print da hero e pergunte: *se eu trocar o logo e o texto, este site poderia ser
de qualquer outra empresa?* Se a resposta for sim, falta ancoragem — volte para as três
alavancas.
