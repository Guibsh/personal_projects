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
| `build-esboco.py` | Gera o arquivo único: `python3 build-esboco.py` |
| `perguntas-lidia.md` | Pendências para a cliente responder |

## Abrir

Abra `index.html` no navegador, ou `npx serve .` dentro desta pasta.

## Antes de publicar

- Trocar `window.CHECKOUT_URL` no fim do `index.html` pelo link real do checkout.
- Substituir todos os trechos `<mark class="ph">` pelo conteúdo real.
- Remover a `.draft-bar` (faixa "Esboço para aprovação") do topo.
