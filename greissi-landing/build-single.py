#!/usr/bin/env python3
"""
Gera greissi-completo.html: o site inteiro num arquivo só.

CSS, JS, fontes e imagens entram embutidos (data: URI), então o arquivo abre
sozinho em qualquer lugar — inclusive colado numa conversa com o Claude para
pedir opinião. Não é o formato de publicação: o site de verdade continua sendo
index.html + css/ + js/ + assets, que é o que carrega rápido no celular.

Uso: python3 build-single.py
"""
import base64, pathlib, re, sys

raiz = pathlib.Path(__file__).parent

def datauri(caminho, mime):
    b = (raiz / caminho).read_bytes()
    return f"data:{mime};base64," + base64.b64encode(b).decode()

html = (raiz / 'index.html').read_text(encoding='utf-8')
css  = (raiz / 'css/style.css').read_text(encoding='utf-8')
js   = (raiz / 'js/main.js').read_text(encoding='utf-8')
lenis = (raiz / 'vendor/lenis.min.js').read_text(encoding='utf-8')

# fontes dentro do CSS: ../fonts/x.woff2 -> data:
css = re.sub(
    r'url\("\.\./fonts/([^"]+)"\)',
    lambda m: 'url("%s")' % datauri('fonts/' + m.group(1), 'font/woff2'),
    css)

# imagens referenciadas pelo CSS, se houver
css = re.sub(
    r'url\("?\.\./images/([^")]+)"?\)',
    lambda m: 'url("%s")' % datauri('images/' + m.group(1), 'image/webp'),
    css)

# preloads apontam para arquivos que não existem mais neste formato
html = re.sub(r'\n<link rel="preload"[^>]*>', '', html)
html = html.replace('<link rel="stylesheet" href="css/style.css">',
                    '<style>\n' + css + '\n</style>')

# imagens do HTML
def img(m):
    return 'src="%s"' % datauri('images/' + m.group(1), 'image/webp')
html = re.sub(r'src="images/([^"]+)"', img, html)
html = re.sub(r'<meta property="og:image"[^>]*>\n', '', html)

html = html.replace('<script src="vendor/lenis.min.js" defer></script>',
                    '<script>\n' + lenis + '\n</script>')
html = html.replace('<script src="js/main.js" defer></script>',
                    '<script>\n' + js + '\n</script>')

for sobra in ('href="css/', 'src="js/', 'src="vendor/', 'src="images/'):
    if sobra in html:
        sys.exit('ficou referência externa: ' + sobra)

saida = raiz / 'greissi-completo.html'
saida.write_text(html, encoding='utf-8')
print(f'{saida.name} — {saida.stat().st_size / 1024:.0f} KB')
