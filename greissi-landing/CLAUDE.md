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
3. Depois de publicar, se o usuário reportar que algo não aparece, a
   primeira suspeita é **falha silenciosa de uma dependência** (script que
   não carregou, elemento que não existe), não o CSS/HTML em si — conferir
   lendo os arquivos publicados via `Artifact` `read`, comparando com o
   commit local.
