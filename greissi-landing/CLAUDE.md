# Landing page — Greissi de Matos

Site estático (HTML/CSS/JS puro) para a mentora Greissi de Matos. Sem build,
sem framework — abre direto pelo navegador. `python3 -m http.server` na pasta
para rodar local.

## Decisões travadas — não reverter sem pedido explícito do usuário

Cada item abaixo já foi discutido e aprovado. Se uma mudança pedida for
esbarrar em algum destes pontos, **avisar antes de mexer**, não decidir
sozinho. Regredir algo desta lista sem pedido é o pior erro possível neste
projeto — já aconteceu uma vez (a cena da janela pareceu ter sumido) e não
pode se repetir.

- **Hero = cena da janela com canteiro**, não retrato, não buquê solto.
  Janela em arco com a foto (`images/hero.webp`) atrás do vidro, peitoril,
  jardineira com flores em SVG geradas por código (array `PLANTIO` em
  `js/main.js`). **Sem travessas em cruz no vidro** (testado e rejeitado —
  parecia grade/prisão). Zoom da foto ao entrar: 1.06, não mais que isso
  (valores maiores dão impressão de a foto recuar, não respirar).
- **Sem Three.js.** Toda profundidade é camadas 2D/SVG com parallax leve
  (deslocamento em pixels fixos, nunca proporcional à viewport — separar
  demais as camadas desmancha a cena).
