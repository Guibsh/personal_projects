# Meu Ritú — Desafio De Volta Pra Mim

Landing page de vendas do desafio de 14 dias (R$ 47) da Lidia Vicente.
HTML + CSS + JS puro, sem build.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html`, `styles.css`, `main.js`, `scroll-kit.js` | O site |
| `fx.js` | Animações de natureza (liga/desliga em `MEU_RITU_FX` no `index.html`) |
| `assets/img/`, `assets/fonts/` | Fotos (otimizadas), logos transparentes e fontes locais |
| `design.md` | Diretriz visual (cores, fontes, regras) |
| `esboco-meu-ritu.html` | Versão em arquivo único para enviar à cliente (gerada) |
| `build-esboco.py` + `prerender.js` | Geram o arquivo único: `python3 build-esboco.py && node prerender.js` (o segundo coloca os desenhos prontos no arquivo, para aparecerem mesmo com script bloqueado) |
| `perguntas-lidia.md` | Perguntas da primeira rodada (já respondidas pela Lidia na v2) |
| `prompt-v2.md` | Prompt com os ajustes pedidos pela Lidia para a versão 2 |

## Abrir

Abra `index.html` no navegador, ou `npx serve .` dentro desta pasta.

## Antes de publicar

- Trocar o espaço do vídeo pelo vídeo da Lidia.
- Preencher `MEU_RITU_TRACK` (ID do Meta Pixel e do GA4) e configurar o pixel também na Kiwify, para a compra ser registrada.
- Remover a linha `<meta name="robots" content="noindex, nofollow">` quando a página for para o domínio oficial.
