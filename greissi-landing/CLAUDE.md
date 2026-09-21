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
