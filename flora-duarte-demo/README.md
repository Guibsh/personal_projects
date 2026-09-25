# Flora Duarte: site demonstrativo de portfólio

Landing page de uma mentora de autoestima e relacionamentos **fictícia**, feita para
mostrar o trabalho de Guilherme Magalhães Brites. No fim da página, a cena pós-créditos
revela que a Flora não existe e mede ao vivo o que o visitante fez na página: tempo,
flores colhidas, quiz, cliques em comprar. Depois vêm a foto e os contatos.

## Como abrir

- **Pasta completa:** abra `index.html` no navegador.
- **Arquivo único:** `flora-duarte-site-completo.html` já traz fotos, fontes e código
  dentro dele. Serve para mandar por WhatsApp ou abrir sem a pasta.

Depois de mudar qualquer arquivo, gere o arquivo único de novo:

```bash
python3 build-single.py
```

## Onde mudar cada coisa

| O quê | Onde |
|---|---|
| Seus contatos (WhatsApp, Instagram, Direct, e-mail) | `index.html`, seção `#bastidores` e janela `#demo` |
| Fotos da Flora | `images/hero.webp` (topo), `images/sobre.webp` (girassol), `images/flor-rosa.webp` (rosa) |
| Sua foto | `images/guilherme.webp` |
| O que cada botão da Flora explica ao ser clicado | `js/main.js`, objeto `DEMO` |
| Produtos do quiz | `js/main.js`, objeto `CATALOGO`, e os `data-score` no `index.html` |
| Imagem da prévia do link | `images/og-image.jpg` (1200×630) |

Os botões da Flora não levam a lugar nenhum de verdade. Eles abrem uma janela que explica
o que fariam num site real (checkout, WhatsApp, Instagram) e oferecem o seu contato.

## Antes de impulsionar

1. **Hospedar.** Netlify (arraste a pasta em app.netlify.com/drop), GitHub Pages ou
   Vercel. Todos são grátis para um site assim.
2. **Prévia do link.** Com o endereço definitivo, troque no `index.html`
   `content="images/og-image.jpg"` pelo endereço completo, por exemplo
   `https://seudominio.com/images/og-image.jpg`. O WhatsApp e o Instagram só mostram a
   imagem com o endereço completo.
3. **Pixel da Meta.** Cole o código no `<head>`, no lugar marcado `META PIXEL`.
4. **Google.** A página tem `noindex`, para ninguém achar a "Flora" numa busca. O link
   continua funcionando normalmente.

A pasta `divulgacao/` tem prints prontos para os anúncios: computador e dois em formato
Story (1080×1920).