- **Pétalas caindo + rastelo** ficam na seção `#dores` ("Talvez você se
  reconheça aqui"), caindo pela lateral direita, longe da coluna de texto.
  Não mover para outra seção sem pedido.
- **Buquê fixo no canto** (`#posy`) mantém o conceito de ganhar uma flor por
  seção — mas o usuário já apontou que o desenho atual (com vaso) ficou
  pesado e pediu redesenho mais elegante. Isso ainda está pendente, não é
  regressão se for refeito.
- **Moldura da janela é uma borda CSS**, não um `<rect>` de SVG. O rect tinha
  cantos retos dentro de um arco, e o `overflow:hidden` comia o branco na
  curva do topo — a foto encostava na borda e não parecia janela.
- **Abelhinha no canteiro** (`#bee`): voa entre as flores e de tempos em
  tempos pousa numa delas. Coordenadas no viewBox do canteiro (430x210), com
  a posição da flor recalculada a cada quadro a partir do ângulo do vento.
  **Duas asas separadas**, cada uma girando na própria base com meio tempo de
  defasagem — a versão de elipse única escalando parecia uma mancha branca
  piscando e foi rejeitada.
- **Girassol no "sobre mim"** (`#sunflower`): semente → regada → haste
  crescendo → folhas → flor abrindo, tudo dirigido pelo progresso do scroll
  (`--p`), nunca por animação em loop. Fica na lateral **direita** da foto:
  à esquerda ele disputava espaço com a assinatura e com o buquê fixo do
  canto da tela. A luz (`.about__dawn`) nasce no alto à esquerda e é para
  onde ele se inclina.
- **O gatilho do rastelo é o CHÃO, não o scroll.** Ele só entra depois que as
  pétalas pousam (85% delas) e ainda espera 900ms, para dar tempo de ver o
  monte no chão. A versão antiga disparava em "a base da seção passou de 62%
  da tela" e por isso ele aparecia enquanto as pétalas ainda caíam — entrava
  antes do que ia juntar. Não voltar a amarrar isso à rolagem.
- **Girassol e rosa dividem o mesmo motor** (`plantas` + `pintarPlantas` em
  `js/main.js`), com as janelas de etapa na constante `ETAPAS`. Todas terminam
  em 74% do percurso da seção: a flor precisa estar aberta enquanto a seção
  ainda está na tela.
- **A rosa do CTA é feita de anéis de pétalas em CRESCENTE**, cada uma
  abraçando o miolo, encolhendo e girando meia casa a cada anel. A versão com
  elipses em coroa + espiral no centro lia como margarida e foi rejeitada.
- **Estações em `#produtos`** entram como CAMADA sobre a alternância
  clara/escura das faixas, que continua sendo a base do contraste. Tokens
  `--season-accent`/`--season-bg` escopados em `.band[data-estacao]`; nenhum
  token global foi tocado. As partículas reaproveitam o motor das pétalas à
  deriva — só mudam cor, forma e comportamento.
- **O rastelo varre para a DIREITA.** No desenho a cabeça fica à esquerda e o
  cabo sobe à direita; varrendo para a esquerda a cabeça ia na frente e ele
  entrava empurrando. Não inverter.
- **Rastelo e pétalas passam POR CIMA da caixa branca de resposta**
  (`.fallzone` em `z-index:2`, acima do `.wrap`). A linha de pouso é a borda
  **de cima** da caixa, não a de baixo: pela de baixo, no celular, o rastelo
  pousava em cima do botão e comia o texto dele.
- **O rastelo não some mais depois de juntar** — fica encostado no monte
  (fase `parado`). Sumir desfazia a cena que devia permanecer. E ele volta a
  varrer sempre que a visitante marca/desmarca um padrão, entrando com um
  golpe de `volta` (dentes no ar) em vez de teleportar para o começo.
- **Paleta**: bege/creme, verde-oliva, terracota suave. Ver `:root` em
  `css/style.css`.
- **Tom de movimento**: sempre suave/delicado, nunca abrupto. Tudo desliga
  sob `prefers-reduced-motion: reduce`.
- **Número de WhatsApp é placeholder** — `const WHATSAPP` no topo de
  `js/main.js`. Não é bug, é pendência conhecida do usuário.

## Bibliotecas vendorizadas (sem CDN — bloqueado neste ambiente)

- `vendor/lenis.min.js` — scroll suave.
- Qualquer biblioteca nova: baixar via `npm install <pkg>` num diretório
  temporário, copiar o `.min.js` para `vendor/`, nunca referenciar CDN.

## Antes de publicar qualquer mudança

1. Testar localmente com Playwright (headless) — desktop, mobile e
   `reducedMotion: 'reduce'` — antes de dar como pronto.
2. **A validação local não é garantia do ambiente do Artifact publicado**
   (iframe, sandbox, possível diferença de comportamento com scroll/libs
   pesadas). Preferir soluções robustas com o mínimo de dependências
   externas: menos pontos de falha que não dá para depurar remotamente.
3. **Se o usuário disser que algo não aparece, MEDIR O LAYOUT nas larguras
   reais antes de qualquer outra hipótese.** Conferir integridade de arquivo
   publicado não prova nada sobre renderização:

   ```js
   // em Playwright, para cada largura de 360 a 1440:
   document.querySelector('#scene').getBoundingClientRect()  // width/height são 0?
   ```

   Isso já custou três rodadas de diagnóstico errado. A cena do hero mediu
   `0x0` em toda tela abaixo de 921px por semanas, enquanto eu repetia que
   "os arquivos publicados estão corretos" — e estavam; o CSS é que colapsava.
   Sintoma de "some no celular, funciona no desktop" quase sempre é layout,
   não arquivo faltando nem script que não rodou.

4. **Armadilha de sizing circular**, a causa daquele bug — vale conferir
   sempre que um wrapper tiver `margin-inline:auto`: margem automática faz o
   item encolher para o conteúdo; se o filho pede largura em `%`, o
   percentual resolve contra um pai indefinido e vira zero. Use `width`
   (definida), não `max-width`, no wrapper. Filho `<img>` com `width`/`height`
   declarados não sofre disso, porque tem dimensão intrínseca.

5. Toda mudança de CSS estrutural: medir em 375, 768 e 1440 **e olhar o
   screenshot do trecho alterado**, não só de outra parte da página.

6. **Nunca recortar `index.html` por índice com padrão não único.** Um
   `h[:ini] + novo + h[fim:]` onde `fim` veio de um `h.index(...)` de um
   fechamento genérico (`</g></g>\n</g>\n</svg>`) pegou a ocorrência do
   girassol, que vem ANTES da rosa: `fim < ini`, e o arquivo saiu com metade
   da página duplicada — dois `#produtos`, dois CTA. Passou despercebido
   porque o HTML continuava válido. Sempre substituir por `str.replace` com
   `assert conta == 1`, e conferir depois:

   ```bash
   grep -c 'id="produtos"' index.html   # tem de ser 1
   ```

## Arquivo único para revisão

`python3 build-single.py` gera `greissi-completo.html`: o site inteiro num
arquivo só, com CSS, JS, fontes e imagens em `data:` URI (~360 KB). Serve para
abrir sem servidor ou colar numa conversa pedindo opinião. **Não é o formato
de publicação** — o site de verdade continua sendo `index.html` + `css/` +
`js/` + assets separados, que é o que carrega rápido no celular. Depois de
qualquer mudança no site, rodar o script de novo se o arquivo único for
entregue junto.
